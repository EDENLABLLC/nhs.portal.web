import gulp from 'gulp';
import gutil from 'gulp-util';
import sequence from 'gulp-sequence';
import del from 'del';

import postcss from 'gulp-postcss';
import connect from 'gulp-connect';
import rename from 'gulp-rename';
import webpack from 'gulp-webpack';

import source from 'vinyl-source-stream';
import uglify from 'gulp-uglify';
import buffer from 'gulp-buffer';

import CSSNested from 'postcss-nested';
import CSSImport from 'postcss-import';
import CSSVariables from 'postcss-custom-properties';
import CSSMinify from 'cssnano';
import CSSAutoPrefixer from 'autoprefixer';

import ghPages from 'gulp-gh-pages';
import prefix from 'gulp-prefix';

import notify from 'gulp-notify';

import cp from 'child_process';

const SRC_PATH = './src';
const TMP_PATH = './dist';
const EXPORT_PATH = './export';

const STYLES_PATH = `${SRC_PATH}/styles`;
const STYLES_DIST = `${TMP_PATH}/styles`;

const SCRIPTS_PATH = `${SRC_PATH}/scripts`;
const SCRIPTS_DIST = `${TMP_PATH}/scripts`;
const SCRIPTS_SRC = [
  `${SCRIPTS_PATH}/main.js`,
  `${SCRIPTS_PATH}/main-doc.js`,
  `${SCRIPTS_PATH}/react/map/index.js`
];

gulp.task('clean', () => (
  del([
    SCRIPTS_DIST, STYLES_DIST, EXPORT_PATH,
  ])
));

gulp.task('build:scripts', () => (
  gulp.src(SCRIPTS_SRC)
    .pipe(webpack({
      ...require('./webpack.config.js'),
      watch: process.env.WATCH !== 'false'
    }, require('webpack')))
    .pipe(gulp.dest(SCRIPTS_DIST))
));

gulp.task('build:styles', () => (
  gulp.src(`${STYLES_PATH}/main*.css`).pipe(postcss([
    CSSImport(), CSSNested(), CSSAutoPrefixer({ browsers: ['last 2 versions'] }), CSSVariables(), CSSMinify()
  ])).pipe(rename({ suffix: '.min' })).pipe(gulp.dest(STYLES_DIST)).pipe(connect.reload())
));

gulp.task('build:jekyll', (cb) => (
  cp.spawn('jekyll', ['build', '--config', './_config.yml', '--dest', EXPORT_PATH], { stdio: 'inherit' }) // Adding incremental reduces build time.
    .on('error', (error) => gutil.log(gutil.colors.red(error.message)))
    .on('close', cb)
));

gulp.task('serve', () => (
  cp.spawn('jekyll', ['serve', '--incremental', '--dest', EXPORT_PATH], { stdio: 'inherit' }) // Adding incremental reduces build time.
    .on('error', (error) => gutil.log(gutil.colors.red(error.message)))
));

gulp.task('build', sequence('clean', ['build:scripts', 'build:styles']));

gulp.task('watch', ['build'], () => {
  gulp.watch(`${STYLES_PATH}/**/*.css`, ['build:styles']);
});

gulp.task('dev', (done) => {
  process.env.WATCH = true;
  return sequence(['watch', 'serve'])(done)
});

gulp.task('prefix', () => (
  gulp.src(`${EXPORT_PATH}/**/*.html`)
  .pipe(prefix('/nhs.portal.web', [
    {match: "a[href]", attr: "href"}, // this selector was added to the default set of selectors
    {match: "script[src]", attr: "src"},
    {match: "link[href]", attr: "href"},
    {match: "img[src]", attr: "src"},
    {match: "input[src]", attr: "src"},
    {match: "img[data-ng-src]", attr: "data-ng-src"}
  ]))
  .pipe(gulp.dest(EXPORT_PATH))
));

gulp.task('production', (done) => {
  process.env.NODE_ENV = 'production';
  process.env.WATCH = 'false';
  return sequence('build')(done);
});

gulp.task('deploy:build', sequence('production', 'build:jekyll', 'prefix'));
gulp.task('deploy', ['deploy:build'], () => (
  gulp.src(`${EXPORT_PATH}/**/*`).pipe(ghPages()))
);
