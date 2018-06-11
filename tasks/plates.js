'use strict';

// Native Node Modules
const FS = require('fs');
const Path = require('path');

// Custom Grunt Task to prase our plt templates
const ParseTemplate = require('./libs/parseTemplate');

// Thrid level Modules
const Rollup = require('rollup');
const RollupVirtual = require('rollup-plugin-virtual');
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


function writeTemplate(filePath, templateStr) {

	return new Promise( (res, rej) => {

	});
};

let finishedTemplate = {};

module.exports = function(grunt) {

	let taskPath = __filename
	let rootPath = Path.resolve(taskPath, '../..');

	grunt.registerMultiTask('plates', 'Core UI rendering engine', function() {

		var done = this.async();

		// Path to the template entry file
		let templateEntry = Path.resolve(rootPath, 'core', 'templates.js');

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

			// Get all the template files
			if (options.templates && options.templates.src && options.templates.src.length) {

				let templateFilePaths = [];
				let helperFilePaths = [];

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
					
						let files = Glob.sync(correctPath);

						if (files.length) {
							helperFilePaths = helperFilePaths.concat(files);
						}

					}
				}

				//Process teh templates
				async function loadTemplateData(tempPath) {

					var contents = await readTemplate(tempPath);

					return contents;
				}

				(function nextTemplate(templates) {

					console.log("In nextTempalate");

					var templatePath = templates.shift();

					loadTemplateData(templatePath)
						.then( (templateData) => {

							ParseTemplate.parse(templateData)
								.then(async (finishedAST) => {

									// Verify that the template has length or something to write.
									if (finishedAST.length) {

										//let filePath = false;
										let fileName = templatePath.slice(templatePath.lastIndexOf('/') + 1).replace('.plt', '');

										// Store the finished template in a object.
										finishedTemplate[fileName] = finishedAST;

										if (templates.length) {

											nextTemplate(templates);
										}
										else {

											var plugins = [
												RollupVirtual({
													'core\\templates': `export default ${JSON.stringify(finishedTemplate, null, 4)}`
												})
											];

										    //var plugins = rollupOptions.plugins;

										    if (typeof plugins === 'function') {
										    	plugins = plugins();
										    }

											return Rollup.rollup({
													cache: rollupOptions.cache,
													input: templateEntry,
													external: rollupOptions.external,
													plugins: plugins,
													context: rollupOptions.context,
													moduleContext: rollupOptions.moduleContext,
													onwarn: rollupOptions.onwarn,
													preferConst: rollupOptions.preferConst,
													//pureExternalModules: rollupOptions.pureExternalModules,
													treeshake: rollupOptions.treeshake,
													//'output.interop': rollupOptions.interop
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
													var code = result.code;

													if (options.sourceMap === true) {

														var sourceMapOutPath = f.dest + '.map';
														grunt.file.write(sourceMapOutPath, result.map.toString());

														code += "\n//# sourceMappingURL=" + path.basename(sourceMapOutPath);
													} 
													else if (options.sourceMap === "inline") {

														code += "\n//# sourceMappingURL=" + result.map.toUrl();
													}

													grunt.file.write(targetDestPath, code);
												});


												console.log("Done");

												grunt.log.writeln('Plates is finished!');
												//done();
										}

									}
									else {

										if (templates.length) {

											nextTemplate(templates);
										}
										else {

											console.log("Done");

											grunt.log.writeln('Plates is finished!');
											//done();
										}

									}

								})
								.catch((err) => {

									console.log(err);

									console.log("Error while parsing template!");
								})

						})
						.catch( (err) => {

							console.log(err);
						});

				})(templateFilePaths);

			}
			else {

				console.log ("You have not specificed a template source folder.");
				done();
			}
		}


	});

};