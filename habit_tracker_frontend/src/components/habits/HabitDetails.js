import React from "react";
import styles from "./HabitDetails.module.css";

/**
 * PUBLIC_INTERFACE
 * Displays selected habit details (goal, reminder, notes, tags, streak).
 */
export default function HabitDetails({ habit, streak, doneLast7 }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <div className={styles.label}>Weekly goal</div>
        <div className={styles.value}>{habit.goalPerWeek} completions</div>
      </div>
      <div className={styles.row}>
        <div className={styles.label}>Streak</div>
        <div className={styles.value}>{streak} days</div>
      </div>
      <div className={styles.row}>
        <div className={styles.label}>Last 7 days</div>
        <div className={styles.value}>{doneLast7} done</div>
      </div>
      <div className={styles.row}>
        <div className={styles.label}>Reminder</div>
        <div className={styles.value}>{habit.reminderTime || "—"}</div>
      </div>

      <div className={styles.block}>
        <div className={styles.label}>Tags</div>
        <div className={styles.pills}>
          {(habit.tags || []).length ? (
            habit.tags.map((t) => (
              <span key={t} className={styles.pill}>
                {t}
              </span>
            ))
          ) : (
            <span className={styles.muted}>—</span>
          )}
        </div>
      </div>

      <div className={styles.block}>
        <div className={styles.label}>Notes</div>
        <div className={habit.notes ? styles.notes : styles.muted}>
          {habit.notes || "—"}
        </div>
      </div>
    </div>
  );
}
