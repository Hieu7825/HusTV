// client/src/App.jsx
import React from "react";
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import Favorite from "./pages/Favorite";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";
import { Video } from "./pages/Video";
import MySubscriptions from "./pages/MySubscriptions";
import Layout from "./pages/admin/Layout";
import DashBoard from "./pages/admin/DashBoard";
import AddGenre from "./pages/admin/AddGenre";
import AddMovies from "./pages/admin/AddMovies";
import AddPlans from "./pages/admin/AddPlans";
import ListBooking from "./pages/admin/ListBooking";
import ListMovies from "./pages/admin/ListMovies";
const App = () => {
  const isAdminRoute = useLocation().pathname.startsWith("/admin");

  return (
    <>
      <Toaster />
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/video/:id" element={<Video />} />
        <Route path="/my-subscriptions" element={<MySubscriptions />} />
        <Route path="/favorite" element={<Favorite />} />
        <Route path="/admin/*" element={<Layout />}>
          <Route index element={<DashBoard />} />
          <Route path="add-movies" element={<AddMovies />} />
          <Route path="add-genre" element={<AddGenre />} />
          <Route path="add-plans" element={<AddPlans />} />
          <Route path="list-booking" element={<ListBooking />} />
          <Route path="list-movies" element={<ListMovies />} />
        </Route>
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
};

export default App;
