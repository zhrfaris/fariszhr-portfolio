import React from "react";
import {
  Briefcase,
  Building2,
  Camera,
  CircleUser,
  CreditCard,
  Files,
  Hand,
  IdCard,
  KeyRound,
  LayoutTemplate,
  Link,
  Move,
  Tags,
  type LucideIcon,
} from "lucide-react";

type IconProps = { className?: string };

/**
 * A custom 16×16 line icon: strokes in `currentColor` (so it takes the text
 * color, #007AFF in section headers), sized by `className`, hidden from
 * screen readers.
 */
const lineIcon = (name: string, paths: React.ReactNode) => {
  const Icon = ({ className }: IconProps) => (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.33333}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      className={className}
    >
      {paths}
    </svg>
  );
  Icon.displayName = name;
  return Icon;
};

/* ---------- custom icons (from the designer's SVGs) ---------- */

export const CoverThumbnailsIcon = lineIcon(
  "CoverThumbnailsIcon",
  <>
    <path d="M12.6667 2H3.33333C2.59695 2 2 2.59695 2 3.33333V12.6667C2 13.403 2.59695 14 3.33333 14H12.6667C13.403 14 14 13.403 14 12.6667V3.33333C14 2.59695 13.403 2 12.6667 2Z" />
    <path d="M14 9.99984L10.6667 6.6665L3.33337 13.9998" />
    <path d="M5.66663 6.6665C6.21891 6.6665 6.66663 6.21879 6.66663 5.6665C6.66663 5.11422 6.21891 4.6665 5.66663 4.6665C5.11434 4.6665 4.66663 5.11422 4.66663 5.6665C4.66663 6.21879 5.11434 6.6665 5.66663 6.6665Z" />
  </>
);

export const OverviewIcon = lineIcon(
  "OverviewIcon",
  <>
    <path d="M9.33329 1.3335H3.99996C3.64634 1.3335 3.3072 1.47397 3.05715 1.72402C2.8071 1.97407 2.66663 2.31321 2.66663 2.66683V13.3335C2.66663 13.6871 2.8071 14.0263 3.05715 14.2763C3.3072 14.5264 3.64634 14.6668 3.99996 14.6668H12C12.3536 14.6668 12.6927 14.5264 12.9428 14.2763C13.1928 14.0263 13.3333 13.6871 13.3333 13.3335V5.3335L9.33329 1.3335Z" />
    <path d="M10.6667 11.3335H5.33337" />
    <path d="M10.6667 8.6665H5.33337" />
    <path d="M6.66671 6H6.00004H5.33337" />
    <path d="M9.33337 1.3335V5.3335H13.3334" />
  </>
);

export const RestrictPostIcon = lineIcon(
  "RestrictPostIcon",
  <>
    <path d="M12.6667 7.3335H3.33333C2.59695 7.3335 2 7.93045 2 8.66683V13.3335C2 14.0699 2.59695 14.6668 3.33333 14.6668H12.6667C13.403 14.6668 14 14.0699 14 13.3335V8.66683C14 7.93045 13.403 7.3335 12.6667 7.3335Z" />
    <path d="M4.66663 7.3335V4.66683C4.66663 3.78277 5.01782 2.93493 5.64294 2.30981C6.26806 1.68469 7.1159 1.3335 7.99996 1.3335C8.88401 1.3335 9.73186 1.68469 10.357 2.30981C10.9821 2.93493 11.3333 3.78277 11.3333 4.66683V7.3335" />
  </>
);

export const ContentIcon = lineIcon(
  "ContentIcon",
  <>
    <path d="M11.3333 12H2" />
    <path d="M14 9.3335H2" />
    <path d="M11.3333 6.6665H2" />
    <path d="M14 4H2" />
  </>
);

export const IdCardPhotosIcon = lineIcon(
  "IdCardPhotosIcon",
  <path d="M2.66672 14.5451C3.06844 14.6668 3.61103 14.6668 4.53337 14.6668H11.4667C12.389 14.6668 12.9316 14.6668 13.3334 14.5451M2.66672 14.5451C2.58059 14.519 2.50093 14.4873 2.42539 14.4488C2.04907 14.2571 1.74311 13.9511 1.55136 13.5748C1.33337 13.147 1.33337 12.5869 1.33337 11.4668V4.5335C1.33337 3.41339 1.33337 2.85334 1.55136 2.42552C1.74311 2.04919 2.04907 1.74323 2.42539 1.55148C2.85322 1.3335 3.41327 1.3335 4.53337 1.3335H11.4667C12.5868 1.3335 13.1469 1.3335 13.5747 1.55148C13.951 1.74323 14.257 2.04919 14.4487 2.42552C14.6667 2.85334 14.6667 3.41339 14.6667 4.5335V11.4668C14.6667 12.5869 14.6667 13.147 14.4487 13.5748C14.257 13.9511 13.951 14.2571 13.5747 14.4488C13.4992 14.4873 13.4195 14.519 13.3334 14.5451M2.66672 14.5451C2.66694 14.0056 2.67018 13.7201 2.71795 13.4799C2.92836 12.4221 3.75529 11.5952 4.81313 11.3847C5.07073 11.3335 5.3805 11.3335 6.00004 11.3335H10C10.6196 11.3335 10.9294 11.3335 11.1869 11.3847C12.2448 11.5952 13.0717 12.4221 13.2821 13.4799C13.3299 13.7201 13.3331 14.0056 13.3334 14.5451M10.6667 6.3335C10.6667 7.80626 9.4728 9.00016 8.00004 9.00016C6.52728 9.00016 5.33337 7.80626 5.33337 6.3335C5.33337 4.86074 6.52728 3.66683 8.00004 3.66683C9.4728 3.66683 10.6667 4.86074 10.6667 6.3335Z" />
);

export const LanyardBandIcon = lineIcon(
  "LanyardBandIcon",
  <path d="M5.91746 8.73037L3.13411 5.25118C2.96084 5.0346 2.87421 4.92631 2.8126 4.80572C2.75795 4.69874 2.718 4.58486 2.69385 4.46718C2.66663 4.33453 2.66663 4.19585 2.66663 3.9185V3.46683C2.66663 2.72009 2.66663 2.34672 2.81195 2.06151C2.93978 1.81063 3.14376 1.60665 3.39464 1.47882C3.67985 1.3335 4.05322 1.3335 4.79996 1.3335H11.2C11.9467 1.3335 12.3201 1.3335 12.6053 1.47882C12.8562 1.60665 13.0601 1.81063 13.188 2.06151C13.3333 2.34672 13.3333 2.72009 13.3333 3.46683V3.9185C13.3333 4.19585 13.3333 4.33453 13.3061 4.46718C13.2819 4.58486 13.242 4.69874 13.1873 4.80572C13.1257 4.92631 13.0391 5.0346 12.8658 5.25118L10.0825 8.73037M3.33333 2.00016L8 8.00016L12.6666 2.00016M10.357 8.97647C11.6587 10.2782 11.6587 12.3888 10.357 13.6905C9.05524 14.9923 6.94469 14.9923 5.64293 13.6905C4.34119 12.3888 4.34119 10.2782 5.64293 8.97647C6.94468 7.67473 9.05523 7.67473 10.357 8.97647Z" />
);

/* Sidebar items */

export const ProfileIcon = lineIcon(
  "ProfileIcon",
  <>
    <path d="M13.3333 14V12.6667C13.3333 11.9594 13.0523 11.2811 12.5522 10.781C12.0521 10.281 11.3739 10 10.6666 10H5.33329C4.62605 10 3.94777 10.281 3.44767 10.781C2.94758 11.2811 2.66663 11.9594 2.66663 12.6667V14" />
    <path d="M8.00004 7.33333C9.4728 7.33333 10.6667 6.13943 10.6667 4.66667C10.6667 3.19391 9.4728 2 8.00004 2C6.52728 2 5.33337 3.19391 5.33337 4.66667C5.33337 6.13943 6.52728 7.33333 8.00004 7.33333Z" />
  </>
);

export const PasswordIcon = lineIcon(
  "PasswordIcon",
  <path d="M10.3334 5.00016L12.6667 2.66683M14.0001 1.3335L12.6667 2.66683L14.0001 1.3335ZM7.59339 7.74016C7.93762 8.07981 8.21126 8.48419 8.39856 8.93002C8.58587 9.37586 8.68313 9.85434 8.68475 10.3379C8.68637 10.8215 8.59231 11.3006 8.408 11.7477C8.22369 12.1948 7.95277 12.601 7.61082 12.9429C7.26888 13.2849 6.86268 13.5558 6.4156 13.7401C5.96852 13.9244 5.48939 14.0185 5.00582 14.0168C4.52224 14.0152 4.04376 13.918 3.59792 13.7307C3.15209 13.5434 2.74771 13.2697 2.40806 12.9255C1.74015 12.234 1.37057 11.3077 1.37892 10.3464C1.38728 9.38497 1.7729 8.46532 2.45273 7.78549C3.13256 7.10566 4.0522 6.72005 5.01359 6.71169C5.97498 6.70334 6.90119 7.07292 7.59273 7.74083L7.59339 7.74016ZM7.59339 7.74016L10.3334 5.00016L7.59339 7.74016ZM10.3334 5.00016L12.3334 7.00016L14.6667 4.66683L12.6667 2.66683L10.3334 5.00016Z" />
);

export const LogOutIcon = lineIcon(
  "LogOutIcon",
  <>
    <path d="M10.6666 11.3332L14 7.99984L10.6666 4.6665" />
    <path d="M14 8H6" />
    <path d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6" />
  </>
);

/**
 * Every dashboard section-card icon, by section. Custom SVG components where
 * the designer supplied one, Lucide placeholders for the rest: to swap one,
 * change it here (any component that takes `className` and draws in
 * `currentColor` works). Nothing else needs to change.
 */
export const SECTION_ICONS = {
  // Case study form
  coverThumbnails: CoverThumbnailsIcon,
  overview: OverviewIcon,
  restrictPost: RestrictPostIcon,
  content: ContentIcon,
  // All case studies
  caseStudies: Files, // placeholder
  // Profile
  photo: CircleUser, // placeholder
  personalInfo: IdCard, // placeholder
  links: Link, // placeholder
  // Password
  changePassword: KeyRound, // placeholder
  // Landing Page
  intro: LayoutTemplate, // placeholder
  idCardPhotos: IdCardPhotosIcon,
  card: CreditCard, // placeholder
  lanyardBand: LanyardBandIcon,
  sizeMotion: Move, // placeholder
  behavior: Hand, // placeholder
  // Photo Works
  photos: Camera, // placeholder
  // Workplaces
  workplaces: Briefcase, // placeholder
  workplace: Building2, // placeholder
  // Categories
  categories: Tags, // placeholder
} satisfies Record<string, LucideIcon | React.ComponentType<IconProps>>;

export type SectionIconKey = keyof typeof SECTION_ICONS;
