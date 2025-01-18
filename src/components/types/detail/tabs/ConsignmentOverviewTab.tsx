import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ConsignmentOverviewTabProps {
  consignment: {
    name: string;
    description: string | null;
    unit_cost: number;
    selling_price: number;
    category: string | null;
    subcategory: string | null;
    storage_location: string | null;
    unit_of_measurement: string | null;
    suppliers?: {
      name: string;
      contact_info: any;
      address: string | null;
    } | null;
    supplier_settlement_terms?: {
      settlement_frequency: string;
      payment_terms: number;
      commission_rate: number | null;
    } | null;
  };
  isEditing?: boolean;
  editedConsignment?: any;
  onConsignmentChange?: (consignment: any) => void;
}

export const ConsignmentOverviewTab = ({ 
  consignment, 
  isEditing, 
  editedConsignment, 
  onConsignmentChange 
}: ConsignmentOverviewTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="font-medium">Category:</span>{" "}
            {isEditing ? (
              <Input
                value={editedConsignment?.category || ''}
                onChange={(e) => onConsignmentChange?.({ ...editedConsignment, category: e.target.value })}
                className="mt-1"
                placeholder="Category"
              />
            ) : (
              consignment.category || "Uncategorized"
            )}
            {consignment.subcategory && ` / ${consignment.subcategory}`}
          </div>
          <div>
            <span className="font-medium">Unit of Measurement:</span>{" "}
            {isEditing ? (
              <Input
                value={editedConsignment?.unit_of_measurement || ''}
                onChange={(e) => onConsignmentChange?.({ ...editedConsignment, unit_of_measurement: e.target.value })}
                className="mt-1"
                placeholder="Unit of measurement"
              />
            ) : (
              consignment.unit_of_measurement || "N/A"
            )}
          </div>
          <div>
            <span className="font-medium">Storage Location:</span>{" "}
            {isEditing ? (
              <Input
                value={editedConsignment?.storage_location || ''}
                onChange={(e) => onConsignmentChange?.({ ...editedConsignment, storage_location: e.target.value })}
                className="mt-1"
                placeholder="Storage location"
              />
            ) : (
              consignment.storage_location || "Not specified"
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="font-medium">Supplier Name:</span>{" "}
            {consignment.suppliers?.name}
          </div>
          {consignment.suppliers?.address && (
            <div>
              <span className="font-medium">Address:</span>{" "}
              {consignment.suppliers.address}
            </div>
          )}
          {consignment.supplier_settlement_terms && (
            <>
              <div>
                <span className="font-medium">Settlement Frequency:</span>{" "}
                {consignment.supplier_settlement_terms.settlement_frequency}
              </div>
              <div>
                <span className="font-medium">Payment Terms:</span>{" "}
                {consignment.supplier_settlement_terms.payment_terms} days
              </div>
              {consignment.supplier_settlement_terms.commission_rate && (
                <div>
                  <span className="font-medium">Commission Rate:</span>{" "}
                  {consignment.supplier_settlement_terms.commission_rate}%
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {consignment.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Input
                value={editedConsignment?.description || ''}
                onChange={(e) => onConsignmentChange?.({ ...editedConsignment, description: e.target.value })}
                className="mt-1"
                placeholder="Description"
              />
            ) : (
              <p className="text-sm text-muted-foreground">{consignment.description}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};