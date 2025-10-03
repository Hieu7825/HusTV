import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dummyShowsData } from "../assets/assets";
import timeFormat from "../lib/timeFormat";
import { Heart, PlayCircle, Star } from "lucide-react";
import BlurCircle from "../components/BlurCircle";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";

const MovieDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [show, setShow] = React.useState(null);
  const [isLiked, setIsLiked] = React.useState(false);

  const getShow = async () => {
    const show = dummyShowsData.find((show) => show._id === id);
    if (show) {
      setShow({
        movie: show,
      });
    }
  };

  useEffect(() => {
    getShow();
  }, [id]);

  return show ? (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-25 min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Hero Background Backdrop */}
      <div className="relative w-full h-96 mb-12 rounded-3xl overflow-hidden">
        <img
          src={show.movie.backdrop_path}
          alt=""
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black/60"></div>

        {/* Floating Info on Backdrop */}
        <div className="absolute bottom-8 left-8 right-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg shadow-red-600/50">
                Featured
              </span>
              <span className="px-4 py-1.5 bg-black/70 backdrop-blur-sm text-gray-300 text-xs font-semibold rounded-full border border-red-600/30">
                {show.movie.release_date.split("-")[0]}
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-2xl mb-2">
              {show.movie.title}
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-600/30">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-white font-bold">
                  {show.movie.vote_average.toFixed(1)}
                </span>
                <span className="text-gray-400">/ 10</span>
              </div>
              <span className="text-gray-300 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full border border-red-600/30">
                {show.movie.vote_count.toLocaleString()} votes
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto relative p-10 md:p-12 bg-black rounded-3xl border-4 border-red-600 shadow-2xl shadow-red-600/50 hover:shadow-red-600/70 hover:border-red-500 transition-all duration-500">
        <BlurCircle top="-100px" right="-100px" />
        {/* Movie Poster */}
        <div className="relative max-md:mx-auto group">
          <div className="absolute inset-0 bg-gradient-to-t from-red-600/30 via-transparent to-transparent rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <img
            src={show.movie.poster_path}
            alt={show.movie.title}
            className="relative rounded-xl h-104 max-w-70 object-cover border-4 border-red-600 shadow-2xl shadow-red-600/50 hover:shadow-red-600/70 hover:border-red-500 transition-all duration-500 hover:scale-105"
          />
        </div>

        {/* Movie Info */}
        <div className="flex flex-col gap-4">
          <span className="text-red-500 font-bold text-sm tracking-wider uppercase bg-red-950/50 px-3 py-1 rounded-full w-fit border border-red-600/30">
            ENGLISH
          </span>

          <h1 className="text-4xl md:text-5xl font-bold max-w-2xl text-balance text-white drop-shadow-2xl">
            {show.movie.title}
          </h1>

          <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full w-fit border-2 border-red-600/30 shadow-lg shadow-red-600/20">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 drop-shadow-lg" />
            <span className="text-white font-semibold">
              {show.movie.vote_average.toFixed(1)}
            </span>
            <span className="text-gray-400 text-sm">User Rating</span>
          </div>

          <p className="text-gray-300 mt-2 leading-relaxed max-w-xl text-base drop-shadow-md">
            {show.movie.overview}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-gray-300 text-sm">
            <span className="bg-gray-900 px-3 py-1.5 rounded-full border border-red-600/30 shadow-md">
              {timeFormat(show.movie.runtime)}
            </span>
            <span className="text-red-500">•</span>
            <span className="bg-gray-900 px-3 py-1.5 rounded-full border border-red-600/30 shadow-md">
              {show.movie.genres.map((genre) => genre.name).join(", ")}
            </span>
            <span className="text-red-500">•</span>
            <span className="bg-gray-900 px-3 py-1.5 rounded-full border border-red-600/30 shadow-md">
              {show.movie.release_date.split("-")[0]}
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-4 mt-6">
            <button
              onClick={() => {
                navigate(`/video/${id}`);
                scrollTo(0, 0);
              }}
              className="flex items-center gap-2 px-8 py-3 text-sm bg-gray-900 hover:bg-red-900 text-white transition-all duration-300 rounded-full font-medium cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 border-2 border-red-600 hover:border-red-400 hover:shadow-red-600/50 active:scale-95"
            >
              <PlayCircle className="w-5 h-5" />
              Play Now
            </button>

            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-3 rounded-full transition-all duration-300 cursor-pointer border-2 shadow-lg hover:scale-110 active:scale-95 ${
                isLiked
                  ? "bg-red-600 border-red-500 shadow-red-600/50 hover:shadow-red-600/70"
                  : "bg-gray-900 border-red-600 shadow-red-600/30 hover:bg-red-900 hover:shadow-red-600/50"
              }`}
            >
              <Heart
                className={`w-5 h-5 transition-all duration-300 ${
                  isLiked ? "fill-white text-white" : "text-red-500"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Related Movies Section */}
      <div className="mt-24">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-1 w-12 bg-gradient-to-r from-red-600 to-transparent rounded-full"></div>
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">
            You May Also Like
          </h2>
        </div>

        <div className="flex flex-wrap max-sm:justify-center gap-8">
          {dummyShowsData.slice(0, 3).map((movie, index) => (
            <MovieCard key={index} movie={movie} />
          ))}
        </div>
      </div>

      {/* Show More Button */}
      <div className="flex justify-center mt-20 pb-20">
        <button
          onClick={() => {
            navigate("/movies");
            scrollTo(0, 0);
          }}
          className="px-12 py-3.5 text-sm bg-gray-900 hover:bg-red-900 text-white transition-all duration-300 rounded-full font-medium cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 border-2 border-red-600 hover:border-red-400 hover:shadow-red-600/50 active:scale-95"
        >
          Show More Movies
        </button>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default MovieDetails;
