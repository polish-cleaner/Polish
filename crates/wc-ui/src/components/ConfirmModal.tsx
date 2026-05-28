import Modal from "./ui/Modal";
import Button from "./ui/Button";
import type { ConfirmModalProps } from "../types/confirm-modal";

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
  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        if (!o) onCancel();
      }}
      title={title}
      variant={destructive ? "destructive" : "default"}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {message}
    </Modal>
  );
}
