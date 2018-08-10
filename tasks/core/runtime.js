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

const isNode = (oPotentialNode) => {

	if (oPotentialNode instanceof Node || oPotentialNode instanceof EventTarget) {
		return true;
	}

	return false;

};

// Helper function that determins the proper AST template and calls the corresponding parser functions
const ASTsToDOM = (oContext, aPassedAST, fCallback) => {

	let aRootASTs = false;

	// Check to see if a passed 
	if (aPassedAST) {

		aRootASTs = aPassedAST;
	}
	else if (oContext && oContext.template) {

		if (ASTs[oContext.template]) {

			aRootASTs = ASTs[oContext.template].slice();

		}
		else {

			let error = new Error(`Plates failed to find requested templates: ${oContext.template}`);

			fCallback(error);
		}

	}

	if (aRootASTs) {

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

				let vParserResults = fParser(oContext, oCurrentASTNode, sScope) ||  false;

				// Check for actual node types, as this means we have appendable results.
				if (isNode(vParserResults)) {

					if (!dCollectedDOMFragments) {
						dCollectedDOMFragments = document.createDocumentFragment();
					}

					if (oCurrentASTNode.attributes && oCurrentASTNode.attributes.length) {

						attributes.parse(vParserResults, oContext, oCurrentASTNode);
					}

					//Check for children
					if (oCurrentASTNode.contents && oCurrentASTNode.contents.length) {

						// Call a sub ASTsToDOM instance because we have children.
						ASTsToDOM(oContext, oCurrentASTNode.contents, (dChildrenFragements) => {

							// Append all the children to the parent
							vParserResults.appendChild(dChildrenFragements);

							// Append the parent to the collection
							dCollectedDOMFragments.appendChild(vParserResults);

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
						dCollectedDOMFragments.appendChild(vParserResults);

						if (aASTs.length) {
							nextASTNode(aASTs);
						}
						else {

							fCallback(dCollectedDOMFragments);
						}

					}

				}
				// Chekc for an array of objects as this will mean we have a sub ast (from logic templates)
				else if (Array.isArray(vParserResults)) {

					// Call a sub ASTsToDOM instance because we have children.
					ASTsToDOM(oContext, vParserResults, (vSubChildrenFragements) => {

						if (isNode(vSubChildrenFragements)) {

							if (!dCollectedDOMFragments) {
								dCollectedDOMFragments = document.createDocumentFragment();
							}

							dCollectedDOMFragments.appendChild(vSubChildrenFragements);

							if (aASTs.length) {
								nextASTNode(aASTs);
							}
							else {

								fCallback(dCollectedDOMFragments);
							}

						}
						else {

							console.log("we have a result but dont have a node type.");
						}

					});

				}
				// Catch everything else, most likely invalid or failure
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

				console.log(`Failed to find parser ${oCurrentASTNode.node} in ASTsToDOM`);
			}

		})(aRootASTs);
	}

};

// Generator will loop through a context array and parse them one at a time.
const Generator = (aContext, fCallback) => {

	let dFinishedContext = document.createDocumentFragment();

	(function nextContext(aContexts) {

		let oCurrentContext = aContexts.shift();

		// Porcess said context
		ASTsToDOM(oCurrentContext, false, (dProcessedContext) => {

			if (dProcessedContext instanceof Error) {

				fCallback(dProcessedContext);
			}
			else {

				// Check to see if we got something
				if (dProcessedContext) {

					// Append results to finished context
					dFinishedContext.appendChild(dProcessedContext);
				}

				if (aContexts.length) {
					nextContext(aContexts);
				}
				else {

					fCallback(dFinishedContext);
				}
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