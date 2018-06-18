'use strict';

const HTML_TAGREGEX = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/;
const LOGIC_TAGREG = /{{([^\}}]+)}}/;

const TEXT_REG = /(?:.*)/g;

var Parser = function _html_parser() {

	function parse(currentTemplate) {

		console.log("ct", currentTemplate);

		return new Promise((resolve, reject) => {

			let AST = {
				node: 'text',
				contents: [ currentTemplate.input ] // Take the input value as grunt watch rebuilds kill the context sometimes
			};

			resolve({
				AST:AST,
				children: false,
				remaining: false,
			});


		});

	};

	function check(template) {

		console.log(template);

		return new Promise((resolve, reject) => {

			// Check both the html and logic ones, one more time just in case
			let htmlCheck = HTML_TAGREGEX.exec(template);
			let logicCheck = LOGIC_TAGREG.exec(template);

			if (!htmlCheck && !logicCheck) {

				let check = TEXT_REG.exec(template.trim());

				let results = {
					source: "text",
					parser: parse,
					results: check
				}

				resolve(results);
			}
			else {
				resolve(false);
			}

			
		});

	};

	return {
		check: check,
		parse: parse
	};

}

module.exports = exports = new Parser();