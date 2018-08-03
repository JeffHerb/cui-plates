'use strict';

const LOGIC_TAGREGEX = /[{]{2}(?:[\#\.\@\>]?[^\}]+)[}]{2}/g;
const LOGIC_TAG_CONTENTS_REGEX = /\((?:(.*?))\)|(?:[a-zA-Z0-9\.\=\!\<\>\&\|\"\']+)/g;

const LOGIC_TAGS = {
	"{{": {
		fProcess: (reTemplateResults) => {

			let oLogicSection = {
				sMethod: false,
				oOpening: {
					sTag: false,
					iStart: false,
					iEnd: false
				},
				oClosing: {
					sTag: false,
					iStart: false,
					iEnd: false
				}
			};

			let oAST = {
				node: "context",
				tag: false,
				text: false
			};

			let oEndResult = {
				oAST: false,
				sChildren: false,
				sRemaining: false
			};

			const LOGIC_CONTEXT_OPEN_TAG_REGEX = /\{{2}/g;
			const LOGIC_CONTEXT_CLOSE_TAG_REGEX = /\}{2}/g;

			// Get everything about this logic section
			let sFullTemplate = reTemplateResults.input;
			let sTriggerString = reTemplateResults[0];

			// Get starting index and remove it from the trigger string
			let iStartIndex = LOGIC_CONTEXT_OPEN_TAG_REGEX.exec(sFullTemplate).index;
			let iEndIndex = false;

			let reLastClosingInstance = false;

			// Find last closing;
			while(true) {

				let reClosingInstance = LOGIC_CONTEXT_CLOSE_TAG_REGEX.exec(sTriggerString);

				if (reClosingInstance) {
					reLastClosingInstance = reClosingInstance;
					continue;
				}

				break;
			}

			if (reLastClosingInstance) {

				// Save off the ending index
				iEndIndex = reLastClosingInstance.index;

				// Save off the start and ends
				oLogicSection.oOpening.sTag = "{{";
				oLogicSection.oOpening.iStart = iStartIndex;
				oLogicSection.oOpening.iEnd = iStartIndex + 2;
				oLogicSection.oClosing.sTag = "}}";
				oLogicSection.oClosing.iStart = iEndIndex;
				oLogicSection.oClosing.iEnd = iEndIndex + 2;

				// Yank out the logic section
				let sContents = sFullTemplate.slice(oLogicSection.oOpening.iEnd, oLogicSection.oClosing.iStart).trim();
				let sRemaining = sFullTemplate.slice(oLogicSection.oClosing.iEnd).trim();

				// Save off any remaining contents if they exist
				if (sRemaining.length) {
					oEndResult.sRemaining = sRemaining;
				}

				// Generate the local AST
				oAST.node = "logic";
				oAST.tag = "context";
				oAST.text = sContents;

				oEndResult.oAST = oAST;

				return oEndResult;
			}
			else {

				let error = new Error(`Template |template.path| was missing the closing tag for a context logic block.`);

				cb(error, false, false);
			}
		}
	},
	"{{#": {
		fProcess: (reTemplateResults) => {

			let oLogicSection = {
				sMethod: false,
				oOpening: {
					sTag: false,
					iStart: false,
					iEnd: false
				},
				oClosing: {
					sTag: false,
					iStart: false,
					iEnd: false
				}
			};

			let oAST = {
				node: "block",
				tag: false,
				conditionals: [],
				fallback: false
			};

			let oEndResult = {
				oAST: false,
				sChildren: false,
				sRemaining: false
			};

			let sFullTemplate = reTemplateResults.input;
			let sBlockTemplate = false;

			// Save off the opening info
			oLogicSection.oOpening.sTag = reTemplateResults[0];
			oLogicSection.oOpening.iStart = reTemplateResults.index;
			oLogicSection.oOpening.iEnd = reTemplateResults.index + oLogicSection.oOpening.sTag.length;

			// Take off the openining tag
			let sRemaining = sFullTemplate.slice(oLogicSection.oOpening.iEnd);

			// No we need to break out the insides of the opening conditional block.
			let aBlockConditionals = oLogicSection.oOpening.sTag.match(LOGIC_TAG_CONTENTS_REGEX);

			// Get the block method
			oLogicSection.sMethod = aBlockConditionals.shift();

			// generate closing tag regular expression
			let reClosingBlock = new RegExp(`\{{2}[\/\#]${oLogicSection.sMethod}`, 'g');
			let iSameBlockOpen = 0;
			let iEndingTagCount = 0;
			let reEndingBlockTag = false;

			// Loop till we get the ending tag or find the end for this block type
			while(true) {

				let nextBlockTag = reClosingBlock.exec(sRemaining);

				if (!nextBlockTag) {
					break;
				}

				// Check to see if this is an opening tag
				if (nextBlockTag[0].indexOf('#') !== -1) {

					iSameBlockOpen += 1;
				}
				else {

					iEndingTagCount += 1;

					if (iSameBlockOpen >= 1) {
						iSameBlockOpen -= 1;
					}
					else {

						reEndingBlockTag = nextBlockTag;
						break;
					}

				}

			}

			// If we found an ending tag
			if (reEndingBlockTag) {

				// Create a regular expression to get all the matching ending tags in general
				let reFullClosingTag = new RegExp(`\{{2}\/${oLogicSection.sMethod}[ ]*\}{2}`, 'g');
				let reFullEndingBlockTag = false;
				let bPastEndingIndex = false;

				// Loop through each ending tag this time finding the full ending tag.
				while(true) {

					let nextEndingBlockTag = reFullClosingTag.exec(sRemaining);

					if (!nextEndingBlockTag) {
						break;
					}

					if (nextEndingBlockTag.index === reEndingBlockTag.index) {
						reFullEndingBlockTag = nextEndingBlockTag;
						break;
					}
					// check if we some how went too far.
					else if (nextEndingBlockTag.index > reEndingBlockTag.index ) {
						bPastEndingIndex = true;
					}

				}

				// If we got the full ending block!
				if (reFullEndingBlockTag) {

					// Save off all the ending tag information
					oLogicSection.oClosing.sTag = reFullEndingBlockTag[0];
					oLogicSection.oClosing.iStart = reFullEndingBlockTag.index;
					oLogicSection.oClosing.iEnd = reFullEndingBlockTag.index + reFullEndingBlockTag[0].length;

					// Split the proper block template string from the rest

					sBlockTemplate = sRemaining.slice(0, oLogicSection.oClosing.iStart);
					sRemaining = sRemaining.slice(oLogicSection.oClosing.iEnd);

				}
				else {

					let error = new Error(`Template |template.path| Ending tag not properly closed or contains additional invalid characters.`);

					return error;
				}


			}
			else {

				let error = new Error(`Template |template.path| is missing the closing block tag for ${oLogicSection.oOpening.sTag}`);

				return error;
			}

		}
	},
	"{{@": {
		fProcess: () => {
			console.log("Attribute Logic");
		}
	},
	"{{.": {
		fProcess: () => {
			console.log("Helper Logic");
		}
	},
};

const LOGIC_TAG_OPENINGS = Object.keys(LOGIC_TAGS);

var LogicParser = function _logic_parser() {

	// This is the parser for this type of template contents.
	const parser = (reTemplateResults) => {

		// Get everything about this logic section
		let sTriggerString = reTemplateResults[0];

		// Pull out the opening tag to determine what logic type we have
		let sOpeningTag = sTriggerString.slice(reTemplateResults.index, reTemplateResults.index + 3).trim();

		let fLogicProcessor = false;

		// Loop through and see if we can get the right processor.
		for (let i = 0, len = LOGIC_TAG_OPENINGS.length; i < len; i++) {

			if (LOGIC_TAG_OPENINGS[i] === sOpeningTag) {
				fLogicProcessor = LOGIC_TAGS[LOGIC_TAG_OPENINGS[i]].fProcess;
				break;
			}

		}

		// VErify we have some type of logic processor
		if (typeof fLogicProcessor === "function") {

			let oEndResult = fLogicProcessor(reTemplateResults);

			if (oEndResult instanceof Error) {

				return oEndResult;
			}

			return oEndResult;

		}
		else {

			let error = new Error(`Template |template.path| contained the folllowing logic tag "${sOpeningTag}". This tag does not match any known processing function syntax.`);

			return error;
		}

	};

	// Function is used to determine if the provided template string has contents that this parser can handle.
	const check = (sTemplate) => {

		let reLogic = LOGIC_TAGREGEX.exec(sTemplate);

		if (reLogic) {

			let result = {
				sSource: "logic",
				fParser: parser,
				reCheck: reLogic
			};

			return result;
		}

		return false;

	};

	return {
		check: check,
		parser: parser,
	}

}

module.exports = exports = new LogicParser();