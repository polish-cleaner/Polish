import type { Variants, Easing } from "framer-motion";

/**
 * Canonical Framer Motion vocabulary for Polish.
 *
 * Every page transition, modal, drawer, toast, list, and shimmer in
 * the app MUST import a variant from this file. Per AGENTS.md Rule 7,
 * inlining variants in components is forbidden.
 *
 * Easing curves and durations mirror the design-token `--ease-*` /
 * `--t-*` values so the Framer-driven motion matches CSS-driven
 * micro-transitions exactly.
 */

// --------------------------------------------------------------
// Eases — keep in sync with tokens.css --ease-out / --ease-spring
// --------------------------------------------------------------
export const EASE_OUT: Easing = [0.22, 1, 0.36, 1];
export const EASE_SPRING: Easing = [0.34, 1.56, 0.64, 1];

// --------------------------------------------------------------
// Durations (seconds — Framer's unit). Mirror --t-fast / --t-base /
// --t-slow tokens (120ms / 240ms / 400ms).
// --------------------------------------------------------------
export const DURATION_FAST = 0.12;
export const DURATION_BASE = 0.24;
export const DURATION_SLOW = 0.4;

// --------------------------------------------------------------
// Variants
// --------------------------------------------------------------

/** Page transitions and most enter-from-below content. */
export const fadeUp: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION_BASE, ease: EASE_OUT } },
  exit:    { opacity: 0, y: -4, transition: { duration: DURATION_FAST, ease: EASE_OUT } },
};

/** Pure opacity — backdrops, ambient overlays. */
export const fade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: DURATION_BASE, ease: EASE_OUT } },
  exit:    { opacity: 0, transition: { duration: DURATION_FAST, ease: EASE_OUT } },
};

/** Modals — slight scale-in keeps weight on the centre. */
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: DURATION_BASE, ease: EASE_OUT } },
  exit:    { opacity: 0, scale: 0.96, transition: { duration: DURATION_FAST, ease: EASE_OUT } },
};

/** Right-side drawers (quarantine detail, settings panes). */
export const slideFromRight: Variants = {
  initial: { x: "100%", opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: DURATION_BASE, ease: EASE_OUT } },
  exit:    { x: "100%", opacity: 0, transition: { duration: DURATION_FAST, ease: EASE_OUT } },
};

/** Toast stack — rise + settle. */
export const toastSlide: Variants = {
  initial: { opacity: 0, y: 16, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: DURATION_BASE, ease: EASE_OUT } },
  exit:    { opacity: 0, y: 8, scale: 0.96, transition: { duration: DURATION_FAST, ease: EASE_OUT } },
};

/**
 * Stagger child entrances. Pass to a parent <motion.ul> /
 * <motion.div> whose children use `fadeUp` (or any variant that
 * inherits its parent's `animate` trigger).
 */
export const stagger = (delayChildren = 0, staggerChildren = 0.04): Variants => ({
  animate: { transition: { delayChildren, staggerChildren } },
});
