// ─── Story Template Types ─── matches DB table: story_templates (Chapter 7.2)

export type TemplateStatus = 'draft' | 'review' | 'published' | 'suspended';

export interface SceneDefinition {
  scene_number: number;
  text: string;
  illustration_hint: string;
  animation_preset: string | null;
  interactive_elements: Array<{
    type: string;
    content: string;
  }> | null;
  placeholder_markers: string[];
}

export interface SEOMetadata {
  title: string;
  description: string;
  tags: string[];
  og_image: string | null;
  structured_data: Record<string, unknown> | null;
}

export interface StoryTemplate {
  id: string;
  creator_id: string | null;
  title: string;
  title_he: string | null;
  description: string | null;
  description_he: string | null;
  category: string;
  age_range_min: number;
  age_range_max: number;
  language: string;
  is_rhyming: boolean;
  scene_definitions: SceneDefinition[];
  cover_image_url: string | null;
  status: TemplateStatus;
  rating: number;
  rating_count: number;
  purchase_count: number;
  price: number;
  seo_metadata: SEOMetadata;
  created_at: string;
}

/** Fields required when creating a new template */
export interface TemplateCreate {
  title: string;
  title_he?: string;
  description?: string;
  description_he?: string;
  category: string;
  age_range_min?: number;
  age_range_max?: number;
  language?: string;
  is_rhyming?: boolean;
  scene_definitions: SceneDefinition[];
  cover_image_url?: string;
  price?: number;
  seo_metadata?: Partial<SEOMetadata>;
}
