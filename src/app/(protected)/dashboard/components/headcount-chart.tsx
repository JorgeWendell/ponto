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

interface HeadcountData {
  departamento: string;
  atual: number;
  planejado: number;
}

interface HeadcountChartProps {
  data: HeadcountData[];
}

export function HeadcountChart({ data }: HeadcountChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Headcount: Planejado vs Atual</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="departamento" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="atual" fill="#3b82f6" name="Atual" />
            <Bar dataKey="planejado" fill="#9ca3af" name="Planejado" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

