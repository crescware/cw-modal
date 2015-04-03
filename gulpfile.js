'use strict';
var del = require('del');
var espower = require('gulp-espower');
var gulp = require('gulp');
var seq = require('run-sequence');
var shell = require('gulp-shell');

var opt = {
  example:       './example',
  lib:           './lib',
  test:          './test',
  testEs5:       './test-es5',
  testEspowered: './test-espowered'
};

/* clean */
gulp.task('clean', del.bind(null, [
  opt.example + '/**/*.js',
  opt.example + '/**/*.js.map',
  opt.lib + '/**/*.js',
  opt.lib + '/**/*.js.map',
  opt.testEs5,
  opt.testEspowered
]));

/* ts */
var tsc = 'tsc -m commonjs -t es6 --noImplicitAny';
gulp.task('ts:lib_',     shell.task([`find ${opt.lib}/**     -name "*.ts" | xargs ${tsc}`]));
gulp.task('ts:example_', shell.task([`find ${opt.example}/** -name "*.ts" | xargs ${tsc}`]));

gulp.task('ts:lib',     function(cb) {seq('clean', 'ts:lib_', cb)});
gulp.task('ts:example', function(cb) {seq('clean', 'ts:example_', cb)});
gulp.task('ts',         function(cb) {seq('clean', ['ts:lib_', 'ts:example_'], cb)});

/* babel */
gulp.task('babel:example', shell.task([`babel ${opt.example} --out-dir ${opt.example}`]));
gulp.task('babel:lib',     shell.task([`babel ${opt.lib}     --out-dir ${opt.lib}`]));
gulp.task('babel:test',    shell.task([`babel ${opt.test}    --out-dir ${opt.testEs5}`]));
gulp.task('babel', ['babel:example', 'babel:lib']);

/* browserify */
var ify = `-r licensify -o ${opt.example}/src/bundle.js`;
gulp.task('watch_', shell.task([`find ${opt.example}/** -name "*.js" | xargs watchify ${ify} -v`]));
gulp.task('watch', function(cb) {seq('ts', 'babel', 'watch_', cb)});

gulp.task('browserify_', shell.task([`find ${opt.example}/** -name "*.js" | xargs browserify ${ify}`]));
gulp.task('browserify', function(cb) {seq('ts', 'babel', 'browserify_', cb)});

/* build */
gulp.task('build_', shell.task([`find ${opt.lib}/** -name "*.js" | xargs browserify --exclude angular --standalone CwModal > bundle.js`]));
gulp.task('build', function(cb) {seq('ts:lib', 'babel:lib', 'build_', cb)});

/* test */
gulp.task('espower', function() {
  return gulp.src(`${opt.testEs5}/**/*.js`)
    .pipe(espower())
    .pipe(gulp.dest(opt.testEspowered));
});
gulp.task('test_', shell.task([`mocha ${opt.testEspowered}`]));
gulp.task('test', function(cb) {seq('ts:lib_', ['babel:lib', 'babel:test'], 'espower', cb)});