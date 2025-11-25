// client/src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { MenuIcon, SearchIcon, TicketPlus, XIcon } from "lucide-react";
import { useUser, useClerk, UserButton } from "@clerk/clerk-react";
import Switch from "./Switch";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 80) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);
  return (
    <div
      className={`fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-3 transition-transform duration-900 ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <Link to="/" className="max-md:flex-1">
        <img src={assets.logo} alt="" className="w-24 h-auto" />
      </Link>
      <div
        className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium
      max-md:text-lg z-50 flex flex-col md:flex-row items-center
      max-md:justify-center gap-8 min-md:px-8 py-3 max-md:h-screen
      min-md:rounded-full backdrop-blur bg-black/70 md:bg-white/10 md:border
      border-gray-300/20 overflow-hidden transition-[width] duration-300 
      ${isOpen ? "max-md:w-full" : "max-md:w-0"}`}
      >
        <XIcon
          className="md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        />
        <Link
          className="no-underline text-lightgray text-xl font-bold px-2 transition duration-400 drop-shadow-lg hover:text-red-500"
          onClick={() => {
            scrollTo(0, 0), setIsOpen(false);
          }}
          to="/"
        >
          Home
        </Link>
        <Link
          className="no-underline text-lightgray text-xl font-bold px-2 transition duration-400 drop-shadow-lg hover:text-red-500"
          onClick={() => {
            scrollTo(0, 0), setIsOpen(false);
          }}
          to="/movies"
        >
          Movies
        </Link>
        <Link
          className="no-underline text-lightgray text-xl font-bold px-2 transition duration-400 drop-shadow-lg hover:text-red-500"
          onClick={() => {
            scrollTo(0, 0), setIsOpen(false);
          }}
          to="/favorite"
        >
          Favorite
        </Link>
      </div>
      <div className="flex items-center gap-8">
        <Switch />
        <SearchIcon
          onClick={() => {
            scrollTo(0, 0), navigate("/movies");
          }}
          className="max-md:hidden w-6 h-6 cursor-pointer"
        />
        {!user ? (
          <button
            onClick={openSignIn}
            className="px-4 py-1 sm:px-7 sm:py-2 bg-gradient-to-r from-red-600 to-red-700 
            hover:from-red-500 hover:to-red-600 text-white transition-all duration-300 
            rounded-full font-medium cursor-pointer shadow-lg hover:shadow-red-500/50 
            hover:scale-105 border border-red-500/50"
          >
            Login
          </button>
        ) : (
          <div className="hover:scale-105 transition-transform duration-300">
            <UserButton
              appearance={{
                elements: {
                  avatarBox:
                    "w-9 h-9 ring-2 ring-red-500 ring-offset-2 ring-offset-transparent",
                  userButtonPopup: "bg-[#1a1a1a] border border-red-500/30",
                  userButtonTrigger:
                    "outline-red-500 hover:scale-105 transition-transform duration-300",
                },
              }}
            >
              <UserButton.MenuItems>
                <UserButton.Action
                  label="My Subscriptions"
                  labelIcon={<TicketPlus width={15} />}
                  onClick={() => navigate("/my-subscriptions")}
                />
              </UserButton.MenuItems>
            </UserButton>
          </div>
        )}
      </div>

      <MenuIcon
        className="max-md:ml-4 md:hidden w-8 h-8 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      />
    </div>
  );
};

export default Navbar;
