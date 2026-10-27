(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم بناء وتطوير التطبيقات — Build Workspace
   * ══════════════════════════════════════════
   */

  const root = root_element.querySelector("[data-erp-dashboard]");
  const content = root_element.querySelector("[data-dashboard-content]");
  const statsSection = root_element.querySelector("[data-stats-section]");
  const quickActions = root_element.querySelector("[data-quick-actions]");
  const footerEl = root_element.querySelector("[data-dashboard-footer]");

  if (!root || !content) return;

  const langValue =
    window.frappe?.boot?.lang ||
    window.frappe?.boot?.user?.language ||
    document.documentElement.lang || "en";

  const isArabic = String(langValue).toLowerCase().startsWith("ar");

  /* ─────────────────────────────────────────
     ١. أزرار البدء السريع (Get started)
  ───────────────────────────────────────── */

  const quickActionButtons = [
    { labelEn: "DocType", labelAr: "نوع المستند", doctype: "DocType", hasCount: true, color: "#1e40af" },
    { labelEn: "Customize Form", labelAr: "تخصيص النموذج", doctype: "Customize Form", isSingle: true, color: "#64748b" },
    { labelEn: "Report", labelAr: "تقرير", doctype: "Report", hasCount: true, color: "#0891b2" },
    { labelEn: "Client Script", labelAr: "نص برمجي للعميل", doctype: "Client Script", hasCount: true, color: "#7c3aed" },
    { labelEn: "Server Script", labelAr: "نص برمجي للخادم", doctype: "Server Script", hasCount: true, color: "#f59e0b" },
    { labelEn: "Print Format Builder", labelAr: "منشئ قوالب الطباعة", route: "print-format-builder", color: "#64748b" },
    { labelEn: "System Settings", labelAr: "إعدادات النظام", doctype: "System Settings", isSingle: true, color: "#64748b" }
  ];

  /* ─────────────────────────────────────────
     ٢. هيكل الأقسام والبطاقات (مطابق تماماً للصورة)
  ───────────────────────────────────────── */

  const sections = [
    [
      "Components to build your app",
      [
        [
          "Models",
          "🧩",
          [
            "DocType",
            "Workflow"
          ]
        ],
        [
          "Views",
          "👁️",
          [
            "Report",
            "Print Format",
            "Workspace",
            "Dashboard",
            "Dashboard Chart"
          ]
        ],
        [
          "Customization",
          "🎨",
          [
            "Customize Form",
            "Custom Field",
            "Custom Translation",
            "Navbar Settings"
          ]
        ],
        [
          "Scripting",
          "💻",
          [
            "Server Script",
            "Client Script",
            "Scheduled Job Type"
          ]
        ],
        [
          "Modules",
          "📦",
          [
            "Module Def",
            "Module Onboarding"
          ]
        ],
        [
          "Packages",
          "📁",
          [
            "Package",
            "Package Import"
          ]
        ],
        [
          "System Logs",
          "📋",
          [
            "Background Jobs",
            "Scheduled Jobs Logs",
            "Error Logs",
            "Communication Logs",
            "Activity Log"
          ]
        ]
      ]
    ]
  ];

  /* ─────────────────────────────────────────
     ٣. أنواع المستندات الفردية والشجرية والتقارير
  ───────────────────────────────────────── */

  const singleDocs = new Set([
    "Customize Form",
    "System Settings",
    "Navbar Settings"
  ]);

  const treeDocs = new Set([]);

  // لا توجد تقارير عرض بيانات مخرجة هنا
  const reportNames = new Set([]);

  const customRoutes = {
    "Print Format Builder": ["print-format-builder"],
    "Background Jobs": ["background_jobs"]
  };

  /* ─────────────────────────────────────────
     ٤. الترجمات العربية
  ───────────────────────────────────────── */

  const arabicFallback = {
    "Get started": "ابدأ الآن",
    "Components to build your app": "مكونات بناء التطبيق",

    "Models": "النماذج",
    "DocType": "نوع المستند",
    "Workflow": "سير العمل",

    "Views": "العروض",
    "Report": "تقرير",
    "Print Format": "قالب الطباعة",
    "Workspace": "مساحة العمل",
    "Dashboard": "لوحة المعلومات",
    "Dashboard Chart": "رسم بياني للوحة المعلومات",

    "Customization": "التخصيص",
    "Customize Form": "تخصيص النموذج",
    "Custom Field": "حقل مخصص",
    "Custom Translation": "ترجمة مخصصة",
    "Navbar Settings": "إعدادات شريط التنقل",

    "Scripting": "البرمجة والتطوير",
    "Server Script": "نص برمجي للخادم",
    "Client Script": "نص برمجي للعميل",
    "Scheduled Job Type": "نوع المهمة المجدولة",

    "Modules": "الوحدات والموديولات",
    "Module Def": "تعريف الوحدة",
    "Module Onboarding": "تهيئة الوحدة",

    "Packages": "الحزم والتطبيقات",
    "Package": "الحزمة",
    "Package Import": "استيراد الحزم",

    "System Logs": "سجلات النظام",
    "Background Jobs": "المهام في الخلفية",
    "Scheduled Jobs Logs": "سجلات المهام المجدولة",
    "Error Logs": "سجلات الأخطاء",
    "Communication Logs": "سجلات الاتصالات والمراسلات",
    "Activity Log": "سجل نشاط المستخدمين",

    "Print Format Builder": "منشئ قوالب الطباعة",
    "System Settings": "إعدادات النظام"
  };

  /* ─────────────────────────────────────────
     ٥. أوصاف المستندات والإعدادات (مع خطوات تفصيلية)
  ───────────────────────────────────────── */

  const itemDescriptions = {
    "DocType": {
      icon: "🧩",
      summaryAr: "إنشاء وهيكلة أنواع المستندات والجداول والحقول وقواعد الصلاحيات التي تبنى عليها موديولات وتطبيقات النظام.",
      summaryEn: "Create and structure DocTypes, database tables, custom fields, and role permissions powering system apps.",
      stepsAr: ["إنشاء DocType جديد وتحديد الوحدة التابع لها", "إضافة الحقول وتحديد أنواعها (نص، رقم، رابط، جدول)", "ضبط الصلاحيات وقواعد التسمية وحفظ وتحديث المخطط"],
      stepsEn: ["Create new DocType and assign parent module", "Add fields and designate types (Data, Link, Table, Select)", "Configure permissions, naming rules, and save schema"]
    },
    "Workflow": {
      icon: "⚡",
      summaryAr: "بناء مسارات العمل وسلاسل الموافقات والاعتمادات للمستندات (مثل الفواتير وطلبات الصرف) قبل ترحيلها النهائي.",
      summaryEn: "Approval workflow engine: define sequential authorization hierarchies and submit policies per document.",
      stepsAr: ["اختيار المستند المراد إنشاء دورة اعتماد له (مثل طلب شراء)", "تحديد حالات المستند بالتسلسل (مسودة، مراجعة، اعتماد، رفض)", "تحديد الموظفين والأدوار المخولة بالاعتماد في كل مرحلة وتفعيل المسار"],
      stepsEn: ["Select target document for multi-level approval", "Map sequential workflow states (Draft, Pending Approval, Approved, Rejected)", "Assign authorized role permissions per transition and activate"]
    },

    "Report": {
      icon: "📊",
      summaryAr: "تصميم وبناء التقارير التحليلية المخصصة باستخدام محرر الاستعلامات SQL أو تقارير السكربت البرمجية المتقدمة.",
      summaryEn: "Design and build customized analytical reports using SQL query builder or advanced Python Script Reports.",
      stepsAr: ["إنشاء سجل تقرير جديد واختيار نوع المستند الأساسي", "كتابة استعلام SQL أو تحديد حقول التقرير التجميعية", "تحديد أعمدة التقرير والفلاتر وتجربة تشغيل التقرير وحفظه"],
      stepsEn: ["Create new Report and select reference DocType", "Write SQL query or specify aggregation fields", "Define report columns, filters, test run, and save"]
    },
    "Print Format": {
      icon: "📑",
      summaryAr: "سجل وإدارة كافة قوالب الطباعة المعتمدة في النظام، مع إمكانية تحرير الأكواد المتقدمة عبر Jinja وHTML/CSS.",
      summaryEn: "Central repository of all custom and standard print templates with Jinja and HTML/CSS customization support.",
      stepsAr: ["فتح قالب الطباعة وتحديد المستند التابع له", "تعديل التنسيقات البرمجية أو استخدام المحرر المرئي", "تعيين القالب كافتراضي لطباعة فواتير وسندات المنشأة"],
      stepsEn: ["Select existing print format or create new entry", "Edit custom HTML/Jinja layout for precision requirements", "Set format as default for organization transactions"]
    },
    "Workspace": {
      icon: "🖥️",
      summaryAr: "تصميم وتنظيم صفحات مساحات العمل Desk Workspaces والشاشات المخصصة للموظفين وإدارة الروابط والبطاقات.",
      summaryEn: "Design and customize desk workspace portals, managing shortcuts, charts, cards, and user navigation.",
      stepsAr: ["إنشاء أو تعديل مساحة عمل واختيار الأيقونة واللون", "ترتيب البطاقات والأقسام والروابط السريعة", "تحديد أدوار الموظفين المصرح لهم بعرض مساحة العمل وحفظها"],
      stepsEn: ["Create or edit workspace, setting icon and title", "Organize sections, shortcuts, and analytical charts", "Configure role permissions and publish workspace"]
    },
    "Dashboard": {
      icon: "📈",
      summaryAr: "تجميع الرسوم البيانية ومؤشرات الأداء والمخططات التحليلية في لوحات متابعة مرئية موحدة للإدارة العليا.",
      summaryEn: "Aggregate charts, KPIs, and operational trends into unified visual executive dashboards.",
      stepsAr: ["إنشاء لوحة معلومات جديدة وتحديد عنوانها ومجالها", "إضافة الرسوم البيانية وبطاقات الأرقام والمؤشرات", "حفظ اللوحة ومشاركتها مع المستخدمين المعنيين"],
      stepsEn: ["Create dashboard profile and specify business domain", "Add analytical charts and KPI number cards", "Save dashboard and assign viewing permissions"]
    },
    "Dashboard Chart": {
      icon: "📊",
      summaryAr: "إنشاء الرسوم البيانية الإحصائية (أعمدة، خطوط، دوائر) لمتابعة المبيعات والمصروفات والأداء التشغيلي.",
      summaryEn: "Build statistical chart visualizations (bar, line, donut) tracking sales, expenses, and KPIs.",
      stepsAr: ["إنشاء رسم بياني وتحديد المستند المصدر وطريقة الحساب", "اختيار نوع المخطط (أعمدة، دائري، بياني خطي)", "معاينة الرسم البياني وتضمينه في مساحات العمل"],
      stepsEn: ["Create new chart and select source DocType and metrics", "Choose visualization chart type (Bar, Line, Pie)", "Preview render and link to target workspaces"]
    },

    "Customize Form": {
      icon: "🛠️",
      summaryAr: "تخصيص نماذج شاشات النظام القياسية؛ إضافة وتعديل الحقول، التحكم في الإلزامية، وتغيير التسميات بدون كود.",
      summaryEn: "Customize standard system forms: add fields, modify field properties, change labels, and set mandatory rules without coding.",
      stepsAr: ["اختيار نوع المستند المطلوب تخصيصه من القائمة", "تعديل خصائص الحقول (إلزامي، مخفي، قراءة فقط) أو إضافة حقول", "الضغط على زر «تحديث» لتطبيق التعديلات فوراً على النموذج"],
      stepsEn: ["Select destination DocType form to customize", "Update field attributes (mandatory, hidden, read-only) or add rows", "Click 'Update' to apply changes immediately across desk"]
    },
    "Custom Field": {
      icon: "➕",
      summaryAr: "إدارة الحقول المخصصة التي تمت إضافتها على شاشات النظام مع إمكانية تصديرها وترحيلها بين البيئات.",
      summaryEn: "Manage all user-defined custom fields injected into system forms with exportable fixture support.",
      stepsAr: ["إنشاء حقل مخصص وتحديد المستند وموقع الحقل", "تحديد نوع بيانات الحقل (نص، تاريخ، قائمة منسدلة)", "حفظ الحقل لإظهاره مباشرة في نموذج المستند المختار"],
      stepsEn: ["Create custom field, select target DocType and insert position", "Define data fieldtype (Data, Date, Select, Currency)", "Save field to reflect dynamically on the target form"]
    },
    "Custom Translation": {
      icon: "🌐",
      summaryAr: "تعديل وتخصيص الترجمات والمسميات العربية والإنجليزية لشاشات وحقول النظام بما يلائم مصطلحات المنشأة.",
      summaryEn: "Override and refine system terms and UI translations to match enterprise enterprise terminology.",
      stepsAr: ["إدخال النص الأصلي باللغة الإنجليزية", "إدخال الترجمة العربية البديلة المعتمدة للمنشأة", "حفظ السجل وتحديث الصفحة لمشاهدة التسمية الجديدة فوراً"],
      stepsEn: ["Enter original source English string", "Provide approved Arabic localized term", "Save translation and refresh desk to view update"]
    },
    "Navbar Settings": {
      icon: "🧭",
      summaryAr: "تخصيص شريط التنقل العلوي للواجهة؛ الشعار، الروابط المباشرة، القوائم المنسدلة، وأزرار المساعدة.",
      summaryEn: "Customize desk top navigation navbar: brand logo, direct quick links, dropdowns, and help menu.",
      stepsAr: ["رفع الشعار المخصص لشريط التنقل العلوي", "إضافة أو إعادة ترتيب روابط التنقل والقوائم المنسدلة", "حفظ الإعدادات لتحديث شريط التنقل لكافة المستخدمين"],
      stepsEn: ["Upload custom brand logo for top navigation bar", "Configure direct link items and dropdown menus", "Save settings to refresh top navbar across desk"]
    },

    "Server Script": {
      icon: "🐍",
      summaryAr: "كتابة نصوص برمجية بلغة Python تعمل على الخادم؛ لتطبيق قواعد تحقق معقدة، حسابات تلقائية، أو واجهات API.",
      summaryEn: "Write Python scripts executing securely on server: custom business validation, calculations, and custom APIs.",
      stepsAr: ["تحديد نوع السكربت (حدث مستند Document Event أو واجهة API)", "اختيار المستند والحدث المشغل (قبل الحفظ، عند الترحيل)", "كتابة كود البايثون وتجربته وتفعيل السكربت"],
      stepsEn: ["Choose script type (Document Event or API endpoint)", "Select reference DocType and trigger hook (before_save, on_submit)", "Write Python logic in sandbox editor and save to enable"]
    },
    "Client Script": {
      icon: "📜",
      summaryAr: "كتابة نصوص برمجية بلغة JavaScript تعمل داخل متصفح المستخدم للتحكم في تفاعل الشاشات والحسابات اللحظية.",
      summaryEn: "Write client-side JavaScript scripts executing in desk browser for interactive UI behaviors and dynamic field updates.",
      stepsAr: ["اختيار نوع المستند المراد كتابة الكود له", "كتابة دوال الجافاسكربت للتفاعل مع حقول النموذج", "حفظ وتفعيل السكربت لتطبيقه مباشرة على متصفحات المستخدمين"],
      stepsEn: ["Select target DocType form for scripting", "Write JavaScript event handlers using frappe.ui.form.on", "Save and enable script to run in desk client"]
    },
    "Scheduled Job Type": {
      icon: "⏱️",
      summaryAr: "جدولة المهام البرمجية التلقائية وتحديد مواعيد تشغيلها الدورية (كل دقيقة، كل ساعة، يومياً، أسبوعياً).",
      summaryEn: "Cron and scheduled task manager: define background job frequencies (hourly, daily, monthly) and methods.",
      stepsAr: ["اختيار الدالة البرمجية المراد جدولتها للتشغيل التلقائي", "تحديد التردد الزمني (يومي، أسبوعي) أو صيغة Cron", "تفعيل المهمة ومتابعة سجلات تنفيذها دورياً"],
      stepsEn: ["Designate python method to execute automatically", "Set recurring schedule frequency or custom cron expression", "Enable scheduled job and monitor background logs"]
    },

    "Module Def": {
      icon: "📦",
      summaryAr: "تعريف وإدارة وحدات وموديولات النظام (Modules) وتحديد الحزم والتطبيقات البرمجية التابعة لها.",
      summaryEn: "Master module registry: configure functional modules and link them to parent custom apps.",
      stepsAr: ["إدخال اسم الوحدة الجديدة والتطبيق التابعة له", "تحديد أيقونة الوحدة ومساحة العمل الافتراضية", "حفظ تعريف الوحدة لاستخدامها في تصنيف المستندات"],
      stepsEn: ["Enter module name and link to installed app", "Assign module icon and default workspace", "Save definition to categorize system DocTypes"]
    },
    "Module Onboarding": {
      icon: "🚀",
      summaryAr: "بناء وتصميم مسارات التهيئة والتوجيه التفاعلية لإرشاد المستخدمين الجدد خلال الخطوات الأولى للموديول.",
      summaryEn: "Build interactive onboarding checklists and guided tours for new users exploring application modules.",
      stepsAr: ["اختيار الوحدة وتحديد خطوات التهيئة المطلوبة", "ربط كل خطوة بالإجراء أو المستند المناسب", "حفظ وتفعيل المسار ليظهر للمستخدمين عند أول دخول"],
      stepsEn: ["Select target module and map onboarding steps", "Link each step to relevant action, form, or guide", "Save and activate guided tour for new users"]
    },

    "Package": {
      icon: "📁",
      summaryAr: "تجميع شاشات ومستندات وسكربتات وقوالب طباعة النظام في حزمة برمجية موحدة جاهزة للتصدير.",
      summaryEn: "Bundle DocTypes, scripts, print formats, and custom fields into a portable deployable package.",
      stepsAr: ["إنشاء حزمة جديدة وتحديد الاسم والإصدار", "إضافة المستندات والسكربتات والتخصيصات التابعة للحزمة", "حفظ الحزمة لتجهيزها للتصدير والنقل"],
      stepsEn: ["Create new package profile and define version", "Add related DocTypes, scripts, and customizations", "Save package bundle ready for deployment"]
    },
    "Package Import": {
      icon: "📥",
      summaryAr: "استيراد وتثبيت الحزم والتطبيقات المخصصة ومزامنة مكوناتها وشاشاتها البرمجية في النظام.",
      summaryEn: "Import and deploy pre-built application packages, installing custom DocTypes and features seamlessly.",
      stepsAr: ["رفع ملف الحزمة البرمجية المضغوطة للنظام", "فحص المكونات والتحقق من التوافقية وعدم التعارض", "بدء عملية الاستيراد وتأكيد تثبيت المكونات بنجاح"],
      stepsEn: ["Upload packaged application bundle archive", "Review package components and verify dependencies", "Trigger import execution and confirm installation"]
    },

    "Background Jobs": {
      icon: "⚙️",
      summaryAr: "لوحة مراقبة المهام التي تنفذ في الخلفية؛ متابعة طوابير المعالجة (الافتراضية، القصيرة، الطويلة) وحالات الإنجاز.",
      summaryEn: "Real-time background worker queue monitor: observe active RQ workers, pending jobs, and completion statuses.",
      stepsAr: ["فتح شاشة المهام في الخلفية لمتابعة طوابير العمل", "مراقبة المهام الجارية والتحقق من انتهاء المعالجة", "إعادة تشغيل أو إلغاء المهام المعلقة في حال التعثر"],
      stepsEn: ["Open background jobs desk page to view worker queues", "Monitor running tasks and check completion timestamps", "Retry failed jobs or purge stalled queue items"]
    },
    "Scheduled Jobs Logs": {
      icon: "📋",
      summaryAr: "سجل العمليات التاريخية للمهام المجدولة؛ توثيق أوقات التنفيذ، مدة الاستغراق، وحالات النجاح والفشل.",
      summaryEn: "Execution history ledger of scheduled tasks documenting run times, execution duration, and outcomes.",
      stepsAr: ["استعراض السجل لمراجعة المهام المجدولة المنفذة حديثاً", "التحقق من حالة كل مهمة (ناجحة، فاشلة)", "فحص مدة التنفيذ وتفاصيل الأخطاء في حال الفشل"],
      stepsEn: ["Review log records of recently executed cron jobs", "Verify status per task (Completed, Failed)", "Inspect execution duration and trace logs"]
    },
    "Error Logs": {
      icon: "🚨",
      summaryAr: "السجل التقني المركزي لتتبع الأخطاء البرمجية ورسائل الاستثناءات Tracebacks لتسريع التشخيص وحل المشاكل.",
      summaryEn: "Central error and exception log recording full system tracebacks for immediate diagnosis and debugging.",
      stepsAr: ["فتح سجل الأخطاء واستعراض أحدث الأخطاء المسجلة", "قراءة تفاصيل رسالة الخطأ والمسار البرمجي المتسبب", "تحديد سبب الخلل وتصحيحه لتفادي تكرار الخطأ"],
      stepsEn: ["Open Error Log list to inspect recently caught errors", "Read detailed Python/JS traceback message", "Identify root cause and resolve underlying issue"]
    },
    "Communication Logs": {
      icon: "✉️",
      summaryAr: "سجل توثيق كافة المراسلات الصادرة والواردة؛ رسائل البريد الإلكتروني، إشعارات النظام، وحالات التسليم.",
      summaryEn: "Audit log of all inbound and outbound email correspondence, system alerts, and delivery statuses.",
      stepsAr: ["استعراض السجل لمتابعة الإيميلات والمراسلات المرسلة", "التحقق من حالة تسليم الرسائل للعملاء والمستخدمين", "إعادة إرسال الرسائل التي تعثر تسليمها"],
      stepsEn: ["Review sent email communications and alerts", "Check delivery status (Sent, Opened, Bounced)", "Resend failed emails and verify email server connection"]
    },
    "Activity Log": {
      icon: "👁️",
      summaryAr: "سجل التدقيق الشامل لنشاط المستخدمين؛ توثيق عمليات تسجيل الدخول، تعديل وحذف السجلات، وأوقات النشاط.",
      summaryEn: "Comprehensive security audit trail tracking user logins, document views, edits, and deletions with timestamps.",
      stepsAr: ["فتح سجل النشاط لمتابعة حركات المستخدمين في النظام", "البحث والتصفية حسب المستخدم أو نوع العملية أو التاريخ", "مراجعة التفاصيل لضمان الامتثال والرقابة الداخلية"],
      stepsEn: ["Open Activity Log to monitor system user transactions", "Filter entries by specific user, action type, or date range", "Review operational audit trail for governance compliance"]
    },

    "Print Format Builder": {
      icon: "📐",
      summaryAr: "أداة السحب والإفلات المرئية لتصميم قوالب طباعة الفواتير والسندات بدون كتابة كود برمجى.",
      summaryEn: "Visual drag-and-drop designer to structure clean print templates for invoices, orders, and receipts.",
      stepsAr: ["اختيار نوع المستند المطلوب تصميم قالبه", "سحب وإفلات الحقول وجداول البنود في الترويسة والوسط", "معاينة القالب وحفظه وتعيينه كقالب طباعة افتراضي"],
      stepsEn: ["Select destination DocType to format", "Drag and drop fields, tables, labels, and company branding", "Preview rendering and set as primary print format"]
    },
    "System Settings": {
      icon: "⚙️",
      summaryAr: "الإعدادات التقنية المركزية للنظام؛ لغة النظام الافتراضية، المنطقة الزمنية، سياسات كلمات المرور، ونسق التاريخ.",
      summaryEn: "System-wide foundational settings: default language, timezone, password policies, date/time formats, and session timeouts.",
      stepsAr: ["اختيار اللغة الافتراضية (العربية) والمنطقة الزمنية", "تحديد صيغة التاريخ والوقت المفضلة للمنشأة", "ضبط سياسات أمان كلمات المرور ومدة انتهاء الجلسات وحفظ الإعدادات"],
      stepsEn: ["Set system default language and timezone", "Select standard date and number formatting conventions", "Configure password complexity rules, session timeouts, and save"]
    }
  };

  /* ─────────────────────────────────────────
     ٦. دوال الترجمة والتهريب
  ───────────────────────────────────────── */

  function translate(key) {
    if (!isArabic) return key;
    return arabicFallback[key] || (typeof window.__ === "function" ? window.__(key) : key);
  }

  function escapeHtml(text) {
    if (!text) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatNumber(value) {
    const num = Number(value) || 0;
    return num.toLocaleString(isArabic ? "ar-SA" : "en-US");
  }

  /* ─────────────────────────────────────────
     ٧. نافذة التفاصيل المنبثقة (Info Modal القياسية)
  ───────────────────────────────────────── */

  function showInfoModal(itemName) {
    const desc = itemDescriptions[itemName];
    const title = isArabic ? (translate(itemName) || itemName) : itemName;
    const isSettingDoc = singleDocs.has(itemName) || itemName.toLowerCase().includes("settings");

    const summary = desc
      ? (isArabic ? desc.summaryAr : desc.summaryEn)
      : (isArabic ? ("إدارة ومتابعة " + title + " وتنفيذ العمليات المرتبطة بها.") : ("Manage and track " + itemName + "."));
    const rawSteps = desc ? (isArabic ? desc.stepsAr : desc.stepsEn) : null;
    const steps = (Array.isArray(rawSteps) && rawSteps.length > 0)
      ? rawSteps
      : (isArabic
          ? [
              "فتح شاشة " + title,
              "إدخال وتعبئة البيانات الأساسية المطلوبة",
              "مراجعة وتدقيق الحقول والتحقق من صحتها",
              "حفظ السجل واعتماد المستند"
            ]
          : [
              "Open " + itemName,
              "Fill in the required information and fields",
              "Review and verify mandatory values",
              "Save and submit the record"
            ]);

    const existing = root.querySelector(".erp-modal-overlay") || document.querySelector(".erp-modal-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.className = "erp-modal-overlay";
    overlay.setAttribute("dir", isArabic ? "rtl" : "ltr");

    const launchLabel = isSettingDoc
      ? (isArabic ? "فتح شاشة الإعدادات" : "Open Settings")
      : (isArabic ? "فتح الشاشة" : "Open Screen");

    overlay.innerHTML = `
      <div class="erp-modal-box">
        <button type="button" class="erp-modal-close" data-modal-close aria-label="${isArabic ? "إغلاق" : "Close"}">✕</button>
        <div class="erp-modal-header">
          <span class="erp-modal-icon">${desc?.icon || "⚙️"}</span>
          <h3 class="erp-modal-title">${escapeHtml(title)}</h3>
        </div>
        <p class="erp-modal-summary">${escapeHtml(summary)}</p>

        <div class="erp-modal-steps is-shown" data-modal-steps>
          <ol class="erp-modal-steps-list">
            ${steps.map(s => `<li>${escapeHtml(s)}</li>`).join("")}
          </ol>
        </div>

        <div style="margin-top: 18px;">
          <button
            type="button"
            class="erp-quick-btn"
            data-modal-launch
            style="width: 100%; min-height: 42px;"
          >
            <span class="erp-quick-label">${escapeHtml(launchLabel)}</span>
          </button>
        </div>
      </div>
    `;

    root.appendChild(overlay);
    setTimeout(() => overlay.classList.add("is-visible"), 10);

    const closeModal = () => {
      overlay.classList.remove("is-visible");
      setTimeout(() => overlay.remove(), 280);
    };

    const closeBtn = overlay.querySelector("[data-modal-close]");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    overlay.addEventListener("click", e => {
      if (e.target === overlay) closeModal();
    });

    const launchBtn = overlay.querySelector("[data-modal-launch]");
    if (launchBtn) {
      launchBtn.addEventListener("click", () => {
        closeModal();
        openRoute(itemName);
      });
    }
  }

  /* ─────────────────────────────────────────
     ٨. إنشاء أزرار الوصول السريع
  ───────────────────────────────────────── */

  function renderQuickActions() {
    if (!quickActions) return;

    const title = isArabic ? "ابدأ الآن" : "Get started";

    quickActions.innerHTML = `
      <h2 class="erp-section-title">${escapeHtml(title)}</h2>
      <div class="erp-quick-grid">
        ${quickActionButtons.map((btn, idx) => {
          const label = isArabic ? btn.labelAr : btn.labelEn;
          return `
            <button
              type="button"
              class="erp-quick-btn"
              data-shortcut-idx="${idx}"
              style="display: flex; align-items: center; justify-content: space-between; padding: 12px 18px;"
            >
              <span class="erp-quick-label" style="display: flex; align-items: center; gap: 8px;">
                <span>${escapeHtml(label)}</span>
                <span class="erp-link-arrow" aria-hidden="true" style="font-size: 11px; opacity: 0.7;">↗</span>
              </span>
              ${btn.hasCount ? `<span class="erp-stat-badge" data-badge-for="${escapeHtml(btn.doctype)}" style="margin-left: 8px; margin-right: 8px; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: rgba(30, 64, 175, 0.12); color: #1e40af;">...</span>` : ""}
            </button>`;
        }).join("")}
      </div>
    `;

    // جلب أعداد المستندات للأزرار
    quickActionButtons.forEach(btn => {
      if (btn.hasCount && btn.doctype && window.frappe) {
        frappe.call({
          method: "frappe.client.get_count",
          args: { doctype: btn.doctype },
          callback: r => {
            const el = quickActions.querySelector(`[data-badge-for="${btn.doctype}"]`);
            if (el) el.textContent = formatNumber(r.message || 0);
          },
          error: () => {
            const el = quickActions.querySelector(`[data-badge-for="${btn.doctype}"]`);
            if (el) el.textContent = "0";
          }
        });
      }
    });

    quickActions.addEventListener("click", event => {
      const btnEl = event.target.closest("[data-shortcut-idx]");
      if (!btnEl || !window.frappe) return;
      const idx = Number(btnEl.dataset.shortcutIdx);
      const item = quickActionButtons[idx];
      if (!item) return;

      if (item.route) {
        frappe.set_route(item.route);
        return;
      }
      if (item.doctype) {
        openRoute(item.doctype);
      }
    });
  }

  /* ─────────────────────────────────────────
     ٩. إنشاء بطاقات الوحدات والمربعات
  ───────────────────────────────────────── */

  function renderSections() {
    root.setAttribute("dir", isArabic ? "rtl" : "ltr");
    root.classList.toggle("erp-dashboard-rtl", isArabic);

    content.innerHTML = sections
      .map((section, sectionIndex) => {
        const sectionName = section[0];
        const sectionCards = section[1];

        const cardsHtml = sectionCards
          .map((card, cardIndex) => {
            const cardName = card[0];
            const icon = card[1];
            const items = card[2];

            const linksHtml = items.map(itemName => {
              const desc = itemDescriptions[itemName];
              const isReport = reportNames.has(itemName);
              const detailsLabel = isArabic ? "تفاصيل" : "Details";
              const infoBtn = (!isReport && desc)
                ? `<button type="button" class="erp-info-link" data-info-item="${escapeHtml(itemName)}">${detailsLabel}</button>`
                : "";

              return `
                <div class="erp-link-row">
                  <button type="button" class="erp-link" data-route-name="${escapeHtml(itemName)}">
                    <span class="erp-link-text">${escapeHtml(translate(itemName))}</span>
                    <span class="erp-link-arrow" aria-hidden="true">${isArabic ? "←" : "→"}</span>
                  </button>
                  ${infoBtn}
                </div>`;
            }).join("");

            return `
              <article class="erp-card tone-${(sectionIndex + cardIndex) % 5}" data-erp-card>
                <button type="button" class="erp-card-heading" data-card-toggle aria-expanded="false">
                  <span class="erp-icon" aria-hidden="true">${icon}</span>
                  <span class="erp-card-title">${escapeHtml(translate(cardName))}</span>
                  <span class="erp-card-chevron" aria-hidden="true">⌄</span>
                </button>
                <div class="erp-card-links">${linksHtml}</div>
              </article>`;
          }).join("");

        return `
          <section class="erp-module-section">
            <h2 class="erp-section-title">${escapeHtml(translate(sectionName))}</h2>
            <div class="erp-dashboard-grid">${cardsHtml}</div>
          </section>`;
      }).join("");
  }

  /* ─────────────────────────────────────────
     ١٠. إنشاء الفوتر
  ───────────────────────────────────────── */

  const footerInfo = {
    phone: "920033198",
    email: "apps@mubtkir.com",
    website: "www.mubtkir.com",
    labels: {
      phoneAr: "الهاتف الموحد",
      phoneEn: "Support Phone",
      emailAr: "البريد الإلكتروني",
      emailEn: "Email Support",
      websiteAr: "الموقع الإلكتروني",
      websiteEn: "Official Website"
    }
  };

  function renderFooter() {
    if (!footerEl) return;
    const labels = footerInfo.labels;
    const phoneLabel = isArabic ? labels.phoneAr : labels.phoneEn;
    const emailLabel = isArabic ? labels.emailAr : labels.emailEn;
    const websiteLabel = isArabic ? labels.websiteAr : labels.websiteEn;

    footerEl.innerHTML = `
      <div class="erp-footer-inner">
        <div class="erp-footer-item">
          <span class="erp-footer-icon">📞</span>
          <span class="erp-footer-label">${escapeHtml(phoneLabel)}:</span>
          <a href="tel:${footerInfo.phone}" class="erp-footer-link" dir="ltr">${escapeHtml(footerInfo.phone)}</a>
        </div>
        <span class="erp-footer-sep">|</span>
        <div class="erp-footer-item">
          <span class="erp-footer-icon">✉️</span>
          <span class="erp-footer-label">${escapeHtml(emailLabel)}:</span>
          <a href="mailto:${footerInfo.email}" class="erp-footer-link">${escapeHtml(footerInfo.email)}</a>
        </div>
        <span class="erp-footer-sep">|</span>
        <div class="erp-footer-item">
          <span class="erp-footer-icon">🌐</span>
          <span class="erp-footer-label">${escapeHtml(websiteLabel)}:</span>
          <a href="https://${footerInfo.website}" class="erp-footer-link" target="_blank" rel="noopener">${escapeHtml(footerInfo.website)}</a>
        </div>
      </div>`;
  }

  /* ─────────────────────────────────────────
     ١١. التوجيه وفتح الشاشات داخل النظام
  ───────────────────────────────────────── */

  function openRoute(name) {
    if (!window.frappe || typeof frappe.set_route !== "function") return;
    if (customRoutes[name]) {
      frappe.set_route(customRoutes[name]);
      return;
    }
    if (reportNames.has(name)) {
      frappe.set_route("query-report", name);
      return;
    }
    if (singleDocs.has(name)) {
      frappe.set_route("Form", name);
      return;
    }
    if (treeDocs.has(name)) {
      frappe.set_route("Tree", name);
      return;
    }
    frappe.set_route("List", name);
  }

  /* ─────────────────────────────────────────
     ١٢. معالجة الأحداث والضغط
  ───────────────────────────────────────── */

  let lastToggleTime = 0;

  content.addEventListener("click", event => {
    const infoBtn = event.target.closest("[data-info-item]");
    if (infoBtn) {
      event.preventDefault();
      event.stopPropagation();
      showInfoModal(infoBtn.dataset.infoItem);
      return;
    }

    const link = event.target.closest("[data-route-name]");
    if (link) {
      event.preventDefault();
      openRoute(link.dataset.routeName);
      return;
    }

    const toggle = event.target.closest("[data-card-toggle]");
    if (toggle) {
      const now = Date.now();
      if (now - lastToggleTime < 300) return;
      lastToggleTime = now;

      const card = toggle.closest("[data-erp-card]");
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      if (card) {
        card.classList.toggle("is-collapsed", expanded);
      }
    }
  });

  /* ─────────────────────────────────────────
     ١٣. بدء التشغيل
  ───────────────────────────────────────── */

  renderQuickActions();
  renderSections();
  renderFooter();
})();
