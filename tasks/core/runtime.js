import "babel-polyfill";
import { templates } from 'templates';

// Local Core Parser Libs
import elem from './parsers/elem';
import text from './parsers/text';

const ASTs = templates;

// Helper function that determins the proper AST template and calls the corresponding parser functions
const ASTsToDOM = (oContext, aPassedAST, fCallback) => {

	console.log("AST to DOM Called!");
	//console.log(oContext, aPassedAST, fCallback);

	let aRootASTs = false;

	// Check to see if a passed 
	if (aPassedAST) {

		aRootASTs = aPassedAST;
	}
	else if (oContext && oContext.template) {

		aRootASTs = ASTs[oContext.template].slice();
	}

	let dCollectedDOMFragments = false;

	(function nextASTNode(aASTs) {

		let oCurrentASTNode = aASTs.shift();
		let fParser = false;

		switch (oCurrentASTNode.node) {

			case "elem":
				fParser = elem.parse;
				break;

			case "text":
				fParser = text.parse;
				break;

			default:

				break;

		}

		if (fParser) {

			let dParserResults = fParser(oContext, oCurrentASTNode) ||  false;


			if (dParserResults) {

				if (!dCollectedDOMFragments) {
					dCollectedDOMFragments = document.createDocumentFragment();
				}

				//Check for children
				if (oCurrentASTNode.contents && oCurrentASTNode.contents.length) {

					console.log("Parent Parse Results", dParserResults);

					// Call a sub ASTsToDOM instance because we have children.
					ASTsToDOM(oContext, oCurrentASTNode.contents, (dChildrenFragements) => {

						// Append all the children to the parent
						dParserResults.appendChild(dChildrenFragements);

						// Append the parent to the collection
						dCollectedDOMFragments.appendChild(dParserResults);

						if (aASTs.length) {
							nextASTNode(aASTs);
						}
						else {

							fCallback(dCollectedDOMFragments);
						}

					});
				}
				else {

					// No children so just add it to the return.
					dCollectedDOMFragments.appendChild(dParserResults);

					if (aASTs.length) {
						nextASTNode(aASTs);
					}
					else {

						fCallback(dCollectedDOMFragments);
					}

				}

			}
			else {

				// Check to see if this item has contents, if so we have a problem because contents can not be appended if the last result failed!
				if (oCurrentASTNode.contents && oCurrentASTNode.contents.length) {

				}
				else {

					if (aASTs.length) {
						nextASTNode(aASTs);
					}
					else {

						fCallback(dCollectedDOMFragments);
					}
				}
			}

		}
		else {

			console.log("Failed to find parser in ASTsToDOM");
		}

	})(aRootASTs);

};

// Generator will loop through a context array and parse them one at a time.
const Generator = (aContext, fCallback) => {

	let dFinishedContext = document.createDocumentFragment();

	(function nextContext(aContexts) {

		let oCurrentContext = aContexts.shift();

		console.log("oCurrentContext", oCurrentContext);

		// Porcess said context
		ASTsToDOM(oCurrentContext, false, (dProcessedContext) => {

			// Append results to finished context
			dFinishedContext.appendChild(dProcessedContext);

			if (aContexts.length) {
				nextContext(aContexts);
			}
			else {

				fCallback(dFinishedContext);
			}

		});

	})(aContext);
}

class Runtime {

	constructor() {};

	generate(aContext, fCallback) {

		// Call the private generation function
		Generator(aContext, function(dFinishedGeneration) {

			fCallback(dFinishedGeneration);

		});

	}
}

export default new Runtime();