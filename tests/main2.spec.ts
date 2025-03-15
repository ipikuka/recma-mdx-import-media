import { compile } from "@mdx-js/mdx";
import dedent from "dedent";

import recmaMdxImportMedia from "../src";

describe("recma-mdx-import-media, output is program", () => {
  const source = dedent`
    ![alt](./image1.png)

    ![alt](./image2.png)

    ![alt]({imgSrc})

    ![alt](/image.png)

    ![alt](image.png)

    <img src="./image1.png" alt="alt" />

    <img src="./image2.png" alt="alt" />

    <img src={imgSrc} alt="alt" />

    <img src="./image.png" alt="alt" />

    <img src="/image.png" alt="alt" />

    <img src="image.png" alt="alt" />
  `;

  // ******************************************
  it("without plugin, output format is program", async () => {
    const compiledSource = await compile(source, {
      outputFormat: "program",
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          img: "img",
          p: "p",
          ...props.components
        };
        return _jsxs(_Fragment, {
          children: [_jsx(_components.p, {
            children: _jsx(_components.img, {
              src: "./image1.png",
              alt: "alt"
            })
          }), "\\n", _jsx(_components.p, {
            children: _jsx(_components.img, {
              src: "./image2.png",
              alt: "alt"
            })
          }), "\\n", _jsx(_components.p, {
            children: _jsx(_components.img, {
              src: "%7BimgSrc%7D",
              alt: "alt"
            })
          }), "\\n", _jsx(_components.p, {
            children: _jsx(_components.img, {
              src: "/image.png",
              alt: "alt"
            })
          }), "\\n", _jsx(_components.p, {
            children: _jsx(_components.img, {
              src: "image.png",
              alt: "alt"
            })
          }), "\\n", _jsx("img", {
            src: "./image1.png",
            alt: "alt"
          }), "\\n", _jsx("img", {
            src: "./image2.png",
            alt: "alt"
          }), "\\n", _jsx("img", {
            src: imgSrc,
            alt: "alt"
          }), "\\n", _jsx("img", {
            src: "./image.png",
            alt: "alt"
          }), "\\n", _jsx("img", {
            src: "/image.png",
            alt: "alt"
          }), "\\n", _jsx("img", {
            src: "image.png",
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
  it("with plugin, output format is program", async () => {
    const compiledSource = await compile(source, {
      outputFormat: "program",
      recmaPlugins: [recmaMdxImportMedia],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      import image1png$recmamdximport from "./image1.png";
      import image2png$recmamdximport from "./image2.png";
      import imagepng$recmamdximport from "./image.png";
      function _createMdxContent(props) {
        const _components = {
          img: "img",
          p: "p",
          ...props.components
        };
        return _jsxs(_Fragment, {
          children: [_jsx(_components.p, {
            children: _jsx(_components.img, {
              src: image1png$recmamdximport,
              alt: "alt"
            })
          }), "\\n", _jsx(_components.p, {
            children: _jsx(_components.img, {
              src: image2png$recmamdximport,
              alt: "alt"
            })
          }), "\\n", _jsx(_components.p, {
            children: _jsx(_components.img, {
              src: "%7BimgSrc%7D",
              alt: "alt"
            })
          }), "\\n", _jsx(_components.p, {
            children: _jsx(_components.img, {
              src: "/image.png",
              alt: "alt"
            })
          }), "\\n", _jsx(_components.p, {
            children: _jsx(_components.img, {
              src: imagepng$recmamdximport,
              alt: "alt"
            })
          }), "\\n", _jsx("img", {
            src: image1png$recmamdximport,
            alt: "alt"
          }), "\\n", _jsx("img", {
            src: image2png$recmamdximport,
            alt: "alt"
          }), "\\n", _jsx("img", {
            src: imgSrc,
            alt: "alt"
          }), "\\n", _jsx("img", {
            src: imagepng$recmamdximport,
            alt: "alt"
          }), "\\n", _jsx("img", {
            src: "/image.png",
            alt: "alt"
          }), "\\n", _jsx("img", {
            src: imagepng$recmamdximport,
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
  it("without plugin, output format is program, jsx is true", async () => {
    const compiledSource = await compile(source, {
      jsx: true,
      outputFormat: "program",
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      function _createMdxContent(props) {
        const _components = {
          img: "img",
          p: "p",
          ...props.components
        };
        return <><_components.p><_components.img src="./image1.png" alt="alt" /></_components.p>{"\\n"}<_components.p><_components.img src="./image2.png" alt="alt" /></_components.p>{"\\n"}<_components.p><_components.img src="%7BimgSrc%7D" alt="alt" /></_components.p>{"\\n"}<_components.p><_components.img src="/image.png" alt="alt" /></_components.p>{"\\n"}<_components.p><_components.img src="image.png" alt="alt" /></_components.p>{"\\n"}<img src="./image1.png" alt="alt" />{"\\n"}<img src="./image2.png" alt="alt" />{"\\n"}<img src={imgSrc} alt="alt" />{"\\n"}<img src="./image.png" alt="alt" />{"\\n"}<img src="/image.png" alt="alt" />{"\\n"}<img src="image.png" alt="alt" /></>;
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
      }
      "
    `);
  });

  // ******************************************
  it("with plugin, output format is program, jsx is true", async () => {
    const compiledSource = await compile(source, {
      jsx: true,
      outputFormat: "program",
      recmaPlugins: [recmaMdxImportMedia],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      import image1png$recmamdximport from "./image1.png";
      import image2png$recmamdximport from "./image2.png";
      import imagepng$recmamdximport from "./image.png";
      function _createMdxContent(props) {
        const _components = {
          img: "img",
          p: "p",
          ...props.components
        };
        return <><_components.p><_components.img src={image1png$recmamdximport} alt="alt" /></_components.p>{"\\n"}<_components.p><_components.img src={image2png$recmamdximport} alt="alt" /></_components.p>{"\\n"}<_components.p><_components.img src="%7BimgSrc%7D" alt="alt" /></_components.p>{"\\n"}<_components.p><_components.img src="/image.png" alt="alt" /></_components.p>{"\\n"}<_components.p><_components.img src={imagepng$recmamdximport} alt="alt" /></_components.p>{"\\n"}<img src={image1png$recmamdximport} alt="alt" />{"\\n"}<img src={image2png$recmamdximport} alt="alt" />{"\\n"}<img src={imgSrc} alt="alt" />{"\\n"}<img src={imagepng$recmamdximport} alt="alt" />{"\\n"}<img src="/image.png" alt="alt" />{"\\n"}<img src={imagepng$recmamdximport} alt="alt" /></>;
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
      }
      "
    `);
  });
});
