import { motion } from "framer-motion";
import { ShieldCheck, RotateCcw, Settings as SettingsIcon } from "lucide-react";
import Button from "../ui/Button";
import { fadeUp } from "../../lib/motion";
import type { QuickActionsRowProps } from "../../types/dashboard-widget";

/**
 * Row of ghost-button chips for shortcuts users reach for between
 * full clean runs (verify / restore / settings). Each chip routes
 * via the callback supplied by the parent Dashboard — keeps this
 * component pure presentational.
 */
export default function QuickActionsRow({
  onVerify,
  onRestore,
  onSettings,
}: QuickActionsRowProps) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-wrap gap-2 mt-2"
      aria-label="Quick actions"
    >
      <Button
        variant="ghost"
        size="sm"
        leading={<ShieldCheck size={14} aria-hidden="true" />}
        onClick={onVerify}
      >
        Verify a bundle
      </Button>
      <Button
        variant="ghost"
        size="sm"
        leading={<RotateCcw size={14} aria-hidden="true" />}
        onClick={onRestore}
      >
        Restore a bundle
      </Button>
      <Button
        variant="ghost"
        size="sm"
        leading={<SettingsIcon size={14} aria-hidden="true" />}
        onClick={onSettings}
      >
        Settings
      </Button>
    </motion.div>
  );
}
