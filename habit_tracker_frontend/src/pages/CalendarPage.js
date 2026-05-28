import React, { useEffect, useMemo, useState } from "react";
import { eachDayOfInterval, endOfMonth, format, startOfMonth } from "date-fns";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { listHabits, logCompletion, updateHabit } from "../services/habitsApi";
import { normalizeHabit } from "../utils/habits";
import styles from "./CalendarPage.module.css";

/**
 * PUBLIC_INTERFACE
 * Calendar page showing a month grid for a selected habit.
 */
export default function CalendarPage() {
  const [habits, setHabits] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const data = await listHabits();
      if (!alive) return;
      const norm = data.map(normalizeHabit);
      setHabits(norm);
      setSelectedId(norm[0]?.id ?? null);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const selectedHabit = useMemo(
    () => habits.find((h) => h.id === selectedId) || null,
    [habits, selectedId]
  );

  const days = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    return eachDayOfInterval({ start, end });
  }, []);

  const completions = useMemo(() => new Set(selectedHabit?.completions || []), [selectedHabit]);

  async function toggleDay(dateKey) {
    if (!selectedHabit) return;

    const isDone = completions.has(dateKey);
    if (isDone) {
      // Undo local-only.
      const nextCompletions = (selectedHabit.completions || []).filter((d) => d !== dateKey);
      const updated = await updateHabit(selectedHabit.id, { completions: nextCompletions });
      const norm = normalizeHabit(updated || { ...selectedHabit, completions: nextCompletions });
      setHabits((prev) => prev.map((h) => (h.id === norm.id ? norm : h)));
      return;
    }

    const updated = await logCompletion(selectedHabit.id, dateKey);
    const norm = normalizeHabit(updated);
    setHabits((prev) => prev.map((h) => (h.id === norm.id ? norm : h)));
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.h1}>Calendar</div>
          <div className={styles.sub}>
            Mark completions on any day of the current month.
          </div>
        </div>

        <div className={styles.picker}>
          <div className={styles.pickerLabel}>Habit</div>
          <select
            className={styles.select}
            value={selectedId || ""}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {habits.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card>
        <div className={styles.monthTitle}>{format(new Date(), "MMMM yyyy")}</div>
        {!selectedHabit ? (
          <div className={styles.empty}>Add a habit on the Dashboard to use the calendar.</div>
        ) : (
          <div className={styles.grid} role="grid" aria-label="Monthly completion grid">
            {days.map((d) => {
              const key = format(d, "yyyy-MM-dd");
              const done = completions.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  className={done ? `${styles.day} ${styles.done}` : styles.day}
                  onClick={() => toggleDay(key)}
                  title={done ? "Completed" : "Not completed"}
                >
                  <div className={styles.dayNum}>{format(d, "d")}</div>
                  <div className={styles.dot} style={{ background: selectedHabit.color }} />
                </button>
              );
            })}
          </div>
        )}

        <div className={styles.legend}>
          <Button variant="ghost" size="sm" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            Back to top
          </Button>
        </div>
      </Card>
    </div>
  );
}
