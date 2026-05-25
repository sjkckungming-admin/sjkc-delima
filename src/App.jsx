import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

// ==========================================
// 内置 SVG 图标
// ==========================================
const Search = ({ size = 20, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>);
const LogOut = ({ size = 20, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>);
const Download = ({ size = 20, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>);
const Upload = ({ size = 20, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>);
const Trash2 = ({ size = 20, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>);
const Edit = ({ size = 20, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const ChevronRight = ({ size = 20, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 18 15 12 9 6"/></svg>);
const UserCheck = ({ size = 20, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>);
const Settings = ({ size = 20, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>);
const BookOpen = ({ size = 20, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>);
const AlertCircle = ({ size = 20, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>);
const RefreshCw = ({ size = 20, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>);
const ClipboardList = ({ size = 20, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>);
const ImageIcon = ({ size = 20, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>);
const Monitor = ({ size = 20, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>);

// ==========================================
// 1. Firebase 设定与初始化
// ==========================================
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
      apiKey: "AIzaSyBRbfRCs0Eqn5SWB34Ip2VDzA8k4G9JmvM",
      authDomain: "sjk-delima.firebaseapp.com",
      projectId: "sjk-delima",
      storageBucket: "sjk-delima.firebasestorage.app",
      messagingSenderId: "616642054550",
      appId: "1:616642054550:web:abcdef123456"
    };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const getCollectionPath = (collectionName) => {
  if (typeof __app_id !== 'undefined') {
    return `artifacts/${appId}/public/data/${collectionName}`;
  }
  return collectionName; 
};

// ==========================================
// 2. 主应用程序 (App Component)
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'teacher', 'admin'
  const [authRole, setAuthRole] = useState(''); // '', 'teacher', 'admin'
  
  // 数据状态
  const [students, setStudents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // 弹窗与加载状态
  const [isLoading, setIsLoading] = useState(true);
  const [modalMessage, setModalMessage] = useState(null);

  // 初始化验证与数据抓取
  useEffect(() => {
    // 动态修改网页的 App 图标 (Favicon / Apple Touch Icon) 为紫色电脑图案
    // 这样用户将其“下载/添加”到手机或电脑主屏时，就会显示这个电脑图标
    const faviconSvg = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#9333ea"/><g transform="translate(20, 20) scale(2.5)" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></g></svg>');
    
    let iconLink = document.querySelector("link[rel~='icon']");
    if (!iconLink) {
      iconLink = document.createElement('link');
      iconLink.rel = 'icon';
      document.head.appendChild(iconLink);
    }
    iconLink.type = 'image/svg+xml';
    iconLink.href = `data:image/svg+xml,${faviconSvg}`;

    let appleIcon = document.querySelector("link[rel='apple-touch-icon']");
    if (!appleIcon) {
      appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      document.head.appendChild(appleIcon);
    }
    appleIcon.href = `data:image/svg+xml,${faviconSvg}`;
    
    document.title = "SJKC Kung Ming Delima";

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
        setIsLoading(false);
        setModalMessage({ 
          title: "连接配置异常", 
          text: `无法连接至 Firebase 账户。\n详细错误: ${err.message}`
        });
      }
    };
    initAuth();

    const logAction = async (role, action, details) => {
      try {
        const newRef = doc(collection(db, getCollectionPath('logs')));
        await setDoc(newRef, { role, action, details, timestamp: new Date().toISOString() });
      } catch (e) {
        console.error("Failed to log action:", e);
      }
    };
    window.logSystemAction = logAction;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      unsubscribe();
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // 抓取数据
  useEffect(() => {
    if (!user) return;

    const handleFirestoreError = (error) => {
      console.error("Firestore error:", error);
      if (error.code === 'permission-denied' || (error.message && error.message.includes('Missing or insufficient permissions'))) {
         setModalMessage({ 
           title: "数据库读写被拦截", 
           text: "系统无法读取或写入数据。\n请前往 Firebase Console 更新 Rules 设置。" 
         });
      }
    };

    const studentsRef = collection(db, getCollectionPath('students'));
    const unsubscribeStudents = onSnapshot(query(studentsRef), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(data);
    }, handleFirestoreError);

    const announcementsRef = collection(db, getCollectionPath('announcements'));
    const unsubscribeAnnouncements = onSnapshot(query(announcementsRef), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAnnouncements(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }, handleFirestoreError);

    const logsRef = collection(db, getCollectionPath('logs'));
    const unsubscribeLogs = onSnapshot(query(logsRef), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    }, handleFirestoreError);

    return () => {
      unsubscribeStudents();
      unsubscribeAnnouncements();
      unsubscribeLogs();
    };
  }, [user]);

  const showMessage = (title, text) => {
    setModalMessage({ title, text });
  };

  const handleLogout = () => {
    if (authRole) {
      window.logSystemAction(authRole, '退出系统', '用户安全登出');
    }
    setAuthRole('');
    setActiveTab('home');
    showMessage("成功", "已安全退出账户。");
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-16 space-y-4">
          <RefreshCw className="animate-spin text-purple-500" size={40} />
          <div className="text-xl text-purple-600 font-semibold animate-pulse">正在安全连接系统...</div>
        </div>
      );
    }

    if (activeTab === 'home') {
      return <HomeView students={students} announcements={announcements} setActiveTab={setActiveTab} />;
    } else if (activeTab === 'teacher') {
      if (authRole === 'teacher' || authRole === 'admin') {
        return <TeacherPortal students={students} db={db} getCollectionPath={getCollectionPath} showMessage={showMessage} />;
      } else {
        return <LoginView roleTarget="teacher" setAuthRole={setAuthRole} showMessage={showMessage} />;
      }
    } else if (activeTab === 'admin') {
      if (authRole === 'admin') {
        return <AdminPortal students={students} announcements={announcements} logs={logs} db={db} getCollectionPath={getCollectionPath} showMessage={showMessage} />;
      } else {
        return <LoginView roleTarget="admin" setAuthRole={setAuthRole} showMessage={showMessage} />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF9FF] text-gray-800 font-sans selection:bg-purple-200">
      {/* 顶部 Header */}
      <header className="bg-white shadow-md rounded-b-3xl pb-8 pt-6 px-4 mx-auto max-w-5xl mb-8 relative border-b-4 border-purple-600">
        <div className="flex flex-col items-center text-center">
          <img 
            src="delima.jpg" 
            alt="DELIMA SJKC KUNG MING" 
            className="h-24 mb-4 object-contain drop-shadow-sm"
            onError={(e) => { e.target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_Kementerian_Pendidikan_Malaysia.png/250px-Logo_Kementerian_Pendidikan_Malaysia.png"; }}
          />
          <h2 className="text-lg md:text-xl font-bold tracking-widest text-gray-700 uppercase mt-1 mb-1">
            SJKC KUNG MING, BEAUFORT, SABAH.
          </h2>
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-800 to-purple-500 my-2 py-1">
            保佛公民小学 Delima 账户查询
          </h1>
        </div>

        <div className="flex justify-center gap-4 mt-6 flex-wrap">
          {activeTab !== 'home' && (
            <button 
              onClick={() => setActiveTab('home')}
              className="px-6 py-2 rounded-full text-base font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all shadow-sm"
            >
              返回首页 (Kembali)
            </button>
          )}
          {authRole !== '' && (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-2 rounded-full text-base font-bold bg-red-50 text-red-600 hover:bg-red-100 shadow-sm transition-all"
            >
              <LogOut size={18} /> 登出
            </button>
          )}
        </div>
      </header>

      {/* 主体内容 */}
      <main className="max-w-5xl mx-auto px-4 pb-16">
        {renderContent()}
      </main>

      {/* 底部 */}
      <footer className="text-center py-8 mt-8 text-purple-400">
        <p className="text-sm mb-2">© {new Date().getFullYear()} SJKC KUNG MING. Hak Cipta Terpelihara.</p>
        <div className="flex justify-center items-center gap-4 text-xs mt-2 opacity-60 hover:opacity-100 transition-opacity">
          <button onClick={() => setActiveTab('teacher')} className="hover:text-amber-600 transition-colors">panel guru</button>
          <span>|</span>
          <button onClick={() => setActiveTab('admin')} className="hover:text-purple-700 transition-colors">admin access</button>
        </div>
      </footer>

      {/* 提示弹窗 */}
      {modalMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-bounce-in transform transition-all">
            <div className="flex items-center justify-center mb-4">
              {modalMessage.title.includes('异常') || modalMessage.title.includes('被拦截') || modalMessage.title === '错误' || modalMessage.title.includes('失败') ? (
                 <AlertCircle size={40} className="text-red-500" />
              ) : (
                 <UserCheck size={40} className="text-purple-500" />
              )}
            </div>
            <h3 className={`text-2xl font-bold mb-4 text-center ${modalMessage.title.includes('异常') || modalMessage.title.includes('被拦截') || modalMessage.title === '错误' ? 'text-red-600' : 'text-purple-700'}`}>
              {modalMessage.title}
            </h3>
            <p className="text-base text-gray-700 leading-relaxed text-center whitespace-pre-line">{modalMessage.text}</p>
            <button 
              onClick={() => setModalMessage(null)}
              className="mt-6 w-full bg-purple-600 text-white rounded-xl py-3 text-lg font-bold hover:bg-purple-700 transition-colors"
            >
              确定 (Tutup)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. 首页视图
// ==========================================
function HomeView({ students, announcements, setActiveTab }) {
  const [icNumber, setIcNumber] = useState('');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!icNumber.trim()) return;
    
    const cleanInput = icNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    const student = students.find(s => {
      const cleanIC = (s.ic || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const cleanBC = (s.birthCert || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      return cleanIC === cleanInput || cleanBC === cleanInput;
    });
    
    setResult(student || null);
    setSearched(true);

    // 记录家长/访客的查询行为
    if (window.logSystemAction) {
      if (student) {
        window.logSystemAction('visitor', '查询资料', `访客/家长成功查询了资料，输入的号码: ${icNumber} (对应学生: ${student.name})`);
      } else {
        window.logSystemAction('visitor', '查询失败', `有人尝试查询资料但未找到结果，输入的号码: ${icNumber}`);
      }
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <section className="bg-white rounded-3xl p-6 md:p-10 shadow-lg border border-purple-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-purple-800 mb-6 flex items-center gap-3 relative z-10">
          <Search size={28} className="text-purple-600" /> 查询学生 Delima 资料
        </h2>
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 relative z-10">
          <input 
            type="text" 
            placeholder="请输入学生 IC 或 报生纸号码 (No.K/P atau Surat Beranak)" 
            className="flex-1 text-lg p-4 border-2 border-purple-200 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all shadow-inner"
            value={icNumber}
            onChange={(e) => setIcNumber(e.target.value)}
          />
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-md transition-transform active:scale-95">
            查询 (Cari)
          </button>
        </form>

        {searched && (
          <div className="mt-8 border-t-2 border-purple-50 pt-8 animate-slide-up">
            {result ? (
              <div className="bg-purple-50 rounded-2xl p-6 md:p-8 border border-purple-200 shadow-sm">
                <h3 className="text-2xl font-bold text-purple-900 mb-6 border-b-2 border-purple-200 pb-3">学生资料 (Maklumat Murid)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
                  <InfoItem label="姓名 (NAMA MURID)" value={result.name} />
                  <InfoItem label="班级 (KELAS)" value={formatSimpleClassName(result.classYear, result.classColor)} />
                  <InfoItem label="IC 号码 (IC MURID)" value={result.ic} />
                  <InfoItem label="性别 (JANTINA)" value={result.gender} />
                  
                  <InfoItem label="DELIMA ID (EMAIL)" value={result.delimaId} isHighlight />
                  
                  <div className="flex flex-col">
                    <InfoItem label="密码 (PASSWORD)" value={result.password} isHighlight />
                    <span className="text-red-500 font-bold text-xs md:text-sm mt-2 px-1 leading-tight">
                      * Sila hubungi Guru Penyelaras Delima Sekolah jika ingin menukar kata laluan.
                    </span>
                  </div>
                  
                  <InfoItem label="学号 (NO RUJ SEK)" value={result.studentId} />
                  <InfoItem label="IDME (NO.RUJ IDME)" value={result.idme} />
                  
                  <InfoItem label="报生纸 (SURAT BERANAK)" value={result.birthCert} />
                  <InfoItem label="运动队伍 (RUMAH SUKAN)" value={result.sportsHouse} />
                  
                  {result.classYear === '19' && (
                    <>
                      <InfoItem label="状态 (Status)" value="已转校 (Pindah)" isAlert />
                      <InfoItem label="转校日期" value={result.transferDate || '-'} />
                      <InfoItem label="转校学校名称" value={result.transferSchool || '-'} />
                    </>
                  )}
                  {result.classYear === '20' && (
                    <>
                      <InfoItem label="状态 (Status)" value="已毕业 (Tamat)" isAlert />
                      <InfoItem label="毕业日期" value={result.graduationDate || '-'} />
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-lg text-center font-bold border border-red-100 flex items-center justify-center gap-3">
                <AlertCircle size={24} /> 找不到该学生的资料，请检查输入的号码是否正确。
              </div>
            )}
          </div>
        )}
      </section>

      {/* DELIMA Login Button */}
      <section className="animate-slide-up">
        <a 
          href="https://d2.delima.edu.my/login" 
          target="_blank" 
          rel="noreferrer"
          className="group block w-full bg-white border-4 border-purple-500 rounded-3xl p-6 md:p-10 text-center shadow-xl hover:shadow-2xl hover:bg-purple-50 transition-all active:scale-95"
        >
          <div className="flex flex-col items-center justify-center gap-1 md:gap-2">
            <h3 className="text-sm md:text-lg font-bold text-purple-600 uppercase tracking-widest opacity-90">
              Click here for login
            </h3>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-purple-800 leading-tight group-hover:scale-[1.02] transition-transform">
              Digital Educational Learning Initiative Malaysia
            </h2>
          </div>
        </a>
      </section>

      <section>
        <h2 className="text-2xl md:text-3xl font-extrabold text-purple-800 mb-6 flex items-center gap-3 pl-4 border-l-8 border-amber-400 rounded-l-md">
          <BookOpen size={28} className="text-amber-500" /> Hebahan & Aktiviti DELIMA (最新活动)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {announcements.length === 0 ? (
            <p className="text-base text-gray-500 p-8 col-span-2 text-center bg-white rounded-2xl shadow-sm border border-purple-50">暂无最新公告。管理员可在后台发布新内容。</p>
          ) : (
            announcements.map((ann) => (
              <a 
                key={ann.id} 
                href={ann.link || '#'} 
                target={ann.link ? "_blank" : "_self"}
                rel="noreferrer"
                className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all border border-purple-50 group flex flex-col justify-between overflow-hidden"
              >
                {ann.image && (
                  <div className="-mx-6 md:-mx-8 -mt-6 md:-mt-8 mb-6 bg-gray-50 flex items-center justify-center border-b border-gray-100">
                    <img src={ann.image} alt={ann.title} className="w-full h-auto max-h-80 object-contain" />
                  </div>
                )}
                <div>
                  <div className="flex justify-between items-start mb-4">
                    {/* 添加电脑小图标如果在 App 类型下 */}
                    <span className={`flex items-center gap-1 w-fit px-3 py-1 rounded-full text-xs font-bold tracking-wider ${ann.type === 'App' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {ann.type === 'App' && <Monitor size={14} />}
                      {ann.type}
                    </span>
                    <span className="text-gray-400 text-sm">{ann.date}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">{ann.title}</h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed line-clamp-3">{ann.content}</p>
                </div>
                {ann.link && (
                  <div className="mt-4 flex items-center text-purple-600 font-bold text-sm group-hover:translate-x-2 transition-transform">
                    点击前往 (Klik Sini) <ChevronRight size={18} />
                  </div>
                )}
              </a>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function InfoItem({ label, value, isHighlight, isAlert, className = "" }) {
  const displayValue = (!value || String(value).trim() === '' || value === '-') ? 'Sedang dikemaskini' : value;
  
  return (
    <div className={`p-4 rounded-xl border border-transparent ${isHighlight ? 'bg-purple-600 text-white shadow-sm' : isAlert ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-white border-gray-100'} ${className}`}>
      <div className={`text-xs md:text-sm font-semibold mb-1 opacity-80`}>{label}</div>
      <div className={`text-lg md:text-xl font-bold break-all ${displayValue === 'Sedang dikemaskini' ? 'italic opacity-60 font-normal text-base' : ''}`}>{displayValue}</div>
    </div>
  );
}

// ==========================================
// 4. 登录视图 (Login Modal)
// ==========================================
function LoginView({ roleTarget, setAuthRole, showMessage }) {
  const [pin, setPin] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (roleTarget === 'teacher' && pin === 'xcc6027@km') {
      setAuthRole('teacher');
      showMessage("登录成功", "欢迎进入教师控制台。");
      if (window.logSystemAction) window.logSystemAction('teacher', '系统登录', '教师成功登录系统');
    } else if (roleTarget === 'admin' && pin === 'admin888') {
      setAuthRole('admin');
      showMessage("登录成功", "欢迎进入系统后台。");
      if (window.logSystemAction) window.logSystemAction('admin', '系统登录', '管理员成功登录后台');
    } else {
      showMessage("错误", "密码不正确，请重试。");
      setPin('');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 max-w-sm mx-auto shadow-xl text-center border-t-4 border-purple-600 animate-fade-in">
      <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
        {roleTarget === 'admin' ? <Settings size={36} className="text-purple-700" /> : <UserCheck size={36} className="text-purple-700" />}
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">安全登录</h2>
      <p className="text-sm text-gray-500 mb-6">
        {roleTarget === 'admin' ? "请输入管理员密码" : "请输入教师专属密码 (Kata Laluan Guru)"}
      </p>
      <form onSubmit={handleLogin} className="space-y-6">
        <input 
          type="password" 
          placeholder="请输入密码" 
          className="w-full text-center text-xl tracking-[0.5em] p-4 border-2 border-purple-100 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
        <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg py-3 rounded-xl transition-all shadow-md">
          Log Masuk (登录)
        </button>
      </form>
    </div>
  );
}

// ==========================================
// 5. 教师控制台 (Teacher Portal)
// ==========================================
function TeacherPortal({ students, db, getCollectionPath, showMessage }) {
  const [selectedYear, setSelectedYear] = useState('1');
  const [selectedColor, setSelectedColor] = useState('H');
  const [transferModal, setTransferModal] = useState(null);

  const years = [
    { val: '1', label: '一年级 (Tahun 1)' },
    { val: '2', label: '二年级 (Tahun 2)' },
    { val: '3', label: '三年级 (Tahun 3)' },
    { val: '4', label: '四年级 (Tahun 4)' },
    { val: '5', label: '五年级 (Tahun 5)' },
    { val: '6', label: '六年级 (Tahun 6)' },
    { val: '19', label: '第19班: 转校生 (Pindah)' },
    { val: '20', label: '第20班: 毕业生 (Tamat)' }
  ];

  const colors = useMemo(() => {
    const cls = new Set([...students.map(s => s.classColor).filter(Boolean), 'H', 'M', 'K']);
    return Array.from(cls).sort();
  }, [students]);

  const classStudents = useMemo(() => {
    return students.filter(s => {
      if (selectedYear === '19' || selectedYear === '20') {
        return s.classYear === selectedYear;
      }
      return s.classYear === selectedYear && s.classColor === selectedColor;
    });
  }, [students, selectedYear, selectedColor]);

  const exportToExcel = () => {
    if (typeof window.XLSX === 'undefined') {
      showMessage("错误", "Excel导出工具尚未加载，请稍等或刷新页面。");
      return;
    }
    const exportData = classStudents.map(s => ({
      "KELAS": `${s.classYear}${s.classColor}`,
      "TARIKH MASUK": s.admissionDate || '',
      "NO.RUJ IDME": s.idme || '',
      "NO RUJ SEK": s.studentId || '',
      "NAMA MURID": s.name.includes('(') ? s.name.split('(')[0].trim() : s.name,
      "姓名": s.name.includes('(') ? s.name.split('(')[1].replace(')', '').trim() : '',
      "JANTINA": s.gender || '',
      "RUMAH SUKAN": s.sportsHouse || '',
      "SURAT BERANAK": s.birthCert || '',
      "TARIKH LAHIR": s.dob || '',
      "ic": s.rawIc || '',
      "IC MURID": s.ic,
      "EMAIL DELIMA": s.delimaId,
      "PASSWORD": s.password
    }));

    const ws = window.XLSX.utils.json_to_sheet(exportData);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Students");
    window.XLSX.writeFile(wb, `Senarai_Kelas_${selectedYear}${selectedColor}.xlsx`);
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const date = fd.get('transferDate');
    const school = fd.get('transferSchool');

    try {
      const studentRef = doc(db, getCollectionPath('students'), transferModal.id);
      await updateDoc(studentRef, {
        classYear: '19',
        transferDate: date,
        transferSchool: school
      });
      showMessage("成功", "学生已成功标记为转校。");
      if (window.logSystemAction) window.logSystemAction('teacher', '办理转校', `将学生 [${transferModal.name}] 标记为转校至 ${school}`);
      setTransferModal(null);
    } catch (error) {
      showMessage("错误", "更新失败: " + error.message);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-purple-50 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 border-b border-purple-100 pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-amber-600 flex items-center gap-3">
            <UserCheck size={28} /> 教师控制台 (Panel Guru)
          </h2>
          <p className="text-sm md:text-base text-gray-500 mt-2">请选择您的班级以查看和整理资料。</p>
        </div>
        
        <div className="flex flex-wrap gap-3 bg-purple-50 p-3 rounded-2xl">
          <select 
            className="text-base p-2 rounded-xl border border-purple-200 outline-none focus:border-purple-400"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {years.map(y => <option key={y.val} value={y.val}>{y.label}</option>)}
          </select>
          {selectedYear !== '19' && selectedYear !== '20' && (
            <select 
              className="text-base p-2 rounded-xl border border-purple-200 outline-none focus:border-purple-400"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
            >
              {colors.map(c => <option key={c} value={c}>{c} 班</option>)}
            </select>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          学生列表 ({classStudents.length} 人)
        </h3>
        <button onClick={exportToExcel} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-sm transition-all">
          <Download size={18} /> 导出 Excel
        </button>
      </div>

      <div className="hidden md:block overflow-x-auto bg-white rounded-2xl border border-gray-200 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
              <th className="p-4 font-semibold">姓名</th>
              <th className="p-4 font-semibold">IC 号码</th>
              <th className="p-4 font-semibold">DELIMA ID</th>
              <th className="p-4 font-semibold">密码</th>
              <th className="p-4 font-semibold text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {classStudents.map((s, idx) => (
              <tr key={s.id} className={`text-sm border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'} hover:bg-purple-50 transition-colors`}>
                <td className="p-4 font-bold text-gray-800">{s.name}</td>
                <td className="p-4 font-mono text-gray-600">{s.ic}</td>
                <td className="p-4 font-mono text-purple-600">{s.delimaId}</td>
                <td className="p-4 font-mono text-gray-600">{s.password}</td>
                <td className="p-4 text-center">
                  {selectedYear !== '19' && selectedYear !== '20' && (
                    <button 
                      onClick={() => setTransferModal(s)}
                      className="bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors"
                    >
                      标为转校
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {classStudents.length === 0 && (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500 text-base">该班级暂无学生数据。</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {classStudents.map(s => (
          <div key={s.id} className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
            <h4 className="text-lg font-bold text-gray-800 mb-2">{s.name}</h4>
            <div className="space-y-1 text-sm text-gray-600 mb-4">
              <p>IC: <span className="font-mono text-gray-800">{s.ic}</span></p>
              <p>DELIMA: <span className="font-mono text-purple-600 font-bold">{s.delimaId}</span></p>
              <p>Pwd: <span className="font-mono text-gray-800">{s.password}</span></p>
            </div>
            {selectedYear !== '19' && selectedYear !== '20' && (
              <button onClick={() => setTransferModal(s)} className="w-full bg-amber-50 border border-amber-200 text-amber-700 py-2.5 rounded-xl font-bold text-sm transition-colors">
                标为转校 (Pindah Sekolah)
              </button>
            )}
          </div>
        ))}
        {classStudents.length === 0 && (
          <div className="p-6 text-center text-gray-500 text-sm border border-gray-200 rounded-2xl">
            该班级暂无学生数据。
          </div>
        )}
      </div>

      {transferModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-slide-up">
            <h3 className="text-2xl font-bold text-amber-600 mb-2">处理转校</h3>
            <p className="text-base text-gray-600 mb-6">学生: <strong className="text-gray-800">{transferModal.name}</strong></p>
            
            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">转校日期</label>
                <input type="date" name="transferDate" required className="w-full p-3 border border-gray-300 rounded-xl text-base focus:border-amber-500 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">新学校名称</label>
                <input type="text" name="transferSchool" required placeholder="如: SJKC HWA SHIONG" className="w-full p-3 border border-gray-300 rounded-xl text-base focus:border-amber-500 focus:outline-none transition-colors" />
              </div>
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setTransferModal(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-base transition-colors">
                  取消 (Batal)
                </button>
                <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-base transition-colors">
                  确认 (Sahkan)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 6. 管理员后台 (Admin Portal)
// ==========================================
function AdminPortal({ students, announcements, logs, db, getCollectionPath, showMessage }) {
  const [adminTab, setAdminTab] = useState('all_students'); 
  const [confirmModal, setConfirmModal] = useState(null);
  
  const [editStudent, setEditStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [promoMode, setPromoMode] = useState('auto'); 
  const [promoSearchTerm, setPromoSearchTerm] = useState('');
  const [promoEdits, setPromoEdits] = useState({});

  const years = [
    { val: '1', label: '一年级' },
    { val: '2', label: '二年级' },
    { val: '3', label: '三年级' },
    { val: '4', label: '四年级' },
    { val: '5', label: '五年级' },
    { val: '6', label: '六年级' },
    { val: '19', label: '19班 (转校)' },
    { val: '20', label: '20班 (毕业)' }
  ];

  const downloadTemplate = () => {
    if (typeof window.XLSX === 'undefined') {
      showMessage("错误", "组件尚未加载完成，请稍后再试。");
      return;
    }
    const headers = [
      "KELAS", "TARIKH MASUK", "NO.RUJ IDME", "NO RUJ SEK", "NAMA MURID", "姓名", 
      "JANTINA", "RUMAH SUKAN", "SURAT BERANAK", "TARIKH LAHIR", "ic", "IC MURID", 
      "EMAIL DELIMA", "PASSWORD"
    ];
    const dummyData = [
      ["1H", "12/1/2026", "231203013003", "2026001", "ABNERCHRIS ARAPOC NICHOLAS", "艾纳士", 
       "L", "H", "SC 055497", "16/11/2019", "191116-12-0253", "191116-12-0253", 
       "abnerchrisarapocnicholas@moe-dl.edu.my", "Kmbft@0253"]
    ];
    const ws = window.XLSX.utils.aoa_to_sheet([headers, ...dummyData]);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Template");
    window.XLSX.writeFile(wb, "Template_Data_Murid_SJKC.xlsx");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (typeof window.XLSX === 'undefined') {
      showMessage("错误", "组件尚未加载完成，请稍后再试。");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = window.XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        const data = window.XLSX.utils.sheet_to_json(ws, { raw: false });
        
        let successCount = 0;
        for (const row of data) {
          let studentName = String(row['NAMA MURID'] || '').trim();
          const chineseName = String(row['姓名'] || '').trim();
          if (studentName && chineseName) {
            studentName = `${studentName} (${chineseName})`;
          } else if (!studentName && chineseName) {
            studentName = chineseName;
          }

          let classVal = String(row['KELAS'] || row['NO'] || '').trim();
          let pYear = '1';
          let pColor = 'H';
          if (classVal) {
             let match = classVal.match(/^(\d+)(.*)$/);
             if (match) {
                 pYear = match[1];
                 pColor = match[2].trim().toUpperCase() || 'H';
             } else {
                 pYear = classVal;
             }
          }

          const newStudent = {
            ic: String(row['IC MURID'] || row['IC号码'] || '').trim(), 
            rawIc: String(row['ic'] || '').trim(),
            name: studentName,
            studentId: String(row['NO RUJ SEK'] || row['ID MURID'] || ''),
            delimaId: String(row['EMAIL DELIMA'] || row['MOE EMAIL'] || ''),
            password: String(row['PASSWORD'] || row['MOE PASSWORD'] || ''),
            idme: String(row['NO.RUJ IDME'] || row['IDME'] || ''),
            admissionDate: String(row['TARIKH MASUK'] || ''),
            sportsHouse: String(row['RUMAH SUKAN'] || ''),
            gender: String(row['JANTINA'] || ''),
            birthCert: String(row['SURAT BERANAK'] || ''),
            dob: String(row['TARIKH LAHIR'] || ''),
            classYear: pYear,
            classColor: pColor,
            status: 'Active'
          };
          
          if (newStudent.ic && newStudent.name) {
            await setDoc(doc(db, getCollectionPath('students'), newStudent.ic), newStudent);
            successCount++;
          }
        }
        showMessage("导入成功", `成功读取并存入 ${successCount} 名学生资料。`);
        if (window.logSystemAction) window.logSystemAction('admin', '批量导入', `通过 Excel 成功导入/更新了 ${successCount} 名学生资料`);
      } catch (error) {
        showMessage("导入失败", error.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  const promptYearlyPromotion = () => {
    setConfirmModal({
      message: "确定要进行年度升学操作吗？\n\n六年级将移至毕业班，其余年级将自动升一级。此操作不可逆，请谨慎执行！",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          let count = 0;
          for (const s of students) {
            let newYear = s.classYear;
            if (newYear === '19' || newYear === '20') continue;
            const yearInt = parseInt(newYear, 10);
            if (yearInt === 6) newYear = '20'; 
            else if (yearInt >= 1 && yearInt <= 5) newYear = String(yearInt + 1);
            
            if (newYear !== s.classYear) {
              await updateDoc(doc(db, getCollectionPath('students'), s.id), { 
                classYear: newYear, 
                graduationDate: newYear === '20' ? new Date().toISOString().split('T')[0] : null 
              });
              count++;
            }
          }
          showMessage("操作成功", `已成功调整 ${count} 名学生的班级。`);
          if (window.logSystemAction) window.logSystemAction('admin', '年度升学', `成功执行了新学年班级调整，共变动 ${count} 人`);
        } catch (error) {
          showMessage("错误", "升学处理失败: " + error.message);
        }
      }
    });
  };

  const handlePromoEditChange = (id, field, value) => {
    setPromoEdits(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }));
  };

  const saveManualPromo = async (id, originalStudent) => {
    const updates = promoEdits[id];
    if (!updates) return;
    try {
      const newYear = updates.classYear !== undefined ? updates.classYear : originalStudent.classYear;
      const newColor = updates.classColor !== undefined ? updates.classColor : originalStudent.classColor;
      await updateDoc(doc(db, getCollectionPath('students'), id), {
        classYear: newYear, classColor: newColor,
        graduationDate: newYear === '20' ? new Date().toISOString().split('T')[0] : originalStudent.graduationDate
      });
      showMessage("成功", `成功更新 ${originalStudent.name} 的班级。`);
      if (window.logSystemAction) window.logSystemAction('admin', '手动调班', `将学生 [${originalStudent.name}] 调至 ${newYear}年级 ${newColor}班`);
      setPromoEdits(prev => { const next = { ...prev }; delete next[id]; return next; });
    } catch (err) { showMessage("错误", "更新失败: " + err.message); }
  };

  const [annForm, setAnnForm] = useState({ title: '', content: '', type: 'App', link: '', image: '' });
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showMessage("错误", "请上传图片文件 (JPG, PNG)");
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setAnnForm({...annForm, image: dataUrl});
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setAnnForm({...annForm, image: ''});
    const fileInput = document.getElementById('announcement-image-upload');
    if(fileInput) fileInput.value = '';
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const newRef = doc(collection(db, getCollectionPath('announcements')));
      await setDoc(newRef, { ...annForm, date: new Date().toISOString().split('T')[0] });
      showMessage("成功", "已发布最新公告。");
      if (window.logSystemAction) window.logSystemAction('admin', '发布通告', `发布了标题为 [${annForm.title}] 的通告`);
      
      setAnnForm({ title: '', content: '', type: 'App', link: '', image: '' });
      const fileInput = document.getElementById('announcement-image-upload');
      if(fileInput) fileInput.value = '';
    } catch (err) { showMessage("错误", "发布失败: " + err.message); }
  };
  
  const promptDeleteAnnouncement = (id) => {
    setConfirmModal({
      message: "确定要删除这条公告吗？删除后将无法恢复。",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const annToDelete = announcements.find(a => a.id === id);
          await deleteDoc(doc(db, getCollectionPath('announcements'), id));
          if (window.logSystemAction && annToDelete) window.logSystemAction('admin', '删除通告', `删除了通告 [${annToDelete.title}]`);
        } catch (err) { showMessage("错误", "删除失败: " + err.message); }
      }
    });
  };

  const exportLogsToExcel = () => {
    if (typeof window.XLSX === 'undefined') { showMessage("错误", "Excel导出工具尚未加载，请稍等或刷新页面。"); return; }
    const exportData = logs.map(l => ({
      "时间 (Masa)": new Date(l.timestamp).toLocaleString(),
      "身份 (Peranan)": l.role === 'admin' ? '管理员 (Admin)' : l.role === 'teacher' ? '教师 (Guru)' : '访客/家长 (Pelawat)',
      "操作类别 (Tindakan)": l.action,
      "详细内容 (Butiran)": l.details
    }));
    const ws = window.XLSX.utils.json_to_sheet(exportData);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "System_Logs");
    window.XLSX.writeFile(wb, `System_Logs_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const promptDeleteStudent = (student) => {
    setConfirmModal({
      message: `确认要将学生 [${student.name}] 彻底从系统中删除吗？此操作无法恢复！`,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await deleteDoc(doc(db, getCollectionPath('students'), student.id));
          showMessage("成功", "已成功删除该学生。");
          if (window.logSystemAction) window.logSystemAction('admin', '删除学生', `管理员删除了学生档案: ${student.name} (IC: ${student.ic})`);
        } catch (err) {
          showMessage("错误", "删除失败: " + err.message);
        }
      }
    });
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, getCollectionPath('students'), editStudent.id), editStudent);
      showMessage("成功", "学生资料已成功更新。");
      if (window.logSystemAction) window.logSystemAction('admin', '修改资料', `管理员更新了学生 [${editStudent.name}] 的资料`);
      setEditStudent(null);
    } catch (err) {
      showMessage("错误", "更新失败: " + err.message);
    }
  };

  const filteredAllStudents = useMemo(() => {
    if (!searchTerm) return students;
    const lower = searchTerm.toLowerCase();
    return students.filter(s => 
      s.name.toLowerCase().includes(lower) || 
      s.ic.toLowerCase().includes(lower) || 
      formatClassName(s.classYear, s.classColor).toLowerCase().includes(lower)
    );
  }, [students, searchTerm]);

  const filteredPromoStudents = useMemo(() => {
    if (!promoSearchTerm) return students;
    const lower = promoSearchTerm.toLowerCase();
    return students.filter(s => 
      s.name.toLowerCase().includes(lower) || 
      s.ic.toLowerCase().includes(lower)
    );
  }, [students, promoSearchTerm]);

  return (
    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border-t-8 border-purple-800 animate-fade-in relative">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-purple-900 flex items-center gap-3">
          <Settings size={32} className="text-purple-600" /> 系统后台管理 (Admin)
        </h2>
        <div className="bg-purple-50 border border-purple-100 text-purple-700 px-4 py-2 rounded-xl font-bold text-sm shadow-sm">
          当前系统共录入: <span className="text-purple-900 text-base">{students.length}</span> 人
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3 mb-8 border-b border-gray-100 pb-4">
        {[
          { id: 'all_students', label: '全校学生名单', icon: <UserCheck size={18} /> },
          { id: 'upload', label: '批量导入学生', icon: <Upload size={18} /> },
          { id: 'promotion', label: '年度升学操作', icon: <RefreshCw size={18} /> },
          { id: 'announcements', label: '通告与活动管理', icon: <BookOpen size={18} /> },
          { id: 'logs', label: '系统操作记录', icon: <ClipboardList size={18} /> }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setAdminTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${adminTab === tab.id ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-purple-100 border border-transparent hover:border-purple-200'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* 【新增面板】全校学生名单 (查看/编辑/删除) */}
      {adminTab === 'all_students' && (
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm animate-slide-up">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h3 className="text-lg md:text-xl font-bold text-purple-800">全校学生名单管理</h3>
            <div className="relative w-full md:w-1/3">
              <input 
                type="text" 
                placeholder="搜索姓名、IC 或 班级..." 
                className="w-full p-2.5 pl-10 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-purple-500 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          
          <div className="overflow-x-auto rounded-xl border border-gray-200 h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead className="sticky top-0 bg-gray-50 shadow-sm z-10">
                <tr className="text-gray-600 text-sm border-b border-gray-200">
                  <th className="p-4 font-semibold whitespace-nowrap">姓名</th>
                  <th className="p-4 font-semibold whitespace-nowrap">班级</th>
                  <th className="p-4 font-semibold whitespace-nowrap">IC MURID</th>
                  <th className="p-4 font-semibold whitespace-nowrap">ic (小写)</th>
                  <th className="p-4 font-semibold whitespace-nowrap">性别</th>
                  <th className="p-4 font-semibold whitespace-nowrap">DELIMA Email</th>
                  <th className="p-4 font-semibold whitespace-nowrap">密码</th>
                  <th className="p-4 font-semibold whitespace-nowrap">学号</th>
                  <th className="p-4 font-semibold whitespace-nowrap">IDME</th>
                  <th className="p-4 font-semibold whitespace-nowrap">出生日期</th>
                  <th className="p-4 font-semibold whitespace-nowrap">报生纸</th>
                  <th className="p-4 font-semibold whitespace-nowrap">入学日期</th>
                  <th className="p-4 font-semibold whitespace-nowrap">运动队伍</th>
                  <th className="p-4 font-semibold text-center whitespace-nowrap sticky right-0 bg-gray-50 shadow-[-2px_0_5px_rgba(0,0,0,0.05)]">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllStudents.map((s, idx) => (
                  <tr key={s.id} className={`text-sm border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'} hover:bg-purple-50 transition-colors`}>
                    <td className="p-4 font-bold text-gray-800 whitespace-nowrap">{s.name}</td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">{formatClassName(s.classYear, s.classColor)}</td>
                    <td className="p-4 font-mono text-gray-600 whitespace-nowrap">{s.ic}</td>
                    <td className="p-4 font-mono text-gray-500 whitespace-nowrap">{s.rawIc}</td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">{s.gender}</td>
                    <td className="p-4 font-mono text-purple-600 whitespace-nowrap">{s.delimaId}</td>
                    <td className="p-4 font-mono text-gray-600 whitespace-nowrap">{s.password}</td>
                    <td className="p-4 font-mono text-gray-600 whitespace-nowrap">{s.studentId}</td>
                    <td className="p-4 font-mono text-gray-600 whitespace-nowrap">{s.idme}</td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">{s.dob}</td>
                    <td className="p-4 font-mono text-gray-600 whitespace-nowrap">{s.birthCert}</td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">{s.admissionDate}</td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">{s.sportsHouse}</td>
                    <td className="p-4 flex justify-center gap-3 sticky right-0 shadow-[-2px_0_5px_rgba(0,0,0,0.05)]" style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                      <button 
                        onClick={() => setEditStudent({ ...s })} 
                        className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors font-semibold"
                      >
                        <Edit size={16} /> 编辑
                      </button>
                      <button 
                        onClick={() => promptDeleteStudent(s)} 
                        className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors font-semibold"
                      >
                        <Trash2 size={16} /> 删除
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredAllStudents.length === 0 && (
                  <tr><td colSpan="14" className="p-8 text-center text-gray-500">未找到符合条件的学生</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminTab === 'upload' && (
        <div className="bg-purple-50/50 p-6 md:p-8 rounded-2xl border border-purple-100 animate-slide-up">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-purple-800 mb-1">通过 Excel 批量导入学生</h3>
              <p className="text-xs md:text-sm text-gray-600">
                请务必点击右侧的<b>下载 Excel 模板</b>，系统将严格按照模板列顺序识别（例如以 `KELAS` 栏位解析班级 1H）。
              </p>
            </div>
            <button 
              onClick={downloadTemplate}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all whitespace-nowrap"
            >
              <Download size={20} /> 下载 Excel 模板
            </button>
          </div>

          <div className="flex items-center justify-center w-full mt-4">
            <label className="flex flex-col items-center justify-center w-full h-48 md:h-56 border-2 border-purple-300 border-dashed rounded-2xl cursor-pointer bg-white hover:bg-purple-50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                <Upload size={48} className="text-purple-400 mb-3" />
                <p className="mb-2 text-base md:text-lg font-bold text-gray-700">点击或拖拽上传填写好的 Excel 文件</p>
                <p className="text-xs md:text-sm text-gray-500">仅支持 .xlsx 格式</p>
              </div>
              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
            </label>
          </div>
        </div>
      )}

      {adminTab === 'promotion' && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm animate-slide-up">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h3 className="text-xl md:text-2xl font-bold text-amber-800">升学与班级管理</h3>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setPromoMode('auto')} 
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${promoMode === 'auto' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                一键全部升学
              </button>
              <button 
                onClick={() => setPromoMode('manual')} 
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${promoMode === 'manual' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                手动逐一调班
              </button>
            </div>
          </div>

          {promoMode === 'auto' ? (
            <div className="bg-amber-50/50 p-8 rounded-2xl border border-amber-200 text-center mt-4">
              <AlertCircle size={56} className="text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl md:text-2xl font-bold text-amber-800 mb-3">新学年：全体班级调整 (Kenaikan Kelas)</h3>
              <p className="text-sm md:text-base text-gray-700 mb-6 max-w-2xl mx-auto leading-relaxed">
                点击下方按钮，系统将自动把一年级升至二年级，依此类推。六年级学生将被移入第20班（已毕业）。<br/>
                请在每学年年初执行一次。
              </p>
              <button 
                onClick={promptYearlyPromotion}
                className="bg-amber-500 hover:bg-amber-600 text-white text-base md:text-lg font-bold px-8 py-3 rounded-xl shadow-md transition-transform active:scale-95"
              >
                执行升学操作
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <div className="relative w-full md:w-1/3 mb-4">
                <input 
                  type="text" 
                  placeholder="搜索学生姓名或 IC..." 
                  className="w-full p-2.5 pl-10 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  value={promoSearchTerm}
                  onChange={(e) => setPromoSearchTerm(e.target.value)}
                />
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-200 h-[500px] overflow-y-auto">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead className="sticky top-0 bg-gray-50 shadow-sm z-10">
                    <tr className="text-gray-600 text-sm border-b border-gray-200">
                      <th className="p-4 font-semibold whitespace-nowrap">姓名</th>
                      <th className="p-4 font-semibold whitespace-nowrap">IC 号码</th>
                      <th className="p-4 font-semibold whitespace-nowrap">原班级</th>
                      <th className="p-4 font-semibold whitespace-nowrap">修改年级</th>
                      <th className="p-4 font-semibold whitespace-nowrap">修改班名 (字母)</th>
                      <th className="p-4 font-semibold text-center whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPromoStudents.map((s, idx) => {
                      const editedYear = promoEdits[s.id]?.classYear !== undefined ? promoEdits[s.id].classYear : s.classYear;
                      const editedColor = promoEdits[s.id]?.classColor !== undefined ? promoEdits[s.id].classColor : s.classColor;
                      const hasChanges = editedYear !== s.classYear || editedColor !== s.classColor;
                      
                      return (
                        <tr key={s.id} className={`text-sm border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}`}>
                          <td className="p-4 font-bold text-gray-800 whitespace-nowrap">{s.name}</td>
                          <td className="p-4 font-mono text-gray-600 whitespace-nowrap">{s.ic}</td>
                          <td className="p-4 text-gray-600 whitespace-nowrap">{formatClassName(s.classYear, s.classColor)}</td>
                          <td className="p-4">
                            <select 
                              className="p-2 border border-gray-300 rounded-lg outline-none focus:border-amber-500"
                              value={editedYear}
                              onChange={e => handlePromoEditChange(s.id, 'classYear', e.target.value)}
                            >
                              {years.map(y => <option key={y.val} value={y.val}>{y.label}</option>)}
                            </select>
                          </td>
                          <td className="p-4">
                            <input 
                              type="text" 
                              className="p-2 border border-gray-300 rounded-lg outline-none focus:border-amber-500 w-24 text-center"
                              value={editedColor}
                              onChange={e => handlePromoEditChange(s.id, 'classColor', e.target.value.toUpperCase())}
                            />
                          </td>
                          <td className="p-4 text-center">
                            <button 
                              disabled={!hasChanges}
                              onClick={() => saveManualPromo(s.id, s)}
                              className={`px-4 py-2 rounded-lg font-bold text-xs transition-colors ${hasChanges ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                            >
                              保存修改
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredPromoStudents.length === 0 && (
                      <tr><td colSpan="6" className="p-8 text-center text-gray-500">未找到符合条件的学生</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 【更新：公告发布表单增加图片上传】 */}
      {adminTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-5">发布新通告/App介绍</h3>
            <form onSubmit={handleAddAnnouncement} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">标题</label>
                <input required type="text" value={annForm.title} onChange={e=>setAnnForm({...annForm, title: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">类型</label>
                  <select value={annForm.type} onChange={e=>setAnnForm({...annForm, type: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all">
                    <option value="App">App 推荐</option>
                    <option value="Activity">活动通告</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">链接 (可选)</label>
                  <input type="url" value={annForm.link} onChange={e=>setAnnForm({...annForm, link: e.target.value})} placeholder="https://" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">内容描述</label>
                <textarea required rows="4" value={annForm.content} onChange={e=>setAnnForm({...annForm, content: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all"></textarea>
              </div>
              {/* 图片上传 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">上传照片 (可选)</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex items-center justify-center gap-2 p-2.5 border border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors text-sm text-gray-600">
                    <ImageIcon size={18} /> 选择照片
                    <input type="file" id="announcement-image-upload" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                {annForm.image && (
                  <div className="relative inline-block mt-3">
                    <img src={annForm.image} alt="预览" className="h-32 w-auto object-contain rounded-lg border border-gray-200 shadow-sm bg-gray-50" />
                    <button 
                      type="button" 
                      onClick={clearImage} 
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"
                      title="移除照片"
                    >
                       <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg text-base mt-2 transition-colors">
                发布
              </button>
            </form>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl shadow-inner h-[500px] overflow-y-auto">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-5">已发布内容</h3>
            <div className="space-y-3">
              {announcements.map(a => (
                <div key={a.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition-shadow">
                  <div className="flex gap-4 items-center w-full">
                    {a.image && <img src={a.image} alt="" className="w-16 h-16 object-cover rounded-md border border-gray-100" />}
                    <div className="flex-1">
                      <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-md">{a.type}</span>
                      <h4 className="text-base font-bold mt-2 text-gray-800">{a.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{a.date}</p>
                    </div>
                    <button onClick={() => promptDeleteAnnouncement(a.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors ml-auto">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
              {announcements.length === 0 && (
                 <p className="text-center text-gray-500 mt-8 text-sm">暂无发布的公告。</p>
              )}
            </div>
          </div>
        </div>
      )}

      {adminTab === 'logs' && (
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl shadow-inner animate-slide-up">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-200 pb-4">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1">系统操作记录 (Log Sistem)</h3>
              <p className="text-xs md:text-sm text-gray-600">
                记录系统内所有的登入、资料修改、人员调动以及家长查询记录（共 {logs.length} 条记录）。
              </p>
            </div>
            <button 
              onClick={exportLogsToExcel}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all whitespace-nowrap"
            >
              <Download size={18} /> 导出日志 Excel
            </button>
          </div>
          
          <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3">
            {logs.length > 0 ? logs.map(log => (
              <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center gap-3 hover:border-purple-300 transition-colors">
                <div className="md:w-1/4">
                  <span className="text-gray-500 text-xs md:text-sm font-mono bg-gray-50 px-2 py-1 rounded">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="md:w-1/6">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    log.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                    log.role === 'teacher' ? 'bg-amber-100 text-amber-700' : 
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {log.role === 'admin' ? '管理员' : log.role === 'teacher' ? '教师' : '访客/家长'}
                  </span>
                </div>
                <div className="md:w-1/6 font-bold text-sm text-gray-800">
                  {log.action}
                </div>
                <div className="md:flex-1 text-sm text-gray-600">
                  {log.details}
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-gray-500 text-sm border-2 border-dashed border-gray-300 rounded-2xl">
                当前系统还没有任何操作记录。
              </div>
            )}
          </div>
        </div>
      )}

      {/* 编辑学生的独立弹窗 */}
      {editStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[105]">
          <div className="bg-white rounded-3xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
            <h3 className="text-2xl font-bold text-purple-800 mb-6 flex items-center gap-2">
              <Edit size={24} /> 编辑学生资料
            </h3>
            <form onSubmit={handleUpdateStudent}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 姓名 */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">姓名 (NAMA MURID)</label>
                  <input required type="text" value={editStudent.name} onChange={(e) => setEditStudent({...editStudent, name: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-purple-500 outline-none" />
                </div>
                {/* IC - 设置为不可修改 */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">IC 号码 (IC MURID) <span className="text-red-500 text-xs font-normal ml-2">不可修改，作为唯一账号识别</span></label>
                  <input disabled type="text" value={editStudent.ic} className="w-full p-2.5 border border-gray-200 bg-gray-100 text-gray-500 rounded-lg text-sm" />
                </div>
                {/* 年级 */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">年级编号 (1~6 或 19转校, 20毕业)</label>
                  <input required type="text" value={editStudent.classYear} onChange={(e) => setEditStudent({...editStudent, classYear: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-purple-500 outline-none" />
                </div>
                {/* 班级 */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">班级 (如 H, M)</label>
                  <input type="text" value={editStudent.classColor} onChange={(e) => setEditStudent({...editStudent, classColor: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-purple-500 outline-none" />
                </div>
                {/* DELIMA ID */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">DELIMA ID</label>
                  <input type="text" value={editStudent.delimaId} onChange={(e) => setEditStudent({...editStudent, delimaId: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-purple-500 outline-none" />
                </div>
                {/* 密码 */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">密码 (PASSWORD)</label>
                  <input type="text" value={editStudent.password} onChange={(e) => setEditStudent({...editStudent, password: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-purple-500 outline-none" />
                </div>
                {/* 性别 */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">性别 (JANTINA)</label>
                  <input type="text" value={editStudent.gender} onChange={(e) => setEditStudent({...editStudent, gender: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-purple-500 outline-none" />
                </div>
                {/* 学号 */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">学号 (NO RUJ SEK)</label>
                  <input type="text" value={editStudent.studentId} onChange={(e) => setEditStudent({...editStudent, studentId: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-purple-500 outline-none" />
                </div>
                {/* IDME */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">IDME</label>
                  <input type="text" value={editStudent.idme} onChange={(e) => setEditStudent({...editStudent, idme: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-purple-500 outline-none" />
                </div>
                {/* 报生纸 */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">报生纸 (SURAT BERANAK)</label>
                  <input type="text" value={editStudent.birthCert} onChange={(e) => setEditStudent({...editStudent, birthCert: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-purple-500 outline-none" />
                </div>
                {/* 出生日期 */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">出生日期 (TARIKH LAHIR)</label>
                  <input type="text" value={editStudent.dob} onChange={(e) => setEditStudent({...editStudent, dob: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-purple-500 outline-none" />
                </div>
                {/* 运动队伍 */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">运动队伍 (RUMAH SUKAN)</label>
                  <input type="text" value={editStudent.sportsHouse} onChange={(e) => setEditStudent({...editStudent, sportsHouse: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-purple-500 outline-none" />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setEditStudent(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-base transition-colors">
                  取消 (Batal)
                </button>
                <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-base transition-colors">
                  保存修改 (Simpan)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 确认操作统一弹窗 */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[110]">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-bounce-in">
            <div className="flex justify-center mb-4 text-amber-500">
               <AlertCircle size={48} />
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-3">确认操作</h3>
            <p className="text-base text-gray-600 mb-8 whitespace-pre-line text-center leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setConfirmModal(null)} 
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-base transition-colors"
              >
                取消 (Batal)
              </button>
              <button 
                onClick={confirmModal.onConfirm} 
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-base transition-colors"
              >
                确认 (Sahkan)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 辅助函数：格式化简单班级名称 (例如 6H)
function formatSimpleClassName(year, color) {
  if (year === '19') return '19 (转校)';
  if (year === '20') return '20 (毕业)';
  return `${year}${color}`;
}

// 辅助函数：格式化详情班级名称
function formatClassName(year, color) {
  if (year === '19') return '第19班 (转校)';
  if (year === '20') return '第20班 (毕业)';
  return `${year} 年级 ${color} 班`;
}
