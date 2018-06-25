import "babel-polyfill";
import { templates } from 'templates';

const ASTs = templates;
// const Helpers = helpers

const parseAttributes = (aAttributes, oContext) => {

	let oReturnedAttrbutes = {};

	console.log(aAttributes);

	// Check static only lengths
	if (aAttributes.length) {

		for (let oAttr of aAttributes) {

			console.log("parse Attributes", oAttr);

			if (oAttr.static) {

				if (!oReturnedAttrbutes[oAttr.property]) {
					oReturnedAttrbutes[oAttr.property] = ""
				}

				oReturnedAttrbutes[oAttr.property] += " " + oAttr.value;
			}

		}

	}

	return oReturnedAttrbutes;
};

const parseElem = (oASTNode, oContext) => {

	let dElem = false

	if (typeof oASTNode.tag === "string") {

		dElem = document.createElement(oASTNode.tag);

		// Check for current tag attributes!
		if (oASTNode.attributes && Object.keys(oASTNode.attributes).length) {

			let oCompiledAttributes = parseAttributes(oASTNode.attributes, oContext);

			if (oCompiledAttributes) {

				for (let sAttr in oCompiledAttributes) {

					dElem.setAttribute(sAttr, oCompiledAttributes[sAttr].trim());
				}
			}

		}

		// Check for children of the current element.
		if (oASTNode.children && oASTNode.children.length) {

			// Loop through all the children
			for (let c = 0, cLen = oASTNode.children.length; c < cLen; c++) {

				let oASTNodeChild = oASTNode.children[c];

				let compiledChild = ASTsToDOM(oContext, oASTNodeChild);

				if (compiledChild) {

					// Wrap results in an array for stanadrd handleing
					if (!Array.isArray(compiledChild)) {
						compiledChild = [ compiledChild ];
					}

					for (let child of compiledChild) {

						if (child && child.nodeType) {

							dElem.appendChild(child);
						}
					}

				}

			}

			return dElem;
		}
		else {

			return dElem;
		}		
	}

	return false;
};

const parseText = (oASTNode, oContext) => {

	let finalTextContents = [];

	let content = false;

	// String can contain many different things so we need to loop through all of them
	if (oASTNode.contents) {

		if (typeof oASTNode.contents === "string") {

			content = document.createTextNode(oASTNode.contents);

			finalTextContents.push(content);
		}
		else if (Array.isArray(oASTNode.contents)) {

			for (let c = 0, cLen = oASTNode.contents.length; c < cLen; c++) {

				if (typeof oASTNode.contents[c] === "string") {

					content = document.createTextNode(oASTNode.contents[c]);
				}
				else if (typeof oASTNode.contents[c] === "object") {

					if (Array.isArray(oASTNode.contents[c])) {
						content = ASTsToDOM(oContext, ASTsToDOM.contents[c]);
					}
					else {
						content = ASTsToDOM(oContext, [ ASTsToDOM.contents[c] ]);	
					}
				} 

				if (content) {
					finalTextContents.push(content);
				}
			}
		}


		return finalTextContents;
	}

	return false;
};

const parseComment = (oASTNode, oContext) => {

	let comNode = document.createComment(oASTNode.children[0].contents);

	return comNode;
};

const parseLogic = (oASTNode, oContext) => {

	let content = false;

	switch (oASTNode.type) {

		case "context":

			let aASTNodeContext = oASTNode.context.split('.');

			let currentOContextPointer = oContext;

			for (let nameSpace of aASTNodeContext) {

				if (nameSpace !== "this") {

					if (currentOContextPointer.hasOwnProperty(nameSpace)) {
						currentOContextPointer = currentOContextPointer[nameSpace];
					}
					else {

						console.log("Could not find requested context");
						break;
					}
				}
			}

			// If we have a string return it 
			if (typeof currentOContextPointer === "string") {

				content = document.createTextNode(currentOContextPointer);	
			}

			break;

		default:

			break;

	}

	return content;

};

// Helper function that determins the proper AST template and calls the corresponding parser functions
const ASTsToDOM = (oContext, aPassedAST) => {

	let aAST = false;
	let dCompiledASTFragment = document.createDocumentFragment();

	// Check to see if a AST object was provided.
	if (aPassedAST) {

		if (!Array.isArray(aPassedAST)) {
			aPassedAST = [aPassedAST];
		}

		aAST = aPassedAST.concat();
	}
	else if (oContext.template && ASTs[oContext.template]) {

		aAST = ASTs[oContext.template].concat();
	}

	if (aAST) {

		// We now need to loop and parse the template
		for (let aASTNode of aAST) {

			let parser = false;

			switch (aASTNode.node) {

				case "comment":

					parser = parseComment;
					break;

				case "elem":

					parser = parseElem;
					break;

				case "text":

					parser = parseText;
					break;

				case "logic":

					parser = parseLogic;
					break;

				default:

					console.log("Unknown parser node type!");
					break;

			}

			// Build out this AST based on the provided context
			let compiledAST = parser(aASTNode, oContext);

			if (aASTNode.node === "logic") {
				console.log("compiledAST", compiledAST);
			}
			else if (aASTNode.node === "text") {
				console.log("compiledAST", compiledAST);
			}

			if (compiledAST) {

				if (Array.isArray(compiledAST)) {

					for (let compiledNode of compiledAST) {

						if (compiledNode) {
							
							dCompiledASTFragment.appendChild(compiledNode);							
						}

					}

				}
				else {

					dCompiledASTFragment.appendChild(compiledAST);
				}

			}
		}

		return dCompiledASTFragment;
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