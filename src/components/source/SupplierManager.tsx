import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";

export const SupplierManager = () => {
  const { sourceId } = useParams();

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers-with-transactions', sourceId],
    queryFn: async () => {
      // First get all transactions with suppliers for this source
      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select('description')
        .eq('source_id', sourceId)
        .like('description', '%Purchase from%');

      if (transactionError) throw transactionError;

      // Extract supplier names from transaction descriptions
      const supplierNames = transactions
        .map(t => {
          const match = t.description.match(/Purchase from (.*?)(?:\s*\(|$)/);
          return match ? match[1].trim() : null;
        })
        .filter(Boolean);

      if (supplierNames.length === 0) return [];

      // Get suppliers that match these names
      const { data: suppliers, error: supplierError } = await supabase
        .from('suppliers')
        .select('*')
        .in('name', supplierNames)
        .order('name');

      if (supplierError) throw supplierError;
      return suppliers;
    },
    enabled: !!sourceId
  });

  if (isLoading) {
    return <div>Loading suppliers...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Suppliers</h2>
      {suppliers.length === 0 ? (
        <p className="text-gray-500">
          No suppliers found for this source. Suppliers will appear here after you make purchases from them.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="p-4 border rounded-lg">
              <h3 className="font-semibold">{supplier.name}</h3>
              {supplier.contact_info && (
                <p className="text-sm text-gray-600">
                  {JSON.stringify(supplier.contact_info)}
                </p>
              )}
              {supplier.address && (
                <p className="text-sm text-gray-600">{supplier.address}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};