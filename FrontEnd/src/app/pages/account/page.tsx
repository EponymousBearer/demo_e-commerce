/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie';

const Account = () => {
  const [userEmail, setUserEmail] = useState<string | null>('');
  const [data, setData] = useState<any>();

  useEffect(() => {
    const userEmailFromCookie = Cookies.get('email');

    if (userEmailFromCookie !== undefined) {
      setUserEmail(userEmailFromCookie);
    }
  }, []);

  useEffect(() => {
    if (userEmail) {
      fetchData();
    }
  }, [userEmail]);

  const fetchData = async () => {
    try {
      console.log(userEmail)
      const response = await axios.get(`http://localhost:5003/auth/MyAccount/${userEmail}`)
      console.log(response.data.user)
      setData(response.data.user);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  return (
    <div className='flex flex-col justify-center items-center h-screen'>
      <div className='bg-blue-200 p-10'>
        <h2 className='text-xl text-center font-bold'>Account Details</h2>
        <div className='py-6'>
          {data && (
            <div>
              <ul>
                <li>First Name: {data.firstname}</li>
                <li className='py-2'>Last Name: {data.lastname}</li>
                <li>Email: {data.email}</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Account