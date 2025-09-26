import React, { useState } from "react";

const Switch = () => {
  // Sử dụng state để quản lý trạng thái của checkbox
  const [isChecked, setIsChecked] = useState(false); // defaultChecked="darkTheme" -> giả sử ban đầu nó không được checked
  // Nếu bạn muốn nó checked mặc định, đặt là true

  const handleToggle = () => {
    setIsChecked(!isChecked);
  };

  return (
    <div className="relative inline-block w-[60px] h-[34px]">
      {" "}
      {/* switch */}
      <label className="switch">
        <input
          id="input"
          type="checkbox"
          className="sr-only" // opacity: 0; width: 0; height: 0;
          checked={isChecked} // Controlled component
          onChange={handleToggle}
        />
        <div
          className={`
            absolute cursor-pointer top-0 left-0 right-0 bottom-0
            ${isChecked ? "bg-black" : "bg-blue-500"} /* Màu nền slider */
            transition-colors duration-400 ease-in-out
            z-0 overflow-hidden rounded-full
          `} // slider, slider.round
        >
          <div
            className={`
              absolute content-[''] h-[26px] w-[26px] left-[4px] bottom-[4px]
              ${
                isChecked
                  ? "bg-white transform translate-x-[26px] animate-[rotate-center_0.6s_ease-in-out_both]"
                  : "bg-yellow-400"
              } /* sun-moon, input:checked + .slider .sun-moon */
              transition-transform duration-400 ease-in-out rounded-full
            `} // sun-moon, slider.round .sun-moon
          >
            {/* Moon Dots */}
            <svg
              id="moon-dot-1"
              className={`absolute z-40 w-[6px] h-[6px] fill-gray-400 ${
                isChecked ? "opacity-100" : "opacity-0"
              } transition-opacity duration-400 left-[10px] top-[3px]`}
              viewBox="0 0 100 100"
            >
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg
              id="moon-dot-2"
              className={`absolute z-40 w-[10px] h-[10px] fill-gray-400 ${
                isChecked ? "opacity-100" : "opacity-0"
              } transition-opacity duration-400 left-[2px] top-[10px]`}
              viewBox="0 0 100 100"
            >
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg
              id="moon-dot-3"
              className={`absolute z-40 w-[3px] h-[3px] fill-gray-400 ${
                isChecked ? "opacity-100" : "opacity-0"
              } transition-opacity duration-400 left-[16px] top-[18px]`}
              viewBox="0 0 100 100"
            >
              <circle cx={50} cy={50} r={50} />
            </svg>

            {/* Light Rays */}
            <svg
              id="light-ray-1"
              className="absolute z-[-1] w-[43px] h-[43px] fill-white opacity-10 left-[-8px] top-[-8px]"
              viewBox="0 0 100 100"
            >
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg
              id="light-ray-2"
              className="absolute z-[-1] w-[55px] h-[55px] fill-white opacity-10 left-[-50%] top-[-50%]"
              viewBox="0 0 100 100"
            >
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg
              id="light-ray-3"
              className="absolute z-[-1] w-[60px] h-[60px] fill-white opacity-10 left-[-18px] top-[-18px]"
              viewBox="0 0 100 100"
            >
              <circle cx={50} cy={50} r={50} />
            </svg>

            {/* Clouds */}
            <svg
              id="cloud-1"
              className={`absolute fill-gray-300 animate-[cloud-move_6s_infinite] left-[30px] top-[15px] w-[40px] ${
                isChecked ? "hidden" : ""
              }`}
              viewBox="0 0 100 100"
            >
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg
              id="cloud-2"
              className={`absolute fill-gray-300 animate-[cloud-move_6s_infinite] left-[44px] top-[10px] w-[20px] ${
                isChecked ? "hidden" : ""
              }`}
              viewBox="0 0 100 100"
            >
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg
              id="cloud-3"
              className={`absolute fill-gray-300 animate-[cloud-move_6s_infinite] left-[18px] top-[24px] w-[30px] ${
                isChecked ? "hidden" : ""
              }`}
              viewBox="0 0 100 100"
            >
              <circle cx={50} cy={50} r={50} />
            </svg>
            {/* Clouds cho Dark Theme (giả sử bạn muốn ẩn chúng khi ở light theme và hiện khi ở dark theme) */}
            <svg
              id="cloud-4"
              className={`absolute fill-gray-200 animate-[cloud-move_6s_infinite_1s] left-[36px] top-[18px] w-[40px] ${
                !isChecked ? "hidden" : ""
              }`}
              viewBox="0 0 100 100"
            >
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg
              id="cloud-5"
              className={`absolute fill-gray-200 animate-[cloud-move_6s_infinite_1s] left-[48px] top-[14px] w-[20px] ${
                !isChecked ? "hidden" : ""
              }`}
              viewBox="0 0 100 100"
            >
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg
              id="cloud-6"
              className={`absolute fill-gray-200 animate-[cloud-move_6s_infinite_1s] left-[22px] top-[26px] w-[30px] ${
                !isChecked ? "hidden" : ""
              }`}
              viewBox="0 0 100 100"
            >
              <circle cx={50} cy={50} r={50} />
            </svg>
          </div>
          <div
            className={`
              transition-all duration-400 ease-in-out
              ${
                isChecked
                  ? "transform translate-y-0 opacity-100"
                  : "transform -translate-y-[32px] opacity-0"
              }
            `} // stars
          >
            {/* Stars */}
            <svg
              id="star-1"
              className="absolute fill-white animate-[star-twinkle_2s_infinite_0.3s] w-[20px] top-[2px] left-[3px]"
              viewBox="0 0 20 20"
            >
              <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" />
            </svg>
            <svg
              id="star-2"
              className="absolute fill-white animate-[star-twinkle_2s_infinite] w-[6px] top-[16px] left-[3px]"
              viewBox="0 0 20 20"
            >
              <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" />
            </svg>
            <svg
              id="star-3"
              className="absolute fill-white animate-[star-twinkle_2s_infinite_0.6s] w-[12px] top-[20px] left-[10px]"
              viewBox="0 0 20 20"
            >
              <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" />
            </svg>
            <svg
              id="star-4"
              className="absolute fill-white animate-[star-twinkle_2s_infinite_1.3s] w-[18px] top-[0px] left-[18px]"
              viewBox="0 0 20 20"
            >
              <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" />
            </svg>
          </div>
        </div>
      </label>
    </div>
  );
};

export default Switch;
