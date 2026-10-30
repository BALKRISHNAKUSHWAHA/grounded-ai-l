import { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Target,
  Wrench,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  Table as TableIcon,
} from 'lucide-react';

export default function SynthesisMatrix({ report }) {
  const [copied, setCopied] = useState(false);

  if (!report || !report.result) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
        No synthesis data available.
      </div>
    );
  }

  // Parse result if it's a JSON string
  const data = typeof report.result === 'string' ? JSON.parse(report.result) : report.result;

  const handleCopyMarkdown = () => {
    let md = `# Synthesis: ${report.title}\n\n`;
    if (data.theme) md += `**Theme**: ${data.theme}\n\n`;
    if (data.summary) md += `## Summary\n${data.summary}\n\n`;

    if (Array.isArray(data.comparison_matrix) && data.comparison_matrix.length > 0) {
      md += `## Comparative Literature Matrix\n\n`;
      md += `| Source | Objective | Methodology | Key Findings | Limitations |\n`;
      md += `| :--- | :--- | :--- | :--- | :--- |\n`;
      data.comparison_matrix.forEach((row) => {
        const clean = (val) => (val || 'N/A').replace(/\|/g, '\\|').replace(/\n/g, ' ');
        md += `| ${clean(row.source_title)} | ${clean(row.research_objective)} | ${clean(row.methodology)} | ${clean(row.key_findings)} | ${clean(row.limitations)} |\n`;
      });
      md += `\n`;
    }

    if (Array.isArray(data.research_gaps) && data.research_gaps.length > 0) {
      md += `## Research Gaps\n`;
      data.research_gaps.forEach((gap) => (md += `- ${gap}\n`));
      md += `\n`;
    }

    if (Array.isArray(data.future_directions) && data.future_directions.length > 0) {
      md += `## Future Directions\n`;
      data.future_directions.forEach((dir) => (md += `- ${dir}\n`));
      md += `\n`;
    }

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title & Theme Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-primary-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Comparative Literature Synthesis</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{report.title}</h2>
          </div>

          <button
            onClick={handleCopyMarkdown}
            className="btn-secondary text-xs flex items-center space-x-1.5 self-start md:self-center"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Copied Markdown</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy as Markdown</span>
              </>
            )}
          </button>
        </div>

        {data.theme && (
          <div className="bg-primary-50/60 border border-primary-200/60 rounded-lg p-3 text-sm text-primary-900 flex items-center space-x-2">
            <span className="font-semibold text-primary-800">Synthesized Theme:</span>
            <span>{data.theme}</span>
          </div>
        )}

        {data.summary && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Executive Narrative Synthesis
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50/60 p-4 rounded-lg border border-gray-100">
              {data.summary}
            </p>
          </div>
        )}
      </div>

      {/* Comparison Matrix Table */}
      {Array.isArray(data.comparison_matrix) && data.comparison_matrix.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/70 flex items-center space-x-2">
            <TableIcon className="w-5 h-5 text-primary-600" />
            <h3 className="text-sm font-bold text-gray-900">
              Multi-Paper Comparison Matrix
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-100/80 text-gray-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-5 py-3.5 min-w-[180px]">
                    <div className="flex items-center space-x-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-gray-500" />
                      <span>Source Title</span>
                    </div>
                  </th>
                  <th scope="col" className="px-5 py-3.5 min-w-[200px]">
                    <div className="flex items-center space-x-1.5">
                      <Target className="w-3.5 h-3.5 text-blue-500" />
                      <span>Research Objective</span>
                    </div>
                  </th>
                  <th scope="col" className="px-5 py-3.5 min-w-[180px]">
                    <div className="flex items-center space-x-1.5">
                      <Wrench className="w-3.5 h-3.5 text-amber-500" />
                      <span>Methodology</span>
                    </div>
                  </th>
                  <th scope="col" className="px-5 py-3.5 min-w-[220px]">
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      <span>Key Findings</span>
                    </div>
                  </th>
                  <th scope="col" className="px-5 py-3.5 min-w-[180px]">
                    <div className="flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      <span>Limitations</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.comparison_matrix.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50 hover:bg-gray-50'}>
                    <td className="px-5 py-4 font-bold text-gray-900 align-top">
                      {row.source_title || 'Untitled Source'}
                    </td>
                    <td className="px-5 py-4 text-gray-700 leading-relaxed align-top">
                      {row.research_objective || 'N/A'}
                    </td>
                    <td className="px-5 py-4 text-gray-700 leading-relaxed align-top">
                      <span className="inline-block bg-gray-100 rounded px-2 py-0.5 text-[11px] font-mono text-gray-800">
                        {row.methodology || 'N/A'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-700 leading-relaxed align-top">
                      {row.key_findings || 'N/A'}
                    </td>
                    <td className="px-5 py-4 text-gray-600 leading-relaxed align-top italic">
                      {row.limitations || 'None reported'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Research Gaps & Future Directions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Research Gaps */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center space-x-2 text-amber-700 mb-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
              Identified Research Gaps
            </h3>
          </div>
          {Array.isArray(data.research_gaps) && data.research_gaps.length > 0 ? (
            <ul className="space-y-2.5">
              {data.research_gaps.map((gap, i) => (
                <li
                  key={i}
                  className="flex items-start space-x-2 text-xs text-gray-700 bg-amber-50/40 p-3 rounded-lg border border-amber-100"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{gap}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-500 italic">No significant research gaps identified.</p>
          )}
        </div>

        {/* Future Directions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center space-x-2 text-emerald-700 mb-3">
            <Lightbulb className="w-5 h-5 flex-shrink-0" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
              Future Directions & Open Questions
            </h3>
          </div>
          {Array.isArray(data.future_directions) && data.future_directions.length > 0 ? (
            <ul className="space-y-2.5">
              {data.future_directions.map((dir, i) => (
                <li
                  key={i}
                  className="flex items-start space-x-2 text-xs text-gray-700 bg-emerald-50/40 p-3 rounded-lg border border-emerald-100"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{dir}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-500 italic">No specific future directions listed.</p>
          )}
        </div>
      </div>
    </div>
  );
}

