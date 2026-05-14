/**
 * One-off style: copies listed PNGs from Cursor assets into public/artworks/portfolio
 * as work-###.png and writes src/artworks/manifest.json (all work-*.png, numeric sort).
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const destDir = path.join(projectRoot, "public/artworks/portfolio");
const manifestPath = path.join(projectRoot, "src/artworks/manifest.json");
const srcDir =
  process.env.CURSOR_ASSETS_DIR ??
  path.join(
    process.env.HOME ?? "",
    ".cursor/projects/Users-admin-Documents-GitHub-Eddie-s-Canvas-infinite-canvas/assets"
  );

/** Order from user batch (63 files). */
const BATCH = [
  "Eddie-62-e2aac926-6eff-45bb-8a3a-b2e85ea7db90.png",
  "Eddie-59-cb44b03b-92f9-46d4-a0c9-4c2fc2cdddea.png",
  "Eddie-60-3bd7f66a-5b2e-4412-baac-4abe39319534.png",
  "Eddie-54-49062b6f-08ac-40b1-9d1e-120726f234ad.png",
  "Eddie-58-080aadfc-bc89-42d4-a6ba-06bd317368e4.png",
  "Eddie-52-3417fd92-5d09-4777-9571-ca8b70165ab1.png",
  "Eddie-53-bb0d2e6d-28c8-4216-b615-b9c1a5b7484d.png",
  "Eddie-51-d78ade01-0981-4859-9531-5298565fa5d5.png",
  "Eddie-46-1b8faf8d-2508-4ef2-8e1f-eedeec95a82f.png",
  "Eddie-50-a157e3ce-d4b8-4a31-871c-f806a5ebdb38.png",
  "Eddie-43-463226ca-a954-40f3-a144-d58dcf61237e.png",
  "Eddie-45-1269316c-c1cd-493a-8cc4-e77257823aea.png",
  "Eddie-40-12e29469-7567-49b2-8ee7-993dfaaefd7e.png",
  "Eddie-44-934223a4-6497-4677-9b62-8164c595084e.png",
  "Eddie-38-8abcfa00-11ea-4e99-a0a9-eed2fc1f8208.png",
  "Eddie-39-f9f7b9d3-0026-48ed-92c7-893c091b7ff8.png",
  "Eddie-42-b487da17-f2ec-484c-9040-97c3cb090b87.png",
  "Eddie-37-764743a7-727b-43e9-8ad0-42c2a932cc93.png",
  "Eddie-35-e87dc0f9-9cec-417a-875e-c49ab7074726.png",
  "Eddie-32-7f69f56e-e2d6-4b18-9c97-5a54b898722d.png",
  "Eddie-33-f13b70ac-509f-4b9c-89e0-dd1fd1f29a20.png",
  "Eddie-29-dd6538a8-5ca4-44b8-bb9b-f541e80edbcf.png",
  "Eddie-30-b966bc39-09b1-4c95-b0b3-989759a3e33e.png",
  "Eddie-31-8925585a-ec91-4927-8022-fa3e76f677d5.png",
  "Eddie-25-738692a8-dcc5-4c75-9393-eaa963f38048.png",
  "Eddie-27-e841474e-7fa0-476a-831e-1c75d964ee43.png",
  "Eddie-28-32a4b632-6929-44a9-9f87-e3740221d399.png",
  "Eddie-23-15822e49-e6f9-4659-b49d-906e75fe60bc.png",
  "Eddie-26-1dc2352e-ea7e-4278-a89f-60b1f9eec60b.png",
  "Eddie-21-3da8e6d6-c582-435f-b316-b93b1f795d84.png",
  "Eddie-24-e2e98faa-7c74-4c8b-94d7-dd24664ca7c8.png",
  "Eddie-20-b58d8e27-839b-4380-8a86-ac7e5f68e26d.png",
  "Eddie-49-9e8cceae-99e0-48c7-acfa-03f38927d12b.png",
  "Eddie-18-a39f6377-5b77-42cd-8e29-94e75b79f136.png",
  "Eddie-57-7584a312-cdd6-40d4-9766-7d53fa259a4f.png",
  "Eddie-22-b6015604-2745-487e-8a6b-6779d1098d07.png",
  "Eddie-17-17605360-57ef-4127-b8ed-1b4e0efc2575.png",
  "Eddie-9-e6a9797a-1388-4c0a-8ec8-90c98cc2f500.png",
  "Eddie-13-08eed4c4-5acc-4b43-8b72-b65f14b3b501.png",
  "Eddie-8-67ad4ae7-7783-4bc9-bc9f-4ce830dd6572.png",
  "Eddie-19-082e49f7-2162-4bfa-a4f1-f30ba394f3e4.png",
  "Eddie-10-246c74e3-4c41-4d08-94b7-1f9e15b869d3.png",
  "Eddie-7-56e32f86-2bf4-4284-92e4-f9de3b872d2c.png",
  "Eddie-11-ceaabcc5-d03f-4452-97b4-64e7ff380472.png",
  "Eddie-3-84abe3ba-d714-4ed2-9eae-bf327bf7a304.png",
  "Eddie-6-837c8880-2ad5-4402-95a1-690c1cedf72d.png",
  "Eddie-2-d7717085-4bb4-4a47-b6c0-ee71302f2a05.png",
  "Eddie-5-865382a7-074c-48a6-9726-c5016d4861f7.png",
  "Product_Advisor-667ffbe1-3dc9-4b86-a582-a98f39645330.png",
  "Product_Carousel_-_Content_Cards-cbc1be33-2ab3-4471-8569-99e8aa2a2a55.png",
  "Eddie-61-778bb00e-9727-46bd-8fe8-cf629dd3d46c.png",
  "Eddie-56-5cb66369-0d68-4ad4-b887-bce7217931f3.png",
  "Eddie-55-6a0a1f30-e747-4ca5-9050-5cd20187fb24.png",
  "Eddie-48-d4c291a2-dd54-434d-ae9c-0708748bab2b.png",
  "Eddie-41-0030e280-8d3b-4639-95b7-000b97cd60bf.png",
  "Eddie-47-a124dd64-8cbe-4fd5-9cbf-ee3543e18997.png",
  "Eddie-34-1a45fa79-b29c-4e1e-8d87-6175c06fe72f.png",
  "Eddie-16-c023d93c-5cb2-4ae2-939b-c6d956c76b40.png",
  "Eddie-14-873017e8-4407-4667-a6d6-1d028559d32e.png",
  "Eddie-desk-f8af3ace-dcbc-460f-b907-c6d3e680e84b.png",
  "Eddie-15-20800a4a-e252-413f-b840-2103804955bd.png",
  "Eddie-4-159a226d-6476-4286-8a84-013830c2eca5.png",
  "Eddie-36-632e8edd-c753-4ccd-a3d9-44ee6777be90.png",
];

function maxWorkIndex() {
  if (!fs.existsSync(destDir)) return 0;
  let max = 0;
  for (const f of fs.readdirSync(destDir)) {
    const m = /^work-(\d+)\.png$/i.exec(f);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max;
}

function dimensions(full) {
  const out = execSync(`sips -g pixelWidth -g pixelHeight ${JSON.stringify(full)}`, { encoding: "utf8" });
  const w = /pixelWidth: (\d+)/.exec(out);
  const h = /pixelHeight: (\d+)/.exec(out);
  if (!w || !h) throw new Error(`sips failed for ${full}\n${out}`);
  return { width: Number(w[1]), height: Number(h[1]) };
}

fs.mkdirSync(destDir, { recursive: true });

let start = maxWorkIndex() + 1;
for (let i = 0; i < BATCH.length; i++) {
  const name = BATCH[i];
  const src = path.join(srcDir, name);
  if (!fs.existsSync(src)) {
    console.error("Missing source:", src);
    process.exit(1);
  }
  const num = String(start + i).padStart(3, "0");
  const dest = path.join(destDir, `work-${num}.png`);
  fs.copyFileSync(src, dest);
}

const files = fs
  .readdirSync(destDir)
  .filter((f) => /^work-\d+\.png$/i.test(f))
  .sort((a, b) => Number(/^work-(\d+)/i.exec(a)?.[1] ?? 0) - Number(/^work-(\d+)/i.exec(b)?.[1] ?? 0));

/** Portrait excluded from 3D canvas (see project history). */
const MANIFEST_SKIP = new Set(["work-034.png"]);

const items = files
  .filter((f) => !MANIFEST_SKIP.has(f))
  .map((f) => {
    const full = path.join(destDir, f);
    const { width, height } = dimensions(full);
    return { url: `artworks/portfolio/${f}`, width, height };
  });

fs.writeFileSync(manifestPath, `${JSON.stringify(items, null, 2)}\n`);
console.log(`Wrote ${items.length} entries to manifest (work-001 … work-${String(items.length).padStart(3, "0")})`);
