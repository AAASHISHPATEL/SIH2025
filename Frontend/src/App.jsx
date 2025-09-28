import { Route, Routes } from "react-router-dom";

import NearestARGO from "./pages/NearestARGO/NearestARGO";
import TrajectoryComparison from "./pages/Tragectory&Comparison/TrajectoryAndComparison";
import ExploreIndex from "./pages/ExploreIndex/ExploreIndex";
import Chat from "./pages/Chat/Chat";
import Export from "./pages/Export/Export";
import Ingest from "./pages/Ingest/Ingest";
import LandingPage from "./pages/LandingPage/LandingPage";
import LandingLayout from "./Layouts/LandingLayout";
import SignUpSignIn from "./pages/SignUpSignIn/SignUpSignIn";

import SidebarLayout from "./components/SideBarLayout/SidebarLayout";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <LandingLayout>
              <LandingPage />
            </LandingLayout>
          }
        />
        <Route
          path="/login"
          element={
            <LandingLayout>
              <SignUpSignIn />
            </LandingLayout>
          }
        />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<SidebarLayout />}>
            <Route path="/NearestARGO" element={<NearestARGO />} />
            <Route path="/Export" element={<Export />} />
            <Route path="/Ingest" element={<Ingest />} />
            <Route path="/ExploreIndex" element={<ExploreIndex />} />
            <Route path="/Chat" element={<Chat />} />
            <Route
              path="/Trajectory&Comparison"
              element={<TrajectoryComparison />}
            />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
