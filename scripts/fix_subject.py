with open('src/data/extractedVocabQuestions.ts', 'r', encoding='utf-8') as f:
    text = f.read()
text = text.replace('"Verbal Ability & Reading Comprehension"', '"Verbal Ability"')
with open('src/data/extractedVocabQuestions.ts', 'w', encoding='utf-8') as f:
    f.write(text)
print("Updated SubjectType successfully.")
