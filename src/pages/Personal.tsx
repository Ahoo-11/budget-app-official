import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Source } from "@/types/source";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

export default function Personal() {
  const [sources, setSources] = useState<Source[]>([]);

  useEffect(() => {
    const fetchSources = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("sources")
        .select("*")
        .eq("user_id", user.id);

      if (data) {
        setSources(data);
      }
    };

    fetchSources();
  }, []);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Your Sources</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sources.map((source) => (
          <Link key={source.id} to={`/source/${source.id}`}>
            <Card className="hover:bg-accent transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {source.name}
                  <ArrowUpRight className="h-5 w-5" />
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}