"use client";

import {
  Calendar,
  Check,
  Clock,
  Download,
  Plus,
  X,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { RequestVacationDialog } from "./components/request-vacation-dialog";
import { getVacationRequests } from "@/actions/get-vacation-requests";
import { updateVacationRequestStatus } from "@/actions/update-vacation-request-status";

const FeriasPage = () => {
  const [statusFilter, setStatusFilter] = useState("todos");
  const [urgencyFilter, setUrgencyFilter] = useState("todas");
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const result = await getVacationRequests();
      if (result.success) {
        setRequests(result.data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar solicitações:", error);
      toast.error("Erro ao carregar solicitações");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const result = await updateVacationRequestStatus({
        id,
        status: "aprovado",
      });
      if (result.success) {
        toast.success("Solicitação aprovada com sucesso!");
        loadRequests();
      }
    } catch (error) {
      toast.error("Erro ao aprovar solicitação");
      console.error(error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const result = await updateVacationRequestStatus({
        id,
        status: "rejeitado",
        motivoRejeicao: "Solicitação devolvida",
      });
      if (result.success) {
        toast.success("Solicitação devolvida com sucesso!");
        loadRequests();
      }
    } catch (error) {
      toast.error("Erro ao devolver solicitação");
      console.error(error);
    }
  };

  const filteredRequests = requests.filter((request) => {
    if (statusFilter !== "todos" && request.status !== statusFilter) {
      return false;
    }
    if (urgencyFilter !== "todas" && request.urgencia !== urgencyFilter) {
      return false;
    }
    return true;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "aprovado":
        return "bg-green-100 text-green-800 border-green-200";
      case "pendente":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "rejeitado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getUrgencyBadgeVariant = (urgency: string) => {
    switch (urgency) {
      case "alta":
        return "bg-red-100 text-red-800 border-red-200";
      case "media":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "baixa":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const totalDays = 30;
  const usedDays = 10;
  const availableDays = 20;
  const progressValue = (availableDays / totalDays) * 100;

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-semibold text-foreground">
            Gestão de Férias
          </h1>
          <p className="text-sm text-muted-foreground">
            Controle de solicitações e saldos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Todos status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
              <SelectItem value="rejeitado">Rejeitado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Todas urgências" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas urgências</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="default">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button
            className="bg-foreground text-background hover:bg-foreground/90 rounded-lg"
            onClick={() => setIsRequestDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Solicitar férias
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Meu saldo de férias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Disponível</span>
                  <span className="font-medium">{availableDays} dias</span>
                </div>
                <Progress value={progressValue} className="h-2" />
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-medium">{totalDays} dias</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Usado:</span>
                  <span className="font-medium">{usedDays} dias</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Disponível:</span>
                  <span className="font-medium">{availableDays} dias</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t text-sm text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                <span>Vence em 01/06/2025</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                <div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    8
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Solicitações pendentes
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950">
                <div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    24
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Aprovadas este mês
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950">
                <div>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    5
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Férias próximas (7 dias)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Solicitações de férias</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma solicitação encontrada
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar>
                          <AvatarImage src="" />
                          <AvatarFallback>
                            {request.colaborador?.nomeCompleto
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-3">
                            <p className="font-medium">
                              {request.colaborador?.nomeCompleto || "N/A"}
                            </p>
                            <Badge
                              variant="outline"
                              className={getStatusBadgeVariant(request.status)}
                            >
                              {request.status.charAt(0).toUpperCase() +
                                request.status.slice(1)}
                            </Badge>
                            {request.urgencia && (
                              <Badge
                                variant="outline"
                                className={getUrgencyBadgeVariant(
                                  request.urgencia
                                )}
                              >
                                {request.urgencia}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{request.totalDias} dias</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {request.dataInicio &&
                                  format(
                                    new Date(request.dataInicio),
                                    "dd/MM/yyyy",
                                    { locale: ptBR }
                                  )}{" "}
                                até{" "}
                                {request.dataFim &&
                                  format(
                                    new Date(request.dataFim),
                                    "dd/MM/yyyy",
                                    { locale: ptBR }
                                  )}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                Solicitado em{" "}
                                {request.createdAt &&
                                  format(
                                    new Date(request.createdAt),
                                    "dd/MM/yyyy",
                                    { locale: ptBR }
                                  )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {request.status === "pendente" && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(request.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Devolver
                          </Button>
                          <Button
                            size="sm"
                            className="bg-foreground text-background hover:bg-foreground/90"
                            onClick={() => handleApprove(request.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <RequestVacationDialog
        open={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
        onSuccess={loadRequests}
      />
    </div>
  );
};

export default FeriasPage;

