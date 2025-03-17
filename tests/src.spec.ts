import { compile } from "@mdx-js/mdx";
import dedent from "dedent";

import recmaMdxImportMedia from "../src";

describe("recma-mdx-import-media, src attributes other than <img />", () => {
  const source = dedent`
    <img src="image.png" width="60" height="60" />

    <picture>
      <source media="(min-width:650px)" srcset="image1.jpg" />
      <source media="(min-width:465px)" srcset="image2.jpg" />
      <img src="image.jpg" alt="Flowers" style="width:auto;" />
    </picture>

    <audio controls>
      <source src="audio.ogg" type="audio/ogg" />
      <source src="audio.mp3" type="audio/mpeg" />
    Your browser does not support the audio element.
    </audio>

    <embed type="video/webm" src="video.mp4" />

    <embed type="image/jpg" src="image.jpg" width="60" height="60" />

    <video>
      <source src="video.webm" type="video/webm" />
      <source src="video.mpg" type="video/mp4" />
    Your browser does not support the video element.
    </video>

    <video src="video.webm" poster="video.png">
      <track kind="captions" srclang="en" src="video.vtt" />
    </video>

    <script src="script.js"></script>

    <input type="image" src="button.gif" alt="Submit" width="48" height="48" />
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
          p: "p",
          ...props.components
        };
        return _jsxs(_Fragment, {
          children: [_jsx("img", {
            src: "image.png",
            width: "60",
            height: "60"
          }), "\\n", _jsxs("picture", {
            children: [_jsx("source", {
              media: "(min-width:650px)",
              srcset: "image1.jpg"
            }), _jsx("source", {
              media: "(min-width:465px)",
              srcset: "image2.jpg"
            }), _jsx("img", {
              src: "image.jpg",
              alt: "Flowers",
              style: "width:auto;"
            })]
          }), "\\n", _jsxs("audio", {
            controls: true,
            children: [_jsx("source", {
              src: "audio.ogg",
              type: "audio/ogg"
            }), _jsx("source", {
              src: "audio.mp3",
              type: "audio/mpeg"
            }), _jsx(_components.p, {
              children: "Your browser does not support the audio element."
            })]
          }), "\\n", _jsx("embed", {
            type: "video/webm",
            src: "video.mp4"
          }), "\\n", _jsx("embed", {
            type: "image/jpg",
            src: "image.jpg",
            width: "60",
            height: "60"
          }), "\\n", _jsxs("video", {
            children: [_jsx("source", {
              src: "video.webm",
              type: "video/webm"
            }), _jsx("source", {
              src: "video.mpg",
              type: "video/mp4"
            }), _jsx(_components.p, {
              children: "Your browser does not support the video element."
            })]
          }), "\\n", _jsx("video", {
            src: "video.webm",
            poster: "video.png",
            children: _jsx("track", {
              kind: "captions",
              srclang: "en",
              src: "video.vtt"
            })
          }), "\\n", _jsx("script", {
            src: "script.js"
          }), "\\n", _jsx("input", {
            type: "image",
            src: "button.gif",
            alt: "Submit",
            width: "48",
            height: "48"
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
      import image1jpg$recmamdximport from "./image1.jpg";
      import image2jpg$recmamdximport from "./image2.jpg";
      import imagejpg$recmamdximport from "./image.jpg";
      import audioogg$recmamdximport from "./audio.ogg";
      import audiomp3$recmamdximport from "./audio.mp3";
      import videomp4$recmamdximport from "./video.mp4";
      import videowebm$recmamdximport from "./video.webm";
      import videompg$recmamdximport from "./video.mpg";
      import videopng$recmamdximport from "./video.png";
      import videovtt$recmamdximport from "./video.vtt";
      import scriptjs$recmamdximport from "./script.js";
      import buttongif$recmamdximport from "./button.gif";
      function _createMdxContent(props) {
        const _components = {
          p: "p",
          ...props.components
        };
        return _jsxs(_Fragment, {
          children: [_jsx("img", {
            src: imagepng$recmamdximport,
            width: "60",
            height: "60"
          }), "\\n", _jsxs("picture", {
            children: [_jsx("source", {
              media: "(min-width:650px)",
              srcset: image1jpg$recmamdximport
            }), _jsx("source", {
              media: "(min-width:465px)",
              srcset: image2jpg$recmamdximport
            }), _jsx("img", {
              src: imagejpg$recmamdximport,
              alt: "Flowers",
              style: "width:auto;"
            })]
          }), "\\n", _jsxs("audio", {
            controls: true,
            children: [_jsx("source", {
              src: audioogg$recmamdximport,
              type: "audio/ogg"
            }), _jsx("source", {
              src: audiomp3$recmamdximport,
              type: "audio/mpeg"
            }), _jsx(_components.p, {
              children: "Your browser does not support the audio element."
            })]
          }), "\\n", _jsx("embed", {
            type: "video/webm",
            src: videomp4$recmamdximport
          }), "\\n", _jsx("embed", {
            type: "image/jpg",
            src: imagejpg$recmamdximport,
            width: "60",
            height: "60"
          }), "\\n", _jsxs("video", {
            children: [_jsx("source", {
              src: videowebm$recmamdximport,
              type: "video/webm"
            }), _jsx("source", {
              src: videompg$recmamdximport,
              type: "video/mp4"
            }), _jsx(_components.p, {
              children: "Your browser does not support the video element."
            })]
          }), "\\n", _jsx("video", {
            src: videowebm$recmamdximport,
            poster: videopng$recmamdximport,
            children: _jsx("track", {
              kind: "captions",
              srclang: "en",
              src: videovtt$recmamdximport
            })
          }), "\\n", _jsx("script", {
            src: scriptjs$recmamdximport
          }), "\\n", _jsx("input", {
            type: "image",
            src: buttongif$recmamdximport,
            alt: "Submit",
            width: "48",
            height: "48"
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
          p: "p",
          ...props.components
        };
        return <><img src="image.png" width="60" height="60" />{"\\n"}<picture><source media="(min-width:650px)" srcset="image1.jpg" /><source media="(min-width:465px)" srcset="image2.jpg" /><img src="image.jpg" alt="Flowers" style="width:auto;" /></picture>{"\\n"}<audio controls><source src="audio.ogg" type="audio/ogg" /><source src="audio.mp3" type="audio/mpeg" /><_components.p>{"Your browser does not support the audio element."}</_components.p></audio>{"\\n"}<embed type="video/webm" src="video.mp4" />{"\\n"}<embed type="image/jpg" src="image.jpg" width="60" height="60" />{"\\n"}<video><source src="video.webm" type="video/webm" /><source src="video.mpg" type="video/mp4" /><_components.p>{"Your browser does not support the video element."}</_components.p></video>{"\\n"}<video src="video.webm" poster="video.png"><track kind="captions" srclang="en" src="video.vtt" /></video>{"\\n"}<script src="script.js" />{"\\n"}<input type="image" src="button.gif" alt="Submit" width="48" height="48" /></>;
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
      import image1jpg$recmamdximport from "./image1.jpg";
      import image2jpg$recmamdximport from "./image2.jpg";
      import imagejpg$recmamdximport from "./image.jpg";
      import audioogg$recmamdximport from "./audio.ogg";
      import audiomp3$recmamdximport from "./audio.mp3";
      import videomp4$recmamdximport from "./video.mp4";
      import videowebm$recmamdximport from "./video.webm";
      import videompg$recmamdximport from "./video.mpg";
      import videopng$recmamdximport from "./video.png";
      import videovtt$recmamdximport from "./video.vtt";
      import scriptjs$recmamdximport from "./script.js";
      import buttongif$recmamdximport from "./button.gif";
      function _createMdxContent(props) {
        const _components = {
          p: "p",
          ...props.components
        };
        return <><img src={imagepng$recmamdximport} width="60" height="60" />{"\\n"}<picture><source media="(min-width:650px)" srcset={image1jpg$recmamdximport} /><source media="(min-width:465px)" srcset={image2jpg$recmamdximport} /><img src={imagejpg$recmamdximport} alt="Flowers" style="width:auto;" /></picture>{"\\n"}<audio controls><source src={audioogg$recmamdximport} type="audio/ogg" /><source src={audiomp3$recmamdximport} type="audio/mpeg" /><_components.p>{"Your browser does not support the audio element."}</_components.p></audio>{"\\n"}<embed type="video/webm" src={videomp4$recmamdximport} />{"\\n"}<embed type="image/jpg" src={imagejpg$recmamdximport} width="60" height="60" />{"\\n"}<video><source src={videowebm$recmamdximport} type="video/webm" /><source src={videompg$recmamdximport} type="video/mp4" /><_components.p>{"Your browser does not support the video element."}</_components.p></video>{"\\n"}<video src={videowebm$recmamdximport} poster={videopng$recmamdximport}><track kind="captions" srclang="en" src={videovtt$recmamdximport} /></video>{"\\n"}<script src={scriptjs$recmamdximport} />{"\\n"}<input type="image" src={buttongif$recmamdximport} alt="Submit" width="48" height="48" /></>;
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
