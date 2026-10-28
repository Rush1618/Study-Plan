import os
import glob
import re
import json
import base64
import zlib

def extract_pdf_pages(filepath):
    if not os.path.exists(filepath):
        return []
    with open(filepath, 'rb') as f:
        data = f.read()

    pages_text = []
    for m in re.finditer(rb'(\d+)\s+0\s+obj\s*<<(.*?)>>\s*stream\r?\n(.*?)endstream', data, re.DOTALL):
        dict_data, stream_data = m.group(2), m.group(3)
        decoded = stream_data.strip()
        if b'ASCII85Decode' in dict_data:
            if not decoded.endswith(b'~>'):
                decoded += b'~>'
            try:
                decoded = base64.a85decode(decoded, adobe=True)
            except Exception:
                continue
        if b'FlateDecode' in dict_data:
            try:
                decoded = zlib.decompress(decoded)
            except Exception:
                continue
        
        if b'BT' in decoded:
            matches = re.findall(rb'\(((?:[^()\\]|\\.)*)\)\s*Tj', decoded)
            line = ' '.join(x.decode('latin1', errors='ignore') for x in matches)
            if line:
                pages_text.append(line)
    return pages_text

def clean_text(text):
    text = text.replace(r'\(', '(').replace(r'\)', ')')
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def run_ingestion():
    base_dir = r"study_pack_extracted\MHT_CET_MBA_COMPLETE_STUDY_PACK"
    pdf_files = glob.glob(os.path.join(base_dir, "**", "*.pdf"), recursive=True)
    print(f"Discovered {len(pdf_files)} PDF files in study pack.")

    knowledge_corpus = []
    
    for pdf_path in pdf_files:
        filename = os.path.basename(pdf_path)
        folder = os.path.basename(os.path.dirname(pdf_path))
        pages = extract_pdf_pages(pdf_path)
        if not pages:
            continue
        
        cleaned_pages = [clean_text(p) for p in pages if len(clean_text(p)) > 30]
        
        knowledge_corpus.append({
            "docId": filename.lower().replace('.pdf', '').replace(' ', '_'),
            "title": filename.replace('.pdf', '').replace('_', ' '),
            "category": folder.replace('_', ' '),
            "totalPages": len(pages),
            "contentSample": cleaned_pages[0][:400] if cleaned_pages else "",
            "pages": cleaned_pages[:15]  # first 15 pages per document to maintain high density
        })

    out_file = r"src\data\mhtCetExtractedKnowledge.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(knowledge_corpus, f, indent=2)
    print(f"Successfully compiled knowledge corpus: {len(knowledge_corpus)} documents saved to {out_file}.")

if __name__ == '__main__':
    run_ingestion()
