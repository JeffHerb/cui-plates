'use strict';

const LOGIC_TAGREG = /{{([^\}}]+)}}/;

const LOGIC_OPENING_TAGREG = /^{{(?:[\#\>\.\@]?)/g;
const LOGIC_CLOSING_TAGREG = /}}/g;

const LOGIC_OPENING_LOGIC_TAGS = /{{#(?:[a-zA-Z0-9]+)(?:[\s\ a-zA-Z-9\.\=\"\'\!\&\|\*\@\#]*)}}/g;

const LOGIC_INLINE_HELPER_REG = /(?:[a-zA-Z]+)={{(?:.*)}}/g;
const LOGIC_PARAMETERS_REG = /(?:[a-zA-Z0-9]*)=\((?:[^)]+)\)|(?:[a-zA-Z0-9]*)=\"(?:[^)]+)\"|(?:[a-zA-Z0-9]*)=(?:[^\s]+)|(?:[\S]+)/g;

// Regular expression for {{else}}, {{case}}, {{elseif}}, {{default}}
const LOGIC_CONDITIONAL_BLOCK_SEPERATORS = /(?:{{\s*)(default|else|elseif|case)[^{]*(?=}})(?:}})/g;

const CONTEXT_REGEXP_EXTRACTOR = /{{((?:\\.|[^"\\])*)}}/;

const BLOCKParser = (logicRegExResult) => {

	function findLogicBlockDef(regExBlockMatch) {

		console.log("\n\n\n === find logic ===");

		let oLogicBlockResults = {
			oOpenTag: {
				iBegin: false,
				iEnd: false,
			},
			oCloseTag: {
				iBegin: false,
				iEnd: false
			}
		};

		// Save off opening tag info.
		oLogicBlockResults.oOpenTag.iBegin = regExBlockMatch.index;
		oLogicBlockResults.oOpenTag.iEnd = regExBlockMatch.index + regExBlockMatch[0].length;

		let fullTemplate = regExBlockMatch.input;

		let sOpeningBlockTag = regExBlockMatch[0];

		let aTagNParameters = sOpeningBlockTag.slice(2, -2).match(LOGIC_PARAMETERS_REG);

		console.log(regExBlockMatch);

		// Pop the logic method tag off the front
		let sBlockTagMethod = aTagNParameters.shift();

		if (sBlockTagMethod.indexOf('#') > -1) {
			sBlockTagMethod = sBlockTagMethod.replace('#', '');
		}

		let regExSameLogicTag = new RegExp(`{{[\#\/]${sBlockTagMethod}(?:[\s\ a-zA-Z-9\.\=\"\'\!\&\|\*\@\#]*)}}`, 'g');

		let sameBlockTag = 0;
		let endingBlockTag = false;

		while(true) {

			let nextBlockTag = regExSameLogicTag.exec(fullTemplate);

			if (!nextBlockTag) {
				break;
			}

			// Check to make sure this tag does not match the original
			if (nextBlockTag.index === regExBlockMatch.index) {
				continue;
			}
			else {

				if (nextBlockTag[0].indexOf('{{#') !== -1) {

					sameBlockTag += 1;
				}
				else {

					if (sameBlockTag >= 1) {

						sameBlockTag -= 1;
					}
					else {

						endingBlockTag = nextBlockTag;
						//break;
					}

				}
			}

		}

		if (endingBlockTag) {

			oLogicBlockResults.oCloseTag.iBegin = endingBlockTag.index;
			oLogicBlockResults.oCloseTag.iEnd = endingBlockTag.index + endingBlockTag[0].length;

			return oLogicBlockResults;

			console.log("\n\n\n === find logic end ===");
		}
		else {

			let error = new Error(`Unable to find closing tag for {{#${sBlockTagMethod}`);

			return error;

			console.log("\n\n\n === find logic end ===");
		}



	};

	// Return object
	let endContents = {
		conditionals: false,
		fallback: false,
		remaining: false
	};

	// Pull out the full template
	let sFullTemplate = logicRegExResult.input;

	let oLogicBlockDef = findLogicBlockDef(logicRegExResult);

	// Break out the logic block section and any potential remaining.
	let sLogicSection = sFullTemplate.slice(oLogicBlockDef.oOpenTag.iBegin, oLogicBlockDef.oCloseTag.iEnd);
	let sRemaining = sFullTemplate.slice(oLogicBlockDef.oCloseTag.iEnd);

	// Pull off the closing and opening tags for reference
	let sClosingTag = sLogicSection.slice( (oLogicBlockDef.oCloseTag.iEnd - oLogicBlockDef.oCloseTag.iBegin) * -1 );
	let sOpeningTag = sLogicSection.slice(oLogicBlockDef.oOpenTag.iBegin, oLogicBlockDef.oOpenTag.iEnd);

	// Get a copy of the template string without this logic blocks opening and closing tag.
	let sLogicSectionsContents = sLogicSection.slice(oLogicBlockDef.oOpenTag.iEnd, oLogicBlockDef.oCloseTag.iBegin);

	// Save off the remaining sections of the template if any exist
	if (sRemaining.length) {
		endContents.remaining = sRemaining;
	}

	let aOpeningTagParams = sOpeningTag.slice(2, -2).match();
	let sOpeningTagMethod = aOpeningTagParams.shift(LOGIC_PARAMETERS_REG);

	// Prebake the last conditionals with the opening tag
	let lastConditionalTag = sOpeningTag;
	let lastConditionalParams = aOpeningTagParams;
	let lastConditionalMethod = sOpeningTagMethod;
	let lastConditionalStartingIndex = 0;

	let aConditionalBlocks = [];
	let oFallback = false;

	// Loop through and find all of the conditional possibility
	while(true) {

		let sConditionalSectionContent = false;

		let oConditionalBlock = {
			sLogicTag: false,
			aParams: false,
			sContents: false,
		};

		let nextConditionalBlock = LOGIC_CONDITIONAL_BLOCK_SEPERATORS.exec(sLogicSectionsContents);

		// See if we detected a conditional block
		if (nextConditionalBlock) {

			// Start by pulling out the conditional section content;
			sConditionalSectionContent = sLogicSectionsContents.slice(lastConditionalStartingIndex, nextConditionalBlock.index);

			// Now we need to test to see if the conditonal block has internal logic.
			let subLogicCheck = LOGIC_OPENING_LOGIC_TAGS.exec(sConditionalSectionContent);

			if (subLogicCheck) {

				//console.log("\n ========== sub =============");

				// Find the end of this discovered conditional
				let remainingTemplate = sLogicSectionsContents.slice(lastConditionalStartingIndex);

				// Update input to reflect remaining template
				subLogicCheck.input = remainingTemplate;

				// Get the sub logic block definition info
				let oSubLogicBlockDef = findLogicBlockDef(subLogicCheck);

				// We have a sub condtional. Lets see were we are at.
				// console.log("End of last conditional:", lastConditionalStartingIndex);
				// console.log("Start of current sub conditional:", nextConditionalBlock.index);
				// console.log("End of current sub conditional block:", oSubLogicBlockDef.oCloseTag.iEnd + lastConditionalStartingIndex);

				let iEndOfSubConditionalBlockTag = oSubLogicBlockDef.oCloseTag.iEnd + lastConditionalStartingIndex;

				if (nextConditionalBlock.index >= iEndOfSubConditionalBlockTag) {

					// Update the section contents with the next index values
					sConditionalSectionContent = sLogicSectionsContents.slice(lastConditionalStartingIndex, iEndOfSubConditionalBlockTag);

					// console.log("\n Update Sub Section:");
					// console.log(sConditionalSectionContent);

					oConditionalBlock.sLogicTag = lastConditionalMethod;
					oConditionalBlock.aParams = lastConditionalParams;
					oConditionalBlock.sContents = sConditionalSectionContent;

					// Cleanup 
					let sConditionalTag = nextConditionalBlock[0].slice(2, -2);
					let aConditionalTagParams = sConditionalTag.match(LOGIC_PARAMETERS_REG);
					let sCondtionalMethod = aConditionalTagParams.shift();

					// Update the last conditional info
					lastConditionalTag = sConditionalTag;
					lastConditionalMethod = sCondtionalMethod;
					lastConditionalParams = aConditionalTagParams;
					lastConditionalStartingIndex = nextConditionalBlock.index + nextConditionalBlock[0].length;

					//console.log(" ========== sub ============= \n");
				}
				else {

					//console.log(" ========== sub ============= \n");
					// We need to keep looking as sub logic conditional was found
					continue;
				}

				//console.log(sLogicSectionsContents.slice(lastConditionalStartingIndex, ))

			}
			else {

				// Save of block information!
				oConditionalBlock.sLogicTag = lastConditionalMethod;
				oConditionalBlock.aParams = lastConditionalParams;
				oConditionalBlock.sContents = sConditionalSectionContent;

				// Cleanup 
				let sConditionalTag = nextConditionalBlock[0].slice(2, -2);
				let aConditionalTagParams = sConditionalTag.match(LOGIC_PARAMETERS_REG);
				let sCondtionalMethod = aConditionalTagParams.shift();

				// Update the last conditional info
				lastConditionalTag = sConditionalTag;
				lastConditionalMethod = sCondtionalMethod;
				lastConditionalParams = aConditionalTagParams;
				lastConditionalStartingIndex = nextConditionalBlock.index + nextConditionalBlock[0].length;
			}

			// Update the last conditional information
			aConditionalBlocks.push(oConditionalBlock);

		}
		else {

			// Pull the last of or all of the template because we have nothing else to look at.
			sConditionalSectionContent = sLogicSectionsContents.slice(lastConditionalStartingIndex, sLogicSectionsContents.length);

			oConditionalBlock.sLogicTag = lastConditionalMethod;
			oConditionalBlock.aParams = lastConditionalParams;
			oConditionalBlock.sContents = sConditionalSectionContent;

			if (lastConditionalTag === "else" || lastConditionalTag === "default") {
				oFallback = oConditionalBlock;
			}
			else {
				aConditionalBlocks.push(oConditionalBlock);
			}

		}

		// Check to see if we found anything
		if (!nextConditionalBlock) {
			break;
		}


	}

	endContents.conditionals = aConditionalBlocks.concat();

	if (oFallback) {
		endContents.fallback = oFallback;
	}

	return endContents;
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
						AST.type = "block"

						// Generate the block contents
						AST.context = BLOCKParser(template);

						console.log(AST.context);

						// Generate the fail block
						if (AST.context.fallback.sContents){
							AST.context.fallback = await mainParser.parse(AST.context.fallback.sContents);
						}

						console.log("AST context fallback: finished");

						let parsedConditionals = [];

						for (let cb = 0, cbLen = AST.context.conditionals.length; cb < cbLen; cb++) {

							let conditionalContents = AST.context.conditionals[cb].sContents;

							console.log("contents:", conditionalContents);

							conditionalContents = await mainParser.parse(AST.context.conditionals[cb].sContents);

							parsedConditionals.push(conditionalContents);

						}

						AST.context.conditionals = parsedConditionals;

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

				// console.log("current tag error");

				// console.log(currentLogicTag);

				// console.log(fullTemplate);

				// console.log(matchLogic);

				// console.log(remaining);

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