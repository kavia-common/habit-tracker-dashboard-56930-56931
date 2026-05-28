import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { listHabits } from "../services/habitsApi";
import { normalizeHabit } from "../utils/habits";
import styles from "./ExportPage.module.css";

function downloadText(filename, content, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * PUBLIC_INTERFACE
 * Export page: download data as JSON or CSV.
 */
export default function ExportPage() {
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const data = await listHabits();
      if (!alive) return;
      setHabits(data.map(normalizeHabit));
    })();
    return () => {
      alive = false;
    };
  }, []);

  const json = useMemo(() => JSON.stringify({ habits }, null, 2), [habits]);

  const csv = useMemo(() => {
    const headers = ["id", "name", "goalPerWeek", "reminderTime", "tags", "notes", "completionsCount"];
    const rows = habits.map((h) => [
      h.id,
      JSON.stringify(h.name),
      String(h.goalPerWeek),
      JSON.stringify(h.reminderTime || ""),
      JSON.stringify((h.tags || []).join("|")),
      JSON.stringify(h.notes || ""),
      String((h.completions || []).length),
    ]);
    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }, [habits]);

  return (
    <div className={styles.page}>
      <div>
        <div className={styles.h1}>Export</div>
        <div className={styles.sub}>Download your habits and completion history.</div>
      </div>

      <div className={styles.grid}>
        <Card>
          <div className={styles.cardTitle}>JSON</div>
          <div className={styles.cardHint}>Best for backups and cloud sync.</div>
          <div className={styles.actions}>
            <Button
              variant="primary"
              onClick={() => downloadText("habits-export.json", json, "application/json")}
            >
              Download JSON
            </Button>
          </div>
          <pre className={styles.preview}>{json}</pre>
        </Card>

        <Card>
          <div className={styles.cardTitle}>CSV</div>
          <div className={styles.cardHint}>Quick export for spreadsheets (summary-level).</div>
          <div className={styles.actions}>
            <Button
              variant="secondary"
              onClick={() => downloadText("habits-export.csv", csv, "text/csv")}
            >
              Download CSV
            </Button>
          </div>
          <pre className={styles.preview}>{csv}</pre>
        </Card>
      </div>
    </div>
  );
}
