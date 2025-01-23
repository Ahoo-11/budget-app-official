import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/product";

interface QuickStatsProps {
  product: Product;
  isEditing?: boolean;
  onStockChange?: (stock: number) => void;
  onPriceChange?: (price: number) => void;
  editedProduct?: Partial<Product>;
}

export const QuickStats = ({ 
  product,
  isEditing,
  onStockChange,
  onPriceChange,
  editedProduct = {}
}: QuickStatsProps) => {
  const displayStock = isEditing ? editedProduct.current_stock : product.current_stock;
  const displayPrice = isEditing ? editedProduct.price : product.price;

  const totalContent = (displayStock || 0) * (product.content_per_unit || 0);

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Stock Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">Stock</div>
          <div className="space-y-2">
            {/* Container Units */}
            <div>
              {isEditing ? (
                <Input
                  type="number"
                  value={displayStock || 0}
                  onChange={(e) => onStockChange?.(Number(e.target.value))}
                  className="mt-1"
                  min={0}
                />
              ) : (
                <div className="text-2xl font-bold">
                  {displayStock || 0} {product.measurement_unit?.symbol || 'units'}
                </div>
              )}
            </div>

            {/* Content Units - Only for basic products */}
            {product.product_type === 'basic' && (
              <>
                <div className="text-sm text-muted-foreground">
                  ({product.content_per_unit} {product.content_unit?.symbol} per {product.measurement_unit?.symbol})
                </div>
                <div className="text-sm">
                  Total Content: {totalContent} {product.content_unit?.symbol}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Price Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">Price</div>
          {isEditing ? (
            <Input
              type="number"
              value={displayPrice}
              onChange={(e) => onPriceChange?.(Number(e.target.value))}
              className="mt-1"
              step="0.01"
              min={0}
            />
          ) : (
            <div className="text-2xl font-bold">
              MVR {displayPrice?.toFixed(2)}
            </div>
          )}
          {product.product_type === 'basic' && product.content_per_unit && (
            <div className="text-sm text-muted-foreground mt-1">
              (MVR {((displayPrice || 0) / product.content_per_unit).toFixed(2)} per {product.content_unit?.symbol})
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};