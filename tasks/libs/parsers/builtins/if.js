const LogicAttributes   = require('../utils/logic-attributes');
const LogicConditionals = require('../utils/logic-conditionals');
const LogicConditionalSeperator = require('../utils/logic-conditional-seperator');

const aConditionals = ['elseif', 'else'];
const sFallback = 'else';

var If = function _if_parser() {

	// This is the parser for this type of template contents.
	const parser = (oLogicSection) => {

		let oComplicedAST = {
			sMethod: "if",
			aConditionals: false,
			oFallback: false
		};

		console.log("In if block parser");

		console.log(oLogicSection);

		let aSourceTagAttributes = LogicAttributes.parser(oLogicSection.oSectionMeta.oOpening.sTag);

		console.log(aSourceTagAttributes);

		if (aSourceTagAttributes.length > 1) {

			aSourceTagAttributes.shift();

			let aMainConditions = aSourceTagAttributes.concat();

			let aConditionalsBreakdown = LogicConditionalSeperator.parser(aConditionals, sFallback, aSourceTagAttributes, oLogicSection.sBlockContents);

			console.log(aConditionalsBreakdown);

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