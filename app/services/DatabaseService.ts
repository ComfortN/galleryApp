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
        // Create the table if it does not exist
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
  async addImage(uri: string, latitude?: number, longitude?: number, date?: string, time?: string) {
    return this.db.runAsync(
      'INSERT INTO images (uri, latitude, longitude, date, time) VALUES (?, ?, ?, ?, ?)',
      [uri, latitude, longitude, date, time]
    );
  }

  async getImages() {
    return this.db.getAllAsync('SELECT * FROM images ORDER BY timestamp DESC');
  }

   // Delete an image entry
   async deleteImage(id: number) {
    return this.db.runAsync('DELETE FROM images WHERE id = ?', [id]);
  }

}

export default new DatabaseService();