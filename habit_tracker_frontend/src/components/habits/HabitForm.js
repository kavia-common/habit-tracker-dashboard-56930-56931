import React, { useMemo, useState } from "react";
import styles from "./HabitForm.module.css";

/**
 * PUBLIC_INTERFACE
 * Form for creating/editing a habit.
 */
export default function HabitForm({ id, initialValues, onSubmit }) {
  const [values, setValues] = useState(() => ({ ...(initialValues || {}) }));
  const [error, setError] = useState("");

  const parsedTags = useMemo(() => {
    const raw = values.tagsText || "";
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8);
  }, [values.tagsText]);

  function set(field, v) {
    setValues((prev) => ({ ...prev, [field]: v }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const name = (values.name || "").trim();
    if (!name) {
      setError("Please enter a habit name.");
      return;
    }

    const goalPerWeek = Number(values.goalPerWeek || 5);
    if (!Number.isFinite(goalPerWeek) || goalPerWeek < 1 || goalPerWeek > 7) {
      setError("Weekly goal must be a number between 1 and 7.");
      return;
    }

    onSubmit?.({
      name,
      goalPerWeek,
      color: values.color || "#3B82F6",
      reminderTime: values.reminderTime || "",
      tags: parsedTags,
      notes: values.notes || "",
    });
  }

  return (
    <form id={id} className={styles.form} onSubmit={handleSubmit}>
      {error ? <div className={styles.error}>{error}</div> : null}

      <div className={styles.grid}>
        <label className={styles.field}>
          <div className={styles.label}>Name</div>
          <input
            className={styles.input}
            value={values.name || ""}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Drink water"
            autoFocus
          />
        </label>

        <label className={styles.field}>
          <div className={styles.label}>Color</div>
          <input
            className={styles.input}
            type="color"
            value={values.color || "#3B82F6"}
            onChange={(e) => set("color", e.target.value)}
            aria-label="Habit color"
          />
        </label>

        <label className={styles.field}>
          <div className={styles.label}>Weekly goal (1–7)</div>
          <input
            className={styles.input}
            type="number"
            min="1"
            max="7"
            value={values.goalPerWeek ?? 5}
            onChange={(e) => set("goalPerWeek", e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <div className={styles.label}>Reminder time</div>
          <input
            className={styles.input}
            type="time"
            value={values.reminderTime || ""}
            onChange={(e) => set("reminderTime", e.target.value)}
          />
        </label>
      </div>

      <label className={styles.field}>
        <div className={styles.label}>Tags (comma-separated)</div>
        <input
          className={styles.input}
          value={values.tagsText || ""}
          onChange={(e) => set("tagsText", e.target.value)}
          placeholder="e.g. health, morning"
        />
        <div className={styles.tagsPreview}>
          Preview:{" "}
          {parsedTags.length ? parsedTags.join(" • ") : <span className={styles.muted}>—</span>}
        </div>
      </label>

      <label className={styles.field}>
        <div className={styles.label}>Notes</div>
        <textarea
          className={styles.textarea}
          rows={5}
          value={values.notes || ""}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Motivation, triggers, or a short plan…"
        />
      </label>

      {/* Hidden submit button so modal footer submit works via form attribute */}
      <button type="submit" className={styles.hiddenSubmit} aria-hidden="true">
        Submit
      </button>
    </form>
  );
}
