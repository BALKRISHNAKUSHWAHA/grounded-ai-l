import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import {
  Send,
  Brain,
  User,
  Quote,
  Loader2,
  Copy,
  Check,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export default function ChatInterface({ projectId, projectTitle }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch chat history on mount
  useEffect(() => {
    let isMounted = true;
    setFetchingHistory(true);

    chatAPI
      .history(projectId)
      .then((res) => {
        if (isMounted) {
          setMessages(res.data.messages || []);
        }
      })
      .catch((err) => {
        console.error('Failed to load chat history:', err);
      })
      .finally(() => {
        if (isMounted) setFetchingHistory(false);
      });

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || loading) return;

    // Optimistically append user message
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: queryText,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatAPI.send(projectId, queryText);
      const aiMessage = res.data.message;

      // Replace or append with real AI response
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error querying RAG assistant:', err);
      const errorMsg = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${
          err.response?.data?.error || 'Failed to retrieve synthesis from Gemini. Please check if sources are ingested and API key is set.'
        }`,
        citations: [],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper to parse citations JSON if string
  const getCitationsList = (citations) => {
    if (!citations) return [];
    if (Array.isArray(citations)) return citations;
    try {
      return JSON.parse(citations);
    } catch {
      return [];
    }
  };

  const suggestedPrompts = [
    'Synthesize the core research objectives across the uploaded documents.',
    'What methodologies were utilized, and what are their primary limitations?',
    'Identify conflicting findings or contradictory evidence among the sources.',
    'Extract key quantitative findings and metrics reported in these studies.',
  ];

  return (
    <div className="flex flex-col h-[700px] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/70 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-primary-600 text-white flex items-center justify-center shadow-sm">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
              <span>RAG Research Assistant</span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-semibold bg-primary-100 text-primary-700 rounded-full">
                Gemini 2.5
              </span>
            </h3>
            <p className="text-xs text-gray-500">
              Strictly grounded answers with exact source & chunk attribution
            </p>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {fetchingHistory ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            <p className="text-sm">Loading research context & history...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto py-8">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4 shadow-sm">
              <Sparkles className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              Query Your Research Corpus
            </h4>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Ask deep questions across your ingested PDFs and notes. Gemini will cross-reference document chunks and provide verified evidence.
            </p>

            <div className="w-full space-y-2 text-left">
              <span className="text-xs font-semibold uppercase text-gray-400 tracking-wider">
                Suggested Prompts
              </span>
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary-400 hover:bg-primary-50/50 text-xs font-medium text-gray-700 transition-colors flex items-center justify-between group"
                >
                  <span className="line-clamp-1">{prompt}</span>
                  <Send className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const citationsList = getCitationsList(msg.citations);

            return (
              <div
                key={msg.id || idx}
                className={`flex items-start space-x-3 ${
                  isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white ${
                    isUser ? 'bg-gray-800' : 'bg-primary-600 shadow-sm shadow-primary-500/20'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                </div>

                {/* Message Body */}
                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-primary-600 text-white rounded-tr-none'
                      : 'bg-gray-50 border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  {/* Content */}
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Citation Badges (Assistant only) */}
                  {!isUser && citationsList.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-200/80">
                      <div className="flex items-center space-x-1.5 text-xs font-semibold text-gray-500 mb-2">
                        <Quote className="w-3.5 h-3.5 text-primary-600" />
                        <span>Source Attribution & Grounding:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {citationsList.map((cite, cIdx) => (
                          <span
                            key={cIdx}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-primary-200 text-primary-800 shadow-2xs"
                          >
                            <BookOpen className="w-3 h-3 text-primary-500" />
                            <span>{cite}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Copy Button & Timestamp */}
                  <div
                    className={`flex items-center justify-between text-[11px] mt-2 pt-1 ${
                      isUser ? 'text-primary-100' : 'text-gray-400'
                    }`}
                  >
                    <span>
                      {msg.created_at
                        ? new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </span>

                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.content, idx)}
                        className="flex items-center space-x-1 text-gray-400 hover:text-gray-700 transition-colors"
                        title="Copy text"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-green-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white shadow-sm">
              <Brain className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl rounded-tl-none p-4 text-sm text-gray-600 flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
              <span>Analyzing ingested chunks & synthesizing response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end space-x-3">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question across your research documents... (Press Enter to send)"
            className="flex-1 input-field resize-none text-sm leading-relaxed"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="btn-primary h-11 px-5 flex items-center justify-center space-x-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

