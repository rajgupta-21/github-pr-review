"use client";

import { Maximize, Minus, Plus, RotateCcw } from "lucide-react";
import { Panel, useReactFlow, useViewport } from "reactflow";

const buttonClass =
  "inline-flex size-8 items-center justify-center rounded-sm text-fg-muted hover:bg-surface-hover hover:text-fg disabled:opacity-40";

/* Bottom-left zoom / fit / clear controls, styled per the design. */
export default function CanvasControls({
  onClear,
  canClear,
}: {
  onClear: () => void;
  canClear: boolean;
}) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();

  return (
    <Panel position="bottom-left" className="!m-5">
      <div className="flex gap-1.5 rounded-[11px] border border-line-strong bg-surface p-[5px] shadow-[0_2px_8px_rgba(20,18,42,0.06)]">
        <button type="button" aria-label="Zoom out" className={buttonClass} onClick={() => zoomOut()}>
          <Minus className="size-4" aria-hidden="true" />
        </button>
        <span className="inline-flex min-w-12 items-center justify-center px-1 font-mono text-[12.5px] text-fg-muted">
          {Math.round(zoom * 100)}%
        </span>
        <button type="button" aria-label="Zoom in" className={buttonClass} onClick={() => zoomIn()}>
          <Plus className="size-4" aria-hidden="true" />
        </button>
        <span className="mx-0.5 my-1 w-px bg-line-soft" aria-hidden="true" />
        <button
          type="button"
          aria-label="Fit to view"
          className={buttonClass}
          onClick={() => fitView({ padding: 0.2 })}
        >
          <Maximize className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Clear canvas"
          title="Clear canvas"
          className={buttonClass}
          onClick={onClear}
          disabled={!canClear}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
        </button>
      </div>
    </Panel>
  );
}
