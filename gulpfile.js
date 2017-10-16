var gulp = require('gulp'),
	less = require('gulp-less'),
	cssmin = require('gulp-minify-css'),
	sourcemaps = require('gulp-sourcemaps'),
	concat = require('gulp-concat'),
	jshint = require('gulp-jshint'),
	rename = require('gulp-rename'),
	plumber = require('gulp-plumber'),
	notify = require('gulp-notify'),
	uglify = require('gulp-uglify');

gulp.task('less',function(){
	gulp.src(['less/**/*.less','!less/**/_*.less'])
		.pipe(plumber({
			errorHandler: notify.onError('Error: <%= error.message %>')
		}))
		.pipe(sourcemaps.init())
		.pipe(less())
		.pipe(cssmin())
		.pipe(rename({suffix:'.min'}))
		.pipe(gulp.dest('./app/css'));
});

gulp.task('watch',function(){
	gulp.watch('less/**/*.*',['less']);
});

gulp.task('default',['less','watch']);