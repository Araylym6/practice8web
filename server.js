const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const projectDirectory = __dirname;
const staticFiles = {
	"/": { file: "index.html", contentType: "text/html; charset=utf-8" },
	"/index.html": { file: "index.html", contentType: "text/html; charset=utf-8" },
	"/style.css": { file: "style.css", contentType: "text/css; charset=utf-8" },
	"/script.js": { file: "script.js", contentType: "text/javascript; charset=utf-8" },
};

function sendJson(response, statusCode, data) {
	response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
	response.end(JSON.stringify(data));
}

const server = http.createServer(async (request, response) => {
	const requestUrl = new URL(request.url, `http://${request.headers.host}`);

	if (request.method === "GET" && requestUrl.pathname === "/api/movie") {
		const title = requestUrl.searchParams.get("title");
		if (!title || !title.trim()) {
			sendJson(response, 400, { error: "Movie title is required." });
			return;
		}

		const apiKey = process.env.OMDB_API_KEY;
		if (!apiKey) {
			sendJson(response, 500, { error: "OMDB_API_KEY is not configured." });
			return;
		}

		try {
			const apiUrl = `https://www.omdbapi.com/?apikey=${encodeURIComponent(apiKey)}&plot=full&t=${encodeURIComponent(title.trim())}`;
			const apiResponse = await fetch(apiUrl);
			const movie = await apiResponse.json();
			sendJson(response, apiResponse.status, movie);
		} catch (error) {
			sendJson(response, 502, { error: "Unable to fetch movie data." });
		}
		return;
	}

	if (request.method !== "GET") {
		sendJson(response, 405, { error: "Method not allowed." });
		return;
	}

	const asset = staticFiles[requestUrl.pathname];
	if (!asset) {
		sendJson(response, 404, { error: "Not found." });
		return;
	}

	fs.readFile(path.join(projectDirectory, asset.file), (error, contents) => {
		if (error) {
			sendJson(response, 500, { error: "Unable to read requested file." });
			return;
		}

		response.writeHead(200, { "Content-Type": asset.contentType });
		response.end(contents);
	});
});

server.listen(PORT, () => {
	console.log(`Movie Finder server listening on http://localhost:${PORT}`);
});
