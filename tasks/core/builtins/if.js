import Context from '../utils/context';

const complexIfEvaluation = function _complex_if_evaluation(oTextCondtionals, oContext) {

	let v1 = false;
	let v2 = false;

	if (oTextCondtionals.v1.type === "reference") {
		v1 = Context.find(oTextCondtionals.v1.value, oContext);
	}
	else {
		v1 = oTextCondtionals.v1.value;
	}

	if (oTextCondtionals.v2.type === "reference") {
		v2 = Context.find(oTextCondtionals.v2.value, oContext);
	}
	else {
		v2 = oTextCondtionals.v2.value;
	}

	switch (oTextCondtionals.op) {

		case "==":

			return (v1 == v2) ? true : false;
			break;

		case "!=":

			return (v1 != v2) ? true : false;
			break;

		case "===":

			return (v1 === v2) ? true : false;
			break;

		case "!==":

			return (v1 !== v2) ? true : false;
			break;

		case "<":

			return (v1 < v2) ? true : false;
			break;

		case "<=":

			return (v1 <= v2) ? true : false;
			break;

		case ">":

			return (v1 < v2) ? true : false;
			break;

		case ">=":

			return (v1 <= v2) ? true : false;
			break;

	}

};

class If {

	constuctor() {

	}

	parser(oContext, oConditionals, sScope) {

		let aEndConditionalContents = false;

		allCondtionals:
		for (let ocb = 0, ocbLen = oConditionals.conditionals.length; ocb < ocbLen; ocb++) {

			let aCurrentConditionals = oConditionals.conditionals[ocb].conditional;

			for (let oConditional of aCurrentConditionals) {

				// Check to see if we have a simple or complex conditional test
				if (oConditional.type === "simple") {

					if (oConditional.test.type === "reference") {

						if (Context.find(oConditional.test.value, oContext)) {

							aEndConditionalContents = oConditionals.conditionals[ocb].contents;
							break allCondtionals;
						}

					}
					else if (oConditional.test.type === "simple") {

						if (oConditional.test.value) {
							aEndConditionalContents = oConditionals.conditionals[ocb].contents;
							break allCondtionals;
						}

					}

				}
				else {

					let bComplexResult = complexIfEvaluation(oConditional.test, oContext);

					if (bComplexResult) {

						aEndConditionalContents = oConditionals.conditionals[ocb].contents;
					}

					break allCondtionals;
				}
			}

			// Check to see if conditional contents were found and break
			if (aEndConditionalContents) {
				break;
			}

		}

		// Test to see if we got contents, if we do return them!
		if (aEndConditionalContents) {
			return aEndConditionalContents;
		}
		// Since end condtional was not set, check for fallback and return that if it exists
		else if (oConditionals.fallback) {
			return oConditionals.fallback.contents;
		}

		return false;
	}
};

export default new If();