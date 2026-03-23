export type SketchBlockType = "button" | "input" | "card" | "navbar" | "hero" | "stats";

export type CanvasMode = "preview" | "code";

export type SketchBlock = {
  id: string;
  type: SketchBlockType;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
};
