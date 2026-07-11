import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Neighborhoods from './pages/Neighborhoods.jsx'
import NeighborhoodDetail from './pages/NeighborhoodDetail.jsx'
import Suburbs from './pages/Suburbs.jsx'
import SuburbDetail from './pages/SuburbDetail.jsx'
import Listings from './pages/Listings.jsx'
import ChicagoDaily from './pages/ChicagoDaily.jsx'
import Stories from './pages/Stories.jsx'
import StoryDetail from './pages/StoryDetail.jsx'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/neighborhoods" element={<Neighborhoods />} />
          <Route path="/neighborhoods/:slug" element={<NeighborhoodDetail />} />
          <Route path="/suburbs" element={<Suburbs />} />
          <Route path="/suburbs/:slug" element={<SuburbDetail />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/chicago-daily" element={<ChicagoDaily />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/stories/:slug" element={<StoryDetail />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
