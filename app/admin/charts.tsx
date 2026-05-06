"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  byUnit: { unit: string; hours: number; submissions: number }[];
};

const ACCENT = "#3D8AA5";
const GRID = "rgba(125, 125, 125, 0.25)";
const AXIS_TEXT = "#6B7280";

const tooltipStyle = {
  background: "rgba(20, 20, 20, 0.92)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  color: "white",
  fontSize: 13,
  padding: "8px 12px",
};

export function AdminCharts({ byUnit }: Props) {
  const maxHours = Math.max(0, ...byUnit.map((b) => b.hours));

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
      <h3 className="font-medium mb-4">Hours by unit</h3>
      <ResponsiveContainer width="100%" height={360}>
        <BarChart
          data={byUnit}
          layout="vertical"
          margin={{ left: 10, right: 40, top: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
          <XAxis
            type="number"
            stroke={AXIS_TEXT}
            fontSize={12}
            allowDecimals={false}
            domain={[0, Math.max(1, Math.ceil(maxHours * 1.1))]}
          />
          <YAxis
            dataKey="unit"
            type="category"
            stroke={AXIS_TEXT}
            fontSize={12}
            width={150}
            tick={{ textAnchor: "end" }}
          />
          <Tooltip
            cursor={{ fill: "rgba(125,125,125,0.08)" }}
            contentStyle={tooltipStyle}
            formatter={(value) => [`${value} hr`, "Hours"]}
          />
          <Bar dataKey="hours" radius={[0, 8, 8, 0]} barSize={22}>
            {byUnit.map((b, i) => (
              <Cell
                key={i}
                fill={b.hours > 0 ? ACCENT : "rgba(125,125,125,0.18)"}
              />
            ))}
            <LabelList
              dataKey="hours"
              position="right"
              fill={AXIS_TEXT}
              fontSize={12}
              formatter={(v) => (typeof v === "number" && v > 0 ? `${v}` : "")}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
