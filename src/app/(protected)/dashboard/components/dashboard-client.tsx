"use client";

import {
  Bell,
  TrendingUp,
  Clock,
  Target,
  Calendar,
  Check,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getAccessibleImageUrl } from "@/lib/nextcloud/url-helper";
import { updateVacationRequestStatus } from "@/actions/update-vacation-request-status";
import { toast } from "sonner";
import { MetricCard } from "./metric-card";
import { ImmediateActions } from "./immediate-actions";
import { WeeklyPresenceChart } from "./weekly-presence-chart";
import { HeadcountChart } from "./headcount-chart";
import { useState, useEffect } from "react";
import { getDashboardMetrics } from "@/actions/get-dashboard-metrics";
import { getWeeklyPresence } from "@/actions/get-weekly-presence";

interface DashboardMetrics {
  absenteismo: {
    valor: number;
    variacao: number;
  };
  solicitacoesPendentes: {
    valor: number;
    variacao: number;
  };
  ciclosAvaliacaoAtivos: number;
  feriasProximas: {
    valor: number;
    variacao: number;
  };
}

interface ImmediateAction {
  id: string;
  tipo: string;
  colaborador: {
    id: string;
    nomeCompleto: string;
    avatarUrl: string | null;
  } | null;
  urgencia: string;
  dataInicio: string;
  dataFim: string;
  totalDias: number;
  observacoes: string | null;
  createdAt: Date | null;
}

interface WeeklyPresenceData {
  dia: string;
  presente: number;
  parcial: number;
  ausente: number;
}

interface HeadcountData {
  departamento: string;
  atual: number;
  planejado: number;
}

interface Unit {
  id: string;
  codigo: string;
  nome: string;
  tipo: string | null;
  ativo: boolean;
}

interface Department {
  id: string;
  codigo: string;
  nome: string;
  ativo: boolean;
}

interface DashboardClientProps {
  metrics: DashboardMetrics | null;
  actions: ImmediateAction[];
  presenceData: WeeklyPresenceData[];
  headcountData: HeadcountData[];
  units: Unit[];
  departments: Department[];
}

export function DashboardClient({
  metrics: initialMetrics,
  actions,
  presenceData: initialPresenceData,
  headcountData,
  units,
  departments,
}: DashboardClientProps) {
  const [periodFilter, setPeriodFilter] = useState("30");
  const [unitFilter, setUnitFilter] = useState("todas");
  const [teamFilter, setTeamFilter] = useState("todas");
  const [actionsList, setActionsList] = useState(actions);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [presenceData, setPresenceData] = useState(initialPresenceData);
  const [isLoading, setIsLoading] = useState(false);

  // Recarregar dados quando o período mudar
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const days = Number(periodFilter);
        const [metricsResult, presenceResult] = await Promise.all([
          getDashboardMetrics(days),
          getWeeklyPresence(days),
        ]);

        if (metricsResult.success) {
          setMetrics(metricsResult.data);
        }
        if (presenceResult.success) {
          setPresenceData(presenceResult.data);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [periodFilter]);

  const handleActionComplete = () => {
    // Recarregar ações (seria melhor usar React Query ou SWR)
    // Por enquanto, apenas removemos da lista local
    // Em produção, deveria recarregar do servidor
    window.location.reload();
  };

  return (
    <div className="flex h-full flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-foreground">
            Dashboard de RH
          </h1>
          <p className="text-sm text-muted-foreground">
            Visão geral das operações de gestão de pessoas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="h-9 w-[140px] rounded-lg text-xs md:text-sm">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>

          <Select value={unitFilter} onValueChange={setUnitFilter}>
            <SelectTrigger className="h-9 w-[140px] rounded-lg text-xs md:text-sm">
              <SelectValue placeholder="Unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="h-9 w-[140px] rounded-lg text-xs md:text-sm">
              <SelectValue placeholder="Equipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {departments.map((department) => (
                <SelectItem key={department.id} value={department.id}>
                  {department.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
                <Bell className="h-5 w-5 text-muted-foreground" />
                {actionsList.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {actionsList.length}
                  </Badge>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Ações imediatas</h3>
                  <Badge variant="secondary" className="text-xs">
                    {actionsList.length}
                  </Badge>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {actionsList.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma ação pendente
                    </p>
                  ) : (
                    actionsList.map((action) => (
                      <div
                        key={action.id}
                        className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={
                              getAccessibleImageUrl(
                                action.colaborador?.avatarUrl || null
                              ) || undefined
                            }
                          />
                          <AvatarFallback className="text-xs">
                            {action.colaborador?.nomeCompleto
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">
                              {action.colaborador?.nomeCompleto || "N/A"}
                            </p>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                action.urgencia === "alta"
                                  ? "bg-red-100 text-red-800 border-red-200"
                                  : action.urgencia === "media"
                                    ? "bg-orange-100 text-orange-800 border-orange-200"
                                    : "bg-blue-100 text-blue-800 border-blue-200"
                              }`}
                            >
                              {action.urgencia}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {action.tipo === "ferias" ? "Férias" : action.tipo}{" "}
                            •{" "}
                            {action.dataInicio &&
                              format(new Date(action.dataInicio), "dd/MM", {
                                locale: ptBR,
                              })}
                            {action.dataFim &&
                              ` - ${format(new Date(action.dataFim), "dd/MM", {
                                locale: ptBR,
                              })}`}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const result =
                                    await updateVacationRequestStatus({
                                      id: action.id,
                                      status: "rejeitado",
                                      motivoRejeicao: "Solicitação devolvida",
                                    });
                                  if (result.success) {
                                    toast.success(
                                      "Solicitação devolvida com sucesso!"
                                    );
                                    handleActionComplete();
                                  }
                                } catch (error) {
                                  toast.error("Erro ao devolver solicitação");
                                }
                              }}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Recusar
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-foreground text-background hover:bg-foreground/90"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const result =
                                    await updateVacationRequestStatus({
                                      id: action.id,
                                      status: "aprovado",
                                    });
                                  if (result.success) {
                                    toast.success(
                                      "Solicitação aprovada com sucesso!"
                                    );
                                    handleActionComplete();
                                  }
                                } catch (error) {
                                  toast.error("Erro ao aprovar solicitação");
                                }
                              }}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Aprovar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-4">
        {isLoading ? (
          <div className="col-span-4 flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Carregando dados...</p>
          </div>
        ) : (
          <>
            <MetricCard
              title="Absenteísmo"
              value={metrics ? `${metrics.absenteismo.valor}%` : "0%"}
              icon={TrendingUp}
              iconColor="bg-green-500"
              variation={metrics?.absenteismo.variacao}
              variationLabel="vs período anterior"
            />
            <MetricCard
              title="Solicitações pendentes"
              value={metrics?.solicitacoesPendentes.valor || 0}
              icon={Clock}
              iconColor="bg-orange-500"
              variation={metrics?.solicitacoesPendentes.variacao}
              variationLabel="vs período anterior"
            />
            <MetricCard
              title="Ciclos de avaliação ativos"
              value={metrics?.ciclosAvaliacaoAtivos || 0}
              icon={Target}
              iconColor="bg-blue-500"
            />
            <MetricCard
              title="Férias próximas"
              value={metrics?.feriasProximas.valor || 0}
              icon={Calendar}
              iconColor="bg-purple-500"
              variation={metrics?.feriasProximas.variacao}
              variationLabel="vs período anterior"
            />
          </>
        )}
      </div>

      {/* Immediate Actions */}
      <ImmediateActions
        actions={actionsList}
        onActionComplete={handleActionComplete}
      />

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <WeeklyPresenceChart data={presenceData} />
        <HeadcountChart data={headcountData} />
      </div>
    </div>
  );
}
