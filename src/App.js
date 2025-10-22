import "./App.css";
import { Routes, Route } from "react-router-dom";
import Header from "./header";
import Home from "./home";
import Middle from "./middle";
import FAQ from "./FAQ";
import Features from "./Features";
import Footer from "./footer";
import Form from "./Form";

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
