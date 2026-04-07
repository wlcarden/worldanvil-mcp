/**
 * World Anvil MCP Server - Utility Functions
 *
 * Markdown to BBCode conversion and field processing utilities.
 */

/**
 * Convert Markdown to World Anvil BBCode
 *
 * Handles common markdown patterns and converts them to BBCode format
 * that World Anvil expects for article content.
 *
 * @param {string} text - Markdown text to convert
 * @returns {string} BBCode formatted text
 */
export function markdownToBBCode(text) {
  if (!text || typeof text !== "string") return text;

  let result = text;

  // Code blocks (must be done before other processing)
  // Fenced code blocks: ```code``` or ```lang\ncode\n```
  result = result.replace(/```[\w]*\n?([\s\S]*?)```/g, "[code]$1[/code]");

  // Inline code: `code`
  result = result.replace(/`([^`]+)`/g, "[code]$1[/code]");

  // Headers (h1-h4) - must process before bold since # could appear in text
  result = result.replace(/^#### (.+)$/gm, "[h4]$1[/h4]");
  result = result.replace(/^### (.+)$/gm, "[h3]$1[/h3]");
  result = result.replace(/^## (.+)$/gm, "[h2]$1[/h2]");
  result = result.replace(/^# (.+)$/gm, "[h1]$1[/h1]");

  // Bold: **text** or __text__
  result = result.replace(/\*\*([^*]+)\*\*/g, "[b]$1[/b]");
  result = result.replace(/__([^_]+)__/g, "[b]$1[/b]");

  // Italic: *text* or _text_ (but not inside words)
  result = result.replace(/(?<!\w)\*([^*]+)\*(?!\w)/g, "[i]$1[/i]");
  result = result.replace(/(?<!\w)_([^_]+)_(?!\w)/g, "[i]$1[/i]");

  // Strikethrough: ~~text~~
  result = result.replace(/~~([^~]+)~~/g, "[s]$1[/s]");

  // Links: [text](url) — but NOT @[text](type:uuid) which is a WA article mention
  result = result.replace(/(?<!@)\[([^\]]+)\]\(([^)]+)\)/g, "[url=$2]$1[/url]");

  // Horizontal rules: --- or *** or ___
  result = result.replace(/^[-*_]{3,}$/gm, "[hr]");

  // Blockquotes: > text (can be multi-line)
  result = result.replace(/^> (.+)$/gm, "[quote]$1[/quote]");
  // Merge adjacent quotes
  result = result.replace(/\[\/quote\]\n\[quote\]/g, "\n");

  // Lists: unordered (- item or * item) and ordered (1. item, 2. item)
  // First, identify list blocks and wrap them
  const lines = result.split("\n");
  const processedLines = [];
  let inList = false;
  let listType = null; // 'ul' for unordered, 'ol' for ordered

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isUnorderedItem = /^[-*] (.+)$/.test(line);
    const isOrderedItem = /^\d+\. (.+)$/.test(line);
    const isListItem = isUnorderedItem || isOrderedItem;
    const currentType = isUnorderedItem ? "ul" : isOrderedItem ? "ol" : null;

    if (isListItem && !inList) {
      // Start of a new list
      inList = true;
      listType = currentType;
      processedLines.push(listType === "ol" ? "[ol]" : "[ul]");
      const content = isUnorderedItem
        ? line.replace(/^[-*] (.+)$/, "$1")
        : line.replace(/^\d+\. (.+)$/, "$1");
      processedLines.push("[li]" + content + "[/li]");
    } else if (isListItem && inList && currentType === listType) {
      // Continue same type of list
      const content = isUnorderedItem
        ? line.replace(/^[-*] (.+)$/, "$1")
        : line.replace(/^\d+\. (.+)$/, "$1");
      processedLines.push("[li]" + content + "[/li]");
    } else if (isListItem && inList && currentType !== listType) {
      // Different list type - close current, start new
      processedLines.push(listType === "ol" ? "[/ol]" : "[/ul]");
      listType = currentType;
      processedLines.push(listType === "ol" ? "[ol]" : "[ul]");
      const content = isUnorderedItem
        ? line.replace(/^[-*] (.+)$/, "$1")
        : line.replace(/^\d+\. (.+)$/, "$1");
      processedLines.push("[li]" + content + "[/li]");
    } else if (!isListItem && inList) {
      // End of list
      processedLines.push(listType === "ol" ? "[/ol]" : "[/ul]");
      inList = false;
      listType = null;
      processedLines.push(line);
    } else {
      processedLines.push(line);
    }
  }

  // Close list if we ended while still in one
  if (inList) {
    processedLines.push(listType === "ol" ? "[/ol]" : "[/ul]");
  }

  result = processedLines.join("\n");

  // Tables: | col1 | col2 | -> [table][tr][td]col1[/td][td]col2[/td][/tr][/table]
  // This is more complex - handle basic tables
  const tableLines = result.split("\n");
  let inTable = false;
  let tableResult = [];

  for (let i = 0; i < tableLines.length; i++) {
    const line = tableLines[i];
    const isTableRow = /^\|(.+)\|$/.test(line);
    const isSeparator = /^\|[-:\s|]+\|$/.test(line);

    if (isTableRow && !inTable) {
      // Start of table
      inTable = true;
      tableResult.push("[table]");
      if (!isSeparator) {
        const cells = line
          .slice(1, -1)
          .split("|")
          .map((c) => c.trim());
        tableResult.push(
          "[tr]" + cells.map((c) => "[th]" + c + "[/th]").join("") + "[/tr]",
        );
      }
    } else if (isTableRow && inTable) {
      if (!isSeparator) {
        const cells = line
          .slice(1, -1)
          .split("|")
          .map((c) => c.trim());
        tableResult.push(
          "[tr]" + cells.map((c) => "[td]" + c + "[/td]").join("") + "[/tr]",
        );
      }
      // Skip separator rows (|---|---|)
    } else if (!isTableRow && inTable) {
      // End of table
      inTable = false;
      tableResult.push("[/table]");
      tableResult.push(line);
    } else {
      tableResult.push(line);
    }
  }

  if (inTable) {
    tableResult.push("[/table]");
  }

  result = tableResult.join("\n");

  return result;
}

/**
 * Convert all text fields in an object from Markdown to BBCode
 *
 * @param {Object} data - Object with string fields to convert
 * @returns {Object} New object with converted string fields
 */
export function convertFieldsToBBCode(data) {
  if (!data || typeof data !== "object") return data;

  const converted = { ...data };

  for (const [key, value] of Object.entries(converted)) {
    if (typeof value === "string") {
      converted[key] = markdownToBBCode(value);
    }
  }

  return converted;
}
