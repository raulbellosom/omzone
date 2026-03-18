import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // Keep only env keys that are valid JS identifiers once appended to
  // import.meta.env.<KEY>. This avoids esbuild "Expected '.' but found '-'"
  // errors when CI/build providers inject prefixed vars with hyphens.
  const isValidEnvKey = (key) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);

  const fileEnv = loadEnv(mode, process.cwd(), ["APPWRITE_", "VITE_"]);

  // Define APPWRITE_* and VITE_* explicitly so Vite does not auto-expose
  // potentially invalid keys from process.env through envPrefix.
  const safeEnvDefines = Object.fromEntries(
    Object.entries(fileEnv)
      .filter(
        ([k]) =>
          (k.startsWith("APPWRITE_") || k.startsWith("VITE_")) &&
          isValidEnvKey(k),
      )
      .map(([k, v]) => [`import.meta.env.${k}`, JSON.stringify(v)]),
  );

  return {
    plugins: [react(), tailwindcss()],
    // Disable automatic env prefix injection to prevent invalid define keys.
    envPrefix: "__OMZONE_ENV_DISABLED__",
    define: safeEnvDefines,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
    },
  };
});
