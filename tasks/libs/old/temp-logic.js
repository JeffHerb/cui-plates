'use strict';

const LOGIC_TAGREG = /{{([^\}}]+)}}/;

const LOGIC_OPENING_TAGREG = /^{{(?:[\#\>\.\@]?)/g;
const LOGIC_CLOSING_TAGREG = /}}/g;

const LOGIC_INLINE_HELPER_REG = /(?:[a-zA-Z]+)={{(?:.*)}}/g;
const LOGIC_PARAMETERS_REG = /(?:[a-zA-Z0-9]*)=\((?:[^)]+)\)|(?:[a-zA-Z0-9]*)=\"(?:[^)]+)\"|(?:[a-zA-Z0-9]*)=(?:[^\s]+)|(?:[\S]+)/g;

// Regular expression for {{else}}, {{case}}, {{elseif}}, {{default}}
const LOGIC_CONDITIONAL_BLOCK_SEPERATORS = /(?:{{\s*)(else|elseif|case)[^{]*(?=}})(?:}})/g;

const CONTEXT_REGEXP_EXTRACTOR = /{{((?:\\.|[^"\\])*)}}/;

const BLOCKParser = (fullTemplate, logicObj) => {

	console.log("\n\n\n");

	// This function captures the current logic section and all its sub conditionals and children blocks.
	function getLogicSection(fullTemplate, logicObj, sub) {

		if (sub) {
			console.log("\nIn sub:");
			console.log(fullTemplate);
			console.log(logicObj);
		}

		let oLogicSection = {
			oOpening: {
				iStart: logicObj.index,
				iEnd: logicObj.index + logicObj[0].length
			},
			oClosing: {
				iStart: false,
				iEnd: false
			},
			sConditionalTag: false,
			sBlockTag: false,
			aParams: false,
		};

		// Start by removing the starting tag from the template at the detected position (likely 0);
		let slogicSection = fullTemplate.slice(logicObj.index + logicObj[0].length);

		oLogicSection.sConditionalTag = logicObj[0];

		let aTagsnParameters = logicObj[0].slice(2, -2).match(LOGIC_PARAMETERS_REG);

		// Get the tagname out so we know what to target
		let sBlockTag = aTagsnParameters.shift().replace('#', '');

		console.log("sBlockTag:", sBlockTag);

		oLogicSection.sBlockTag = sBlockTag;

		if (aTagsnParameters.length) {
			oLogicSection.aParams = aTagsnParameters;
		}

		let reBlockTag = new RegExp(`{{(?:[#\/]+)${sBlockTag}`, 'gm');

		let iMatchingOpeningTag = 0;
		let oEndingBlockTag = false;

		while (true) {

			let nextBlockLogicTag = reBlockTag.exec(slogicSection);

			if (!nextBlockLogicTag) {
				break;
			}

			let currentTag = nextBlockLogicTag[0];

			// Check to see if this is an opening tag
			if (currentTag.indexOf('#') !== -1) {

				iMatchingOpeningTag += 1;
			}
			else {

				if (iMatchingOpeningTag >= 1) {

					iMatchingOpeningTag -= 1;
				}
				else {

					oEndingBlockTag = nextBlockLogicTag;
					break;
				}

			}
		}

		if (oEndingBlockTag) {

			let oMatchingClosingTag = false;

			// Loop through all the closing tags finding the actual closing tag closing }}.
			while(true) {

				let oClosingBlockTag = LOGIC_CLOSING_TAGREG.exec(slogicSection);

				if (!oClosingBlockTag) {
					break;
				}

				if (oClosingBlockTag.index > oEndingBlockTag.index)  {
					oMatchingClosingTag = oClosingBlockTag;
					break;
				}

			}

			//console.log(oMatchingClosingTag);

			if (oMatchingClosingTag) {

				// Save off the index of where the closing tag starts
				oLogicSection.oClosing.iStart = oEndingBlockTag.index;

				// Save off the index of where the closing tag ends
				oLogicSection.oClosing.iEnd = oMatchingClosingTag.index + oMatchingClosingTag[0].length;

				return oLogicSection;
			}
			else {

				return false;
			}

			return oLogicSection;
		}

		return false;
	};

	let endContext = {
		method: false,
		conditionalBlocks: false,
		failBlock: false,
		remaining: false
	};

	// Get the logic section meta data
	let oLogicSection = getLogicSection(fullTemplate, logicObj);

	console.log("oLogicSection", oLogicSection);

	// Now that we have the metadata get the full working section strings
	let fullLogicSection = fullTemplate.slice(oLogicSection.oOpening.iStart, oLogicSection.oClosing.iEnd + oLogicSection.sConditionalTag.length );
	let afterLogicSection = fullTemplate.slice(oLogicSection.oClosing.iEnd + oLogicSection.sConditionalTag.length);
	let logicSection = fullTemplate.slice(oLogicSection.oOpening.iEnd, oLogicSection.oClosing.iStart + oLogicSection.sConditionalTag.length );

	// Variables keep track of conditional.
	let lastConditional = oLogicSection.sConditionalTag;
	let lastConditionalTag = oLogicSection.sBlockTag;
	let lastConditionalParams = oLogicSection.aParams;
	let lastConditionalSectionIndex = 0;

	// Additional tracking variables to help when sub conditional exist.
	let subConditionalFound = false;
	let subConditionalEndingIndex = 0;

	// Storage array for all conditionals.
	let conditionalBlocks = [];
	let finalFallbackBlock = false;

	// Loop through and check for conditionals at this level.
	while(true) {

		console.log("Starting index:", lastConditionalSectionIndex);

		let nextConditonalBlockTag = LOGIC_CONDITIONAL_BLOCK_SEPERATORS.exec(logicSection);
		let subConditionalLogicSection = false;
		let logicBlockCheck = false;

		let oConditional = {
			sBlockTag: false,
			aParams: false,
			sContents: false
		}

		// Check to see if a conditional tag was found.
		if (nextConditonalBlockTag) {

			console.log("Found sub conditional section");
			console.log("slice", lastConditionalSectionIndex, nextConditonalBlockTag.index);
			subConditionalLogicSection = logicSection.slice(lastConditionalSectionIndex, nextConditonalBlockTag.index);

			console.log("Sub:",subConditionalLogicSection);

			// Need to do a check to see if there is a subLogic opening tag
			logicBlockCheck = LOGIC_TAGREG.exec(subConditionalLogicSection);

			// Check to see if the logic block has sub logic.
			if (!logicBlockCheck) {

				console.log("No logic was found");

				oConditional.sBlockTag = lastConditionalTag;
				oConditional.aParams = lastConditionalParams;
				oConditional.sContents = subConditionalLogicSection;

				// Break out the conditional
				let aTagsnParameters = nextConditonalBlockTag[0].slice(2, -2).match(LOGIC_PARAMETERS_REG);

				let sConditionalBlockTag = aTagsnParameters.shift();
				let aParams = aTagsnParameters;

				// Push this conditional block onto the array.
				conditionalBlocks.push(oConditional);

				console.log("next conditional index:", nextConditonalBlockTag.index);

				// We dont have anything logic related here...
				lastConditional = nextConditonalBlockTag[0];
				lastConditionalTag = sConditionalBlockTag;
				lastConditionalParams = aParams;
				lastConditionalSectionIndex = nextConditonalBlockTag.index + nextConditonalBlockTag[0].length;

			}
			else {

				//logicBlockCheck.index = lastConditionalSectionIndex;

				console.log("\n\nSubLogicSection:");
				console.log(logicBlockCheck);

				let subLogicSection = logicSection.slice(lastConditionalSectionIndex, logicSection.length);

				console.log("\nCurrent SubLogic Section!");
				console.log(subLogicSection);
				console.log("\n");

				// Since we have internal logic, we need to figure out what we need and dont need, ie find the ending wrapper.
				let oSubLogicSection = getLogicSection(subLogicSection, logicBlockCheck, true);

				console.log("\n");
				console.log(oSubLogicSection);

				// we found another inner logic tag, so they might be related.
				continue;
			}
			
		}
		else {

			subConditionalLogicSection = logicSection.slice(lastConditionalSectionIndex, logicSection.length);

			break;
		}


		console.log("\n");

	}

	return endContext;

};

let Helpers = false;

var Parser = function _html_parser() {

	function parse(template, templateObj, mainParser) {

		return new Promise(async (resolve, reject) => {

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

				let context = false;

				switch (currentLogicTag) {

					// Context Logic
					case "{{":

						AST.node = "logic";
						AST.type = "context";

						// Grab everything between {{ ... }}
						context = CONTEXT_REGEXP_EXTRACTOR.exec(matchLogic)[1];

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

						resolve(endResult);

						break;

					// Block Logic
					case "{{#":

						AST.node = "logic";
						AST.type = "block";

						console.log(AST);

						AST.context = BLOCKParser(fullTemplate, template);

						// Generate the fail block
						AST.context.failBlock.contents = await mainParser.parse(AST.context.failBlock.contents);

						let parsedConditionals = [];

						for (let cb = 0, cbLen = AST.context.conditionalBlocks.length; cb < cbLen; cb++) {

							let conditionalObj = AST.context.conditionalBlocks[cb];

							conditionalObj.contents = await mainParser.parse(AST.context.conditionalBlocks[cb].contents);

							parsedConditionals.push(conditionalObj);

						}

						AST.context.conditionalBlocks = parsedConditionals;

						endResult.AST = AST;

						resolve(endResult);

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
	};

	return {
		check: check,
		parse: parse,
		registerHelpers: registerHelpers
	};

}

module.exports = exports = new Parser();