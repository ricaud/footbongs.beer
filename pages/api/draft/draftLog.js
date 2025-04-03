import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL,  { ssl: 'verify-full' });


// This function can now leverage a shared connection pool
export default async function handler(req, res) {

    if(req.query.tournament) {
        const rows = await sql`SELECT * FROM draftlog WHERE tournament=${req.query.tournament} ORDER BY id ASC`;
        res.status(200).json(rows);
    } else {
        //bad request
        res.status(400).json({ error: 'Missing tournament parameter' });
    }
}