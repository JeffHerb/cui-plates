'use strict';

// Global Detector
const LOGIC_TAGREGEX = /[{]{2}(?:[\#\.\@\>]?[^\}]+)[}]{2}/;

// Context level regular expressions
const LOGIC_TAG_CONTENTS_REGEX = /\((?:(.*?))\)|(?:[a-zA-Z0-9\.\=\!\<\>\&\|\"\']+)/g;

// Block level regular expressions
const LOGIC_TAG_BLOCK_DESIGNATOR = /(?:\{{2}[\/|\#](?:if|switch|each)(?:[a-zA-Z0-9\.\ \=\!\&\|\"\'\(\)]*)\}{2})/g;
const LOGIC_TAG_BLOCK_SEPERATOR = /(?:\{{2}(?:case|default|elseif|else)(?:[a-zA-Z0-9\.\ \=\!\&\|\"\'\(\)]*)\}{2})/g;

const LOGIC_BLOCK_TAGS_META = {
	'each': {
		seperators: false,
		finalFallback: false
	},
	'if': {
		seperators: ['elseif', 'else'],
		finalFallback: 'else'
	},
	'switch': {
		seperators: ['case', 'default'],
		finalFallback: 'default'
	}
};

const LOGIC_BLOCK_TAGS = Object.keys(LOGIC_BLOCK_TAGS_META);

// This function is sperate from the root block logic tag parser for resusability
const FIND_LOGIC_BLOCK = (reTemplateResults, gracefulFail) => {

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

	let sFullTemplate = reTemplateResults.input;

	// Save off the opening info
	oLogicSection.oOpening.sTag = reTemplateResults[0];
	oLogicSection.oOpening.iStart = reTemplateResults.index;
	oLogicSection.oOpening.iEnd = reTemplateResults.index + oLogicSection.oOpening.sTag.length;

	// Break the opening conditional page into pieces
	let aConditionalOpeningParts = oLogicSection.oOpening.sTag.match(LOGIC_TAG_CONTENTS_REGEX);

	// Save off the tag and the conditional parts for now.
	let oStartingConditional = {
		sTag: aConditionalOpeningParts.shift(),
		aConditionals: aConditionalOpeningParts
	};

	// Save of first conditional to root section as well
	oLogicSection.sMethod = oStartingConditional.sTag;

	// Remove the opeing conditional block tag
	let sRemaining = sFullTemplate.slice(oLogicSection.oOpening.iEnd);

	let iSameOpeningDesignator = 0;
	let reSameBlockDesignator = new RegExp(`(?:\{{2}[\/|\#](?:${oLogicSection.sMethod})(?:[a-zA-Z0-9\.\ \=\!\&\|\"\'\(\)]*)\}{2})`, 'g');
	let reEndingBlockDesignator = false;

	while(true) {

		let reNextBlockDesignator = reSameBlockDesignator.exec(sRemaining);

		if (!reNextBlockDesignator) {
			break;
		}

		// Check to see if this is a matching logic block type
		if (reNextBlockDesignator[0].indexOf('{{#') !== -1) {
			iSameOpeningDesignator += 1;
		}
		else {

			if (iSameOpeningDesignator >= 1) {
				iSameOpeningDesignator -= 1;		
			}
			else {

				reEndingBlockDesignator = reNextBlockDesignator;
			}

		}

	}

	if (reEndingBlockDesignator) {

		oLogicSection.oClosing.sTag = reEndingBlockDesignator[0];
		oLogicSection.oClosing.iStart = reEndingBlockDesignator.index;
		oLogicSection.oClosing.iEnd = reEndingBlockDesignator.index + reEndingBlockDesignator[0].length;

		// Now that we have the end block we can seperate at least that much
		let sBlockContents = sRemaining.slice(0, oLogicSection.oClosing.iStart);

		// Get everything not found in our logic block;
		sRemaining = sRemaining.slice(oLogicSection.oClosing.iEnd);

		// Return the section results
		return {
			oSectionMeta: oLogicSection,
			sRemaining: sRemaining,
			sBlockContents: sBlockContents
		};

	}
	else {

		if (!gracefulFail) {

			let error = new Error(`Template |template.path| No ending tag could be found for ${oLogicSection.oOpening.sTag}.`);

			return error;
		}
		else {

			return false;
		}

	}

};

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
				node: "logic",
				tag: "context",
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
		fProcess: (reTemplateResults, fProcessTemplate) => {

			let oAST = {
				node: "logic",
				tag: "block",
				method: false,
				conditionals: [],
				fallback: false
			};

			let oEndResult = {
				oAST: false,
				aSubProcess: ['conditionals', 'fallback'],
				sChildren: false,
				sRemaining: false
			};

			// See if we can get the logic information for this section
			let oLogicSectionData = FIND_LOGIC_BLOCK(reTemplateResults);

			//console.log(oLogicSectionData);

			if (oLogicSectionData instanceof Error) {
				return oLogicSection;
			}

			// No we need to take a deeper look into the block contents and break the different conditionals apart!
			if (oLogicSectionData.sBlockContents.length) {

				// Small function used to create the subAST object
				let fCreateSuboAST = (sMethod, aConditionals, sSubTemplate) => {

					return {
						sMethod: sMethod,
						aConditions: aConditionals,
						sSubTemplate: sSubTemplate,
					};

				}

				// Create a regular expression only looking for the conditional sperators that matter to this tag
				let reConditionalSeperators = new RegExp(`(?:\{{2}(?:${LOGIC_BLOCK_TAGS_META[oLogicSectionData.oSectionMeta.sMethod].seperators.join('|')})(?:[a-zA-Z0-9\.\ \=\!\&\|\"\'\(\)]*)\}{2})`, 'g');

				let sCurrentWorkingSubTemplate = oLogicSectionData.sBlockContents;
				let aCurrentCondtionals = oLogicSectionData.oSectionMeta.oOpening.sTag.match(LOGIC_TAG_CONTENTS_REGEX);
				let sCurrentConditionalMethod = aCurrentCondtionals.shift();
				let iLastConditionalBlockStartInd = 0;

				let sRootMethod = sCurrentConditionalMethod;

				oAST.method = sRootMethod;

				// Test to see if we have other matching logic blocks
				while (true) {

					let oSubAST = false;

					// break if the current sub template has no length
					if (!sCurrentWorkingSubTemplate.length) {
						break;
					}

					// Find the next condtional block seperator tag, {{else}} 
					let reNextConditionalTag = reConditionalSeperators.exec(oLogicSectionData.sBlockContents);

					// If we found the 
					if (reNextConditionalTag) {

						//console.log(reNextConditionalTag);
						let iNextConditionalIndex = reNextConditionalTag.index;

						// Slice the substring and look for a similar opening logic tag!
						let sPossibleSubTemplate = sCurrentWorkingSubTemplate.slice(iLastConditionalBlockStartInd, reNextConditionalTag.index);

						// Create and on the fly reg ex for detecting same logic sub tag.
						let reLogicCheck = new RegExp(`(?:\{{2}[\/|\#](?:${sCurrentConditionalMethod})(?:[a-zA-Z0-9\.\ \=\!\&\|\"\'\(\)]*)\}{2})`,'g');

						let aLogicCheckMatches = sPossibleSubTemplate.match(reLogicCheck);

						// Check if we found any matching tags!
						if (aLogicCheckMatches) {

							// Find the first sub logic tag
							let reFirstSubLogicTag = reLogicCheck.exec(sCurrentWorkingSubTemplate);

							let oSubLogicSectionData = FIND_LOGIC_BLOCK(reFirstSubLogicTag, true);

							// console.log(iNextConditionalIndex, (reFirstSubLogicTag.index + oSubLogicSectionData.oSectionMeta.oClosing.iEnd));

							if (iNextConditionalIndex > (reFirstSubLogicTag.index + oSubLogicSectionData.oSectionMeta.oClosing.iEnd)) {

								oSubAST = fCreateSuboAST(sCurrentConditionalMethod, aCurrentCondtionals, sPossibleSubTemplate);

								// check to see if this is a fallback item or a regular conditional
								if (LOGIC_BLOCK_TAGS_META[sRootMethod].finalFallback === sCurrentConditionalMethod) {
									
									oAST.fallback = oSubAST;
								}
								else {

									oAST.conditionals.push(oSubAST);
								}

								// Update all of our references for the next
								sCurrentWorkingSubTemplate = sCurrentWorkingSubTemplate.slice(reNextConditionalTag.index + reNextConditionalTag[0].length);
								aCurrentCondtionals = reNextConditionalTag[0].match(LOGIC_TAG_CONTENTS_REGEX);
								sCurrentConditionalMethod = aCurrentCondtionals.shift();
								iLastConditionalBlockStartInd = reNextConditionalTag.index + reNextConditionalTag[0].length;

							}
							else {	
								/// This conditional is like part of a sub conditional so we need to move to the next occurance
								continue;
							}

						}
						else {

							oSubAST = fCreateSuboAST(sCurrentConditionalMethod, aCurrentCondtionals, sPossibleSubTemplate);

							// check to see if this is a fallback item or a regular conditional
							if (LOGIC_BLOCK_TAGS_META[sRootMethod].finalFallback === sCurrentConditionalMethod) {
								
								oAST.fallback = oSubAST;
							}
							else {

								oAST.conditionals.push(oSubAST);
							}

							// Update all of our references for the next
							sCurrentWorkingSubTemplate = sCurrentWorkingSubTemplate.slice(reNextConditionalTag.index + reNextConditionalTag[0].length);
							aCurrentCondtionals = reNextConditionalTag[0].match(LOGIC_TAG_CONTENTS_REGEX);
							sCurrentConditionalMethod = aCurrentCondtionals.shift();
							iLastConditionalBlockStartInd = reNextConditionalTag.index + reNextConditionalTag[0].length;
						}

					}
					else {

						oSubAST = fCreateSuboAST(sCurrentConditionalMethod, aCurrentCondtionals, sCurrentWorkingSubTemplate);

						// check to see if this is a fallback item or a regular conditional
						if (LOGIC_BLOCK_TAGS_META[sRootMethod].finalFallback === sCurrentConditionalMethod) {
							
							oAST.fallback = oSubAST;
						}
						else {

							oAST.conditionals.push(oSubAST);
						}


						break;
					}

				}

				//console.log(oAST);


				oEndResult.oAST = oAST;

			}

			// If there are remaning siblings, add them to the end result for the rest of the parser.
			// if (oLogicSectionData.sRemaining.legnth) {
			// 	oEndResult.sRemaining = oLogicSectionData.sRemaining;
			// }

			return oEndResult;

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

			console.log(sTemplate.match(reLogic));

		}


		//console.log(reLogic);

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