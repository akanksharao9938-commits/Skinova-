import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Shield, 
  Activity, 
  Utensils, 
  Cloud, 
  User, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  History,
  FileText,
  TrendingUp,
  Search,
  Info,
  Menu,
  X,
  Plus
} from 'lucide-react';
import { analyzeSkinImage, DiagnosisResult } from './services/geminiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { cn } from './lib/utils';

// --- Types ---
interface UserProfile {
  id?: number;
  name: string;
  gender: string;
  age: number;
  diet: string;
  lifestyle: string;
  skin_type: string;
}

interface ScanRecord {
  id: number;
  diagnosis: DiagnosisResult;
  risk_score: number;
  created_at: string;
  image_data: string;
}

interface EnvironmentalData {
  uv_index: number;
  humidity: number;
  pollution_level: string;
  temperature: number;
  risk_factors: string[];
}

// --- Components ---

const Header = ({ activeTab, setActiveTab, onLogout }: { activeTab: string, setActiveTab: (t: string) => void, onLogout: () => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navItems = [
    { id: 'home', label: 'Dashboard 🏠', icon: Activity },
    { id: 'scan', label: 'AI Scan 📸', icon: Camera },
    { id: 'diet', label: 'Skin Diet 🥗', icon: Utensils },
    { id: 'unifier', label: 'Unifier 🔍', icon: Search },
    { id: 'history', label: 'Progress 📈', icon: History },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-black/5 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Shield size={24} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-zinc-900">Skinova</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-emerald-600",
                activeTab === item.id ? "text-emerald-600" : "text-zinc-500"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
          >
            <X size={18} />
            Logout
          </button>
        </div>

        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white border-b border-black/5 p-6 md:hidden flex flex-col gap-4 shadow-xl"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 text-lg font-medium p-3 rounded-xl transition-colors",
                  activeTab === item.id ? "bg-emerald-50 text-emerald-600" : "text-zinc-500 hover:bg-zinc-50"
                )}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const GetStarted = ({ onComplete }: { onComplete: (profile: UserProfile) => void }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    gender: '',
    age: 25,
    diet: 'Balanced',
    lifestyle: 'Active',
    skin_type: 'Normal'
  });

  const [error, setError] = useState('');

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setError('');
    if (!profile.name) {
      setError("Please enter your name");
      setStep(1);
      return;
    }
    if (!profile.gender) {
      setError("Please select your gender");
      setStep(2);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to create profile");
      }
      
      if (data && data.id) {
        onComplete(data);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-[3rem] shadow-2xl border border-black/5">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-emerald-200">
          <Shield size={32} />
        </div>
        <h2 className="text-3xl font-bold text-zinc-900">Welcome to Skinova</h2>
        <p className="text-zinc-500 mt-2">Let's personalize your skin health journey.</p>
      </div>

      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-emerald-600 uppercase tracking-widest">
            {step === 1 ? 'Identity' : step === 2 ? 'Physical' : 'Lifestyle'}
          </span>
          <span className="text-sm font-mono text-zinc-400">Step {step} of 3</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">What's your name?</label>
              <input 
                type="text" 
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-lg"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">Your Age: {profile.age}</label>
              <input 
                type="range" 
                min="1" max="100" 
                value={profile.age}
                onChange={(e) => setProfile({...profile, age: parseInt(e.target.value)})}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
            <button onClick={nextStep} className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">
              Continue <ChevronRight size={20} />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-4 uppercase tracking-wider">Gender</label>
              <div className="grid grid-cols-3 gap-4">
                {['Male', 'Female', 'Other'].map(g => (
                  <button
                    key={g}
                    onClick={() => setProfile({...profile, gender: g})}
                    className={cn(
                      "py-4 rounded-2xl border-2 transition-all font-bold",
                      profile.gender === g ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-zinc-100 text-zinc-500 hover:border-zinc-200"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-4 uppercase tracking-wider">Skin Type</label>
              <div className="grid grid-cols-2 gap-4">
                {['Normal', 'Oily', 'Dry', 'Combination', 'Sensitive'].map(t => (
                  <button
                    key={t}
                    onClick={() => setProfile({...profile, skin_type: t})}
                    className={cn(
                      "py-4 rounded-2xl border-2 transition-all font-bold",
                      profile.skin_type === t ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-zinc-100 text-zinc-500 hover:border-zinc-200"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 py-5 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-all">Back</button>
              <button onClick={nextStep} className="flex-2 py-5 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all">Continue</button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-4 uppercase tracking-wider">Dietary Habits</label>
              <div className="grid grid-cols-2 gap-4">
                {['Balanced', 'Vegan', 'Keto', 'High Protein', 'Fast Food'].map(d => (
                  <button
                    key={d}
                    onClick={() => setProfile({...profile, diet: d})}
                    className={cn(
                      "py-4 rounded-2xl border-2 transition-all font-bold",
                      profile.diet === d ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-zinc-100 text-zinc-500 hover:border-zinc-200"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-4 uppercase tracking-wider">Lifestyle</label>
              <div className="grid grid-cols-2 gap-4">
                {['Sedentary', 'Active', 'High Stress', 'Outdoor'].map(l => (
                  <button
                    key={l}
                    onClick={() => setProfile({...profile, lifestyle: l})}
                    className={cn(
                      "py-4 rounded-2xl border-2 transition-all font-bold",
                      profile.lifestyle === l ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-zinc-100 text-zinc-500 hover:border-zinc-200"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 py-5 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-all">Back</button>
              <button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="flex-2 py-5 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
              >
                {isLoading ? <Activity className="animate-spin" /> : 'Start My Journey 🚀'}
              </button>
            </div>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium flex items-center gap-2"
              >
                <AlertTriangle size={18} />
                {error}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};



const Dashboard = ({ profile, envData }: { profile: UserProfile, envData: EnvironmentalData | null }) => {
  console.log("Dashboard rendering for profile:", profile?.name);
  if (!profile) return <div className="p-12 text-center">Loading profile...</div>;
  
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">Welcome back, {profile.name || 'User'} 👋</h1>
          <p className="text-zinc-500 mt-2">Your skin health overview for today. ✨</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-black/5 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Cloud size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Environment 🌍</p>
            <p className="text-sm font-semibold text-zinc-900">{envData?.temperature}°C • {envData?.pollution_level} Pollution</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Risk Dashboard */}
        <div className="md:col-span-2 bg-zinc-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="text-emerald-400" size={20} />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Safety Shield Active 🛡️</span>
            </div>
            <h2 className="text-3xl font-medium mb-4">Hyper-local Risk Score 🎯</h2>
            <div className="flex items-baseline gap-4">
              <span className="text-7xl font-bold tracking-tighter">24</span>
              <span className="text-zinc-400 text-xl">/ 100</span>
              <span className="ml-4 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-bold">Low Risk ✅</span>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-zinc-400 text-xs mb-1">UV Index ☀️</p>
                <p className="text-xl font-bold">{envData?.uv_index || 0} (Moderate)</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-zinc-400 text-xs mb-1">Humidity 💧</p>
                <p className="text-xl font-bold">{envData?.humidity || 0}%</p>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] -ml-32 -mb-32" />
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] p-6 border border-black/5 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-600" />
              Progress Tracker 📈
            </h3>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { name: 'Mon', val: 40 },
                  { name: 'Tue', val: 30 },
                  { name: 'Wed', val: 45 },
                  { name: 'Thu', val: 25 },
                  { name: 'Fri', val: 20 },
                ]}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="val" stroke="#10b981" fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-zinc-400 mt-4">Skin clarity improved by 12% this week.</p>
          </div>

          <div className="bg-emerald-50 rounded-[2rem] p-6 border border-emerald-100">
            <h3 className="text-lg font-bold text-emerald-900 mb-2">Daily Tip 💡</h3>
            <p className="text-sm text-emerald-700 leading-relaxed">
              Based on the high UV index today, apply SPF 50+ and reapply every 2 hours if outdoors. 🧴
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Meal Planner 🥗', desc: 'Anti-inflammatory skin diet', icon: Utensils, color: 'bg-orange-50 text-orange-600' },
          { title: 'Safety Shield 🛡️', desc: 'Medical awareness & disclaimers', icon: Shield, color: 'bg-purple-50 text-purple-600' },
          { title: 'Product Unifier 🔍', desc: 'Verify product authenticity', icon: Search, color: 'bg-blue-50 text-blue-600' },
          { title: 'Doctor Report 📄', desc: 'Exportable health summary', icon: FileText, color: 'bg-zinc-50 text-zinc-600' },
        ].map((feat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm cursor-pointer"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", feat.color)}>
              <feat.icon size={24} />
            </div>
            <h4 className="font-bold text-zinc-900">{feat.title}</h4>
            <p className="text-sm text-zinc-500 mt-1">{feat.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const CameraCapture = ({ onCapture, onCancel }: { onCapture: (img: string) => void, onCancel: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsReady(true);
        }
      } catch (err) {
        console.error("Camera access denied", err);
        alert("Camera access is required for AI scanning. Please enable it in your browser settings.");
        onCancel();
      }
    };
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        onCapture(canvasRef.current.toDataURL('image/jpeg', 0.8));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
        <button onClick={onCancel} className="p-3 bg-black/40 backdrop-blur-xl rounded-full text-white border border-white/20">
          <X size={24} />
        </button>
        <div className="px-4 py-2 bg-black/40 backdrop-blur-xl rounded-full text-white border border-white/20 text-xs font-bold uppercase tracking-widest">
          Live AI Viewfinder
        </div>
        <div className="w-12" />
      </div>

      <div className="absolute bottom-12 flex flex-col items-center gap-8 w-full px-8">
        <p className="text-white/60 text-sm font-medium text-center max-w-xs">
          Position the affected area within the frame for optimal micro-level analysis.
        </p>
        <div className="flex items-center gap-12">
          <button 
            onClick={capture} 
            disabled={!isReady}
            className="w-20 h-20 bg-white rounded-full border-8 border-white/30 flex items-center justify-center transition-transform active:scale-90 disabled:opacity-50"
          >
            <div className="w-14 h-14 bg-emerald-600 rounded-full shadow-lg" />
          </button>
        </div>
      </div>
      
      {/* Viewfinder Overlay */}
      <div className="absolute inset-0 pointer-events-none border-[40px] border-black/20">
        <div className="w-full h-full border-2 border-white/30 rounded-[3rem] relative">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 -mt-1 -ml-1 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 -mt-1 -mr-1 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 -mb-1 -ml-1 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 -mb-1 -mr-1 rounded-br-2xl" />
        </div>
      </div>
    </div>
  );
};

const AIScan = ({ profile, onScanComplete }: { profile: UserProfile, onScanComplete: (res: DiagnosisResult, img: string, id: number) => void }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    if (!image) return;
    setIsScanning(true);
    try {
      const result = await analyzeSkinImage(image, profile);
      
      // Save to DB
      const res = await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: profile.id,
          image_data: image,
          diagnosis: result,
          risk_score: result.risk_score,
          recommendations: result.recommendations
        })
      });
      const data = await res.json();

      onScanComplete(result, image, data.id);
    } catch (err) {
      console.error(err);
      alert("Analysis failed. Please try again with a clearer photo.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {showCamera && (
        <CameraCapture 
          onCapture={(img) => { setImage(img); setShowCamera(false); }} 
          onCancel={() => setShowCamera(false)} 
        />
      )}
      <div className="bg-white rounded-[3rem] p-12 border border-black/5 shadow-2xl text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-8">
            <Camera size={48} />
          </div>
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">Instant AI Diagnosis 📸</h2>
          <p className="text-zinc-500 mb-8">
            Capture or upload a clear photo of the affected area. Our AI will analyze micro-level changes and provide instant support. ✨
          </p>

          <div className="space-y-4">
            {!image ? (
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => setShowCamera(true)}
                  className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-bold flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
                >
                  <Camera size={24} />
                  Take Photo 📸
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 bg-zinc-900 text-white rounded-[2rem] font-bold flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all"
                >
                  <Plus size={24} />
                  Upload from Gallery 🖼️
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative rounded-[2rem] overflow-hidden border-4 border-emerald-100 shadow-inner">
                  <img src={image} alt="Scan preview" className="w-full h-64 object-cover" />
                  <button 
                    onClick={() => setImage(null)}
                    className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full text-zinc-900 shadow-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
                <button 
                  onClick={startAnalysis}
                  disabled={isScanning}
                  className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-bold flex items-center justify-center gap-3 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-xl shadow-emerald-200"
                >
                  {isScanning ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      >
                        <Activity size={24} />
                      </motion.div>
                      Analyzing Micro-Changes... 🧬
                    </>
                  ) : (
                    <>
                      <Shield size={24} />
                      Analyze Now 🚀
                    </>
                  )}
                </button>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleCapture} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <div className="mt-12 flex items-center justify-center gap-6 text-zinc-400">
            <div className="flex items-center gap-2">
              <Shield size={16} />
              <span className="text-xs font-medium uppercase tracking-wider">Privacy Protected</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span className="text-xs font-medium uppercase tracking-wider">HIPAA Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Shield Disclaimer */}
      <div className="mt-8 p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex gap-4">
        <AlertTriangle className="text-amber-600 shrink-0" size={24} />
        <div>
          <h4 className="font-bold text-amber-900">Medical Safety Shield</h4>
          <p className="text-sm text-amber-700 mt-1">
            Skinova is an AI-driven support tool. It does not replace professional medical advice. If you experience severe pain, rapid spreading, or fever, please seek immediate medical attention.
          </p>
        </div>
      </div>
    </div>
  );
};

const ScanResult = ({ result, image, scanId, onBack }: { result: DiagnosisResult, image: string, scanId?: number, onBack: () => void }) => {
  const handleExport = async () => {
    if (!scanId) return;
    try {
      const res = await fetch(`/api/reports/${scanId}`);
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Skinova_Report_${data.report_id}.json`;
      a.click();
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-medium">
        <X size={20} /> Close Report
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Result */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[3rem] p-8 border border-black/5 shadow-xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className={cn(
                  "px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 inline-block",
                  result.urgency === 'High' ? 'bg-red-100 text-red-600' : 
                  result.urgency === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                )}>
                  {result.urgency} Urgency
                </span>
                <h2 className="text-4xl font-bold text-zinc-900 tracking-tight">{result.condition}</h2>
                <p className="text-zinc-500 mt-2 text-lg leading-relaxed">{result.description}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Confidence</p>
                <p className="text-3xl font-bold text-emerald-600">{(result.confidence * 100).toFixed(0)}%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
                <h4 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  Recommendations
                </h4>
                <ul className="space-y-3">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-zinc-600 flex gap-2">
                      <span className="text-emerald-500">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100">
                <h4 className="font-bold text-orange-900 mb-4 flex items-center gap-2">
                  <Utensils size={18} className="text-orange-600" />
                  Skin Diet Advice
                </h4>
                <ul className="space-y-3">
                  {result.dietary_advice.map((diet, i) => (
                    <li key={i} className="text-sm text-orange-700 flex gap-2">
                      <span className="text-orange-400">•</span>
                      {diet}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-[3rem] p-8 text-white">
            <h3 className="text-2xl font-bold mb-6">Predictive Future Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-zinc-400 text-sm mb-4">Flare-up Probability (Next 14 Days)</p>
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { day: 1, p: 20 }, { day: 4, p: 35 }, { day: 7, p: 60 }, { day: 10, p: 45 }, { day: 14, p: 30 }
                    ]}>
                      <Line type="monotone" dataKey="p" stroke="#10b981" strokeWidth={3} dot={false} />
                      <Tooltip contentStyle={{ background: '#18181b', border: 'none', borderRadius: '12px' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">AI Simulation</p>
                  <p className="text-sm text-zinc-300">Based on your lifestyle, we simulate a 15% reduction in inflammation if dietary advice is followed strictly.</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Micro-Level Trend</p>
                  <p className="text-sm text-zinc-300">Texture analysis shows early signs of recovery in the peripheral areas of the scan.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-white rounded-[3rem] p-6 border border-black/5 shadow-xl overflow-hidden">
            <h4 className="font-bold text-zinc-900 mb-4">Analyzed Image</h4>
            <img src={image} alt="Scan" className="w-full rounded-2xl aspect-square object-cover" />
          </div>

          <div className="bg-emerald-600 rounded-[3rem] p-8 text-white shadow-xl shadow-emerald-200">
            <h4 className="text-xl font-bold mb-4">Smart Doctor Report</h4>
            <p className="text-emerald-100 text-sm mb-6">Generate a comprehensive PDF report with all micro-level data for your dermatologist.</p>
            <button 
              onClick={handleExport}
              className="w-full py-4 bg-white text-emerald-600 rounded-2xl font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
            >
              <FileText size={20} />
              Export Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DietTab = ({ profile, lastScan }: { profile: UserProfile, lastScan: DiagnosisResult | null }) => {
  const [mealPlan, setMealPlan] = useState<{ day: string, meals: string[] }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const res = await fetch('/api/meal-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ condition: lastScan?.condition || 'General Skin Health', profile })
        });
        const data = await res.json();
        if (Array.isArray(data)) setMealPlan(data);
      } catch (err) {
        console.error(err);
      }
    };
    if (profile.id) loadPlan();
  }, [profile.id, lastScan]);

  const fetchMealPlan = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ condition: lastScan?.condition || 'General Skin Health', profile, force: true })
      });
      const data = await res.json();
      if (data.error) {
        alert("AI is currently busy. Please try again in a moment. ✨");
      } else if (Array.isArray(data) && data.length > 0) {
        setMealPlan(data);
      } else {
        alert("We couldn't generate a plan right now. Please try again. 🥗");
      }
    } catch (err) {
      console.error(err);
      alert("Connection error. Please check your internet and try again. 🌐");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-[3rem] p-12 border border-black/5 shadow-xl">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Anti-Inflammatory Skin Diet</h2>
            <p className="text-zinc-500">Personalized nutrition to support your skin's natural healing process.</p>
          </div>
          <button 
            onClick={fetchMealPlan}
            disabled={isGenerating}
            className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isGenerating ? <Activity className="animate-spin" size={20} /> : <Utensils size={20} />}
            Generate Plan
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mealPlan.length > 0 ? mealPlan.map((day, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100"
            >
              <h4 className="font-bold text-zinc-900 mb-4 flex items-center justify-between">
                {day.day}
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Day {i+1}</span>
              </h4>
              <ul className="space-y-2">
                {day.meals.map((meal, j) => (
                  <li key={j} className="text-sm text-zinc-600 flex gap-2">
                    <span className="text-emerald-500">•</span>
                    {meal}
                  </li>
                ))}
              </ul>
            </motion.div>
          )) : (
            <div className="col-span-full py-12 text-center">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 mx-auto mb-4">
                <Utensils size={32} />
              </div>
              <p className="text-zinc-500">No meal plan generated yet. Click the button above to start your skin-diet journey.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const HistoryTab = ({ profile }: { profile: UserProfile }) => {
  const [scans, setScans] = useState<ScanRecord[]>([]);

  useEffect(() => {
    fetch(`/api/scans/${profile.id}`)
      .then(res => res.json())
      .then(data => setScans(data));
  }, [profile.id]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-[3rem] p-12 border border-black/5 shadow-xl">
        <h2 className="text-3xl font-bold mb-4">AI Progress Tracker</h2>
        <p className="text-zinc-500 mb-12">Visualizing your journey to healthier skin through micro-level change tracking.</p>
        
        <div className="h-80 w-full mb-12">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={scans.length > 0 ? scans.map(s => ({ 
              date: new Date(s.created_at).toLocaleDateString(), 
              risk: s.risk_score 
            })).reverse() : [
              { date: 'Initial', risk: 80 },
              { date: 'Week 1', risk: 70 },
              { date: 'Week 2', risk: 55 },
              { date: 'Week 3', risk: 40 },
            ]}>
              <defs>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="risk" stroke="#10b981" strokeWidth={4} fill="url(#colorRisk)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Total Scans</p>
            <p className="text-4xl font-bold text-emerald-900">{scans.length}</p>
          </div>
          <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Avg Risk Score</p>
            <p className="text-4xl font-bold text-blue-900">
              {scans.length > 0 ? (scans.reduce((acc, s) => acc + s.risk_score, 0) / scans.length).toFixed(0) : '0'}
            </p>
          </div>
          <div className="p-8 bg-zinc-900 rounded-[2rem] text-white">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Clarity Improvement</p>
            <p className="text-4xl font-bold">+12%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scans.map((scan, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm flex gap-6 items-center">
            <img src={scan.image_data} alt="Scan" className="w-24 h-24 rounded-2xl object-cover border border-black/5" />
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                {new Date(scan.created_at).toLocaleDateString()}
              </p>
              <h4 className="font-bold text-zinc-900 text-lg">{scan.diagnosis.condition}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  scan.risk_score < 30 ? "bg-emerald-500" : scan.risk_score < 60 ? "bg-amber-500" : "bg-red-500"
                )} />
                <span className="text-sm font-medium text-zinc-500">Risk Score: {scan.risk_score}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductUnifier = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (!query) return;
    setIsLoading(true);
    // Mock verification logic
    setTimeout(() => {
      setResult({
        authentic: Math.random() > 0.2,
        product: query,
        ingredients: ['Water', 'Glycerin', 'Niacinamide', 'Ceramides'],
        safety_rating: 'A+',
        details: 'This product matches our database of verified authentic skincare items.'
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-[3rem] p-12 border border-black/5 shadow-xl">
        <h2 className="text-3xl font-bold mb-4">Product Authenticity Unifier</h2>
        <p className="text-zinc-500 mb-8">Verify if your skincare products are authentic and check their ingredient safety profile.</p>
        
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter product name or scan barcode..."
              className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
          <button 
            onClick={handleVerify}
            disabled={isLoading || !query}
            className="px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isLoading ? <Activity className="animate-spin" size={20} /> : <Shield size={20} />}
            Verify
          </button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-8 rounded-[2rem] border",
                result.authentic ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"
              )}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {result.authentic ? <CheckCircle2 className="text-emerald-600" /> : <AlertTriangle className="text-red-600" />}
                    <span className={cn("font-bold uppercase tracking-widest text-sm", result.authentic ? "text-emerald-600" : "text-red-600")}>
                      {result.authentic ? 'Authentic Product' : 'Verification Failed'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900">{result.product}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Safety Rating</p>
                  <p className="text-2xl font-bold text-emerald-600">{result.safety_rating}</p>
                </div>
              </div>
              <p className="text-zinc-600 mb-6">{result.details}</p>
              <div>
                <h4 className="font-bold text-zinc-900 mb-3 text-sm uppercase tracking-wider">Key Ingredients</h4>
                <div className="flex flex-wrap gap-2">
                  {result.ingredients.map((ing: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-white border border-black/5 rounded-full text-xs font-medium text-zinc-600">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [envData, setEnvData] = useState<EnvironmentalData | null>(null);
  const [lastScan, setLastScan] = useState<{ result: DiagnosisResult, image: string, id?: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUserId = localStorage.getItem('skinova_user_id');
    if (savedUserId) {
      fetch(`/api/users/${savedUserId}`)
        .then(res => {
          if (!res.ok) throw new Error('User not found');
          return res.json();
        })
        .then(data => {
          if (data && data.id) setProfile(data);
          setIsLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('skinova_user_id');
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }

    fetch('/api/environmental')
      .then(res => res.json())
      .then(data => setEnvData(data));
  }, []);

  const handleAuth = (user: UserProfile) => {
    console.log("handleAuth called with user:", user);
    if (!user || !user.id) {
      console.error("Invalid user data received in handleAuth");
      return;
    }
    setProfile(user);
    setActiveTab('home');
    localStorage.setItem('skinova_user_id', user.id.toString());
    console.log("Profile set and ID saved to localStorage");
  };

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
  };

  const handleLogout = () => {
    setProfile(null);
    localStorage.removeItem('skinova_user_id');
    setActiveTab('home');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-zinc-50">
    <motion.div 
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ repeat: Infinity, duration: 2 }}
      className="w-16 h-16 bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-200"
    />
  </div>;

  if (!profile || !profile.id) return <div className="min-h-screen bg-zinc-50 py-12 px-6"><GetStarted onComplete={handleAuth} /></div>;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-emerald-100 selection:text-emerald-900">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      
      <main className="pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Dashboard profile={profile} envData={envData} />
            </motion.div>
          )}
          {activeTab === 'scan' && (
            <motion.div key="scan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {lastScan ? (
                <ScanResult 
                  result={lastScan.result} 
                  image={lastScan.image} 
                  scanId={lastScan.id}
                  onBack={() => setLastScan(null)} 
                />
              ) : (
                <AIScan 
                  profile={profile} 
                  onScanComplete={(res, img, id) => setLastScan({ result: res, image: img, id })} 
                />
              )}
            </motion.div>
          )}
          {activeTab === 'diet' && (
            <motion.div key="diet" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <DietTab profile={profile} lastScan={lastScan?.result || null} />
            </motion.div>
          )}
          {activeTab === 'unifier' && (
            <motion.div key="unifier" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <ProductUnifier />
            </motion.div>
          )}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <HistoryTab profile={profile} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Button */}
      {activeTab !== 'scan' && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setActiveTab('scan')}
          className="fixed bottom-8 right-8 w-16 h-16 bg-emerald-600 text-white rounded-full shadow-2xl shadow-emerald-300 flex items-center justify-center hover:bg-emerald-700 transition-all z-40"
        >
          <Camera size={28} />
        </motion.button>
      )}
    </div>
  );
}
