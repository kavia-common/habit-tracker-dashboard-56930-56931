import { v4 as uuidv4 } from "uuid";
import { getEnvConfig } from "../config/env";

const STORAGE_KEY = "habit_tracker.local_habits_v1";

/**
 * We intentionally keep API calls defensive:
 * - Try backend if reachable
 * - Fall back to localStorage so UI is fully functional even without backend endpoints.
 */

function loadLocal() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocal(habits) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

async function tryFetch(path, options = {}) {
  const { apiBase } = getEnvConfig();
  const url = `${apiBase}${path}`;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });

    window.clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const error = new Error(`Request failed: ${res.status} ${text}`);
      error.status = res.status;
      throw error;
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) return res.json();
    return res.text();
  } finally {
    window.clearTimeout(timeout);
  }
}

/**
 * PUBLIC_INTERFACE
 * Get habits list. Attempts backend /habits first, falls back to local storage.
 */
export async function listHabits() {
  try {
    const data = await tryFetch("/habits", { method: "GET" });
    // Expect array; if not, fall back.
    if (Array.isArray(data)) return data;
    return loadLocal();
  } catch {
    return loadLocal();
  }
}

/**
 * PUBLIC_INTERFACE
 * Create a habit. Attempts backend, falls back to local storage.
 */
export async function createHabit(habitInput) {
  const now = new Date().toISOString();
  const localHabit = {
    id: uuidv4(),
    name: habitInput.name.trim(),
    color: habitInput.color || "#3B82F6",
    goalPerWeek: Number(habitInput.goalPerWeek || 5),
    reminderTime: habitInput.reminderTime || "",
    tags: Array.isArray(habitInput.tags) ? habitInput.tags : [],
    notes: habitInput.notes || "",
    createdAt: now,
    updatedAt: now,
    completions: [],
  };

  try {
    const data = await tryFetch("/habits", {
      method: "POST",
      body: JSON.stringify(habitInput),
    });

    // If backend returns an object, prefer it; else return local.
    if (data && typeof data === "object") return data;
    return localHabit;
  } catch {
    const habits = loadLocal();
    const next = [localHabit, ...habits];
    saveLocal(next);
    return localHabit;
  }
}

/**
 * PUBLIC_INTERFACE
 * Update habit. Attempts backend, falls back to local storage.
 */
export async function updateHabit(id, patch) {
  const now = new Date().toISOString();

  try {
    const data = await tryFetch(`/habits/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    if (data && typeof data === "object") return data;
  } catch {
    // continue to local
  }

  const habits = loadLocal();
  const next = habits.map((h) =>
    h.id === id ? { ...h, ...patch, updatedAt: now } : h
  );
  saveLocal(next);
  return next.find((h) => h.id === id) || null;
}

/**
 * PUBLIC_INTERFACE
 * Delete habit. Attempts backend, falls back to local storage.
 */
export async function deleteHabit(id) {
  try {
    await tryFetch(`/habits/${encodeURIComponent(id)}`, { method: "DELETE" });
    return true;
  } catch {
    const habits = loadLocal();
    const next = habits.filter((h) => h.id !== id);
    saveLocal(next);
    return true;
  }
}

/**
 * PUBLIC_INTERFACE
 * Log completion for a habit on a given date (yyyy-MM-dd).
 * Attempts backend first, falls back to local storage update.
 */
export async function logCompletion(habitId, dateStr) {
  try {
    const data = await tryFetch(
      `/habits/${encodeURIComponent(habitId)}/completions`,
      { method: "POST", body: JSON.stringify({ date: dateStr }) }
    );
    if (data && typeof data === "object") return data;
  } catch {
    // continue to local
  }

  const habits = loadLocal();
  const next = habits.map((h) => {
    if (h.id !== habitId) return h;
    const completions = Array.isArray(h.completions) ? h.completions : [];
    if (completions.includes(dateStr)) return h;
    return { ...h, completions: [...completions, dateStr] };
  });
  saveLocal(next);
  return next.find((h) => h.id === habitId) || null;
}
