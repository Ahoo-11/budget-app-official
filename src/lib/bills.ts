import { BillProduct, BillItemJson } from "@/types/bills";

export function deserializeBillItems(items: BillItemJson[] | null): BillProduct[] {
  if (!items || !Array.isArray(items)) return [];

  return items.map(item => ({
    id: item.id,
    name: item.name,
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 0,
    type: item.type,
    source_id: item.source_id,
    category: item.category,
    image_url: item.image_url || null,
    description: item.description || null,
    income_type_id: item.income_type_id || null,
    current_stock: item.current_stock || 0,
    purchase_cost: item.purchase_cost || null
  }));
}

export function serializeBillItems(products: BillProduct[]): BillItemJson[] {
  return products.map(product => ({
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: product.quantity,
    type: product.type,
    source_id: product.source_id,
    category: product.category,
    image_url: product.image_url,
    description: product.description,
    income_type_id: product.income_type_id,
    current_stock: product.current_stock,
    purchase_cost: product.purchase_cost
  }));
}
