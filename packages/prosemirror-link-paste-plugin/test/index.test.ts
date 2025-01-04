import { find } from "linkifyjs";
import { describe, expect, it } from "vitest";
import { createLinkPastePlugin } from "../src/index.js";
import { invalidTestSchema, validTestSchema } from "./helpers.js";

describe("expected behaviour when finding links in text", () => {
  it("should work", () => {
    const links = find("https://www.google.com");
    expect(links.length).toBe(1);
  });

  it("should work with validation", () => {
    const textContent = "https://www.google.com";
    const links = find(textContent, {
      validate(value, type, token) {
        return type === "url" && value === textContent;
      },
    });
    expect(links.length).toBe(1);
  });

  it("should not work if there are extra chars beside URL", () => {
    const textContent = "This is a link https://www.google.com/";
    const links = find(textContent, {
      validate(value, type, token) {
        return type === "url" && value === textContent;
      },
    });
    expect(links.length).toBe(0);
  });
});

describe("link paste plugin", () => {
  it("should throw if the schema is invalid", () => {
    expect(() => {
      return createLinkPastePlugin({
        schema: validTestSchema,
        createLinkMark(href) {
          return validTestSchema.marks.link.create({ href });
        },
      });
    }).not.toThrow();

    expect(() => {
      return createLinkPastePlugin({
        schema: invalidTestSchema,
        createLinkMark(href) {
          // @ts-expect-error - invalid schema
          return invalidTestSchema.marks["link"].create({ href });
        },
      });
    }).toThrow();
  });
});
