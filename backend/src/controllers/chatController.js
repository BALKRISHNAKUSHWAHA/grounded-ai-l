import { query } from '../config/db.js';
import { ragQuery } from '../services/geminiService.js';

async function verifyProjectOwnership(projectId, userId) {
  const result = await query(
    'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  );
  return result.rows.length > 0;
}

/**
 * Send a chat query to the Gemini RAG engine for a specific project.
 */
export async function sendMessage(req, res) {
  try {
    const { id: projectId } = req.params;
    const { message: userMessage } = req.validatedBody;

    const isOwner = await verifyProjectOwnership(projectId, req.user.id);
    if (!isOwner) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // 1. Save user message to database
    await query(
      `INSERT INTO chat_messages (project_id, role, content) VALUES ($1, 'user', $2)`,
      [projectId, userMessage]
    );

    // 2. Retrieve relevant document chunks for the project
    const chunksResult = await query(
      `SELECT dc.content, dc.chunk_index, s.title AS source_title
       FROM document_chunks dc
       JOIN sources s ON dc.source_id = s.id
       WHERE s.project_id = $1
       ORDER BY s.created_at DESC, dc.chunk_index ASC
       LIMIT 60`,
      [projectId]
    );

    let answer = '';
    let citations = [];

    if (chunksResult.rows.length === 0) {
      answer = 'No sources have been ingested into this project yet. Please upload a research paper, text, or URL in the Sources tab so I can provide evidence-based answers with source citations.';
      citations = [];
    } else {
      const contextChunks = chunksResult.rows.map((row) => ({
        sourceTitle: row.source_title,
        chunkIndex: row.chunk_index,
        content: row.content,
      }));

      const ragResult = await ragQuery(contextChunks, userMessage);
      answer = ragResult.answer;
      citations = ragResult.citations || [];
    }

    // 3. Save assistant response to database
    const assistantMsgResult = await query(
      `INSERT INTO chat_messages (project_id, role, content, citations)
       VALUES ($1, 'assistant', $2, $3) RETURNING id, role, content, citations, created_at`,
      [projectId, answer, JSON.stringify(citations)]
    );

    return res.status(200).json({
      message: assistantMsgResult.rows[0],
    });
  } catch (err) {
    console.error('sendMessage error:', err);
    return res.status(500).json({ error: 'Internal server error processing research query.' });
  }
}

/**
 * Get chat history for a project.
 */
export async function getHistory(req, res) {
  try {
    const { id: projectId } = req.params;

    const isOwner = await verifyProjectOwnership(projectId, req.user.id);
    if (!isOwner) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const result = await query(
      `SELECT id, role, content, citations, created_at
       FROM chat_messages
       WHERE project_id = $1
       ORDER BY created_at ASC`,
      [projectId]
    );

    return res.status(200).json({ messages: result.rows });
  } catch (err) {
    console.error('getHistory error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

