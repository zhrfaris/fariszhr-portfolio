"use client";

import { Image as ImageType } from "@prisma/client";
import { RotateCcw } from "lucide-react";

import FormInput from "@/components/form/form-input";
import FormSelect from "@/components/form/form-select";
import FormSwitch from "@/components/form/form-switch";
import FormWrapper from "@/components/form/form-wrapper";
import { Button } from "@/components/shadcn/button";
import {
  LANYARD_RANGES,
  LanyardSettings,
  REACT_BITS_DEFAULTS,
} from "@/lib/lanyard-settings";
import CardPhotoSlot from "./card-photo-slot";

type NumberKey = keyof typeof LANYARD_RANGES;

const NUMBER_FIELDS: { key: NumberKey; label: string; hint: string }[] = [
  { key: "size", label: "Size", hint: "0.6 is the Figma card (180px wide on desktop)." },
  {
    key: "bandLength",
    label: "Band length",
    hint: "The card always rests on the first content row, so this sets how far above the page the band hangs from: longer swings slower and wider.",
  },
  { key: "bandWidth", label: "Band width", hint: "Relative to the card; 1.06 matches the Figma band." },
  { key: "cornerRadius", label: "Corner radius", hint: "0 is square, 1 is fully rounded." },
  { key: "gravity", label: "Gravity", hint: "How heavy the card feels." },
  { key: "damping", label: "Damping", hint: "How quickly the swinging settles." },
  { key: "elasticity", label: "Elasticity", hint: "How springy the band is." },
  { key: "breeze", label: "Breeze", hint: "Idle sway. 0 keeps the card still at rest." },
];

/**
 * The hanging ID card's settings, shared by / and /photography. Controlled by
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
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Lanyard settings</h2>
          <p className="text-sm text-muted-foreground">
            One set for both modes. The front and back photos above still switch
            with the mode.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => onChange(REACT_BITS_DEFAULTS)}
        >
          <RotateCcw className="size-4" />
          Reset to defaults
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Card</h3>
        <FormWrapper>
          <FormSelect
            id="lanyard_imageFit"
            label="Image fit"
            values={["cover", "contain"]}
            value={value.imageFit}
            onValueChange={(v) => set("imageFit", v as LanyardSettings["imageFit"])}
            errors={errors}
          />
          <FormSelect
            id="lanyard_orientation"
            label="Orientation"
            values={["portrait", "landscape"]}
            value={value.orientation}
            onValueChange={(v) =>
              set("orientation", v as LanyardSettings["orientation"])
            }
            errors={errors}
          />
        </FormWrapper>
        <FormWrapper>
          <FormSelect
            id="lanyard_finish"
            label="Finish"
            values={["glossy", "matte", "holographic", "metallic"]}
            value={value.finish}
            onValueChange={(v) => set("finish", v as LanyardSettings["finish"])}
            errors={errors}
          />
          <FormSelect
            id="lanyard_metal"
            label="Metal (clip and ring)"
            values={["silver", "gold", "graphite"]}
            value={value.metal}
            onValueChange={(v) => set("metal", v as LanyardSettings["metal"])}
            errors={errors}
          />
        </FormWrapper>
        <FormWrapper>
          <FormInput
            id="lanyard_cardColor"
            label="Card color"
            type="color"
            value={value.cardColor}
            onChange={(e) => set("cardColor", e.target.value)}
            className="h-10 w-full cursor-pointer px-1 py-1"
            errors={errors}
          />
          <FormSelect
            id="lanyard_anchor"
            label="Anchor"
            values={["left", "center", "right"]}
            value={value.anchor}
            onValueChange={(v) => set("anchor", v as LanyardSettings["anchor"])}
            errors={errors}
          />
        </FormWrapper>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Band</h3>
        <FormSwitch
          id="lanyard_plainBand"
          label="Plain band (color only, ignore the band image)"
          value={value.plainBand}
          onCheckedChange={(checked) => set("plainBand", checked)}
        />
        <FormWrapper>
          <FormInput
            id="lanyard_bandColor"
            label="Band color"
            type="color"
            value={value.bandColor}
            onChange={(e) => set("bandColor", e.target.value)}
            className="h-10 w-full cursor-pointer px-1 py-1"
            errors={errors}
          />
        </FormWrapper>
        <CardPhotoSlot
          label="Band image"
          description={
            value.plainBand
              ? "Saved, but not shown while Plain band is on."
              : "Printed along the band and repeated."
          }
          hint="A horizontal strip, e.g. 1200 × 200 px: its width runs along the band."
          previewClassName="aspect-[6/1] w-[240px]"
          image={bandImage}
          onChange={onBandImageChange}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Shape and motion</h3>
        <div className="grid gap-4 @md:grid-cols-2 @md:gap-x-8">
          {NUMBER_FIELDS.map(({ key, label, hint }) => {
            const [min, max, step] = LANYARD_RANGES[key];
            return (
              <div key={key} className="space-y-1">
                <FormInput
                  id={`lanyard_${key}`}
                  label={`${label} (${min}–${max})`}
                  type="number"
                  min={min}
                  max={max}
                  step={step}
                  value={value[key]}
                  onChange={(e) => {
                    const n = e.target.valueAsNumber;
                    if (Number.isFinite(n)) set(key, n);
                  }}
                  // Clamp once editing is done, not per keystroke (typing
                  // "1" on the way to "1.06" must not snap to the minimum).
                  onBlur={() =>
                    set(key, Math.min(max, Math.max(min, value[key])))
                  }
                  errors={errors}
                />
                <p className="text-xs text-muted-foreground">{hint}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Behavior</h3>
        <FormSwitch
          id="lanyard_interactive"
          label="Interactive (drag and throw the card; tapping always switches mode)"
          value={value.interactive}
          onCheckedChange={(checked) => set("interactive", checked)}
        />
        <FormSelect
          id="lanyard_entrance"
          label="Entrance (how the card arrives on page load)"
          values={["drop", "swing", "off"]}
          labels={{ drop: "Drop from top", swing: "Swing from side", off: "Off" }}
          value={value.entrance}
          onValueChange={(v) => set("entrance", v as LanyardSettings["entrance"])}
          errors={errors}
        />
      </div>
    </section>
  );
};

export default LanyardSettingsSection;
