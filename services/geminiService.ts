import { Paper, CitationStyle } from '../types';

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || '';

// Dynamically import @google/genai to avoid unsupported subpath errors with Vite bundling
const loadGeminiClient = async () => {
  const { GoogleGenerativeAI } = await import('@google/genai');
  return GoogleGenerativeAI;
};

/**
 * Formats a single paper citation in the given style (fallback formatter)
 */
const formatCitation = (paper: Paper, style: CitationStyle): string => {
  const authors = paper.authors.map(a => a.name).join(', ') || 'Unknown Author';
  const year = paper.year || 'n.d.';
  const title = paper.title || 'Untitled';
  const venue = paper.venue || '';
  
  switch (style) {
    case 'APA':
      return `${authors} (${year}). ${title}. ${venue}`.trim();
    case 'MLA':
      return `${authors}. "${title}." ${venue}, ${year}.`.trim();
    case 'Chicago':
      return `${authors}. "${title}." ${venue} (${year}).`.trim();
    case 'Harvard':
      return `${authors} (${year}) '${title}', ${venue}.`.trim();
    case 'IEEE':
      return `${authors}, "${title}," ${venue}, ${year}.`.trim();
    case 'BibTeX':
      const key = paper.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
      return `@article{${key},\n  author = {${authors}},\n  title = {${title}},\n  journal = {${venue}},\n  year = {${year}}\n}`;
    case 'Vancouver':
      return `${authors}. ${title}. ${venue}. ${year}.`.trim();
    default:
      return `${authors} (${year}). ${title}. ${venue}`.trim();
  }
};

/**
 * Generates citations for papers using Google Gemini AI, with fallback to local formatting
 */
export const generateCitations = async (papers: Paper[], style: CitationStyle): Promise<string> => {
  // If no API key, use fallback formatter
  if (!API_KEY) {
    return papers.map(p => formatCitation(p, style)).join('\n\n');
  }

  try {
    const GoogleGenerativeAI = await loadGeminiClient();
    const client = new GoogleGenerativeAI(API_KEY);
    const model = client.getGenerativeModel({ model: 'gemini-pro' });

    const papersInfo = papers.map(p => ({
      title: p.title,
      authors: p.authors.map(a => a.name),
      year: p.year,
      venue: p.venue,
      doi: p.doi
    }));

    const prompt = `Generate ${style} citations for the following papers. Return only the formatted citations, one per line:\n\n${JSON.stringify(papersInfo, null, 2)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error, using fallback formatter:', error);
    return papers.map(p => formatCitation(p, style)).join('\n\n');
  }
};
