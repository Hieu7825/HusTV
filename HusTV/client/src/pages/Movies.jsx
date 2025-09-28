import React from "react";
import { dummyShowsData } from "../assets/assets";
import MovieCard from "../components/MovieCard";
import BlurCircle from "../components/BlurCircle";
import { Film, Sparkles, Search, Filter, ArrowRight } from "lucide-react";

const Movies = () => {
  return dummyShowsData.length > 0 ? (
    <div className="relative my-20 mb-60 px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden min-h-[80vh]">
      {/* Background Effects */}
      <BlurCircle top="150px" left="-80px" />
      <BlurCircle bottom="50px" right="50px" />

      {/* Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full grid-background" />
      </div>

      {/* Enhanced Header Section - Centered Title */}
      <div className="relative flex justify-center pt-20 pb-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Film className="w-8 h-8 text-red-500 animate-pulse" />
            <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-bounce" />
          </div>
          <div className="relative">
            <h2 className="gradient-text text-4xl md:text-5xl font-bold tracking-wide uppercase letter-spacing-2 transform hover:scale-105 transition-all duration-300">
              🎬 All Movies
            </h2>
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 animate-pulse rounded-full"></div>
          </div>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-red-400 rounded-full animate-bounce delay-75"></div>
            <div className="w-3 h-3 bg-red-300 rounded-full animate-bounce delay-150"></div>
          </div>
        </div>
      </div>

      {/* Enhanced Search Section - Much More Prominent */}
      <div className="flex justify-center mb-20">
        <div className="relative w-full max-w-4xl mx-auto search-container">
          <div className="relative flex items-center justify-center">
            {/* Animated Background Effects - Enhanced visibility */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div className="glow-effect"></div>
              <div className="dark-border-bg"></div>
              <div className="dark-border-bg"></div>
              <div className="dark-border-bg"></div>
              <div className="white-effect"></div>
              <div className="border-effect"></div>
            </div>

            {/* Main Search Container - Much more visible */}
            <div className="relative z-10 group w-full">
              <input
                type="text"
                placeholder="🔍 Search for movies, actors, directors, genres and more..."
                className="search-input w-full h-20 px-24 border-none rounded-2xl text-white text-xl placeholder-gray-300 focus:outline-none transition-all duration-300 font-medium focus:placeholder-gray-200"
              />

              {/* Reduced Input Mask Effect */}
              <div className="input-mask top-6 left-24" />

              {/* Reduced Pink Glow Effect */}
              <div className="pink-mask top-4 left-3" />

              {/* Enhanced Search Icon with better visibility */}
              <div className="absolute left-8 top-1/2 transform -translate-y-1/2 z-20 search-icon-container">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={32}
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  height={32}
                  fill="none"
                  className="feather feather-search transition-all duration-300 hover:scale-110"
                >
                  <circle stroke="url(#search)" r={8} cy={11} cx={11} />
                  <line
                    stroke="url(#searchl)"
                    y2="16.65"
                    y1={22}
                    x2="16.65"
                    x1={22}
                  />
                  <defs>
                    <linearGradient gradientTransform="rotate(50)" id="search">
                      <stop stopColor="#ff6b6b" offset="0%" />
                      <stop stopColor="#ee5a24" offset="50%" />
                    </linearGradient>
                    <linearGradient id="searchl">
                      <stop stopColor="#ee5a24" offset="0%" />
                      <stop stopColor="#ff3838" offset="50%" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Icon glow effect */}
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-lg -z-10"></div>
              </div>

              {/* Enhanced Filter Button with better visibility */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20">
                <div className="filter-border"></div>
                <div className="filter-button w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer group hover:scale-105">
                  <svg
                    preserveAspectRatio="none"
                    height={28}
                    width={28}
                    viewBox="4.8 4.56 14.832 15.408"
                    fill="none"
                  >
                    <path
                      d="M8.16 6.65002H15.83C16.47 6.65002 16.99 7.17002 16.99 7.81002V9.09002C16.99 9.56002 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55002 7 9.20002V7.87002C7 7.17002 7.52 6.65002 8.16 6.65002Z"
                      stroke="#ff6b6b"
                      strokeWidth={1.5}
                      strokeMiterlimit={10}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="group-hover:stroke-red-400 transition-colors duration-300"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Search Tips - Optional Enhancement */}
          <div className="absolute -bottom-8 left-0 right-0 text-center">
            <p className="text-gray-400 text-sm">
              <span className="text-red-400">✨</span> Try searching by movie
              title, actor, genre, or year
            </p>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="flex flex-wrap gap-8 max-sm:justify-center">
        {dummyShowsData.map((movie, index) => (
          <div
            key={movie._id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>

      {/* Enhanced Pagination Section */}
      <div className="flex justify-center items-center mt-15 gap-4 mb-10">
        {/* Previous Button */}
        <button className="group flex items-center gap-2 px-6 py-3 text-sm text-gray-400 hover:text-red-400 transition-all duration-300 border border-gray-700 hover:border-red-500/50 rounded-xl backdrop-blur-sm hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-red-500/10">
          <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform duration-300" />
          <span>Previous</span>
        </button>

        {/* Page Numbers */}
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((page) => (
            <button
              key={page}
              className={`w-12 h-12 rounded-xl font-bold transition-all duration-300 ${
                page === 1
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-xl shadow-red-500/30 scale-110 border-2 border-red-400"
                  : "bg-gray-800/50 text-gray-400 hover:bg-red-500/20 hover:text-red-400 border border-gray-700 hover:border-red-500/50 hover:scale-105 hover:shadow-lg"
              }`}
            >
              {page}
            </button>
          ))}

          {/* Dots */}
          <div className="flex items-center px-3">
            <span className="text-gray-500 text-lg">...</span>
          </div>

          <button className="w-12 h-12 rounded-xl font-bold bg-gray-800/50 text-gray-400 hover:bg-red-500/20 hover:text-red-400 border border-gray-700 hover:border-red-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg">
            12
          </button>
        </div>

        {/* Next Button */}
        <button className="group flex items-center gap-2 px-6 py-3 text-sm text-gray-400 hover:text-red-400 transition-all duration-300 border border-gray-700 hover:border-red-500/50 rounded-xl backdrop-blur-sm hover:bg-red-900/20 hover:shadow-lg hover:shadow-red-500/10">
          <span>Next</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-screen animate-fade-in">
      <div className="relative mb-8">
        <Film className="w-24 h-24 text-gray-600 animate-pulse" />
        <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
      </div>
      <h1 className="text-4xl font-bold text-center gradient-text mb-4">
        No Movies Available
      </h1>
      <p className="text-gray-500 text-center max-w-md">
        It looks like there are no movies in the database right now. Please
        check back later!
      </p>
    </div>
  );
};

export default Movies;
