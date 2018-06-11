import { templates } from 'templates';

const Version = "0.0.1";
const ASTs = templates;

export default function plates() {

	var showVersion = () => {
		return Version;
	};

	var findTemplate = (templateName) => {
		return (ASTs[templateName]) ? true : false;
	}

	return {
		findTemplate: findTemplate,
		version: showVersion
	};

}