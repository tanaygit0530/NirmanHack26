import sys
import json
import re
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS

def clean_text(raw_text):
    # Basic normalization
    text = str(raw_text).lower()
    
    # Remove HTML tags
    text = re.sub(r'<[^>]*>', ' ', text)
    
    # Remove non-alphanumeric characters (keep basic punctuation for context, but primarily clean for ML)
    text = re.sub(r'[^a-z0-9\s.,]', '', text)
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Advanced: Remove stop words using scikit-learn's built-in list
    words = text.split()
    cleaned_words = [word for word in words if word not in ENGLISH_STOP_WORDS]
    
    cleaned_text = ' '.join(cleaned_words)
    
    return {
        "original": raw_text,
        "cleaned_text": cleaned_text,
        "tokens": len(cleaned_words)
    }

if __name__ == '__main__':
    try:
        # Read from stdin
        input_data = sys.stdin.read()
        if not input_data.strip():
            print(json.dumps({"error": "No input provided"}))
            sys.exit(1)
            
        data = json.loads(input_data)
        raw_text = data.get("text", "")
        
        result = clean_text(raw_text)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
