import Link from 'next/link'
import React from 'react'

const forgotPassword = () => {
    return (
        <div className='flex flex-col h-screen w-full justify-center items-center '>
            <div className=' bg-blue-200 p-6 space-y-4'>
                <div className='my-2 text-center font-semibold text-xl'>Reset Password</div>
                <div>Email</div>
                <input type="email" name="email" />
                <div>Last Password</div>
                <input type="password" name="password" />
                <div>New Password</div>
                <input type="password" name="password" />
                <div>
                    <button type="submit" className='p-2 bg-blue-300'>Submit</button>
                    <Link href={"forgotPassword"}><div>Forgot Password</div></Link>
                </div>
            </div>
        </div>
    )
}

export default forgotPassword