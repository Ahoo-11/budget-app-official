import { useSession } from "@supabase/auth-helpers-react";
import { useBillProducts } from "./bills/useBillProducts";
import { useBillStatus } from "./bills/useBillStatus";
import { useBillSwitching } from "./bills/useBillSwitching";
import { useBillQueries } from "./bills/useBillQueries";
import { useBillRealtime } from "./bills/useBillRealtime";

export function useBillManagement(sourceId: string | null) {
  const session = useSession();
  const { selectedProducts, setSelectedProducts, handleProductSelect } = useBillProducts();
  const { isSubmitting, handleUpdateBillStatus } = useBillStatus();
  const { activeBillId, handleNewBill, handleSwitchBill } = useBillSwitching(
    sourceId,
    setSelectedProducts,
    handleUpdateBillStatus
  );

  const { bills, queryClient, isLoading, error } = useBillQueries(sourceId);

  useBillRealtime(
    sourceId,
    queryClient,
    activeBillId,
    setSelectedProducts,
    session
  );

  return {
    bills,
    selectedProducts,
    setSelectedProducts,
    handleProductSelect,
    isSubmitting,
    handleUpdateBillStatus,
    activeBillId,
    handleNewBill,
    handleSwitchBill,
    isLoading,
    error
  };
}