"use client";

import {
  Calendar,
  ClipboardCheck,
  Clock,
  FileText,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  Sun,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

import { NavMain } from "./nav-main";

// Dados de navegação
const data = {
  navMain: [
    {
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Cadastros",
          url: "/cadastros",
          icon: Users,
        },
        {
          title: "Frequência",
          url: "/frequencia",
          icon: Clock,
        },
        {
          title: "Férias",
          url: "/ferias",
          icon: Calendar,
        },
        {
          title: "Avaliações",
          url: "/avaliacoes",
          icon: ClipboardCheck,
        },
        {
          title: "Relatórios",
          url: "/relatorios",
          icon: FileText,
        },
        {
          title: "Configurações",
          url: "/configuracoes",
          icon: Settings,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  const session = authClient.useSession();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/authentication");
        },
      },
    });
  };

  const toggleTheme = () => {
    if (!mounted) return;
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b border-sidebar-border pt-1 pb-2 px-2">
        <div className="flex items-center gap-4">
          <div className="relative h-24 w-24 overflow-hidden rounded-2xl">
            <Image
              src="/logo.png"
              alt="Portal RH"
              fill
              sizes="120px"
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-sidebar-foreground">
              Portal RH
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Sistema Integrado
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="pt-4">
        <NavMain groups={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="w-full justify-start">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={session.data?.user.image || undefined}
                      alt={session.data?.user.name || "Usuário"}
                    />
                    <AvatarFallback>
                      {session.data?.user.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <p className="text-sm font-medium text-sidebar-foreground">
                      {session.data?.user.name || "Usuário"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Gestora de RH
                    </p>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={toggleTheme}>
                  {mounted && theme === "dark" ? (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      Modo Claro
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      Modo Escuro
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
