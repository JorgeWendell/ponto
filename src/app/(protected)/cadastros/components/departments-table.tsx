"use client";

import { ArrowUpDown, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface Departamento {
  id: string;
  codigo: string;
  nome: string;
  departamentoPai: {
    id: string;
    nome: string;
  } | null;
  gestor: {
    id: string;
    nomeCompleto: string;
  } | null;
  centroCusto: string | null;
  ativo: boolean;
  totalColaboradores: number;
}

interface DepartmentsTableProps {
  departments: Departamento[];
  isLoading?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSort?: (field: string) => void;
  sortField?: string;
  sortDirection?: "asc" | "desc";
}

export function DepartmentsTable({
  departments,
  isLoading = false,
  onEdit,
  onDelete,
  onSort,
  sortField,
  sortDirection,
}: DepartmentsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string>("");

  const handleDeleteClick = (id: string, name: string) => {
    setSelectedId(id);
    setSelectedName(name);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedId) {
      onDelete(selectedId);
      setDeleteDialogOpen(false);
      setSelectedId(null);
      setSelectedName("");
    }
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: string;
    children: React.ReactNode;
  }) => {
    if (!onSort) return <>{children}</>;
    return (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={() => onSort(field)}
      >
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton field="codigo">Código</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="nome">Nome</SortButton>
              </TableHead>
              <TableHead>Departamento Pai</TableHead>
              <TableHead>Gestor</TableHead>
              <TableHead>Centro de Custo</TableHead>
              <TableHead>Colaboradores</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Nenhum departamento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.codigo}</TableCell>
                  <TableCell>{dept.nome}</TableCell>
                  <TableCell>
                    {dept.departamentoPai ? (
                      <Badge variant="outline">{dept.departamentoPai.nome}</Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {dept.gestor ? dept.gestor.nomeCompleto : "—"}
                  </TableCell>
                  <TableCell>{dept.centroCusto || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{dept.totalColaboradores}</Badge>
                  </TableCell>
                  <TableCell>
                    {dept.ativo ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Ativo
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                        Inativo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(dept.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(dept.id, dept.nome)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar departamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar o departamento{" "}
              <strong>{selectedName}</strong>? Esta ação pode ser revertida
              posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

