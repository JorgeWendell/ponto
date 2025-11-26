"use client";

import { PontoHeader } from "./ponto-header";
import { CameraArea } from "./camera-area";

export function PontoPageContent() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <PontoHeader />

      <main className="flex flex-1 items-center justify-center p-4 lg:p-8">
        <CameraArea />
      </main>
    </div>
  );
}

