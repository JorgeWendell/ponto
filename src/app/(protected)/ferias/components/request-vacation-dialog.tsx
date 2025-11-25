"use client";

import { Calendar as CalendarIcon, ChevronLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { createVacationRequest } from "@/actions/create-vacation-request";

const mockCollaborators = [
  { id: "1", name: "Carlos Santos" },
  { id: "2", name: "Mariana Costa" },
  { id: "3", name: "João Silva" },
  { id: "4", name: "Ana Paula" },
];

interface RequestVacationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function RequestVacationDialog({
  open,
  onOpenChange,
  onSuccess,
}: RequestVacationDialogProps) {
  const [step, setStep] = useState(1);
  const [selectedCollaborator, setSelectedCollaborator] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [observations, setObservations] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDateSelect = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (date < startDate) {
        setStartDate(date);
        setEndDate(null);
      } else {
        setEndDate(date);
      }
    }
  };

  const handleNext = () => {
    if (step === 1 && selectedCollaborator && startDate && endDate) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleCancel = () => {
    setStep(1);
    setSelectedCollaborator("");
    setStartDate(null);
    setEndDate(null);
    setObservations("");
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    if (!startDate || !endDate || !selectedCollaborator) return;

    setIsSubmitting(true);
    try {
      const result = await createVacationRequest({
        colaboradorId: selectedCollaborator,
        dataInicio: format(startDate, "yyyy-MM-dd"),
        dataFim: format(endDate, "yyyy-MM-dd"),
        totalDias: totalDays,
        observacoes: observations || undefined,
        urgencia: "baixa",
      });

      if (result.success) {
        toast.success("Solicitação de férias criada com sucesso!");
        onSuccess?.();
        handleCancel();
      }
    } catch (error) {
      toast.error("Erro ao criar solicitação de férias");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalDays =
    startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0;

  const selectedCollaboratorName =
    mockCollaborators.find((c) => c.id === selectedCollaborator)?.name || "";

  const availableDaysAfter = 20 - totalDays;

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Solicitar férias - Passo {step} de 2
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Selecione o período desejado"
              : "Confirme os detalhes da solicitação"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Funcionário</label>
              <Select
                value={selectedCollaborator}
                onValueChange={setSelectedCollaborator}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {mockCollaborators.map((collaborator) => (
                    <SelectItem key={collaborator.id} value={collaborator.id}>
                      {collaborator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Período de férias</label>
              <div className="flex justify-center">
                <Calendar
                  startDate={startDate}
                  endDate={endDate}
                  onSelect={handleDateSelect}
                  className="w-fit"
                />
              </div>
            </div>

            {startDate && endDate && (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    Período selecionado
                  </span>
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p>
                    {format(startDate, "dd/MM/yyyy", { locale: ptBR })} até{" "}
                    {format(endDate, "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                  <p className="mt-1">Total: {totalDays} dias</p>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900 border rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-sm">Resumo da solicitação</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Colaborador:</span>
                  <span className="font-medium">{selectedCollaboratorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Período:</span>
                  <span className="font-medium">
                    {startDate &&
                      endDate &&
                      `${format(startDate, "dd/MM/yyyy", { locale: ptBR })} até ${format(endDate, "dd/MM/yyyy", { locale: ptBR })}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total de dias:</span>
                  <span className="font-medium">{totalDays} dias</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Saldo após férias:
                  </span>
                  <span className="font-medium">
                    {availableDaysAfter >= 0 ? `${availableDaysAfter} dias` : "Saldo insuficiente"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Observações (opcional)
              </label>
              <Textarea
                placeholder="Adicione informações adicionais sobre sua solicitação..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button
                onClick={handleNext}
                disabled={!selectedCollaborator || !startDate || !endDate}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                Próximo
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Confirmar solicitação"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

