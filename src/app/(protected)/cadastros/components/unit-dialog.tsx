"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createUnit } from "@/actions/create-unit";
import { updateUnit } from "@/actions/update-unit";
import { getUnitById } from "@/actions/get-unit-by-id";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const unitSchema = z.object({
  codigo: z.string().min(1, "Código é obrigatório"),
  nome: z.string().min(2, "Nome é obrigatório"),
  tipo: z.string().optional(),
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  ativo: z.boolean(),
});

type UnitFormValues = z.infer<typeof unitSchema>;

interface UnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitId?: string | null;
  onSuccess?: () => void;
}

const defaultValues: UnitFormValues = {
  codigo: "",
  nome: "",
  tipo: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  telefone: "",
  email: "",
  ativo: true,
};

const tipoOptions = [
  { value: "Matriz", label: "Matriz" },
  { value: "Filial", label: "Filial" },
  { value: "Escritório", label: "Escritório" },
  { value: "Fábrica", label: "Fábrica" },
];

const stateValues = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

const stateOptions: Array<{
  value: (typeof stateValues)[number];
  label: string;
}> = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

export function UnitDialog({
  open,
  onOpenChange,
  unitId,
  onSuccess,
}: UnitDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const isEditMode = !!unitId;

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues,
  });

  React.useEffect(() => {
    if (open) {
      if (unitId) {
        loadUnitData();
      } else {
        form.reset(defaultValues);
      }
    }
  }, [open, unitId]);

  const loadUnitData = async () => {
    if (!unitId) return;
    setIsLoading(true);
    try {
      const result = await getUnitById(unitId);
      if (result.success && result.data) {
        const data = result.data;
        form.reset({
          codigo: data.codigo || "",
          nome: data.nome || "",
          tipo: data.tipo || "",
          cep: data.cep || "",
          logradouro: data.logradouro || "",
          numero: data.numero || "",
          complemento: data.complemento || "",
          bairro: data.bairro || "",
          cidade: data.cidade || "",
          estado: data.estado || "",
          telefone: data.telefone || "",
          email: data.email || "",
          ativo: data.ativo ?? true,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar unidade:", error);
      toast.error("Erro ao carregar dados da unidade");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && unitId) {
        const result = await updateUnit({
          ...values,
          id: unitId,
        });
        if (result.success) {
          toast.success("Unidade atualizada com sucesso!");
          onSuccess?.();
          onOpenChange(false);
          form.reset(defaultValues);
        }
      } else {
        const result = await createUnit(values);
        if (result.success) {
          toast.success("Unidade cadastrada com sucesso!");
          onSuccess?.();
          onOpenChange(false);
          form.reset(defaultValues);
        }
      }
    } catch (error: any) {
      console.error("Erro ao salvar unidade:", error);
      toast.error(error?.message || "Erro ao salvar unidade. Verifique os dados.");
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
            {isEditMode ? "Editar unidade" : "Nova unidade"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Atualize os dados da unidade"
              : "Preencha os dados para cadastrar uma nova unidade"}
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
                            <Input {...field} placeholder="Ex: UNI001" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Field>
                  <Field>
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Matriz São Paulo" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Field>
                  <Field>
                    <FormField
                      control={form.control}
                      name="tipo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(value === "none" ? undefined : value)}
                            value={field.value || "none"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Nenhum</SelectItem>
                              {tipoOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
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
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Endereço</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FormField
                      control={form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="00000-000" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Field>
                  <Field>
                    <FormField
                      control={form.control}
                      name="logradouro"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logradouro</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Rua, Avenida, etc." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Field>
                  <Field>
                    <FormField
                      control={form.control}
                      name="numero"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="123" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Field>
                  <Field>
                    <FormField
                      control={form.control}
                      name="complemento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complemento</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Sala, Andar, etc." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Field>
                  <Field>
                    <FormField
                      control={form.control}
                      name="bairro"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Field>
                  <Field>
                    <FormField
                      control={form.control}
                      name="cidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Field>
                  <Field>
                    <FormField
                      control={form.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(value === "none" ? undefined : value)}
                            value={field.value || "none"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a UF" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Nenhum</SelectItem>
                              {stateOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
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
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Contato</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FormField
                      control={form.control}
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="(00) 0000-0000" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Field>
                  <Field>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="unidade@empresa.com" />
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
                            Unidade disponível para uso
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

