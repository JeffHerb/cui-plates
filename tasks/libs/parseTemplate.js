'use strict';

// Load in the different parsers
const HTMLParser = require('./parsers/html');
const LOGICParser = require('./parsers/logic');
const TEXTParser = require('./parsers/text');
	
let parsers = {};

// // Add all the parsers to the parser object
parsers.html = HTMLParser.parser;
parsers.logic = LOGICParser.parser;
parsers.text = TEXTParser.parser;

let checkers = {};

// // Add all the check function to the check object
checkers.html = HTMLParser.check;
checkers.logic = LOGICParser.check;
//checkers.text = TEXTParser.check;

let _priv = {};

_priv.cleanupTemplate = (template) => {

	// Remove all multi spaces
	template = template.replace(/ +/g, " ");

	// Remove all tabs
	template = template.replace(/\t/g, "");

	// Remove all line breaks
	template = template.replace(/\r?\n|\r/g, "");

	// Trim any blank leading or ending
	template = template.trim();

	return template;
};

_priv.processTemplate = (oTemplate, fCallback) => {

	// Sub function will determine the next step based on first avaliable index.
	const findNextStep = function _find_next_step(sSrouce) {

		let possibleSteps = [];
		let soonestStep = false;

		// First we need to loop through parser check processes
		for (let check in checkers) {
			
			let results = checkers[check](sSrouce);

			// the contents of the checker finds something it can work with its results are retured here.
			if (results) {
				possibleSteps.push(results);
			}

		}

		if (possibleSteps.length) {

			if (possibleSteps.length === 1) {

				soonestStep = possibleSteps[0];
			}
			else {

				for (let ps = 0, psLen = possibleSteps.length; ps < psLen; ps++) {

					let rePS = possibleSteps[ps].reCheck;

					if (soonestStep === false) {
						soonestStep = possibleSteps[ps];
					}
					else {

						if ( rePS.index < soonestStep.reCheck.index ) {

							soonestStep = possibleSteps[ps];
						}
					}

				}

			}

			if (soonestStep.reCheck.index > 0) {

				// Run the inline text check
				let reInlineTextCheck = TEXTParser.check(sSrouce);

				// Double check the indicies to verify the text comes first.
				if (reInlineTextCheck.reCheck.index < soonestStep.reCheck.index) {

					return reInlineTextCheck;
				}

			}

			return soonestStep;
		}
		else {

			// No checker passed so double check with text parser
			let reTextCheck = TEXTParser.check(sSrouce);

			if (reTextCheck) {

				return reTextCheck;
			}

			return false;
		}
	}

	let oFinishedAST = [];

	(function parse(sSource) {

		if (sSource.length) {

			// Request the next possible step
			let oNextStep = findNextStep(sSource);

			if (oNextStep) {

				let oStepResults = oNextStep.fParser(oNextStep.reCheck);

				if (oStepResults instanceof Error) {
					fCallback(oStepResults);
				}
				else {

					// Check to see if we got a valid set of results back.
					if (oStepResults && oStepResults.oAST) {

						// Add the current AST results to the finished set
						oFinishedAST.push(oStepResults.oAST);

						// Check to see if this element has sub children
						if (oStepResults.sChildren) {

							let oChildTemplate = Object.assign({}, oTemplate);

							oChildTemplate.bChildRun = true;
							oChildTemplate.workingCopy = oStepResults.sChildren;

							// Call the processTemplate directly and build out all the children
							_priv.processTemplate(oChildTemplate, (oChildTemplateResults) => {

								if (oChildTemplateResults instanceof Error) {
									fCallback(oChildTemplateResults);
								}

								if (oChildTemplateResults) {

									// Get the last array element.
									let oLastAST = oFinishedAST.length -1;

									oFinishedAST[oLastAST].contents = oChildTemplateResults;
								}

							});

						}

						// Check for remaining
						if (oStepResults.sRemaining) {

							parse(oStepResults.sRemaining);
						}
						else {

							fCallback(oFinishedAST);
						}

					}
					else {

						// No results returned
						console.log("Empty template returned");

					}
				}

			}
			else {

				let error = new Error(`No valid next step could be found for: ${oTemplate.path}\n Current working string: "${sSource}"`);

				fCallback(error)
			}

		}
		else {

			if (finishedAST.length) {

				fCallback(finishedAST);
			}
			else {

				fCallback(false);
			}
		}

	})(oTemplate.workingCopy);

};

var parseTemplate = function _parse_template() {

	const parse = (oTemplate) => {

		return new Promise((resolve, reject) => {

			// Make a working copy of the template
			oTemplate.workingCopy = _priv.cleanupTemplate(oTemplate.raw);

			// Verify we have contents before attempting to parse the template.
			if (oTemplate.workingCopy.length) {

				console.log(`Processing: ${oTemplate.path}`);

				_priv.processTemplate(oTemplate, (oTemplateResults) => {

					if (oTemplateResults instanceof Error) {

						let errorMessage = oTemplateResults.message;

						// Swap out error message template.path string with actual.
						let error = new Error(errorMessage.replace('|template.path|', oTemplate.path));

						reject(error);
					}
					else {

						console.log("Finished template");
						console.log(oTemplateResults);

						resolve(oTemplateResults);
					}


				});

			}
			else {

				console.log(`Template: ${oTemplate.path} is being skipped as it has no contents`);

				resolve(false);
			}

		});
	}

	return {
		parse: parse
	};

};

module.exports = exports = new parseTemplate();