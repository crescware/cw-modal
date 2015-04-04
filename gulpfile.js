'use strict';
var del = require('del');
var espower = require('gulp-espower');
var glob = require('glob');
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
      shell.task([`${bundler} ${names} -o ${opt.example}/src/bundle.js ${verbose}`])();
      done();
    });
  };
}

gulp.task('watchify_',   globToBrowserify('watchify'));
gulp.task('browserify_', globToBrowserify('browserify'));

gulp.task('watchify',   function(done) {seq('ts', 'babel', 'watchify_', done)});
gulp.task('browserify', function(done) {seq('ts', 'babel', 'browserify_', done)});

/* watch */
gulp.task('watch', ['watchify', 'ts'], function() {
  gulp.watch([`${opt.example}/**/*.ts`, `${opt.lib}/**/*.ts`], ['ts']);
});

/* build */
gulp.task('build_', shell.task([`find ${opt.lib} -name *.js | xargs browserify --exclude angular --standalone CwModal > bundle.js`]));
gulp.task('build', function(done) {seq('ts:lib', 'babel:lib', 'build_', done)});

/* test */
gulp.task('espower', function() {
  return gulp.src(`${opt.testEs5}/**/*.js`)
    .pipe(espower())
    .pipe(gulp.dest(opt.testEspowered));
});
gulp.task('test_', shell.task([`mocha ${opt.testEspowered}`]));
gulp.task('test', function(done) {seq('ts:lib_', ['babel:lib', 'babel:test'], 'espower', done)});