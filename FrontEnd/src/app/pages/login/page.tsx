/* eslint-disable react-hooks/rules-of-hooks */
"use client"
import axios from 'axios';
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie';

const login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleuser = async () => {
    const response = await axios.post(`http://localhost:5003/auth/LogIn`, { email, password });
    Cookies.set('islogin', 'true')
      Cookies.set('email', email, { expires: 1, path: '/' });
    window.location.href = '/';
  }

  return (
    <div className='flex flex-col h-screen w-full justify-center items-center '>
      <div className=' bg-blue-200 p-6 space-y-4'>
        <div className='my-2 text-center font-semibold text-xl'>Login</div>
        <div>Email</div>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}  name="email" />
        <div>Password</div>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}  name="password" />
        <div>
          <button onClick={handleuser} className='p-2 bg-blue-300'>Submit</button>
          <Link href={"forgotPassword"}><div>Forgot Password</div></Link>
        </div>
      </div>
    </div>
  )
}

export default login