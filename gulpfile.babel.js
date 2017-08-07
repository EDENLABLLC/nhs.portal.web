import gulp from 'gulp';
import gutil from 'gulp-util';
import sequence from 'gulp-sequence';
import del from 'del';
import parallel from 'async/parallel';

import postcss from 'gulp-postcss';
import connect from 'gulp-connect';
import rename from 'gulp-rename';

import browserify from 'browserify';
import babelify from 'babelify';
import reactify from 'reactify';
import watchify from 'watchify';
import envify from 'envify';

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
  { src: `main.js`, dist: 'main.js' },
  { src: `main-doc.js`, dist: `main-doc.js` },
  { src: 'react/map/index.js', dist: 'map.bundle.js' }
];

function handleErrors() {
  var args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>'
  }).apply(this, args);
  this.emit('end'); // Keep gulp from hanging on this task
}

function buildScript(fileSrc, fileDist, watch) {

  var props = {
    entries: SCRIPTS_PATH + '/' + fileSrc,
    debug: process.env.NODE_ENV === 'development',
    transform: [envify, babelify],
  };

  // watchify() if watch requested, otherwise run browserify() once
  var bundler = watch ? watchify(browserify(props)) : browserify(props);

  function rebundle() {
    var stream = bundler.bundle();
    const transf = stream
      .on('error', handleErrors)
      .pipe(source(fileDist));

    if (process.env.NODE_ENV === 'production') {
      transf
      .pipe(buffer())
      .pipe(uglify({
        compress: {
          warnings: false,
          unused: true,
          dead_code: true // eslint-disable-line camelcase
        }
      }))
    }
    return transf.pipe(gulp.dest(SCRIPTS_DIST));
  }

  // listen for an update and run rebundle
  if (watch) {
    bundler.on('update', function() {
      rebundle();
      gutil.log('Rebundle...');
    });
  }

  // run it once the first time buildScript is called
  return rebundle();
}


gulp.task('clean', () => (
  del([
    SCRIPTS_DIST, STYLES_DIST, EXPORT_PATH,
  ])
));

gulp.task('build:scripts', (done) => {
  parallel(
    SCRIPTS_SRC.map(file => (cb) => buildScript(file.src, file.dist, process.env.WATCH === 'true').on('end', cb)),
    done
  )
});

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
  gulp.watch(`${SCRIPTS_PATH}/**/*.js`, ['build:scripts']);
  gulp.watch(`${STYLES_PATH}/**/*.css`, ['build:styles']);
});

gulp.task('dev', (done) => {
  process.env.WATCH = true;
  return sequence('watch', 'serve')(done)
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
