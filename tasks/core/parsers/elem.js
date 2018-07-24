import ATTRIBUTES_PARSER from './utils/attributes';

class Elem {

	constuctor() {

	}

	parse(oContext, oASTNode) {

		// Start by creating the element,
		let dNodeElem = document.createElement(oASTNode.tag);

		if (oASTNode.attributes) {

			ATTRIBUTES_PARSER.parse(dNodeElem, oContext, oASTNode.attributes);
		}

		// Return this element!
		return dNodeElem;

	}

}

export default new Elem();