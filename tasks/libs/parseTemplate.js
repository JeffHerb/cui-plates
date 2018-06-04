'use strict';

var _priv = {};

const HTML_CHECK_CHAR = '<';
const HTML_TAGREGEX = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/;

const TEMPLATE_CHECK_CHAR = '{';
const TEMPLATE_REGEX = "";

_priv.stripChars = (template) => {

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

_priv.walkTemplate = (template) => {

	var AST = {};

	// Start by getting the first character of the string.
	let firstChar = template.charAt(0);

	if (firstChar === HTML_CHECK_CHAR) {

		console.log("Found a html element");

		// Parce what we have using the html regex
		var breakdown = HTML_TAGREGEX.exec(template);

		// HTML starts at index
		let startIdx = breakdown.index;


		console.log(breakdown);

	}
	else if (firstChar === TEMPLATE_CHECK_CHAR) {

		console.log("Found a templating set");
	}
	else {

		console.log("Found something!!!");
	}

	return AST;

}

var parseTemplate = function _parseTemplate() {

	function parse(template) {

		// Make a copy of the template just in case.
		const ORIG_TEMP = template;

		// Clean up the template first.
		//template = _priv.stripChars(template);

		// Now call the AST walk function.
		var newAST = _priv.walkTemplate(template);

		return template;
	}

	return {
		parse: parse
	};

};

module.exports = exports = new parseTemplate();