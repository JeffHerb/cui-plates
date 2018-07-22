class Elem {

	constuctor() {

	}

	parse(oContext, oASTNode) {

		console.log("In Elem node processor");

		// Start by creating the element,
		let dNodeElem = document.createElement(oASTNode.tag);


		return dNodeElem;

	}

}

export default new Elem();