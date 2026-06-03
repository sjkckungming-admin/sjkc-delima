<<<<
// ==========================================
// 3. 首页视图
// ==========================================
function HomeView({ students, announcements, schoolReports, setActiveTab }) {
  const [icNumber, setIcNumber] = useState('');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e) => {
====
// ==========================================
// 3. 首页视图
// ==========================================
function HomeView({ students, announcements, schoolReports, setActiveTab }) {
  const [icNumber, setIcNumber] = useState('');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  // 动态亲切问候语
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Selamat Pagi! 早上好~", icon: "🌅" };
    if (hour < 18) return { text: "Selamat Petang! 下午好~", icon: "☕" };
    return { text: "Selamat Malam! 晚上好~", icon: "🌙" };
  };
  const greeting = getGreeting();

  const handleSearch = (e) => {
>>>>

<<<<
  return (
    <div className="space-y-10 animate-fade-in">
      {/* 搜索区块 */}
      <section className="bg-white rounded-3xl p-6 md:p-10 shadow-lg border border-purple-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="mb-6 relative z-10 flex items-start gap-3">
          <Search size={32} className="text-purple-600 shrink-0 mt-1" />
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-purple-800">
              查询学生 Delima 资料
            </h2>
            <h3 className="text-lg md:text-xl font-bold text-purple-600 mt-1">
              Semakan email Delima Murid-murid
            </h3>
            <p className="text-sm md:text-base text-gray-600 mt-2 font-medium">
              Sila masukkan No. K/P atau Surat Beranak Murid untuk menyemak emel Delima Murid.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 relative z-10">
          <input 
            type="text" 
            placeholder="请输入学生IC或报生纸号码 (No.K/P atau Surat Beranak)" 
            className="flex-1 text-lg p-4 border-2 border-purple-200 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all shadow-inner"
            value={icNumber}
            onChange={(e) => setIcNumber(e.target.value)}
          />
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-md transition-transform active:scale-95">
            查询 (Cari)
          </button>
        </form>

        {searched && (
====
  return (
    <div className="space-y-10 animate-fade-in">
      {/* 搜索区块 */}
      <section className="bg-white rounded-3xl p-6 md:p-10 shadow-lg border border-purple-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="mb-6 relative z-10 flex flex-col items-start gap-1">
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-1.5 rounded-full font-bold text-sm mb-3">
             {greeting.icon} {greeting.text} 欢迎来到保佛公民小学查询系统 ✨
          </div>
          <div className="flex items-start gap-3">
            <Search size={32} className="text-purple-600 shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-purple-800">
                查询学生 Delima 资料
              </h2>
              <h3 className="text-lg md:text-xl font-bold text-purple-600 mt-1">
                Semakan email Delima Murid-murid
              </h3>
              <p className="text-sm md:text-base text-gray-600 mt-2 font-medium">
                Sila masukkan No. K/P atau Surat Beranak Murid untuk menyemak emel Delima Murid.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 relative z-10">
          <input 
            type="text" 
            placeholder="请输入学生IC或报生纸号码 (No.K/P atau Surat Beranak)" 
            className="flex-1 text-lg p-4 border-2 border-purple-200 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all shadow-inner"
            value={icNumber}
            onChange={(e) => setIcNumber(e.target.value)}
          />
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-md transition-transform active:scale-95">
            🔍 查询 (Cari)
          </button>
        </form>

        {!searched ? (
          <div className="mt-6 text-center text-gray-400 text-sm italic relative z-10">
            * Sila hubungi pihak sekolah jika anda menghadapi sebarang masalah teknikal.
          </div>
        ) : (
>>>>

<<<<
      {/* 学校报告和使用率展示区 */}
      {schoolReports.length > 0 && (
        <section className="animate-slide-up">
          <h2 className="text-2xl md:text-3xl font-extrabold text-blue-800 mb-6 flex items-center gap-3 pl-4 border-l-8 border-blue-500 rounded-l-md">
            <FileText size={28} className="text-blue-500" /> Laporan & Penggunaan Sekolah (学校重要信息与使用率)
          </h2>
          <div className="space-y-6">
            {schoolReports.map(rep => (
              <div key={rep.id} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-blue-100">
                {rep.image && (
                  <div className="w-full bg-gray-50 flex justify-center border-b border-gray-100">
                    <img src={rep.image} alt={rep.title} className="w-full h-auto max-h-[400px] object-contain" />
                  </div>
                )}
                <div className="p-6 md:p-8">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                      Laporan Rasmi (官方通告)
                    </span>
                    <span className="text-gray-400 text-sm">{rep.date}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-blue-900 mb-4">{rep.title}</h3>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed whitespace-pre-line mb-6">
                    {rep.content}
                  </p>
                  
                  {/* 使用率进度条 */}
                  {(rep.studentUsage || rep.teacherUsage) && (
                    <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {rep.studentUsage && (
                        <div>
                          <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                            <span className="flex items-center gap-1"><Users size={16}/> 学生使用率 (Murid)</span>
                            <span className="text-blue-600">{rep.studentUsage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${Math.min(100, rep.studentUsage)}%` }}></div>
                          </div>
                        </div>
                      )}
                      {rep.teacherUsage && (
                        <div>
                          <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                            <span className="flex items-center gap-1"><UserCheck size={16}/> 老师使用率 (Guru)</span>
                            <span className="text-green-600">{rep.teacherUsage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-green-500 h-3 rounded-full" style={{ width: `${Math.min(100, rep.teacherUsage)}%` }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400 font-medium text-right mt-2 border-t border-gray-100 pt-3">
                    Tarikh Kemaskini: {new Date(rep.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
====
      {/* 学校报告和使用率展示区 - 仅显示最新的一条 */}
      {schoolReports.length > 0 && (
        <section className="animate-slide-up">
          <h2 className="text-2xl md:text-3xl font-extrabold text-blue-800 mb-6 flex items-center gap-3 pl-4 border-l-8 border-blue-500 rounded-l-md">
            <FileText size={28} className="text-blue-500" /> Laporan & Penggunaan Sekolah (学校重要信息与使用率)
          </h2>
          <div className="space-y-6">
            {/* 使用 slice(0, 1) 只取最新的一条数据展示 */}
            {schoolReports.slice(0, 1).map(rep => (
              <div key={rep.id} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-blue-100">
                {rep.image && (
                  <div className="w-full bg-gray-50 flex justify-center border-b border-gray-100">
                    <img src={rep.image} alt={rep.title} className="w-full h-auto max-h-[400px] object-contain" />
                  </div>
                )}
                <div className="p-6 md:p-8">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                      🌟 Laporan Terkini (最新通告)
                    </span>
                    <span className="text-gray-400 text-sm">{rep.date}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-blue-900 mb-4">{rep.title}</h3>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed whitespace-pre-line mb-6">
                    {rep.content}
                  </p>
                  
                  {/* 使用率进度条 */}
                  {(rep.studentUsage || rep.teacherUsage) && (
                    <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {rep.studentUsage && (
                        <div>
                          <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                            <span className="flex items-center gap-1"><Users size={16}/> 学生使用率 (Murid)</span>
                            <span className="text-blue-600">{rep.studentUsage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${Math.min(100, rep.studentUsage)}%` }}></div>
                          </div>
                        </div>
                      )}
                      {rep.teacherUsage && (
                        <div>
                          <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                            <span className="flex items-center gap-1"><UserCheck size={16}/> 老师使用率 (Guru)</span>
                            <span className="text-green-600">{rep.teacherUsage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-green-500 h-3 rounded-full" style={{ width: `${Math.min(100, rep.teacherUsage)}%` }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400 font-medium text-right mt-2 border-t border-gray-100 pt-3">
                    Tarikh Kemaskini: {new Date(rep.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
>>>>
