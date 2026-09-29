import React, { useState } from 'react';
import {
  Smartphone,
  FileCode,
  Layers,
  BookOpen,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Github,
  Zap,
  Split,
  Maximize2,
  Minimize2,
  Sliders,
  Palette,
  Scissors
} from 'lucide-react';
import { FlutterPhoneSimulator } from './components/FlutterPhoneSimulator';
import { CodeViewer } from './components/CodeViewer';
import { SetupGuide } from './components/SetupGuide';
import { FLUTTER_MAIN_DART } from './data/flutterCode';

export default function App() {
  const [activeView, setActiveView] = useState<'split' | 'simulator' | 'code' | 'guide'>('split');
  const [quickCopied, setQuickCopied] = useState<boolean>(false);

  const handleQuickCopyDart = () => {
    navigator.clipboard.writeText(FLUTTER_MAIN_DART);
    setQuickCopied(true);
    setTimeout(() => setQuickCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0A0B10] text-[#E2E8F0] flex flex-col font-['Cairo',sans-serif]">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#0F1018]/90 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo & Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  AI Photo Enhancer
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Flutter & Dart
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Dark Mode Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                كود نظيف متكامل لـ <code className="text-cyan-300 font-mono">main.dart</code> مع محاكي حي ومعالجة الأخطاء
              </p>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-[#151624] border border-white/10 rounded-2xl p-1 gap-1">
            <button
              onClick={() => setActiveView('split')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeView === 'split'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              <span className="hidden md:inline">عرض مزدوج</span>
            </button>

            <button
              onClick={() => setActiveView('simulator')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeView === 'simulator'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>المحاكي</span>
            </button>

            <button
              onClick={() => setActiveView('code')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeView === 'code'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>الأكواد (Dart/YAML)</span>
            </button>

            <button
              onClick={() => setActiveView('guide')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeView === 'guide'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>دليل التثبيت</span>
            </button>
          </div>

          {/* Quick Copy Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickCopyDart}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg ${
                quickCopied
                  ? 'bg-emerald-600 text-white shadow-emerald-600/25'
                  : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-indigo-600/25 active:scale-95'
              }`}
            >
              {quickCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>تم نسخ main.dart!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ كود main.dart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Feature Highlights Subheader */}
      <section className="bg-gradient-to-r from-indigo-950/40 via-[#10111d] to-cyan-950/40 border-b border-white/5 py-3 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-indigo-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              مكتبة <code className="font-mono font-bold text-white">image_picker</code> للمعرض والكاميرا
            </span>
            <span className="flex items-center gap-1.5 text-cyan-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              طلبات <code className="font-mono font-bold text-white">http.MultipartRequest</code> ومعالجة الأخطاء
            </span>
            <span className="flex items-center gap-1.5 text-pink-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-pink-400" />
              فلاتر الأنمي، تحسين HD، وتفريغ الخلفية
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>كود إنتاجي نظيف 100% جاهز للتشغيل الفوري</span>
          </div>
        </div>
      </section>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6">
        {activeView === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left/Center Column: Mobile Simulator */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-3 px-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  محاكي الهاتف الحي (Live Flutter Preview)
                </span>
                <span className="text-[11px] text-slate-500">
                  تفاعل مع الأزرار لاختبار الواجهة
                </span>
              </div>
              <FlutterPhoneSimulator />
            </div>

            {/* Right Column: Code Viewer & Guides */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="h-[780px]">
                <CodeViewer />
              </div>
            </div>
          </div>
        )}

        {activeView === 'simulator' && (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="mb-4 text-center">
              <h2 className="text-lg font-bold text-white">محاكي تطبيق Flutter المباشر</h2>
              <p className="text-xs text-slate-400">
                يمكنك رفع صورة من جهازك، اختبار زر الـ HD وفلاتر الأنمي وتفريغ الخلفية، وتجربة شريط المقارنة
              </p>
            </div>
            <FlutterPhoneSimulator />
          </div>
        )}

        {activeView === 'code' && (
          <div className="h-[calc(100vh-180px)] min-h-[600px]">
            <CodeViewer />
          </div>
        )}

        {activeView === 'guide' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <SetupGuide />
            <div className="mt-6">
              <CodeViewer />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0C0D14] border-t border-white/5 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>AI Photo Enhancer — Flutter Production Code Studio</span>
          <span>Dart 3.x • Material 3 Dark Theme • HTTP Multipart • ImagePicker</span>
        </div>
      </footer>
    </div>
  );
}
