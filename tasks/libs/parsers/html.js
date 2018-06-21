'use strict';

const HTML_CHECK_CHAR = '<';

// Look for html tag structure "<" followed by name and attributes and ends with ">"
const HTML_TAGREGEX = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/;

// Pulls the tag name out and ignores all attributes
const HTML_TAG_NAME_REGEX = /(?:<[a-zA-Z\-\{\}]*)/;

// Pulls all static attributes as well as inline helpers.
const HTML_ATTRIBUTES_REGEX = /(?:[a-zA-Z\-]+\s*=["'][a-zA-Z\#\{\}\-\(\)\= 0-9]*["'])|(?:[{]{2}[a-zA-Z\#\{\}\-\(\)\= 0-9]*[}]{2})/g

const HTML_SELF_CLOSING = ['input', 'br', 'hr', 'img'];

const LOGIC_CHECK_CHAR = "{{";
const LOGIC_TAGREG = /{{([^\}}]+)}}/;

var Parser = function _html_parser(settings) {

	function parse(currentTag) {

		return new Promise((resolve, reject) => {

			let AST = {};

			let template = currentTag.input;

			let openingTag = currentTag[0];
			let closingTag = false;
			let childContents = false;

			let dynamicTag = false;

			let staticAttr = {};
			let dynamicAttr = [];
			let inlineHelder = [];

			let endResult = false;

			// Test if this is a comment first!
			if (openingTag.indexOf('<!--') === -1) {

				AST.node = "elem";

				while (true) {

					let attrCheck = HTML_ATTRIBUTES_REGEX.exec(openingTag);

					if (attrCheck === null) {
						break;
					}

					let attr = attrCheck[0];
					let attrIdx = attrCheck.index;

					// Do a quick check to see if they have any inline helpers
					if (attr.indexOf('{{') === -1) {

						// Split the attribute
						let keyValue = attr.split('=');

						if (!staticAttr[keyValue[0]]) {
							staticAttr[keyValue[0]] = keyValue[1].replace(/["]/g, "");
						}
						else {
							staticAttr[keyValue[0]] += " " + keyValue[1];
						}
						
					}
					else {

						// This requires additional 
					}
				}

				// Add all the known static attributes
				AST.attributes = staticAttr;

				let tagName = HTML_TAG_NAME_REGEX.exec(openingTag)[0].replace("<", "");

				if (tagName.indexOf(LOGIC_CHECK_CHAR) === -1) {

					AST.tag = tagName;
				}
				else {

					// Dynameic tag name found!!!
					dynamicTag = true;
				}

				// Remove the opening tag
				template = template.slice(openingTag.length);

				// Lets do some clean up and remove unneeded closing tags is required.
				if (!dynamicTag && (openingTag.indexOf('/>') === -1 || HTML_SELF_CLOSING.indexOf(tagName) === -1)) {

					// Dynamically create a regex to find the opening and closing version of the tag in question
					let openClosingExpression = new RegExp(`(?:<[\/]?${tagName}\s*[>]?)`, 'gm');

					// counter variables for loop
					let foundMatchingOpening = 0;

					// Loop through till we find a proper closing tag
					while(true) {

						let nextSameTag = openClosingExpression.exec(template);

						if (!nextSameTag) {

							break;
						}

						if (nextSameTag[0].indexOf('\/') === -1) {

							foundMatchingOpening += 1;
						}
						else {

							if (foundMatchingOpening >= 1) {

								foundMatchingOpening -= 1;
							}
							else if (foundMatchingOpening === 0) {
								
								closingTag = nextSameTag;
								break;
							}

						}
					}

					if (closingTag) {

						// Get any potential children up to the closing tag
						childContents = template.slice(0, closingTag.index);

						// Remove closing tag and possible children from template
						template = template.slice(childContents.length + closingTag[0].length);

					}
					else {

						// ERROR!
						throw new Error("Invalid template, all elments must close properly inside the same template");
					}

				}
				else {

					console.log("Dynamic tag closing????");
				}

				endResult = {
					AST: AST,
					children: (childContents)?  childContents : false,
					remaining: (template) ? template : false
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