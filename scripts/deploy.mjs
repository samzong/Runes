import { spawn } from "node:child_process";
import { cp, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with ${signal ?? code ?? "an unknown status"}`));
    });
  });
}

const artifact = await mkdtemp(path.join(os.tmpdir(), "runes-blueprint-"));

try {
  await run("blueprint", ["create", "prototype-full", artifact]);
  await cp(path.resolve("dist"), path.join(artifact, "dist"), { recursive: true });
  await run("blueprint", ["deploy", path.join(artifact, "dist"), "--name", "runes"]);
} finally {
  await rm(artifact, { force: true, recursive: true });
}
