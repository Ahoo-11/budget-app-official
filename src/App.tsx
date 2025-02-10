import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Types from "./pages/Types";
import Reports from "./pages/Reports";
import Source from "./pages/Source";
import Stats from "./pages/Stats";
import ServicesPage from "./pages/ServicesPage";
import { AccountSettings } from "./components/AccountSettings";
import AuthPage from "./pages/Auth";
import { useEffect, useState } from "react";
import { createClient, Database } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useToast } from "./components/ui/use-toast";
import { SessionManager } from "@/components/session/SessionManager";
import { BillListContainer } from "@/components/bills/BillListContainer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL ?? "",
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? ""
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    async function getSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          // Clear session and query cache if there's an auth error
          await supabase.auth.signOut();
          queryClient.clear();
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Please sign in again to continue.",
          });
          return;
        }

        if (mounted) {
          setSession(session);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getSession:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    }

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }
        if (event === 'SIGNED_OUT') {
          queryClient.clear();
          toast({
            variant: "destructive",
            title: "Session Ended",
            description: "Please sign in again to continue.",
          });
        }
        setSession(session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

const SourceRoute = () => {
  const { sourceId } = useParams();
  
  if (!sourceId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-8">
      <SessionManager sourceId={sourceId} />
      <BillListContainer sourceId={sourceId} />
    </div>
  );
};

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
                          <main className="flex-1 p-4 md:p-6 w-full lg:ml-[200px]">
                            <Routes>
                              <Route path="/" element={<Index />} />
                              <Route path="/source/:sourceId" element={<SourceRoute />} />
                              <Route path="/types" element={<Types />} />
                              <Route path="/reports" element={<Reports />} />
                              <Route path="/stats" element={<Stats />} />
                              <Route path="/settings" element={<AccountSettings />} />
                              <Route path="/services" element={<ServicesPage />} />
                              <Route path="*" element={<Navigate to="/" replace />} />
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
