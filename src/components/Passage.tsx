import { useEffect, useRef } from "react";
import type { Segment } from "../types";

interface Props {
  segments: Segment[];
  activeIds: string[];
  dimmed: boolean;
  label?: string;
}

export default function Passage({ segments, activeIds, dimmed, label }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeKey = activeIds.join(",");

  // Scroll the first highlighted segment into view when the step changes.
  useEffect(() => {
    if (!containerRef.current || activeIds.length === 0) return;
    const el = containerRef.current.querySelector<HTMLElement>(`[data-seg="${activeIds[0]}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    // activeKey is a stable stringified form of activeIds.
  }, [activeKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Group flat segments into paragraphs.
  const paragraphs: Segment[][] = [];
  for (const seg of segments) {
    if (seg.newParagraph || paragraphs.length === 0) paragraphs.push([]);
    paragraphs[paragraphs.length - 1].push(seg);
  }

  return (
    <div ref={containerRef} className={`passage${dimmed ? " dimmed" : ""}`}>
      {label && <strong className="passage-label">&lt;{label}&gt;</strong>}
      {paragraphs.map((para, i) => (
        <p key={i} className="passage-para">
          {para.map((seg) => {
            const active = activeIds.includes(seg.id);
            const cls = (seg.kind === "position" ? "pos" : "seg") + (active ? " active" : "");
            return (
              <span key={seg.id} data-seg={seg.id} className={cls}>
                {seg.text}
              </span>
            );
          })}
        </p>
      ))}
    </div>
  );
}
