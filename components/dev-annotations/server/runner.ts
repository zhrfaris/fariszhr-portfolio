// Spawns Claude Code non-interactively to act on open annotations, streams
// progress to the panel via the bus, and applies the structured result.
// Server-only (dev API routes). Never commits, pushes, builds, or runs prisma.
import { spawn } from "child_process";
import { promises as fs } from "fs";
import { Annotation, RunReportItem } from "../types";
import { publish, createRun } from "./bus";
import {
  PROJECT_ROOT,
  RUN_REPORT_FILE,
  readAnnotations,
  writeAnnotations,
  readRunState,
  writeRunState,
  nowIso,
} from "./store";

const g = globalThis as unknown as { __devAnnoChild?: ReturnType<typeof spawn> };

function buildPrompt(annotations: Annotation[]): string {
  const lines: string[] = [];
  lines.push(
    "You are fixing UI/QA issues reported through an in-browser annotation tool for this Next.js project.",
    "Each annotation points at a specific element (or area) on a page and contains a discussion thread.",
    "",
    "RULES:",
    "- Make the smallest correct code change to address each annotation.",
    "- You MAY edit files and run ONLY `npx tsc --noEmit` and `npx next lint` to verify.",
    "- You MUST NOT run git (no commit/push), `next build`, or any prisma command. Do not change the Prisma schema.",
    "- If an annotation is ambiguous or you are unsure what is wanted, DO NOT guess — ask a question for it.",
    "- When you finish, WRITE a JSON file at `.annotations/run-report.json` containing an array where each item is:",
    '    { "id": "<annotation id>", "status": "fixed", "note": "<short resolution note>" }',
    "  or",
    '    { "id": "<annotation id>", "status": "question", "question": "<your question>" }',
    "  Include one entry for every annotation id listed below. The note/question must be concise.",
    "",
    "ANNOTATIONS:",
    ""
  );

  for (const a of annotations) {
    lines.push(`### Annotation #${a.number} (id: ${a.id})`);
    lines.push(`- Page: ${a.page.path} (viewport ${a.page.viewport.width}x${a.page.viewport.height})`);
    const el = a.target.element;
    if (a.target.type === "element" && el) {
      lines.push(`- Target element: <${el.tag}> selector: \`${el.selector}\``);
      if (el.classes.length) lines.push(`  - classes: ${el.classes.join(" ")}`);
      if (el.snippet) lines.push(`  - text: "${el.snippet}"`);
      if (el.react?.name) lines.push(`  - React component: ${el.react.name}`);
      if (el.react?.source)
        lines.push(
          `  - Source: ${el.react.source.file}:${el.react.source.line}`
        );
    } else if (a.target.type === "area" && a.target.area) {
      const r = a.target.area.rect;
      lines.push(
        `- Target area: rectangle ${Math.round(r.width)}x${Math.round(r.height)} containing ${a.target.area.elements.length} element(s):`
      );
      for (const e of a.target.area.elements) {
        const src = e.react?.source
          ? ` [${e.react.source.file}:${e.react.source.line}]`
          : "";
        lines.push(`  - <${e.tag}> \`${e.selector}\`${src}`);
      }
    }
    lines.push(`- Thread:`);
    for (const m of a.thread) {
      const who = m.author === "user" ? "User" : "Claude";
      lines.push(`  - ${who} (${m.kind}): ${m.text}`);
    }
    lines.push("");
  }

  lines.push(
    "Address every annotation above, then write `.annotations/run-report.json` as specified."
  );
  return lines.join("\n");
}

const CLAUDE_ARGS = [
  "-p",
  "--output-format",
  "stream-json",
  "--verbose",
  "--permission-mode",
  "acceptEdits",
  "--allowedTools",
  "Read",
  "Edit",
  "Write",
  "MultiEdit",
  "Grep",
  "Glob",
  "Bash(npx tsc:*)",
  "Bash(npx tsc --noEmit:*)",
  "Bash(npx next lint:*)",
  "Bash(npm run lint:*)",
  "--disallowedTools",
  "Bash(git:*)",
  "Bash(git commit:*)",
  "Bash(git push:*)",
  "Bash(next build:*)",
  "Bash(npx next build:*)",
  "Bash(prisma:*)",
  "Bash(npx prisma:*)",
  "Bash(rm:*)",
];

function handleStreamLine(runId: string, line: string) {
  let evt: unknown;
  try {
    evt = JSON.parse(line);
  } catch {
    return;
  }
  const e = evt as {
    type?: string;
    subtype?: string;
    is_error?: boolean;
    message?: { content?: Array<Record<string, unknown>> };
  };

  if (e.type === "assistant" && e.message?.content) {
    for (const block of e.message.content) {
      if (block.type === "text" && typeof block.text === "string") {
        const text = block.text.trim();
        if (text) publish(runId, { type: "assistant", text: text.slice(0, 280) });
      } else if (block.type === "tool_use") {
        const name = String(block.name ?? "tool");
        const input = (block.input ?? {}) as Record<string, unknown>;
        if (name === "Read") {
          publish(runId, { type: "tool", tool: "read", detail: String(input.file_path ?? "") });
        } else if (name === "Edit" || name === "Write" || name === "MultiEdit") {
          publish(runId, { type: "tool", tool: "edit", detail: String(input.file_path ?? "") });
        } else if (name === "Bash") {
          const cmd = String(input.command ?? "");
          const detail = /tsc/.test(cmd)
            ? "typecheck"
            : /lint/.test(cmd)
              ? "lint"
              : cmd.slice(0, 80);
          publish(runId, { type: "tool", tool: "bash", detail });
        } else {
          publish(runId, { type: "tool", tool: name.toLowerCase() });
        }
      }
    }
  }
}

async function applyReport(annotationIds: string[]) {
  let report: RunReportItem[] = [];
  try {
    const raw = await fs.readFile(RUN_REPORT_FILE, "utf8");
    report = JSON.parse(raw);
  } catch {
    report = [];
  }
  if (!Array.isArray(report)) report = [];

  const byId = new Map(report.map((r) => [r.id, r]));
  const annotations = await readAnnotations();
  for (const a of annotations) {
    if (!annotationIds.includes(a.id)) continue;
    const r = byId.get(a.id);
    if (!r) continue;
    if (r.status === "fixed") {
      a.thread.push({
        id: crypto.randomUUID(),
        author: "claude",
        kind: "resolution",
        text: r.note?.trim() || "Fixed.",
        createdAt: nowIso(),
      });
      a.status = "pending-review";
    } else if (r.status === "question") {
      a.thread.push({
        id: crypto.randomUUID(),
        author: "claude",
        kind: "question",
        text: r.question?.trim() || "Could you clarify this annotation?",
        createdAt: nowIso(),
      });
      a.status = "needs-reply";
    }
    a.updatedAt = nowIso();
  }
  await writeAnnotations(annotations);
}

/** Fire-and-forget: run Claude over the given annotations and finalize state. */
export function startRun(runId: string, annotations: Annotation[]) {
  const annotationIds = annotations.map((a) => a.id);
  createRun(runId);
  publish(runId, { type: "status", message: "Starting Claude Code…" });

  // Clear any stale report before the run.
  void fs.rm(RUN_REPORT_FILE, { force: true });

  const prompt = buildPrompt(annotations);
  const child = spawn("claude", CLAUDE_ARGS, {
    cwd: PROJECT_ROOT,
    env: process.env,
  });
  g.__devAnnoChild = child;

  child.stdin.write(prompt);
  child.stdin.end();

  let stdoutBuf = "";
  child.stdout.on("data", (chunk: Buffer) => {
    stdoutBuf += chunk.toString();
    let idx: number;
    while ((idx = stdoutBuf.indexOf("\n")) >= 0) {
      const line = stdoutBuf.slice(0, idx).trim();
      stdoutBuf = stdoutBuf.slice(idx + 1);
      if (line) handleStreamLine(runId, line);
    }
  });

  let stderrBuf = "";
  child.stderr.on("data", (chunk: Buffer) => {
    stderrBuf += chunk.toString();
  });

  const finalize = async (ok: boolean, errorMsg?: string) => {
    try {
      await applyReport(annotationIds);
    } catch (err) {
      errorMsg = errorMsg ?? String(err);
      ok = false;
    }
    const state = await readRunState();
    await writeRunState({
      ...state,
      phase: "awaiting-review",
      finishedAt: nowIso(),
      error: ok ? null : errorMsg ?? null,
    });
    if (ok) {
      publish(runId, { type: "status", message: "Run complete." });
      publish(runId, { type: "done", ok: true });
    } else {
      publish(runId, {
        type: "error",
        message: errorMsg ?? "Claude run failed",
      });
    }
    g.__devAnnoChild = undefined;
  };

  child.on("error", (err) => {
    void finalize(false, `Failed to start Claude: ${err.message}`);
  });

  child.on("close", (code) => {
    if (code === 0) {
      void finalize(true);
    } else {
      const tail = stderrBuf.trim().split("\n").slice(-3).join(" ");
      void finalize(false, `Claude exited with code ${code}. ${tail}`.trim());
    }
  });
}

export { buildPrompt };
