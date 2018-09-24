const Glob = require("glob");

var parseHelper = function _parse_helper() {

	var helperModules = {};

	const parse = (aHelpersPath) => {

		for (var h = 0, hLen = aHelpersPath.length; h < hLen; h++) {

			var sHelperPath = aHelpersPath[h];

			var aHelperFolderList = Glob.sync(sHelperPath);

			console.log(aHelperFolderList);
			
		}

		console.log("Done with helpers!");

	}

	return {
		parse: parse
	};

};

module.exports = exports = new parseHelper();