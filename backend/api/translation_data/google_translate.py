"""
Google Translate API integration for enhanced translation capabilities
"""
import logging
from googletrans import Translator
from googletrans.constants import LANGUAGES

logger = logging.getLogger(__name__)

# Map our language names to Google Translate language codes
LANGUAGE_CODE_MAP = {
    "English": "en",
    "Spanish": "es",
    "French": "fr",
    "German": "de",
    "Chinese": "zh-cn",
    "Japanese": "ja",
    "Russian": "ru",
    "Arabic": "ar",
    "Portuguese": "pt",
    "Italian": "it"
}

# Reverse mapping from codes to our language names
CODE_TO_LANGUAGE_MAP = {v: k for k, v in LANGUAGE_CODE_MAP.items()}

class GoogleTranslator:
    """
    Wrapper for Google Translate API using the googletrans library
    """
    def __init__(self):
        self.translator = Translator()
        self.supported_languages = set(LANGUAGE_CODE_MAP.keys())
        self.fallback_enabled = True
    
    def translate_text(self, text, source_language, target_language, fallback_fn=None):
        """
        Translate text using Google Translate API
        
        Args:
            text (str): Text to translate
            source_language (str): Source language name (e.g., "English")
            target_language (str): Target language name (e.g., "Spanish")
            fallback_fn (callable): Function to call if Google Translate fails
            
        Returns:
            str: Translated text
        """
        if not text.strip():
            return text
            
        # Convert language names to Google Translate codes
        try:
            source_code = LANGUAGE_CODE_MAP.get(source_language, 'auto')
            target_code = LANGUAGE_CODE_MAP.get(target_language)
            
            if not target_code:
                logger.warning(f"Unsupported target language: {target_language}")
                return fallback_fn(text, source_language, target_language) if fallback_fn and self.fallback_enabled else text
                
            # Call Google Translate API
            result = self.translator.translate(
                text, 
                src=source_code,
                dest=target_code
            )
            
            # Log successful translation
            logger.info(f"Google translated from {source_language} to {target_language}")
            return result.text
            
        except Exception as e:
            # Log error and use fallback if available
            logger.error(f"Google Translate error: {str(e)}")
            if fallback_fn and self.fallback_enabled:
                logger.info("Using fallback translation method")
                return fallback_fn(text, source_language, target_language)
            return text
    
    def detect_language(self, text):
        """
        Detect the language of a text using Google Translate
        
        Args:
            text (str): Text to detect language from
            
        Returns:
            str: Detected language name (e.g., "English")
        """
        if not text.strip():
            return "English"
            
        try:
            detection = self.translator.detect(text)
            detected_code = detection.lang
            
            # Convert language code to our language name
            language_name = CODE_TO_LANGUAGE_MAP.get(detected_code)
            
            # If detected language is not in our supported languages, default to English
            if not language_name:
                logger.warning(f"Detected unsupported language code: {detected_code}")
                return "English"
                
            logger.info(f"Google detected language: {language_name} (confidence: {detection.confidence})")
            return language_name
            
        except Exception as e:
            logger.error(f"Language detection error: {str(e)}")
            return "English"
            
    def get_supported_languages(self):
        """Get list of supported languages for translation"""
        return list(self.supported_languages)
        
    def enable_fallback(self, enabled=True):
        """Enable or disable fallback to dictionary-based translation"""
        self.fallback_enabled = enabled

# Initialize global translator instance
google_translator = GoogleTranslator() 