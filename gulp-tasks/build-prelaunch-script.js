/*eslint no-shadow: 0 */
"use strict";
var gulp = require("gulp");
var buildConf = require("./build-config");
var production = process.env.NODE_ENV === "production";
var jsLibs = buildConf.externalizeLibs;

module.exports = function (cb, watch) {
  var browserify = require("browserify");
  var watchify = watch? require("watchify") : function (b) { return b; };
  var vinylSource = require("vinyl-source-stream");
  var uglify = require('gulp-uglify');
  var streamify = require('gulp-streamify');
  var gulpIf = require("gulp-if");
  var mold = require("mold-source-map");
  var reload = require('browser-sync').reload;
  var gutil = require("gulp-util");
  var path = require("path");

  var b = watchify(browserify({debug: !production, cache: {}, packageCache: {}})).
    add("./src/prelaunch.js").
        transform("babelify");


  jsLibs.forEach(function (libName) {
    b.external(libName);
  });

  function bundle () {
    return b.bundle().
      on("error", function (err) {
        // thanks to http://stackoverflow.com/a/24817446/212676
        console.error(err);
        //this.emit('end');
      }).
      // patch up crappy windowsy paths here using
      // https://github.com/thlorenz/mold-source-map
      pipe(gulpIf(!production, mold.transformSourcesRelativeTo(process.cwd()))).
      pipe(gulpIf(!production, mold.transformSources(function (source) {
        var after = source.replace(/\\/g, '/');
        return after;                            
      }))).
      pipe(gulpIf(!production, mold.transform(function (molder) {
        molder.sourceRoot("/");
        return molder.toComment();
      }))).
      pipe(vinylSource("prelaunch.js")).
      pipe(gulpIf(production, streamify(uglify({ output: {  } })))).
      pipe(gulp.dest(buildConf.out + buildConf.outJS)).
      pipe(reload({stream: true}));
  }

  b.on("update", function (ids) { 
    gutil.log("Prelaunch dependencies updated:"); 
    ids = ids.map(function (id) { 
      return gutil.colors.magenta(path.relative(process.cwd(), id)); 
    });
    ids.forEach(function (id) { gutil.log(id); });
    bundle();
  });

  b.on("log", function (msg) { 
    gutil.log(msg); 
  });


  return bundle();
};
