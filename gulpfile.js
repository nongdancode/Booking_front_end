// gulpfile.js
const gulp = require('gulp');
const webserver = require('gulp-webserver');
const inject = require('gulp-inject');
const clean = require('gulp-clean');
const sequence = require('gulp-sequence');
const merge = require('merge-stream');

const sass = require('gulp-sass');
const htmlclean = require('gulp-htmlclean');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const ngHtml2Js = require("gulp-ng-html2js");

const vendor = require('./vendor');

const paths = {
  src: 'src/**/*',
  srcIndex: 'src/index.html',
  srcHTML: 'src/**/*.html',
  srcCSS: 'src/**/*.css',
  srcSCSS: 'src/**/*.scss',
  srcJS: 'src/**/*.js',
  srcVendorJS: vendor.js,
  srcVendorCSS: vendor.css,
  srcAssets: 'src/assets/**/*',

  dev: 'build/dev',
  devIndex: 'build/dev/index.html',
  devCSS: 'build/dev/**/*.css',
  devJS: 'build/dev/**/*.js',
  devAssets: 'build/dev/assets',

  devVendor: 'build/dev/vendor',
  devVendorCSS: 'build/dev/vendor/**/*.css',
  devVendorJS: 'build/dev/vendor/**/*.js',

  dist: 'build/dist',
  distIndex: 'build/dist/index.html',
  distCSS: 'build/dist/**/*.css',
  distJS: 'build/dist/**/*.js',
  distAssets: 'build/dist/assets'
};

gulp.task('default', function () {
  console.log('Hello World!');
});

gulp.task('clean', function() {
  return gulp.src(paths.dev, { read: false })
    .pipe(clean());
});

gulp.task('index', function () {
  return gulp.src(paths.srcIndex).pipe(gulp.dest(paths.dev));
});

gulp.task('html', function () {
  return gulp.src(paths.srcHTML).pipe(gulp.dest(paths.dev));
});

gulp.task('css', function () {
  return merge(
    gulp.src(paths.srcCSS),
    gulp.src(paths.srcSCSS)
      .pipe(sass())
  ).pipe(gulp.dest(paths.dev));
});

gulp.task('js', function () {
  return gulp.src(paths.srcJS).pipe(gulp.dest(paths.dev));
});

gulp.task('assets', function () {
  return gulp.src(paths.srcAssets).pipe(gulp.dest(paths.devAssets));
});

gulp.task('vendor-js', function() {
  return gulp.src(paths.srcVendorJS)
    .pipe(concat('vendor.min.js'))
    .pipe(gulp.dest(paths.devVendor));
});

gulp.task('vendor-css', function() {
  return gulp.src(paths.srcVendorCSS)
    .pipe(concat('vendor.min.css'))
    .pipe(gulp.dest(paths.devVendor));
});

gulp.task('copy', function(next) {
  return sequence('clean', ['index', 'html', 'css', 'js', 'assets', 'vendor-css', 'vendor-js'])(next);
});

gulp.task('inject', ['copy'], function () {
  const css = gulp.src([paths.devVendorCSS, paths.devCSS]);
  const js = gulp.src([paths.devVendorJS, paths.devJS]);

  return gulp.src(paths.devIndex)
    .pipe(inject( css, { relative:true } ))
    .pipe(inject( js, { relative:true } ))
    .pipe(gulp.dest(paths.dev));
});

gulp.task('serve', ['inject'], function () {
  return gulp.src(paths.dev)
    .pipe(webserver({
      port: 3000,
      livereload: {
        enable: true,
        port: 3001
      }
    }));
});

gulp.task('watch', ['serve'], function () {
  gulp.watch(paths.src, ['inject']);
});

gulp.task('clean:dist', function() {
  return gulp.src(paths.dist, { read: false })
    .pipe(clean());
});

gulp.task('index:dist', function () {
  return gulp.src(paths.srcIndex)
    .pipe(htmlclean({
      protect: /<!--(.*?)-->/g,
    }))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('html:dist', function () {
  return gulp.src(paths.srcHTML)
    .pipe(htmlclean())
    .pipe(ngHtml2Js({
      moduleName: "app.templates"
    }))
    .pipe(concat('lib-2.app.template.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.dist));
});

gulp.task('css:dist', function () {
  return merge(
    gulp.src(paths.srcCSS),
    gulp.src(paths.srcSCSS)
      .pipe(sass())
  ).pipe(concat('lib-3.app.min.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest(paths.dist));
});

gulp.task('js:dist', function () {
  return gulp.src([paths.srcJS])
    .pipe(concat('lib-3.app.min.js'))
    .pipe(uglify({
      mangle: false
    }))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('assets:dist', function () {
  return gulp.src(paths.srcAssets).pipe(gulp.dest(paths.distAssets));
});

gulp.task('vendor-css:dist', function () {
  return gulp.src(paths.srcVendorCSS)
    .pipe(concat('lib-1.vendor.min.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest(paths.dist));
});

gulp.task('vendor-js:dist', function () {
  return gulp.src(paths.srcVendorJS)
    .pipe(concat('lib-1.vendor.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.dist));
});

gulp.task('copy:dist', function(next) {
  return sequence('clean:dist', ['index:dist', 'html:dist', 'css:dist', 'js:dist', 'assets:dist', 'vendor-css:dist', 'vendor-js:dist'])(next);
});

gulp.task('inject:dist', ['copy:dist'], function () {
  const css = gulp.src(paths.distCSS);
  const js = gulp.src(paths.distJS);
  return gulp.src(paths.distIndex)
    .pipe(inject( css, { relative:true } ))
    .pipe(inject( js, { relative:true } ))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('build', ['inject:dist']);

gulp.task('serve:dist', ['inject:dist'], function () {
  return gulp.src(paths.dist)
    .pipe(webserver({
      port: 3000,
      livereload: {
        enable: true,
        port: 3001
      }
    }));
});

gulp.task('watch:dist', ['serve:dist'], function () {
  gulp.watch(paths.src, ['inject:dist']);
});
