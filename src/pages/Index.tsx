import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SessionManager } from "@/components/session/SessionManager";
import { BillListContainer } from "@/components/bills/BillListContainer";
import { useParams, Navigate } from "react-router-dom";

export default function Index() {
  const { data: sources, isLoading } = useQuery({
    queryKey: ['sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgetapp_sources')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If we have sources, redirect to the first source
  if (sources && sources.length > 0) {
    return <Navigate to={`/source/${sources[0].id}`} replace />;
  }

  // If no sources, show empty state
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Welcome to Budget App</h1>
      <p className="text-gray-600 mb-4">Get started by adding your first source</p>
    </div>
  );
}