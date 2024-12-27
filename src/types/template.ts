export interface Template {
  id: string;
  name: string;
  type: 'business' | 'personal';
  config: {
    layout: 'grid' | 'list';
    itemLabel: string;
    fields: Record<string, {
      label: string;
      required: boolean;
    }>;
    categories?: string[];
  };
  created_at: string;
  updated_at: string;
}