// client/src/components/HeroSection.jsx
import React, { useState, useRef, useEffect } from "react";
import { Play, Film, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import timeFormat from "../lib/timeFormat";
import { videoService } from "../services";
import toast from "react-hot-toast";

const timeRunning = 2000;
const displayedThumbnails = 2;

const HeroSection = () => {
  const [carouselData, setCarouselData] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [carouselClass, setCarouselClass] = useState("");
  const [loading, setLoading] = useState(true);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [currentTrailer, setCurrentTrailer] = useState(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
  const runTimeOutRef = useRef(null);
  const navigate = useNavigate();

  // Fetch featured movies from API
  useEffect(() => {
    const fetchFeaturedMovies = async () => {
      try {
        setLoading(true);
        const response = await videoService.getAllVideos({
          featured: true,
          limit: 6,
          status: "published",
        });

        const movies = response.data?.videos || [];

        if (movies.length > 0) {
          setCarouselData(movies.slice(0, 6));
        } else {
          // Fallback: lấy 6 movies bất kỳ nếu không có featured
          const fallbackResponse = await videoService.getAllVideos({
            limit: 6,
            status: "published",
          });
          setCarouselData(fallbackResponse.data?.videos?.slice(0, 6) || []);
        }
      } catch (error) {
        console.error("Error fetching carousel movies:", error);
        toast.error("Failed to load featured movies");
        setCarouselData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedMovies();
  }, []);

  // Handle trailer playback
  const handleWatchTrailer = async (movie) => {
    if (!movie.trailer) {
      toast.error("Trailer not available for this movie");
      return;
    }

    setLoadingTrailer(true);
    setShowTrailerModal(true);

    try {
      // If trailer is a direct URL (from Cloudinary), use it directly
      if (movie.trailer.startsWith("http")) {
        setCurrentTrailer(movie.trailer);
      } else {
        // Otherwise, it might be a video ID that needs streaming URL
        const response = await videoService.getStreamingUrl(movie._id);
        setCurrentTrailer(response.data?.trailerUrl || movie.trailer);
      }
    } catch (error) {
      console.error("Error loading trailer:", error);
      toast.error("Failed to load trailer");
      setShowTrailerModal(false);
    } finally {
      setLoadingTrailer(false);
    }
  };

  // Close trailer modal
  const closeTrailerModal = () => {
    setShowTrailerModal(false);
    setCurrentTrailer(null);
  };

  const showSlider = (type) => {
    if (carouselData.length === 0) return;

    let newIndex = activeSlide;
    if (type === "next") {
      newIndex = (activeSlide + 1) % carouselData.length;
      setCarouselClass("next");
    } else {
      newIndex = (activeSlide - 1 + carouselData.length) % carouselData.length;
      setCarouselClass("prev");
    }
    setActiveSlide(newIndex);

    if (runTimeOutRef.current) {
      clearTimeout(runTimeOutRef.current);
    }
    runTimeOutRef.current = setTimeout(() => {
      setCarouselClass("");
    }, timeRunning);
  };

  // Auto-play carousel
  useEffect(() => {
    if (carouselData.length === 0 || showTrailerModal) return;

    const autoPlayInterval = setInterval(() => {
      showSlider("next");
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(autoPlayInterval);
  }, [activeSlide, carouselData, showTrailerModal]);

  const reorderedSlides = [
    ...carouselData.slice(activeSlide),
    ...carouselData.slice(0, activeSlide),
  ];

  const createLoopedThumbnails = () => {
    return [...carouselData, ...carouselData, ...carouselData];
  };

  const loopedThumbnails = createLoopedThumbnails();

  const thumbnailWidth = 150;
  const thumbnailGap = 20;
  const itemWidth = thumbnailWidth + thumbnailGap;

  const baseThumbnailOffset =
    carouselData.length * itemWidth + activeSlide * itemWidth;
  const centerOffset = ((displayedThumbnails - 1) * itemWidth) / 2;
  const finalThumbnailOffset = baseThumbnailOffset - centerOffset;

  if (loading) {
    return (
      <div className="carousel relative h-screen w-screen overflow-hidden flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl font-bold">
            Loading Featured Movies...
          </p>
        </div>
      </div>
    );
  }

  if (carouselData.length === 0) {
    return (
      <div className="carousel relative h-screen w-screen overflow-hidden flex items-center justify-center bg-black">
        <div className="text-center">
          <Film className="w-20 h-20 text-red-900/50 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-400 mb-2">
            No Featured Movies Available
          </h3>
          <p className="text-gray-500">Check back later for new content</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`carousel relative h-screen w-screen overflow-hidden ${carouselClass}`}
      >
        {/* list item */}
        <div className="list relative w-full h-full">
          {reorderedSlides.map((item, index) => (
            <div
              key={`${item._id}-${index}`}
              className={`item absolute inset-0 w-full h-full ${
                index === 0 ? "z-10" : ""
              }`}
              style={
                index !== 0
                  ? { transform: `translateX(${100 * index}%)`, opacity: 0 }
                  : {}
              }
            >
              <img
                src={item.backdrop_path || item.poster_path}
                className="w-full h-full object-cover"
                alt={item.title}
                onError={(e) => {
                  e.target.src = "/placeholder-backdrop.jpg";
                }}
              />
              <div className="content absolute top-[10%] left-1/2 -translate-x-1/2 w-full max-w-[80%] pr-[30%] box-border text-white drop-shadow-lg mt-[70px]">
                <h1 className="font-bold text-6xl whitespace-nowrap overflow-hidden text-ellipsis max-w-[calc(50vw - 100px)] text-white drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                  {item.title}
                </h1>
                <div className="details flex whitespace-nowrap mb-[-20px] text-shadow-sm">
                  <p className="font-bold text-2xl text-yellow-400 px-2 border-r-2 border-white">
                    {item.release_date
                      ? new Date(item.release_date).getFullYear()
                      : "N/A"}
                  </p>
                  <p className="font-bold text-2xl text-yellow-400 px-2 border-r-2 border-white">
                    {item.adult ? "18+" : "13+"}
                  </p>
                  <p className="font-bold text-2xl text-yellow-400 px-2 border-r-2 border-white">
                    {timeFormat(item.runtime)}
                  </p>
                  <p className="font-bold text-2xl text-yellow-400 px-2">
                    {item.genres && item.genres[0]
                      ? item.genres[0].name
                      : "Action"}
                  </p>
                </div>
                <h4 className="max-w-xs text-base leading-relaxed my-10 line-clamp-3 text-shadow-sm">
                  {item.overview || item.description}
                </h4>
                <div className="buttons flex gap-4">
                  {/* Play Button */}
                  <button
                    onClick={() => navigate(`/movies/${item._id}`)}
                    className="group relative px-8 py-3 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 hover:from-red-500 hover:via-orange-400 hover:to-yellow-400 text-white font-bold rounded-full transition-all duration-300 cursor-pointer hover:scale-105 shadow-lg hover:shadow-red-500/50 border-2 border-red-500/50 hover:border-red-400/70 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 via-orange-400/20 to-yellow-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex items-center gap-2">
                      <Play className="w-5 h-5 group-hover:animate-pulse" />
                      <span>Play Now</span>
                    </div>
                  </button>

                  {/* Trailer Button - UPDATED */}
                  {item.trailer && (
                    <button
                      onClick={() => handleWatchTrailer(item)}
                      className="group relative px-8 py-3 bg-black/80 hover:bg-black/60 text-white font-bold rounded-full transition-all duration-300 cursor-pointer hover:scale-105 shadow-lg hover:shadow-white/30 border-2 border-white/50 hover:border-white/80 backdrop-blur-sm overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10 flex items-center gap-2">
                        <Film className="w-5 h-5 group-hover:animate-bounce" />
                        <span>Watch Trailer</span>
                      </div>
                    </button>
                  )}
                </div>

                {/* Video Preview - REMOVED (hoặc giữ lại nếu muốn preview nhỏ) */}
                {/* Bỏ phần video preview nhỏ vì giờ có modal fullscreen */}
              </div>
            </div>
          ))}
        </div>

        {/* list thumbnail */}
        <div
          className="thumbnail-wrapper absolute bottom-20 -right-40 -translate-x-1/2 z-20 overflow-hidden"
          style={{
            width: `${displayedThumbnails * itemWidth - thumbnailGap}px`,
          }}
        >
          <div
            className="thumbnail flex gap-5 bg-gray-600/40 backdrop-blur-md rounded-tl-full rounded-bl-full shadow-xl transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${finalThumbnailOffset}px)` }}
          >
            {loopedThumbnails.map((item, index) => {
              const originalIndex = index % carouselData.length;
              const isActive = originalIndex === activeSlide;

              return (
                <div
                  key={`${item._id}-thumb-${index}`}
                  className={`item w-[150px] h-[220px] flex-shrink-0 relative cursor-pointer ${
                    isActive ? "active-thumbnail" : ""
                  }`}
                  onClick={() => setActiveSlide(originalIndex)}
                >
                  <img
                    src={item.poster_path || item.backdrop_path}
                    className={`w-full h-full object-cover rounded-full mix-blend-lighten transition-all duration-300 ${
                      isActive ? "opacity-100 scale-110" : "opacity-70"
                    }`}
                    alt={`Thumbnail for ${item.title}`}
                    onError={(e) => {
                      e.target.src = "/placeholder-thumbnail.jpg";
                    }}
                  />
                  <div className="thum-content text-white absolute bottom-2 left-10 right-2">
                    <div
                      className={`title font-medium ${
                        isActive ? "text-yellow-400" : ""
                      }`}
                    >
                      {item.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="arrows absolute bottom-5 -right-20 z-50 w-72 max-w-[30%] flex gap-2.5 items-center">
          <button
            id="prev"
            onClick={() => showSlider("prev")}
            className="w-12 h-12 rounded-full bg-black/80 hover:bg-red-600 border-2 border-white/30 hover:border-red-400 text-white text-2xl font-bold transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-red-500/50 hover:scale-105 backdrop-blur-sm"
          >
            &lt;
          </button>
          <button
            id="next"
            onClick={() => showSlider("next")}
            className="w-12 h-12 rounded-full bg-black/80 hover:bg-red-600 border-2 border-white/30 hover:border-red-400 text-white text-2xl font-bold transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-red-500/50 hover:scale-105 backdrop-blur-sm"
          >
            &gt;
          </button>
        </div>

        {/* Time Running Bar */}
        <div className="time absolute z-[1000] w-0 h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 left-0 top-0 shadow-lg"></div>
      </div>

      {/* Trailer Modal - NEW */}
      {showTrailerModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl shadow-red-900/50 border-2 border-red-900/30">
            {/* Close Button */}
            <button
              onClick={closeTrailerModal}
              className="absolute top-4 right-4 z-50 p-3 bg-black/80 hover:bg-red-600 rounded-full text-white transition-all duration-300 hover:scale-110 hover:rotate-90 border-2 border-white/30 hover:border-red-400 backdrop-blur-sm"
              aria-label="Close trailer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Loading State */}
            {loadingTrailer ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-16 h-16 text-red-500 animate-spin mx-auto mb-4" />
                  <p className="text-white text-xl font-bold">
                    Loading Trailer...
                  </p>
                </div>
              </div>
            ) : (
              /* Video Player */
              currentTrailer && (
                <video
                  src={currentTrailer}
                  controls
                  autoPlay
                  className="w-full h-full"
                  onError={(e) => {
                    console.error("Trailer playback error:", e);
                    toast.error("Failed to play trailer");
                  }}
                >
                  <source src={currentTrailer} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )
            )}

            {/* Trailer Info Overlay */}
            {!loadingTrailer && currentTrailer && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                <div className="flex items-center gap-3">
                  <Film className="w-6 h-6 text-red-500" />
                  <h3 className="text-white text-xl font-bold">
                    {carouselData[activeSlide]?.title} - Trailer
                  </h3>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default HeroSection;
