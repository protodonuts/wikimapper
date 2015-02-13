'use strict';

module.exports = function(grunt) {

  // use load-grunt-tasks to read dependencies from package.json
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  var config = {
    src: 'src',
    dist: 'dist'
  };

  grunt.initConfig({
    config: config,

    concurrent: {
      dev: {
        tasks: ['karma:watch', 'nodemon:dev'],
        options: {
          logConcurrentOutput: true
        }
      }
    },

    nodemon: {
      dev: {
        script: 'test/server.js',
        options: {
          nodeArgs: ['--debug'],
          watch: ['test/server.js', '<%= config.dist %>'],
        }
      }
    },

    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= config.dist %>/*',
            '!<%= config.dist %>/.git'
          ]
        }]
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        '/*.js',
        '<%= config.src %>/',
        'test/spec/{,*/}*.js'
      ],
    },

    karma: {
      unit: {
        configFile: './karma.conf.js',
        singleRun: true,
        autoWatch: false
      },
      watch: {
        configFile: './karma.conf.js',
        singleRun: false,
        autoWatch: true
      }
    },

    copy: {
      all: {
        files: [
          {
            src: './manifest.json',
            dest: '<%= config.dist %>/',
            filter: 'isFile',
            flatten: true,
            expand: true
          },
          {
            src: '<%= config.src %>/chrome/content.js',
            dest: '<%= config.dist %>/',
            filter: 'isFile',
            flatten: true,
            expand: true
          },
          {
            src: '<%= config.src %>/web/index.html',
            dest: '<%= config.dist %>/',
            filter: 'isFile',
            flatten: true,
            expand: true
          },
          {
            src: '<%= config.src %>/web/img/*',
            dest: '<%= config.dist %>/img',
            filter: 'isFile',
            flatten: true,
            expand: true
          },
          {
            src: '<%= config.src %>/resources/*',
            dest: '<%= config.dist %>/resources',
            filter: 'isFile',
            flatten: true,
            expand: true
          }
        ]
      }
    },

    browserify: {
      app: {
        src: [
          '<%= config.src %>/web/js/app.js',
          '<%= config.src %>/web/js/**/*.js',
          '<%= config.src %>/web/templates/*.hbs',
          '<%= config.src %>/web/styles/*.less'
        ],
        dest: '<%= config.dist %>/js/wikimapper.js',
        options: {
          transform: ['hbsfy', 'node-lessify'],
          // setting debug creates source map symbols
          browserifyOptions: {
            debug: true
          },
          watch: true
        }
      },
      background: {
        src: [
          '<%= config.src %>/chrome/**/*.js'
        ],
        dest: '<%= config.dist %>/background.js',
        options: {
          browserifyOptions: {
            debug: true
          },
          watch: true
        }
      }
    }
  });

  grunt.registerTask('prepare:bundle', 'Build preparation steps', [
    'clean:dist',
    'jshint:all',
    'copy:all'
  ]);

  grunt.registerTask('prepare:debug', 'Build preparation steps', [
    'clean:dist',
    'copy:all'
  ]);

  grunt.registerTask('build:bundle', 'Build WikiMapper extension bundle', [
    'prepare:bundle',
    'karma:unit',
    'browserify:background',
    'browserify:app'
  ]);

  grunt.registerTask('build:debug', 'Run WikiMapper in debugger/watch mode', [
    'prepare:debug',
    'browserify:background',
    'browserify:app',
    'concurrent:dev'
  ]);

};
