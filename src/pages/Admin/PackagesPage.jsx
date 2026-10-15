import { useEffect, useRef, useState } from "react";
import { getPackages, uploadPackage, triggerTranscription, deletePackage } from "../../api/packageApi";
import { Card, Button, Spinner, EmptyState } from "../../components/ui";
import StatusBadge from "../../components/StatusBadge";
import { toast } from "../../store/toastStore";
import { isAdmin } from "../../lib/roles";
import { UploadCloud, PackageSearch, Mic2, Trash2 } from "lucide-react";

const PROCESSING = new Set(["queued", "unzipping", "extracting", "chunking", "indexing", "transcribing"]);

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transcribingId, setTranscribingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const fileRef = useRef(null);
  const pollRef = useRef(null);

  const load = async () => {
    const res = await getPackages();
    if (res.success) setPackages(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    return () => clearInterval(pollRef.current);
  }, []);

  useEffect(() => {
    const anyProcessing = packages.some((p) => PROCESSING.has(p.status));
    if (anyProcessing && !pollRef.current) {
      pollRef.current = setInterval(load, 4000);
    } else if (!anyProcessing && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packages]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (!file.name.endsWith(".zip")) {
      toast.error("Only .zip SCORM packages are accepted");
      return;
    }
    setUploading(true);
    setProgress(0);
    const res = await uploadPackage(file, setProgress);
    setUploading(false);
    if (res.success) {
      toast.success("Package queued for processing");
      load();
    } else {
      toast.error(res.message);
    }
  };

  const handleDelete = async () => {
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    const res = await deletePackage(id);
    if (res.success) {
      toast.success("Package deleted");
      setPackages((prev) => prev.filter((p) => p._id !== id));
    } else {
      toast.error(res.message);
    }
  };

  const handleTranscribe = async (id) => {
    setTranscribingId(id);
    const res = await triggerTranscription(id);
    setTranscribingId(null);
    if (res.success) {
      toast.success("Transcription started");
      load();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="h-full overflow-y-auto animate-rise">
      <Card className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="font-display text-[16px] flex items-center gap-2"><UploadCloud size={16} /> Upload a SCORM package</p>
          <p className="text-[12.5px] text-[var(--color-ink-soft)] mt-1">
            {uploading ? `Uploading… ${progress}%` : ".zip files only, up to 2GB. Processing runs in the background."}
          </p>
        </div>
        <div>
          <input ref={fileRef} type="file" accept=".zip" hidden onChange={handleFile} />
          <Button variant="accent" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <UploadCloud size={14} /> {uploading ? "Uploading…" : "Choose .zip"}
          </Button>
        </div>
      </Card>

      {loading ? (
        <Spinner />
      ) : packages.length === 0 ? (
        <EmptyState icon={PackageSearch} title="No packages yet" description="Upload your first SCORM .zip above to get started." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((pkg) => (
            <Card key={pkg._id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display text-[15px] leading-tight">{pkg.title || pkg.sourceZipName}</p>
                  <p className="text-[11px] text-[var(--color-ink-soft)] font-mono mt-1">{pkg._id}</p>
                </div>
                <StatusBadge status={pkg.status} />
              </div>

              {pkg.stats && (
                <p className="text-[12.5px] text-[var(--color-ink-soft)]">
                  {pkg.stats.slideCount} slides · {pkg.stats.mcqResolved}/{pkg.stats.mcqTotal} answer keys ·{" "}
                  {pkg.stats.courseChunks + pkg.stats.referenceChunks} chunks
                </p>
              )}
              {pkg.status === "failed" && pkg.error && (
                <p className="text-[12.5px] text-[var(--color-bad)]">{pkg.error}</p>
              )}

              <div className="flex items-center justify-between gap-2 mt-1">
                <span className="text-[11px] text-[var(--color-ink-soft)] font-mono">
                  {pkg.transcribed ? "transcribed" : "not transcribed"}
                </span>
                <div className="flex gap-2">
                  {isAdmin() && pkg.status === "ready" && !pkg.transcribed && (
                    <Button variant="ghost" onClick={() => handleTranscribe(pkg._id)} disabled={transcribingId === pkg._id}>
                      <Mic2 size={13} /> {transcribingId === pkg._id ? "Starting…" : "Transcribe"}
                    </Button>
                  )}
                  {isAdmin() && (
                    <Button variant="ghost" onClick={() => setConfirmDeleteId(pkg._id)}>
                      <Trash2 size={13} className="text-[var(--color-bad)]" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-[var(--color-surface)] rounded-xl p-6 shadow-xl flex flex-col gap-4 w-80">
            <p className="font-display text-[15px]">Delete package?</p>
            <p className="text-[12.5px] text-[var(--color-ink-soft)]">
              This will permanently remove the package and all associated data.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
              <Button variant="accent" onClick={handleDelete} className="!bg-[var(--color-bad)]">
                <Trash2 size={13} /> Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
