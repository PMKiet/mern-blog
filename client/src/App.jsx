import { BrowserRouter, Route, Routes } from 'react-router-dom'
import About from './pages/About'
import DashBoard from './pages/DashBoard'
import Home from './pages/Home'
import Project from './pages/Project'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Header from './components/Header'
import FooterCom from './components/Footer.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/sign-in' element={<SignIn />} />
        <Route path='/sign-up' element={<SignUp />} />
        <Route path='/dashboard' element={<DashBoard />} />
        <Route path='/project' element={<Project />} />
      </Routes>
      <FooterCom />
    </BrowserRouter>
  )
}
