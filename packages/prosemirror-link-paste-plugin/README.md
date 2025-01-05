# `@sadn1ck/prosemirror-link-paste-plugin`

Plugin that allows users to paste links into the editor and have it converted to a link mark per the schema

## Usage

Use it like a regular ProseMirror plugin. Make sure to define a link mark in your schema, and modify the `createLinkMark` function to return the link mark as per your schema.

```ts
const pmSchema = new Schema({
  nodes: {
    // ...
    text: { group: "inline" },
  },
  marks: {
    // see: https://github.com/ProseMirror/prosemirror-markdown/blob/master/src/schema.ts#L138-L148
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
              href: dom.getAttribute("href"),
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

// ...

const state = EditorState.create({
  schema: pmSchema,
  plugins: [
    // ...
    createLinkPastePlugin({
      schema: pmSchema,
      // should return the link mark in YOUR schema
      createLinkMark: (href) => pmSchema.marks.link.create({ href }),
    }),
  ],
});
```

Now, when you paste a link into the editor, it will be converted to a link mark.

> Click behaviour would depend on your application itself, but you can most likely add a click handler in a separate plugin (`plugin.props.handleClick`) to handle opening links in a new tab.
