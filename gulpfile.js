'use strict';

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    less = require('gulp-less'),
    cssmin = require('gulp-minify-css'),
    rimraf = require('rimraf');
const { series, parallel } = require('gulp');

function clean(cb) {
    return rimraf('./build',cb);
};

function styles(cb){
    return gulp.src(['./src/less/*.less']) 
        .pipe(concat('main.min.css')) 
        .pipe(less()) 
        .pipe(cssmin()) 
        .pipe(gulp.dest('./build/css'));
}
function js(cb){
    return gulp.src(['./src/js/*.js']) 
        .pipe(concat('index.min.js')) 
        .pipe(uglify()) 
        .pipe(gulp.dest('./build/js'));
}

exports.default = series(clean,parallel(styles,js));