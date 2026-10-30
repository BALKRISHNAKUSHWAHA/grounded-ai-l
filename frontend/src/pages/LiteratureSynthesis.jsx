import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsAPI, sourcesAPI, synthesisAPI } from '../services/api';
import SynthesisMatrix from '../components/SynthesisMatrix';
import {
  ArrowLeft,
  Sparkles,
  Layers,
  Loader2,
  AlertCircle,
  FileText,
  CheckCircle2,
  Plus,
  BookOpen,
} from 'lucide-react';

export default function LiteratureSynthesis() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [sources, setSources] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeReportId, setActiveReportId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  // Synthesis Form State
  const [title, setTitle] = useState('');
  const [selectedSourceIds, setSelectedSourceIds] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [projRes, srcRes, synRes] = await Promise.all([
        projectsAPI.get(id),
        sourcesAPI.list(id),
        synthesisAPI.list(id),
      ]);
      setProject(projRes.data.project);
      setSources(srcRes.data.sources || []);
      const reportList = synRes.data.reports || [];
      setReports(reportList);
      if (reportList.length > 0 && !activeReportId) {
        setActiveReportId(reportList[0].id);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load project synthesis data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const toggleSourceSelection = (sourceId) => {
    setSelectedSourceIds((prev) =>
      prev.includes(sourceId) ? prev.filter((s) => s !== sourceId) : [...prev, sourceId]
    );
  };

  const handleSelectAllSources = () => {
    if (selectedSourceIds.length === sources.length) {
      setSelectedSourceIds([]);
    } else {
      setSelectedSourceIds(sources.map((s) => s.id));
    }
  };

  const handleGenerateSynthesis = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Please enter a title for the synthesis report.');
      return;
    }

    if (selectedSourceIds.length < 2) {
      setFormError('Please select at least 2 sources to compare and synthesize.');
      return;
    }

    setGenerating(true);

    try {
      const res = await synthesisAPI.create(id, {
        title: title.trim(),
        source_ids: selectedSourceIds,
      });

      const newReport = res.data.report;
      setReports((prev) => [newReport, ...prev]);
      setActiveReportId(newReport.id);
      setTitle('');
      setSelectedSourceIds([]);
    } catch (err) {
      console.error(err);
      setFormError(
        err.response?.data?.error ||
          'Failed to generate literature synthesis. Please ensure sources have extracted content.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const activeReport = reports.find((r) => r.id === activeReportId) || reports[0];

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
            Literature Synthesizer
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Generate comparative matrices, identify research gaps, and cross-examine findings in{' '}
            <span className="font-semibold text-gray-800">{project?.title || 'this project'}</span>
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-center">
          {reports.length} Synthesized Reports
        </div>
      </div>

      {/* Generation Form Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
        <div className="flex items-center space-x-2 text-primary-700">
          <Sparkles className="w-5 h-5 text-primary-600" />
          <h2 className="text-sm font-bold text-gray-900">Run New Literature Synthesis</h2>
        </div>

        {formError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleGenerateSynthesis} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Synthesis Report Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Comparative Analysis of Attention Mechanisms vs State Space Models"
              className="input-field text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Select Sources to Compare (Min 2 required) *
              </label>
              {sources.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllSources}
                  className="text-xs text-primary-600 hover:text-primary-800 font-semibold"
                >
                  {selectedSourceIds.length === sources.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            {sources.length < 2 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Insufficient Sources</p>
                  <p className="mt-0.5">
                    You need at least 2 ingested sources to generate a comparative literature matrix.{' '}
                    <Link
                      to={`/projects/${id}/sources`}
                      className="underline font-bold text-amber-900"
                    >
                      Go to Sources Hub to upload papers.
                    </Link>
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-56 overflow-y-auto p-1">
                {sources.map((s) => {
                  const isChecked = selectedSourceIds.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      className={`p-3 rounded-lg border text-xs cursor-pointer flex items-start space-x-2.5 transition-colors ${
                        isChecked
                          ? 'border-primary-400 bg-primary-50/40 text-primary-950 font-medium'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSourceSelection(s.id)}
                        className="mt-0.5 rounded text-primary-600 focus:ring-primary-500"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{s.title}</p>
                        <p className="text-[11px] text-gray-400">
                          {s.authors || 'Unknown'} {s.publication_year ? `(${s.publication_year})` : ''}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={generating || sources.length < 2 || selectedSourceIds.length < 2}
              className="btn-primary text-xs flex items-center space-x-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Literature with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Synthesis Matrix ({selectedSourceIds.length} Sources)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Reports Tabs & View */}
      {reports.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-gray-200">
            {reports.map((rep) => {
              const isActive = rep.id === activeReport?.id;
              return (
                <button
                  key={rep.id}
                  onClick={() => setActiveReportId(rep.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center space-x-2 ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-2xs'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="max-w-[200px] truncate">{rep.title}</span>
                </button>
              );
            })}
          </div>

          {activeReport && <SynthesisMatrix report={activeReport} />}
        </div>
      )}
    </div>
  );
}

