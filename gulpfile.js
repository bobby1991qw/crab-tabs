var gulp = require('gulp'),
    browser = require('browser-sync').create(),
    sass = require('gulp-sass'),
    babel = require('gulp-babel');

gulp.task('sass', function () {
    return gulp.src('./sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./css'))
});

gulp.task('es6', function () {
    return gulp.src('./es6/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('./js'))
});

gulp.task('dev', ['sass', 'es6'], function () {
    browser.init({
        server: {
            baseDir: './'
        }
    });
});

var w = gulp.watch([
    './sass/**/*.scss',
    './es6/**/*.js',
], ['sass', 'es6', browser.reload]);


gulp.watch([
    './index.js',
    './index.html'
], browser.reload);


