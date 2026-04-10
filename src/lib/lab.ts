/**
 * lab.ts — もちスラ Lab のコンテンツ読み込みライブラリ
 *
 * content/lab/ 配下の Markdown ファイルを読み込み、
 * フロントマターをパースして一覧・個別記事データとして提供する。
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

// lab 記事の型定義
export interface LabPost {
  slug: string;
  title: string;
  date: string;
  category: "Body" | "Nerve" | "Story";
  tags: string[];
  relatedNote?: string;
  contentHtml: string;
  excerpt: string;
}

// lab 一覧用の軽量型（HTML本文を含まない）
export interface LabPostMeta {
  slug: string;
  title: string;
  date: string;
  category: "Body" | "Nerve" | "Story";
  tags: string[];
  relatedNote?: string;
  excerpt: string;
}

const labDir = path.join(process.cwd(), "content", "lab");

/**
 * 全ての lab 記事のメタ情報を取得（日付降順ソート）
 */
export function getAllLabPosts(): LabPostMeta[] {
  if (!fs.existsSync(labDir)) return [];

  const fileNames = fs
    .readdirSync(labDir)
    .filter((name) => name.endsWith(".md"));

  const posts = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    const fullPath = path.join(labDir, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    // 冒頭100文字を抜粋として使用
    const excerpt =
      content
        .replace(/[#*>\-\n]/g, " ")
        .trim()
        .slice(0, 100) + "…";

    return {
      slug,
      title: (data.title as string) || slug,
      date: data.date instanceof Date ? data.date.toISOString().split('T')[0] : (data.date as string) || "不明",
      category: (data.category as "Body" | "Nerve" | "Story") || "Story",
      tags: (data.tags as string[]) || [],
      relatedNote: data.relatedNote as string | undefined,
      excerpt,
    };
  });

  // 日付降順
  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

/**
 * スラッグから個別の lab 記事を取得（HTML変換済み）
 */
export async function getLabPost(slug: string): Promise<LabPost | null> {
  const fullPath = path.join(labDir, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  // Markdown → HTML 変換
  const processed = await remark().use(html).process(content);
  const contentHtml = processed.toString();

  const excerpt =
    content
      .replace(/[#*>\-\n]/g, " ")
      .trim()
      .slice(0, 100) + "…";

  return {
    slug,
    title: (data.title as string) || slug,
    date: data.date instanceof Date ? data.date.toISOString().split('T')[0] : (data.date as string) || "不明",
    category: (data.category as "Body" | "Nerve" | "Story") || "Story",
    tags: (data.tags as string[]) || [],
    relatedNote: data.relatedNote as string | undefined,
    contentHtml,
    excerpt,
  };
}

/**
 * 全スラッグの一覧を取得（静的生成用）
 */
export function getAllLabSlugs(): string[] {
  if (!fs.existsSync(labDir)) return [];
  return fs
    .readdirSync(labDir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.replace(/\.md$/, ""));
}
