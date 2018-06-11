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
		let rollupEntry = Path.resolve(rootPath, 'tasks', 'core', 'base.js');

		console.log(rollupEntry);

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

			let templateASTs = {};

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

				// Now we need to read in and generate all of the AST files from the templates
				let readTemplatePromises = [];

				for (let t = 0, tLen = templateFilePaths.length; t < tLen; t++) {

					let templateFilePath = templateFilePaths[t];

					readTemplatePromises.push(

						readTemplate(templateFilePath)
							.then((rawTemplate) => {

								let templateFile = {
									path: templateFilePath,
									contents: rawTemplate
								};

								return templateFile;
							})
							.catch((err) => {

								console.log("Failed to read template: " + templateFilePath);
							})
					);
				}

				// Once all of the template files have been read we need to 
				Promise.all(readTemplatePromises)
					.then((rawTemplates) => {

						let rawsToReadPromise = [];

						for (let rt = 0, rtLen = rawTemplates.length; rt < rtLen; rt++) {

							// Filter out empty files
							if (rawTemplates[rt].contents.trim().length) {

								let rawTemplate = rawTemplates[rt];

								let filename = rawTemplate.path.slice(rawTemplate.path.lastIndexOf('/') + 1).replace('.plt', '');

								rawTemplates[rt].filename = filename;

								rawsToReadPromise.push(

									ParseTemplate.parse(rawTemplate.contents)
										.then((templateAST) => {

											rawTemplates[rt].ast = templateAST;

											return rawTemplates[rt];

										})
										.catch((err) => {

											console.log("Error when generating AST!");
										})

								);
							}
						}

						Promise.all(rawsToReadPromise)
							.then((finishedAST) => {

								// Loop through and save all results into a common area.
								for (let f = 0, fLen = finishedAST.length; f < fLen; f++) {

									templateASTs[finishedAST[f].filename] = finishedAST[f].ast;
								}

								var templateVirtualDef = `export const templates = ${JSON.stringify(templateASTs, null, 4)}`;

								console.log(templateVirtualDef);

								var plugins = [
									RollupVirtual({
										'templates': templateVirtualDef
									})
								];

								//var plugins = rollupOptions.plugins;

								if (typeof plugins === 'function') {
									plugins = plugins();
								}

								return Rollup.rollup({
										cache: rollupOptions.cache,
										input: rollupEntry,
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

										grunt.file.write(finalDest, code);
									});


									console.log("Done");

									grunt.log.writeln('Plates is finished!');							
							})
							.catch((err) => {

								console.log(err);
							})

					})
					.catch((err) => {

						console.log("Error when reading all templates");
						console.log(err);
					});

			}
			else {

				console.log ("You have not specificed a template source folder.");
				done();
			}
		}


	});

};