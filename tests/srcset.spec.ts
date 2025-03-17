import { compile } from "@mdx-js/mdx";
import dedent from "dedent";

import recmaMdxImportMedia from "../src";

describe("recma-mdx-import-media, srcset attribute", () => {
  const source = dedent`
    <picture>
      <source media="(min-width:650px)" srcset="image1.jpg" />
      <source media="(min-width:465px)" srcset="image2.jpg" />
      <source media="(min-width:465px)" srcset="../upper.jpg" />
      <img src="image.jpg" alt="Flowers" style="width:auto;" />
    </picture>

    <img srcset="image.png#hash 2x, image.png#mash 4x" />

    <img srcset="image.png?size=16 2x, image.png?size=32 4x" />

    <img srcset="image.png 2x, image.png 640w 480h, other.png" />

    <img srcset="image.png 2x, image.png, other.png 640w 480h" />

    <img srcset="https://example.com/image.png" />

    <img srcset="/image.png#hash 2x, /other.png?size=32 4x" />
  `;

  // ******************************************
  it("without plugin, output format is function-body", async () => {
    const compiledSource = await compile(source, {
      outputFormat: "function-body",
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      ""use strict";
      const {Fragment: _Fragment, jsx: _jsx, jsxs: _jsxs} = arguments[0];
      function _createMdxContent(props) {
        return _jsxs(_Fragment, {
          children: [_jsxs("picture", {
            children: [_jsx("source", {
              media: "(min-width:650px)",
              srcset: "image1.jpg"
            }), _jsx("source", {
              media: "(min-width:465px)",
              srcset: "image2.jpg"
            }), _jsx("source", {
              media: "(min-width:465px)",
              srcset: "../upper.jpg"
            }), _jsx("img", {
              src: "image.jpg",
              alt: "Flowers",
              style: "width:auto;"
            })]
          }), "\\n", _jsx("img", {
            srcset: "image.png#hash 2x, image.png#mash 4x"
          }), "\\n", _jsx("img", {
            srcset: "image.png?size=16 2x, image.png?size=32 4x"
          }), "\\n", _jsx("img", {
            srcset: "image.png 2x, image.png 640w 480h, other.png"
          }), "\\n", _jsx("img", {
            srcset: "image.png 2x, image.png, other.png 640w 480h"
          }), "\\n", _jsx("img", {
            srcset: "https://example.com/image.png"
          }), "\\n", _jsx("img", {
            srcset: "/image.png#hash 2x, /other.png?size=32 4x"
          })]
        });
      }
      function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? _jsx(MDXLayout, {
          ...props,
          children: _jsx(_createMdxContent, {
            ...props
          })
        }) : _createMdxContent(props);
      }
      return {
        default: MDXContent
      };
      "
    `);
  });

  // ******************************************
  it("with plugin, output format is function-body", async () => {
    const compiledSource = await compile(source, {
      outputFormat: "function-body",
      recmaPlugins: [recmaMdxImportMedia],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      ""use strict";
      const {Fragment: _Fragment, jsx: _jsx, jsxs: _jsxs} = arguments[0];
      import image1jpg$recmamdximport from "./image1.jpg";
      import image2jpg$recmamdximport from "./image2.jpg";
      import upperjpg$recmamdximport from "../upper.jpg";
      import imagejpg$recmamdximport from "./image.jpg";
      import imagepng$recmamdximport from "./image.png";
      import otherpng$recmamdximport from "./other.png";
      function _createMdxContent(props) {
        return _jsxs(_Fragment, {
          children: [_jsxs("picture", {
            children: [_jsx("source", {
              media: "(min-width:650px)",
              srcset: image1jpg$recmamdximport
            }), _jsx("source", {
              media: "(min-width:465px)",
              srcset: image2jpg$recmamdximport
            }), _jsx("source", {
              media: "(min-width:465px)",
              srcset: upperjpg$recmamdximport
            }), _jsx("img", {
              src: imagejpg$recmamdximport,
              alt: "Flowers",
              style: "width:auto;"
            })]
          }), "\\n", _jsx("img", {
            srcset: \`\${imagepng$recmamdximport}#hash 2x, \${imagepng$recmamdximport}#mash 4x\`
          }), "\\n", _jsx("img", {
            srcset: \`\${imagepng$recmamdximport}?size=16 2x, \${imagepng$recmamdximport}?size=32 4x\`
          }), "\\n", _jsx("img", {
            srcset: \`\${imagepng$recmamdximport} 2x, \${imagepng$recmamdximport} 640w 480h, \${otherpng$recmamdximport}\`
          }), "\\n", _jsx("img", {
            srcset: \`\${imagepng$recmamdximport} 2x, \${imagepng$recmamdximport}, \${otherpng$recmamdximport} 640w 480h\`
          }), "\\n", _jsx("img", {
            srcset: "https://example.com/image.png"
          }), "\\n", _jsx("img", {
            srcset: "/image.png#hash 2x, /other.png?size=32 4x"
          })]
        });
      }
      function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? _jsx(MDXLayout, {
          ...props,
          children: _jsx(_createMdxContent, {
            ...props
          })
        }) : _createMdxContent(props);
      }
      return {
        default: MDXContent
      };
      "
    `);
  });

  // ******************************************
  it("without plugin, output format is function-body, jsx is true", async () => {
    const compiledSource = await compile(source, {
      jsx: true,
      outputFormat: "function-body",
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      "use strict";
      function _createMdxContent(props) {
        return <><picture><source media="(min-width:650px)" srcset="image1.jpg" /><source media="(min-width:465px)" srcset="image2.jpg" /><source media="(min-width:465px)" srcset="../upper.jpg" /><img src="image.jpg" alt="Flowers" style="width:auto;" /></picture>{"\\n"}<img srcset="image.png#hash 2x, image.png#mash 4x" />{"\\n"}<img srcset="image.png?size=16 2x, image.png?size=32 4x" />{"\\n"}<img srcset="image.png 2x, image.png 640w 480h, other.png" />{"\\n"}<img srcset="image.png 2x, image.png, other.png 640w 480h" />{"\\n"}<img srcset="https://example.com/image.png" />{"\\n"}<img srcset="/image.png#hash 2x, /other.png?size=32 4x" /></>;
      }
      function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
      }
      return {
        default: MDXContent
      };
      "
    `);
  });

  // ******************************************
  it("with plugin, output format is function-body, jsx is true", async () => {
    const compiledSource = await compile(source, {
      jsx: true,
      outputFormat: "function-body",
      recmaPlugins: [recmaMdxImportMedia],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      "use strict";
      import image1jpg$recmamdximport from "./image1.jpg";
      import image2jpg$recmamdximport from "./image2.jpg";
      import upperjpg$recmamdximport from "../upper.jpg";
      import imagejpg$recmamdximport from "./image.jpg";
      import imagepng$recmamdximport from "./image.png";
      import otherpng$recmamdximport from "./other.png";
      function _createMdxContent(props) {
        return <><picture><source media="(min-width:650px)" srcset={image1jpg$recmamdximport} /><source media="(min-width:465px)" srcset={image2jpg$recmamdximport} /><source media="(min-width:465px)" srcset={upperjpg$recmamdximport} /><img src={imagejpg$recmamdximport} alt="Flowers" style="width:auto;" /></picture>{"\\n"}<img srcset={\`\${imagepng$recmamdximport}#hash 2x, \${imagepng$recmamdximport}#mash 4x\`} />{"\\n"}<img srcset={\`\${imagepng$recmamdximport}?size=16 2x, \${imagepng$recmamdximport}?size=32 4x\`} />{"\\n"}<img srcset={\`\${imagepng$recmamdximport} 2x, \${imagepng$recmamdximport} 640w 480h, \${otherpng$recmamdximport}\`} />{"\\n"}<img srcset={\`\${imagepng$recmamdximport} 2x, \${imagepng$recmamdximport}, \${otherpng$recmamdximport} 640w 480h\`} />{"\\n"}<img srcset="https://example.com/image.png" />{"\\n"}<img srcset="/image.png#hash 2x, /other.png?size=32 4x" /></>;
      }
      function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
      }
      return {
        default: MDXContent
      };
      "
    `);
  });
});
