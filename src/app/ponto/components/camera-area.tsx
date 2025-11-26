"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { recognizeFace } from "@/actions/recognize-face";

export function CameraArea() {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingDevices, setIsCheckingDevices] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setError(null);
    setIsCheckingDevices(true);

    try {
      // Verificar se getUserMedia está disponível
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "getUserMedia não está disponível. Verifique se está usando um navegador moderno."
        );
      }

      // Tentar diferentes configurações de câmera
      let stream: MediaStream | null = null;
      let lastError: any = null;

      const constraints = [
        { video: true }, // Qualquer câmera disponível (mais simples primeiro)
        { video: { facingMode: "user" } }, // Câmera frontal (mobile)
        { video: { facingMode: "environment" } }, // Câmera traseira (mobile)
      ];

      for (const constraint of constraints) {
        try {
          console.log("Tentando constraint:", JSON.stringify(constraint));
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          console.log(
            "Sucesso! Câmera acessada com constraint:",
            JSON.stringify(constraint)
          );
          break;
        } catch (err: any) {
          console.error(
            "Erro ao tentar constraint:",
            JSON.stringify(constraint),
            err.name,
            err.message
          );
          lastError = err;

          // Se for erro de permissão, não tenta outras constraints
          if (
            err.name === "NotAllowedError" ||
            err.name === "PermissionDeniedError"
          ) {
            throw err;
          }
          // Se for erro de dispositivo não encontrado, continua tentando
          if (
            err.name === "NotFoundError" ||
            err.name === "DevicesNotFoundError"
          ) {
            continue;
          }
          // Outros erros também continuam tentando
          continue;
        }
      }

      if (!stream) {
        // Usar o último erro para mensagem mais específica
        if (lastError) {
          throw lastError;
        }
        throw new Error("Não foi possível acessar nenhuma câmera disponível");
      }

      // Verificar se o stream tem tracks ativas
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length === 0) {
        stream.getTracks().forEach((track) => track.stop());
        throw new Error("Stream de vídeo não contém tracks de vídeo");
      }

      console.log("Stream obtido com sucesso:", {
        videoTracks: videoTracks.length,
        trackLabel: videoTracks[0]?.label,
        trackReadyState: videoTracks[0]?.readyState,
        trackEnabled: videoTracks[0]?.enabled,
      });

      if (!videoRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        throw new Error("Elemento de vídeo não está disponível");
      }

      // Parar stream anterior se existir
      if (streamRef.current) {
        console.log("Parando stream anterior");
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
          console.log("Track parado:", track.label);
        });
        streamRef.current = null;
      }

      const videoElement = videoRef.current;

      // Limpar event listeners anteriores
      videoElement.onloadedmetadata = null;
      videoElement.onerror = null;
      videoElement.onplay = null;
      videoElement.onpause = null;

      // Configurar novo stream
      videoElement.srcObject = stream;
      streamRef.current = stream;

      // Aguardar o vídeo estar pronto
      const handleLoadedMetadata = () => {
        console.log("Metadata do vídeo carregado, tentando reproduzir...");
        if (videoElement) {
          videoElement
            .play()
            .then(() => {
              console.log("✅ Vídeo iniciado com sucesso");
              setIsCameraActive(true);
              setError(null);
            })
            .catch((playError) => {
              console.error("❌ Erro ao reproduzir vídeo:", playError);
              setError(
                "Erro ao iniciar reprodução do vídeo: " + playError.message
              );
              stopCamera();
            });
        }
      };

      videoElement.onloadedmetadata = handleLoadedMetadata;

      // Tratamento de erros do vídeo
      videoElement.onerror = (e) => {
        console.error("❌ Erro no elemento de vídeo:", e);
        setError("Erro ao carregar stream de vídeo");
        stopCamera();
      };

      // Monitorar quando o stream termina
      videoTracks[0].onended = () => {
        console.log("⚠️ Track de vídeo terminou");
        setIsCameraActive(false);
      };

      // Monitorar quando o vídeo pausa (pode indicar problema)
      videoElement.onpause = () => {
        console.log("⚠️ Vídeo pausado");
      };

      videoElement.onplay = () => {
        console.log("✅ Vídeo reproduzindo");
      };
    } catch (error: any) {
      console.error("Erro ao acessar câmera:", error);

      let errorMessage = "Não foi possível acessar a câmera.";

      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        errorMessage =
          "Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações do navegador.";
      } else if (
        error.name === "NotFoundError" ||
        error.name === "DevicesNotFoundError"
      ) {
        errorMessage =
          "Nenhuma câmera encontrada. Verifique se há uma câmera conectada ao dispositivo.";
      } else if (
        error.name === "NotReadableError" ||
        error.name === "TrackStartError"
      ) {
        errorMessage =
          "A câmera está sendo usada por outro aplicativo. Feche outros aplicativos que possam estar usando a câmera.";
      } else if (
        error.name === "OverconstrainedError" ||
        error.name === "ConstraintNotSatisfiedError"
      ) {
        errorMessage =
          "A câmera não suporta os requisitos solicitados. Tente novamente.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsCheckingDevices(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setError(null);
  };

  const captureFrame = (): string | null => {
    if (!videoRef.current || !streamRef.current) {
      return null;
    }

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.8);
  };

  const getLocation = (): Promise<{
    latitude?: string;
    longitude?: string;
  }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({});
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          });
        },
        () => {
          // Erro ao obter localização, continua sem ela
          resolve({});
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    });
  };

  const handleStartRecognition = async () => {
    if (!isCameraActive) {
      await startCamera();
      return;
    }

    setIsRecognizing(true);
    setError(null);

    try {
      // Capturar frame
      const imageBase64 = captureFrame();
      if (!imageBase64) {
        throw new Error("Não foi possível capturar imagem da câmera");
      }

      // Obter localização
      const location = await getLocation();

      // Obter info do dispositivo
      const dispositivoInfo = `${navigator.userAgent} | ${navigator.platform}`;

      // Chamar reconhecimento
      const result = await recognizeFace({
        imageBase64,
        latitude: location.latitude,
        longitude: location.longitude,
        dispositivoInfo,
      });

      if (result.success && result.data) {
        const tipoLabels: Record<string, string> = {
          ENTRADA: "Entrada",
          SAIDA: "Saída",
          ENTRADA_ALMOCO: "Entrada de Almoço",
          VOLTA_ALMOCO: "Volta do Almoço",
        };

        toast.success(
          `Ponto registrado! ${result.data.colaborador.nomeCompleto} - ${tipoLabels[result.data.tipo]}`,
          {
            duration: 5000,
          }
        );

        // Atualizar marcações do dia (se houver callback)
        // TODO: Atualizar sidebar com nova marcação
      } else {
        toast.error(result.error || "Erro ao reconhecer colaborador");
        setError(result.error || "Erro ao reconhecer colaborador");
      }
    } catch (error: any) {
      console.error("Erro no reconhecimento:", error);
      toast.error(error?.message || "Erro ao processar reconhecimento");
      setError(error?.message || "Erro ao processar reconhecimento");
    } finally {
      setIsRecognizing(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-6">
      {error && (
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao acessar câmera</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="relative flex h-80 w-80 items-center justify-center rounded-full border-4 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800 md:h-80 md:w-80 lg:h-96 lg:w-96 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`h-full w-full rounded-full object-cover ${
            isCameraActive && streamRef.current ? "block" : "hidden"
          }`}
        />
        {!isCameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-gray-400 bg-gray-50 dark:bg-gray-800">
            <Camera className="h-20 w-20 md:h-24 md:w-24" />
          </div>
        )}

        {(isRecognizing || isCheckingDevices) && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <Loader2 className="h-12 w-12 animate-spin text-white" />
          </div>
        )}
      </div>

      <div className="text-center">
        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Pronto para registrar seu ponto
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isCameraActive
            ? "Posicione-se em frente à câmera"
            : "Clique no botão para ativar a câmera"}
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2">
        <Button
          onClick={handleStartRecognition}
          disabled={isRecognizing || isCheckingDevices}
          size="lg"
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {isRecognizing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Reconhecendo...
            </>
          ) : isCheckingDevices ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando câmera...
            </>
          ) : isCameraActive ? (
            "Iniciar reconhecimento"
          ) : (
            "Ativar câmera"
          )}
        </Button>

        {isCameraActive && (
          <Button
            onClick={stopCamera}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Desativar câmera
          </Button>
        )}
      </div>
    </div>
  );
}
