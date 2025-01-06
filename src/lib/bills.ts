import { BillProduct, BillItemJson } from "@/types/bills";
import { Json } from "@/integrations/supabase/types";

export function deserializeBillItems(items: Json | null): BillProduct[] {
  if (!items || !Array.isArray(items)) return [];

  return items.map(item => {
    if (typeof item !== 'object' || !item) return {} as BillProduct;
    
    const typedItem = item as Record<string, Json>;
    
    return {
      id: String(typedItem.id || ''),
      name: String(typedItem.name || ''),
      price: Number(typedItem.price || 0),
      quantity: Number(typedItem.quantity || 0),
      type: (String(typedItem.type || 'product')) as "product" | "service",
      source_id: String(typedItem.source_id || ''),
      current_stock: Number(typedItem.current_stock || 0),
      purchase_cost: typedItem.purchase_cost ? Number(typedItem.purchase_cost) : null,
      category: typedItem.category ? String(typedItem.category) : undefined,
      description: typedItem.description ? String(typedItem.description) : null,
      image_url: typedItem.image_url ? String(typedItem.image_url) : null,
      income_type_id: typedItem.income_type_id ? String(typedItem.income_type_id) : null
    };
  });
}

export function serializeBillItems(products: BillProduct[]): Json {
  return products.map(product => ({
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: product.quantity,
    type: product.type,
    source_id: product.source_id,
    current_stock: product.current_stock,
    purchase_cost: product.purchase_cost,
    category: product.category || null,
    description: product.description || null,
    image_url: product.image_url || null,
    income_type_id: product.income_type_id || null
  })) as Json;
}