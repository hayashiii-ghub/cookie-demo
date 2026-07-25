export default {
  target: {
    url: process.env.SHIMON_URL ?? "http://127.0.0.1:4322/",
  },
  viewports: {
    desktop: { width: 1600, height: 1000 },
    mobile: { width: 390, height: 844 },
  },
  webServer: {
    command: "ASTRO_DEV_BACKGROUND=0 npm run dev -- --host 127.0.0.1 --port 4322",
    url: "http://127.0.0.1:4322/",
    reuseExisting: true,
    timeoutMs: 30_000,
  },
};
