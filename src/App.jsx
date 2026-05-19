/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getDatabase, ref as rtdbRef, set as rtdbSet, update as rtdbUpdate, remove as rtdbRemove, onValue as rtdbOnValue, push as rtdbPush } from 'firebase/database';

// 1. Firebase Initialization (Sangat Ringkas & Terus ke Realtime DB)
const firebaseConfig = {
  apiKey: "AIzaSyBRbfRCs0Eqn5SWB34Ip2VDzA8k4G9JmvM",
  authDomain: "sjk-delima.firebaseapp.com",
  databaseURL: "https://sjk-delima-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sjk-delima",
  storageBucket: "sjk-delima.firebasestorage.app",
  messagingSenderId: "616642054550",
  appId: "1:616642054550:web:5485b3fac5e2e6620635b7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const dbRealtime = getDatabase(app);

// Helper: Dapatkan tarikh dan masa semasa (Waktu Malaysia)
const getCurrentTimestamp = () => {
  return new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kuala_Lumpur' });
};

// --- Data Access Layer ---
const saveDoc = async (collectionName, id, data) => {
  const dataWithTime = { ...data, lastUpdated: getCurrentTimestamp() };
  if (id) {
    await rtdbUpdate(rtdbRef(dbRealtime, `${collectionName}/${id}`), dataWithTime);
  } else {
    const newRef = rtdbPush(rtdbRef(dbRealtime, collectionName));
    await rtdbSet(newRef, { ...dataWithTime, id: newRef.key, createdAt: new Date().toISOString() });
  }
};

const updateDocData = async (collectionName, id, data) => {
  await rtdbUpdate(rtdbRef(dbRealtime, `${collectionName}/${id}`), { ...data, lastUpdated: getCurrentTimestamp() });
};

const deleteDocument = async (collectionName, id) => {
  await rtdbRemove(rtdbRef(dbRealtime, `${collectionName}/${id}`));
};

// --- Reusable Components ---
const InfoItem = ({ label, value, copyable = false, onCopy, highlight = false }) => (
  <div className={`flex flex-col p-5 rounded-2xl border h-full ${highlight ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50/60 border-emerald-100'}`}>
    <span className={`${highlight ? 'text-amber-700' : 'text-emerald-700'} font-semibold text-lg mb-2`}>{label}</span>
    <div className="flex items-center justify-between gap-3">
      <span className={`text-2xl font-bold break-all ${highlight ? 'text-amber-950' : 'text-emerald-950'}`}>{value || '-'}</span>
      {copyable && value && (
         <button onClick={() => onCopy(value)} className={`${highlight ? 'text-amber-600 hover:text-amber-800 bg-amber-200/50' : 'text-emerald-600 hover:text-emerald-800 bg-emerald-200/50'} p-3 rounded-xl transition-all shadow-sm active:scale-95 shrink-0`} title="Copy">
           <span className="text-2xl">📋</span>
         </button>
      )}
    </div>
  </div>
);

const GlobalHeader = () => (
  <header className="bg-white/90 backdrop-blur-md shadow-[0_4px_20px_rgb(16,185,129,0.08)] py-4 px-6 md:px-12 flex justify-center sticky top-0 z-40 border-b border-emerald-100">
    <div className="flex flex-col items-center gap-2 md:gap-3 w-full max-w-6xl">
       <img 
          src="/delima.jpg" 
          referrerPolicy="no-referrer"
          onError={(e) => {
              e.target.onerror = null; 
              e.target.src = 'https://www.moe.gov.my/images/KPM/UKK/2020/06_Jun/Delima-Logo-01.png';
          }} 
          alt="Delima Logo" 
          className="h-20 md:h-28 w-auto object-contain"
       />
       <h1 className="text-xl md:text-3xl font-extrabold text-emerald-800 tracking-widest text-center">SJKC KUNG MING, BEAUFORT, SABAH.</h1>
    </div>
  </header>
);

const FormField = ({ label, type = "text", value, onChange, placeholder = "", required = false }) => (
  <div className="flex flex-col">
    <label className="text-emerald-800 font-medium mb-2 text-lg">{label}</label>
    <input 
      type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
      className="bg-emerald-50/30 border border-emerald-100 text-emerald-950 rounded-2xl px-5 py-4 text-xl focus:outline-none focus:ring-4 focus:ring-emerald-400/30 focus:border-emerald-500 transition-all shadow-sm placeholder:text-emerald-300"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, required = false }) => (
  <div className="flex flex-col">
    <label className="text-emerald-800 font-medium mb-2 text-lg">{label}</label>
    <select 
      value={value} onChange={e => onChange(e.target.value)} required={required}
      className="bg-emerald-50/30 border border-emerald-100 text-emerald-950 rounded-2xl px-5 py-4 text-xl focus:outline-none focus:ring-4 focus:ring-emerald-400/30 focus:border-emerald-500 transition-all shadow-sm"
    >
      <option value="">-- Sila Pilih / 请选择 --</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const classOptions = [
  ...[1, 2, 3, 4, 5, 6].flatMap(year => [`${year}-Hijau (青)`, `${year}-Kuning (黄)`, `${year}-Merah (红)`]),
  "19 - Murid pindah sekolah", "20 - Murid tamat sekolah"
];
const sportsHouses = ['Merah (红)', 'Biru (蓝)', 'Kuning (黄)', 'Hijau (青)'];
const genderOptions = ['L', 'P'];

const parseCSV = (str) => {
  const rows = []; let row = []; let inQuotes = false; let val = '';
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

export default function App() {
  const [students, setStudents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  
  const [viewState, setViewState] = useState('public'); 
  const [toast, setToast] = useState('');
  const [loginRole, setLoginRole] = useState(null); 
  const [loginPin, setLoginPin] = useState('');

  const [searchIC, setSearchIC] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [teacherClass, setTeacherClass] = useState(classOptions[0]);

  const [adminTab, setAdminTab] = useState('students');
  const [adminSearch, setAdminSearch] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [bulkUpdateModal, setBulkUpdateModal] = useState(false);
  const [bulkFrom, setBulkFrom] = useState('');
  const [bulkTo, setBulkTo] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // SAMBUNGAN TERUS (TANPA BLOCKING LOADING SCREEN - KALIS FIREWALL)
  useEffect(() => {
    signInAnonymously(auth).catch(err => console.log("Sambungan auth: Tembus Firewall..."));
    
    const unsubStudents = rtdbOnValue(rtdbRef(dbRealtime, 'students'), (snapshot) => {
      const data = snapshot.val();
      setStudents(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : []);
    });

    const unsubAnnouncements = rtdbOnValue(rtdbRef(dbRealtime, 'announcements'), (snapshot) => {
      const data = snapshot.val();
      const list = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setAnnouncements(list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    });
    
    return () => { unsubStudents(); unsubAnnouncements(); };
  }, []);

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

  // FORMAT CSV TEMPLAT MENGIKUT GAMBAR EXCEL CIKGU + KELAS + DELIMA
  const csvHeaders = ['NO', 'NO RUJ IDME', 'NO RUJUKAN', 'NAMA MURID', '姓名', 'L/P', 'RUMAH SUKAN', 'SIJIL LAHIR', 'TARIKH LAHIR', 'NO MY KID', 'KELAS', 'MOE DELIMA EMAIL', 'PASSWORD'];

  const handleExportCSV = (dataList, filename) => {
    const rows = dataList.map(s => [
      s.no, s.idme, s.studentId, s.name, s.chineseName, s.gender, s.sportsHouse, s.birthCert, s.birthDate, s.ic, s.class, s.delimaId, s.password
    ].map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(','));
    const csv = [csvHeaders.join(','), ...rows].join('\n');
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  };

  const handleDownloadTemplate = () => {
    const csv = csvHeaders.join(',') + '\n';
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'Templat_Sistem_SJKC_KungMing.csv'; link.click();
    showToast('Templat berjaya dimuat turun / 模板下载成功！');
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const rows = parseCSV(event.target.result);
      if (rows.length < 2) return showToast('Fail kosong atau format salah / 文件为空或格式有误');
      let successCount = 0;
      showToast('Sedang mengimport... / 正在导入...');
      for (const row of rows.slice(1)) {
        const student = {
            no: row[0]||'', idme: row[1]||'', studentId: row[2]||'', name: row[3]||'', chineseName: row[4]||'', 
            gender: row[5]||'', sportsHouse: row[6]||'', birthCert: row[7]||'', birthDate: row[8]||'', 
            ic: row[9]||'', class: row[10]||'', delimaId: row[11]||'', password: row[12]||''
        };
        // Perlu ada IC dan Nama untuk sah
        if (student.ic && student.name) {
            const existing = students.find(s => s.ic === student.ic);
            try {
                if (existing) { await updateDocData('students', existing.id, student); } 
                else { await saveDoc('students', null, student); }
                successCount++;
            } catch (err) {}
        }
      }
      showToast(`Berjaya: ${successCount} rekod / 成功导入 ${successCount} 条数据`);
      e.target.value = null;
    };
    reader.readAsText(file);
  };

  const handleAdminSaveStudent = async (e) => {
    e.preventDefault();
    if (!editingStudent.ic || !editingStudent.name) return showToast('Sila masukkan Nama & IC / 请输入姓名和身份证');
    try {
      if (editingStudent.id) { await updateDocData('students', editingStudent.id, editingStudent); showToast('Berjaya dikemaskini / 更新成功'); } 
      else {
        if (students.some(s => s.ic === editingStudent.ic)) return showToast('No. KP sudah wujud / 该身份证已存在');
        await saveDoc('students', null, editingStudent); showToast('Berjaya ditambah / 添加成功');
      }
      setEditingStudent(null);
    } catch (err) { showToast('Ralat sistem / 系统错误'); }
  };

  const handleAdminSaveAnnouncement = async (e) => {
    e.preventDefault();
    if (!editingAnnouncement.title) return showToast('Sila masukkan Tajuk / 请输入标题');
    try {
      if (editingAnnouncement.id) { await updateDocData('announcements', editingAnnouncement.id, editingAnnouncement); showToast('Hebahan dikemaskini'); } 
      else { await saveDoc('announcements', null, editingAnnouncement); showToast('Hebahan ditambah'); }
      setEditingAnnouncement(null);
    } catch (err) { showToast('Ralat sistem'); }
  };

  const handleDelete = async () => {
    if(!deleteConfirm) return;
    await deleteDocument(deleteConfirm.type, deleteConfirm.id);
    showToast('Berjaya dipadam / 删除成功');
    setDeleteConfirm(null);
  };

  const handleBulkClassUpdate = async () => {
    if(!bulkFrom || !bulkTo) return showToast('Sila pilih kelas / 请选择班级');
    const toUpdate = students.filter(s => s.class === bulkFrom);
    if(toUpdate.length === 0) return showToast('Tiada murid dalam kelas asal / 原班级没有学生');
    showToast('Sedang menukar kelas... / 正在批量换班...');
    let count = 0;
    for (const s of toUpdate) { await updateDocData('students', s.id, { class: bulkTo }); count++; }
    showToast(`Berjaya menukar kelas ${count} murid / 成功为 ${count} 名学生换班`);
    setBulkUpdateModal(false);
  };

  // --- VIEWS ---
  const renderPublicView = () => (
    <div className="max-w-6xl mx-auto w-full space-y-12 animate-in fade-in zoom-in duration-500">
      <section className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(16,185,129,0.06)] border border-emerald-100 text-center relative overflow-hidden">
        <h2 className="text-4xl md:text-5xl font-extrabold text-emerald-900 tracking-tight mb-4">Sistem Semakan Delima</h2>
        <p className="text-2xl text-emerald-700/90 mb-10 font-medium">保佛公民小学 Delima 账户查询</p>
        
        <div className="max-w-3xl mx-auto text-left relative z-10">
          <label className="block text-emerald-800 font-bold mb-3 pl-2 text-xl md:text-2xl">
            Masukkan No. My Kid / 输入学生身份证号码:
          </label>
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <input type="text" value={searchIC} onChange={(e) => setSearchIC(e.target.value)} placeholder="Contoh: xxxxxx-xx-xxxx" className="w-full bg-white border-2 border-emerald-200 text-emerald-950 rounded-2xl px-6 py-5 text-2xl focus:outline-none focus:ring-4 focus:ring-emerald-400/30 focus:border-emerald-500 transition-all placeholder:text-emerald-300 font-medium shadow-sm" />
            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-2xl text-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 whitespace-nowrap">
              <span className="text-2xl">🔍</span> Semak 查询
            </button>
          </form>
        </div>
      </section>

      {hasSearched && (
        <section className="animate-in slide-in-from-bottom-8 duration-500">
          {searchResult ? (
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-emerald-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-emerald-500"><span className="text-8xl opacity-10">✅</span></div>
              <h2 className="text-3xl font-bold text-emerald-900 mb-8 pb-6 border-b border-emerald-100 flex items-center gap-4">
                <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-lg font-bold tracking-wider shadow-sm">REKOD DIJUMPAI</span> Maklumat Pelajar
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="md:col-span-2 mt-2 mb-2"><h3 className="text-xl font-bold text-emerald-600 mb-2 border-b border-emerald-100/50 pb-2">Maklumat Peribadi / 个人资料</h3></div>
                <InfoItem label="Nama Murid / 姓名" value={searchResult.name} onCopy={handleCopy} />
                <InfoItem label="Nama Cina / 中文姓名" value={searchResult.chineseName} onCopy={handleCopy} />
                <InfoItem label="No My Kid (IC) / 身份证" value={searchResult.ic} onCopy={handleCopy} />
                <InfoItem label="L/P (Jantina) / 性别" value={searchResult.gender} />
                <InfoItem label="Tarikh Lahir / 出生日期" value={searchResult.birthDate} />
                <InfoItem label="Sijil Lahir / 报生纸编号" value={searchResult.birthCert} onCopy={handleCopy} />
                
                <div className="md:col-span-2 mt-4 mb-2"><h3 className="text-xl font-bold text-emerald-600 mb-2 border-b border-emerald-100/50 pb-2">Maklumat Sekolah / 学校资料</h3></div>
                <InfoItem label="Kelas / 班级" value={searchResult.class} />
                <InfoItem label="No Rujukan / 学号" value={searchResult.studentId} onCopy={handleCopy} />
                <InfoItem label="No Ruj IDME" value={searchResult.idme} onCopy={handleCopy} />
                <InfoItem label="Rumah Sukan / 运动队伍" value={searchResult.sportsHouse} />

                <div className="md:col-span-2 mt-4 mb-2"><h3 className="text-xl font-bold text-emerald-600 mb-2 border-b border-emerald-100/50 pb-2">Maklumat Akaun DELIMA / DELIMA 账户信息</h3></div>
                <InfoItem label="MOE Delima Email" value={searchResult.delimaId} copyable onCopy={handleCopy} highlight />
                <div className="flex flex-col h-full">
                   <InfoItem label="Password / 密码" value={searchResult.password} copyable onCopy={handleCopy} highlight />
                   <p className="text-rose-600 font-bold text-sm mt-3 pl-2">🚨 Jika ingin menukar Kata Laluan, sila hubungi Admin Sekolah. Terima Kasih.</p>
                </div>
                
                <div className="md:col-span-2 mt-6 text-right border-t border-emerald-100/50 pt-4">
                   <span className="text-emerald-700 font-semibold bg-emerald-50 px-4 py-2 rounded-full text-sm border border-emerald-100">Tarikh Kemaskini / 数据最后更新于: {searchResult.lastUpdated || '-'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-rose-50 rounded-[2rem] p-10 text-center border border-rose-100 shadow-sm">
              <span className="text-6xl mb-4 block">⚠️</span>
              <h3 className="text-2xl font-bold text-rose-900 mb-2">Tiada Rekod Dijumpai / 找不到记录</h3>
              <p className="text-xl text-rose-700">Sila pastikan No. KP / No My Kid dimasukkan dengan betul. / 请确保您输入的身份证号码绝对正确。</p>
            </div>
          )}
        </section>
      )}

      <section className="pt-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-emerald-100 p-3 rounded-2xl"><span className="text-3xl">📢</span></div>
          <h2 className="text-3xl font-bold text-emerald-900">Hebahan Terkini <span className="block text-xl text-emerald-600/80 font-medium mt-1">最新活动与通告</span></h2>
        </div>
        {announcements.length === 0 ? (
           <div className="bg-white/60 border border-emerald-100 rounded-3xl p-12 text-center text-emerald-600/70 text-xl font-medium">Tiada hebahan / 暂无通告</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {announcements.map(ann => (
              <div key={ann.id} className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-100 flex flex-col h-full group">
                <h3 className="text-2xl font-bold text-emerald-900 mb-4">{ann.title}</h3>
                <p className="text-lg text-emerald-950/80 mb-8 whitespace-pre-wrap flex-grow">{ann.content}</p>
                <span className="text-sm text-emerald-600 mb-4 font-medium">Dikemaskini: {ann.lastUpdated || '-'}</span>
                {ann.linkUrl && (
                  <a href={ann.linkUrl} target="_blank" rel="noopener noreferrer" className="bg-emerald-50 hover:bg-emerald-500 text-emerald-700 hover:text-white px-6 py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-3 transition-all mt-auto border border-emerald-200">
                    Akses Sekarang 🔗
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
      <div className="w-full max-w-[98%] mx-auto space-y-8 animate-in fade-in duration-300">
        <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm border border-emerald-100">
          <div>
            <h2 className="text-3xl font-bold text-emerald-900 mb-2">Panel Guru 班主任控制台</h2>
            <p className="text-xl text-emerald-700/80 font-medium">Pilih kelas untuk mengurus dan menyemak data murid.</p>
          </div>
          <button onClick={() => setViewState('public')} className="text-emerald-700 hover:text-emerald-900 text-lg font-bold bg-emerald-50 px-6 py-3 rounded-full border border-emerald-100">⬅️ Kembali</button>
        </div>
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-emerald-100">
          <div className="flex gap-6 mb-8 items-end">
            <div className="flex-1"><SelectField label="Pilih Kelas / 选择班级:" value={teacherClass} onChange={setTeacherClass} options={classOptions} /></div>
            <button onClick={() => handleExportCSV(classStudents, `Kelas_${teacherClass}.csv`)} className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-2xl text-xl font-bold flex gap-3 h-[68px]">
              ⬇️ Eksport Excel
            </button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-emerald-100">
            <table className="w-full text-left border-collapse min-w-[1400px]">
              <thead>
                <tr className="bg-emerald-50 text-emerald-800 text-lg">
                  <th className="p-5 border-b border-emerald-100">No Rujukan</th>
                  <th className="p-5 border-b border-emerald-100">Nama</th>
                  <th className="p-5 border-b border-emerald-100">Nama Cina</th>
                  <th className="p-5 border-b border-emerald-100">No My Kid</th>
                  <th className="p-5 border-b border-emerald-100">Delima ID</th>
                  <th className="p-5 border-b border-emerald-100">Password</th>
                  <th className="p-5 border-b border-emerald-100">Kemaskini (更新)</th>
                </tr>
              </thead>
              <tbody className="text-lg">
                {classStudents.length === 0 ? (
                  <tr><td colSpan="7" className="p-12 text-center text-emerald-600/60 text-xl font-medium">Tiada rekod / 该班级暂无学生记录</td></tr>
                ) : (
                  classStudents.map((s) => (
                    <tr key={s.id} className="border-b border-emerald-50/50 hover:bg-emerald-50">
                      <td className="p-5 font-medium text-emerald-800">{s.studentId}</td>
                      <td className="p-5 font-bold text-emerald-950">{s.name}</td>
                      <td className="p-5 font-bold text-emerald-900">{s.chineseName || '-'}</td>
                      <td className="p-5 font-medium">{s.ic}</td>
                      <td className="p-5 font-mono text-emerald-800 bg-emerald-50 rounded-lg">{s.delimaId}</td>
                      <td className="p-5 font-mono text-rose-600 font-bold">{s.password}</td>
                      <td className="p-5 text-sm text-emerald-600 font-medium">{s.lastUpdated || '-'}</td>
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
    const filtered = students.filter(s => s.name?.toLowerCase().includes(adminSearch.toLowerCase()) || s.ic?.includes(adminSearch) || s.chineseName?.includes(adminSearch));
    return (
      <div className="w-full max-w-[98%] mx-auto space-y-8 animate-in fade-in duration-300">
        <div className="flex justify-between items-center bg-emerald-900 p-8 rounded-[2rem] shadow-xl text-white">
          <div>
            <h2 className="text-3xl font-bold text-emerald-300">Sistem Admin 管理员后台</h2>
            <p className="text-xl text-emerald-100/80">Urus Semua Data & Hebahan</p>
          </div>
          <button onClick={() => setViewState('public')} className="text-emerald-100 bg-emerald-800/80 px-6 py-3 rounded-full border border-emerald-700">⬅️ Log Keluar</button>
        </div>
        <div className="flex gap-4 border-b border-emerald-200 px-4">
           <button onClick={() => setAdminTab('students')} className={`px-8 py-4 text-xl font-bold border-b-4 ${adminTab === 'students' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-emerald-800/60'}`}>Data Pelajar</button>
           <button onClick={() => setAdminTab('announcements')} className={`px-8 py-4 text-xl font-bold border-b-4 ${adminTab === 'announcements' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-emerald-800/60'}`}>Hebahan</button>
        </div>
        
        <div className="bg-white rounded-[2rem] p-8 border border-emerald-100">
          {adminTab === 'students' && (
            <div>
              <div className="flex flex-col xl:flex-row gap-6 mb-8 justify-between items-center">
                <div className="flex-1 w-full relative flex items-center">
                  <span className="absolute left-5 text-xl">🔍</span>
                  <input type="text" placeholder="Cari Nama / Nama Cina / IC (搜索)..." value={adminSearch} onChange={e => setAdminSearch(e.target.value)} className="w-full bg-emerald-50/50 border border-emerald-200 rounded-2xl pl-14 pr-5 py-4 text-xl" />
                </div>
                <div className="flex flex-wrap gap-4 justify-end">
                  <button onClick={() => setBulkUpdateModal(true)} className="bg-teal-500 text-white px-6 py-4 rounded-2xl font-bold">🔁 Naik Kelas Pukal</button>
                  <button onClick={() => setEditingStudent({})} className="bg-emerald-500 text-white px-6 py-4 rounded-2xl font-bold">➕ Tambah Murid</button>
                  <button onClick={handleDownloadTemplate} className="bg-emerald-100 text-emerald-800 px-6 py-4 rounded-2xl font-bold border border-emerald-300">📥 Templat CSV</button>
                  <label className="bg-sky-500 text-white px-6 py-4 rounded-2xl font-bold cursor-pointer">⬆️ Import CSV <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} /></label>
                  <button onClick={() => handleExportCSV(students, 'Semua_Data.csv')} className="bg-emerald-900 text-emerald-50 px-6 py-4 rounded-2xl font-bold">⬇️ Eksport</button>
                </div>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-emerald-100">
                <table className="w-full text-left border-collapse min-w-[1600px]">
                  <thead className="bg-emerald-50 text-emerald-800 text-lg">
                    <tr>
                      <th className="p-4 border-b border-emerald-100">Tindakan</th>
                      <th className="p-4 border-b border-emerald-100">No Rujukan</th>
                      <th className="p-4 border-b border-emerald-100">Nama</th>
                      <th className="p-4 border-b border-emerald-100">N. Cina</th>
                      <th className="p-4 border-b border-emerald-100">No My Kid (IC)</th>
                      <th className="p-4 border-b border-emerald-100">Kelas</th>
                      <th className="p-4 border-b border-emerald-100">Delima ID</th>
                      <th className="p-4 border-b border-emerald-100">Password</th>
                      <th className="p-4 border-b border-emerald-100">Kemaskini (更新)</th>
                    </tr>
                  </thead>
                  <tbody className="text-lg">
                    {filtered.map(s => (
                      <tr key={s.id} className="border-b border-emerald-50 hover:bg-emerald-50">
                        <td className="p-4 flex gap-2">
                          <button onClick={() => setEditingStudent(s)} className="p-2 bg-sky-50 text-sky-600 rounded-lg">✏️</button>
                          <button onClick={() => setDeleteConfirm({type: 'students', id: s.id, name: s.name})} className="p-2 bg-rose-50 text-rose-600 rounded-lg">🗑️</button>
                        </td>
                        <td className="p-4 text-emerald-800 font-medium">{s.studentId}</td>
                        <td className="p-4 font-bold">{s.name}</td>
                        <td className="p-4 font-bold">{s.chineseName || '-'}</td>
                        <td className="p-4">{s.ic}</td>
                        <td className="p-4"><span className="bg-emerald-100 px-3 py-1 rounded-md font-bold">{s.class}</span></td>
                        <td className="p-4 font-mono text-sm">{s.delimaId}</td>
                        <td className="p-4 font-mono text-sm text-rose-600">{s.password}</td>
                        <td className="p-4 text-sm text-emerald-600 font-medium">{s.lastUpdated || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {adminTab === 'announcements' && (
             <div className="space-y-8">
                <div className="flex justify-end"><button onClick={() => setEditingAnnouncement({})} className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold">➕ Tambah Hebahan</button></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   {announcements.map(ann => (
                      <div key={ann.id} className="bg-white rounded-2xl p-6 border border-emerald-100 flex flex-col">
                         <div className="flex justify-between mb-4">
                           <h3 className="text-2xl font-bold text-emerald-900">{ann.title}</h3>
                           <div className="flex gap-2">
                             <button onClick={() => setEditingAnnouncement(ann)} className="p-3 bg-sky-50 rounded-xl">✏️</button>
                             <button onClick={() => setDeleteConfirm({type: 'announcements', id: ann.id, name: ann.title})} className="p-3 bg-rose-50 rounded-xl">🗑️</button>
                           </div>
                         </div>
                         <p className="text-emerald-950/80 mb-4 text-lg whitespace-pre-wrap">{ann.content}</p>
                         <p className="text-sm text-emerald-600 font-bold mb-4 mt-auto">Tarikh Kemaskini: {ann.lastUpdated || '-'}</p>
                         {ann.linkUrl && <span className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg truncate">{ann.linkUrl}</span>}
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
      <div className="fixed inset-0 bg-emerald-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col">
          <div className="sticky top-0 bg-white border-b px-8 py-6 flex justify-between z-10">
            <h2 className="text-3xl font-bold text-emerald-900">{!editingStudent.id ? 'Tambah Murid' : 'Kemaskini Murid'}</h2>
            <button onClick={() => setEditingStudent(null)} className="text-2xl">❌</button>
          </div>
          <form onSubmit={handleAdminSaveStudent} className="p-8 space-y-8 bg-emerald-50/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField label="No" value={editingStudent.no || ''} onChange={(v) => setEditingStudent({...editingStudent, no: v})} />
              <FormField label="No Ruj IDME" value={editingStudent.idme || ''} onChange={(v) => setEditingStudent({...editingStudent, idme: v})} />
              <FormField label="No Rujukan / 学号" value={editingStudent.studentId || ''} onChange={(v) => setEditingStudent({...editingStudent, studentId: v})} />
              <FormField label="Nama Murid / 姓名 *" value={editingStudent.name || ''} onChange={(v) => setEditingStudent({...editingStudent, name: v})} required />
              <FormField label="Nama Cina / 中文姓名" value={editingStudent.chineseName || ''} onChange={(v) => setEditingStudent({...editingStudent, chineseName: v})} />
              <SelectField label="L/P (Jantina) / 性别" value={editingStudent.gender || ''} onChange={(v) => setEditingStudent({...editingStudent, gender: v})} options={genderOptions} />
              <SelectField label="Rumah Sukan / 运动队伍" value={editingStudent.sportsHouse || ''} onChange={(v) => setEditingStudent({...editingStudent, sportsHouse: v})} options={sportsHouses} />
              <FormField label="Sijil Lahir / 报生纸" value={editingStudent.birthCert || ''} onChange={(v) => setEditingStudent({...editingStudent, birthCert: v})} />
              <FormField type="text" placeholder="Contoh: 29/10/2014" label="Tarikh Lahir / 出生日期" value={editingStudent.birthDate || ''} onChange={(v) => setEditingStudent({...editingStudent, birthDate: v})} />
              <FormField label="No My Kid (IC) *" value={editingStudent.ic || ''} onChange={(v) => setEditingStudent({...editingStudent, ic: v})} required />
              <SelectField label="Kelas / 班级" value={editingStudent.class || ''} onChange={(v) => setEditingStudent({...editingStudent, class: v})} options={classOptions} />
              <FormField label="MOE Delima Email" value={editingStudent.delimaId || ''} onChange={(v) => setEditingStudent({...editingStudent, delimaId: v})} />
              <FormField label="Password / 密码" value={editingStudent.password || ''} onChange={(v) => setEditingStudent({...editingStudent, password: v})} />
            </div>
            <div className="pt-8 flex justify-end gap-4 sticky bottom-0 bg-white border-t mt-8 py-6 px-8 -mx-8 -mb-8">
              <button type="button" onClick={() => setEditingStudent(null)} className="px-8 py-4 text-xl bg-emerald-50 rounded-2xl font-bold">Batal</button>
              <button type="submit" className="px-10 py-4 text-xl bg-emerald-500 text-white rounded-2xl font-bold">Simpan 保存</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderAnnouncementModal = () => {
    if (!editingAnnouncement) return null;
    return (
      <div className="fixed inset-0 bg-emerald-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-[2rem] w-full max-w-2xl flex flex-col">
          <div className="border-b px-8 py-6 flex justify-between bg-white">
            <h2 className="text-3xl font-bold text-emerald-900">{!editingAnnouncement.id ? 'Tambah Hebahan' : 'Edit Hebahan'}</h2>
            <button onClick={() => setEditingAnnouncement(null)} className="text-2xl">❌</button>
          </div>
          <form onSubmit={handleAdminSaveAnnouncement} className="p-8 space-y-6 bg-emerald-50/30">
             <FormField label="Tajuk / 标题 *" value={editingAnnouncement.title || ''} onChange={(v) => setEditingAnnouncement({...editingAnnouncement, title: v})} required />
             <div className="flex flex-col">
                <label className="text-emerald-800 font-medium mb-2 text-lg">Kandungan / 内容详情</label>
                <textarea rows="5" value={editingAnnouncement.content || ''} onChange={e => setEditingAnnouncement({...editingAnnouncement, content: e.target.value})} className="bg-white border rounded-2xl px-5 py-4 text-xl w-full" />
             </div>
             <FormField label="URL Pautan" type="url" value={editingAnnouncement.linkUrl || ''} onChange={(v) => setEditingAnnouncement({...editingAnnouncement, linkUrl: v})} />
             <div className="pt-6 flex justify-end gap-4">
                <button type="button" onClick={() => setEditingAnnouncement(null)} className="px-8 py-4 text-xl bg-emerald-50 rounded-2xl font-bold">Batal</button>
                <button type="submit" className="px-10 py-4 text-xl bg-emerald-500 text-white rounded-2xl font-bold">Simpan 发布</button>
             </div>
          </form>
        </div>
      </div>
    );
  };

  const renderBulkUpdateModal = () => {
    if(!bulkUpdateModal) return null;
    return (
        <div className="fixed inset-0 bg-emerald-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl p-8 border border-emerald-100 flex flex-col">
             <div className="flex justify-between items-start mb-8">
                <div>
                   <h3 className="text-3xl font-bold text-emerald-900">Naik Kelas Pukal 批量升级换班</h3>
                   <p className="text-emerald-700 text-lg mt-1">Pindahkan semua murid dari satu kelas ke kelas baharu.</p>
                </div>
                <button onClick={() => setBulkUpdateModal(false)} className="text-2xl">❌</button>
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
  };

  const renderLoginModal = () => {
    if (!loginRole) return null;
    const handleLoginSubmit = (e) => {
      e.preventDefault();
      if (loginRole === 'admin' && loginPin === 'admin888') { setViewState('admin'); setLoginRole(null); setLoginPin(''); } 
      else if (loginRole === 'teacher' && loginPin === 'guru123') { setViewState('teacher'); setLoginRole(null); setLoginPin(''); } 
      else { showToast('Kata laluan salah'); }
    };
    return (
      <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-[2rem] p-10 max-w-md w-full text-center">
           <button onClick={() => {setLoginRole(null); setLoginPin('');}} className="absolute top-6 right-6 text-emerald-400">❌</button>
           <div className="mx-auto bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mb-6"><span className="text-3xl">🔒</span></div>
           <h2 className="text-3xl font-bold text-emerald-900 mb-2">Akses Terhad</h2>
           <form onSubmit={handleLoginSubmit} className="space-y-6 mt-8">
             <input type="password" placeholder="Kata Laluan / 密码" value={loginPin} onChange={e => setLoginPin(e.target.value)} className="w-full bg-emerald-50/50 border text-center rounded-2xl px-6 py-4 text-2xl tracking-widest" autoFocus />
             <button type="submit" className="w-full bg-emerald-500 text-white py-4 rounded-2xl text-xl font-bold">Sahkan</button>
           </form>
        </div>
      </div>
    );
  };

  const renderHeader = () => (
    <header className="bg-white/90 backdrop-blur-md shadow-sm py-4 px-6 md:px-12 flex justify-center sticky top-0 z-40 border-b border-emerald-100">
      <div className="flex flex-col items-center gap-1 md:gap-2 w-full max-w-6xl">
         <img src="https://upload.wikimedia.org/wikipedia/commons/6/60/DELIMA_Logo.png" alt="Delima" className="h-16 md:h-24 w-auto object-contain" />
         <h1 className="text-xl md:text-3xl font-extrabold text-emerald-800 tracking-widest text-center mt-1">SJKC KUNG MING, BEAUFORT, SABAH.</h1>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] font-sans text-stone-800 flex flex-col relative">
      <div className="relative z-10 flex flex-col flex-grow">
        {renderHeader()}
        {toast && (<div className="fixed top-28 left-1/2 -translate-x-1/2 bg-emerald-900 text-white px-8 py-4 rounded-full shadow-2xl z-[100] text-lg font-bold flex items-center gap-3"><span className="text-xl">✅</span> {toast}</div>)}

        <main className="flex-grow pt-10 pb-16 px-4 md:px-8 flex flex-col items-center">
          {viewState === 'public' && renderPublicView()}
          {viewState === 'teacher' && renderTeacherView()}
          {viewState === 'admin' && renderAdminView()}

          {viewState === 'public' && (
            <div className="mt-20 pt-10 flex gap-6 text-emerald-600/60 border-t w-full max-w-2xl justify-center">
              <button onClick={() => setLoginRole('teacher')} className="hover:text-emerald-800 font-bold tracking-wide">Akses Guru (教师入口)</button>
              <span className="select-none">|</span>
              <button onClick={() => setLoginRole('admin')} className="hover:text-emerald-800 font-bold tracking-wide">Akses Admin (后台管理)</button>
            </div>
          )}
        </main>
        <footer className="w-full text-center py-6 mt-auto border-t text-emerald-800 font-bold bg-white/40">
          Guru Pengurusan Delima Sekolah: Cikgu VUNG SU LAN 0198819943
        </footer>
      </div>

      {renderLoginModal()}
      {renderStudentModal()}
      {renderAnnouncementModal()}
      {renderBulkUpdateModal()}
      
      {deleteConfirm && (
        <div className="fixed inset-0 bg-emerald-950/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-10 max-w-md text-center">
             <span className="text-6xl mb-6 block">⚠️</span>
             <h3 className="text-2xl font-bold mb-4">Sahkan Padam?</h3>
             <div className="flex gap-4 mt-8">
               <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 bg-emerald-50 text-xl font-bold rounded-2xl">Batal</button>
               <button onClick={handleDelete} className="flex-1 py-4 bg-rose-500 text-white text-xl font-bold rounded-2xl">Padam</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
