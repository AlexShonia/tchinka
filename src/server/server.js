import { createServer }                    from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { join, extname, sep, normalize }   from "path";
import { fileURLToPath }                   from "url";
import { WebSocketServer }                 from "ws";
import { GameData }                        from "./common/GameData.js";
import { Service }                         from "./incoming/service/service.js";
import { Receiver } from "./incoming/Receiver.js";
import { Sender }   from "./outgoing/Sender.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT      = join(__dirname, "../..");
const DIST      = join(ROOT, "dist");
const PORT      = 1234;
const DEV       = process.env.NODE_ENV !== "production";

const MIME = {
	".html": "text/html",
	".js":   "application/javascript",
	".css":  "text/css",
	".png":  "image/png",
	".svg":  "image/svg+xml",
	".ico":  "image/x-icon",
	".woff2":"font/woff2",
};

const IMPORT_MAP = `<script type="importmap">
	{ "imports": { "three": "/node_modules/three/build/three.module.js" } }
</script>`;

function fileUnder(root, urlPath) {
	const rel  = urlPath.replace(/^\/+/, "");
	if (rel.includes("\0")) return null;
	const file = normalize(join(root, rel));
	const base = root.endsWith(sep) ? root : root + sep;
	if (file !== root && !file.startsWith(base)) return null;
	if (!existsSync(file) || !statSync(file).isFile()) return null;
	return file;
}

function resolveStatic(urlPath) {
	if (!DEV) return fileUnder(DIST, urlPath === "/" ? "/index.html" : urlPath);
	if (urlPath === "/" || urlPath === "/index.html") return fileUnder(ROOT, "/index.html");
	const mounts = [
		["/src/client/",               join(ROOT, "src/client")],
		["/src/shared/",               join(ROOT, "src/shared")],
		["/node_modules/three/build/", join(ROOT, "node_modules/three/build")],
	];
	for (const [prefix, root] of mounts) {
		if (urlPath.startsWith(prefix)) return fileUnder(root, urlPath.slice(prefix.length));
	}
	return null;
}

const httpServer = createServer((req, res) => {
	let urlPath;
	try { urlPath = decodeURIComponent(req.url.split("?")[0]); }
	catch { res.writeHead(400); res.end("Bad request"); return; }

	const file = resolveStatic(urlPath);
	if (!file) { res.writeHead(404); res.end("Not found"); return; }

	const devPage = DEV && (urlPath === "/" || urlPath === "/index.html");
	const body    = devPage
		? readFileSync(file, "utf8").replace("</head>", `${IMPORT_MAP}\n  </head>`)
		: readFileSync(file);
	const headers = { "Content-Type": MIME[extname(file)] ?? "application/octet-stream" };
	if (DEV) headers["Cache-Control"] = "no-store";
	res.writeHead(200, headers);
	res.end(body);
});

const gameData = new GameData();
const service  = new Service(gameData);
const wss      = new WebSocketServer({ server: httpServer });
const sender   = new Sender(wss, gameData);

wss.on("connection", (ws) => new Receiver(ws, service));
sender.start();

httpServer.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
	if (DEV) console.log("Serving client source — refresh the page after client edits");
});
