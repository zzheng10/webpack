/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const SingleEntryPlugin = require("./SingleEntryPlugin");
const MultiEntryPlugin = require("./MultiEntryPlugin");
const DynamicEntryPlugin = require("./DynamicEntryPlugin");

/** @typedef {import("./Compiler")} Compiler */

/**
 * @param {string} context context path
 * @param {string | string[]} item entry array or single path
 * @param {string} name entry key name
 * @returns {SingleEntryPlugin | MultiEntryPlugin} returns either a single or multi entry plugin
 */
const itemToPlugin = (context, item, name) => {
	if (Array.isArray(item)) {
		return new MultiEntryPlugin(context, item, name);
	}
	return new SingleEntryPlugin(context, item, name);
};
/**
 * @zzheng
 * 1. complier.plugin('xxx', new plugin)
 *    To register
 * 2. When running into 'xxx', the apply of plugin will be called,
 * 3. Within plugin.apply, we can also register later lifecycle, using compiler.apply(new plugin2)
 * 4. Within new plugin2.apply(compiler), you can register layer lifecycle by calling compiler.plugin('yyy', function)
 */
module.exports = class EntryOptionPlugin {
	/**
	 * @param {Compiler} compiler the compiler instance one is tapping into
	 * @returns {void}
	 */
	apply(compiler) {
		compiler.hooks.entryOption.tap("EntryOptionPlugin", (context, entry) => {
			if (typeof entry === "string" || Array.isArray(entry)) {
				itemToPlugin(context, entry, "main").apply(compiler);
			} else if (typeof entry === "object") {
				for (const name of Object.keys(entry)) {
					itemToPlugin(context, entry[name], name).apply(compiler);
				}
			} else if (typeof entry === "function") {
				new DynamicEntryPlugin(context, entry).apply(compiler);
			}
			return true;
		});
	}
};
