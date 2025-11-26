import { getCollaborators } from "@/actions/get-collaborators";
import { getMarcacoesDia } from "@/actions/get-marcacoes-hoje";
import { getDepartments } from "@/actions/get-departments";
import { FrequenciaPageClient } from "./components/frequencia-page-client";

export default async function FrequenciaPage({
  searchParams,
}: {
  searchParams?: Promise<{ data?: string }>;
}) {
  const today = new Date();
  const defaultDate = today.toISOString().slice(0, 10);
  const params = await searchParams;
  const selectedDate = params?.data || defaultDate;

  const result = await getCollaborators({
    status: "ativo",
    orderBy: "nome",
    orderDirection: "asc",
    limit: 100,
  });

  const colaboradoresRaw = result.success ? result.data : [];

  const colaboradores = colaboradoresRaw.map((colaborador) => ({
    id: colaborador.id,
    nome: colaborador.nomeCompleto,
    cargo: colaborador.cargo?.titulo ?? null,
    equipe: colaborador.departamento?.nome ?? null,
    departamentoId: colaborador.departamento?.id ?? null,
    avatarUrl: colaborador.avatarUrl,
  }));

  const departmentsResult = await getDepartments({
    ativo: true,
    limit: 100,
    orderBy: "nome",
    orderDirection: "asc",
  });

  const departamentos =
    departmentsResult.success && departmentsResult.data
      ? departmentsResult.data.map((dept) => ({
          id: dept.id,
          nome: dept.nome,
        }))
      : [];

  const marcacoesEntries = await Promise.all(
    colaboradores.map(async (colaborador) => {
      const res = await getMarcacoesDia(colaborador.id, selectedDate);
      return [colaborador.id, res.success ? res.data : []] as const;
    })
  );

  const marcacoesPorColaborador = Object.fromEntries(marcacoesEntries);

  return (
    <FrequenciaPageClient
      colaboradores={colaboradores}
      marcacoesPorColaborador={marcacoesPorColaborador}
      selectedDate={selectedDate}
      departamentos={departamentos}
    />
  );
}
