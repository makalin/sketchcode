import type { SketchBlock, SketchBlockType } from "@/types/sketch";

type BlockDefinition = {
  name: string;
  description: string;
  defaultSize: {
    width: number;
    height: number;
  };
};

export const blockLibrary: Record<SketchBlockType, BlockDefinition> = {
  button: {
    name: "Button",
    description: "Primary CTA button for key actions and flows.",
    defaultSize: { width: 180, height: 60 }
  },
  input: {
    name: "Input",
    description: "Form field or search input with neutral visual weight.",
    defaultSize: { width: 280, height: 64 }
  },
  card: {
    name: "Card",
    description: "Reusable content card for products, templates, or articles.",
    defaultSize: { width: 260, height: 180 }
  },
  navbar: {
    name: "Navbar",
    description: "Top-level navigation shell for app and marketing screens.",
    defaultSize: { width: 360, height: 74 }
  },
  hero: {
    name: "Hero",
    description: "Large intro section to anchor a page and explain value.",
    defaultSize: { width: 420, height: 190 }
  },
  stats: {
    name: "Stats",
    description: "Compact metric band for dashboards and conversion proof.",
    defaultSize: { width: 300, height: 130 }
  }
};

export const canvasPresets: SketchBlock[] = [
  {
    id: "preset-navbar",
    type: "navbar",
    title: "Navbar",
    x: 40,
    y: 32,
    width: 410,
    height: 76
  },
  {
    id: "preset-hero",
    type: "hero",
    title: "Hero",
    x: 76,
    y: 138,
    width: 440,
    height: 196
  },
  {
    id: "preset-button",
    type: "button",
    title: "Button",
    x: 544,
    y: 168,
    width: 190,
    height: 58
  },
  {
    id: "preset-card",
    type: "card",
    title: "Card",
    x: 544,
    y: 258,
    width: 250,
    height: 180
  },
  {
    id: "preset-input",
    type: "input",
    title: "Input",
    x: 76,
    y: 382,
    width: 300,
    height: 66
  },
  {
    id: "preset-stats",
    type: "stats",
    title: "Stats",
    x: 404,
    y: 474,
    width: 330,
    height: 132
  }
];
