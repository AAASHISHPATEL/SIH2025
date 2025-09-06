
// import React from "react";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
// import Background from "../pages/Background/Background";

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* <Background /> */}
      <main className="flex-grow">{children}</main>
      {/* <Footer /> */}
    </div>
  );
};

export default MainLayout;
