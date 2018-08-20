const LogicAttributes   = require('../utils/logic-attributes');
const LogicConditionals = require('../utils/logic-conditionals');
const LogicConditionalSeperator = require('../utils/logic-conditional-seperator');

const aConditionals = ['case', 'default'];
const sFallback = 'default';

var Switch = function _switch_parser() {

	// This is the parser for this type of template contents.
	const parser = (oLogicSection) => {

		let oCompliedAST = {
			sMethod: "switch",
			oGlobalConditional: false,
			aConditionals: false,
			oFallback: false
		};

		// Start by checking for conditional sections
		let aSourceTagAttributes = LogicAttributes.parser(oLogicSection.oSectionMeta.oOpening.sTag);

		if (aSourceTagAttributes.length === 2) {

			// Start by handling the source tag for the switch block
			oCompliedAST.oGlobalConditional = LogicConditionals.parser([ aSourceTagAttributes[1] ])[0];

			// Now we need to find all of the conditionals.
			let aConditionalsBreakdown = LogicConditionalSeperator.parser(aConditionals, sFallback, oCompliedAST.sMethod, oLogicSection.sBlockContents);

			if (aConditionalsBreakdown instanceof Error) {
				return aConditionalsBreakdown;
			}

			if (aConditionalsBreakdown) {

				for (let condition of aConditionalsBreakdown.aConditionals) {

					let aSwitchConditions = LogicAttributes.parser(condition.conditional);

					if (aSwitchConditions.length === 2) {

						let oCaseCondtional = LogicConditionals.parser([ aSwitchConditions[1] ]);

						condition.conditional = oCaseCondtional;
					}
					else {

						let error = new Error(`|template.path| switch case conditional has a conditional block that contains too many or no conditional comparisions. Switch conditions should be a single static value or contextual reference. Switch ${oLogicSection.oSectionMeta.oOpening.sTag} and condition block ${condition.conditional}`);

						return error;
					}
				}

				// Save off the parsed conditionals
				oCompliedAST.aConditionals = aConditionalsBreakdown.aConditionals;

				oCompliedAST.oFallback = aConditionalsBreakdown.oFallbackCondition;

				return {
					oAST: oCompliedAST,
					aSubProcess: ['conditionals', 'fallback']
				}
			}
			else {

				// Switch returned no conditionals! This is not possible!
				return false;
			}

		}
		else {

			let error = new Error(`|template.path| switch block contained an invalid number of source arguments: ${oLogicSection.oSectionMeta.oOpening.sTag}`);

			return error;
		}

	};

	return {
		parser: parser,
	};

}

module.exports = exports = new Switch();