'use strict';

const LOGIC_TAGREG = /{{([^\}}]+)}}/;

var Parser = function _html_parser() {

	function parse(template) {

		return new Promise((resolve, reject) => {

			let AST = {};

			let fullText = template.input;
			let matchLogic = template[0];

			console.log("matched logic", matchLogic);

			// Slice off the current logic layer
			let remaining = fullText.slice(matchLogic.length);

			console.log("Remaining:", remaining);


			// Start by getting the next logic group
			//let nextLogicGroup = 


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
		check: check,
		parse: parse
	};

}

module.exports = exports = new Parser();