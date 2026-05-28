import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import styles from "./ProgressChart.module.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

/**
 * PUBLIC_INTERFACE
 * 7-day bar chart of habit completion (0/1).
 */
export default function ProgressChart({ labels, values }) {
  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Done",
          data: values,
          backgroundColor: "rgba(59, 130, 246, 0.55)",
          borderColor: "rgba(59, 130, 246, 0.9)",
          borderWidth: 1,
          borderRadius: 10,
        },
      ],
    }),
    [labels, values]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => (ctx.raw === 1 ? "Done" : "Not done"),
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 1,
          ticks: {
            stepSize: 1,
            callback: (v) => (v === 1 ? "✓" : ""),
          },
          grid: { color: "rgba(17, 24, 39, 0.08)" },
        },
        x: {
          grid: { display: false },
        },
      },
    }),
    []
  );

  if (!labels?.length) {
    return <div className={styles.empty}>Select a habit to see progress.</div>;
  }

  return (
    <div className={styles.chartWrap}>
      <Bar data={data} options={options} />
    </div>
  );
}
