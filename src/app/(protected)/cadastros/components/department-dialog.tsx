"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createDepartment } from "@/actions/create-department";
import { updateDepartment } from "@/actions/update-department";
import { getDepartmentById } from "@/actions/get-department-by-id";
import { getDepartments } from "@/actions/get-departments";
import { getCollaborators } from "@/actions/get-collaborators";

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

const departmentSchema = z.object({
  codigo: z.string().min(1, "Código é obrigatório"),
  nome: z.string().min(2, "Nome é obrigatório"),
  descricao: z.string().optional(),
  departamentoPaiId: z.string().optional(),
  gestorId: z.string().optional(),
  centroCusto: z.string().optional(),
  ativo: z.boolean(),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

interface DepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId?: string | null;
  onSuccess?: () => void;
}

const defaultValues: DepartmentFormValues = {
  codigo: "",
  nome: "",
  descricao: "",
  departamentoPaiId: "",
  gestorId: "",
  centroCusto: "",
  ativo: true,
};

export function DepartmentDialog({
  open,
  onOpenChange,
  departmentId,
  onSuccess,
}: DepartmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [departments, setDepartments] = React.useState<any[]>([]);
  const [collaborators, setCollaborators] = React.useState<any[]>([]);
  const isEditMode = !!departmentId;

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues,
  });

  React.useEffect(() => {
    if (open) {
      loadOptions();
      if (departmentId) {
        loadDepartmentData();
      } else {
        form.reset(defaultValues);
      }
    }
  }, [open, departmentId]);

  const loadOptions = async () => {
    try {
      const [deptResult, collabResult] = await Promise.all([
        getDepartments({ ativo: true, limit: 1000 }),
        getCollaborators({ status: "ativo", limit: 1000 }),
      ]);
      if (deptResult.success) {
        setDepartments(deptResult.data || []);
      }
      if (collabResult.success) {
        setCollaborators(collabResult.data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar opções:", error);
    }
  };

  const loadDepartmentData = async () => {
    if (!departmentId) return;
    setIsLoading(true);
    try {
      const result = await getDepartmentById(departmentId);
      if (result.success && result.data) {
        const data = result.data;
        form.reset({
          codigo: data.codigo || "",
          nome: data.nome || "",
          descricao: data.descricao || "",
          departamentoPaiId: data.departamentoPaiId || "",
          gestorId: data.gestorId || "",
          centroCusto: data.centroCusto || "",
          ativo: data.ativo ?? true,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar departamento:", error);
      toast.error("Erro ao carregar dados do departamento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && departmentId) {
        const result = await updateDepartment({
          ...values,
          id: departmentId,
        });
        if (result.success) {
          toast.success("Departamento atualizado com sucesso!");
          onSuccess?.();
          onOpenChange(false);
          form.reset(defaultValues);
        }
      } else {
        const result = await createDepartment(values);
        if (result.success) {
          toast.success("Departamento cadastrado com sucesso!");
          onSuccess?.();
          onOpenChange(false);
          form.reset(defaultValues);
        }
      }
    } catch (error: any) {
      console.error("Erro ao salvar departamento:", error);
      toast.error(error?.message || "Erro ao salvar departamento. Verifique os dados.");
    } finally {
      setIsSubmitting(false);
    }
  });

  // Filtrar departamentos para não incluir o próprio departamento em edição
  const availableDepartments = isEditMode && departmentId
    ? departments.filter((d) => d.id !== departmentId)
    : departments;

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
            {isEditMode ? "Editar departamento" : "Novo departamento"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Atualize os dados do departamento"
              : "Preencha os dados para cadastrar um novo departamento"}
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
                            <Input {...field} placeholder="Ex: DEP001" />
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
                            <Input {...field} placeholder="Ex: Tecnologia" />
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
                              placeholder="Descrição do departamento..."
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
                <h3 className="text-sm font-medium">Hierarquia</h3>
                <Field>
                  <FormField
                    control={form.control}
                    name="departamentoPaiId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departamento Pai</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value === "none" ? undefined : value)}
                          value={field.value || "none"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Nenhum (departamento raiz)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Nenhum (departamento raiz)</SelectItem>
                            {availableDepartments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.nome}
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

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Gestão</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FormField
                      control={form.control}
                      name="gestorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gestor</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(value === "none" ? undefined : value)}
                            value={field.value || "none"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o gestor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Nenhum</SelectItem>
                              {collaborators.map((collab) => (
                                <SelectItem key={collab.id} value={collab.id}>
                                  {collab.nomeCompleto}
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
                      name="centroCusto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Centro de Custo</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: CC001" />
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
                            Departamento disponível para uso
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

