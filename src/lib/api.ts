import { readFileSync, readdirSync, statSync } from "fs";
import { resolve } from "path";

import matter from "gray-matter";
import unified from "unified";
// @ts-ignore
import markdown from "remark-parse";
import math from "remark-math";
// @ts-ignore
import remark2rehype from "remark-rehype";
// @ts-ignore
import katex from "rehype-katex";
import stringify from "rehype-stringify";
// @ts-ignore
import highlight from "rehype-highlight";

import { COLLECTIONS_DIR } from "./constants";

import { Post, PostFrontmatter } from "interfaces/interfaces";
import { config } from "./config";

export function getAllCollectionSlugs(collection: string) {
	return readdirSync(resolve(COLLECTIONS_DIR, collection))
		.filter((path) => path.endsWith(".md"))
		.map((slug) => slug.replace(".md", ""));
}

// TODO: change ordering of args
export function getFSPathFromSlug(slug: string, collection: string) {
	return resolve(COLLECTIONS_DIR, collection, `${slug}.md`);
}

export function getWebPathFromSlug(slug: string, collection: string) {
	return `${collection}/${slug.replace(".md", "")}`;
}

export function getPostBySlug(slug: string, collection: string): Post {
	const filePath = getFSPathFromSlug(slug, collection);
	const stats = statSync(filePath);
	const file = readFileSync(filePath);

	const parsed = matter(file);
	const frontmatter = parsed.data as Omit<PostFrontmatter, "date">;
	const content = parsed.content;

	return {
		frontmatter: {
			...frontmatter,
			created: new Date(stats.birthtime).toJSON(),
			updated: new Date(stats.mtime).toJSON(),
		},
		content: content,
		slug, // filename without .md
		path: getWebPathFromSlug(slug, collection), // web path
		dir: resolve(__dirname, COLLECTIONS_DIR, collection),
	};
}

export function getAllPosts() {
	const slugs = getAllCollectionSlugs("lectures");
	const posts = slugs
		.map((slug) => getPostBySlug(slug, "lectures"))
		.sort((post1, post2) => {
			const date1 = new Date(post1.frontmatter.created).getTime();
			const date2 = new Date(post2.frontmatter.created).getTime();

			return date1 > date2 ? 1 : -1;
		});

	return posts;
}

export const unifiedMarkdownToHtml = (content: string) =>
	unified()
		.use(markdown)
		.use(math)
		.use(remark2rehype)
		.use(katex)
		.use(stringify)
		.use(highlight, {
			// languages: config.highlightLanguages.map((lang) => lang.language),
		})
		.process(content)
		.then((file) => file.toString());
