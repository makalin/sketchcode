"use client";

import { useEffect, useMemo, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { blockLibrary, canvasPresets } from "@/lib/sketch-data";
import type { CanvasMode, SketchBlock, SketchBlockType } from "@/types/sketch";

const STORAGE_KEY = "sketchcode.workspace.v1";

type DragState = {
  id: string;
  offsetX: number;
  offsetY: number;
} | null;

function createBlock(type: SketchBlockType, count: number): SketchBlock {
  const base = blockLibrary[type];
  const row = count % 3;
  const col = Math.floor(count / 3);

  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    title: base.name,
    x: 48 + row * 30,
    y: 48 + col * 24,
    width: base.defaultSize.width,
    height: base.defaultSize.height
  };
}

function getBlockStyle(block: SketchBlock, selected: boolean) {
  const styles: Record<SketchBlockType, string> = {
    button:
      "rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground",
    input:
      "rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground",
    card:
      "rounded-3xl border border-border bg-panel p-4 shadow-sm",
    navbar:
      "rounded-3xl border border-border bg-panel px-4 py-3 shadow-sm",
    hero:
      "rounded-[28px] bg-gradient-to-br from-accent/85 via-cyan-400/70 to-emerald-300/80 p-5 text-slate-950",
    stats:
      "rounded-3xl border border-dashed border-border bg-panel/90 p-4 shadow-sm"
  };

  return `${styles[block.type]} ${selected ? "ring-2 ring-accent" : ""}`;
}

function renderMiniBlock(block: SketchBlock) {
  switch (block.type) {
    case "button":
      return <span>Primary Action</span>;
    case "input":
      return <span className="block w-full">Search product, template, page...</span>;
    case "card":
      return (
        <div className="space-y-2">
          <div className="h-20 rounded-2xl bg-muted" />
          <div className="h-3 w-3/4 rounded-full bg-muted" />
          <div className="h-3 w-1/2 rounded-full bg-muted" />
        </div>
      );
    case "navbar":
      return (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-bold text-foreground">SketchCode</span>
          <div className="flex gap-3 text-muted-foreground">
            <span>Boards</span>
            <span>Exports</span>
            <span>Team</span>
          </div>
        </div>
      );
    case "hero":
      return (
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.25em] text-slate-800/70">Prototype Faster</div>
          <div className="text-lg font-bold">From sketch to clean UI in one pass.</div>
          <div className="text-sm text-slate-800/80">Turn rough ideas into layout-ready React blocks.</div>
        </div>
      );
    case "stats":
      return (
        <div className="grid grid-cols-3 gap-2 text-center">
          {["12", "04", "98%"].map((value) => (
            <div key={value} className="rounded-2xl bg-muted px-2 py-3">
              <div className="text-sm font-bold text-foreground">{value}</div>
              <div className="text-[11px] text-muted-foreground">metric</div>
            </div>
          ))}
        </div>
      );
  }
}

function generateCode(blocks: SketchBlock[]) {
  const content = blocks
    .map((block) => {
      const position = `style={{ left: ${block.x}, top: ${block.y}, width: ${block.width}, height: ${block.height} }}`;

      const template: Record<SketchBlockType, string> = {
        button: `<button className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">Primary Action</button>`,
        input: `<input className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm" placeholder="Search product, template, page..." />`,
        card: `<div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
  <div className="mb-3 h-20 rounded-2xl bg-slate-100" />
  <div className="mb-2 h-3 w-3/4 rounded-full bg-slate-100" />
  <div className="h-3 w-1/2 rounded-full bg-slate-100" />
</div>`,
        navbar: `<nav className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
  <span className="font-bold text-slate-900">SketchCode</span>
  <div className="flex gap-3 text-sm text-slate-500">
    <span>Boards</span>
    <span>Exports</span>
    <span>Team</span>
  </div>
</nav>`,
        hero: `<section className="rounded-[28px] bg-gradient-to-br from-sky-500 via-cyan-400 to-emerald-300 p-5 text-slate-950 shadow-xl">
  <p className="text-xs uppercase tracking-[0.25em] text-slate-800/70">Prototype Faster</p>
  <h2 className="mt-2 text-2xl font-bold">From sketch to clean UI in one pass.</h2>
  <p className="mt-2 text-sm text-slate-800/80">Turn rough ideas into layout-ready React blocks.</p>
</section>`,
        stats: `<section className="grid grid-cols-3 gap-2 rounded-3xl border border-dashed border-slate-300 bg-white p-4 shadow-sm">
  {["12", "04", "98%"].map((value) => (
    <div key={value} className="rounded-2xl bg-slate-100 px-2 py-3 text-center">
      <div className="text-sm font-bold text-slate-900">{value}</div>
      <div className="text-[11px] text-slate-500">metric</div>
    </div>
  ))}
</section>`
      };

      return `        <div className="absolute" ${position}>
${template[block.type]
  .split("\n")
  .map((line) => `          ${line}`)
  .join("\n")}
        </div>`;
    })
    .join("\n\n");

  return `export function GeneratedLayout() {
  return (
    <section className="relative min-h-[720px] overflow-hidden rounded-[32px] border border-slate-200 bg-slate-50 p-6">
${content || "      <div className=\"text-sm text-slate-500\">Start sketching to generate UI.</div>"}
    </section>
  );
}`;
}

function PreviewCanvas({ blocks }: { blocks: SketchBlock[] }) {
  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-[28px] border border-border bg-background/60 p-4">
      {blocks.map((block) => (
        <div
          key={block.id}
          className="absolute transition"
          style={{ left: block.x, top: block.y, width: block.width, height: block.height }}
        >
          <div className={getBlockStyle(block, false)}>{renderMiniBlock(block)}</div>
        </div>
      ))}
      {!blocks.length && (
        <div className="flex min-h-[388px] items-center justify-center rounded-[22px] border border-dashed border-border text-sm text-muted-foreground">
          Select a block from the library to start generating React UI.
        </div>
      )}
    </div>
  );
}

export function SketchBoardApp() {
  const [blocks, setBlocks] = useState<SketchBlock[]>(canvasPresets);
  const [selectedId, setSelectedId] = useState<string | null>(canvasPresets[0]?.id ?? null);
  const [dragState, setDragState] = useState<DragState>(null);
  const [mode, setMode] = useState<CanvasMode>("preview");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as SketchBlock[];
      if (Array.isArray(parsed) && parsed.length) {
        setBlocks(parsed);
        setSelectedId(parsed[0]?.id ?? null);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
  }, [blocks]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const selectedBlock = blocks.find((block) => block.id === selectedId) ?? null;
  const generatedCode = useMemo(() => generateCode(blocks), [blocks]);

  const addBlock = (type: SketchBlockType) => {
    const newBlock = createBlock(type, blocks.length);
    setBlocks((current) => [...current, newBlock]);
    setSelectedId(newBlock.id);
  };

  const updateBlock = (id: string, partial: Partial<SketchBlock>) => {
    setBlocks((current) =>
      current.map((block) => (block.id === id ? { ...block, ...partial } : block))
    );
  };

  const removeSelected = () => {
    if (!selectedId) {
      return;
    }

    const remaining = blocks.filter((block) => block.id !== selectedId);
    setBlocks(remaining);
    setSelectedId(remaining[0]?.id ?? null);
  };

  const resetBoard = () => {
    setBlocks(canvasPresets);
    setSelectedId(canvasPresets[0]?.id ?? null);
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
  };

  return (
    <main className="min-h-screen px-4 py-6 text-foreground md:px-6">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
        <header className="rounded-[32px] border border-border bg-panel/90 p-6 shadow-glow backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-secondary-foreground">
                Sketch-to-React Studio
              </span>
              <div className="space-y-3">
                <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
                  Sketch rough layouts. Ship cleaner React.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                  This MVP turns drag-and-drop wireframe blocks into a live component preview and
                  exportable React/Tailwind markup. It is designed as a working foundation for the
                  broader collaborative whiteboard described in the repository.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <ThemeToggle />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={resetBoard}
                  className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-accent hover:text-foreground"
                >
                  Reset board
                </button>
                <button
                  type="button"
                  onClick={removeSelected}
                  disabled={!selectedBlock}
                  className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition enabled:hover:border-warning enabled:hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Delete selected
                </button>
                <button
                  type="button"
                  onClick={copyCode}
                  className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
                >
                  {copied ? "Copied" : "Copy JSX"}
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_420px]">
          <aside className="rounded-[28px] border border-border bg-panel/90 p-5 shadow-sm backdrop-blur">
            <div className="mb-4">
              <h2 className="text-lg font-bold">Component Library</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Add blocks to the sketch board, then drag them into position.
              </p>
            </div>
            <div className="space-y-3">
              {Object.entries(blockLibrary).map(([type, block]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => addBlock(type as SketchBlockType)}
                  className="w-full rounded-3xl border border-border bg-background/70 p-4 text-left transition hover:-translate-y-0.5 hover:border-accent hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-base font-semibold">{block.name}</span>
                    <span className="rounded-full bg-muted px-2 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Add
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{block.description}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-dashed border-border bg-background/70 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Selected Block
              </h3>
              {selectedBlock ? (
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="text-lg font-semibold">{selectedBlock.title}</div>
                    <div className="text-sm text-muted-foreground">{selectedBlock.type}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        ["x", "X"],
                        ["y", "Y"],
                        ["width", "W"],
                        ["height", "H"]
                      ] as const
                    ).map(([key, label]) => (
                      <label key={key} className="space-y-2 text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <input
                          type="number"
                          value={selectedBlock[key]}
                          min={0}
                          onChange={(event) =>
                            updateBlock(selectedBlock.id, {
                              [key]: Number(event.target.value)
                            })
                          }
                          className="w-full rounded-2xl border border-input bg-background px-3 py-2 outline-none ring-0 transition focus:border-accent"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  Click a block on the canvas to adjust its position and size.
                </p>
              )}
            </div>
          </aside>

          <section className="rounded-[28px] border border-border bg-panel/90 p-4 shadow-sm backdrop-blur md:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Sketch Canvas</h2>
                <p className="text-sm text-muted-foreground">
                  Drag blocks freely. The preview and code update in real time.
                </p>
              </div>
              <div className="rounded-full border border-border bg-background p-1 text-sm">
                {(["preview", "code"] as CanvasMode[]).map((viewMode) => (
                  <button
                    key={viewMode}
                    type="button"
                    onClick={() => setMode(viewMode)}
                    className={`rounded-full px-3 py-1.5 capitalize transition ${
                      mode === viewMode
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {viewMode}
                  </button>
                ))}
              </div>
            </div>

            {mode === "preview" ? (
              <div
                className="canvas-grid relative min-h-[720px] overflow-hidden rounded-[28px] border border-border bg-background/60"
                onMouseUp={() => setDragState(null)}
                onMouseLeave={() => setDragState(null)}
              >
                {blocks.map((block) => {
                  const selected = block.id === selectedId;

                  return (
                    <button
                      key={block.id}
                      type="button"
                      onMouseDown={(event) => {
                        const bounds = event.currentTarget.getBoundingClientRect();
                        setSelectedId(block.id);
                        setDragState({
                          id: block.id,
                          offsetX: event.clientX - bounds.left,
                          offsetY: event.clientY - bounds.top
                        });
                      }}
                      onMouseMove={(event) => {
                        if (!dragState || dragState.id !== block.id) {
                          return;
                        }

                        const parent = event.currentTarget.parentElement;
                        if (!parent) {
                          return;
                        }

                        const parentBounds = parent.getBoundingClientRect();
                        updateBlock(block.id, {
                          x: Math.max(0, event.clientX - parentBounds.left - dragState.offsetX),
                          y: Math.max(0, event.clientY - parentBounds.top - dragState.offsetY)
                        });
                      }}
                      className="absolute cursor-grab text-left active:cursor-grabbing"
                      style={{
                        left: block.x,
                        top: block.y,
                        width: block.width,
                        height: block.height
                      }}
                    >
                      <div className={getBlockStyle(block, selected)}>{renderMiniBlock(block)}</div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <pre className="code-scrollbar min-h-[720px] overflow-auto rounded-[28px] border border-border bg-[#0c1222] p-5 text-sm leading-7 text-slate-100">
                <code>{generatedCode}</code>
              </pre>
            )}
          </section>

          <aside className="rounded-[28px] border border-border bg-panel/90 p-5 shadow-sm backdrop-blur">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Live Preview</h2>
                <p className="text-sm text-muted-foreground">
                  A quick rendering pass of the generated layout.
                </p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-secondary-foreground">
                MVP
              </span>
            </div>

            <PreviewCanvas blocks={blocks} />

            <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-3xl border border-border bg-background/70 p-4">
                <div className="text-sm font-semibold text-foreground">Blocks on canvas</div>
                <div className="mt-2 text-3xl font-black">{blocks.length.toString().padStart(2, "0")}</div>
              </div>
              <div className="rounded-3xl border border-border bg-background/70 p-4">
                <div className="text-sm font-semibold text-foreground">Export format</div>
                <div className="mt-2 text-3xl font-black">TSX</div>
              </div>
              <div className="rounded-3xl border border-border bg-background/70 p-4">
                <div className="text-sm font-semibold text-foreground">Theme aware</div>
                <div className="mt-2 text-3xl font-black">Yes</div>
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-dashed border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
              Next iteration targets:
              <div>Real drawing tools, multi-user sync, AI layout recognition, and export presets.</div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
