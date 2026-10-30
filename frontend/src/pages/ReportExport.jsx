import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsAPI, exportAPI } from '../services/api';
import ExportModal from '../components/ExportModal';
import {
  ArrowLeft,
  Download,
  FileCode,
  FileJson,
  Quote,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export default function ReportExport() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [format, setFormat] = useState('markdown'); // 'markdown' | 'json' | 'bibtex'
  const [includeSources, setIncludeSources] = useState(true);
  const [includeSynthesis, setIncludeSynthesis] = useState(true);

  const [loading, setLoading] = useState(false);
  const [exportData, setExportData] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    projectsAPI
      .get(id)
      .then((res) => setProject(res.data.project))
      .catch((err) => console.error(err));
  }, [id]);

  const handleGenerateExport = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await exportAPI.export(id, {
        format,
        include_sources: includeSources,
        include_synthesis: includeSynthesis,
      });

      setExportData(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to generate export file.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!exportData?.content) return;
    navigator.clipboard.writeText(exportData.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!exportData?.content) return;
    const mimeTypes = {
      markdown: 'text/markdown;charset=utf-8',
      json: 'application/json;charset=utf-8',
      bibtex: 'application/x-bibtex;charset=utf-8',
    };

    const blob = new Blob([exportData.content], {
      type: mimeTypes[exportData.format] || 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportData.filename || `researchhub-export.${format === 'markdown' ? 'md' : format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatCards = [
    {
      id: 'markdown',
      title: 'Academic Markdown (.md)',
      desc: 'Complete literature review with abstract, APA citations, and comparison matrices formatted for GitHub, Obsidian, or Notion.',
      icon: FileCode,
      color: 'border-blue-200 bg-blue-50/40 text-blue-800',
    },
    {
      id: 'json',
      title: 'Structured JSON Dataset (.json)',
      desc: 'Machine-readable schema containing project metadata, all parsed sources, and raw synthesis objects for data pipelines.',
      icon: FileJson,
      color: 'border-emerald-200 bg-emerald-50/40 text-emerald-800',
    },
    {
      id: 'bibtex',
      title: 'BibTeX Bibliography (.bib)',
      desc: 'Standardized citation database ready for direct import into LaTeX manuscripts, Overleaf, Zotero, or Mendeley.',
      icon: Quote,
      color: 'border-purple-200 bg-purple-50/40 text-purple-800',
    },
  ];

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
            Export & Sharing Hub
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Export comprehensive literature reviews and bibliographies for{' '}
            <span className="font-semibold text-gray-800">{project?.title || 'this project'}</span>
          </p>
        </div>
      </div>

      {/* Format Selection Cards */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          Choose Export Format
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {formatCards.map((c) => {
            const Icon = c.icon;
            const isSelected = format === c.id;

            return (
              <div
                key={c.id}
                onClick={() => setFormat(c.id)}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? `${c.color} border-primary-500 shadow-sm ring-2 ring-primary-500/20`
                    : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-gray-800" />
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-600" />}
                </div>

                <h3 className="text-sm font-bold text-gray-900 mb-1">{c.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{c.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export Options & Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          Included Content Modules
        </h3>

        <div className="flex flex-wrap gap-6 text-xs text-gray-700">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeSources}
              onChange={(e) => setIncludeSources(e.target.checked)}
              className="rounded text-primary-600 focus:ring-primary-500"
            />
            <span className="font-medium">Include Ingested Research Sources</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeSynthesis}
              onChange={(e) => setIncludeSynthesis(e.target.checked)}
              className="rounded text-primary-600 focus:ring-primary-500"
            />
            <span className="font-medium">Include Literature Synthesis Reports & Matrices</span>
          </label>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="pt-2 flex items-center space-x-3">
          <button
            onClick={handleGenerateExport}
            disabled={loading}
            className="btn-primary text-xs flex items-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Compiling Research Report...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Generate {format.toUpperCase()} Export</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Preview & Quick Actions */}
      {exportData && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden space-y-0">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">{exportData.filename}</h3>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                {exportData.format} Preview
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="btn-secondary text-xs flex items-center space-x-1.5 py-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-green-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setModalOpen(true)}
                className="btn-secondary text-xs flex items-center space-x-1.5 py-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Fullscreen</span>
              </button>

              <button
                onClick={handleDownload}
                className="btn-primary text-xs flex items-center space-x-1.5 py-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          <div className="p-6 bg-gray-900 font-mono text-xs text-gray-100 max-h-96 overflow-y-auto leading-relaxed select-all whitespace-pre-wrap">
            {exportData.content}
          </div>
        </div>
      )}

      {/* Fullscreen Export Modal */}
      {exportData && (
        <ExportModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          content={exportData.content}
          filename={exportData.filename}
          format={exportData.format}
        />
      )}
    </div>
  );
}

