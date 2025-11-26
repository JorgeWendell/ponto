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

interface Unidade {
  id: string;
  codigo: string;
  nome: string;
  tipo: string | null;
  cidade: string | null;
  estado: string | null;
  ativo: boolean;
  totalColaboradores: number;
}

interface UnitsTableProps {
  units: Unidade[];
  isLoading?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSort?: (field: string) => void;
  sortField?: string;
  sortDirection?: "asc" | "desc";
}

export function UnitsTable({
  units,
  isLoading = false,
  onEdit,
  onDelete,
  onSort,
  sortField,
  sortDirection,
}: UnitsTableProps) {
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
              <TableHead>Tipo</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Colaboradores</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Nenhuma unidade encontrada.
                </TableCell>
              </TableRow>
            ) : (
              units.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.codigo}</TableCell>
                  <TableCell>{unit.nome}</TableCell>
                  <TableCell>
                    {unit.tipo ? (
                      <Badge variant="outline">{unit.tipo}</Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {unit.cidade && unit.estado
                      ? `${unit.cidade}, ${unit.estado}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{unit.totalColaboradores}</Badge>
                  </TableCell>
                  <TableCell>
                    {unit.ativo ? (
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
                        onClick={() => onEdit(unit.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(unit.id, unit.nome)}
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
            <AlertDialogTitle>Desativar unidade</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar a unidade{" "}
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

