import { FC } from 'react'
import { Link } from 'react-router'

const Navbar: FC = () => {
  return (
    <nav className="navbar">
      <ul className="navbar-opts">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/shop">Shop</Link>
        </li>
        <li>
          <Link to="/login">Contact</Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar