import { compile } from "@mdx-js/mdx";
import dedent from "dedent";

import recmaMdxImportMedia, { type ImportMediaOptions } from "../src";

describe("recma-mdx-import-media, output is program", () => {
  // ******************************************
  it("markdown syntax", async () => {
    const source = dedent`
      ![alt](./image.png)
    `;

    const compiledSource = await compile(source, {
      outputFormat: "program",
      recmaPlugins: [recmaMdxImportMedia],
    });

    expect(String(compiledSource)).toContain(dedent`
      import imagepng$recmamdximport from "./image.png";
    `);
  });

  // ******************************************
  it("markdown syntax more", async () => {
    const source = dedent`
      ![alt](./image.png)

      ![alt](../../image.png)
    `;

    const compiledSource = await compile(source, {
      outputFormat: "program",
      recmaPlugins: [recmaMdxImportMedia],
    });

    expect(String(compiledSource)).toContain(dedent`
      import imagepng$recmamdximport from "./image.png";
      import imagepng_1$recmamdximport from "../../image.png";
    `);
  });

  // ******************************************
  it("markdown syntax multiple", async () => {
    const source = dedent`
      ![alt](image.gif)

      ![alt](image.jpg)

      ![alt](image.png)

      ![alt](image.svg)
    `;

    const compiledSource = await compile(source, {
      outputFormat: "program",
      recmaPlugins: [recmaMdxImportMedia],
    });

    expect(String(compiledSource)).toContain(dedent`
      import imagegif$recmamdximport from "./image.gif";
      import imagejpg$recmamdximport from "./image.jpg";
      import imagepng$recmamdximport from "./image.png";
      import imagesvg$recmamdximport from "./image.svg";
    `);
  });

  // ******************************************
  it("html syntax", async () => {
    const source = dedent`
      <img src="./image.png" alt="alt" />
    `;

    const compiledSource = await compile(source, {
      outputFormat: "program",
      recmaPlugins: [recmaMdxImportMedia],
    });

    expect(String(compiledSource)).toContain(dedent`
      import imagepng$recmamdximport from "./image.png";
    `);
  });

  // ******************************************
  it("htm syntax more", async () => {
    const source = dedent`
      <img src="./image.png" alt="alt" />

      <img src="../../image.png" alt="alt" />
    `;

    const compiledSource = await compile(source, {
      outputFormat: "program",
      recmaPlugins: [recmaMdxImportMedia],
    });

    expect(String(compiledSource)).toContain(dedent`
      import imagepng$recmamdximport from "./image.png";
      import imagepng_1$recmamdximport from "../../image.png";
    `);
  });

  // ******************************************
  it("html syntax multiple", async () => {
    const source = dedent`
      <img src="image.gif" alt="alt" />

      <img src="image.jpg" alt="alt" />

      <img src="image.png" alt="alt" />

      <img src="image.svg" alt="alt" />
    `;

    const compiledSource = await compile(source, {
      outputFormat: "program",
      recmaPlugins: [recmaMdxImportMedia],
    });

    expect(String(compiledSource)).toContain(dedent`
      import imagegif$recmamdximport from "./image.gif";
      import imagejpg$recmamdximport from "./image.jpg";
      import imagepng$recmamdximport from "./image.png";
      import imagesvg$recmamdximport from "./image.svg";
    `);
  });

  // ******************************************
  it("both markdown and html syntax", async () => {
    const source = dedent`
      ![alt](./image.png)

      <img src="../../image.png" alt="alt" />
    `;

    const compiledSource = await compile(source, {
      outputFormat: "program",
      recmaPlugins: [recmaMdxImportMedia],
    });

    expect(String(compiledSource)).toContain(dedent`
      import imagepng$recmamdximport from "./image.png";
      import imagepng_1$recmamdximport from "../../image.png";
    `);
  });

  // ******************************************
  it("both markdown and html syntax, exclude html", async () => {
    const source = dedent`
      ![alt](./image.png)

      <img src="../../image.png" alt="alt" />
    `;

    const compiledSource = await compile(source, {
      outputFormat: "program",
      recmaPlugins: [[recmaMdxImportMedia, { excludeSyntax: ["html"] } as ImportMediaOptions]],
    });

    expect(String(compiledSource)).toContain(dedent`
      import imagepng$recmamdximport from "./image.png";
    `);

    expect(String(compiledSource)).not.toContain(`from "../../image.png"`);
  });

  // ******************************************
  it("both markdown and html syntax, exclude markdown", async () => {
    const source = dedent`
      ![alt](./image.png)

      <img src="../../image.png" alt="alt" />
    `;

    const compiledSource = await compile(source, {
      outputFormat: "program",
      recmaPlugins: [
        [recmaMdxImportMedia, { excludeSyntax: ["markdown"] } as ImportMediaOptions],
      ],
    });

    expect(String(compiledSource)).toContain(dedent`
      import imagepng$recmamdximport from "../../image.png";
    `);

    expect(String(compiledSource)).not.toContain(`from "./image.png"`);
  });
});
