/**
 * /brain/[slug] — もちスラ brain の個別記事ページ
 * /lab/[slug] — もちスラ Lab の個別記事ページ
 *
 * 方眼紙の背景に、木田さんの「未完成の思考」を表示する。
 * Markdown本文 + もちスラ注釈 + noteへの導線。
 *
 * Next.js 16: params は Promise<{ slug: string }> として受け取る。
 */
import { getLabPost, getAllLabSlugs } from "@/lib/lab";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import LabGate from "@/components/LabGate";

const categoryConfig = {
  Body: { emoji: "🦴", tabClass: "tab-body", color: "var(--tab-green)" },
  Nerve: { emoji: "🧠", tabClass: "tab-nerve", color: "var(--tab-purple)" },
  Story: { emoji: "🧭", tabClass: "tab-story", color: "var(--tab-amber)" },
};

// 静的パス生成
export function generateStaticParams() {
  const slugs = getAllLabSlugs();
  return slugs.map((slug) => ({ slug }));
}

// 動的メタデータ
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getLabPost(slug);
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} — もちスラ Lab`,
    description: post.excerpt,
  };
}

export default async function LabPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getLabPost(slug);
  if (!post) notFound();

  // ── JSON-LD for AIEO / SEO ──
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt || post.title,
    "datePublished": post.date,
    "author": {
      "@type": "Person",
      "name": "きだ",
      "url": "https://lab.mochisura-lab.com/about"
    },
    "publisher": {
      "@type": "Organization",
      "name": "M.O.C.H.I. LABO",
      "logo": {
        "@type": "ImageObject",
        "url": "https://lab.mochisura-lab.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://lab.mochisura-lab.com/lab/${post.slug || slug}`
    }
  };

  const config = categoryConfig[post.category as keyof typeof categoryConfig] || categoryConfig.Story;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* ── JSON-LD for AIEO ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ── 戻るリンク & 日付 ── */}
      <div className="mb-8 flex items-center justify-between text-sm text-pencil">
        <a
          href="/lab"
          className="transition-colors hover:text-clinical-blue"
        >
          ← 一覧に戻る
        </a>
        <time>{post.date}</time>
      </div>

      {/* ── ゲートを通す ── */}
      <LabGate>
        {/* ── 方眼紙の記事エリア ── */}
        <article
          className={`graph-paper rounded-2xl p-8 sm:p-12 ${config.tabClass} animate-fade-up`}
        >
          {/* カテゴリバッジ */}
          <div className="mb-4 flex items-center gap-2">
            <span className="text-2xl">{config.emoji}</span>
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: config.color }}
            >
              {post.category}
            </span>
          </div>

          {/* タイトル */}
          <h1 className="mb-8 text-3xl font-bold leading-snug text-ink font-[family-name:var(--font-hand)]">
            {post.title}
          </h1>

          {/* 本文 */}
          <div
            className="prose-brain"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />

          {/* タグ */}
          <div className="mt-10 flex flex-wrap gap-2 border-t border-dashed border-pencil/30 pt-6">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-highlight/40 px-3 py-1 text-xs text-ink"
              >
                #{tag}
              </span>
            ))}
          </div>
        </article>
      </LabGate>

      {/* ── note への導線 ── */}
      {post.relatedNote && (
        <div className="mt-8 rounded-xl bg-paper p-6 text-center">
          <p className="mb-2 text-sm font-bold text-ink">
            📝 このメモから生まれた記事
          </p>
          <a
            href={`https://note.com/mochisuranote`}
            className="text-sm text-clinical-blue underline underline-offset-4 transition-colors hover:text-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            note で完成版を読む →
          </a>
        </div>
      )}

      {/* ── メルマガ CTA ── */}
      <div className="mt-8 rounded-xl graph-paper p-8 text-center">
        <p className="mb-2 text-lg font-bold font-[family-name:var(--font-hand)] text-ink">
          💌 こういう思考の続きを、直接届けます。
        </p>
        <p className="mb-4 text-sm text-pencil">
          加工する前の「脳内のスパーク」を、メールでそのまま。
        </p>
        <a
          href="/newsletter"
          className="inline-block rounded-full bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          きだからの手紙を受け取る
        </a>
      </div>
    </div>
  );
}
