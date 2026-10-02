// Git helpers for the annotation tool's snapshot / Simpan / Batalkan flow.
// Server-only (imported by dev API routes). All operations run in PROJECT_ROOT.
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import { promises as fs } from "fs";
import { assertDev, ANNOTATIONS_DIR, PROJECT_ROOT } from "./store";

const execFileAsync = promisify(execFile);

const TMP_INDEX = path.join(ANNOTATIONS_DIR, ".git-tmp-index");

/** The temp index lives under the gitignored .annotations/ dir; make sure it
 * exists before git tries to create its lock file there. */
async function ensureTmpDir() {
  await fs.mkdir(ANNOTATIONS_DIR, { recursive: true });
}

async function git(
  args: string[],
  opts?: { indexFile?: string }
): Promise<string> {
  assertDev();
  const env = { ...process.env };
  if (opts?.indexFile) env.GIT_INDEX_FILE = opts.indexFile;
  const { stdout } = await execFileAsync("git", args, {
    cwd: PROJECT_ROOT,
    env,
    maxBuffer: 1024 * 1024 * 64,
  });
  return stdout.trim();
}

export async function getBranch(): Promise<string> {
  return git(["rev-parse", "--abbrev-ref", "HEAD"]);
}

export async function getHead(): Promise<string> {
  return git(["rev-parse", "HEAD"]);
}

/**
 * Capture the full current working tree (tracked + untracked, honoring
 * .gitignore) as a commit object WITHOUT touching the branch or the real index.
 * Returns the snapshot commit sha. `git add -A` in a throwaway index excludes
 * ignored paths (.annotations, node_modules, .next), which is what we want.
 */
export async function snapshotWorkingTree(): Promise<{
  commit: string;
  head: string;
}> {
  const head = await getHead();
  await ensureTmpDir();
  await fs.rm(TMP_INDEX, { force: true });
  try {
    // Seed temp index from HEAD, then stage every change (adds/mods/deletes).
    await git(["read-tree", head], { indexFile: TMP_INDEX });
    await git(["add", "-A"], { indexFile: TMP_INDEX });
    const tree = await git(["write-tree"], { indexFile: TMP_INDEX });
    const commit = await git([
      "commit-tree",
      tree,
      "-p",
      head,
      "-m",
      "dev-annotations: pre-run snapshot",
    ]);
    return { commit, head };
  } finally {
    await fs.rm(TMP_INDEX, { force: true });
  }
}

/**
 * Paths changed by the run = diff between the snapshot tree and a tree built
 * from the CURRENT working tree. Comparing two trees (both via `add -A`) is the
 * only correct way here: a plain `git diff <commit>` ignores untracked files,
 * so it would miss run-created files and get confused by the index. Both trees
 * honor .gitignore, so .annotations/ is never included.
 */
export async function changedPathsSince(
  snapshotCommit: string
): Promise<string[]> {
  await ensureTmpDir();
  await fs.rm(TMP_INDEX, { force: true });
  try {
    const head = await getHead();
    await git(["read-tree", head], { indexFile: TMP_INDEX });
    await git(["add", "-A"], { indexFile: TMP_INDEX });
    const currentTree = await git(["write-tree"], { indexFile: TMP_INDEX });
    const out = await git([
      "diff",
      "--name-only",
      `${snapshotCommit}^{tree}`,
      currentTree,
    ]);
    return out
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  } finally {
    await fs.rm(TMP_INDEX, { force: true });
  }
}

/**
 * Simpan: commit ONLY the run's delta (current content of run-touched paths) on
 * top of HEAD, leaving unrelated pre-run edits uncommitted. Returns the new
 * commit sha, or null if nothing changed.
 */
export async function commitRunDelta(
  snapshotCommit: string,
  message: string
): Promise<{ commit: string; paths: string[] } | null> {
  const paths = await changedPathsSince(snapshotCommit);
  if (paths.length === 0) return null;

  const head = await getHead();
  await ensureTmpDir();
  await fs.rm(TMP_INDEX, { force: true });
  try {
    await git(["read-tree", head], { indexFile: TMP_INDEX });
    // Stage current content (incl. deletions) for just the run-touched paths.
    await git(["add", "-A", "--", ...paths], { indexFile: TMP_INDEX });
    const tree = await git(["write-tree"], { indexFile: TMP_INDEX });
    const commit = await git([
      "commit-tree",
      tree,
      "-p",
      head,
      "-m",
      message,
    ]);
    // Advance the current branch to the new commit without touching the
    // working tree, then refresh the real index to the new HEAD.
    await git(["update-ref", "HEAD", commit]);
    await git(["reset", "-q"]);
    return { commit, paths };
  } finally {
    await fs.rm(TMP_INDEX, { force: true });
  }
}

/**
 * Batalkan: restore the working tree exactly to the pre-run snapshot. Pre-run
 * uncommitted work is brought back; run-created untracked files are removed;
 * ignored paths (.annotations, node_modules, .next) are preserved.
 */
export async function restoreWorkingTree(snapshotCommit: string): Promise<void> {
  // index + worktree := snapshot tree
  await git(["read-tree", "-u", "--reset", `${snapshotCommit}^{tree}`]);
  // remove run-created untracked files/dirs (NOT ignored ones — no -x)
  await git(["clean", "-fd"]);
  // index := HEAD, worktree untouched → pre-run edits reappear as unstaged
  await git(["reset", "-q"]);
}

export async function isGitRepo(): Promise<boolean> {
  try {
    await git(["rev-parse", "--is-inside-work-tree"]);
    return true;
  } catch {
    return false;
  }
}
