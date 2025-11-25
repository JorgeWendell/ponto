"use client";

import { Camera, Upload, X, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { uploadAvatar } from "@/actions/upload-avatar";
import { uploadFacial } from "@/actions/upload-facial";
import { getAccessibleImageUrl } from "@/lib/nextcloud/url-helper";

interface PhotoFacialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collaboratorId: string;
  collaboratorName: string;
  currentAvatarUrl?: string | null;
  currentFacialUrl?: string | null;
  onSuccess?: () => void;
}

export function PhotoFacialDialog({
  open,
  onOpenChange,
  collaboratorId,
  collaboratorName,
  currentAvatarUrl,
  currentFacialUrl,
  onSuccess,
}: PhotoFacialDialogProps) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [facialFile, setFacialFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    getAccessibleImageUrl(currentAvatarUrl) || null
  );
  const [facialPreview, setFacialPreview] = useState<string | null>(
    getAccessibleImageUrl(currentFacialUrl) || null
  );
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingFacial, setIsUploadingFacial] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const facialInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, selecione um arquivo de imagem");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Tamanho máximo: 5MB");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFacialSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, selecione um arquivo de imagem");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Tamanho máximo: 5MB");
        return;
      }
      setFacialFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFacialPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) {
      toast.error("Selecione uma imagem primeiro");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", avatarFile);
      formData.append("collaboratorId", collaboratorId);

      const result = await uploadAvatar(formData);
      if (result.success && result.url) {
        toast.success("Avatar enviado com sucesso!");
        setAvatarFile(null);
        setAvatarPreview(getAccessibleImageUrl(result.url) || result.url);
        onSuccess?.();
      } else {
        toast.error(result.error || "Erro ao enviar avatar");
      }
    } catch (error: any) {
      console.error("Erro no upload:", error);
      toast.error(error?.message || "Erro ao enviar avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleUploadFacial = async () => {
    if (!facialFile) {
      toast.error("Selecione uma imagem primeiro");
      return;
    }

    setIsUploadingFacial(true);
    try {
      const formData = new FormData();
      formData.append("file", facialFile);
      formData.append("collaboratorId", collaboratorId);

      const result = await uploadFacial(formData);
      if (result.success && result.url) {
        toast.success("Facial enviada com sucesso!");
        setFacialFile(null);
        setFacialPreview(getAccessibleImageUrl(result.url) || result.url);
        onSuccess?.();
      } else {
        toast.error(result.error || "Erro ao enviar facial");
      }
    } catch (error: any) {
      console.error("Erro no upload:", error);
      toast.error(error?.message || "Erro ao enviar facial");
    } finally {
      setIsUploadingFacial(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(getAccessibleImageUrl(currentAvatarUrl) || null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  };

  const handleRemoveFacial = () => {
    setFacialFile(null);
    setFacialPreview(getAccessibleImageUrl(currentFacialUrl) || null);
    if (facialInputRef.current) {
      facialInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    setAvatarFile(null);
    setFacialFile(null);
    setAvatarPreview(getAccessibleImageUrl(currentAvatarUrl) || null);
    setFacialPreview(getAccessibleImageUrl(currentFacialUrl) || null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Foto e Facial - {collaboratorName}</DialogTitle>
          <DialogDescription>
            Faça upload da foto (avatar) e da facial do colaborador
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Avatar/Foto</h3>
                {avatarPreview && (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Cadastrado
                  </Badge>
                )}
              </div>
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={avatarPreview || undefined} />
                  <AvatarFallback className="text-2xl">
                    {collaboratorName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex gap-2">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {avatarFile ? "Alterar" : "Selecionar"}
                  </Button>
                  {avatarFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveAvatar}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {avatarFile && (
                  <Button
                    type="button"
                    onClick={handleUploadAvatar}
                    disabled={isUploadingAvatar}
                    className="w-full"
                  >
                    {isUploadingAvatar ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Enviar Avatar
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Facial</h3>
                {facialPreview && (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Cadastrado
                  </Badge>
                )}
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="h-32 w-32 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted/50">
                  {facialPreview ? (
                    <img
                      src={facialPreview}
                      alt="Facial"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Camera className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    ref={facialInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFacialSelect}
                    className="hidden"
                    id="facial-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => facialInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {facialFile ? "Alterar" : "Selecionar"}
                  </Button>
                  {facialFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveFacial}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {facialFile && (
                  <Button
                    type="button"
                    onClick={handleUploadFacial}
                    disabled={isUploadingFacial}
                    className="w-full"
                  >
                    {isUploadingFacial ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Enviar Facial
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

