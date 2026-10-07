import { describe, expect, it } from "vitest";
import { MAX_NOTE_TITLE_LENGTH, validateNoteTitle } from "./note-validation";

describe("validateNoteTitle", () => {
  it("rejects an empty or whitespace-only title", () => {
    expect(validateNoteTitle("")).toBe("A note needs a title.");
    expect(validateNoteTitle("  \n ")).toBe("A note needs a title.");
  });

  it("accepts a trimmed title at the maximum length", () => {
    expect(validateNoteTitle(` ${"a".repeat(MAX_NOTE_TITLE_LENGTH)} `)).toBeNull();
  });

  it("rejects a title over the database limit", () => {
    expect(validateNoteTitle("a".repeat(MAX_NOTE_TITLE_LENGTH + 1))).toContain(
      `${MAX_NOTE_TITLE_LENGTH} characters or fewer`,
    );
  });
});
