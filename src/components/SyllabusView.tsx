import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Upload, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ArrowRight,
  ExternalLink,
  Award,
  Layers,
  Check,
  FileCheck
} from 'lucide-react';
import { SyllabusSection, LibraryDocument, UserProfile, SubjectType } from '../types';
import { StorageService } from '../services/storage';
import { DocumentIndexer } from '../services/documentIndexer';

interface SyllabusViewProps {
  profile: UserProfile;
  onStartTopicPractice: (topic: string) => void;
  onOpenCompanion: (prompt: string) => void;
}

export const SyllabusView: React.FC<SyllabusViewProps> = ({
  profile,
  onStartTopicPractice,
  onOpenCompanion
}) => {
  const [syllabusSections, setSyllabusSections] = useState<SyllabusSection[]>(() => StorageService.getSyllabus());
  const [documents, setDocuments] = useState<LibraryDocument[]>(() => StorageService.getDocuments());
  const [activeTab, setActiveTab] = useState<'syllabus' | 'notes'>('syllabus');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<SubjectType | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSubject, setExpandedSubject] = useState<SubjectType | 'All'>('All');
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<LibraryDocument | null>(null);

  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const toggleTopicStatus = (subject: SubjectType, topicId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Not Started' 
      ? 'In Progress' 
      : currentStatus === 'In Progress' 
      ? 'Completed' 
      : 'Not Started';

    const updated = syllabusSections.map(sec => {
      if (sec.subject === subject) {
        return {
          ...sec,
          topics: sec.topics.map(t => t.id === topicId ? { ...t, status: nextStatus as any } : t)
        };
      }
      return sec;
    });

    setSyllabusSections(updated);
    StorageService.saveSyllabus(updated);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);
    setUploadStatus(`Indexing "${file.name}"...`);

    try {
      const newDoc = await DocumentIndexer.processUploadedFile(file);
      StorageService.addDocument(newDoc);
      setDocuments(StorageService.getDocuments());
      setUploadStatus(`Successfully indexed "${newDoc.title}" (${newDoc.chunksCount} semantic chunks extracted).`);
      setTimeout(() => setUploadStatus(null), 4000);
    } catch (err: any) {
      setUploadStatus(`Extraction failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Calculate totals
  const totalTopics = syllabusSections.reduce((acc, s) => acc + s.topics.length, 0);
  const completedTopics = syllabusSections.reduce(
    (acc, s) => acc + s.topics.filter(t => t.status === 'Completed').length, 
    0
  );

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-parchment-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-terracotta-600 mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Official MAH-MBA/MMS-CET 2027 Syllabus & Resources</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink-900">
            Syllabus & Uploaded Study Material
          </h1>
          <p className="text-sm text-ink-700 mt-1">
            Official CET weightage breakdown with section-wise topics and study notes uploaded by Rushabh.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-parchment-100 p-1 rounded-2xl border border-parchment-300">
          <button
            onClick={() => setActiveTab('syllabus')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'syllabus'
                ? 'bg-ink-900 text-white shadow-soft'
                : 'text-ink-700 hover:text-ink-900'
            }`}
          >
            📋 Official Syllabus ({completedTopics}/{totalTopics} Mastered)
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'notes'
                ? 'bg-ink-900 text-white shadow-soft'
                : 'text-ink-700 hover:text-ink-900'
            }`}
          >
            📚 Uploaded Notes ({documents.length} Docs)
          </button>
        </div>
      </div>

      {/* TAB 1: OFFICIAL CET SYLLABUS */}
      {activeTab === 'syllabus' && (
        <div className="space-y-6">
          
          {/* CET Exam Blueprint Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {syllabusSections.map(sec => {
              const secCompleted = sec.topics.filter(t => t.status === 'Completed').length;
              return (
                <div 
                  key={sec.subject}
                  className="p-5 rounded-3xl bg-white border border-parchment-200 shadow-soft space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-600">
                      {sec.totalQuestions} Questions
                    </span>
                    <span className="text-xs font-mono text-ink-500">
                      {sec.recommendedMinutes} mins
                    </span>
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-ink-900 text-base leading-snug">
                      {sec.subject}
                    </h3>
                    <p className="text-xs text-ink-500 mt-0.5">
                      {sec.totalMarks} Marks • 1 Mark per Q (No -ve marking)
                    </p>
                  </div>

                  {/* Micro Progress */}
                  <div className="space-y-1 pt-1">
                    <div className="h-2 w-full bg-parchment-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-sage-500 rounded-full transition-all"
                        style={{ width: `${sec.topics.length ? (secCompleted / sec.topics.length) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-ink-500">
                      <span>{secCompleted} of {sec.topics.length} topics ready</span>
                      <span>{Math.round((secCompleted / sec.topics.length) * 100)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section Filter & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-parchment-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-ink-700">Filter Section:</span>
              {(['All', 'Logical Reasoning', 'Quantitative Aptitude', 'Abstract Reasoning', 'Verbal Ability'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSubjectFilter(s)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors ${
                    selectedSubjectFilter === s
                      ? 'bg-ink-900 text-white'
                      : 'bg-parchment-100 hover:bg-parchment-200 text-ink-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics (e.g. Seating, Puzzles)..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-parchment-300 text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>
          </div>

          {/* Section-Wise Topic Tables */}
          <div className="space-y-6">
            {syllabusSections
              .filter(sec => selectedSubjectFilter === 'All' || sec.subject === selectedSubjectFilter)
              .map(sec => {
                const filteredTopics = sec.topics.filter(t => 
                  !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (filteredTopics.length === 0) return null;

                return (
                  <div key={sec.subject} className="bg-white rounded-3xl border border-parchment-200 shadow-soft overflow-hidden">
                    <div className="p-5 sm:p-6 bg-parchment-100/60 border-b border-parchment-200 flex items-center justify-between">
                      <div>
                        <h2 className="font-serif text-xl font-bold text-ink-900">
                          {sec.subject}
                        </h2>
                        <span className="text-xs text-ink-600 mt-0.5 inline-block">
                          {sec.totalQuestions} Questions in CET • Recommended time: {sec.recommendedMinutes} mins
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-terracotta-700 bg-terracotta-50 border border-terracotta-200 px-3 py-1 rounded-full">
                        {filteredTopics.filter(t => t.status === 'Completed').length} / {filteredTopics.length} Topics Ready
                      </span>
                    </div>

                    <div className="divide-y divide-parchment-100">
                      {filteredTopics.map(topic => (
                        <div 
                          key={topic.id} 
                          className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-parchment-50/50 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                topic.weightageRank === 'High' 
                                  ? 'bg-rose-50 text-rose-800 border border-rose-200' 
                                  : 'bg-parchment-200 text-ink-700'
                              }`}>
                                {topic.weightageRank} CET Weightage
                              </span>
                              <h3 className="font-semibold text-sm text-ink-900">
                                {topic.name}
                              </h3>
                            </div>
                            {topic.keyNotes && (
                              <p className="text-xs text-ink-600 pl-0.5">
                                💡 <em>Note:</em> {topic.keyNotes}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
                            {/* Status Switcher Button */}
                            <button
                              onClick={() => toggleTopicStatus(sec.subject, topic.id, topic.status)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                                topic.status === 'Completed'
                                  ? 'bg-sage-50 text-sage-800 border-sage-300'
                                  : topic.status === 'In Progress'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-parchment-100 text-ink-600 border-parchment-300 hover:border-terracotta-400'
                              }`}
                              title="Click to toggle status: Not Started → In Progress → Completed"
                            >
                              {topic.status === 'Completed' ? (
                                <Check className="w-3.5 h-3.5 text-sage-600 stroke-[3]" />
                              ) : topic.status === 'In Progress' ? (
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-ink-400" />
                              )}
                              <span>{topic.status}</span>
                            </button>

                            {/* Practice MCQs Button */}
                            <button
                              onClick={() => onStartTopicPractice(topic.name)}
                              className="px-3 py-1.5 rounded-xl bg-ink-900 hover:bg-terracotta-500 text-parchment-50 text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
                            >
                              <span>Practice</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 2: UPLOADED NOTES & STUDY MATERIAL */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          
          {/* Upload Dropzone */}
          <div className="p-8 rounded-3xl bg-white border-2 border-dashed border-parchment-300 hover:border-terracotta-400 transition-colors text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center mx-auto border border-terracotta-200">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-ink-900">
                Upload Notes, Formula Sheets & CET Question Sets
              </h3>
              <p className="text-xs text-ink-600 mt-1 max-w-md mx-auto">
                Upload PDF, DOCX, or text files. The system extracts formulas, rules, and semantic chunks for practice and AI citation.
              </p>
            </div>

            <div>
              <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ink-900 hover:bg-terracotta-500 text-parchment-50 text-xs font-semibold cursor-pointer transition-colors shadow-soft">
                <span>Select File from Device</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.doc"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {uploadStatus && (
              <p className="text-xs font-medium text-terracotta-700 bg-terracotta-50 border border-terracotta-200 p-2.5 rounded-xl max-w-md mx-auto animate-fadeIn">
                {uploadStatus}
              </p>
            )}
          </div>

          {/* List of Uploaded Documents */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-ink-900">
              Available Study Material ({documents.length} Files)
            </h2>

            {documents.length === 0 ? (
              <div className="p-10 text-center rounded-3xl bg-white border border-parchment-200 text-xs text-ink-600">
                No documents uploaded yet. Use the upload box above to add notes for Sanskriti.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map(doc => (
                  <div 
                    key={doc.id}
                    className="p-5 rounded-3xl bg-white border border-parchment-200 shadow-soft space-y-3 hover:border-terracotta-300 transition-colors flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-parchment-100 text-ink-700 border border-parchment-300 uppercase">
                          {doc.fileType} • {doc.sizeFormatted}
                        </span>
                        <span className="text-[11px] text-ink-500">
                          {doc.uploadDate}
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-ink-900 text-base leading-snug">
                        {doc.title}
                      </h3>

                      <p className="text-xs text-ink-600 leading-relaxed line-clamp-2">
                        {doc.summary}
                      </p>

                      {/* Topics Tagged */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {doc.topicsDetected.map((topic, i) => (
                          <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-terracotta-50 text-terracotta-800 border border-terracotta-200">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-parchment-100 gap-2">
                      <button
                        onClick={() => setSelectedDocForPreview(doc)}
                        className="px-3 py-1.5 rounded-xl border border-parchment-300 hover:bg-parchment-100 text-ink-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-ink-600" />
                        <span>Preview Chunks</span>
                      </button>

                      <button
                        onClick={() => onStartTopicPractice(doc.topicsDetected[0] || 'Quantitative Aptitude')}
                        className="px-3.5 py-1.5 rounded-xl bg-ink-900 hover:bg-terracotta-500 text-parchment-50 text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
                      >
                        <span>Practice Document</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Document Chunks Preview Modal */}
      {selectedDocForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-parchment-200 rounded-3xl max-w-2xl w-full p-6 shadow-elevated max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-parchment-200 mb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-ink-900">
                  {selectedDocForPreview.title}
                </h3>
                <span className="text-xs text-ink-500">
                  {selectedDocForPreview.chunksCount} Extracted Chunks & Grounded Formulas
                </span>
              </div>
              <button
                onClick={() => setSelectedDocForPreview(null)}
                className="px-3 py-1 rounded-xl bg-parchment-100 text-ink-700 hover:bg-parchment-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1 text-xs">
              {selectedDocForPreview.sampleChunks.map(chunk => (
                <div key={chunk.chunkId} className="p-4 rounded-2xl bg-parchment-50 border border-parchment-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-terracotta-700">
                    <span>Page {chunk.pageNumber}</span>
                    <span className="font-mono text-ink-400">#{chunk.chunkId}</span>
                  </div>
                  <p className="text-ink-800 leading-relaxed font-serif text-[13px]">
                    "{chunk.text}"
                  </p>
                  {chunk.keyFormulas && chunk.keyFormulas.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-1">
                      {chunk.keyFormulas.map((f, i) => (
                        <span key={i} className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-parchment-300 text-terracotta-800">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
