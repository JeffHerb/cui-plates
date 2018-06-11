module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    clean: {
      test: {
        src: ['tests/dist']
      }
    },

    // test config
    plates: {
      options: {
        format: "amd",
        templates: {
          src: ['/tests/src/templates/*.plt']
        }
      },
      ast: {
        dest: 'test/dist/js/plates.js'
      }
    }
  });

  // Load internal task
  grunt.loadTasks('tasks');

  // Native Grunt tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  // Default task(s).
  grunt.registerTask('default', ['clean', 'plates']);

};