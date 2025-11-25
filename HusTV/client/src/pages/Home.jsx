//  client/src/pages/Home.jsx
import React from "react";
import HeroSection from "../components/HeroSection";
import FeaturedSection from "../components/FeaturedSection";
import SubscriptionPlans from "../components/SubscriptionPlans";

const Home = () => {
  return (
    <>
      <HeroSection />
      <FeaturedSection />
      <SubscriptionPlans />
    </>
  );
};

export default Home;
