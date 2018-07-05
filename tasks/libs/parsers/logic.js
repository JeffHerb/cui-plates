'use strict';

const LOGIC_TAGREG = /{{([^\}}]+)}}/;

const LOGIC_OPENING_TAGREG = /^{{(?:[\#\>\.\@]?)/g;
const LOGIC_CLOSING_TAGREG = /}}/g;

const LOGIC_INLINE_HELPER_REG = /(?:[a-zA-Z]+)={{(?:.*)}}/g;
const LOGIC_SIMPLE_PARAMETERS_REG = /((?:[a-zA-Z]*)="(?:.*)")|[^\s]+/g;

// Regular expression for {{else}}, {{case}}, {{elseif}}, {{default}}
const LOGIC_CONDITIONAL_BLOCK_SEPERATORS = /(?:{{\s*)(else|elseif|case)[^{]*(?=}})(?:}})/g;

const CONTEXT_REGEXP_EXTRACTOR = /{{((?:\\.|[^"\\])*)}}/;

const BLOCKParser = (fullTemplate, match) => {

	let endContext = {
		method: false,
		conditionalBlocks: false,
		failBlock: false
	};

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

	// Now we need to find the block level tag being used.
	let inlineHelpersCheck = LOGIC_INLINE_HELPER_REG.exec(trimedOpeningTag);

	// Check for inlineHelpers, if they exist strip them out
	if (inlineHelpersCheck) {

		console.log("Write the inline helper parser!!!");
	}

	let simpleParams = trimedOpeningTag.match(LOGIC_SIMPLE_PARAMETERS_REG);

	let blockTag = simpleParams.shift().replace('#', '').trim();

	endContext.method = blockTag;

	// Now we need to find the end of this current logic block;
	let sameLogicTagRegEx = new RegExp(`{{(?:[#\/]+)${blockTag}`, 'gm');

	let foundMatchingOpening = 0;
	let endingIndexResults = false;
	let endingIndex = false;

	// Loop through till we find the logical closing tag
	while (true) {

		let nextLogicTag = sameLogicTagRegEx.exec(remainingTemplates);

		if (!nextLogicTag) {
			break;
		}

		// check if this is a closing tag
		if (nextLogicTag[0].indexOf(`{{/`) !== -1) {

			if (foundMatchingOpening > 0) {

				foundMatchingOpening -= 1;
			}
			else {

				endingIndex = nextLogicTag.index + nextLogicTag[0].length;
				endingIndexResults = nextLogicTag;
			}
		}
		else {

			// We got a opening tag, just found it.
			foundMatchingOpening += 1;
		}
	}

	if (endingIndex) {

		// Find this logic section.
		let logicSection = remainingTemplates.slice(0, endingIndex - endingIndexResults[0].length);

		// Holds all the case and elseif's
		let conditionalBlocks = [];

		// Holds all the else and default's
		let failBlock = false;

		let savedFirst = false;
		let foundFailureTag = false;

		let lastConditionalTagEnding = 0;
		let lastConditionalTag = false;

		// Loop through and break out all the blocks
		while (true) {

			let conditionalObj = {
				params: false
			};

			// Check to see if any conditional block tags exists (else, elseif, case, default)
			let currentBlockSeporator = LOGIC_CONDITIONAL_BLOCK_SEPERATORS.exec(logicSection);

			if (!currentBlockSeporator) {

				console.log("At the end");

				conditionalObj.contents = logicSection.slice(lastConditionalTagEnding);

				// Check for sub logic block;
				let subLogicBlock = LOGIC_OPENING_TAGREG.test(conditionalObj.contents);

				console.log("SubLogicBlock", subLogicBlock);

				if (subLogicBlock) {
					console.log(conditionalObj.contents);
					continue;
				}
				else {
					console.log(conditionalObj.contents);
				}

				if (lastConditionalTag) {

					// Remove the uneeded logic tag characters
					let trimmedConditionalTag = lastConditionalTag.replace('{{', '').replace('}}', '');

					trimmedConditionalTag = trimmedConditionalTag.match(LOGIC_SIMPLE_PARAMETERS_REG);

					// Pop off the leading item as its the static conditional tag
					trimmedConditionalTag.shift();

					if (trimmedConditionalTag.length) {
						conditionalObj.params = trimmedConditionalTag;
					}
				}

				if (!savedFirst && logicSection.length) {

					conditionalBlocks.push(conditionalObj);
				}
				else if (savedFirst && !foundFailureTag) {

					conditionalBlocks.push(conditionalObj);
				}
				else if (foundFailureTag) {

					failBlock = conditionalObj;
				}

				break;
			}
			else {

				// Save off the contents
				conditionalObj.contents = logicSection.slice(lastConditionalTagEnding, currentBlockSeporator.index);

				// Check for sub logic block;
				let subLogicBlock = LOGIC_OPENING_TAGREG.test(conditionalObj.contents);

				console.log("SubLogicBlock", subLogicBlock);

				if (subLogicBlock) {
					console.log(conditionalObj.contents);
					continue;
				}
				else {
					console.log(conditionalObj.contents);
				}

				// Check to see if this is the first time around
				if (!savedFirst) {
					savedFirst = true;

					if (simpleParams.length) {
						conditionalObj.params = simpleParams;
					}
				}
				else {

					if (lastConditionalTag) {

						// Remove the uneeded logic tag characters
						let trimmedConditionalTag = lastConditionalTag.replace('{{', '').replace('}}', '');

						trimmedConditionalTag = trimmedConditionalTag.match(LOGIC_SIMPLE_PARAMETERS_REG);

						// Pop off the leading item as its the static conditional tag
						trimmedConditionalTag.shift();

						if (trimmedConditionalTag.length) {
							conditionalObj.params = trimmedConditionalTag;
						}
					}
				}

				// Save off this conditional block!
				conditionalBlocks.push(conditionalObj);

				// Save off the index of the last conditional tag for the next round.
				lastConditionalTagEnding = currentBlockSeporator.index + currentBlockSeporator[0].length;

				// Save off this conditional tag
				lastConditionalTag = currentBlockSeporator[0];

				// Check to see if this is the fallback/fail block
				// For switch
				if (currentBlockSeporator[0].indexOf('default') > 0) {
					foundFailureTag = true;
				}
				// For if
				else if (currentBlockSeporator[0].indexOf('else') > 0 && currentBlockSeporator[0].indexOf('elseif') === -1) {
					foundFailureTag = true;
				}

			}


		}

		endContext.conditionalBlocks = conditionalBlocks.concat();
		endContext.failBlock = failBlock;

	}
	else {

		return false;
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

						AST.context = BLOCKParser(fullTemplate, matchLogic);

						console.log(AST.context);

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
	}

	return {
		check: check,
		parse: parse,
		registerHelpers: registerHelpers
	};

}

module.exports = exports = new Parser();