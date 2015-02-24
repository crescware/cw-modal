'use strict';

var fs = require('fs');
var licensify = require('licensify');

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  var browserifyConfig = {
    browser: {
      jquery: './node_modules/jquery/dist/jquery.js',
      angular: './node_modules/angular/angular.js'
    },
    'browserify-shim': {
      jquery: {
        exports: '$'
      },
      angular: {
        depends: 'jquery',
        exports: 'angular'
      }
    }
  };

  function extend(a, b){
    for(var key in b) {
      if(b.hasOwnProperty(key)) { a[key] = b[key]; }
    }
    return a;
  }
  var packageJson = require('./package.json');
  var rawPackageJson = JSON.stringify(packageJson, null, '  ');
  var merged = extend(packageJson, browserifyConfig);
  fs.writeFileSync('package.json', JSON.stringify(merged, null, '  '));

  grunt.registerTask('restorePackage', 'Restoring package.json', function() {
    fs.writeFileSync('package.json', rawPackageJson);
  });

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
        sourceMap: true
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
          b.transform({global: true}, 'browserify-shim');
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

  var taskBasic = [
    'clean',
    'ts:lib'
  ];

  var taskTest = taskBasic.concat([
    'espower:test',
    'mocha_istanbul:test'
  ]);
  grunt.registerTask('test', taskTest.concat(['restorePackage']));

  var taskStart = taskBasic.concat([
    'ts:app',
    'ngAnnotate',
    'browserify:example'
  ]);
  grunt.registerTask('start', taskStart.concat(['restorePackage']));

  var taskE2e = taskStart.concat([
    'babel',
    'espower:e2e',
    'mocha_istanbul:e2e'
  ]);
  grunt.registerTask('e2e', taskE2e.concat(['restorePackage']));

  var taskBuild = taskBasic.concat([
    'ngAnnotate',
    'concat',
    'copy'
  ]);
  grunt.registerTask('build', taskBuild.concat(['restorePackage']));
};