import { find } from "linkifyjs";
import type { Mark, Schema, Slice } from "prosemirror-model";
import { Plugin, PluginKey } from "prosemirror-state";

export const linkPastePluginKey = new PluginKey(
  "prosemirror-link-paste-plugin"
);

type LinkPastePluginOptions = {
  /**
   * The schema for this editor instance this plugin is being used in.
   */
  schema: Schema;

  /**
   * Factory function to create a link mark.
   */
  createLinkMark: (href: string) => Mark;

  /**
   * A callback function that is called when a link is pasted successfully.
   */
  onPasteSuccess?: () => void;

  /**
   * A callback function that is called when a link is pasted unsuccessfully.
   */
  onPasteFailure?: (cause?: string) => void;
};

/**
 * Creates a plugin that allows users to paste links into the editor.
 *
 * @param {LinkPastePluginOptions} options - The options for the plugin.
 * @returns Plugin that allows users to paste links into the editor and have it converted to a link mark per the schema.
 */
export function createLinkPastePlugin(options: LinkPastePluginOptions): Plugin {
  const { schema, createLinkMark, onPasteSuccess, onPasteFailure } = options;

  try {
    // test run during init to make sure the schema is valid
    createLinkMark("https://google.com");
  } catch (error) {
    throw new Error("Schema must have a link mark");
  }

  return new Plugin({
    key: linkPastePluginKey,
    props: {
      handlePaste: (view, event, slice) => {
        try {
          let textContent = constructStringFromSlice(slice);

          const [link] = find(textContent, {
            validate(value, type) {
              return type === "url" && value === textContent;
            },
          });

          if (!link || !link.href || !link.isLink) {
            throw new Error("No link found in text");
          }

          const newLinkMark = createLinkMark(link.href);
          const tr = view.state.tr;
          const selection = view.state.selection;

          if (selection.empty) {
            // if there is no selection, we want to have the link as a mark
            // over the URL as text
            textContent = link.href;
            const node = schema.text(textContent, [newLinkMark]);
            tr.insert(selection.from, node);
          } else {
            // if there is a selection, we want to have the link as a mark
            // over the selection
            tr.addMark(selection.from, selection.to, newLinkMark);
          }

          // mark transaction in case we need to filter/modify
          tr.setMeta(linkPastePluginKey, {
            href: link.href,
            text: textContent,
          });

          view.dispatch(tr);

          onPasteSuccess?.();

          return true;
        } catch (error) {
          onPasteFailure?.(error instanceof Error ? error.message : undefined);
        }
      },
    },
  });
}

// utils
function constructStringFromSlice(slice: Slice): string {
  let textContent = "";

  slice.content.forEach((node) => {
    textContent += node.textContent;
  });

  return textContent;
}
