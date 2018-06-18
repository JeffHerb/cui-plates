import { templates } from 'templates';
// import { helpers } from 'helpers';

const ASTs = templates;
// const Helpers = helpers

const parseElem = (oASTNode, oContext) => {

	let dElem = false

	if (typeof oASTNode.tag === "string") {

		dElem = document.createElement(oASTNode.tag);

		// Check for current tag attributes!
		if (oASTNode.attributes) {
			console.log("This tag has attributes");

			let oCurrentAttrs = {};

			// Loop throught the attributes handleing all logic helpers first
			for (let attr in oASTNode.attributes) {

				// Check and create a 
				if (!oCurrentAttrs[attr]) {
					oCurrentAttrs[attr] = [];
				}
				
				// Check to see if the attribute is a string, it so its an include
				if (typeof oASTNode.attributes[attr] === "string") {
					oCurrentAttrs[attr].push({
						"include": true,
						"value": oASTNode.attributes[attr]
					})
				}

			}

			console.log(oCurrentAttrs);

		}
		else {

		}

	}

	return dElem;

};

// Helper function that determins the proper AST template and calls the corresponding parser functions
const ASTsToDOM = (oContext) => {

	console.log(oContext);

	// check the context for a template definition, if so we need to loop it.
	if (oContext.template && ASTs[oContext.template]) {

		let aAST = ASTs[oContext.template].concat();

		// We now need to loop and parse the template
		for (let aASTNode of aAST) {

			console.log(aASTNode);

			let parser = false;

			switch (aASTNode.node) {

				case "elem":

					parser = parseElem;

					break;

				default:

					break;

			}

			// Build out this AST based on the provided context
			let compiledAST = parser(aASTNode, oContext);

			if (compiledAST) {

				return compiledAST;
			}
		}

	}

	return false;

};

// Generator will loop through a context array and parse them one at a time.
const Generator = (aContext) => {

	let dDOMFragment = document.createDocumentFragment();

	// Loop over the context
	for (let nextContext of aContext) {

		let compiledContext = ASTsToDOM(nextContext);

		// If something returns add it to the running fragment
		if (compiledContext) {
			dDOMFragment.appendChild(compiledContext);
		}

		console.log("Compiled context:", compiledContext);
	}


	console.log("Finished with generator");

}

class Runtime {

	constructor() {};

	generate(aContext) {

		return new Promise((resolve, reject) => {

			resolve(Generator(aContext));
		});

	}
}

export default new Runtime();