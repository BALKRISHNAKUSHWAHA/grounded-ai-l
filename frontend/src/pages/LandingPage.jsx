import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Brain,
  Sparkles,
  UploadCloud,
  MessageSquare,
  Table,
  Quote,
  Download,
  Share2,
  CheckCircle2,
  ArrowRight,
  Shield,
  Layers,
  Cpu,
  Dna,
  TrendingUp,
  Atom,
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  const ctaLink = user ? '/dashboard' : '/register';

  const features = [
    {
      icon: UploadCloud,
      title: 'Multi-Source Ingestion Engine',
      description:
        'Upload academic PDFs, paste field notes, or link web URLs. Automated PDF text parsing and semantic chunking with overlapping windows.',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      icon: Brain,
      title: 'Grounded RAG Assistant',
      description:
        'Context-aware chat powered by Google Gemini 2.5. Answers are strictly grounded in your ingested documents with exact title and chunk badges.',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      icon: Table,
      title: 'Literature Synthesizer',
      description:
        'Automatically generate structured comparative matrices across papers—comparing Research Objectives, Methodologies, Findings, and Limitations.',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      icon: Share2,
      title: 'Thematic Gaps & Directions',
      description:
        'Extract unaddressed research gaps, conflicting evidence, and open questions across diverse study cohorts.',
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      icon: Quote,
      title: 'Instant Citation Hub',
      description:
        'Generate publication-ready citations in APA 7th, MLA 9th, Chicago 17th, and formatted BibTeX with one click.',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      icon: Download,
      title: 'Multi-Format Export Hub',
      description:
        'Export complete literature synthesis reports as clean GitHub Flavored Markdown, formatted JSON datasets, or BibTeX bibliographies.',
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
  ];

  const domains = [
    {
      name: 'Computer Science & AI',
      desc: 'Machine Learning, Distributed Systems, Cryptography & Network Security',
      icon: Cpu,
      color: 'border-blue-200 bg-blue-50/50 text-blue-900',
    },
    {
      name: 'Biomedical & Life Sciences',
      desc: 'Clinical Trials, Genomics, Pharmacology & Computational Biology',
      icon: Dna,
      color: 'border-emerald-200 bg-emerald-50/50 text-emerald-900',
    },
    {
      name: 'Social Sciences & Economics',
      desc: 'Macroeconomics, Public Policy, Behavioral Economics & Sociology',
      icon: TrendingUp,
      color: 'border-purple-200 bg-purple-50/50 text-purple-900',
    },
    {
      name: 'Physical Sciences & Engineering',
      desc: 'Materials Science, Renewable Energy, Quantum Mechanics & Nanotechnology',
      icon: Atom,
      color: 'border-amber-200 bg-amber-50/50 text-amber-900',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-28 lg:pb-32 bg-gradient-to-b from-primary-50/60 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary-100/80 text-primary-800 border border-primary-200 shadow-2xs mb-8">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <span>Powered by Google Gemini 2.5 Flash & Semantic RAG</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Accelerate Academic & Professional{' '}
            <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
              Literature Discovery
            </span>{' '}
            by 10x
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Ingest research papers, query multi-source documents with strictly grounded citations, synthesize comparative literature matrices, and generate publication-ready bibliographies.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={ctaLink}
              className="w-full sm:w-auto px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl flex items-center justify-center space-x-2 text-base"
            >
              <span>{user ? 'Go to Research Workspace' : 'Start Researching Free'}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border border-gray-300 shadow-xs transition-all flex items-center justify-center text-base"
            >
              Explore Capabilities
            </a>
          </div>

          {/* Trust Metrics */}
          <div className="mt-16 pt-10 border-t border-gray-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-primary-600">100%</div>
              <div className="text-xs text-gray-500 mt-1">Grounded Source Attribution</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-primary-600">10x</div>
              <div className="text-xs text-gray-500 mt-1">Faster Literature Synthesis</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-primary-600">4 Formats</div>
              <div className="text-xs text-gray-500 mt-1">APA, MLA, Chicago, BibTeX</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-primary-600">Zero</div>
              <div className="text-xs text-gray-500 mt-1">Client Key Exposure (Secure)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 border-y border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">
              End-to-End Workflow
            </h2>
            <p className="text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl">
              Engineered for Rigorous Scientific Discovery
            </p>
            <p className="mt-4 text-base text-gray-600">
              Eliminate manual synthesis bottlenecks without sacrificing academic integrity or evidence verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-6 ${feature.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">
              Three-Step Protocol
            </h2>
            <p className="text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl">
              From Raw Ingestion to Publication Ready
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="w-10 h-10 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                1
              </div>
              <h4 className="text-base font-bold text-gray-900 mb-2">
                Ingest Research Papers & Notes
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Drag and drop PDF articles, enter preprint DOIs/URLs, or paste field observations. The system extracts text and creates indexed token chunks.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="w-10 h-10 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                2
              </div>
              <h4 className="text-base font-bold text-gray-900 mb-2">
                Query & Synthesize with Gemini
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Chat with the RAG assistant to interrogate papers with strict source citations, or run the literature synthesizer to construct comparative matrices.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="w-10 h-10 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                3
              </div>
              <h4 className="text-base font-bold text-gray-900 mb-2">
                Export Reports & Citations
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Download structured Markdown reports with comparison tables, export JSON datasets for data pipelines, or copy instant BibTeX entries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Domains */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">
              Academic & Professional Domains
            </h2>
            <p className="text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl">
              Specialized for Every Discipline
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {domains.map((dom, i) => {
              const Icon = dom.icon;
              return (
                <div key={i} className={`p-6 rounded-2xl border ${dom.color} bg-white shadow-2xs`}>
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-800 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-gray-900 mb-1">{dom.name}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{dom.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 bg-primary-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Accelerate Your Literature Review?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-primary-200 max-w-2xl mx-auto">
            Join researchers and academics discovering insights faster with zero hallucinated references.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to={ctaLink}
              className="px-8 py-3.5 bg-white text-primary-900 hover:bg-primary-50 font-bold rounded-xl shadow-lg transition-all text-sm flex items-center space-x-2"
            >
              <span>{user ? 'Open Research Dashboard' : 'Create Free Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-10 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-primary-500" />
            <span className="font-semibold text-gray-200">ResearchHub AI</span>
            <span>— The AI for Research & Knowledge Discovery Platform</span>
          </div>
          <div className="text-gray-500">
            Powered by Google Gemini & PostgreSQL Vector Semantic Chunking.
          </div>
        </div>
      </footer>
    </div>
  );
}

