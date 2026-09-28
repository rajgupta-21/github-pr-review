"use client";

import { Webhook, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox, Input, Label, Select, Textarea } from "@/components/ui/input";
import { timeAgo } from "@/lib/format";
import type { ConnectedRepo } from "@/lib/types";
import { cn } from "@/lib/utils";

import {
  CATEGORY_STYLE,
  type FieldConfig,
  getConfigValue,
  getDefinition,
  normalizeNodeType,
  type WorkflowNode,
  type WorkflowNodeData,
} from "./nodeCatalog";

const SEVERITY_OPTIONS = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const STATUS_TONE: Record<string, "pass" | "critical" | "violet" | "neutral" | "medium"> = {
  completed: "pass",
  failed: "critical",
  running: "violet",
  draft: "medium",
  pending: "neutral",
  ready: "neutral",
};

const inputClass = "rounded-[9px] px-3 py-[9px] text-[13.5px]";

interface InspectorProps {
  selectedNode: WorkflowNode | null;
  onDeleteNode: () => void;
  onClose: () => void;
  onDuplicateNode: () => void;
  onUpdateNode: (nodeId: string, updates: Partial<WorkflowNodeData>) => void;
  workflow: {
    name: string;
    onRename: (name: string) => void;
    repo: ConnectedRepo;
    webhookActive: boolean;
    enablingWebhook: boolean;
    onEnableWebhook: () => void;
    savedAt?: string | null;
    nodeCount: number;
    edgeCount: number;
  };
}

function Field({
  field,
  value,
  onChange,
}: {
  field: FieldConfig;
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
}) {
  const id = `field-${field.name}`;

  if (field.type === "checkbox") {
    return (
      <div className="flex items-center gap-[9px]">
        <Checkbox id={id} checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
        <label htmlFor={id} className="text-[13.5px] text-fg-2">
          {field.label}
        </label>
      </div>
    );
  }

  if (field.type === "severity") {
    return (
      <div>
        <span className="mb-[7px] block text-[12.5px] font-semibold text-fg-3">{field.label}</span>
        <div role="group" aria-label={field.label} className="flex gap-[5px]">
          {SEVERITY_OPTIONS.map((option) => {
            const active = String(value) === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => onChange(option.value)}
                className={cn(
                  "flex-1 rounded-sm border py-2 text-[12.5px]",
                  active
                    ? "border-fg bg-fg font-medium text-white"
                    : "border-line-strong bg-surface text-fg-muted hover:text-fg",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {field.helperText ? <Helper>{field.helperText}</Helper> : null}
      </div>
    );
  }

  return (
    <div>
      <Label htmlFor={id} className="mb-[7px] text-fg-3">
        {field.label}
      </Label>
      {field.type === "select" ? (
        <Select id={id} value={String(value)} onChange={(e) => onChange(e.target.value)} className={inputClass}>
          {(field.options || []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      ) : field.type === "textarea" ? (
        <Textarea
          id={id}
          rows={4}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={cn(inputClass, "resize-none", field.mono && "font-mono text-[12.5px] leading-normal")}
        />
      ) : (
        <Input
          id={id}
          type={field.type}
          value={String(value)}
          onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
          placeholder={field.placeholder}
          className={cn(inputClass, field.mono && "font-mono text-[13px]")}
        />
      )}
      {field.helperText ? <Helper>{field.helperText}</Helper> : null}
    </div>
  );
}

function Helper({ children }: { children: React.ReactNode }) {
  return <p className="mt-[7px] text-[12.5px] leading-normal text-fg-subtle">{children}</p>;
}

function WorkflowSettings({ workflow }: { workflow: InspectorProps["workflow"] }) {
  return (
    <>
      <div className="border-b border-line-soft px-[18px] py-4">
        <div className="eyebrow">Workflow</div>
        <div className="mt-1 text-[14.5px] font-semibold text-fg">{workflow.name}</div>
        <div className="mt-0.5 font-mono text-[11.5px] text-fg-faint">{workflow.repo.fullName}</div>
      </div>
      <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto px-[18px] py-4">
        <div>
          <Label htmlFor="workflow-name" className="mb-[7px] text-fg-3">
            Name
          </Label>
          <Input
            id="workflow-name"
            value={workflow.name}
            onChange={(e) => workflow.onRename(e.target.value)}
            className={inputClass}
          />
          <Helper>Saved with the workflow definition.</Helper>
        </div>

        <dl className="grid grid-cols-2 gap-2">
          {[
            ["Nodes", workflow.nodeCount],
            ["Connections", workflow.edgeCount],
          ].map(([label, value]) => (
            <div key={label} className="rounded-sm bg-surface-sunken px-3 py-2.5">
              <dt className="text-[11.5px] text-fg-subtle">{label}</dt>
              <dd className="mt-0.5 font-mono text-[15px] text-fg">{value}</dd>
            </div>
          ))}
          <div className="col-span-2 rounded-sm bg-surface-sunken px-3 py-2.5">
            <dt className="text-[11.5px] text-fg-subtle">Last saved</dt>
            <dd className="mt-0.5 text-[13.5px] text-fg">
              {workflow.savedAt ? timeAgo(workflow.savedAt) : "Not saved yet"}
            </dd>
          </div>
        </dl>

        <div className="rounded-[13px] border border-line p-3.5">
          <div className="flex items-center gap-2">
            <Webhook className="size-4 text-fg-subtle" aria-hidden="true" />
            <span className="text-[13.5px] font-semibold text-fg">GitHub webhook</span>
            <Badge tone={workflow.webhookActive ? "pass" : "neutral"} dot size="sm" className="ml-auto">
              {workflow.webhookActive ? "Active" : "Off"}
            </Badge>
          </div>
          <p className="mt-2 text-[12.5px] leading-normal text-fg-muted">
            {workflow.webhookActive
              ? "PR opened and PR updated triggers run automatically."
              : "Saving a workflow with a PR trigger installs it. You can also enable it now."}
          </p>
          {!workflow.webhookActive ? (
            <Button
              size="sm"
              variant="secondary"
              className="mt-3 w-full"
              loading={workflow.enablingWebhook}
              onClick={workflow.onEnableWebhook}
            >
              Enable webhook
            </Button>
          ) : null}
        </div>

        <p className="text-[12.5px] leading-normal text-fg-subtle">
          Select a node on the canvas to configure it.
        </p>
      </div>
    </>
  );
}

export default function Inspector({
  selectedNode,
  onDeleteNode,
  onClose,
  onDuplicateNode,
  onUpdateNode,
  workflow,
}: InspectorProps) {
  if (!selectedNode) {
    return (
      <aside className="hidden w-[316px] shrink-0 flex-col overflow-hidden border-l border-line bg-surface xl:flex">
        <WorkflowSettings workflow={workflow} />
      </aside>
    );
  }

  const data = selectedNode.data;
  const nodeType = normalizeNodeType(data.nodeType);
  const definition = getDefinition(nodeType);
  const style = CATEGORY_STYLE[definition?.category ?? "Action"];
  const Icon = definition?.icon;
  const workflowFn = data.workflow?.function || "workflow.unknown";
  const workflowStatus = data.workflow?.status || "ready";

  const updateConfig = (name: string, value: string | number | boolean) => {
    onUpdateNode(selectedNode.id, { config: { ...(data.config || {}), [name]: value } });
  };

  return (
    <aside className="flex w-[316px] shrink-0 flex-col overflow-hidden border-l border-line bg-surface">
      <div className="flex items-start gap-2.5 border-b border-line-soft px-[18px] py-4">
        <span
          className={cn("inline-flex size-[30px] shrink-0 items-center justify-center rounded-[9px]", style.tile)}
        >
          {Icon ? <Icon className={cn("size-4", style.icon)} strokeWidth={1.9} aria-hidden="true" /> : null}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14.5px] font-semibold text-fg">
            {data.label || definition?.label || "Node"}
          </div>
          <div className="mt-0.5 truncate font-mono text-[11.5px] text-fg-faint">{selectedNode.id}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close inspector"
          className="rounded-sm p-1 text-fg-faint hover:bg-surface-hover hover:text-fg"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto px-[18px] py-4">
        {definition?.description ? (
          <p className="text-[12.5px] leading-normal text-fg-muted">
            {definition.comingSoon ? (
              <Badge tone="medium" size="sm" className="mr-1.5 align-middle">
                Coming soon
              </Badge>
            ) : null}
            {definition.description}
          </p>
        ) : null}

        <div>
          <Label htmlFor="node-label" className="mb-[7px] text-fg-3">
            Label
          </Label>
          <Input
            id="node-label"
            value={data.label || ""}
            onChange={(e) => onUpdateNode(selectedNode.id, { label: e.target.value })}
            className={inputClass}
          />
        </div>

        {definition
          ? definition.fields.map((field) => (
              <Field
                key={field.name}
                field={field}
                value={getConfigValue(data.config, field, nodeType)}
                onChange={(value) => updateConfig(field.name, value)}
              />
            ))
          : null}

        {!definition ? (
          <div className="rounded-sm border border-dashed border-line-strong p-3 text-xs text-fg-muted">
            Unknown node type: <span className="font-mono">{nodeType || "unset"}</span>
          </div>
        ) : null}

        <div>
          <span className="mb-[7px] block text-[12.5px] font-semibold text-fg-3">Execution</span>
          <div className="flex items-center justify-between gap-2 rounded-sm bg-surface-sunken px-3 py-2.5">
            <span className="truncate font-mono text-xs text-fg-2">{workflowFn}</span>
            <Badge tone={STATUS_TONE[workflowStatus] ?? "neutral"} size="sm" caps>
              {workflowStatus}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex gap-[9px] border-t border-line-soft px-[18px] py-4">
        <Button variant="tertiary" size="sm" className="flex-1" onClick={onDuplicateNode}>
          Duplicate
        </Button>
        <Button variant="destructive" size="sm" className="flex-1" onClick={onDeleteNode}>
          Delete node
        </Button>
      </div>
    </aside>
  );
}
