import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, List, Database } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export const StatsHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="mb-6">
      <Tabs value={currentPath} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger
            value="/"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <BarChart2 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="/types"
            onClick={() => navigate("/types")}
            className="flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            Types
          </TabsTrigger>
          <TabsTrigger
            value="/reports"
            onClick={() => navigate("/reports")}
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};