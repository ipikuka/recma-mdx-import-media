import type { Plugin } from "unified";
import type { ImportDeclaration, Node, ObjectExpression, Program } from "estree";
import type { JSXOpeningElement } from "estree-jsx";
import { CONTINUE, EXIT, SKIP, visit } from "estree-util-visit";
import GithubSlugger from "github-slugger";

export type ImportMediaOptions = {
  excludeSyntax?: Array<"markdown" | "html">;
};

const DEFAULT_SETTINGS: ImportMediaOptions = {
  excludeSyntax: [],
};

type TargetTag = "img" | "video" | "audio" | "source" | "embed" | "track" | "input" | "script";

const MapOfTagAttribute: Record<TargetTag, string[]> = {
  img: ["src"],
  video: ["src", "poster"],
  audio: ["src"],
  source: ["src"],
  embed: ["src"],
  track: ["src"],
  input: ["src"],
  script: ["src"],
};

const targetTags = Object.keys(MapOfTagAttribute);

// TODO: handle "srcset" attribute

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

  const isTargetPath = (
    path: string | number | bigint | boolean | RegExp | null | undefined,
  ): path is string =>
    typeof path === "string" &&
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

  return (tree: Node) => {
    const media: Record<string, string> = {};
    const slugger = new GithubSlugger();

    visit(tree, (node) => {
      if (node.type !== "CallExpression") return CONTINUE;

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
          targetTags.includes(firstArgument.value)
        ) {
          if (secondArgument.type === "ObjectExpression") {
            objectExpression = secondArgument;
            currentTag = firstArgument.value as TargetTag;
          }
        }
      }

      if (!settings.excludeSyntax.includes("markdown")) {
        if (firstArgument.type === "MemberExpression") {
          if (
            firstArgument.object.type === "Identifier" &&
            firstArgument.object.name === "_components"
          ) {
            if (
              firstArgument.property.type === "Identifier" &&
              targetTags.includes(firstArgument.property.name)
            ) {
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
              "name" in property.key &&
              MapOfTagAttribute[currentTag].includes(property.key.name),
          );

        properties.forEach((property) => {
          // we are skipping "property.value.type" is Identifier
          if (property.value.type === "Literal") {
            const value = property.value.value;

            if (isTargetPath(value)) {
              const [path, meta] = getPath(value);

              if (!media[path]) {
                media[path] = `${slugger.slug(path).replace(/-/g, "_")}$recmamdximport`;
              }

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

      if (node.openingElement.name.type === "JSXMemberExpression") {
        const jsxMemberExpression = node.openingElement.name;

        if (
          jsxMemberExpression.object.type === "JSXIdentifier" &&
          jsxMemberExpression.object.name === "_components" &&
          jsxMemberExpression.property.type === "JSXIdentifier" &&
          targetTags.includes(jsxMemberExpression.property.name)
        ) {
          openingElement = node.openingElement;
          currentTag = jsxMemberExpression.property.name as TargetTag;
        }
      } else if (node.openingElement.name.type === "JSXIdentifier") {
        const jsxIdentifier = node.openingElement.name;

        if (targetTags.includes(jsxIdentifier.name)) {
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
              MapOfTagAttribute[currentTag].includes(attr.name.name),
          );

        jsxAttributes.forEach((jsxAttribute) => {
          // we are skipping "jsxAttribute.value.type" is JSXSomething..
          if (jsxAttribute.value?.type === "Literal") {
            const value = jsxAttribute.value.value;

            if (isTargetPath(value)) {
              const [path, meta] = getPath(value);

              if (!media[path]) {
                media[path] = `${slugger.slug(path).replace(/-/g, "_")}$recmamdximport`;
              }

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
