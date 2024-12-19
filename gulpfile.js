const gulp = require('gulp');
const ghPages = require('gulp-gh-pages');
const concat = require('gulp-concat-css');
const plumber = require('gulp-plumber');
const del = require('del');
const browserSync = require('browser-sync').create();
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mediaquery = require('postcss-combine-media-query');
const cssnano = require('cssnano');
const htmlMinify = require('html-minifier');
const sass = require('gulp-sass')(require('sass'));

function serve() {
  browserSync.init({
    server: {
      baseDir: './dist',
    },
  });
}

function deploy() {
  return gulp.src('dist/**/*').pipe(ghPages());
}

function fonts() {
  return gulp
    .src('src/fonts/**/*.{ttf,woff,woff2}') 
    .pipe(gulp.dest('dist/fonts')); 
}

function html() {
  const options = {
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    sortClassName: true,
    useShortDoctype: true,
    collapseWhitespace: true,
    minifyCSS: true,
    keepClosingSlash: true,
  };
  return gulp
    .src('src/**/*.html')
    .pipe(plumber())
    .on('data', function (file) {
      const buferFile = Buffer.from(
        htmlMinify.minify(file.contents.toString(), options)
      );
      return (file.contents = buferFile);
    })
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.reload({ stream: true }));
}

function css() {
  const plugins = [autoprefixer(), mediaquery(), cssnano()];
  return gulp
    .src('src/**/*.css')
    .pipe(plumber())
    .pipe(concat('style.css'))
    .pipe(postcss(plugins))
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.reload({ stream: true }));
}

function scss() {
  const plugins = [autoprefixer(), mediaquery(), cssnano()];
  return gulp
    .src('src/**/*.scss')
    .pipe(sass())
    .pipe(concat('style.css'))
    .pipe(postcss(plugins))
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.reload({ stream: true }));
}

function images() {
  return gulp
    .src('src/images/**/*.{jpg,png,svg,gif,ico,webp,avif}')
    .pipe(gulp.dest('dist/images'))
    .pipe(browserSync.reload({ stream: true }));
}

function clean() {
  return del('dist');
}

function watchFiles() {
  gulp.watch(['src/**/*.html'], html);
  gulp.watch(['src/**/*.css'], css);
  gulp.watch(['src/**/*.scss'], scss);
  gulp.watch(['src/images/**/*.{jpg,png,svg,gif,ico,webp,avif}'], images);
}

const build = gulp.series(clean, gulp.parallel(html, scss, images, fonts));
const watchapp = gulp.parallel(build, watchFiles, serve);

exports.clean = clean;
exports.images = images;
exports.html = html;
exports.css = css;
exports.scss = scss;
exports.fonts = fonts;

exports.deploy = deploy;
exports.build = build;
exports.watchapp = watchapp;

exports.default = watchapp;
