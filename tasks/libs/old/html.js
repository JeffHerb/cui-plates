'use strict';

// Get the logic parser
const LOGICParser = require('./logic');

const HTML_CHECK_CHAR = '<';

// Look for html tag structure "<" followed by name and attributes and ends with ">"
const HTML_TAGREGEX = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/;

// Pulls the tag name out and ignores all attributes
const HTML_TAG_NAME_REGEX = /(?:<[a-zA-Z\-\{\}]*)/;

// Pulls all static attributes as well as inline helpers.
const HTML_ATTRIBUTES_REGEX = /(?:[a-zA-Z\-]*)=(?:"|')(?:[a-zA-Z0-9\.\{\}\(\)\[\]\s\,\'\:\-])*(?:"|')|(?:checked)|(?:selected)|(?:required)|(?:disabled)|(?:multiple)|(?:autofocus)/g

const HTML_SELF_CLOSING = ['input', 'br', 'hr', 'img'];

//const LOGIC_CHECK_CHAR = "{{";
const LOGIC_TAGREG = /{{([^\}}]+)}}/;

var Parser = function _html_parser(settings) {

	function parse(currentTag, templateObj) {

		return new Promise(async (resolve, reject) => {

			let AST = {
				node: false,
				attributes: false,
				tag: false
			};

			// Current template send to parser
			let template = currentTag.input;

			// tag structur variables
			let openingTag = currentTag[0];
			let selfClosed = false;
			let closingTagRegEx = false;

			let elemAttrProperties = false;

			// Actual tag being requested
			let tagName = false;
			let attributes = [];

			// Storage for additional children and remaining templates siblings
			let childContents = false;
			let remaining = false;

			let dynamicTag = false;

			let inlineHelpera = [];

			let endResult = false;

			const getElemAttrProperties = (openingTag, tagName) => {

				if (openingTag.slice(-2) === "/>") {
					openingTag = openingTag.slice(0, openingTag.length - 2);
				}
				else {
					openingTag = openingTag.slice(0, openingTag.length - 1);
				}

				// Remove front and return
				return openingTag.slice(tagName.length + 1);
			};

			const removeAttrQuotes = (attribute) => {

				if (attribute.charAt(0) === "'" || attribute.charAt(0) === '"') {

					return attribute.slice(1, attribute.length - 1);
				}

			};

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

						// Setup element attrs and properties for the next proces
						elemAttrProperties = getElemAttrProperties(openingTag, tagName);

					}
					else {

						let error = new Error("While processing template, no closing tag was found!")

						reject(error);
					}
				}
				else {

					elemAttrProperties = getElemAttrProperties(openingTag, tagName);
				}

				// Filter out propertyless elements
				if (elemAttrProperties.trim().length > 0) {

					// Check to see if anything logic base exists here.
					let logicTest = LOGIC_TAGREG.test(elemAttrProperties);

					if (logicTest) {


						
					}
					else {

						// Do a simple spit on attributes
						let attributesList = elemAttrProperties.match(HTML_ATTRIBUTES_REGEX);

						AST.attributes = [];

						// Loop throught each attribute
						for (let attr of attributesList) {

							let keyValue = attr.split('=');

							let attrTitle = keyValue[0];
							let attrValue = removeAttrQuotes(keyValue[1]);

							// Push the attribute onto the end!
							AST.attributes.push({
								static: true,
								property: attrTitle,
								value: attrValue
							});

						}

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