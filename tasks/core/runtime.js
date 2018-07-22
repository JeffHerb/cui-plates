import "babel-polyfill";
import { templates } from 'templates';

// Local Core Parser Libs
import elem from './parsers/elem';

const ASTs = templates;

// Helper function that determins the proper AST template and calls the corresponding parser functions
const ASTsToDOM = (oContext, aPassedAST) => {

	let aRootAST = false;
	let dCompiledAST = false; //document.createDocumentFragment();

	if (aPassedAST) {

		console.log("We need to use the passed AST credentials.");

		aRootAST = aPassedAST.slice();

	}
	else if (oContext && oContext.template) {

		aRootAST = ASTs[oContext.template].slice();

	}
	else {

		console.log("We should error!");
	}

	// Now process down the AST
	console.log(aRootAST);

	(function nextASTNode(aAST) {

		let oCurrentNode = aAST.shift();
		let fNodeParser = false;

		console.log("Current node: ", oCurrentNode);

		// Determin the node type and process down that node into a actual document fragment
		switch (oCurrentNode.node) {

			case "elem":

				fNodeParser = elem.parse;

				break;

			default:

				console.log("Unknown node prasesor");

				break;

		}

		let dASTDOM = fNodeParser(oContext, oCurrentNode);

		console.log("What was compiled: ", dASTDOM);

		// Check to see if something was returned
		if (dASTDOM) {

			console.log("Generated: ", dASTDOM)
		}
		else {

			if (aAST.length) {
				nextASTNode(aAST);
			}
		}

	})(aRootAST.slice());

};

// Generator will loop through a context array and parse them one at a time.
const Generator = (aContext) => {

	let dDOMFragment = false; //document.createDocumentFragment();

	(function nextContext(aContexts) {

		let oCurrentContext = aContexts.shift();

		console.log("oCurrentContext", oCurrentContext);

		// Porcess said context
		let processedContext = ASTsToDOM(oCurrentContext);

		console.log("processedContext", processedContext);

		if (aContexts.length) {
			nextContext(aContexts);
		}

	})(aContext);

	// // Loop over the context
	// for (let nextContext of aContext) {

	// 	let compiledContext = ASTsToDOM(nextContext);

	// 	if (compiledContext instanceof Error) {

	// 		console.error(Error.message);

	// 		return false;

	// 	}
	// 	else {

	// 		// If something returns add it to the running fragment
	// 		if (compiledContext) {
	// 			dDOMFragment.appendChild(compiledContext);
	// 		}
	// 	}

	// 	console.log("Compiled context:", compiledContext);
	// }

	console.log("Finished with generator");

	return dDOMFragment;
}

class Runtime {

	constructor() {};

	generate(aContext, cb) {

		//return new Promise((resolve, reject) => {

			//resolve(Generator(aContext));
		//});

		let compiledContext = Generator(aContext);

		if (typeof cb === "function") {
			cb(compiledContext);
		}

	}
}

export default new Runtime();