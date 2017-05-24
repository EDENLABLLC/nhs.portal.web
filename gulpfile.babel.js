import gulp from 'gulp';
import gutil from 'gulp-util';
import sequence from 'gulp-sequence';
import del from 'del';

import postcss from 'gulp-postcss';
import connect from 'gulp-connect';
import rename from 'gulp-rename';

import browserify from 'browserify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import uglify from 'gulp-uglify';

import CSSNested from 'postcss-nested';
import CSSImport from 'postcss-import';
import CSSVariables from 'postcss-custom-properties';
import CSSMinify from 'cssnano';
import CSSAutoPrefixer from 'autoprefixer';

import ghPages from 'gulp-gh-pages';
import prefix from 'gulp-prefix';

import cp from 'child_process';

const SRC_PATH = './src';
const TMP_PATH = './dist';
const EXPORT_PATH = './export';

const STYLES_PATH = `${SRC_PATH}/styles`;
const STYLES_DIST = `${TMP_PATH}/styles`;

const SCRIPTS_PATH = `${SRC_PATH}/scripts`;
const SCRIPTS_DIST = `${TMP_PATH}/scripts`;
const SCRIPTS_SRC = `${SCRIPTS_PATH}/main.js`;

gulp.task('clean', () => (
  del([
    SCRIPTS_DIST, STYLES_DIST
  ])
))

gulp.task('build:scripts', () => (
  browserify({ entries: SCRIPTS_SRC, debug: true }).transform(babelify).bundle()
    .pipe(source(`app.js`))
    .pipe(gulp.dest(SCRIPTS_DIST))
    .pipe(connect.reload())
));

gulp.task('build:styles', () => (
  gulp.src(`${STYLES_PATH}/main*.css`).pipe(postcss([
    CSSImport(), CSSNested(), CSSAutoPrefixer({ browsers: ['last 2 versions'] }), CSSVariables(), CSSMinify()
  ])).pipe(rename({ suffix: '.min' })).pipe(gulp.dest(STYLES_DIST)).pipe(connect.reload())
));

gulp.task('build:jekyll', (cb) => (
  cp.spawn('jekyll', ['build', '--config', './dist/_config.yml', '--dest', EXPORT_PATH], { stdio: 'inherit' }) // Adding incremental reduces build time.
    .on('error', (error) => gutil.log(gutil.colors.red(error.message)))
    .on('close', cb)
));

gulp.task('serve', () => (
  cp.spawn('jekyll', ['serve', '--config', './dist/_config.yml', '--incremental'], { stdio: 'inherit' }) // Adding incremental reduces build time.
    .on('error', (error) => gutil.log(gutil.colors.red(error.message)))
));

gulp.task('build', sequence('clean', ['build:scripts', 'build:styles']));

gulp.task('watch', ['build'], () => {
  gulp.watch(`${SCRIPTS_PATH}/**/*.js`, ['build:scripts']);
  gulp.watch(`${STYLES_PATH}/**/*.css`, ['build:styles']);
});

gulp.task('dev', sequence('watch', 'serve'));

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

gulp.task('production', ['build'], () => (
  gulp.src(`${SCRIPTS_DIST}/*.js`).pipe(uglify()).pipe(gulp.dest(SCRIPTS_DIST))
));

gulp.task('deploy:build', sequence('production', 'build:jekyll', 'prefix'));
gulp.task('deploy', ['deploy:build'], () => (
  gulp.src(`${EXPORT_PATH}/**/*`).pipe(ghPages()))
);
