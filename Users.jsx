import React, { useEffect, useState } from 'react'

export default function Users({session}){
  const [rows,setRows]=useState([])
  const [loading,setLoading]=useState(true)
  const [err,setErr]=useState(null)

  async function load(){
    setLoading(true)
    try{
      const res = await fetch('/api/users',{headers:{Authorization:'Bearer '+session.token}})
      const j = await res.json(); setRows(j)
    }catch(e){ setErr('Failed to load users') } finally{ setLoading(false) }
  }
  useEffect(()=>{ load() },[])

  async function createUser(e){
    e.preventDefault()
    const fd = new FormData(e.target)
    const payload = {
      email: fd.get('email'),
      password: fd.get('password'),
      m3u_url: fd.get('m3u_url') || null,
      days: Number(fd.get('days')||30)
    }
    const res = await fetch('/api/users',{method:'POST', headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.token}, body: JSON.stringify(payload)})
    if(res.ok){ e.target.reset(); load() } else { alert('Create failed (user exists or missing fields)') }
  }

  async function setStatus(id, status){
    await fetch('/api/users/'+id+'/status',{method:'PUT', headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.token}, body: JSON.stringify({status})})
    load()
  }

  async function setM3U(id){
    const url = prompt('Enter M3U URL')
    if(!url) return
    await fetch('/api/users/'+id+'/m3u',{method:'PUT', headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.token}, body: JSON.stringify({m3u_url:url})})
    load()
  }

  if(loading) return <div>Loading...</div>
  if(err) return <div style={{color:'#ff6b6b'}}>{err}</div>

  return <div style={{display:'grid', gridTemplateColumns:'420px 1fr', gap:16}}>
    <form onSubmit={createUser} style={{background:'#0a0a0b',padding:16,borderRadius:12}}>
      <h3 style={{marginTop:0}}>Create User</h3>
      <Field name="email" label="User Email" type="email" required/>
      <Field name="password" label="Password" required/>
      <Field name="m3u_url" label="M3U URL (optional)"/>
      <Field name="days" label="Validity (days)" defaultValue="30" type="number"/>
      <button style={btn}>Create</button>
      <p style={{opacity:.8}}>Users can log in with **email & password** in the app. You can set or change their M3U any time.</p>
    </form>
    <div>
      <table width="100%" cellPadding="8" style={{borderCollapse:'collapse', background:'#0a0a0b', borderRadius:12, overflow:'hidden'}}>
        <thead style={{background:'#1e88e5'}}>
          <tr><th>ID</th><th>Email</th><th>Status</th><th>Expires</th><th>M3U</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r.id} style={{borderTop:'1px solid #222'}}>
              <td>{r.id}</td>
              <td>{r.email}</td>
              <td>{r.status}</td>
              <td style={{whiteSpace:'nowrap'}}>{r.expires_at?.slice(0,10)||'-'}</td>
              <td style={{maxWidth:260,overflow:'hidden',textOverflow:'ellipsis'}} title={r.m3u_url||''}>{r.m3u_url? 'set':'-'}</td>
              <td>
                <button onClick={()=>setM3U(r.id)} style={mini}>Set M3U</button>{' '}
                {r.status==='active'
                  ? <button onClick={()=>setStatus(r.id,'inactive')} style={warn}>Deactivate</button>
                  : <button onClick={()=>setStatus(r.id,'active')} style={mini}>Activate</button>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
}

function Field({name,label, ...rest}){
  return <div style={{marginBottom:12}}>
    <label>{label}</label>
    <input name={name} {...rest} style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #333',background:'#121316',color:'#fff'}}/>
  </div>
}
const btn = {padding:'10px 14px',borderRadius:8,border:'none',background:'#FFD400',color:'#000',fontWeight:700}
const mini = {padding:'6px 10px',borderRadius:8,border:'none',background:'#1e88e5',color:'#fff'}
const warn = {padding:'6px 10px',borderRadius:8,border:'none',background:'#ff6b6b',color:'#000',fontWeight:700}
