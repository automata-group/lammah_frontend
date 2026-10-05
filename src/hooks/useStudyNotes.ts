"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

export interface StudyNote {
  id: string;
  documentId: string;
  pageNumber: number;
  title?: string;
  content: string;
  type: "text" | "checklist" | "sketch" | "voice_memo";
  sketchDataUrl?: string;
  tags?: string[];
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export function useStudyNotes(documentId: string) {
  const { user, session } = useAuth();
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const storageKey = `lammah_study_notes_${documentId || "default"}`;

  // Load notes initially from Local-First storage
  useEffect(() => {
    if (!documentId) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      const localData = localStorage.getItem(storageKey);
      if (localData) {
        const parsed = JSON.parse(localData);
        setNotes(Array.isArray(parsed) ? parsed : []);
      } else {
        setNotes([]);
      }
    } catch (e) {
      console.warn("Failed to load local study notes:", e);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [documentId, storageKey]);

  // Save notes locally whenever they change
  const saveLocally = useCallback((updatedNotes: StudyNote[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
    } catch (e) {
      console.error("Local storage save failed:", e);
    }
  }, [storageKey]);

  // Add or update a note
  const saveNote = useCallback((noteData: Partial<StudyNote> & { pageNumber: number }) => {
    setNotes((prevNotes) => {
      const now = new Date().toISOString();
      let updated: StudyNote[];

      if (noteData.id) {
        // Edit existing note
        updated = prevNotes.map((n) => 
          n.id === noteData.id 
            ? { ...n, ...noteData, updatedAt: now } 
            : n
        );
      } else {
        // Create new note
        const newNote: StudyNote = {
          id: `note_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          documentId,
          pageNumber: noteData.pageNumber,
          title: noteData.title || "",
          content: noteData.content || "",
          type: noteData.type || "text",
          sketchDataUrl: noteData.sketchDataUrl || "",
          tags: noteData.tags || [],
          color: noteData.color || "indigo",
          createdAt: now,
          updatedAt: now,
        };
        updated = [newNote, ...prevNotes];
      }

      saveLocally(updated);
      return updated;
    });
  }, [documentId, saveLocally]);

  // Delete a note
  const deleteNote = useCallback((noteId: string) => {
    setNotes((prevNotes) => {
      const updated = prevNotes.filter((n) => n.id !== noteId);
      saveLocally(updated);
      return updated;
    });
  }, [saveLocally]);

  // Get notes for a specific page
  const getNotesForPage = useCallback((pageNumber: number) => {
    return notes.filter((n) => n.pageNumber === pageNumber);
  }, [notes]);

  // Get map of pageNumber -> note count
  const pageNotesCountMap = notes.reduce<Record<number, number>>((acc, note) => {
    acc[note.pageNumber] = (acc[note.pageNumber] || 0) + 1;
    return acc;
  }, {});

  return {
    notes,
    loading,
    saveNote,
    deleteNote,
    getNotesForPage,
    pageNotesCountMap,
    totalNotesCount: notes.length,
  };
}
