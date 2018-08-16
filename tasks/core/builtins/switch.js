import Context from '../utils/context';

class Switch {

	constuctor() {

	}

	parser(oContext, oASTNode) {

		// Since we have a switch we need to determine the actual context value we are trying to match
		let vActualContextValue = Context.find(oASTNode.globalConditional.test, oContext);
		let oSwitchContent = false;
		let vConditionalValue = false;

		// Now we need to loop through all of the conditional values until we get a match or reach the end
		for (let c = 0, cLen = oASTNode.conditionals.length; c < cLen; c++) {

			let oConditional = oASTNode.conditionals[c].conditional[0];

			if (oConditional.type === "static") {
				vConditionalValue = oConditional.test;
			}
			else if (oConditional.type === "reference") {
				vConditionalValue = Context.find(oConditional.test, oContext);
			}

			if (vActualContextValue === vConditionalValue) {

				oSwitchContent = oASTNode.conditionals[c].contents;
				break;
			}

		}

		console.log(oSwitchContent);
		console.log(oASTNode);

		if (!oSwitchContent && oASTNode.fallback) {
			oSwitchContent = oASTNode.fallback;
		}

		if (oSwitchContent) {
			return oSwitchContent;
		}

		return false;
	}
};

export default new Switch();