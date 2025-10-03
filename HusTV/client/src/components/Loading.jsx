import React from "react";

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] mt-16 -mb-16">
      <div className="flex items-center justify-center w-32 h-32 relative">
        {/* Head */}
        <div className="head absolute w-full h-full bg-[#ff5555] rounded-full shadow-[0_1rem_1rem_#cc0000] blur-[0.3rem] z-[1]" />

        {/* Flames */}
        <div className="flames absolute z-0">
          <div className="particle particle-1 absolute bg-[#ff5555] rounded-full blur-[0.3rem] border-t-[5px] border-t-[#cc0000] border-l-[5px] border-l-[#cc0000] w-16 h-16 -top-24" />
          <div className="particle particle-2 absolute bg-[#ff5555] rounded-full blur-[0.3rem] border-t-[5px] border-t-[#cc0000] border-l-[5px] border-l-[#cc0000] w-6 h-6 -top-32 -left-20" />
          <div className="particle particle-3 absolute bg-[#ff5555] rounded-full blur-[0.3rem] border-t-[5px] border-t-[#cc0000] border-l-[5px] border-l-[#cc0000] w-16 h-16 -top-20 -left-16" />
          <div className="particle particle-4 absolute bg-[#ff5555] rounded-full blur-[0.3rem] border-t-[5px] border-t-[#cc0000] border-l-[5px] border-l-[#cc0000] w-12 h-12 -top-[7.5rem]" />
          <div className="particle particle-5 absolute bg-[#ff5555] rounded-full blur-[0.3rem] border-t-[5px] border-t-[#cc0000] border-l-[5px] border-l-[#cc0000] w-8 h-8 -top-36 left-4" />
          <div className="particle particle-6 absolute bg-[#ff5555] rounded-full blur-[0.3rem] border-t-[5px] border-t-[#cc0000] border-l-[5px] border-l-[#cc0000] w-8 h-8 -top-[6.8rem] -left-6" />
          <div className="particle particle-7 absolute bg-[#ff5555] rounded-full blur-[0.3rem] border-t-[5px] border-t-[#cc0000] border-l-[5px] border-l-[#cc0000] w-4 h-4 -top-40 -left-4" />
          <div className="particle particle-8 absolute bg-[#ff5555] rounded-full blur-[0.3rem] border-t-[5px] border-t-[#cc0000] border-l-[5px] border-l-[#cc0000] w-[1.3rem] h-[1.3rem] -top-[7.5rem] -left-8" />
        </div>

        {/* Eye */}
        <div
          className="eye absolute flex items-center justify-center w-16 h-16 rounded-full z-[2] shadow-[0_0_1rem_#ff3333]"
          style={{
            background:
              "radial-gradient(rgba(255, 247, 247, 1) 20%, rgba(255, 150, 150, 1) 100%)",
          }}
        />
      </div>

      {/* Loading Text */}
      <div className="loading-text mt-8 text-2xl font-bold text-red-500">
        Loading...
      </div>
    </div>
  );
};

export default Loading;
