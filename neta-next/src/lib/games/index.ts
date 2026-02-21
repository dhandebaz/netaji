import { getPool } from '@/lib/db';

type GameRow = {
  id: string;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  play_url: string | null;
  plays: number | null;
};

type CreateGameBody = {
  id?: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  playUrl?: string;
};

type CreateGameParams = {
  body: CreateGameBody;
};

type UpdateGameBody = {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  playUrl?: string;
  plays?: number;
};

type UpdateGameParams = {
  id: string;
  body: UpdateGameBody;
};

type PlayGameParams = {
  id: string;
};

type DeleteGameParams = {
  id: string;
};

async function ensureGamesTable() {
  const pool = getPool();
  if (!pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    thumbnail_url TEXT,
    play_url TEXT,
    plays INTEGER DEFAULT 0
  )`);
}

export async function getGames() {
  const pool = getPool();
  if (!pool) {
    throw new Error('database_unavailable');
  }
  await ensureGamesTable();
  const rows = await pool.query<GameRow>('SELECT * FROM games ORDER BY plays DESC');
  return rows.rows.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    thumbnailUrl: g.thumbnail_url,
    playUrl: g.play_url,
    plays: g.plays,
  }));
}

export async function createGame(params: CreateGameParams) {
  const pool = getPool();
  if (!pool) {
    throw new Error('database_unavailable');
  }
  await ensureGamesTable();
  const b = params.body || {};
  const id = b.id || `g_${Date.now()}`;
  const r = await pool.query(
    `INSERT INTO games (id,title,description,thumbnail_url,play_url,plays)
     VALUES ($1,$2,$3,$4,$5,0)
     ON CONFLICT (id) DO UPDATE SET
       title = EXCLUDED.title,
       description = EXCLUDED.description,
       thumbnail_url = EXCLUDED.thumbnail_url,
       play_url = EXCLUDED.play_url
     RETURNING *`,
    [id, b.title || null, b.description || null, b.thumbnailUrl || null, b.playUrl || null]
  );
  const g = r.rows[0] as GameRow;
  return {
    id: g.id,
    title: g.title,
    description: g.description,
    thumbnailUrl: g.thumbnail_url,
    playUrl: g.play_url,
    plays: g.plays,
  };
}

export async function playGame(params: PlayGameParams) {
  const pool = getPool();
  if (!pool) {
    throw new Error('database_unavailable');
  }
  await ensureGamesTable();
  const r = await pool.query<GameRow>(
    'UPDATE games SET plays = COALESCE(plays,0)+1 WHERE id = $1 RETURNING *',
    [params.id]
  );
  if (r.rows.length === 0) {
    return null;
  }
  const g = r.rows[0] as GameRow;
  return {
    id: g.id,
    title: g.title,
    description: g.description,
    thumbnailUrl: g.thumbnail_url,
    playUrl: g.play_url,
    plays: g.plays,
  };
}

export async function updateGame(params: UpdateGameParams) {
  const pool = getPool();
  if (!pool) {
    throw new Error('database_unavailable');
  }
  await ensureGamesTable();
  const b = params.body || {};
  const fields: string[] = [];
  const values: (string | number)[] = [];
  let idx = 1;
  const mapping: Record<keyof UpdateGameBody, string> = {
    title: 'title',
    description: 'description',
    thumbnailUrl: 'thumbnail_url',
    playUrl: 'play_url',
    plays: 'plays',
  };
  (Object.keys(mapping) as (keyof UpdateGameBody)[]).forEach((key) => {
    const value = b[key];
    if (value !== undefined) {
      fields.push(`${mapping[key]} = $${idx++}`);
      values.push(value as string | number);
    }
  });
  values.push(params.id);
  const q = `UPDATE games SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
  const r = await pool.query<GameRow>(q, values);
  if (r.rows.length === 0) {
    return null;
  }
  const g = r.rows[0] as GameRow;
  return {
    id: g.id,
    title: g.title,
    description: g.description,
    thumbnailUrl: g.thumbnail_url,
    playUrl: g.play_url,
    plays: g.plays,
  };
}

export async function deleteGame(params: DeleteGameParams) {
  const pool = getPool();
  if (!pool) {
    throw new Error('database_unavailable');
  }
  await ensureGamesTable();
  const r = await pool.query('DELETE FROM games WHERE id = $1', [params.id]);
  return (r.rowCount || 0) > 0;
}
