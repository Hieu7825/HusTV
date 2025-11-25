// client/src/pages/Video.jsx
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dummyShowsData, assets } from "../assets/assets";
import { Heart, ChevronRight, Home, Star } from "lucide-react";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";

export const Video = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [show, setShow] = React.useState(null);

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
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white dark:from-black dark:via-gray-900 dark:to-black text-gray-900 dark:text-white px-6 md:px-16 lg:px-40 pt-24 md:pt-28">
      {/* Breadcrumb Header - HusTV >> Movie */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/")}
          className="gradient cursor-pointer flex items-center gap-2  transition-colors font-bold text-xl drop-shadow-lg"
        >
          <Home className="text-blue-500 dark:text-red-500 w-5 h-5" />
          HusTV
        </button>
        <ChevronRight className="w-5 h-5 text-gray-500" />
        <button
          onClick={() => navigate(`/movies/${id}`)}
          className="cursor-pointer text-gray-600 dark:text-gray-300 font-medium text-lg drop-shadow-md"
        >
          {show.movie.title}
        </button>
      </div>

      {/* TV-Style Video Player */}
      <div className="w-full max-w-7xl mx-auto relative">
        <BlurCircle top="-150px" right="-150px" />
        <BlurCircle top="50%" left="-200px" />

        {/* TV Frame */}
        <div className="relative bg-gradient-to-br from-gray-100 via-gray-200 to-white dark:from-gray-900 dark:via-gray-800 dark:to-black p-8 md:p-12 rounded-3xl shadow-2xl">
          {/* TV Stand/Base */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 h-8 bg-gradient-to-b from-gray-800 to-gray-900 rounded-b-2xl shadow-xl"></div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-4 bg-gray-950 rounded-full shadow-2xl"></div>

          {/* TV Inner Bezel */}
          <div className="relative bg-black p-4 rounded-2xl shadow-inner">
            {/* Screen Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-transparent to-blue-600/10 rounded-2xl blur-2xl animate-pulse"></div>

            {/* Video Screen */}
            <div
              className="relative w-full bg-black overflow-hidden group"
              style={{ paddingBottom: "56.25%" }}
            >
              <div className="absolute inset-0">
                {/* Video iframe - Thay YOUR_VIDEO_URL bằng link video thực */}
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0`}
                  title={show.movie.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              {/* Screen Reflection Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </div>

          {/* TV Control Panel */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50 animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-gray-700"></div>
            <div className="w-3 h-3 rounded-full bg-gray-700"></div>
          </div>

          {/* TV Brand/Logo */}
          <div className="absolute top-1 left-5">
            <img
              src={assets.logo}
              alt="HusTV"
              className="h-12 w-auto opacity-70"
            />
          </div>

          {/* TV Speaker Grills */}
          <div className="absolute bottom-8 left-8 right-8 flex justify-center gap-1">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-8 bg-gray-700/50 rounded-full"
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Movies Section */}
      <div className="mt-24">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-1 w-12 bg-gradient-to-r from-blue-500 dark:from-red-600 to-transparent rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white drop-shadow-lg">
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
