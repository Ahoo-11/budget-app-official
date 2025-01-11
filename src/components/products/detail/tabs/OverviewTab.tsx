import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/types/product";

interface OverviewTabProps {
  product: Product;
}

export const OverviewTab = ({ product }: OverviewTabProps) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-muted-foreground">Category</dt>
              <dd className="font-medium">{product.category || 'Uncategorized'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Type</dt>
              <dd className="font-medium capitalize">{product.product_type}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Unit</dt>
              <dd className="font-medium">{product.unit_of_measurement || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Min. Stock</dt>
              <dd className="font-medium">{product.minimum_stock_level || 'Not set'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {product.description && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-sm text-muted-foreground">{product.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};