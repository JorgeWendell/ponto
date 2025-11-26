"use client";

import { Clock, History, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PontoFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 lg:hidden">
      <nav className="flex items-center justify-around px-4 py-3">
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <Clock className="h-5 w-5" />
          <span className="text-xs">Registrar manualmente</span>
        </Button>
        
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <History className="h-5 w-5" />
          <span className="text-xs">Histórico semanal</span>
        </Button>
        
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <Phone className="h-5 w-5" />
          <span className="text-xs">Suporte</span>
        </Button>
      </nav>
    </footer>
  );
}

