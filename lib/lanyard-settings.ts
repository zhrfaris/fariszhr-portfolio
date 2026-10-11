import { z } from "zod";

/**
 * Settings for the landing page's hanging ID card (React Bits Lanyard), edited
 * in the dashboard and shared by both modes. Front/back images live on the
 * user (card_front / card_back) and the band image as band_image.
 */

const hex = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #353535");
const unit = (min: number, max: number) => z.number().min(min).max(max);

export const LanyardSettingsSchema = z.object({
  imageFit: z.enum(["cover", "contain"]),
  orientation: z.enum(["portrait", "landscape"]),
  finish: z.enum(["glossy", "matte", "holographic", "metallic"]),
  metal: z.enum(["silver", "gold", "graphite"]),
  cardColor: hex,
  plainBand: z.boolean(),
  bandColor: hex,
  cornerRadius: unit(0, 1),
  size: unit(0.15, 0.9),
  bandLength: unit(0, 1),
  bandWidth: unit(0.4, 2),
  anchor: z.enum(["left", "center", "right"]),
  gravity: unit(0, 3),
  damping: unit(0, 1),
  elasticity: unit(0, 1),
  breeze: unit(0, 1),
  interactive: z.boolean(),
  /** How the card arrives on first load: falls in from above, swings in
   * from the side (React Bits' intro), or is just there. */
  entrance: z.enum(["drop", "swing", "off"]),
});

export type LanyardSettings = z.infer<typeof LanyardSettingsSchema>;

/** The component's own defaults (React Bits), used by "Reset to defaults". */
export const REACT_BITS_DEFAULTS: LanyardSettings = {
  imageFit: "cover",
  orientation: "portrait",
  finish: "glossy",
  metal: "silver",
  cardColor: "#ffffff",
  plainBand: true,
  bandColor: "#111111",
  cornerRadius: 0.3,
  size: 0.6,
  bandLength: 0.5,
  bandWidth: 0.65,
  anchor: "center",
  gravity: 1,
  damping: 0.5,
  elasticity: 0.5,
  breeze: 0.5,
  interactive: true,
  entrance: "swing",
};

/** What the page uses until settings are saved: tuned to the Figma frames. */
export const SITE_DEFAULTS: LanyardSettings = {
  ...REACT_BITS_DEFAULTS,
  cardColor: "#f5f5f5",
  bandColor: "#353535",
  cornerRadius: 0.39,
  bandWidth: 1.06,
  breeze: 0.25,
  entrance: "drop",
};

/** Number fields: [min, max, step] for the dashboard inputs. */
export const LANYARD_RANGES = {
  cornerRadius: [0, 1, 0.01],
  size: [0.15, 0.9, 0.01],
  bandLength: [0, 1, 0.01],
  bandWidth: [0.4, 2, 0.01],
  gravity: [0, 3, 0.05],
  damping: [0, 1, 0.01],
  elasticity: [0, 1, 0.01],
  breeze: [0, 1, 0.01],
} as const;

const ENTRANCES = LanyardSettingsSchema.shape.entrance.options;

/** Saved settings over the site defaults (tolerates older/partial rows).
 * Rows saved before `entrance` existed only have the old `intro` switch:
 * on was the sideways swing, off was no entrance. */
export const resolveLanyard = (
  stored?: Record<string, unknown> | null
): LanyardSettings => {
  const { intro, entrance, ...rest } = stored ?? {};
  const merged = {
    ...SITE_DEFAULTS,
    ...rest,
    entrance: ENTRANCES.includes(entrance as LanyardSettings["entrance"])
      ? entrance
      : typeof intro === "boolean"
        ? intro
          ? "swing"
          : "off"
        : SITE_DEFAULTS.entrance,
  };
  const parsed = LanyardSettingsSchema.safeParse(merged);
  return parsed.success ? parsed.data : SITE_DEFAULTS;
};

/** The stored shape: `entrance`, plus the old `intro` switch kept in step
 * (the database type still requires it, and it reads back the same). */
export const toStoredLanyard = (settings: LanyardSettings) => ({
  ...settings,
  intro: settings.entrance === "swing",
});

/* ---- how the settings map onto the landing layout ---- */

/** React Bits' default size (0.6) is the Figma card: 180px wide on desktop. */
export const sizeScale = (size: number) => size / REACT_BITS_DEFAULTS.size;

/** Card width / height. Portrait is the Figma 12:19 badge. */
export const cardAspect = (orientation: LanyardSettings["orientation"]) =>
  orientation === "landscape" ? 19 / 12 : 12 / 19;

/** Anchor nudges the card off its spot by this share of its own width. */
export const anchorShift = (anchor: LanyardSettings["anchor"]) =>
  anchor === "left" ? -0.5 : anchor === "right" ? 0.5 : 0;
