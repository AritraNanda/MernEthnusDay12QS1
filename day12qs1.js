// API Configuration
const API_KEY = 'YOUR_TMDB_API_KEY'; // Replace with your actual TMDB API key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

// DOM Elements
const popularMoviesEl = document.getElementById('popular-movies');
const topRatedMoviesEl = document.getElementById('top-rated-movies');
const upcomingMoviesEl = document.getElementById('upcoming-movies');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const themeToggle = document.getElementById('theme-toggle');

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    // Fetch movies
    fetchMovies('popular', popularMoviesEl);
    fetchMovies('top_rated', topRatedMoviesEl);
    fetchMovies('upcoming', upcomingMoviesEl);
});

// Fetch movies from API
async function fetchMovies(category, element) {
    try {
        const res = await fetch(`${BASE_URL}/movie/${category}?api_key=${API_KEY}`);
        const data = await res.json();
        
        if (data.results) {
            showMovies(data.results, element);
        }
    } catch (err) {
        console.error('Error fetching movies:', err);
        element.innerHTML = '<p class="error">Failed to load movies. Please try again later.</p>';
    }
}

// Display movies in the DOM
function showMovies(movies, element) {
    element.innerHTML = '';
    
    movies.forEach(movie => {
        const { title, poster_path, vote_average, release_date, id } = movie;
        
        const movieEl = document.createElement('div');
        movieEl.classList.add('movie-card');
        movieEl.innerHTML = `
            <img class="movie-poster" src="${poster_path ? IMG_PATH + poster_path : 'assets/images/no-poster.jpg'}" alt="${title}" loading="lazy">
            <div class="movie-info">
                <h3 class="movie-title">${title}</h3>
                <div class="movie-details">
                    <span class="movie-rating"><i class="fas fa-star"></i> ${vote_average.toFixed(1)}</span>
                    <span>${release_date ? release_date.substring(0, 4) : 'N/A'}</span>
                </div>
            </div>
        `;
        
        // Add click event to view movie details
        movieEl.addEventListener('click', () => {
            window.location.href = `movie.html?id=${id}`;
        });
        
        element.appendChild(movieEl);
    });
}

// Search functionality
searchBtn.addEventListener('click', searchMovies);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchMovies();
    }
});

async function searchMovies() {
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm) {
        try {
            const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${searchTerm}`);
            const data = await res.json();
            
            if (data.results.length > 0) {
                // Clear all sections and show search results in popular section
                popularMoviesEl.innerHTML = '';
                topRatedMoviesEl.innerHTML = '';
                upcomingMoviesEl.innerHTML = '';
                
                document.getElementById('popular').scrollIntoView();
                showMovies(data.results, popularMoviesEl);
                
                // Update section header
                const sectionHeader = document.querySelector('#popular .section-header h2');
                sectionHeader.textContent = `Search Results for "${searchTerm}"`;
                
                // Add a clear search button
                const seeAllLink = document.querySelector('#popular .see-all');
                seeAllLink.textContent = 'Clear Search';
                seeAllLink.onclick = (e) => {
                    e.preventDefault();
                    window.location.reload();
                };
            } else {
                popularMoviesEl.innerHTML = '<p class="no-results">No movies found. Try a different search term.</p>';
            }
        } catch (err) {
            console.error('Error searching movies:', err);
            popularMoviesEl.innerHTML = '<p class="error">Failed to search movies. Please try again later.</p>';
        }
    }
}

// Theme toggle functionality
themeToggle.addEventListener('click', toggleTheme);

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// For movie.html (individual movie page)
if (window.location.pathname.includes('movie.html')) {
    displayMovieDetails();
}

async function displayMovieDetails() {
    const movieId = new URLSearchParams(window.location.search).get('id');
    
    if (!movieId) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        // Fetch movie details
        const movieRes = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,videos`);
        const movie = await movieRes.json();
        
        // Fetch similar movies
        const similarRes = await fetch(`${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}`);
        const similarMovies = await similarRes.json();
        
        // Update the page with movie details
        document.title = `${movie.title} | CineVerse`;
        
        // You would create and populate elements here for the movie details page
        // This would include the movie poster, title, overview, cast, etc.
        // And display similar movies in a grid
        
        console.log(movie); // For testing - replace with actual DOM updates
        
    } catch (err) {
        console.error('Error fetching movie details:', err);
        window.location.href = 'index.html';
    }
}