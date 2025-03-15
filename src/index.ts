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

// TODO: handle srcset attributes
// TODO: handle query and hashes in the paths

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
 * It is working for only "src" attributes for now, "srcset" will be added in the next versions !
 *
 */
const plugin: Plugin<[ImportMediaOptions?], Program> = (options) => {
  const settings = Object.assign({}, DEFAULT_SETTINGS, options) as Required<ImportMediaOptions>;

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
            let path = property.value.value;

            if (
              typeof path === "string" &&
              !/^[a-z]+:\/\/(?!\/)/i.test(path) && // protocol-like patterns
              !path.startsWith("/") && // root-relative URLs
              !/%7B[^%]+%7D/.test(path) // URL-encoded curly braced identifiers
            ) {
              if (!path.startsWith(".")) path = "./" + path;

              if (!media[path]) {
                media[path] = `${slugger.slug(path).replace(/-/g, "_")}$recmamdximport`;
              }

              property.value = { type: "Identifier", name: media[path] };
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
            let path = jsxAttribute.value.value;

            if (
              typeof path === "string" &&
              !/^[a-z]+:\/\/(?!\/)/i.test(path) && // protocol-like patterns
              !path.startsWith("/") && // root-relative URLs
              !/%7B[^%]+%7D/.test(path) // URL-encoded curly braced identifiers
            ) {
              if (!path.startsWith(".")) path = "./" + path;

              if (!media[path]) {
                media[path] = `${slugger.slug(path).replace(/-/g, "_")}$recmamdximport`;
              }

              jsxAttribute.value = {
                type: "JSXExpressionContainer",
                expression: { type: "Identifier", name: media[path] },
              };
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
