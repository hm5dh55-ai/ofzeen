import React, { useState } from 'react'
import Login from './Login.jsx'
import Users from './Users.jsx'

export default function App(){
  const [session, setSession] = useState(()=>{
    const t = localStorage.getItem('token'); const r = localStorage.getItem('role');
    return t ? {token:t, role:r} : null
  })
  function onLogout(){ localStorage.clear(); location.reload() }
  return session ? (
    <div style={{display:'grid',gridTemplateRows:'64px 1fr',height:'100vh'}}>
      <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',background:'#0a0a0b',color:'#fff'}}>
        <strong style={{color:'#FFD400'}}>OFZN</strong>
        <div><span style={{marginRight:12, opacity:.8}}>{session.role}</span>
          <button onClick={onLogout} style={btnOutline}>Logout</button></div>
      </header>
      <main style={{background:'#121316',color:'#fff',padding:16}}>
        <Users session={session}/>
      </main>
    </div>
  ) : <Login onLogin={(token)=>{ localStorage.setItem('token', token); localStorage.setItem('role', 'admin'); location.reload() }}/>
}

const btnOutline = {padding:'8px 12px',borderRadius:8,border:'1px solid #333',background:'#121316',color:'#fff'}
