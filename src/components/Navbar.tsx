import { useState } from "react";
export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  return <nav className="nav">
    <a className="monogram" href="#home" onClick={closeMenu}>J + A</a>
    <button className="menu-button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}>☰</button>
    <div className={`nav-links ${menuOpen ? "open" : ""}`}>
      <a href="#story" onClick={closeMenu}>Our Story</a><a href="#details" onClick={closeMenu}>Details</a>
      <a href="#gallery" onClick={closeMenu}>Gallery</a><a href="#registry" onClick={closeMenu}>Registry</a>
      <a className="nav-rsvp" href="#rsvp" onClick={closeMenu}>RSVP</a>
    </div>
  </nav>;
}
