const getBasePath = () => {
	const isGithubActions = process.env.GITHUB_ACTIONS || false;

	if (isGithubActions) {
		// trim off `<owner>/`
		const repo = process.env.GITHUB_REPOSITORY.replace(/.*?\//, "");

		return `/${repo}`;
	}
};

const withMDX = require("@next/mdx")({
	extension: /\.mdx?$/,
});

module.exports = withMDX({
	basePath: getBasePath(),
	pageExtensions: ["ts", "tsx", "md", "mdx"],
	webpack(config) {
		config.resolve.fallback = {
			fs: false,
			net: false,
			tls: false,
		};

		return config;
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
});
