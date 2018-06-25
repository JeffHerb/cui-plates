'use strict';

const LOGIC_TAGREG = /{{([^\}}]+)}}/;

const LOGIC_OPENING_TAGREG = /^{{(?:[>.@#]+)|^{{/g;

const CONTEXT_REGEXP_EXTRACTOR = /{{((?:\\.|[^"\\])*)}}/;

var Parser = function _html_parser() {

	function parse(template) {

		return new Promise((resolve, reject) => {

			let AST = {};

			// Get all the current template text to work from
			let fullText = template.input;

			// Get the first logic match
			let matchLogic = template[0];

			// Slice off the current logic layer
			let remaining = (fullText.slice(matchLogic.length).length) ? fullText.slice(matchLogic.length) : false;

			// Identify the type of logic template we are working with
			let currentLogicTag = LOGIC_OPENING_TAGREG.exec(matchLogic);

			// Boiler Plate end results code
			let endResult = {
				AST: false,
				children: false,
				remaining: false
			};

			if (currentLogicTag) {

				currentLogicTag = currentLogicTag[0];

				switch (currentLogicTag) {

					// Context Logic
					case "{{":

						AST.node = "logic";
						AST.type = "context";

						// Grab everything between {{ ... }}
						let context = CONTEXT_REGEXP_EXTRACTOR.exec(matchLogic)[1];

						let thisIndex = context.indexOf("this.");

						// Tack on this to all context
						if (thisIndex === -1) {
							context = "this." + context;
						}
						else if (thisIndex > 0) {

							reject("This is a problem, this. should only be found in the beginning of a context");
						}

						AST.context = context;

						// Append the expected AST
						endResult.AST = AST;

						endResult.remaining = remaining;

						break;

					case "{{.":

						console.log("Helper Control called");
						break;

					case "{{@":

						console.log("Event Binding Control called");
						break;

					case "{{>":

						console.log("Partial Control called");
						break;

					default:

						let err = new Error("Undefined logical control: ", currentLogicTag);
						break;
				}

				resolve(endResult);
			}
			else {

				//reject(new Error("Unable to find logic control in: " +));
			}


		});
	};

	function attributeParse(template) {

		return new Promise((resolve, reject) => {

			console.log("in attribute logic parser");

			console.log(template);

		});

	};

	function check(template) {

		return new Promise((resolve, reject) => {

			let check = LOGIC_TAGREG.exec(template);

			if (check) {

				let results = {
					source: "logic",
					parser: parse,
					results: check
				};

				resolve(results);

			}

			resolve(false);
		});

	};

	return {
		attributeParse: attributeParse,
		check: check,
		parse: parse
	};

}

module.exports = exports = new Parser();