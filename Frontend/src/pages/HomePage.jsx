import React from 'react'
import UrlForm from '../components/UrlForm'

const HomePage = () => {
  return (
    <div className='bg-amber-100 h-screen flex justify-center items-center'>
        <div className="w-full max-w-2xl mx-auto p-4">
            <UrlForm />
        </div>
    </div>
  )
}

export default HomePage
