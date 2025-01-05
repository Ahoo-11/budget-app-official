import { supabase } from "@/integrations/supabase/client";
import { Bill, BillProduct, BillItemJson } from "@/types/bill";
import { Json } from "@/integrations/supabase/types";

// Helper function to check if a value is a non-null object
const isObject = (value: Json): value is Record<string, Json> => {
  return typeof value === 'object' && value !== null;
};

// Type guard for bill items
const isValidBillItem = (item: Record<string, Json>): item is Record<string, Json> & BillItemJson => {
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    (typeof item.price === 'number' || typeof item.price === 'string') &&
    (typeof item.quantity === 'number' || typeof item.quantity === 'string')
  );
};

export const serializeBillItems = (items: BillProduct[]): Json => {
  return items.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    type: item.type,
    source_id: item.source_id,
    category: item.category,
    image_url: item.image_url,
    description: item.description,
    income_type_id: item.income_type_id,
  }));
};

export const deserializeBillItems = (items: Json): BillProduct[] => {
  if (!Array.isArray(items)) return [];
  
  return items
    .filter(isObject)
    .filter((item): item is Record<string, Json> & BillItemJson => isValidBillItem(item))
    .map(item => ({
      id: String(item.id),
      name: String(item.name),
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 0,
      type: item.type as 'product' | 'service' | undefined,
      source_id: item.source_id as string | undefined,
      category: item.category as string | null | undefined,
      image_url: item.image_url as string | null | undefined,
      description: item.description as string | null | undefined,
      income_type_id: item.income_type_id as string | null | undefined,
      current_stock: 0,
      purchase_cost: null,
    }));
};

export const fetchActiveBills = async (sourceId: string): Promise<Bill[]> => {
  console.log('🔍 Fetching active bills for source:', sourceId);
  
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('source_id', sourceId)
    .eq('status', 'active')  // Only fetch active bills
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching active bills:', error);
    throw error;
  }

  console.log('📦 Fetched bills:', data);
  
  return (data || []).map(bill => ({
    ...bill,
    items: deserializeBillItems(bill.items),
    status: bill.status as Bill['status']
  }));
};

const getDefaultPayer = async () => {
  console.log('🔍 Fetching default payer...');
  
  try {
    const { data, error } = await supabase
      .from('payers')
      .select('id')
      .eq('name', 'Walk-in Customer')
      .single();

    if (error) {
      console.error('❌ Error fetching default payer:', error);
      return null;
    }

    if (!data) {
      console.log('⚠️ No default payer found, creating one...');
      const { data: newPayer, error: createError } = await supabase
        .from('payers')
        .insert([{ name: 'Walk-in Customer' }])
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating default payer:', createError);
        return null;
      }

      console.log('✅ Created default payer:', newPayer.id);
      return newPayer.id;
    }

    console.log('✅ Found existing default payer:', data.id);
    return data.id;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return null;
  }
};

export const createNewBill = async (sourceId: string, userId: string) => {
  console.log('📝 Creating new bill...');
  console.log('Source ID:', sourceId);
  console.log('User ID:', userId);

  try {
    const defaultPayerId = await getDefaultPayer();
    console.log('Default Payer ID:', defaultPayerId);

    const billData = {
      source_id: sourceId,
      user_id: userId,
      status: 'active',
      items: serializeBillItems([]),
      subtotal: 0,
      total: 0,
      gst: 0,
      discount: 0,
      date: new Date().toISOString(),
      payer_id: defaultPayerId
    };

    console.log('📋 Bill data to insert:', billData);

    const { data, error } = await supabase
      .from('bills')
      .insert(billData)
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating bill:', error);
      throw error;
    }

    console.log('✅ Bill created successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error in createNewBill:', error);
    throw error;
  }
};

export const updateBillItems = async (billId: string, items: BillProduct[]) => {
  const serializedItems = serializeBillItems(items);

  const { error } = await supabase
    .from('bills')
    .update({
      items: serializedItems,
      status: 'completed',
    })
    .eq('id', billId);

  if (error) throw error;
};