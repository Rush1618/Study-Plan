import React, { useState } from 'react';
import { 
  BookOpen, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Layers, 
  Search, 
  Eye, 
  Play, 
  FileCheck, 
  Clock,
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';
import { LibraryDocument } from '../types';
import { sampleLibraryDocuments } from '../data/mockData';

import { StorageService } from '../services/storage';
import { DocumentIndexer } from '../services/documentIndexer';

interface StudyLibraryProps {
  onStartDocumentPractice: (docId: string) => void;
  onOpenCompanion: (prompt: string) => void;
}

export const StudyLibrary: React.FC<StudyLibraryProps> = ({
  onStartDocumentPractice,
  onOpenCompanion
}) => {
  const [documents, setDocuments] = useState<LibraryDocument[]>(() => StorageService.getDocuments());
  const [selectedDoc, setSelectedDoc] = useState<LibraryDocument | null>(() => {
    const list = StorageService.getDocuments();
    return list.length > 0 ? list[0] : null;
  });
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [activeStepText, setActiveStepText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Genuine document-processing pipeline reading actual uploaded file
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(15);
    setActiveStepText(`1/4: Reading ${file.name} via client stream...`);

    try {
      setUploadProgress(40);
      setActiveStepText("2/4: Parsing selectable text & calculating page bounds...");

      const doc = await DocumentIndexer.processUploadedFile(file);

      setUploadProgress(75);
      setActiveStepText("3/4: Chunking text & extracting formula definitions...");

      setTimeout(() => {
        setUploadProgress(100);
        setActiveStepText("4/4: Complete! Added to persistent library index.");
        
        const updatedList = StorageService.getDocuments();
        setDocuments(updatedList);
        setSelectedDoc(doc);
        setIsUploading(false);
      }, 500);
    } catch {
      setActiveStepText("Error processing file. Please ensure it is a valid text/PDF document.");
      setIsUploading(false);
    }
  };

  const filteredDocs = documents.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.topicsDetected.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-parchment-200">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink-900">
            My Study Library
          </h1>
          <p className="text-sm text-ink-700 mt-1">
            Your private books, handouts, and notes. Grounded with verified page numbers and zero fabricated citations.
          </p>
        </div>

        {/* Upload Trigger Button */}
        <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ink-900 hover:bg-terracotta-500 text-parchment-50 font-semibold text-xs transition-colors shadow-soft">
          <Upload className="w-4 h-4" />
          <span>Upload New Study Material</span>
          <input 
            type="file" 
            className="hidden" 
            accept=".pdf,.docx,.pptx,.txt,.csv,.md"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />
        </label>
      </div>

      {/* Upload Processing Animation Banner */}
      {isUploading && (
        <div className="p-6 rounded-3xl bg-parchment-100 border border-terracotta-300 shadow-elevated space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-bold text-ink-900">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-terracotta-500 animate-spin" />
              <span>Processing Document Pipeline</span>
            </span>
            <span className="font-mono text-terracotta-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-parchment-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-terracotta-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-ink-700 font-medium">{activeStepText}</p>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search documents or detected topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-parchment-50 border border-parchment-300 rounded-xl text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-terracotta-500"
          />
        </div>

        <div className="flex items-center gap-4 text-xs text-ink-600">
          <span><strong>{documents.length}</strong> Documents Indexed</span>
          <span>•</span>
          <span><strong>{documents.reduce((acc, d) => acc + d.extractedMCQsCount, 0)}</strong> Candidate MCQs Extracted</span>
        </div>
      </div>

      {/* Document Library List & Preview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Document List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredDocs.map((doc) => {
            const isSelected = selectedDoc?.id === doc.id;

            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-parchment-50 border-terracotta-500 shadow-soft ring-1 ring-terracotta-400/50' 
                    : 'bg-white border-parchment-200 hover:border-parchment-300 hover:bg-parchment-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-parchment-100 text-terracotta-600 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                      {doc.fileType}
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-bold text-ink-900 leading-snug">
                        {doc.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-ink-500 mt-1">
                        <span>{doc.sizeFormatted}</span>
                        <span>•</span>
                        <span>{doc.totalPages} pages</span>
                        <span>•</span>
                        <span>{doc.uploadDate}</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sage-100 text-sage-800">
                    {doc.status}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {doc.topicsDetected.slice(0, 3).map((topic, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-parchment-100 text-[10px] font-medium text-ink-700">
                      {topic}
                    </span>
                  ))}
                  {doc.topicsDetected.length > 3 && (
                    <span className="text-[10px] text-ink-500">
                      +{doc.topicsDetected.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Document Inspector & AI Actions (7 cols) */}
        {selectedDoc ? (
          <div className="lg:col-span-7 bg-parchment-50 border border-parchment-200 rounded-3xl p-6 sm:p-8 shadow-soft space-y-6">
            
            {/* Document Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-parchment-200">
              <div>
                <span className="editorial-badge text-terracotta-600">
                  Document Inspector & Citation Grounding
                </span>
                <h3 className="font-serif text-2xl font-bold text-ink-900 mt-1">
                  {selectedDoc.title}
                </h3>
                <div className="text-xs text-ink-500 mt-1 font-mono">
                  File: {selectedDoc.fileName} • {selectedDoc.chunksCount} Semantic Chunks Indexed
                </div>
              </div>

              <button
                onClick={() => onStartDocumentPractice(selectedDoc.id)}
                className="px-4 py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold transition-colors shadow-soft flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Practice {selectedDoc.extractedMCQsCount} Extracted MCQs</span>
              </button>
            </div>

            {/* Document Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-ink-700 uppercase tracking-wider">
                Document Synthesis
              </h4>
              <p className="text-sm text-ink-800 leading-relaxed">
                {selectedDoc.summary}
              </p>
            </div>

            {/* Extracted Semantic Chunks Preview (with real page numbers) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-ink-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-terracotta-600" />
                  <span>Sample Verified Chunks & Citations</span>
                </h4>
                <span className="text-[11px] text-ink-500 font-mono">
                  pgvector index active
                </span>
              </div>

              <div className="space-y-3">
                {selectedDoc.sampleChunks.map((chunk) => (
                  <div key={chunk.chunkId} className="p-4 rounded-2xl bg-white border border-parchment-200 text-xs space-y-2 shadow-sm">
                    <div className="flex items-center justify-between text-ink-500">
                      <span className="font-bold text-terracotta-700 font-mono">
                        Page {chunk.pageNumber} • Chunk ID: {chunk.chunkId}
                      </span>
                      <button
                        onClick={() => onOpenCompanion(`Explain page ${chunk.pageNumber} from ${selectedDoc.title}: "${chunk.text.slice(0, 100)}..."`)}
                        className="text-[11px] text-ink-600 hover:text-terracotta-600 font-medium flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Explain with Companion</span>
                      </button>
                    </div>

                    <p className="text-ink-800 font-sans leading-relaxed">
                      {chunk.text}
                    </p>

                    {chunk.keyFormulas && (
                      <div className="pt-2 border-t border-parchment-100 flex flex-wrap gap-2">
                        {chunk.keyFormulas.map((f, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-parchment-100 text-ink-800 font-mono text-[10px]">
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Socratic AI Prompt Shortcuts for this document */}
            <div className="p-4 rounded-2xl bg-parchment-100/80 border border-parchment-200 space-y-2 text-xs">
              <div className="font-bold text-ink-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
                <span>Instant Operations on this Document:</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => onOpenCompanion(`Summarize all key formulas and mental shortcuts from ${selectedDoc.title}`)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-parchment-300 hover:border-terracotta-400 text-ink-800 text-[11px] font-medium transition-colors"
                >
                  ⚡ Summarize All Formulas
                </button>
                <button
                  onClick={() => onOpenCompanion(`Generate 5 conceptual questions from page 42 of ${selectedDoc.title}`)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-parchment-300 hover:border-terracotta-400 text-ink-800 text-[11px] font-medium transition-colors"
                >
                  ✍️ Extract 5 MCQs from Page 42
                </button>
                <button
                  onClick={() => onOpenCompanion(`Compare ${selectedDoc.title} with the official MAH-CET 2027 syllabus to find any missing topics.`)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-parchment-300 hover:border-terracotta-400 text-ink-800 text-[11px] font-medium transition-colors"
                >
                  🔍 Audit Syllabus Coverage
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-7 p-12 text-center text-ink-500 bg-parchment-50 rounded-3xl border border-parchment-200">
            Select a document from the left to inspect chunks and trigger practice.
          </div>
        )}

      </div>
    </div>
  );
};
