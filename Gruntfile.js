module.exports = function(grunt) {

	//Initializing the configuration object
	grunt.initConfig({
		// Task configuration
		less: {
			development: {
				options: {
					compress: true, //minifying the result
				},
				files: {
					//compiling frontend.less into frontend.css
					"public/stylesheets/style.css": "public/stylesheets/*.less"
				}
			}
		},
		concat: {
			dist: {
				src: [
					'public/bower_components/jquery/dist/jquery.js',
					'public/bower_components/underscore/underscore.js',
					'public/bower_components/backbone/backbone.js',
					'public/bower_components/bootstrap/dist/js/bootstrap.js',
					'public/bower_components/jquery.finger/dist/jquery.finger.js',
					'public/javascripts/models/*.js',
					'public/javascripts/app.js',
					'public/javascripts/thumbKiss.js'
				],
				dest: 'public/javascripts/build/final.js',
			},
		},
		uglify: {
			options: {
				mangle: false  // Use if you want the names of your functions and variables unchanged
			},
			dist: {
				files: {
					'public/javascripts/build/final.min.js': 'public/javascripts/build/final.js',
				}
			},
		},
		watch: {
			js: {
				files: ['<%= concat.dist.src %>'],
				tasks: ['concat'], //tasks to run
				options: {
					livereload: true                        //reloads the browser
				}
			},
			less: {
				files: ['public/stylesheets/*.less'], //watched files
				tasks: ['less'], //tasks to run
				options: {
					livereload: true                        //reloads the browser
				}
			},
		}
	});

	// Plugin loading
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Task definition
	grunt.registerTask('default', ['watch']);

};