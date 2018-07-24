class Attributes {

	constuctor() {

	}

	parse(dNodeElem, oContext, oASTNode) {

		let oFinishedAttributes = {};

		if (oASTNode.block.length) {}

		// Start with simple attributes
		if (oASTNode.simple.length) {

			for (let oAttr of oASTNode.simple) {

				// Check the name type
				if (oAttr.oName.sNode === "static") {

					// check to see if the attributes exist
					if (!oFinishedAttributes[oAttr.oName.sName]) {
						oFinishedAttributes[oAttr.oName.sName] = "";
					}

				}
				else {

					console.log("We need to figure out the attribute name");

				}

				// Check the value type
				if (oAttr.oValue.sNode === "static") {
					oFinishedAttributes[oAttr.oName.sName] += ` ${oAttr.oValue.contents}`;
				}
				else {

					// This is the other stuff
				}

			}

		}

		if (Object.keys(oFinishedAttributes).length) {
			
			for (let attr in oFinishedAttributes) {

				dNodeElem.setAttribute(attr, oFinishedAttributes[attr].trim());
			}

		}

	}

}

export default new Attributes();