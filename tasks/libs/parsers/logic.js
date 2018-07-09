'use strict';

const LOGIC_TAGREG = /{{([^\}}]+)}}/;

const LOGIC_OPENING_TAGREG = /^{{(?:[\#\>\.\@]?)/g;
const LOGIC_CLOSING_TAGREG = /}}/g;

const LOGIC_INLINE_HELPER_REG = /(?:[a-zA-Z]+)={{(?:.*)}}/g;
const LOGIC_PARAMETERS_REG = /(?:[a-zA-Z0-9]*)=\((?:[^)]+)\)|(?:[a-zA-Z0-9]*)=\"(?:[^)]+)\"|(?:[a-zA-Z0-9]*)=(?:[^\s]+)|(?:[\S]+)/g;

// Regular expression for {{else}}, {{case}}, {{elseif}}, {{default}}
const LOGIC_CONDITIONAL_BLOCK_SEPERATORS = /(?:{{\s*)(else|elseif|case)[^{]*(?=}})(?:}})/g;

const CONTEXT_REGEXP_EXTRACTOR = /{{((?:\\.|[^"\\])*)}}/;

const BLOCKParser = (logicRegExResult) => {

	function findLogicBlockDef(regExBlockMatch) {

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

		console.log("\n\n\nStart ===== Finding Logic Block Def ==========");

		// Save off opening tag info.
		oLogicBlockResults.oOpenTag.iBegin = regExBlockMatch.index;
		oLogicBlockResults.oOpenTag.iEnd = regExBlockMatch.index + regExBlockMatch[0].length;

		let sOpeningBlockTag = regExBlockMatch[0];

		let aTagNParameters = sOpeningBlockTag.slice(2, -2).match(LOGIC_PARAMETERS_REG);

		// Pop the logic method tag off the front
		let sBlockTagMethod = aTagNParameters.shift();

		if (sBlockTagMethod.indexOf('#') > -1) {
			sBlockTagMethod = sBlockTagMethod.replace('#', '');
		}

		console.log(sBlockTagMethod);

		let regExSameLogicTag = new RegExp(`{{(?:[#\/]+)${sBlockTagMethod}`, 'gm');

		let sameBlockTag = 0;
		let endingBlockTag = false;

		while(true) {

			let nextBlockTag = regExSameLogicTag.exec(regExBlockMatch.input);

			console.log(nextBlockTag);

			if (!nextBlockTag) {
				break;
			}

			// Check to make sure this tag does not match the original
			if (nextBlockTag.index === regExBlockMatch.index) {
				continue;
			}
			else {

				if (nextBlockTag[0].indexOf('#') !== -1) {

					sameBlockTag += 1;
				}
				else {

					if (sameBlockTag >= 1) {

						sameBlockTag -= 1;
					}
					else {

						endingBlockTag = nextBlockTag;
						break;
					}

				}
			}

		}

		console.log("Ending block tag:");

		console.log(endingBlockTag);

		console.log("==============================================\n\n");

	};

	// Return object
	let endContents = {
		conditionals: false,
		fallback: false,
		remaining: false
	};

	console.log("\n\n\n");
	console.log(logicRegExResult);

	// Pull out the full template
	let sFullTemplate = logicRegExResult.input;

	let oLogicBlockDef = findLogicBlockDef(logicRegExResult);

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

						AST.context = BLOCKParser(template);

						// Generate the fail block
						// AST.context.failBlock.contents = await mainParser.parse(AST.context.failBlock.contents);

						// let parsedConditionals = [];

						// for (let cb = 0, cbLen = AST.context.conditionalBlocks.length; cb < cbLen; cb++) {

						// 	let conditionalObj = AST.context.conditionalBlocks[cb];

						// 	conditionalObj.contents = await mainParser.parse(AST.context.conditionalBlocks[cb].contents);

						// 	parsedConditionals.push(conditionalObj);

						// }

						// AST.context.conditionalBlocks = parsedConditionals;

						// endResult.AST = AST;

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