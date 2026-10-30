import { useState } from 'react';
import { X, Download, Copy, Check, FileText } from 'lucide-react';

export default function ExportModal({ isOpen, onClose, content, filename, format }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const mimeTypes = {
      markdown: 'text/markdown;charset=utf-8',
      json: 'application/json;charset=utf-8',
      bibtex: 'application/x-bibtex;charset=utf-8',
    };

    const blob = new Blob([content || ''], {
      type: mimeTypes[format] || 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `researchhub-export.${format === 'markdown' ? 'md' : format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">{filename || 'Export Preview'}</h3>
              <span className="text-[11px] uppercase font-semibold text-primary-600">
                {format} Document
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Preview */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-900 font-mono text-xs text-gray-100 select-all leading-relaxed whitespace-pre-wrap">
          {content || 'No content generated.'}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="btn-secondary text-xs flex items-center space-x-1.5"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Content</span>
              </>
            )}
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="btn-primary text-xs flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

