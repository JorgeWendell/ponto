"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WeeklyPresenceData {
  dia: string;
  presente: number;
  parcial: number;
  ausente: number;
}

interface WeeklyPresenceChartProps {
  data: WeeklyPresenceData[];
}

export function WeeklyPresenceChart({ data }: WeeklyPresenceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Presença semanal</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dia" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="ausente" stackId="a" fill="#ef4444" name="Ausente" />
            <Bar
              dataKey="parcial"
              stackId="a"
              fill="#f97316"
              name="Parcial"
            />
            <Bar
              dataKey="presente"
              stackId="a"
              fill="#22c55e"
              name="Presente"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

