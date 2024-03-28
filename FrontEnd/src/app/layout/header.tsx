'use client'
import React, { useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { AppContext } from '../Context/CartContext';
import Cookies from 'js-cookie';
import { ShoppingCart } from 'lucide-react';

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
    Cookies.remove('email');
    window.location.href = '/';
  };
  return (
    <div className="flex items-center py-8 lg:py-8 px-10">
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
        <Link href="/pages/cart"><div className='flex'><ShoppingCart /> <span className='-mt-3'>{cart}</span></div></Link>
      </div>
    </div>
  )
}

export default Header