import React, { useState } from 'react'

export default function Login({onLogin}){
  const [email,setE]=useState('admin@ofzn.local')
  const [password,setP]=useState('admin123')
  const [err,setErr]=useState(null); const [busy,setBusy]=useState(false)

  async function submit(e){
    e.preventDefault(); setBusy(true); setErr(null)
    try{
      const res = await fetch('/api/auth/login',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email,password})})
      if(!res.ok) throw new Error('Invalid credentials')
      const j = await res.json()
      onLogin(j.token)
    }catch(e){ setErr(e.message) } finally{ setBusy(false) }
  }
  return <div style={{display:'grid',placeItems:'center',height:'100vh',background:'#0a0a0b',color:'#fff'}}>
    <form onSubmit={submit} style={{width:360,padding:24,background:'#121316',borderRadius:12}}>
      <h2 style={{marginTop:0,color:'#FFD400'}}>OFZN Control Panel</h2>
      <div><label>Email</label><input type="email" value={email} onChange={e=>setE(e.target.value)} required style={inp}/></div>
      <div><label>Password</label><input type="password" value={password} onChange={e=>setP(e.target.value)} required style={inp}/></div>
      {err && <div style={{color:'#ff6b6b',marginTop:8}}>{err}</div>}
      <button disabled={busy} style={btn}>{busy?'Signing in...':'Login'}</button>
    </form>
  </div>
}

const inp = {width:'100%',padding:'10px 12px',margin:'8px 0 14px',borderRadius:8,border:'1px solid #333',background:'#0a0a0b',color:'#fff'}
const btn = {width:'100%',padding:'12px',borderRadius:8,border:'none',background:'#FFD400',color:'#000',fontWeight:700}
