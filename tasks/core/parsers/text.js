class Text {

	constuctor() {

	}

	parse(oContext, oASTNode) {

		// This is simple so just put the text into the text node and return the whole node.
		return document.createTextNode(oASTNode.text);;
	}

}

export default new Text();