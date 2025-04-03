import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL,  { ssl: 'verify-full' });

// This function can now leverage a shared connection pool
export default async function handler(req, res) {
    console.log(req.query)

    //get all golfers
    if(!req.query.tournament && !req.query.friend) {
        const rows = await sql`SELECT * FROM masters2025players`;
        res.status(200).json(rows);
    }

    //get golfers active in a certain tournament
    if(req.query.tournament && !req.query.friend) {
        const rows = await sql`
        SELECT 
            dl.tournament, 
            JSON_AGG(
                jsonb_set(
                to_jsonb(p.*),
                '{drafter}',
                to_jsonb(dl.drafter)
                )
            ) AS "golfers"
        FROM draftlog dl
        JOIN masters2025players p ON p.name = dl.golfer
        WHERE tournament=${req.query.tournament} GROUP BY dl.tournament`

        res.status(200).json(rows[0]);
    }

    //get golfers owned by a certain freind in a tounament
    if(req.query.tournament && req.query.friend){
        console.log("here")

        const rows = await sql`
        SELECT 
            dl.tournament, 
            dl.drafter, 
            JSON_AGG(p.*) AS "golfers"
        FROM draftlog dl
        JOIN masters2025players p ON p.name = dl.golfer
        WHERE tournament=${req.query.tournament} AND drafter=${req.query.friend}
        GROUP BY dl.tournament, dl.drafter`

        console.log(rows)

        res.status(200).json(rows[0]);
    }

}