/**
 * Unit tests for utility functions
 */

import { describe, it, expect } from "vitest";
import { markdownToBBCode, convertFieldsToBBCode } from "../src/utils.js";

describe("markdownToBBCode", () => {
  describe("basic formatting", () => {
    it("should handle null and undefined", () => {
      expect(markdownToBBCode(null)).toBe(null);
      expect(markdownToBBCode(undefined)).toBe(undefined);
    });

    it("should handle empty string", () => {
      expect(markdownToBBCode("")).toBe("");
    });

    it("should pass through plain text unchanged", () => {
      expect(markdownToBBCode("Hello world")).toBe("Hello world");
    });
  });

  describe("headers", () => {
    it("should convert H1", () => {
      expect(markdownToBBCode("# Header 1")).toBe("[h1]Header 1[/h1]");
    });

    it("should convert H2", () => {
      expect(markdownToBBCode("## Header 2")).toBe("[h2]Header 2[/h2]");
    });

    it("should convert H3", () => {
      expect(markdownToBBCode("### Header 3")).toBe("[h3]Header 3[/h3]");
    });

    it("should convert H4", () => {
      expect(markdownToBBCode("#### Header 4")).toBe("[h4]Header 4[/h4]");
    });

    it("should handle multiple headers", () => {
      const input = "# Title\n## Section\n### Subsection";
      const expected = "[h1]Title[/h1]\n[h2]Section[/h2]\n[h3]Subsection[/h3]";
      expect(markdownToBBCode(input)).toBe(expected);
    });
  });

  describe("text formatting", () => {
    it("should convert bold with **", () => {
      expect(markdownToBBCode("**bold text**")).toBe("[b]bold text[/b]");
    });

    it("should convert bold with __", () => {
      expect(markdownToBBCode("__bold text__")).toBe("[b]bold text[/b]");
    });

    it("should convert italic with *", () => {
      expect(markdownToBBCode("*italic text*")).toBe("[i]italic text[/i]");
    });

    it("should convert italic with _", () => {
      expect(markdownToBBCode("_italic text_")).toBe("[i]italic text[/i]");
    });

    it("should convert strikethrough", () => {
      expect(markdownToBBCode("~~strikethrough~~")).toBe(
        "[s]strikethrough[/s]",
      );
    });

    // Note: Nested formatting is a known limitation of regex-based conversion
    // Bold must be processed before italic to avoid conflicts
    it("should handle bold then italic separately", () => {
      expect(markdownToBBCode("**bold** and *italic*")).toBe(
        "[b]bold[/b] and [i]italic[/i]",
      );
    });
  });

  describe("code", () => {
    it("should convert inline code", () => {
      expect(markdownToBBCode("Use `code` here")).toBe(
        "Use [code]code[/code] here",
      );
    });

    it("should convert code blocks", () => {
      const input = "```\nconst x = 1;\n```";
      // Regex captures content after optional newline
      const expected = "[code]const x = 1;\n[/code]";
      expect(markdownToBBCode(input)).toBe(expected);
    });

    it("should convert code blocks with language", () => {
      const input = "```javascript\nconst x = 1;\n```";
      // Language hint is stripped, newline after it is consumed
      const expected = "[code]const x = 1;\n[/code]";
      expect(markdownToBBCode(input)).toBe(expected);
    });
  });

  describe("links", () => {
    it("should convert links", () => {
      expect(markdownToBBCode("[text](https://example.com)")).toBe(
        "[url=https://example.com]text[/url]",
      );
    });

    it("should convert multiple links", () => {
      const input = "[link1](http://a.com) and [link2](http://b.com)";
      const expected =
        "[url=http://a.com]link1[/url] and [url=http://b.com]link2[/url]";
      expect(markdownToBBCode(input)).toBe(expected);
    });

    it("should preserve WA article mention syntax @[Name](type:uuid)", () => {
      const input =
        "See @[Skill Progression](law:f62fb09f-8477-4b56-9f00-169d78adf2d5) for details.";
      expect(markdownToBBCode(input)).toBe(input);
    });

    it("should preserve mentions while converting regular links", () => {
      const input =
        "See @[Mokravar](species:3948b7db-cc4f-49da-a501-8fd387661289) and [external](https://example.com).";
      const expected =
        "See @[Mokravar](species:3948b7db-cc4f-49da-a501-8fd387661289) and [url=https://example.com]external[/url].";
      expect(markdownToBBCode(input)).toBe(expected);
    });
  });

  describe("horizontal rules", () => {
    it("should convert --- to hr", () => {
      expect(markdownToBBCode("---")).toBe("[hr]");
    });

    it("should convert *** to hr", () => {
      expect(markdownToBBCode("***")).toBe("[hr]");
    });

    it("should convert ___ to hr", () => {
      expect(markdownToBBCode("___")).toBe("[hr]");
    });
  });

  describe("blockquotes", () => {
    it("should convert blockquotes", () => {
      expect(markdownToBBCode("> This is a quote")).toBe(
        "[quote]This is a quote[/quote]",
      );
    });

    it("should merge adjacent blockquotes", () => {
      const input = "> Line 1\n> Line 2";
      const expected = "[quote]Line 1\nLine 2[/quote]";
      expect(markdownToBBCode(input)).toBe(expected);
    });
  });

  describe("lists", () => {
    it("should convert unordered lists with -", () => {
      const input = "- Item 1\n- Item 2\n- Item 3";
      const expected =
        "[ul]\n[li]Item 1[/li]\n[li]Item 2[/li]\n[li]Item 3[/li]\n[/ul]";
      expect(markdownToBBCode(input)).toBe(expected);
    });

    // Note: * for lists conflicts with italic matching, use - instead
    it("should prefer - for unordered lists", () => {
      const input = "- Use dash\n- For lists";
      const expected = "[ul]\n[li]Use dash[/li]\n[li]For lists[/li]\n[/ul]";
      expect(markdownToBBCode(input)).toBe(expected);
    });

    it("should convert ordered lists", () => {
      const input = "1. First\n2. Second\n3. Third";
      const expected =
        "[ol]\n[li]First[/li]\n[li]Second[/li]\n[li]Third[/li]\n[/ol]";
      expect(markdownToBBCode(input)).toBe(expected);
    });

    it("should handle list followed by text", () => {
      const input = "- Item 1\n- Item 2\nSome text after";
      const expected =
        "[ul]\n[li]Item 1[/li]\n[li]Item 2[/li]\n[/ul]\nSome text after";
      expect(markdownToBBCode(input)).toBe(expected);
    });
  });

  describe("tables", () => {
    it("should convert simple tables", () => {
      const input = "| Header 1 | Header 2 |\n|---|---|\n| Cell 1 | Cell 2 |";
      const expected =
        "[table]\n[tr][th]Header 1[/th][th]Header 2[/th][/tr]\n[tr][td]Cell 1[/td][td]Cell 2[/td][/tr]\n[/table]";
      expect(markdownToBBCode(input)).toBe(expected);
    });
  });

  describe("complex documents", () => {
    it("should handle mixed content", () => {
      const input = `# Welcome

This is **bold** and *italic* text.

## List
- Item one
- Item two

Some \`inline code\` here.`;

      const result = markdownToBBCode(input);

      expect(result).toContain("[h1]Welcome[/h1]");
      expect(result).toContain("[b]bold[/b]");
      expect(result).toContain("[i]italic[/i]");
      expect(result).toContain("[h2]List[/h2]");
      expect(result).toContain("[ul]");
      expect(result).toContain("[li]Item one[/li]");
      expect(result).toContain("[code]inline code[/code]");
    });
  });
});

describe("convertFieldsToBBCode", () => {
  it("should handle null and undefined", () => {
    expect(convertFieldsToBBCode(null)).toBe(null);
    expect(convertFieldsToBBCode(undefined)).toBe(undefined);
  });

  it("should convert string fields", () => {
    const input = {
      title: "# Header",
      description: "**Bold text**",
    };
    const result = convertFieldsToBBCode(input);

    expect(result.title).toBe("[h1]Header[/h1]");
    expect(result.description).toBe("[b]Bold text[/b]");
  });

  it("should preserve non-string fields", () => {
    const input = {
      count: 42,
      active: true,
      items: ["a", "b"],
    };
    const result = convertFieldsToBBCode(input);

    expect(result.count).toBe(42);
    expect(result.active).toBe(true);
    expect(result.items).toEqual(["a", "b"]);
  });

  it("should not modify the original object", () => {
    const input = { text: "**bold**" };
    const result = convertFieldsToBBCode(input);

    expect(input.text).toBe("**bold**");
    expect(result.text).toBe("[b]bold[/b]");
  });
});
