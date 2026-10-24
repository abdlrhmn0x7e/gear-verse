import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL!);
const q = process.argv[2]!;
console.log(JSON.stringify(await sql.unsafe(q), null, 0));
await sql.end();
