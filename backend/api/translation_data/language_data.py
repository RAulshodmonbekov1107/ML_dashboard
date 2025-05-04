# Language dictionaries and characteristics for translation functionality

# Dictionary of translations between languages
# Structure: {source_language: {target_language: {word: translation}}}
LANGUAGE_DICTIONARIES = {
    "English": {
        "Spanish": {
            # Common words
            "hello": "hola",
            "goodbye": "adiós",
            "thank you": "gracias",
            "yes": "sí",
            "no": "no",
            "please": "por favor",
            "sorry": "lo siento",
            "excuse me": "disculpe",
            
            # Numbers
            "one": "uno",
            "two": "dos",
            "three": "tres",
            "four": "cuatro",
            "five": "cinco",
            
            # Time expressions
            "today": "hoy",
            "tomorrow": "mañana",
            "yesterday": "ayer",
            "now": "ahora",
            "later": "más tarde",
            
            # Questions
            "what": "qué",
            "where": "dónde",
            "when": "cuándo",
            "why": "por qué",
            "how": "cómo",
            "who": "quién",
            
            # ML-related terms
            "machine": "máquina",
            "translation": "traducción",
            "neural": "neural",
            "algorithm": "algoritmo",
            "model": "modelo",
            "learning": "aprendizaje",
            "artificial intelligence": "inteligencia artificial",
            "data": "datos"
        },
        "French": {
            # Common words
            "hello": "bonjour",
            "goodbye": "au revoir",
            "thank you": "merci",
            "yes": "oui",
            "no": "non",
            "please": "s'il vous plaît",
            "sorry": "désolé",
            "excuse me": "excusez-moi",
            
            # Time expressions
            "today": "aujourd'hui",
            "tomorrow": "demain",
            "yesterday": "hier",
            "now": "maintenant",
            "later": "plus tard",
            
            # ML-related terms
            "machine": "machine",
            "translation": "traduction",
            "neural": "neuronal",
            "algorithm": "algorithme",
            "model": "modèle",
            "learning": "apprentissage",
            "artificial intelligence": "intelligence artificielle",
            "data": "données"
        },
        "German": {
            # Common words
            "hello": "hallo",
            "goodbye": "auf wiedersehen",
            "thank you": "danke",
            "yes": "ja",
            "no": "nein",
            "please": "bitte",
            "sorry": "entschuldigung",
            "excuse me": "entschuldigen sie",
            
            # Time expressions
            "today": "heute",
            "tomorrow": "morgen",
            "yesterday": "gestern",
            "now": "jetzt",
            "later": "später",
            
            # ML-related terms
            "machine": "maschine",
            "translation": "übersetzung",
            "neural": "neuronal",
            "algorithm": "algorithmus",
            "model": "modell",
            "learning": "lernen",
            "artificial intelligence": "künstliche intelligenz",
            "data": "daten"
        },
        "Chinese": {
            # Common words
            "hello": "你好",
            "goodbye": "再见",
            "thank you": "谢谢",
            "yes": "是",
            "no": "不",
            "please": "请",
            "sorry": "对不起",
            "excuse me": "打扰一下",
            
            # ML-related terms
            "machine": "机器",
            "translation": "翻译",
            "neural": "神经",
            "algorithm": "算法",
            "model": "模型",
            "learning": "学习",
            "artificial intelligence": "人工智能",
            "data": "数据"
        },
        "Japanese": {
            # Common words
            "hello": "こんにちは",
            "goodbye": "さようなら",
            "thank you": "ありがとう",
            "yes": "はい",
            "no": "いいえ",
            "please": "お願いします",
            "sorry": "すみません",
            "excuse me": "すみません",
            
            # ML-related terms
            "machine": "機械",
            "translation": "翻訳",
            "neural": "ニューラル",
            "algorithm": "アルゴリズム",
            "model": "モデル",
            "learning": "学習",
            "artificial intelligence": "人工知能",
            "data": "データ"
        },
        "Russian": {
            # Common words
            "hello": "привет",
            "goodbye": "до свидания",
            "thank you": "спасибо",
            "yes": "да",
            "no": "нет",
            "please": "пожалуйста",
            "sorry": "извините",
            "excuse me": "извините",
            
            # ML-related terms
            "machine": "машина",
            "translation": "перевод",
            "neural": "нейронный",
            "algorithm": "алгоритм",
            "model": "модель",
            "learning": "обучение",
            "artificial intelligence": "искусственный интеллект",
            "data": "данные"
        },
        "Arabic": {
            # Common words
            "hello": "مرحبا",
            "goodbye": "وداعا",
            "thank you": "شكرا",
            "yes": "نعم",
            "no": "لا",
            "please": "من فضلك",
            "sorry": "آسف",
            "excuse me": "عذرا",
            
            # ML-related terms
            "machine": "آلة",
            "translation": "ترجمة",
            "neural": "عصبي",
            "algorithm": "خوارزمية",
            "model": "نموذج",
            "learning": "تعلم",
            "artificial intelligence": "ذكاء اصطناعي",
            "data": "بيانات"
        },
        "Portuguese": {
            # Common words
            "hello": "olá",
            "goodbye": "adeus",
            "thank you": "obrigado",
            "yes": "sim",
            "no": "não",
            "please": "por favor",
            "sorry": "desculpe",
            "excuse me": "com licença",
            
            # ML-related terms
            "machine": "máquina",
            "translation": "tradução",
            "neural": "neural",
            "algorithm": "algoritmo",
            "model": "modelo",
            "learning": "aprendizagem",
            "artificial intelligence": "inteligência artificial",
            "data": "dados"
        },
        "Italian": {
            # Common words
            "hello": "ciao",
            "goodbye": "arrivederci",
            "thank you": "grazie",
            "yes": "sì",
            "no": "no",
            "please": "per favore",
            "sorry": "scusa",
            "excuse me": "scusi",
            
            # ML-related terms
            "machine": "macchina",
            "translation": "traduzione",
            "neural": "neurale",
            "algorithm": "algoritmo",
            "model": "modello",
            "learning": "apprendimento",
            "artificial intelligence": "intelligenza artificiale",
            "data": "dati"
        }
    },
    # Add reverse dictionaries for each language pair
    "Spanish": {
        "English": {
            "hola": "hello",
            "adiós": "goodbye",
            "gracias": "thank you",
            "sí": "yes",
            "no": "no",
            "por favor": "please",
            "lo siento": "sorry",
            "disculpe": "excuse me",
            "máquina": "machine",
            "traducción": "translation",
            "algoritmo": "algorithm",
            "modelo": "model"
        },
        "French": {
            "hola": "bonjour",
            "adiós": "au revoir",
            "gracias": "merci",
            "sí": "oui",
            "no": "non",
            "por favor": "s'il vous plaît",
            "lo siento": "désolé",
            "disculpe": "excusez-moi",
            "máquina": "machine",
            "traducción": "traduction",
            "algoritmo": "algorithme",
            "modelo": "modèle"
        },
        "German": {
            "hola": "hallo",
            "adiós": "auf wiedersehen",
            "gracias": "danke",
            "sí": "ja",
            "no": "nein",
            "por favor": "bitte",
            "lo siento": "entschuldigung",
            "disculpe": "entschuldigen sie",
            "máquina": "maschine",
            "traducción": "übersetzung",
            "algoritmo": "algorithmus",
            "modelo": "modell"
        }
    },
    "French": {
        "English": {
            "bonjour": "hello",
            "au revoir": "goodbye",
            "merci": "thank you",
            "oui": "yes",
            "non": "no",
            "s'il vous plaît": "please",
            "désolé": "sorry",
            "excusez-moi": "excuse me",
            "machine": "machine",
            "traduction": "translation",
            "algorithme": "algorithm",
            "modèle": "model"
        },
        "Spanish": {
            "bonjour": "hola",
            "au revoir": "adiós",
            "merci": "gracias",
            "oui": "sí",
            "non": "no",
            "s'il vous plaît": "por favor",
            "désolé": "lo siento",
            "excusez-moi": "disculpe",
            "machine": "máquina",
            "traduction": "traducción",
            "algorithme": "algoritmo",
            "modèle": "modelo"
        },
        "German": {
            "bonjour": "hallo",
            "au revoir": "auf wiedersehen",
            "merci": "danke",
            "oui": "ja",
            "non": "nein",
            "s'il vous plaît": "bitte",
            "désolé": "entschuldigung",
            "excusez-moi": "entschuldigen sie",
            "machine": "maschine",
            "traduction": "übersetzung",
            "algorithme": "algorithmus",
            "modèle": "modell"
        }
    },
    "German": {
        "English": {
            "hallo": "hello",
            "auf wiedersehen": "goodbye",
            "danke": "thank you",
            "ja": "yes",
            "nein": "no",
            "bitte": "please",
            "entschuldigung": "sorry",
            "entschuldigen sie": "excuse me",
            "maschine": "machine",
            "übersetzung": "translation",
            "algorithmus": "algorithm",
            "modell": "model"
        },
        "Spanish": {
            "hallo": "hola",
            "auf wiedersehen": "adiós",
            "danke": "gracias",
            "ja": "sí",
            "nein": "no",
            "bitte": "por favor",
            "entschuldigung": "lo siento",
            "entschuldigen sie": "disculpe",
            "maschine": "máquina",
            "übersetzung": "traducción",
            "algorithmus": "algoritmo",
            "modell": "modelo"
        },
        "French": {
            "hallo": "bonjour",
            "auf wiedersehen": "au revoir",
            "danke": "merci",
            "ja": "oui",
            "nein": "non",
            "bitte": "s'il vous plaît",
            "entschuldigung": "désolé",
            "entschuldigen sie": "excusez-moi",
            "maschine": "machine",
            "übersetzung": "traduction",
            "algorithmus": "algorithme",
            "modèle": "modèle"
        }
    },
    "Chinese": {
        "English": {
            "你好": "hello",
            "再见": "goodbye",
            "谢谢": "thank you",
            "是": "yes",
            "不": "no",
            "请": "please",
            "对不起": "sorry",
            "打扰一下": "excuse me",
            "机器": "machine",
            "翻译": "translation",
            "算法": "algorithm",
            "模型": "model"
        }
    },
    "Japanese": {
        "English": {
            "こんにちは": "hello",
            "さようなら": "goodbye",
            "ありがとう": "thank you",
            "はい": "yes",
            "いいえ": "no",
            "お願いします": "please",
            "すみません": "sorry",
            "機械": "machine",
            "翻訳": "translation",
            "アルゴリズム": "algorithm",
            "モデル": "model"
        }
    },
    "Russian": {
        "English": {
            "привет": "hello",
            "до свидания": "goodbye",
            "спасибо": "thank you",
            "да": "yes",
            "нет": "no",
            "пожалуйста": "please",
            "извините": "sorry",
            "машина": "machine",
            "перевод": "translation",
            "алгоритм": "algorithm",
            "модель": "model"
        }
    },
    "Arabic": {
        "English": {
            "مرحبا": "hello",
            "وداعا": "goodbye",
            "شكرا": "thank you",
            "نعم": "yes",
            "لا": "no",
            "من فضلك": "please",
            "آسف": "sorry",
            "عذرا": "excuse me",
            "آلة": "machine",
            "ترجمة": "translation",
            "خوارزمية": "algorithm",
            "نموذج": "model"
        }
    },
    "Portuguese": {
        "English": {
            "olá": "hello",
            "adeus": "goodbye",
            "obrigado": "thank you",
            "sim": "yes",
            "não": "no",
            "por favor": "please",
            "desculpe": "sorry",
            "com licença": "excuse me",
            "máquina": "machine",
            "tradução": "translation",
            "algoritmo": "algorithm",
            "modelo": "model"
        }
    },
    "Italian": {
        "English": {
            "ciao": "hello",
            "arrivederci": "goodbye",
            "grazie": "thank you",
            "sì": "yes",
            "no": "no",
            "per favore": "please",
            "scusa": "sorry",
            "scusi": "excuse me",
            "macchina": "machine",
            "traduzione": "translation",
            "algoritmo": "algorithm",
            "modello": "model"
        }
    }
}

# Language characteristics for procedural translation
LANGUAGE_CHARACTERISTICS = {
    "Spanish": {
        "articles": {"the": ["el", "la", "los", "las"], "a": ["un", "una"]},
        "common_words": {"and": "y", "or": "o", "but": "pero", "with": "con", "without": "sin", "in": "en", "of": "de", "for": "para", "from": "desde", "to": "a"},
        "verb_endings": ["ar", "er", "ir", "ando", "iendo", "ado", "ido"],
        "adjective_endings": ["o", "a", "os", "as"],
        "noun_endings": ["o", "a", "os", "as", "ción", "dad", "tad", "miento"],
        "sentence_patterns": {
            "questions": {"pattern": r'\b(what|where|when|why|how)\b', "replacement": lambda m: {"what": "qué", "where": "dónde", "when": "cuándo", "why": "por qué", "how": "cómo"}[m.group(1)]},
            "negations": {"pattern": r'\b(not|don\'t|doesn\'t|didn\'t)\b', "replacement": "no"}
        },
        "word_order": {"adjective_after_noun": True}
    },
    "French": {
        "articles": {"the": ["le", "la", "les"], "a": ["un", "une"]},
        "common_words": {"and": "et", "or": "ou", "but": "mais", "with": "avec", "without": "sans", "in": "dans", "of": "de", "for": "pour", "from": "de", "to": "à"},
        "verb_endings": ["er", "ir", "re", "ant", "é", "i", "u"],
        "adjective_endings": ["e", "s", "es"],
        "noun_endings": ["e", "tion", "té", "ment", "age"],
        "sentence_patterns": {
            "questions": {"pattern": r'\b(what|where|when|why|how)\b', "replacement": lambda m: {"what": "que", "where": "où", "when": "quand", "why": "pourquoi", "how": "comment"}[m.group(1)]},
            "negations": {"pattern": r'\b(not|don\'t|doesn\'t|didn\'t)\b', "replacement": "ne...pas"}
        },
        "word_order": {"adjective_after_noun": True}
    },
    "German": {
        "articles": {"the": ["der", "die", "das", "den", "dem", "des"], "a": ["ein", "eine", "einen", "einem", "einer", "eines"]},
        "common_words": {"and": "und", "or": "oder", "but": "aber", "with": "mit", "without": "ohne", "in": "in", "of": "von", "for": "für", "from": "von", "to": "zu"},
        "verb_endings": ["en", "n", "t", "st", "e", "et", "te", "ten"],
        "adjective_endings": ["e", "en", "er", "es", "em"],
        "noun_endings": ["ung", "heit", "keit", "schaft", "tion", "tät", "nis"],
        "sentence_patterns": {
            "questions": {"pattern": r'\b(what|where|when|why|how)\b', "replacement": lambda m: {"what": "was", "where": "wo", "when": "wann", "why": "warum", "how": "wie"}[m.group(1)]},
            "negations": {"pattern": r'\b(not|don\'t|doesn\'t|didn\'t)\b', "replacement": "nicht"}
        },
        "word_order": {"verb_final": True, "capitalize_nouns": True}
    },
    "Chinese": {
        "common_words": {"the": "的", "a": "一个", "and": "和", "or": "或者", "but": "但是", "with": "与", "without": "没有", "in": "在", "of": "的", "for": "为了", "from": "从", "to": "到"},
        "sentence_particles": ["了", "吗", "呢", "吧", "啊"],
        "sentence_patterns": {
            "questions": {"pattern": r'\b(what|where|when|why|how)\b', "replacement": lambda m: {"what": "什么", "where": "哪里", "when": "什么时候", "why": "为什么", "how": "怎么样"}[m.group(1)]},
            "negations": {"pattern": r'\b(not|don\'t|doesn\'t|didn\'t)\b', "replacement": "不"}
        },
        "word_order": {"topic_comment": True}
    },
    "Japanese": {
        "particles": ["は", "が", "を", "に", "へ", "で", "と", "から", "まで", "の"],
        "common_words": {"the": "その", "a": "一つの", "and": "と", "or": "または", "but": "しかし", "with": "と", "without": "なしで", "in": "に", "of": "の", "for": "ために", "from": "から", "to": "へ"},
        "verb_endings": ["ます", "です", "ました", "でした", "ません", "でません", "う", "く", "る"],
        "sentence_patterns": {
            "questions": {"pattern": r'\b(what|where|when|why|how)\b', "replacement": lambda m: {"what": "何", "where": "どこ", "when": "いつ", "why": "なぜ", "how": "どうやって"}[m.group(1)]},
            "negations": {"pattern": r'\b(not|don\'t|doesn\'t|didn\'t)\b', "replacement": "ません"}
        },
        "word_order": {"verb_final": True}
    }
}

# Additional language characteristics for other languages
LANGUAGE_CHARACTERISTICS["Russian"] = {
    "articles": {},  # Russian has no articles
    "common_words": {"and": "и", "or": "или", "but": "но", "with": "с", "without": "без", "in": "в", "of": "из", "for": "для", "from": "от", "to": "к"},
    "verb_endings": ["ть", "ти", "чь", "ет", "ут", "ют", "ат", "ят", "ил", "ел", "ла", "ли"],
    "adjective_endings": ["ый", "ий", "ой", "ая", "яя", "ое", "ее", "ые", "ие"],
    "noun_endings": ["а", "я", "о", "е", "ь", "ия", "ие", "ство", "ость"],
    "sentence_patterns": {
        "questions": {"pattern": r'\b(what|where|when|why|how)\b', "replacement": lambda m: {"what": "что", "where": "где", "when": "когда", "why": "почему", "how": "как"}[m.group(1)]},
        "negations": {"pattern": r'\b(not|don\'t|doesn\'t|didn\'t)\b', "replacement": "не"}
    },
    "word_order": {"flexible": True}
}

LANGUAGE_CHARACTERISTICS["Arabic"] = {
    "common_words": {"the": "ال", "and": "و", "or": "أو", "but": "لكن", "with": "مع", "without": "بدون", "in": "في", "of": "من", "for": "ل", "from": "من", "to": "إلى"},
    "verb_patterns": ["يفعل", "تفعل", "أفعل", "نفعل", "فعل", "فاعل", "مفعول"],
    "sentence_patterns": {
        "questions": {"pattern": r'\b(what|where|when|why|how)\b', "replacement": lambda m: {"what": "ماذا", "where": "أين", "when": "متى", "why": "لماذا", "how": "كيف"}[m.group(1)]},
        "negations": {"pattern": r'\b(not|don\'t|doesn\'t|didn\'t)\b', "replacement": "لا"}
    },
    "word_order": {"verb_first": True}
}

LANGUAGE_CHARACTERISTICS["Portuguese"] = {
    "articles": {"the": ["o", "a", "os", "as"], "a": ["um", "uma"]},
    "common_words": {"and": "e", "or": "ou", "but": "mas", "with": "com", "without": "sem", "in": "em", "of": "de", "for": "para", "from": "de", "to": "para"},
    "verb_endings": ["ar", "er", "ir", "ando", "endo", "indo", "ado", "ido"],
    "adjective_endings": ["o", "a", "os", "as"],
    "noun_endings": ["o", "a", "os", "as", "ção", "dade", "mento"],
    "sentence_patterns": {
        "questions": {"pattern": r'\b(what|where|when|why|how)\b', "replacement": lambda m: {"what": "o que", "where": "onde", "when": "quando", "why": "por que", "how": "como"}[m.group(1)]},
        "negations": {"pattern": r'\b(not|don\'t|doesn\'t|didn\'t)\b', "replacement": "não"}
    },
    "word_order": {"adjective_after_noun": True}
}

LANGUAGE_CHARACTERISTICS["Italian"] = {
    "articles": {"the": ["il", "lo", "la", "i", "gli", "le"], "a": ["un", "uno", "una"]},
    "common_words": {"and": "e", "or": "o", "but": "ma", "with": "con", "without": "senza", "in": "in", "of": "di", "for": "per", "from": "da", "to": "a"},
    "verb_endings": ["are", "ere", "ire", "ando", "endo", "ato", "uto", "ito"],
    "adjective_endings": ["o", "a", "i", "e"],
    "noun_endings": ["o", "a", "i", "e", "ione", "tà", "mento"],
    "sentence_patterns": {
        "questions": {"pattern": r'\b(what|where|when|why|how)\b', "replacement": lambda m: {"what": "cosa", "where": "dove", "when": "quando", "why": "perché", "how": "come"}[m.group(1)]},
        "negations": {"pattern": r'\b(not|don\'t|doesn\'t|didn\'t)\b', "replacement": "non"}
    },
    "word_order": {"adjective_after_noun": True}
} 