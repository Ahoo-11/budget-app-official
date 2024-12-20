import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session check error:', error);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: error.message,
          });
          return;
        }
        if (session) {
          navigate("/");
        }
      } catch (error) {
        console.error('Session check error:', error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Failed to check authentication status",
        });
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_IN' && session) {
        navigate("/");
      }
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      }
      if (event === 'TOKEN_REFRESHED') {
        try {
          const { data: { user }, error } = await supabase.auth.getUser();
          if (error) {
            console.error('Get user error:', error);
            toast({
              variant: "destructive",
              title: "Authentication Error",
              description: error.message,
            });
          }
        } catch (error) {
          console.error('Get user error:', error);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Failed to refresh authentication",
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Welcome Back</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to access your expense tracker
          </p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-sm border">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'rgb(22 163 74)',
                    brandAccent: 'rgb(21 128 61)'
                  }
                }
              }
            }}
            providers={["google"]}
            redirectTo={`${window.location.origin}/auth/callback`}
            magicLink={true}
          />
        </div>
      </div>
    </div>
  );
}