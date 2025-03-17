import { compile } from "@mdx-js/mdx";
import dedent from "dedent";

import recmaMdxImportMedia from "../src";

describe("recma-mdx-import-media, path and meta", () => {
  const source = dedent`
    ![](image.png#hash)

    ![](../image.png#hash?size=16)

    ![](image.png?size=16)

    ![](../image.png?size=16#hash)

    <img src="image.png#hash" />

    <img src="../image.png#hash?size=16" />

    <img src="?size=16" />

    <img src="../image.png?size=16#hash" />
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
        const _components = {
          img: "img",
          p: "p",
          ...props.components
        };
        return _jsxs(_Fragment, {
          children: [_jsx(_components.p, {
            children: _jsx(_components.img, {
              src: "image.png#hash",
              alt: ""
            })
          }), "\\n", _jsx(_components.p, {
            children: _jsx(_components.img, {
              src: "../image.png#hash?size=16",
              alt: ""
            })
          }), "\\n", _jsx(_components.p, {
            children: _jsx(_components.img, {
              src: "image.png?size=16",
              alt: ""
            })
          }), "\\n", _jsx(_components.p, {
            children: _jsx(_components.img, {
              src: "../image.png?size=16#hash",
              alt: ""
            })
          }), "\\n", _jsx("img", {
            src: "image.png#hash"
          }), "\\n", _jsx("img", {
            src: "../image.png#hash?size=16"
          }), "\\n", _jsx("img", {
            src: "?size=16"
          }), "\\n", _jsx("img", {
            src: "../image.png?size=16#hash"
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
      import imagepng$recmamdximport from "./image.png";
      import imagepng_1$recmamdximport from "../image.png";
      import $recmamdximport from "./";
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
              alt: "",
              data-meta: "#hash"
            })
          }), "\\n", _jsx(_components.p, {
            children: _jsx(_components.img, {
              src: imagepng_1$recmamdximport,
              alt: "",
              data-meta: "#hash?size=16"
            })
          }), "\\n", _jsx(_components.p, {
            children: _jsx(_components.img, {
              src: imagepng$recmamdximport,
              alt: "",
              data-meta: "?size=16"
            })
          }), "\\n", _jsx(_components.p, {
            children: _jsx(_components.img, {
              src: imagepng_1$recmamdximport,
              alt: "",
              data-meta: "?size=16#hash"
            })
          }), "\\n", _jsx("img", {
            src: imagepng$recmamdximport,
            data-meta: "#hash"
          }), "\\n", _jsx("img", {
            src: imagepng_1$recmamdximport,
            data-meta: "#hash?size=16"
          }), "\\n", _jsx("img", {
            src: $recmamdximport,
            data-meta: "?size=16"
          }), "\\n", _jsx("img", {
            src: imagepng_1$recmamdximport,
            data-meta: "?size=16#hash"
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
        const _components = {
          img: "img",
          p: "p",
          ...props.components
        };
        return <><_components.p><_components.img src="image.png#hash" alt="" /></_components.p>{"\\n"}<_components.p><_components.img src="../image.png#hash?size=16" alt="" /></_components.p>{"\\n"}<_components.p><_components.img src="image.png?size=16" alt="" /></_components.p>{"\\n"}<_components.p><_components.img src="../image.png?size=16#hash" alt="" /></_components.p>{"\\n"}<img src="image.png#hash" />{"\\n"}<img src="../image.png#hash?size=16" />{"\\n"}<img src="?size=16" />{"\\n"}<img src="../image.png?size=16#hash" /></>;
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
      import imagepng$recmamdximport from "./image.png";
      import imagepng_1$recmamdximport from "../image.png";
      import $recmamdximport from "./";
      function _createMdxContent(props) {
        const _components = {
          img: "img",
          p: "p",
          ...props.components
        };
        return <><_components.p><_components.img src={imagepng$recmamdximport} alt="" data-meta="#hash" /></_components.p>{"\\n"}<_components.p><_components.img src={imagepng_1$recmamdximport} alt="" data-meta="#hash?size=16" /></_components.p>{"\\n"}<_components.p><_components.img src={imagepng$recmamdximport} alt="" data-meta="?size=16" /></_components.p>{"\\n"}<_components.p><_components.img src={imagepng_1$recmamdximport} alt="" data-meta="?size=16#hash" /></_components.p>{"\\n"}<img src={imagepng$recmamdximport} data-meta="#hash" />{"\\n"}<img src={imagepng_1$recmamdximport} data-meta="#hash?size=16" />{"\\n"}<img src={$recmamdximport} data-meta="?size=16" />{"\\n"}<img src={imagepng_1$recmamdximport} data-meta="?size=16#hash" /></>;
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
