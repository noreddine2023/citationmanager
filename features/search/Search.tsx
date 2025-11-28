import React, { useState } from 'react';
import { Search, Loader2, ExternalLink, Plus, BookOpen } from 'lucide-react';
import { SearchResult } from '../../types';

interface SearchViewProps {
  onAddPaper: (result: SearchResult) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ onAddPaper }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Search using Semantic Scholar API
      const response = await fetch(
        `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=10&fields=paperId,title,authors,year,abstract,venue,url,citationCount,isOpenAccess,openAccessPdf`
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      const papers: SearchResult[] = (data.data || []).map((paper: any) => ({
        paperId: paper.paperId,
        title: paper.title,
        authors: paper.authors?.map((a: any) => ({ authorId: a.authorId || '', name: a.name })) || [],
        year: paper.year,
        abstract: paper.abstract,
        venue: paper.venue,
        url: paper.url,
        citationCount: paper.citationCount || 0,
        isOpenAccess: paper.isOpenAccess || false,
        openAccessPdf: paper.openAccessPdf,
        source: 'SemanticScholar' as const
      }));
      
      setResults(papers);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-6">Search Papers</h2>
      
      {/* Search Input */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for papers by title, author, or keywords..."
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          Search
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {results.length === 0 && !loading && (
          <div className="text-center py-12 text-slate-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Search for academic papers to add to your library</p>
          </div>
        )}
        
        {results.map((result) => (
          <article
            key={result.paperId}
            className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
          >
            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 text-slate-900">
                  {result.title}
                </h3>
                <p className="text-sm text-slate-500 mb-2">
                  {result.authors.map(a => a.name).join(', ')}
                  {result.year && ` • ${result.year}`}
                  {result.venue && ` • ${result.venue}`}
                </p>
                {result.abstract && (
                  <p className="text-sm text-slate-600 line-clamp-3">
                    {result.abstract}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  <span>{result.citationCount} citations</span>
                  {result.isOpenAccess && (
                    <span className="text-green-600 font-medium">Open Access</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => onAddPaper(result)}
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 text-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
                {result.url && (
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm flex items-center gap-2 text-slate-600"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
