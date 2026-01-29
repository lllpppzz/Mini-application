#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PDF Parser for Academic Papers
Extracts metadata and text content from PDF files
"""

import sys
import json
import re
from pathlib import Path

try:
    import PyPDF2
    import pdfplumber
except ImportError:
    print(json.dumps({
        "success": False,
        "error": "Required packages not installed. Run: pip install PyPDF2 pdfplumber"
    }))
    sys.exit(1)


def extract_metadata_pypdf(pdf_path):
    """Extract basic metadata using PyPDF2"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            metadata = pdf_reader.metadata
            
            return {
                'title': metadata.get('/Title', ''),
                'author': metadata.get('/Author', ''),
                'subject': metadata.get('/Subject', ''),
                'keywords': metadata.get('/Keywords', ''),
                'creator': metadata.get('/Creator', ''),
                'producer': metadata.get('/Producer', ''),
                'page_count': len(pdf_reader.pages)
            }
    except Exception as e:
        return {'error': str(e)}


def extract_text_pdfplumber(pdf_path, max_pages=10):
    """Extract text content using pdfplumber"""
    try:
        text_content = ""
        with pdfplumber.open(pdf_path) as pdf:
            # Extract text from first few pages (usually contains title, abstract, keywords)
            num_pages = min(max_pages, len(pdf.pages))
            for page_num in range(num_pages):
                page = pdf.pages[page_num]
                text = page.extract_text()
                if text:
                    text_content += text + "\n\n"
        
        return text_content
    except Exception as e:
        return f"Error extracting text: {str(e)}"


def extract_title_from_text(text):
    """Try to extract title from text if metadata doesn't contain it"""
    lines = text.split('\n')
    # Usually title is in the first few lines, longer than average
    for line in lines[:10]:
        line = line.strip()
        if len(line) > 20 and len(line) < 200:
            # Check if it looks like a title (not all caps, not too short)
            if not line.isupper():
                return line
    return ""


def extract_abstract_from_text(text):
    """Try to extract abstract from text"""
    # Look for abstract section
    patterns = [
        r'abstract[:\s]+(.*?)(?:introduction|keywords|1\.|index terms)',
        r'摘要[：\s]+(.*?)(?:关键词|引言|1\.|abstract)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text.lower(), re.DOTALL | re.IGNORECASE)
        if match:
            abstract = match.group(1).strip()
            # Limit abstract length
            return abstract[:1000]
    
    return ""


def extract_keywords_from_text(text):
    """Try to extract keywords from text"""
    patterns = [
        r'keywords?[:\s]+(.*?)(?:\n\n|introduction|1\.)',
        r'index terms[:\s]+(.*?)(?:\n\n|introduction|1\.)',
        r'关键词[：\s]+(.*?)(?:\n\n|引言|1\.)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text.lower(), re.DOTALL | re.IGNORECASE)
        if match:
            keywords_str = match.group(1).strip()
            # Split by common separators
            keywords = re.split(r'[,;·•]', keywords_str)
            return [k.strip() for k in keywords if k.strip()]
    
    return []


def parse_pdf(pdf_path):
    """Main function to parse PDF and extract all information"""
    try:
        # Check if file exists
        if not Path(pdf_path).exists():
            return {
                "success": False,
                "error": f"File not found: {pdf_path}"
            }
        
        # Extract metadata
        metadata = extract_metadata_pypdf(pdf_path)
        
        # Extract text content
        text_content = extract_text_pdfplumber(pdf_path)
        
        # Try to extract title if not in metadata
        title = metadata.get('title', '')
        if not title or len(title) < 10:
            title = extract_title_from_text(text_content)
        
        # Extract abstract
        abstract = extract_abstract_from_text(text_content)
        
        # Extract keywords
        keywords_meta = metadata.get('keywords', '')
        keywords = extract_keywords_from_text(text_content)
        if not keywords and keywords_meta:
            keywords = [k.strip() for k in keywords_meta.split(',')]
        
        # Prepare result
        result = {
            "success": True,
            "file_name": Path(pdf_path).name,
            "file_path": pdf_path,
            "metadata": {
                "title": title,
                "author": metadata.get('author', ''),
                "subject": metadata.get('subject', ''),
                "page_count": metadata.get('page_count', 0)
            },
            "content": {
                "abstract": abstract,
                "keywords": keywords,
                "full_text_preview": text_content[:2000],  # First 2000 chars
                "full_text_length": len(text_content)
            }
        }
        
        return result
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "Usage: python pdf_parser.py <pdf_file_path>"
        }))
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    result = parse_pdf(pdf_path)
    print(json.dumps(result, ensure_ascii=False, indent=2))
