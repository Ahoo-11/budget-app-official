import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/types/product";
import { Input } from "@/components/ui/input";

interface OverviewTabProps {
  product: Product;
  isEditing?: boolean;
  editedProduct?: Partial<Product>;
  onProductChange?: (product: Partial<Product>) => void;
}

export const OverviewTab = ({ product, isEditing, editedProduct, onProductChange }: OverviewTabProps) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-muted-foreground">Category</dt>
              {isEditing ? (
                <Input
                  value={editedProduct?.category || ''}
                  onChange={(e) => onProductChange?.({ ...editedProduct, category: e.target.value })}
                  className="mt-1"
                  placeholder="Category"
                />
              ) : (
                <dd className="font-medium">{product.category || 'Uncategorized'}</dd>
              )}
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Type</dt>
              <dd className="font-medium capitalize">{product.product_type}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Unit</dt>
              {isEditing ? (
                <Input
                  value={editedProduct?.unit_of_measurement || ''}
                  onChange={(e) => onProductChange?.({ ...editedProduct, unit_of_measurement: e.target.value })}
                  className="mt-1"
                  placeholder="Unit of measurement"
                />
              ) : (
                <dd className="font-medium">{product.unit_of_measurement || 'N/A'}</dd>
              )}
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Min. Stock</dt>
              {isEditing ? (
                <Input
                  type="number"
                  value={editedProduct?.minimum_stock_level || 0}
                  onChange={(e) => onProductChange?.({ ...editedProduct, minimum_stock_level: Number(e.target.value) })}
                  className="mt-1"
                />
              ) : (
                <dd className="font-medium">{product.minimum_stock_level || 'Not set'}</dd>
              )}
            </div>
          </dl>
        </CardContent>
      </Card>

      {product.description && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2">Remarks</h3>
            {isEditing ? (
              <Input
                value={editedProduct?.description || ''}
                onChange={(e) => onProductChange?.({ ...editedProduct, description: e.target.value })}
                className="mt-1"
                placeholder="Remarks"
              />
            ) : (
              <p className="text-sm text-muted-foreground">{product.description}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};