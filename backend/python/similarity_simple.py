#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Simplified Paper Similarity Calculator (No sklearn required)
Uses basic TF-IDF and cosine similarity implementation
"""

import sys
import json
import re
from collections import Counter
import math

def tokenize(text):
    """Simple tokenization"""
    # Remove special characters and convert to lowercase
    text = re.sub(r'[^\w\s]', ' ', text.lower())
    # Split into words
    words = text.split()
    # Remove short words
    words = [w for w in words if len(w) > 2]
    return words

def compute_tf(tokens):
    """Compute term frequency"""
    tf_dict = Counter(tokens)
    total = len(tokens)
    return {word: count/total for word, count in tf_dict.items()}

def compute_idf(documents):
    """Compute inverse document frequency"""
    N = len(documents)
    idf_dict = {}
    
    # Get all unique words
    all_words = set()
    for doc in documents:
        all_words.update(doc)
    
    # Calculate IDF for each word
    for word in all_words:
        count = sum(1 for doc in documents if word in doc)
        idf_dict[word] = math.log(N / count) if count > 0 else 0
    
    return idf_dict

def compute_tfidf(tf, idf):
    """Compute TF-IDF"""
    return {word: tf_val * idf.get(word, 0) for word, tf_val in tf.items()}

def cosine_similarity(vec1, vec2):
    """Compute cosine similarity between two TF-IDF vectors"""
    # Get all unique words
    all_words = set(vec1.keys()) | set(vec2.keys())
    
    # Compute dot product
    dot_product = sum(vec1.get(word, 0) * vec2.get(word, 0) for word in all_words)
    
    # Compute magnitudes
    mag1 = math.sqrt(sum(val**2 for val in vec1.values()))
    mag2 = math.sqrt(sum(val**2 for val in vec2.values()))
    
    if mag1 == 0 or mag2 == 0:
        return 0.0
    
    return dot_product / (mag1 * mag2)

def extract_keywords(texts, top_n=20):
    """Extract keywords using TF-IDF"""
    try:
        # Tokenize all texts
        tokenized_docs = [tokenize(text) for text in texts]
        
        # Compute IDF
        idf = compute_idf(tokenized_docs)
        
        # Compute TF-IDF for all documents and aggregate
        all_tfidf = Counter()
        for tokens in tokenized_docs:
            tf = compute_tf(tokens)
            tfidf = compute_tfidf(tf, idf)
            all_tfidf.update(tfidf)
        
        # Get top N keywords
        top_keywords = all_tfidf.most_common(top_n)
        
        return {
            "success": True,
            "keywords": top_keywords
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def calculate_similarity(reference_texts, candidate_texts):
    """Calculate similarity between reference and candidate texts"""
    try:
        # Tokenize all texts
        ref_tokens = [tokenize(text) for text in reference_texts]
        cand_tokens = [tokenize(text) for text in candidate_texts]
        
        # Combine for IDF calculation
        all_tokens = ref_tokens + cand_tokens
        idf = compute_idf(all_tokens)
        
        # Compute TF-IDF for reference texts (average)
        ref_tfidf_vecs = []
        for tokens in ref_tokens:
            tf = compute_tf(tokens)
            tfidf = compute_tfidf(tf, idf)
            ref_tfidf_vecs.append(tfidf)
        
        # Average reference TF-IDF
        avg_ref_tfidf = {}
        all_ref_words = set()
        for vec in ref_tfidf_vecs:
            all_ref_words.update(vec.keys())
        
        for word in all_ref_words:
            avg_ref_tfidf[word] = sum(vec.get(word, 0) for vec in ref_tfidf_vecs) / len(ref_tfidf_vecs)
        
        # Compute similarity for each candidate
        similarities = []
        for tokens in cand_tokens:
            tf = compute_tf(tokens)
            tfidf = compute_tfidf(tf, idf)
            sim = cosine_similarity(avg_ref_tfidf, tfidf)
            similarities.append(sim)
        
        return {
            "success": True,
            "similarities": similarities
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    sys.stdout.reconfigure(encoding='utf-8')
    
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())
        mode = input_data.get('mode', 'keywords')
        
        if mode == 'keywords':
            texts = input_data.get('texts', [])
            top_n = input_data.get('top_n', 20)
            result = extract_keywords(texts, top_n)
        elif mode == 'similarity':
            reference_texts = input_data.get('reference_texts', [])
            candidate_texts = input_data.get('candidate_texts', [])
            result = calculate_similarity(reference_texts, candidate_texts)
        else:
            result = {
                "success": False,
                "error": f"Unknown mode: {mode}"
            }
        
        print(json.dumps(result, ensure_ascii=False))
        sys.exit(0)
        
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(0)
