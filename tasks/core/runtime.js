import "babel-polyfill";
import { templates } from 'templates';

// Local Core Parser Libs
import comment from './parsers/comment';
import elem from './parsers/elem';
import logic from './parsers/logic';
import text from './parsers/text';

// Utility Parser Libs
import attributes from './parsers/utils/attributes';

const ASTs = templates;

// Helper function that determins the proper AST template and calls the corresponding parser functions
const ASTsToDOM = (oContext, aPassedAST, fCallback) => {

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
		let sScope = 'page';

		switch (oCurrentASTNode.node) {

			case "elem":
				fParser = elem.parse;
				break;

			case "text":
				fParser = text.parse;
				break;

			case "comment":
				fParser = comment.parse;
				break;

			case "logic":
				fParser = logic.parse;
				break;

			default:

				break;

		}

		if (fParser) {

			let dParserResults = fParser(oContext, oCurrentASTNode, sScope) ||  false;

			// What if we need to reparse because we got a sub parse!

			if (dParserResults) {

				if (!dCollectedDOMFragments) {
					dCollectedDOMFragments = document.createDocumentFragment();
				}

				if (oCurrentASTNode.attributes && oCurrentASTNode.attributes.length) {

					attributes.parse(dParserResults, oContext, oCurrentASTNode);
				}

				//Check for children
				if (oCurrentASTNode.contents && oCurrentASTNode.contents.length) {

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

					// ============ FATAL FAILURE 
					// We need to throw a fatal error as AST has children but the root failed to generate.
					// ============ FATAL FAILURE

				}
				else {

					// ============ Logging Verbose 
					// We could add some more verbose logging in the future to indicate when something failed to generate.
					// ============ Logging Verbose 

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