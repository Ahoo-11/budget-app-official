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
      // Add specific handling for recovery email errors
      if (event === 'RECOVERY_EMAIL_ERROR') {
        toast({
          variant: "destructive",
          title: "Recovery Email Error",
          description: "Unable to send recovery email. Please contact support or try signing in with your existing password.",
        });
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
            providers={[]}
            redirectTo={window.location.origin}
            magicLink={false}
            localization={{
              variables: {
                sign_in: {
                  email_label: "Email address",
                  password_label: "Password",
                  button_label: "Sign in",
                  loading_button_label: "Signing in...",
                  social_provider_text: "Sign in with {{provider}}",
                  link_text: "Already have an account? Sign in",
                },
                sign_up: {
                  email_label: "Email address",
                  password_label: "Create a password",
                  button_label: "Sign up",
                  loading_button_label: "Signing up...",
                  social_provider_text: "Sign up with {{provider}}",
                  link_text: "Don't have an account? Sign up",
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
          />
        </div>
      </div>
    </div>
  );
}