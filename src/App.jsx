import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

// ==========================================
// 内置 SVG 图标 (替换外部 lucide-react 依赖，解决 Vercel 部署报错)
// ==========================================
const Search = ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>);
const LogOut = ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>);
const Download = ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>);
const Upload = ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>);
const Trash2 = ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>);
const ChevronRight = ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 18 15 12 9 6"/></svg>);
const UserCheck = ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>);
const Settings = ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>);
const BookOpen = ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>);
const AlertCircle = ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>);
const RefreshCw = ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>);

// ==========================================
// 1. Firebase 设定与初始化
// ==========================================
// 使用环境变量（如果在沙盒中）或您提供的配置
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
      apiKey: "AIzaSyBRbfRCs0Eqn5SWB34Ip2VDzA8k4G9JmvM",
      authDomain: "sjk-delima.firebaseapp.com",
      projectId: "sjk-delima",
      storageBucket: "sjk-delima.firebasestorage.app",
      messagingSenderId: "616642054550",
      appId: "1:616642054550:web:abcdef123456" // Fallback ID
    };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 获取沙盒环境的 App ID，以建立正确的路径。如果您自己部署，这会直接存入根目录。
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// 集合路径辅助函数
const getCollectionPath = (collectionName) => {
  if (typeof __app_id !== 'undefined') {
    return `artifacts/${appId}/public/data/${collectionName}`;
  }
  // 如果在真实生产环境部署，使用标准名称
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
  
  // 弹窗与加载状态
  const [isLoading, setIsLoading] = useState(true);
  const [modalMessage, setModalMessage] = useState(null);

  // 初始化验证与数据抓取
  useEffect(() => {
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
          text: `无法连接至 Firebase 账户。\n如果您部署在 Vercel，请确保您已在 Firebase Console 中：\n1. 启用了 Authentication (身份验证)\n2. 开启了 Anonymous (匿名登录) 功能。\n\n详细错误: ${err.message}`
        });
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // 无论登录成功与否，只要有了响应就关闭加载动画
      setIsLoading(false);
    });

    // 动态加载 SheetJS 以处理 Excel
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

  // 抓取学生和公告数据
  useEffect(() => {
    if (!user) return;

    // 统一处理 Firestore 权限等错误
    const handleFirestoreError = (error) => {
      console.error("Firestore error:", error);
      if (error.code === 'permission-denied' || (error.message && error.message.includes('Missing or insufficient permissions'))) {
         setModalMessage({ 
           title: "数据库读写被拦截", 
           text: "系统无法读取或写入数据。\n\n请前往 Firebase Console -> Firestore Database -> Rules 标签页，将规则更新为：\n\nmatch /{document=**} {\n  allow read, write: if true;\n}\n\n(设置后等待一分钟即可生效)" 
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
      // 按照日期倒序
      setAnnouncements(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }, handleFirestoreError);

    return () => {
      unsubscribeStudents();
      unsubscribeAnnouncements();
    };
  }, [user]);

  // 显示提示框
  const showMessage = (title, text) => {
    setModalMessage({ title, text });
  };

  // 登出处理
  const handleLogout = () => {
    setAuthRole('');
    setActiveTab('home');
    showMessage("成功", "已安全退出账户。");
  };

  // 渲染主体内容
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <RefreshCw className="animate-spin text-purple-500" size={48} />
          <div className="text-2xl text-purple-600 font-semibold animate-pulse">正在安全连接系统...</div>
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
        return <AdminPortal students={students} announcements={announcements} db={db} getCollectionPath={getCollectionPath} showMessage={showMessage} />;
      } else {
        return <LoginView roleTarget="admin" setAuthRole={setAuthRole} showMessage={showMessage} />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF9FF] text-gray-800 font-sans selection:bg-purple-200">
      {/* 顶部 Header 设计：温馨高级紫 */}
      <header className="bg-white shadow-lg rounded-b-[40px] pb-8 pt-6 px-4 mx-auto max-w-5xl mb-8 relative border-b-8 border-purple-600">
        <div className="flex flex-col items-center text-center">
          <img 
            src="delima.jpg" 
            alt="DELIMA SJKC KUNG MING" 
            className="h-32 mb-4 object-contain drop-shadow-md"
            onError={(e) => { e.target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_Kementerian_Pendidikan_Malaysia.png/250px-Logo_Kementerian_Pendidikan_Malaysia.png"; }}
          />
          <h2 className="text-2xl md:text-3xl font-bold tracking-widest text-gray-700 uppercase mt-2 mb-1">
            SJKC KUNG MING, BEAUFORT, SABAH.
          </h2>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-800 to-purple-500 my-3 py-2">
            保佛公民小学 Delima 账户查询
          </h1>
        </div>

        {/* 导航按钮 */}
        <div className="flex justify-center gap-4 mt-8 flex-wrap">
          {activeTab !== 'home' && (
            <button 
              onClick={() => setActiveTab('home')}
              className="px-8 py-3 rounded-full text-xl font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all shadow-md"
            >
              返回首页 (Kembali)
            </button>
          )}
          {authRole !== '' && (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-8 py-3 rounded-full text-xl font-bold bg-red-50 text-red-600 hover:bg-red-100 shadow-md transition-all"
            >
              <LogOut size={24} /> 登出
            </button>
          )}
        </div>
      </header>

      {/* 主体内容 */}
      <main className="max-w-5xl mx-auto px-4 pb-20">
        {renderContent()}
      </main>

      {/* 底部版权与隐藏入口 */}
      <footer className="text-center py-10 mt-10 text-purple-400">
        <p className="text-lg mb-4">© {new Date().getFullYear()} SJKC KUNG MING. Hak Cipta Terpelihara.</p>
        
        {/* 不起眼的教师与管理员入口 */}
        <div className="flex justify-center items-center gap-4 text-sm mt-2 opacity-60 hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setActiveTab('teacher')}
            className="hover:text-amber-600 transition-colors"
          >
            panel guru
          </button>
          <span>|</span>
          <button 
            onClick={() => setActiveTab('admin')}
            className="hover:text-purple-700 transition-colors"
          >
            admin access
          </button>
        </div>
      </footer>

      {/* 统一提示弹窗 */}
      {modalMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-bounce-in transform transition-all">
            <div className="flex items-center justify-center mb-4">
              {modalMessage.title.includes('异常') || modalMessage.title.includes('被拦截') || modalMessage.title === '错误' || modalMessage.title.includes('失败') ? (
                 <AlertCircle size={48} className="text-red-500" />
              ) : (
                 <UserCheck size={48} className="text-purple-500" />
              )}
            </div>
            <h3 className={`text-3xl font-bold mb-4 text-center ${modalMessage.title.includes('异常') || modalMessage.title.includes('被拦截') || modalMessage.title === '错误' ? 'text-red-600' : 'text-purple-700'}`}>
              {modalMessage.title}
            </h3>
            <p className="text-xl text-gray-700 leading-relaxed text-center whitespace-pre-line">{modalMessage.text}</p>
            <button 
              onClick={() => setModalMessage(null)}
              className="mt-8 w-full bg-purple-600 text-white rounded-2xl py-4 text-2xl font-bold hover:bg-purple-700 transition-colors"
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
// 3. 首页视图 (Home View - Search & Announcements)
// ==========================================
function HomeView({ students, announcements, setActiveTab }) {
  const [icNumber, setIcNumber] = useState('');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!icNumber.trim()) return;
    
    const cleanIC = icNumber.replace(/[^a-zA-Z0-9]/g, '');
    const student = students.find(s => s.ic.replace(/[^a-zA-Z0-9]/g, '') === cleanIC);
    
    setResult(student || null);
    setSearched(true);
  };

  return (
    <div className="space-y-12 animate-fade-in">
      {/* 搜索区 (家长专用) */}
      <section className="bg-white rounded-[32px] p-8 md:p-12 shadow-xl border border-purple-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-purple-800 mb-6 flex items-center gap-3 relative z-10">
          <Search size={36} className="text-purple-600" /> 查询学生 Delima 资料
        </h2>
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 relative z-10">
          <input 
            type="text" 
            placeholder="请输入学生 IC 号码 (Sila masukkan No. K/P)" 
            className="flex-1 text-2xl p-5 border-2 border-purple-200 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all shadow-inner"
            value={icNumber}
            onChange={(e) => setIcNumber(e.target.value)}
          />
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-2xl px-10 py-5 rounded-2xl shadow-lg transition-transform active:scale-95">
            查询 (Cari)
          </button>
        </form>

        {searched && (
          <div className="mt-8 border-t-2 border-purple-50 pt-8 animate-slide-up">
            {result ? (
              <div className="bg-purple-50 rounded-3xl p-8 border border-purple-200 shadow-md">
                <h3 className="text-3xl font-bold text-purple-900 mb-6 border-b-2 border-purple-200 pb-4">学生资料 (Maklumat Murid)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-xl">
                  <InfoItem label="姓名 (Nama)" value={result.name} />
                  <InfoItem label="学号 (ID Murid)" value={result.studentId} />
                  <InfoItem label="班级 (Kelas)" value={formatClassName(result.classYear, result.classColor)} />
                  <InfoItem label="DELIMA ID" value={result.delimaId} isHighlight />
                  <InfoItem label="密码 (Password)" value={result.password} isHighlight />
                  <InfoItem label="IDME 号码" value={result.idme} />
                  <InfoItem label="入学日期 (Tarikh Masuk)" value={result.admissionDate} />
                  <InfoItem label="运动屋 (Rumah Sukan)" value={result.sportsHouse} />
                  
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
              <div className="bg-red-50 text-red-600 p-8 rounded-2xl text-2xl text-center font-bold border border-red-100 flex items-center justify-center gap-3">
                <AlertCircle size={32} /> 找不到该学生的资料，请检查 IC 号码是否正确。
              </div>
            )}
          </div>
        )}
      </section>

      {/* 公告区 (Hebahan) */}
      <section>
        <h2 className="text-3xl font-extrabold text-purple-800 mb-8 flex items-center gap-3 pl-4 border-l-8 border-amber-400 rounded-l-md">
          <BookOpen size={36} className="text-amber-500" /> Hebahan & Aktiviti DELIMA (最新活动)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {announcements.length === 0 ? (
            <p className="text-xl text-gray-500 p-8 col-span-2 text-center bg-white rounded-3xl shadow-sm">暂无最新公告。管理员可在后台发布新内容。</p>
          ) : (
            announcements.map((ann) => (
              <a 
                key={ann.id} 
                href={ann.link || '#'} 
                target={ann.link ? "_blank" : "_self"}
                rel="noreferrer"
                className="bg-white rounded-3xl p-8 shadow-md hover:shadow-2xl transition-all border border-purple-50 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wider ${ann.type === 'App' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {ann.type}
                    </span>
                    <span className="text-gray-400 text-lg">{ann.date}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors">{ann.title}</h3>
                  <p className="text-xl text-gray-600 leading-relaxed">{ann.content}</p>
                </div>
                {ann.link && (
                  <div className="mt-6 flex items-center text-purple-600 font-bold text-xl group-hover:translate-x-2 transition-transform">
                    点击前往 (Klik Sini) <ChevronRight size={24} />
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

function InfoItem({ label, value, isHighlight, isAlert }) {
  return (
    <div className={`p-4 rounded-xl ${isHighlight ? 'bg-purple-600 text-white shadow-md' : isAlert ? 'bg-amber-100 text-amber-800' : 'bg-white'}`}>
      <div className={`text-sm md:text-base font-semibold mb-1 opacity-80`}>{label}</div>
      <div className={`text-xl md:text-2xl font-bold break-all`}>{value || '-'}</div>
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
    // 简单的 PIN 码验证 (Teacher: guru888, Admin: admin888)
    if (roleTarget === 'teacher' && pin === 'guru888') {
      setAuthRole('teacher');
      showMessage("登录成功", "欢迎进入教师控制台。");
    } else if (roleTarget === 'admin' && pin === 'admin888') {
      setAuthRole('admin');
      showMessage("登录成功", "欢迎进入系统后台。");
    } else {
      showMessage("错误", "密码不正确，请重试。");
      setPin('');
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-10 max-w-md mx-auto shadow-2xl text-center border-t-8 border-purple-600 animate-fade-in">
      <div className="bg-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
        {roleTarget === 'admin' ? <Settings size={48} className="text-purple-700" /> : <UserCheck size={48} className="text-purple-700" />}
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">安全登录</h2>
      <p className="text-xl text-gray-500 mb-8">
        {roleTarget === 'admin' ? "请输入管理员密码" : "请输入教师专属密码 (Kata Laluan Guru)"}
      </p>
      <form onSubmit={handleLogin} className="space-y-6">
        <input 
          type="password" 
          placeholder="请输入密码 (Kata Laluan)" 
          className="w-full text-center text-3xl tracking-[0.5em] p-4 border-2 border-purple-200 rounded-2xl focus:border-purple-600 focus:outline-none"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
        <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-2xl py-4 rounded-2xl transition-all shadow-lg">
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
  const [selectedColor, setSelectedColor] = useState('青');
  const [transferModal, setTransferModal] = useState(null); // { studentId: string }

  // 整理选项
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
  const colors = ['青', '黄', '红'];

  // 筛选学生
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
      "姓名 (Nama)": s.name,
      "身份证 (IC)": s.ic,
      "学号 (ID Murid)": s.studentId,
      "DELIMA ID": s.delimaId,
      "密码 (Password)": s.password,
      "IDME": s.idme,
      "班级": formatClassName(s.classYear, s.classColor),
      "入学日期": s.admissionDate,
      "运动屋": s.sportsHouse,
      "转校学校": s.transferSchool || '',
      "转校日期": s.transferDate || ''
    }));

    const ws = window.XLSX.utils.json_to_sheet(exportData);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Students");
    window.XLSX.writeFile(wb, `Senarai_Kelas_${selectedYear}_${selectedColor}.xlsx`);
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
      setTransferModal(null);
    } catch (error) {
      showMessage("错误", "更新失败: " + error.message);
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-xl border border-purple-50 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 border-b-2 border-purple-100 pb-8">
        <div>
          <h2 className="text-3xl font-bold text-amber-600 flex items-center gap-3">
            <UserCheck size={32} /> 教师控制台 (Panel Guru)
          </h2>
          <p className="text-xl text-gray-500 mt-2">请选择您的班级以查看和整理资料。</p>
        </div>
        
        {/* 选择器 */}
        <div className="flex flex-wrap gap-4 bg-purple-50 p-4 rounded-2xl">
          <select 
            className="text-xl p-3 rounded-xl border-2 border-purple-200 outline-none"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {years.map(y => <option key={y.val} value={y.val}>{y.label}</option>)}
          </select>
          {selectedYear !== '19' && selectedYear !== '20' && (
            <select 
              className="text-xl p-3 rounded-xl border-2 border-purple-200 outline-none"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
            >
              {colors.map(c => <option key={c} value={c}>{c}班</option>)}
            </select>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
          学生列表 ({classStudents.length} 人)
        </h3>
        <button onClick={exportToExcel} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-md transition-all">
          <Download size={24} /> 导出 Excel
        </button>
      </div>

      {/* 响应式表格 (移动端转为卡片) */}
      <div className="hidden md:block overflow-x-auto bg-gray-50 rounded-2xl border border-gray-200 shadow-inner">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-purple-100 text-purple-900 text-lg">
              <th className="p-4 rounded-tl-2xl">姓名</th>
              <th className="p-4">IC 号码</th>
              <th className="p-4">DELIMA ID</th>
              <th className="p-4">密码</th>
              <th className="p-4 text-center rounded-tr-2xl">操作</th>
            </tr>
          </thead>
          <tbody>
            {classStudents.map((s, idx) => (
              <tr key={s.id} className={`text-lg border-t border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-purple-50`}>
                <td className="p-4 font-bold">{s.name}</td>
                <td className="p-4">{s.ic}</td>
                <td className="p-4 font-mono text-purple-600">{s.delimaId}</td>
                <td className="p-4 font-mono">{s.password}</td>
                <td className="p-4 text-center">
                  {selectedYear !== '19' && selectedYear !== '20' && (
                    <button 
                      onClick={() => setTransferModal(s)}
                      className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                    >
                      标为转校
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {classStudents.length === 0 && (
              <tr><td colSpan="5" className="p-10 text-center text-gray-500 text-xl">该班级暂无学生数据。如果是全新部署，请前往 Admin 后台导入数据。</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 移动端卡片视图 */}
      <div className="md:hidden space-y-4">
        {classStudents.map(s => (
          <div key={s.id} className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
            <h4 className="text-2xl font-bold text-gray-800 mb-2">{s.name}</h4>
            <div className="space-y-1 text-lg text-gray-600 mb-4">
              <p>IC: <span className="font-mono text-gray-800">{s.ic}</span></p>
              <p>DELIMA: <span className="font-mono text-purple-600 font-bold">{s.delimaId}</span></p>
              <p>Pwd: <span className="font-mono text-gray-800">{s.password}</span></p>
            </div>
            {selectedYear !== '19' && selectedYear !== '20' && (
              <button onClick={() => setTransferModal(s)} className="w-full bg-amber-100 text-amber-700 py-3 rounded-xl font-bold transition-colors">
                标为转校 (Pindah Sekolah)
              </button>
            )}
          </div>
        ))}
        {classStudents.length === 0 && (
          <div className="p-5 text-center text-gray-500 text-lg border border-gray-200 rounded-2xl">
            该班级暂无学生数据。如果是全新部署，请前往 Admin 后台导入数据。
          </div>
        )}
      </div>

      {/* 转校弹窗 */}
      {transferModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-slide-up">
            <h3 className="text-3xl font-bold text-amber-600 mb-2">处理转校</h3>
            <p className="text-xl text-gray-600 mb-6">学生: <strong>{transferModal.name}</strong></p>
            
            <form onSubmit={handleTransfer} className="space-y-5">
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">转校日期</label>
                <input type="date" name="transferDate" required className="w-full p-3 border-2 border-gray-300 rounded-xl text-xl" />
              </div>
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">新学校名称</label>
                <input type="text" name="transferSchool" required placeholder="如: SJKC HWA SHIONG" className="w-full p-3 border-2 border-gray-300 rounded-xl text-xl" />
              </div>
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setTransferModal(null)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 rounded-xl text-xl transition-colors">
                  取消 (Batal)
                </button>
                <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl text-xl transition-colors">
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
function AdminPortal({ students, announcements, db, getCollectionPath, showMessage }) {
  const [adminTab, setAdminTab] = useState('upload'); // 'upload', 'manage', 'announcements', 'promotion'
  const [confirmModal, setConfirmModal] = useState(null); // { message: string, onConfirm: () => void }

  // 下载 Excel 模板
  const downloadTemplate = () => {
    if (typeof window.XLSX === 'undefined') {
      showMessage("错误", "组件尚未加载完成，请稍后再试。");
      return;
    }
    
    const headers = [
      "NO", "NAMA MURID", "姓名", "L/P", "RUMAH SUKAN", "SIJIL LAHIR", 
      "TARIKH LAHIR", "NO MY KID", "MOE EMAIL", "MOE PASSWORD", 
      "IDME", "ID MURID", "TARIKH MASUK", "TAHUN", "KELAS"
    ];
    
    const dummyData = [
      ["1", "ALI BIN ABU", "阿里", "L", "MERAH", "SB123456", 
       "2015-01-01", "150101121234", "m-123456@moe-dl.edu.my", "pwd1234", 
       "IDME001", "M001", "2022-03-21", "1", "青"]
    ];

    const ws = window.XLSX.utils.aoa_to_sheet([headers, ...dummyData]);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Template");
    window.XLSX.writeFile(wb, "Template_Data_Murid_SJKC.xlsx");
  };

  // Excel 导入逻辑
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
        const data = window.XLSX.utils.sheet_to_json(ws);
        
        let successCount = 0;
        for (const row of data) {
          // 根据提供的模板和列名匹配资料
          let studentName = String(row['NAMA MURID'] || row['Name'] || '').trim();
          const chineseName = String(row['姓名'] || '').trim();
          if (studentName && chineseName) {
            studentName = `${studentName} (${chineseName})`;
          } else if (!studentName && chineseName) {
            studentName = chineseName;
          }

          const newStudent = {
            ic: String(row['NO MY KID'] || row['IC'] || row['IC号码'] || '').trim(),
            name: studentName,
            studentId: String(row['ID MURID'] || row['Student ID'] || row['学号'] || ''),
            delimaId: String(row['MOE EMAIL'] || row['DELIMA ID'] || ''),
            password: String(row['MOE PASSWORD'] || row['Password'] || row['密码'] || ''),
            idme: String(row['IDME'] || ''),
            admissionDate: String(row['TARIKH MASUK'] || row['Admission Date'] || row['入学日期'] || ''),
            sportsHouse: String(row['RUMAH SUKAN'] || row['Sports House'] || row['rumah sukan'] || ''),
            classYear: String(row['TAHUN'] || row['Year'] || row['年级'] || '1'),
            classColor: String(row['KELAS'] || row['Color'] || row['班级'] || '青'), // 青, 黄, 红
            status: 'Active'
          };
          
          if (newStudent.ic && newStudent.name) {
            // 使用 IC 作为 Document ID 进行覆盖/新建
            await setDoc(doc(db, getCollectionPath('students'), newStudent.ic), newStudent);
            successCount++;
          }
        }
        showMessage("导入成功", `成功读取并存入 ${successCount} 名学生资料。`);
      } catch (error) {
        showMessage("导入失败", error.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  // 触发升学操作确认
  const promptYearlyPromotion = () => {
    setConfirmModal({
      message: "确定要进行年度升学操作吗？\n\n六年级将移至毕业班，其余年级将自动升一级。此操作不可逆，请谨慎执行！",
      onConfirm: executeYearlyPromotion
    });
  };

  // 年度换班调整逻辑 (Promotion)
  const executeYearlyPromotion = async () => {
    setConfirmModal(null);
    try {
      let count = 0;
      for (const s of students) {
        let newYear = s.classYear;
        // 忽略已经转校或毕业的
        if (newYear === '19' || newYear === '20') continue;
        
        const yearInt = parseInt(newYear, 10);
        if (yearInt === 6) {
          newYear = '20'; // 毕业
        } else if (yearInt >= 1 && yearInt <= 5) {
          newYear = String(yearInt + 1); // 升一级
        }
        
        if (newYear !== s.classYear) {
          await updateDoc(doc(db, getCollectionPath('students'), s.id), { 
            classYear: newYear, 
            graduationDate: newYear === '20' ? new Date().toISOString().split('T')[0] : null 
          });
          count++;
        }
      }
      showMessage("操作成功", `已成功调整 ${count} 名学生的班级。`);
    } catch (error) {
      showMessage("错误", "升学处理失败: " + error.message);
    }
  };

  // 管理公告
  const [annForm, setAnnForm] = useState({ title: '', content: '', type: 'App', link: '' });
  
  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const newRef = doc(collection(db, getCollectionPath('announcements')));
      await setDoc(newRef, {
        ...annForm,
        date: new Date().toISOString().split('T')[0]
      });
      showMessage("成功", "已发布最新公告。");
      setAnnForm({ title: '', content: '', type: 'App', link: '' });
    } catch (err) {
      showMessage("错误", "发布失败: " + err.message);
    }
  };

  const promptDeleteAnnouncement = (id) => {
    setConfirmModal({
      message: "确定要删除这条公告吗？删除后将无法恢复。",
      onConfirm: () => executeDeleteAnnouncement(id)
    });
  };

  const executeDeleteAnnouncement = async (id) => {
    setConfirmModal(null);
    try {
      await deleteDoc(doc(db, getCollectionPath('announcements'), id));
    } catch (err) {
      showMessage("错误", "删除失败: " + err.message);
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-2xl border-t-8 border-purple-800 animate-fade-in relative">
      <h2 className="text-4xl font-extrabold text-purple-900 mb-8 flex items-center gap-3">
        <Settings size={40} className="text-purple-600" /> 系统后台管理 (Admin)
      </h2>
      
      {/* 后台菜单 */}
      <div className="flex flex-wrap gap-4 mb-10 border-b-2 border-gray-100 pb-4">
        {[
          { id: 'upload', label: '批量导入学生', icon: <Upload size={20} /> },
          { id: 'promotion', label: '年度升学操作', icon: <RefreshCw size={20} /> },
          { id: 'announcements', label: '通告与活动管理', icon: <BookOpen size={20} /> }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setAdminTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg transition-all ${adminTab === tab.id ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-purple-100'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* 导入区 */}
      {adminTab === 'upload' && (
        <div className="bg-purple-50 p-8 rounded-2xl border border-purple-200 animate-slide-up">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h3 className="text-2xl font-bold text-purple-800 mb-2">通过 Excel 批量导入学生</h3>
              <p className="text-lg text-gray-600">
                请下载官方模板并填入数据。系统将按模板表头读取您的资料（以 NO MY KID 作为查询账号）。
              </p>
            </div>
            <button 
              onClick={downloadTemplate}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-md transition-all whitespace-nowrap"
            >
              <Download size={24} /> 下载 Excel 模板
            </button>
          </div>

          <div className="flex items-center justify-center w-full mt-4">
            <label className="flex flex-col items-center justify-center w-full h-64 border-4 border-purple-300 border-dashed rounded-3xl cursor-pointer bg-white hover:bg-purple-50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload size={64} className="text-purple-400 mb-4" />
                <p className="mb-2 text-2xl font-bold text-gray-700">点击或拖拽上传填写好的 Excel 文件</p>
                <p className="text-lg text-gray-500">仅支持 .xlsx 格式</p>
              </div>
              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
            </label>
          </div>
        </div>
      )}

      {/* 升学操作 */}
      {adminTab === 'promotion' && (
        <div className="bg-amber-50 p-8 rounded-2xl border border-amber-200 text-center animate-slide-up">
          <AlertCircle size={64} className="text-amber-500 mx-auto mb-6" />
          <h3 className="text-3xl font-bold text-amber-800 mb-4">新学年：全体班级调整 (Kenaikan Kelas)</h3>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            点击下方按钮，系统将自动把一年级升至二年级，依此类推。六年级学生将被移入第20班（已毕业）。
            请在每学年年初执行一次。
          </p>
          <button 
            onClick={promptYearlyPromotion}
            className="bg-amber-600 hover:bg-amber-700 text-white text-2xl font-bold px-10 py-5 rounded-2xl shadow-xl transition-transform active:scale-95"
          >
            执行升学操作
          </button>
        </div>
      )}

      {/* 公告管理 */}
      {adminTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
          {/* 发布表单 */}
          <div className="bg-white border-2 border-gray-100 p-8 rounded-2xl shadow-sm">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">发布新通告/App介绍</h3>
            <form onSubmit={handleAddAnnouncement} className="space-y-4">
              <div>
                <label className="block text-lg font-bold text-gray-600 mb-1">标题</label>
                <input required type="text" value={annForm.title} onChange={e=>setAnnForm({...annForm, title: e.target.value})} className="w-full p-3 border-2 rounded-xl text-lg outline-none focus:border-purple-500 transition-colors" />
              </div>
              <div>
                <label className="block text-lg font-bold text-gray-600 mb-1">类型</label>
                <select value={annForm.type} onChange={e=>setAnnForm({...annForm, type: e.target.value})} className="w-full p-3 border-2 rounded-xl text-lg outline-none focus:border-purple-500 transition-colors">
                  <option value="App">App 推荐</option>
                  <option value="Activity">活动通告</option>
                </select>
              </div>
              <div>
                <label className="block text-lg font-bold text-gray-600 mb-1">内容描述</label>
                <textarea required rows="4" value={annForm.content} onChange={e=>setAnnForm({...annForm, content: e.target.value})} className="w-full p-3 border-2 rounded-xl text-lg outline-none focus:border-purple-500 transition-colors"></textarea>
              </div>
              <div>
                <label className="block text-lg font-bold text-gray-600 mb-1">链接 (可选)</label>
                <input type="url" value={annForm.link} onChange={e=>setAnnForm({...annForm, link: e.target.value})} placeholder="https://" className="w-full p-3 border-2 rounded-xl text-lg outline-none focus:border-purple-500 transition-colors" />
              </div>
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl text-xl mt-4 transition-colors">
                发布
              </button>
            </form>
          </div>
          {/* 列表 */}
          <div className="bg-gray-50 border-2 border-gray-100 p-8 rounded-2xl shadow-inner h-[600px] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">已发布内容</h3>
            <div className="space-y-4">
              {announcements.map(a => (
                <div key={a.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition-shadow">
                  <div>
                    <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded">{a.type}</span>
                    <h4 className="text-xl font-bold mt-2">{a.title}</h4>
                    <p className="text-sm text-gray-500">{a.date}</p>
                  </div>
                  <button onClick={() => promptDeleteAnnouncement(a.id)} className="text-red-500 p-3 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={24} />
                  </button>
                </div>
              ))}
              {announcements.length === 0 && (
                 <p className="text-center text-gray-500 mt-10 text-lg">暂无发布的公告。</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 确认操作统一弹窗 */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[110]">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-bounce-in">
            <div className="flex justify-center mb-4 text-amber-500">
               <AlertCircle size={64} />
            </div>
            <h3 className="text-3xl font-bold text-center text-gray-800 mb-4">确认操作</h3>
            <p className="text-xl text-gray-600 mb-8 whitespace-pre-line text-center leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setConfirmModal(null)} 
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 rounded-2xl text-xl transition-colors"
              >
                取消 (Batal)
              </button>
              <button 
                onClick={confirmModal.onConfirm} 
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 rounded-2xl text-xl transition-colors"
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

// 辅助函数：格式化班级名称
function formatClassName(year, color) {
  if (year === '19') return '第19班 (转校)';
  if (year === '20') return '第20班 (毕业)';
  return `${year} 年级 ${color} 班`;
}
