'use strict';

const HTML_TAGREGEX = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g;
const LOGIC_TAGREGEX = /{{([^\}}]+)}}/;
const TEXT_REGEX = /.+/;

const findNonTextNodes = (reTemplateResults) => {

	let sTemplate = reTemplateResults.input;

	// Check to see if HTML or logic sections exist

	console.log(sTemplate);

	return false;

}

var TextParser = function _text_parser() {

	// This is the parser for this type of template contents.
	const parser = (reTemplateResults) => {

		let textResults = findNonTextNodes(reTemplateResults);

		let oEndResults = {
			oAST: false,
			sChildren: false,
			sRemaining: false
		};

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