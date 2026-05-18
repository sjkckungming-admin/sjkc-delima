import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';

// Firestore (Untuk Canvas / Ujian)
import { getFirestore, doc as fireDoc, setDoc as fireSet, updateDoc as fireUpdate, deleteDoc as fireDelete, onSnapshot as fireSnapshot, collection as fireCollection } from 'firebase/firestore';

// Realtime Database (Untuk versi Vercel sebenar - Tanpa Billing)
import { getDatabase, ref as rtdbRef, set as rtdbSet, update as rtdbUpdate, remove as rtdbRemove, onValue as rtdbOnValue, push as rtdbPush } from 'firebase/database';

// 1. Firebase Initialization
let firebaseConfig = {
  apiKey: "AIzaSyBRbfRCs0Eqn5SWB34Ip2VDzA8k4G9JmvM",
  authDomain: "sjk-delima.firebaseapp.com",
  databaseURL: "https://sjk-delima-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sjk-delima",
  storageBucket: "sjk-delima.firebasestorage.app",
  messagingSenderId: "616642054550",
  appId: "1:616642054550:web:5485b3fac5e2e6620635b7"
};

if (typeof __firebase_config !== 'undefined') {
  firebaseConfig = JSON.parse(__firebase_config);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const dbFirestore = getFirestore(app);
const dbRealtime = getDatabase(app);

const isCanvas = typeof __firebase_config !== 'undefined';
const safeAppId = typeof __app_id !== 'undefined' ? String(__app_id).replace(/\//g, '-') : 'default-app-id';

// --- Data Access Layer (Menyokong Firestore & Realtime DB serentak) ---
const saveDoc = async (collectionName, id, data) => {
  if (isCanvas) {
    if (id) {
      await fireUpdate(fireDoc(dbFirestore, 'artifacts', safeAppId, 'public', 'data', collectionName, id), data);
    } else {
      await fireSet(fireDoc(fireCollection(dbFirestore, 'artifacts', safeAppId, 'public', 'data', collectionName)), data);
    }
  } else {
    if (id) {
      await rtdbUpdate(rtdbRef(dbRealtime, `${collectionName}/${id}`), data);
    } else {
      const newRef = rtdbPush(rtdbRef(dbRealtime, collectionName));
      await rtdbSet(newRef, { ...data, id: newRef.key });
    }
  }
};

const updateDocData = async (collectionName, id, data) => {
  if (isCanvas) {
    await fireUpdate(fireDoc(dbFirestore, 'artifacts', safeAppId, 'public', 'data', collectionName, id), data);
  } else {
    await rtdbUpdate(rtdbRef(dbRealtime, `${collectionName}/${id}`), data);
  }
};

const deleteDocument = async (collectionName, id) => {
  if (isCanvas) {
    await fireDelete(fireDoc(dbFirestore, 'artifacts', safeAppId, 'public', 'data', collectionName, id));
  } else {
    await rtdbRemove(rtdbRef(dbRealtime, `${collectionName}/${id}`));
  }
};

// --- Reusable Components ---
const InfoItem = ({ label, value, copyable = false, onCopy }) => (
  <div className="flex flex-col bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100">
    <span className="text-emerald-700 font-semibold text-lg mb-2">{label}</span>
    <div className="flex items-center justify-between gap-3">
      <span className="text-2xl font-bold text-emerald-950 break-all">{value || '-'}</span>
      {copyable && value && (
         <button onClick={() => onCopy(value)} className="text-emerald-600 hover:text-emerald-800 bg-emerald-200/50 p-3 rounded-xl transition-all shadow-sm active:scale-95" title="Copy">
           <span className="text-2xl">📋</span>
         </button>
      )}
    </div>
  </div>
);

const GlobalHeader = () => (
  <header className="bg-white/90 backdrop-blur-md shadow-[0_4px_20px_rgb(16,185,129,0.08)] py-4 px-6 md:px-12 flex justify-center sticky top-0 z-40 border-b border-emerald-100">
    <div className="flex flex-col items-center gap-1 md:gap-2 w-full max-w-6xl">
       <img 
          src="https://upload.wikimedia.org/wikipedia/commons/6/60/DELIMA_Logo.png" 
          referrerPolicy="no-referrer"
          onError={(e) => {
              e.target.onerror = null; 
              e.target.src = 'https://www.moe.gov.my/images/KPM/UKK/2020/06_Jun/Delima-Logo-01.png';
          }} 
          alt="Delima Logo" 
          className="h-16 md:h-24 w-auto object-contain"
       />
       <h1 className="text-xl md:text-3xl font-extrabold text-emerald-800 tracking-widest text-center mt-1">SJKC KUNG MING, BEAUFORT, SABAH.</h1>
    </div>
  </header>
);

const FormField = ({ label, type = "text", value, onChange, placeholder = "", required = false }) => (
  <div className="flex flex-col">
    <label className="text-emerald-800 font-medium mb-2 text-lg">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      placeholder={placeholder}
      required={required}
      className="bg-emerald-50/30 border border-emerald-100 text-emerald-950 rounded-2xl px-5 py-4 text-xl focus:outline-none focus:ring-4 focus:ring-emerald-400/30 focus:border-emerald-500 transition-all shadow-sm placeholder:text-emerald-300"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, required = false }) => (
  <div className="flex flex-col">
    <label className="text-emerald-800 font-medium mb-2 text-lg">{label}</label>
    <select 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      required={required}
      className="bg-emerald-50/30 border border-emerald-100 text-emerald-950 rounded-2xl px-5 py-4 text-xl focus:outline-none focus:ring-4 focus:ring-emerald-400/30 focus:border-emerald-500 transition-all shadow-sm"
    >
      <option value="">-- Sila Pilih / 请选择 --</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const classOptions = [
  ...[1, 2, 3, 4, 5, 6].flatMap(year => [
    `${year}-Hijau (青)`,
    `${year}-Kuning (黄)`,
    `${year}-Merah (红)`
  ]),
  "19 - Murid-murid yang sudah pindah sekolah",
  "20 - Murid-murid yang sudah tamat sekolah"
];

const sportsHouses = ['Merah (红)', 'Biru (蓝)', 'Kuning (黄)', 'Hijau (青)'];

const parseCSV = (str) => {
  const rows = [];
  let row = [];
  let inQuotes = false;
  let val = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '"') { inQuotes = !inQuotes; } 
    else if (char === ',' && !inQuotes) { row.push(val.trim()); val = ''; } 
    else if (char === '\n' && !inQuotes) { row.push(val.trim()); rows.push(row); row = []; val = ''; } 
    else { val += char; }
  }
  row.push(val.trim()); rows.push(row);
  return rows.filter(r => r.length > 1 || r[0] !== '');
};

const callGeminiAPI = async (prompt, systemInstruction = "") => {
  const apiKey = ""; 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
  };
  const delay = (ms) => new Promise(res => setTimeout(res, ms));
  const retries = [1000, 2000, 4000, 8000, 16000];

  for (let i = 0; i < retries.length; i++) {
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (err) {
      if (i === retries.length - 1) throw err;
      await delay(retries[i]);
    }
  }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [debugLog, setDebugLog] = useState('Menyambung ke pelayan... / 正在连接服务器...');
  
  const [viewState, setViewState] = useState('public'); 
  const [toast, setToast] = useState('');
  
  const [loginRole, setLoginRole] = useState(null); 
  const [loginPin, setLoginPin] = useState('');

  const [searchIC, setSearchIC] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [teacherClass, setTeacherClass] = useState(classOptions[0]);
  const [teacherTransferStudent, setTeacherTransferStudent] = useState(null);

  const [adminTab, setAdminTab] = useState('students');
  const [adminSearch, setAdminSearch] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [bulkUpdateModal, setBulkUpdateModal] = useState(false);
  const [bulkFrom, setBulkFrom] = useState('');
  const [bulkTo, setBulkTo] = useState('');

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    let timer;
    if (loading && !authError) {
      timer = setTimeout(() => {
        setAuthError("Sambungan terlalu lambat. Sila cuba guna Data Telefon (Hotspot). / 连接超时！如果使用学校 WiFi，网络可能会被拦截。请尝试使用手机热点！");
        setLoading(false);
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [loading, authError]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        setDebugLog('Mengesahkan identiti... / 正在验证身份...');
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
        setAuthError("Sistem gagal disahkan. Sila pastikan ciri 'Anonymous' didayakan. / 身份验证失败，请确保 Firebase 开启了 Anonymous 登录功能。");
        setLoading(false); 
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if(currentUser) setDebugLog('Memuat turun data... / 正在下载资料...');
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    let unsubStudents;
    let unsubAnnouncements;

    if (isCanvas) {
       unsubStudents = fireSnapshot(fireCollection(dbFirestore, 'artifacts', safeAppId, 'public', 'data', 'students'), (snapshot) => {
         const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
         setStudents(data);
         setLoading(false);
       }, (error) => {
         console.error(error);
         setAuthError("Ralat pangkalan data (Firestore). / 数据库错误，请检查规则。");
         setLoading(false);
       });
       
       unsubAnnouncements = fireSnapshot(fireCollection(dbFirestore, 'artifacts', safeAppId, 'public', 'data', 'announcements'), (snapshot) => {
         const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
         setAnnouncements(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
       });
    } else {
       unsubStudents = rtdbOnValue(rtdbRef(dbRealtime, 'students'), (snapshot) => {
         const data = snapshot.val();
         const list = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
         setStudents(list);
         setLoading(false);
       }, (error) => {
         console.error("RTDB Error:", error);
         setAuthError("Pangkalan data dikunci. Sila semak Realtime Database Rules. / 数据库权限被拒绝，请检查 Firebase Realtime Database 规则。");
         setLoading(false);
       });

       unsubAnnouncements = rtdbOnValue(rtdbRef(dbRealtime, 'announcements'), (snapshot) => {
         const data = snapshot.val();
         const list = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
         setAnnouncements(list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
       });
    }
    
    return () => {
        if (unsubStudents) unsubStudents();
        if (unsubAnnouncements) unsubAnnouncements();
    };
  }, [user]);

  const handleCopy = async (text) => {
    if (!text) return;
    try { await navigator.clipboard.writeText(text); showToast('Disalin berjaya / 复制成功！'); } 
    catch (err) { showToast('Gagal menyalin / 复制失败'); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchIC.trim()) return;
    const normalizedSearch = searchIC.replace(/-/g, '').trim();
    const found = students.find(s => s.ic && s.ic.replace(/-/g, '').trim() === normalizedSearch);
    setSearchResult(found || null);
    setHasSearched(true);
  };

  const handleExportCSV = (dataList, filename) => {
    const headers = ['Nama', 'IC', 'No. Pelajar', 'Delima ID', 'Kata Laluan', 'IDME', 'Kelas', 'Rumah Sukan', 'Tarikh Masuk', 'Tarikh Pindah', 'Sekolah Pindah', 'Tarikh Tamat'];
    const rows = dataList.map(s => [
      s.name, s.ic, s.studentId, s.delimaId, s.password, s.idme, s.class, s.sportsHouse, s.enrollDate, s.transferDate, s.transferSchool, s.gradDate
    ].map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  };

  const handleAdminSaveStudent = async (e) => {
    e.preventDefault();
    if (!editingStudent.ic || !editingStudent.name) return showToast('Sila masukkan Nama & IC / 请输入姓名和身份证');
    try {
      if (editingStudent.id) {
        await updateDocData('students', editingStudent.id, editingStudent);
        showToast('Berjaya dikemaskini / 更新成功');
      } else {
        if (students.some(s => s.ic === editingStudent.ic)) return showToast('No. KP sudah wujud / 该身份证已存在');
        await saveDoc('students', null, { ...editingStudent, createdAt: new Date().toISOString() });
        showToast('Berjaya ditambah / 添加成功');
      }
      setEditingStudent(null);
    } catch (err) { showToast('Ralat sistem / 系统错误'); }
  };

  const handleAdminSaveAnnouncement = async (e) => {
    e.preventDefault();
    if (!editingAnnouncement.title) return showToast('Sila masukkan Tajuk / 请输入标题');
    try {
      if (editingAnnouncement.id) {
        await updateDocData('announcements', editingAnnouncement.id, editingAnnouncement);
        showToast('Hebahan dikemaskini / 通告已更新');
      } else {
        await saveDoc('announcements', null, { ...editingAnnouncement, createdAt: new Date().toISOString() });
        showToast('Hebahan ditambah / 通告已添加');
      }
      setEditingAnnouncement(null);
    } catch (err) { showToast('Ralat sistem / 系统错误'); }
  };

  const handleDelete = async () => {
    if(!deleteConfirm) return;
    try {
      await deleteDocument(deleteConfirm.type, deleteConfirm.id);
      showToast('Berjaya dipadam / 删除成功');
      setDeleteConfirm(null);
    } catch (err) { showToast('Ralat memadam / 删除失败'); }
  };

  const handleTeacherTransferSubmit = async (e) => {
    e.preventDefault();
    if (!teacherTransferStudent.transferSchool) return showToast('Sila masukkan nama sekolah / 请输入学校名称');
    try {
      await updateDocData('students', teacherTransferStudent.id, {
        class: "19 - Murid-murid yang sudah pindah sekolah",
        transferDate: teacherTransferStudent.transferDate || new Date().toISOString().split('T')[0],
        transferSchool: teacherTransferStudent.transferSchool
      });
      showToast('Murid berjaya dipindahkan / 转校办理成功');
      setTeacherTransferStudent(null);
    } catch (err) { showToast('Ralat / 发生错误'); }
  };

  const handleBulkClassUpdate = async () => {
    if(!bulkFrom || !bulkTo) return showToast('Sila pilih kelas / 请选择班级');
    const toUpdate = students.filter(s => s.class === bulkFrom);
    if(toUpdate.length === 0) return showToast('Tiada murid dalam kelas asal / 原班级没有学生');
    showToast('Sedang menukar kelas... / 正在批量换班...');
    try {
        let count = 0;
        for (const s of toUpdate) { await updateDocData('students', s.id, { class: bulkTo }); count++; }
        showToast(`Berjaya menukar kelas ${count} murid / 成功为 ${count} 名学生换班`);
        setBulkUpdateModal(false);
    } catch (err) { showToast('Ralat sistem / 系统错误'); }
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const rows = parseCSV(text);
      if (rows.length < 2) return showToast('Fail kosong atau format salah / 文件为空或格式有误');
      const dataRows = rows.slice(1);
      let successCount = 0;
      showToast('Sedang mengimport... / 正在导入...');
      for (const row of dataRows) {
        const student = {
            name: row[0] || '', ic: row[1] || '', studentId: row[2] || '', delimaId: row[3] || '',
            password: row[4] || '', idme: row[5] || '', class: row[6] || '', sportsHouse: row[7] || '',
            enrollDate: row[8] || '', transferDate: row[9] || '', transferSchool: row[10] || '', gradDate: row[11] || '',
        };
        if (student.ic && student.name) {
            const existing = students.find(s => s.ic === student.ic);
            try {
                if (existing) { await updateDocData('students', existing.id, student); } 
                else { student.createdAt = new Date().toISOString(); await saveDoc('students', null, student); }
                successCount++;
            } catch (err) { console.error("Import error", err); }
        }
      }
      showToast(`Berjaya: ${successCount} rekod / 成功导入 ${successCount} 条数据`);
      e.target.value = null;
    };
    reader.readAsText(file);
  };

  const handleGenerateAnnouncement = async () => {
    if (!aiPrompt.trim()) return showToast('Sila masukkan idea untuk AI / 请输入通告主题思路');
    setIsGeneratingAI(true);
    showToast('AI sedang merangka... / AI 正在撰写中...');
    try {
      const systemPrompt = "Anda adalah pentadbir sekolah SJKC (Sekolah Jenis Kebangsaan Cina) di Malaysia. Tuliskan satu hebahan rasmi sekolah dalam Bahasa Melayu dan Bahasa Cina berdasarkan input pengguna. Ensure it is professional, polite, and ready to be published. Output only the message content, no placeholders.";
      const generatedText = await callGeminiAPI(aiPrompt, systemPrompt);
      setEditingAnnouncement(prev => ({...prev, content: generatedText, title: prev.title || "Hebahan Terkini / 最新通告"}));
      setAiPrompt('');
      showToast('Berjaya dijana oleh AI ✨ / AI 撰写成功');
    } catch (err) {
      showToast('Ralat AI / AI 生成失败, sila cuba lagi.');
    } finally { setIsGeneratingAI(false); }
  };

  const handleGenerateMessage = async (student) => {
      setIsGeneratingAI(true);
      showToast('AI sedang merangka mesej... / AI 正在撰写信息...');
      try {
          const prompt = `Student Name: ${student.name}\nDelima ID: ${student.delimaId}\nPassword: ${student.password}\nIDME: ${student.idme}\nClass: ${student.class}`;
          const systemPrompt = "Write a short, polite WhatsApp message to a parent in both Malay and Chinese. Inform them of their child's school account details (Delima ID, Password, IDME) provided in the prompt. Be friendly and helpful. Do not use markdown asterisks (**), just plain text.";
          const msg = await callGeminiAPI(prompt, systemPrompt);
          await navigator.clipboard.writeText(msg);
          showToast('Mesej berjaya disalin ke papan keratan ✨ / 信息已复制到剪贴板，可直接发送');
      } catch (err) { showToast('Ralat AI / AI 生成失败'); } 
      finally { setIsGeneratingAI(false); }
  };

  const renderPublicView = () => (
    <div className="max-w-6xl mx-auto w-full space-y-12 animate-in fade-in zoom-in duration-500">
      <section className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(16,185,129,0.06)] border border-emerald-100 text-center relative overflow-hidden">
        <div className="absolute -top-24 -right-24 bg-emerald-100/60 w-64 h-64 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-24 -left-24 bg-teal-100/50 w-64 h-64 rounded-full blur-3xl opacity-60"></div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-emerald-900 tracking-tight mb-4 relative z-10">Sistem Semakan Delima</h2>
        <p className="text-2xl text-emerald-700/90 mb-10 relative z-10 font-medium">保佛公民小学 Delima 账户查询</p>
        
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto relative z-10">
          <input type="text" value={searchIC} onChange={(e) => setSearchIC(e.target.value)} placeholder="Masukkan No. KP / 输入学生身份证号码..." className="flex-1 bg-white border-2 border-emerald-200 text-emerald-950 rounded-2xl px-6 py-5 text-2xl focus:outline-none focus:ring-4 focus:ring-emerald-400/30 focus:border-emerald-500 transition-all placeholder:text-emerald-300 font-medium shadow-sm" />
          <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-2xl text-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 whitespace-nowrap">
            <span className="text-2xl">🔍</span> Semak 查询
          </button>
        </form>
      </section>

      {hasSearched && (
        <section className="animate-in slide-in-from-bottom-8 duration-500">
          {searchResult ? (
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgb(16,185,129,0.08)] border border-emerald-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-emerald-500"><span className="text-8xl opacity-20">✅</span></div>
              <h2 className="text-3xl font-bold text-emerald-900 mb-8 pb-6 border-b border-emerald-100 flex items-center gap-4">
                <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-lg font-bold tracking-wider shadow-sm border border-emerald-200/50">REKOD DIJUMPAI</span> Maklumat Pelajar
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <InfoItem label="Nama / 姓名" value={searchResult.name} onCopy={handleCopy} />
                <InfoItem label="No. KP / 身份证" value={searchResult.ic} onCopy={handleCopy} />
                <InfoItem label="Kelas / 班级" value={searchResult.class} onCopy={handleCopy} />
                <InfoItem label="No. Pelajar / 学号" value={searchResult.studentId} onCopy={handleCopy} />
                
                <div className="md:col-span-2 mt-4 mb-2"><h3 className="text-xl font-bold text-emerald-600 mb-2 border-b border-emerald-100/50 pb-2">Maklumat Akaun / 账户信息 (Sila Salin / 请复制)</h3></div>
                <InfoItem label="Delima ID" value={searchResult.delimaId} copyable onCopy={handleCopy} />
                <InfoItem label="Kata Laluan / 密码" value={searchResult.password} copyable onCopy={handleCopy} />
                <InfoItem label="IDME" value={searchResult.idme} copyable onCopy={handleCopy} />
                <InfoItem label="Rumah Sukan / 运动队伍" value={searchResult.sportsHouse} onCopy={handleCopy} />

                <div className="md:col-span-2 mt-4 mb-2"><h3 className="text-xl font-bold text-emerald-600/70 mb-2 border-b border-emerald-100/50 pb-2">Sejarah & Tarikh / 日期记录</h3></div>
                <InfoItem label="Tarikh Masuk / 入学日期" value={searchResult.enrollDate} onCopy={handleCopy} />
                <InfoItem label="Tarikh Pindah / 转校日期" value={searchResult.transferDate} onCopy={handleCopy} />
                <InfoItem label="Sekolah Pindah / 转校学校" value={searchResult.transferSchool} onCopy={handleCopy} />
                <InfoItem label="Tarikh Tamat / 毕业日期" value={searchResult.gradDate} onCopy={handleCopy} />
              </div>
            </div>
          ) : (
            <div className="bg-rose-50 rounded-[2rem] p-10 text-center border border-rose-100 shadow-sm">
              <span className="text-6xl mb-4 block">⚠️</span>
              <h3 className="text-2xl font-bold text-rose-900 mb-2">Tiada Rekod Dijumpai / 找不到记录</h3>
              <p className="text-xl text-rose-700">Sila pastikan No. KP dimasukkan dengan betul. / 请确保您输入的身份证号码绝对正确。</p>
            </div>
          )}
        </section>
      )}

      <section className="pt-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-emerald-100 p-3 rounded-2xl"><span className="text-3xl">📢</span></div>
          <h2 className="text-3xl font-bold text-emerald-900">Hebahan & Aktiviti Terkini <span className="block text-xl text-emerald-600/80 font-medium mt-1">最新活动与应用介绍</span></h2>
        </div>
        {announcements.length === 0 ? (
           <div className="bg-white/60 border border-emerald-100 rounded-3xl p-12 text-center text-emerald-600/70 text-xl font-medium">Tiada hebahan buat masa ini / 暂无最新通告</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {announcements.map(ann => (
              <div key={ann.id} className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-100 hover:shadow-md hover:border-emerald-300 transition-all flex flex-col h-full group">
                <h3 className="text-2xl font-bold text-emerald-900 mb-4 group-hover:text-emerald-600 transition-colors">{ann.title}</h3>
                <p className="text-lg text-emerald-950/80 mb-8 whitespace-pre-wrap flex-grow leading-relaxed">{ann.content}</p>
                {ann.linkUrl && (
                  <a href={ann.linkUrl} target="_blank" rel="noopener noreferrer" className="bg-emerald-50 hover:bg-emerald-500 text-emerald-700 hover:text-white px-6 py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-3 transition-all mt-auto w-full border border-emerald-200 hover:border-emerald-500">
                    Akses Sekarang 点击进入 🔗
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );

  const renderTeacherView = () => {
    const classStudents = students.filter(s => s.class === teacherClass);
    return (
      <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-white p-8 rounded-[2rem] shadow-sm border border-emerald-100">
          <div>
            <h2 className="text-3xl font-bold text-emerald-900 mb-2">Panel Guru 班主任控制台</h2>
            <p className="text-xl text-emerald-700/80 font-medium">Pilih kelas untuk mengurus data murid. / 请选择班级查看并管理学生资料。</p>
          </div>
          <button onClick={() => setViewState('public')} className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900 text-lg font-bold bg-emerald-50 hover:bg-emerald-100 px-6 py-3 rounded-full transition-all border border-emerald-100">
            ⬅️ Kembali / 返回首页
          </button>
        </div>
        <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(16,185,129,0.04)] border border-emerald-100">
          <div className="flex flex-col md:flex-row gap-6 mb-8 items-end">
            <div className="flex-1 w-full"><SelectField label="Pilih Kelas / 选择班级:" value={teacherClass} onChange={setTeacherClass} options={classOptions} /></div>
            <button onClick={() => handleExportCSV(classStudents, `Data_Kelas_${teacherClass}.csv`)} className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-2xl text-xl font-bold flex items-center justify-center gap-3 transition-all h-[68px] shadow-lg shadow-teal-600/20">
              ⬇️ Eksport Excel 导出
            </button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-emerald-100">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-emerald-50 text-emerald-800 text-lg">
                  <th className="p-5 border-b border-emerald-100 font-bold w-32">Tindakan 操作</th>
                  <th className="p-5 border-b border-emerald-100 font-bold">Nama 姓名</th>
                  <th className="p-5 border-b border-emerald-100 font-bold">IC 身份证</th>
                  <th className="p-5 border-b border-emerald-100 font-bold">Delima ID</th>
                  <th className="p-5 border-b border-emerald-100 font-bold">Kata Laluan 密码</th>
                  <th className="p-5 border-b border-emerald-100 font-bold">IDME</th>
                </tr>
              </thead>
              <tbody className="text-lg">
                {classStudents.length === 0 ? (
                  <tr><td colSpan="6" className="p-12 text-center text-emerald-600/60 text-xl font-medium">Tiada murid / 该班级暂无学生记录</td></tr>
                ) : (
                  classStudents.map((s) => (
                    <tr key={s.id} className="border-b border-emerald-50/50 hover:bg-emerald-100/50 transition-colors">
                      <td className="p-4">
                         <button onClick={() => setTeacherTransferStudent(s)} className="bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors mb-2 w-full justify-center border border-orange-200 hover:border-orange-500">
                            🏢 Pindah 转校
                         </button>
                         <button onClick={() => handleGenerateMessage(s)} disabled={isGeneratingAI} className="bg-emerald-100 text-emerald-700 hover:bg-emerald-500 hover:text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors w-full justify-center disabled:opacity-50 border border-emerald-200 hover:border-emerald-500">
                            💬 ✨ WhatsApp
                         </button>
                      </td>
                      <td className="p-5 text-emerald-950 font-bold">{s.name}</td>
                      <td className="p-5 text-emerald-800/80 font-medium">{s.ic}</td>
                      <td className="p-5 font-mono text-emerald-800 bg-emerald-50/80 rounded-lg">{s.delimaId}</td>
                      <td className="p-5 font-mono text-rose-600 font-bold">{s.password}</td>
                      <td className="p-5 text-emerald-800/80">{s.idme}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderAdminView = () => {
    const filteredAdminStudents = students.filter(s => s.name?.toLowerCase().includes(adminSearch.toLowerCase()) || s.ic?.includes(adminSearch));
    return (
      <div className="w-full max-w-[98%] mx-auto space-y-8 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4 bg-emerald-900 p-8 rounded-[2rem] shadow-xl text-white">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-emerald-300">Sistem Admin 管理员后台</h2>
            <p className="text-xl text-emerald-100/80">Urus Semua Data & Hebahan / 全校资料及通告总控</p>
          </div>
          <button onClick={() => setViewState('public')} className="flex items-center gap-2 text-emerald-100 hover:text-white text-lg font-medium bg-emerald-800/80 px-6 py-3 rounded-full transition-all border border-emerald-700">
            ⬅️ Log Keluar / 退出后台
          </button>
        </div>
        <div className="flex gap-4 border-b border-emerald-200 px-4">
           <button onClick={() => setAdminTab('students')} className={`px-8 py-4 text-xl font-bold border-b-4 transition-colors ${adminTab === 'students' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-emerald-800/60 hover:text-emerald-800'}`}>
             Data Pelajar 学生管理
           </button>
           <button onClick={() => setAdminTab('announcements')} className={`px-8 py-4 text-xl font-bold border-b-4 transition-colors ${adminTab === 'announcements' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-emerald-800/60 hover:text-emerald-800'}`}>
             Hebahan & Aplikasi 首页通告设置
           </button>
        </div>
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-emerald-100">
          {adminTab === 'students' && (
            <div className="animate-in fade-in">
              <div className="flex flex-col xl:flex-row gap-6 mb-8 justify-between items-center">
                <div className="flex-1 w-full relative flex items-center">
                  <span className="absolute left-5 text-xl">🔍</span>
                  <input type="text" placeholder="Cari Nama / IC (搜索)..." value={adminSearch} onChange={e => setAdminSearch(e.target.value)} className="w-full bg-emerald-50/50 border border-emerald-200 text-emerald-950 rounded-2xl pl-14 pr-5 py-4 text-xl focus:outline-none focus:ring-4 focus:ring-emerald-400/30 focus:border-emerald-500 placeholder:text-emerald-400 transition-all" />
                </div>
                <div className="flex flex-wrap gap-4 w-full xl:w-auto justify-end">
                  <button onClick={() => setBulkUpdateModal(true)} className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-4 rounded-2xl text-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-teal-500/20">🔁 Naik Kelas (Pukal) 批量换班</button>
                  <button onClick={() => setEditingStudent({})} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-2xl text-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20">➕ Tambah Murid</button>
                  <label className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-4 rounded-2xl text-lg font-bold flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-sky-500/20">⬆️ Import CSV <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} /></label>
                  <button onClick={() => handleExportCSV(students, 'Semua_Data_Pelajar.csv')} className="bg-emerald-900 hover:bg-emerald-950 text-emerald-50 px-6 py-4 rounded-2xl text-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20">⬇️ Eksport</button>
                </div>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-emerald-100">
                <table className="w-full text-left border-collapse min-w-[1500px]">
                  <thead className="sticky top-0 bg-emerald-50 z-10 shadow-sm">
                    <tr className="text-emerald-800 text-lg">
                      <th className="p-4 border-b border-emerald-100 font-bold w-32">Tindakan</th>
                      <th className="p-4 border-b border-emerald-100 font-bold">Nama</th>
                      <th className="p-4 border-b border-emerald-100 font-bold">IC</th>
                      <th className="p-4 border-b border-emerald-100 font-bold">Kelas 班级</th>
                      <th className="p-4 border-b border-emerald-100 font-bold">Delima ID</th>
                      <th className="p-4 border-b border-emerald-100 font-bold">Password</th>
                      <th className="p-4 border-b border-emerald-100 font-bold">R. Sukan</th>
                      <th className="p-4 border-b border-emerald-100 font-bold">T. Pindah</th>
                    </tr>
                  </thead>
                  <tbody className="text-lg">
                    {filteredAdminStudents.map(s => (
                      <tr key={s.id} className="border-b border-emerald-50 hover:bg-emerald-50/60 transition-colors">
                        <td className="p-4 flex gap-2">
                          <button onClick={() => setEditingStudent(s)} className="p-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-500 hover:text-white transition-colors border border-sky-200">✏️</button>
                          <button onClick={() => setDeleteConfirm({type: 'students', id: s.id, name: s.name})} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-500 hover:text-white transition-colors border border-rose-200">🗑️</button>
                        </td>
                        <td className="p-4 font-bold text-emerald-950">{s.name}</td>
                        <td className="p-4 text-emerald-800">{s.ic}</td>
                        <td className="p-4"><span className="bg-emerald-100/80 text-emerald-900 px-3 py-1 rounded-md text-sm font-bold border border-emerald-200/50">{s.class}</span></td>
                        <td className="p-4 font-mono text-sm text-emerald-800">{s.delimaId}</td>
                        <td className="p-4 font-mono text-sm text-rose-600 font-medium">{s.password}</td>
                        <td className="p-4 text-emerald-800">{s.sportsHouse}</td>
                        <td className="p-4 text-emerald-800">{s.transferSchool}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {adminTab === 'announcements' && (
             <div className="animate-in fade-in space-y-8">
                <div className="flex justify-end">
                   <button onClick={() => setEditingAnnouncement({})} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl text-xl font-bold flex items-center gap-3 transition-all shadow-lg shadow-emerald-500/20">
                     ➕ Tambah Hebahan / 发布新通告
                   </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   {announcements.map(ann => (
                      <div key={ann.id} className="bg-white rounded-2xl p-6 border border-emerald-100 flex flex-col hover:border-emerald-300 hover:shadow-md transition-all group">
                         <div className="flex justify-between items-start mb-4">
                           <h3 className="text-2xl font-bold text-emerald-900 group-hover:text-emerald-700 transition-colors">{ann.title}</h3>
                           <div className="flex gap-2">
                             <button onClick={() => setEditingAnnouncement(ann)} className="p-3 bg-sky-50 text-sky-600 rounded-xl hover:bg-sky-500 hover:text-white transition-colors border border-sky-100">✏️</button>
                             <button onClick={() => setDeleteConfirm({type: 'announcements', id: ann.id, name: ann.title})} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-500 hover:text-white transition-colors border border-rose-100">🗑️</button>
                           </div>
                         </div>
                         <p className="text-emerald-950/80 mb-6 text-lg whitespace-pre-wrap">{ann.content}</p>
                         {ann.linkUrl && <span className="mt-auto bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm truncate border border-emerald-200/50 font-medium">{ann.linkUrl}</span>}
                      </div>
                   ))}
                </div>
             </div>
          )}
        </div>
      </div>
    );
  };

  const renderStudentModal = () => {
    if (!editingStudent) return null;
    return (
      <div className="fixed inset-0 bg-emerald-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
        <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col border border-emerald-100">
          <div className="sticky top-0 bg-white border-b border-emerald-100 px-8 py-6 flex justify-between items-center z-10 rounded-t-[2rem]">
            <h2 className="text-3xl font-bold text-emerald-900">{!editingStudent.id ? 'Tambah Murid / 添加学生' : 'Kemaskini Murid / 修改资料'}</h2>
            <button onClick={() => setEditingStudent(null)} className="p-2 hover:bg-emerald-50 rounded-full transition-colors text-emerald-600">❌</button>
          </div>
          <form onSubmit={handleAdminSaveStudent} className="p-8 space-y-8 flex-1 bg-emerald-50/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField label="Nama / 姓名 *" value={editingStudent.name || ''} onChange={(v) => setEditingStudent({...editingStudent, name: v})} required />
              <FormField label="No. KP / 身份证 *" value={editingStudent.ic || ''} onChange={(v) => setEditingStudent({...editingStudent, ic: v})} required />
              <SelectField label="Kelas / 班级" value={editingStudent.class || ''} onChange={(v) => setEditingStudent({...editingStudent, class: v})} options={classOptions} />
              <FormField label="No. Pelajar / 学号" value={editingStudent.studentId || ''} onChange={(v) => setEditingStudent({...editingStudent, studentId: v})} />
              <FormField label="Delima ID" value={editingStudent.delimaId || ''} onChange={(v) => setEditingStudent({...editingStudent, delimaId: v})} />
              <FormField label="Kata Laluan / 密码" value={editingStudent.password || ''} onChange={(v) => setEditingStudent({...editingStudent, password: v})} />
              <FormField label="IDME" value={editingStudent.idme || ''} onChange={(v) => setEditingStudent({...editingStudent, idme: v})} />
              <SelectField label="Rumah Sukan / 运动队伍" value={editingStudent.sportsHouse || ''} onChange={(v) => setEditingStudent({...editingStudent, sportsHouse: v})} options={sportsHouses} />
              <FormField type="date" label="Tarikh Masuk / 入学日期" value={editingStudent.enrollDate || ''} onChange={(v) => setEditingStudent({...editingStudent, enrollDate: v})} />
              <FormField type="date" label="Tarikh Pindah / 转校日期" value={editingStudent.transferDate || ''} onChange={(v) => setEditingStudent({...editingStudent, transferDate: v})} />
              <FormField label="Sekolah Pindah / 转校学校" value={editingStudent.transferSchool || ''} onChange={(v) => setEditingStudent({...editingStudent, transferSchool: v})} />
              <FormField type="date" label="Tarikh Tamat / 毕业日期" value={editingStudent.gradDate || ''} onChange={(v) => setEditingStudent({...editingStudent, gradDate: v})} />
            </div>
            <div className="pt-8 flex justify-end gap-4 sticky bottom-0 bg-white border-t border-emerald-100 mt-8 py-6 px-8 -mx-8 -mb-8 rounded-b-[2rem]">
              <button type="button" onClick={() => setEditingStudent(null)} className="px-8 py-4 text-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl font-bold transition-colors">Batal</button>
              <button type="submit" className="px-10 py-4 text-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/30 transition-colors">Simpan 保存</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderAnnouncementModal = () => {
    if (!editingAnnouncement) return null;
    return (
      <div className="fixed inset-0 bg-emerald-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
        <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl flex flex-col border border-emerald-100">
          <div className="border-b border-emerald-100 px-8 py-6 flex justify-between items-center bg-white rounded-t-[2rem]">
            <h2 className="text-3xl font-bold text-emerald-900">{!editingAnnouncement.id ? 'Tambah Hebahan / 新增通告' : 'Edit Hebahan / 编辑通告'}</h2>
            <button onClick={() => setEditingAnnouncement(null)} className="p-2 hover:bg-emerald-50 rounded-full text-emerald-600">❌</button>
          </div>
          <div className="bg-emerald-50/80 px-8 py-5 border-b border-emerald-100 flex flex-col md:flex-row gap-4 items-center">
             <span className="text-2xl hidden md:block">✨</span>
             <input type="text" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="Idea hebahan (cth: Cuti am esok)... / 告诉 AI 通告的主题思路..." className="flex-1 bg-white border border-emerald-200 text-emerald-900 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-4 focus:ring-emerald-400/30 focus:border-emerald-500 placeholder:text-emerald-300 shadow-sm" />
             <button type="button" onClick={handleGenerateAnnouncement} disabled={isGeneratingAI} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all w-full md:w-auto justify-center disabled:opacity-50 whitespace-nowrap shadow-sm shadow-emerald-500/20">✨ Jana dengan AI</button>
          </div>
          <form onSubmit={handleAdminSaveAnnouncement} className="p-8 space-y-6 bg-emerald-50/30">
             <FormField label="Tajuk / 标题 *" value={editingAnnouncement.title || ''} onChange={(v) => setEditingAnnouncement({...editingAnnouncement, title: v})} required />
             <div className="flex flex-col">
                <label className="text-emerald-800 font-medium mb-2 text-lg">Kandungan / 内容详情</label>
                <textarea rows="5" value={editingAnnouncement.content || ''} onChange={e => setEditingAnnouncement({...editingAnnouncement, content: e.target.value})} className="bg-white border border-emerald-100 text-emerald-950 rounded-2xl px-5 py-4 text-xl focus:outline-none focus:ring-4 focus:ring-emerald-400/30 focus:border-emerald-500 transition-all shadow-sm w-full" />
             </div>
             <FormField label="URL Pautan (Aplikasi/Laman Web) / 链接地址" type="url" placeholder="https://..." value={editingAnnouncement.linkUrl || ''} onChange={(v) => setEditingAnnouncement({...editingAnnouncement, linkUrl: v})} />
             <div className="pt-6 flex justify-end gap-4">
                <button type="button" onClick={() => setEditingAnnouncement(null)} className="px-8 py-4 text-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl font-bold">Batal</button>
                <button type="submit" className="px-10 py-4 text-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/30">Simpan & Siarkan 发布</button>
             </div>
          </form>
        </div>
      </div>
    );
  };

  const renderTeacherTransferModal = () => {
      if(!teacherTransferStudent) return null;
      return (
        <div className="fixed inset-0 bg-emerald-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl p-8 border border-emerald-100">
             <div className="flex justify-between items-start mb-6">
                <div>
                   <h3 className="text-2xl font-bold text-emerald-900">Urus Pindah Sekolah</h3>
                   <p className="text-emerald-700 text-lg">办理转校: {teacherTransferStudent.name}</p>
                </div>
                <button onClick={() => setTeacherTransferStudent(null)} className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-full">❌</button>
             </div>
             <form onSubmit={handleTeacherTransferSubmit} className="space-y-6">
                 <FormField label="Sekolah Baharu / 准备转去的学校 *" value={teacherTransferStudent.transferSchool || ''} onChange={(v) => setTeacherTransferStudent({...teacherTransferStudent, transferSchool: v})} required />
                 <FormField type="date" label="Tarikh Pindah / 转校日期" value={teacherTransferStudent.transferDate || new Date().toISOString().split('T')[0]} onChange={(v) => setTeacherTransferStudent({...teacherTransferStudent, transferDate: v})} />
                 <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 text-orange-800 text-sm font-medium">
                     Nota: Murid ini akan dipindahkan secara automatik ke kelas "19 - Murid-murid yang sudah pindah sekolah".<br/>(学生将自动移至第19班: 转校生班)
                 </div>
                 <button type="submit" className="w-full py-4 text-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/30 transition-colors">Sahkan Pindah 确认办理</button>
             </form>
          </div>
        </div>
      )
  };

  const renderBulkUpdateModal = () => {
    if(!bulkUpdateModal) return null;
    return (
        <div className="fixed inset-0 bg-emerald-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl p-8 border border-emerald-100">
             <div className="flex justify-between items-start mb-8">
                <div>
                   <h3 className="text-3xl font-bold text-emerald-900">Naik Kelas Pukal 批量升级换班</h3>
                   <p className="text-emerald-700 text-lg mt-1">Pindahkan semua murid dari satu kelas ke kelas baharu.</p>
                </div>
                <button onClick={() => setBulkUpdateModal(false)} className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-full">❌</button>
             </div>
             <div className="space-y-8">
                <SelectField label="Dari Kelas Asal / 从原班级 (From) :" value={bulkFrom} onChange={setBulkFrom} options={classOptions} />
                <div className="flex justify-center"><span className="text-4xl">🔁</span></div>
                <SelectField label="Ke Kelas Baharu / 换至新班级 (To) :" value={bulkTo} onChange={setBulkTo} options={classOptions} />
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setBulkUpdateModal(false)} className="flex-1 py-4 text-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl font-bold transition-colors">Batal 取消</button>
                  <button onClick={handleBulkClassUpdate} className="flex-1 py-4 text-xl bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-bold shadow-lg shadow-teal-500/30 transition-colors">Sahkan Tukar 确认批量更换</button>
                </div>
             </div>
          </div>
        </div>
    )
  }

  const renderLoginModal = () => {
    if (!loginRole) return null;
    const handleLoginSubmit = (e) => {
      e.preventDefault();
      if (loginRole === 'admin' && loginPin === 'admin888') { setViewState('admin'); setLoginRole(null); setLoginPin(''); showToast('Berjaya log masuk Admin!'); } 
      else if (loginRole === 'teacher' && loginPin === 'guru123') { setViewState('teacher'); setLoginRole(null); setLoginPin(''); showToast('Berjaya log masuk Guru!'); } 
      else { showToast('Kata laluan salah / 密码错误'); }
    };
    return (
      <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-[2rem] p-10 max-w-md w-full shadow-2xl relative text-center border border-emerald-100">
           <button onClick={() => {setLoginRole(null); setLoginPin('');}} className="absolute top-6 right-6 text-emerald-400 hover:text-emerald-600">❌</button>
           <div className="mx-auto bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mb-6 border border-emerald-100"><span className="text-3xl">🔒</span></div>
           <h2 className="text-3xl font-bold text-emerald-900 mb-2">Akses Terhad</h2>
           <p className="text-emerald-700/80 text-lg mb-8">{loginRole === 'admin' ? 'Log Masuk Pentadbir / 管理员登录' : 'Log Masuk Guru / 教师登录'}</p>
           <form onSubmit={handleLoginSubmit} className="space-y-6">
             <input type="password" placeholder="Kata Laluan / 密码" value={loginPin} onChange={e => setLoginPin(e.target.value)} className="w-full bg-emerald-50/50 border border-emerald-100 text-center rounded-2xl px-6 py-4 text-2xl tracking-widest focus:ring-4 focus:ring-emerald-400/30 focus:border-emerald-500 focus:outline-none transition-all placeholder:text-emerald-300 text-emerald-950" autoFocus />
             <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl text-xl font-bold transition shadow-lg shadow-emerald-500/20">Sahkan / 确定</button>
           </form>
        </div>
      </div>
    );
  };

  if (authError) {
    return (
      <div className="min-h-screen bg-[#F0FDF4] flex flex-col items-center justify-center p-8 text-center font-sans">
        <span className="text-6xl mb-6 block">⚠️</span>
        <h2 className="text-3xl font-bold text-emerald-900 mb-4">Sistem Ralat / 系统遇到小问题</h2>
        <p className="text-xl text-emerald-700 mb-8 max-w-2xl">{authError}</p>
        <button onClick={() => window.location.reload()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl text-xl font-bold transition-all shadow-lg shadow-emerald-500/30">
           Cuba Semula / 刷新重试
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0FDF4] flex flex-col items-center justify-center font-sans relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-200/40 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-200/30 rounded-full blur-[120px]"></div>
        <div className="w-20 h-20 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-6 relative z-10"></div>
        <p className="text-3xl text-emerald-800 font-bold tracking-wide relative z-10">Sistem Memuatkan</p>
        <p className="text-xl text-emerald-700/80 font-medium tracking-wide mt-2 relative z-10">系统加载中...</p>
        <div className="mt-8 bg-white/60 px-6 py-3 rounded-full border border-emerald-100 relative z-10">
           <p className="text-emerald-600 font-medium animate-pulse">{debugLog}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] font-sans text-stone-800 selection:bg-emerald-200 flex flex-col relative">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-200/40 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-200/30 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 flex flex-col flex-grow">
        <GlobalHeader />
        {toast && (
          <div className="fixed top-28 left-1/2 -translate-x-1/2 bg-emerald-900 text-white px-8 py-4 rounded-full shadow-2xl z-[100] text-lg font-bold animate-in slide-in-from-top-4 flex items-center gap-3 border border-emerald-700">
            <span className="text-xl">✅</span> {toast}
          </div>
        )}

        <main className="flex-grow pt-10 pb-32 px-4 md:px-8 flex flex-col items-center">
          {viewState === 'public' && renderPublicView()}
          {viewState === 'teacher' && renderTeacherView()}
          {viewState === 'admin' && renderAdminView()}

          {viewState === 'public' && (
            <div className="mt-20 pt-10 flex gap-6 text-emerald-600/60 border-t border-emerald-200 w-full max-w-2xl justify-center">
              <button onClick={() => setLoginRole('teacher')} className="hover:text-emerald-800 transition-colors bg-transparent px-4 py-2 font-bold tracking-wide">Akses Guru (教师入口)</button>
              <span className="text-emerald-200 select-none">|</span>
              <button onClick={() => setLoginRole('admin')} className="hover:text-emerald-800 transition-colors bg-transparent px-4 py-2 font-bold tracking-wide">Akses Admin (后台管理)</button>
            </div>
          )}
        </main>
      </div>

      {renderLoginModal()}
      {renderStudentModal()}
      {renderAnnouncementModal()}
      {renderTeacherTransferModal()}
      {renderBulkUpdateModal()}
      
      {deleteConfirm && (
        <div className="fixed inset-0 bg-emerald-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-10 max-w-md text-center shadow-2xl border border-rose-100">
             <span className="text-6xl mb-6 block">⚠️</span>
             <h3 className="text-2xl font-bold text-emerald-900 mb-4">Sahkan Padam? 确认删除？</h3>
             <p className="text-lg text-emerald-800/80 mb-8">Anda pasti mahu memadam <strong className="text-rose-600">{deleteConfirm.name}</strong>?<br/>Data yang dipadam tidak boleh dikembalikan.</p>
             <div className="flex gap-4">
               <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xl font-bold rounded-2xl transition-colors">Batal 取消</button>
               <button onClick={handleDelete} className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white text-xl font-bold rounded-2xl shadow-lg shadow-rose-500/30 transition-colors">Padam 删除</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
