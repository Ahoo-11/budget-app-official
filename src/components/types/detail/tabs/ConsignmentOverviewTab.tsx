import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
}

export const ConsignmentOverviewTab = ({ consignment }: ConsignmentOverviewTabProps) => {
  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Category:</span>{" "}
              {consignment.category || "Uncategorized"}
              {consignment.subcategory && ` / ${consignment.subcategory}`}
            </div>
            <div>
              <span className="font-medium">Unit of Measurement:</span>{" "}
              {consignment.unit_of_measurement || "N/A"}
            </div>
            <div>
              <span className="font-medium">Storage Location:</span>{" "}
              {consignment.storage_location || "Not specified"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Unit Cost:</span>{" "}
              ₱{consignment.unit_cost.toFixed(2)}
            </div>
            <div>
              <span className="font-medium">Selling Price:</span>{" "}
              ₱{consignment.selling_price.toFixed(2)}
            </div>
            <div>
              <span className="font-medium">Margin:</span>{" "}
              ₱{(consignment.selling_price - consignment.unit_cost).toFixed(2)} (
              {(((consignment.selling_price - consignment.unit_cost) / consignment.unit_cost) * 100).toFixed(1)}%)
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Supplier Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
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
      </div>
    </div>
  );
};