import { createServer }             from "http";
import { readFileSync, existsSync } from "fs";
import { join, extname }            from "path";
import { fileURLToPath }            from "url";
import { WebSocketServer }          from "ws";
import { GameData }                 from "./entity/GameData.js";
import { Service }                  from "./model/service.js";
import { Connection, Sender }       from "./connection/Connection.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DIST      = join(__dirname, "../../dist");
const PORT      = 1234;

const MIME = {
	".html": "text/html",
	".js":   "application/javascript",
	".css":  "text/css",
	".png":  "image/png",
	".svg":  "image/svg+xml",
	".ico":  "image/x-icon",
	".woff2":"font/woff2",
};

const httpServer = createServer((req, res) => {
	const url      = req.url.split("?")[0];
	const filePath = join(DIST, url === "/" ? "index.html" : url);
	if (!existsSync(filePath)) { res.writeHead(404); res.end("Not found"); return; }
	const mime = MIME[extname(filePath)] ?? "application/octet-stream";
	res.writeHead(200, { "Content-Type": mime });
	res.end(readFileSync(filePath));
});

const gameData = new GameData();
const service  = new Service(gameData);
const wss      = new WebSocketServer({ server: httpServer });
const sender   = new Sender(wss, service, gameData);

wss.on("connection", (ws) => new Connection(ws, service, gameData));
sender.start();

httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
