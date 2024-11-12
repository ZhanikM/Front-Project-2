const apiKey = 'e9a4070dd89d6fd72bf9c728a58399c3'; // Replace with your API key

// Function to fetch movies based on the title query
async function fetchMovies(query) {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results;
}

// Function to display movies in a grid
function displayMovies(movies) {
    const moviesContainer = document.getElementById('movies-container');
    moviesContainer.innerHTML = ''; // Clear previous results

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');

        const movieImage = document.createElement('img');
        movieImage.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        movieImage.alt = movie.title;

        const movieTitle = document.createElement('h3');
        movieTitle.textContent = movie.title;

        const releaseDate = document.createElement('p');
        releaseDate.textContent = `Release Date: ${movie.release_date}`;

        movieCard.appendChild(movieImage);
        movieCard.appendChild(movieTitle);
        movieCard.appendChild(releaseDate);
        moviesContainer.appendChild(movieCard);

        movieCard.addEventListener('click', () => {
            openMovieDetails(movie.id);
        });
    });
}

// Function to open movie details in a modal
async function openMovieDetails(movieId) {
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`;
    const creditsUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`;
    
    const movieResponse = await fetch(url);
    const creditsResponse = await fetch(creditsUrl);
    
    const movie = await movieResponse.json();
    const credits = await creditsResponse.json();

    // Movie details
    document.getElementById('modal-title').textContent = movie.title;
    document.getElementById('modal-synopsis').textContent = movie.overview;
    document.getElementById('modal-rating').textContent = `Rating: ${movie.vote_average}`;
    document.getElementById('modal-runtime').textContent = `Runtime: ${movie.runtime} mins`;
    document.getElementById('modal-release').textContent = `Release Date: ${movie.release_date}`;

    // Cast
    const castList = document.getElementById('modal-cast');
    castList.innerHTML = ''; // Clear previous cast data
    credits.cast.slice(0, 5).forEach(actor => {
        const castItem = document.createElement('li');
        castItem.textContent = `${actor.name} as ${actor.character}`;
        castList.appendChild(castItem);
    });

    // Crew
    const crewList = document.getElementById('modal-crew');
    crewList.innerHTML = ''; // Clear previous crew data
    credits.crew.slice(0, 5).forEach(crewMember => {
        const crewItem = document.createElement('li');
        crewItem.textContent = `${crewMember.name} - ${crewMember.job}`;
        crewList.appendChild(crewItem);
    });

    // Show the modal
    document.getElementById('movie-modal').style.display = 'block';
}

// Event listener for search input
document.getElementById('search-input').addEventListener('input', async (event) => {
    const query = event.target.value;
    if (query.length > 2) {
        const movies = await fetchMovies(query);
        displayMovies(movies);
    }
});

// Close the modal when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('movie-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
