'use strict';

const HTML_TAGREGEX = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g;
const LOGIC_TAGREGEX = /[{]{2}(?:[\#\.\@\>]?[^\}]+)[}]{2}/g;
const TEXT_REGEX = /.+/;

const findNonTextNodes = (reTemplateResults) => {

	let oTextMeta = {
		sContents: false,
		sRemaining: false
	};

	let sTemplate = reTemplateResults.input;

	// Check to see if HTML or logic sections exist

	// Run the basic element and logic check
	let reHTMLCheck = HTML_TAGREGEX.exec(sTemplate);
	let reLogicCheck = LOGIC_TAGREGEX.exec(sTemplate);

	// When nothing is found return then the whole input
	if (!reHTMLCheck && !reLogicCheck) {

		oTextMeta.sContents = sTemplate;
	}
	else if (reHTMLCheck && !reLogicCheck) {

		// Get the substring
		oTextMeta.sContents = sTemplate.slice(reTemplateResults.index, reHTMLCheck.index);
		oTextMeta.sRemaining = sTemplate.slice(reHTMLCheck.index);
	}
	else if (!reHTMLCheck && reLogicCheck) {

		// Get the substring
		oTextMeta.sContents = sTemplate.slice(reTemplateResults.index, reLogicCheck.index);
		oTextMeta.sRemaining = sTemplate.slice(reLogicCheck.index);
	}
	else {

	}

	return oTextMeta;

}

var TextParser = function _text_parser() {

	// This is the parser for this type of template contents.
	const parser = (reTemplateResults) => {

		let oTextMeta = findNonTextNodes(reTemplateResults);

		let oEndResults = {
			oAST: false,
			sChildren: false, // Remember text can never have children!
			sRemaining: false
		};

		let oAST = {
			node: "text",
			text: false
		};

		// Save off the string of text
		oAST.text = oTextMeta.sContents;

		if (oTextMeta.sRemaining) {
			oEndResults.sRemaining = oTextMeta.sRemaining;
		}

		oEndResults.oAST = oAST;

		return oEndResults;

	};

	// Function is used to determine if the provided template string has contents that this parser can handle.
	const check = (sTemplate) => {

		// This is a hack to keep everyting consitant when looking at just text.
		let reText = TEXT_REGEX.exec(sTemplate);

		let result = {
			sSrouce: "text",
			fParser: parser,
			reCheck: reText
		};

		return result;
	};

	return {
		check: check,
		parser: parser,
	}

}

module.exports = exports = new TextParser();