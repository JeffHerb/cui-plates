import { templates } from 'templates';
// import { helpers } from 'helpers';

const ASTs = templates;
// const Helpers = helpers

const parseAttributes = (oAttributes, oContext) => {

	const compileAttr = (aAttributes) => {

		let oCompiledAttributes = {};

		for (let oAttr of aAttributes) {

			if (!oCompiledAttributes[oAttr.label]) {
				oCompiledAttributes[oAttr.label] = oAttr.value;
			}
			else {
				oCompiledAttributes[oAttr.label] += " " + oAttr.value;
			}

		}

		return oCompiledAttributes;

	}

	// Placeholders for the different include remove attribute actions
	let aIncludedAttr = [];
	let aRemoveAttr = [];

	// Loop through each attribute in the object
	for (let sAttrLabel in oAttributes) {

		let currentAttr = oAttributes[sAttrLabel];

		// Check for string first, if it exists its an include
		if (typeof currentAttr === "string") {

			aIncludedAttr.push({
				"label": sAttrLabel,
				"value": currentAttr
			});
		}

	}

	// Check if there is nothing to do
	if ((aRemoveAttr.length === 0 && aIncludedAttr.length === 0) || (aRemoveAttr.length && aIncludedAttr.length === 0)) {

		return false;
	}
	else {

		// We only have adds
		if (aRemoveAttr.length === 0 && aIncludedAttr.length) {

			return compileAttr(aIncludedAttr);

		}
		// We have both!
		else {

		}

	}

};

const parseElem = (oASTNode, oContext) => {

	let dElem = false

	if (typeof oASTNode.tag === "string") {

		dElem = document.createElement(oASTNode.tag);

		// Check for current tag attributes!
		if (oASTNode.attributes) {

			if (oASTNode.attributes) {
				let oCompiledAttributes = parseAttributes(oASTNode.attributes, oContext);

				for (let sAttr in oCompiledAttributes) {

					dElem.setAttribute(sAttr, oCompiledAttributes[sAttr]);
				}
			}

		}

	}
	else {

	}

	return dElem;

};

// Helper function that determins the proper AST template and calls the corresponding parser functions
const ASTsToDOM = (oContext) => {

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

	return dDOMFragment;
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