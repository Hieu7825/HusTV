//  client/src/pages/Home.jsx
import React from "react";
import HeroSection from "../components/HeroSection";
import FeaturedSection from "../components/FeaturedSection";
import SubscriptionPlans from "../components/SubscriptionPlans";
import SnowflakeBackground from "../components/SnowflakeBackground";

const Home = () => {
  return (
    <>
      <SnowflakeBackground />
      <HeroSection />
      <FeaturedSection />
      <SubscriptionPlans />
    </>
  );
};

export default Home;
