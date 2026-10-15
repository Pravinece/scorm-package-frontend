function formatAnswer(raw) {
  let esc = raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  esc = esc.replace(/\[([^\]\n]{2,90})\]/g, '<span class="cite">[$1]</span>');
  esc = esc.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  const lines = esc.split("\n");
  let html = "";
  let inList = false;
  for (const line of lines) {
    const m = /^\s*[-•]\s+(.*)$/.exec(line);
    if (m) {
      if (!inList) {
        html += "<ul class='list-disc pl-4 my-1'>";
        inList = true;
      }
      html += `<li>${m[1]}</li>`;
    } else {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += line.trim() === "" ? "<br>" : line + "<br>";
    }
  }
  if (inList) html += "</ul>";
  return html;
}

export default function ChatBubble({ role, text, citations }) {
  if (role === "system") {
    return (
      <div className="self-center max-w-full">
        <div className="border border-dashed border-[var(--color-line)] text-[var(--color-ink-soft)] text-[12.5px] text-center rounded-lg px-3 py-2">
          {text}
        </div>
      </div>
    );
  }

  const isUser = role === "user";
  return (
    <div className={`flex flex-col gap-1 max-w-[88%] ${isUser ? "self-end items-end" : "self-start items-start"}`}>
      <span className="font-mono text-[10.5px] uppercase tracking-wide text-[var(--color-ink-soft)] px-1">
        {isUser ? "You" : "Tutor"}
      </span>
      <div
        className={`rounded-xl px-3.5 py-2.5 text-[14px] leading-relaxed [&_.cite]:bg-[var(--color-accent)]/15 [&_.cite]:text-[var(--color-accent)] [&_.cite]:rounded [&_.cite]:px-1 [&_.cite]:font-mono [&_.cite]:text-[12px] ${
          isUser
            ? "bg-[var(--color-ink)] text-white rounded-br-sm"
            : "bg-[var(--color-surface)] border border-[var(--color-line)] border-l-2 border-l-[var(--color-accent)] rounded-bl-sm"
        }`}
        dangerouslySetInnerHTML={{ __html: formatAnswer(text) }}
      />
      {citations?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-1">
          {citations.slice(0, 4).map((c, i) => (
            <span
              key={i}
              title={`relevance ${Math.round((c.score || 0) * 100)}%`}
              className="font-mono text-[10.5px] px-1.5 py-0.5 rounded bg-[var(--color-paper)] border border-[var(--color-line)] text-[var(--color-ink-soft)]"
            >
              {c.sourceType === "reference" ? "ref" : "course"} · {c.docName}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
