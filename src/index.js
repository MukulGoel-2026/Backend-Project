import {app ,PORT} from "./app.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";


dotenv.config({path: "./.env"});


app.on("error" , (error) => {
    console.log("ERR :" ,error)
    throw error
})

connectDB()
.then(
    app.listen(PORT , () => {
        console.log(`server is running at port ${PORT}`);
    })
)
.catch((err) => {
    console.log("Failed to connect to the database:", err);
    process.exit(1);
});




BBBB