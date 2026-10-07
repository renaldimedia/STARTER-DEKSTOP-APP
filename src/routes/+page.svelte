<script lang="ts">
  import { onMount } from "svelte";
  import {
    createNote,
    deleteNote,
    listNotes,
    updateNote,
    type Note,
  } from "#lib/notes.js";
  import { validateNoteTitle } from "#lib/note-validation.js";

  let notes = $state<Note[]>([]);
  let search = $state("");
  let isLoading = $state(true);
  let isSaving = $state(false);
  let errorMessage = $state("");
  let isEditorOpen = $state(false);
  let editingNoteId = $state<number | null>(null);
  let title = $state("");
  let body = $state("");
  const today = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const filteredNotes = $derived(
    notes.filter((note) => {
      const query = search.trim().toLowerCase();
      return (
        query.length === 0 ||
        note.title.toLowerCase().includes(query) ||
        note.body.toLowerCase().includes(query)
      );
    }),
  );

  onMount(() => {
    void loadNotes();
  });

  async function loadNotes() {
    isLoading = true;
    errorMessage = "";
    try {
      notes = await listNotes();
    } catch (error) {
      errorMessage = `Could not load your notes. ${errorMessageFrom(error)}`;
    } finally {
      isLoading = false;
    }
  }

  function openNewNote() {
    editingNoteId = null;
    title = "";
    body = "";
    errorMessage = "";
    isEditorOpen = true;
  }

  function openEditNote(note: Note) {
    editingNoteId = note.id;
    title = note.title;
    body = note.body;
    errorMessage = "";
    isEditorOpen = true;
  }

  async function saveNote(event: SubmitEvent) {
    event.preventDefault();
    const titleError = validateNoteTitle(title);
    if (titleError) {
      errorMessage = titleError;
      return;
    }

    isSaving = true;
    errorMessage = "";
    try {
      if (editingNoteId === null) {
        await createNote(title, body);
      } else {
        await updateNote(editingNoteId, title, body);
      }
      isEditorOpen = false;
      await loadNotes();
    } catch (error) {
      errorMessage = `Could not save this note. ${errorMessageFrom(error)}`;
    } finally {
      isSaving = false;
    }
  }

  async function removeNote(note: Note) {
    if (!window.confirm(`Delete “${note.title}”? This cannot be undone.`)) return;

    errorMessage = "";
    try {
      await deleteNote(note.id);
      notes = notes.filter((item) => item.id !== note.id);
    } catch (error) {
      errorMessage = `Could not delete this note. ${errorMessageFrom(error)}`;
    }
  }

  function formatDate(date: string) {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "Recently";
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(parsedDate);
  }

  function errorMessageFrom(error: unknown) {
    return error instanceof Error ? error.message : String(error);
  }
</script>

<svelte:head>
  <title>Desknotes — your notes, close at hand</title>
  <meta
    name="description"
    content="A quiet, local-first place to keep your thoughts."
  />
</svelte:head>

<div class="flex min-h-screen bg-[#f7f7f4] text-[#252821]">
  <aside class="hidden w-64 shrink-0 flex-col border-r border-[#e9e9e2] bg-[#fbfbf8] px-5 py-7 sm:flex">
    <a href="/" class="flex items-center gap-3 px-2" aria-label="Desknotes home">
      <span class="grid size-10 place-items-center rounded-xl bg-[#313d32] text-lg text-white">d.</span>
      <span class="text-lg font-semibold tracking-tight">desknotes</span>
    </a>

    <div class="mt-12 px-2 text-[11px] font-semibold tracking-[0.16em] text-[#91948a] uppercase">
      Workspace
    </div>
    <nav class="mt-3" aria-label="Main navigation">
      <a
        href="#notes"
        aria-current="page"
        class="flex items-center gap-3 rounded-lg bg-[#eef0e9] px-3 py-2.5 text-sm font-medium text-[#344535]"
      >
        <svg viewBox="0 0 20 20" fill="none" class="size-[18px]" aria-hidden="true">
          <path d="M5.5 3.75h6l3 3v9.5H5.5v-12.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
          <path d="M11.25 3.75v3.5h3.5M8 10h4.5M8 13h4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
        All notes
        <span class="ml-auto rounded-full bg-white px-2 py-0.5 text-xs text-[#777b70]">{notes.length}</span>
      </a>
    </nav>

    <div class="mt-auto rounded-xl border border-[#e9e9e2] bg-white p-4">
      <div class="flex items-center gap-2 text-xs font-semibold text-[#425442]">
        <span class="size-2 rounded-full bg-[#76a276]"></span>
        Stored on this device
      </div>
      <p class="mt-2 text-xs leading-5 text-[#85877e]">
        Your notes live locally in SQLite and stay yours.
      </p>
    </div>
  </aside>

  <main id="notes" class="mx-auto flex w-full max-w-6xl flex-col px-5 py-7 sm:px-9 sm:py-10 lg:px-14">
    <header class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-3 sm:hidden">
        <span class="grid size-9 place-items-center rounded-xl bg-[#313d32] text-sm text-white">d.</span>
        <span class="font-semibold tracking-tight">desknotes</span>
      </div>
      <div class="hidden text-sm text-[#898c82] sm:block">Your personal space</div>
      <div class="ml-auto flex items-center gap-3">
        <span class="hidden text-xs text-[#85877e] sm:inline">Saved locally</span>
        <span class="grid size-9 place-items-center rounded-full bg-[#e9e9e1] text-xs font-semibold text-[#596154]" aria-label="Local profile">
          DN
        </span>
      </div>
    </header>

    <section class="mt-12 flex flex-col justify-between gap-5 sm:mt-16 sm:flex-row sm:items-end">
      <div>
        <p class="text-sm font-medium text-[#74816e]">{today}</p>
        <h1 class="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-[40px]">Your notes</h1>
        <p class="mt-2 text-sm text-[#85877e]">A little space for everything on your mind.</p>
      </div>
      <button
        type="button"
        onclick={openNewNote}
        class="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#344535] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#28372a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#344535]"
      >
        <svg viewBox="0 0 20 20" fill="none" class="size-4" aria-hidden="true">
          <path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
        </svg>
        New note
      </button>
    </section>

    <section class="mt-9 border-y border-[#e8e8e1] py-4" aria-label="Notes overview">
      <div class="flex items-center gap-3 text-sm">
        <span class="font-semibold">{notes.length}</span>
        <span class="text-[#85877e]">{notes.length === 1 ? "note in your library" : "notes in your library"}</span>
        <span class="ml-auto hidden text-xs text-[#a0a197] sm:inline">Only you can see these</span>
      </div>
    </section>

    <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-sm font-semibold text-[#454a41]">Recently updated</h2>
      <label class="relative block w-full sm:w-64">
        <span class="sr-only">Search notes</span>
        <svg viewBox="0 0 20 20" fill="none" class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#999b92]" aria-hidden="true">
          <circle cx="8.75" cy="8.75" r="5.75" stroke="currentColor" stroke-width="1.5" />
          <path d="m13 13 3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
        <input
          bind:value={search}
          type="search"
          placeholder="Search your notes..."
          class="h-10 w-full rounded-lg border border-[#e5e5de] bg-white pl-9 pr-3 text-sm outline-none placeholder:text-[#a3a49c] focus:border-[#8c9a88] focus:ring-2 focus:ring-[#8c9a88]/15"
        />
      </label>
    </div>

    {#if errorMessage && !isEditorOpen}
      <div role="alert" class="mt-5 rounded-lg border border-[#efd4cf] bg-[#fff7f5] px-4 py-3 text-sm text-[#9d4738]">
        {errorMessage}
        <button type="button" onclick={loadNotes} class="ml-2 font-semibold underline underline-offset-2">Try again</button>
      </div>
    {/if}

    {#if isLoading}
      <div class="mt-8 rounded-xl border border-[#e9e9e2] bg-white p-8 text-center text-sm text-[#85877e]" aria-live="polite">
        Opening your notes...
      </div>
    {:else if filteredNotes.length > 0}
      <div class="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {#each filteredNotes as note (note.id)}
          <article class="group flex min-h-48 flex-col rounded-xl border border-[#e9e9e2] bg-white p-5 transition hover:border-[#d1d6cb] hover:shadow-[0_8px_28px_-20px_rgba(44,55,41,0.35)]">
            <button
              type="button"
              onclick={() => openEditNote(note)}
              class="flex flex-1 flex-col text-left focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#74816e]"
              aria-label={`Edit ${note.title}`}
            >
              <h3 class="line-clamp-2 text-base font-semibold leading-6 tracking-tight">{note.title}</h3>
              <p class="mt-3 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-[#7d8076]">
                {note.body || "No additional details."}
              </p>
            </button>
            <div class="mt-5 flex items-center justify-between border-t border-[#f0f0eb] pt-3">
              <time class="text-xs text-[#999b92]" datetime={note.updated_at}>{formatDate(note.updated_at)}</time>
              <button
                type="button"
                onclick={() => removeNote(note)}
                class="rounded-md px-2 py-1 text-xs text-[#999b92] opacity-100 transition hover:bg-[#fff1ee] hover:text-[#a34e40] sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                aria-label={`Delete ${note.title}`}
              >
                Delete
              </button>
            </div>
          </article>
        {/each}
      </div>
    {:else if search.trim()}
      <div class="mt-8 rounded-xl border border-dashed border-[#ddded6] px-6 py-14 text-center">
        <h3 class="font-medium">No notes found</h3>
        <p class="mt-2 text-sm text-[#85877e]">Try another search, or start a fresh note.</p>
      </div>
    {:else}
      <div class="mt-8 flex flex-col items-center rounded-xl border border-dashed border-[#ddded6] px-6 py-16 text-center">
        <span class="grid size-12 place-items-center rounded-2xl bg-[#eef0e9] text-[#657661]">
          <svg viewBox="0 0 24 24" fill="none" class="size-6" aria-hidden="true">
            <path d="M7 3.75h7l4 4v12.5H7V3.75Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
            <path d="M14 4v4h4M10 12h5M10 15.5h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </span>
        <h3 class="mt-4 font-semibold">A blank page, in the best way.</h3>
        <p class="mt-2 max-w-sm text-sm leading-6 text-[#85877e]">
          Capture a thought, make a list, or save something for later. Your first note is one click away.
        </p>
        <button type="button" onclick={openNewNote} class="mt-5 text-sm font-semibold text-[#435744] hover:underline underline-offset-4">
          Create your first note
        </button>
      </div>
    {/if}
  </main>
</div>

{#if isEditorOpen}
  <div
    class="fixed inset-0 z-10 flex items-center justify-center bg-[#20251f]/35 p-4 backdrop-blur-[2px]"
    role="presentation"
    onclick={(event) => {
      if (event.target === event.currentTarget && !isSaving) isEditorOpen = false;
    }}
    onkeydown={(event) => {
      if (event.key === "Escape" && !isSaving) isEditorOpen = false;
    }}
  >
    <dialog
      open
      aria-modal="true"
      aria-labelledby="editor-title"
      class="w-full max-w-xl rounded-2xl border border-[#e8e8e1] bg-[#fdfdfa] p-6 shadow-2xl sm:p-8"
    >
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold tracking-[0.14em] text-[#788472] uppercase">
            {editingNoteId === null ? "New note" : "Edit note"}
          </p>
          <h2 id="editor-title" class="mt-2 text-2xl font-semibold tracking-tight">
            {editingNoteId === null ? "What's on your mind?" : "Make it yours."}
          </h2>
        </div>
        <button
          type="button"
          onclick={() => (isEditorOpen = false)}
          disabled={isSaving}
          class="grid size-9 place-items-center rounded-lg text-lg text-[#85877e] hover:bg-[#f0f0eb] disabled:opacity-50"
          aria-label="Close note editor"
        >
          ×
        </button>
      </div>
      <form onsubmit={saveNote}>
        <label for="note-title" class="mt-7 block text-sm font-medium">Title</label>
        <input
          id="note-title"
          bind:value={title}
          maxlength="80"
          required
          placeholder="Give your note a name"
          class="mt-2 h-11 w-full rounded-lg border border-[#e5e5de] bg-white px-3 text-sm outline-none placeholder:text-[#a3a49c] focus:border-[#8c9a88] focus:ring-2 focus:ring-[#8c9a88]/15"
        />
        <label for="note-body" class="mt-5 block text-sm font-medium">Your thoughts <span class="font-normal text-[#999b92]">· optional</span></label>
        <textarea
          id="note-body"
          bind:value={body}
          rows="7"
          placeholder="Start writing..."
          class="mt-2 w-full resize-y rounded-lg border border-[#e5e5de] bg-white px-3 py-3 text-sm leading-6 outline-none placeholder:text-[#a3a49c] focus:border-[#8c9a88] focus:ring-2 focus:ring-[#8c9a88]/15"
        ></textarea>
        {#if errorMessage}
          <p role="alert" class="mt-3 text-sm text-[#a34e40]">{errorMessage}</p>
        {/if}
        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onclick={() => (isEditorOpen = false)}
            disabled={isSaving}
            class="h-10 rounded-lg px-4 text-sm font-medium text-[#686b62] hover:bg-[#f0f0eb] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            class="h-10 rounded-lg bg-[#344535] px-5 text-sm font-medium text-white hover:bg-[#28372a] disabled:cursor-wait disabled:opacity-60"
          >
            {isSaving ? "Saving..." : editingNoteId === null ? "Save note" : "Save changes"}
          </button>
        </div>
      </form>
    </dialog>
  </div>
{/if}
