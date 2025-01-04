import { Schema } from "prosemirror-model";

export const invalidTestSchema = new Schema({
  nodes: {
    doc: { content: "block+" },
    p: {
      content: "inline*",
      group: "block",
      toDOM: () => ["p"],
      parseDOM: [{ tag: "p" }],
    },
    text: { group: "inline" },
  },
});

export const validTestSchema = new Schema({
  nodes: {
    doc: { content: "block+" },
    p: {
      content: "inline*",
      group: "block",
      toDOM: () => ["p"],
      parseDOM: [{ tag: "p" }],
    },
    text: { group: "inline" },
  },
  marks: {
    link: {
      attrs: {
        href: {},
      },
      inclusive: false,
      parseDOM: [
        {
          tag: "a[href]",
          getAttrs(dom) {
            return {
              href: (dom as HTMLElement).getAttribute("href"),
            };
          },
        },
      ],
      toDOM(node) {
        return ["a", node.attrs];
      },
    },
  },
});
