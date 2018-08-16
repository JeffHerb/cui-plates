// Load all the block level libs
import If from '../builtins/if';
import Switch from '../builtins/switch';

// Load global utility libs
import Context from '../utils/context';

const oBlockLibs = {
	"if": If.parser,
	"switch": Switch.parser
};

// Function handles all context based results
const CONTEXT_PARSER = (oContext, oASTNode, sScope) => {

	// Yank out the context text string since that is what context is looking at.
	let sContextPath = oASTNode.text;

	// If there is a context path continue
	if (sContextPath.length) {

		let contextValue = Context.find(sContextPath, oContext);

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

const BLOCK_PARSER = (oContext, oASTNode, sScope) => {

	let oResults = false;

	// Check for and call the correct method parser
	if (oBlockLibs[oASTNode.method]) {

		oResults = oBlockLibs[oASTNode.method](oContext, oASTNode);
	}
	else {

		console.log(`Unsupported Block level method called: ${oASTNode.method}`);
	}

	return oResults;
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

			case "block":
				fParseMethod = BLOCK_PARSER;
				break;

		}

		// Execute the logic parser. Depending on what we are calling and were we are the datatype is varied.
		logicResults = fParseMethod(oContext, oASTNode, sScope);

		// console.log(logicResults);

		return logicResults;
	}

}

export default new Logic();