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
	created: string;
	updated: string;
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

export interface CacConfig {
	courseName: string;
	campusName: string;
	courseDescription: string;
	campusWebsite: string;
	courseCode: string;
	theme: string;
	highlightLanguages: {
		language: string;
		style: string;
	}[];
}
