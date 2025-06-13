import type { Plugin } from "unified";
import type {
  Expression,
  Identifier,
  ImportDeclaration,
  Node,
  ObjectExpression,
  Program,
  TemplateElement,
} from "estree";
import type { JSXIdentifier, JSXOpeningElement } from "estree-jsx";
import { CONTINUE, EXIT, SKIP, visit } from "estree-util-visit";
import GithubSlugger from "github-slugger";
import parseSrcset from "parse-srcset";

export type ImportMediaOptions = {
  excludeSyntax?: Array<"markdown" | "html">;
};

const DEFAULT_SETTINGS: ImportMediaOptions = {
  excludeSyntax: [],
};

type TargetTag = "img" | "video" | "audio" | "source" | "embed" | "track" | "input" | "script";

const MapOfTagAttribute: Record<TargetTag, string[]> = {
  img: ["src", "srcset"],
  video: ["src", "poster"],
  audio: ["src"],
  source: ["src", "srcset"],
  embed: ["src"],
  track: ["src"],
  input: ["src"],
  script: ["src"],
};

const targetTags = Object.keys(MapOfTagAttribute);

/**
 *
 * compose import declarations for media
 *
 */
function composeImportDeclarations(media: Record<string, string>): ImportDeclaration[] {
  return Object.entries(media).map(([path, name]) => ({
    type: "ImportDeclaration",
    specifiers: [
      {
        type: "ImportDefaultSpecifier",
        local: { type: "Identifier", name },
      },
    ],
    source: { type: "Literal", value: path },
    attributes: [],
  }));
}

/**
 * It is a recma plugin which transforms the esAST / esTree.
 *
 * This recma plugin turns media relative paths into imports for both markdown and html syntax in markdown / MDX
 *
 * "srcset" is not handled yet, it will be added in the next versions !
 *
 */
const plugin: Plugin<[ImportMediaOptions?], Program> = (options) => {
  const settings = Object.assign({}, DEFAULT_SETTINGS, options) as Required<ImportMediaOptions>;

  return (tree: Node) => {
    const media: Record<string, string> = {};
    const slugger = new GithubSlugger();

    const slug = (path: string) => `${slugger.slug(path).replace(/-/g, "_")}$recmamdximport`;

    const isTargetPath = (path: string): boolean =>
      !/^[a-z]+:\/\/(?!\/)/i.test(path) && // protocol-like patterns
      !path.startsWith("/") && // root-relative URLs
      !/%7B[^%]+%7D/.test(path); // URL-encoded curly braced identifiers

    function getPath(value: string): [string, string] {
      value = value.startsWith(".") ? value : `./${value}`;

      const hashIndex = value.indexOf("#");
      const queryIndex = value.indexOf("?");

      let minIndex: number;
      if (hashIndex === -1) {
        minIndex = queryIndex;
      } else if (queryIndex === -1) {
        minIndex = hashIndex;
      } else {
        minIndex = Math.min(hashIndex, queryIndex);
      }

      const meta = minIndex === -1 ? "" : value.slice(minIndex);
      const path = minIndex === -1 ? value : value.slice(0, minIndex);

      return [path, meta];
    }

    visit(tree, (node) => {
      if (node.type !== "CallExpression") return CONTINUE;

      /* istanbul ignore if */
      if ("name" in node.callee) {
        if (
          node.callee.name !== "_jsx" &&
          node.callee.name !== "_jsxDEV" &&
          node.callee.name !== "_jsxs"
        ) {
          return;
        }
      }

      // A CallExpression has two arguments
      // We are looking for firstArgument is Literal or MemberExpression
      //                    secondArgument is ObjectExpression

      const firstArgument = node.arguments[0];
      const secondArgument = node.arguments[1];

      let objectExpression: ObjectExpression | undefined;
      let currentTag: TargetTag;

      if (!settings.excludeSyntax.includes("html")) {
        if (
          firstArgument.type === "Literal" &&
          typeof firstArgument.value === "string" &&
          targetTags.includes(firstArgument.value.toLowerCase())
        ) {
          /* istanbul ignore if */
          if (secondArgument.type === "ObjectExpression") {
            objectExpression = secondArgument;
            currentTag = firstArgument.value as TargetTag;
          }
        }
      }

      if (!settings.excludeSyntax.includes("markdown")) {
        if (firstArgument.type === "MemberExpression") {
          /* istanbul ignore if */
          if (
            firstArgument.object.type === "Identifier" &&
            firstArgument.object.name === "_components"
          ) {
            if (
              firstArgument.property.type === "Identifier" &&
              targetTags.includes(firstArgument.property.name.toLowerCase())
            ) {
              /* istanbul ignore if */
              if (secondArgument.type === "ObjectExpression") {
                objectExpression = secondArgument;
                currentTag = firstArgument.property.name as TargetTag;
              }
            }
          }
        }
      }

      if (objectExpression) {
        const properties = objectExpression.properties
          .filter((property) => property.type === "Property")
          .filter(
            (property) =>
              property.key.type === "Identifier" &&
              MapOfTagAttribute[currentTag].includes(property.key.name.toLowerCase()),
          );

        properties.forEach((property) => {
          const propertyName = (property.key as Identifier).name;

          // Skip if "property.value.type" is Identifier
          if (property.value.type !== "Literal") return;

          const propertyValue = property.value.value;
          /* istanbul ignore next */
          if (typeof propertyValue !== "string") return;

          if (propertyName === "srcset") {
            const srcset = parseSrcset(propertyValue);

            // Special case: Only one relative path in srcset without meta data
            if (srcset.length === 1 && isTargetPath(srcset[0].url)) {
              const [path] = getPath(srcset[0].url);
              const url = srcset[0].url.startsWith(".") ? srcset[0].url : `./${srcset[0].url}`;

              /* istanbul ignore if */
              if (url === path) {
                media[path] ??= slug(path);
                property.value = { type: "Identifier", name: media[path] };

                return;
              }
            }

            // Generate template literals for srcset
            const expressions: Expression[] = [];
            const quasis: TemplateElement[] = [];
            let raw = "";

            srcset.forEach((src, index) => {
              if (isTargetPath(src.url)) {
                const [path, meta] = getPath(src.url);
                media[path] ??= slug(path);

                quasis.push({ type: "TemplateElement", tail: false, value: { raw } });
                expressions.push({ type: "Identifier", name: media[path] });
                raw = meta;
              } else {
                raw += src.url;
              }

              if (src.d) raw += ` ${src.d}x`;
              if (src.w) raw += ` ${src.w}w`;
              if (src.h) raw += ` ${src.h}h`;
              if (index < srcset.length - 1) raw += ", ";
            });

            if (expressions.length) {
              quasis.push({ type: "TemplateElement", tail: true, value: { raw } });
              property.value = { type: "TemplateLiteral", expressions, quasis };
            }
          } else if (isTargetPath(propertyValue)) {
            const [path, meta] = getPath(propertyValue);
            media[path] ??= slug(path);

            property.value = { type: "Identifier", name: media[path] };

            if (meta) {
              objectExpression.properties.push({
                type: "Property",
                key: { type: "Identifier", name: "data-meta" },
                value: { type: "Literal", value: meta },
                kind: "init",
                method: false,
                shorthand: false,
                computed: false,
              });
            }
          }
        });
      }

      return CONTINUE;
    });

    // make it for { jsx: true } as well
    visit(tree, (node) => {
      if (node.type !== "JSXElement") return CONTINUE;

      let openingElement: JSXOpeningElement | undefined;
      let currentTag: TargetTag;

      /* istanbul ignore else */
      if (node.openingElement.name.type === "JSXMemberExpression") {
        const jsxMemberExpression = node.openingElement.name;

        if (
          jsxMemberExpression.object.type === "JSXIdentifier" &&
          jsxMemberExpression.object.name === "_components" &&
          jsxMemberExpression.property.type === "JSXIdentifier" &&
          targetTags.includes(jsxMemberExpression.property.name.toLowerCase())
        ) {
          openingElement = node.openingElement;
          currentTag = jsxMemberExpression.property.name as TargetTag;
        }
      } else if (node.openingElement.name.type === "JSXIdentifier") {
        const jsxIdentifier = node.openingElement.name;

        if (targetTags.includes(jsxIdentifier.name.toLowerCase())) {
          openingElement = node.openingElement;
          currentTag = jsxIdentifier.name as TargetTag;
        }
      }

      if (openingElement) {
        const jsxAttributes = openingElement.attributes
          .filter((attr) => attr.type === "JSXAttribute")
          .filter(
            (attr) =>
              attr.name.type === "JSXIdentifier" &&
              MapOfTagAttribute[currentTag].includes(attr.name.name.toLowerCase()),
          );

        jsxAttributes.forEach((jsxAttribute) => {
          const attributeName = (jsxAttribute.name as JSXIdentifier).name;

          // Skip if "jsxAttribute.value.type" is JSXSomething..
          if (jsxAttribute.value?.type !== "Literal") return;

          const attributeValue = jsxAttribute.value.value;
          /* istanbul ignore next */
          if (typeof attributeValue !== "string") return;

          if (attributeName === "srcset") {
            const srcset = parseSrcset(attributeValue);

            // Special case: Only one relative path in srcset without meta data
            if (srcset.length === 1 && isTargetPath(srcset[0].url)) {
              const [path] = getPath(srcset[0].url);
              const url = srcset[0].url.startsWith(".") ? srcset[0].url : `./${srcset[0].url}`;

              /* istanbul ignore if */
              if (url === path) {
                media[path] ??= slug(path);

                jsxAttribute.value = {
                  type: "JSXExpressionContainer",
                  expression: { type: "Identifier", name: media[path] },
                };

                return;
              }
            }

            // Generate template literals for srcset
            const expressions: Expression[] = [];
            const quasis: TemplateElement[] = [];
            let raw = "";

            srcset.forEach((src, index) => {
              if (isTargetPath(src.url)) {
                const [path, meta] = getPath(src.url);
                media[path] ??= slug(path);

                quasis.push({ type: "TemplateElement", tail: false, value: { raw } });
                expressions.push({ type: "Identifier", name: media[path] });
                raw = meta;
              } else {
                raw += src.url;
              }

              if (src.d) raw += ` ${src.d}x`;
              if (src.w) raw += ` ${src.w}w`;
              if (src.h) raw += ` ${src.h}h`;
              if (index < srcset.length - 1) raw += ", ";
            });

            if (expressions.length) {
              quasis.push({ type: "TemplateElement", tail: true, value: { raw } });

              jsxAttribute.value = {
                type: "JSXExpressionContainer",
                expression: { type: "TemplateLiteral", expressions, quasis },
              };
            }
          } else if (isTargetPath(attributeValue)) {
            const [path, meta] = getPath(attributeValue);
            media[path] ??= slug(path);

            jsxAttribute.value = {
              type: "JSXExpressionContainer",
              expression: { type: "Identifier", name: media[path] },
            };

            if (meta) {
              openingElement.attributes.push({
                type: "JSXAttribute",
                name: { type: "JSXIdentifier", name: "data-meta" },
                value: { type: "Literal", value: meta },
              });
            }
          }
        });
      }

      return CONTINUE;
    });

    // inserts import declarations for the media right before the function "_createMdxContent"
    visit(tree, (node, _, index, ancestors) => {
      if (index === undefined) return;

      /* istanbul ignore next */
      if (ancestors.length !== 1) return SKIP;

      if (node.type !== "FunctionDeclaration") return SKIP;

      /* istanbul ignore next */
      if (node.id.name !== "_createMdxContent") return SKIP;

      /* istanbul ignore if */
      if (tree.type === "Program") {
        tree["body"].splice(index, 0, ...composeImportDeclarations(media));

        return EXIT;
      }

      /* istanbul ignore next */
      return CONTINUE;
    });

    slugger.reset();
    Object.assign(media, {});
  };
};

export default plugin;
