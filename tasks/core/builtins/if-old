import Context from '../utils/context';

const SIMPLE_CONDITIONAL = (v1, oContext) => {

	let v1Value = false;

	if (v1.type === "reference") {

		v1Value = Context.find(v1.test, oContext);

	}
	else {

		v1Value = v1.test;
	}

	// Check the simple value data types
	// Just return booleans
	if (typeof v1Value === "boolean") {

		return v1Value;
	}
	// If number, anything bigger than 0 is true
	else if (!isNaN(v1Value)) {

		if (v1Value <= 0) {

			return false;
		}
		else {

			return true;
		}

	}
	// If string, anything with length is true
	else {

		if (v1Value.length) {
			return true;
		}
		else {
			return false;
		}
	}
};

const COMPLEX_CONDITIONAL = (oTestConditional, oContext) => {

	const EXTRACT_VALUE = (oCondition) => {

		if (oCondition.type === "static") {

			return oCondition.value;	
		}
		else if (oCondition.type === "reference") {

			return Context.find(oCondition.value, oContext);
		}
		else {

			return COMPLEX_CONDITIONAL(oCondition, oContext);
		}

	}

	let vRawV1 = EXTRACT_VALUE(oTestConditional.v1);
	let vRawV2 = EXTRACT_VALUE(oTestConditional.v2);;

	console.log(vRawV1, vRawV2);

	switch (oTestConditional.op) {

		case "==":

			return (vRawV1 == vRawV2) ? true : false;

		case "===":

			return (vRawV1 === vRawV2) ? true : false;			

		case "!=":

			return (vRawV1 != vRawV2) ? true : false;

		case "!==":

			return (vRawV1 != vRawV2) ? true : false;

		case "<":

			return (vRawV1 < vRawV2) ? true : false;

		case "<=":

			return (vRawV1 <= vRawV2) ? true : false;

		case ">":

			return (vRawV1 > vRawV2) ? true : false;

		case ">=":

			return (vRawV1 >= vRawV2) ? true : false;

	}

	return false;
};

class If {

	constuctor() {

	}

	parser(oContext, aConditionals, oFallback) {

		// Verify we have conditions to check
		if (aConditionals.length) {

			let vReturningContext = false;

			// Loop through all of the conditions till we find a true.
			// This is all the block level, not the indivual conditions
			let bConditionalPass = true;

			block:
			for (let c = 0, cLen = aConditionals.length; c < cLen; c++) {

				let oConditionalBlock = aConditionals[c];
				let aTestConditions = oConditionalBlock.aConditions;

				// Loops through the individual conditional statements (simple/complex)
				conditionals:
				for (let t = 0, tLen = aTestConditions.length; t < tLen; t++) {

					let oTest = aTestConditions[t];

					if (oTest.type === "static" || oTest.type === "reference") {

						bConditionalPass = SIMPLE_CONDITIONAL(oTest, oContext);
					}
					else {

						bConditionalPass = COMPLEX_CONDITIONAL(oTest.test, oContext);
					}

					// Check if we can continue
					if (!bConditionalPass) {
						break block;
					}

				}

				if (bConditionalPass) {

					vReturningContext = oConditionalBlock.contents;
					break;
				}

			}

			if (!vReturningContext && oFallback && oFallback.contents) {
				vReturningContext = oFallback.contents;
			}

			return vReturningContext;

		}
		else {

			return false;
		}

	}
};

export default new If();