const LogicAttributes   = require('../utils/logic-attributes');
const LogicBlock 		= require('./logic-block');

var LogicConditionalSeperator = function _logic_attributes() {

	const parser = (aConditionalSeperators, sFallbackSepeorator, aRootTagAttributes, sSourceTemplate) => {

		// Save off the root method
		let sRootMethod = aRootTagAttributes.shift();

		// Create a regular expression that will find all the current method conditional seperators
		let reConditionalSeperator = new RegExp(`(?:\{{2}(?:${aConditionalSeperators.join('|')})(?:[a-zA-Z0-9\.\ \=\!\&\|\"\'\(\)]*)\}{2})`,'g');

		// Call the conditional matcher to see if we find any
		let aConditionalSeperatorsMatch = sSourceTemplate.match(reConditionalSeperator);

		// Check to see if we found any matching condtional tags
		if (aConditionalSeperatorsMatch.length) {

			let iLastConditionalIndex = 0;

			// Place to store the broken up last (current) and next conditional tag
			let aLastTagAttributes = false;
			let sLastTagMethod = false;

			let aCurrentTagAttributes = aRootTagAttributes;
			let sCurrentTagMethod = sRootMethod;

			let aNextTagAttributes = false;
			let sNextTagMethod = false;

			let iSkipBlock = false;

			// Place to store final condtional segments
			let aCondtionalSegments = [];
			let oFallbackSegment = false;

			function updateLastCurrentNextTag() {

				// Move current to last placeholders
				aLastTagAttributes = aCurrentTagAttributes.concat();
				sLastTagMethod = sCurrentTagMethod;

				// Move next conditional too current
				aCurrentTagAttributes = aNextTagAttributes.concat();
				sCurrentTagMethod = sNextTagMethod;

				// Null out the next tag arguments
				aNextTagAttributes = false;
				sNextTagMethod = false;
			}

			// Since we have a conditonal match we need to loop through them an break them apart.
			while(true) {

				// Place to store the segment text between the last conditional index and the current found conditional
				let sCurrentConditionalSegment = false;

				// Finds the next condtional
				let reConditional = reConditionalSeperator.exec(sSourceTemplate);

				// Check to see if we can find the next conditional
				if (reConditional) {

					// Take the conditional tag that we found and break it appear and save it into the next conditional variables
					aNextTagAttributes = LogicAttributes.parser(reConditional[0]);
					sNextTagMethod = aNextTagAttributes.shift();

					// Check to see if im in the middle of a i skip block
					if (iSkipBlock) {

						// If the current index is less than iSkip block, just continue
						if (iSkipBlock && iSkipBlock > reConditional.index) {
							continue;
						}
					}

					// Since we have a conditional let check to see were the conditional starts, since some items conditional start at 0
					if (reConditional.index === 0 && iLastConditionalIndex === 0) {

						// Update the last, current, next
						updateLastCurrentNextTag();

						iLastConditionalIndex += reConditional.length;
						continue;
					}

					// Pull whatever text we can from the string to the current index
					sCurrentConditionalSegment = sSourceTemplate.slice(iLastConditionalIndex, reConditional.index);

					// Now scrap the conditional segment looking for similar conditionals
					let reSubBlockCheck = LogicBlock.check(sCurrentConditionalSegment, sCurrentTagMethod);

					// Check to see if the sub block check yeilded any results
					if (reSubBlockCheck) {

						// Update the regular expression to have all of the source template up to the last starting index
						reSubBlockCheck.input = sSourceTemplate.slice(iLastConditionalIndex);

						// Run the block finder to get all the metadata
						let oSubLogicBlockSection = LogicBlock.find(reSubBlockCheck);

						if (oSubLogicBlockSection instanceof Error) {
							return oSubLogicBlockSection;		
						}

						// Check to see if the sublogic block is ends after current index
						if (reConditional.index < oSubLogicBlockSection.oSectionMeta.oSegment.iEnd) {

							iSkipBlock = oSubLogicBlockSection.oSectionMeta.oSegment.iEnd;
							continue;
						}
						else {

							// Remove skip block if its in effect
							if (iSkipBlock) {
								iSkipBlock = false;
							}

							if (sCurrentTagMethod === sFallbackSepeorator) {
								
								oFallbackSegment = {
									"contents": sCurrentConditionalSegment
								};
							}
							else {

								aCondtionalSegments.push({
									"conditional": aCurrentTagAttributes,
									"method": sCurrentTagMethod,
									"contents": sCurrentConditionalSegment,
								});
							}

							// Update the last, current, next
							updateLastCurrentNextTag();

							iLastConditionalIndex += (reConditional.index + reConditional[0].length);
						}
					}
					else {

						console.log("sCurrent", sCurrentTagMethod);

						if (sCurrentTagMethod === sFallbackSepeorator) {
							
							oFallbackSegment = {
								"contents": sCurrentConditionalSegment
							};
						}
						else {

							aCondtionalSegments.push({
								"conditional": aCurrentTagAttributes,
								"method": sCurrentTagMethod,
								"contents": sCurrentConditionalSegment,
							});
						}

						// Update the last, current, next
						updateLastCurrentNextTag();							

						// Update the last condtional index
						iLastConditionalIndex += (reConditional.index + reConditional[0].length);
					}

				}
				else {

					// Check to see if we are in an active skip block!
					if (iSkipBlock) {
						iSkipBlock = false;
					}

					// Pull the remaining parts of the template
					sCurrentConditionalSegment = sSourceTemplate.slice(iLastConditionalIndex);

					if (sCurrentConditionalSegment.length) {

						if (sCurrentTagMethod === sFallbackSepeorator) {
							oFallbackSegment = {
								"contents": sCurrentConditionalSegment
							};
						}
						else {

							aCondtionalSegments.push({
								"conditional": aCurrentTagAttributes,
								"method": sCurrentTagMethod,
								"contents": sCurrentConditionalSegment,
							});
						}

					}

					break;
				}

			}

			if (aCondtionalSegments.length) {

				return {
					aConditionals: aCondtionalSegments,
					oFallbackCondition: oFallbackSegment
				};
				
			}
			
		}
		
		return false;
	};

	return {
		parser: parser
	};

}

module.exports = exports = new LogicConditionalSeperator();