/**
 * MochiComment — もちスラのマージン注釈コンポーネント
 *
 * 記事中に挟み込む、もちスラの一言メモ風コメント。
 * 「まだ完成していない思考」というコンセプトを体現する。
 */

interface MochiCommentProps {
  children: string;
}

export default function MochiComment({ children }: MochiCommentProps) {
  return (
    <aside className="mochi-comment">
      {children}
    </aside>
  );
}
