import fs from 'fs';
import path from 'path';
import { ProjectRecord, UserSession } from '../types/index';

interface DatabaseSchema {
  users: Record<string, UserSession>;
  projects: Record<string, ProjectRecord>;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const DATASETS_DIR = path.join(DATA_DIR, 'datasets');

// Ensure directories exist
function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATASETS_DIR)) {
    fs.mkdirSync(DATASETS_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial: DatabaseSchema = { users: {}, projects: {} };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
  }
}

function readDb(): DatabaseSchema {
  ensureStorage();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB, resetting to defaults:', err);
    return { users: {}, projects: {} };
  }
}

function writeDb(db: DatabaseSchema) {
  ensureStorage();
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

export const db = {
  // User operations
  getUser(id: string): UserSession | null {
    const data = readDb();
    return data.users[id] || null;
  },

  getUserByGithubId(githubId: string): UserSession | null {
    const data = readDb();
    return Object.values(data.users).find((u) => u.githubId === githubId) || null;
  },

  upsertUser(user: UserSession): UserSession {
    const data = readDb();
    data.users[user.id] = { ...data.users[user.id], ...user };
    writeDb(data);
    return data.users[user.id];
  },

  // Project operations
  getProjects(userId: string): ProjectRecord[] {
    const data = readDb();
    return Object.values(data.projects)
      .filter((p) => p.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  getProject(id: string): ProjectRecord | null {
    const data = readDb();
    return data.projects[id] || null;
  },

  saveProject(project: ProjectRecord): ProjectRecord {
    const data = readDb();
    data.projects[project.id] = {
      ...project,
      updatedAt: new Date().toISOString(),
    };
    writeDb(data);
    return data.projects[project.id];
  },

  deleteProject(id: string, userId: string): boolean {
    const data = readDb();
    const existing = data.projects[id];
    if (!existing || existing.userId !== userId) {
      return false;
    }
    delete data.projects[id];
    writeDb(data);

    // Also delete dataset file if it exists
    const datasetFile = path.join(DATASETS_DIR, `${id}.json`);
    if (fs.existsSync(datasetFile)) {
      try {
        fs.unlinkSync(datasetFile);
      } catch (e) {
        console.error('Failed to remove dataset file:', e);
      }
    }
    return true;
  },

  // Dataset storage
  saveDataset(projectId: string, rows: Record<string, any>[]): void {
    ensureStorage();
    const filePath = path.join(DATASETS_DIR, `${projectId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(rows), 'utf-8');
  },

  getDataset(projectId: string): Record<string, any>[] | null {
    ensureStorage();
    const filePath = path.join(DATASETS_DIR, `${projectId}.json`);
    if (!fs.existsSync(filePath)) return null;
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Failed to parse dataset file:', err);
      return null;
    }
  },
};
