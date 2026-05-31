import mysql from 'mysql2/promise';

let pool;

const connectToDB = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'github_analyzer',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Test the connection
    const connection = await pool.getConnection();
    console.log(`Connected to MySQL: ${process.env.DB_HOST || 'localhost'}`);
    connection.release();

    // Initialize tables
    await initializeTables();
  } catch (error) {
    console.error('MySQL connection error:', error.message);
    process.exit(1);
  }
};

const initializeTables = async () => {
  const createProfilesTable = `
    CREATE TABLE IF NOT EXISTS github_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      name VARCHAR(255),
      bio TEXT,
      avatar_url TEXT,
      github_url TEXT,
      company VARCHAR(255),
      blog VARCHAR(255),
      location VARCHAR(255),
      email VARCHAR(255),
      twitter_username VARCHAR(100),
      public_repos INT DEFAULT 0,
      public_gists INT DEFAULT 0,
      followers INT DEFAULT 0,
      following INT DEFAULT 0,
      total_stars INT DEFAULT 0,
      total_forks INT DEFAULT 0,
      top_languages JSON,
      most_starred_repo VARCHAR(255),
      most_starred_repo_stars INT DEFAULT 0,
      account_age_days INT DEFAULT 0,
      account_created_at VARCHAR(50),
      hireable BOOLEAN DEFAULT FALSE,
      site_admin BOOLEAN DEFAULT FALSE,
      analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  await pool.query(createProfilesTable);
  console.log('Tables initialized successfully');
};

export const getPool = () => {
  if (!pool) throw new Error('Database not initialized');
  return pool;
};

export default connectToDB;
