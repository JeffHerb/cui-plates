'use strict';

// Native Node Modules
const FS = require('fs');
const Path = require('path');

// Custom Grunt Task to prase our plt templates
const ParseTemplate = require('./libs/parseTemplate');

// Thrid level Modules
// Rollup Specific
const Rollup = require('rollup');
const RollupResolve = require('rollup-plugin-node-resolve');
const RollupVirtual = require('rollup-plugin-virtual');
const RollupCommon = require('rollup-plugin-commonjs');
const Resolve = require('rollup-plugin-node-resolve');
const Babel = require('rollup-plugin-babel');

// Other
const Glob = require("glob");

function readTemplate(filePath) {

	return new Promise( (res, rej) => {

		FS.readFile(filePath, 'utf-8', (err, data) => {

			if (err) {

				rej(err);
			}

			res(data);

		});

	});
};

function writePlates(entry, rollupOptions, templateASTs, customHelpers) {

	return new Promise((resolve, reject) => {

		let templateVirtualDef = `export const templates = ${JSON.stringify(templateASTs, null, 4)}`;

		let plugins = [
			RollupResolve(),
			RollupCommon({
				include: 'node_modules/**'
			}),
		    Babel({
		     	exclude: 'node_modules/**',
				// presets: [
				// 	[
				// 		"es2015",
				// 		{
				// 			"modules": false,
				// 			"useBuiltIns": true
				// 		}
				// 	]
				// ],
				// plugins: ["external-helpers"],
		     	babelrc: false,
		    }),
			RollupVirtual({
				'templates': templateVirtualDef
			})
		];

		Rollup.rollup({
			cache: rollupOptions.cache,
			input: entry,
			external: rollupOptions.external,
			plugins: plugins,
			context: rollupOptions.context,
			moduleContext: rollupOptions.moduleContext,
			onwarn: rollupOptions.onwarn,
			preferConst: rollupOptions.preferConst,
			treeshake: rollupOptions.treeshake,
		})
		.then(function(bundle) {

			var sourceMapFile = rollupOptions.sourceMapFile;

			if (!sourceMapFile && rollupOptions.sourceMapRelativePaths) {
				sourceMapFile = path.resolve(f.dest);
			}

			return bundle.generate({
				format: rollupOptions.format,
				exports: rollupOptions.exports,
				paths: rollupOptions.paths,
				moduleId: rollupOptions.moduleId,
				name: rollupOptions.moduleName,
				globals: rollupOptions.globals,
				indent: rollupOptions.indent,
				strict: rollupOptions.useStrict,
				banner: rollupOptions.banner,
				footer: rollupOptions.footer,
				intro: rollupOptions.intro,
				outro: rollupOptions.outro,
				sourcemap: rollupOptions.sourceMap,
				sourcemapFile: sourceMapFile
			});

		})
		.then(function(result) {

			//var code = result.code;

			//if (rollupOptions.sourceMap === true) {

			//	var sourceMapOutPath = f.dest + '.map';
				//grunt.file.write(sourceMapOutPath, result.map.toString());

			//	code += "\n//# sourceMappingURL=" + path.basename(sourceMapOutPath);
			//} 
			//else if (rollupOptions.sourceMap === "inline") {

				//code += "\n//# sourceMappingURL=" + result.map.toUrl();
			//}

			resolve(result.code);
		});

	});
};

module.exports = function(grunt) {

	let taskPath = __filename
	let rootPath = Path.resolve(taskPath, '../..');

	grunt.registerMultiTask('plates', 'Core UI rendering engine', function() {

		var done = this.async();

		// Path to the template entry file
		let rollupEntry = Path.resolve(rootPath, 'tasks', 'core', 'base.js');

		if (this.data.dest) {

			let finalDest = this.data.dest;

			grunt.log.writeln('Plates has started!');

			var options = this.options({
				format: "amd"
		    });

			let rollupOptions = {
		      cache: null,
		      external: [],
		      format: options.format,
		      exports: 'auto',
		      moduleId: null,
		      moduleName: null,
		      globals: {},
		      indent: true,
		      useStrict: true,
		      banner: null,
		      footer: null,
		      intro: null,
		      preferConst: false,
		      outro: null,
		      onwarn: null,
		      paths: null,
		      plugins:[],
		      //pureExternalModules: false,
		      sourceMap: false,
		      sourceMapFile: null,
		      sourceMapRelativePaths: false,
		      treeshake: true,
		      //interop: true
			}

			// Place to store all of the ASTs after conversion (in menory)
			let templateASTs = {};

			// Get all the template files
			if (options.templates && options.templates.src && options.templates.src.length) {

				let templateFilePaths = [];
				let helperFilePaths = [];

				// If helpers are defined loop through and generate all of those file paths as well
				if (options.helpers && options.helpers.src && options.helpers.src.length) {

					// Loop through and get all the template files
					for (let helpPath of options.helpers.src) {

						let correctPath = "";

						if (helpPath.charAt(0) === "/" || helpPath.charAt(0) === "\\") {
							correctPath = helpPath.slice(1);
						}
						else {

							correctPath = helpPath;
						}

					}
				}


				// Loop through and get all the template files
				for (let tempPath of options.templates.src) {

					let correctPath = "";

					if (tempPath.charAt(0) === "/" || tempPath.charAt(0) === "\\") {
						correctPath = tempPath.slice(1);
					}
					else {

						correctPath = tempPath;
					}
				
					let files = Glob.sync(correctPath);

					if (files.length) {
						templateFilePaths = templateFilePaths.concat(files);
					}
				}

				if (templateFilePaths.length) {

					// Loop through all the template files in a series
					(function nextTemplate(templateFilePaths) {

						let templatePath = templateFilePaths.shift();

						if (templatePath) {

							let templateObj = {
								path: templatePath,
								name: templatePath.slice(templatePath.lastIndexOf('/') + 1).replace('.plt', ''),
								raw: false,
								ast: false
							};

							// Preform the read (file) template promise
							readTemplate(templatePath)
								.then((rawTemplateFile) => {

									if (rawTemplateFile.trim().length) {

										templateObj.raw = rawTemplateFile;

										// Now we need to process the file
										ParseTemplate.parse(templateObj)
											.then((templateAST) => {

												templateObj.ast = templateAST;

												// WE have finished the AST for this template, add it to the list
												if (!templateASTs[templateObj.name]) {
													templateASTs[templateObj.name] = templateObj.ast
												}
												else {

													console.log("WE HAVE A TEMPLATE NAMING CONFLICT!!!!");
												}

												if (templateFilePaths.length) {

													nextTemplate(templateFilePaths);
												}
												else {

													writePlates(rollupEntry, rollupOptions, templateASTs, {})
														.then((code) => {

															grunt.file.write(finalDest, code);

															done();
														})
														.catch((error) => {

															console.log(error);
														})
												}

											})
											.catch((error) => {

												console.log("Error reading template");

												console.log(error);
											});

									}
									else {

										console.log(`Template: ${templatePath} is being skipped as it is empty.`);

										if (templateFilePaths.length) {

											nextTemplate(templateFilePaths);
										}
										else {

											writePlates(rollupEntry, rollupOptions, templateASTs, {})
												.then((code) => {

													grunt.file.write(finalDest, code);

													done();
												})
												.catch((error) => {

													console.log(error);
												})
										}
									}

								})
								.catch((error) => {

									console.error(`Error when working on: ${templateObj.name}`)

									console.error(error);
								});

						}
						else {

							if (templateFilePaths.length) {

								nextTemplate(templateFilePaths);
							}
							else {

								done();

								console.log("Done nothing to do!");
							}
						}

					})(templateFilePaths.concat());
				}
				else {

				}
				

			}
			else {

				console.log ("You have not specificed a template source folder.");
				done();
			}
		}


	});

};