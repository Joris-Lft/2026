import { config } from "dotenv";
import { createUser } from "../src/services/airtable";

config({ path: ".env" });

const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4];

if (!email || !password) {
  console.error("Usage: npm run create-user -- <email> <password> [name]");
  process.exit(1);
}

const additionalFields = name ? { Name: name } : {};

createUser(email, password, additionalFields).then((result) => {
  if (result.user) {
    console.log("Utilisateur créé:", result.user.email);
  } else {
    console.error("Erreur:", result.error);
    process.exit(1);
  }
});
