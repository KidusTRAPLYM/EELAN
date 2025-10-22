import "./App.css";
import { Routes, Route } from "react-router-dom";
import Header from "./Components/header";
import Home from "./Components/home";
import Middle from "./Components/middle";
import FAQ from "./Components/FAQ";
import Features from "./Components/Features";
import Footer from "./Components/footer";
import Form from "./Components/Form";

function App() {
  return (
    <div className="root gap-10">
      <Header />
      <Routes>
        {/* Home page */}
        <Route
          path="/"
          element={
            <>
              <Home />
              <Middle />
              <FAQ />
              <Features />
              <Footer />
            </>
          }
        />

        {/* Register page */}
        <Route path="/register" element={<Form />} />
      </Routes>
    </div>
  );
}

export default App;
