"use client";

import {
  ArrowUpDown,
  Edit,
  Trash2,
  Camera,
} from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAccessibleImageUrl } from "@/lib/nextcloud/url-helper";
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

interface Collaborator {
  id: string;
  matricula: string;
  nomeCompleto: string;
  emailCorporativo: string;
  status: string;
  dataAdmissao: string | null;
  createdAt: string | null;
  avatarUrl?: string | null;
  fotoUrl?: string | null;
  cargo: {
    id: string;
    titulo: string;
  } | null;
  departamento: {
    id: string;
    nome: string;
  } | null;
  unidade: {
    id: string;
    nome: string;
  } | null;
}

interface CollaboratorsTableProps {
  collaborators: Collaborator[];
  isLoading?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPhotoFacial?: (id: string, name: string, avatarUrl?: string | null, facialUrl?: string | null) => void;
  onSort?: (field: string) => void;
  sortField?: string;
  sortDirection?: "asc" | "desc";
}

export function CollaboratorsTable({
  collaborators,
  isLoading = false,
  onEdit,
  onDelete,
  onPhotoFacial,
  onSort,
  sortField,
  sortDirection,
}: CollaboratorsTableProps) {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Ativo
          </Badge>
        );
      case "inativo":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            Inativo
          </Badge>
        );
      case "afastado":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Afastado
          </Badge>
        );
      case "demitido":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Demitido
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            {status}
          </Badge>
        );
    }
  };

  const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => {
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
            <Skeleton className="h-12 w-12 rounded-full" />
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
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>
                <SortButton field="nome">Nome</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="matricula">Matrícula</SortButton>
              </TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Biometria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collaborators.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Nenhum colaborador encontrado.
                </TableCell>
              </TableRow>
            ) : (
              collaborators.map((collaborator) => (
                <TableRow key={collaborator.id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={getAccessibleImageUrl(collaborator.avatarUrl)} />
                      <AvatarFallback>
                        {collaborator.nomeCompleto
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                    {collaborator.nomeCompleto}
                  </TableCell>
                  <TableCell>{collaborator.matricula}</TableCell>
                  <TableCell>
                    {collaborator.cargo?.titulo || "—"}
                  </TableCell>
                  <TableCell>
                    {collaborator.departamento?.nome || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {collaborator.avatarUrl ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                          Foto
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 text-xs">
                          Sem foto
                        </Badge>
                      )}
                      {collaborator.fotoUrl ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                          Facial
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 text-xs">
                          Sem facial
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(collaborator.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onPhotoFacial && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            onPhotoFacial(
                              collaborator.id,
                              collaborator.nomeCompleto,
                              collaborator.avatarUrl,
                              collaborator.fotoUrl
                            )
                          }
                          title="Cadastrar foto e facial"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(collaborator.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDeleteClick(
                            collaborator.id,
                            collaborator.nomeCompleto
                          )
                        }
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
            <AlertDialogTitle>Desativar colaborador</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar o colaborador{" "}
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

