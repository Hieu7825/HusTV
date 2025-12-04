import React, { useState, useEffect } from "react";

const Snowflake = ({ id, style }) => {
  return (
    <div className="absolute pointer-events-none" style={style}>
      <div
        className="relative flex items-center justify-center"
        style={{
          width: "100%",
          height: "100%",
          animation: `spin ${20 + Math.random() * 10}s linear infinite`,
        }}
      >
        {/* 6 cánh tuyết */}
        {[0, 60, 120, 180, 240, 300].map((rotation, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              width: "40%",
              height: "50%",
              bottom: "50%",
              transformOrigin: "bottom center",
              transform: `rotate(${rotation}deg)`,
            }}
          >
            {/* Mũi nhọn */}
            <div
              className="absolute bg-blue-50/30 shadow-sm"
              style={{
                top: "10%",
                left: "50%",
                width: "28%",
                height: "28%",
                borderTop: "2px solid #29b6f6",
                borderLeft: "2px solid #29b6f6",
                transform: "translateX(-100%) rotate(45deg)",
                transformOrigin: "bottom right",
                boxShadow:
                  "-1px -1px 3px #4fc3f7, inset 1px 1px 2px rgba(41, 182, 246, 0.2)",
              }}
            />

            {/* Thân cánh */}
            <div
              className="absolute bg-blue-50/30"
              style={{
                top: "20%",
                width: "100%",
                height: "80%",
                border: "2px solid #29b6f6",
                borderTop: "none",
                boxShadow: "0 0 3px #4fc3f7, inset 0 0 3px #4fc3f7",
              }}
            >
              {/* Chi tiết bên trong */}
              <div
                className="absolute left-1/2 -translate-x-1/2 opacity-70"
                style={{
                  top: "30%",
                  width: "50%",
                  height: "60%",
                  border: "2px solid #039be5",
                  borderTop: "none",
                  borderBottomLeftRadius: "8px",
                  borderBottomRightRadius: "8px",
                }}
              />

              {/* Gai hai bên */}
              <div
                className="absolute left-1/2 bg-blue-50/20"
                style={{
                  top: "35%",
                  width: "50%",
                  height: "50%",
                  border: "2px solid #29b6f6",
                  borderBottom: "none",
                  borderRight: "none",
                  transform: "translateX(-50%) rotate(45deg)",
                  boxShadow: "-2px -2px 4px rgba(41, 182, 246, 0.4)",
                }}
              />
            </div>
          </div>
        ))}

        {/* Tâm lục giác */}
        <div
          className="absolute bg-blue-50 z-10"
          style={{
            width: "36%",
            height: "36%",
            border: "2px solid #29b6f6",
            clipPath:
              "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            boxShadow: "0 0 8px #4fc3f7",
          }}
        />
      </div>

      {/* ✅ FIX: Chuyển style tag ra ngoài và dùng dangerouslySetInnerHTML */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
            @keyframes fall {
              to {
                transform: translateY(100vh) translateX(var(--drift));
              }
            }
          `,
        }}
      />
    </div>
  );
};

const SnowflakeBackground = () => {
  const [snowflakes, setSnowflakes] = useState([]);

  useEffect(() => {
    const createSnowflake = () => {
      const size = Math.random() * 30 + 15; // 15-45px, ưu tiên nhỏ
      const startX = Math.random() * 100; // vị trí bắt đầu (%)
      const duration = Math.random() * 10 + 15; // 15-25s
      const delay = Math.random() * 5; // 0-5s
      const drift = (Math.random() - 0.5) * 100; // drift ngang khi rơi

      return {
        id: Date.now() + Math.random(),
        size,
        startX,
        duration,
        delay,
        drift,
      };
    };

    // Tạo bông tuyết ban đầu
    const initialSnowflakes = Array.from({ length: 8 }, () =>
      createSnowflake()
    );
    setSnowflakes(initialSnowflakes);

    // Thêm bông tuyết mới định kỳ
    const interval = setInterval(() => {
      setSnowflakes((prev) => {
        if (prev.length < 12) {
          return [...prev, createSnowflake()];
        }
        return prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 9999 }}
    >
      {snowflakes.map((flake) => (
        <Snowflake
          key={flake.id}
          id={flake.id}
          style={{
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            left: `${flake.startX}%`,
            top: "-50px",
            animation: `fall ${flake.duration}s linear ${flake.delay}s infinite`,
            "--drift": `${flake.drift}px`,
          }}
        />
      ))}
    </div>
  );
};

export default SnowflakeBackground;
