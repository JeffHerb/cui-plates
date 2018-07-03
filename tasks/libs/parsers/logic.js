'use strict';

const LOGIC_TAGREG = /{{([^\}}]+)}}/;

const LOGIC_OPENING_TAGREG = /^{{(?:[\#\>\.\@]?)/g;
const LOGIC_CLOSING_TAGREG = /}}/g;

const LOGIC_INLINE_HELPER_REG = /(?:[a-zA-Z]+)={{(?:.*)}}/g;
const LOGIC_SIMPLE_PARAMETERS_REG = /((?:[a-zA-Z]*)="(?:.*)")|[^\s]+/g;

const CONTEXT_REGEXP_EXTRACTOR = /{{((?:\\.|[^"\\])*)}}/;

const BLOCKParser = (fullTemplate, match) => {

	console.log("fullTemplate:", fullTemplate);
	console.log("match:",match);

	let openingTag = match[0];
	let openingIndex = match.index;
	let closingTag = false;

	// Find first closing after blockTag
	let closingTags = LOGIC_CLOSING_TAGREG.exec(fullTemplate);

	if (closingTags) {

		closingTag = closingTags[0];
	}

	let fullOpeningTag = fullTemplate.slice(openingIndex, closingTags.index + 2);
	let trimedOpeningTag = fullOpeningTag.slice(2, -2);

	// Current remains
	let remainingTemplates = fullTemplate.slice(closingTags.index + 2);

	console.log(fullOpeningTag);
	console.log(trimedOpeningTag);
	console.log(remainingTemplates);

	// Now we need to find the block level tag being used.
	let inlineHelpersCheck = LOGIC_INLINE_HELPER_REG.exec(trimedOpeningTag);

	// Check for inlineHelpers, if they exist strip them out
	if (inlineHelpersCheck) {

		console.log("Write the inline helper parser!!!");
	}

	let simpleParams = trimedOpeningTag.match(LOGIC_SIMPLE_PARAMETERS_REG);

	let blockTag = simpleParams.shift().replace('#', '');

	let ASTExt = {
		blockTag: blockTag,
		parameters: (!simpleParams) ? simpleParams.concat() : false,
		inline: (!inlineHelpersCheck) ? inlineHelpersCheck.concat() : false,
		blocks: []
	};


	return ASTExt;

};

let Helpers = false;

var Parser = function _html_parser() {

	function parse(template, templateObj, mainParser) {

		return new Promise((resolve, reject) => {

			let AST = {};

			// Get all the current template text to work from
			let fullTemplate = template.input;

			// Get the first logic match
			let matchLogic = template[0];

			// Slice off the current logic layer
			let remaining = (fullTemplate.slice(matchLogic.length).length) ? fullTemplate.slice(matchLogic.length) : false;

			// Identify the type of logic template we are working with
			let currentLogicTag = LOGIC_OPENING_TAGREG.exec(matchLogic);

			// Boiler Plate end results code
			let endResult = {
				AST: false,
				children: false,
				remaining: false
			};

			if (currentLogicTag) {

				currentLogicTag = currentLogicTag[0];

				switch (currentLogicTag) {

					// Context Logic
					case "{{":

						AST.node = "logic";
						AST.type = "context";

						// Grab everything between {{ ... }}
						let context = CONTEXT_REGEXP_EXTRACTOR.exec(matchLogic)[1];

						let thisIndex = context.indexOf("this.");

						// Tack on this to all context
						if (thisIndex === -1) {

							context = "this." + context;
						}
						else if (thisIndex > 0) {

							reject("This is a problem, this. should only be found in the beginning of a context");
						}

						AST.context = context;

						// Append the expected AST
						endResult.AST = AST;

						endResult.remaining = remaining;

						break;

					// Block Logic
					case "{{#":

						AST.node = "logic";
						AST.type = "block";

						console.log("Block Logic");

						let context = BLOCKParser(fullTemplate, matchLogic);


						break;

					case "{{.":

						console.log("Helper Control called");
						break;

					case "{{@":

						console.log("Event Binding Control called");
						break;

					case "{{>":

						console.log("Partial Control called");
						break;

					default:

						let err = new Error("Undefined logical control: ", currentLogicTag);
						break;
				}

				resolve(endResult);
			}
			else {

				reject(new Error(`Unable to find logic control in: ${templateObj.name}`));
			}


		});
	};

	function check(template) {

		return new Promise((resolve, reject) => {

			let check = LOGIC_TAGREG.exec(template);

			if (check) {

				let results = {
					source: "logic",
					parser: parse,
					results: check
				};

				resolve(results);

			}

			resolve(false);
		});

	};

	function registerHelpers(oHelpers) {
		Helpers = oHelpers;
	}

	return {
		check: check,
		parse: parse,
		registerHelpers: registerHelpers
	};

}

module.exports = exports = new Parser();