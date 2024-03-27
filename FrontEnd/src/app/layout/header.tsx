'use client'
import React, { useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { AppContext } from '../Context/CartContext';
import Cookies from 'js-cookie';

const Header = () => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const { cart, setCart } = useContext(AppContext);

  useEffect(() => {
    setIsUserLoggedIn(Cookies.get('islogin') === 'true');
  }, []);

  const handleLogout = () => {
    Cookies.set('islogin', 'false');
    Cookies.remove('islogin');
    setIsUserLoggedIn(false);
  };
  return (
    <div className="flex items-center py-8 lg:py-8">
      <div className="hidden lg:flex items-center justify-end gap-x-8 flex-auto">
        <Link href="/">Home</Link>
        {!isUserLoggedIn && (
          <>
            <Link href="/pages/login">Login</Link>
            <Link href="/pages/register">Register</Link>
          </>
        )}
        {isUserLoggedIn && (
          <>
            <Link href="/pages/account">Account</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
        <p>Total quantity: {cart}</p>
      </div>
    </div>
  )
}

export default Header