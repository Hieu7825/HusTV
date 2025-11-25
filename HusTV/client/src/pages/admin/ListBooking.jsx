// client/src/pages/admin/ListBooking.jsx
import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Ticket,
  User,
  CreditCard,
  Calendar,
  DollarSign,
  Crown,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { dummyBookingData } from "../../assets/assets";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import Loading from "../../components/Loading";
import Pagination from "../../components/Pagination";

const ListBooking = () => {
  const currency = "$";
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 10;

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBookings(dummyBookingData);
      setLoading(false);
    }, 500);
  }, []);

  // Filter bookings based on search
  const filteredBookings = bookings.filter(
    (booking) =>
      booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.subscriptionPlan.planName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort bookings
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue, bValue;

    switch (sortConfig.key) {
      case "userName":
        aValue = a.user.name.toLowerCase();
        bValue = b.user.name.toLowerCase();
        break;
      case "planName":
        aValue = a.subscriptionPlan.planName.toLowerCase();
        bValue = b.subscriptionPlan.planName.toLowerCase();
        break;
      case "purchaseDate":
        aValue = new Date(a.purchaseDate).getTime();
        bValue = new Date(b.purchaseDate).getTime();
        break;
      case "expiryDate":
        aValue = new Date(a.expiryDate).getTime();
        bValue = new Date(b.expiryDate).getTime();
        break;
      case "amount":
        aValue = a.amount;
        bValue = b.amount;
        break;
      case "status":
        aValue = a.status.toLowerCase();
        bValue = b.status.toLowerCase();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedBookings.length / bookingsPerPage);
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = sortedBookings.slice(
    indexOfFirstBooking,
    indexOfLastBooking
  );

  // Reset về trang 1 khi search hoặc sort thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 text-gray-500" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-4 h-4 text-red-500" />
    ) : (
      <ArrowDown className="w-4 h-4 text-red-500" />
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-950/30 text-green-400 border-green-600/50";
      case "Expired":
        return "bg-gray-950/30 text-gray-400 border-gray-600/50";
      case "Cancelled":
        return "bg-red-950/30 text-red-400 border-red-600/50";
      default:
        return "bg-gray-950/30 text-gray-400 border-gray-600/50";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="w-3 h-3" />;
      case "Expired":
        return <Clock className="w-3 h-3" />;
      case "Cancelled":
        return <XCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getTierColor = (tierRank) => {
    if (tierRank >= 5) return "text-red-400";
    if (tierRank >= 4) return "text-orange-400";
    if (tierRank >= 3) return "text-yellow-400";
    if (tierRank >= 2) return "text-blue-400";
    return "text-gray-400";
  };

  const totalRevenue = bookings.reduce((sum, b) => sum + b.amount, 0);
  const activeBookings = bookings.filter((b) => b.status === "Active").length;
  const expiredBookings = bookings.filter((b) => b.status === "Expired").length;

  return loading ? (
    <Loading />
  ) : (
    <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <BlurCircle top="10%" left="10%" />
        <BlurCircle top="60%" left="70%" />
        <div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-red-700/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Title text1="List" text2="Bookings" />
              <p className="text-gray-400 text-lg mt-2 ml-1">
                Total:{" "}
                <span className="text-red-500 font-bold">
                  {bookings.length}
                </span>{" "}
                bookings
                {searchTerm && (
                  <span className="text-gray-500">
                    {" "}
                    • Showing{" "}
                    <span className="text-red-400 font-bold">
                      {sortedBookings.length}
                    </span>{" "}
                    results
                  </span>
                )}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-4">
              <div className="bg-gradient-to-br from-zinc-950 via-black to-zinc-950 border-2 border-red-900/30 rounded-xl px-6 py-3">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">
                  Total Revenue
                </p>
                <p className="text-2xl font-black text-green-500">
                  {currency}
                  {totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-zinc-950 via-black to-zinc-950 border-2 border-green-900/30 rounded-xl px-6 py-3">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">
                  Active
                </p>
                <p className="text-2xl font-black text-green-400">
                  {activeBookings}
                </p>
              </div>
              <div className="bg-gradient-to-br from-zinc-950 via-black to-zinc-950 border-2 border-gray-900/30 rounded-xl px-6 py-3">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">
                  Expired
                </p>
                <p className="text-2xl font-black text-gray-400">
                  {expiredBookings}
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative flex items-center bg-gradient-to-br from-zinc-950 via-black to-zinc-950 border-2 border-red-900/30 rounded-xl overflow-hidden group-hover:border-red-700/50 transition-all duration-300">
              <Search className="w-5 h-5 text-red-500 ml-4" />
              <input
                type="text"
                placeholder="Search by user, plan, status, or payment method..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-4 bg-transparent text-white placeholder-gray-500 focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mr-4 p-1 hover:bg-red-900/30 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl blur opacity-10"></div>
          <div className="relative bg-gradient-to-br from-zinc-950 via-black to-zinc-950 border-2 border-red-900/30 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-red-950/50 via-red-900/30 to-red-950/50 border-b-2 border-red-900/50">
                    <th
                      className="p-4 text-left cursor-pointer hover:bg-red-900/20 transition-colors group"
                      onClick={() => handleSort("userName")}
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-red-500" />
                        <span className="font-black uppercase text-sm tracking-wider text-gray-300">
                          User
                        </span>
                        <SortIcon columnKey="userName" />
                      </div>
                    </th>
                    <th
                      className="p-4 text-left cursor-pointer hover:bg-red-900/20 transition-colors group"
                      onClick={() => handleSort("planName")}
                    >
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-400" />
                        <span className="font-black uppercase text-sm tracking-wider text-gray-300">
                          Plan
                        </span>
                        <SortIcon columnKey="planName" />
                      </div>
                    </th>
                    <th
                      className="p-4 text-left cursor-pointer hover:bg-red-900/20 transition-colors group"
                      onClick={() => handleSort("purchaseDate")}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-red-500" />
                        <span className="font-black uppercase text-sm tracking-wider text-gray-300">
                          Purchase
                        </span>
                        <SortIcon columnKey="purchaseDate" />
                      </div>
                    </th>
                    <th
                      className="p-4 text-left cursor-pointer hover:bg-red-900/20 transition-colors group"
                      onClick={() => handleSort("expiryDate")}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-500" />
                        <span className="font-black uppercase text-sm tracking-wider text-gray-300">
                          Expiry
                        </span>
                        <SortIcon columnKey="expiryDate" />
                      </div>
                    </th>
                    <th
                      className="p-4 text-left cursor-pointer hover:bg-red-900/20 transition-colors group"
                      onClick={() => handleSort("amount")}
                    >
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="font-black uppercase text-sm tracking-wider text-gray-300">
                          Amount
                        </span>
                        <SortIcon columnKey="amount" />
                      </div>
                    </th>
                    <th
                      className="p-4 text-left cursor-pointer hover:bg-red-900/20 transition-colors group"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-red-500" />
                        <span className="font-black uppercase text-sm tracking-wider text-gray-300">
                          Status
                        </span>
                        <SortIcon columnKey="status" />
                      </div>
                    </th>
                    <th className="p-4 text-left">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-red-500" />
                        <span className="font-black uppercase text-sm tracking-wider text-gray-300">
                          Payment
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentBookings.map((booking, index) => (
                    <tr
                      key={booking._id}
                      className="border-b border-red-900/20 hover:bg-red-950/20 transition-all duration-300 group"
                      style={{
                        animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                      }}
                    >
                      {/* User */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center border-2 border-red-500/50 overflow-hidden">
                            {booking.user.avatar ? (
                              <img
                                src={booking.user.avatar}
                                alt={booking.user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-bold text-sm">
                                {booking.user.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm group-hover:text-red-400 transition-colors">
                              {booking.user.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {booking.user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Crown
                            className={`w-4 h-4 ${getTierColor(
                              booking.subscriptionPlan.tierRank
                            )}`}
                          />
                          <div>
                            <p className="font-bold text-white text-sm">
                              {booking.subscriptionPlan.planName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {booking.subscriptionPlan.duration}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Purchase Date */}
                      <td className="p-4">
                        <span className="text-gray-300 font-medium text-sm">
                          {formatDate(booking.purchaseDate)}
                        </span>
                      </td>

                      {/* Expiry Date */}
                      <td className="p-4">
                        <span className="text-gray-300 font-medium text-sm">
                          {formatDate(booking.expiryDate)}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="p-4">
                        <div className="flex items-center gap-2 bg-gradient-to-r from-green-950/50 to-transparent px-3 py-1.5 rounded-full w-fit border border-green-900/30">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className="text-white font-bold text-sm">
                            {booking.amount.toFixed(2)}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300 font-medium text-sm">
                            {booking.paymentMethod}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* No Results */}
            {sortedBookings.length === 0 && (
              <div className="text-center py-20">
                <Ticket className="w-20 h-20 text-red-900/50 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-400 mb-2">
                  No bookings found
                </h3>
                <p className="text-gray-500">Try adjusting your search terms</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-8 flex items-center justify-between text-sm text-gray-500">
          <p>
            Showing{" "}
            <span className="text-red-400 font-bold">
              {indexOfFirstBooking + 1}
            </span>{" "}
            to{" "}
            <span className="text-red-400 font-bold">
              {Math.min(indexOfLastBooking, sortedBookings.length)}
            </span>{" "}
            of{" "}
            <span className="text-red-400 font-bold">
              {sortedBookings.length}
            </span>{" "}
            bookings
          </p>
          {sortConfig.key && (
            <p>
              Sorted by{" "}
              <span className="text-red-400 font-bold capitalize">
                {sortConfig.key === "userName"
                  ? "User Name"
                  : sortConfig.key === "planName"
                  ? "Plan Name"
                  : sortConfig.key === "purchaseDate"
                  ? "Purchase Date"
                  : sortConfig.key === "expiryDate"
                  ? "Expiry Date"
                  : sortConfig.key}
              </span>{" "}
              ({sortConfig.direction === "asc" ? "Ascending" : "Descending"})
            </p>
          )}
        </div>

        {/* Pagination - chỉ hiển thị khi có nhiều hơn 1 trang */}
        {sortedBookings.length > 0 && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ListBooking;
