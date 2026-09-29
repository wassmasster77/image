import React, { useState } from 'react';
import {
  Terminal,
  CheckCircle,
  Copy,
  Check,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  Smartphone,
  ShieldCheck,
  Network
} from 'lucide-react';

export const SetupGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [openStep, setOpenStep] = useState<number>(1);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      step: 1,
      title: 'إنشاء مشروع Flutter جديد',
      icon: <Terminal className="w-5 h-5 text-indigo-400" />,
      content: (
        <div className="space-y-3">
          <p className="text-slate-300 text-xs leading-relaxed">
            افتح موجه الأوامر (Terminal / PowerShell) ونفّذ الأمر التالي لإنشاء مشروع Flutter جديد باسم <code className="text-indigo-300 font-mono">ai_photo_enhancer</code>:
          </p>
          <div className="relative group">
            <pre className="bg-[#0b0c12] p-3 rounded-xl border border-white/10 text-xs font-mono text-cyan-300 overflow-x-auto" dir="ltr">
              flutter create ai_photo_enhancer
            </pre>
            <button
              onClick={() => copyToClipboard('flutter create ai_photo_enhancer', 1)}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] flex items-center gap-1"
            >
              {copiedIndex === 1 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              نسخ
            </button>
          </div>
          <p className="text-slate-400 text-xs">ثم ادخل إلى مجلد المشروع:</p>
          <div className="relative group">
            <pre className="bg-[#0b0c12] p-3 rounded-xl border border-white/10 text-xs font-mono text-cyan-300 overflow-x-auto" dir="ltr">
              cd ai_photo_enhancer
            </pre>
            <button
              onClick={() => copyToClipboard('cd ai_photo_enhancer', 2)}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] flex items-center gap-1"
            >
              {copiedIndex === 2 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              نسخ
            </button>
          </div>
        </div>
      ),
    },
    {
      step: 2,
      title: 'إضافة حزم التبعيات (Dependencies)',
      icon: <Cpu className="w-5 h-5 text-cyan-400" />,
      content: (
        <div className="space-y-3">
          <p className="text-slate-300 text-xs leading-relaxed">
            استخدم أمر <code className="text-indigo-300 font-mono">flutter pub add</code> لإضافة مكتبات <strong className="text-white">image_picker</strong> (لاختيار الصور من المعرض والكاميرا) و <strong className="text-white">http</strong> (لإرسال طلبات الـ POST Multipart) تلقائياً إلى <code className="text-amber-300 font-mono">pubspec.yaml</code>:
          </p>
          <div className="relative group">
            <pre className="bg-[#0b0c12] p-3 rounded-xl border border-white/10 text-xs font-mono text-cyan-300 overflow-x-auto" dir="ltr">
              flutter pub add image_picker http path_provider
            </pre>
            <button
              onClick={() => copyToClipboard('flutter pub add image_picker http path_provider', 3)}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] flex items-center gap-1"
            >
              {copiedIndex === 3 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              نسخ
            </button>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-200">
            💡 أو يمكنك نسخ محتوى ملف <strong className="text-white">pubspec.yaml</strong> المكتوب في تبويب الأكواد مباشرة واستبدال محتوى ملفك ثم تنفيذ <code className="text-white font-mono">flutter pub get</code>.
          </div>
        </div>
      ),
    },
    {
      step: 3,
      title: 'تهيئة أذونات النظام (Android & iOS Permissions)',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      content: (
        <div className="space-y-3 text-xs leading-relaxed">
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Smartphone className="w-4 h-4" />
              <span>إعداد أندرويد (Android):</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              افتح الملف <code className="text-cyan-300 font-mono" dir="ltr">android/app/src/main/AndroidManifest.xml</code> وأضف الأذونات داخل وسم <code className="text-cyan-300 font-mono">&lt;manifest&gt;</code>:
            </p>
            <div className="bg-[#0b0c12] p-2.5 rounded-lg border border-white/5 font-mono text-[10px] text-slate-300 overflow-x-auto" dir="ltr">
              &lt;uses-permission android:name="android.permission.INTERNET" /&gt;<br />
              &lt;uses-permission android:name="android.permission.READ_MEDIA_IMAGES" /&gt;<br />
              &lt;uses-permission android:name="android.permission.CAMERA" /&gt;
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Smartphone className="w-4 h-4" />
              <span>إعداد آيفون (iOS):</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              افتح الملف <code className="text-cyan-300 font-mono" dir="ltr">ios/Runner/Info.plist</code> وأضف مفاتيح وصف الوصول داخل وسم <code className="text-cyan-300 font-mono">&lt;dict&gt;</code>:
            </p>
            <div className="bg-[#0b0c12] p-2.5 rounded-lg border border-white/5 font-mono text-[10px] text-slate-300 overflow-x-auto" dir="ltr">
              &lt;key&gt;NSPhotoLibraryUsageDescription&lt;/key&gt;<br />
              &lt;string&gt;يحتاج التطبيق للوصول إلى معرض الصور لاختيار صورتك لتحسينها.&lt;/string&gt;<br />
              &lt;key&gt;NSCameraUsageDescription&lt;/key&gt;<br />
              &lt;string&gt;يحتاج التطبيق للكاميرا لالتقاط صورة جديدة ومعالجتها.&lt;/string&gt;
            </div>
          </div>
        </div>
      ),
    },
    {
      step: 4,
      title: 'لصق كود main.dart وتشغيل التطبيق',
      icon: <CheckCircle className="w-5 h-5 text-amber-400" />,
      content: (
        <div className="space-y-3 text-xs leading-relaxed">
          <p className="text-slate-300">
            افتح الملف <code className="text-cyan-300 font-mono" dir="ltr">lib/main.dart</code> واستبدل محتواه بالكامل بالكود الموجود في تبويب <strong className="text-white">main.dart</strong>.
          </p>
          <p className="text-slate-300">ثم شغّل التطبيق على محاكي الهاتف أو جهاز حقيقي:</p>
          <div className="relative group">
            <pre className="bg-[#0b0c12] p-3 rounded-xl border border-white/10 text-xs font-mono text-cyan-300 overflow-x-auto" dir="ltr">
              flutter run
            </pre>
            <button
              onClick={() => copyToClipboard('flutter run', 4)}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] flex items-center gap-1"
            >
              {copiedIndex === 4 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              نسخ
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-[#12131C] rounded-2xl border border-white/10 p-5 shadow-2xl space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            دليل التثبيت والتشغيل خطوة بخطوة (Production Guide)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            كيفية تجهيز بيئة العمل وتشغيل كود Flutter على محاكي Android أو جهاز iPhone
          </p>
        </div>
      </div>

      {/* Accordion Steps */}
      <div className="space-y-3">
        {steps.map((item) => {
          const isOpen = openStep === item.step;
          return (
            <div
              key={item.step}
              className={`rounded-xl border transition-all ${
                isOpen
                  ? 'bg-[#181926] border-indigo-500/40 shadow-lg shadow-indigo-950/20'
                  : 'bg-[#151622] border-white/5 hover:border-white/10'
              }`}
            >
              <button
                onClick={() => setOpenStep(isOpen ? 0 : item.step)}
                className="w-full p-4 flex items-center justify-between text-right"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 block uppercase tracking-wider">
                      الخطوة {item.step}
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      {item.title}
                    </h3>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-white/5">
                  {item.content}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Common Pitfalls & Tips */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
        <h4 className="text-xs font-bold text-amber-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          ملاحظات هامة جداً للمطورين عند ربط الـ API:
        </h4>
        <ul className="text-[11px] text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
          <li>
            <strong className="text-white">محاكي الأندرويد (Android Emulator):</strong> للوصول إلى السيرفر المحلي في جهاز الكمبيوتر (localhost)، لا تستخدم <code className="text-amber-300 font-mono">127.0.0.1</code> بل استخدم العنوان المخصص للمحاكي: <code className="text-amber-300 font-mono">http://10.0.2.2:8000</code>.
          </li>
          <li>
            <strong className="text-white">اتصال الـ HTTP غير المشفر (Cleartext):</strong> يمنع نظام أندرويد الحديث الاتصال بروابط <code className="text-amber-300 font-mono">http://</code> بدون <code className="text-amber-300 font-mono">android:usesCleartextTraffic="true"</code> في ملف AndroidManifest، ويفضل دائماً استخدام <code className="text-emerald-300 font-mono">https://</code> في بيئة الإنتاج.
          </li>
          <li>
            <strong className="text-white">أحجام الصور:</strong> تم ضبط أبعاد الصورة القصوى في دالة <code className="text-cyan-300 font-mono">pickImage</code> إلى 2048x2048 وبجودة 92% لتفادي بطء الرفع والحد من استهلاك الذاكرة.
          </li>
        </ul>
      </div>
    </div>
  );
};
