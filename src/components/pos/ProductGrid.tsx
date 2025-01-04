import { Product } from "@/types/product";

interface ProductGridProps {
  sourceId: string;
  products: Product[];
  onSelect: (product: Product) => void;
}

export const ProductGrid = ({ sourceId, products, onSelect }: ProductGridProps) => {
  if (!products?.length) {
    return <div>No products found</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="cursor-pointer p-4 border rounded-lg hover:bg-gray-50"
          onClick={() => onSelect(product)}
        >
          <div className="aspect-square relative mb-2">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="object-cover w-full h-full rounded-md"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                No image
              </div>
            )}
          </div>
          <h3 className="font-medium text-sm">{product.name}</h3>
          <p className="text-sm text-muted-foreground">MVR {product.price.toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
};