'use strict';

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    opt: {
      client: {
        'tsMain': 'lib',
        'tsTest': 'test/unit',
        'e2eTest': 'test/e2e',
        'jsMain': 'lib',
        'jsTest': 'test/unit',
        'jsTestEspowerd': 'test-espowered/unit',
        'e2eTestEspowerd': 'test-espowered/e2e'
      }
    },

    clean: {
      client: {
        src: [
          './*.js.map',
          '<%= opt.client.jsMain %>/**/*.js',
          '<%= opt.client.jsMain %>/**/*.js.map'
        ]
      }
    },

    ts: {
      options: {
        comments: true,
        compiler: './node_modules/.bin/tsc',
        noImplicitAny: true,
        sourceMap: true,
        target: 'es5'
      },
      clientMain: {
        src: ['<%= opt.client.tsMain %>/**/*.ts'],
        options: {
          fast: 'never'
        }
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
    }
  });

  grunt.registerTask('basic', [
    'clean',
    'ts:clientMain'
  ]);

  grunt.registerTask('test', [
    'basic',
    'espower',
    'mocha_istanbul'
  ]);

  grunt.registerTask('start', [
    'basic',
  ]);
};