import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const genderEnum = pgEnum("gender_enum", ["MASCULINO", "FEMININO"]);

export const maritalStatusEnum = pgEnum("marital_status_enum", [
  "SOLTEIRO",
  "CASADO",
  "DIVORCIADO",
  "VIUVO",
]);

export const stateEnum = pgEnum("state_enum", [
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
]);

export const contractTypeEnum = pgEnum("contract_type_enum", [
  "CLT",
  "PJ",
  "ESTAGIO",
  "CONTRATO",
]);

export const workModeEnum = pgEnum("work_mode_enum", [
  "PRESENCIAL",
  "HIBRIDO",
  "HOME",
]);

export const bankEnum = pgEnum("bank_enum", [
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
]);

export const tipoMarcacaoEnum = pgEnum("tipo_marcacao_enum", [
  "ENTRADA",
  "SAIDA",
  "ENTRADA_ALMOCO",
  "VOLTA_ALMOCO",
]);

export const metodoMarcacaoEnum = pgEnum("metodo_marcacao_enum", [
  "FACIAL",
  "MANUAL",
  "QRCODE",
]);

export const statusMarcacaoEnum = pgEnum("status_marcacao_enum", [
  "PENDENTE",
  "CONFIRMADO",
  "REJEITADO",
]);

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  role: varchar("role", { length: 50 }).notNull().default("admin"),
  ativo: boolean("ativo").default(true),
  ultimoAcesso: timestamp("ultimo_acesso", { withTimezone: true }),
  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const accountsTable = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verificationsTable = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const departamentosTable = pgTable("departamentos", {
  id: text("id").primaryKey(),
  codigo: varchar("codigo", { length: 20 }).notNull().unique(),
  nome: varchar("nome", { length: 100 }).notNull(),
  descricao: text("descricao"),
  departamentoPaiId: text("departamento_pai_id").references(
    (): AnyPgColumn => departamentosTable.id
  ),
  gestorId: text("gestor_id"),
  centroCusto: varchar("centro_custo", { length: 50 }),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const cargosTable = pgTable("cargos", {
  id: text("id").primaryKey(),
  codigo: varchar("codigo", { length: 20 }).notNull().unique(),
  titulo: varchar("titulo", { length: 100 }).notNull(),
  descricao: text("descricao"),
  nivel: varchar("nivel", { length: 50 }), // Júnior, Pleno, Sênior, Especialista, Gerente, Diretor
  cbo: varchar("cbo", { length: 10 }), // Código Brasileiro de Ocupações
  salarioMinimo: decimal("salario_minimo", { precision: 10, scale: 2 }),
  salarioMaximo: decimal("salario_maximo", { precision: 10, scale: 2 }),
  escolaridadeMinima: varchar("escolaridade_minima", { length: 100 }),
  experienciaMinimaAnos: integer("experiencia_minima_anos"),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const unidadesTable = pgTable("unidades", {
  id: text("id").primaryKey(),
  codigo: varchar("codigo", { length: 20 }).notNull().unique(),
  nome: varchar("nome", { length: 100 }).notNull(),
  tipo: varchar("tipo", { length: 50 }), // Matriz, Filial, Escritório, Fábrica
  // Endereço
  cep: varchar("cep", { length: 9 }),
  logradouro: varchar("logradouro", { length: 200 }),
  numero: varchar("numero", { length: 10 }),
  complemento: varchar("complemento", { length: 100 }),
  bairro: varchar("bairro", { length: 100 }),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  // Contato
  telefone: varchar("telefone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const colaboradoresTable = pgTable(
  "colaboradores",
  {
    // Identificação
    id: text("id").primaryKey(),
    matricula: varchar("matricula", { length: 20 }).notNull().unique(),
    cpf: varchar("cpf", { length: 14 }).notNull().unique(),

    // Dados Pessoais
    nomeCompleto: varchar("nome_completo", { length: 200 }).notNull(),
    nomeSocial: varchar("nome_social", { length: 200 }),
    dataNascimento: date("data_nascimento").notNull(),
    genero: genderEnum("genero"),
    estadoCivil: maritalStatusEnum("estado_civil"),

    // Documentos
    rg: varchar("rg", { length: 20 }),
    orgaoExpedidor: varchar("orgao_expedidor", { length: 20 }),
    tituloEleitor: varchar("titulo_eleitor", { length: 20 }),
    pisPasep: varchar("pis_pasep", { length: 20 }),
    ctps: varchar("ctps", { length: 20 }),
    serieCtps: varchar("serie_ctps", { length: 10 }),

    // Contato
    emailCorporativo: varchar("email_corporativo", { length: 255 })
      .notNull()
      .unique(),
    emailPessoal: varchar("email_pessoal", { length: 255 }),
    telefoneCelular: varchar("telefone_celular", { length: 20 }),
    telefoneFixo: varchar("telefone_fixo", { length: 20 }),

    // Endereço
    cep: varchar("cep", { length: 9 }),
    logradouro: varchar("logradouro", { length: 200 }),
    numero: varchar("numero", { length: 10 }),
    complemento: varchar("complemento", { length: 100 }),
    bairro: varchar("bairro", { length: 100 }),
    cidade: varchar("cidade", { length: 100 }),
    estado: stateEnum("estado"),
    pais: varchar("pais", { length: 100 }).default("Brasil"),

    // Dados Profissionais
    cargoId: text("cargo_id").references(() => cargosTable.id),
    departamentoId: text("departamento_id").references(
      () => departamentosTable.id
    ),
    gestorId: text("gestor_id").references(
      (): AnyPgColumn => colaboradoresTable.id,
      { onDelete: "cascade" }
    ),
    unidadeId: text("unidade_id").references(() => unidadesTable.id),

    dataAdmissao: date("data_admissao").notNull(),
    dataDemissao: date("data_demissao"),
    tipoContrato: contractTypeEnum("tipo_contrato").notNull(),
    regimeTrabalho: workModeEnum("regime_trabalho").notNull(),
    cargaHorariaSemanal: integer("carga_horaria_semanal").default(40),

    // Remuneração
    salarioBase: decimal("salario_base", { precision: 10, scale: 2 }),
    nivelSalarial: varchar("nivel_salarial", { length: 50 }),

    // Banco (para pagamento)
    banco: bankEnum("banco"),
    agencia: varchar("agencia", { length: 10 }),
    conta: varchar("conta", { length: 20 }),
    tipoConta: varchar("tipo_conta", { length: 20 }), // Corrente, Poupança
    pix: varchar("pix", { length: 100 }),

    // Sistema
    fotoUrl: text("foto_url"),
    avatarUrl: text("avatar_url"),
    usuarioId: text("usuario_id").references(() => usersTable.id),
    status: varchar("status", { length: 50 }).default("ativo"), // ativo, inativo, afastado, demitido

    // Controle
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    emailIdx: index("idx_colaboradores_email").on(table.emailCorporativo),
    cpfIdx: index("idx_colaboradores_cpf").on(table.cpf),
    matriculaIdx: index("idx_colaboradores_matricula").on(table.matricula),
    statusIdx: index("idx_colaboradores_status").on(table.status),
    departamentoIdx: index("idx_colaboradores_departamento").on(
      table.departamentoId
    ),
    cargoIdx: index("idx_colaboradores_cargo").on(table.cargoId),
    gestorIdx: index("idx_colaboradores_gestor").on(table.gestorId),
  })
);

// ============================================
// TABELAS RELACIONADAS
// ============================================

export const dependentesTable = pgTable("dependentes", {
  id: text("id").primaryKey(),
  colaboradorId: text("colaborador_id")
    .references(() => colaboradoresTable.id, { onDelete: "cascade" })
    .notNull(),
  nomeCompleto: varchar("nome_completo", { length: 200 }).notNull(),
  dataNascimento: date("data_nascimento").notNull(),
  cpf: varchar("cpf", { length: 14 }),
  parentesco: varchar("parentesco", { length: 50 }).notNull(), // Filho(a), Cônjuge, Pai, Mãe, Outro
  dependenteIr: boolean("dependente_ir").default(false),
  dependentePlanoSaude: boolean("dependente_plano_saude").default(false),
  numeroCarteirinha: varchar("numero_carteirinha", { length: 50 }),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const documentosColaboradorTable = pgTable("documentos_colaborador", {
  id: text("id").primaryKey(),
  colaboradorId: text("colaborador_id")
    .references(() => colaboradoresTable.id, { onDelete: "cascade" })
    .notNull(),
  tipo: varchar("tipo", { length: 100 }).notNull(), // Contrato, Exame Admissional, Diploma
  titulo: varchar("titulo", { length: 200 }).notNull(),
  descricao: text("descricao"),
  arquivoUrl: text("arquivo_url").notNull(),
  arquivoNome: varchar("arquivo_nome", { length: 255 }),
  arquivoTamanho: integer("arquivo_tamanho"),
  arquivoTipo: varchar("arquivo_tipo", { length: 100 }),
  dataDocumento: date("data_documento"),
  dataValidade: date("data_validade"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const historicoCargosTable = pgTable("historico_cargos", {
  id: text("id").primaryKey(),
  colaboradorId: text("colaborador_id")
    .references(() => colaboradoresTable.id, { onDelete: "cascade" })
    .notNull(),
  cargoAnteriorId: text("cargo_anterior_id").references(() => cargosTable.id),
  cargoNovoId: text("cargo_novo_id").references(() => cargosTable.id),
  departamentoAnteriorId: text("departamento_anterior_id").references(
    () => departamentosTable.id
  ),
  departamentoNovoId: text("departamento_novo_id").references(
    () => departamentosTable.id
  ),
  tipoMovimentacao: varchar("tipo_movimentacao", { length: 50 }), // Promoção, Transferência, Rebaixamento
  dataMovimentacao: date("data_movimentacao").notNull(),
  salarioAnterior: decimal("salario_anterior", { precision: 10, scale: 2 }),
  salarioNovo: decimal("salario_novo", { precision: 10, scale: 2 }),
  motivo: text("motivo"),
  observacoes: text("observacoes"),
  aprovadoPor: text("aprovado_por").references(() => usersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const beneficiosTable = pgTable("beneficios", {
  id: text("id").primaryKey(),
  codigo: varchar("codigo", { length: 20 }).notNull().unique(),
  nome: varchar("nome", { length: 100 }).notNull(),
  descricao: text("descricao"),
  tipo: varchar("tipo", { length: 50 }), // Vale Transporte, Vale Refeição, Plano de Saúde
  valorPadrao: decimal("valor_padrao", { precision: 10, scale: 2 }),
  obrigatorio: boolean("obrigatorio").default(false),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const colaboradorBeneficiosTable = pgTable(
  "colaborador_beneficios",
  {
    id: text("id").primaryKey(),
    colaboradorId: text("colaborador_id")
      .references(() => colaboradoresTable.id, { onDelete: "cascade" })
      .notNull(),
    beneficioId: text("beneficio_id")
      .references(() => beneficiosTable.id)
      .notNull(),
    dataInicio: date("data_inicio").notNull(),
    dataFim: date("data_fim"),
    valorMensal: decimal("valor_mensal", { precision: 10, scale: 2 }),
    ativo: boolean("ativo").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    uniqueColabBeneficio: uniqueIndex("unique_colab_beneficio").on(
      table.colaboradorId,
      table.beneficioId
    ),
  })
);

export const formacoesAcademicasTable = pgTable("formacoes_academicas", {
  id: text("id").primaryKey(),
  colaboradorId: text("colaborador_id")
    .references(() => colaboradoresTable.id, { onDelete: "cascade" })
    .notNull(),
  nivel: varchar("nivel", { length: 50 }).notNull(), // Fundamental, Médio, Técnico, Superior, Pós, Mestrado
  instituicao: varchar("instituicao", { length: 200 }).notNull(),
  curso: varchar("curso", { length: 200 }),
  area: varchar("area", { length: 100 }),
  situacao: varchar("situacao", { length: 50 }), // Cursando, Completo, Incompleto, Trancado
  dataInicio: date("data_inicio"),
  dataConclusao: date("data_conclusao"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const experienciasProfissionaisTable = pgTable(
  "experiencias_profissionais",
  {
    id: text("id").primaryKey(),
    colaboradorId: text("colaborador_id")
      .references(() => colaboradoresTable.id, { onDelete: "cascade" })
      .notNull(),
    empresa: varchar("empresa", { length: 200 }).notNull(),
    cargo: varchar("cargo", { length: 100 }).notNull(),
    descricaoAtividades: text("descricao_atividades"),
    dataInicio: date("data_inicio").notNull(),
    dataFim: date("data_fim"),
    empregoAtual: boolean("emprego_atual").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  }
);

export const contatosEmergenciaTable = pgTable("contatos_emergencia", {
  id: text("id").primaryKey(),
  colaboradorId: text("colaborador_id")
    .references(() => colaboradoresTable.id, { onDelete: "cascade" })
    .notNull(),
  nome: varchar("nome", { length: 200 }).notNull(),
  parentesco: varchar("parentesco", { length: 50 }).notNull(),
  telefonePrincipal: varchar("telefone_principal", { length: 20 }).notNull(),
  telefoneSecundario: varchar("telefone_secundario", { length: 20 }),
  email: varchar("email", { length: 255 }),
  ordemPrioridade: integer("ordem_prioridade").default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const solicitacoesFeriasTable = pgTable(
  "solicitacoes_ferias",
  {
    id: text("id").primaryKey(),
    colaboradorId: text("colaborador_id")
      .references(() => colaboradoresTable.id, { onDelete: "cascade" })
      .notNull(),
    dataInicio: date("data_inicio").notNull(),
    dataFim: date("data_fim").notNull(),
    totalDias: integer("total_dias").notNull(),
    observacoes: text("observacoes"),
    status: varchar("status", { length: 50 }).notNull().default("pendente"),
    urgencia: varchar("urgencia", { length: 50 }).default("baixa"),
    aprovadoPor: text("aprovado_por").references(() => usersTable.id),
    dataAprovacao: timestamp("data_aprovacao", { withTimezone: true }),
    motivoRejeicao: text("motivo_rejeicao"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    colaboradorIdx: index("idx_solicitacoes_ferias_colaborador").on(
      table.colaboradorId
    ),
    statusIdx: index("idx_solicitacoes_ferias_status").on(table.status),
  })
);

export const marcacoesPontoTable = pgTable(
  "marcacoes_ponto",
  {
    id: text("id").primaryKey(),
    colaboradorId: text("colaborador_id")
      .references(() => colaboradoresTable.id, { onDelete: "cascade" })
      .notNull(),
    tipo: tipoMarcacaoEnum("tipo").notNull(),
    dataHora: timestamp("data_hora", { withTimezone: true }).notNull(),
    metodo: metodoMarcacaoEnum("metodo").notNull(),
    fotoCapturadaUrl: text("foto_capturada_url"), // Para auditoria
    localizacaoLatitude: decimal("localizacao_latitude", {
      precision: 10,
      scale: 8,
    }),
    localizacaoLongitude: decimal("localizacao_longitude", {
      precision: 11,
      scale: 8,
    }),
    dispositivoInfo: text("dispositivo_info"), // User agent, IP, etc
    status: statusMarcacaoEnum("status").notNull().default("PENDENTE"),
    justificativa: text("justificativa"), // Para marcações manuais
    aprovadoPor: text("aprovado_por").references(() => usersTable.id), // Se manual, precisa aprovação
    dataAprovacao: timestamp("data_aprovacao", { withTimezone: true }),
    motivoRejeicao: text("motivo_rejeicao"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    colaboradorIdx: index("idx_marcacoes_ponto_colaborador").on(
      table.colaboradorId
    ),
    dataHoraIdx: index("idx_marcacoes_ponto_data_hora").on(table.dataHora),
    tipoIdx: index("idx_marcacoes_ponto_tipo").on(table.tipo),
    statusIdx: index("idx_marcacoes_ponto_status").on(table.status),
    colaboradorDataIdx: index("idx_marcacoes_ponto_colaborador_data").on(
      table.colaboradorId,
      table.dataHora
    ),
  })
);

// ============================================
// RELAÇÕES (Relations)
// ============================================

export const colaboradoresRelations = relations(
  colaboradoresTable,
  ({ one, many }) => ({
    usuario: one(usersTable, {
      fields: [colaboradoresTable.usuarioId],
      references: [usersTable.id],
    }),
    cargo: one(cargosTable, {
      fields: [colaboradoresTable.cargoId],
      references: [cargosTable.id],
    }),
    departamento: one(departamentosTable, {
      fields: [colaboradoresTable.departamentoId],
      references: [departamentosTable.id],
    }),
    gestor: one(colaboradoresTable, {
      fields: [colaboradoresTable.gestorId],
      references: [colaboradoresTable.id],
      relationName: "gestorColaborador",
    }),
    subordinados: many(colaboradoresTable, {
      relationName: "gestorColaborador",
    }),
    unidade: one(unidadesTable, {
      fields: [colaboradoresTable.unidadeId],
      references: [unidadesTable.id],
    }),
    dependentes: many(dependentesTable),
    documentos: many(documentosColaboradorTable),
    historicoCargos: many(historicoCargosTable),
    beneficios: many(colaboradorBeneficiosTable),
    formacoesAcademicas: many(formacoesAcademicasTable),
    experienciasProfissionais: many(experienciasProfissionaisTable),
    contatosEmergencia: many(contatosEmergenciaTable),
    marcacoesPonto: many(marcacoesPontoTable),
  })
);

export const departamentosRelations = relations(
  departamentosTable,
  ({ one, many }) => ({
    departamentoPai: one(departamentosTable, {
      fields: [departamentosTable.departamentoPaiId],
      references: [departamentosTable.id],
      relationName: "subdepartamentos",
    }),
    subdepartamentos: many(departamentosTable, {
      relationName: "subdepartamentos",
    }),
    colaboradores: many(colaboradoresTable),
  })
);

export const cargosRelations = relations(cargosTable, ({ many }) => ({
  colaboradores: many(colaboradoresTable),
}));

export const unidadesRelations = relations(unidadesTable, ({ many }) => ({
  colaboradores: many(colaboradoresTable),
}));

export const usuariosRelations = relations(usersTable, ({ one }) => ({
  colaborador: one(colaboradoresTable, {
    fields: [usersTable.id],
    references: [colaboradoresTable.usuarioId],
  }),
}));

export const dependentesRelations = relations(dependentesTable, ({ one }) => ({
  colaborador: one(colaboradoresTable, {
    fields: [dependentesTable.colaboradorId],
    references: [colaboradoresTable.id],
  }),
}));

export const beneficiosRelations = relations(beneficiosTable, ({ many }) => ({
  colaboradorBeneficios: many(colaboradorBeneficiosTable),
}));

export const colaboradorBeneficiosRelations = relations(
  colaboradorBeneficiosTable,
  ({ one }) => ({
    colaborador: one(colaboradoresTable, {
      fields: [colaboradorBeneficiosTable.colaboradorId],
      references: [colaboradoresTable.id],
    }),
    beneficio: one(beneficiosTable, {
      fields: [colaboradorBeneficiosTable.beneficioId],
      references: [beneficiosTable.id],
    }),
  })
);

export const solicitacoesFeriasRelations = relations(
  solicitacoesFeriasTable,
  ({ one }) => ({
    colaborador: one(colaboradoresTable, {
      fields: [solicitacoesFeriasTable.colaboradorId],
      references: [colaboradoresTable.id],
    }),
    aprovador: one(usersTable, {
      fields: [solicitacoesFeriasTable.aprovadoPor],
      references: [usersTable.id],
    }),
  })
);

export const colaboradoresFeriasRelations = relations(
  colaboradoresTable,
  ({ many }) => ({
    solicitacoesFerias: many(solicitacoesFeriasTable),
  })
);

export const marcacoesPontoRelations = relations(
  marcacoesPontoTable,
  ({ one }) => ({
    colaborador: one(colaboradoresTable, {
      fields: [marcacoesPontoTable.colaboradorId],
      references: [colaboradoresTable.id],
    }),
    aprovador: one(usersTable, {
      fields: [marcacoesPontoTable.aprovadoPor],
      references: [usersTable.id],
    }),
  })
);

// ============================================
// TYPES (útil para TypeScript)
// ============================================

export type Usuario = typeof usersTable.$inferSelect;
export type NovoUsuario = typeof usersTable.$inferInsert;

export type Colaborador = typeof colaboradoresTable.$inferSelect;
export type NovoColaborador = typeof colaboradoresTable.$inferInsert;

export type Departamento = typeof departamentosTable.$inferSelect;
export type NovoDepartamento = typeof departamentosTable.$inferInsert;

export type Cargo = typeof cargosTable.$inferSelect;
export type NovoCargo = typeof cargosTable.$inferInsert;

export type Unidade = typeof unidadesTable.$inferSelect;
export type NovaUnidade = typeof unidadesTable.$inferInsert;

export type Dependente = typeof dependentesTable.$inferSelect;
export type NovoDependente = typeof dependentesTable.$inferInsert;

export type Beneficio = typeof beneficiosTable.$inferSelect;
export type NovoBeneficio = typeof beneficiosTable.$inferInsert;

export type ColaboradorBeneficio =
  typeof colaboradorBeneficiosTable.$inferSelect;
export type NovoColaboradorBeneficio =
  typeof colaboradorBeneficiosTable.$inferInsert;

export type FormacaoAcademica = typeof formacoesAcademicasTable.$inferSelect;
export type NovaFormacaoAcademica =
  typeof formacoesAcademicasTable.$inferInsert;

export type ExperienciaProfissional =
  typeof experienciasProfissionaisTable.$inferSelect;
export type NovaExperienciaProfissional =
  typeof experienciasProfissionaisTable.$inferInsert;

export type ContatoEmergencia = typeof contatosEmergenciaTable.$inferSelect;
export type NovoContatoEmergencia = typeof contatosEmergenciaTable.$inferInsert;

export type HistoricoCargo = typeof historicoCargosTable.$inferSelect;
export type NovoHistoricoCargo = typeof historicoCargosTable.$inferInsert;

export type DocumentoColaborador =
  typeof documentosColaboradorTable.$inferSelect;
export type NovoDocumentoColaborador =
  typeof documentosColaboradorTable.$inferInsert;

export type SolicitacaoFerias = typeof solicitacoesFeriasTable.$inferSelect;
export type NovoSolicitacaoFerias = typeof solicitacoesFeriasTable.$inferInsert;

export type MarcacaoPonto = typeof marcacoesPontoTable.$inferSelect;
export type NovaMarcacaoPonto = typeof marcacoesPontoTable.$inferInsert;
