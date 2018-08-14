'use strict';

// Utilities
const ATTRIBUTES_UTIL = require('./utils/attributes');

// Look for html tag structure "<" followed by name and attributes and ends with ">"
const HTML_TAGREGEX = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/;

const HTML_ATTRIBUTES_SEPERATOR = /(?:[a-zA-Z0-9\-]*)=(?:["']+(?:[a-zA-Z0-9\-\_\{\}\.\#\@\(\)\=\ ])*(?:["']+))|(?:[{]{2}(?:[\.\#\@](?:[a-zA-Z0-9\s\=\"\'\.\#\!\(\)\-\_]+[}]{2})))|(?:[a-zA-Z]+)/g;

// Identify all of the inline elements for quick reference.
const INLINE_ELEMS = ['img', 'br', 'hr', 'input'];

// Discovereds the entire html block region
const HTMLBlock = (reTemplateResults) => {

	let oHTMLSection = {
		bIsInlineElem: false,
		oOpenTag: {
			sRaw: false,
			sTag: false,
			aAttributes: false,
			iStart: false,
			iEnd: false
		},
		oCloseTag: {
			sRaw: false,
			iStart: false,
			iEnd: false
		}
	}

	// Get the current template
	let sFullTemplate = reTemplateResults.input;
	let sTriggerElem = reTemplateResults[0];

	// Save off the opening tag numbers
	oHTMLSection.oOpenTag.sRaw = reTemplateResults[0];

	// Double check to make sure this is not a comment
	if (reTemplateResults[0].indexOf('<!--') === -1) {

		oHTMLSection.oOpenTag.iStart = reTemplateResults.index;
		oHTMLSection.oOpenTag.iEnd = reTemplateResults.index + reTemplateResults[0].length;

		// Break out the attributes and the tag.
		let aOpeningAttributesNTag = sTriggerElem.match(HTML_ATTRIBUTES_SEPERATOR);

		// Get the element tag nodeName
		let sHTMLTag = aOpeningAttributesNTag.shift();

		// Save off the attributes for the return
		oHTMLSection.oOpenTag.aAttributes = (aOpeningAttributesNTag.length) ? aOpeningAttributesNTag : false;

		// Now that we have all the basics, we need to find the end of the element... maybe.
		if (INLINE_ELEMS.indexOf(sHTMLTag.toLowerCase()) === -1) {

			// Generate a regular expression to find this specific ending tag.
			let reHTMLBLOCK = new RegExp(`(?:<[/]?${sHTMLTag}(?:[^>]*)>)`, 'g');

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

					let error = new Error(`Template |template.path| containes unclosed html element: ${sHTMLTag}. Opening tag: ${sTriggerElem}`);

					return error;

					break;
				}

			}

			if (reEndingElemTag) {

				oHTMLSection.oOpenTag.sTag = sHTMLTag;
				oHTMLSection.oCloseTag.sRaw = reEndingElemTag[0];
				oHTMLSection.oCloseTag.iStart = reEndingElemTag.index;
				oHTMLSection.oCloseTag.iEnd = reEndingElemTag.index + reEndingElemTag[0].length;
			}
			else {



			}

			console.log(oHTMLSection);

		}
		else {

			// Just save off the tag
			oHTMLSection.oOpenTag.sTag = sHTMLTag;
			oHTMLSection.bIsInlineElem = true;
		}
	}
	else {

		const reCommentOpen = new RegExp('(?:<!--)','g');
		const reCommentClose = new RegExp('(?:-->)', 'g');

		let reCommentOpenResult = reCommentOpen.exec(sTriggerElem);
		let reCommentCloseResult = reCommentClose.exec(sTriggerElem);

		// Save off opening index
		oHTMLSection.oOpenTag.iStart = reCommentOpenResult.index;
		oHTMLSection.oOpenTag.iEnd = reCommentOpenResult.index + reCommentOpenResult[0].length;

		// Save off closing index
		oHTMLSection.oCloseTag.iStart = reCommentCloseResult.index;
		oHTMLSection.oCloseTag.iEnd = reCommentCloseResult.index + reCommentCloseResult[0].length;

		oHTMLSection.oOpenTag.sTag = "comment";

	}


	return oHTMLSection;
};

var HTMLParser = function _html_parser() {

	// This is the parser for this type of template contents.
	const parser = (reTemplateResults) => {

		let oEndResults = {
			oAST: false,
			sChildren: false,
			sRemaining: false
		};

		let oAST = {
			node: false,
			tag: false,
			attributes: false,
			contents: false
		};

		// Save off the full template
		let sTemplate = reTemplateResults.input;

		// Get the discovered strong trigger that resulted in this parser being called
		let sTemplateTrigger = reTemplateResults[0];

		let sContents = false;
		let sRemaining = false;

		// Check to see if this is an HTML comments
		if (sTemplateTrigger.indexOf('<!--') === -1) {

			oAST.node = "elem";

			// Get the tag information and key slice points
			let oElemSection = HTMLBlock(reTemplateResults);

			// Throw error back if this is the instance of an error.
			if (oElemSection instanceof Error) {

				return oElemSection;
			}

			// Check to see if we have a inline or block level element.
			if (oElemSection.bIsInlineElem) {

				// Get everything after the end of the self closing tag
				sRemaining = sTemplate.slice(oElemSection.oOpenTag.iEnd).trim();
			}
			else {

				// Get all the contents inside of this block element
				sContents = sTemplate.slice(oElemSection.oOpenTag.iEnd, oElemSection.oCloseTag.iStart).trim();
				sRemaining = sTemplate.slice(oElemSection.oCloseTag.iEnd).trim();
			}


			// Save off the tag
			oAST.tag = oElemSection.oOpenTag.sTag;

			let oFinishedAttributes = ATTRIBUTES_UTIL.parser(oElemSection.oOpenTag.aAttributes);

			if (oFinishedAttributes.block.length || oFinishedAttributes.simple.length) {

				// Save off the attributes
				oAST.attributes = oFinishedAttributes;
			}

			oEndResults.oAST = oAST;

		}
		else {

			oAST.node = "comment";

			let oElemSection = HTMLBlock(reTemplateResults);

			// Lets get the text out of the comment
			oAST.text = sTemplate.slice(oElemSection.oOpenTag.iEnd, oElemSection.oCloseTag.iStart).trim();

			// Save of any remaining template contents.
			sRemaining = sTemplate.slice(oElemSection.oCloseTag.iEnd);

			oEndResults.oAST = oAST;
		}

		if (sContents.length) {
			oEndResults.sChildren = sContents;
		}

		if (sRemaining.length) {
			oEndResults.sRemaining = sRemaining;
		}
		
		return oEndResults;	
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