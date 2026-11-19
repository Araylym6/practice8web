const titleInput = document.getElementById("titleInput");
const searchBtn = document.getElementById("searchBtn");
const message = document.getElementById("message");
const result = document.getElementById("result");
const titleYear = document.getElementById("titleYear");
const rating = document.getElementById("rating");
const plot = document.getElementById("plot");
const watchlistBtn = document.getElementById("watchlistBtn");

let currentMovie = null;

result.style.display = "none";

searchBtn.addEventListener("click", async () => {
	const searchTitle = titleInput.value.trim();
	message.textContent = "";
	result.style.display = "none";
	currentMovie = null;

	if (!searchTitle) {
		message.textContent = "Please enter a movie title.";
		return;
	}

	try {
		const response = await fetch(`/api/movie?title=${encodeURIComponent(searchTitle)}`);
		if (!response.ok) {
			throw new Error(`Movie search failed (${response.status}).`);
		}

		const movie = await response.json();
		if (movie.Response === "False") {
			throw new Error(movie.Error || "Movie not found.");
		}

		currentMovie = movie;
		titleYear.textContent = `${movie.Title} (${movie.Year})`;
		rating.textContent = movie.imdbRating;
		plot.textContent = movie.Plot;
		result.style.display = "block";
	} catch (error) {
		message.textContent = error.message || "Unable to search for this movie.";
	}
});

watchlistBtn.addEventListener("click", async () => {
	if (!currentMovie) {
		message.textContent = "Search for a movie before adding it to your watchlist.";
		return;
	}

	try {
		const response = await fetch("http://localhost:3001/watchlist", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				title: currentMovie.Title,
				year: currentMovie.Year,
				rating: currentMovie.imdbRating,
				plot: currentMovie.Plot,
			}),
		});

		if (!response.ok) {
			throw new Error(`Could not add movie to watchlist (${response.status}).`);
		}

		message.textContent = "Movie added to watchlist.";
	} catch (error) {
		message.textContent = error.message || "Unable to add movie to watchlist.";
	}
});
