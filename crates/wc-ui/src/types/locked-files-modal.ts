export interface LockedFilesModalProps {
  open: boolean;
  lockedFiles: string[];
  totalFindings: number;
  onSkip: () => void;
  onCancel: () => void;
}
