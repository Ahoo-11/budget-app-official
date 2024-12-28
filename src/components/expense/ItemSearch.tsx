import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QuickItemForm } from "./QuickItemForm";

interface ItemSearchProps {
  products: Product[];
  onSelect: (product: Product) => void;
  sourceId: string;
}

export const ItemSearch = ({ products, onSelect, sourceId }: ItemSearchProps) => {
  const [search, setSearch] = useState("");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
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
    <div className="relative">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search or add new item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
        <Dialog open={showQuickAdd} onOpenChange={setShowQuickAdd}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Quick Add Item</DialogTitle>
            </DialogHeader>
            <QuickItemForm 
              sourceId={sourceId} 
              onSuccess={(newProduct) => {
                onSelect(newProduct);
                setShowQuickAdd(false);
              }}
            />
          </DialogContent>
        </Dialog>
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
              className="w-full p-4 text-left hover:bg-accent transition-colors"
            >
              <div className="font-medium">{product.name}</div>
              <div className="text-sm text-muted-foreground">
                Current Stock: {product.current_stock} {product.unit_of_measurement}
              </div>
              <div className="text-sm text-muted-foreground">
                Last Purchase: ${product.purchase_cost?.toFixed(2) || '0.00'}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};