"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function PontoHeader() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedTime = format(currentTime, "HH:mm");
  const formattedDate = format(currentTime, "EEEE, d 'de' MMMM", {
    locale: ptBR,
  });

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900 lg:px-8">
      <div className="flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="Meu Ponto"
          width={150}
          height={150}
          className="h-20 w-20 object-contain"
        />
      </div>

      <div className="flex flex-col items-end">
        <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {formattedTime}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
          {formattedDate}
        </div>
      </div>
    </header>
  );
}
