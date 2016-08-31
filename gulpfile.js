var gulp = require('gulp'),
    browser = require('browser-sync').create(),
    sass = require('gulp-sass'),
    babel = require('gulp-babel'),
    del = require('del'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css');

gulp.task('sass', function () {
    return gulp.src('./sass/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./css'))
});

gulp.task('es6', function () {
    return gulp.src('./es6/*.js')
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


gulp.task('clean', function () {
    del([
        './dist/js',
        './dist/css',
        './dist/*.html'
    ]);
});

gulp.task('minifycss', ['sass'], function () {
    gulp.src('./css/*.css')
        .pipe(gulp.dest('./dist/css'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(minifyCss())
        .pipe(gulp.dest('./dist/css'));
});

gulp.task('minifyjs', ['es6'], function () {
    gulp.src('./js/*.js')
        .pipe(gulp.dest('./dist/js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/js'));
});

gulp.task('release', ['clean'], function () {
    gulp.src('./index.html')
        .pipe(gulp.dest('./dist'));

    gulp.src('./index.js')
        .pipe(gulp.dest('./dist'));

    gulp.start('minifycss', 'minifyjs');
})

gulp.watch([
    './index.js',
    './index.html'
], browser.reload);


