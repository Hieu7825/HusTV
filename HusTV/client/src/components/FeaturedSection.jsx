import React from "react";
import { useNavigate } from "react-router-dom";
import BlurCircle from "./BlurCircle";
import { dummyShowsData } from "../assets/assets";
import { ArrowRight, Film, Sparkles } from "lucide-react";
import MovieCard from "./MovieCard";

const FeaturedSection = () => {
  const navigate = useNavigate();
  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden">
      <div className="relative flex items-center justify-between pt-20 pb-10">
        <BlurCircle top="0" right="-80px" />

        {/* Enhanced "Now Showing" Section */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Film className="w-6 h-6 text-red-500 animate-pulse" />
            <Sparkles className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1 animate-bounce" />
          </div>
          <div className="relative">
            <h2 className="gradient text-2xl md:text-3xl font-bold tracking-wide uppercase letter-spacing-2 transform hover:scale-105 transition-all duration-300">
              🔥 Now Showing
            </h2>
            <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-red-600 via-red-500 to-transparent animate-pulse"></div>
          </div>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce delay-75"></div>
            <div className="w-2 h-2 bg-red-300 rounded-full animate-bounce delay-150"></div>
          </div>
        </div>

        <button
          onClick={() => navigate("/movies")}
          className="group flex items-center gap-2 px-4 py-2 text-sm text-gray-300 cursor-pointer hover:text-red-400 transition-all duration-300 border border-transparent hover:border-red-500/50 rounded-lg backdrop-blur-sm hover:bg-red-900/20"
        >
          <span className="group-hover:animate-pulse">View All</span>
          <ArrowRight className="group-hover:translate-x-1 group-hover:text-red-400 transition-all duration-300 w-4.5 h-4.5" />
        </button>
      </div>

      <div className="flex flex-wrap max-sm:justify-center gap-8 mt-8">
        {dummyShowsData.slice(0, 6).map((show, index) => (
          <div
            key={show._id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <MovieCard movie={show} />
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-20">
        <button
          onClick={() => {
            navigate("/movies"), scrollTo(0, 0);
          }}
          className="group relative px-12 py-4 text-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white transition-all duration-300 rounded-lg font-medium cursor-pointer shadow-lg hover:shadow-red-500/50 hover:scale-105 border border-red-500/50"
        >
          <span className="relative z-10">Show More Movies</span>
          <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>
    </div>
  );
};

export default FeaturedSection;
