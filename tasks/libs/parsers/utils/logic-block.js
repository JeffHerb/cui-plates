// Context level regular expressions
const LOGIC_TAG_CONTENTS_REGEX = /\((?:(.*?))\)|(?:[a-zA-Z0-9\.\=\!\<\>\&\|\"\']+)/g;

// Block Designator
//const LOGIC_TAG_BLOCK_DESIGNATOR = /(?:\{{2}[\/|\#](?:if|switch|each)(?:[a-zA-Z0-9\.\ \=\!\&\|\"\'\(\)]*)\}{2})/g;

// This function is sperate from the root block logic tag parser for resusability
var LogicBlock = function _logic_block (reTemplateResults, gracefulFail) {

	// This function finds the logical
	const find = (reTemplateResults, gracefulFail) => {

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
			},
			oSegment: {
				iStart: false,
				iEnd: false
			},
			iContentLength: false,
			iTotalBlockLength: false
		};

		let sFullTemplate = reTemplateResults.input;

		// Save off the opening info
		oLogicSection.oOpening.sTag = reTemplateResults[0];
		oLogicSection.oOpening.iStart = reTemplateResults.index;
		oLogicSection.oOpening.iEnd = reTemplateResults.index + oLogicSection.oOpening.sTag.length;

		// Save off the start index
		oLogicSection.oSegment.iStart = reTemplateResults.index;

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

			oLogicSection.iContentLength = sBlockContents.length;
			oLogicSection.iTotalBlockLength = sBlockContents.length + (oLogicSection.oOpening.sTag.length) + (oLogicSection.oClosing.sTag.length);

			// Save off the end index
			oLogicSection.oSegment.iEnd = oLogicSection.oSegment.iStart + oLogicSection.iTotalBlockLength;

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

	const check = (sContents, sBlockTag) => {

		const reCheckTag = new RegExp(`(?:\{{2}[\/|\#](?:${sBlockTag})(?:[a-zA-Z0-9\.\ \=\!\&\|\"\'\(\)]*)\}{2})`, 'g');

		let aMatches = sContents.match(reCheckTag);

		if (aMatches && aMatches.length) {

			return reCheckTag.exec(sContents);
		}
		else {

			return false;
		}
	};

	return {
		check: check,
		find: find
	};

};

module.exports = exports = new LogicBlock();