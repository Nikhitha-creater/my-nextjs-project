
import React, { useEffect, useState } from "react";

const API_KEY = "db75be3f6da59e6c54d0b9f568d19d16";
const BASE_URL = "https://api.themoviedb.org/3/movie";
const SEARCH_URL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=`;
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const BACKGROUND_IMAGE_BASE = "https://image.tmdb.org/t/p/w200";

const endpoints = {
  upcoming: `${BASE_URL}/upcoming?api_key=${API_KEY}`,
  latest: `${BASE_URL}/latest?api_key=${API_KEY}`,
  topRated: `${BASE_URL}/top_rated?api_key=${API_KEY}`,
  popular: `${BASE_URL}/popular?api_key=${API_KEY}`,
};

export default function Season() {
  // States
  const [images, setImages] = useState([]);
  const [movies, setMovies] = useState({
    upcoming: [],
    latest: null,
    topRated: [],
    popular: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [view, setView] = useState("home"); // 'home', 'search', 'detail'
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieReviews, setMovieReviews] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Fetch main data
  useEffect(() => {
    async function fetchData() {
      try {
        const [upcomingRes, latestRes, topRatedRes, popularRes] = await Promise.all([
          fetch(endpoints.upcoming),
          fetch(endpoints.latest),
          fetch(endpoints.topRated),
          fetch(endpoints.popular),
        ]);

        const upcomingData = await upcomingRes.json();
        const latestData = await latestRes.json();
        const topRatedData = await topRatedRes.json();
        const popularData = await popularRes.json();

        // Background images from popular movies
        const bgRes = await fetch(endpoints.popular);
        const bgData = await bgRes.json();
        const filtered = bgData.results.filter((img) => img.poster_path);
        setImages(filtered.slice(0, 100));

        setMovies({
          upcoming: upcomingData.results?.slice(0, 8) || [],
          latest: latestData,
          topRated: topRatedData.results?.slice(0, 8) || [],
          popular: popularData.results?.slice(0, 8) || [],
        });
      } catch (err) {
        setError("Failed to fetch movies");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Search handler
  async function handleSearch(e) {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setSearchError(null);
      setView("home");
      return;
    }
    setSearchLoading(true);
    setSearchError(null);

    try {
      const res = await fetch(SEARCH_URL + encodeURIComponent(searchTerm));
      const data = await res.json();
      if (data.results) {
        setSearchResults(data.results);
        setView("search");
      } else {
        setSearchResults([]);
        setView("search");
      }
    } catch {
      setSearchError("Search failed");
    } finally {
      setSearchLoading(false);
    }
  }

  // Show detail of a movie with reviews and similar movies
  async function showMovieDetail(id) {
    setLoadingDetail(true);
    setError(null);
    try {
      // Fetch movie details
      const res = await fetch(`${BASE_URL}/${id}?api_key=${API_KEY}&language=en-US`);
      const data = await res.json();
      if (data.status_code) {
        setError("Movie not found");
        setSelectedMovie(null);
        setMovieReviews([]);
        setSimilarMovies([]);
      } else {
        setSelectedMovie(data);

        // Fetch reviews
        const reviewsRes = await fetch(`${BASE_URL}/${id}/reviews?api_key=${API_KEY}&language=en-US&page=1`);
        const reviewsData = await reviewsRes.json();
        setMovieReviews(reviewsData.results?.slice(0, 5) || []);

        // Fetch similar movies
        const similarRes = await fetch(`${BASE_URL}/${id}/similar?api_key=${API_KEY}&language=en-US&page=1`);
        const similarData = await similarRes.json();
        setSimilarMovies(similarData.results?.slice(0, 5) || []);

        setView("detail");
      }
    } catch {
      setError("Failed to load movie details");
      setSelectedMovie(null);
      setMovieReviews([]);
      setSimilarMovies([]);
    } finally {
      setLoadingDetail(false);
    }
  }

  // Back to home
  function backToHome() {
    setView("home");
    setSelectedMovie(null);
    setError(null);
    setMovieReviews([]);
    setSimilarMovies([]);
  }

  if (loading) return <p style={{ color: "white", textAlign: "center" }}>Loading...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <>
      {/* Search bar top-right */}
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              minWidth: "200px",
            }}
          />
          <button
            type="submit"
            style={{
              marginLeft: "5px",
              padding: "8px 12px",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "#e50914",
              color: "white",
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </form>
      </div>

      {/* Background grid */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "1920px",
          height: "1092px",
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(10, 1fr)",
            gap: 0,
            width: "100%",
            height: "100%",
          }}
        >
          {images.map((img, idx) => (
            <img
              key={idx}
              src={`${BACKGROUND_IMAGE_BASE}${img.poster_path}`}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.5)" }}
              loading="lazy"
              draggable={false}
            />
          ))}
        </div>
        <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.7)" }} />
      </div>

      {/* Conditional rendering by view */}
      {view === "home" && (
        <>
          {/* Centered Hero Text */}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              width: "900px",
              transform: "translate(-50%, -50%)",
              zIndex: 2,
              textAlign: "center",
              color: "white",
            }}
          >
            <h1 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>Best viewing experience with Skilledity</h1>
            <p style={{ color: "#ccc", margin: "1rem 0" }}>
              Explore blockbusters, cult classics & trending shows. Create watchlists, stream in high quality, and never miss what's new.
            </p>
            <button
              style={{
                backgroundColor: "#e50914",
                color: "white",
                padding: "10px 25px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              ▶ Start Watching
            </button>
          </div>

          {/* Movie Sections */}
          <div
            style={{
              position: "relative",
              top: "1160px",
              backgroundColor: "black",
              padding: "2rem",
              zIndex: 10,
              color: "white",
            }}
          >
            {[{ title: "Upcoming", data: movies.upcoming }, { title: "Top Rated", data: movies.topRated }, { title: "Popular", data: movies.popular }].map((section) => (
              <div key={section.title} style={{ marginBottom: "2rem" }}>
                <h2>{section.title}</h2>
                <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto" }}>
                  {section.data.length === 0 && <p>No movies found.</p>}
                  {section.data.map((movie) => (
                    <div
                      key={movie.id}
                      style={{
                        flex: "0 0 auto",
                        width: "220px",
                        cursor: "pointer",
                        borderRadius: "8px",
                        overflow: "hidden",
                        backgroundColor: "#111",
                      }}
                      onClick={() => showMovieDetail(movie.id)}
                    >
                      <img
                        src={`${IMAGE_BASE}${movie.poster_path}`}
                        alt={movie.title}
                        style={{ width: "100%", display: "block", borderRadius: "8px 8px 0 0" }}
                        loading="lazy"
                      />
                      <div style={{ padding: "0.5rem" }}>
                        <p style={{ margin: 0, fontWeight: "bold" }}>{movie.title}</p>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#bbb" }}>{movie.release_date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Search Results */}
      {view === "search" && (
        <div style={{ padding: "1rem", color: "white" }}>
          <button onClick={backToHome} style={{ marginBottom: "1rem", cursor: "pointer" }}>
            ← Back
          </button>
          {searchLoading && <p>Loading...</p>}
          {searchError && <p style={{ color: "red" }}>{searchError}</p>}
          {!searchLoading && searchResults.length === 0 && <p>No results found for "{searchTerm}"</p>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {searchResults.map((movie) => (
              <div
                key={movie.id}
                style={{
                  width: "150px",
                  cursor: "pointer",
                  borderRadius: "8px",
                  overflow: "hidden",
                  backgroundColor: "#111",
                }}
                onClick={() => showMovieDetail(movie.id)}
              >
                <img
                  src={movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : ""}
                  alt={movie.title}
                  style={{ width: "100%", display: "block" }}
                  loading="lazy"
                />
                <div style={{ padding: "0.5rem", color: "white" }}>
                  <p style={{ margin: 0, fontWeight: "bold" }}>{movie.title}</p>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#bbb" }}>{movie.release_date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Movie Detail View */}
      {view === "detail" && selectedMovie && (
        <div
          style={{
            color: "white",
            padding: "2rem",
            maxWidth: "900px",
            margin: "auto",
            position: "relative",
            zIndex: 20,
            backgroundColor: "rgba(0,0,0,0.85)",
            borderRadius: "10px",
            marginTop: "2rem",
          }}
        >
          <button
            onClick={backToHome}
            style={{
              backgroundColor: "#e50914",
              border: "none",
              color: "white",
              padding: "8px 16px",
              borderRadius: "5px",
              cursor: "pointer",
              marginBottom: "1rem",
            }}
          >
            ← Back to Home
          </button>

          <h1>{selectedMovie.title}</h1>
          <p><em>Release Date:</em> {selectedMovie.release_date}</p>
          <p>{selectedMovie.overview}</p>

          {/* Reviews */}
          <section style={{ marginTop: "2rem" }}>
            <h2>Reviews</h2>
            {loadingDetail && <p>Loading reviews...</p>}
            {!loadingDetail && movieReviews.length === 0 && <p>No reviews available.</p>}
            <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
              {movieReviews.map((review) => (
                <li key={review.id} style={{ marginBottom: "1rem", borderBottom: "1px solid #444", paddingBottom: "1rem" }}>
                  <strong>{review.author}</strong>
                  <p>{review.content.length > 300 ? review.content.substring(0, 300) + "..." : review.content}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Similar Movies */}
          <section style={{ marginTop: "2rem" }}>
            <h2>Similar Movies</h2>
            {loadingDetail && <p>Loading similar movies...</p>}
            {!loadingDetail && similarMovies.length === 0 && <p>No similar movies found.</p>}
            <div style={{ display: "flex", gap: "1rem", overflowX: "auto" }}>
              {similarMovies.map((movie) => (
                <div
                  key={movie.id}
                  style={{
                    minWidth: "120px",
                    cursor: "pointer",
                    borderRadius: "8px",
                    overflow: "hidden",
                    backgroundColor: "#111",
                  }}
                  onClick={() => showMovieDetail(movie.id)}
                >
                  <img
                    src={movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : ""}
                    alt={movie.title}
                    style={{ width: "100%", display: "block" }}
                    loading="lazy"
                  />
                  <div style={{ padding: "0.5rem", color: "white" }}>
                    <p style={{ margin: 0, fontWeight: "bold" }}>{movie.title}</p>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#bbb" }}>{movie.release_date}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
