"use client";
import { useEffect } from "react";

const HomePage = () => {
  const handleUser = async () => {
    try {
      const response = await fetch("http://localhost:4000/auth/me", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Unauthorized");
      }
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    handleUser();
  }, []);
  return <div></div>;
};

export default HomePage;
