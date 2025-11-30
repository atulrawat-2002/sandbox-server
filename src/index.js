import express from "express"
import cors from "cors"
import { PORT } from "./config/serverConfig.js"
import apiRouter from "./routes/index.js"
import morgan from "morgan"
import { Server } from "socket.io"
import { createServer } from 'node:http'

const app = express()
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    }
});

app.use(morgan())
app.use(express.json())
app.use(express.urlencoded())
app.use(cors())

io.on('connection', (socket) => {
    console.log('a user connected')
})

app.use("/api", apiRouter)

server.listen(PORT, () => {
    console.log(`App is listening on port no. ${PORT}`);
    
})