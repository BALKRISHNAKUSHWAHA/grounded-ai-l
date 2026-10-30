import { query } from '../config/db.js';
import { synthesizeLiterature } from '../services/geminiService.js';

async function verifyProjectOwnership(projectId, userId) {
  const result = await query(
    'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  );
  return result.rows.length > 0;
}

/**
 * Generate a new literature synthesis report for selected project sources.
 */
export async function synthesize(req, res) {
  try {
    const { id: projectId } = req.params;
    const { title, source_ids } = req.validatedBody;

    const isOwner = await verifyProjectOwnership(projectId, req.user.id);
    if (!isOwner) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Retrieve requested sources
    const sourcesResult = await query(
      `SELECT id, title, raw_content, authors, publication_year
       FROM sources
       WHERE id = ANY($1::uuid[]) AND project_id = $2`,
      [source_ids, projectId]
    );

    if (sourcesResult.rows.length < 2) {
      return res.status(400).json({
        error: 'At least 2 valid sources from this project are required for literature synthesis.',
      });
    }

    // Prepare content excerpts for Gemini synthesis (limit content per paper to avoid token overflow)
    const sourcesData = sourcesResult.rows.map((src) => ({
      title: src.title,
      authors: src.authors || undefined,
      publication_year: src.publication_year || undefined,
      content: (src.raw_content || '').slice(0, 8000),
    }));

    // Call Gemini Synthesis engine
    const synthesisResult = await synthesizeLiterature(sourcesData);

    // Persist synthesis report
    const insertResult = await query(
      `INSERT INTO synthesis_reports (project_id, title, source_ids, result)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [projectId, title, JSON.stringify(source_ids), JSON.stringify(synthesisResult)]
    );

    return res.status(201).json({
      report: insertResult.rows[0],
    });
  } catch (err) {
    console.error('synthesize error:', err);
    return res.status(500).json({ error: 'Failed to generate literature synthesis.' });
  }
}

/**
 * List all synthesis reports for a project.
 */
export async function listReports(req, res) {
  try {
    const { id: projectId } = req.params;

    const isOwner = await verifyProjectOwnership(projectId, req.user.id);
    if (!isOwner) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const result = await query(
      `SELECT id, project_id, title, source_ids, result, created_at
       FROM synthesis_reports
       WHERE project_id = $1
       ORDER BY created_at DESC`,
      [projectId]
    );

    return res.status(200).json({ reports: result.rows });
  } catch (err) {
    console.error('listReports error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Get a specific synthesis report by ID.
 */
export async function getReport(req, res) {
  try {
    const { id: projectId, reportId } = req.params;

    const isOwner = await verifyProjectOwnership(projectId, req.user.id);
    if (!isOwner) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const result = await query(
      `SELECT id, project_id, title, source_ids, result, created_at
       FROM synthesis_reports
       WHERE id = $1 AND project_id = $2`,
      [reportId, projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Synthesis report not found.' });
    }

    return res.status(200).json({ report: result.rows[0] });
  } catch (err) {
    console.error('getReport error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

