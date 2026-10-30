import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectsAPI } from '../services/api';
import ProjectCard from '../components/ProjectCard';
import {
  FolderPlus,
  Search,
  BookOpen,
  FileText,
  Layers,
  Sparkles,
  Loader2,
  AlertCircle,
  X,
  Filter,
} from 'lucide-react';

const DOMAIN_OPTIONS = [
  'Computer Science & AI',
  'Biomedical & Life Sciences',
  'Social Sciences & Economics',
  'Physical Sciences & Engineering',
  'General & Interdisciplinary',
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('All');

  // Create Project Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    domain: DOMAIN_OPTIONS[0],
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await projectsAPI.list();
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load research projects. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (createForm.title.trim().length < 3) {
      setCreateError('Project title must be at least 3 characters long.');
      return;
    }

    setCreating(true);

    try {
      const res = await projectsAPI.create(createForm);
      setProjects((prev) => [res.data.project, ...prev]);
      setIsModalOpen(false);
      setCreateForm({
        title: '',
        description: '',
        domain: DOMAIN_OPTIONS[0],
      });
    } catch (err) {
      console.error(err);
      setCreateError(err.response?.data?.error || 'Failed to create research project.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await projectsAPI.delete(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete project. Please try again.');
    }
  };

  // Aggregated Stats
  const totalSources = projects.reduce((acc, p) => acc + (p.source_count || 0), 0);
  const totalChunks = projects.reduce((acc, p) => acc + (p.chunk_count || 0), 0);
  const totalSyntheses = projects.reduce((acc, p) => acc + (p.synthesis_count || 0), 0);

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDomain = domainFilter === 'All' || p.domain === domainFilter;
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {user?.full_name || 'Researcher'}
            </h1>
            <p className="mt-1.5 text-primary-200 text-sm max-w-xl">
              Manage your academic repositories, ingest multi-source literature, and synthesize findings with Google Gemini RAG.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="self-start md:self-center px-5 py-2.5 bg-white text-primary-900 hover:bg-primary-50 font-bold rounded-xl shadow-sm hover:shadow transition-all text-sm flex items-center space-x-2 flex-shrink-0"
          >
            <FolderPlus className="w-4 h-4 text-primary-600" />
            <span>New Research Project</span>
          </button>
        </div>

        {/* Aggregate Stats Cards inside Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-primary-700/60 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-200" />
            </div>
            <div>
              <div className="text-xl font-bold">{projects.length}</div>
              <div className="text-xs text-primary-200">Active Projects</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-200" />
            </div>
            <div>
              <div className="text-xl font-bold">{totalSources}</div>
              <div className="text-xs text-primary-200">Ingested Sources</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-primary-200" />
            </div>
            <div>
              <div className="text-xl font-bold">{totalChunks}</div>
              <div className="text-xs text-primary-200">RAG Chunks</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-200" />
            </div>
            <div>
              <div className="text-xl font-bold">{totalSyntheses}</div>
              <div className="text-xs text-primary-200">Syntheses Run</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title or keywords..."
            className="input-field pl-10 text-sm py-2"
          />
        </div>

        {/* Domain Filter Dropdown */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">Domain:</span>
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="input-field text-xs py-2 w-full sm:w-56"
          >
            <option value="All">All Domains</option>
            {DOMAIN_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid or States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-sm font-medium">Loading research repositories...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span>{error}</span>
          </div>
          <button onClick={fetchProjects} className="btn-secondary text-xs">
            Retry
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 p-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {searchQuery || domainFilter !== 'All'
              ? 'No matching research projects found'
              : 'No research projects yet'}
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            {searchQuery || domainFilter !== 'All'
              ? 'Try adjusting your search terms or clearing domain filters.'
              : 'Create your first project repository to begin uploading papers, querying citations, and synthesizing literature.'}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary text-sm inline-flex items-center space-x-2"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create Research Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900">New Research Project</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="e.g. Quantum Computing in Drug Discovery"
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Research Domain *
                </label>
                <select
                  value={createForm.domain}
                  onChange={(e) => setCreateForm({ ...createForm, domain: e.target.value })}
                  className="input-field text-sm"
                >
                  {DOMAIN_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Description & Scope
                </label>
                <textarea
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Outline the objectives, research questions, or experimental hypotheses..."
                  className="input-field text-sm"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary text-xs flex items-center space-x-1.5"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Repository...</span>
                    </>
                  ) : (
                    <span>Create Project</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

