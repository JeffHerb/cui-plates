'use strict';

const HTML_TAGREGEX = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/;
const LOGIC_TAGREG = /{{([^\}}]+)}}/;

var Parser = function _html_parser() {

	function parse(template) {

		return new Promise((resolve, reject) => {

		});

	};

	function check(template) {

		return new Promise((resolve, reject) => {

			resolve(false);
		});

	};

	return {
		check: check,
		parse: parse
	};

}

module.exports = exports = new Parser();