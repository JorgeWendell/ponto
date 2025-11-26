"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createCollaborator } from "@/actions/create-collaborator";
import { updateCollaborator } from "@/actions/update-collaborator";
import { getCollaboratorById } from "@/actions/get-collaborator-by-id";
import { getDepartments } from "@/actions/get-departments";
import { getCargos } from "@/actions/get-cargos";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const maritalStatusValues = [
  "SOLTEIRO",
  "CASADO",
  "DIVORCIADO",
  "VIUVO",
] as const;
const maritalStatusOptions: Array<{
  value: (typeof maritalStatusValues)[number];
  label: string;
}> = [
  { value: "SOLTEIRO", label: "Solteiro(a)" },
  { value: "CASADO", label: "Casado(a)" },
  { value: "DIVORCIADO", label: "Divorciado(a)" },
  { value: "VIUVO", label: "Viúvo(a)" },
];

const genderValues = ["MASCULINO", "FEMININO"] as const;
const genderOptions: Array<{
  value: (typeof genderValues)[number];
  label: string;
}> = [
  { value: "MASCULINO", label: "Masculino" },
  { value: "FEMININO", label: "Feminino" },
];

const stateValues = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;
const stateOptions: Array<{
  value: (typeof stateValues)[number];
  label: string;
}> = stateValues.map((value) => ({
  value,
  label: value,
}));

const contractTypeValues = ["CLT", "PJ", "ESTAGIO", "CONTRATO"] as const;
const contractTypeOptions: Array<{
  value: (typeof contractTypeValues)[number];
  label: string;
}> = [
  { value: "CLT", label: "CLT" },
  { value: "PJ", label: "PJ" },
  { value: "ESTAGIO", label: "Estágio" },
  { value: "CONTRATO", label: "Contrato" },
];

const workModelValues = ["PRESENCIAL", "HIBRIDO", "HOME"] as const;
const workModelOptions: Array<{
  value: (typeof workModelValues)[number];
  label: string;
}> = [
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "HIBRIDO", label: "Híbrido" },
  { value: "HOME", label: "Home office" },
];

const bankValues = [
  "BANCO_DO_BRASIL",
  "CAIXA",
  "BRADESCO",
  "ITAU",
  "SANTANDER",
  "SICREDI",
  "SICOOB",
  "BANRISUL",
  "NUBANK",
  "INTER",
  "BTG",
  "C6",
  "ORIGINAL",
  "SAFRA",
  "MERCANTIL",
] as const;
const bankOptions: Array<{
  value: (typeof bankValues)[number];
  label: string;
}> = [
  { value: "BANCO_DO_BRASIL", label: "Banco do Brasil" },
  { value: "CAIXA", label: "Caixa Econômica Federal" },
  { value: "BRADESCO", label: "Bradesco" },
  { value: "ITAU", label: "Itaú" },
  { value: "SANTANDER", label: "Santander" },
  { value: "SICREDI", label: "Sicredi" },
  { value: "SICOOB", label: "Sicoob" },
  { value: "BANRISUL", label: "Banrisul" },
  { value: "NUBANK", label: "Nubank" },
  { value: "INTER", label: "Banco Inter" },
  { value: "BTG", label: "BTG Pactual" },
  { value: "C6", label: "C6 Bank" },
  { value: "ORIGINAL", label: "Banco Original" },
  { value: "SAFRA", label: "Banco Safra" },
  { value: "MERCANTIL", label: "Banco Mercantil" },
];

const collaboratorSchema = z.object({
  name: z.string().min(2, { message: "Nome é obrigatório" }),
  cpf: z.string().min(11, { message: "CPF é obrigatório" }),
  birthDate: z.string().min(1, { message: "Data de nascimento é obrigatória" }),
  gender: z.enum(genderValues, { message: "Gênero é obrigatório" }),
  maritalStatus: z.enum(maritalStatusValues, {
    message: "Estado civil é obrigatório",
  }),
  corporateEmail: z.string().email({ message: "E-mail corporativo inválido" }),
  personalEmail: z
    .string()
    .email({ message: "E-mail pessoal inválido" })
    .optional()
    .or(z.literal("")),
  mobilePhone: z.string().min(10, { message: "Celular é obrigatório" }),
  phone: z.string().optional().or(z.literal("")),
  cep: z.string().min(8, { message: "CEP é obrigatório" }),
  street: z.string().min(1, { message: "Logradouro é obrigatório" }),
  number: z.string().min(1, { message: "Número é obrigatório" }),
  complement: z.string().optional().or(z.literal("")),
  neighborhood: z.string().min(1, { message: "Bairro é obrigatório" }),
  city: z.string().min(1, { message: "Cidade é obrigatória" }),
  state: z.enum(stateValues, { message: "UF é obrigatória" }),
  registration: z.string().min(1, { message: "Matrícula é obrigatória" }),
  department: z.string().min(1, { message: "Departamento é obrigatório" }),
  role: z.string().min(1, { message: "Cargo é obrigatório" }),
  unit: z.string().min(1, { message: "Unidade é obrigatória" }),
  manager: z.string().optional().or(z.literal("")),
  admissionDate: z
    .string()
    .min(1, { message: "Data de admissão é obrigatória" }),
  contractType: z.enum(contractTypeValues, {
    message: "Tipo de contrato é obrigatório",
  }),
  workModel: z.enum(workModelValues, {
    message: "Regime é obrigatório",
  }),
  weeklyWorkload: z.string().min(1, { message: "Carga horária é obrigatória" }),
  salary: z.string().min(1, { message: "Salário é obrigatório" }),
  bank: z.enum(bankValues, { message: "Banco é obrigatório" }),
  agency: z.string().min(1, { message: "Agência é obrigatória" }),
  account: z.string().min(1, { message: "Conta é obrigatória" }),
  accountType: z.string().min(1, { message: "Tipo de conta é obrigatório" }),
  pixKey: z.string().optional().or(z.literal("")),
  // Documentos
  rg: z.string().optional().or(z.literal("")),
  orgaoExpedidor: z.string().optional().or(z.literal("")),
  tituloEleitor: z.string().optional().or(z.literal("")),
  pisPasep: z.string().optional().or(z.literal("")),
  ctps: z.string().optional().or(z.literal("")),
  serieCtps: z.string().optional().or(z.literal("")),
});

type CollaboratorFormValues = z.infer<typeof collaboratorSchema>;

interface NewCollaboratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collaboratorId?: string | null;
  onSuccess?: () => void;
}

const defaultValues: CollaboratorFormValues = {
  name: "",
  cpf: "",
  birthDate: "",
  gender: "" as any,
  maritalStatus: "" as any,
  corporateEmail: "",
  personalEmail: "",
  mobilePhone: "",
  phone: "",
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "" as any,
  registration: "",
  department: "",
  role: "",
  unit: "",
  manager: "",
  admissionDate: "",
  contractType: "" as any,
  workModel: "" as any,
  weeklyWorkload: "",
  salary: "",
  bank: "" as any,
  agency: "",
  account: "",
  accountType: "",
  pixKey: "",
  // Documentos
  rg: "",
  orgaoExpedidor: "",
  tituloEleitor: "",
  pisPasep: "",
  ctps: "",
  serieCtps: "",
};

export function NewCollaboratorDialog({
  open,
  onOpenChange,
  collaboratorId,
  onSuccess,
}: NewCollaboratorDialogProps) {
  const [tab, setTab] = useState("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [cargos, setCargos] = useState<any[]>([]);
  const isEditMode = !!collaboratorId;

  const form = useForm<CollaboratorFormValues>({
    resolver: zodResolver(collaboratorSchema),
    defaultValues,
  });

  React.useEffect(() => {
    if (open) {
      if (collaboratorId) {
        // Carregar opções primeiro, depois os dados do colaborador
        loadOptions().then(() => {
          loadCollaboratorData();
        });
      } else {
        loadOptions();
        form.reset(defaultValues);
        setTab("personal");
      }
    }
  }, [open, collaboratorId]);

  const loadOptions = async () => {
    try {
      const [deptResult, cargoResult] = await Promise.all([
        getDepartments({ ativo: true, limit: 1000 }),
        getCargos({ ativo: true, limit: 1000 }),
      ]);
      if (deptResult.success) {
        setDepartments(deptResult.data || []);
      }
      if (cargoResult.success) {
        setCargos(cargoResult.data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar opções:", error);
    }
  };

  const loadCollaboratorData = async () => {
    if (!collaboratorId) return;
    setIsLoading(true);
    try {
      const result = await getCollaboratorById(collaboratorId);
      if (!result.success || !result.data) {
        toast.error("Colaborador não encontrado");
        return;
      }

      const data = result.data;
      
      // Garantir que as opções estejam carregadas antes de preencher o form
      await loadOptions();

      form.reset({
        name: data.nomeCompleto || "",
        cpf: data.cpf || "",
        birthDate: data.dataNascimento || "",
        gender: data.genero || undefined,
        maritalStatus: data.estadoCivil || undefined,
        corporateEmail: data.emailCorporativo || "",
        personalEmail: data.emailPessoal || "",
        mobilePhone: data.telefoneCelular || "",
        phone: data.telefoneFixo || "",
        cep: data.cep || "",
        street: data.logradouro || "",
        number: data.numero || "",
        complement: data.complemento || "",
        neighborhood: data.bairro || "",
        city: data.cidade || "",
        state: data.estado || undefined,
        registration: data.matricula || "",
        department: data.departamento?.nome || "",
        role: data.cargo?.titulo || "",
        unit: data.unidade?.nome || "",
        manager: data.gestor?.nomeCompleto || "",
        admissionDate: data.dataAdmissao || "",
        contractType: data.tipoContrato || undefined,
        workModel: data.regimeTrabalho || undefined,
        weeklyWorkload: data.cargaHorariaSemanal?.toString() || "",
        salary: data.salarioBase || "",
        bank: data.banco || undefined,
        agency: data.agencia || "",
        account: data.conta || "",
        accountType: data.tipoConta || "",
        pixKey: data.pix || "",
        // Documentos
        rg: data.rg || "",
        orgaoExpedidor: data.orgaoExpedidor || "",
        tituloEleitor: data.tituloEleitor || "",
        pisPasep: data.pisPasep || "",
        ctps: data.ctps || "",
        serieCtps: data.serieCtps || "",
      });
    } catch (error: any) {
      console.error("Erro ao carregar colaborador:", error);
      console.error("Stack trace:", error?.stack);
      toast.error(
        error?.message || "Erro ao carregar dados do colaborador"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && collaboratorId) {
        const result = await updateCollaborator({
          ...values,
          id: collaboratorId,
        });
        if (result.success) {
          toast.success("Colaborador atualizado com sucesso!");
          onSuccess?.();
          onOpenChange(false);
          form.reset(defaultValues);
          setTab("personal");
        }
      } else {
        const result = await createCollaborator(values);
        if (result.success) {
          toast.success("Colaborador cadastrado com sucesso!");
          onSuccess?.();
          onOpenChange(false);
          form.reset(defaultValues);
          setTab("personal");
        }
      }
    } catch (error: any) {
      console.error("Erro ao salvar colaborador:", error);
      toast.error(
        error?.message || "Erro ao salvar colaborador. Verifique os dados."
      );
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
          setTab("personal");
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar colaborador" : "Novo colaborador"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Atualize os dados do colaborador"
              : "Preencha os dados para cadastrar um novo colaborador"}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs value={tab} onValueChange={setTab} className="space-y-4">
                <TabsList className="flex flex-wrap gap-2 bg-transparent p-0">
                  <TabsTrigger
                    value="personal"
                    className="data-[state=active]:bg-accent"
                  >
                    Dados pessoais
                  </TabsTrigger>
                  <TabsTrigger
                    value="contact"
                    className="data-[state=active]:bg-accent"
                  >
                    Contato e endereço
                  </TabsTrigger>
                  <TabsTrigger
                    value="professional"
                    className="data-[state=active]:bg-accent"
                  >
                    Dados profissionais
                  </TabsTrigger>
                  <TabsTrigger
                    value="financial"
                    className="data-[state=active]:bg-accent"
                  >
                    Financeiro
                  </TabsTrigger>
                  <TabsTrigger
                    value="documents"
                    className="data-[state=active]:bg-accent"
                  >
                    Documentos
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="personal" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field>
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome completo</FormLabel>
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
                        name="cpf"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CPF</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="000.000.000-00" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Field>
                    <Field>
                      <FormField
                        control={form.control}
                        name="birthDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de nascimento</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Field>
                    <Field>
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gênero</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o gênero" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {genderOptions.map((option) => (
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
                        name="maritalStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado civil</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o estado civil" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {maritalStatusOptions.map((option) => (
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
                  </div>
                </TabsContent>
                <TabsContent value="contact" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field>
                      <FormField
                        control={form.control}
                        name="corporateEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail corporativo</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Field>
                    <Field>
                      <FormField
                        control={form.control}
                        name="personalEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail pessoal</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Field>
                    <Field>
                      <FormField
                        control={form.control}
                        name="mobilePhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Celular</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="(00) 00000-0000" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Field>
                    <Field>
                      <FormField
                        control={form.control}
                        name="phone"
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
                        name="street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Logradouro</FormLabel>
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
                        name="number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número</FormLabel>
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
                        name="complement"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Complemento</FormLabel>
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
                        name="neighborhood"
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
                        name="city"
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
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a UF" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {stateOptions.map((option) => (
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
                  </div>
                </TabsContent>
                <TabsContent value="professional" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field>
                      <FormField
                        control={form.control}
                        name="registration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Matrícula</FormLabel>
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
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Departamento</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o departamento" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {departments.map((dept) => (
                                  <SelectItem key={dept.id} value={dept.nome}>
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
                    <Field>
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cargo</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o cargo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {cargos.map((cargo) => (
                                  <SelectItem key={cargo.id} value={cargo.titulo}>
                                    {cargo.titulo}
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
                        name="unit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unidade</FormLabel>
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
                        name="manager"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gestor</FormLabel>
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
                        name="admissionDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de admissão</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Field>
                    <Field>
                      <FormField
                        control={form.control}
                        name="contractType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de contrato</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo de contrato" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {contractTypeOptions.map((option) => (
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
                        name="workModel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Regime de trabalho</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o regime" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {workModelOptions.map((option) => (
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
                        name="weeklyWorkload"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Carga horária semanal</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="40" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Field>
                  </div>
                </TabsContent>
                <TabsContent value="financial" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field>
                      <FormField
                        control={form.control}
                        name="salary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Salário base</FormLabel>
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
                        name="bank"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Banco</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o banco" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {bankOptions.map((option) => (
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
                        name="agency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Agência</FormLabel>
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
                        name="account"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Conta</FormLabel>
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
                        name="accountType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de conta</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Corrente, Poupança"
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
                        name="pixKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chave PIX</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Field>
                  </div>
                </TabsContent>
                <TabsContent value="documents" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field>
                      <FormField
                        control={form.control}
                        name="rg"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>RG</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="00.000.000-0" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Field>
                    <Field>
                      <FormField
                        control={form.control}
                        name="orgaoExpedidor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Órgão expedidor</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="SSP" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Field>
                    <Field>
                      <FormField
                        control={form.control}
                        name="tituloEleitor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título de eleitor</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="000000000000" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Field>
                    <Field>
                      <FormField
                        control={form.control}
                        name="pisPasep"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PIS/PASEP</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="000.00000.00-0" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Field>
                    <Field>
                      <FormField
                        control={form.control}
                        name="ctps"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CTPS</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="0000000" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Field>
                    <Field>
                      <FormField
                        control={form.control}
                        name="serieCtps"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Série CTPS</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="000" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Field>
                  </div>
                </TabsContent>
              </Tabs>
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
                    "Salvar e continuar"
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
