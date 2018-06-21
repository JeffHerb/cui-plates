'use strict';

const HTML_TAGREGEX = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/;
const LOGIC_TAGREG = /{{([^\}}]+)}}/;

const HTML_OPENING_TAGREGEX = /^(.*?)(?:<.[a-zA-Z0-9\-]>)/;
//const LOGIC_OPENING_TAGREGEX = //g;

//const TEXT_REG = /(?:.*)/g;
//const TEXT_REG = /(.*?)/gm;
const TEXT_REG = /.+?/g;

var Parser = function _html_parser() {

	function parse(currentTemplate) {

		console.log(currentTemplate);

		return new Promise((resolve, reject) => {

			//let textContent = (currentTemplate.input) ? currentTemplate.input : "" ;

			let AST = {
				node: 'text',
				contents: false // Take the input value as grunt watch rebuilds kill the context sometimes
			};

			let remaining = false;

			if (currentTemplate.inline) {

				// We need to do a substring
				AST.contents = currentTemplate.text;

				temp = currentTemplate.slice(currentTemplate.index.start, currentTemplate.index.end);

				console.log(temp);

			}
			else {

				// Process a string
				AST.contents = currentTemplate.text;
			}

			resolve({
				AST:AST,
				children: false,
				remaining: remaining,
			});

		});

	};

	function inlineCheck(template) {

		return new Promise((resolve, reject) => {

			let htmlOpeningCheck = HTML_OPENING_TAGREGEX.exec(template);
			let logicOpeningCheck = false; // Temp: need to write logic parser

			console.log(htmlOpeningCheck);

			let results = false;

			if (htmlOpeningCheck && !logicOpeningCheck) {

				results = {
					source: "text",
					parser: parse,
					results: {
						inline: true,
						index: {
							start: 0,
							end: htmlOpeningCheck[1].length
						},
						text: htmlOpeningCheck[1]
					}
				}

			}

			resolve(results);

		});

	}

	function check(template) {

		return new Promise((resolve, reject) => {

			// Check both the html and logic ones, one more time just in case
			let htmlCheck = HTML_TAGREGEX.exec(template);
			let logicCheck = LOGIC_TAGREG.exec(template);

			if (!htmlCheck && !logicCheck) {

				//let check = template.trim();

				let results = {
					source: "text",
					parser: parse,
					results: {
						inline: false,
						index: {
							start: 0,
							end: false
						},
						text: template.trim()
					}
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
		inlineCheck: inlineCheck,
		parse: parse
	};

}

module.exports = exports = new Parser();