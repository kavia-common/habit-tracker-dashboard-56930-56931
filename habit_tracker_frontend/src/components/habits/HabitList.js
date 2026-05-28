import React from "react";
import Button from "../ui/Button";
import { format } from "date-fns";
import styles from "./HabitList.module.css";

/**
 * PUBLIC_INTERFACE
 * List of habits with selection and quick actions.
 */
export default function HabitList({
  habits,
  selectedId,
  onSelect,
  onToggleDone,
  onDelete,
}) {
  const todayKey = format(new Date(), "yyyy-MM-dd");

  return (
    <div className={styles.list}>
      {habits.map((h) => {
        const doneToday = (h.completions || []).includes(todayKey);
        return (
          <div
            key={h.id}
            className={h.id === selectedId ? `${styles.row} ${styles.active}` : styles.row}
            role="button"
            tabIndex={0}
            onClick={() => onSelect?.(h.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onSelect?.(h.id);
            }}
          >
            <div className={styles.left}>
              <div className={styles.dot} style={{ background: h.color }} aria-hidden="true" />
              <div className={styles.meta}>
                <div className={styles.name}>{h.name}</div>
                <div className={styles.sub}>
                  Goal: {h.goalPerWeek}/week • Tags: {(h.tags || []).slice(0, 2).join(", ") || "—"}
                </div>
              </div>
            </div>

            <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
              <Button
                variant={doneToday ? "secondary" : "primary"}
                size="sm"
                onClick={() => onToggleDone?.(h.id)}
              >
                {doneToday ? "Done ✓" : "Done"}
              </Button>
              <Button variant="danger" size="sm" onClick={() => onDelete?.(h.id)}>
                Delete
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
