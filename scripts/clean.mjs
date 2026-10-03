import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const skipNodeModules = process.argv.includes("--cache-only") || process.argv.includes("--no-modules");
const includeNodeModules = !skipNodeModules;

const DIRS_TO_REMOVE = [
  ".turbo",
  ".next",
  "dist",
  "build",
  "out",
  ".cache",
  "coverage",
  ".temp",
  ...(includeNodeModules ? ["node_modules"] : []),
];

const FILE_EXT_TO_REMOVE = [
  ".tsbuildinfo",
  ".eslintcache",
];

function getDirSize(dirPath) {
  let total = 0;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        total += getDirSize(fullPath);
      } else if (entry.isFile()) {
        total += fs.statSync(fullPath).size;
      }
    }
  } catch {
    return 0;
  }
  return total;
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function getWorkspaces() {
  const workspaces = [ROOT];
  for (const group of ["apps", "packages"]) {
    const groupPath = path.join(ROOT, group);
    if (!fs.existsSync(groupPath)) continue;
    const entries = fs.readdirSync(groupPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        workspaces.push(path.join(groupPath, entry.name));
      }
    }
  }
  return workspaces;
}

function clean() {
  console.log("\x1b[36m%s\x1b[0m", `\n🧹 Cleaning Rove monorepo build artifacts and caches...${includeNodeModules ? " (including node_modules)" : ""}\n`);

  const workspaces = getWorkspaces();
  let totalRemoved = 0;
  let totalBytesFreed = 0;

  for (const ws of workspaces) {
    const relWs = path.relative(ROOT, ws) || ".";

    // Clean directories
    for (const dirName of DIRS_TO_REMOVE) {
      const target = path.join(ws, dirName);
      if (fs.existsSync(target)) {
        try {
          const size = getDirSize(target);
          totalBytesFreed += size;
          fs.rmSync(target, { recursive: true, force: true });
          const displayPath = path.join(relWs, dirName);
          console.log(`  \x1b[32m✓\x1b[0m Removed \x1b[33m${displayPath}\x1b[0m (${formatBytes(size)})`);
          totalRemoved++;
        } catch (err) {
          console.error(`  \x1b[31m✗\x1b[0m Failed to remove ${target}:`, err.message);
        }
      }
    }

    // Clean build info & cache files
    try {
      const entries = fs.readdirSync(ws, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile()) {
          const isTarget = FILE_EXT_TO_REMOVE.some((ext) => entry.name.endsWith(ext));
          if (isTarget) {
            const target = path.join(ws, entry.name);
            const size = fs.statSync(target).size;
            totalBytesFreed += size;
            fs.rmSync(target, { force: true });
            const displayPath = path.join(relWs, entry.name);
            console.log(`  \x1b[32m✓\x1b[0m Removed \x1b[33m${displayPath}\x1b[0m (${formatBytes(size)})`);
            totalRemoved++;
          }
        }
      }
    } catch {}
  }

  if (totalRemoved === 0) {
    console.log("  \x1b[90m✨ Workspace is already clean! Nothing to remove.\x1b[0m\n");
  } else {
    console.log(
      `\n\x1b[32m✨ Clean complete! Removed ${totalRemoved} targets, freed ${formatBytes(totalBytesFreed)}.\x1b[0m\n`
    );
  }
}

clean();
