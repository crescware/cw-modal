'use strict';
var del = require('del');
var espower = require('gulp-espower');
var glob = require('glob');
var gulp = require('gulp');
var seq = require('run-sequence');
var shell = require('gulp-shell');

var opt = {
  dist:          './dist',
  example:       './example',
  bundle:        '/src/bundle.js',
  lib:           './lib',
  test:          './test',
  testEs5:       './test-es5',
  testEspowered: './test-espowered'
};

/* clean */
gulp.task('clean:bundle', del.bind(null, [
  opt.example + opt.bundle
]));
gulp.task('clean:dist', del.bind(null, [
  opt.dist
]));
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
gulp.task('ts:example_', shell.task([`find ${opt.example} -name *.ts | xargs ${tsc}`]));
gulp.task('ts:lib_',     shell.task([`find ${opt.lib}     -name *.ts | xargs ${tsc}`]));

gulp.task('ts:example', function(done) {seq('clean', 'ts:example_', done)});
gulp.task('ts:lib',     function(done) {seq('clean', 'ts:lib_', done)});
gulp.task('ts',         function(done) {seq('clean', ['ts:lib_', 'ts:example_'], done)});

/* babel */
gulp.task('babel:example', shell.task([`babel ${opt.example} --out-dir ${opt.example}`]));
gulp.task('babel:lib',     shell.task([`babel ${opt.lib}     --out-dir ${opt.lib}`]));
gulp.task('babel:test',    shell.task([`babel ${opt.test}    --out-dir ${opt.testEs5}`]));
gulp.task('babel', ['babel:example', 'babel:lib']);

/* browserify */
function globToBrowserify(bundler) {
  var verbose = (bundler === 'watchify')? '-v' : '';
  return function(done) {
    var p = new Promise(function(resolve) {
      glob(`${opt.example}/**/*.js`, function(er, files) {
        resolve(files.join(' '));
      });
    });
    p.then(function(names) {
      shell.task([`${bundler} ${names} -p licensify > ${opt.example}${opt.bundle} ${verbose}`])();
      done();
    });
  };
}

gulp.task('watchify_',   globToBrowserify('watchify'));
gulp.task('browserify_', globToBrowserify('browserify'));

gulp.task('watchify',   function(done) {seq('ts', 'babel', 'watchify_', done)});
gulp.task('browserify', function(done) {seq('ts', 'babel', 'browserify_', done)});

/* watch */
gulp.task('watch:js', function(done) {seq('clean:bundle', ['ts:example_', 'ts:lib_'], ['babel:example', 'babel:lib'], done)});
gulp.task('watch', ['watchify', 'watch:js'], function() {
  gulp.watch([`${opt.example}/**/*.ts`, `${opt.lib}/**/*.ts`], ['watch:js']);
});

/* build */
gulp.task('copy:lib', function() {
  gulp.src(`${opt.lib}/**/*.js`)
    .pipe(gulp.dest(opt.dist));
});
gulp.task('build:browser', shell.task([`find ${opt.lib} -name '*.js' | xargs browserify --exclude angular --standalone CwModal > ${opt.dist}/bundle.js`]));
gulp.task('build:lib', function(done) {seq(['clean:dist', 'ts:lib'], 'babel:lib', 'copy:lib', done)});
gulp.task('build',     function(done) {seq('build:lib', 'build:browser', done)});

/* test */
gulp.task('espower', function() {
  return gulp.src(`${opt.testEs5}/**/*.js`)
    .pipe(espower())
    .pipe(gulp.dest(opt.testEspowered));
});
gulp.task('test_', shell.task([`mocha ${opt.testEspowered}`]));
gulp.task('test', function(done) {seq('ts:lib_', ['babel:lib', 'babel:test'], 'espower', done)});