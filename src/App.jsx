import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Activity, 
  ChevronRight, 
  Wind, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Users, 
  Zap,
  Award,
  BookOpen,
  Camera,
  Send,
  ArrowLeft,
  Loader2,
  RefreshCw
} from 'lucide-react';

// API Configuration
const apiKey = ""; 

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [readinessScore, setReadinessScore] = useState(0);
  const [checklist, setChecklist] = useState({
    mobility: false,
    activation: false,
    mental: false
  });

  // Learn Detail States
  const [drillDetail, setDrillDetail] = useState(null);

  // AI Analysis States
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  // Community States
  const [posts, setPosts] = useState([
    { id: 1, user: "EliteGymnast_01", text: "Just completed my bars protocol. Wrist feeling solid for giant swings today!", likes: 12, time: "2h ago" },
    { id: 2, user: "VaultKing", text: "Pro tip: Don't skip the ankle activation. My landing felt 100% more stable today.", likes: 24, time: "5h ago" }
  ]);
  const [newPost, setNewPost] = useState("");

  // Reset checklist when apparatus changes
  useEffect(() => {
    setChecklist({
      mobility: false,
      activation: false,
      mental: false
    });
  }, [selectedEvent]);

  // Calculate readiness score
  useEffect(() => {
    const total = Object.values(checklist).filter(Boolean).length;
    setReadinessScore(Math.round((total / 3) * 100));
  }, [checklist]);

  const glassStyle = "bg-white/10 backdrop-blur-lg border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-2xl";

  // --- API LOGIC ---
  const callGemini = async (prompt, base64Image = null) => {
    let retries = 0;
    const maxRetries = 5;
    
    const payload = base64Image 
      ? {
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType: "image/png", data: base64Image.split(',')[1] } }
            ]
          }]
        }
      : { contents: [{ parts: [{ text: prompt }] }] };

    while (retries < maxRetries) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text;
      } catch (e) {
        retries++;
        await new Promise(r => setTimeout(r, Math.pow(2, retries) * 1000));
      }
    }
    throw new Error("Analysis failed after retries.");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    if (!previewImage) return;
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const prompt = "Analyze this gymnastics pose for injury prevention. Identify specific risks like 'knee valgus' (knees caving in), 'spinal hyperextension', or 'poor landing mechanics'. Provide 3 bullet points: 1. Observation, 2. Potential Risk, 3. Corrective Cue. Keep it professional and concise.";
      const result = await callGemini(prompt, previewImage);
      setAnalysisResult(result);
    } catch (err) {
      setAnalysisResult("Error connecting to GymSense AI. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  // --- COMPONENTS ---

  const DrillPage = ({ title, description, drills }) => (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in duration-500">
      <button onClick={() => setDrillDetail(null)} className="flex items-center gap-2 text-blue-400 mb-8 hover:text-white transition-colors">
        <ArrowLeft size={20} /> Back to Library
      </button>
      <div className={`${glassStyle} p-8`}>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        <p className="text-blue-100/60 mb-10 text-base md:text-lg leading-relaxed">{description}</p>
        <div className="space-y-6">
          {drills.map((drill, idx) => (
            <div key={idx} className="p-6 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 font-bold text-blue-400 border border-blue-500/30">
                {idx + 1}
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">{drill.name}</h4>
                <p className="text-blue-100/60 text-sm">{drill.instruction}</p>
                <div className="mt-4 inline-block px-3 py-1 bg-white/5 rounded-full text-[10px] uppercase tracking-widest text-white/40">
                  Target: {drill.target}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Home = () => (
    <>
      <div className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-purple-500/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse" />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="inline-block px-4 py-1.5 mb-6 text-xs md:text-sm font-medium tracking-wider text-blue-200 uppercase bg-blue-500/20 rounded-full border border-blue-400/30">
            Hackathon Edition: AI-Powered Prevention
          </span>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
            Safety at the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-purple-300">
              Speed of Flight.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100/80 mb-10 max-w-2xl mx-auto">
            GymSense uses advanced AI and clinical data to predict and prevent gymnastics injuries before they happen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => setActiveTab('protocol')} className="px-8 py-4 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-2">
              Start Pre-Flight <Activity size={20} />
            </button>
            <button onClick={() => setActiveTab('ai')} className="px-8 py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-2">
              Scan My Form <Camera size={20} />
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 pb-20 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { v: "42%", l: "Injury Reduction" },
          { v: "AI-Ready", l: "Real-time Analysis" },
          { v: "50+", l: "Olympic Protocols" },
          { v: "24/7", l: "Gymnast Support" }
        ].map((stat, i) => (
          <div key={i} className={`${glassStyle} p-6 text-center`}>
            <div className="text-2xl md:text-3xl font-black text-white mb-1">{stat.v}</div>
            <div className="text-[10px] md:text-xs text-blue-200/50 uppercase tracking-widest">{stat.l}</div>
          </div>
        ))}
      </div>
    </>
  );

  const Learn = () => {
    if (drillDetail === 'ankle') return (
      <DrillPage 
        title="Ankle Armor" 
        description="Strengthening the ankle complex is vital for dissipating landing forces that can exceed 10x body weight."
        drills={[
          { name: "Alphabet Mobilization", instruction: "Trace the alphabet with your big toe while sitting with legs extended to improve range of motion.", target: "Joint Mobility" },
          { name: "Band Pull-ins", instruction: "Use a resistance band to perform inversion and eversion exercises to strengthen stabilizing ligaments.", target: "Lateral Stability" },
          { name: "Proprioceptive Balance", instruction: "Stand on a foam pad or folded mat on one leg for 30 seconds while mimicking arm movements.", target: "Neuromuscular Control" }
        ]}
      />
    );

    if (drillDetail === 'core') return (
      <DrillPage 
        title="Core Stability" 
        description="A robust core prevents the spinal hyperextension common during blind landings and arched vaulting positions."
        drills={[
          { name: "Hollow Rock Holds", instruction: "Press lower back into the floor, lift legs and shoulders 3 inches, and hold for 45 seconds.", target: "Anterior Chain" },
          { name: "Superman Extensions", instruction: "Lying prone, lift chest and thighs simultaneously. Focus on glute activation to protect lower back.", target: "Posterior Chain" },
          { name: "Plank Rotations", instruction: "Transition from side plank to side plank slowly to build obliques for twisting rotations.", target: "Anti-Rotational Power" }
        ]}
      />
    );

    return (
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Expert Injury Prevention Library</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className={`${glassStyle} p-8 hover:bg-white/15 transition-all cursor-pointer group`} onClick={() => setDrillDetail('ankle')}>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
              <Shield className="text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Ankle Armor</h3>
            <p className="text-blue-100/60 text-sm leading-relaxed mb-6">90% of gymnastics ankle injuries occur on landing. Learn 'Dynamic Landing' techniques.</p>
            <div className="text-blue-400 text-sm font-bold flex items-center gap-1">
              Start Drills <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
          
          <div className={`${glassStyle} p-8 hover:bg-white/15 transition-all cursor-pointer group`} onClick={() => setDrillDetail('core')}>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
              <Activity className="text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Core Stability</h3>
            <p className="text-blue-100/60 text-sm leading-relaxed mb-6">Protects the lower lumbar during high-impact arches in vault and floor.</p>
            <div className="text-purple-400 text-sm font-bold flex items-center gap-1">
              Prevention Guide <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div className={`${glassStyle} p-8 opacity-90 border-blue-500/30 border`}>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
              <Camera className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">AI Scan Feature</h3>
            <p className="text-blue-100/60 text-sm leading-relaxed mb-6">Real-time pose analysis using our neural network to detect form errors that cause injury.</p>
            <button onClick={() => setActiveTab('ai')} className="text-emerald-400 text-sm font-bold flex items-center gap-1 group">
              Try It Now <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const AIScan = () => (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className={`${glassStyle} p-6 md:p-10 text-center`}>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">AI Form Analyzer</h2>
        <p className="text-blue-100/60 mb-10 max-w-lg mx-auto text-sm md:text-base">
          Upload a clear photo of your landing, bridge, or handstand. Our AI will analyze your joint alignment to identify injury risks.
        </p>

        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-2xl border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group"
            >
              {previewImage ? (
                <>
                  <img src={previewImage} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <RefreshCw className="text-white" />
                  </div>
                </>
              ) : (
                <>
                  <Camera size={48} className="text-white/20 mb-4" />
                  <span className="text-sm text-white/40">Click to upload photo</span>
                </>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
              accept="image/*" 
            />
            
            <button 
              onClick={runAnalysis}
              disabled={!previewImage || analyzing}
              className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 ${
                !previewImage || analyzing ? 'bg-white/10 text-white/20' : 'bg-emerald-500 text-white'
              }`}
            >
              {analyzing ? <Loader2 className="animate-spin" /> : <Zap size={20} />}
              {analyzing ? "AI Analyzing..." : "Run Prevention Scan"}
            </button>
          </div>

          <div className="bg-white/5 rounded-2xl border border-white/10 p-6 text-left min-h-[300px] flex flex-col">
            <h4 className="text-xs uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
              <Info size={14} /> Scan Results
            </h4>
            {analysisResult ? (
              <div className="text-blue-100/90 whitespace-pre-wrap text-sm leading-relaxed animate-in fade-in duration-500">
                {analysisResult}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                <Shield size={40} className="mb-2" />
                <p className="text-xs md:text-sm">Upload a pose to see <br/> preventive feedback</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const Community = () => {
    const handlePost = () => {
      if (!newPost.trim()) return;
      const post = {
        id: Date.now(),
        user: "You",
        text: newPost,
        likes: 0,
        time: "Just now"
      };
      setPosts([post, ...posts]);
      setNewPost("");
    };

    return (
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <Users size={48} className="text-white/10 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">GymSense Community</h2>
          <p className="text-blue-100/60 text-sm md:text-base">Share tips, success stories, and recovery logs.</p>
        </div>

        <div className={`${glassStyle} p-6 mb-8`}>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share a safety tip or training update..."
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none h-24 mb-4 text-sm"
          />
          <div className="flex justify-end">
            <button 
              onClick={handlePost}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-blue-400 transition-all text-sm"
            >
              Post <Send size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className={`${glassStyle} p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start animate-in slide-in-from-top-4 duration-300`}>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-white/20 shrink-0" />
              <div className="flex-1 w-full">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-bold text-sm">@{post.user}</span>
                  <span className="text-[10px] uppercase text-white/30">{post.time}</span>
                </div>
                <p className="text-blue-100/70 text-sm leading-relaxed mb-4">{post.text}</p>
                <div className="flex items-center gap-4 text-white/30 text-xs">
                  <button className="flex items-center gap-1 hover:text-white"><Activity size={14} /> {post.likes} Boosts</button>
                  <button className="hover:text-white">Share</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0B1A] font-sans text-white selection:bg-blue-500/30">
      {/* Responsive Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6">
        <div className={`max-w-6xl mx-auto ${glassStyle} px-4 md:px-8 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0`}>
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => setActiveTab('home')}>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <Wind className="text-white" size={20} />
            </div>
            <span className="text-xl font-black tracking-tighter italic">GYMSENSE</span>
          </div>
          
          <div className="flex items-center gap-4 md:gap-8 flex-wrap justify-center">
            {['home', 'protocol', 'learn', 'ai', 'community'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setDrillDetail(null); }}
                className={`text-[10px] md:text-sm font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'text-blue-400' : 'text-white/60 hover:text-white'
                }`}
              >
                {tab === 'ai' ? 'Form Scan' : tab}
              </button>
            ))}
          </div>

          <div className="hidden lg:block w-32"></div>
        </div>
      </nav>

      <main className="relative pt-24 md:pt-10">
        {activeTab === 'home' && <Home />}
        {activeTab === 'protocol' && (
          <div className="max-w-5xl mx-auto px-6 py-12">
            <div className={`${glassStyle} p-6 md:p-8 mb-8`}>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Pre-Flight Protocol</h2>
              <p className="text-blue-100/60 mb-8 text-sm md:text-base">Select apparatus to load specific injury prevention parameters.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {[
                  { id: 'floor', name: 'Floor', risk: 'Ankles & Spine', color: 'from-blue-500 to-cyan-400' },
                  { id: 'vault', name: 'Vault', risk: 'Achilles & Knees', color: 'from-purple-500 to-pink-400' },
                  { id: 'bars', name: 'Bars', risk: 'Shoulders & Wrists', color: 'from-orange-500 to-red-400' },
                  { id: 'beam', name: 'Beam', risk: 'Ligaments & Focus', color: 'from-emerald-500 to-teal-400' }
                ].map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`p-4 md:p-6 rounded-xl border transition-all text-left group ${
                      selectedEvent?.id === event.id 
                      ? 'bg-white/20 border-white/50 ring-2 ring-white/30' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br ${event.color} mb-4 flex items-center justify-center`}>
                      <Zap size={18} className="text-white" />
                    </div>
                    <h3 className="text-sm md:text-base font-bold text-white">{event.name}</h3>
                    <p className="text-[9px] md:text-[10px] text-blue-200/50 mt-1 uppercase">Target: {event.risk.split(' ')[0]}</p>
                  </button>
                ))}
              </div>

              {selectedEvent ? (
                <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-4">
                    <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="text-emerald-400" /> Essential {selectedEvent.name} Prep
                    </h3>
                    {[
                      { id: 'mobility', label: `Joint Mobility (${selectedEvent.risk.split(' ')[0]})`, icon: <Activity size={18}/> },
                      { id: 'activation', label: 'Muscle Firing Activation', icon: <Wind size={18}/> },
                      { id: 'mental', label: 'Mental Focus Check', icon: <Shield size={18}/> }
                    ].map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => setChecklist({...checklist, [item.id]: !checklist[item.id]})}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          checklist[item.id] ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={checklist[item.id] ? 'text-emerald-400' : 'text-blue-200/40'}>{item.icon}</div>
                          <span className="text-xs md:text-sm text-white font-medium">{item.label}</span>
                        </div>
                        <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center ${checklist[item.id] ? 'bg-emerald-500 border-emerald-400' : 'border-white/20'}`}>
                          {checklist[item.id] && <CheckCircle2 size={14} className="text-white" />}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white/5 border border-white/10">
                    <div className="relative w-36 h-36 md:w-48 md:h-48 mb-6">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="50%" cy="50%" r="40%" fill="transparent" stroke="currentColor" strokeWidth="10" className="text-white/10" />
                        <circle cx="50%" cy="50%" r="40%" fill="transparent" stroke="currentColor" strokeWidth="10" strokeDasharray="251.2%" strokeDashoffset={`${251.2 - (251.2 * readinessScore) / 100}%`} className={`transition-all duration-700 ${readinessScore === 100 ? 'text-emerald-400' : 'text-blue-400'}`} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl md:text-4xl font-bold text-white">{readinessScore}%</span>
                        <span className="text-[9px] md:text-[10px] text-blue-200/50 uppercase tracking-widest">Readiness</span>
                      </div>
                    </div>
                    <button disabled={readinessScore < 100} className={`w-full py-3 md:py-4 rounded-xl text-sm font-bold transition-all ${readinessScore === 100 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}>
                      Begin Session
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-2xl">
                  <AlertCircle size={48} className="text-white/20 mx-auto mb-4" />
                  <p className="text-white/40">Select an event to load safety parameters</p>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'learn' && <Learn />}
        {activeTab === 'ai' && <AIScan />}
        {activeTab === 'community' && <Community />}
      </main>

      <footer className="border-t border-white/10 py-12 px-6 bg-white/5 backdrop-blur-sm mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
              <Wind size={16} className="text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter italic uppercase">GymSense</span>
          </div>
          <div className="text-white/30 text-[10px] md:text-xs text-center md:text-right">
            <p>&copy; 2026 GymSense x Sport Prevention Hackathon. All rights reserved.</p>
            <p className="mt-2 flex items-center justify-center md:justify-end gap-1">Gymnastics Injury Prevention AI <Award size={12} /></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;