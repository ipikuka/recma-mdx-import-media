import { compile } from "@mdx-js/mdx";
import dedent from "dedent";

import recmaMdxImportMedia from "../src";

describe("recma-mdx-import-media, example in the README", () => {
  // ******************************************
  it("example in the README", async () => {
    const source = dedent`
      ![alt](./image.png)

      <img src="../../image.png" alt="alt" />
    `;

    const compiledSource = await compile(source, {
      recmaPlugins: [recmaMdxImportMedia],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      import imagepng$recmamdximport from "./image.png";
      import imagepng_1$recmamdximport from "../../image.png";
      function _createMdxContent(props) {
        const _components = {
          img: "img",
          p: "p",
          ...props.components
        };
        return _jsxs(_Fragment, {
          children: [_jsx(_components.p, {
            children: _jsx(_components.img, {
              src: imagepng$recmamdximport,
              alt: "alt"
            })
          }), "\\n", _jsx("img", {
            src: imagepng_1$recmamdximport,
            alt: "alt"
          })]
        });
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? _jsx(MDXLayout, {
          ...props,
          children: _jsx(_createMdxContent, {
            ...props
          })
        }) : _createMdxContent(props);
      }
      "
    `);
  });

  // ******************************************
  it("example in the README, jsx: true", async () => {
    const source = dedent`
      ![alt](./image.png)

      <img src="../../image.png" alt="alt" />
    `;

    const compiledSource = await compile(source, {
      recmaPlugins: [recmaMdxImportMedia],
      jsx: true,
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      import imagepng$recmamdximport from "./image.png";
      import imagepng_1$recmamdximport from "../../image.png";
      function _createMdxContent(props) {
        const _components = {
          img: "img",
          p: "p",
          ...props.components
        };
        return <><_components.p><_components.img src={imagepng$recmamdximport} alt="alt" /></_components.p>{"\\n"}<img src={imagepng_1$recmamdximport} alt="alt" /></>;
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
      }
      "
    `);
  });
});
