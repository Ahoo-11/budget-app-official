import { BillProduct, Json } from "@/types/bills";

export function deserializeBillItems(items: Json | null): BillProduct[] {
  if (!items || !Array.isArray(items)) return [];

  return items.map(item => {
    if (typeof item !== 'object' || !item) return {} as BillProduct;
    
    return {
      id: String(item.id || ''),
      name: String(item.name || ''),
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 0),
      type: (item.type as "product" | "service") || "product",
      source_id: String(item.source_id || ''),
      current_stock: Number(item.current_stock || 0),
      purchase_cost: item.purchase_cost ? Number(item.purchase_cost) : null,
      category: item.category ? String(item.category) : undefined,
      description: item.description ? String(item.description) : null,
      image_url: item.image_url ? String(item.image_url) : null,
      income_type_id: item.income_type_id ? String(item.income_type_id) : null
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