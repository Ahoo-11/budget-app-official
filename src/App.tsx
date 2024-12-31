import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Types from "./pages/Types";
import Reports from "./pages/Reports";
import Source from "./pages/Source";
import Stats from "./pages/Stats";
import { AccountSettings } from "./components/AccountSettings";
import AuthPage from "./pages/Auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useToast } from "./components/ui/use-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "There was a problem with your session. Please try logging in again.",
        });
      }
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (_event === 'SIGNED_OUT') {
        // Clear any cached data
        queryClient.clear();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter basename="/">
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <SidebarProvider>
                        <div className="flex min-h-screen w-full">
                          <AppSidebar />
                          <main className="flex-1 p-4 md:p-6 w-full md:ml-[200px]">
                            <Routes>
                              <Route path="/" element={<Index />} />
                              <Route path="/types" element={<Types />} />
                              <Route path="/reports" element={<Reports />} />
                              <Route path="/source/:sourceId" element={<Source />} />
                              <Route path="/stats" element={<Stats />} />
                              <Route path="/settings" element={<AccountSettings />} />
                            </Routes>
                          </main>
                        </div>
                      </SidebarProvider>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SessionContextProvider>
  );
}