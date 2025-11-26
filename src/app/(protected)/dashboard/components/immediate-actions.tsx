"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Check, X } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccessibleImageUrl } from "@/lib/nextcloud/url-helper";
import { updateVacationRequestStatus } from "@/actions/update-vacation-request-status";
import { toast } from "sonner";

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

interface ImmediateActionsProps {
  actions: ImmediateAction[];
  onActionComplete?: () => void;
}

export function ImmediateActions({
  actions,
  onActionComplete,
}: ImmediateActionsProps) {
  const handleApprove = async (id: string) => {
    try {
      const result = await updateVacationRequestStatus({
        id,
        status: "aprovado",
      });
      if (result.success) {
        toast.success("Solicitação aprovada com sucesso!");
        onActionComplete?.();
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
        onActionComplete?.();
      }
    } catch (error) {
      toast.error("Erro ao devolver solicitação");
      console.error(error);
    }
  };

  const getUrgencyBadgeVariant = (urgency: string) => {
    switch (urgency) {
      case "alta":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/40";
      case "media":
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-900/40";
      case "baixa":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/40";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatTipo = (tipo: string) => {
    switch (tipo) {
      case "ferias":
        return "Férias";
      case "ajuste_ponto":
        return "Ajuste de ponto";
      default:
        return tipo;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Ações imediatas</CardTitle>
        <Link
          href="/ferias"
          className="text-sm font-medium text-primary hover:underline"
        >
          Ver todas
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma ação pendente
          </p>
        ) : (
          actions.map((action) => (
            <div
              key={action.id}
              className="flex items-center justify-between gap-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <Avatar>
                  <AvatarImage
                    src={
                      getAccessibleImageUrl(action.colaborador?.avatarUrl || null) ||
                      undefined
                    }
                  />
                  <AvatarFallback>
                    {action.colaborador?.nomeCompleto
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="font-medium">
                      {action.colaborador?.nomeCompleto || "N/A"}
                    </p>
                    <Badge
                      variant="outline"
                      className={getUrgencyBadgeVariant(action.urgencia)}
                    >
                      {action.urgencia}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {formatTipo(action.tipo)} •{" "}
                      {action.dataInicio &&
                        format(new Date(action.dataInicio), "dd/MM", {
                          locale: ptBR,
                        })}
                      {action.dataFim &&
                        ` - ${format(new Date(action.dataFim), "dd/MM", {
                          locale: ptBR,
                        })}`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReject(action.id)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Recusar
                </Button>
                <Button
                  size="sm"
                  className="bg-foreground text-background hover:bg-foreground/90"
                  onClick={() => handleApprove(action.id)}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Aprovar
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

