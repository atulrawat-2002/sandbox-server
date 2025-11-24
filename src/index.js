import express from "express"
import cors from "cors"
import { PORT } from "./config/serverConfig.js"
import apiRouter from "./routes/index.js"

const app = express()

app.use(express.json())
app.use(express.urlencoded())
app.use(cors())

app.use("/api", apiRouter)

app.listen(PORT, () => {
    console.log(`App is listening on port no. ${PORT}`);
    
})