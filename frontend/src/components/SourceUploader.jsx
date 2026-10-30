import { useState, useRef } from 'react';
import { sourcesAPI } from '../services/api';
import {
  Upload,
  FileText,
  Globe,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileUp,
  X,
} from 'lucide-react';

export default function SourceUploader({ projectId, onSourceAdded }) {
  const [activeTab, setActiveTab] = useState('pdf'); // 'pdf' | 'text' | 'url'
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });

  // PDF Tab State
  const [file, setFile] = useState(null);
  const [pdfMeta, setPdfMeta] = useState({ title: '', authors: '', publication_year: '' });
  const fileInputRef = useRef(null);

  // Text Tab State
  const [textForm, setTextForm] = useState({
    title: '',
    content: '',
    authors: '',
    publication_year: '',
  });

  // URL Tab State
  const [urlForm, setUrlForm] = useState({
    title: '',
    url: '',
    authors: '',
    publication_year: '',
  });

  const clearStatus = () => setStatus({ type: null, message: '' });

  // Handle PDF Drag & Drop
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.type === 'application/pdf' || dropped.name.endsWith('.pdf')) {
        setFile(dropped);
        if (!pdfMeta.title) {
          setPdfMeta((prev) => ({ ...prev, title: dropped.name.replace(/\.[^/.]+$/, '') }));
        }
      } else {
        setStatus({ type: 'error', message: 'Please select a valid PDF file.' });
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!pdfMeta.title) {
        setPdfMeta((prev) => ({ ...prev, title: selected.name.replace(/\.[^/.]+$/, '') }));
      }
    }
  };

  // Upload PDF Handler
  const handlePdfUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus({ type: 'error', message: 'Please choose or drag a PDF document.' });
      return;
    }

    setLoading(true);
    clearStatus();

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (pdfMeta.title) formData.append('title', pdfMeta.title);
      if (pdfMeta.authors) formData.append('authors', pdfMeta.authors);
      if (pdfMeta.publication_year) formData.append('publication_year', pdfMeta.publication_year);

      const res = await sourcesAPI.upload(projectId, formData);
      setStatus({
        type: 'success',
        message: `Successfully ingested "${res.data.source.title}" into ${res.data.source.chunk_count} semantic chunks!`,
      });
      setFile(null);
      setPdfMeta({ title: '', authors: '', publication_year: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onSourceAdded) onSourceAdded(res.data.source);
    } catch (err) {
      console.error(err);
      setStatus({
        type: 'error',
        message: err.response?.data?.error || 'Failed to upload and parse PDF source.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Add Raw Text Handler
  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!textForm.title.trim() || !textForm.content.trim()) {
      setStatus({ type: 'error', message: 'Please enter both a title and text content.' });
      return;
    }

    setLoading(true);
    clearStatus();

    try {
      const payload = {
        title: textForm.title.trim(),
        content: textForm.content.trim(),
        authors: textForm.authors.trim() || undefined,
        publication_year: textForm.publication_year
          ? parseInt(textForm.publication_year, 10)
          : undefined,
      };

      const res = await sourcesAPI.addText(projectId, payload);
      setStatus({
        type: 'success',
        message: `Successfully ingested "${res.data.source.title}" into ${res.data.source.chunk_count} semantic chunks!`,
      });
      setTextForm({ title: '', content: '', authors: '', publication_year: '' });
      if (onSourceAdded) onSourceAdded(res.data.source);
    } catch (err) {
      console.error(err);
      setStatus({
        type: 'error',
        message: err.response?.data?.error || 'Failed to save text source.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Add URL Handler
  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!urlForm.url.trim()) {
      setStatus({ type: 'error', message: 'Please enter a valid URL.' });
      return;
    }

    setLoading(true);
    clearStatus();

    try {
      const payload = {
        title: urlForm.title.trim() || urlForm.url.trim(),
        url: urlForm.url.trim(),
        authors: urlForm.authors.trim() || undefined,
        publication_year: urlForm.publication_year
          ? parseInt(urlForm.publication_year, 10)
          : undefined,
      };

      const res = await sourcesAPI.addText(projectId, payload);
      setStatus({
        type: 'success',
        message: `Successfully indexed web source: "${res.data.source.title}"!`,
      });
      setUrlForm({ title: '', url: '', authors: '', publication_year: '' });
      if (onSourceAdded) onSourceAdded(res.data.source);
    } catch (err) {
      console.error(err);
      setStatus({
        type: 'error',
        message: err.response?.data?.error || 'Failed to index web source.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      {/* Header Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-200 pb-4 mb-6">
        <button
          type="button"
          onClick={() => {
            setActiveTab('pdf');
            clearStatus();
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'pdf'
              ? 'bg-primary-50 text-primary-700 border border-primary-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload PDF Paper</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('text');
            clearStatus();
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'text'
              ? 'bg-primary-50 text-primary-700 border border-primary-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Paste Text / Notes</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('url');
            clearStatus();
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'url'
              ? 'bg-primary-50 text-primary-700 border border-primary-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Web URL / Reference</span>
        </button>
      </div>

      {/* Alert status notification */}
      {status.message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-start space-x-3 text-sm ${
            status.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <span className="flex-1">{status.message}</span>
          <button
            onClick={clearStatus}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PDF Upload Form */}
      {activeTab === 'pdf' && (
        <form onSubmit={handlePdfUpload} className="space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              file
                ? 'border-primary-400 bg-primary-50/50'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,application/pdf"
              className="hidden"
            />
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mb-3">
                <FileUp className="w-6 h-6" />
              </div>
              {file ? (
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • Ready for semantic chunking
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    Drag and drop your academic PDF here, or{' '}
                    <span className="text-primary-600 font-semibold underline">browse files</span>
                  </p>
                  <p className="text-xs text-gray-400">PDF up to 50MB supported</p>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Custom Title (Optional)
              </label>
              <input
                type="text"
                value={pdfMeta.title}
                onChange={(e) => setPdfMeta({ ...pdfMeta, title: e.target.value })}
                placeholder="Paper title"
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Authors (Optional)
              </label>
              <input
                type="text"
                value={pdfMeta.authors}
                onChange={(e) => setPdfMeta({ ...pdfMeta, authors: e.target.value })}
                placeholder="e.g. Vaswani et al."
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Year (Optional)
              </label>
              <input
                type="number"
                value={pdfMeta.publication_year}
                onChange={(e) => setPdfMeta({ ...pdfMeta, publication_year: e.target.value })}
                placeholder="e.g. 2024"
                className="input-field text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !file}
              className="btn-primary flex items-center space-x-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting & Chunking...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload & Ingest PDF</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Raw Text Form */}
      {activeTab === 'text' && (
        <form onSubmit={handleTextSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Document Title *
              </label>
              <input
                type="text"
                required
                value={textForm.title}
                onChange={(e) => setTextForm({ ...textForm, title: e.target.value })}
                placeholder="e.g., Experimental Methodology Notes"
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Authors</label>
              <input
                type="text"
                value={textForm.authors}
                onChange={(e) => setTextForm({ ...textForm, authors: e.target.value })}
                placeholder="Author names"
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Year</label>
              <input
                type="number"
                value={textForm.publication_year}
                onChange={(e) => setTextForm({ ...textForm, publication_year: e.target.value })}
                placeholder="2024"
                className="input-field text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Raw Content or Transcript *
            </label>
            <textarea
              required
              rows={6}
              value={textForm.content}
              onChange={(e) => setTextForm({ ...textForm, content: e.target.value })}
              placeholder="Paste research paper abstract, full text, interview notes, or field data..."
              className="input-field text-sm font-mono leading-relaxed"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Chunks...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Index Text Document</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Web URL Form */}
      {activeTab === 'url' && (
        <form onSubmit={handleUrlSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Source Title (Optional)
              </label>
              <input
                type="text"
                value={urlForm.title}
                onChange={(e) => setUrlForm({ ...urlForm, title: e.target.value })}
                placeholder="e.g. arXiv:2401.12345"
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Target Web URL *
              </label>
              <input
                type="url"
                required
                value={urlForm.url}
                onChange={(e) => setUrlForm({ ...urlForm, url: e.target.value })}
                placeholder="https://doi.org/... or https://arxiv.org/abs/..."
                className="input-field text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Authors / Organization
              </label>
              <input
                type="text"
                value={urlForm.authors}
                onChange={(e) => setUrlForm({ ...urlForm, authors: e.target.value })}
                placeholder="e.g. DeepMind Research"
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Publication Year
              </label>
              <input
                type="number"
                value={urlForm.publication_year}
                onChange={(e) => setUrlForm({ ...urlForm, publication_year: e.target.value })}
                placeholder="2024"
                className="input-field text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Indexing URL...</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  <span>Index Web Resource</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

