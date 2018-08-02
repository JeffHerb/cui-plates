const FIND_CONTEXT = (sContextPath, oContext) => {

	let aContextPath = sContextPath.split('.');

	let oCurrentContext = oContext;

	for (let iPath = 0, iLen = aContextPath.length; iPath < iLen; iPath++) {

		// Skip over this if its at the beginning
		if (iPath === 0  && aContextPath[iPath].trim() === "this") {
			continue;
		}

		if (oCurrentContext[aContextPath[iPath]]) {

			oCurrentContext = oCurrentContext[aContextPath[iPath]];

		}
		else {

			return false;
		}

	}

	return oCurrentContext;
};


// Function handles all context based results
const CONTEXT_PARSER = (oContext, oASTNode, sScope) => {

	console.log(oASTNode);

	// Yank out the context text string since that is what context is looking at.
	let sContextPath = oASTNode.text;

	// If there is a context path continue
	if (sContextPath.length) {

		let contextValue = FIND_CONTEXT(sContextPath, oContext);

		if (contextValue) {

			switch (typeof contextValue) {

				case "string":

					// Check scope for action for pages, if they are we need to generate text node element
					if (sScope === "page") {

						contextValue = document.createTextNode(contextValue);
					}

					break;

				case "object":

					console.log("We got an object");

					break;

				default:

					console.error("Unknown result type!");

					break;
			}

			return contextValue;
		}

	}

	return false;
};

class Logic {

	constuctor() {

	}

	parse(oContext, oASTNode, sScope) {

		let logicResults = false;
		let fParseMethod = false;

		// Figure out what parser method to use based on the provided tag context
		switch (oASTNode.tag) {

			case "context":
				fParseMethod = CONTEXT_PARSER;
				break;

		}

		// Execute the logic parser. Depending on what we are calling and were we are the datatype is varied.
		logicResults = fParseMethod(oContext, oASTNode, sScope);

		console.log(logicResults);

		return logicResults;
	}

}

export default new Logic();