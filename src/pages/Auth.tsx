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
      if (event === 'PASSWORD_RECOVERY') {
        toast({
          title: "Password Recovery",
          description: "Check your email for the password reset link",
        });
      }
      if (event === 'USER_UPDATED') {
        toast({
          title: "Success",
          description: "Your password has been updated",
        });
        navigate("/");
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
            view="magic_link"
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
            providers={[]}
            redirectTo="https://budget-app-official.lovable.app/auth/callback"
            magicLink={true}
            localization={{
              variables: {
                magic_link: {
                  button_label: "Send Magic Link",
                  loading_button_label: "Sending Magic Link...",
                  confirmation_text: "Check your email for the magic link",
                },
                forgotten_password: {
                  email_label: "Email address",
                  button_label: "Send reset instructions",
                  loading_button_label: "Sending reset instructions...",
                  link_text: "Forgot your password?",
                  confirmation_text: "Check your email for the password reset link",
                },
              },
            }}
            onError={(error) => {
              console.error('Auth error:', error);
              toast({
                variant: "destructive",
                title: "Authentication Error",
                description: error.message,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}