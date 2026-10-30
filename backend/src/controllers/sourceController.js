import { query } from '../config/db.js';
import { extractTextFromPdf, chunkText } from '../services/chunkerService.js';

/**
 * Helper to check project ownership.
 */
async function verifyProjectOwnership(projectId, userId) {
  const result = await query(
    'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  );
  return result.rows.length > 0;
}

/**
 * Add a source (PDF upload, Raw Text, or URL) to a project.
 */
export async function addSource(req, res) {
  try {
    const { id: projectId } = req.params;
    const isOwner = await verifyProjectOwnership(projectId, req.user.id);
    if (!isOwner) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    let title = '';
    let sourceType = 'text';
    let rawContent = '';
    let url = null;
    let authors = null;
    let publicationYear = null;
    let fileName = null;
    let fileSize = null;

    if (req.file) {
      // PDF File Upload
      sourceType = 'pdf';
      fileName = req.file.originalname;
      fileSize = req.file.size;
      title = req.body.title || req.file.originalname.replace(/\.[^/.]+$/, '');
      authors = req.body.authors || null;
      publicationYear = req.body.publication_year ? parseInt(req.body.publication_year, 10) : null;

      try {
        rawContent = await extractTextFromPdf(req.file.buffer);
      } catch (pdfErr) {
        return res.status(400).json({ error: `PDF extraction failed: ${pdfErr.message}` });
      }

      if (!rawContent || rawContent.trim().length === 0) {
        return res.status(400).json({ error: 'Extracted PDF text is empty or unreadable.' });
      }
    } else if (req.body.url) {
      // URL source
      sourceType = 'url';
      title = req.body.title || req.body.url;
      url = req.body.url;
      authors = req.body.authors || null;
      publicationYear = req.body.publication_year ? parseInt(req.body.publication_year, 10) : null;
      rawContent = req.body.content || `Source URL: ${url}\nReference Document Title: ${title}`;
    } else if (req.body.content) {
      // Raw Text source
      sourceType = 'text';
      title = req.body.title || 'Untitled Document';
      rawContent = req.body.content;
      authors = req.body.authors || null;
      publicationYear = req.body.publication_year ? parseInt(req.body.publication_year, 10) : null;
    } else {
      return res.status(400).json({ error: 'No content, file, or URL provided.' });
    }

    // Insert source record
    const sourceResult = await query(
      `INSERT INTO sources (
        project_id, title, source_type, raw_content, url, authors, publication_year, file_name, file_size
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [projectId, title, sourceType, rawContent, url, authors, publicationYear, fileName, fileSize]
    );

    const source = sourceResult.rows[0];

    // Chunk the content and insert document chunks
    const chunks = chunkText(rawContent, 1000, 200);
    const insertedChunks = [];

    for (const chunk of chunks) {
      const chunkResult = await query(
        `INSERT INTO document_chunks (source_id, content, chunk_index, token_count)
         VALUES ($1, $2, $3, $4) RETURNING id, chunk_index, token_count`,
        [source.id, chunk.content, chunk.chunkIndex, chunk.tokenCount]
      );
      insertedChunks.push(chunkResult.rows[0]);
    }

    return res.status(201).json({
      source: {
        ...source,
        chunk_count: insertedChunks.length,
      },
    });
  } catch (err) {
    console.error('addSource error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * List all sources for a project with chunk counts.
 */
export async function listSources(req, res) {
  try {
    const { id: projectId } = req.params;
    const isOwner = await verifyProjectOwnership(projectId, req.user.id);
    if (!isOwner) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const result = await query(
      `SELECT
        s.id, s.project_id, s.title, s.source_type, s.url, s.authors, s.publication_year,
        s.file_name, s.file_size, s.created_at,
        COUNT(dc.id)::int AS chunk_count
      FROM sources s
      LEFT JOIN document_chunks dc ON dc.source_id = s.id
      WHERE s.project_id = $1
      GROUP BY s.id
      ORDER BY s.created_at DESC`,
      [projectId]
    );

    return res.status(200).json({ sources: result.rows });
  } catch (err) {
    console.error('listSources error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Get a single source with its chunks.
 */
export async function getSource(req, res) {
  try {
    const { id: projectId, sourceId } = req.params;
    const isOwner = await verifyProjectOwnership(projectId, req.user.id);
    if (!isOwner) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const sourceResult = await query(
      `SELECT * FROM sources WHERE id = $1 AND project_id = $2`,
      [sourceId, projectId]
    );

    if (sourceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Source not found.' });
    }

    const chunksResult = await query(
      `SELECT id, chunk_index, token_count, content, created_at
       FROM document_chunks WHERE source_id = $1 ORDER BY chunk_index ASC`,
      [sourceId]
    );

    return res.status(200).json({
      source: {
        ...sourceResult.rows[0],
        chunks: chunksResult.rows,
      },
    });
  } catch (err) {
    console.error('getSource error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Delete a source and cascaded chunks.
 */
export async function deleteSource(req, res) {
  try {
    const { id: projectId, sourceId } = req.params;
    const isOwner = await verifyProjectOwnership(projectId, req.user.id);
    if (!isOwner) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const result = await query(
      `DELETE FROM sources WHERE id = $1 AND project_id = $2 RETURNING id`,
      [sourceId, projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Source not found.' });
    }

    return res.status(200).json({ message: 'Source deleted successfully.' });
  } catch (err) {
    console.error('deleteSource error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

