class Comment {

	constuctor() {

	}

	parse(oContext, oASTNode) {

		// Check to see if this browser support comments appedning before creating it.
		if (document.createComment) {

			return document.createComment(oASTNode.text);
		}

		return false;
	}

}

export default new Comment();