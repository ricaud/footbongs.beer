import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL,  { ssl: 'verify-full' });

// This function can now leverage a shared connection pool
export default async function handler(req, res) {
    const rows = await sql`'SELECT *, friends[currentDrafterIndex+1] as "currentDrafter" FROM draftState WHERE tournament=${req.query.tournament}`;
    res.status(200).json(rows[0]);
}