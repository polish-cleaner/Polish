import type { LockedFilesModalProps } from "../types/locked-files-modal";
import styles from "./ConfirmModal.module.css";

const PREVIEW_COUNT = 5;

export default function LockedFilesModal({
  open,
  lockedFiles,
  totalFindings,
  onSkip,
  onCancel,
}: LockedFilesModalProps) {
  if (!open) return null;
  const locked = lockedFiles.length;
  const remaining = totalFindings - locked;
  const preview = lockedFiles.slice(0, PREVIEW_COUNT);
  const moreCount = locked - preview.length;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="locked-modal-title"
    >
      <div className={styles.content}>
        <h2 id="locked-modal-title">
          {locked.toLocaleString()} file{locked === 1 ? "" : "s"} can't be read
        </h2>
        <div className={styles.message}>
          <p>
            These files are open in another app (browser, editor, antivirus) and
            can't be quarantined right now. Admin elevation does not break
            exclusive file locks on Windows — only closing the locking app
            does.
          </p>
          <ul className={styles.lockedList}>
            {preview.map((p) => (
              <li key={p}><code>{p}</code></li>
            ))}
          </ul>
          {moreCount > 0 && (
            <p className={styles.more}>… and {moreCount.toLocaleString()} more.</p>
          )}
          <p>
            <strong>Skip these and quarantine the remaining{" "}
            {remaining.toLocaleString()} file{remaining === 1 ? "" : "s"}?</strong>
          </p>
        </div>
        <div className={styles.actions}>
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onSkip} className={styles.destructive}>
            Skip locked &amp; continue
          </button>
        </div>
      </div>
    </div>
  );
}
