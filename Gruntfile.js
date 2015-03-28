'use strict';
var licensify = require('licensify');

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    opt: {
      client: {
        'app': 'example/src',
        'tsMain': 'lib',
        'tsTest': 'test/unit',
        'e2eTest': 'test/e2e',
        'jsMain': 'lib',
        'jsTest': 'test/unit',
        'jsTestEspowerd': 'test-espowered/unit',
        'e2eTestEspowerd': 'test-espowered/e2e',
        'dist': 'dist'
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
            cwd: '<%= opt.client.e2eTest %>/',
            src: ['**/*-spec.js'],
            dest: '<%= opt.client.e2eTest %>/es5/'
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
          '<%= opt.client.e2eTest %>/es5',
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
          {expand: true, cwd: 'lib/', src: ['**/*.js'], dest: 'dist/'}
        ]
      }
    },

    espower: {
      test: {
        files: [
          {
            expand: true,
            cwd: '<%= opt.client.jsTest %>/',
            src: ['**/*.js'],
            dest: '<%= opt.client.jsTestEspowerd %>',
            ext: '.js'
          }
        ]
      },
      e2e: {
        files: [
          {
            expand: true,
            cwd: '<%= opt.client.e2eTest %>/es5/',
            src: ['**/*.js'],
            dest: '<%= opt.client.e2eTestEspowerd %>',
            ext: '.js'
          }
        ]
      }
    },

    mocha_istanbul: {
      test: {
        src: '<%= opt.client.jsTestEspowerd %>/**/*.js',
        options: {
          mask: '**/*.js',
          reportFormats: ['lcov']
        }
      },
      e2e: {
        src: '<%= opt.client.e2eTestEspowerd %>/**/*.js',
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