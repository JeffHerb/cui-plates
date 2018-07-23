class Text {

	constuctor() {

	}

	parse(oContext, oASTNode) {

		// Start by creating the element,
		let textNode = document.createTextNode(oASTNode.text);

		//console.log("textNode", textNode);

		return textNode;
	}

}

export default new Text();