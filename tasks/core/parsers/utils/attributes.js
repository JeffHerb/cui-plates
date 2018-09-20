// Load global utility libs
import Context from '../../utils/context';

class Attributes {

	constuctor() {

	}

	parse(dNodeElem, oContext, oASTNode) {

		let oFinishedAttributes = {};

		if (oASTNode.block.length) {}

		// Start with simple attributes
		if (oASTNode.simple.length) {

			for (let oAttr of oASTNode.simple) {

				let bCreateAttr = false;
				let sKey = false;
				let sValue = false;

				switch (oAttr.value.type) {

					case "static":

						if (oAttr.value.value) {
							sKey = oAttr.name;
							sValue = oAttr.value.value;

							// Enable the create logic
							bCreateAttr = true;
						}


						break;

					case "logic":

						let contextValue = Context.find(oAttr.value.value, oContext, true);

						// Check to see if something was returned, if it was then we will 
						if (contextValue !== null) {

							sKey = oAttr.name;
							sValue = contextValue;

							bCreateAttr = true;
						}

						break;

				}

				if (bCreateAttr) {

					if (!oFinishedAttributes[sKey]) {
						oFinishedAttributes[sKey] = "";
					}

					oFinishedAttributes[sKey] = (" " + sValue).trim();

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