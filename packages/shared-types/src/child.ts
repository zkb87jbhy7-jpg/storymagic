// ─── Child Profile Types ─── matches DB table: children_profiles (Chapter 7.2)

export type FaceProcessingStatus =
  | 'pending'
  | 'processing'
  | 'ready'
  | 'failed'
  | 'expired';

export type Gender = 'boy' | 'girl' | 'prefer_not_to_say';

export interface PhysicalTraits {
  wheelchair: boolean;
  glasses: boolean;
  hearing_aid: boolean;
  skin_tone: string;
  hair_color: string;
  hair_style: string;
  custom_notes: string;
}

export interface ChildPreferences {
  family_structure: string;
  cultural_prefs: string[];
  accessibility_needs: string[];
  reading_prefs: string[];
  dietary_restrictions: string[];
  modesty_concerns: boolean;
  holiday_preferences: string[];
  pronouns: string;
}

export interface CharacterSheetUrls {
  front: string;
  profile: string;
  three_quarter: string;
  back: string;
}

export interface ChildProfile {
  id: string;
  user_id: string;
  name: string;
  gender: Gender | null;
  birth_date: string | null;
  physical_traits: PhysicalTraits;
  preferences: ChildPreferences;
  face_embedding_ref: string | null;
  character_sheet_urls: CharacterSheetUrls | null;
  photos_expiry_date: string | null;
  photos_count: number;
  face_processing_status: FaceProcessingStatus;
  face_embedding_expiry: string | null;
  created_at: string;
  updated_at: string;
}

/** Fields required when creating a new child profile */
export interface ChildProfileCreate {
  name: string;
  gender?: Gender;
  birth_date?: string;
  physical_traits?: Partial<PhysicalTraits>;
  preferences?: Partial<ChildPreferences>;
}

/** Fields allowed when updating a child profile */
export interface ChildProfileUpdate {
  name?: string;
  gender?: Gender;
  birth_date?: string;
  physical_traits?: Partial<PhysicalTraits>;
  preferences?: Partial<ChildPreferences>;
}
