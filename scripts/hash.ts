// scripts/hash.ts
import bcrypt from "bcryptjs";
const pwd = process.argv[2];
if (!pwd) throw new Error("Provide a password: tsx scripts/hash.ts <password>");
(async () => { console.log(await bcrypt.hash(pwd, 10)); })();