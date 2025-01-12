import * as SQLite from 'expo-sqlite';

class DatabaseService {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabaseSync('gallery.db');
    this.initDatabase();
  }

  private async initDatabase() {
    try {
        this.db = await SQLite.openDatabaseAsync('gallery.db');
        // Updated schema to include date and time columns
        await this.db.execAsync(`
            CREATE TABLE IF NOT EXISTS images (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uri TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                latitude REAL,
                longitude REAL,
                date TEXT,
                time TEXT,
                name TEXT
            )
        `);
        
        console.log('Database initialized');
    } catch (error) {
        console.error('Database initialization error', error);
    }
  }
  
  async addImage(uri: string, latitude?: number, longitude?: number, date?: string, time?: string, name?: string) {
    return this.db.runAsync(
      'INSERT INTO images (uri, latitude, longitude, date, time, name) VALUES (?, ?, ?, ?, ?, ?)',
      [uri, latitude, longitude, date, time]
    );
  }

  async getImages() {
    return this.db.getAllAsync('SELECT * FROM images ORDER BY timestamp DESC');
  }

  async deleteImage(id: number) {
    return this.db.runAsync('DELETE FROM images WHERE id = ?', [id]);
  }

  async updateImageName(id: number, newName: string) {
    return this.db.runAsync(
      'UPDATE images SET name = ? WHERE id = ?',
      [newName, id]
    );
  }
}

export default new DatabaseService();