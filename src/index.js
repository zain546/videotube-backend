import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

// Configured Dotenv
dotenv.config({ path: "./.env" });

// Done by Asad-Ali-Developer!
connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server is listening on port: ${process.env.PORT}`);
  });
});
