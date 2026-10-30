import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsAPI, sourcesAPI } from '../services/api';
import SourceUploader from '../components/SourceUploader';
import CitationBox from '../components/CitationBox';
import {
  ArrowLeft,
  FileText,
  Trash2,
  Quote,
  Loader2,
  AlertCircle,
  ExternalLink,
  Layers,
  ChevronDown,
  ChevronUp,
  X,
  BookOpen,
} from 'lucide-react';

export default function SourcesManager() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected source for citation modal / drawer
  const [citationSource, setCitationSource] = useState(null);

  // Expanded source for chunk inspection
  const [expandedSourceId, setExpandedSourceId] = useState(null);
  const [expandedSourceDetails, setExpandedSourceDetails] = useState(null);
  const [loadingChunks, setLoadingChunks] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [projRes, srcRes] = await Promise.all([
        projectsAPI.get(id),
        sourcesAPI.list(id),
      ]);
      setProject(projRes.data.project);
      setSources(srcRes.data.sources || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch project sources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSourceAdded = (newSource) => {
    setSources((prev) => [newSource, ...prev]);
  };

  const handleDeleteSource = async (sourceId, sourceTitle) => {
    if (window.confirm(`Delete source "${sourceTitle}" and all its indexed chunks?`)) {
      try {
        await sourcesAPI.delete(id, sourceId);
        setSources((prev) => prev.filter((s) => s.id !== sourceId));
        if (expandedSourceId === sourceId) {
          setExpandedSourceId(null);
          setExpandedSourceDetails(null);
        }
      } catch (err) {
        console.error(err);
        alert('Failed to delete source.');
      }
    }
  };

  const toggleExpandSource = async (sourceId) => {
    if (expandedSourceId === sourceId) {
      setExpandedSourceId(null);
      setExpandedSourceDetails(null);
      return;
    }

    setExpandedSourceId(sourceId);
    setLoadingChunks(true);
    try {
      const res = await sourcesAPI.get(id, sourceId);
      setExpandedSourceDetails(res.data.source);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChunks(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <div>
        <Link
          to={`/projects/${id}`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Workspace</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Sources & Ingestion Hub
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Project:{' '}
            <span className="font-semibold text-gray-800">{project?.title || 'Loading...'}</span>
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 self-start sm:self-center">
          {sources.length} Ingested Sources
        </div>
      </div>

      {/* Source Ingestion Engine */}
      <div>
        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
          Ingest New Source
        </h2>
        <SourceUploader projectId={id} onSourceAdded={handleSourceAdded} />
      </div>

      {/* Ingested Sources List */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          Ingested Document Repository
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 space-y-2 bg-white rounded-xl border border-gray-200">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            <p className="text-xs">Loading sources...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : sources.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 p-6">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-700 mb-1">No Sources Ingested Yet</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Use the uploader above to add PDF research papers, text notes, or URLs to start using the RAG assistant.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="divide-y divide-gray-200">
              {sources.map((s) => {
                const isExpanded = expandedSourceId === s.id;

                return (
                  <div key={s.id} className="transition-colors hover:bg-gray-50/50">
                    <div className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Metadata */}
                      <div className="space-y-1 max-w-2xl">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              s.source_type === 'pdf'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : s.source_type === 'url'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {s.source_type}
                          </span>
                          <h3 className="text-sm font-bold text-gray-900 line-clamp-1">
                            {s.title}
                          </h3>
                        </div>

                        <p className="text-xs text-gray-500">
                          {s.authors ? `By ${s.authors}` : 'Unknown Authors'}
                          {s.publication_year ? ` (${s.publication_year})` : ''} •{' '}
                          <span className="font-semibold text-gray-700">
                            {s.chunk_count} chunks indexed
                          </span>{' '}
                          • Added {new Date(s.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center space-x-2 self-end sm:self-center">
                        <button
                          onClick={() => setCitationSource(s)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-1"
                          title="Generate citation"
                        >
                          <Quote className="w-3.5 h-3.5 text-primary-600" />
                          <span>Citation</span>
                        </button>

                        <button
                          onClick={() => toggleExpandSource(s.id)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-1"
                          title="Inspect Chunks"
                        >
                          <Layers className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Chunks</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteSource(s.id, s.title)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete source"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Chunk Breakdown */}
                    {isExpanded && (
                      <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Semantic Chunks for "{s.title}"
                          </h4>
                          <span className="text-[11px] text-gray-500">
                            Chunk Window: 1000 tokens • Overlap: 200 tokens
                          </span>
                        </div>

                        {loadingChunks ? (
                          <div className="py-6 text-center text-xs text-gray-400 flex items-center justify-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                            <span>Loading document chunks...</span>
                          </div>
                        ) : expandedSourceDetails?.chunks &&
                          expandedSourceDetails.chunks.length > 0 ? (
                          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                            {expandedSourceDetails.chunks.map((chk) => (
                              <div
                                key={chk.id}
                                className="p-3 bg-white rounded-lg border border-gray-200 text-xs font-mono text-gray-800 leading-relaxed"
                              >
                                <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1 border-b border-gray-100 pb-1">
                                  <span className="font-bold text-primary-700">
                                    Chunk #{chk.chunk_index}
                                  </span>
                                  <span>{chk.token_count} tokens</span>
                                </div>
                                <p className="line-clamp-3 text-gray-700">{chk.content}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 italic">No chunks available.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Citation Modal */}
      {citationSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <div className="flex items-center space-x-2">
                <Quote className="w-4 h-4 text-primary-600" />
                <h3 className="text-sm font-bold text-gray-900">Citation Generator</h3>
              </div>
              <button
                onClick={() => setCitationSource(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-bold text-gray-800 mb-1">{citationSource.title}</h4>
              <p className="text-[11px] text-gray-500">
                {citationSource.authors || 'Unknown Authors'} •{' '}
                {citationSource.publication_year || 'n.d.'}
              </p>
            </div>

            <CitationBox source={citationSource} />
          </div>
        </div>
      )}
    </div>
  );
}

