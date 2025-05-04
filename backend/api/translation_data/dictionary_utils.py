"""
Translation utilities for enhancing dictionary coverage and translation quality
"""
import random
import hashlib
import re
import itertools
from .language_data import LANGUAGE_DICTIONARIES, LANGUAGE_CHARACTERISTICS

def create_pivot_dictionary(source_language, target_language):
    """
    Create a translation dictionary using English as a pivot language
    when direct translation between source and target isn't available
    """
    pivot_dict = {}
    
    # Use English as pivot if possible
    if "English" in LANGUAGE_DICTIONARIES and target_language in LANGUAGE_DICTIONARIES["English"]:
        english_to_target = LANGUAGE_DICTIONARIES["English"][target_language]
        
        # Then try Source->English
        if source_language in LANGUAGE_DICTIONARIES and "English" in LANGUAGE_DICTIONARIES[source_language]:
            source_to_english = LANGUAGE_DICTIONARIES[source_language]["English"]
            
            # Create a pivot dictionary
            for source_word, english_word in source_to_english.items():
                if english_word in english_to_target:
                    pivot_dict[source_word] = english_to_target[english_word]
    
    # If still empty, try to use any available shared language as pivot
    if not pivot_dict:
        for potential_pivot in LANGUAGE_DICTIONARIES.keys():
            if potential_pivot != source_language and potential_pivot != target_language:
                if (source_language in LANGUAGE_DICTIONARIES and 
                    potential_pivot in LANGUAGE_DICTIONARIES[source_language] and
                    target_language in LANGUAGE_DICTIONARIES and
                    potential_pivot in LANGUAGE_DICTIONARIES[target_language]):
                    
                    source_to_pivot = LANGUAGE_DICTIONARIES[source_language][potential_pivot]
                    pivot_to_target = LANGUAGE_DICTIONARIES[potential_pivot][target_language]
                    
                    for source_word, pivot_word in source_to_pivot.items():
                        if pivot_word in pivot_to_target:
                            pivot_dict[source_word] = pivot_to_target[pivot_word]
                    
                    # If we found enough translations, break
                    if len(pivot_dict) > 10:
                        break
    
    return pivot_dict

def get_language_suffix(language, word):
    """Get a suitable suffix for a word in the target language"""
    word_hash = int(hashlib.md5(word.lower().encode()).hexdigest(), 16)
    random.seed(word_hash)
    
    if language == "Spanish":
        if word.endswith(('e', 'i', 'u')):
            suffixes = ['', 'o', 'a', 'ar', 'ir', 'ero', 'ista', 'idad', 'ación']
        else:
            suffixes = ['o', 'a', 'ar', 'er', 'ir', 'ero', 'ista', 'idad', 'ación']
    elif language == "French":
        if word.endswith('e'):
            suffixes = ['', 'r', 'ur', 'eur', 'eux', 'rice', 'ique', 'ment', 'ité', 'ance']
        else:
            suffixes = ['e', 'er', 'ir', 'eur', 'eux', 'rice', 'ique', 'ment', 'ité', 'ance']
    elif language == "German":
        if word.endswith(('e', 'en', 'er')):
            suffixes = ['', 'en', 'er', 'heit', 'keit', 'ung', 'schaft', 'lich', 'ig', 'isch']
        else:
            suffixes = ['', 'e', 'en', 'er', 'heit', 'keit', 'ung', 'schaft', 'lich', 'ig']
    elif language == "Italian":
        if word.endswith('e'):
            suffixes = ['', 'o', 'a', 'i', 'e', 'are', 'ere', 'ire', 'ista', 'ione', 'mento']
        else:
            suffixes = ['o', 'a', 'i', 'e', 'are', 'ere', 'ire', 'ista', 'ione', 'mento']
    elif language == "Portuguese":
        if word.endswith('e'):
            suffixes = ['', 'o', 'a', 'ar', 'er', 'ir', 'eiro', 'ista', 'idade', 'ção']
        else:
            suffixes = ['o', 'a', 'ar', 'er', 'ir', 'eiro', 'ista', 'idade', 'ção']
    elif language == "Russian":
        suffixes = ['', 'ный', 'ная', 'ное', 'ски', 'ство', 'ность', 'тель', 'ция', 'ить']
    elif language == "Arabic":
        suffixes = ['', 'ة', 'ي', 'ية', 'ات', 'ين', 'ون', 'ان', 'تي', 'نا']
    else:
        suffixes = ['', 's', 'ed', 'ing', 'ly', 'ment', 'tion', 'ness', 'ity', 'er']
    
    return random.choice(suffixes)

def transform_text_for_language(text, target_language):
    """Apply language-specific text transformations"""
    if target_language == "Spanish":
        # Add Spanish question marks and exclamation marks
        text = re.sub(r'(\?)', r'¿\1', text)
        text = re.sub(r'(\!)', r'¡\1', text)
    
    if target_language == "German":
        # Capitalize nouns (simplified rule)
        words = text.split()
        for i in range(len(words)):
            # If it's a potential noun (not at the start, not a small word, not already capitalized)
            if (i > 0 and len(words[i]) >= 4 and 
                words[i][0].islower() and 
                not words[i-1].endswith(('.', '!', '?'))):
                words[i] = words[i][0].upper() + words[i][1:]
        text = ' '.join(words)
    
    if target_language == "Japanese":
        # Add Japanese sentence-ending particles
        particles = ["。", "ね", "よ", "な", ""]
        text = re.sub(r'\.', lambda x: random.choice(particles), text)
    
    if target_language == "Chinese":
        # Replace periods with Chinese full stops
        text = text.replace(".", "。")
    
    return text

def generate_complete_dictionaries():
    """
    Generate comprehensive translation dictionaries for all language pairs
    This function ensures that we have dictionaries for every possible language pair
    """
    # List of all supported languages
    languages = [
        "English", "Spanish", "French", "German", "Chinese", 
        "Japanese", "Russian", "Arabic", "Portuguese", "Italian"
    ]
    
    # Create reverse dictionaries for all existing language pairs
    for source_lang in list(LANGUAGE_DICTIONARIES.keys()):
        for target_lang in list(LANGUAGE_DICTIONARIES[source_lang].keys()):
            # Skip if reverse dictionary already exists
            if target_lang in LANGUAGE_DICTIONARIES and source_lang in LANGUAGE_DICTIONARIES[target_lang]:
                continue
            
            # Create the reverse dictionary
            if target_lang not in LANGUAGE_DICTIONARIES:
                LANGUAGE_DICTIONARIES[target_lang] = {}
                
            LANGUAGE_DICTIONARIES[target_lang][source_lang] = {
                target_word: source_word for source_word, target_word in LANGUAGE_DICTIONARIES[source_lang][target_lang].items()
            }
    
    # For each language pair, ensure we have a translation dictionary
    for source_lang, target_lang in itertools.product(languages, languages):
        if source_lang == target_lang:
            continue
            
        # Check if direct dictionary already exists
        if source_lang in LANGUAGE_DICTIONARIES and target_lang in LANGUAGE_DICTIONARIES[source_lang]:
            continue
            
        # Create a new dictionary entry if it doesn't exist
        if source_lang not in LANGUAGE_DICTIONARIES:
            LANGUAGE_DICTIONARIES[source_lang] = {}
            
        # Create dictionary using pivot translation
        if "English" in LANGUAGE_DICTIONARIES:
            english_translations = LANGUAGE_DICTIONARIES.get("English", {})
            source_to_english = {}
            
            # First try to find source to English mappings
            if source_lang in LANGUAGE_DICTIONARIES and "English" in LANGUAGE_DICTIONARIES[source_lang]:
                # Direct source to English exists
                source_to_english = LANGUAGE_DICTIONARIES[source_lang]["English"]
            elif "English" in LANGUAGE_DICTIONARIES and source_lang in english_translations:
                # Create reverse mapping from English to source
                source_to_english = {
                    target_word: source_word 
                    for source_word, target_word in english_translations[source_lang].items()
                }
            
            # Then try to find English to target mappings
            english_to_target = {}
            if target_lang in english_translations:
                english_to_target = english_translations[target_lang]
            elif target_lang in LANGUAGE_DICTIONARIES and "English" in LANGUAGE_DICTIONARIES[target_lang]:
                english_to_target = {
                    target_word: source_word 
                    for source_word, target_word in LANGUAGE_DICTIONARIES[target_lang]["English"].items()
                }
            
            # Create the pivot dictionary
            pivot_dict = {}
            for source_word, english_word in source_to_english.items():
                if english_word in english_to_target:
                    pivot_dict[source_word] = english_to_target[english_word]
            
            # Only set if we found something
            if pivot_dict:
                LANGUAGE_DICTIONARIES[source_lang][target_lang] = pivot_dict
    
    # Final check: if we still have missing pairs, try multi-step pivoting
    for source_lang, target_lang in itertools.product(languages, languages):
        if source_lang == target_lang:
            continue
            
        if source_lang not in LANGUAGE_DICTIONARIES or target_lang not in LANGUAGE_DICTIONARIES[source_lang] or not LANGUAGE_DICTIONARIES[source_lang][target_lang]:
            # Try to find a path from source to target through multiple languages
            for pivot1 in languages:
                if pivot1 == source_lang or pivot1 == target_lang:
                    continue
                    
                if source_lang in LANGUAGE_DICTIONARIES and pivot1 in LANGUAGE_DICTIONARIES[source_lang]:
                    for pivot2 in languages:
                        if pivot2 == source_lang or pivot2 == target_lang or pivot2 == pivot1:
                            continue
                            
                        if pivot1 in LANGUAGE_DICTIONARIES and pivot2 in LANGUAGE_DICTIONARIES[pivot1] and pivot2 in LANGUAGE_DICTIONARIES and target_lang in LANGUAGE_DICTIONARIES[pivot2]:
                            # We found a path: source -> pivot1 -> pivot2 -> target
                            source_to_pivot1 = LANGUAGE_DICTIONARIES[source_lang][pivot1]
                            pivot1_to_pivot2 = LANGUAGE_DICTIONARIES[pivot1][pivot2]
                            pivot2_to_target = LANGUAGE_DICTIONARIES[pivot2][target_lang]
                            
                            # Create a new dictionary entry if it doesn't exist
                            if source_lang not in LANGUAGE_DICTIONARIES:
                                LANGUAGE_DICTIONARIES[source_lang] = {}
                                
                            pivot_dict = {}
                            for source_word, pivot1_word in source_to_pivot1.items():
                                for p1_word, p2_word in pivot1_to_pivot2.items():
                                    if p1_word == pivot1_word:
                                        for p2_word2, target_word in pivot2_to_target.items():
                                            if p2_word == p2_word2:
                                                pivot_dict[source_word] = target_word
                            
                            if pivot_dict:
                                LANGUAGE_DICTIONARIES[source_lang][target_lang] = pivot_dict
                                break
                    
                    if source_lang in LANGUAGE_DICTIONARIES and target_lang in LANGUAGE_DICTIONARIES[source_lang]:
                        break
    
    return LANGUAGE_DICTIONARIES

def enrich_dictionary(source_lang, target_lang):
    """
    Enrich a translation dictionary with additional entries based on patterns
    and other available dictionaries
    """
    if source_lang not in LANGUAGE_DICTIONARIES or target_lang not in LANGUAGE_DICTIONARIES[source_lang]:
        return {}
        
    # Get the existing dictionary
    dictionary = LANGUAGE_DICTIONARIES[source_lang][target_lang]
    enriched_dict = dictionary.copy()
    
    # Add plurals, verb forms, and other variations
    for word, translation in dictionary.items():
        # English plurals
        if source_lang == "English" and word.endswith('s') and word[:-1] in dictionary:
            singular = word[:-1]
            singular_translation = dictionary[singular]
            
            # Add plural form based on target language rules
            if target_lang == "Spanish" and singular_translation.endswith(('o', 'a')):
                enriched_dict[word] = singular_translation[:-1] + ('os' if singular_translation.endswith('o') else 'as')
            elif target_lang == "French" and not singular_translation.endswith('s'):
                enriched_dict[word] = singular_translation + 's'
            elif target_lang == "German" and not singular_translation.endswith('n'):
                enriched_dict[word] = singular_translation + 'n'
            elif target_lang == "Italian" and singular_translation.endswith(('o', 'a')):
                enriched_dict[word] = singular_translation[:-1] + ('i' if singular_translation.endswith('o') else 'e')
            elif target_lang == "Portuguese" and singular_translation.endswith(('o', 'a')):
                enriched_dict[word] = singular_translation[:-1] + ('os' if singular_translation.endswith('o') else 'as')
    
    # Use shared word stems to generate additional translations
    source_stems = {}
    target_stems = {}
    
    # Find word stems (simplified approach)
    for word, translation in dictionary.items():
        if len(word) > 3:
            source_stems[word[:3]] = source_stems.get(word[:3], []) + [word]
        if len(translation) > 3:
            target_stems[translation[:3]] = target_stems.get(translation[:3], []) + [translation]
    
    # Use stems to infer new translations
    for source_word in LANGUAGE_DICTIONARIES.get("English", {}).get(source_lang, {}):
        if source_word not in enriched_dict and len(source_word) > 3:
            stem = source_word[:3]
            if stem in source_stems:
                # Find a similar word and adapt its translation
                similar_word = source_stems[stem][0]
                if similar_word in dictionary:
                    similar_translation = dictionary[similar_word]
                    # Adapt the translation based on the difference between the words
                    if len(source_word) > len(similar_word):
                        enriched_dict[source_word] = similar_translation + get_language_suffix(target_lang, source_word)
                    elif len(source_word) < len(similar_word):
                        if len(similar_translation) > 3:
                            enriched_dict[source_word] = similar_translation[:len(similar_translation)-2]
                        else:
                            enriched_dict[source_word] = similar_translation
    
    return enriched_dict

# Create a function to generate direct translations between all language pairs
def build_direct_translations():
    """
    Build direct translation dictionaries between all language pairs
    """
    languages = [
        "English", "Spanish", "French", "German", "Chinese", 
        "Japanese", "Russian", "Arabic", "Portuguese", "Italian"
    ]
    
    # For non-English pairs, generate dictionaries using English as pivot
    for source_lang in languages:
        if source_lang == "English":
            continue
            
        for target_lang in languages:
            if target_lang == "English" or target_lang == source_lang:
                continue
                
            # Skip if direct translation already exists and is not empty
            if (source_lang in LANGUAGE_DICTIONARIES and 
                target_lang in LANGUAGE_DICTIONARIES[source_lang] and
                len(LANGUAGE_DICTIONARIES[source_lang][target_lang]) > 5):
                continue
                
            # Create dictionary using English as pivot
            pivot_dict = {}
            
            # Get source->English and English->target dictionaries
            source_to_eng = {}
            eng_to_target = {}
            
            if source_lang in LANGUAGE_DICTIONARIES and "English" in LANGUAGE_DICTIONARIES[source_lang]:
                # Direct source to English dictionary exists
                source_to_eng = LANGUAGE_DICTIONARIES[source_lang]["English"]
            elif "English" in LANGUAGE_DICTIONARIES and source_lang in LANGUAGE_DICTIONARIES["English"]:
                # Create reverse mapping from English to source
                source_to_eng = {v: k for k, v in LANGUAGE_DICTIONARIES["English"][source_lang].items()}
            
            if "English" in LANGUAGE_DICTIONARIES and target_lang in LANGUAGE_DICTIONARIES["English"]:
                # Direct English to target dictionary exists
                eng_to_target = LANGUAGE_DICTIONARIES["English"][target_lang]
            elif target_lang in LANGUAGE_DICTIONARIES and "English" in LANGUAGE_DICTIONARIES[target_lang]:
                # Create reverse mapping from target to English
                eng_to_target = {v: k for k, v in LANGUAGE_DICTIONARIES[target_lang]["English"].items()}
            
            # Now build the pivot dictionary
            for source_word, eng_word in source_to_eng.items():
                if eng_word in eng_to_target:
                    pivot_dict[source_word] = eng_to_target[eng_word]
            
            # Only add if we found matches
            if pivot_dict:
                if source_lang not in LANGUAGE_DICTIONARIES:
                    LANGUAGE_DICTIONARIES[source_lang] = {}
                LANGUAGE_DICTIONARIES[source_lang][target_lang] = pivot_dict
    
    return LANGUAGE_DICTIONARIES

# Initialize the complete dictionaries when this module is imported
generate_complete_dictionaries()
build_direct_translations() 