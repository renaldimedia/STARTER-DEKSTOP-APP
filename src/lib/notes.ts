import Database from "@tauri-apps/plugin-sql";

export type Note = {
  id: number;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
};

let databasePromise: Promise<Database> | undefined;

function getDatabase(): Promise<Database> {
  databasePromise ??= Database.load("sqlite:desknotes.db").catch((error: unknown) => {
    databasePromise = undefined;
    throw error;
  });
  return databasePromise;
}

export async function listNotes(): Promise<Note[]> {
  const database = await getDatabase();
  return database.select<Note[]>(
    "SELECT id, title, body, created_at, updated_at FROM notes ORDER BY updated_at DESC, id DESC",
  );
}

export async function createNote(title: string, body: string): Promise<void> {
  const database = await getDatabase();
  await database.execute(
    "INSERT INTO notes (title, body) VALUES ($1, $2)",
    [title.trim(), body.trim()],
  );
}

export async function updateNote(
  id: number,
  title: string,
  body: string,
): Promise<void> {
  const database = await getDatabase();
  await database.execute(
    "UPDATE notes SET title = $1, body = $2, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = $3",
    [title.trim(), body.trim(), id],
  );
}

export async function deleteNote(id: number): Promise<void> {
  const database = await getDatabase();
  await database.execute("DELETE FROM notes WHERE id = $1", [id]);
}
