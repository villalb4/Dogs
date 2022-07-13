import React from 'react';
import {Link, NavLink} from 'react-router-dom'
import SearchBar from './SearchBar/SearchBar';
import './Header.css';


function Header() {
  return(
    <div className="header">
      <div className="header_cont">
        <Link to="/home" className="logo"><h1 className="logo">DOGS</h1></Link>
        <div className="nav">
          {/* <a href="https://github.com/villalb4/Dogs" target="_balck" className="about">GitHub</a> */}
          <NavLink to="#" className="about">GitHub</NavLink>
          <SearchBar />
        </div>
      </div>
    </div>
  )
}

export default Header;