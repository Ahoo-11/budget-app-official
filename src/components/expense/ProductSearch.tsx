import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ProductSearchProps {
  products: Product[];
  onSelect: (product: Product) => void;
}

export const ProductSearch = ({ products, onSelect }: ProductSearchProps) => {
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (search.trim()) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category?.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [search, products]);

  return (
    <div className="relative flex-1 mr-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredProducts.length > 0 && search && (
        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => {
                onSelect(product);
                setSearch("");
              }}
              className="w-full px-4 py-2 text-left hover:bg-accent transition-colors"
            >
              <div>{product.name}</div>
              <div className="text-sm text-muted-foreground">
                Stock: {product.current_stock} {product.unit_of_measurement}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};