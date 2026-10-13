"use client";

import { Image as ImageType } from "@prisma/client";

import ColorField from "@/components/form/color-field";
import RangeField from "@/components/form/range-field";
import FormSelect from "@/components/form/form-select";
import FormSwitch from "@/components/form/form-switch";
import { Button } from "@/components/shadcn/button";
import {
  LANYARD_RANGES,
  LanyardSettings,
  REACT_BITS_DEFAULTS,
} from "@/lib/lanyard-settings";
import CardPhotoSlot from "./card-photo-slot";
import { SectionCard } from "@/components/dashboard/section-card";

type NumberKey = keyof typeof LANYARD_RANGES;

const NUMBER_FIELDS: { key: NumberKey; label: string; hint: string }[] = [
  {
    key: "size",
    label: "Size",
    hint: "0.6 is the Figma card (180px wide on desktop).",
  },
  {
    key: "bandLength",
    label: "Band length",
    hint: "The card always rests on the first content row, so this sets how far above the page the band hangs from: longer swings slower and wider.",
  },
  {
    key: "bandWidth",
    label: "Band width",
    hint: "Relative to the card; 1.06 matches the Figma band.",
  },
  {
    key: "cornerRadius",
    label: "Corner radius",
    hint: "0 is square, 1 is fully rounded.",
  },
  { key: "gravity", label: "Gravity", hint: "How heavy the card feels." },
  {
    key: "damping",
    label: "Damping",
    hint: "How quickly the swinging settles.",
  },
  { key: "elasticity", label: "Elasticity", hint: "How springy the band is." },
  {
    key: "breeze",
    label: "Breeze",
    hint: "Idle sway. 0 keeps the card still at rest.",
  },
];

/**
 * The hanging ID card's settings, shared by / and /photography, as four
 * section cards (Card, Lanyard band, Size & motion, Behavior). Controlled by
 * the Landing Page form, which saves them with the rest of the page.
 */
const LanyardSettingsSection = ({
  value,
  onChange,
  bandImage,
  onBandImageChange,
  errors,
}: {
  value: LanyardSettings;
  onChange: (next: LanyardSettings) => void;
  bandImage: ImageType | null;
  onBandImageChange: (image: ImageType | null) => void;
  errors?: Record<string, string[] | undefined>;
}) => {
  const set = <K extends keyof LanyardSettings>(
    key: K,
    next: LanyardSettings[K]
  ) => onChange({ ...value, [key]: next });

  return (
    <>
      <SectionCard
        icon="card"
        title="Card"
        description="How the ID card looks: photo fit, orientation, finish, and metal parts."
        action={
          <Button
            type="button"
            variant="ghost"
            onClick={() => onChange(REACT_BITS_DEFAULTS)}
          >
            Reset to defaults
          </Button>
        }
      >
        <FormSelect
          layout="row"
          id="lanyard_imageFit"
          label="Image fit"
          values={["cover", "contain"]}
          value={value.imageFit}
          onValueChange={(v) =>
            set("imageFit", v as LanyardSettings["imageFit"])
          }
          errors={errors}
        />
        <FormSelect
          layout="row"
          id="lanyard_orientation"
          label="Orientation"
          values={["portrait", "landscape"]}
          value={value.orientation}
          onValueChange={(v) =>
            set("orientation", v as LanyardSettings["orientation"])
          }
          errors={errors}
        />
        <FormSelect
          layout="row"
          id="lanyard_finish"
          label="Finish"
          values={["glossy", "matte", "holographic", "metallic"]}
          value={value.finish}
          onValueChange={(v) => set("finish", v as LanyardSettings["finish"])}
          errors={errors}
        />
        <FormSelect
          layout="row"
          id="lanyard_metal"
          label="Metal"
          hint="The clip and the ring."
          values={["silver", "gold", "graphite"]}
          value={value.metal}
          onValueChange={(v) => set("metal", v as LanyardSettings["metal"])}
          errors={errors}
        />
        <ColorField
          id="lanyard_cardColor"
          label="Card color"
          value={value.cardColor}
          onChange={(hex) => set("cardColor", hex)}
          errors={errors}
        />
        <FormSelect
          layout="row"
          id="lanyard_anchor"
          label="Anchor"
          values={["left", "center", "right"]}
          value={value.anchor}
          onValueChange={(v) => set("anchor", v as LanyardSettings["anchor"])}
          errors={errors}
        />
      </SectionCard>

      <SectionCard
        icon="lanyardBand"
        title="Lanyard band"
        description="The strap the card hangs from. Use a solid color or upload a strap image."
      >
        <FormSwitch
          id="lanyard_plainBand"
          label="Plain band"
          hint="Color only, ignore the band image."
          value={value.plainBand}
          onCheckedChange={(checked) => set("plainBand", checked)}
        />
        <ColorField
          id="lanyard_bandColor"
          label="Band color"
          value={value.bandColor}
          onChange={(hex) => set("bandColor", hex)}
          errors={errors}
        />
        <CardPhotoSlot
          shape="band"
          label="Band image"
          description={
            value.plainBand
              ? "Saved, but not shown while Plain band is on."
              : "Printed along the band and repeated."
          }
          hint="A horizontal strip, e.g. 1200 × 200 px: its width runs along the band."
          image={bandImage}
          onChange={onBandImageChange}
        />
      </SectionCard>

      <SectionCard
        icon="sizeMotion"
        title="Size & motion"
        description="How big the card is and how it swings when visitors drag it."
      >
        {NUMBER_FIELDS.map(({ key, label, hint }) => {
          const [min, max, step] = LANYARD_RANGES[key];
          return (
            <RangeField
              key={key}
              id={`lanyard_${key}`}
              label={label}
              hint={hint}
              min={min}
              max={max}
              step={step}
              value={value[key]}
              onChange={(n) => set(key, n)}
              errors={errors}
            />
          );
        })}
      </SectionCard>

      <SectionCard
        icon="behavior"
        title="Behavior"
        description="Whether visitors can drag the card, and how it arrives when the page loads."
      >
        <FormSwitch
          id="lanyard_interactive"
          label="Interactive"
          hint="Drag and throw the card. Tapping always switches mode."
          value={value.interactive}
          onCheckedChange={(checked) => set("interactive", checked)}
        />
        <FormSelect
          layout="row"
          id="lanyard_entrance"
          label="Entrance"
          hint="How the card arrives on page load."
          values={["drop", "swing", "off"]}
          labels={{
            drop: "Drop from top",
            swing: "Swing from side",
            off: "Off",
          }}
          value={value.entrance}
          onValueChange={(v) =>
            set("entrance", v as LanyardSettings["entrance"])
          }
          errors={errors}
        />
      </SectionCard>
    </>
  );
};

export default LanyardSettingsSection;
