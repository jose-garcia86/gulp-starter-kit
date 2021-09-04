const gulp = require('gulp');
const {series, parallel, dest} = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cssnano =  require('gulp-cssnano');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const cache = require('gulp-cache');
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const zip = require('gulp-zip');
const del = require('del');
const plumber = require('gulp-plumber');
const notifier = require('gulp-notifier');

// Notifier Config
// notifier.defaults({
//     messages: {
//         sass: 'CSS was successfully compiled!',
//         js: 'JavaScript is ready!',
//     },
//     exclusions: {
//         exclusions: '.map'
//     }
// });

// File Paths
const filesPath = {
    html:'./*.html',
    sass: './src/sass/**/*.scss',
    js: './src/js/**/*.js',
    images: './src/img/**/*.+(png|jpg|jpeg|gif|svg)',
}

// HTML
function htmlTask(done){
    gulp.src([filesPath.html, '**/**/*.html', '!node_modules/**/*.html'])
        .pipe(plumber({errorHandler: notifier.error}))
        .pipe(dest('./dist'))
    done();
}

// Sass
function sassTask(done){
    gulp.src([filesPath.sass, '!./src/sass/xxxx.scss'])
        .pipe(plumber({ errorHandler: notifier.error }))
        .pipe(sourcemaps.init())
        .pipe(autoprefixer())
        .pipe(sass())
        .pipe(cssnano())
        .pipe(sourcemaps.write('.'))
        .pipe(rename((path) => {
            if (!path.extname.endsWith('.map')) {
                path.basename += '.min'
            }
        }))
        .pipe(dest('./dist/css'))
        // .pipe(notifier.success('sass'))
    done();
}

// JavaScript
function jsTask(done){
    gulp.src(['./src/js/index.js', './src/js/contact.js'])
        .pipe(plumber({ errorHandler: notifier.error }))
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('index.js'))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest('./dist/js'))
        // .pipe(notifier.success('js'))
    done();
}

// Image optimization
function imagesTask(done){
    gulp.src(filesPath.images)
        .pipe(cache(imagemin()))
        .pipe(dest('./dist/img/'))
    done();
}

// Watch Task with Browser Sync
function watch(){
    // Browser Sync
    browserSync.init({
        server: {
            baseDir: './'
        },
        browser: "google chrome"
    })
    // Watch
    gulp.watch(filesPath.html, htmlTask).on('change', browserSync.reload);
    gulp.watch(filesPath.sass, sassTask).on('change', browserSync.reload);
    gulp.watch(filesPath.js, jsTask).on('change', browserSync.reload);
    gulp.watch(filesPath.images, imagesTask).on('change', browserSync.reload);
}

// Clean the Cache in the browser
function clearCache(done){
    cache.clearAll();
    done();
}

// Zip Project
function zipTask(done){
    gulp.src(['./**/*', '!./node_modules/**/*'])
        .pipe(zip('project.zip'))
        .pipe(dest('./'))
    done();
}

// Clean 'dist' Folder
function clean(done){
    del(['./dist/**/*']);
    done();
}

// Gulp individual tasks
exports.htmlTask = htmlTask;
exports.sassTask = sassTask;
exports.jsTask = jsTask;
exports.imagesTask = imagesTask;
exports.watch = watch;
exports.clearCache = clearCache;
exports.zipTask = zipTask;
exports.clean = clean;

// Gulp Serve
exports.build = parallel(htmlTask, sassTask, jsTask, imagesTask);

// Gulp Default
exports.default = series(exports.build, watch);