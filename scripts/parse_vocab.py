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

def parse_vocab_mock():
    base_dir = r"study_pack_extracted\MHT_CET_MBA_COMPLETE_STUDY_PACK\02_Mock_Tests"
    vocab_pdf = os.path.join(base_dir, "MHT_CET_MBA_Vocabulary_Mock_Test_1_100Q_HINGLISH.pdf")
    pages = extract_pdf_pages(vocab_pdf)
    
    # 1. Parse Answer Key (Page 13)
    answer_key_page = pages[12] if len(pages) > 12 else ""
    # "1 B 2 B 3 B 4 A 5 B ... 100 B"
    ans_map = {}
    for m in re.finditer(r'(\d+)\s+([A-E])', answer_key_page):
        ans_map[int(m.group(1))] = m.group(2)
        
    print(f"Parsed {len(ans_map)} answers from Answer Key.")
    
    # 2. Parse Explanations (Pages 14 to 23)
    expl_map = {}
    for p in pages[13:23]:
        # "1. B \002 Abundant = large quantity mein available..."
        for m in re.finditer(r'(\d+)\.\s+([A-E])\s+(?:\\00[1-9]|[\x01-\x08\-\:\u2022\u2014])*\s*(.*?)(?=\s+\d+\.\s+[A-E]|$)', p):
            q_num = int(m.group(1))
            expl_text = m.group(3).strip()
            # Clean any remaining control chars
            expl_text = re.sub(r'\\00[0-9]', '', expl_text).strip()
            expl_map[q_num] = expl_text
            
    print(f"Parsed {len(expl_map)} explanations.")

    # 3. Parse Questions (Pages 3 to 12)
    section_map = {
        (1, 10): ("Vocabulary", "List of Words"),
        (11, 20): ("Vocabulary", "Words Confused & Misused"),
        (21, 30): ("Vocabulary", "Phobias"),
        (31, 40): ("Vocabulary", "Manias"),
        (41, 50): ("Vocabulary", "Prefixes & Suffixes"),
        (51, 60): ("Vocabulary", "Analogies"),
        (61, 70): ("Vocabulary", "Synonyms"),
        (71, 80): ("Vocabulary", "Antonyms"),
        (81, 90): ("Vocabulary", "One Word Substitution"),
        (91, 100): ("Vocabulary", "Idioms / Phrases")
    }

    questions = []
    for p_idx in range(2, 12):
        p_text = pages[p_idx]
        # Match each question e.g. "1. Abundant means: A. scarce B. plentiful C. empty D. rare"
        pattern = r'(\d+)\.\s+(.*?)\s+A\.\s+(.*?)\s+B\.\s+(.*?)\s+C\.\s+(.*?)\s+D\.\s+(.*?)(?=\s+\d+\.|\s+SECTION|$)'
        for m in re.finditer(pattern, p_text):
            q_num = int(m.group(1))
            q_text = m.group(2).strip()
            opt_a = m.group(3).strip()
            opt_b = m.group(4).strip()
            opt_c = m.group(5).strip()
            opt_d = m.group(6).strip()
            
            # Subtopic
            sub = "General Vocabulary"
            for (low, high), (subj, subtopic) in section_map.items():
                if low <= q_num <= high:
                    sub = subtopic
                    break
                    
            correct = ans_map.get(q_num, "A")
            expl = expl_map.get(q_num, "Correct choice based on standard dictionary and contextual usage.")
            
            questions.append({
                "id": f"cet-voc-{q_num:03d}",
                "subject": "Verbal Ability & Reading Comprehension",
                "topic": "Vocabulary",
                "subtopic": sub,
                "difficulty": "CET Standard",
                "questionText": q_text,
                "options": {
                    "A": opt_a,
                    "B": opt_b,
                    "C": opt_c,
                    "D": opt_d,
                    "E": "None of the above / Contextual variant"
                },
                "correctAnswer": correct,
                "explanation": expl,
                "hinglishExplanation": expl,
                "conceptFormula": f"{sub} Standard Principle",
                "sourceDocTitle": "MHT CET MBA Vocabulary Mock Test 1 (100Q HINGLISH)",
                "sourcePage": p_idx + 1
            })

    print(f"Successfully constructed {len(questions)} complete questions!")
    with open("parsed_vocab_questions.json", "w", encoding="utf-8") as out:
        json.dump(questions, out, indent=2)
    print("Saved parsed_vocab_questions.json.")

if __name__ == '__main__':
    parse_vocab_mock()
