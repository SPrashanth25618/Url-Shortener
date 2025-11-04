import React from 'react'
import LoginForm from '../components/LoginForm.jsx'
import { useState } from 'react'
import RegisterForm from '../components/RegisterForm.jsx';

const AuthPage = () => {
  const [login,setlogin] = useState(true);
  return (
    <div className='h-screen flex justify-center items-center'>        
        { login ? <LoginForm state={setlogin}/> : <RegisterForm state={setlogin} /> }
    </div>
  )
}

export default AuthPage
