"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createCargo } from "@/actions/create-cargo";
import { updateCargo } from "@/actions/update-cargo";
import { getCargoById } from "@/actions/get-cargo-by-id";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const nivelValues = [
  "Júnior",
  "Pleno",
  "Sênior",
  "Especialista",
  "Gerente",
  "Diretor",
] as const;

const nivelOptions = nivelValues.map((value) => ({ value, label: value }));

const cargoSchema = z.object({
  codigo: z.string().min(1, "Código é obrigatório"),
  titulo: z.string().min(2, "Título é obrigatório"),
  descricao: z.string().optional(),
  nivel: z.enum(nivelValues).optional(),
  cbo: z.string().optional(),
  salarioMinimo: z.string().optional(),
  salarioMaximo: z.string().optional(),
  escolaridadeMinima: z.string().optional(),
  experienciaMinimaAnos: z.string().optional(),
  ativo: z.boolean(),
});

type CargoFormValues = z.infer<typeof cargoSchema>;

interface CargoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cargoId?: string | null;
  onSuccess?: () => void;
}

const defaultValues: CargoFormValues = {
  codigo: "",
  titulo: "",
  descricao: "",
  nivel: undefined,
  cbo: "",
  salarioMinimo: "",
  salarioMaximo: "",
  escolaridadeMinima: "",
  experienciaMinimaAnos: "",
  ativo: true,
};

export function CargoDialog({
  open,
  onOpenChange,
  cargoId,
  onSuccess,
}: CargoDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const isEditMode = !!cargoId;

  const form = useForm<CargoFormValues>({
    resolver: zodResolver(cargoSchema),
    defaultValues,
  });

  React.useEffect(() => {
    if (open && cargoId) {
      loadCargoData();
    } else if (open && !cargoId) {
      form.reset(defaultValues);
    }
  }, [open, cargoId]);

  const loadCargoData = async () => {
    if (!cargoId) return;
    setIsLoading(true);
    try {
      const result = await getCargoById(cargoId);
      if (result.success && result.data) {
        const data = result.data;
        const nivelValue = data.nivel && nivelValues.includes(data.nivel as typeof nivelValues[number]) 
          ? (data.nivel as typeof nivelValues[number])
          : undefined;
        form.reset({
          codigo: data.codigo || "",
          titulo: data.titulo || "",
          descricao: data.descricao || "",
          nivel: nivelValue,
          cbo: data.cbo || "",
          salarioMinimo: data.salarioMinimo || "",
          salarioMaximo: data.salarioMaximo || "",
          escolaridadeMinima: data.escolaridadeMinima || "",
          experienciaMinimaAnos: data.experienciaMinimaAnos?.toString() || "",
          ativo: data.ativo ?? true,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar cargo:", error);
      toast.error("Erro ao carregar dados do cargo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && cargoId) {
        const result = await updateCargo({
          ...values,
          id: cargoId,
        });
        if (result.success) {
          toast.success("Cargo atualizado com sucesso!");
          onSuccess?.();
          onOpenChange(false);
          form.reset(defaultValues);
        }
      } else {
        const result = await createCargo(values);
        if (result.success) {
          toast.success("Cargo cadastrado com sucesso!");
          onSuccess?.();
          onOpenChange(false);
          form.reset(defaultValues);
        }
      }
    } catch (error: any) {
      console.error("Erro ao salvar cargo:", error);
      toast.error(error?.message || "Erro ao salvar cargo. Verifique os dados.");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          form.reset(defaultValues);
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar cargo" : "Novo cargo"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Atualize os dados do cargo"
              : "Preencha os dados para cadastrar um novo cargo"}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Informações Básicas</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FormField
                      control={form.control}
                      name="codigo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: DEV001" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Field>
                  <Field>
                    <FormField
                      control={form.control}
                      name="titulo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Desenvolvedor" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Field>
                  <Field className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="descricao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Descrição do cargo..."
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Field>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Classificação</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FormField
                      control={form.control}
                      name="nivel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nível</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o nível" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {nivelOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Field>
                  <Field>
                    <FormField
                      control={form.control}
                      name="cbo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CBO</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Código CBO" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Field>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Remuneração</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FormField
                      control={form.control}
                      name="salarioMinimo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Salário Mínimo</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="0,00" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Field>
                  <Field>
                    <FormField
                      control={form.control}
                      name="salarioMaximo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Salário Máximo</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="0,00" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Field>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Requisitos</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FormField
                      control={form.control}
                      name="escolaridadeMinima"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Escolaridade Mínima</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ex: Ensino Superior"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Field>
                  <Field>
                    <FormField
                      control={form.control}
                      name="experienciaMinimaAnos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experiência Mínima (anos)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: 2" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Field>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Status</h3>
                <Field>
                  <FormField
                    control={form.control}
                    name="ativo"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Ativo</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Cargo disponível para atribuição
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </Field>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || form.formState.isSubmitting}
                >
                  {isSubmitting || form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : isEditMode ? (
                    "Atualizar"
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

