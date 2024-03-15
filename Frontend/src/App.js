import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home'
import NoPage from "./Pages/NoPage";
import Upload from './Pages/Upload';
import Uploaded from "./Pages/Uploaded";
import Access from "./Pages/Access";

export default function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/uploaded" element={<Uploaded />} />
          <Route path="/access" element={<Access />} />
          <Route path="*" element={<NoPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}