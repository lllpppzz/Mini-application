#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Paper Similarity Calculator
Uses TF-IDF and cosine similarity to find similar papers
Supports both English and Chinese
"""

import sys
import json
import re

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    import numpy as np
    import jieba
except ImportError as e:
    print(json.dumps({
        "success": False,
        "error": f"Required packages not installed: {str(e)}"
    }))
    sys.exit(0)


def is_chinese(text):
    """Check if text contains Chinese characters"""
    for char in text:
        if '\u4e00' <= char <= '\u9fff':
            return True
    return False

def preprocess_text(text):
    """Clean and preprocess text (supports Chinese & English)"""
    if not text:
        return ""
        
    # Convert to lowercase
    text = text.lower()
    
    # Remove special characters but keep spaces and Chinese
    # Keep alphanumeric, spaces, and Chinese characters
    text = re.sub(r'[^\w\s\u4e00-\u9fff]', ' ', text)
    
    # If text contains Chinese, use jieba for segmentation
    if is_chinese(text):
        # Use jieba.cut_for_search for better keyword extraction
        seg_list = jieba.cut_for_search(text)
        text = " ".join(seg_list)
    
    # Remove extra whitespace
    text = ' '.join(text.split())
    return text


def calculate_similarity(reference_texts, candidate_texts):
    """
    Calculate similarity between reference papers and candidate papers
    """
    try:
        # Preprocess all texts
        ref_processed = [preprocess_text(text) for text in reference_texts]
        cand_processed = [preprocess_text(text) for text in candidate_texts]
        
        # Combine all texts for TF-IDF vectorization
        all_texts = ref_processed + cand_processed
        
        # Create TF-IDF vectors
        # Use a custom token pattern to support both English words and Chinese tokens
        vectorizer = TfidfVectorizer(
            max_features=1000,
            ngram_range=(1, 2),
            token_pattern=r"(?u)\b\w+\b" 
        )
        
        tfidf_matrix = vectorizer.fit_transform(all_texts)
        
        # Split back into reference and candidate matrices
        ref_matrix = tfidf_matrix[:len(reference_texts)]
        cand_matrix = tfidf_matrix[len(reference_texts):]
        
        # Calculate average reference vector
        if ref_matrix.shape[0] > 0:
            ref_avg = np.mean(ref_matrix.toarray(), axis=0).reshape(1, -1)
            
            # Calculate cosine similarity between average reference and each candidate
            similarities = cosine_similarity(ref_avg, cand_matrix)[0]
            return similarities.tolist()
        else:
            return [0] * len(candidate_texts)
        
    except Exception as e:
        return {"error": str(e)}


def extract_keywords_tfidf(texts, top_n=20):
    """Extract top keywords from texts using TF-IDF"""
    try:
        processed = [preprocess_text(text) for text in texts]
        
        # Filter out empty texts
        processed = [t for t in processed if t.strip()]
        
        if not processed:
            return []

        vectorizer = TfidfVectorizer(
            max_features=top_n,
            ngram_range=(1, 2),
            token_pattern=r"(?u)\b\w+\b"
        )
        
        tfidf_matrix = vectorizer.fit_transform(processed)
        feature_names = vectorizer.get_feature_names_out()
        
        # Get average TF-IDF scores across all documents
        avg_scores = np.mean(tfidf_matrix.toarray(), axis=0)
        
        # Sort by score
        top_indices = avg_scores.argsort()[-top_n:][::-1]
        top_keywords = [(feature_names[i], float(avg_scores[i])) for i in top_indices]
        
        return top_keywords
        
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    # Set stdout to UTF-8 for Chinese support
    sys.stdout.reconfigure(encoding='utf-8')
    
    try:
        input_data = json.loads(sys.stdin.read())
        
        if input_data.get('mode') == 'similarity':
            reference_texts = input_data.get('reference_texts', [])
            candidate_texts = input_data.get('candidate_texts', [])
            
            if not reference_texts or not candidate_texts:
                result = {
                    "success": False,
                    "error": "Missing reference_texts or candidate_texts"
                }
            else:
                similarities = calculate_similarity(reference_texts, candidate_texts)
                if isinstance(similarities, dict) and "error" in similarities:
                     result = {"success": False, "error": similarities["error"]}
                else:
                    result = {
                        "success": True,
                        "similarities": similarities
                    }
        
        elif input_data.get('mode') == 'keywords':
            texts = input_data.get('texts', [])
            top_n = input_data.get('top_n', 20)
            
            if not texts:
                result = {
                    "success": False,
                    "error": "Missing texts"
                }
            else:
                keywords = extract_keywords_tfidf(texts, top_n)
                if isinstance(keywords, dict) and "error" in keywords:
                    result = {"success": False, "error": keywords["error"]}
                else:
                    result = {
                        "success": True,
                        "keywords": keywords
                    }
        
        else:
            result = {
                "success": False,
                "error": "Invalid mode"
            }
        
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(0)
