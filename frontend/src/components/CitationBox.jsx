import { useState } from 'react';
import { Copy, Check, Quote, Code } from 'lucide-react';

export default function CitationBox({ source }) {
  const [format, setFormat] = useState('apa'); // 'apa' | 'mla' | 'chicago' | 'bibtex'
  const [copied, setCopied] = useState(false);

  if (!source) return null;

  const authors = source.authors || 'Unknown Author';
  const year = source.publication_year ? `${source.publication_year}` : 'n.d.';
  const title = source.title || 'Untitled';
  const url = source.url || '';
  const key = (source.id ? source.id.substring(0, 8) : 'ref') + (source.publication_year || '24');

  const citations = {
    apa: `${authors}. (${year}). ${title}.${url ? ` Retrieved from ${url}` : ''}`,
    mla: `${authors}. "${title}." ${year ? `${year}.` : ''}${url ? ` ${url}.` : ''}`.trim(),
    chicago: `${authors}. "${title}." ${year}.${url ? ` ${url}.` : ''}`,
    bibtex: `@article{${key},
  author  = {${authors}},
  title   = {${title}},
  year    = {${year !== 'n.d.' ? year : ''}},
  ${url ? `url     = {${url}},` : ''}
  note    = {ResearchHub AI Repository}
}`,
  };

  const currentCitation = citations[format] || citations.apa;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCitation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      {/* Format Selector Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-3">
        <div className="flex items-center space-x-1">
          {['apa', 'mla', 'chicago', 'bibtex'].map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`px-2.5 py-1 text-xs font-semibold rounded uppercase transition-colors ${
                format === f
                  ? 'bg-primary-600 text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 text-xs font-medium text-gray-600 hover:text-primary-600 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-600" />
              <span className="text-green-600">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Citation</span>
            </>
          )}
        </button>
      </div>

      {/* Citation Text */}
      <div className="text-xs text-gray-800 leading-relaxed select-all">
        {format === 'bibtex' ? (
          <pre className="font-mono bg-white p-3 rounded border border-gray-200 overflow-x-auto whitespace-pre">
            {currentCitation}
          </pre>
        ) : (
          <p className="bg-white p-3 rounded border border-gray-200 italic font-serif">
            {currentCitation}
          </p>
        )}
      </div>
    </div>
  );
}

