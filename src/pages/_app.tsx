import React from "react";
import type { AppProps } from "next/app";

import "katex/dist/katex.min.css"; // `rehype-katex` does not import the CSS

import "../styling/index.css";

function App({ Component, pageProps }: AppProps) {
	return (
		<>
			<div className="container">
				<Component {...pageProps} />
			</div>
		</>
	);
}

export default App;
