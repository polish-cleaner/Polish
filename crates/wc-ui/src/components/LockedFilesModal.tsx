import Modal from "./ui/Modal";
import Button from "./ui/Button";
import type { LockedFilesModalProps } from "../types/locked-files-modal";

const PREVIEW_COUNT = 5;

export default function LockedFilesModal({
  open,
  lockedFiles,
  totalFindings,
  onSkip,
  onCancel,
}: LockedFilesModalProps) {
  const locked = lockedFiles.length;
  const remaining = totalFindings - locked;
  const preview = lockedFiles.slice(0, PREVIEW_COUNT);
  const moreCount = locked - preview.length;
  const heading = `${locked.toLocaleString()} file${locked === 1 ? "" : "s"} can't be read`;

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        if (!o) onCancel();
      }}
      title={heading}
      variant="destructive"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onSkip}>
            Skip locked &amp; continue
          </Button>
        </>
      }
    >
      <p>
        These files are open in another app (browser, editor, antivirus) and
        can't be quarantined right now. Admin elevation does not break exclusive
        file locks on Windows — only closing the locking app does.
      </p>
      <ul className="list-none p-3 mt-2 mb-2 max-h-[160px] overflow-y-auto bg-surface-sunken rounded-sm text-[12px]">
        {preview.map((p) => (
          <li key={p} className="py-[2px] break-all">
            <code>{p}</code>
          </li>
        ))}
      </ul>
      {moreCount > 0 && (
        <p className="text-[12px] text-ink-muted mt-2">
          … and {moreCount.toLocaleString()} more.
        </p>
      )}
      <p className="mt-3">
        <strong>
          Skip these and quarantine the remaining {remaining.toLocaleString()}{" "}
          file{remaining === 1 ? "" : "s"}?
        </strong>
      </p>
    </Modal>
  );
}
