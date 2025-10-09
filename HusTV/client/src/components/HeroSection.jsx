import React, { useState, useRef } from "react";
import { Play, Film } from "lucide-react";

import { dummyShowsData } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import timeFormat from "../lib/timeFormat";

// Use dummyShowsData instead of carouselData
const carouselData = dummyShowsData.slice(0, 6); // Lấy 6 phần tử đầu tiên làm ví dụ

const timeRunning = 2000; // 2 seconds for animation
const displayedThumbnails = 2; // Số lượng thumbnail muốn hiển thị cùng lúc

const HeroSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [carouselClass, setCarouselClass] = useState("");
  const runTimeOutRef = useRef(null);
  const navigate = useNavigate();

  const showSlider = (type) => {
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

  // Sắp xếp lại danh sách slide
  const reorderedSlides = [
    ...carouselData.slice(activeSlide),
    ...carouselData.slice(0, activeSlide),
  ];

  // Tạo danh sách thumbnail có thể loop
  const createLoopedThumbnails = () => {
    // Tạo mảng thumbnail gấp 3 lần để có thể scroll mượt mà
    const extendedThumbnails = [
      ...carouselData,
      ...carouselData,
      ...carouselData,
    ];
    return extendedThumbnails;
  };

  const loopedThumbnails = createLoopedThumbnails();

  // Tính toán offset cho thumbnail với logic loop
  const thumbnailWidth = 150;
  const thumbnailGap = 20;
  const itemWidth = thumbnailWidth + thumbnailGap;

  // Offset để active thumbnail luôn ở giữa vùng hiển thị
  const baseThumbnailOffset =
    carouselData.length * itemWidth + activeSlide * itemWidth;

  // Điều chỉnh để thumbnail active hiển thị ở vị trí mong muốn
  const centerOffset = ((displayedThumbnails - 1) * itemWidth) / 2;
  const finalThumbnailOffset = baseThumbnailOffset - centerOffset;

  return (
    <div
      className={`carousel relative h-screen w-screen overflow-hidden ${carouselClass}`}
    >
      {/* list item */}
      <div className="list relative w-full h-full">
        {reorderedSlides.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
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
              src={item.backdrop_path || item.image}
              className="w-full h-full object-cover"
              alt={item.title}
            />
            <div className="content absolute top-[10%] left-1/2 -translate-x-1/2 w-full max-w-[80%] pr-[30%] box-border text-white drop-shadow-lg mt-[70px]">
              <h1 className="font-bold text-6xl whitespace-nowrap overflow-hidden text-ellipsis max-w-[calc(50vw - 100px)] text-white drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                {item.title}
              </h1>
              <div className="details flex whitespace-nowrap mb-[-20px] text-shadow-sm">
                <p className="font-bold text-2xl text-yellow-400 px-2 border-r-2 border-white">
                  {new Date(item.release_date).getFullYear()}
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
                {/* Enhanced Play Button */}
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

                {/* Enhanced Trailer Button */}
                <button className="group relative px-8 py-3 bg-black/80 hover:bg-black/60 text-white font-bold rounded-full transition-all duration-300 cursor-pointer hover:scale-105 shadow-lg hover:shadow-white/30 border-2 border-white/50 hover:border-white/80 backdrop-blur-sm overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex items-center gap-2">
                    <Film className="w-5 h-5 group-hover:animate-bounce" />
                    <span>Watch Trailer</span>
                  </div>
                </button>
              </div>
              <div className="vid-box border-4 border-gradient-to-r from-red-600 to-yellow-500 w-64 h-36 rounded-2xl mt-10 overflow-hidden shadow-xl hover:shadow-red-500/50 transition-all duration-300 hover:scale-105">
                <video
                  src={item.video || ""}
                  type="video/mp4"
                  controls
                  className="vid-trailer w-full h-full bg-gray-800 "
                  poster={item.backdrop_path || item.image}
                ></video>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* list thumbnail */}
      <div
        className="thumbnail-wrapper absolute bottom-20 -right-40 -translate-x-1/2 z-20 overflow-hidden"
        style={{ width: `${displayedThumbnails * itemWidth - thumbnailGap}px` }}
      >
        <div
          className="thumbnail flex gap-5 bg-gray-600/40 backdrop-blur-md rounded-tl-full rounded-bl-full shadow-xl transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${finalThumbnailOffset}px)` }}
        >
          {loopedThumbnails.map((item, index) => {
            // Xác định xem thumbnail này có phải là active không
            const originalIndex = index % carouselData.length;
            const isActive = originalIndex === activeSlide;

            return (
              <div
                key={`${item.id}-thumb-${index}`}
                className={`item w-[150px] h-[220px] flex-shrink-0 relative cursor-pointer ${
                  isActive ? "active-thumbnail" : ""
                }`}
                onClick={() => setActiveSlide(originalIndex)}
              >
                <img
                  src={item.backdrop_path || item.image}
                  className={`w-full h-full object-cover rounded-full mix-blend-lighten transition-all duration-300 ${
                    isActive ? "opacity-100 scale-110" : "opacity-70"
                  }`}
                  alt={`Thumbnail for ${item.title}`}
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

      {/* Enhanced Navigation Arrows */}
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

      {/* Enhanced Time Running Bar */}
      <div className="time absolute z-[1000] w-0 h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 left-0 top-0 shadow-lg"></div>
    </div>
  );
};

export default HeroSection;
