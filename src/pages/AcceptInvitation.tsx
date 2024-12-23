import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyInvitation = async () => {
      if (!token) {
        toast({
          title: "Invalid invitation",
          description: "No invitation token provided",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("token", token)
        .single();

      if (error || !data) {
        toast({
          title: "Invalid invitation",
          description: "This invitation is not valid",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      if (data.status !== "pending") {
        toast({
          title: "Invalid invitation",
          description: "This invitation has already been used",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      setInvitation(data);
    };

    verifyInvitation();
  }, [token, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation) return;

    setLoading(true);
    try {
      // Sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.email,
        password: password,
      });

      if (signUpError) throw signUpError;

      // Update invitation status
      const { error: updateError } = await supabase
        .from("invitations")
        .update({ status: "completed" })
        .eq("token", token);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Your account has been created successfully",
      });

      // Navigate to home page
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!invitation) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Accept Invitation</h2>
          <p className="mt-2 text-gray-600">
            Create your account to access the application
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={invitation.email}
              disabled
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
              placeholder="Enter your password"
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </div>
    </div>
  );
}