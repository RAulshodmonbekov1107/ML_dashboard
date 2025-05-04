"""
Sample texts for testing the translation system in all supported languages
"""

SAMPLE_TEXTS = {
    "English": [
        "Hello, my name is Claude. Welcome to our machine learning demo.",
        "The neural network model has been trained on a large dataset of texts.",
        "This is a demonstration of a multilingual translation system using artificial intelligence.",
        "How can I help you today with your language translation needs?",
        "Machine learning enables computers to learn from experience without being explicitly programmed."
    ],
    "Spanish": [
        "Hola, mi nombre es Claude. Bienvenido a nuestra demostración de aprendizaje automático.",
        "El modelo de red neuronal ha sido entrenado con un gran conjunto de datos de textos.",
        "Esta es una demostración de un sistema de traducción multilingüe utilizando inteligencia artificial.",
        "¿Cómo puedo ayudarte hoy con tus necesidades de traducción de idiomas?",
        "El aprendizaje automático permite a las computadoras aprender de la experiencia sin ser programadas explícitamente."
    ],
    "French": [
        "Bonjour, je m'appelle Claude. Bienvenue à notre démonstration d'apprentissage automatique.",
        "Le modèle de réseau neuronal a été formé sur un grand ensemble de données textuelles.",
        "Ceci est une démonstration d'un système de traduction multilingue utilisant l'intelligence artificielle.",
        "Comment puis-je vous aider aujourd'hui avec vos besoins de traduction linguistique?",
        "L'apprentissage automatique permet aux ordinateurs d'apprendre de l'expérience sans être explicitement programmés."
    ],
    "German": [
        "Hallo, mein Name ist Claude. Willkommen zu unserer Demonstration des maschinellen Lernens.",
        "Das neuronale Netzwerkmodell wurde mit einem großen Textdatensatz trainiert.",
        "Dies ist eine Demonstration eines mehrsprachigen Übersetzungssystems mit künstlicher Intelligenz.",
        "Wie kann ich Ihnen heute bei Ihren Sprachübersetzungsbedürfnissen helfen?",
        "Maschinelles Lernen ermöglicht es Computern, aus Erfahrung zu lernen, ohne explizit programmiert zu werden."
    ],
    "Italian": [
        "Ciao, mi chiamo Claude. Benvenuto alla nostra dimostrazione di apprendimento automatico.",
        "Il modello di rete neurale è stato addestrato su un ampio set di dati testuali.",
        "Questa è una dimostrazione di un sistema di traduzione multilingue che utilizza l'intelligenza artificiale.",
        "Come posso aiutarti oggi con le tue esigenze di traduzione linguistica?",
        "L'apprendimento automatico consente ai computer di imparare dall'esperienza senza essere programmati esplicitamente."
    ],
    "Portuguese": [
        "Olá, meu nome é Claude. Bem-vindo à nossa demonstração de aprendizado de máquina.",
        "O modelo de rede neural foi treinado em um grande conjunto de dados de textos.",
        "Esta é uma demonstração de um sistema de tradução multilíngue usando inteligência artificial.",
        "Como posso ajudá-lo hoje com suas necessidades de tradução de idiomas?",
        "O aprendizado de máquina permite que os computadores aprendam com a experiência sem serem explicitamente programados."
    ],
    "Chinese": [
        "你好，我的名字是Claude。欢迎来到我们的机器学习演示。",
        "神经网络模型已经在大量文本数据集上进行了训练。",
        "这是使用人工智能的多语言翻译系统的演示。",
        "今天我如何帮助您解决语言翻译需求？",
        "机器学习使计算机能够从经验中学习，而无需明确编程。"
    ],
    "Japanese": [
        "こんにちは、私の名前はClaudeです。機械学習のデモへようこそ。",
        "ニューラルネットワークモデルは、大規模なテキストデータセットでトレーニングされています。",
        "これは人工知能を使用した多言語翻訳システムのデモンストレーションです。",
        "今日は言語翻訳のニーズについてどのようにお手伝いできますか？",
        "機械学習により、コンピュータは明示的にプログラムされることなく経験から学習することができます。"
    ],
    "Russian": [
        "Здравствуйте, меня зовут Клод. Добро пожаловать в нашу демонстрацию машинного обучения.",
        "Модель нейронной сети была обучена на большом наборе текстовых данных.",
        "Это демонстрация многоязычной системы перевода с использованием искусственного интеллекта.",
        "Чем я могу помочь вам сегодня с вашими потребностями в переводе языка?",
        "Машинное обучение позволяет компьютерам учиться на опыте без явного программирования."
    ],
    "Arabic": [
        "مرحبا، اسمي كلود. مرحبا بكم في عرض التعلم الآلي.",
        "تم تدريب نموذج الشبكة العصبية على مجموعة كبيرة من البيانات النصية.",
        "هذا عرض توضيحي لنظام ترجمة متعدد اللغات باستخدام الذكاء الاصطناعي.",
        "كيف يمكنني مساعدتك اليوم في احتياجات الترجمة اللغوية الخاصة بك؟",
        "يتيح التعلم الآلي للحواسيب التعلم من التجربة دون برمجة صريحة."
    ]
}

def get_sample_text(language, index=0):
    """Get a sample text in the specified language"""
    if language in SAMPLE_TEXTS and index < len(SAMPLE_TEXTS[language]):
        return SAMPLE_TEXTS[language][index]
    return "Sample text not available for this language."

def get_all_samples(language):
    """Get all sample texts for a language"""
    return SAMPLE_TEXTS.get(language, ["No samples available for this language."])

def get_language_pairs():
    """Get all possible language translation pairs"""
    languages = list(SAMPLE_TEXTS.keys())
    pairs = []
    for source in languages:
        for target in languages:
            if source != target:
                pairs.append((source, target))
    return pairs 