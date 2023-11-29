/**
 * Basic info about a socket
 * @typedef {Object} SocketDef
 * @property {string} id
 * @property {string} name
 * @property {string} type
 * @property {string} expression Expression for the socket. Only applies to output sockets.
 */

/**
 * Object to be parsed into a NodeDef
 * @typedef {Object} NodeDefData
 * @property {string} name
 * @property {SocketDef[]} inputs
 * @property {SocketDef[]} outputs
 */

/**
 * @typedef {Object} CategoryDef
 * @property {string} name
 * @property {string} path
 * @property {CategoryDef[]|undefined} subcategories
 */

let noExtRegex = /(.+)(.json)/;

class NodeDef {
	/**
	 * @type {Map<string, NodeDef>}
	 */
	static defMap = {};
	static categories = {};

	/**
	 *
	 * @param {NodeDefData} data
	 */
	constructor(data) {
		/**
		 * @type {string}
		 */
		this.name = data.name;
		/**
		 * @type {SocketDef[]}
		 */
		this.inputs = data.inputs;
		/**
		 * @type {SocketDef[]}
		 */
		this.outputs = data.outputs;
		/**
		 * @type {string}
		 */
		this.path = "";
	}

	/**
	 * Loads all listed NodeDefs from nodedeflist.json
	 */
	static async loadNodeDefs() {
		/**
		 * we'll be loading quite a few files
		 * @param {URL | string} path
		 * @returns {Promise<any>}
		 */
		let loadfile = async (path) => {
			return (await fetch(path)).json();
		};
		let nodeDefList = await loadfile("/data/nodedeflist.json");
		/**
		 *
		 * @param {string} path
		 */
		let loadPath = async (path) => {
			let nodeDefFile = await loadfile("/data/nodedefs/" + path);
			let nicePath = path.replace(noExtRegex, "$1");
			let newDef = new NodeDef(nodeDefFile);
			newDef.path = nicePath;
			this.defMap[nicePath] = newDef;
			console.log(`Loaded NodeDef ${newDef.name} (${nicePath})`);
		};
		// Fetch files asynchronously
		await Promise.all(
			nodeDefList.nodedefs.map((path) => {
				return loadPath(path);
			})
		);
		/**
		 * @type {CategoryDef}
		 */
		let categoryRoot = nodeDefList.rootcategory
		this.addCategory(categoryRoot, "")
		this.populateCategories()
	}

	/**
	 * 
	 * @param {CategoryDef} category 
	 */
	static addCategory(category, rootPath) {
		let fullPath = rootPath+category.path
		this.categories[fullPath] = {name: category.name, localPath: category.path, parent: rootPath, nodeDefs: []}
		if (category.subcategories) {
			category.subcategories.forEach((subcategory) => {this.addCategory(subcategory, fullPath)})
		}
	}

	static populateCategories() {
		let nodeDefKeys = []
		for (let key in this.defMap) {
			nodeDefKeys.push(key)
		}
		
		for (let fullPath in this.categories) {
			let category = this.categories[fullPath]
			let searchString = `^(${fullPath})\\w+$`
			let regex = new RegExp(searchString)
			let matches = nodeDefKeys.filter((def) => {return def.match(regex) != null})
			category.nodeDefs = matches
		}
	}

	createNode() {
		let out = new PNode();
		out.name = this.name;
		out.nodeDefPath = this.path;
		this.inputs.forEach((input) => {
			out.addSocket(
				new Socket(input.name, input.id, out, input.type, "i")
			);
		});
		// TODO: set expression on output sockets
		this.outputs.forEach((output) => {
			out.addSocket(
				new Socket(output.name, output.id, out, output.type, "o")
			);
		});
		return out;
	}

	static createFromPath(path) {
		return this.defMap[path].createNode()
	} 
}
