// nextjs custom document component
// https://nextjs.org/docs/advanced-features/custom-document

import Document, { Html, Head, Main, NextScript } from "next/document";

import { config } from "lib/config";

class MyDocument extends Document {
	render() {
		return (
			<Html lang="en">
				<Head>
					<link rel="stylesheet" href={config.theme} />
					{config.highlightLanguages.map((lang) => (
						<link rel="stylesheet" href={lang.style} key={lang.language} />
					))}
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
