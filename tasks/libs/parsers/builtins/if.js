const LogicAttributes   = require('../utils/logic-attributes');
const LogicConditionals = require('../utils/logic-conditionals');
const LogicConditionalSeperator = require('../utils/logic-conditional-seperator');

const aConditionals = ['elseif', 'else'];
const sFallback = 'else';

var If = function _if_parser() {

	// This is the parser for this type of template contents.
	const parser = (oLogicSection) => {

		let oCompliedAST = {
			sMethod: "if",
			aConditionals: false,
			oFallback: false
		};

		let aSourceTagAttributes = LogicAttributes.parser(oLogicSection.oSectionMeta.oOpening.sTag);

		if (aSourceTagAttributes.length > 1) {

			let oConditionalBreakdown = LogicConditionalSeperator.parser(aConditionals, sFallback, aSourceTagAttributes, oLogicSection.sBlockContents);

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

				// Switch returned no conditionals! This is not possible!
				return false;
			}

		}
		else {

			let error = new Error(`|template.path| if block has no arguments, minimually if require a single value or a set of 2 values and operator.`)
		}
	};

	return {
		parser: parser,
	}

}

module.exports = exports = new If();