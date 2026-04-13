import { Lock } from "lucide-react";

/**
 * LabCard — Lab記事のカードコンポーネント
 *
 * 左端にBNSカテゴリの色付き付箋タブを表示し、
 * ホバーで浮き上がるインタラクションを持つ。
 */

interface LabCardProps {
  slug: string;
  title: string;
  date: string;
  category: "Body" | "Nerve" | "Story";
  tags: string[];
  excerpt: string;
  relatedNote?: string;
}

const categoryConfig = {
  Body: { color: "tab-body", emoji: "🦴", label: "Body" },
  Nerve: { color: "tab-nerve", emoji: "🧠", label: "Nerve" },
  Story: { color: "tab-story", emoji: "🧭", label: "Story" },
};

export default function LabCard({
  slug,
  title,
  date,
  category,
  tags,
  excerpt,
  relatedNote,
}: LabCardProps) {
  const config = categoryConfig[category];

  return (
    <a
      href={`/lab/${slug}`}
      className={`brain-card group block rounded-xl bg-paper p-6 ${config.color} animate-fade-up`}
    >
      {/* カテゴリバッジ */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">{config.emoji}</span>
        <span
          className="text-xs font-bold uppercase tracking-wide"
          style={{ color: `var(--${config.color.replace("tab-", "tab-")})` }}
        >
          {config.label}
        </span>
        
        <span className="ml-auto flex items-center gap-1.5 rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-bold text-pencil/60 border border-ink/5 group-hover:bg-clinical-blue/10 group-hover:text-clinical-blue group-hover:border-clinical-blue/20 transition-colors">
          <Lock className="h-2.5 w-2.5" />
          Lab Member Only
        </span>
      </div>

      {/* タイトル */}
      <h3 className="mb-2 text-lg font-bold leading-snug text-ink font-[family-name:var(--font-hand)]">
        {title}
      </h3>

      {/* 抜粋 */}
      <p className="mb-3 text-sm leading-relaxed text-pencil">{excerpt}</p>

      {/* タグ */}
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-highlight/40 px-2.5 py-0.5 text-xs text-ink"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* noteへの抽出リンク */}
      {relatedNote && (
        <div className="mt-3 text-xs text-clinical-blue">
          📝 このメモから生まれた note 記事あり
        </div>
      )}
    </a>
  );
}
