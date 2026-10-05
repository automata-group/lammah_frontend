"use client";

// IndexedDB Browser Vault for Zero-Server-Cost Local PDF/Document Storage

const DB_NAME = "LammahStudyVaultDB";
const DB_VERSION = 1;
const STORE_NAME = "documents";

export interface VaultDocument {
  id: string;
  name: string;
  size: number;
  totalPages?: number;
  lastOpenedAt: string;
  createdAt: string;
  blob: Blob;
  type: "pdf" | "pptx_converted" | "blank_notebook";
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this browser"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("lastOpenedAt", "lastOpenedAt", { unique: false });
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };

    request.onerror = (event: any) => {
      reject(event.target.error);
    };
  });
}

/**
 * Save or update a document in the browser's local vault
 */
export async function saveDocumentToVault(
  id: string,
  name: string,
  blob: Blob,
  type: "pdf" | "pptx_converted" | "blank_notebook" = "pdf",
  totalPages?: number
): Promise<VaultDocument> {
  const db = await openDB();
  const now = new Date().toISOString();

  const doc: VaultDocument = {
    id,
    name,
    size: blob.size,
    totalPages,
    lastOpenedAt: now,
    createdAt: now,
    blob,
    type,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(doc);

    req.onsuccess = () => resolve(doc);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Get all saved documents metadata (without heavy blob payload in memory)
 */
export async function getAllVaultDocuments(): Promise<Omit<VaultDocument, "blob">[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    req.onsuccess = () => {
      const docs = (req.result || []) as VaultDocument[];
      // Sort by lastOpenedAt descending
      docs.sort((a, b) => new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime());
      
      const lightDocs = docs.map(({ blob, ...rest }) => rest);
      resolve(lightDocs);
    };

    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieve a single document including its file Blob
 */
export async function getDocumentFromVault(id: string): Promise<VaultDocument | null> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);

    req.onsuccess = () => {
      resolve(req.result || null);
    };

    req.onerror = () => reject(req.error);
  });
}

/**
 * Update the last opened timestamp of a document
 */
export async function touchVaultDocument(id: string): Promise<void> {
  const doc = await getDocumentFromVault(id);
  if (!doc) return;

  doc.lastOpenedAt = new Date().toISOString();
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(doc);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Delete a document from the local browser vault
 */
export async function deleteDocumentFromVault(id: string): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Clear all documents from the local browser vault
 */
export async function clearAllVaultDocuments(): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

