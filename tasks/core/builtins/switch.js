import Context from '../utils/context';

class Switch {

	constuctor() {

	}

	parser(oContext, oASTNode) {

		let oGlobalConditional = oASTNode.globalConditional[0];
		let vGlobalSwitchValue = null;

		let aCondtionalContents = false;

		// Check and resolve the global switch value
		if (oGlobalConditional.test.type === "reference") {

			vGlobalSwitchValue = Context.find(oGlobalConditional.test.value, oContext);
		}
		else {
			vGlobalSwitchValue = oGlobalConditional.test.value;
		}

		// Loop through every conditional set to see if we can find a match, if so save of the contents.
		for (let ocb = 0, ocbLen = oASTNode.conditionals.length; ocb < ocbLen; ocb++) {

			let oConditional = oASTNode.conditionals[ocb];

			let oConditionalTest = oASTNode.conditionals[ocb].conditional[0].test;

			if (oConditionalTest.type === "static") {

				if (oConditionalTest.value === vGlobalSwitchValue) {

					return oASTNode.conditionals[ocb].contents;
				}

			}
			else if (oConditionalTest.type === "reference") {

				let vCondtionalValue = Context.find(oConditionalTest.value, oContext);

				if (vCondtionalValue === vGlobalSwitchValue) {

					return oASTNode.conditionals[ocb].contents;
				}

			}
		}

		// Check to see if we dont have a conditonal result yet, if we dont test for a fallback conditional set.
		if (!aCondtionalContents && oASTNode.fallback && oASTNode.fallback.contents && oASTNode.fallback.contents.length) {
			return oASTNode.fallback.contents;
		}

		return false;
	}
};

export default new Switch();