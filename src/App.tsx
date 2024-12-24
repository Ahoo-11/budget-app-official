import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Types from "./pages/Types";
import Reports from "./pages/Reports";
import Source from "./pages/Source";
import Personal from "./pages/Personal";
import { AccountSettings } from "./components/AccountSettings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <SidebarProvider>
              <div className="flex min-h-screen w-full">
                <AppSidebar />
                <main className="flex-1 p-4 md:p-6 w-full md:ml-[200px]">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/types" element={<Types />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/source/:sourceId" element={<Source />} />
                    <Route path="/personal" element={<Personal />} />
                    <Route path="/settings" element={<AccountSettings />} />
                  </Routes>
                </main>
              </div>
            </SidebarProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}