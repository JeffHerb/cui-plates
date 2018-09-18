const YAML = require('yamljs');

const reYAMLFontMatter = /\-\-\-(?:[\w\s\:\']*)\-\-\-/;

var parseYAML = function _parse_yaml() {

	const parse = (sTemplate) => {

		let reYAMLSection = reYAMLFontMatter.exec(sTemplate);
		let sYAMLSection = false;
		let sTemplateContents = false;

		if (reYAMLSection && reYAMLSection.index === 0) {
			sYAMLSection = reYAMLSection[0];

			// Remove the frontmatter tags
			sYAMLSection = sYAMLSection.replace(/\-\-\-/g, '');

			sTemplateContents = sTemplate.slice(reYAMLSection[0].length);

			return {
				oConfig: YAML.parse(sYAMLSection),
				sTemplateContents: sTemplateContents
			}
		}

	}

	const check = (sTemplate) => {

		var reYAMLCheck = reYAMLFontMatter.exec(sTemplate);

		if (reYAMLCheck && reYAMLCheck.index === 0) {

			return true;
		}
		else {

			return false;
		}

	}

	return {
		check: check,
		parse: parse
	};

}

module.exports = exports = new parseYAML();
