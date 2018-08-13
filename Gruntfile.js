const sass = require('node-sass');

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    // Clean out the current directory
    clean: {
      test: {
        src: [
          'tests/dist',
          'tests/src/components'
        ]
      }
    },

    copy: {
      main: {
        files: [
          // includes files within path and its sub-directories
          {
            expand: true,
            cwd: 'tests/src/tests',
            src: ['*.*'],
            dest: 'tests/dist/tests/',
            flatten: true,
            filter: 'isFile'
          },
        ],
      },
      docs: {
        files: [
          // includes files within path and its sub-directories
          {
            expand: true,
            cwd: 'tasks/docs',
            src: ['*.html'],
            dest: 'docs/',
            flatten: true,
            filter: 'isFile'
          },
        ],
      },
    },

    connect: {
        server: {
            options: {
                livereload: true,
                port: 8888,
                hostname: 'localhost',
                middleware: function (connect, options, middlewares) {

                    middlewares.unshift(function (req, res, next) {
                        res.setHeader('Access-Control-Allow-Credentials', true);
                        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                        res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                        next();
                    });

                    return middlewares;
                }
            },
        },
    },

    // Generates the proper plates file
    plates: {
      options: {
        format: "amd",
        templates: {
          src: ['/tests/src/templates/*.plt']
        }
      },
      ast: {
        dest: 'tests/src/components/plates/plates.js'
      }
    },

    requirejs: {
        main: {
            options: {
                baseUrl: 'tests/src/js', // Where all our resources will be
                name: 'project',
                paths: {
                    'plates': '../components/plates/plates',
                    'requirejs': '../libs/require',
                    'domReady': '../libs/domReady'
                },
                include: [
                  "requirejs",
                  "domReady"
                ],
                optimize: 'none',
                out: 'tests/dist/js/main.js',
            },
        },
    },

    sass: {
      options: {
        implementation: sass,
        sourceMap: true
      },
      dist: {
        files: {
          'docs/css/main.css': 'tasks/docs/scss/main.scss'
        }
      }
    },

    watch: {
      options: {
          livereload: true,
          interrupt: true,
          spawn: false
      },

      // Task is used with development builds to keep the connect server running.
      noop: {
          files: [
              'README.md',
          ],
      },

      plates: {
        files: [
          'tasks/**/*.*',
          'tests/src/js/project.js',
          'tests/src/templates/**.*'
        ],
        tasks: ['plates', 'requirejs', 'copy']
      },

      tests: {
        files: [
          'tests/src/tests/**/*.*'
        ],
        tasks: ['copy']
      },

      docs: {
        files: [
          'tasks/docs/**/*.html',
          'tasks/docs/**/*.scss',
        ],
        tasks: ['sass','copy:docs']
      }
    },

  });

  // Load internal task
  grunt.loadTasks('tasks');

  // Native Grunt tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-sass');

  // Default task(s).
  grunt.registerTask('default', 'build');

  grunt.registerTask('dev', 'Development', function (args) {

      // Run the development build process
      grunt.task.run([
          'clean',
          'plates',
          'requirejs',
          'copy',
          'sass',
          'connect',
          'watch'
      ]);
  });

  grunt.registerTask('build', 'Build', function (args) {

      // Run the development build process
      grunt.task.run([
          'clean',
          'plates',
          'requirejs',
      ]);
  });

};