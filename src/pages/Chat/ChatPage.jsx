import { useEffect, useRef, useState } from "react";
import { getPackages } from "../../api/packageApi";
import { askQuestion } from "../../api/chatApi";
import { AVATARS, DEFAULT_AVATAR_ID } from "../../config/avatars";
import AvatarStage from "../../components/AvatarStage";
import ChatBubble from "../../components/ChatBubble";
import { Select, Button, EmptyState } from "../../components/ui";
import useSpeech from "../../hooks/useSpeech";
import { toast } from "../../store/toastStore";
import { Mic, Send, Volume2, SkipForward, PackageX } from "lucide-react";
import PlayScorm from "../Courses/PlayScorm";

const PROCESSING = new Set(["queued", "unzipping", "extracting", "chunking", "indexing", "transcribing"]);

export default function ChatPage() {
  const [avatarId, setAvatarId] = useState(DEFAULT_AVATAR_ID);
  const avatar = AVATARS.find((a) => a.id === avatarId) || AVATARS[0];

  const [packages, setPackages] = useState([]);
  const [packageId, setPackageId] = useState("");
  const [loadingPackages, setLoadingPackages] = useState(true);

  const [messages, setMessages] = useState([
    { role: "system", text: "Pick a ready package, then ask the tutor anything about it — type or tap the mic." },
  ]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);

  const { listening, speaking, speak, skipSpeech, listenOnce } = useSpeech(avatar.voice);
  const pollRef = useRef(null);
  const scrollRef = useRef(null);

  const loadPackages = async () => {
    const res = await getPackages();
    if (res.success) {
      setPackages(res.data);
      if (!packageId && res.data.length) {
        const ready = res.data.find((p) => p.status === "ready");
        setPackageId(ready ? ready._id : res.data[0]._id);
      }
    }
    setLoadingPackages(false);
  };

  useEffect(() => {
    loadPackages();
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const current = packages.find((p) => p._id === packageId);
    if (current && PROCESSING.has(current.status)) {
      if (!pollRef.current) {
        pollRef.current = setInterval(loadPackages, 4000);
      }
    } else if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packages, packageId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const selected = packages.find((p) => p._id === packageId);
  const isReady = selected?.status === "ready";

  const send = async (question) => {
    if (!question.trim() || sending) return;
    if (!isReady) {
      toast.error("Pick a package that's finished processing first");
      return;
    }
    setMessages((m) => [...m, { role: "user", text: question }]);
    const nextHistory = [...history, { role: "user", content: question }];
    setHistory(nextHistory);
    setInput("");
    setSending(true);

    const res = await askQuestion({ question, packageId, history: nextHistory.slice(-10) });
    if (res.success) {
      const answer = res.data.answer || "";
      setMessages((m) => [...m, { role: "assistant", text: answer, citations: res.data.citations }]);
      setHistory((h) => [...h, { role: "assistant", content: answer }]);
      if (autoSpeak) speak(answer);
    } else {
      setMessages((m) => [...m, { role: "assistant", text: `Couldn't get an answer: ${res.message}` }]);
    }
    setSending(false);
  };

  const handleMic = async () => {
    if (listening) return;
    const text = await listenOnce((interim) => setInput(interim));
    setInput("");
    if (text) send(text);
  };

  const state = speaking ? "speaking" : listening ? "listening" : "idle";

  return (
    <div className="h-full grid lg:grid-cols-[280px_1fr] gap-5 animate-rise">
      <div className="flex flex-col gap-4">
        <AvatarStage avatar={avatar} state={state} />
        <Select label="Avatar" value={avatarId} onChange={(e) => setAvatarId(e.target.value)}>
          {AVATARS.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </Select>
        <Select
          label="Package"
          value={packageId}
          onChange={(e) => setPackageId(e.target.value)}
          disabled={loadingPackages || packages.length === 0}
        >
          {packages.length === 0 && <option value="">No packages yet</option>}
          {packages.map((p) => (
            <option key={p._id} value={p._id}>
              {p.title || p.sourceZipName || p._id} {p.status !== "ready" ? `(${p.status}…)` : ""}
            </option>
          ))}
        </Select>
        <label className="flex items-center gap-2 text-[12.5px] text-[var(--color-ink-soft)]">
          <input type="checkbox" checked={autoSpeak} onChange={(e) => setAutoSpeak(e.target.checked)} />
          <Volume2 size={13} /> Speak replies aloud
        </label>
        {speaking && (
          <Button variant="ghost" onClick={skipSpeech} className="self-start">
            <SkipForward size={13} /> Skip
          </Button>
        )}
      </div>

    <div className="w-full h-full">
      <div className="w-full h-[65%] m-2">
        <PlayScorm packageId={packageId} packages={packages} />
      </div>
      <div className="flex flex-col bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl overflow-hidden min-h-0 h-[30%]">
        {packages.length === 0 && !loadingPackages ? (
          <EmptyState
          icon={PackageX}
          title="No packages yet"
          description="Ask an admin or uploader to add a SCORM package before chatting."
          />
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {messages.map((m, i) => (
                <ChatBubble key={i} role={m.role} text={m.text} citations={m.citations} />
              ))}
              {sending && <ChatBubble role="assistant" text="Thinking…" />}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-end gap-2 p-3 border-t border-[var(--color-line)]"
              >
              <button
                type="button"
                onClick={handleMic}
                title="Talk instead of typing"
                className={`w-10 h-10 flex-shrink-0 rounded-lg border flex items-center justify-center transition-colors ${
                  listening
                  ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white pulse-ring"
                  : "border-[var(--color-line)] text-[var(--color-ink-soft)] hover:border-[var(--color-accent)]"
                }`}
                >
                <Mic size={16} />
              </button>
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder={listening ? "Listening…" : "Ask me anything about this course, or tap the mic…"}
                className="flex-1 resize-none max-h-28 px-3 py-2.5 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper)] text-[14px] outline-none focus:border-[var(--color-ink)]"
                />
              <Button type="submit" variant="accent" disabled={sending || !isReady}>
                <Send size={14} />
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
    </div>
  );
}
