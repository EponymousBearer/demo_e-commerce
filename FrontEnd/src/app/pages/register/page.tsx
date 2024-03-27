/* eslint-disable react-hooks/rules-of-hooks */
'use client'
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie'

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");

  const handleuser = async () => {
    try {
      const response = await axios.post(`http://localhost:5003/auth/Register`, { email, password, firstname, lastname });
      Cookies.set('islogin', 'true')
      window.location.href = '/';
    } catch (error: any) {
      if (error.response) {
        console.error('Registration failed:', error.response.data);
      }
    }
  }

  return (
    <div className='flex flex-col h-screen w-full justify-center items-center'>
      <div className='bg-blue-200 p-6 space-y-4'>
        <div className='my-2 text-center font-semibold text-xl'>Register</div>
        <div>First Name</div>
        <input value={firstname} onChange={(e) => setFirstname(e.target.value)} type="text" name="firstname" />
        <div>Last Name</div>
        <input value={lastname} onChange={(e) => setLastname(e.target.value)} type="text" name="lastname" />
        <div>Email</div>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" name="email" />
        <div>Password</div>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" name="password" />
        <div><button onClick={handleuser} className='p-2 bg-blue-300'>Submit</button></div>
      </div>
    </div>
  )
}

export default Register