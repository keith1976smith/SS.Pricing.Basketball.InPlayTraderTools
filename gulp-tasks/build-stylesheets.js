"use strict";
var gulp = require("gulp");
var buildConf = require("./build-config");
var production = process.env.NODE_ENV === "production";


////////////////////////////////////////////////////////////////////////////////
// stylesheets
module.exports = function (cb) {
    var csso = require("gulp-csso");
    var less = require("gulp-less");
    var concatCss = require('gulp-concat-css');
    var gulpIf = require("gulp-if");
    var rework = require('gulp-rework');
    var reworkAssets = require("rework-assets");
    var plumber = require('gulp-plumber');
    var reload = require('browser-sync').reload;
    var merge = require("merge-stream");

    function buildTheme (theme) {
        return gulp.src([buildConf.inStylesheets + "/master-" + theme + ".less"]).
            pipe(plumber({errorHandler: cb})).
            on("error", function () {
                cb();
            }).
            // run everything through LESS, converting URLs to be relative to output
            pipe(less({relativeUrls: true})).
            // use "rework" and "rework-assets" to copy fonts, images etc
            pipe(rework(reworkAssets({ 
                src: "stylesheets", 
                dest: "__generated/css/assets", 
                prefix: "assets/" 
            }))).
            // concatentate everything
            pipe(concatCss(theme + ".css")).
            // minify if needed
            pipe(gulpIf(production, csso())).
            // save
            pipe(gulp.dest(buildConf.out + buildConf.outCss)).
            pipe(reload({stream: true}));
    }

    return merge(buildTheme("dark"), buildTheme("light"));
};

