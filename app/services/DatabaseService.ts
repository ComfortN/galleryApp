import * as SQLite from 'expo-sqlite';

class DatabaseService {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    // Open or create the database
    this.db = SQLite.openDatabaseSync('gallery.db');
    this.initDatabase();
  }

  private async initDatabase() {
    try {
      this.db = await SQLite.openDatabaseAsync('gallery.db');
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          uri TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          latitude REAL,
          longitude REAL
        )
      `);
      console.log('Database initialized');
    } catch (error) {
      console.error('Database initialization error', error);
    }
  }

  // Create a new image entry
  async addImage(uri: string, latitude?: number, longitude?: number) {
    return this.db.runAsync(
      'INSERT INTO images (uri, latitude, longitude) VALUES (?, ?, ?)',
      [uri, latitude, longitude]
    );
  }

  async getImages() {
    return this.db.getAllAsync('SELECT * FROM images ORDER BY timestamp DESC');
  }



}

export default new DatabaseService();