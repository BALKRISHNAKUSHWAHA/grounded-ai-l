import pdfParse from 'pdf-parse';

/**
 * Extract text content from a PDF buffer.
 * @param {Buffer} buffer - The PDF file buffer.
 * @returns {Promise<string>} - Extracted text.
 */
export async function extractTextFromPdf(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (err) {
    throw new Error(`Failed to extract text from PDF: ${err.message}`);
  }
}

/**
 * Estimate token count by splitting on whitespace.
 * @param {string} text
 * @returns {number}
 */
export function estimateTokenCount(text) {
  if (!text || text.length === 0) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Split text into overlapping chunks by sentence boundaries.
 * @param {string} text - The text to chunk.
 * @param {number} maxChunkSize - Max tokens per chunk (default 1000).
 * @param {number} overlap - Number of overlap tokens (default 200).
 * @returns {{ content: string, tokenCount: number, chunkIndex: number }[]}
 */
export function chunkText(text, maxChunkSize = 1000, overlap = 200) {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Split text into sentences using common sentence-ending punctuation
  const sentences = text.match(/[^.!?]+[.!?]+[\s]*/g) || [text];

  const chunks = [];
  let currentChunkSentences = [];
  let currentTokenCount = 0;
  let chunkIndex = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    if (!sentence) continue;

    const sentenceTokens = estimateTokenCount(sentence);

    // If adding this sentence exceeds the max, finalize current chunk
    if (currentTokenCount + sentenceTokens > maxChunkSize && currentChunkSentences.length > 0) {
      const content = currentChunkSentences.join(' ');
      chunks.push({
        content,
        tokenCount: estimateTokenCount(content),
        chunkIndex,
      });
      chunkIndex++;

      // Determine overlap: walk backwards from end of current sentences to get ~overlap tokens
      let overlapSentences = [];
      let overlapTokens = 0;
      for (let j = currentChunkSentences.length - 1; j >= 0; j--) {
        const sTokens = estimateTokenCount(currentChunkSentences[j]);
        if (overlapTokens + sTokens > overlap) break;
        overlapSentences.unshift(currentChunkSentences[j]);
        overlapTokens += sTokens;
      }

      currentChunkSentences = [...overlapSentences];
      currentTokenCount = overlapTokens;
    }

    currentChunkSentences.push(sentence);
    currentTokenCount += sentenceTokens;
  }

  // Push the last remaining chunk
  if (currentChunkSentences.length > 0) {
    const content = currentChunkSentences.join(' ');
    chunks.push({
      content,
      tokenCount: estimateTokenCount(content),
      chunkIndex,
    });
  }

  return chunks;
}
