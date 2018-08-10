class Context {

	find(sContextPath, oContext) {

		// Catch for native non string types
		if (typeof sContextPath !== "string") {

			// This is not a string so we are just going to return it.
			return sContextPath;
		}

		let aContextPath = (sContextPath.indexOf('.')) ? sContextPath.split('.') : [ sContextPath ];

		let vCurrentContext = oContext;

		for (let iPath = 0, iLen = aContextPath.length; iPath < iLen; iPath++) {

			// Skip over this if its at the beginning
			if (iPath === 0  && aContextPath[iPath].trim() === "this") {
				continue;
			}

			if (vCurrentContext[aContextPath[iPath]]) {

				vCurrentContext = vCurrentContext[aContextPath[iPath]];

			}
			else {

				return false;
			}

		}

		return vCurrentContext;
	}

}

export default new Context();