import express from "express";
import cors from "cors";
import { PORT } from "./config/serverConfig.js";
import apiRouter from "./routes/index.js";
import morgan from "morgan";
import { Server } from "socket.io";
import { createServer } from "node:http";
import chokidar from "chokidar";
import path from "node:path";
import { handleEditorSocketEvents } from "./socketHandlers/editorHandler.js";
import { Stats } from "node:fs";
import { handleContainerCreate } from "./containers/handleContainerCreate.js";
import { WebSocketServer } from "ws";
import { handleTerminalCreation } from "./containers/handleTerminalCreation.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["POST", "GET"],
  },
});

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

const editorNameSpace = io.of("/editor");

editorNameSpace.on("connection", (socket) => {
  console.log("Connection established of editor namespace");

  const projectId = socket.handshake.query.projectId;
  console.log(projectId);
  handleEditorSocketEvents(socket, editorNameSpace);

  if (projectId) {
    var watcher = chokidar.watch("./projects", {
      ignored: (path) => path.includes("node_modules"),
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
      },
      ignoreInitial: true,
    });

    watcher.on("all", (event, path) => {
      console.log(event, path);
    });
  }

  socket.on("disconnect", async () => {
    await watcher.close();
    console.log("Editor close");
  });
});

app.use("/api", apiRouter);

server.listen(PORT, (error) => {
  if (error) {
    console.log("Error while listening ", error);
  }
  console.log(`App is listening on port no. ${PORT}`);
});

const webSocketForTerminal = new WebSocketServer({
  noServer: true,
});

server.on("upgrade", (req, tcp, head) => {
  const isTerminal = req?.url.includes("/terminal");

  if (isTerminal) {
    const projectId = req.url.split("=")[1];
    console.log("project id recieved from URL ", projectId);
    handleContainerCreate(projectId, webSocketForTerminal, req, tcp, head);
  }
  
});

webSocketForTerminal.on("connection", (ws, req, container) => {
  console.log("Terminal connected");
  handleTerminalCreation(ws, container);

  ws.on("close", () => {
    container.remove({ force: true }, (err, data) => {
      if (err) {
        console.log("error while removing the container", err);
      }
      console.log("Container removed ", data);
    });
  });
});
