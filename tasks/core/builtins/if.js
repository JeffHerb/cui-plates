import Context from '../utils/context';

const SIMPLE_CONDITIONAL = (v1, oContext) => {

	if (typeof v1 === "string") {

		return Context.find(v1, oContext);

	}
	else if (typeof v1 === "boolean") {

		return v1;
	}

	return false;
};

const COMPLEX_CONDITIONAL = (oTestConditional, oContext) => {

	let vRawV1 = null;
	let vRawV2 = null;

	// Get the raw v1 value!
	if (oTestConditional.v1.type === "simple") {

		vRawV1 = Context.find(oTestConditional.v1.value, oContext);

	}
	else {

		vRawV1 = COMPLEX_CONDITIONAL(oTestConditional.v1, oContext);
	}

	if (oTestConditional.v2.type === "simple") {

		vRawV2 = Context.find(oTestConditional.v2.value, oContext);
	}
	else {

		vRawV2 = COMPLEX_CONDITIONAL(oTestConditional.v2, oContext);
	}

	console.log(vRawV1, oTestConditional.op, vRawV2);

	switch (oTestConditional.op) {

		case "==":

			return (vRawV1 == vRawV2) ? true : false;
			break;

		case "===":

			return (vRawV1 === vRawV2) ? true : false;			
			break;

	}

	return false;

}

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

				console.log(aConditionals);

				// Loops through the individual conditional statements (simple/complex)
				conditionals:
				for (let t = 0, tLen = aTestConditions.length; t < tLen; t++) {

					let oTest = aTestConditions[t];

					if (oTest.type === "simple") {

						bConditionalPass = SIMPLE_CONDITIONAL(oTest.test, oContext);
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

}

export default new If();