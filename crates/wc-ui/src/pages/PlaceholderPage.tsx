import { motion } from "framer-motion";
import { Construction } from "lucide-react";
import PageLayout from "../components/PageLayout";
import Card from "../components/ui/Card";
import { fadeUp } from "../lib/motion";
import { ROUTE_META } from "../lib/routes";
import {
  PLACEHOLDER_SUBTITLES,
  type PlaceholderPageProps,
} from "../types/placeholder-page";

/**
 * Empty-state placeholder rendered for any route whose real page has
 * not yet shipped. Wrapped in PageLayout so the editorial chrome
 * matches the rest of the app; a centred Card carries a friendly
 * hint about what will live here.
 */
export default function PlaceholderPage({ routeId }: PlaceholderPageProps) {
  const meta = ROUTE_META[routeId];
  const hint = PLACEHOLDER_SUBTITLES[routeId];

  return (
    <PageLayout title={meta.label}>
      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        className="flex justify-center"
      >
        <Card
          variant="sunken"
          className="flex flex-col items-center text-center gap-3 px-10 py-12 max-w-[480px] w-full"
        >
          <Construction
            size={36}
            aria-hidden="true"
            className="text-ink-faint"
          />
          <h2 className="font-display text-[20px] m-0">Coming soon</h2>
          <p className="text-[13px] text-ink-soft m-0 max-w-[40ch]">{hint}</p>
        </Card>
      </motion.div>
    </PageLayout>
  );
}
