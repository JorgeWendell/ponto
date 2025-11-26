import { z } from "zod";

const genderValues = ["MASCULINO", "FEMININO"] as const;
const maritalStatusValues = ["SOLTEIRO", "CASADO", "DIVORCIADO", "VIUVO"] as const;
const stateValues = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;
const contractTypeValues = ["CLT", "PJ", "ESTAGIO", "CONTRATO"] as const;
const workModelValues = ["PRESENCIAL", "HIBRIDO", "HOME"] as const;
const bankValues = [
  "BANCO_DO_BRASIL", "CAIXA", "BRADESCO", "ITAU", "SANTANDER",
  "SICREDI", "SICOOB", "BANRISUL", "NUBANK", "INTER", "BTG",
  "C6", "ORIGINAL", "SAFRA", "MERCANTIL",
] as const;

export const createCollaboratorSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  cpf: z.string().min(11, "CPF é obrigatório"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  gender: z.enum(genderValues, { message: "Gênero é obrigatório" }),
  maritalStatus: z.enum(maritalStatusValues, { message: "Estado civil é obrigatório" }),
  corporateEmail: z.string().email("E-mail corporativo inválido"),
  personalEmail: z.string().email("E-mail pessoal inválido").optional().or(z.literal("")),
  mobilePhone: z.string().min(10, "Celular é obrigatório"),
  phone: z.string().optional().or(z.literal("")),
  cep: z.string().min(8, "CEP é obrigatório"),
  street: z.string().min(1, "Logradouro é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional().or(z.literal("")),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.enum(stateValues, { message: "UF é obrigatória" }),
  registration: z.string().min(1, "Matrícula é obrigatória"),
  department: z.string().min(1, "Departamento é obrigatório"),
  role: z.string().min(1, "Cargo é obrigatório"),
  unit: z.string().min(1, "Unidade é obrigatória"),
  manager: z.string().optional().or(z.literal("")),
  admissionDate: z.string().min(1, "Data de admissão é obrigatória"),
  contractType: z.enum(contractTypeValues, { message: "Tipo de contrato é obrigatório" }),
  workModel: z.enum(workModelValues, { message: "Regime é obrigatório" }),
  weeklyWorkload: z.string().min(1, "Carga horária é obrigatória"),
  salary: z.string().min(1, "Salário é obrigatório"),
  bank: z.enum(bankValues, { message: "Banco é obrigatório" }),
  agency: z.string().min(1, "Agência é obrigatória"),
  account: z.string().min(1, "Conta é obrigatória"),
  accountType: z.string().min(1, "Tipo de conta é obrigatório"),
  pixKey: z.string().optional().or(z.literal("")),
  // Documentos
  rg: z.string().optional().or(z.literal("")),
  orgaoExpedidor: z.string().optional().or(z.literal("")),
  tituloEleitor: z.string().optional().or(z.literal("")),
  pisPasep: z.string().optional().or(z.literal("")),
  ctps: z.string().optional().or(z.literal("")),
  serieCtps: z.string().optional().or(z.literal("")),
});

export type CreateCollaboratorInput = z.infer<typeof createCollaboratorSchema>;

