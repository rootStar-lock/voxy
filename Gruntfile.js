module.exports = function(grunt) {

	grunt.initConfig({
		nodewebkit: {
			options: {
				build_dir: './build',
				mac: false,
				win: false,
				linux32: false,
				linux64: true
			},
			src: ['./app/**'] // Your node-webkit app
		},
		copy: {
			linux64: {
				src: "/lib/x86_64-linux-gnu/libudev.so.1",
				dest: "./build/releases/voxy/linux64/voxy/libudev.so.0"
			}
		},
		shell: {
			"run-linux64": {
				command: 'LD_LIBRARY_PATH=./build/releases/voxy/linux64/voxy/:$LD_LIBRARY_PATH ./build/releases/voxy/linux64/voxy/voxy &',
				options: {
					async: true
				}
			},
			kill: {
				command: "killall voxy",
				options: {
					failOnError: false,
				}
			}
		},
		sass: {
			dev: {
				src: "scss/index.scss",
				dest: "app/stylesheets/style.css"
			},
		},
		watch: {
			all: {
				files: ['app/**', 'scss/**'],
				tasks: ['shell:kill', "build", "run"],
				options: {
					reload: true,
					atBegin: true,
    		}
			}
		}
	});

	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-shell-spawn');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-node-webkit-builder');
	grunt.registerTask('build', ['sass', 'nodewebkit', 'copy']);
	grunt.registerTask('run', ['shell:run-linux64']);
	grunt.registerTask('default', ['watch']);
};