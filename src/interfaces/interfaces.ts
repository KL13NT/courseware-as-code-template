import type { PDFOptions, Page } from "puppeteer";

export enum ContentType {
	LECTURE = "lectures",
}

export interface HTMLToPDFContent {
	page: Page;
	html: string;
	css?: string;
	options?: PDFOptions;
}

export interface PostFrontmatter {
	date: string;
	title: string;
	description: string;
}

export interface PostDocuments {
	lecture: string;
	// slides: string | null;
}

export interface Post {
	frontmatter: PostFrontmatter;
	content: string;
	slug: string;
	path: string;
	dir: string;
}

export interface SlugStaticParams {
	[index: string]: string;
	slug: string;
}

export interface GenerateStaticResult extends Post {
	pdf: Buffer;
}
