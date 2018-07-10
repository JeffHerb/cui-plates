'use strict';

// Look for html tag structure "<" followed by name and attributes and ends with ">"
const HTML_TAGREGEX = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/;

const HTML_ATTRIBUTES_SEPERATOR = /(?:[a-zA-Z0-9\-]*)=(?:["']+(?:[a-zA-Z0-9])*(?:["']+))|(?:[{]{2}(?:[\.\#\@](?:[a-zA-Z0-9\s\=\"\'\.\#\!\(\)]+[}]{2})))|(?:[a-zA-Z]+)/g;

// Identify all of the inline elements for quick reference.
const INLINE_ELEMS = ['img', 'br', 'hr', 'input'];

// Discovereds the entire html block region
const HTMLBlock = (reTemplateResults) => {

	let oHTMLSection = {
		oOpenTag: {
			sTag: false,
			iStart: false,
			iEnd: false
		},
		oCloseTag: {
			sTag: false,
			iStart: false,
			iEnd: false
		}
	}

	// Get the current template
	let sFullTemplate = reTemplateResults.input;
	let sTriggerElem = reTemplateResults[0];

	// Save off the opening tag numbers
	oHTMLSection.oOpenTag.sTag = reTemplateResults[0];
	oHTMLSection.oOpenTag.iStart = reTemplateResults.index;
	oHTMLSection.oOpenTag.iEnd = reTemplateResults.index + reTemplateResults[0].length;

	// Break out the attributes and the tag.
	let aOpeningAttributesNTag = sTriggerElem.match(HTML_ATTRIBUTES_SEPERATOR);

	let sHTMLTag = aOpeningAttributesNTag.shift();

	let aHTMLAttributes = (aOpeningAttributesNTag.length) ? aOpeningAttributesNTag : false;

	// Now that we have all the basics, we need to find the end of the element... maybe.
	if (INLINE_ELEMS.indexOf(sHTMLTag.toLowerCase()) === -1) {

		let reHTMLBLOCK = new RegExp(`(?:<[/]?${sHTMLTag}(?:[^>]*)>)`, 'g');

		console.log("We need to find the closing tag!");

		let sameElementOpen = 0;
		let reEndingElemTag = false;

		while(true) {

			let nextMatchingTag = reHTMLBLOCK.exec(sFullTemplate);

			if (nextMatchingTag) {

				// Check to see if this is a closing tag, as thats easier
				if (nextMatchingTag[0].indexOf('</') !== -1) {

					if (sameElementOpen > 0) {

						sameElementOpen -= 1;
					}
					else {

						// Found the matching closing tag
						reEndingElemTag = nextMatchingTag
						break;
					}
				}
				else {

					if (nextMatchingTag.index === reTemplateResults.index) {
						continue;
					}
					else {

						// We have a opening tag that matches, just count it for now.
						sameElementOpen += 1;
					}

				}
			}
			else {

				console.log("FULL FAIL!");

				break;
			}

		}

		if (reEndingElemTag) {

			oHTMLSection.oCloseTag.sTag = reEndingElemTag[0];
			oHTMLSection.oCloseTag.iStart = reEndingElemTag.index;
			oHTMLSection.oCloseTag.iEnd = reEndingElemTag.index + reEndingElemTag[0].length;
		}

	}

	return oHTMLSection;
};

var HTMLParser = function _html_parser() {

	// This is the parser for this type of template contents.
	const parser = (reTemplateResults) => {

		let oAST = {
			node: false,
		};

		// Get the full template string from the regular expressions results object
		//let sFullTemplate = reTemplateResults.input;

		// Get the discovered strong trigger that resulted in this parser being called
		let sTemplateTrigger = reTemplateResults[0];

		// Check to see if this is an HTML comments
		if (sTemplateTrigger.indexOf('<!--') === -1) {

			oAST.node = "elem";

			let oElemSection = HTMLBlock(reTemplateResults);

			console.log("==== oElemSection ====");
			console.log(oElemSection);
			console.log("======================");
		}
		else {

			oAST.node = "comment";
		}

	};

	// Function is used to determine if the provided template string has contents that this parser can handle.
	const check = (sTemplate) => {

		// check the regular expression to see if it can find any HTML elements
		let reCheck = HTML_TAGREGEX.exec(sTemplate);

		if (reCheck) {

			let result = {
				sSource: 'html',
				fParser: parser,
				reCheck: reCheck
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

module.exports = exports = new HTMLParser();