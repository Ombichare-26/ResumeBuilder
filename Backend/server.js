//server.js -> Loads .env -> connectDB() -> imports app.js -> (app.js sets routes + middleware) -> server starts listening

import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";


dotenv.config({
    path: "./.env"
});

connectDB().then(() => {
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        console.log("app is listening at port:", port);
    });

})
    .catch((error) => {
        console.log("MONGODB CONNECTION ERROR!!:", error);
    });;