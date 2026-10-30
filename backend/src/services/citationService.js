/**
 * Generate an APA 7th edition citation string.
 * @param {{ title: string, authors?: string, publication_year?: number, url?: string }} source
 * @returns {string}
 */
export function generateAPA(source) {
  const authors = source.authors || 'Unknown Author';
  const year = source.publication_year ? `(${source.publication_year})` : '(n.d.)';
  const title = source.title;
  let citation = `${authors}. ${year}. ${title}.`;
  if (source.url) {
    citation += ` Retrieved from ${source.url}`;
  }
  return citation;
}

/**
 * Generate an MLA 9th edition citation string.
 * @param {{ title: string, authors?: string, publication_year?: number, url?: string }} source
 * @returns {string}
 */
export function generateMLA(source) {
  const authors = source.authors || 'Unknown Author';
  const title = `"${source.title}."`;
  const year = source.publication_year ? `${source.publication_year}.` : '';
  let citation = `${authors}. ${title} ${year}`.trim();
  if (source.url) {
    citation += ` ${source.url}.`;
  }
  return citation;
}

/**
 * Generate a Chicago 17th edition citation string.
 * @param {{ title: string, authors?: string, publication_year?: number, url?: string }} source
 * @returns {string}
 */
export function generateChicago(source) {
  const authors = source.authors || 'Unknown Author';
  const title = source.title;
  const year = source.publication_year ? `${source.publication_year}` : 'n.d.';
  let citation = `${authors}. "${title}." ${year}.`;
  if (source.url) {
    citation += ` ${source.url}.`;
  }
  return citation;
}

/**
 * Generate a BibTeX entry string.
 * @param {{ id: string, title: string, authors?: string, publication_year?: number, url?: string }} source
 * @returns {string}
 */
export function generateBibTeX(source) {
  const key = source.id ? source.id.substring(0, 8) : 'unknown';
  const authors = source.authors || 'Unknown Author';
  const year = source.publication_year || '';
  const title = source.title;

  let entry = `@article{${key},\n`;
  entry += `  author  = {${authors}},\n`;
  entry += `  title   = {${title}},\n`;
  if (year) {
    entry += `  year    = {${year}},\n`;
  }
  if (source.url) {
    entry += `  url     = {${source.url}},\n`;
  }
  entry += `}`;
  return entry;
}

/**
 * Generate citations in the requested formats.
 * @param {object} source - The source metadata.
 * @param {string[]} formats - Array of format names: 'apa', 'mla', 'chicago', 'bibtex'.
 * @returns {object} - Object keyed by format name with citation string values.
 */
export function generateCitations(source, formats = ['apa', 'mla', 'chicago', 'bibtex']) {
  const generators = {
    apa: generateAPA,
    mla: generateMLA,
    chicago: generateChicago,
    bibtex: generateBibTeX,
  };

  const result = {};
  for (const format of formats) {
    const generator = generators[format.toLowerCase()];
    if (generator) {
      result[format.toLowerCase()] = generator(source);
    }
  }
  return result;
}
