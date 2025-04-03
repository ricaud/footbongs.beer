import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL,  { ssl: 'verify-full' });

// This function can now leverage a shared connection pool
export default async function handler(req, res) {
    const { body } = req
    if(!body.player || !body.tournament || !body.drafter) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }

    console.log("draftPlayer:")
    console.log(body)

    // is it this drafters turn?
    const draftingPlayer = await sql`SELECT friends[curentDrafterIndex+1] as "name" FROM draftState WHERE tournament=${body.tournament}`
    if(draftingPlayer[0].name !== body.drafter) {
        res.status(400).json({ error: `Current drafter is ${draftingPlayer[0].name} not ${body.drafter}` });
        return;
    }

    // does this golfer exist!?
    const golfer = await sql`SELECT * FROM masters2025players WHERE name=${body.player}`
    if(golfer.length !== 1) {
        res.status(400).json({ error: `${body.player} is not a valid golfer` });
        return;
    }

    // is the golfer free?
    const golferOwner = await sql`SELECT * FROM draftLog WHERE tournament=${body.tournament} AND player=${body.player}`
    if(golferOwner.length > 0) {
        res.status(400).json({ error: `${body.player} has already been drafted by ${golferOwner[0].drafter}` });
        return;
    }

    // add the draft log entry
    const insertDraftLogResult = await sql`INSERT INTO draftLog(tournament, drafter, player) VALUES (${body.tournament}, ${body.drafter}, ${body.player})`
    console.log(`${body.drafter} drafted ${body.player}`)
    console.log(insertDraftLogResult)
    
    // update the draft state
    const updateDraftStateResult = await sql`UPDATE draftState SET curentDrafterIndex=mod(curentDrafterIndex+1, array_length(friends, 1)) WHERE tournament=${body.tournament} RETURNING *, friends[curentDrafterIndex+1]`
    res.status(200).json(updateDraftStateResult);

}