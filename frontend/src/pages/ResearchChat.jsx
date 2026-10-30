import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import ChatInterface from '../components/ChatInterface';
import { ArrowLeft, Brain, ShieldCheck, Sparkles, BookOpen, Layers } from 'lucide-react';

export default function ResearchChat() {
  const { id } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    projectsAPI
      .get(id)
      .then((res) => setProject(res.data.project))
      .catch((err) => console.error(err));
  }, [id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary-50 text-primary-700 border border-primary-200">
              {project?.domain || 'Research Domain'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            AI Research Assistant (RAG Chat)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Grounded academic queries over{' '}
            <span className="font-semibold text-gray-800">{project?.title || 'this project'}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs text-gray-600 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-200 self-start sm:self-center">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span>Strict Citation Grounding Enabled</span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <ChatInterface projectId={id} projectTitle={project?.title} />
        </div>

        {/* Sidebar Information */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span>How RAG Works</span>
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              When you ask a question, the assistant retrieves relevant token chunks from your ingested sources and prompts Google Gemini 2.5 with explicit instructions:
            </p>
            <ul className="text-xs text-gray-600 space-y-2 border-t border-gray-100 pt-3">
              <li className="flex items-start space-x-2">
                <BookOpen className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Answers are drawn ONLY from your uploaded papers and documents.</span>
              </li>
              <li className="flex items-start space-x-2">
                <Layers className="w-3.5 h-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
                <span>Every claim is referenced with exact document title and chunk index badges.</span>
              </li>
              <li className="flex items-start space-x-2">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Zero hallucination policy: If facts are not present, Gemini will state it clearly.</span>
              </li>
            </ul>
          </div>

          <div className="bg-primary-50/50 rounded-xl border border-primary-200/60 p-5 text-xs text-primary-900 leading-relaxed">
            <span className="font-bold block mb-1">Tip for researchers:</span>
            Try asking comparative questions like "What are the common limitations reported in these methodologies?" or "Identify any conflicting results between the authors."
          </div>
        </div>
      </div>
    </div>
  );
}

