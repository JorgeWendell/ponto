import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function RelatoriosPage() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
          <Construction className="h-16 w-16 text-muted-foreground" />
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">
              Em Desenvolvimento
            </h2>
            <p className="text-sm text-muted-foreground">
              Esta página está em desenvolvimento e estará disponível em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

