/* eslint no-shadow: 0 */
"use strict";
var gulp = require("gulp");
var config = require("./config.json");
var buildConf = require("./gulp-tasks/build-config");


var buildMainScript = require("./gulp-tasks/build-main-script");
var buildPrelaunchScript = require("./gulp-tasks/build-prelaunch-script");
var buildLibsScript = require("./gulp-tasks/build-libs-script");

gulp.task("build-main-script", buildMainScript);
gulp.task("build-prelaunch-script", buildPrelaunchScript);
gulp.task("build-libs-script", buildLibsScript);

gulp.task("build-scripts", ["build-main-script", "build-prelaunch-script", "build-libs-script"]);
gulp.task("build-stylesheets", require("./gulp-tasks/build-stylesheets"));

////////////////////////////////////////////////////////////////////////////////
// compile jade templates to static HTML
gulp.task("build-pages", function () {
    var jade = require("gulp-jade");
    var reload = require('browser-sync').reload;

    // set up the jade locals to help compile the pages
    var locals = {
        jsUrl: config.rootUrl + buildConf.outJS + "/",
        cssUrl: config.rootUrl + buildConf.outCss + "/",
        bootstrapUrl: config.rootUrl + buildConf.outBootstrap + "/",
        forceHTTPS: !!(config.forceHTTPS)
    };
    //_.extend(locals, config);

    // thanks to https://github.com/gulpjs/gulp/issues/71#issuecomment-41512070
    var j = jade({
        locals: locals,
        pretty: true
    });
    j.on("error", function (err) {
        console.error(err);
        j.end();
    });
    return gulp.src("pages/index.jade")
        .pipe(j)
        .pipe(gulp.dest(buildConf.out + buildConf.outHtml)).
        pipe(reload({stream: true}));
});

////////////////////////////////////////////////////////////////////////////////
// bootstrap
// we treat bootstrap as a black box and just copy it over verbatim
gulp.task("bootstrap",  function () {
    return gulp.src("node_modules/@sportingsolutions/ssln-bootstrap/js/**").
        pipe(gulp.dest(buildConf.out + buildConf.outJS));
});


////////////////////////////////////////////////////////////////////////////////
// jquery
// we treat bootstrap as a black box and just copy it over verbatim
gulp.task("jquery",  function () {
    return gulp.src("node_modules/jquery/dist/*").
        pipe(gulp.dest(buildConf.out + buildConf.outJS));
});


////////////////////////////////////////////////////////////////////////////////
// web config
// necessary for IIS to have a clue what "files" are
gulp.task("copy-web-config", function () {
    var rename = require("gulp-rename");
    return gulp.src("Web.__generated.config").
        pipe(rename("Web.config")).
        pipe(gulp.dest(buildConf.out));    
});


// watch task: rerun tasks when files change
gulp.task("watch", function() {

    buildMainScript(function () {}, true);
    buildLibsScript(function () {}, true);

    gulp.watch(['config.json'], ['build-scripts', 'build-pages']);
    gulp.watch(["pages/**.jade"], ['build-pages']);
    gulp.watch(["stylesheets/**"], ['build-stylesheets']);
    
});

gulp.task('webserver', function() {
    var browserSync = require('browser-sync');
    browserSync({
        server: { baseDir: "./__generated/" },
        reloadDelay: 0,
        ghostMode: false,
        reloadOnRestart: false,
        notify: false
    });
});

gulp.task("build-app", ["build-scripts", "bootstrap", "jquery", "build-pages", "build-stylesheets", "copy-web-config"]);

gulp.task("develop", ["watch", "webserver"]);