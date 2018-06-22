'use strict';

// Get the logic parser
//const LOGICParser = require('./logic');

const HTML_CHECK_CHAR = '<';

// Look for html tag structure "<" followed by name and attributes and ends with ">"
const HTML_TAGREGEX = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/;

// Pulls the tag name out and ignores all attributes
const HTML_TAG_NAME_REGEX = /(?:<[a-zA-Z\-\{\}]*)/;

// Pulls all static attributes as well as inline helpers.
const HTML_ATTRIBUTES_REGEX = /(?:[a-zA-Z\-]*)=(?:"|')(?:[a-zA-Z0-9\.\{\}\(\)\[\]\s\,\'\:\-])*(?:"|')|(?:checked)|(?:selected)|(?:required)|(?:disabled)|(?:multiple)|(?:autofocus)/g

const HTML_SELF_CLOSING = ['input', 'br', 'hr', 'img'];

const LOGIC_CHECK_CHAR = "{{";
const LOGIC_TAGREG = /^{{(?:[>.@#]+)|^{{/;

var Parser = function _html_parser(settings) {

	function parse(currentTag) {

		return new Promise((resolve, reject) => {

			let AST = {};

			// Current template send to parser
			let template = currentTag.input;

			// tag structur variables
			let openingTag = currentTag[0];
			let selfClosed = false;
			let closingTagRegEx = false;

			// Actual tag being requested
			let tagName = false;
			let attributes = [];

			// Storage for additional children and remaining templates siblings
			let childContents = false;
			let remaining = false;

			let dynamicTag = false;

			let inlineHelpera = [];

			let endResult = false;

			// Test if this is a comment first!
			if (openingTag.indexOf('<!--') === -1) {

				AST.node = "elem";

				// Start by yanking out the tagname
				tagName = HTML_TAG_NAME_REGEX.exec(openingTag)[0].replace('<', '');

				let tagNameLogicCheck = LOGIC_TAGREG.exec(tagName);

				if (tagNameLogicCheck) {

					dynamicTag = true;
				}
				else {

					AST.tag = tagName;
				}

				// Identify if this is a self closing element or if its an node containing one.
				if (HTML_SELF_CLOSING.indexOf(tagName) !== -1) {
					selfClosed = true;
				}
				else {

					// The element is not in the self defined self closing list so we need to manualy check
					let sEndingChars = openingTag.slice(openingTag.length - 2);

					// Check to see if this element is self closed
					if (sEndingChars === '/>') {
						selfClosed = true;
					}
				}

				// Place to store the index to the closing part of the template
				let endingIndex = false;

				// Now if this is not a self closing tag it could have children so lets find the ending tag
				if (!selfClosed) {
					closingTagRegEx = new RegExp(`(?:<[\/]?${tagName}\s*[>]?)`, 'gm');

					// Now scan the remaining template looking for the next proper closing tag
					template = template.slice(openingTag.length);

					let foundMatchingOpening = 0;

					// console.log(nextClosingTag);
					while (true) {

						let nextElemTag = closingTagRegEx.exec(template);

						if (!nextElemTag) {
							break;
						}

						// check if this is a closing tag
						if (nextElemTag[0].indexOf(`</${tagName}`) !== -1) {

							if (foundMatchingOpening > 0) {

								foundMatchingOpening -= 1;
							}
							else {

								endingIndex = nextElemTag.index;
							}

						}
						else {

							// We got a opening tag, just found it.
							foundMatchingOpening += 1;
						}

					}

					// Check to see if we have the ending index. If we do then we know we dont have an error
					if (endingIndex !== false) {

						let iActualEndingIndex = endingIndex + (`</${tagName}>`).length

						remaining = (template.slice(iActualEndingIndex).length > 0) ? template.slice(iActualEndingIndex) : false;

						// Get the template section that we need to process
						childContents = (endingIndex > 0) ? template.slice(0, endingIndex) : false;
					}
					else {

						let error = new Error("While processing template, no closing tag was found!")

						reject(error);
					}
				}

				// Now we need to pull apart the the actual tag and get to the attributes
				let attributesList = openingTag.match(HTML_ATTRIBUTES_REGEX);

				if (attributesList) {

					let aStaticAttr = [];
					let aDynamicAttr = [];

					for (let attr of attributesList) {

						// Check to see if we have a key value pair attribute
						if (attr.indexOf("=")) {

							let keyValuePair = attr.split('=');

							let attrTitle = keyValuePair[0];
							let attrValue = keyValuePair[1];

							if (LOGIC_TAGREG.test(attrValue)) {

							}
							else {

								if (attrValue.charAt(0) === '"' || attrValue.charAt(0) === "'") {

									attrValue = attrValue.slice(1, attrValue.length - 1);
								}

								// This must be a static attribute
								aStaticAttr.push({
									title: attrTitle,
									value: attrValue
								});
							}
						}

					}

					if (aStaticAttr.length || aDynamicAttr.length) {

						AST.attributes = {
							static: aStaticAttr,
							dynamic: aDynamicAttr
						};
					}

				}

				// Rerturn my results
				endResult = {
					AST: AST,
					children: childContents,
					remaining: remaining
				};

			}
			else {

				// When we have comments, we dont want to fall back to the text parser, just incase a template developer comments out another html or logic tag.

				AST.node = "comment";

				// Get all of the comment and save off the remaining
				let rawComment = template.slice(0, openingTag.length);
				template = template.slice(openingTag.length);

				AST.children = [
					{
						node: "text",
						contents: rawComment.replace('<!--', '').replace('-->', '')
					}
				];

				endResult = {
					AST: AST,
					children: false,
					remaining: (template) ? template : false
				};

			}

			resolve(endResult);

		});

	};

	function check(template) {

		return new Promise((resolve, reject) => {

			let check = HTML_TAGREGEX.exec(template);

			if (check) {

				let results = {
					source: "html",
					parser: parse,
					results: check
				}

				resolve(results);
			}
			else {

				resolve(false);
			}

		});

	};

	return {
		check: check,
		parse: parse
	};

}

module.exports = exports = new Parser();