"use client";

import { useState } from "react";
import {
  MessageSquareText,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";

export interface CustomerNote {
  id: string;
  note: string;
  createdBy: string;
  createdAt: string;
}

interface CustomerNotesProps {
  initialNotes?: CustomerNote[];
}

export default function CustomerNotes({
  initialNotes = [
    {
      id: "NOTE-001",
      note: "Prefers traditional Kerala-style decoration for family events.",
      createdBy: "Manager",
      createdAt: "Sep 5, 2026",
    },
    {
      id: "NOTE-002",
      note: "Requested vegetarian food options for upcoming events.",
      createdBy: "Staff",
      createdAt: "Aug 28, 2026",
    },
  ],
}: CustomerNotesProps) {
  const [notes, setNotes] = useState<CustomerNote[]>(initialNotes);
  const [newNote, setNewNote] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleAddNote = () => {
    const trimmedNote = newNote.trim();

    if (!trimmedNote) return;

    const note: CustomerNote = {
      id: `NOTE-${Date.now()}`,
      note: trimmedNote,
      createdBy: "Manager",
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    setNotes((currentNotes) => [note, ...currentNotes]);
    setNewNote("");
    setShowInput(false);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((currentNotes) =>
      currentNotes.filter((note) => note.id !== id),
    );
  };

  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
            <MessageSquareText size={19} />
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#29241f]">
              Customer Notes
            </h2>

            <p className="mt-0.5 text-sm text-[#8d847b]">
              Important notes and customer preferences
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowInput((value) => !value)}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#ded5cb] bg-[#fdfbf8] px-4 text-sm font-semibold text-[#756d64] transition hover:border-[#b8894b] hover:bg-[#f7efe4] hover:text-[#29241f]"
        >
          <Plus size={17} />
          Add Note
        </button>
      </div>

      {/* Add Note */}
      {showInput && (
        <div className="mt-5 rounded-xl border border-[#e8e1d8] bg-[#fbf6ef] p-4">
          <label
            htmlFor="customer-note"
            className="mb-2 block text-sm font-medium text-[#29241f]"
          >
            New Note
          </label>

          <textarea
            id="customer-note"
            value={newNote}
            onChange={(event) => setNewNote(event.target.value)}
            placeholder="Write an important note about this customer..."
            rows={3}
            className="w-full resize-none rounded-xl border border-[#ded5cb] bg-white px-4 py-3 text-sm text-[#29241f] outline-none placeholder:text-[#aaa198] focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
          />

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowInput(false);
                setNewNote("");
              }}
              className="rounded-full px-4 py-2 text-sm font-medium text-[#756d64] transition hover:bg-white hover:text-[#29241f]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleAddNote}
              disabled={!newNote.trim()}
              className="rounded-full bg-[#b8894b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a7773f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save Note
            </button>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="mt-6 space-y-3">
        {notes.length > 0 ? (
          notes.map((note) => (
            <div
              key={note.id}
              className="group rounded-xl border border-[#eee8e1] bg-[#fdfbf8] p-4 transition hover:border-[#ded5cb]"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf5ed] text-[#557555]">
                  <UserRound size={16} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-6 text-[#4f4943]">
                    {note.note}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#9b938a]">
                    <span className="font-medium text-[#756d64]">
                      {note.createdBy}
                    </span>

                    <span>•</span>

                    <span>{note.createdAt}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteNote(note.id)}
                  aria-label={`Delete note: ${note.note}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#aaa198] opacity-100 transition hover:bg-[#f8e9e5] hover:text-[#a65d4d] sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-[#ded5cb] bg-[#fdfbf8] px-5 py-8 text-center">
            <MessageSquareText
              size={24}
              className="mx-auto text-[#b9b0a7]"
            />

            <p className="mt-3 text-sm font-medium text-[#756d64]">
              No notes yet
            </p>

            <p className="mt-1 text-xs text-[#9b938a]">
              Add a note to keep track of customer preferences.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}