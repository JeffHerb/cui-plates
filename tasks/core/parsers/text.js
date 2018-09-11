
const reUniCodeTest = /\\u([\d\w]{4})/gi;

class Text {

	constuctor() {

	}

	parse(oContext, oASTNode) {

		// Check for unicode characters and if any are found, convert them into strings that javascript can handle.
		if (reUniCodeTest.test(oASTNode.text)) {
			
			oASTNode.text = oASTNode.text.replace(reUniCodeTest, 
				function (match, grp) {
    				return String.fromCharCode(parseInt(grp, 16));
    			} 
    		);

		}

		// This is simple so just put the text into the text node and return the whole node.
		return document.createTextNode(oASTNode.text);
	}

}

export default new Text();