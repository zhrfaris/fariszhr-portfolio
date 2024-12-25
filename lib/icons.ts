import { z } from "zod";

export const sectionIcons = z.enum([
  "money_bag",
  "open_book",
  "card_file_box",
  "clipboard",
  "briefcase",
  "memo",
  "paintbrush",
  "mailbox",
  "light_bulb",
  "loudspeaker",
  "graduation_cap",
  "office_building",
  "mechanic",
  "calendar",
  "bullseye",
  "package",
  "magnifying_glass",
  "locked",
  "palette",
  "old_key",
  "trophy",
  "pencil",
]);
export type SectionIconsValidation = z.infer<typeof sectionIcons>;
export const sectionIconList: SectionIconsValidation[] =
  sectionIcons._def.values;

export const iconTypeChecker: (iconName: string) => SectionIconsValidation = (
  iconName: string
) => {
  if (!sectionIconList.includes(iconName as SectionIconsValidation)) {
    return "card_file_box";
  }
  return iconName as SectionIconsValidation;
};
