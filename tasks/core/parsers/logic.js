// Function handles all context based results
const CONTEXT_PARSER = (oContext, oASTNode) => {


	let sContext = oASTNode.contents;

	console.log(oContext);

}

class Logic {

	constuctor() {

	}

	parse(oContext, oASTNode) {

		let logicResults = false;
		let fParseMethod = false;

		// Figure out what parser method to use based on the provided tag context
		switch (oASTNode.tag) {

			case "context":
				fParseMethod = CONTEXT_PARSER;
				break;

		}

		logicResults = fParseMethod(oContext, oASTNode);

	}

}

export default new Logic();