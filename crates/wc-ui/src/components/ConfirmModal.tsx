import type { ConfirmModalProps } from "../types/confirm-modal";
import styles from "./ConfirmModal.module.css";

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;
  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className={styles.content}>
        <h2 id="confirm-modal-title">{title}</h2>
        <div className={styles.message}>{message}</div>
        <div className={styles.actions}>
          <button onClick={onCancel}>{cancelLabel}</button>
          <button
            onClick={onConfirm}
            className={destructive ? styles.destructive : undefined}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
