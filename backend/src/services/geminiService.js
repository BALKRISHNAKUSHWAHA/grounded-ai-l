import { GoogleGenAI } from '@google/genai';
import { GEMINI_API_KEY } from '../config/env.js';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * Perform a RAG query against provided context chunks.
 * @param {{ sourceTitle: string, chunkIndex: number, content: string }[]} contextChunks
 * @param {string} userQuery
 * @returns {Promise<{ answer: string, citations: string[] }>}
 */
export async function ragQuery(contextChunks, userQuery) {
  const formattedContext = contextChunks
    .map(
      (chunk) =>
        `[Source: "${chunk.sourceTitle}", Chunk #${chunk.chunkIndex}]\n${chunk.content}`
    )
    .join('\n\n---\n\n');

  const prompt = `You are an expert Research Scientist and Academic Synthesis Assistant integrated into ResearchHub AI. Your goal is to help researchers analyze sources objectively, synthesize literature rigorously, and provide evidence-based answers strictly grounded in the provided document chunks. Always cite your sources using exact document titles and chunk references. Never invent facts or citations.

Context from ingested research papers:
${formattedContext}

User Query: ${userQuery}

Instructions: Answer the query based ONLY on the provided context. Include source citations in the format [Source Title, Chunk #N]. If the answer cannot be found in the context, state "Information not available in current sources."`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const answerText = response.text;

  // Extract citations from the response text using the [Source Title, Chunk #N] pattern
  const citationRegex = /\[([^\],]+),\s*Chunk\s*#(\d+)\]/g;
  const citations = [];
  let match;
  while ((match = citationRegex.exec(answerText)) !== null) {
    const citation = `${match[1]}, Chunk #${match[2]}`;
    if (!citations.includes(citation)) {
      citations.push(citation);
    }
  }

  return { answer: answerText, citations };
}

/**
 * Synthesize literature from multiple sources.
 * @param {{ title: string, content: string, authors?: string, publication_year?: number }[]} sourcesData
 * @returns {Promise<object>}
 */
export async function synthesizeLiterature(sourcesData) {
  const formattedSources = sourcesData
    .map(
      (s, i) =>
        `Source ${i + 1}: "${s.title}"${s.authors ? ` by ${s.authors}` : ''}${s.publication_year ? ` (${s.publication_year})` : ''}\nContent:\n${s.content}`
    )
    .join('\n\n---\n\n');

  const prompt = `You are an expert academic literature synthesis assistant. Analyze the following research sources and produce a comprehensive literature synthesis.

Sources:
${formattedSources}

Produce a JSON response with EXACTLY this schema (no markdown fences, just raw JSON):
{
  "theme": "The overarching theme or topic connecting these sources",
  "summary": "A comprehensive narrative synthesis of the literature",
  "comparison_matrix": [
    {
      "source_title": "Title of the source",
      "research_objective": "The main research objective",
      "methodology": "Methodology used",
      "key_findings": "Key findings",
      "limitations": "Limitations noted"
    }
  ],
  "research_gaps": ["Gap 1", "Gap 2"],
  "future_directions": ["Direction 1", "Direction 2"]
}

Respond ONLY with valid JSON. No markdown code fences. No explanation outside the JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const responseText = response.text.trim();

  // Try to parse the JSON response, stripping markdown fences if present
  let jsonStr = responseText;
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  }

  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    // If parsing fails, return a structured fallback
    return {
      theme: 'Synthesis result',
      summary: responseText,
      comparison_matrix: [],
      research_gaps: [],
      future_directions: [],
    };
  }
}

/**
 * Generate a concise academic summary of the given text.
 * @param {string} text
 * @returns {Promise<string>}
 */
export async function generateSummary(text) {
  const prompt = `You are an expert academic summarization assistant. Provide a concise, well-structured academic summary of the following text. Focus on the key arguments, methodology, findings, and conclusions. Write in an objective academic tone.

Text:
${text}

Provide only the summary, without any preamble.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
}
