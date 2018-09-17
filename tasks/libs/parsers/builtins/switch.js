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

			let aGlobalConditional = [ aSourceTagAttributes[1] ];

			// Seperate all of the case and default tags
			let oConditionalBreakdown = LogicConditionalSeperator.parser(aConditionals, sFallback, aSourceTagAttributes, oLogicSection.sBlockContents);

			oCompliedAST.oGlobalConditional = LogicConditionals.parser(aGlobalConditional);

			if (oConditionalBreakdown instanceof Error) {
				return oConditionalBreakdown;
			}

			if (oConditionalBreakdown && oConditionalBreakdown.aConditionals && oConditionalBreakdown.aConditionals.length) {

				for (let condition of oConditionalBreakdown.aConditionals) {

					let oConditional = LogicConditionals.parser(condition.conditional);

					condition.conditional = oConditional;
				}

				// Save off the parsed conditionals
				oCompliedAST.aConditionals = oConditionalBreakdown.aConditionals;

				oCompliedAST.oFallback = oConditionalBreakdown.oFallbackCondition;

				return {
					oAST: oCompliedAST,
					aSubProcess: ['conditionals', 'fallback']
				}
			}
			else {

				return {
					oAST: oCompliedAST,
					aSubProcess: false
				}

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