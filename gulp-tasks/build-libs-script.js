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
  var gutil = require("gulp-util");
  var reload = require('browser-sync').reload;

  var b = watchify(browserify({debug: false}));

  jsLibs.forEach(function (libName) {
    b.require(libName);
  });

  function bundle () {
    return b.bundle().
      pipe(vinylSource("lib.js")).
      pipe(gulpIf(production, streamify(uglify()))).
      pipe(gulp.dest(buildConf.out + buildConf.outJS)).
      pipe(reload({stream: true}));
  }

  b.on("update", function () { gutil.log("Libs dependencies updated"); });
  b.on("update", bundle);

  return bundle();
};


