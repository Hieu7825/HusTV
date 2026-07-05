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
    <div
      className="h-[calc(100vh-64px)] md:flex flex-col items-center pt-8 max-w-13 md:max-w-60 w-full border-r text-sm relative overflow-hidden"
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderColor: "var(--color-border-primary)",
      }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full grid-background" />
      </div>

      {/* Profile Section with Enhanced Styling */}
      <div className="relative z-10 flex flex-col items-center mb-6">
        {/* Avatar with glow */}
        <div className="relative group cursor-pointer">
          {/* Glow effect */}
          <div
            className="absolute inset-0 rounded-full blur-xl group-hover:opacity-100 transition-all duration-300 animate-pulse"
            style={{
              backgroundColor: `${getComputedStyle(document.documentElement).getPropertyValue("--color-primary")}40`,
            }}
          ></div>

          {/* Rotating ring */}
          <div
            className="absolute -inset-0.5 rounded-full opacity-75 animate-[spin_3s_linear_infinite]"
            style={{
              background: `linear-gradient(to right, var(--color-primary), var(--btn-gradient-to))`,
            }}
          ></div>

          {/* Avatar */}
          <img
            className="h-11 md:h-16 w-11 md:w-16 rounded-full mx-auto relative z-10 border-2 group-hover:scale-105 transition-all duration-300"
            style={{
              borderColor: "var(--color-primary)",
              boxShadow: `0 0 15px ${getComputedStyle(document.documentElement).getPropertyValue("--color-primary")}`,
            }}
            src={user.imageUrl}
            alt="sidebar"
          />

          {/* Single sparkle */}
          <Sparkles
            className="w-4 h-4 absolute -top-0.5 -right-0.5 animate-pulse drop-shadow-lg"
            style={{
              color: "var(--color-primary)",
            }}
          />
        </div>

        {/* User name */}
        <p
          className="mt-3 text-sm md:text-base max-md:hidden font-bold drop-shadow-lg max-md:hidden"
          style={{ color: "var(--color-text-primary)" }}
        >
          {user.firstName} {user.lastName}
        </p>

        {/* Simple decorative line */}
        <div
          className="hidden md:block w-16 h-0.5 mt-2 rounded-full"
          style={{
            background: `linear-gradient(to right, transparent, var(--color-primary), transparent)`,
            boxShadow: `0 0 8px ${getComputedStyle(document.documentElement).getPropertyValue("--color-primary")}`,
          }}
        ></div>
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
              } ${isActive ? "border-l-4 shadow-lg" : "hover:opacity-80"}`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive
                ? `${getComputedStyle(document.documentElement).getPropertyValue("--color-primary")}15`
                : "transparent",
              color: isActive
                ? "var(--color-text-primary)"
                : "var(--color-text-muted)",
              borderColor: isActive ? "var(--color-primary)" : "transparent",
            })}
          >
            {({ isActive }) => (
              <>
                {/* Animated background glow for active state */}
                {isActive && (
                  <>
                    <span
                      className="absolute inset-0 animate-pulse pointer-events-none"
                      style={{
                        background: `linear-gradient(to right, var(--color-primary) 0%, rgba(0,0,0,0) 100%)`,
                      }}
                    ></span>
                    <span
                      className="absolute left-0 top-0 w-1 h-full animate-pulse"
                      style={{
                        background: `linear-gradient(to bottom, transparent, var(--color-primary), transparent)`,
                      }}
                    ></span>
                  </>
                )}

                {/* Icon with enhanced effects */}
                <div className="relative">
                  <link.icon
                    className={`w-5 h-5 transition-all duration-300 relative z-10 ${
                      isActive ? "scale-125" : "group-hover:scale-110"
                    }`}
                    style={{
                      color: isActive ? "var(--color-primary)" : "inherit",
                    }}
                  />
                  {/* Icon glow effect */}
                  {isActive && (
                    <span
                      className="absolute inset-0 blur-md rounded-full animate-pulse"
                      style={{
                        backgroundColor: `${getComputedStyle(document.documentElement).getPropertyValue("--color-primary")}30`,
                      }}
                    ></span>
                  )}
                </div>

                {/* Text label with stronger styling */}
                <p
                  className={`max-md:hidden font-semibold transition-all duration-300 ${
                    isActive ? "drop-shadow-lg" : ""
                  }`}
                  style={{
                    color: isActive ? "var(--color-text-primary)" : "inherit",
                  }}
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
