"use client";

import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { NewCollaboratorDialog } from "./components/new-collaborator-dialog";
import { CollaboratorsTable } from "./components/collaborators-table";
import { CargoDialog } from "./components/cargo-dialog";
import { CargosTable } from "./components/cargos-table";
import { DepartmentDialog } from "./components/department-dialog";
import { DepartmentsTable } from "./components/departments-table";
import { UnitDialog } from "./components/unit-dialog";
import { UnitsTable } from "./components/units-table";
import { PhotoFacialDialog } from "./components/photo-facial-dialog";

import { getCollaborators } from "@/actions/get-collaborators";
import { deactivateCollaborator } from "@/actions/deactivate-collaborator";
import { getDepartments } from "@/actions/get-departments";
import { getCargos } from "@/actions/get-cargos";
import { getUnits } from "@/actions/get-units";
import { deactivateCargo } from "@/actions/deactivate-cargo";
import { deactivateDepartment } from "@/actions/deactivate-department";
import { deactivateUnit } from "@/actions/deactivate-unit";

const CadastrosPage = () => {
  const [activeTab, setActiveTab] = useState("colaboradores");

  // Colaboradores
  const [isCollaboratorDialogOpen, setIsCollaboratorDialogOpen] = useState(false);
  const [editingCollaboratorId, setEditingCollaboratorId] = useState<string | null>(null);
  const [isPhotoFacialDialogOpen, setIsPhotoFacialDialogOpen] = useState(false);
  const [selectedCollaboratorForPhoto, setSelectedCollaboratorForPhoto] = useState<{
    id: string;
    name: string;
    avatarUrl?: string | null;
    facialUrl?: string | null;
  } | null>(null);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [cargoFilter, setCargoFilter] = useState("all");
  const [collaboratorPage, setCollaboratorPage] = useState(1);
  const [collaboratorTotalPages, setCollaboratorTotalPages] = useState(1);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [departments, setDepartments] = useState<any[]>([]);
  const [cargos, setCargos] = useState<any[]>([]);

  // Cargos
  const [isCargoDialogOpen, setIsCargoDialogOpen] = useState(false);
  const [editingCargoId, setEditingCargoId] = useState<string | null>(null);
  const [cargosList, setCargosList] = useState<any[]>([]);
  const [isLoadingCargos, setIsLoadingCargos] = useState(true);
  const [cargoSearch, setCargoSearch] = useState("");
  const [cargoNivelFilter, setCargoNivelFilter] = useState("all");
  const [cargoAtivoFilter, setCargoAtivoFilter] = useState<boolean | undefined>(undefined);
  const [cargoPage, setCargoPage] = useState(1);
  const [cargoTotalPages, setCargoTotalPages] = useState(1);
  const [cargoSortField, setCargoSortField] = useState("createdAt");
  const [cargoSortDirection, setCargoSortDirection] = useState<"asc" | "desc">("desc");

  // Departamentos
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [departmentPaiFilter, setDepartmentPaiFilter] = useState("all");
  const [departmentAtivoFilter, setDepartmentAtivoFilter] = useState<boolean | undefined>(undefined);
  const [departmentPage, setDepartmentPage] = useState(1);
  const [departmentTotalPages, setDepartmentTotalPages] = useState(1);
  const [departmentSortField, setDepartmentSortField] = useState("createdAt");
  const [departmentSortDirection, setDepartmentSortDirection] = useState<"asc" | "desc">("desc");

  // Unidades
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [unitsList, setUnitsList] = useState<any[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);
  const [unitSearch, setUnitSearch] = useState("");
  const [unitTipoFilter, setUnitTipoFilter] = useState("all");
  const [unitAtivoFilter, setUnitAtivoFilter] = useState<boolean | undefined>(undefined);
  const [unitPage, setUnitPage] = useState(1);
  const [unitTotalPages, setUnitTotalPages] = useState(1);
  const [unitSortField, setUnitSortField] = useState("createdAt");
  const [unitSortDirection, setUnitSortDirection] = useState<"asc" | "desc">("desc");

  // Carregar colaboradores
  const loadCollaborators = async () => {
    setIsLoadingCollaborators(true);
    try {
      const result = await getCollaborators({
        search,
        status: statusFilter !== "todos" ? statusFilter : undefined,
        departamentoId: departmentFilter && departmentFilter !== "all" ? departmentFilter : undefined,
        cargoId: cargoFilter && cargoFilter !== "all" ? cargoFilter : undefined,
        page: collaboratorPage,
        limit: 10,
        orderBy: sortField,
        orderDirection: sortDirection,
      });
      if (result.success) {
        setCollaborators(result.data || []);
        setCollaboratorTotalPages(result.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Erro ao carregar colaboradores:", error);
      toast.error("Erro ao carregar colaboradores");
    } finally {
      setIsLoadingCollaborators(false);
    }
  };

  // Carregar cargos
  const loadCargos = async () => {
    setIsLoadingCargos(true);
    try {
      const result = await getCargos({
        search: cargoSearch,
        nivel: cargoNivelFilter !== "all" ? cargoNivelFilter : undefined,
        ativo: cargoAtivoFilter,
        page: cargoPage,
        limit: 10,
        orderBy: cargoSortField,
        orderDirection: cargoSortDirection,
      });
      if (result.success) {
        setCargosList(result.data || []);
        setCargoTotalPages(result.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Erro ao carregar cargos:", error);
      toast.error("Erro ao carregar cargos");
    } finally {
      setIsLoadingCargos(false);
    }
  };

  // Carregar departamentos
  const loadDepartments = async () => {
    setIsLoadingDepartments(true);
    try {
      const result = await getDepartments({
        search: departmentSearch,
        departamentoPaiId: departmentPaiFilter !== "all" ? departmentPaiFilter : undefined,
        ativo: departmentAtivoFilter,
        page: departmentPage,
        limit: 10,
        orderBy: departmentSortField,
        orderDirection: departmentSortDirection,
      });
      if (result.success) {
        setDepartmentsList(result.data || []);
        setDepartmentTotalPages(result.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Erro ao carregar departamentos:", error);
      toast.error("Erro ao carregar departamentos");
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  // Carregar unidades
  const loadUnits = async () => {
    setIsLoadingUnits(true);
    try {
      const result = await getUnits({
        search: unitSearch,
        tipo: unitTipoFilter !== "all" ? unitTipoFilter : undefined,
        ativo: unitAtivoFilter,
        page: unitPage,
        limit: 10,
        orderBy: unitSortField,
        orderDirection: unitSortDirection,
      });
      if (result.success) {
        setUnitsList(result.data || []);
        setUnitTotalPages(result.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Erro ao carregar unidades:", error);
      toast.error("Erro ao carregar unidades");
    } finally {
      setIsLoadingUnits(false);
    }
  };

  const loadFilters = async () => {
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
      console.error("Erro ao carregar filtros:", error);
    }
  };

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    if (activeTab === "colaboradores") {
      loadCollaborators();
    } else if (activeTab === "cargos") {
      loadCargos();
    } else if (activeTab === "departamentos") {
      loadDepartments();
    } else if (activeTab === "unidades") {
      loadUnits();
    }
  }, [
    activeTab,
    search,
    statusFilter,
    departmentFilter,
    cargoFilter,
    collaboratorPage,
    sortField,
    sortDirection,
    cargoSearch,
    cargoNivelFilter,
    cargoAtivoFilter,
    cargoPage,
    cargoSortField,
    cargoSortDirection,
    departmentSearch,
    departmentPaiFilter,
    departmentAtivoFilter,
    departmentPage,
    departmentSortField,
    departmentSortDirection,
    unitSearch,
    unitTipoFilter,
    unitAtivoFilter,
    unitPage,
    unitSortField,
    unitSortDirection,
  ]);

  // Handlers Colaboradores
  const handleEditCollaborator = (id: string) => {
    setEditingCollaboratorId(id);
    setIsCollaboratorDialogOpen(true);
  };

  const handleDeleteCollaborator = async (id: string) => {
    try {
      const result = await deactivateCollaborator(id);
      if (result.success) {
        toast.success("Colaborador desativado com sucesso!");
        loadCollaborators();
      }
    } catch (error: any) {
      toast.error(error?.message || "Erro ao desativar colaborador");
    }
  };

  const handlePhotoFacial = (
    id: string,
    name: string,
    avatarUrl?: string | null,
    facialUrl?: string | null
  ) => {
    setSelectedCollaboratorForPhoto({ id, name, avatarUrl, facialUrl });
    setIsPhotoFacialDialogOpen(true);
  };

  // Handlers Cargos
  const handleEditCargo = (id: string) => {
    setEditingCargoId(id);
    setIsCargoDialogOpen(true);
  };

  const handleDeleteCargo = async (id: string) => {
    try {
      const result = await deactivateCargo(id);
      if (result.success) {
        toast.success("Cargo desativado com sucesso!");
        loadCargos();
        loadFilters();
      }
    } catch (error: any) {
      toast.error(error?.message || "Erro ao desativar cargo");
    }
  };

  // Handlers Departamentos
  const handleEditDepartment = (id: string) => {
    setEditingDepartmentId(id);
    setIsDepartmentDialogOpen(true);
  };

  const handleDeleteDepartment = async (id: string) => {
    try {
      const result = await deactivateDepartment(id);
      if (result.success) {
        toast.success("Departamento desativado com sucesso!");
        loadDepartments();
        loadFilters();
      }
    } catch (error: any) {
      toast.error(error?.message || "Erro ao desativar departamento");
    }
  };

  // Handlers Unidades
  const handleEditUnit = (id: string) => {
    setEditingUnitId(id);
    setIsUnitDialogOpen(true);
  };

  const handleDeleteUnit = async (id: string) => {
    try {
      const result = await deactivateUnit(id);
      if (result.success) {
        toast.success("Unidade desativada com sucesso!");
        loadUnits();
        loadFilters();
      }
    } catch (error: any) {
      toast.error(error?.message || "Erro ao desativar unidade");
    }
  };

  const handleSort = (field: string) => {
    if (activeTab === "colaboradores") {
      if (sortField === field) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
    } else if (activeTab === "cargos") {
      if (cargoSortField === field) {
        setCargoSortDirection(cargoSortDirection === "asc" ? "desc" : "asc");
      } else {
        setCargoSortField(field);
        setCargoSortDirection("asc");
      }
    } else if (activeTab === "departamentos") {
      if (departmentSortField === field) {
        setDepartmentSortDirection(departmentSortDirection === "asc" ? "desc" : "asc");
      } else {
        setDepartmentSortField(field);
        setDepartmentSortDirection("asc");
      }
    } else if (activeTab === "unidades") {
      if (unitSortField === field) {
        setUnitSortDirection(unitSortDirection === "asc" ? "desc" : "asc");
      } else {
        setUnitSortField(field);
        setUnitSortDirection("asc");
      }
    }
  };

  const getCurrentSortField = () => {
    if (activeTab === "colaboradores") return sortField;
    if (activeTab === "cargos") return cargoSortField;
    if (activeTab === "departamentos") return departmentSortField;
    return unitSortField;
  };

  const getCurrentSortDirection = () => {
    if (activeTab === "colaboradores") return sortDirection;
    if (activeTab === "cargos") return cargoSortDirection;
    if (activeTab === "departamentos") return departmentSortDirection;
    return unitSortDirection;
  };

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-semibold text-foreground">Cadastros</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie colaboradores, cargos e departamentos
          </p>
        </div>
        {activeTab === "colaboradores" && (
          <Button
            className="bg-foreground text-background hover:bg-foreground/90 rounded-lg"
            onClick={() => {
              setEditingCollaboratorId(null);
              setIsCollaboratorDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo colaborador
          </Button>
        )}
        {activeTab === "cargos" && (
          <Button
            className="bg-foreground text-background hover:bg-foreground/90 rounded-lg"
            onClick={() => {
              setEditingCargoId(null);
              setIsCargoDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo cargo
          </Button>
        )}
        {activeTab === "departamentos" && (
          <Button
            className="bg-foreground text-background hover:bg-foreground/90 rounded-lg"
            onClick={() => {
              setEditingDepartmentId(null);
              setIsDepartmentDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo departamento
          </Button>
        )}
        {activeTab === "unidades" && (
          <Button
            className="bg-foreground text-background hover:bg-foreground/90 rounded-lg"
            onClick={() => {
              setEditingUnitId(null);
              setIsUnitDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova unidade
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="colaboradores">Colaboradores</TabsTrigger>
          <TabsTrigger value="cargos">Cargos</TabsTrigger>
          <TabsTrigger value="departamentos">Departamentos</TabsTrigger>
          <TabsTrigger value="unidades">Unidades</TabsTrigger>
        </TabsList>

        <TabsContent value="colaboradores" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, matrícula ou e-mail..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setCollaboratorPage(1);
                      }}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setCollaboratorPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="afastado">Afastado</SelectItem>
                    <SelectItem value="demitido">Demitido</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={departmentFilter}
                  onValueChange={(value) => {
                    setDepartmentFilter(value);
                    setCollaboratorPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os departamentos</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={cargoFilter}
                  onValueChange={(value) => {
                    setCargoFilter(value);
                    setCollaboratorPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os cargos</SelectItem>
                    {cargos.map((cargo) => (
                      <SelectItem key={cargo.id} value={cargo.id}>
                        {cargo.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <CollaboratorsTable
                collaborators={collaborators}
                isLoading={isLoadingCollaborators}
                onEdit={handleEditCollaborator}
                onDelete={handleDeleteCollaborator}
                onPhotoFacial={handlePhotoFacial}
                onSort={handleSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />
            </CardContent>
          </Card>

          {collaboratorTotalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Página {collaboratorPage} de {collaboratorTotalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCollaboratorPage((p) => Math.max(1, p - 1))}
                  disabled={collaboratorPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCollaboratorPage((p) => Math.min(collaboratorTotalPages, p + 1))}
                  disabled={collaboratorPage === collaboratorTotalPages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="cargos" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por código ou título..."
                      value={cargoSearch}
                      onChange={(e) => {
                        setCargoSearch(e.target.value);
                        setCargoPage(1);
                      }}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select
                  value={cargoNivelFilter}
                  onValueChange={(value) => {
                    setCargoNivelFilter(value);
                    setCargoPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os níveis</SelectItem>
                    <SelectItem value="Júnior">Júnior</SelectItem>
                    <SelectItem value="Pleno">Pleno</SelectItem>
                    <SelectItem value="Sênior">Sênior</SelectItem>
                    <SelectItem value="Especialista">Especialista</SelectItem>
                    <SelectItem value="Gerente">Gerente</SelectItem>
                    <SelectItem value="Diretor">Diretor</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={cargoAtivoFilter === undefined ? "all" : cargoAtivoFilter ? "ativo" : "inativo"}
                  onValueChange={(value) => {
                    setCargoAtivoFilter(
                      value === "all" ? undefined : value === "ativo"
                    );
                    setCargoPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <CargosTable
                cargos={cargosList}
                isLoading={isLoadingCargos}
                onEdit={handleEditCargo}
                onDelete={handleDeleteCargo}
                onSort={handleSort}
                sortField={cargoSortField}
                sortDirection={cargoSortDirection}
              />
            </CardContent>
          </Card>

          {cargoTotalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Página {cargoPage} de {cargoTotalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCargoPage((p) => Math.max(1, p - 1))}
                  disabled={cargoPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCargoPage((p) => Math.min(cargoTotalPages, p + 1))}
                  disabled={cargoPage === cargoTotalPages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="departamentos" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por código ou nome..."
                      value={departmentSearch}
                      onChange={(e) => {
                        setDepartmentSearch(e.target.value);
                        setDepartmentPage(1);
                      }}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select
                  value={departmentPaiFilter}
                  onValueChange={(value) => {
                    setDepartmentPaiFilter(value);
                    setDepartmentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Departamento Pai" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={departmentAtivoFilter === undefined ? "all" : departmentAtivoFilter ? "ativo" : "inativo"}
                  onValueChange={(value) => {
                    setDepartmentAtivoFilter(
                      value === "all" ? undefined : value === "ativo"
                    );
                    setDepartmentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <DepartmentsTable
                departments={departmentsList}
                isLoading={isLoadingDepartments}
                onEdit={handleEditDepartment}
                onDelete={handleDeleteDepartment}
                onSort={handleSort}
                sortField={departmentSortField}
                sortDirection={departmentSortDirection}
              />
            </CardContent>
          </Card>

          {departmentTotalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Página {departmentPage} de {departmentTotalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDepartmentPage((p) => Math.max(1, p - 1))}
                  disabled={departmentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDepartmentPage((p) => Math.min(departmentTotalPages, p + 1))}
                  disabled={departmentPage === departmentTotalPages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="unidades" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por código ou nome..."
                      value={unitSearch}
                      onChange={(e) => {
                        setUnitSearch(e.target.value);
                        setUnitPage(1);
                      }}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select
                  value={unitTipoFilter}
                  onValueChange={(value) => {
                    setUnitTipoFilter(value);
                    setUnitPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="Matriz">Matriz</SelectItem>
                    <SelectItem value="Filial">Filial</SelectItem>
                    <SelectItem value="Escritório">Escritório</SelectItem>
                    <SelectItem value="Fábrica">Fábrica</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={unitAtivoFilter === undefined ? "all" : unitAtivoFilter ? "ativo" : "inativo"}
                  onValueChange={(value) => {
                    setUnitAtivoFilter(
                      value === "all" ? undefined : value === "ativo"
                    );
                    setUnitPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <UnitsTable
                units={unitsList}
                isLoading={isLoadingUnits}
                onEdit={handleEditUnit}
                onDelete={handleDeleteUnit}
                onSort={handleSort}
                sortField={unitSortField}
                sortDirection={unitSortDirection}
              />
            </CardContent>
          </Card>

          {unitTotalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Página {unitPage} de {unitTotalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUnitPage((p) => Math.max(1, p - 1))}
                  disabled={unitPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUnitPage((p) => Math.min(unitTotalPages, p + 1))}
                  disabled={unitPage === unitTotalPages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <NewCollaboratorDialog
        open={isCollaboratorDialogOpen}
        onOpenChange={(open) => {
          setIsCollaboratorDialogOpen(open);
          if (!open) {
            setEditingCollaboratorId(null);
          }
        }}
        collaboratorId={editingCollaboratorId}
        onSuccess={() => {
          loadCollaborators();
          loadFilters();
        }}
      />

      <CargoDialog
        open={isCargoDialogOpen}
        onOpenChange={(open) => {
          setIsCargoDialogOpen(open);
          if (!open) {
            setEditingCargoId(null);
          }
        }}
        cargoId={editingCargoId}
        onSuccess={() => {
          loadCargos();
          loadFilters();
        }}
      />

      <DepartmentDialog
        open={isDepartmentDialogOpen}
        onOpenChange={(open) => {
          setIsDepartmentDialogOpen(open);
          if (!open) {
            setEditingDepartmentId(null);
          }
        }}
        departmentId={editingDepartmentId}
        onSuccess={() => {
          loadDepartments();
          loadFilters();
        }}
      />

      <UnitDialog
        open={isUnitDialogOpen}
        onOpenChange={(open) => {
          setIsUnitDialogOpen(open);
          if (!open) {
            setEditingUnitId(null);
          }
        }}
        unitId={editingUnitId}
        onSuccess={() => {
          loadUnits();
          loadFilters();
        }}
      />

      {selectedCollaboratorForPhoto && (
        <PhotoFacialDialog
          open={isPhotoFacialDialogOpen}
          onOpenChange={(open) => {
            setIsPhotoFacialDialogOpen(open);
            if (!open) {
              setSelectedCollaboratorForPhoto(null);
            }
          }}
          collaboratorId={selectedCollaboratorForPhoto.id}
          collaboratorName={selectedCollaboratorForPhoto.name}
          currentAvatarUrl={selectedCollaboratorForPhoto.avatarUrl}
          currentFacialUrl={selectedCollaboratorForPhoto.facialUrl}
          onSuccess={() => {
            loadCollaborators();
          }}
        />
      )}
    </div>
  );
};

export default CadastrosPage;
