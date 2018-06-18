import Runtime from './runtime';

const Version = "0.0.1";

export default class plates {

	constructor() {
	}

	render(method, context, target) {

		if (typeof method === "object") {
			target = context;
			context = method;
			method = "generate";
		}

		// Ensure our context is wrapped in an array for consistant handling
		if (!Array.isArray(context)) {
			context = [ context ];
		}

		console.log("Context to be processed:", context);

		Runtime.generate(context, target)
			.then((compiledContext) => {

				console.log(compiledContext);
			})
			.catch((err) => {

				console.log("Plates Runtime Error:", err);
			})

	};

}