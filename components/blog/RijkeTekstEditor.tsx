"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect, useCallback, useState } from "react";

interface RijkeTekstEditorProps {
  waarde: string;
  onChange: (html: string) => void;
  onPasteVerwerkt?: (data: { titel?: string; metaTitel?: string; metaBeschrijving?: string; slug?: string; inhoud: string }) => void;
}

function markdownNaarHtml(md: string): string {
  const regels = md.split("\n");
  const html: string[] = [];
  let inLijst = false;
  let lijstType = "";

  function sluitLijst() {
    if (inLijst) { html.push(lijstType === "ul" ? "</ul>" : "</ol>"); inLijst = false; lijstType = ""; }
  }

  function inline(tekst: string) {
    return tekst
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  }

  for (const r of regels) {
    const trimmed = r.trim();
    if (!trimmed) { sluitLijst(); continue; }
    if (/^#{1,6}\s/.test(trimmed)) {
      sluitLijst();
      const niveau = trimmed.match(/^(#{1,6})\s/)![1].length;
      html.push(`<h${niveau}>${inline(trimmed.replace(/^#{1,6}\s/, ""))}</h${niveau}>`);
      continue;
    }
    if (/^[-*+]\s/.test(trimmed)) {
      if (!inLijst || lijstType !== "ul") { sluitLijst(); html.push("<ul>"); inLijst = true; lijstType = "ul"; }
      html.push(`<li>${inline(trimmed.replace(/^[-*+]\s/, ""))}</li>`);
      continue;
    }
    if (/^\d+\.\s/.test(trimmed)) {
      if (!inLijst || lijstType !== "ol") { sluitLijst(); html.push("<ol>"); inLijst = true; lijstType = "ol"; }
      html.push(`<li>${inline(trimmed.replace(/^\d+\.\s/, ""))}</li>`);
      continue;
    }
    if (/^---+$/.test(trimmed)) { sluitLijst(); html.push("<hr>"); continue; }
    sluitLijst();
    html.push(`<p>${inline(trimmed)}</p>`);
  }
  sluitLijst();
  return html.join("\n");
}

function parsClaudeOutput(tekst: string) {
  const regels = tekst.split("\n");
  let titel: string | undefined;
  let metaTitel: string | undefined;
  let metaBeschrijving: string | undefined;
  let slug: string | undefined;
  let artikelStart = 0;

  for (let i = 0; i < Math.min(regels.length, 20); i++) {
    const r = regels[i].trim();
    if (!r) continue;
    if (!titel && /^#{1,2}\s/.test(r)) {
      titel = r.replace(/^#{1,2}\s/, "").replace(/\*\*/g, "").trim();
      artikelStart = i + 1; continue;
    }
    if (!titel && /^\*\*(.+)\*\*$/.test(r)) {
      titel = r.replace(/^\*\*/, "").replace(/\*\*$/, "").trim();
      artikelStart = i + 1; continue;
    }
    const mtMatch = r.match(/^(?:\*\*)?Meta-?titel(?:\*\*)?[:\s]+(.+)/i);
    if (mtMatch) { metaTitel = mtMatch[1].replace(/\*\*/g, "").trim(); artikelStart = i + 1; continue; }
    const mbMatch = r.match(/^(?:\*\*)?Meta-?(?:omschrijving|beschrijving|description)(?:\*\*)?[:\s]+(.+)/i);
    if (mbMatch) { metaBeschrijving = mbMatch[1].replace(/\*\*/g, "").trim(); artikelStart = i + 1; continue; }
    const urlMatch = r.match(/^(?:\*\*)?URL(?:\*\*)?[:\s]+(?:https?:\/\/[^/]+)?\/blog\/([a-z0-9-]+)/i);
    if (urlMatch) { slug = urlMatch[1]; artikelStart = i + 1; continue; }
    if (/^---+$/.test(r)) { artikelStart = i + 1; break; }
  }

  const artikelRegels = regels.slice(artikelStart).join("\n").trim();
  const inhoud = markdownNaarHtml(artikelRegels || tekst);
  return { titel, metaTitel, metaBeschrijving, slug, inhoud };
}

function isWaarschijnlijkMarkdown(tekst: string) {
  return /^#{1,6}\s|^\*\*|^[-*+]\s|\d+\.\s/m.test(tekst) && !/<[a-z][\s\S]*>/i.test(tekst);
}

const knopStijl = (actief?: boolean): React.CSSProperties => ({
  padding: "5px 9px",
  borderRadius: 6,
  border: "1px solid",
  borderColor: actief ? "var(--color-primary)" : "var(--color-outline)",
  background: actief ? "var(--color-primary)" : "var(--color-surface-bright)",
  color: actief ? "white" : "var(--color-text)",
  fontSize: 13,
  fontWeight: actief ? 600 : 400,
  cursor: "pointer",
  lineHeight: 1,
  whiteSpace: "nowrap" as const,
});

const scheider: React.CSSProperties = {
  width: 1,
  background: "var(--color-outline)",
  alignSelf: "stretch",
  margin: "0 2px",
};

export default function RijkeTekstEditor({ waarde, onChange, onPasteVerwerkt }: RijkeTekstEditorProps) {
  const [linkDialoog, setLinkDialoog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTekst, setLinkTekst] = useState("");
  const [afbeeldingDialoog, setAfbeeldingDialoog] = useState(false);
  const [afbeeldingUrl, setAfbeeldingUrl] = useState("");
  const [afbeeldingAlt, setAfbeeldingAlt] = useState("");
  const [uploaden, setUploaden] = useState(false);
  const [uploadFout, setUploadFout] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      Image.configure({
        HTMLAttributes: { style: "max-width: 100%; height: auto; border-radius: 8px;" },
      }),
    ],
    content: waarde || "",
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      handlePaste(view, event) {
        const tekst = event.clipboardData?.getData("text/plain") ?? "";
        if (!tekst || !isWaarschijnlijkMarkdown(tekst)) return false;
        event.preventDefault();
        const parsed = parsClaudeOutput(tekst);
        editor?.commands.setContent(parsed.inhoud);
        onChange(parsed.inhoud);
        if (onPasteVerwerkt) onPasteVerwerkt(parsed);
        return true;
      },
    },
  });

  // sync external value changes (e.g. on load)
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== waarde) {
      editor.commands.setContent(waarde || "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waarde, editor]);

  const voegLinkIn = useCallback(() => {
    if (!editor) return;
    const url = linkUrl.trim();
    if (!url) { setLinkDialoog(false); return; }
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
    );
    if (selectedText) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    } else if (linkTekst.trim()) {
      editor.chain().focus().insertContent(`<a href="${url}">${linkTekst.trim()}</a>`).run();
    }
    setLinkDialoog(false);
    setLinkUrl("");
    setLinkTekst("");
  }, [editor, linkUrl, linkTekst]);

  const voegAfbeeldingIn = useCallback(() => {
    if (!editor) return;
    const url = afbeeldingUrl.trim();
    if (!url) { setAfbeeldingDialoog(false); return; }
    editor.chain().focus().setImage({ src: url, alt: afbeeldingAlt.trim() || undefined }).run();
    setAfbeeldingDialoog(false);
    setAfbeeldingUrl("");
    setAfbeeldingAlt("");
  }, [editor, afbeeldingUrl, afbeeldingAlt]);

  const handleUpload = useCallback(async (bestand: File) => {
    setUploaden(true);
    setUploadFout("");
    const form = new FormData();
    form.append("bestand", bestand);
    try {
      const res = await fetch("/api/admin/blog/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload mislukt");
      setAfbeeldingUrl(data.url);
    } catch (e) {
      setUploadFout(e instanceof Error ? e.message : "Upload mislukt");
    } finally {
      setUploaden(false);
    }
  }, []);

  if (!editor) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", border: "1px solid var(--color-outline)", borderRadius: 12, overflow: "hidden", background: "var(--color-surface-bright)" }}>
      {/* Toolbar */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 4,
        padding: "8px 12px",
        borderBottom: "1px solid var(--color-outline)",
        background: "var(--color-surface)",
        alignItems: "center",
      }}>
        {/* Koppen */}
        <button style={knopStijl(editor.isActive("heading", { level: 1 }))} onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run(); }} title="Kop 1">H1</button>
        <button style={knopStijl(editor.isActive("heading", { level: 2 }))} onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }} title="Kop 2">H2</button>
        <button style={knopStijl(editor.isActive("heading", { level: 3 }))} onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 3 }).run(); }} title="Kop 3">H3</button>

        <div style={scheider} />

        {/* Opmaak */}
        <button style={knopStijl(editor.isActive("bold"))} onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }} title="Vet (Ctrl+B)"><strong>B</strong></button>
        <button style={knopStijl(editor.isActive("italic"))} onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }} title="Cursief (Ctrl+I)"><em>I</em></button>

        <div style={scheider} />

        {/* Lijsten */}
        <button style={knopStijl(editor.isActive("bulletList"))} onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }} title="Opsomming">• lijst</button>
        <button style={knopStijl(editor.isActive("orderedList"))} onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }} title="Genummerde lijst">1. lijst</button>

        <div style={scheider} />

        {/* Link */}
        <button
          style={knopStijl(editor.isActive("link"))}
          onMouseDown={e => {
            e.preventDefault();
            if (editor.isActive("link")) {
              editor.chain().focus().unsetLink().run();
            } else {
              const selectedText = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to);
              setLinkTekst(selectedText || "");
              setLinkDialoog(true);
            }
          }}
          title="Link toevoegen"
        >
          Link
        </button>

        {/* Afbeelding */}
        <button
          style={knopStijl()}
          onMouseDown={e => { e.preventDefault(); setAfbeeldingDialoog(true); }}
          title="Afbeelding invoegen"
        >
          Afbeelding
        </button>

        <div style={scheider} />

        {/* Ongedaan */}
        <button style={knopStijl()} onMouseDown={e => { e.preventDefault(); editor.chain().focus().undo().run(); }} title="Ongedaan maken">↩</button>
        <button style={knopStijl()} onMouseDown={e => { e.preventDefault(); editor.chain().focus().redo().run(); }} title="Opnieuw">↪</button>
      </div>

      {/* Editor content */}
      <EditorContent
        editor={editor}
        style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}
      />

      {/* Link dialoog */}
      {linkDialoog && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ background: "var(--color-surface-bright)", borderRadius: 16, padding: 28, width: 400, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: "var(--color-text)" }}>Link toevoegen</div>
            {!linkTekst && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: "var(--color-text-muted)", display: "block", marginBottom: 6 }}>Linktekst</label>
                <input
                  autoFocus
                  type="text"
                  value={linkTekst}
                  onChange={e => setLinkTekst(e.target.value)}
                  placeholder="Tekst die zichtbaar is..."
                  className="input-base"
                  style={{ fontSize: 14 }}
                />
              </div>
            )}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: "var(--color-text-muted)", display: "block", marginBottom: 6 }}>URL</label>
              <input
                autoFocus={!!linkTekst}
                type="url"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && voegLinkIn()}
                placeholder="https://..."
                className="input-base"
                style={{ fontSize: 14 }}
              />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setLinkDialoog(false)} className="btn-secondary" style={{ fontSize: 13 }}>Annuleer</button>
              <button onClick={voegLinkIn} className="btn-primary" style={{ fontSize: 13 }}>Invoegen</button>
            </div>
          </div>
        </div>
      )}

      {/* Afbeelding dialoog */}
      {afbeeldingDialoog && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ background: "var(--color-surface-bright)", borderRadius: 16, padding: 28, width: 440, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: "var(--color-text)" }}>Afbeelding invoegen</div>

            {/* Upload zone */}
            <label style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              border: "2px dashed var(--color-outline)", borderRadius: 12, padding: "24px 16px",
              marginBottom: 16, cursor: uploaden ? "not-allowed" : "pointer",
              background: uploaden ? "var(--color-surface-low)" : "var(--color-surface)",
              transition: "background 150ms",
            }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) handleUpload(f);
              }}
            >
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                disabled={uploaden}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
              />
              {uploaden ? (
                <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Uploaden...</span>
              ) : afbeeldingUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={afbeeldingUrl} alt="" style={{ maxHeight: 120, maxWidth: "100%", borderRadius: 8, marginBottom: 8 }} />
                  <span style={{ fontSize: 12, color: "var(--color-primary)" }}>Andere foto kiezen</span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 24, marginBottom: 8 }}>📷</span>
                  <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Klik om foto te uploaden of sleep hierheen</span>
                  <span style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 4 }}>JPG, PNG, WebP — max 5 MB</span>
                </>
              )}
            </label>

            {uploadFout && <p style={{ fontSize: 12, color: "#a03b1f", marginBottom: 12 }}>{uploadFout}</p>}

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: "var(--color-text-muted)", display: "block", marginBottom: 6 }}>Of plak een URL</label>
              <input
                type="url"
                value={afbeeldingUrl}
                onChange={e => setAfbeeldingUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && voegAfbeeldingIn()}
                placeholder="https://..."
                className="input-base"
                style={{ fontSize: 14 }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: "var(--color-text-muted)", display: "block", marginBottom: 6 }}>Alt-tekst (voor SEO)</label>
              <input
                autoFocus
                type="text"
                value={afbeeldingAlt}
                onChange={e => setAfbeeldingAlt(e.target.value)}
                placeholder="Omschrijving van de afbeelding..."
                className="input-base"
                style={{ fontSize: 14 }}
              />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => { setAfbeeldingDialoog(false); setAfbeeldingUrl(""); setAfbeeldingAlt(""); setUploadFout(""); }} className="btn-secondary" style={{ fontSize: 13 }}>Annuleer</button>
              <button onClick={voegAfbeeldingIn} disabled={!afbeeldingUrl || uploaden} className="btn-primary" style={{ fontSize: 13, opacity: (!afbeeldingUrl || uploaden) ? 0.5 : 1 }}>Invoegen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
