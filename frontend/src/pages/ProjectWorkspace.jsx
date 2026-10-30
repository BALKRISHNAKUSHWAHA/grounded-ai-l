import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectsAPI, sourcesAPI, synthesisAPI } from '../services/api';
import {
  ArrowLeft,
  FileText,
  MessageSquare,
  Sparkles,
  Download,
  Layers,
  Calendar,
  ExternalLink,
  Loader2,
  AlertCircle,
  Plus,
  BookOpen,
  Trash2,
} from 'lucide-react';

export default function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [sources, setSources] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      projectsAPI.get(id),
      sourcesAPI.list(id).catch(() => ({ data: { sources: [] } })),
      synthesisAPI.list(id).catch(() => ({ data: { reports: [] } })),
    ])
      .then(([projRes, srcRes, synRes]) => {
        if (isMounted) {
          setProject(projRes.data.project);
          setSources(srcRes.data.sources || []);
          setReports(synRes.data.reports || []);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) {
          setError('Failed to load project details. Please ensure it exists.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDeleteProject = async () => {
    if (window.confirm(`Are you sure you want to delete "${project.title}"? This cannot be undone.`)) {
      try {
        await projectsAPI.delete(id);
        navigate('/dashboard');
      } catch (err) {
        console.error(err);
        alert('Failed to delete project.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-sm">Loading research workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Project Error</h2>
        <p className="text-sm text-gray-600 mb-6">{error || 'Project not found.'}</p>
        <Link to="/dashboard" className="btn-primary text-sm inline-flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const workspaceHubs = [
    {
      title: 'Sources & Ingestion Hub',
      path: `/projects/${id}/sources`,
      icon: FileText,
      badge: `${sources.length} Sources`,
      description:
        'Upload academic PDFs, enter web links, view extracted document text, and generate citation keys.',
      color: 'border-blue-200 hover:border-blue-400 bg-blue-50/30 text-blue-700',
      actionText: 'Manage Sources',
    },
    {
      title: 'AI Research Assistant (RAG Chat)',
      path: `/projects/${id}/chat`,
      icon: MessageSquare,
      badge: `${project.message_count || 0} Messages`,
      description:
        'Context-aware chat powered by Google Gemini. Query your documents with strict source attribution and chunk references.',
      color: 'border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 text-indigo-700',
      actionText: 'Launch RAG Chat',
    },
    {
      title: 'Literature Synthesizer',
      path: `/projects/${id}/synthesize`,
      icon: Sparkles,
      badge: `${reports.length} Reports`,
      description:
        'Select ingested papers and generate structured comparative matrices covering Objectives, Methodology, Findings, and Gaps.',
      color: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/30 text-emerald-700',
      actionText: 'Synthesize Literature',
    },
    {
      title: 'Export & Sharing Hub',
      path: `/projects/${id}/export`,
      icon: Download,
      badge: 'Markdown, JSON, BibTeX',
      description:
        'Export compiled research reviews as GitHub Flavored Markdown, machine-readable JSON datasets, or BibTeX bibliographies.',
      color: 'border-amber-200 hover:border-amber-400 bg-amber-50/30 text-amber-700',
      actionText: 'Open Export Hub',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Project Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200">
                {project.domain}
              </span>
              <span className="flex items-center text-xs text-gray-400 space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Created on{' '}
                  {new Date(project.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {project.title}
            </h1>

            <p className="text-sm text-gray-600 max-w-3xl leading-relaxed">
              {project.description ||
                'No description specified. Use the modules below to ingest research sources and synthesize findings.'}
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start lg:self-center">
            <button
              onClick={handleDeleteProject}
              className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200"
              title="Delete Project Repository"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Aggregate Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="text-xs text-gray-500 font-medium mb-1">Ingested Sources</div>
            <div className="text-2xl font-bold text-gray-900">{sources.length}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="text-xs text-gray-500 font-medium mb-1">Semantic Chunks</div>
            <div className="text-2xl font-bold text-gray-900">{project.chunk_count || 0}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="text-xs text-gray-500 font-medium mb-1">RAG Chat Queries</div>
            <div className="text-2xl font-bold text-gray-900">{project.message_count || 0}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="text-xs text-gray-500 font-medium mb-1">Synthesis Reports</div>
            <div className="text-2xl font-bold text-gray-900">{reports.length}</div>
          </div>
        </div>
      </div>

      {/* Workspace Hubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workspaceHubs.map((hub, idx) => {
          const Icon = hub.icon;
          return (
            <div
              key={idx}
              className={`bg-white rounded-2xl border p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${hub.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-800" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
                    {hub.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">{hub.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-6">{hub.description}</p>
              </div>

              <div>
                <button
                  onClick={() => navigate(hub.path)}
                  className="w-full btn-primary py-2.5 text-xs flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <span>{hub.actionText}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Overview Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sources Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-primary-600" />
              <span>Recent Ingested Sources</span>
            </h3>
            <Link
              to={`/projects/${id}/sources`}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {sources.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              No sources ingested yet. Upload PDFs or add web links to enable AI RAG chat.
            </div>
          ) : (
            <div className="space-y-3">
              {sources.slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 text-xs"
                >
                  <div className="min-w-0 pr-3">
                    <p className="font-semibold text-gray-800 truncate">{s.title}</p>
                    <p className="text-gray-500 text-[11px]">
                      {s.authors || 'Unknown Authors'} • {s.chunk_count} semantic chunks
                    </p>
                  </div>
                  <span className="px-2 py-0.5 uppercase text-[10px] font-bold rounded bg-white border border-gray-200 text-gray-600 flex-shrink-0">
                    {s.source_type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Literature Syntheses Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Literature Synthesis Reports</span>
            </h3>
            <Link
              to={`/projects/${id}/synthesize`}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              No synthesis reports generated yet. Select 2 or more papers to generate a comparative literature matrix.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.slice(0, 4).map((r) => (
                <div
                  key={r.id}
                  onClick={() => navigate(`/projects/${id}/synthesize`)}
                  className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-xs cursor-pointer hover:bg-emerald-50/40 hover:border-emerald-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-800 truncate">{r.title}</p>
                    <span className="text-[11px] text-gray-400">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-500 text-[11px] mt-1 line-clamp-1">
                    {r.result?.theme || 'Comparative Analysis Matrix'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

