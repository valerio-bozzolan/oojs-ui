/*!
 * Grunt file
 */

/*jshint node:true */
module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-banana-checker' );
	grunt.loadNpmTasks( 'grunt-contrib-clean' );
	grunt.loadNpmTasks( 'grunt-contrib-concat-sourcemaps' );
	grunt.loadNpmTasks( 'grunt-contrib-csslint' );
	grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-less' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-csscomb' );
	grunt.loadNpmTasks( 'grunt-file-exists' );
	grunt.loadNpmTasks( 'grunt-cssjanus' );
	grunt.loadNpmTasks( 'grunt-jscs' );
	grunt.loadNpmTasks( 'grunt-karma' );
	grunt.loadNpmTasks( 'grunt-svg2png' );
	grunt.loadTasks( 'build/tasks' );
	grunt.renameTask( 'watch', 'runwatch' );

	var modules = grunt.file.readJSON( 'build/modules.json' ),
		styleTargets = {
			'oojs-ui-apex': modules['oojs-ui-apex'].styles,
			'oojs-ui-minerva': modules['oojs-ui-minerva'].styles,
			'oojs-ui-mediawiki': modules['oojs-ui-mediawiki'].styles
		},
		lessFiles = {
			default: {},
			svg: {}
		},
		originalLessFiles = {},
		concatCssFiles = {},
		rtlFiles = {
			'demos/styles/demo.rtl.css': 'demos/styles/demo.css'
		},
		minBanner = '/*! OOjs UI v<%= pkg.version %> | http://oojs.mit-license.org */';

	( function () {
		var distFile, target, module;
		// We compile LESS copied to a different directory
		function fixLessDirectory( fileName ) {
			return fileName.replace( /^src\//, 'dist/tmp/' );
		}
		for ( module in styleTargets ) {
			for ( target in lessFiles ) {
				distFile = target === 'default' ?
					'dist/' + module + '.css' :
					'dist/' + module + '.' + target + '.css';

				originalLessFiles[distFile] = styleTargets[module];
				lessFiles[target][distFile] = styleTargets[module].map( fixLessDirectory );

				// Concat isn't doing much other than prepending the banner...
				concatCssFiles[ distFile ] = distFile;
				rtlFiles[ distFile.replace( '.css', '.rtl.css' ) ] = distFile;
			}
		}
	}() );

	function merge( target/*, sources...*/ ) {
		var
			sources = Array.prototype.slice.call( arguments, 1 ),
			len = sources.length,
			i = 0,
			source, prop;

		for ( ; i < len; i++ ) {
			source = sources[i];
			if ( source ) {
				for ( prop in source ) {
					target[prop] = source[prop];
				}
			}
		}

		return target;
	}

	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),

		// Build
		clean: {
			build: 'dist/*',
			tmp: 'dist/tmp'
		},
		fileExists: {
			src: modules['oojs-ui'].scripts.concat(
				originalLessFiles['dist/oojs-ui-apex.css'],
				originalLessFiles['dist/oojs-ui-apex.svg.css'],
				originalLessFiles['dist/oojs-ui-minerva.css'],
				originalLessFiles['dist/oojs-ui-minerva.svg.css'],
				originalLessFiles['dist/oojs-ui-mediawiki.css'],
				originalLessFiles['dist/oojs-ui-mediawiki.svg.css']
			)
		},
		concat: {
			options: {
				banner: grunt.file.read( 'build/banner.txt' )
			},
			js: {
				files: {
					'dist/oojs-ui.js': modules['oojs-ui'].scripts,
					'dist/oojs-ui-apex.js': modules['oojs-ui-apex'].scripts,
					'dist/oojs-ui-minerva.js': modules['oojs-ui-minerva'].scripts,
					'dist/oojs-ui-mediawiki.js': modules['oojs-ui-mediawiki'].scripts
				}
			},
			css: {
				files: concatCssFiles
			}
		},

		// Build – Code
		uglify: {
			options: {
				banner: minBanner,
				sourceMap: true,
				sourceMapIncludeSources: true,
				report: 'gzip'
			},
			js: {
				expand: true,
				src: 'dist/*.js',
				ext: '.min.js',
				extDot: 'last'
			}
		},

		// Build – Styling
		less: {
			distDefault: {
				options: {
					ieCompat: true,
					report: 'gzip',
					modifyVars: {
						'oo-ui-default-image-ext': 'png'
					}
				},
				files: lessFiles.default
			},
			distSvg: {
				options: {
					ieCompat: false,
					report: 'gzip',
					modifyVars: {
						'oo-ui-default-image-ext': 'svg'
					}
				},
				files: lessFiles.svg
			}
		},
		cssjanus: {
			dist: {
				files: rtlFiles
			}
		},
		csscomb: {
			dist: {
				expand: true,
				src: 'dist/*.css'
			}
		},
		copy: {
			imagesApex: {
				src: 'src/themes/apex/images/**/*.{png,gif}',
				strip: 'src/themes/apex/images',
				dest: 'dist/themes/apex/images'
			},
			imagesMinerva: {
				src: 'src/themes/minerva/images/**/*.{png,gif}',
				strip: 'src/themes/minerva/images',
				dest: 'dist/themes/minerva/images'
			},
			imagesMediaWiki: {
				src: 'src/themes/mediawiki/images/**/*.{png,gif}',
				strip: 'src/themes/mediawiki/images',
				dest: 'dist/themes/mediawiki/images'
			},
			i18n: {
				src: 'i18n/*.json',
				dest: 'dist'
			},
			lessTemp: {
				src: 'src/**/*.less',
				strip: 'src/',
				dest: 'dist/tmp'
			},
			svg: {
				src: 'dist/tmp/**/*.svg',
				strip: 'dist/tmp/',
				dest: 'dist'
			}
		},
		colorizeSvg: {
			apex: {
				options: merge(
					grunt.file.readJSON( 'build/images.json' ),
					grunt.file.readJSON( 'src/themes/apex/images.json' )
				),
				srcDir: 'src/themes/apex/images',
				destDir: 'dist/tmp/themes/apex/images'
			},
			minerva: {
				options: merge(
					grunt.file.readJSON( 'build/images.json' ),
					grunt.file.readJSON( 'src/themes/minerva/images.json' )
				),
				srcDir: 'src/themes/minerva/images',
				destDir: 'dist/tmp/themes/minerva/images'
			},
			mediawiki: {
				options: merge(
					grunt.file.readJSON( 'build/images.json' ),
					grunt.file.readJSON( 'src/themes/mediawiki/images.json' )
				),
				srcDir: 'src/themes/mediawiki/images',
				destDir: 'dist/tmp/themes/mediawiki/images'
			}
		},
		svg2png: {
			dist: {
				src: 'dist/{images,themes}/**/*.svg',
				dest: 'dist/'
			}
		},
		cssmin: {
			options: {
				keepSpecialComments: 0,
				banner: minBanner,
				compatibility: 'ie8',
				report: 'gzip'
			},
			dist: {
				expand: true,
				src: 'dist/*.css',
				ext: '.min.css',
				extDot: 'last'
			}
		},

		// Lint – Code
		jshint: {
			options: {
				jshintrc: true
			},
			dev: [ '*.js', '{build,demos,src,tests}/**/*.js' ]
		},
		jscs: {
			dev: [
				'<%= jshint.dev %>',
				'!demos/{dist,lib}/**'
			]
		},

		// Lint – Styling
		csslint: {
			options: {
				csslintrc: '.csslintrc'
			},
			all: [
				'{demos,src}/**/*.css',
				'!demos/{dist,lib}/**'
			]
		},

		// Lint – i18n
		banana: {
			all: 'i18n/'
		},

		// Test
		karma: {
			options: {
				frameworks: [ 'qunit' ],
				files: [
					'lib/jquery.js',
					'lib/oojs.js',
					'dist/oojs-ui.js',
					'dist/oojs-ui-apex.js',
					'tests/**/*.test.js'
				],
				reporters: [ 'dots' ],
				singleRun: true,
				autoWatch: false
			},
			main: {
				browsers: [ 'PhantomJS' ],
				preprocessors: {
					'dist/*.js': [ 'coverage' ]
				},
				reporters: [ 'dots', 'coverage' ],
				coverageReporter: { reporters: [
					{ type: 'html', dir: 'dist/coverage/' },
					{ type: 'text-summary', dir: 'dist/coverage/' }
				] }
			},
			local: {
				browsers: [ 'PhantomJS', 'Chrome', 'Firefox' ]
			},
			bg: {
				singleRun: false,
				background: true,
				browsers: [ 'PhantomJS', 'Chrome', 'Firefox' ]
			}
		},

		// Development
		runwatch: {
			files: [
				'<%= jshint.dev %>',
				'<%= csslint.all %>',
				'{demos,src}/**/*.less',
				'.{csslintrc,jscsrc,jshintignore,jshintrc}'
			],
			tasks: [ '_test', 'karma:bg:run' ]
		}
	} );

	grunt.registerTask( 'pre-test', function () {
		// Only create Source maps when doing a git-build for testing and local
		// development. Distributions for export should not, as the map would
		// be pointing at "../src".
		grunt.config.set( 'concat.js.options.sourceMap', true );
		grunt.config.set( 'concat.js.options.sourceMapStyle', 'link' );
	} );

	grunt.registerTask( 'pre-git-build', function () {
		var done = this.async();
		require( 'child_process' ).exec( 'git rev-parse HEAD', function ( err, stout, stderr ) {
			if ( !stout || err || stderr ) {
				grunt.log.err( err || stderr );
				done( false );
				return;
			}
			grunt.config.set( 'pkg.version', grunt.config( 'pkg.version' ) + '-pre (' + stout.substr( 0, 10 ) + ')' );
			grunt.verbose.writeln( 'Added git HEAD to pgk.version' );
			done();
		} );
	} );

	grunt.registerTask( 'build-code', [ 'concat:js', 'uglify' ] );
	grunt.registerTask( 'build-styling', [
		'copy:lessTemp', 'colorizeSvg', 'less', 'copy:svg',
		'copy:imagesApex', 'copy:imagesMinerva', 'copy:imagesMediaWiki', 'svg2png',
		'concat:css', 'cssjanus', 'csscomb', 'cssmin'
	] );
	grunt.registerTask( 'build-i18n', [ 'copy:i18n' ] );
	grunt.registerTask( 'build', [ 'clean:build', 'fileExists', 'build-code', 'build-styling', 'build-i18n', 'clean:tmp' ] );

	grunt.registerTask( 'git-build', [ 'pre-git-build', 'build' ] );

	grunt.registerTask( 'lint', [ 'jshint', 'jscs', 'csslint', 'banana' ] );
	grunt.registerTask( '_test', [ 'pre-test', 'git-build', 'lint' ] );
	grunt.registerTask( 'test', [ '_test', 'karma:main' ] );

	grunt.registerTask( 'watch', [ 'karma:bg:start', 'runwatch' ] );

	grunt.registerTask( 'default', 'test' );
};
