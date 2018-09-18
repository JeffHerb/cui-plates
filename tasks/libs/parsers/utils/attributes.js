
const ATTR_EQUAL_SPLITER = /\=(?:\")/g;
const ATTR_LOGIC_CHECK = /[{]{2}(?:[\@|\.]?[^\}]+)[}]{2}/g;
const ATTR_LOGIC_CONTEXT_VALUE_CHECK = /(?:[a-zA-Z\-]*?)\=['|"]\s*\{{2}(?:[a-zA-Z0-9\.]*)\}{2}['|"]/;

const ATTRIBUTE_VALUE_CLEANUP = (sAttrValue) => {

	return sAttrValue.replace(/['|"]/g, '');
};

// This function is used when we have a simple attribute using static values or logic context values
const SIMPLE_ATTRIBUTE = (reAttribute) => {

	let oSimpleAttr = {
		name: false,
		value: {
			type: false,
			contents: false
		}
	};

	// Start by spliting on equal
	let sAttribute = reAttribute.input;
	let aAttribute = sAttribute.split('=');

	let sAttributeName = aAttribute[0];
	let sAttributeValue = aAttribute[1];

	oSimpleAttr.name = sAttributeName;

	oSimpleAttr.value.type = "static";

	// Clean up the attribute value
	let sAttributeCleaned = ATTRIBUTE_VALUE_CLEANUP(sAttributeValue);

	oSimpleAttr.value.contents = sAttributeCleaned;

	return oSimpleAttr;
};

// This function will break apart the simple complex 
const SIMPLE_LOGIC_ATTRIBUTE = (sAttribute) => {

	let oSimpleAttr = {
		name: false,
		value: {
			type: false,
			contents: false
		}
	};

	// Start by cutting up the string
	let aAttribute = sAttribute.split('=');

	let sAttributeName = aAttribute[0];
	let sAttributeValue = aAttribute[1];

	oSimpleAttr.name = sAttributeName;

	oSimpleAttr.value.type = "reference";

	return oSimpleAttr;
};

var ATTRparser = function _attr_parser() {

	const parser = (aAttributes) => {

		let oAttrAST = {
			block: [],
			simple: []
		};

		if (aAttributes) {

			// Loop through all the attributes
			for (let sAttribute of aAttributes) {

				// Test for inline logic characters
				if (ATTR_LOGIC_CHECK.test(sAttribute)) {
					
					// We know we have a logic tag, now we need to know what kind of logic
						// Simple Inline Context class="{{value}}"
						// Complex Inline function/helpers {{@ this.input}}

					// Start by checking for the simple logic value context as its the easiers to identify
					let bSimpleLogicValue = ATTR_LOGIC_CONTEXT_VALUE_CHECK.test(sAttribute);

					if (bSimpleLogicValue) {

						let oSimpleContextAttr = SIMPLE_LOGIC_ATTRIBUTE(sAttribute);

						oAttrAST.simple.push(oSimpleContextAttr);
					}



				}
				else if (sAttribute.match(ATTR_EQUAL_SPLITER).length) {

					let oSimpleAttr = SIMPLE_ATTRIBUTE(ATTR_EQUAL_SPLITER.exec(sAttribute));

					oAttrAST.simple.push(oSimpleAttr);
				}

			}

		}

		return oAttrAST;

	}

	return {
		parser: parser
	};

}

module.exports = exports = new ATTRparser();