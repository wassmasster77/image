import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  FileCode,
  Layers,
  Search,
  ExternalLink,
  Code2,
  FileText,
  Smartphone,
  Server
} from 'lucide-react';
import {
  FLUTTER_MAIN_DART,
  FLUTTER_PUBSPEC_YAML,
  ANDROID_MANIFEST_XML,
  IOS_INFO_PLIST,
  BACKEND_SAMPLE_API,
} from '../data/flutterCode';

type FileTab = 'main' | 'pubspec' | 'android' | 'ios' | 'backend';

interface FileConfig {
  id: FileTab;
  name: string;
  path: string;
  language: string;
  icon: React.ReactNode;
  content: string;
  badge: string;
  description: string;
}

export const CodeViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FileTab>('main');
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(13);

  const files: Record<FileTab, FileConfig> = {
    main: {
      id: 'main',
      name: 'main.dart',
      path: 'lib/main.dart',
      language: 'dart',
      icon: <FileCode className="w-4 h-4 text-cyan-400" />,
      content: FLUTTER_MAIN_DART,
      badge: 'Dart / Flutter',
      description: 'الكود الكامل للتطبيق: واجهة Dark Mode، دمج image_picker و http، والأزرار الثلاثة ومعالجة الأخطاء.',
    },
    pubspec: {
      id: 'pubspec',
      name: 'pubspec.yaml',
      path: 'pubspec.yaml',
      language: 'yaml',
      icon: <Layers className="w-4 h-4 text-amber-400" />,
      content: FLUTTER_PUBSPEC_YAML,
      badge: 'Dependencies',
      description: 'حزم التبعيات المطلوبة: image_picker، http، path_provider، والإصدارات المتوافقة.',
    },
    android: {
      id: 'android',
      name: 'AndroidManifest.xml',
      path: 'android/app/src/main/AndroidManifest.xml',
      language: 'xml',
      icon: <Smartphone className="w-4 h-4 text-emerald-400" />,
      content: ANDROID_MANIFEST_XML,
      badge: 'Android Config',
      description: 'أذونات الوصول للإنترنت والمعرض والكاميرا لنظام أندرويد (بما يشمل Android 13+).',
    },
    ios: {
      id: 'ios',
      name: 'Info.plist',
      path: 'ios/Runner/Info.plist',
      language: 'xml',
      icon: <FileText className="w-4 h-4 text-slate-300" />,
      content: IOS_INFO_PLIST,
      badge: 'iOS Config',
      description: 'مفاتيح أذونات الوصول للصور والكاميرا المعتمدة لمتجر تطبيقات آبل App Store.',
    },
    backend: {
      id: 'backend',
      name: 'server_sample.py',
      path: 'backend/server.py',
      language: 'python',
      icon: <Server className="w-4 h-4 text-indigo-400" />,
      content: BACKEND_SAMPLE_API,
      badge: 'Backend API',
      description: 'مثال لنقاط النهاية (API Endpoints) بلغة Python / FastAPI لاستقبال طلبات Multipart ومعالجة الصور.',
    },
  };

  const currentFile = files[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([currentFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFile.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Render lines with line numbers & search highlighting
  const lines = currentFile.content.split('\n');

  return (
    <div className="flex flex-col h-full bg-[#12131C] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
      
      {/* Header & Tabs */}
      <div className="bg-[#181924] border-b border-white/5 px-4 pt-3 flex flex-col gap-3">
        
        {/* Title & Actions Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                محرر ومستعرض الأكواد البرمجية (Flutter Code Studio)
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                  {currentFile.badge}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono" dir="ltr">
                {currentFile.path}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            
            {/* Font size adjuster */}
            <div className="hidden sm:flex items-center bg-black/30 border border-white/5 rounded-lg p-0.5 text-xs text-slate-400 font-mono">
              <button
                onClick={() => setFontSize((s) => Math.max(11, s - 1))}
                className="px-2 py-1 hover:text-white"
                title="تصغير الخط"
              >
                A-
              </button>
              <span className="px-1 text-[11px] text-slate-300">{fontSize}px</span>
              <button
                onClick={() => setFontSize((s) => Math.min(18, s + 1))}
                className="px-2 py-1 hover:text-white"
                title="تكبير الخط"
              >
                A+
              </button>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25 active:scale-95'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  تم النسخ بنجاح!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  نسخ الكود
                </>
              )}
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="تحميل الملف للجهاز"
            >
              <Download className="w-3.5 h-3.5" />
              تحميل الملف
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
          {(Object.keys(files) as FileTab[]).map((tabKey) => {
            const file = files[tabKey];
            const isActive = activeTab === tabKey;
            return (
              <button
                key={tabKey}
                onClick={() => {
                  setActiveTab(tabKey);
                  setSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 border transition-all shrink-0 ${
                  isActive
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-white font-bold shadow-sm'
                    : 'bg-black/20 border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {file.icon}
                <span className="font-mono">{file.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Description Banner & Search */}
      <div className="bg-[#151622] px-4 py-2 border-b border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <p className="text-slate-300 text-[11px] leading-relaxed">
          {currentFile.description}
        </p>

        {/* Search input */}
        <div className="relative min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث داخل الكود..."
            className="w-full pl-3 pr-8 py-1 rounded-lg bg-black/40 border border-white/10 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-[10px]"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Code Display Area */}
      <div
        className="flex-1 overflow-auto bg-[#0d0e14] p-4 font-mono select-text custom-scrollbar"
        dir="ltr"
        style={{ fontSize: `${fontSize}px` }}
      >
        <div className="table w-full">
          {lines.map((line, index) => {
            const lineNum = index + 1;
            const isMatch =
              searchQuery && line.toLowerCase().includes(searchQuery.toLowerCase());

            return (
              <div
                key={index}
                className={`table-row leading-relaxed hover:bg-white/[0.03] transition-colors ${
                  isMatch ? 'bg-indigo-950/60 ring-1 ring-indigo-500/40' : ''
                }`}
              >
                {/* Line Number */}
                <span className="table-cell pr-4 text-right select-none text-slate-600 text-xs w-10">
                  {lineNum}
                </span>

                {/* Code Text with Basic Visual Styling */}
                <span className="table-cell whitespace-pre text-slate-200">
                  {formatCodeLine(line)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="bg-[#181924] border-t border-white/5 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <span>{lines.length} سطر</span>
          <span>UTF-8</span>
          <span>{currentFile.language.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-1.5 text-indigo-400 font-sans">
          <span>جاهز للنسخ إلى مشروع Flutter</span>
        </div>
      </div>
    </div>
  );
};

// Simple visual syntax beautifier
function formatCodeLine(line: string) {
  // Comments
  if (line.trim().startsWith('//') || line.trim().startsWith('#') || line.trim().startsWith('<!--')) {
    return <span className="text-emerald-400/80 italic">{line}</span>;
  }
  // Imports / keywords
  if (line.trim().startsWith('import ') || line.trim().startsWith('export ')) {
    return <span className="text-cyan-400 font-semibold">{line}</span>;
  }
  if (line.trim().startsWith('class ') || line.trim().startsWith('enum ')) {
    return <span className="text-amber-300 font-bold">{line}</span>;
  }
  // Widget / Function definitions
  if (line.includes('Widget build') || line.includes('Future<') || line.includes('void main')) {
    return <span className="text-indigo-300">{line}</span>;
  }
  return line;
}
