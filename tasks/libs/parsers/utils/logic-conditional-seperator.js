const LogicAttributes   = require('../utils/logic-attributes');
const LogicBlock 		= require('./logic-block');

var LogicConditionalSeperator = function _logic_attributes() {

	const parser = (aConditionalSeperators, sFallbackSepeorator, sRootMethod, sSourceTemplate) => {

		console.log(aConditionalSeperators, sFallbackSepeorator, sRootMethod, sSourceTemplate);

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

			console.log();
			console.log();

			while(true) {

				// Execute a lookup to find the next conditional sperator
				let reNextConditional = reConditionalSeperator.exec(sSourceTemplate);

				console.log(reNextConditional);

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

						// Check to see if we have a lastCondtional yet, if we dont and the index is still at 0 then the conditional block has direct children (ex if)
						if (sLastConditionalTag === false) {
							sLastConditionalTag = sRootMethod;
						}

						// Double check to make sure we are not inside of the skip range.
						if (reNextConditional.index <= iSkipSection) {
							continue;
						}
						else {
							iSkipSection = false;
						}

						// Get all the text up to this matching condtional (it belongs to the previous one)
						sBeforeConditional = sSourceTemplate.slice(iLastConditionalIndex, reNextConditional.index);

						console.log(sBeforeConditional);

						// Check string for possible matching child logic block
						let reSubBlockCheck = LogicBlock.check(sBeforeConditional, sRootMethod);

						if (reSubBlockCheck) {

							console.log("Sub found!");

							let sRemainingConditional = sSourceTemplate.slice(iLastConditionalIndex);

							// Update the input to include everything yet to be seperated
							reSubBlockCheck.input = sRemainingConditional;

							let oSubLogicBlockSection = LogicBlock.find(reSubBlockCheck);

							if (oSubLogicBlockSection instanceof Error) {
								return oSubLogicBlockSection;		
							}

							iSkipSection = iLastConditionalIndex + (reSubBlockCheck.index + oSubLogicBlockSection.oSectionMeta.iTotalBlockLength);

							console.log(iSkipSection);
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