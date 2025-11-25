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

interface Cargo {
  id: string;
  codigo: string;
  titulo: string;
  nivel: string | null;
  salarioMinimo: string | null;
  salarioMaximo: string | null;
  ativo: boolean;
  totalColaboradores: number;
}

interface CargosTableProps {
  cargos: Cargo[];
  isLoading?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSort?: (field: string) => void;
  sortField?: string;
  sortDirection?: "asc" | "desc";
}

export function CargosTable({
  cargos,
  isLoading = false,
  onEdit,
  onDelete,
  onSort,
  sortField,
  sortDirection,
}: CargosTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string>("");

  const handleDeleteClick = (id: string, title: string) => {
    setSelectedId(id);
    setSelectedTitle(title);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedId) {
      onDelete(selectedId);
      setDeleteDialogOpen(false);
      setSelectedId(null);
      setSelectedTitle("");
    }
  };

  const formatCurrency = (value: string | null) => {
    if (!value) return "—";
    const num = parseFloat(value);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num);
  };

  const formatSalaryRange = (min: string | null, max: string | null) => {
    if (!min && !max) return "—";
    if (min && max) {
      return `${formatCurrency(min)} - ${formatCurrency(max)}`;
    }
    return min ? `A partir de ${formatCurrency(min)}` : `Até ${formatCurrency(max)}`;
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
                <SortButton field="titulo">Título</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="nivel">Nível</SortButton>
              </TableHead>
              <TableHead>Faixa Salarial</TableHead>
              <TableHead>Colaboradores</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Nenhum cargo encontrado.
                </TableCell>
              </TableRow>
            ) : (
              cargos.map((cargo) => (
                <TableRow key={cargo.id}>
                  <TableCell className="font-medium">{cargo.codigo}</TableCell>
                  <TableCell>{cargo.titulo}</TableCell>
                  <TableCell>
                    {cargo.nivel ? (
                      <Badge variant="outline">{cargo.nivel}</Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatSalaryRange(cargo.salarioMinimo, cargo.salarioMaximo)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{cargo.totalColaboradores}</Badge>
                  </TableCell>
                  <TableCell>
                    {cargo.ativo ? (
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
                        onClick={() => onEdit(cargo.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(cargo.id, cargo.titulo)}
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
            <AlertDialogTitle>Desativar cargo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar o cargo{" "}
              <strong>{selectedTitle}</strong>? Esta ação pode ser revertida
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

