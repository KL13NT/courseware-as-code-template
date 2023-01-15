// const { readFileSync } = require("fs");
// import { readFileSync } from "fs";

import type { CacConfig } from "interfaces/interfaces";

// const json = JSON.parse(readFileSync("cac.config.json", "utf-8")) as CacConfig;

import json from "../../cac.config.json";

const defaults = {
	courseName: "My amazing course",
	campusName: "Sample Campus",
	courseDescription: "A sample course about computer science!",
	campusWebsite: "https://example.com",
	courseCode: "CS-101",
	theme: "https://cdn.jsdelivr.net/npm/water.css@2/out/light.css",
	highlightLanguages: [
		{
			language: "javascript",
			style:
				"https://unpkg.com/@highlightjs/cdn-assets@11.7.0/styles/shades-of-purple.min.css",
		},
	],
};

export const config = {
	...defaults,
	...json,
};
