import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import HabitForm from "../components/habits/HabitForm";
import HabitList from "../components/habits/HabitList";
import HabitDetails from "../components/habits/HabitDetails";
import ProgressChart from "../components/habits/ProgressChart";
import { buildLast7DaysSeries, calculateStreak, countLastNDays, normalizeHabit } from "../utils/habits";
import { createHabit, deleteHabit, listHabits, logCompletion, updateHabit } from "../services/habitsApi";
import styles from "./DashboardPage.module.css";

/**
 * PUBLIC_INTERFACE
 * Dashboard page: list of habits, progress charts, and habit details.
 */
export default function DashboardPage() {
  const [habits, setHabits] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const selectedHabit = useMemo(() => {
    const found = habits.find((h) => h.id === selectedId);
    return found || (habits[0] || null);
  }, [habits, selectedId]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const data = await listHabits();
      if (!alive) return;
      const norm = data.map(normalizeHabit);
      setHabits(norm);
      setSelectedId(norm[0]?.id ?? null);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const todayKey = format(new Date(), "yyyy-MM-dd");

  const summary = useMemo(() => {
    const total = habits.length;
    const doneToday = habits.filter((h) => (h.completions || []).includes(todayKey)).length;
    const bestStreak = habits.reduce((m, h) => Math.max(m, calculateStreak(h.completions)), 0);
    return { total, doneToday, bestStreak };
  }, [habits, todayKey]);

  const selectedSeries = useMemo(() => {
    if (!selectedHabit) return { labels: [], values: [] };
    return buildLast7DaysSeries(selectedHabit.completions);
  }, [selectedHabit]);

  async function handleAdd(values) {
    const created = await createHabit(values);
    const norm = normalizeHabit(created);
    setHabits((prev) => [norm, ...prev]);
    setSelectedId(norm.id);
    setAddOpen(false);
  }

  async function handleEdit(values) {
    if (!selectedHabit) return;
    const updated = await updateHabit(selectedHabit.id, values);
    if (!updated) return;
    const norm = normalizeHabit(updated);
    setHabits((prev) => prev.map((h) => (h.id === norm.id ? norm : h)));
    setEditOpen(false);
  }

  async function handleDelete(id) {
    await deleteHabit(id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setSelectedId((prevSelected) => {
      if (prevSelected !== id) return prevSelected;
      const next = habits.find((h) => h.id !== id);
      return next?.id ?? null;
    });
  }

  async function handleToggleDone(id) {
    const target = habits.find((h) => h.id === id);
    if (!target) return;

    const isDone = (target.completions || []).includes(todayKey);
    if (isDone) {
      // For simplicity, undo is local-only (UI-level). Backend endpoint may exist but is unknown.
      setHabits((prev) =>
        prev.map((h) =>
          h.id === id ? { ...h, completions: (h.completions || []).filter((d) => d !== todayKey) } : h
        )
      );
      return;
    }

    const updated = await logCompletion(id, todayKey);
    const norm = normalizeHabit(updated);
    setHabits((prev) => prev.map((h) => (h.id === norm.id ? norm : h)));
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <div className={styles.h1}>Dashboard</div>
          <div className={styles.sub}>
            Track your streaks, hit weekly goals, and keep momentum.
          </div>
        </div>
        <div className={styles.headerActions}>
          <Button variant="primary" onClick={() => setAddOpen(true)}>
            + Add habit
          </Button>
        </div>
      </div>

      <div className={styles.kpis}>
        <Card>
          <div className={styles.kpiLabel}>Habits</div>
          <div className={styles.kpiValue}>{summary.total}</div>
        </Card>
        <Card>
          <div className={styles.kpiLabel}>Done today</div>
          <div className={styles.kpiValue}>{summary.doneToday}</div>
        </Card>
        <Card>
          <div className={styles.kpiLabel}>Best streak</div>
          <div className={styles.kpiValue}>{summary.bestStreak}d</div>
        </Card>
      </div>

      <div className={styles.grid}>
        <Card className={styles.leftCard}>
          <div className={styles.cardHeader}>
            <div>
              <div className={styles.cardTitle}>Habits</div>
              <div className={styles.cardHint}>
                Click a habit to see details. Tap “Done” to log today.
              </div>
            </div>
          </div>

          {loading ? (
            <div className={styles.empty}>Loading…</div>
          ) : habits.length === 0 ? (
            <div className={styles.empty}>
              No habits yet. Add your first habit to get started.
            </div>
          ) : (
            <HabitList
              habits={habits}
              selectedId={selectedHabit?.id ?? null}
              onSelect={(id) => setSelectedId(id)}
              onToggleDone={handleToggleDone}
              onDelete={handleDelete}
            />
          )}
        </Card>

        <div className={styles.rightColumn}>
          <Card>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>Progress (last 7 days)</div>
                <div className={styles.cardHint}>
                  {selectedHabit ? `Selected: ${selectedHabit.name}` : "Select a habit"}
                </div>
              </div>
            </div>
            <ProgressChart labels={selectedSeries.labels} values={selectedSeries.values} />
          </Card>

          <Card>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>Habit details</div>
                <div className={styles.cardHint}>
                  Weekly goal and notes for the selected habit.
                </div>
              </div>
              <div className={styles.cardActions}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditOpen(true)}
                  disabled={!selectedHabit}
                >
                  Edit
                </Button>
              </div>
            </div>

            {selectedHabit ? (
              <HabitDetails
                habit={selectedHabit}
                streak={calculateStreak(selectedHabit.completions)}
                doneLast7={countLastNDays(selectedHabit.completions, 7)}
              />
            ) : (
              <div className={styles.empty}>Select a habit to see details.</div>
            )}
          </Card>
        </div>
      </div>

      <Modal
        title="Add habit"
        open={addOpen}
        onClose={() => setAddOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" form="habit-form-add" type="submit">
              Create
            </Button>
          </>
        }
      >
        <HabitForm
          id="habit-form-add"
          onSubmit={handleAdd}
          initialValues={{
            name: "",
            goalPerWeek: 5,
            color: "#3B82F6",
            reminderTime: "",
            tagsText: "",
            notes: "",
          }}
        />
      </Modal>

      <Modal
        title="Edit habit"
        open={editOpen}
        onClose={() => setEditOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" form="habit-form-edit" type="submit">
              Save
            </Button>
          </>
        }
      >
        <HabitForm
          id="habit-form-edit"
          onSubmit={handleEdit}
          initialValues={{
            name: selectedHabit?.name ?? "",
            goalPerWeek: selectedHabit?.goalPerWeek ?? 5,
            color: selectedHabit?.color ?? "#3B82F6",
            reminderTime: selectedHabit?.reminderTime ?? "",
            tagsText: (selectedHabit?.tags ?? []).join(", "),
            notes: selectedHabit?.notes ?? "",
          }}
        />
      </Modal>
    </div>
  );
}
