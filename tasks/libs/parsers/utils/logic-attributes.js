const LOGIC_TAG_CONTENTS_REGEX = /\((?:(.*?))\)|(?:[a-zA-Z0-9\.\=\!\<\>\&\|\"\']+)/g;

var LogicAttributes = function _logic_attributes() {

	const parser = (sLogicStatement) => {

		let aLogicTagBreakdown = sLogicStatement.match(LOGIC_TAG_CONTENTS_REGEX);

		return aLogicTagBreakdown;
	};

	return {
		parser: parser
	};

}

module.exports = exports = new LogicAttributes();