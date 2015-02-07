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
        'e2eTestEspowerd': 'test-espowered/e2e'
      }
    },

    browserify: {
      options: {
        preBundleCB: function (b) {
          b.plugin(licensify);
        }
      },
      example: {
        files: {
          'example/src/bundle.js': ['example/**/*.js']
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
          '<%= opt.client.jsMain %>/**/*.js.map'
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
      }
    },

    mocha_istanbul: {
      main: {
        src: '<%= opt.client.jsTestEspowerd %>/**/*.js',
        options: {
          mask: '**/*.js',
          reportFormats: ['lcov']
        }
      }
    },

    ts: {
      options: {
        comments: true,
        compiler: './node_modules/.bin/tsc',
        noImplicitAny: true,
        sourceMap: true,
        target: 'es5',
        noEmitOnError: true
      },
      app: {
        src: ['<%= opt.client.app %>/**/*.ts'],
        options: {
          module: 'commonjs'
        }
      },
      lib: {
        src: ['<%= opt.client.tsMain %>/**/*.ts'],
        options: {
          module: 'commonjs'
        }
      }
    }
  });

  grunt.registerTask('basic', [
    'clean',
    'ts:lib'
  ]);

  grunt.registerTask('test', [
    'basic',
    'espower',
    'mocha_istanbul'
  ]);

  grunt.registerTask('start', [
    'basic',
    'ts:app',
    'browserify:example'
  ]);
};