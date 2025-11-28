import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { Paper, Project, Document } from '../types';

// Firebase configuration - use environment variables in production
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.FIREBASE_APP_ID || '1:123456789:web:abc123'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Mock user for demo purposes
const mockUser = { uid: 'demo-user', email: 'demo@example.com' };
(auth as any).currentUser = mockUser;

// Papers Collection
export const subscribeToPapers = (userId: string, callback: (papers: Paper[]) => void): (() => void) => {
  const papersRef = collection(db, 'users', userId, 'papers');
  return onSnapshot(papersRef, (snapshot) => {
    const papers: Paper[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Paper));
    callback(papers);
  }, (error) => {
    console.error('Error subscribing to papers:', error);
    callback([]);
  });
};

export const addPaperToDb = async (userId: string, paper: Paper): Promise<void> => {
  const paperRef = doc(db, 'users', userId, 'papers', paper.id);
  await setDoc(paperRef, paper);
};

export const updatePaperInDb = async (paper: Paper): Promise<void> => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;
  const paperRef = doc(db, 'users', userId, 'papers', paper.id);
  await setDoc(paperRef, paper, { merge: true });
};

export const deletePaperFromDb = async (paperId: string): Promise<void> => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;
  const paperRef = doc(db, 'users', userId, 'papers', paperId);
  await deleteDoc(paperRef);
};

// Projects Collection
export const subscribeToProjects = (userId: string, callback: (projects: Project[]) => void): (() => void) => {
  const projectsRef = collection(db, 'users', userId, 'projects');
  return onSnapshot(projectsRef, (snapshot) => {
    const projects: Project[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
    callback(projects);
  }, (error) => {
    console.error('Error subscribing to projects:', error);
    callback([]);
  });
};

export const addProjectToDb = async (userId: string, project: Project): Promise<void> => {
  const projectRef = doc(db, 'users', userId, 'projects', project.id);
  await setDoc(projectRef, project);
};

export const updateProjectInDb = async (project: Project): Promise<void> => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;
  const projectRef = doc(db, 'users', userId, 'projects', project.id);
  await setDoc(projectRef, project, { merge: true });
};

export const deleteProjectFromDb = async (projectId: string): Promise<void> => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;
  const projectRef = doc(db, 'users', userId, 'projects', projectId);
  await deleteDoc(projectRef);
};

// Documents Collection
export const subscribeToDocuments = (userId: string, callback: (documents: Document[]) => void): (() => void) => {
  const documentsRef = collection(db, 'users', userId, 'documents');
  return onSnapshot(documentsRef, (snapshot) => {
    const documents: Document[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
    callback(documents);
  }, (error) => {
    console.error('Error subscribing to documents:', error);
    callback([]);
  });
};

export const addDocumentToDb = async (document: Document): Promise<void> => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;
  const documentRef = doc(db, 'users', userId, 'documents', document.id);
  await setDoc(documentRef, document);
};

export const updateDocumentInDb = async (document: Document): Promise<void> => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;
  const documentRef = doc(db, 'users', userId, 'documents', document.id);
  await setDoc(documentRef, document, { merge: true });
};

export const deleteDocumentFromDb = async (documentId: string): Promise<void> => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;
  const documentRef = doc(db, 'users', userId, 'documents', documentId);
  await deleteDoc(documentRef);
};
