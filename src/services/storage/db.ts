import * as SQLite from 'expo-sqlite';

let database: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (database) {
    return database;
  }
  const opened = await SQLite.openDatabaseAsync('timeflow.db');
  await migrate(opened);
  database = opened;
  return opened;
}

async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_meta (
      id INTEGER PRIMARY KEY NOT NULL,
      version INTEGER NOT NULL
    );
  `);
  const row = await db.getFirstAsync<{ version: number }>('SELECT version FROM schema_meta WHERE id = 1');
  if ((row?.version ?? 0) >= 1) {
    return;
  }

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS alarms (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      hour INTEGER NOT NULL,
      minute INTEGER NOT NULL,
      is_enabled INTEGER NOT NULL,
      repeat_days TEXT NOT NULL,
      snooze_minutes INTEGER NOT NULL,
      sound_id TEXT NOT NULL,
      vibration_enabled INTEGER NOT NULL,
      next_trigger_at TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      start_at TEXT NOT NULL,
      end_at TEXT,
      reminder_enabled INTEGER NOT NULL,
      reminder_offset_minutes INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
  await db.runAsync('INSERT INTO schema_meta (id, version) VALUES (1, 1)');
}
