/* eslint-disable @typescript-eslint/ban-ts-comment */
import { readFileSync, readdirSync } from "fs";
import { join, resolve } from "path";

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
import { formatDate } from "./utils";

const GIT_SORT_TOPOLOGICAL = 4;

export async function getGitFileStat(path: string) {
	const repo = await nodegit.Repository.open(join(process.cwd(), ".git"));

	const walker = repo.createRevWalk();
	const master = await repo.getMasterCommit();

	walker.push(master.id());
	walker.sorting(GIT_SORT_TOPOLOGICAL);

	const history = await walker.fileHistoryWalk(path, Number.MAX_SAFE_INTEGER);

	if (history.length === 0) {
		return {
			created: new Date(),
			updated: new Date(),
		};
	}

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

export function getGitPath(slug: string, collection: string) {
	return `collections/${collection}/${slug}.md`;
}

export async function getPostBySlug(slug: string, collection: string) {
	const filePath = getFSPathFromSlug(slug, collection);
	const file = readFileSync(filePath);

	const parsed = matter(file);
	const frontmatter = parsed.data as Omit<PostFrontmatter, "date">;
	const dateInfo = await getGitFileStat(getGitPath(slug, collection));

	const { content } = parsed;

	return {
		frontmatter: {
			...frontmatter,
			created: formatDate(dateInfo.created),
			updated: formatDate(dateInfo.updated),
		},
		dateInfo: {
			created: dateInfo.created.toJSON(),
			updated: dateInfo.updated.toJSON(),
		},
		content,
		slug, // filename without .md
		path: getWebPathFromSlug(slug, collection), // web path
		fPath: getFSPathFromSlug(slug, collection), // file system complete path
		gitPath: getGitPath(slug, collection), // git relative path
		dir: resolve(__dirname, COLLECTIONS_DIR, collection),
	} as Post;
}

export async function getAllPosts() {
	const slugs = getAllCollectionSlugs("lectures");
	const postRequests = slugs.map(async (slug) =>
		getPostBySlug(slug, "lectures")
	);

	const resolved = await Promise.all(postRequests);

	const posts = Array.from(resolved).sort((post1, post2) => {
		const date1 = new Date(post1.dateInfo.created).getTime();
		const date2 = new Date(post2.dateInfo.updated).getTime();

		return date1 > date2 ? 1 : -1;
	});

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
