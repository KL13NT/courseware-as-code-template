/* eslint-disable @typescript-eslint/ban-ts-comment */
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

import type { Post, PostFrontmatter } from "interfaces/interfaces";

import nodegit from "nodegit";

export async function getGitFileStat(path: string) {
	const repo = await nodegit.Repository.open(process.cwd());
	const revWalker = repo.createRevWalk();
	const history = await revWalker.fileHistoryWalk(path, Infinity);

	const firstCommit = history[0].commit;
	const lastCommit = history[history.length - 1].commit;

	return {
		created: firstCommit.date(),
		updated: lastCommit.date(),
	};
}

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
	const { content } = parsed;

	return {
		frontmatter: {
			...frontmatter,
			created: new Date(stats.birthtime).toJSON(),
			updated: new Date(stats.mtime).toJSON(),
		},
		content,
		slug, // filename without .md
		path: getWebPathFromSlug(slug, collection), // web path
		dir: resolve(__dirname, COLLECTIONS_DIR, collection),
	};
}

export async function getAllPosts() {
	const slugs = getAllCollectionSlugs("lectures");
	const posts = slugs
		.map((slug) => getPostBySlug(slug, "lectures"))
		.sort((post1, post2) => {
			const date1 = new Date(post1.frontmatter.created).getTime();
			const date2 = new Date(post2.frontmatter.updated).getTime();

			return date1 > date2 ? 1 : -1;
		});

	const promises = await Promise.all(
		posts.map(async (post) => getGitFileStat(post.path))
	);

	console.log(promises);

	return posts;
}

export const unifiedMarkdownToHtml = async (content: string) => {
	const file = await unified()
		.use(markdown)
		.use(math)
		.use(remark2rehype)
		.use(katex)
		.use(stringify)
		.use(highlight, {
			// languages: config.highlightLanguages.map((lang) => lang.language),
		})
		.process(content);

	return file.toString();
};
