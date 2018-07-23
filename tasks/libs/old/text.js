'use strict';

const HTML_TAGREGEX = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/;
const LOGIC_TAGREG = /{{([^\}}]+)}}/;

const HTML_OPENING_TAGREGEX = /^(.*?)(?:<.[a-zA-Z0-9\-]>)/;

const TEXT_REG = /.+/g;

var Parser = function _html_parser() {

	function parse(currentTemplate, templateObj) {
		
		return new Promise((resolve, reject) => {

			//let textContent = (currentTemplate.input) ? currentTemplate.input : "" ;

			let AST = {
				node: 'text',
				text: false // Take the input value as grunt watch rebuilds kill the context sometimes
			};

			let remaining = false;

			// Check to see if this is an inlien template
			if (currentTemplate.inline) {

				// Pull out the full text
				let fullText = currentTemplate.text;

				remaining = fullText.slice(currentTemplate.index.end);
				let temp = fullText.slice(currentTemplate.index.start, currentTemplate.index.end);

				// Append the contents to the AST
				AST.text = temp;
			}
			else {

				// Process a string
				AST.text = currentTemplate.text;
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

			let results = false;

			if (!htmlOpeningCheck && !logicOpeningCheck) {

				results = {
					source: "text",
					parser: parse,
					results: {
						inline: true,
						index: {
							start: 0,
							end: htmlOpeningCheck[1].length
						},
						text: htmlOpeningCheck.input
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

			console.log(htmlCheck);
			console.log(logicCheck);

			if (htmlCheck === null && logicCheck === null) {

				let results = {
					source: "text",
					parser: parse,
					results: {
						inline: false,
						index: {
							start: 0,
							end: false
						},
						text: template
					}
				}

				resolve(results);
			}
			else if (htmlCheck && logicCheck === null) {

				console.log("We found a htmlCheck but no logic");
				
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