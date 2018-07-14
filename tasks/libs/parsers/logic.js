'use strict';

const LOGIC_TAGREGEX = /[{]{2}(?:[\#\.\@\>]?[^\}]+)[}]{2}/g;

const LOGIC_TAG_OPENINGS = [
	'{{', // Context
	'{{#', // Block
	'{{.', // Helper
	'{{>' // Partial
]

const LogicSection = (reTemplateResults) => {

	let oLogicSection = {
		sMethod: false,
		oOpening: {
			sTag: false
			iStart: false,
			iEnd: false
		},
		oClosing: {
			sTag: false,
			iStart: false,
			iEnd: false
		}
	};

	// Get everything about this logic section
	let sFullTemplate = reTemplateResults.input;
	let sTriggerString = reTemplateResults[0];

	let openingTag = sTriggerString.slice(reTemplateResults.index, reTemplateResults.index + 3);

	console.log(openingTag);

	console.log(reTemplateResults);

};

var LogicParser = function _logic_parser() {

	// This is the parser for this type of template contents.
	const parser = (reTemplateResults) => {

		let oEndResult = {
			oAST: false,
			sChildren: false,
			sRemaining: false
		};

		let oAST = {
			node: false,
			type: false,
			content: false
		};

		// Yank out the triggering string
		let sTriggerString = reTemplateResults[0];

		let oLogicSection = LogicSection(reTemplateResults);

		return oEndResult;
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