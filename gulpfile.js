var gulp = require('gulp'),
	sass = require('gulp-sass'),
	cssmin = require('gulp-minify-css'),
	sourcemaps = require('gulp-sourcemaps'),
	rename = require('gulp-rename'),
	plumber = require('gulp-plumber'),
	notify = require('gulp-notify');

gulp.task('sass', function () {
	gulp.src(['sass/**/*.scss', '!sass/**/_*.scss'])
		.pipe(plumber({
			errorHandler: notify.onError('Error: <%= error.message %>')
		}))
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(cssmin())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('./app/css'));
});

gulp.task('watch', function () {
	gulp.watch('sass/**/*.*', ['sass']);
});

gulp.task('default', ['sass', 'watch']);