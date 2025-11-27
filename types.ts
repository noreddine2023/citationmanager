
export interface Paper {
  id: string;
  title: string;
  authors: Author[];
  year: number | null;
  abstract: string | null;
  venue: string | null;
  url: string | null;
  citationCount: number;
  isOpenAccess: boolean;
  addedAt: string;
  tags: string[];
  notes: Note[]; 
  projectIds: string[]; 
  subtopicIds: string[];
  pdfUrl?: string;
  annotations?: Annotation[];
  source?: 'SemanticScholar' | 'OpenAlex';
  doi: string | null;
}

export type JSONContent = {
  type?: string;
  attrs?: Record<string, any>;
  content?: JSONContent[];
  marks?: {
    type: string;
    attrs?: Record<string, any>;
    [key: string]: any;
  }[];
  text?: string;
  [key: string]: any;
};

export interface Document {
  id: string;
  title: string;
  content: JSONContent | null; // Tiptap JSON Block Tree
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export interface Subtopic {
  id: string;
  name: string;
  projectId: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
  subtopics: Subtopic[];
  flowData?: {
    nodes: any[];
    edges: any[];
  };
}

export interface Author {
  authorId: string;
  name: string;
}

export interface Annotation {
  id: string;
  type: 'highlight' | 'area';
  pageIndex: number;
  rects: {
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
  content?: string;
  quote?: string;
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple';
  createdAt: string;
}

export type CitationStyle = 'APA' | 'MLA' | 'Chicago' | 'Harvard' | 'IEEE' | 'BibTeX' | 'Vancouver';

export interface SearchResult {
  paperId: string;
  title: string;
  authors: { authorId: string; name: string }[];
  year: number | null;
  abstract: string | null;
  venue: string | null;
  url: string | null;
  citationCount: number;
  isOpenAccess: boolean;
  openAccessPdf?: { url: string } | null;
  references?: SearchResult[];
  source?: 'SemanticScholar' | 'OpenAlex';
  doi?: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}