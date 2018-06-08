module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // test config
    plates: {
      options: {
        format: "amd"
      },
      templates: {
        src: ['tests/src/templates/*.plt'],
        dest: 'tests/dist/templates.js'
      },
      // helpers: {
      //   src: ['tests/src/helpers/*.plt'],
      //   dest: 'tests/dist/helper.js'
      // }
    }
  });

  // Load internal task
  grunt.loadTasks('tasks');

  // Default task(s).
  grunt.registerTask('default', ['plates']);

};