// ─── Voice Profile Types ─── matches DB table: voice_profiles (Chapter 7.2)

export type VoiceType = 'preset' | 'family';

export type CloneStatus = 'processing' | 'ready' | 'failed';

export interface VoiceProfile {
  id: string;
  user_id: string;
  name: string;
  type: VoiceType;
  family_role: string | null;
  language: string | null;
  gender: string | null;
  age_range: string | null;
  preview_audio_url: string | null;
  original_recording_url: string | null;
  clone_status: CloneStatus | null;
  provider: string | null;
  provider_voice_id: string | null;
  quality_score: number | null;
  created_at: string;
}
