#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Paper Translator
Uses deep_translator to translate text to Chinese
"""

import sys
import json
from deep_translator import GoogleTranslator

def translate_text(text, target='zh-CN'):
    try:
        if not text:
            return ""
            
        # Split long text if necessary (Google Translate has limits)
        # For simplicity, we'll just truncate or translate the first 4500 chars for now
        # or split by sentences. deep_translator handles some of this but let's be safe.
        
        translator = GoogleTranslator(source='auto', target=target)
        
        # Simple chunking if text is too long (approx 4500 chars)
        max_chunk = 4500
        if len(text) <= max_chunk:
            return translator.translate(text)
        
        chunks = [text[i:i+max_chunk] for i in range(0, len(text), max_chunk)]
        translated_chunks = [translator.translate(chunk) for chunk in chunks]
        return " ".join(translated_chunks)
        
    except Exception as e:
        return f"Translation failed: {str(e)}"

if __name__ == "__main__":
    sys.stdout.reconfigure(encoding='utf-8')
    
    try:
        input_data = json.loads(sys.stdin.read())
        text = input_data.get('text', '')
        target = input_data.get('target', 'zh-CN')
        
        translated = translate_text(text, target)
        
        print(json.dumps({
            "success": True,
            "translated": translated
        }, ensure_ascii=False))
        
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(0)
