'use strict';
var licensify = require('licensify');

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    opt: {
      client: {
        'app':    'example/src',
        'tsMain': 'lib',
        'jsMain': 'lib',
        'dist':   'dist'
      },
      test: {
        'e2e':           'test/e2e',
        'e2eEs5':        'test-es5/e2e',
        'e2eEspowered':  'test-espowered/e2e',
        'unit':          'test/unit',
        'unitEs5':       'test-es5/unit',
        'unitEspowered': 'test-espowered/unit'
      }
    },

    babel: {
      options: {
        sourceMap: false
      },
      e2e: {
        files: [
          {
            expand: true,
            cwd: '<%= opt.test.e2e %>/',
            src: ['**/*.es6'],
            dest: '<%= opt.test.e2eEs5 %>',
            ext:'.js'
          }
        ]
      }
    },

    browserify: {
      options: {
        preBundleCB: function (b) {
          b.plugin(licensify, {scanBrowser: true});
        }
      },
      example: {
        files: {
          'example/src/bundle.js': ['example/**/*.js']
        }
      },
      lib: {
        files: {
          'lib/bundle.js': ['lib/**/*.js']
        }
      }
    },

    clean: {
      client: {
        src: [
          './*.js.map',
          '<%= opt.client.app %>/**/*.js',
          '<%= opt.client.app %>/**/*.js.map',
          '<%= opt.client.jsMain %>/**/*.js',
          '<%= opt.client.jsMain %>/**/*.js.map',
          '<%= opt.test.e2eEs5 %>/',
          '<%= opt.test.e2eEspowered %>/',
          '<%= opt.client.dist %>/'
        ]
      }
    },

    concat: {
      dist: {
        src: [
          'lib/cw-modal.js',
          'lib/dialog.js'
        ],
        dest: 'dist/bundle.js'
      }
    },

    copy: {
      dist: {
        files: [
          {
            expand: true,
            cwd: 'lib/',
            src: ['**/*.js'],
            dest: 'dist/'
          }
        ]
      }
    },

    espower: {
      test: {
        files: [
          {
            expand: true,
            cwd: '<%= opt.client.unitEs5 %>/',
            src: ['**/*.js'],
            dest: '<%= opt.test.unitEspowered %>',
            ext: '.js'
          }
        ]
      },
      e2e: {
        files: [
          {
            expand: true,
            cwd: '<%= opt.test.e2eEs5 %>/',
            src: ['**/*.js'],
            dest: '<%= opt.test.e2eEspowered %>',
            ext: '.js'
          }
        ]
      }
    },

    mocha_istanbul: {
      test: {
        src: '<%= opt.test.unitEspowered %>/**/*.js',
        options: {
          mask: '**/*.js',
          reportFormats: ['lcov']
        }
      },
      e2e: {
        src: '<%= opt.test.e2eEspowered %>/**/*.js',
        options: {
          mask: '**/*.js',
          reportFormats: ['lcov']
        }
      }
    },

    ngAnnotate: {
      options: {
        singleQuotes: true
      },
      client: {
        expand: true,
        src: [
          './<%= opt.client.app %>/**/*.js',
          './<%= opt.client.jsMain %>/**/*.js'
        ]
      }
    },

    ts: {
      options: {
        comments: true,
        compiler: './node_modules/.bin/tsc',
        noImplicitAny: true,
        sourceMap: false, // Incompatible with browserify.
        target: 'es5',
        noEmitOnError: true,
        module: 'commonjs'
      },
      app: {
        src: ['<%= opt.client.app %>/**/*.ts']
      },
      lib: {
        src: ['<%= opt.client.tsMain %>/**/*.ts']
      }
    }
  });

  var taskBasic = [
    'clean',
    'ts:lib'
  ];

  var taskTest = taskBasic.concat([
    'espower:test',
    'mocha_istanbul:test'
  ]);
  grunt.registerTask('test', taskTest);

  var taskStart = taskBasic.concat([
    'ts:app',
    'ngAnnotate',
    'browserify:example'
  ]);
  grunt.registerTask('start', taskStart);

  var taskE2e = taskStart.concat([
    'babel',
    'espower:e2e',
    'mocha_istanbul:e2e'
  ]);
  grunt.registerTask('e2e', taskE2e);

  var taskBuild = taskBasic.concat([
    'ngAnnotate',
    'concat',
    'copy'
  ]);
  grunt.registerTask('build', taskBuild);
};