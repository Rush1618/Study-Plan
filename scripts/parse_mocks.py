import base64
import zlib
import re
import json
import os

def extract_pdf_pages(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return []
    with open(filepath, 'rb') as f:
        data = f.read()

    pages_text = []
    for m in re.finditer(rb'(\d+)\s+0\s+obj\s*<<(.*?)>>\s*stream\r?\n(.*?)endstream', data, re.DOTALL):
        obj_id, dict_data, stream_data = m.group(1), m.group(2), m.group(3)
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

def inspect_mock():
    base_dir = r"study_pack_extracted\MHT_CET_MBA_COMPLETE_STUDY_PACK\02_Mock_Tests"
    vocab_pdf = os.path.join(base_dir, "MHT_CET_MBA_Vocabulary_Mock_Test_1_100Q_HINGLISH.pdf")
    pages = extract_pdf_pages(vocab_pdf)
    print(f"Total pages extracted: {len(pages)}")
    with open("extracted_vocab_text.txt", "w", encoding="utf-8") as out:
        for idx, p in enumerate(pages):
            out.write(f"\n--- PAGE {idx+1} ---\n")
            out.write(p + "\n")
    print("Wrote extracted_vocab_text.txt successfully.")

if __name__ == '__main__':
    inspect_mock()
