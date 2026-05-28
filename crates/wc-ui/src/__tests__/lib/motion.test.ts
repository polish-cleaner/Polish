import { describe, it, expect } from "vitest";
import {
  DURATION_BASE,
  DURATION_FAST,
  DURATION_SLOW,
  EASE_OUT,
  EASE_SPRING,
  fade,
  fadeUp,
  scaleIn,
  slideFromRight,
  stagger,
  toastSlide,
} from "../../lib/motion";

describe("motion durations", () => {
  it("exposes fast/base/slow constants in seconds, ordered ascending", () => {
    expect(DURATION_FAST).toBeGreaterThan(0);
    expect(DURATION_BASE).toBeGreaterThan(DURATION_FAST);
    expect(DURATION_SLOW).toBeGreaterThan(DURATION_BASE);
    // Sanity: durations must be sub-second per design system.
    expect(DURATION_SLOW).toBeLessThanOrEqual(1);
  });
});

describe("motion easings", () => {
  it("EASE_OUT is the canonical cubic-bezier(0.22, 1, 0.36, 1)", () => {
    expect(EASE_OUT).toEqual([0.22, 1, 0.36, 1]);
  });

  it("EASE_SPRING is the canonical cubic-bezier(0.34, 1.56, 0.64, 1)", () => {
    expect(EASE_SPRING).toEqual([0.34, 1.56, 0.64, 1]);
  });
});

describe("variants — shape contract", () => {
  const named = { fadeUp, fade, scaleIn, slideFromRight, toastSlide };

  for (const [name, variant] of Object.entries(named)) {
    it(`${name} has initial/animate/exit keys`, () => {
      expect(variant).toHaveProperty("initial");
      expect(variant).toHaveProperty("animate");
      expect(variant).toHaveProperty("exit");
    });
  }
});

describe("variant — value contract", () => {
  it("fadeUp animates from y:8 → y:0", () => {
    expect(fadeUp.initial).toMatchObject({ opacity: 0, y: 8 });
    expect(fadeUp.animate).toMatchObject({ opacity: 1, y: 0 });
  });

  it("scaleIn animates from scale:0.96 → scale:1", () => {
    expect(scaleIn.initial).toMatchObject({ opacity: 0, scale: 0.96 });
    expect(scaleIn.animate).toMatchObject({ opacity: 1, scale: 1 });
  });

  it("slideFromRight enters from x:100% and exits to x:100%", () => {
    expect(slideFromRight.initial).toMatchObject({ x: "100%" });
    expect(slideFromRight.exit).toMatchObject({ x: "100%" });
  });

  it("toastSlide stacks opacity + y + scale", () => {
    expect(toastSlide.initial).toMatchObject({ opacity: 0, y: 16, scale: 0.96 });
  });

  it("animate transitions use DURATION_BASE", () => {
    type AnimateObj = { transition?: { duration?: number } };
    const fadeUpAnim = fadeUp.animate as AnimateObj;
    expect(fadeUpAnim.transition?.duration).toBe(DURATION_BASE);

    const scaleAnim = scaleIn.animate as AnimateObj;
    expect(scaleAnim.transition?.duration).toBe(DURATION_BASE);
  });
});

describe("stagger factory", () => {
  it("returns a variant with animate.transition.staggerChildren", () => {
    const s = stagger(0.1, 0.05);
    type AnimateObj = { transition?: { delayChildren?: number; staggerChildren?: number } };
    const anim = s.animate as AnimateObj;
    expect(anim.transition?.delayChildren).toBe(0.1);
    expect(anim.transition?.staggerChildren).toBe(0.05);
  });

  it("defaults to 0 delay and 0.04 stagger", () => {
    const s = stagger();
    type AnimateObj = { transition?: { delayChildren?: number; staggerChildren?: number } };
    const anim = s.animate as AnimateObj;
    expect(anim.transition?.delayChildren).toBe(0);
    expect(anim.transition?.staggerChildren).toBe(0.04);
  });
});
