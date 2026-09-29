/**
 * Flutter Production Code Data for AI Photo Enhancer
 * Includes main.dart, pubspec.yaml, AndroidManifest.xml, Info.plist, and Backend API sample.
 */

export const FLUTTER_MAIN_DART = `import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  // قفل اتجاه الشاشة عمودياً لضمان تجربة مستخدم مثالية
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  runApp(const AiPhotoEnhancerApp());
}

/// التطبيق الرئيسي مع واجهة داكنة عصرية (Modern Dark Mode)
class AiPhotoEnhancerApp extends StatelessWidget {
  const AiPhotoEnhancerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AI Photo Enhancer',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.dark,
      darkTheme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F1016),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366F1), // Indigo
          brightness: Brightness.dark,
          primary: const Color(0xFF6366F1),
          secondary: const Color(0xFF06B6D4), // Cyan
          tertiary: const Color(0xFFEC4899), // Pink
          surface: const Color(0xFF181924),
          surfaceContainer: const Color(0xFF232536),
          onSurface: const Color(0xFFE2E8F0),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0F1016),
          elevation: 0,
          centerTitle: true,
          titleTextStyle: TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
          ),
        ),
        cardTheme: CardTheme(
          color: const Color(0xFF181924),
          elevation: 8,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: BorderSide(
              color: Colors.white.withOpacity(0.08),
              width: 1,
            ),
          ),
        ),
      ),
      home: const HomeScreen(),
    );
  }
}

/// أنواع عمليات الذكاء الاصطناعي المدعومة في التطبيق
enum AiOperationType {
  enhanceHd,
  animeFilter,
  removeBackground,
}

/// خدمة الاتصال بـ API الذكاء الاصطناعي (Service Layer)
class AiPhotoService {
  // استبدل هذا الرابط بنقطة النهاية (Endpoint) الخاصة بخادمك
  // ملاحظة: لمستخدمي محاكي أندرويد (Android Emulator) استخدم http://10.0.2.2:8000
  static const String baseUrl = 'https://api.aiphotoenhancer.example.com/v1';

  /// إرسال الصورة لمعالجة الـ HD
  static Future<Uint8List> enhanceImageHd(File imageFile) async {
    return await _uploadAndProcess(
      endpoint: '/enhance/hd',
      imageFile: imageFile,
      extraFields: {'quality_scale': '4x', 'denoise': 'true'},
    );
  }

  /// إرسال الصورة لتطبيق فلاتر الأنمي والفن الرقمي
  static Future<Uint8List> applyAnimeFilter(File imageFile, {String style = 'shinkai'}) async {
    return await _uploadAndProcess(
      endpoint: '/filters/anime',
      imageFile: imageFile,
      extraFields: {'style': style, 'strength': '0.85'},
    );
  }

  /// إرسال الصورة لإزالة الخلفية
  static Future<Uint8List> removeBackground(File imageFile) async {
    return await _uploadAndProcess(
      endpoint: '/cutout/remove-bg',
      imageFile: imageFile,
      extraFields: {'format': 'png', 'feather': 'true'},
    );
  }

  /// الدالة المشتركة لإرسال طلب HTTP POST Multipart
  static Future<Uint8List> _uploadAndProcess({
    required String endpoint,
    required File imageFile,
    Map<String, String>? extraFields,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl$endpoint');
      final request = http.MultipartRequest('POST', uri);

      // إضافة ترويسات الطلب (Headers)
      request.headers.addAll({
        'Accept': 'image/png, image/jpeg, application/json',
        // 'Authorization': 'Bearer YOUR_AI_API_TOKEN_HERE',
      });

      // إضافة الصورة كملف Multipart
      final multipartFile = await http.MultipartFile.fromPath(
        'image',
        imageFile.path,
      );
      request.files.add(multipartFile);

      // إضافة أي معاملات إضافية
      if (extraFields != null) {
        request.fields.addAll(extraFields);
      }

      // إرسال الطلب مع تحديد مهلة زمنية 45 ثانية
      final streamedResponse = await request.send().timeout(
        const Duration(seconds: 45),
        onTimeout: () {
          throw TimeoutException('انتهت مهلة انتظار استجابة الخادم. يرجى المحاولة لاحقاً.');
        },
      );

      final response = await http.Response.fromStream(streamedResponse);

      // فحص كود الحالة (Status Code)
      if (response.statusCode == 200) {
        // التأكد من أن الاستجابة هي بيانات الصورة الثنائية
        if (response.bodyBytes.isNotEmpty) {
          return response.bodyBytes;
        } else {
          throw Exception('استلم التطبيق استجابة فارغة من خادم الذكاء الاصطناعي.');
        }
      } else if (response.statusCode == 400) {
        throw Exception('صيغة الصورة غير مدعومة أو الحجم غير صالح.');
      } else if (response.statusCode == 413) {
        throw Exception('حجم الصورة كبير جداً. الحد الأقصى المسموح به هو 15 ميجابايت.');
      } else if (response.statusCode == 429) {
        throw Exception('تجاوزت الحد المسموح للطلبات. انتظر دقيقة ثم حاول مجدداً.');
      } else {
        String serverError = 'رمز الخطأ: \${response.statusCode}';
        try {
          final jsonMap = jsonDecode(response.body);
          if (jsonMap is Map && jsonMap.containsKey('message')) {
            serverError = jsonMap['message'];
          }
        } catch (_) {}
        throw Exception('فشلت المعالجة: $serverError');
      }
    } on SocketException {
      throw Exception('تعذر الاتصال بالإنترنت. يرجى التحقق من اتصال الشبكة.');
    } on TimeoutException catch (e) {
      throw Exception(e.message ?? 'انتهت المهلة الزمنية للطلب.');
    } catch (e) {
      // إعادة رمي الخطأ ليتم التعامل معه في الواجهة
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }
}

/// الشاشة الرئيسية لتطبيق AI Photo Enhancer
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  File? _selectedImage;
  Uint8List? _processedImageBytes;
  bool _isLoading = false;
  String _loadingMessage = 'جاري المعالجة...';
  AiOperationType? _currentOperation;
  double _sliderPosition = 0.5; // لمقارنة قبل وبعد
  bool _showComparison = false;

  final ImagePicker _picker = ImagePicker();
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  /// اختيار صورة من معرض الهاتف
  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? pickedFile = await _picker.pickImage(
        source: source,
        maxWidth: 2048,
        maxHeight: 2048,
        imageQuality: 92,
      );

      if (pickedFile != null) {
        setState(() {
          _selectedImage = File(pickedFile.path);
          _processedImageBytes = null; // إعادة تعيين الصورة المعالجة السابقة
          _showComparison = false;
        });
        _showCustomSnackBar(
          'تم اختيار الصورة بنجاح! يمكنك الآن تجربة الفلاتر.',
          isSuccess: true,
        );
      }
    } catch (e) {
      _showCustomSnackBar(
        'حدث خطأ أثناء الوصول إلى المعرض: \${e.toString()}',
        isError: true,
      );
    }
  }

  /// تنفيذ عملية الذكاء الاصطناعي المحددة
  Future<void> _handleProcess(AiOperationType operation) async {
    if (_selectedImage == null) {
      _showCustomSnackBar('يرجى اختيار صورة أولاً للمتابعة!', isError: true);
      return;
    }

    setState(() {
      _isLoading = true;
      _currentOperation = operation;
      switch (operation) {
        case AiOperationType.enhanceHd:
          _loadingMessage = 'جاري تحسين الدقة وإزالة التشويش (HD)...';
          break;
        case AiOperationType.animeFilter:
          _loadingMessage = 'جاري تطبيق فلتر الأنمي والفن الرقمي...';
          break;
        case AiOperationType.removeBackground:
          _loadingMessage = 'جاري عزل وتفريغ الخلفية بدقة ذكية...';
          break;
      }
    });

    try {
      Uint8List result;
      switch (operation) {
        case AiOperationType.enhanceHd:
          result = await AiPhotoService.enhanceImageHd(_selectedImage!);
          break;
        case AiOperationType.animeFilter:
          result = await AiPhotoService.applyAnimeFilter(_selectedImage!);
          break;
        case AiOperationType.removeBackground:
          result = await AiPhotoService.removeBackground(_selectedImage!);
          break;
      }

      if (mounted) {
        setState(() {
          _processedImageBytes = result;
          _isLoading = false;
          _showComparison = true;
        });

        _showCustomSnackBar(
          'تمت معالجة الصورة بنجاح عبر الذكاء الاصطناعي!',
          isSuccess: true,
        );
      }
    } catch (error) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });

        _showCustomSnackBar(
          error.toString().replaceAll('Exception: ', ''),
          isError: true,
          actionLabel: 'إعادة المحاولة',
          onAction: () => _handleProcess(operation),
        );
      }
    }
  }

  /// إظهار رسائل SnackBar مخصصة وعصرية
  void _showCustomSnackBar(
    String message, {
    bool isError = false,
    bool isSuccess = false,
    String? actionLabel,
    VoidCallback? onAction,
  }) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              isError
                  ? Icons.error_outline_rounded
                  : isSuccess
                      ? Icons.check_circle_outline_rounded
                      : Icons.info_outline_rounded,
              color: Colors.white,
              size: 22,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
        backgroundColor: isError
            ? const Color(0xFFEF4444)
            : isSuccess
                ? const Color(0xFF10B981)
                : const Color(0xFF3B82F6),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.all(16),
        duration: const Duration(seconds: 4),
        action: (actionLabel != null && onAction != null)
            ? SnackBarAction(
                label: actionLabel,
                textColor: Colors.white,
                onPressed: onAction,
              )
            : null,
      ),
    );
  }

  /// إعادة تعيين واستبدال الصورة
  void _resetImage() {
    setState(() {
      _selectedImage = null;
      _processedImageBytes = null;
      _showComparison = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final hasImage = _selectedImage != null;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF6366F1), Color(0xFF06B6D4)],
                ),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.auto_awesome, size: 18, color: Colors.white),
            ),
            const SizedBox(width: 10),
            const Text('AI Photo Enhancer'),
          ],
        ),
        actions: [
          if (hasImage)
            IconButton(
              icon: const Icon(Icons.refresh_rounded),
              tooltip: 'صورة جديدة',
              onPressed: _isLoading ? null : _resetImage,
            ),
        ],
      ),
      body: Stack(
        children: [
          // الخلفية مع توهج نيون ناعم
          Positioned(
            top: -100,
            right: -80,
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF6366F1).withOpacity(0.12),
              ),
            ),
          ),
          Positioned(
            bottom: -50,
            left: -50,
            child: Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF06B6D4).withOpacity(0.10),
              ),
            ),
          ),

          // المحتوى الرئيسي
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // 1. مساحة عرض الصورة أو زر الاختيار الافتراضي
                  _buildImagePreviewArea(),

                  const SizedBox(height: 24),

                  // عنوان القسم
                  Row(
                    children: [
                      Icon(
                        Icons.tune_rounded,
                        size: 20,
                        color: hasImage ? const Color(0xFF6366F1) : Colors.grey,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'أدوات الذكاء الاصطناعي',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: hasImage ? Colors.white : Colors.grey[600],
                        ),
                      ),
                      const Spacer(),
                      if (!hasImage)
                        Text(
                          'اختر صورة للتفعيل',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[500],
                          ),
                        ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // 2. الأزرار الثلاثة الرئيسية
                  // زر 1: تحسين جودة الصورة (HD)
                  _buildActionButton(
                    title: 'تحسين جودة الصورة (HD)',
                    subtitle: 'زيادة الدقة إلى 4K، توضيح التفاصيل، وإزالة التغبيش',
                    icon: Icons.hd_rounded,
                    gradientColors: const [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                    isEnabled: hasImage && !_isLoading,
                    onTap: () => _handleProcess(AiOperationType.enhanceHd),
                  ),

                  const SizedBox(height: 12),

                  // زر 2: فلاتر الأنمي والفن الرقمي
                  _buildActionButton(
                    title: 'فلاتر الأنمي والفن الرقمي',
                    subtitle: 'تحويل صورتك إلى رسم كرتوني ياباني بلمسة سينمائية',
                    icon: Icons.palette_rounded,
                    gradientColors: const [Color(0xFFEC4899), Color(0xFFF43F5E)],
                    isEnabled: hasImage && !_isLoading,
                    onTap: () => _handleProcess(AiOperationType.animeFilter),
                  ),

                  const SizedBox(height: 12),

                  // زر 3: إزالة الخلفية
                  _buildActionButton(
                    title: 'إزالة الخلفية الذكية',
                    subtitle: 'تفريغ الخلفية بدقة عالية واستخراج العنصر بدقة PNG',
                    icon: Icons.content_cut_rounded,
                    gradientColors: const [Color(0xFF06B6D4), Color(0xFF0EA5E9)],
                    isEnabled: hasImage && !_isLoading,
                    onTap: () => _handleProcess(AiOperationType.removeBackground),
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),

          // مؤشر التحميل المتراكب (Overlay Loading Indicator)
          if (_isLoading) _buildLoadingOverlay(),
        ],
      ),
    );
  }

  /// مساحة عرض الصورة المحددة أو زر الاختيار الافتراضي
  Widget _buildImagePreviewArea() {
    final hasImage = _selectedImage != null;

    if (!hasImage) {
      // الزر الافتراضي الجذاب لاختيار الصورة
      return GestureDetector(
        onTap: () => _pickImage(ImageSource.gallery),
        child: Container(
          height: 320,
          decoration: BoxDecoration(
            color: const Color(0xFF181924),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: const Color(0xFF6366F1).withOpacity(0.3),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF6366F1).withOpacity(0.08),
                blurRadius: 20,
                spreadRadius: 2,
              ),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // أيقونة متوهجة
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [
                      const Color(0xFF6366F1).withOpacity(0.2),
                      const Color(0xFF06B6D4).withOpacity(0.2),
                    ],
                  ),
                ),
                child: const Icon(
                  Icons.add_photo_alternate_rounded,
                  size: 40,
                  color: Color(0xFF818CF8),
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'اضغط لاختيار صورة من المعرض',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'يدعم صيغ JPG، PNG حتى 15 ميجابايت',
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.grey[400],
                ),
              ),
              const SizedBox(height: 24),
              // أزرار سريعة للمعرض أو الكاميرا
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  ElevatedButton.icon(
                    onPressed: () => _pickImage(ImageSource.gallery),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF6366F1),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    ),
                    icon: const Icon(Icons.photo_library_rounded, size: 18),
                    label: const Text('المعرض'),
                  ),
                  const SizedBox(width: 12),
                  OutlinedButton.icon(
                    onPressed: () => _pickImage(ImageSource.camera),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.grey[300],
                      side: BorderSide(color: Colors.white.withOpacity(0.2)),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    ),
                    icon: const Icon(Icons.camera_alt_rounded, size: 18),
                    label: const Text('الكاميرا'),
                  ),
                ],
              ),
            ],
          ),
        ),
      );
    }

    // عرض الصورة عند اختيارها مع دعم المقارنة (قبل / بعد)
    return Container(
      height: 360,
      decoration: BoxDecoration(
        color: const Color(0xFF181924),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: Colors.white.withOpacity(0.1),
        ),
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        fit: StackFit.expand,
        children: [
          // إذا تمت المعالجة، نعرض مقارنة قبل وبعد أو النتيجة المعالجة
          if (_processedImageBytes != null)
            _buildComparisonSlider()
          else
            Image.file(
              _selectedImage!,
              fit: BoxFit.cover,
            ),

          // شريط أدوات علوي شفاف فوق الصورة
          Positioned(
            top: 12,
            right: 12,
            left: 12,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // زر تغيير الصورة
                InkWell(
                  onTap: () => _pickImage(ImageSource.gallery),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.65),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white.withOpacity(0.15)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.edit_rounded, size: 14, color: Colors.white),
                        SizedBox(width: 6),
                        Text('تغيير', style: TextStyle(fontSize: 12, color: Colors.white)),
                      ],
                    ),
                  ),
                ),

                // شارة الحالة (أصلية أو تمت المعالجة)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: _processedImageBytes != null
                        ? const Color(0xFF10B981).withOpacity(0.85)
                        : Colors.black.withOpacity(0.65),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        _processedImageBytes != null
                            ? Icons.check_circle_rounded
                            : Icons.image_rounded,
                        size: 14,
                        color: Colors.white,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        _processedImageBytes != null ? 'معالجة بالذكاء الاصطناعي' : 'الصورة الأصلية',
                        style: const TextStyle(fontSize: 12, color: Colors.white),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// عارض تفاعلي لمقارنة الصورة الأصلية بالصورة المعالجة (Before / After Slider)
  Widget _buildComparisonSlider() {
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        final splitX = width * _sliderPosition;

        return GestureDetector(
          onHorizontalDragUpdate: (details) {
            setState(() {
              _sliderPosition = (details.localPosition.dx / width).clamp(0.05, 0.95);
            });
          },
          child: Stack(
            fit: StackFit.expand,
            children: [
              // الصورة المعالجة (الطبقة السفلية)
              Image.memory(
                _processedImageBytes!,
                fit: BoxFit.cover,
              ),

              // الصورة الأصلية (مقصوصة حسب موضع المقارنة)
              ClipRect(
                clipper: SliderClipper(splitX),
                child: Image.file(
                  _selectedImage!,
                  fit: BoxFit.cover,
                ),
              ),

              // خط الفاصل الرأسي مع زر السحب
              Positioned(
                left: splitX - 1.5,
                top: 0,
                bottom: 0,
                child: Container(
                  width: 3,
                  color: Colors.white,
                  child: Center(
                    child: Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.4),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.compare_arrows_rounded,
                        size: 20,
                        color: Color(0xFF0F1016),
                      ),
                    ),
                  ),
                ),
              ),

              // علامات التوضيح
              Positioned(
                bottom: 12,
                left: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.6),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    'الأصل',
                    style: TextStyle(color: Colors.white, fontSize: 11),
                  ),
                ),
              ),
              Positioned(
                bottom: 12,
                right: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF6366F1).withOpacity(0.85),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    'الذكاء الاصطناعي',
                    style: TextStyle(color: Colors.white, fontSize: 11),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  /// ويدجت زر مخصص للعمليات الرئيسية
  Widget _buildActionButton({
    required String title,
    required String subtitle,
    required IconData icon,
    required List<Color> gradientColors,
    required bool isEnabled,
    required VoidCallback onTap,
  }) {
    return AnimatedOpacity(
      duration: const Duration(milliseconds: 250),
      opacity: isEnabled ? 1.0 : 0.45,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isEnabled ? onTap : null,
          borderRadius: BorderRadius.circular(18),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF181924),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: isEnabled
                    ? gradientColors.first.withOpacity(0.35)
                    : Colors.white.withOpacity(0.06),
                width: 1,
              ),
              boxShadow: isEnabled
                  ? [
                      BoxShadow(
                        color: gradientColors.first.withOpacity(0.12),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ]
                  : [],
            ),
            child: Row(
              children: [
                // مربع الأيقونة المتدرجة
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(14),
                    gradient: LinearGradient(
                      colors: isEnabled
                          ? gradientColors
                          : [Colors.grey[800]!, Colors.grey[900]!],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  child: Icon(
                    icon,
                    color: Colors.white,
                    size: 26,
                  ),
                ),
                const SizedBox(width: 16),
                // النصوص
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: isEnabled ? Colors.white : Colors.grey[400],
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        subtitle,
                        style: TextStyle(
                          fontSize: 12,
                          color: isEnabled ? Colors.grey[400] : Colors.grey[600],
                          height: 1.3,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                // سهم الانتقال
                Icon(
                  Icons.arrow_forward_ios_rounded,
                  size: 16,
                  color: isEnabled ? Colors.grey[400] : Colors.grey[700],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// شاشة التحميل المتراكبة أثناء المعالجة
  Widget _buildLoadingOverlay() {
    return Container(
      color: Colors.black.withOpacity(0.75),
      child: Center(
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 32),
          padding: const EdgeInsets.all(28),
          decoration: BoxDecoration(
            color: const Color(0xFF181924),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: const Color(0xFF6366F1).withOpacity(0.4),
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF6366F1).withOpacity(0.2),
                blurRadius: 30,
                spreadRadius: 2,
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // مؤشر التحميل الدائري
              SizedBox(
                width: 60,
                height: 60,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    CircularProgressIndicator(
                      strokeWidth: 4,
                      valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF6366F1)),
                      backgroundColor: Colors.white.withOpacity(0.1),
                    ),
                    const Icon(
                      Icons.auto_awesome,
                      color: Color(0xFF06B6D4),
                      size: 24,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'الذكاء الاصطناعي يعمل الآن',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                _loadingMessage,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.grey[400],
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// كلاس مساعد لقص الصورة في أداة المقارنة
class SliderClipper extends CustomClipper<Rect> {
  final double splitX;
  SliderClipper(this.splitX);

  @override
  Rect getClip(Size size) {
    return Rect.fromLTRB(0, 0, splitX, size.height);
  }

  @override
  bool shouldReclip(CustomClipper<Rect> oldClipper) => true;
}
`;

export const FLUTTER_PUBSPEC_YAML = `name: ai_photo_enhancer
description: "تطبيق موبايل متطور لتحسين الصور وتطبيق فلاتر الأنمي وإزالة الخلفيات بالذكاء الاصطناعي"
publish_to: 'none'

version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

  # مكتبة اختيار الصور من المعرض والكاميرا
  image_picker: ^1.1.2

  # مكتبة إرسال طلبات الـ HTTP Multipart إلى خادم الذكاء الاصطناعي
  http: ^1.2.2

  # مكتبة للتعامل مع مسارات الملفات والتخزين
  path_provider: ^2.1.4

  # أيقونات Cupertino لنظام iOS
  cupertino_icons: ^1.0.8

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

flutter:
  uses-material-design: true

  # إذا أردت تضمين صور أو خطوط محلية:
  # assets:
  #   - assets/images/
  #   - assets/icons/
`;

export const ANDROID_MANIFEST_XML = `<!-- مسار الملف: android/app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- أذونات الاتصال بالإنترنت لإرسال الصور إلى سيرفر الـ AI -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- أذونات قراءة الصور من المعرض لنظام Android 13 وما بعده (API 33+) -->
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

    <!-- أذونات قراءة وكتابة الصور للإصدارات الأقدم (Android 12 فما دون) -->
    <uses-permission 
        android:name="android.permission.READ_EXTERNAL_STORAGE" 
        android:maxSdkVersion="32" />
    <uses-permission 
        android:name="android.permission.WRITE_EXTERNAL_STORAGE" 
        android:maxSdkVersion="28" />

    <!-- إذن الكاميرا عند اختيار التقاط صورة جديدة -->
    <uses-permission android:name="android.permission.CAMERA" />

    <application
        android:label="AI Photo Enhancer"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher"
        android:requestLegacyExternalStorage="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:taskAffinity=""
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            
            <meta-data
              android:name="io.flutter.embedding.android.NormalTheme"
              android:resource="@style/NormalTheme" />
            
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>

        <meta-data
            android:name="flutterEmbedding"
            android:value="2" />
    </application>
</manifest>`;

export const IOS_INFO_PLIST = `<!-- مسار الملف: ios/Runner/Info.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>$(DEVELOPMENT_LANGUAGE)</string>
    <key>CFBundleDisplayName</key>
    <string>AI Photo Enhancer</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>ai_photo_enhancer</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>$(FLUTTER_BUILD_NAME)</string>
    <key>CFBundleSignature</key>
    <string>????</string>
    <key>CFBundleVersion</key>
    <string>$(FLUTTER_BUILD_NUMBER)</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>

    <!-- سبب طلب الوصول إلى معرض الصور (إلزامي لموافقة Apple App Store) -->
    <key>NSPhotoLibraryUsageDescription</key>
    <string>يحتاج التطبيق للوصول إلى معرض الصور لاختيار الصورة التي ترغب في تحسينها وتطبيق فلاتر الذكاء الاصطناعي عليها.</string>
    
    <!-- سبب طلب الوصول إلى الكاميرا -->
    <key>NSCameraUsageDescription</key>
    <string>يحتاج التطبيق للوصول إلى الكاميرا لالتقاط صورة جديدة ومعالجتها فوراً.</string>
    
    <!-- حفظ الصورة في المعرض بعد المعالجة -->
    <key>NSPhotoLibraryAddUsageDescription</key>
    <string>يحتاج التطبيق إلى إذن حفظ الصور المعدلة بدقة عالية في معرض هاتفك.</string>

    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    <key>UIMainStoryboardFile</key>
    <string>Main</string>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
    </array>
</dict>
</plist>`;

export const BACKEND_SAMPLE_API = `# مسار الملف: server_example.py (FastAPI / Python)
# مثال لخادم المعالجة الذي يستقبل طلب الـ Multipart من تطبيق Flutter
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import Response
import io

app = FastAPI(title="AI Photo Enhancer API")

@app.post("/v1/enhance/hd")
async def enhance_hd(
    image: UploadFile = File(...),
    quality_scale: str = Form("4x"),
    denoise: str = Form("true")
):
    """استقبال الصورة وتحسين جودتها إلى HD باستخدام موديل الذكاء الاصطناعي"""
    contents = await image.read()
    
    if len(contents) > 15 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="حجم الصورة يتجاوز 15 ميجابايت")
    
    # هنا يتم استدعاء موديل الـ AI (مثل Real-ESRGAN أو GFPGAN أو Gemini Vision)
    enhanced_bytes = process_hd_model(contents)
    
    return Response(content=enhanced_bytes, media_type="image/jpeg")

@app.post("/v1/filters/anime")
async def apply_anime(
    image: UploadFile = File(...),
    style: str = Form("shinkai")
):
    """تحويل الصورة إلى فن الأنمي الياباني"""
    contents = await image.read()
    anime_bytes = process_anime_model(contents, style=style)
    return Response(content=anime_bytes, media_type="image/png")

@app.post("/v1/cutout/remove-bg")
async def remove_bg(
    image: UploadFile = File(...),
    format: str = Form("png")
):
    """إزالة وتفريغ الخلفية بدقة عالية"""
    contents = await image.read()
    cutout_bytes = process_rembg_model(contents)
    return Response(content=cutout_bytes, media_type="image/png")
`;
