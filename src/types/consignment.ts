import { MeasurementUnit } from "./measurement-unit";

export interface Consignment {
  id: string;
  source_id: string;
  name: string;
  description: string;
  selling_price: number;
  purchase_price: number;
  category: string;
  measurement_unit_id: string;
  measurement_unit?: MeasurementUnit;
  created_at: string;
  updated_at: string;
  image_url?: string;
} 