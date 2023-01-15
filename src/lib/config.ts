import * as core from "@actions/core";

export const config = {
	courseName: core.getInput("courseName"),
	campusName: core.getInput("campusName"),
	courseDescription: core.getInput("courseDescription"),
	campusWebsite: core.getInput("campusWebsite"),
	courseCode: core.getInput("courseCode"),
	classless: "https://cdn.jsdelivr.net/npm/water.css@2/out/light.css",
};
