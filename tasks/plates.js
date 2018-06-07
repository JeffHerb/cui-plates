'use strict';

const FS = require('fs');
const ParseTemplate = require('./libs/parseTemplate');

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


module.exports = function(grunt) {

	grunt.registerMultiTask('plates', 'Core UI rendering engine', function() {

		var done = this.async();

		grunt.log.writeln('Plates has started!');

		var options = this.options({
			output: "es6"
	    });

		console.log(this);

		switch(this.target) {

			case "templates":

				if (typeof this.data.dest === "string") {

					// Loop through all fo the source files
					this.files.forEach( (files) => {

						var srcFiles = files.src;

						async function loadTemplateData(tempPath) {

							var contents = await readTemplate(tempPath);

							return contents;
						}


						(function nextTemplate(templates) {

							var templatePath = templates.shift();

							loadTemplateData(templatePath)
								.then( (templateData) => {

									ParseTemplate.parse(templateData)
										.then(() => {

											if (templates.length) {

												nextTemplate(templates);
											}
											else {

												console.log("Done");

												grunt.log.writeln('Plates is finished!');
												done();
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

						})(srcFiles);

					});

				}
				else {

					console.log("Templates should all output to a single destination file.");
				}

				break;

			case "helpers":

				done();

				break;

			default:
				console.log(this.target, 'is not a supported task type.');

		}

	});

};