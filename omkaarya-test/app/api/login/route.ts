import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// PostgreSQL configuration - replace with your actual values
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Or individual: host, port, user, password, database
});

export async function POST(request: NextRequest) {
  try {
    const { email, tempPassword } = await request.json();

    // Validate input
    if (!email || !tempPassword) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Query PostgreSQL
    const client = await pool.connect();
    try {
      const query = 'SELECT * FROM users WHERE email = $1 AND temp_password = $2';
      const values = [email, tempPassword];
      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      // Success - in real app, generate JWT or session
      return NextResponse.json({ success: true, message: 'Login successful' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}