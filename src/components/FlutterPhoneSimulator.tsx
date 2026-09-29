import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Palette,
  Scissors,
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Camera,
  Download,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Maximize2,
  X,
  Smartphone,
  Layers,
  Zap,
  Info
} from 'lucide-react';
import {
  SAMPLE_IMAGES,
  enhanceImageHD,
  applyAnimeFilter,
  removeBackground,
  ProcessResult,
} from '../utils/imageProcessor';

interface SnackBarState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  actionLabel?: string;
  onAction?: () => void;
}

export const FlutterPhoneSimulator: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedResult, setProcessedResult] = useState<ProcessResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [currentOperation, setCurrentOperation] = useState<'hd' | 'anime' | 'remove_bg' | null>(null);
  const [sliderPos, setSliderPos] = useState<number>(50); // 0 to 100
  const [animeStyle, setAnimeStyle] = useState<'shinkai' | 'ghibli' | 'cyberpunk'>('shinkai');
  const [showStyleModal, setShowStyleModal] = useState<boolean>(false);
  const [snackBar, setSnackBar] = useState<SnackBarState | null>(null);
  const [isSimulateError, setIsSimulateError] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Time updater
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${mins}`);
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  const showSnackBar = (
    message: string,
    type: 'success' | 'error' | 'info',
    actionLabel?: string,
    onAction?: () => void
  ) => {
    const id = Date.now().toString();
    setSnackBar({ id, message, type, actionLabel, onAction });
    setTimeout(() => {
      setSnackBar((prev) => (prev?.id === id ? null : prev));
    }, 4500);
  };

  // Image Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showSnackBar('الملف المختار ليس صورة صالحة. يرجى اختيار ملف JPG أو PNG.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
          setProcessedResult(null);
          showSnackBar('تم استيراد الصورة بنجاح عبر image_picker! جاهزة للمعالجة.', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (url: string) => {
    setSelectedImage(url);
    setProcessedResult(null);
    showSnackBar('تم تحميل الصورة التجريبية بنجاح!', 'success');
  };

  // Reset
  const handleReset = () => {
    setSelectedImage(null);
    setProcessedResult(null);
    setIsLoading(false);
    showSnackBar('تمت إعادة تعيين مساحة العمل.', 'info');
  };

  // Execution with simulation of Flutter HTTP Multipart POST
  const runProcess = async (type: 'hd' | 'anime' | 'remove_bg') => {
    if (!selectedImage) {
      showSnackBar('يرجى اختيار صورة أولاً من المعرض!', 'error');
      return;
    }

    if (isSimulateError) {
      setIsLoading(true);
      setLoadingStep('جاري إرسال طلب HTTP POST Multipart...');
      setTimeout(() => {
        setIsLoading(false);
        showSnackBar(
          'فشل الاتصال: SocketException (تعذر الوصول إلى سيرفر الذكاء الاصطناعي على المنفذ 8000).',
          'error',
          'إعادة المحاولة',
          () => {
            setIsSimulateError(false);
            runProcess(type);
          }
        );
      }, 1500);
      return;
    }

    setIsLoading(true);
    setCurrentOperation(type);

    if (type === 'hd') {
      setLoadingStep('تحميل الصورة وتجهيز حزم البيكسل...');
    } else if (type === 'anime') {
      setLoadingStep(`تطبيق نموذج الأنمي (${animeStyle === 'shinkai' ? 'Makoto Shinkai' : animeStyle === 'ghibli' ? 'Studio Ghibli' : 'Cyberpunk'})...`);
    } else {
      setLoadingStep('عزل الكائن وتفريغ الخلفية الشفافة...');
    }

    try {
      // Step simulation for realistic Flutter network request feel
      await new Promise((r) => setTimeout(r, 600));
      setLoadingStep('جاري تنفيذ خوارزمية الذكاء الاصطناعي...');

      let res: ProcessResult;
      if (type === 'hd') {
        res = await enhanceImageHD(selectedImage);
      } else if (type === 'anime') {
        res = await applyAnimeFilter(selectedImage, animeStyle);
      } else {
        res = await removeBackground(selectedImage);
      }

      await new Promise((r) => setTimeout(r, 500));
      setProcessedResult(res);
      setIsLoading(false);
      showSnackBar(
        `تمت المعالجة بنجاح خلال ${res.durationMs}ms وحفظ النتيجة في الذاكرة (Uint8List).`,
        'success'
      );
    } catch (err: any) {
      setIsLoading(false);
      showSnackBar(err.message || 'حدث خطأ غير متوقع أثناء معالجة الصورة.', 'error');
    }
  };

  // Slider Mouse/Touch Handlers
  const handleSliderMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleMouseDown = () => {
    isDraggingRef.current = true;
  };

  useEffect(() => {
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        handleSliderMove(e.clientX);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current && e.touches[0]) {
        handleSliderMove(e.touches[0].clientX);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const handleDownload = () => {
    if (!processedResult) return;
    const a = document.createElement('a');
    a.href = processedResult.dataUrl;
    a.download = `enhanced_ai_${Date.now()}.${processedResult.effect === 'remove_bg' ? 'png' : 'jpg'}`;
    a.click();
    showSnackBar('تم تنزيل الصورة المعالجة إلى هاتفك.', 'success');
  };

  return (
    <div className="flex flex-col items-center">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Simulator Device Frame */}
      <div className="relative w-full max-w-[390px] h-[780px] bg-[#0F1016] rounded-[48px] border-[10px] border-[#222433] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(99,102,241,0.15)] overflow-hidden flex flex-col select-none">
        
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-between px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1c1d29]" />
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40" />
        </div>

        {/* Status Bar */}
        <div className="h-11 px-7 pt-2 flex items-center justify-between text-xs font-semibold text-slate-300 z-40 bg-[#0F1016]">
          <span className="tracking-tight">{currentTime}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-indigo-400 font-mono">5G</span>
            <div className="w-5 h-2.5 rounded-sm border border-slate-400/80 p-0.5 flex items-center">
              <div className="w-full h-full bg-emerald-400 rounded-2xs" />
            </div>
          </div>
        </div>

        {/* Flutter AppBar */}
        <header className="px-5 py-3 flex items-center justify-between border-b border-white/5 bg-[#0F1016] z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-wide leading-none">
                AI Photo Enhancer
              </h1>
              <span className="text-[10px] text-indigo-400 font-medium tracking-wider">
                Flutter Dark UI v1.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {selectedImage && (
              <button
                onClick={handleReset}
                title="إعادة تعيين / صورة جديدة"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => {
                showSnackBar('تطبيق Flutter مبني بـ Dart ويستخدم http و image_picker', 'info');
              }}
              title="معلومات التطبيق"
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Flutter Body - Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 relative custom-scrollbar">
          
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* 1. مساحة عرض الصورة أو زر الاختيار الافتراضي */}
          <section>
            {!selectedImage ? (
              // Empty State Card
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative h-64 rounded-3xl bg-[#181924] border-2 border-dashed border-indigo-500/30 hover:border-indigo-400/60 transition-all p-5 flex flex-col items-center justify-center text-center cursor-pointer shadow-xl shadow-black/40 overflow-hidden"
              >
                {/* Decorative background grid */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/10">
                  <Upload className="w-7 h-7 text-indigo-400 group-hover:text-indigo-300" />
                </div>

                <h3 className="text-sm font-bold text-white mb-1">
                  اضغط لاختيار صورة من المعرض
                </h3>
                <p className="text-[11px] text-slate-400 max-w-[210px] leading-relaxed mb-4">
                  يدعم صيغ JPG و PNG حتى 15 ميجابايت عبر مكتبة <code className="text-indigo-300 font-mono">image_picker</code>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    المعرض (Gallery)
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    الكاميرا
                  </button>
                </div>
              </div>
            ) : (
              // Selected / Processed Image Display with Comparison Slider
              <div className="relative h-72 rounded-3xl bg-[#181924] border border-white/10 shadow-2xl overflow-hidden group">
                
                {/* Background Checkered pattern for transparency */}
                <div
                  className="absolute inset-0 bg-[#12131c]"
                  style={{
                    backgroundImage:
                      processedResult?.effect === 'remove_bg'
                        ? 'radial-gradient(#2d3047 1px, transparent 1px), radial-gradient(#2d3047 1px, #12131c 1px)'
                        : undefined,
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 8px 8px',
                  }}
                />

                {processedResult ? (
                  // Before/After interactive slider container
                  <div
                    ref={sliderContainerRef}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleMouseDown}
                    className="relative w-full h-full cursor-ew-resize overflow-hidden"
                  >
                    {/* Processed Image (Full background) */}
                    <img
                      src={processedResult.dataUrl}
                      alt="Processed AI"
                      className="w-full h-full object-cover"
                    />

                    {/* Original Image (Clipped overlay) */}
                    <div
                      className="absolute inset-y-0 left-0 overflow-hidden"
                      style={{ width: `${sliderPos}%` }}
                    >
                      <img
                        src={selectedImage}
                        alt="Original"
                        className="h-full object-cover max-w-none"
                        style={{ width: sliderContainerRef.current?.clientWidth || 340 }}
                      />
                    </div>

                    {/* Divider Line */}
                    <div
                      className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)] flex items-center justify-center"
                      style={{ left: `${sliderPos}%` }}
                    >
                      <div className="w-7 h-7 rounded-full bg-white text-indigo-950 flex items-center justify-center shadow-xl font-bold text-xs pointer-events-none">
                        <Sliders className="w-3.5 h-3.5 rotate-90" />
                      </div>
                    </div>

                    {/* Labels */}
                    <div className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-medium text-white border border-white/10 pointer-events-none">
                      الأصل
                    </div>
                    <div className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded-md bg-indigo-600/80 backdrop-blur-sm text-[10px] font-semibold text-white border border-indigo-400/20 pointer-events-none flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      الذكاء الاصطناعي
                    </div>
                  </div>
                ) : (
                  // Original Preview Only
                  <img
                    src={selectedImage}
                    alt="Original"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Top action pill overlay */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-auto">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white text-[11px] font-medium flex items-center gap-1 hover:bg-black/80 transition-colors shadow-lg"
                  >
                    <Upload className="w-3 h-3 text-indigo-300" />
                    تغيير الصورة
                  </button>

                  {processedResult && (
                    <button
                      onClick={handleDownload}
                      className="px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md border border-emerald-400/30 text-white text-[11px] font-semibold flex items-center gap-1 shadow-lg hover:bg-emerald-500 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      حفظ الصورة
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Quick Sample Presets when no image selected */}
            {!selectedImage && (
              <div className="mt-3">
                <span className="text-[11px] text-slate-400 font-medium block mb-1.5">
                  أو جرّب إحدى الصور الجاهزة للاختبار:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {SAMPLE_IMAGES.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleSelectSample(sample.url)}
                      className="group relative rounded-xl overflow-hidden aspect-square border border-white/10 hover:border-indigo-400 transition-all hover:scale-105"
                      title={sample.description}
                    >
                      <img
                        src={sample.url}
                        alt={sample.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 flex items-end p-1">
                        <span className="text-[9px] text-white font-medium truncate leading-tight">
                          {sample.id === 'portrait' ? 'شخصية' : sample.id === 'landscape' ? 'طبيعة' : sample.id === 'pet' ? 'حيوان' : 'نيون'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* 2. الأزرار الثلاثة الرئيسية المطلوبة */}
          <section className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                أدوات الذكاء الاصطناعي (AI Tools)
              </span>
              {!selectedImage && (
                <span className="text-[10px] text-amber-400/90 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  اختر صورة أولاً لتفعيل الأزرار
                </span>
              )}
            </div>

            {/* زر 1: تحسين جودة الصورة (HD) */}
            <button
              disabled={!selectedImage || isLoading}
              onClick={() => runProcess('hd')}
              className={`w-full group p-3 rounded-2xl border transition-all text-right flex items-center gap-3.5 ${
                !selectedImage || isLoading
                  ? 'bg-[#151620]/60 border-white/5 opacity-50 cursor-not-allowed'
                  : 'bg-gradient-to-l from-[#181924] to-[#1f2033] hover:to-[#262840] border-indigo-500/30 hover:border-indigo-500/60 shadow-lg shadow-indigo-950/40 active:scale-[0.98]'
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">
                    تحسين جودة الصورة (HD)
                  </h4>
                  <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    4K AI Upscale
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-snug mt-0.5 truncate">
                  إزالة التغبيش، زيادة الحدة، وتوضيح الملامح والتفاصيل الدقيقة
                </p>
              </div>
            </button>

            {/* زر 2: فلاتر الأنمي والفن الرقمي */}
            <div className="relative">
              <button
                disabled={!selectedImage || isLoading}
                onClick={() => {
                  setShowStyleModal(true);
                }}
                className={`w-full group p-3 rounded-2xl border transition-all text-right flex items-center gap-3.5 ${
                  !selectedImage || isLoading
                    ? 'bg-[#151620]/60 border-white/5 opacity-50 cursor-not-allowed'
                    : 'bg-gradient-to-l from-[#181924] to-[#251829] hover:to-[#2e1d33] border-pink-500/30 hover:border-pink-500/60 shadow-lg shadow-pink-950/40 active:scale-[0.98]'
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-pink-600/30 shrink-0 group-hover:scale-105 transition-transform">
                  <Palette className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">
                      فلاتر الأنمي والفن الرقمي
                    </h4>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                      {animeStyle === 'shinkai' ? 'Shinkai' : animeStyle === 'ghibli' ? 'Ghibli' : 'Cyberpunk'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug mt-0.5 truncate">
                    تحويل الصورة إلى رسم أنمي سينمائي أو فن رقمي نيون
                  </p>
                </div>
              </button>

              {/* Style selector popup inside simulator */}
              {showStyleModal && (
                <div className="absolute inset-x-0 bottom-full mb-2 bg-[#1b1c2b] border border-pink-500/40 rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-pink-300">اختر نمط الأنمي:</span>
                    <button
                      onClick={() => setShowStyleModal(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                    {[
                      { id: 'shinkai', label: 'ماكوتو شينكاي', desc: 'سماء وألوان حالمة' },
                      { id: 'ghibli', label: 'استوديو غيبلي', desc: 'ألوان مائية دافئة' },
                      { id: 'cyberpunk', label: 'سايبر بانك', desc: 'إضاءات نيون مشعة' },
                    ].map((style) => (
                      <button
                        key={style.id}
                        onClick={() => {
                          setAnimeStyle(style.id as any);
                        }}
                        className={`p-2 rounded-xl text-center border text-[10px] transition-all ${
                          animeStyle === style.id
                            ? 'bg-pink-600/30 border-pink-400 text-white font-bold'
                            : 'bg-black/20 border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="font-bold">{style.label}</div>
                        <div className="text-[8px] opacity-75">{style.desc}</div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setShowStyleModal(false);
                      runProcess('anime');
                    }}
                    className="w-full py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    تطبيق الفلتر الآن
                  </button>
                </div>
              )}
            </div>

            {/* زر 3: إزالة الخلفية */}
            <button
              disabled={!selectedImage || isLoading}
              onClick={() => runProcess('remove_bg')}
              className={`w-full group p-3 rounded-2xl border transition-all text-right flex items-center gap-3.5 ${
                !selectedImage || isLoading
                  ? 'bg-[#151620]/60 border-white/5 opacity-50 cursor-not-allowed'
                  : 'bg-gradient-to-l from-[#181924] to-[#16252d] hover:to-[#1a2e38] border-cyan-500/30 hover:border-cyan-500/60 shadow-lg shadow-cyan-950/40 active:scale-[0.98]'
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-cyan-600/30 shrink-0 group-hover:scale-105 transition-transform">
                <Scissors className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">
                    إزالة الخلفية الذكية
                  </h4>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    PNG Cutout
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-snug mt-0.5 truncate">
                  عزل العنصر الأساسي وتفريغ الخلفية بدقة فائقة
                </p>
              </div>
            </button>
          </section>

          {/* Developer Testing Controls Toggle */}
          <div className="pt-2">
            <div className="p-2.5 rounded-xl bg-[#141520] border border-white/5 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                سيرفر الـ AI: <span className="text-slate-300 font-mono">متصل</span>
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={isSimulateError}
                  onChange={(e) => setIsSimulateError(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                />
                <span className={isSimulateError ? 'text-rose-400 font-bold' : ''}>
                  محاكاة خطأ شبكي
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* CircularProgressIndicator Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="w-full max-w-[280px] bg-[#181924] border border-indigo-500/40 rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl shadow-indigo-950/80">
              
              {/* Flutter styled CircularProgressIndicator */}
              <div className="relative w-14 h-14 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
                <div className="w-full h-full rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
              </div>

              <h3 className="text-sm font-bold text-white mb-1.5">
                جاري المعالجة بالذكاء الاصطناعي
              </h3>
              <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
                {loadingStep}
              </p>

              {/* Progress bar simulation */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full animate-pulse w-3/4" />
              </div>
              <span className="text-[9px] text-slate-400 font-mono">
                HTTP POST multipart/form-data
              </span>
            </div>
          </div>
        )}

        {/* Flutter Floating SnackBar Overlay */}
        {snackBar && (
          <div className="absolute bottom-5 inset-x-4 z-50 animate-in slide-in-from-bottom-5 duration-200">
            <div
              className={`p-3 rounded-xl shadow-2xl flex items-center justify-between gap-2.5 text-xs text-white border ${
                snackBar.type === 'error'
                  ? 'bg-rose-950/90 border-rose-500/50 shadow-rose-950/50'
                  : snackBar.type === 'success'
                  ? 'bg-emerald-950/90 border-emerald-500/50 shadow-emerald-950/50'
                  : 'bg-slate-900/90 border-slate-700 shadow-black/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {snackBar.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                ) : snackBar.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                )}
                <span className="text-[11px] font-medium leading-snug line-clamp-2">
                  {snackBar.message}
                </span>
              </div>

              {snackBar.actionLabel && (
                <button
                  onClick={() => {
                    snackBar.onAction?.();
                    setSnackBar(null);
                  }}
                  className="px-2 py-1 rounded bg-white/20 hover:bg-white/30 text-[10px] font-bold text-white shrink-0 uppercase tracking-wider"
                >
                  {snackBar.actionLabel}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Home Indicator bar */}
        <div className="h-4 flex items-center justify-center bg-[#0F1016]">
          <div className="w-32 h-1 bg-white/20 rounded-full" />
        </div>
      </div>
    </div>
  );
};
