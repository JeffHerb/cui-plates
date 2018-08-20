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

						// Get all the text up to this matching condtional (it belongs to the previous one)
						sBeforeConditional = sSourceTemplate.slice(iLastConditionalIndex, reNextConditional.index);

						// Check string for possible matching child logic block
						let reSubBlockCheck = LogicBlock.check(sBeforeConditional, "switch");

						if (reSubBlockCheck) {

							// Get the remaining text because now we need to 
							let sRemainingBlock = sSourceTemplate.slice(iLastConditionalIndex);

							// Replace the input with the most up-todate version
							reSubBlockCheck.input = sRemainingBlock;

							let iRemainingBlockLength = sRemainingBlock.length;

							let iSubBlockStart = reSubBlockCheck.index;

							let oSubLogicSection = LogicBlock.find(reSubBlockCheck)

							let iTotalBlockSpan = iSubBlockStart + oSubLogicSection.oSectionMeta.oClosing.iEnd + oSubLogicSection.oSectionMeta.oClosing.sTag.length;
							let iTotalBlockSpan2 = oSubLogicSection.oSectionMeta.iContentLength + oSubLogicSection.oSectionMeta.oOpening.iStart;

							console.log("Sub Block found!");
							console.log();
							console.log("sRemaining", sRemainingBlock);
							console.log("sRemaining length", sRemainingBlock.length);
							console.log("Section length", oSubLogicSection.oSectionMeta.iContentLength);
							console.log("Total Secton length", oSubLogicSection.oSectionMeta.iTotalBlockLength);

							console.log("Total SubBlock Span", iTotalBlockSpan);
							console.log("Total SubBlock Span 2", iTotalBlockSpan2);

							continue;

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

					// Check string for possible matching child logic block
					let bSubBlockCheck = LogicBlock.check(sBeforeConditional, "switch");

					if (bSubBlockCheck) {
						console.log("Sub Block found at end!");
					}

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