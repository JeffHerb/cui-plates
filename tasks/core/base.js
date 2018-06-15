import { templates } from 'templates';

const Version = "0.0.1";

const ASTs = templates;

// Function parses an attributes object and adds it to the provided element.
const parseAttributes = (elem, attributes, context) => {

	if (typeof attributes === "object") {
		
		for (let attr in attributes) {

			elem.setAttribute(attr, attributes[attr]);
		}

	}

	return elem;

};

const ASTtoDOM = (context, AST, cb) => {

	let compiledAST = document.createDocumentFragment();

	// Loop through the AST one step at a time
	(function astWalker(fullAST) {

		let ASTNode = fullAST.shift();
		let createdOutput = false;

		switch(ASTNode.node) {

			case "elem":

				var root = document.createElement(ASTNode.tag);

				if (ASTNode.attributes) {

					parseAttributes(root, ASTNode.attributes, context);

				}

				createdOutput = true;

				// Add compiled element to total collection
				compiledAST.appendChild(root);

				break;

		}

		if (fullAST.length) {

			astWalker(fullAST);
		}
		else {

			console.log("finished AST");

			console.log(compiledAST);

			if (createdOutput) {

				cb(compiledAST);
			}

			return false;
		}

	})(AST.concat())

};

const generate = (context, cb) => {

	let renderedDOM = document.createDocumentFragment();

	(function walker(DOMContext) {

		let nextSibling = DOMContext.shift();

		if (nextSibling.template && ASTs[nextSibling.template]) {

			ASTtoDOM(nextSibling, ASTs[nextSibling.template], function(compiledAST) {

				renderedDOM.appendChild(compiledAST);

				if (DOMContext.length) {

					walker(DOMContext);
				}
				else {

					console.log("finished generate");

					cb(renderedDOM);
				}

			});

		}
		else {
			console.log("We dont have a valid template template.");	

			if (DOMContext.length) {

				walker(DOMContext);
			}
			else {

				console.log("finished generate");

				cb(renderedDOM);
			}
		}

	})(context.concat());

};

export default class plates {

	constructor() {
	}

	render(method, context, target) {

		if (typeof method === "object") {
			target = context;
			context = method;
			method = "generate";
		}

		if (!Array.isArray(context)) {
			context = [ context ];
		}

		if (method === "generate") {

			console.log("Generate a template, but dont append");

			generate(context, function(finalCompiledAST) {

				console.log(finalCompiledAST);
			});

			//console.log(finsihedCompiledAST);
		}
		else if (method === "append") {

			console.log("Generate and then append a template");

			append(content, target);
		}


	};

}