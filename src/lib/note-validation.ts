export const MAX_NOTE_TITLE_LENGTH = 80;

export function validateNoteTitle(title: string): string | null {
  const trimmedTitle = title.trim();
  if (trimmedTitle.length === 0) return "A note needs a title.";
  if (trimmedTitle.length > MAX_NOTE_TITLE_LENGTH) {
    return `Titles must be ${MAX_NOTE_TITLE_LENGTH} characters or fewer.`;
  }
  return null;
}
