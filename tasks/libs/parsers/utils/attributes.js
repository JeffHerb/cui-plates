
const ATTR_EQUAL_SPLITER = /\=(?:\")/g;
const ATTR_LOGIC_CHECK = /[{]{2}(?:[\#\.\@\>]?[^\}]+)[}]{2}/g;

const ATTRIBUTE_VALUE_CLEANUP = (sAttrValue) => {

	return sAttrValue.replace(/['|"]/g, '');
};

// This function is used when we have a simple attribute using static values or logic context values
const SIMPLE_ATTRIBUTE = (reAttribute) => {

	let oSimpleAttr = {
		oName: {
			sNode: false,
			sName: false
		},
		oValue: {
			sNode: false,
			contents: false
		}
	};

	// Start by spliting on equal
	let sAttribute = reAttribute.input;
	let aAttribute = sAttribute.split('=');

	let sAttributeName = aAttribute[0];
	let sAttributeValue = aAttribute[1];

	// check to see if the name has logic tags
	let reNameCheck = ATTR_LOGIC_CHECK.exec(sAttributeName);

	if (reNameCheck) {
		console.log("Name logic found");
	}
	else {

		oSimpleAttr.oName.sNode = "static",
		oSimpleAttr.oName.sName = sAttributeName;
	}

	let reValueCheck = ATTR_LOGIC_CHECK.exec(sAttributeValue);

	if (reValueCheck) {

		console.log("value logic found");
	}
	else {

		oSimpleAttr.oValue.sNode = "static";

		let sAttributeCleaned = ATTRIBUTE_VALUE_CLEANUP(sAttributeValue);

		oSimpleAttr.oValue.contents = sAttributeCleaned;
	}

	// Check to see if the value has logic tags

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

				// Check to see if a single '=' was found
				if (sAttribute.match(ATTR_EQUAL_SPLITER).length) {

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