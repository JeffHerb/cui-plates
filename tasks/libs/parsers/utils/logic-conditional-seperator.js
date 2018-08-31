const LogicAttributes   = require('../utils/logic-attributes');
const LogicBlock 		= require('./logic-block');

var LogicConditionalSeperator = function _logic_attributes() {

	const parser = (aConditionalSeperators, sFallbackSepeorator, sRootMethod, sSourceTemplate) => {

		console.log(aConditionalSeperators, sFallbackSepeorator, sRootMethod, sSourceTemplate);

		// Create a regular expression that will find all the current method conditional seperators
		let reConditionalSeperator = new RegExp(`(?:\{{2}(?:${aConditionalSeperators.join('|')})(?:[a-zA-Z0-9\.\ \=\!\&\|\"\'\(\)]*)\}{2})`,'g');

		// Call the conditional matcher to see if we find any
		let aConditionalSeperatorsMatch = sSourceTemplate.match(reConditionalSeperator);

		if (aConditionalSeperatorsMatch.length) {

			let sLastConditional = false;
			let iLastConditionalIndex = false;

			let iSkipBlock = false;

			// Since we have a conditonal match we need to loop through them an break them apart.
			while(true) {

				let sCurrentConditionalSegment = false;
				let reConditional = reConditionalSeperator.exec(sSourceTemplate);

				// Check to see if we can find the next conditional
				if (reConditional) {

					// Check to see if im in the middle of a i skip block
					if (iSkipBlock) {

					}

					// Since we have a conditional let check to see were the conditional starts, since some items conditional start at 0
					if (reConditional.index === 0 && iLastConditionalIndex === 0) {

						// Since we have and opening conditions (most like a switch like block) we need to fource the next loop
						console.log(reConditional)

						continue;
					}

					// Pull whatever text we can from the string to the current index
					sCurrentConditionalSegment = sSourceTemplate.slice(iLastConditionalIndex, reConditional.index);

					// Now we need to check this block to verify we have everything we could need
					let reSubBlockCheck = LogicBlock.check(sCurrentConditionalSegment, sRootMethod);

					if (reSubBlockCheck) {

						// Update the regular expression to have all of the source template up to the last starting index
						reSubBlockCheck.input = sSourceTemplate.slice(iLastConditionalIndex);

						// Run the block finder to get all the metadata
						let oSubLogicBlockSection = LogicBlock.find(reSubBlockCheck);

						if (oSubLogicBlockSection instanceof Error) {
							return oSubLogicBlockSection;		
						}

						console.log(oSubLogicBlockSection);
					}
					else {

						// There was no sub logic blocks to worry about so, let just save off what we have into conditiona
						console.log("no sub blocks to worry about!");
					}

				}
				else {

					// Check to see if we are in an active skip block!
					if (iSkipBlock) {

					}

					// Pull the remaining parts of the template
					sCurrentConditionalSegment = sSourceTemplate.slice(iLastConditionalIndex);


					console.log("No conditional");

					break;
				}

			}

			if (aConditionals.length) {



				// return {
				// 	aConditionals: aConditionals,
				// 	oFallbackCondition: oFallbackCondition
				// };
			}
			
		}
		
		return false;
	};

	return {
		parser: parser
	};

}

module.exports = exports = new LogicConditionalSeperator();