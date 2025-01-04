import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { IncomeType } from "@/types/income";

export const useDefaultIncomeTypes = () => {
  const { data: incomeTypes, isLoading } = useQuery({
    queryKey: ['default-income-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('types')
        .select('*')
        .in('name', ['Product Sales', 'Service Income']);

      if (error) throw error;

      const productSalesType = (data as IncomeType[]).find(type => type.name === 'Product Sales');
      const serviceIncomeType = (data as IncomeType[]).find(type => type.name === 'Service Income');

      return {
        productSalesId: productSalesType?.id || null,
        serviceIncomeId: serviceIncomeType?.id || null
      };
    }
  });

  return {
    productSalesId: incomeTypes?.productSalesId || null,
    serviceIncomeId: incomeTypes?.serviceIncomeId || null,
    isLoading
  };
};