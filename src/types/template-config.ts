export interface BusinessTemplateConfig {
  layout?: 'grid' | 'list';
  itemLabel?: string;
  fields?: Record<string, unknown>;
  categories?: string[];
  productBased?: boolean;
}

export interface PersonalTemplateConfig {
  layout?: 'grid' | 'list';
  itemLabel?: string;
  fields?: Record<string, unknown>;
  categories?: string[];
}

export type TemplateConfig = BusinessTemplateConfig | PersonalTemplateConfig;