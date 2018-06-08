'use strict';

// Load in the different parsers
const HTMLParser = require('./parsers/html');
const LOGICParser = require('./parsers/logic');
const TEXTParser = require('./parsers/text');

let _priv = {};

let parsers = {};

// Add all the parsers to the parser object
parsers.html = HTMLParser.parser;
parsers.logic = LOGICParser.parser;
parsers.text = TEXTParser.parser;

let templateChecks = {};

// Add all the check function to the check object
templateChecks.html = HTMLParser.check;
templateChecks.logic = LOGICParser.check;
templateChecks.text = TEXTParser.check;

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

// This function loops through all of the parser tags looking for 
_priv.parse = (template) => {

	function findNextSteps(stepTemplate) {

		return new Promise((resolve, reject) => {

			let checkers = Object.keys(templateChecks);

			let checkPromises = [];

			for (let c = 0, cLen = checkers.length; c < cLen; c++) {

				checkPromises.push(templateChecks[checkers[c]](stepTemplate));
			}

			Promise.all(checkPromises)
				.then((checkResults) => {

					let steps = [];

					for (let cr = 0, crLen = checkResults.length; cr < crLen; cr++) {

						if (checkResults[cr]) {

							steps.push(checkResults[cr]);
						}

					}

					if (steps.length) {

						resolve(steps);
					}
					else {

						resolve(false);
					}

				})
				.catch((err) => {

					console.log(err);

					console.log("Error occured when looping through all template check promises");
				})

		});
	}

	return new Promise((resolve, reject) => {

		var finishedAST = [];
		
		// Go out and find the next tag and let the proper parser do its job
		(async function keepParsing(temp) {

			let possibleSteps = await findNextSteps(temp);

			let nextStep = false;

			if (possibleSteps) {

				if (possibleSteps.length === 1) {

					nextStep = possibleSteps[0];
				}
				else {


				}

				let processResults = await nextStep.parser(nextStep.results);

				// Add what we have to the finsihed AST array.
				if (processResults.AST) {

					// Save off this elements AST.
					finishedAST.push(processResults.AST);
				}

				// Check for and deal with children first!
				if (processResults.children) {

					// Call the process for all of the children
					let childResults = await _priv.parse(processResults.children);

					// Check and verify that the children attribute exists for this AST parent.
					if (!finishedAST[finishedAST.length -1].children) {
						finishedAST[finishedAST.length -1].children = false;
					}

					// Add the children AST
					finishedAST[finishedAST.length -1].children = childResults;

					// Check to see if we have leftover template code (siblings)
					if (processResults.remaining) {

						keepParsing(processResults.remaining);
					}
					else {

						resolve(finishedAST);
					}
				}
				else {

					if (processResults.remaining) {

						keepParsing(processResults.remaining);
					}
					else {

						resolve(finishedAST);
					}

				}

			}
			else {

				console.log("I Dont know what to do!!!!");
			}


		})(template);
	});
};

var parseTemplate = function _parse_template() {

	function parse(templateStr) {

		let template = _priv.cleanupTemplate(templateStr);

		return new Promise((resolve, reject) => {

			if (template.length) {

				_priv.parse(template)
					.then((finishedAST) => {

						//console.log(JSON.stringify(finishedAST, null, 4));

						resolve(finishedAST)
					})
					.catch((err) => {

						console.log("Error when parsing");
					})
			}
			else {

				// Template is empty return nothing.
				resolve([]);
			}

		});

	};

	return {
		parse: parse
	};
};

module.exports = exports = new parseTemplate();