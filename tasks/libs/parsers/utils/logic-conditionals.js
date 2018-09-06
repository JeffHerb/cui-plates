const LOGIC_SUPPORT_OPERATORS = ['==', '!=', '===', '!==', '<', '<=', '>', '>='];

var LogicConditionals = function _logic_attributes() {

	const parser = (aConditionals) => {

		const CLEANUP_DATA_TYPE = (value) => {

			if ((typeof value === "string")) {

				// Check for double or single wrapping qoutes as we need to assume it might be a static string
				if (/^['|"].*['|"]$/.test(value)) {

					console.log("wrapped string");

					return {
						type: "static",
						value: value.slice(1, -1)
					};

				}
				// The value was not likely wrapped in ""
				else {

					// Handle Numbers
					if (!isNaN(value)) {

						return {
							type: "static",
							value: parseInt(value)
						}
					}
					// Handle strings that should be booleans
					else if (value === "true") {

						return {
							type: "static",
							value: true
						}
					}
					else if (value === "false") {

						return {
							type: "static",
							value: false
						}

					}
					// Handles everything else as a potential context string which will evaluate to true or false.
					else {

						return {
							type: "reference",
							value: value
						}
					}
				}
			}
		}

		let aConditionalsObjSet = [];

		if (!aConditionals.length) {
			return false;
		}

		// Check to see how many conditionals we have. It should be either a multiple of 3 or a single 1 for simple.
		if (aConditionals.length === 1) {

			let oValue = CLEANUP_DATA_TYPE(aConditionals[0]);

			aConditionalsObjSet.push(
				{
					"type": "simple",
					"test": {						
						"type": oValue.type,
						"value": oValue.value
					}
				}
			);
			
		}
		else if ((aConditionals.length % 3) === 0) {

			(function nextConditonalSet(aAllConditionals) {

				// Get the next three properties
				let aNextSet = aAllConditionals.slice(0, 3);

				// Rmeove them from the old array
				aAllConditionals = aAllConditionals.slice(3);

				let oComplexConditonal = {
					"type": "complex",
					"test": {				
						"v1": false,
						"op": false,
						"v2": false
					}
				};

				let error = false;

				// Loop through and look at each part!
				for (let ci = 0, ciLen = 3; ci < ciLen; ci++) {

					if (ci === 0 || ci === 2) {

						console.log(aNextSet[ci]);

						let reConditionalWrapTest = false; //LOGIC_TAG_CONDTIONAL_WRAPPED.exec(aNextSet[ci]);

						// Check if null if so we have a context or static value
						if (!reConditionalWrapTest) {

							let oCleanedValue = CLEANUP_DATA_TYPE(aNextSet[ci]);

							oComplexConditonal.test[((ci === 0) ? "v1" : "v2")] = {
								"type": oCleanedValue.type,
								"value": oCleanedValue.value
							}
						}
						else {

							oComplexConditonal.test[((ci === 0) ? "v1" : "v2")] = {
								"type": "conditional",
								"value": {}
							}

						}

					}
					else {

						if (LOGIC_SUPPORT_OPERATORS.indexOf(aNextSet[ci]) !== -1) {

							oComplexConditonal.test.op = aNextSet[ci];

						}
						else {

							error = new Error (`Invalid conditional operator specified ${aNextSet[ci]} in |template.path|.`);

							break; 
						}

					}

				}

				if (error) {

					return error;
				}
				else {

					aConditionalsObjSet.push(oComplexConditonal);
				}

				if (aAllConditionals.length) {
					nextConditonalSet(aAllConditionals);
				}
				else {
					return aConditionalsObjSet;
				}

			})(aConditionals.concat());

		}

		return aConditionalsObjSet;
	};

	return {
		parser: parser
	};

}

module.exports = exports = new LogicConditionals();