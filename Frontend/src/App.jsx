// import React from "react";
import {  Route, Routes } from "react-router-dom";
// import ThreeDScene from "./components/ThreeDScene";



// import GoogleAuth from "./pages/GoogleAuth";

// import LandingLayout from "./Layouts/LandingLayout";
import MainLayout from "./Layouts/MainLayout";
import NearestARGO from "./pages/NearestARGO/NearestARGO";
import TrajectoryComparison from "./pages/Tragectory&Comparison/TrajectoryAndComparison";
import ExploreIndex from "./pages/ExploreIndex/ExploreIndex";
import Chat from "./pages/Chat/Chat";

import Background from "./pages/Background/Background";

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <Background />
              <NearestARGO />
            </MainLayout>
          }
        />

        <Route
          path="/ExploreIndex"
          element={
            <MainLayout>
              <Background />
              <ExploreIndex />
            </MainLayout>
          }
        />

        <Route
          path="/Chat"
          element={
            <MainLayout>
              <Background />
              <Chat />
            </MainLayout>
          }
        />
        <Route
          path="/Trajectory&Comparison"
          element={
            <MainLayout>
              <Background />
              <TrajectoryComparison />
            </MainLayout>
          }
        />
      </Routes>
    </>
  );
}

export default App;
