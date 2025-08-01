/**
 * Language configuration for the unriddle Chrome Extension
 * 
 * This file contains all language-related constants and configurations
 * to ensure consistency across the extension.
 */

// Type definitions
export type SupportedLanguage = 
  | 'Afrikaans' | 'Amharic' | 'Arabic' | 'Armenian' | 'Assamese' | 'Azerbaijani'
  | 'Basque' | 'Bengali' | 'Bulgarian' | 'Burmese' | 'Catalan' | 'Chinese (Simplified)'
  | 'Chinese (Traditional)' | 'Croatian' | 'Czech' | 'Danish' | 'Dutch' | 'English'
  | 'Estonian' | 'Filipino' | 'Finnish' | 'French' | 'Galician' | 'Georgian'
  | 'German' | 'Greek' | 'Gujarati' | 'Hausa' | 'Hebrew' | 'Hindi' | 'Hmong'
  | 'Hungarian' | 'Icelandic' | 'Igbo' | 'Indonesian' | 'Irish' | 'Italian'
  | 'Japanese' | 'Kannada' | 'Kazakh' | 'Khmer' | 'Korean' | 'Kyrgyz' | 'Lao'
  | 'Latvian' | 'Lithuanian' | 'Malay' | 'Malayalam' | 'Maltese' | 'Marathi'
  | 'Mongolian' | 'Nepali' | 'Norwegian' | 'Odia' | 'Persian' | 'Polish'
  | 'Portuguese' | 'Punjabi' | 'Romanian' | 'Russian' | 'Sanskrit' | 'Sinhala'
  | 'Slovak' | 'Slovenian' | 'Spanish' | 'Swahili' | 'Swedish' | 'Tajik'
  | 'Tamil' | 'Telugu' | 'Thai' | 'Tibetan' | 'Turkish' | 'Turkmen' | 'Ukrainian'
  | 'Urdu' | 'Uzbek' | 'Vietnamese' | 'Welsh' | 'Xhosa' | 'Yoruba' | 'Zulu';

// Available languages - commonly used languages well-supported by Gemini models (alphabetical order)
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  'Afrikaans',
  'Amharic',
  'Arabic',
  'Armenian',
  'Assamese',
  'Azerbaijani',
  'Basque',
  'Bengali',
  'Bulgarian',
  'Burmese',
  'Catalan',
  'Chinese (Simplified)',
  'Chinese (Traditional)',
  'Croatian',
  'Czech',
  'Danish',
  'Dutch',
  'English',
  'Estonian',
  'Filipino',
  'Finnish',
  'French',
  'Galician',
  'Georgian',
  'German',
  'Greek',
  'Gujarati',
  'Hausa',
  'Hebrew',
  'Hindi',
  'Hmong',
  'Hungarian',
  'Icelandic',
  'Igbo',
  'Indonesian',
  'Irish',
  'Italian',
  'Japanese',
  'Kannada',
  'Kazakh',
  'Khmer',
  'Korean',
  'Kyrgyz',
  'Lao',
  'Latvian',
  'Lithuanian',
  'Malay',
  'Malayalam',
  'Maltese',
  'Marathi',
  'Mongolian',
  'Nepali',
  'Norwegian',
  'Odia',
  'Persian',
  'Polish',
  'Portuguese',
  'Punjabi',
  'Romanian',
  'Russian',
  'Sanskrit',
  'Sinhala',
  'Slovak',
  'Slovenian',
  'Spanish',
  'Swahili',
  'Swedish',
  'Tajik',
  'Tamil',
  'Telugu',
  'Thai',
  'Tibetan',
  'Turkish',
  'Turkmen',
  'Ukrainian',
  'Urdu',
  'Uzbek',
  'Vietnamese',
  'Welsh',
  'Xhosa',
  'Yoruba',
  'Zulu'
];

// Default language setting
export const DEFAULT_LANGUAGE: SupportedLanguage = 'English';

// Language display names with English names first for better searchability
export const LANGUAGE_DISPLAY_NAMES: Record<SupportedLanguage, string> = {
  'Afrikaans': 'Afrikaans (Afrikaans)',
  'Amharic': 'Amharic (አማርኛ)',
  'Arabic': 'Arabic (العربية)',
  'Armenian': 'Armenian (Հայերեն)',
  'Assamese': 'Assamese (অসমীয়া)',
  'Azerbaijani': 'Azerbaijani (Azərbaycan)',
  'Basque': 'Basque (Euskara)',
  'Bengali': 'Bengali (বাংলা)',
  'Bulgarian': 'Bulgarian (Български)',
  'Burmese': 'Burmese (မြန်မာ)',
  'Catalan': 'Catalan (Català)',
  'Chinese (Simplified)': 'Chinese Simplified (简体中文)',
  'Chinese (Traditional)': 'Chinese Traditional (繁體中文)',
  'Croatian': 'Croatian (Hrvatski)',
  'Czech': 'Czech (Čeština)',
  'Danish': 'Danish (Dansk)',
  'Dutch': 'Dutch (Nederlands)',
  'English': 'English (English)',
  'Estonian': 'Estonian (Eesti)',
  'Filipino': 'Filipino (Filipino)',
  'Finnish': 'Finnish (Suomi)',
  'French': 'French (Français)',
  'Galician': 'Galician (Galego)',
  'Georgian': 'Georgian (ქართული)',
  'German': 'German (Deutsch)',
  'Greek': 'Greek (Ελληνικά)',
  'Gujarati': 'Gujarati (ગુજરાતી)',
  'Hausa': 'Hausa (Hausa)',
  'Hebrew': 'Hebrew (עברית)',
  'Hindi': 'Hindi (हिन्दी)',
  'Hmong': 'Hmong (Hmong)',
  'Hungarian': 'Hungarian (Magyar)',
  'Icelandic': 'Icelandic (Íslenska)',
  'Igbo': 'Igbo (Igbo)',
  'Indonesian': 'Indonesian (Bahasa Indonesia)',
  'Irish': 'Irish (Gaeilge)',
  'Italian': 'Italian (Italiano)',
  'Japanese': 'Japanese (日本語)',
  'Kannada': 'Kannada (ಕನ್ನಡ)',
  'Kazakh': 'Kazakh (Қазақ)',
  'Khmer': 'Khmer (ខ្មែរ)',
  'Korean': 'Korean (한국어)',
  'Kyrgyz': 'Kyrgyz (Кыргызча)',
  'Lao': 'Lao (ລາວ)',
  'Latvian': 'Latvian (Latviešu)',
  'Lithuanian': 'Lithuanian (Lietuvių)',
  'Malay': 'Malay (Bahasa Melayu)',
  'Malayalam': 'Malayalam (മലയാളം)',
  'Maltese': 'Maltese (Malti)',
  'Marathi': 'Marathi (मराठी)',
  'Mongolian': 'Mongolian (Монгол)',
  'Nepali': 'Nepali (नेपाली)',
  'Norwegian': 'Norwegian (Norsk)',
  'Odia': 'Odia (ଓଡ଼ିଆ)',
  'Persian': 'Persian (فارسی)',
  'Polish': 'Polish (Polski)',
  'Portuguese': 'Portuguese (Português)',
  'Punjabi': 'Punjabi (ਪੰਜਾਬੀ)',
  'Romanian': 'Romanian (Română)',
  'Russian': 'Russian (Русский)',
  'Sanskrit': 'Sanskrit (संस्कृतम्)',
  'Sinhala': 'Sinhala (සිංහල)',
  'Slovak': 'Slovak (Slovenčina)',
  'Slovenian': 'Slovenian (Slovenščina)',
  'Spanish': 'Spanish (Español)',
  'Swahili': 'Swahili (Kiswahili)',
  'Swedish': 'Swedish (Svenska)',
  'Tajik': 'Tajik (Тоҷикӣ)',
  'Tamil': 'Tamil (தமிழ்)',
  'Telugu': 'Telugu (తెలుగు)',
  'Thai': 'Thai (ไทย)',
  'Tibetan': 'Tibetan (བོད་སྐད་)',
  'Turkish': 'Turkish (Türkçe)',
  'Turkmen': 'Turkmen (Türkmen)',
  'Ukrainian': 'Ukrainian (Українська)',
  'Urdu': 'Urdu (اردو)',
  'Uzbek': 'Uzbek (O\'zbek)',
  'Vietnamese': 'Vietnamese (Tiếng Việt)',
  'Welsh': 'Welsh (Cymraeg)',
  'Xhosa': 'Xhosa (isiXhosa)',
  'Yoruba': 'Yoruba (Yorùbá)',
  'Zulu': 'Zulu (isiZulu)'
};

// List of supported right-to-left (RTL) languages
export const RTL_LANGUAGES: SupportedLanguage[] = [
  'Arabic',
  'Hebrew',
  'Persian',
  'Urdu'
];

/**
 * Validates if a language is supported
 * @param language - The language to validate
 * @returns True if the language is supported
 */
export function isSupportedLanguage(language: string): language is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(language as SupportedLanguage);
}

/**
 * Gets the display name for a language
 * @param language - The language code
 * @returns The display name or the original code if not found
 */
export function getLanguageDisplayName(language: string): string {
  return LANGUAGE_DISPLAY_NAMES[language as SupportedLanguage] || language;
} 