"use client";
import { useRouter } from "next/navigation";

interface Props {
  tags: string[];
  actieveTag?: string;
}

export function BlogTagFilter({ tags, actieveTag }: Props) {
  const router = useRouter();

  const navigeer = (tag: string | null) => {
    router.push(tag ? `/blog?tag=${encodeURIComponent(tag)}` : "/blog");
  };

  const btnBase: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 500,
    padding: "6px 16px",
    borderRadius: 100,
    border: "1px solid var(--color-outline)",
    background: "transparent",
    color: "var(--color-text-muted)",
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  };

  const btnActief: React.CSSProperties = {
    ...btnBase,
    background: "var(--color-primary)",
    borderColor: "var(--color-primary)",
    color: "#fff",
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <button
        style={!actieveTag ? btnActief : btnBase}
        onClick={() => navigeer(null)}
      >
        Alle artikelen
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          style={tag === actieveTag ? btnActief : btnBase}
          onClick={() => navigeer(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
