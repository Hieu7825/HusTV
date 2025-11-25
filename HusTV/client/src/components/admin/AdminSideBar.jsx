// client/src/components/admin/AdminSideBar.jsx
import React from "react";
import {
  ClapperboardIcon,
  ClipboardListIcon,
  LayoutDashboardIcon,
  ListCollapseIcon,
  ListIcon,
  ListPlusIcon,
  Sparkles,
} from "lucide-react";
import { assets } from "../../assets/assets";
import { NavLink } from "react-router-dom";

const AdminSideBar = () => {
  const user = {
    firstName: "Admin",
    lastName: "User",
    imageUrl: assets.profile,
  };

  const adminNavlinks = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboardIcon },
    { name: "Add Movies", path: "/admin/add-movies", icon: ClapperboardIcon },
    { name: "Add Genre", path: "/admin/add-genre", icon: ListPlusIcon },
    { name: "Add Plans", path: "/admin/add-plans", icon: ClipboardListIcon },
    { name: "List Movies", path: "/admin/list-movies", icon: ListIcon },
    {
      name: "List Bookings",
      path: "/admin/list-booking",
      icon: ListCollapseIcon,
    },
  ];

  return (
    <div className="h-[calc(100vh-64px)] md:flex flex-col items-center pt-8 max-w-13 md:max-w-60 w-full border-r border-primary/20 text-sm relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full grid-background" />
      </div>

      {/* Profile Section with Enhanced Styling */}
      <div className="relative z-10 flex flex-col items-center mb-6">
        {/* Avatar with glow */}
        <div className="relative group cursor-pointer">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-primary/40 rounded-full blur-xl group-hover:bg-primary/60 transition-all duration-300 animate-pulse"></div>

          {/* Rotating ring */}
          <div className="absolute -inset-0.5 bg-gradient-to-br from-primary to-red-600 rounded-full opacity-75 animate-[spin_3s_linear_infinite]"></div>

          {/* Avatar */}
          <img
            className="h-11 md:h-16 w-11 md:w-16 rounded-full mx-auto relative z-10 border-2 border-primary shadow-[0_0_15px_rgba(248,69,101,0.6)] group-hover:scale-105 transition-all duration-300"
            src={user.imageUrl}
            alt="sidebar"
          />

          {/* Single sparkle */}
          <Sparkles className="w-4 h-4 text-primary absolute -top-0.5 -right-0.5 animate-pulse drop-shadow-[0_0_6px_rgba(248,69,101,0.8)]" />
        </div>

        {/* User name */}
        <p className="mt-3 text-sm md:text-base max-md:hidden font-bold text-white drop-shadow-[0_2px_6px_rgba(248,69,101,0.4)]">
          {user.firstName} {user.lastName}
        </p>

        {/* Simple decorative line */}
        <div className="hidden md:block w-16 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mt-2 rounded-full shadow-[0_0_8px_rgba(248,69,101,0.5)]"></div>
      </div>

      {/* Navigation Links */}
      <div className="w-full relative z-10">
        {adminNavlinks.map((link, index) => (
          <NavLink
            key={index}
            to={link.path}
            end
            className={({ isActive }) =>
              `relative flex items-center max-md:justify-center gap-3 w-full py-3.5 md:pl-10 transition-all duration-300 group ${
                index === 0 ? "mt-6" : "mt-1"
              } ${
                isActive
                  ? "bg-gradient-to-r from-primary/25 via-primary/15 to-transparent text-white border-l-4 border-primary shadow-[inset_0_0_20px_rgba(248,69,101,0.2)]"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5 hover:border-l-2 hover:border-primary/50"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Animated background glow for active state */}
                {isActive && (
                  <>
                    <span className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent animate-pulse pointer-events-none"></span>
                    <span className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-primary to-transparent animate-pulse"></span>
                  </>
                )}

                {/* Icon with enhanced effects */}
                <div className="relative">
                  <link.icon
                    className={`w-5 h-5 transition-all duration-300 relative z-10 ${
                      isActive
                        ? "text-primary scale-125 drop-shadow-[0_0_8px_rgba(248,69,101,0.8)]"
                        : "group-hover:scale-110 group-hover:text-primary/70"
                    }`}
                  />
                  {/* Icon glow effect */}
                  {isActive && (
                    <span className="absolute inset-0 bg-primary/30 blur-md rounded-full animate-pulse"></span>
                  )}
                </div>

                {/* Text label with stronger styling */}
                <p
                  className={`max-md:hidden font-semibold transition-all duration-300 ${
                    isActive
                      ? "text-white drop-shadow-[0_2px_8px_rgba(248,69,101,0.5)]"
                      : "font-medium"
                  }`}
                >
                  {link.name}
                </p>

                {/* Enhanced active indicator bar */}
                <span
                  className={`h-12 rounded-l right-0 absolute transition-all duration-300 ${
                    isActive
                      ? "w-2 bg-gradient-to-b from-primary via-primary to-primary/50 shadow-[0_0_15px_rgba(248,69,101,0.8),-2px_0_10px_rgba(248,69,101,0.4)]"
                      : "w-0 bg-transparent group-hover:w-1 group-hover:bg-primary/40"
                  }`}
                />

                {/* Shimmer effect on active */}
                {isActive && (
                  <span className="absolute inset-0 overflow-hidden pointer-events-none">
                    <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]"></span>
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Bottom decorative element */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex gap-1">
        <div className="w-2 h-2 bg-primary/30 rounded-full animate-pulse"></div>
        <div
          className="w-2 h-2 bg-primary/50 rounded-full animate-pulse"
          style={{ animationDelay: "0.2s" }}
        ></div>
        <div
          className="w-2 h-2 bg-primary rounded-full animate-pulse"
          style={{ animationDelay: "0.4s" }}
        ></div>
      </div>
    </div>
  );
};

export default AdminSideBar;
