import Context from '../utils/context';

class If {

	constuctor() {

	}

	parser(oContext, aConditionals, oFallback) {

		// Verify we have conditions to check
		if (aConditionals.length) {

			let vReturningContext = false;

			// Loop through all of the conditions till we find a true.
			for (let c = 0, cLen = aConditionals.length; c < cLen; c++) {

				let oConditional = aConditionals[c];

				// Check to see if the conditional blocks are simple or specific
				if (oConditional.aConditions.length === 1) {

					let sSimpleCondition = oConditional.aConditions[0];

					let vContext = Context.find(sSimpleCondition, oContext);

					if (vContext) {
						vReturningContext = oConditional.contents;
						break;
					}	

				}
				else {

					console.log("More complex conditions");
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