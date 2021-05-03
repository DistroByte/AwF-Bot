'use strict'
module.exports = function (grunt) {
    grunt.initConfig({
        jsdoc2md: {
            // oneOutputFile: {
            //     src: '/*.js',
            //     dest: 'docs/documentation.md'
            // },
            separateOutputFilePerInput: {
                files: [
                    { src: 'helpers/fifo-handler.js', dest: 'docs/md/fifo-handler.md' },
                    { src: 'helpers/rcon.js', dest: 'docs/md/rcon.md' },
                    { src: 'helpers/serverHandler.js', dest: 'docs/md/serverHandler.md' },
                    { src: 'helpers/serverUPSHandler.js', dest: 'docs/md/serverUPSHandler.md' },
                    { src: 'helpers/functions.js', dest: 'docs/md/functions.md' },
                ]
            },
            // withOptions: {
            //     options: {
            //         'no-gfm': false
            //     },
            //     src: 'src/wardrobe.js',
            //     dest: 'api/with-index.md'
            // }
        }
    })

    grunt.loadNpmTasks('grunt-jsdoc-to-markdown')
    grunt.registerTask('default', 'jsdoc2md')
}