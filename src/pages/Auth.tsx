import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function Auth() {
  const { toast } = useToast();

  const handleError = (error: Error) => {
    toast({
      title: "Authentication Error",
      description: error.message,
      variant: "destructive"
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Welcome</h2>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>
        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['google']}
            onError={handleError}
          />
        </div>
      </div>
    </div>
  );
}

export default Auth;