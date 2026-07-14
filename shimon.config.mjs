const MARKS = [
  "d-njk",
  "d-nj",
  "d-gem",
  "d-att",
  "d-arrow2",
  "d-type",
  "d-arrow1",
  "d-color",
  "d-arrow3",
  "d-layout",
  "d-flow",
  "d-frog",
  "d-smile",
  "d-star3",
];

const SCROLL_CASES = [
  ["start", 0],
  ["scroll-005", 0.05],
  ["scroll-010", 0.1],
  ["scroll-016", 0.16],
  ["scroll-020", 0.2],
  ["scroll-026", 0.26],
  ["handoff-before", 0.2999],
  ["handoff-after", 0.3],
  ["scroll-034", 0.34],
  ["scroll-042", 0.42],
  ["scroll-052", 0.52],
  ["scroll-070", 0.7],
  ["scroll-086", 0.86],
  ["end", 1],
];

function staticCase() {
  return {
    name: "static",
    prepare: (page) =>
      page.evaluate(() => {
        document.documentElement.dataset.shimonCase = "static";
      }),
  };
}

function scrollCase(name, progress) {
  return {
    name,
    prepare: (page) =>
      page.evaluate(
        ({ name, progress }) => {
          document.documentElement.dataset.shimonCase = name;
          window.dispatchEvent(new WheelEvent("wheel"));
          const max = document.documentElement.scrollHeight - innerHeight;
          scrollTo(0, Math.round(progress * max));
        },
        { name, progress },
      ),
  };
}

export default {
  target: {
    url: process.env.FP_URL ?? "http://127.0.0.1:4322/",
    viewport: { width: 1600, height: 1000 },
  },

  cases: [staticCase(), ...SCROLL_CASES.map(([name, progress]) => scrollCase(name, progress))],

  async stabilize(page) {
    await page.evaluate(() => {
      window.dispatchEvent(new WheelEvent("wheel"));

      window.__shimonHash = (buffer) => {
        let hash = 0x811c9dc5;
        for (let index = 0; index < buffer.length; index += 1) {
          hash ^= buffer[index];
          hash = Math.imul(hash, 0x01000193);
        }
        return (hash >>> 0).toString(16).padStart(8, "0");
      };

      window.__shimonCanvasHash = (canvas) => {
        const context = canvas.getContext("2d");
        return window.__shimonHash(
          context.getImageData(0, 0, canvas.width, canvas.height).data,
        );
      };
    });
  },

  probe(page) {
    return page.evaluate((marks) => {
      const computed = (element) => getComputedStyle(element);
      const element = (selector) => {
        const found = document.querySelector(selector);
        if (!found) throw new Error(`Missing fingerprint target: ${selector}`);
        return found;
      };
      const rect = (target) => {
        const value = target.getBoundingClientRect();
        return [value.x, value.y, value.width, value.height]
          .map((number) => number.toFixed(2))
          .join(",");
      };
      const background = (selector, pseudo = null) =>
        getComputedStyle(element(selector), pseudo).backgroundImage;

      if (document.documentElement.dataset.shimonCase === "static") {
        const crumbs = [...document.querySelectorAll("#crumbs canvas")]
          .map(
            (canvas) =>
              `${canvas.width}x${canvas.height}@${canvas.style.left},${canvas.style.top}:${window.__shimonCanvasHash(canvas)}`,
          )
          .join("|");
        const caseStyle = computed(element("#case"));

        return {
          crumbCount: document.querySelectorAll("#crumbs canvas").length,
          crumbs: window.__shimonHash(new TextEncoder().encode(crumbs)),
          css: {
            "tray::before": background(".tray", "::before"),
            "r-hinge": background(".r-hinge"),
            "spine.cover": background(".face.cover .spine"),
            "spine.inside": background(".face.inside .spine"),
            "case.size": `${caseStyle.width} x ${caseStyle.height}`,
          },
        };
      }

      const ids = ["case", "lid", "cover", "cd1", "doodle"];
      const style = (selector) => computed(element(selector));

      const doodleSpans = document.querySelectorAll("#doodle span").length;
      if (doodleSpans !== marks.length) {
        throw new Error(
          `MARKS drift: probing ${marks.length} marks but #doodle holds ${doodleSpans} spans`,
        );
      }

      return {
        timecode: element("#tc").textContent,
        canvas: window.__shimonCanvasHash(element("#cookie")),
        caseTransform: element("#case").style.transform,
        caseOpacity: element("#case").style.opacity,
        lidTransform: element("#lid").style.transform,
        gloss: style("#cover").getPropertyValue("--gloss").trim(),
        crumbsOpacity: style("#crumbs").opacity,
        sweep: style("#cd1").getPropertyValue("--sweep").trim(),
        backgroundDarkOpacity: style("#bgDark").opacity,
        backgroundBlueOpacity: style("#bgBlue").opacity,
        rects: Object.fromEntries(ids.map((id) => [id, rect(element(`#${id}`))])),
        marks: Object.fromEntries(
          marks.map((mark) => [mark, style(`.${mark}`).getPropertyValue("--w").trim()]),
        ),
        bookletUnderline: style(".ib-ul").getPropertyValue("--uw").trim(),
        trackHighlighter: style(".tl li.on").getPropertyValue("--lw").trim(),
      };
    }, MARKS);
  },
};
