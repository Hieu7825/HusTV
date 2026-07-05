// client/src/components/Pagination.jsx
import React from "react";
import { ArrowRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Hàm chuyển trang
  const goToPage = (pageNumber) => {
    onPageChange(pageNumber);
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  // Tạo mảng số trang để hiển thị với dots
  const getPageNumbers = () => {
    const pages = [];

    // Nếu tổng số trang <= 5, hiển thị tất cả
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Luôn thêm trang 1
    pages.push(1);

    // Xác định các trang cần hiển thị
    if (currentPage <= 3) {
      // Ở đầu: 1 2 3 4 ... 100
      pages.push(2);
      pages.push(3);
      if (currentPage === 3) {
        pages.push(4);
      }
      pages.push("dots-end");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Ở cuối: 1 ... 97 98 99 100
      pages.push("dots-start");
      if (currentPage === totalPages - 2) {
        pages.push(totalPages - 3);
      }
      pages.push(totalPages - 2);
      pages.push(totalPages - 1);
      pages.push(totalPages);
    } else {
      // Ở giữa: 1 ... 23 24 25 ... 100
      pages.push("dots-start");
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push("dots-end");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex justify-center items-center mt-15 gap-4 mb-10">
      {/* Previous Button */}
      <button
        onClick={goToPrevious}
        disabled={currentPage === 1}
        className="group flex items-center gap-2 px-6 py-3 text-sm light:text-gray-700 dark:text-gray-400 light:hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 light:border light:border-gray-400 dark:border dark:border-gray-700 light:hover:border-red-400/50 dark:hover:border-red-500/50 rounded-xl backdrop-blur-sm light:hover:bg-red-100/20 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg light:hover:shadow-red-400/10 dark:hover:shadow-red-500/10"
      >
        <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform duration-300" />
        <span>Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="flex gap-3">
        {getPageNumbers().map((page, index) => {
          // Nếu là dots, hiển thị "..." không click được
          if (page === "dots-start" || page === "dots-end") {
            return (
              <div key={`dots-${index}`} className="flex items-center px-3">
                <span className="light:text-gray-500 dark:text-gray-500 text-lg">
                  ...
                </span>
              </div>
            );
          }

          // Nếu là số trang, hiển thị button có thể click để chuyển trang
          return (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`w-12 h-12 rounded-xl font-bold transition-all duration-300 cursor-pointer relative z-10 ${
                page === currentPage
                  ? "bg-gradient-to-r from-red-600 to-red-700 light:from-red-600 light:to-red-700 dark:from-red-600 dark:to-red-700 text-white light:text-white dark:text-white shadow-xl light:shadow-red-400/30 dark:shadow-red-500/30 scale-110 border-2 light:border-red-400 dark:border-red-400"
                  : "light:bg-gray-200/50 dark:bg-gray-800/50 light:text-gray-700 dark:text-gray-400 light:hover:bg-red-100/20 dark:hover:bg-red-500/20 light:hover:text-red-600 dark:hover:text-red-400 light:border light:border-gray-400 dark:border dark:border-gray-700 light:hover:border-red-400/50 dark:hover:border-red-500/50 hover:scale-105 hover:shadow-lg"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={goToNext}
        disabled={currentPage === totalPages}
        className="group flex items-center gap-2 px-6 py-3 text-sm light:text-gray-700 dark:text-gray-400 light:hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 light:border light:border-gray-400 dark:border dark:border-gray-700 light:hover:border-red-400/50 dark:hover:border-red-500/50 rounded-xl backdrop-blur-sm light:hover:bg-red-100/20 dark:hover:bg-red-900/20 hover:shadow-lg light:hover:shadow-red-400/10 dark:hover:shadow-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>Next</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
      </button>
    </div>
  );
};

export default Pagination;
