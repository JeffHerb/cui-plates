'use strict';

// Load in the different parsers
const HTMLParser = require('./parsers/html');
const LOGICParser = require('./parsers/logic');
// const TEXTParser = require('./parsers/text');
	
let parsers = {};

// // Add all the parsers to the parser object
parsers.html = HTMLParser.parser;
parsers.logic = LOGICParser.parser;
// parsers.text = TEXTParser.parser;

let checkers = {};

// // Add all the check function to the check object
checkers.html = HTMLParser.check;
checkers.logic = LOGICParser.check;
// templateChecks.text = TEXTParser.check;

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

	const findNextStep = function _find_next_step(sSrouce) {

		let possibleSteps = [];

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

				return possibleSteps[0];
			}
			else {

				console.log(possibleSteps.length);

			}

		}
		else {

			return false;
		}
	}

	let finishedAST = [];

	(function parse(sSource) {

		if (sSource.length) {

			// Request the next possible step
			let oNextStep = findNextStep(sSource);

			if (oNextStep) {

				let stepResults = oNextStep.fParser(oNextStep.reCheck);

			}
			else {

				let error = new Error(`No valid next step could be found:`);

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

			console.log(oTemplate);

			// Verify we have contents before attempting to parse the template.
			if (oTemplate.workingCopy.length) {

				_priv.processTemplate(oTemplate, (templateResults) => {

					console.log("templateResults", templateResults);

					if (templateResults) {

					}
					else {

						let error = new Error(`Template: ${oTemplate.path} contained unknown that our internal parsers could handle. Please review this template.`)

						reject(error);
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