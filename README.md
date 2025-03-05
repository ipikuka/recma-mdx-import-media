# recma-mdx-import-media

[![npm version][badge-npm-version]][url-npm-package]
[![npm downloads][badge-npm-download]][url-npm-package]
[![publish to npm][badge-publish-to-npm]][url-publish-github-actions]
[![code-coverage][badge-codecov]][url-codecov]
[![type-coverage][badge-type-coverage]][url-github-package]
[![typescript][badge-typescript]][url-typescript]
[![license][badge-license]][url-license]

This package is a **[unified][unified]** (**[recma][recma]**) plugin **that turns media relative paths into import declarations for both markdown and html syntax in MDX**

**[unified][unified]** is a project that transforms content with abstract syntax trees (ASTs) using the new parser **[micromark][micromark]**. **[recma][recma]** adds support for producing a javascript code by transforming **[esast][esast]** which stands for Ecma Script Abstract Syntax Tree (AST) that is used in production of compiled source for the **[MDX][MDX]**.

## When should I use this?

**`recma-mdx-import-media`** is working **for only images for now**, other assets will be added in next versions !

If you're working with MDX and want to include **media/asset with relative path** using **markdown syntax**, without providing an import statement, such as:

```markdown
![alt](./image.png)

![alt](../blog-assets/image.png)
```

If you're working with MDX and want to include **media/asset with relative path** using **html syntax**, without providing an import statement, such as:

```markdown
<img src="./image.png" alt="alt" />

<img src="../blog-assets/image.png" alt="alt" />
```

Because, **`recma-mdx-import-media`** creates *import statements* and assign the *identifier* into proper element in the compiled source.

**`recma-mdx-import-media`** only processes relative paths (starts with `./` or `../`); leaving protocol-like patterns (like `http://`), root-relative URLs (like `/pathname`), and absolute paths (`file:///`) unchanged.

You might run into issues because bundlers like Webpack and Vite don't natively recognize these references (.png, .jpeg etc.)—they only handle imports. **`recma-mdx-import-media`** bridges that gap by converting media relative references into import declarations in compiled MDX source, ensuring bundlers can process them correctly, for both **markdown** and **HTML** syntax.

## Installation

This package is suitable for ESM only. In Node.js (version 18+), install with npm:

```bash
npm install recma-mdx-import-media
```

or

```bash
yarn add recma-mdx-import-media
```

## Usage

Say we have the following file, `example.mdx`,

```mdx
![alt](./image.png)

<img src="../../image.png" alt="alt" />
```

And our module, `example.js`, looks as follows:

```javascript
import { read } from "to-vfile";
import { compile } from "@mdx-js/mdx";
import recmaMdxImportMedia from "recma-mdx-import-media";

main();

async function main() {
  const source = await read("example.mdx");

  const compiledSource = await compile(source, {
    recmaPlugins: [recmaMdxImportMedia],
  });

  return String(compiledSource);
}
```

Now, running `node example.js` produces the `compiled source` like below:

```diff
// ...
+ import imagepng$recmamdximport from "./image.png";
+ import imagepng_1$recmamdximport from "../../image.png";
function _createMdxContent(props) {
  const _components = {
    img: "img",
    p: "p",
    ...props.components
  };
  return _jsxs(_Fragment, {
    children: [_jsx(_components.p, {
      children: _jsx(_components.img, {
-        src: "./image.png",
+        src: imagepng$recmamdximport,
        alt: "alt"
      })
    }), "\\n", _jsx("img", {
-      src: "../../image.png",
+      src: imagepng_1$recmamdximport,
      alt: "alt"
    })]
  });
}
// ...
```

## Options

All options are optional.

```typescript
export type ImportMediaOptions = {
  excludeSyntax?: Array<"markdown" | "html">; // default is empty array []
};
```

### excludeSyntax

It is an **array** option to exlude markdown or html syntax or both. The option are self-explainotary.

```javascript
use(recmaMdxImportMedia, { excludeSyntax: ["html"] } as ImportMediaOptions);
```
Now, **`<img />`** like **html syntax** will be excluded.

```javascript
use(recmaMdxImportMedia, { excludeSyntax: ["markdown"] } as ImportMediaOptions);
```
Now, **`![]())`** like **markdown syntax** will be excluded.

```javascript
use(recmaMdxImportMedia, { excludeSyntax: ["html", "markdown"] } as ImportMediaOptions);
```
Now, both **html and markdown syntax** will be excluded. **The plugin becomes effectless.**

## Syntax tree

This plugin only modifies the ESAST (Ecma Script Abstract Syntax Tree) as explained.

## Types

This package is fully typed with [TypeScript][url-typescript]. The plugin options is exported as `ImportMediaOptions`.

## Compatibility

This plugin works with `unified` version 6+. It is compatible with `mdx` version 3+.

## Security

Use of `recma-mdx-import-media` does not involve user content so there are no openings for cross-site scripting (XSS) attacks.

## My Plugins

I like to contribute the Unified / Remark / MDX ecosystem, so I recommend you to have a look my plugins.

### My Remark Plugins

- [`remark-flexible-code-titles`](https://www.npmjs.com/package/remark-flexible-code-titles)
  – Remark plugin to add titles or/and containers for the code blocks with customizable properties
- [`remark-flexible-containers`](https://www.npmjs.com/package/remark-flexible-containers)
  – Remark plugin to add custom containers with customizable properties in markdown
- [`remark-ins`](https://www.npmjs.com/package/remark-ins)
  – Remark plugin to add `ins` element in markdown
- [`remark-flexible-paragraphs`](https://www.npmjs.com/package/remark-flexible-paragraphs)
  – Remark plugin to add custom paragraphs with customizable properties in markdown
- [`remark-flexible-markers`](https://www.npmjs.com/package/remark-flexible-markers)
  – Remark plugin to add custom `mark` element with customizable properties in markdown
- [`remark-flexible-toc`](https://www.npmjs.com/package/remark-flexible-toc)
  – Remark plugin to expose the table of contents via `vfile.data` or via an option reference
- [`remark-mdx-remove-esm`](https://www.npmjs.com/package/remark-mdx-remove-esm)
  – Remark plugin to remove import and/or export statements (mdxjsEsm)

### My Rehype Plugins

- [`rehype-pre-language`](https://www.npmjs.com/package/rehype-pre-language)
  – Rehype plugin to add language information as a property to `pre` element
- [`rehype-highlight-code-lines`](https://www.npmjs.com/package/rehype-highlight-code-lines)
  – Rehype plugin to add line numbers to code blocks and allow highlighting of desired code lines

### My Recma Plugins

- [`recma-mdx-escape-missing-components`](https://www.npmjs.com/package/recma-mdx-escape-missing-components)
  – Recma plugin to set the default value `() => null` for the Components in MDX in case of missing or not provided so as not to throw an error
- [`recma-mdx-change-props`](https://www.npmjs.com/package/recma-mdx-change-props)
  – Recma plugin to change the `props` parameter into the `_props` in the `function _createMdxContent(props) {/* */}` in the compiled source in order to be able to use `{props.foo}` like expressions. It is useful for the `next-mdx-remote` or `next-mdx-remote-client` users in `nextjs` applications.
- [`recma-mdx-change-imports`](https://www.npmjs.com/package/recma-mdx-change-imports)
  – Recma plugin to convert import declarations for assets and media with relative links into variable declarations with string URLs, enabling direct asset URL resolution in compiled MDX.
- [`recma-mdx-import-media`](https://www.npmjs.com/package/recma-mdx-import-media)
  – Recma plugin to turn media relative paths into import declarations for both markdown and html syntax in MDX.

## License

[MIT License](./LICENSE) © ipikuka

[unified]: https://github.com/unifiedjs/unified
[micromark]: https://github.com/micromark/micromark
[recma]: https://mdxjs.com/docs/extending-mdx/#list-of-plugins
[esast]: https://github.com/syntax-tree/esast
[estree]: https://github.com/estree/estree
[MDX]: https://mdxjs.com/

[badge-npm-version]: https://img.shields.io/npm/v/recma-mdx-import-media
[badge-npm-download]:https://img.shields.io/npm/dt/recma-mdx-import-media
[url-npm-package]: https://www.npmjs.com/package/recma-mdx-import-media
[url-github-package]: https://github.com/ipikuka/recma-mdx-import-media

[badge-license]: https://img.shields.io/github/license/ipikuka/recma-mdx-import-media
[url-license]: https://github.com/ipikuka/recma-mdx-import-media/blob/main/LICENSE

[badge-publish-to-npm]: https://github.com/ipikuka/recma-mdx-import-media/actions/workflows/publish.yml/badge.svg
[url-publish-github-actions]: https://github.com/ipikuka/recma-mdx-import-media/actions/workflows/publish.yml

[badge-typescript]: https://img.shields.io/npm/types/recma-mdx-import-media
[url-typescript]: https://www.typescriptlang.org/

[badge-codecov]: https://codecov.io/gh/ipikuka/recma-mdx-import-media/graph/badge.svg?token=0gyxyIrEKs
[url-codecov]: https://codecov.io/gh/ipikuka/recma-mdx-import-media

[badge-type-coverage]: https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fipikuka%2Frecma-mdx-import-media%2Fmaster%2Fpackage.json
