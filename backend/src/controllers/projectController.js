import { query } from '../config/db.js';

/**
 * List all projects for the authenticated user, with aggregate counts.
 */
export async function listProjects(req, res) {
  try {
    const result = await query(
      `SELECT
        p.id, p.title, p.description, p.domain, p.created_at, p.updated_at,
        COALESCE(src.source_count, 0)::int AS source_count,
        COALESCE(chk.chunk_count, 0)::int AS chunk_count,
        COALESCE(msg.message_count, 0)::int AS message_count,
        COALESCE(syn.synthesis_count, 0)::int AS synthesis_count
      FROM projects p
      LEFT JOIN (
        SELECT project_id, COUNT(*)::int AS source_count FROM sources GROUP BY project_id
      ) src ON src.project_id = p.id
      LEFT JOIN (
        SELECT s.project_id, COUNT(dc.id)::int AS chunk_count
        FROM document_chunks dc JOIN sources s ON dc.source_id = s.id
        GROUP BY s.project_id
      ) chk ON chk.project_id = p.id
      LEFT JOIN (
        SELECT project_id, COUNT(*)::int AS message_count FROM chat_messages GROUP BY project_id
      ) msg ON msg.project_id = p.id
      LEFT JOIN (
        SELECT project_id, COUNT(*)::int AS synthesis_count FROM synthesis_reports GROUP BY project_id
      ) syn ON syn.project_id = p.id
      WHERE p.user_id = $1
      ORDER BY p.updated_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({ projects: result.rows });
  } catch (err) {
    console.error('listProjects error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Create a new project.
 */
export async function createProject(req, res) {
  try {
    const { title, description, domain } = req.validatedBody;

    const result = await query(
      'INSERT INTO projects (title, description, domain, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description || null, domain, req.user.id]
    );

    return res.status(201).json({ project: result.rows[0] });
  } catch (err) {
    console.error('createProject error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Get a single project by ID (with counts), verified by user ownership.
 */
export async function getProject(req, res) {
  try {
    const result = await query(
      `SELECT
        p.id, p.title, p.description, p.domain, p.created_at, p.updated_at,
        COALESCE(src.source_count, 0)::int AS source_count,
        COALESCE(chk.chunk_count, 0)::int AS chunk_count,
        COALESCE(msg.message_count, 0)::int AS message_count
      FROM projects p
      LEFT JOIN (
        SELECT project_id, COUNT(*)::int AS source_count FROM sources GROUP BY project_id
      ) src ON src.project_id = p.id
      LEFT JOIN (
        SELECT s.project_id, COUNT(dc.id)::int AS chunk_count
        FROM document_chunks dc JOIN sources s ON dc.source_id = s.id
        GROUP BY s.project_id
      ) chk ON chk.project_id = p.id
      LEFT JOIN (
        SELECT project_id, COUNT(*)::int AS message_count FROM chat_messages GROUP BY project_id
      ) msg ON msg.project_id = p.id
      WHERE p.id = $1 AND p.user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    return res.status(200).json({ project: result.rows[0] });
  } catch (err) {
    console.error('getProject error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Delete a project by ID, verified by user ownership.
 */
export async function deleteProject(req, res) {
  try {
    const result = await query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    return res.status(204).send();
  } catch (err) {
    console.error('deleteProject error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
