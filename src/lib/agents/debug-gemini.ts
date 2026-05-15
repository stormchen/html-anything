import { spawn } from "node:child_process";

export async function debugGemini() {
  const bin = "C:\\Users\\Storm\\AppData\\Roaming\\npm\\gemini.cmd";
  console.log("--- Gemini CLI Diagnostic Start ---");
  console.log("Target Binary:", bin);
  
  return new Promise((resolve) => {
    try {
      const child = spawn(bin, ["--version"], {
        shell: true, // Crucial for Windows .cmd files
        stdio: ["ignore", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => stdout += data.toString());
      child.stderr.on("data", (data) => stderr += data.toString());

      child.on("error", (err) => {
        console.log("Spawn Error:", err.message);
        resolve({ success: false, error: err.message });
      });

      child.on("close", (code) => {
        console.log("Exit Code:", code);
        console.log("STDOUT:", stdout);
        console.log("STDERR:", stderr);
        console.log("--- Gemini CLI Diagnostic End ---");
        resolve({ success: code === 0, stdout, stderr });
      });
    } catch (e: any) {
      console.log("Catch Error:", e.message);
      resolve({ success: false, error: e.message });
    }
  });
}
