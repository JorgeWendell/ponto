import { Bell, TrendingUp, Clock, Target, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getDashboardMetrics } from "@/actions/get-dashboard-metrics";
import { getImmediateActions } from "@/actions/get-immediate-actions";
import { getWeeklyPresence } from "@/actions/get-weekly-presence";
import { getHeadcount } from "@/actions/get-headcount";
import { getUnits } from "@/actions/get-units";
import { getDepartments } from "@/actions/get-departments";
import { MetricCard } from "./components/metric-card";
import { ImmediateActions } from "./components/immediate-actions";
import { WeeklyPresenceChart } from "./components/weekly-presence-chart";
import { HeadcountChart } from "./components/headcount-chart";
import { DashboardClient } from "./components/dashboard-client";

export default async function DashboardPage() {
  // Buscar dados do dashboard (padrão: 30 dias)
  const [metricsResult, actionsResult, presenceResult, headcountResult, unitsResult, departmentsResult] =
    await Promise.all([
      getDashboardMetrics(30),
      getImmediateActions(5),
      getWeeklyPresence(30),
      getHeadcount(),
      getUnits({ ativo: true, limit: 100 }), // Buscar todas as unidades ativas
      getDepartments({ ativo: true, limit: 100 }), // Buscar todos os departamentos ativos
    ]);

  const metrics = metricsResult.success ? metricsResult.data : null;
  const actions = actionsResult.success ? actionsResult.data : [];
  const presenceData = presenceResult.success ? presenceResult.data : [];
  const headcountData = headcountResult.success ? headcountResult.data : [];
  const units = unitsResult.success ? unitsResult.data : [];
  const departments = departmentsResult.success ? departmentsResult.data : [];

  return (
    <DashboardClient
      metrics={metrics}
      actions={actions}
      presenceData={presenceData}
      headcountData={headcountData}
      units={units}
      departments={departments}
    />
  );
}
