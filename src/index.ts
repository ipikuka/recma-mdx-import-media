import type { Plugin } from "unified";
import type { ImportDeclaration, Node, ObjectExpression, Program } from "estree";
import { CONTINUE, EXIT, SKIP, visit } from "estree-util-visit";
import GithubSlugger from "github-slugger";

export type ImportMediaOptions = {
  excludeSyntax?: Array<"markdown" | "html">;
};

const DEFAULT_SETTINGS: ImportMediaOptions = {
  excludeSyntax: [],
};

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
 * This recma plugin turns media paths into imports for both markdown and html syntax in markdown / MDX
 *
 * It is working for only images for now, other assets will be added in next versions
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
      // We are looking for seconsArgument is ObjectExpression

      const firstArgument = node.arguments[0];
      const secondArgument = node.arguments[1];

      let objectExpression: ObjectExpression | undefined;

      if (!settings.excludeSyntax.includes("html")) {
        if (firstArgument.type === "Literal" && firstArgument.value === "img") {
          if (secondArgument.type === "ObjectExpression") {
            objectExpression = secondArgument;
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
              firstArgument.property.name === "img"
            ) {
              if (secondArgument.type === "ObjectExpression") {
                objectExpression = secondArgument;
              }
            }
          }
        }
      }

      if (objectExpression) {
        const propertyWithSrc = objectExpression.properties
          .filter((prop) => prop.type === "Property")
          .find((prop) => "name" in prop.key && prop.key.name === "src");

        if (propertyWithSrc) {
          // we are skipping propertyWithSrc.value.type is Identifier
          if (propertyWithSrc.value.type === "Literal") {
            const path = propertyWithSrc.value.value;

            if (
              typeof path === "string" &&
              !/^[a-z]+:\/\/(?!\/)/i.test(path) && // protocol-like patterns
              !path.startsWith("/") && // root-relative URLs
              !/%7B[^%]+%7D/.test(path) // URL-encoded curly braced identifiers
            ) {
              if (!media[path]) {
                media[path] = `${slugger.slug(path).replace(/-/g, "_")}$recmamdximport`;
              }

              propertyWithSrc.value = { type: "Identifier", name: media[path] };
            }
          }
        }
      }

      return CONTINUE;
    });

    // TODO: make it for jsx components as well
    visit(tree, (node) => {
      if (node.type !== "JSXElement") return CONTINUE;

      if (node.openingElement.name.type === "JSXMemberExpression") {
        const jsxMemberExpression = node.openingElement.name;

        if (
          jsxMemberExpression.object.type === "JSXIdentifier" &&
          jsxMemberExpression.object.name === "_components"
        ) {
          // TODO: move forward
        }
      }

      return CONTINUE;
    });

    // inserts import declarations for the media right before the function "_createMdxContent"
    visit(tree, (node, _, index, ancestors) => {
      if (!index) return;

      /* istanbul ignore next */
      if (ancestors.length !== 1) return SKIP;

      if (node.type !== "FunctionDeclaration") return SKIP;

      // commented out because the first function is always "_createMdxContent"
      // if (node.id.name !== "_createMdxContent") return SKIP;

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
