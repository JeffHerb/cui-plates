const LogicAttributes   = require('../utils/logic-attributes');
const LogicBlock 		= require('./logic-block');

var LogicConditionalSeperator = function _logic_attributes() {

	const parser = (aConditionalSeperators, sFallbackSepeorator, sRootMethod, sSourceTemplate) => {

		// Create a regular expression that will find all the current method conditional seperators
		let reConditionalSeperator = new RegExp(`(?:\{{2}(?:${aConditionalSeperators.join('|')})(?:[a-zA-Z0-9\.\ \=\!\&\|\"\'\(\)]*)\}{2})`,'g');

		// Create a regular expresion for matching duplicate sub logic block declerations.
		let aConditionalSeperatorsMatch = sSourceTemplate.match(reConditionalSeperator);

		if (aConditionalSeperatorsMatch.length) {

			//let sCurrentBlockTemplate = sSourceTemplate;
			let iLastConditionalIndex = 0;
			let sLastConditionalTag = false;
			let bRootConditionalContents = false;

			let aConditionals = [];
			let oFallbackCondition = false;
			let iSkipSection = false;

			while(true) {

				// Execute a lookup to find the next conditional sperator
				let reNextConditional = reConditionalSeperator.exec(sSourceTemplate);

				let sBeforeConditional = false;
				let sLastCondtionalTagParsed = false;

				if (sLastConditionalTag) {
					sLastCondtionalTagParsed = LogicAttributes.parser(sLastConditionalTag)[0];
				}

				// Check to see if we found a condtional!
				if (reNextConditional) {

					if (iLastConditionalIndex === 0 && reNextConditional.index === 0) {		

						// Just save off the index and the conditional because there is nothing to return
						sLastConditionalTag = reNextConditional[0];
						iLastConditionalIndex += sLastConditionalTag.length;
						continue;
					}
					else {

						// Double check to make sure we are not inside of the skip range.
						if (reNextConditional.index < iSkipSection) {
							continue;
						}

						// Get all the text up to this matching condtional (it belongs to the previous one)
						sBeforeConditional = sSourceTemplate.slice(iLastConditionalIndex, reNextConditional.index);

						// Check string for possible matching child logic block
						let reSubBlockCheck = LogicBlock.check(sBeforeConditional, sRootMethod);

						if (reSubBlockCheck) {

							let sRemainingConditional = sSourceTemplate.slice(iLastConditionalIndex);

							// Update the input to include everything yet to be seperated
							reSubBlockCheck.input = sRemainingConditional;

							let oSubLogicBlockSection = LogicBlock.find(reSubBlockCheck);

							if (oSubLogicBlockSection instanceof Error) {
								return oSubLogicBlockSection;		
							}

							iSkipSection =  iLastConditionalIndex + (reSubBlockCheck.index + oSubLogicBlockSection.oSectionMeta.iTotalBlockLength);

							continue;
						}

						if (sLastCondtionalTagParsed === sFallbackSepeorator) {

							if (!oFallbackCondition) {

								oFallbackCondition = {
									"contents": sBeforeConditional
								}
							}
							else {

								let error = new Error(`|template.path| containing two fallback conditionals ${sFallbackSepeorator} in the same logic block. This is not allowed.`)

								return error;
							}

						}
						else {

							aConditionals.push({
								"conditional": sLastConditionalTag,
								"contents": sBeforeConditional
							});
						}

						sLastConditionalTag = reNextConditional[0];
						iLastConditionalIndex = reNextConditional.index + sLastConditionalTag.length;

					}


				}
				else {


					// Get all the text up to this matching condtional (it belongs to the previous one)
					sBeforeConditional = sSourceTemplate.slice(iLastConditionalIndex);

					if (sBeforeConditional.length) {

						if (sLastCondtionalTagParsed === sFallbackSepeorator) {

							if (!oFallbackCondition) {

								oFallbackCondition = {
									"contents": sBeforeConditional
								}
							}
							else {

								let error = new Error(`|template.path| containing two fallback conditionals ${sFallbackSepeorator} in the same logic block. This is not allowed.`)

								return error;
							}

						}
						else {

							aConditionals.push({
								"conditional": sLastConditionalTag,
								"contents": sBeforeConditional
							});
						}

					}

					break;
				}



			}

			if (aConditionals.length) {

				return {
					aConditionals: aConditionals,
					oFallbackCondition: oFallbackCondition
				};
			}
			
		}
		else {

			return false;
		}

		
	};

	return {
		parser: parser
	};

}

module.exports = exports = new LogicConditionalSeperator();