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
const TMP_PATH = './.tmp';
const DIST_PATH = './dist';

const STYLES_PATH = `${SRC_PATH}/styles`;
const SCRIPTS_PATH = `${SRC_PATH}/scripts`;
const STYLES_SRC = [
  `${STYLES_PATH}/main.css`,
  `${STYLES_PATH}/main-doc.css`,
  `${STYLES_PATH}/main-map.css`
];
const SCRIPTS_SRC = `${SCRIPTS_PATH}/main.js`;
const STYLES_DIST = 'app.css';
const SCRIPTS_DIST = `${TMP_PATH}/app.js`;
const COPY_PATHS = [
  `${SRC_PATH}/*.html`,
  `${SRC_PATH}/favicon.ico`,
  `${SRC_PATH}/_*/**/*`,
];
const FONTS_PATH = `${SRC_PATH}/fonts/**`;

gulp.task('clean', () => (
  del([
    DIST_PATH,
    `${DIST_PATH}/**/*`,
    TMP_PATH,
    `${TMP_PATH}/**/*`,
  ])
))

gulp.task('build:scripts', () => (
  browserify({ entries: SCRIPTS_SRC, debug: true }).transform(babelify).bundle()
    .pipe(source(SCRIPTS_DIST))
    .pipe(gulp.dest(''))
    .pipe(connect.reload())
));

gulp.task('build:styles', () => (
  gulp.src(STYLES_SRC).pipe(postcss([
    CSSImport(), CSSNested(), CSSAutoPrefixer({ browsers: ['last 2 versions'] }), CSSVariables(), CSSMinify()
  ])).pipe(rename({ suffix: '.min' })).pipe(gulp.dest(TMP_PATH)).pipe(connect.reload())
));

gulp.task('copy:fonts', () => (
  gulp.src(FONTS_PATH).pipe(gulp.dest(`${TMP_PATH}/fonts`))
));

gulp.task('copy:data', () => (
  gulp.src(`${SRC_PATH}/data/**`).pipe(gulp.dest(`${TMP_PATH}/data`))
));

gulp.task('copy', ['copy:fonts', 'copy:data'], () => (
  gulp.src(COPY_PATHS, { base: SRC_PATH }).pipe(gulp.dest(TMP_PATH)).pipe(connect.reload())
));

gulp.task('build:images', () => (
  gulp.src(`${SRC_PATH}/images/**/*`).pipe(gulp.dest(`${TMP_PATH}/images`)).pipe(connect.reload())
));

gulp.task('build:jekyll', (cb) => (
  cp.spawn('jekyll', ['build', '-s', TMP_PATH, '-d', DIST_PATH, '--config', './_config.yml'], { stdio: 'inherit' }) // Adding incremental reduces build time.
    .on('error', (error) => gutil.log(gutil.colors.red(error.message)))
    .on('close', cb)
));

gulp.task('build', sequence(['build:scripts', 'build:styles', 'build:images', 'copy'], 'build:jekyll'));

gulp.task('watch', ['build'], () => {
  gulp.watch(`${SCRIPTS_PATH}/**/*.js`, ['build:scripts']);
  gulp.watch(`${STYLES_PATH}/**/*.css`, ['build:styles']);
  gulp.watch(`${SRC_PATH}/images/**/*`, ['build:images']);
  gulp.watch(COPY_PATHS, ['copy']);
  gulp.watch(`${TMP_PATH}/**/*`, ['build:jekyll']);
});

gulp.task('dev', ['watch'], () => {
  connect.server({ root: DIST_PATH, port: 8080, livereload: true });
});

gulp.task('prefix', () => (
  gulp.src(`${TMP_PATH}/*.html`).pipe(prefix('/nhs.portal.web')).pipe(gulp.dest(TMP_PATH))
));

gulp.task('production', ['build'], () => (
  gulp.src(SCRIPTS_DIST).pipe(uglify()).pipe(gulp.dest(TMP_PATH))
));

gulp.task('deploy', ['production', 'prefix'], () => (
  gulp.src(`${DIST_PATH}/**/*`).pipe(ghPages()))
);
