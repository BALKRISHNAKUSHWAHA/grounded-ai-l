import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Layers,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Trash2,
  Calendar,
} from 'lucide-react';

const domainColorMap = {
  'Computer Science & AI': {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    indicator: 'bg-blue-600',
  },
  'Biomedical & Life Sciences': {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    indicator: 'bg-emerald-600',
  },
  'Social Sciences & Economics': {
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    indicator: 'bg-purple-600',
  },
  'Physical Sciences & Engineering': {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    indicator: 'bg-amber-600',
  },
  'General & Interdisciplinary': {
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    indicator: 'bg-slate-600',
  },
};

export default function ProjectCard({ project, onDelete }) {
  const navigate = useNavigate();

  const domainStyle =
    domainColorMap[project.domain] || {
      badge: 'bg-primary-50 text-primary-700 border-primary-200',
      indicator: 'bg-primary-600',
    };

  const formattedDate = project.created_at
    ? new Date(project.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${project.title}"? This cannot be undone.`)) {
      onDelete(project.id);
    }
  };

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="group bg-white rounded-xl border border-gray-200 hover:border-primary-300 shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between cursor-pointer relative overflow-hidden"
    >
      {/* Top domain indicator bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${domainStyle.indicator}`} />

      <div>
        {/* Domain Badge & Created Date */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${domainStyle.badge}`}
          >
            {project.domain}
          </span>
          <div className="flex items-center text-xs text-gray-400 space-x-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1 mb-2">
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
          {project.description || 'No description provided for this research repository.'}
        </p>
      </div>

      <div>
        {/* Aggregate Stats */}
        <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-gray-50 rounded-lg border border-gray-100 mb-4 text-center">
          <div>
            <div className="flex items-center justify-center text-xs text-gray-500 mb-0.5 space-x-1">
              <FileText className="w-3.5 h-3.5 text-gray-400" />
              <span>Sources</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">
              {project.source_count ?? 0}
            </span>
          </div>
          <div className="border-x border-gray-200">
            <div className="flex items-center justify-center text-xs text-gray-500 mb-0.5 space-x-1">
              <Layers className="w-3.5 h-3.5 text-gray-400" />
              <span>Chunks</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">
              {project.chunk_count ?? 0}
            </span>
          </div>
          <div>
            <div className="flex items-center justify-center text-xs text-gray-500 mb-0.5 space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-gray-400" />
              <span>Syntheses</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">
              {project.synthesis_count ?? 0}
            </span>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete project"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <span className="inline-flex items-center text-sm font-medium text-primary-600 group-hover:text-primary-700 space-x-1">
            <span>Workspace</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </div>
  );
}

