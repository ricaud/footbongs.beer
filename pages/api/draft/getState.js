import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL,  { ssl: 'verify-full' });


// This function can now leverage a shared connection pool
export default async function handler(req, res) {
    const scoresUrl = await sql`SELECT scoresUrl as "url" from draftState WHERE tournament=${req.query.tournament}`
    console.log(scoresUrl)

    const friends = await sql`
    SELECT jsonb_object_agg(drafter, players)
    FROM (
        SELECT dl.drafter, JSON_AGG(dl.player) as players
        FROM draftLog dl
        WHERE dl.tournament = ${req.query.tournament}
        GROUP BY dl.drafter
    ) subquery`;

    console.log(friends)

    res.status(200).json({
        "url": scoresUrl[0].url,
        "friends": friends[0].jsonb_object_agg
    });
}