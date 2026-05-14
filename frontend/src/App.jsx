import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './App.css';

const API = 'http://localhost:8000';
const LEVELS = [
  { id:'A1', label:'A1', name:'Beginner', color:'#10b981' },
  { id:'A2', label:'A2', name:'Elementary', color:'#06b6d4' },
  { id:'B1', label:'B1', name:'Intermediate', color:'#8b5cf6' },
  { id:'B2', label:'B2', name:'Upper-Inter', color:'#f59e0b' },
  { id:'C1', label:'C1', name:'Advanced', color:'#ef4444' },
  { id:'C2', label:'C2', name:'Mastery', color:'#ec4899' },
];
const LANGS = ['English','Hindi','German','Tamil','Kannada','Spanish','French'];

export default function App() {
  const [tab, setTab]               = useState('text');
  const [inputText, setInputText]   = useState('');
  const [level, setLevel]           = useState('B1');
  const [lang, setLang]             = useState('English');
  const [result, setResult]         = useState(null);
  const [busy, setBusy]             = useState(false);
  const [audioGenerating, setAudioGenerating] = useState(false);
  const [audioUrl, setAudioUrl]     = useState(null);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [stats, setStats]           = useState({ xp:0, level:1, simplifications_done:0 });
  const [dragOver, setDragOver]     = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [progress, setProgress]     = useState('');
  const [error, setError]           = useState('');
  const audioRef = useRef(null);
  const fileRef  = useRef(null);

  React.useEffect(() => {
    axios.get(`${API}/stats`).then(r => setStats(r.data)).catch(() => {});
  }, []);

  const handleSimplify = async () => {
    if (!inputText.trim()) return;
    setBusy(true); setResult(null); setAudioUrl(null); setError('');
    setProgress('Sending to AI engine...');
    try {
      const r = await axios.post(`${API}/simplify`,
        { text: inputText, target_level: level, language: lang },
        { timeout: 180000 }
      );
      setResult(r.data);
      if (r.data.user_stats) setStats(r.data.user_stats);
    } catch(e) {
      setError(e.response?.data?.detail || e.message);
    }
    setBusy(false); setProgress('');
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploadedFile(file); setBusy(true); setResult(null); setAudioUrl(null); setError('');
    setProgress(`Reading ${file.name}...`);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('target_level', level);
    fd.append('language', lang);
    try {
      setProgress('Extracting text from document...');
      const r = await axios.post(`${API}/upload`, fd,
        { timeout: 180000, headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setResult(r.data);
      if (r.data.user_stats) setStats(r.data.user_stats);
    } catch(e) {
      setError(e.response?.data?.detail || e.message);
    }
    setBusy(false); setProgress('');
  };

  const handleAudio = async () => {
    if (!result?.simplified_text) return;
    setAudioGenerating(true); setAudioUrl(null);
    try {
      const r = await axios.post(`${API}/generate-audio`,
        { text: result.simplified_text, target_level: level, language: lang },
        { timeout: 90000 }
      );
      setAudioUrl(`${API}${r.data.audio_url}`);
    } catch(e) {
      setError('Audio generation failed: ' + e.message);
    }
    setAudioGenerating(false);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [level, lang]);

  const xp = stats.xp % 100;
  const activeLevel = LEVELS.find(l => l.id === level);

  return (
    <div className="root">
      {/* ── Background Orbs ── */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* ── Header ── */}
      <header className="header">
        <div className="header-logo">
          <div className="logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <span className="logo-text">SimplifyAI</span>
          <div className="logo-badge">BETA</div>
        </div>
        <nav className="header-nav">
          <div className="xp-pill">
            <div className="xp-avatar">Lv{stats.level}</div>
            <div className="xp-track">
              <div className="xp-label">{stats.xp} XP</div>
              <div className="xp-bar"><div className="xp-fill" style={{width:`${xp}%`}}/></div>
            </div>
            <div className="xp-docs">{stats.simplifications_done} simplified</div>
          </div>
          <button className="btn-ghost">Sign In</button>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="hero">
        <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.7}}>
          <div className="hero-tag">🎓 AI-Powered Educational Tool</div>
          <h1>Turn Complex Textbooks<br/><span className="gradient-text">Into Clear Student Notes</span></h1>
          <p className="hero-sub">Upload PDFs, DOCX, or paste textbook content. Get section-by-section simplified notes your students can actually understand — plus a podcast audio version.</p>
        </motion.div>
        <motion.div className="hero-stats" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4}}>
          {[['📄','Textbook Upload','PDF & DOCX'],['🧠','AI Simplification','Chunk-by-chunk'],['🔊','Podcast Audio','Neural TTS'],['🌍','Multilingual','7 Languages']].map(([icon,t,s])=>(
            <div key={t} className="hero-stat-card">
              <span className="stat-icon">{icon}</span>
              <div><div className="stat-title">{t}</div><div className="stat-sub">{s}</div></div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Main Workspace ── */}
      <section className="workspace">
        {/* ── Settings Bar ── */}
        <div className="settings-bar">
          <div className="level-selector">
            <span className="setting-label">📊 CEFR Level</span>
            <div className="level-pills">
              {LEVELS.map(l=>(
                <button key={l.id} className={`level-pill ${level===l.id?'active':''}`}
                  style={level===l.id?{borderColor:l.color,color:l.color,background:`${l.color}18`}:{}}
                  onClick={()=>setLevel(l.id)}>
                  {l.label}
                </button>
              ))}
            </div>
            {activeLevel && <span className="level-desc" style={{color:activeLevel.color}}>↑ {activeLevel.name}</span>}
          </div>
          <div className="lang-selector">
            <span className="setting-label">🌍 Output Language</span>
            <select value={lang} onChange={e=>setLang(e.target.value)}>
              {LANGS.map(l=><option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* ── Tab Toggle ── */}
        <div className="tab-row">
          <button className={`tab ${tab==='text'?'tab-active':''}`} onClick={()=>setTab('text')}>
            <span>✏️</span> Paste Text
          </button>
          <button className={`tab ${tab==='upload'?'tab-active':''}`} onClick={()=>setTab('upload')}>
            <span>📁</span> Upload File
          </button>
        </div>

        <div className="panels">
          {/* ── Input Panel ── */}
          <motion.div className="glass glass-glow panel" layout>
            <div className="panel-header">
              <div className="panel-title">
                {tab==='text'?'📖 Original Text':'📁 Upload Document'}
              </div>
              {tab==='text' && inputText && (
                <span className="char-count">{inputText.length} chars · ~{Math.ceil(inputText.split(' ').length/200)} chunks</span>
              )}
            </div>

            <AnimatePresence mode="wait">
              {tab==='text' ? (
                <motion.div key="text" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                  <textarea
                    placeholder="📚 Paste complex textbook content, research paper, lecture notes, or any academic text here...

The AI will split it into sections and simplify each one for students."
                    value={inputText}
                    onChange={e=>setInputText(e.target.value)}
                  />
                </motion.div>
              ) : (
                <motion.div key="upload" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                  <div
                    className={`dropzone ${dragOver?'dropzone-active':''} ${uploadedFile?'dropzone-filled':''}`}
                    onDragOver={e=>{e.preventDefault();setDragOver(true)}}
                    onDragLeave={()=>setDragOver(false)}
                    onDrop={onDrop}
                    onClick={()=>!busy && fileRef.current?.click()}
                  >
                    <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" hidden onChange={e=>handleFileUpload(e.target.files[0])}/>
                    {uploadedFile ? (
                      <div className="file-info">
                        <div className="file-icon">📄</div>
                        <div className="file-meta">
                          <div className="file-name">{uploadedFile.name}</div>
                          <div className="file-size">{(uploadedFile.size/1024).toFixed(1)} KB · {uploadedFile.type || 'document'}</div>
                        </div>
                        <button className="file-remove" onClick={e=>{e.stopPropagation();setUploadedFile(null);setResult(null);}}>✕</button>
                      </div>
                    ) : (
                      <div className="drop-prompt">
                        <div className="drop-icon">📂</div>
                        <div className="drop-title">Drop your textbook here</div>
                        <div className="drop-sub">or click to browse · PDF, DOCX, TXT supported</div>
                        <div className="drop-formats">
                          <span>PDF</span><span>DOCX</span><span>TXT</span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="panel-footer">
              {tab==='text' ? (
                <button className="btn-primary full-btn" onClick={handleSimplify} disabled={busy||!inputText.trim()}>
                  {busy ? <><Spinner/> Processing chunks...</> : <>✨ Simplify for Students</>}
                </button>
              ) : (
                uploadedFile && !busy && !result && (
                  <button className="btn-primary full-btn" onClick={()=>handleFileUpload(uploadedFile)} disabled={busy}>
                    ✨ Simplify Document
                  </button>
                )
              )}
              {busy && <div className="progress-bar"><div className="progress-fill"/></div>}
              {busy && <div className="progress-label">🤖 {progress || 'AI is reading and simplifying each section...'}<span className="blink">_</span></div>}
            </div>
          </motion.div>

          {/* ── Output Panel ── */}
          <motion.div className="glass glass-glow panel" layout>
            <div className="panel-header">
              <div className="panel-title">📝 Student-Ready Notes</div>
              {result && (
                <div className="output-actions">
                  <button className="btn-ghost btn-sm" onClick={()=>navigator.clipboard?.writeText(result.simplified_text)}>📋 Copy</button>
                  <button className="btn-ghost btn-sm" onClick={()=>{
                    const b=new Blob([result.simplified_text],{type:'text/plain'});
                    const u=URL.createObjectURL(b);
                    const a=document.createElement('a');a.href=u;a.download='simplified_notes.txt';a.click();
                  }}>⬇️ Download</button>
                </div>
              )}
            </div>

            <div className="output-body">
              <AnimatePresence mode="wait">
                {busy ? (
                  <motion.div key="loading" className="loading-screen" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                    <div className="ai-orb"/>
                    <p className="loading-title">AI is Simplifying...</p>
                    <p className="loading-sub">Processing each section of your content.<br/>First run may take 30–90 seconds as the model loads.</p>
                    <div className="loading-steps">
                      {['Splitting text into sections','Simplifying each chunk','Formatting student notes','Calculating quality metrics'].map((s,i)=>(
                        <div key={s} className="step"><div className="step-dot"/><span>{s}</span></div>
                      ))}
                    </div>
                  </motion.div>
                ) : error ? (
                  <motion.div key="error" className="error-screen" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                    <div className="error-icon">⚠️</div>
                    <p className="error-title">Something went wrong</p>
                    <p className="error-msg">{error}</p>
                    <button className="btn-ghost" onClick={()=>setError('')}>Dismiss</button>
                  </motion.div>
                ) : result ? (
                  <motion.div key="result" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="result-wrapper">
                    {/* Metrics Bar */}
                    <div className="metrics-bar">
                      <div className="metric"><span className="m-icon">📊</span><span className="m-val">{result.level_achieved}</span><span className="m-label">Level</span></div>
                      <div className="metric"><span className="m-icon">🎯</span><span className="m-val">{(result.semantic_similarity*100).toFixed(0)}%</span><span className="m-label">Meaning kept</span></div>
                      <div className="metric"><span className="m-icon">✂️</span><span className="m-val">{(result.sari_score*100).toFixed(0)}</span><span className="m-label">SARI Score</span></div>
                      {result.char_count && <div className="metric"><span className="m-icon">📄</span><span className="m-val">{result.char_count}</span><span className="m-label">Chars in</span></div>}
                    </div>

                    {/* Simplified Text */}
                    <div className="simplified-output">
                      {result.simplified_text.split('\n').map((line,i)=>{
                        if (line.startsWith('📖')) return <h2 key={i} className="out-title">{line}</h2>;
                        if (line.startsWith('─')) return <hr key={i} className="out-divider"/>;
                        if (line.startsWith('📌')) return <h3 key={i} className="out-section">{line}</h3>;
                        if (!line.trim()) return <div key={i} style={{height:'0.5rem'}}/>;
                        return <p key={i} className="out-para">{line}</p>;
                      })}
                    </div>

                    {/* Audio Section */}
                    <div className="audio-card">
                      <div className="audio-card-header">
                        <div>
                          <div className="audio-title">🎙️ Podcast Audio</div>
                          <div className="audio-sub">Neural voice · {lang} · High quality MP3</div>
                        </div>
                        {!audioUrl && (
                          <button className="btn-primary" onClick={handleAudio} disabled={audioGenerating}>
                            {audioGenerating ? <><Spinner/>Generating...</> : <>▶ Generate Audio</>}
                          </button>
                        )}
                      </div>
                      {audioUrl && (
                        <div className="audio-player">
                          <audio ref={audioRef} src={audioUrl} onEnded={()=>setIsPlaying(false)}/>
                          <button className="play-btn" onClick={togglePlay}>
                            {isPlaying ? '⏸' : '▶'}
                          </button>
                          <div className="audio-wave">
                            {[...Array(20)].map((_,i)=>(
                              <div key={i} className={`wave-bar ${isPlaying?'wave-animate':''}`}
                                style={{animationDelay:`${i*0.08}s`,height:`${8+Math.sin(i*0.8)*8}px`}}/>
                            ))}
                          </div>
                          <div className="audio-meta">
                            <span>{lang} Neural Voice</span>
                            <span className="audio-quality-tag">● HIGH QUALITY</span>
                          </div>
                          <a href={audioUrl} download="simplifyai_podcast.mp3" className="btn-ghost btn-sm">⬇️</a>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="empty" className="empty-state" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                    <div className="empty-illustration">
                      <div className="empty-rings">
                        <div className="ring ring-1"/><div className="ring ring-2"/><div className="ring ring-3"/>
                        <div className="empty-core">✨</div>
                      </div>
                    </div>
                    <p className="empty-title">Ready to Simplify</p>
                    <p className="empty-sub">Paste your textbook content or upload a PDF to get started.<br/>The AI will break it into sections and simplify each one.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="footer">
        <p>© 2026 SimplifyAI — Open Source Zero-Cost AI Educational Platform</p>
      </footer>
    </div>
  );
}

function Spinner() {
  return <span className="spinner" style={{width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite',marginRight:6}}/>;
}
