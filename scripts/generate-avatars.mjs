import { mkdir, writeFile } from "node:fs/promises";
import { PNG } from "pngjs";

const size = 256;
const outputDir = new URL("../public/agents/", import.meta.url);

const specs = [
  {
    name: "aria",
    background: [46, 58, 118],
    accent: [112, 147, 255],
    secondary: [205, 174, 255],
    draw(png, x, y) {
      const dx = x - size / 2;
      const dy = y - size / 2;
      const inDiamond = Math.abs(dx) + Math.abs(dy) < 92;
      return inDiamond && Math.abs(dx) < 78 && Math.abs(dy) < 78;
    },
  },
  {
    name: "vex",
    background: [76, 18, 14],
    accent: [245, 96, 54],
    secondary: [255, 197, 93],
    draw(_png, x, y) {
      return y > 36 && y < 224 && x > 54 && x < 202 && x + y > 160 && x - y < 110;
    },
  },
  {
    name: "crate",
    background: [80, 49, 31],
    accent: [202, 156, 76],
    secondary: [236, 219, 172],
    draw(_png, x, y) {
      const cx = x - size / 2;
      const cy = y - size / 2;
      const ring = Math.sqrt(cx * cx + cy * cy);
      return ring > 40 && ring < 86;
    },
  },
  {
    name: "pulse",
    background: [22, 41, 56],
    accent: [118, 212, 229],
    secondary: [227, 184, 244],
    draw(_png, x, y) {
      const dx = x - size / 2;
      const dy = y - size / 2;
      return Math.sqrt(dx * dx + dy * dy) < 86;
    },
  },
];

await mkdir(outputDir, { recursive: true });

for (const spec of specs) {
  const png = new PNG({ width: size, height: size });

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const idx = (size * y + x) << 2;
      const noise = Math.sin(x / 13) * Math.cos(y / 17) * 12;
      const radial = Math.hypot(x - size / 2, y - size / 2) / size;
      const bg = spec.background.map((channel, i) =>
        Math.max(
          0,
          Math.min(
            255,
            channel +
              noise +
              (i === 0 ? radial * 18 : radial * 8),
          ),
        ),
      );

      png.data[idx] = bg[0];
      png.data[idx + 1] = bg[1];
      png.data[idx + 2] = bg[2];
      png.data[idx + 3] = 255;

      if (spec.draw(png, x, y)) {
        png.data[idx] = spec.accent[0];
        png.data[idx + 1] = spec.accent[1];
        png.data[idx + 2] = spec.accent[2];
      }

      const halo = Math.abs(Math.hypot(x - size / 2, y - size / 2) - 96) < 2;
      if (halo) {
        png.data[idx] = spec.secondary[0];
        png.data[idx + 1] = spec.secondary[1];
        png.data[idx + 2] = spec.secondary[2];
      }
    }
  }

  await writeFile(new URL(`${spec.name}.png`, outputDir), PNG.sync.write(png));
}

console.log("Generated avatar PNGs.");
