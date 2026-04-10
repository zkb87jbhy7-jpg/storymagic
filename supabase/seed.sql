-- StoryMagic Seed Data
-- Spec ref: Appendix D (templates), Ch11.2 (voice presets)
-- Password for all test users: "Test1234!" (bcrypt hash)

-- ============================================================
-- Test Users
-- ============================================================

INSERT INTO users (id, email, name, password_hash, language_preference, currency_preference, subscription_tier, onboarding_type, encryption_key_ref, referral_code, timezone)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'test.he@storymagic.dev', 'דניאל כהן', '$2b$12$LJ3m4ys3Lz0QVZ3V0X5XOe9Y4v7r8r9Q1K2Z3X4C5V6B7N8M9A0BC', 'he', 'ILS', 'monthly', 'guided', 'dev-key-001', 'TESTREF1', 'Asia/Jerusalem'),
  ('a0000000-0000-0000-0000-000000000002', 'test.en@storymagic.dev', 'Sarah Johnson', '$2b$12$LJ3m4ys3Lz0QVZ3V0X5XOe9Y4v7r8r9Q1K2Z3X4C5V6B7N8M9A0BC', 'en', 'USD', 'yearly', 'creative', 'dev-key-002', 'TESTREF2', 'America/New_York'),
  ('a0000000-0000-0000-0000-000000000003', 'admin@storymagic.dev', 'Admin User', '$2b$12$LJ3m4ys3Lz0QVZ3V0X5XOe9Y4v7r8r9Q1K2Z3X4C5V6B7N8M9A0BC', 'en', 'USD', 'yearly', 'creative', 'dev-key-003', 'ADMINREF', 'Asia/Jerusalem')
ON CONFLICT (id) DO NOTHING;

UPDATE users SET is_admin = true WHERE id = 'a0000000-0000-0000-0000-000000000003';

-- ============================================================
-- Child Profiles (ages 3, 6, 9)
-- ============================================================

INSERT INTO children_profiles (id, user_id, name, gender, birth_date, physical_traits, preferences, face_processing_status)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'מיקה', 'girl', '2023-05-15',
   '{"wheelchair": false, "glasses": false, "hearing_aid": false, "skin_tone": "light", "hair_color": "brown", "hair_style": "long_curly", "custom_notes": ""}'::jsonb,
   '{"family_structure": "two_parents", "cultural_prefs": ["jewish"], "accessibility_needs": [], "reading_prefs": [], "dietary_restrictions": ["kosher"], "modesty_concerns": false, "holiday_preferences": ["hanukkah", "purim", "rosh_hashana"], "pronouns": "she"}'::jsonb,
   'ready'),

  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   'אורי', 'boy', '2020-08-22',
   '{"wheelchair": false, "glasses": true, "hearing_aid": false, "skin_tone": "olive", "hair_color": "black", "hair_style": "short", "custom_notes": ""}'::jsonb,
   '{"family_structure": "two_parents", "cultural_prefs": ["jewish"], "accessibility_needs": [], "reading_prefs": ["longer_stories"], "dietary_restrictions": ["kosher"], "modesty_concerns": false, "holiday_preferences": ["hanukkah", "purim"], "pronouns": "he"}'::jsonb,
   'ready'),

  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002',
   'Emma', 'girl', '2017-02-10',
   '{"wheelchair": false, "glasses": false, "hearing_aid": false, "skin_tone": "medium", "hair_color": "blonde", "hair_style": "ponytail", "custom_notes": ""}'::jsonb,
   '{"family_structure": "single_parent", "cultural_prefs": [], "accessibility_needs": [], "reading_prefs": ["complex_stories", "humor"], "dietary_restrictions": [], "modesty_concerns": false, "holiday_preferences": ["christmas", "easter"], "pronouns": "she"}'::jsonb,
   'ready')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Creator (for marketplace templates)
-- ============================================================

INSERT INTO creators (id, user_id, display_name, bio, bio_he, status)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003',
   'StoryMagic Team', 'Official StoryMagic templates', 'תבניות רשמיות של StoryMagic', 'approved')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Story Templates (12 from Appendix D)
-- ============================================================

INSERT INTO story_templates (id, creator_id, title, title_he, description, description_he, category, age_range_min, age_range_max, language, is_rhyming, scene_definitions, status, price)
VALUES
  -- Adventure
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001',
   'Space Adventure', 'הרפתקה בחלל',
   'The child flies to a planet of friendly aliens and discovers the universe',
   'הילד/ה טס/ה לכוכב לכת של חייזרים ידידותיים ומגלה את היקום',
   'adventure', 4, 8, 'he', false,
   '[{"scene": 1, "description": "Blast off from backyard", "illustration_hint": "rocket launch, starry sky"},
     {"scene": 2, "description": "Flying through space", "illustration_hint": "colorful nebula, floating"},
     {"scene": 3, "description": "Landing on alien planet", "illustration_hint": "purple terrain, two moons"},
     {"scene": 4, "description": "Meeting friendly aliens", "illustration_hint": "cute aliens, welcoming"},
     {"scene": 5, "description": "Alien school", "illustration_hint": "classroom with alien students"},
     {"scene": 6, "description": "Learning alien games", "illustration_hint": "floating ball game"},
     {"scene": 7, "description": "Sharing Earth stories", "illustration_hint": "campfire, listening aliens"},
     {"scene": 8, "description": "The farewell gift", "illustration_hint": "glowing star crystal"},
     {"scene": 9, "description": "Flying home", "illustration_hint": "earth approaching, sunrise"},
     {"scene": 10, "description": "Back in the backyard with a star", "illustration_hint": "night sky, glowing pocket"}]'::jsonb,
   'published', 0),

  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001',
   'Under the Sea', 'מתחת לים',
   'The child discovers an underwater kingdom of mermaids and sea creatures',
   'הילד/ה מגלה ממלכה תת-ימית של בתולות ים ויצורי ים',
   'adventure', 3, 7, 'he', false,
   '[{"scene": 1, "description": "Beach day, finding a shell"},
     {"scene": 2, "description": "Diving underwater"},
     {"scene": 3, "description": "Meeting a friendly dolphin"},
     {"scene": 4, "description": "Coral reef kingdom"},
     {"scene": 5, "description": "The sea queen"},
     {"scene": 6, "description": "Saving the trapped turtle"},
     {"scene": 7, "description": "Celebration feast"},
     {"scene": 8, "description": "Swimming back with a pearl"}]'::jsonb,
   'published', 0),

  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001',
   'The Enchanted Forest', 'היער הקסום',
   'The child follows a trail of glowing mushrooms into a magical forest',
   'הילד/ה עוקב/ת אחרי שביל של פטריות זוהרות ליער קסום',
   'adventure', 5, 9, 'he', false,
   '[{"scene": 1, "description": "Discovering glowing mushrooms"},
     {"scene": 2, "description": "Following the trail"},
     {"scene": 3, "description": "Meeting the wise owl"},
     {"scene": 4, "description": "The talking trees"},
     {"scene": 5, "description": "Fairy village"},
     {"scene": 6, "description": "The riddle challenge"},
     {"scene": 7, "description": "Finding the golden acorn"},
     {"scene": 8, "description": "The forest celebrates"},
     {"scene": 9, "description": "Path home lit by fireflies"},
     {"scene": 10, "description": "The acorn grows in the garden"}]'::jsonb,
   'published', 0),

  -- Friendship
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001',
   'The New Friend', 'החבר/ה החדש/ה',
   'The child meets someone different and discovers they have a lot in common',
   'הילד/ה פוגש/ת מישהו שונה ומגלה שיש להם הרבה במשותף',
   'friendship', 3, 6, 'he', false,
   '[{"scene": 1, "description": "First day at the park"},
     {"scene": 2, "description": "Seeing someone new"},
     {"scene": 3, "description": "Feeling shy"},
     {"scene": 4, "description": "A shared toy moment"},
     {"scene": 5, "description": "Playing together"},
     {"scene": 6, "description": "Discovering similarities"},
     {"scene": 7, "description": "Best friends handshake"},
     {"scene": 8, "description": "Planning next playdate"}]'::jsonb,
   'published', 0),

  ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001',
   'Together We''re Strong', 'ביחד אנחנו חזקים',
   'Friends each contribute their unique talent to solve a problem',
   'חברים תורמים כל אחד את הכישרון הייחודי שלו לפתרון בעיה',
   'friendship', 5, 8, 'he', false,
   '[{"scene": 1, "description": "The broken bridge"},
     {"scene": 2, "description": "Each friend has an idea"},
     {"scene": 3, "description": "Strong friend lifts"},
     {"scene": 4, "description": "Smart friend plans"},
     {"scene": 5, "description": "Creative friend designs"},
     {"scene": 6, "description": "Brave friend crosses first"},
     {"scene": 7, "description": "Working together"},
     {"scene": 8, "description": "Bridge rebuilt, group hug"}]'::jsonb,
   'published', 0),

  -- Learning
  ('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001',
   'The Colors of the Rainbow', 'צבעי הקשת',
   'The child travels through a world where each stop teaches a color',
   'הילד/ה מטייל/ת בעולם שבו כל תחנה מלמדת צבע',
   'learning', 2, 4, 'he', true,
   '[{"scene": 1, "description": "A colorless world"},
     {"scene": 2, "description": "Red - fire truck station"},
     {"scene": 3, "description": "Orange - sunset garden"},
     {"scene": 4, "description": "Yellow - sunshine meadow"},
     {"scene": 5, "description": "Green - forest of trees"},
     {"scene": 6, "description": "Blue - ocean waves"},
     {"scene": 7, "description": "Purple - royal castle"},
     {"scene": 8, "description": "Rainbow appears, world is colorful"}]'::jsonb,
   'published', 0),

  ('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000001',
   'Counting to Ten', 'סופרים עד עשר',
   'The child counts animals on a farm',
   'הילד/ה סופר/ת חיות בחווה',
   'learning', 2, 4, 'he', true,
   '[{"scene": 1, "description": "Arriving at the farm"},
     {"scene": 2, "description": "1 rooster crowing"},
     {"scene": 3, "description": "2 cats napping"},
     {"scene": 4, "description": "3 dogs playing"},
     {"scene": 5, "description": "4 horses running"},
     {"scene": 6, "description": "5 chickens pecking"},
     {"scene": 7, "description": "6-10 more animals"},
     {"scene": 8, "description": "All animals together, count to 10"}]'::jsonb,
   'published', 0),

  -- Bedtime
  ('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000001',
   'My Star', 'הכוכב שלי',
   'A star watches over the child through the night',
   'כוכב שומר על הילד/ה לאורך הלילה',
   'bedtime', 2, 5, 'he', true,
   '[{"scene": 1, "description": "Bedtime, looking at the sky"},
     {"scene": 2, "description": "One star winks"},
     {"scene": 3, "description": "Star follows child to bed"},
     {"scene": 4, "description": "Star sings a lullaby"},
     {"scene": 5, "description": "Dreaming of flying with the star"},
     {"scene": 6, "description": "Star guards the dreams"},
     {"scene": 7, "description": "Morning comes, star fades"},
     {"scene": 8, "description": "See you tonight, dear star"}]'::jsonb,
   'published', 0),

  ('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000001',
   'Goodnight Moon', 'לילה טוב ירח',
   'The child says goodnight to everything in the room',
   'הילד/ה אומר/ת לילה טוב לכל מה שבחדר',
   'bedtime', 2, 4, 'he', true,
   '[{"scene": 1, "description": "Cozy bedroom at dusk"},
     {"scene": 2, "description": "Goodnight toys"},
     {"scene": 3, "description": "Goodnight books"},
     {"scene": 4, "description": "Goodnight window"},
     {"scene": 5, "description": "Goodnight moon"},
     {"scene": 6, "description": "Goodnight stars"},
     {"scene": 7, "description": "Eyes closing"},
     {"scene": 8, "description": "Sweet dreams"}]'::jsonb,
   'published', 0),

  -- Holidays
  ('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000001',
   'Happy Hanukkah', 'חנוכה שמח',
   'The child lights candles and discovers the story of the Maccabees',
   'הילד/ה מדליק/ה נרות ומגלה את סיפור המכבים',
   'holidays', 3, 7, 'he', false,
   '[{"scene": 1, "description": "Family gathering for Hanukkah"},
     {"scene": 2, "description": "Finding the old menorah"},
     {"scene": 3, "description": "Grandpa tells the story"},
     {"scene": 4, "description": "The brave Maccabees"},
     {"scene": 5, "description": "The miracle of the oil"},
     {"scene": 6, "description": "Lighting the first candle"},
     {"scene": 7, "description": "Sufganiyot and dreidel"},
     {"scene": 8, "description": "Eight candles shining bright"}]'::jsonb,
   'published', 0),

  ('d0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000001',
   'A Sweet New Year', 'שנה מתוקה',
   'The child prepares for Rosh Hashanah with family',
   'הילד/ה מתכונן/ת לראש השנה עם המשפחה',
   'holidays', 3, 7, 'he', false,
   '[{"scene": 1, "description": "Shopping for the holiday"},
     {"scene": 2, "description": "Baking honey cake with mom"},
     {"scene": 3, "description": "Setting the holiday table"},
     {"scene": 4, "description": "Apple dipped in honey"},
     {"scene": 5, "description": "Pomegranate seeds"},
     {"scene": 6, "description": "Hearing the shofar"},
     {"scene": 7, "description": "Making wishes for the new year"},
     {"scene": 8, "description": "Shana Tova, sweet dreams"}]'::jsonb,
   'published', 0),

  -- Emotions
  ('d0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000001',
   'When I Feel...', 'כשאני מרגיש/ה...',
   'The child navigates different emotions with a wise animal guide',
   'הילד/ה מנווט/ת רגשות שונים עם מדריך חיה חכמה',
   'emotions', 3, 6, 'he', false,
   '[{"scene": 1, "description": "Meeting the wise fox"},
     {"scene": 2, "description": "Feeling happy - sunshine inside"},
     {"scene": 3, "description": "Feeling sad - rain cloud"},
     {"scene": 4, "description": "Feeling angry - volcano"},
     {"scene": 5, "description": "Feeling scared - dark cave"},
     {"scene": 6, "description": "Feeling brave - climbing mountain"},
     {"scene": 7, "description": "Feeling calm - quiet lake"},
     {"scene": 8, "description": "All feelings are okay"}]'::jsonb,
   'published', 0)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Voice Presets (Spec ref: Ch11.2)
-- ============================================================

INSERT INTO voice_profiles (id, user_id, name, type, language, gender, age_range, preview_audio_url, clone_status, provider, provider_voice_id, quality_score)
VALUES
  -- Hebrew voices
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003',
   'נועה המספרת', 'preset', 'he', 'female', 'adult',
   '/audio/presets/noa-preview.mp3', 'ready', 'elevenlabs', 'preset_noa_he', 4.8),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003',
   'סבא משה', 'preset', 'he', 'male', 'elderly',
   '/audio/presets/saba-moshe-preview.mp3', 'ready', 'elevenlabs', 'preset_saba_he', 4.7),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003',
   'סבתא מרים', 'preset', 'he', 'female', 'elderly',
   '/audio/presets/savta-miriam-preview.mp3', 'ready', 'elevenlabs', 'preset_savta_he', 4.9),
  ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003',
   'דני השובב', 'preset', 'he', 'male', 'child',
   '/audio/presets/dani-preview.mp3', 'ready', 'elevenlabs', 'preset_dani_he', 4.5),
  ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003',
   'מאיה הנמרצת', 'preset', 'he', 'female', 'child',
   '/audio/presets/maya-preview.mp3', 'ready', 'elevenlabs', 'preset_maya_he', 4.6),

  -- English voices
  ('e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003',
   'Storyteller Sarah', 'preset', 'en', 'female', 'adult',
   '/audio/presets/sarah-preview.mp3', 'ready', 'elevenlabs', 'preset_sarah_en', 4.8),
  ('e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003',
   'Grandpa Joe', 'preset', 'en', 'male', 'elderly',
   '/audio/presets/grandpa-joe-preview.mp3', 'ready', 'elevenlabs', 'preset_joe_en', 4.7),
  ('e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000003',
   'Young Maya', 'preset', 'en', 'female', 'child',
   '/audio/presets/young-maya-preview.mp3', 'ready', 'elevenlabs', 'preset_maya_en', 4.5),
  ('e0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000003',
   'Captain Alex', 'preset', 'en', 'male', 'adult',
   '/audio/presets/captain-alex-preview.mp3', 'ready', 'elevenlabs', 'preset_alex_en', 4.6),
  ('e0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000003',
   'Wise Grandma Ruth', 'preset', 'en', 'female', 'elderly',
   '/audio/presets/grandma-ruth-preview.mp3', 'ready', 'elevenlabs', 'preset_ruth_en', 4.9),
  ('e0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000003',
   'Playful Dani', 'preset', 'en', 'male', 'child',
   '/audio/presets/playful-dani-preview.mp3', 'ready', 'elevenlabs', 'preset_dani_en', 4.4)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Initial Prompt Versions
-- ============================================================

INSERT INTO prompt_versions (id, prompt_key, version, content, variables, status)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'story-architect-system', 1,
   'You are a Story Architect for children''s books. Generate a complete StoryBlueprint...',
   ARRAY['child_name', 'child_age', 'child_gender', 'topic', 'mood', 'page_count', 'language', 'is_rhyming'],
   'active'),
  ('f0000000-0000-0000-0000-000000000002', 'hebrew-poet-system', 1,
   'You are a Hebrew literary poet specializing in children''s literature...',
   ARRAY['blueprint', 'language', 'is_rhyming', 'rhyme_pairs'],
   'active'),
  ('f0000000-0000-0000-0000-000000000003', 'art-director-system', 1,
   'You are an Art Director creating detailed illustration prompts...',
   ARRAY['scene', 'style', 'child_description', 'emotional_tone', 'previous_prompts'],
   'active')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Subscriptions for test users
-- ============================================================

INSERT INTO subscriptions (id, user_id, tier, status, current_period_start, current_period_end, books_remaining_this_period, books_cap_per_period, free_prints_remaining)
VALUES
  ('00000000-0000-0000-0000-sub000000001', 'a0000000-0000-0000-0000-000000000001',
   'monthly', 'active', NOW(), NOW() + INTERVAL '30 days', 2, 2, 0),
  ('00000000-0000-0000-0000-sub000000002', 'a0000000-0000-0000-0000-000000000002',
   'yearly', 'active', NOW(), NOW() + INTERVAL '365 days', 24, 24, 3)
ON CONFLICT (id) DO NOTHING;
