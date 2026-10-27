(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم إعدادات النظام الشاملة — ERPNext Settings
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
     ١. إحصائيات الإعدادات العامة
  ───────────────────────────────────────── */

  const statsCards = [
    {
      id: "active-workflows",
      short: "FLOW",
      labelEn: "Active Workflows",
      labelAr: "مسارات العمل النشطة",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "Workflow",
              filters: { is_active: 1 }
            },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "active-notifications",
      short: "NOTIF",
      labelEn: "Notifications",
      labelAr: "قواعد التنبيهات",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "Notification",
              filters: { enabled: 1 }
            },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "print-formats",
      short: "PRINT",
      labelEn: "Print Formats",
      labelAr: "قوالب الطباعة المعتمدة",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: { doctype: "Print Format" },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "email-accounts",
      short: "MAIL",
      labelEn: "Email Inboxes",
      labelAr: "صناديق البريد المربوطة",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: { doctype: "Email Account" },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    }
  ];

  /* ─────────────────────────────────────────
     ٢. أزرار الاختصارات السريعة (Your Shortcuts)
  ───────────────────────────────────────── */

  const quickActionButtons = [
    { doctype: "System Settings", labelEn: "System Settings", labelAr: "إعدادات النظام", isSingle: true },
    { doctype: "Accounts Settings", labelEn: "Accounts Settings", labelAr: "إعدادات الحسابات", isSingle: true },
    { doctype: "Stock Settings", labelEn: "Stock Settings", labelAr: "إعدادات المخزون", isSingle: true },
    { doctype: "Selling Settings", labelEn: "Selling Settings", labelAr: "إعدادات المبيعات", isSingle: true },
    { doctype: "Buying Settings", labelEn: "Buying Settings", labelAr: "إعدادات المشتريات", isSingle: true },
    { doctype: "Global Defaults", labelEn: "Global Defaults", labelAr: "القيم الافتراضية العامة", isSingle: true },
    { doctype: "Print Settings", labelEn: "Print Settings", labelAr: "إعدادات الطباعة", isSingle: true }
  ];

  /* ─────────────────────────────────────────
     ٣. هيكل الأقسام والبطاقات (مطابق تماماً للصورة)
  ───────────────────────────────────────── */

  const sections = [
    [
      "Settings",
      [
        [
          "Module Settings",
          "🏗️",
          [
            "Accounts Settings",
            "Stock Settings",
            "Selling Settings",
            "Buying Settings",
            "Manufacturing Settings",
            "CRM Settings",
            "Projects Settings",
            "Support Settings"
          ]
        ],
        [
          "Email / Notifications",
          "📧",
          [
            "Email Account",
            "Email Domain",
            "Notification",
            "Email Template",
            "Auto Email Report",
            "Newsletter",
            "Notification Settings"
          ]
        ],
        [
          "Website",
          "🌐",
          [
            "Website Settings",
            "Website Theme",
            "Website Script",
            "About Us Settings",
            "Contact Us Settings"
          ]
        ],
        [
          "Core",
          "⚙️",
          [
            "System Settings",
            "Domain Settings",
            "Global Defaults"
          ]
        ],
        [
          "Printing",
          "🖨️",
          [
            "Print Format Builder",
            "Print Settings",
            "Print Format",
            "Print Style"
          ]
        ],
        [
          "Workflow",
          "⚡",
          [
            "Workflow",
            "Workflow State",
            "Workflow Action"
          ]
        ]
      ]
    ]
  ];

  /* ─────────────────────────────────────────
     ٤. أنواع المستندات الفردية والشجرية والتقارير
  ───────────────────────────────────────── */

  const singleDocs = new Set([
    "Accounts Settings",
    "Stock Settings",
    "Selling Settings",
    "Buying Settings",
    "Manufacturing Settings",
    "CRM Settings",
    "Projects Settings",
    "Support Settings",
    "Notification Settings",
    "Website Settings",
    "Website Script",
    "About Us Settings",
    "Contact Us Settings",
    "System Settings",
    "Domain Settings",
    "Global Defaults",
    "Print Settings"
  ]);

  const treeDocs = new Set([]);

  const reportNames = new Set([]);

  /* ─────────────────────────────────────────
     ٥. القاموس اللغوي (عربي / إنجليزي)
  ───────────────────────────────────────── */

  const translations = {
    "Settings": "إعدادات النظام",
    "Module Settings": "إعدادات موديولات النظام",
    "Email / Notifications": "البريد الإلكتروني والإشعارات",
    "Website": "إعدادات الموقع وبوابة الويب",
    "Core": "الإعدادات الأساسية والهوية",
    "Printing": "الطباعة وتنسيق النماذج",
    "Workflow": "مسارات العمل والاعتمادات",

    "Accounts Settings": "إعدادات الحسابات والمالية",
    "Stock Settings": "إعدادات المخزون والمنتجات",
    "Selling Settings": "إعدادات المبيعات والعملاء",
    "Buying Settings": "إعدادات المشتريات والموردين",
    "Manufacturing Settings": "إعدادات التصنيع والإنتاج",
    "CRM Settings": "إعدادات إدارة علاقات العملاء",
    "Projects Settings": "إعدادات المشاريع وتتبع العمل",
    "Support Settings": "إعدادات الدعم الفني وخدمة العملاء",

    "Email Account": "حسابات البريد الإلكتروني",
    "Email Domain": "نطاقات البريد الإلكتروني",
    "Notification": "قواعد التنبيهات التلقائية",
    "Email Template": "قوالب البريد الإلكتروني",
    "Auto Email Report": "التقارير المجدولة عبر البريد",
    "Newsletter": "النشرات الإخبارية",
    "Notification Settings": "إعدادات الإشعارات والتنبيهات",

    "Website Settings": "إعدادات الموقع",
    "Website Theme": "سمات وقوالب الموقع",
    "Website Script": "نصوص جافاسكربت الموقع",
    "About Us Settings": "إعدادات صفحة من نحن",
    "Contact Us Settings": "إعدادات صفحة اتصل بنا",

    "System Settings": "إعدادات النظام العامة",
    "Domain Settings": "إعدادات القطاعات والمجالات",
    "Global Defaults": "القيم الافتراضية العامة",

    "Print Format Builder": "منشئ قوالب الطباعة",
    "Print Settings": "إعدادات الطباعة العامة",
    "Print Format": "قوالب الطباعة المعتمدة",
    "Print Style": "أنماط وتنسيقات الطباعة (CSS)",

    "Workflow": "مسارات العمل والموافقات",
    "Workflow State": "حالات دورة العمل",
    "Workflow Action": "إجراءات واعتمادات دورة العمل"
  };

  /* ─────────────────────────────────────────
     ٦. شروحات وتفاصيل شاشات الإعدادات والتهيئات
  ───────────────────────────────────────── */

  const itemDescriptions = {
    "Accounts Settings": {
      icon: "💰",
      summaryAr: "شاشة ضبط المحاسبة المالية؛ تحديث إقفال الفترات المحاسبية، وتجميد الحسابات السابقة، وسياسات قيود اليومية، والعملة الافتراضية.",
      summaryEn: "Core accounting policies: fiscal year freezing, exchange gain/loss defaults, over-billing allowances, and journal entry controls.",
      stepsAr: ["تحديد الحسابات الافتراضية لفروق العملة والتقريب والضرائب", "ضبط تواريخ تجميد الفترات المحاسبية لمنع التعديل", "تحديد نسب السماح بتجاوز الفوترة وحفظ الإعدادات"],
      stepsEn: ["Configure default variance, round-off, and tax accounts", "Set accounting freeze dates to lock closed fiscal periods", "Define over-billing allowance thresholds and save"]
    },
    "Stock Settings": {
      icon: "📦",
      summaryAr: "شاشة ضبط إدارة المخزون؛ تشمل طريقة تقييم المنتجات (FIFO/المتوسط المرجح)، السماح بالسحب بالسالب، وفترات الجرد.",
      summaryEn: "Inventory valuation methodologies (FIFO/Moving Average), negative stock prevention, and warehouse automation rules.",
      stepsAr: ["اختيار طريقة التقييم الافتراضية لتكلفة المنتجات", "تفعيل أو تعطيل خيار السماح بالمخزون السالب", "ضبط التحقق التلقائي من انتهاء الصلاحية وتتبع الأرقام التسلسلية"],
      stepsEn: ["Select default product valuation method (FIFO or Moving Average)", "Toggle negative stock allowance flag", "Enforce serial number and expiry batch validations"]
    },
    "Selling Settings": {
      icon: "🛍️",
      summaryAr: "شاشة ضبط المبيعات؛ تتيح إلزامية عروض الأسعار وأوامر التسليم قبل الفوترة، وحدود الائتمان، وسياسات الخصم للعملاء.",
      summaryEn: "Sales workflow governance: enforce sales orders/delivery notes before invoicing, customer credit limits, and discount thresholds.",
      stepsAr: ["تحديد سياسة التحقق من الرصيد الائتماني للعميل عند إنشاء المعاملات", "ضبط اشتراط وجود أمر بيع معتمد قبل الفاتورة", "حفظ الإعدادات لتطبيق سياسات البيع المؤسسية"],
      stepsEn: ["Configure customer credit limit enforcement rules", "Set order-to-invoice validation requirements", "Save parameters to enforce organizational sales compliance"]
    },
    "Buying Settings": {
      icon: "🛒",
      summaryAr: "شاشة ضبط المشتريات؛ تشمل اشتراط وجود أوامر شراء معتمدة وإيصالات استلام مخزني للمنتجات قبل تسجيل فاتورة الشراء.",
      summaryEn: "Procurement policies: enforce purchase orders and receipt notes prior to supplier invoice booking, and supplier scoring.",
      stepsAr: ["ضبط إلزامية أوامر الشراء وإيصالات الاستلام المخزني للمنتجات", "تحديد نسبة التسامح في استلام أو فوترة كميات زائدة", "حفظ الإعدادات لضبط الرقابة على المشتريات"],
      stepsEn: ["Enforce 3-way matching between Purchase Order, Receipt, and Invoice", "Define allowable receipt quantity overage tolerance", "Save policies to control purchasing expenditure"]
    },
    "Manufacturing Settings": {
      icon: "🏭",
      summaryAr: "شاشة ضبط التصنيع؛ تتيح ضبط السحب التلقائي للخامات (Backflushing)، نسب الهدر المسموحة للمنتجات، وتحميل التكاليف الصناعية.",
      summaryEn: "Manufacturing rules: raw material backflush automation, allowable scrap tolerances, and capacity planning defaults.",
      stepsAr: ["تحديد سياسة سحب المواد الخام للمنتجات المصنعة", "ضبط نسب التفاوت والهدر المسموح بها في صالة الإنتاج", "حفظ الإعدادات لتطبيقها على كافة أوامر العمل الجديدة"],
      stepsEn: ["Configure raw material consumption policy (manual vs backflush)", "Set allowable component scrap margins", "Save parameters to govern shop-floor work orders"]
    },
    "CRM Settings": {
      icon: "🤝",
      summaryAr: "شاشة ضبط إدارة علاقات العملاء؛ تشمل قواعد التعيين التلقائي للعملاء المحتملين، فترات المتابعة، والتنبيهات الاستباقية.",
      summaryEn: "CRM system settings: automatic lead routing algorithms, interaction cadences, and opportunity stage validations.",
      stepsAr: ["تحديد آلية التعيين التلقائي للعملاء المحتملين على فريق البيع", "ضبط التنبيهات الدورية للفرص غير المتابعة", "حفظ الإعدادات لتحسين كفاءة فريق التسويق والمبيعات"],
      stepsEn: ["Set up automated lead distribution round-robin", "Configure alerts for stalled opportunities", "Save settings to activate responsive sales pipeline"]
    },
    "Projects Settings": {
      icon: "🏗️",
      summaryAr: "شاشة ضبط المشاريع؛ تشمل طريقة احتساب تكلفة المشروع، اشتراط إغلاق المهام، واعتماد سجلات ساعات العمل.",
      summaryEn: "Project governance configuration: timesheet auto-costing, milestone dependencies, and task completion policies.",
      stepsAr: ["تحديد سياسة تحميل التكاليف المباشرة على المشاريع", "ضبط تنبيهات تجاوز الميزانية وساعات العمل المقدرة للمهام", "حفظ الإعدادات لضمان انضباط إدارة المشاريع"],
      stepsEn: ["Define project costing sources (timesheets or purchase expenses)", "Set alerts for task deadline and budget overruns", "Save configuration to enforce project governance"]
    },
    "Support Settings": {
      icon: "🎫",
      summaryAr: "شاشة ضبط الدعم الفني؛ تشمل ربط صندوق البريد الموحد لتوليد التذاكر، واتفاقيات مستوى الخدمة (SLA)، والتصعيد التلقائي.",
      summaryEn: "Helpdesk configuration: incoming support mailbox parsing, default SLAs, and automated escalation workflows.",
      stepsAr: ["ربط البريد الإلكتروني الموحد لاستقبال الشكاوى", "تحديد اتفاقية مستوى الخدمة (SLA) الافتراضية للنظام", "تفعيل التنبيهات التلقائية عند تأخر الرد وحفظ الإعدادات"],
      stepsEn: ["Configure support mailbox for automated ticket parsing", "Set enterprise default Service Level Agreement", "Enable SLA breach escalation triggers and save"]
    },

    "Email Account": {
      icon: "📬",
      summaryAr: "إدارة وتوصيل حسابات البريد الإلكتروني للمؤسسة (SMTP/IMAP) لإرسال الإشعارات واستقبال المعاملات.",
      summaryEn: "Configure company incoming and outgoing email inboxes via SMTP/IMAP protocol.",
      stepsAr: ["إدخال بيانات البريد وكلمة المرور المشفرة", "ضبط خوادم ومنافذ الإرسال والاستقبال", "فحص الاتصال وتفعيل الحساب كبريد افتراضي"],
      stepsEn: ["Enter organizational email address and password", "Configure SMTP and IMAP host ports", "Test connection and set as default sender"]
    },
    "Email Domain": {
      icon: "🌐",
      summaryAr: "تعريف وتوحيد نطاقات وخوادم البريد الإلكتروني للمنشأة لتسهيل ربط حسابات الموظفين تلقائياً.",
      summaryEn: "Standard domain profiles configuring server addresses for corporate Google/Microsoft email.",
      stepsAr: ["إدخال اسم النطاق وعنوان خادم SMTP وIMAP", "تحديد إعدادات الأمان والتشفير (SSL/TLS)", "حفظ النطاق ليرثه أي حساب بريدي جديد"],
      stepsEn: ["Input domain address and server endpoints", "Specify encryption protocols (SSL/TLS)", "Save profile for automated user inbox provisioning"]
    },
    "Notification": {
      icon: "🔔",
      summaryAr: "قواعد تنبيهات وإشعارات النظام التلقائية عبر البريد، أو الإشعارات المباشرة عند وقوع أحداث محددة.",
      summaryEn: "Automated event-triggered system and email notifications for document creation, update, and submission.",
      stepsAr: ["تحديد المستند المستهدف والحدث المحفز للارسال", "تحديد الشروط والمستلمين المعنيين بالتنبيه", "كتابة نص الرسالة وتفعيل قاعدة الإشعار"],
      stepsEn: ["Select triggering DocType and event condition", "Define recipient filters and alert channels", "Draft notification message and activate trigger"]
    },
    "Email Template": {
      icon: "✉️",
      summaryAr: "تصميم قوالب الرسائل البريدية الجاهزة مع دعم المتغيرات الحية للبيانات من فواتير وعقود وعروض أسعار.",
      summaryEn: "Reusable email message layouts with Jinja variables for customer quotes, invoices, and notices.",
      stepsAr: ["تسمية القالب وتحديد موضوع الإيميل الافتراضي", "صياغة نص الرسالة وإدراج الحقول المتغيرة", "حفظ القالب واستخدامه المباشر في المراسلات"],
      stepsEn: ["Title email template and define subject line", "Compose template body with dynamic Jinja variables", "Save template for 1-click dispatch across modules"]
    },
    "Auto Email Report": {
      icon: "📊",
      summaryAr: "أداة جدولة إرسال التقارير المالية والتشغيلية آلياً عبر البريد الإلكتروني بصيغ PDF أو Excel.",
      summaryEn: "Scheduled automated delivery of enterprise reports directly to manager inboxes on recurring cycles.",
      stepsAr: ["اختيار التقرير المطلوب وفلاتر البيانات", "تحديد جدول التكرار (يومي/أسبوعي) وقائمة الإيميلات المستلمة", "حفظ وتفعيل الجدولة لإرسال التقارير آلياً"],
      stepsEn: ["Select report and preset filtering arguments", "Set recurring dispatch schedule and recipient list", "Activate automated PDF/Excel delivery"]
    },
    "Newsletter": {
      icon: "📢",
      summaryAr: "إرسال النشرات البريدية الإخبارية والتسويقية للعملاء والمشتركين مع تتبع نسب المشاهدة والتفاعل.",
      summaryEn: "Broadcast newsletters and product promotion announcements to subscriber databases.",
      stepsAr: ["صياغة محتوى النشرة وموضوعها", "اختيار قائمة البريد الإلكتروني المستهدفة", "إرسال النشرة ومتابعة تقارير القراءة والتفاعل"],
      stepsEn: ["Draft newsletter copy and subject line", "Select designated recipient subscriber group", "Send or schedule dispatch and review delivery metrics"]
    },
    "Notification Settings": {
      icon: "🔕",
      summaryAr: "شاشة التحكم في إشعارات المستخدم؛ تتيح ضبط تفضيلات تلقي التنبيهات الصوتية، تنبيهات البريد، وقنوات التواصل.",
      summaryEn: "User notification preferences: configure email digest frequency, desktop sounds, and alert subscriptions.",
      stepsAr: ["تحديد أنواع الإشعارات المرغوب استقبالها", "تفعيل أو تعطيل التنبيهات عبر البريد الإلكتروني", "حفظ الإعدادات لتطبيق التفضيلات على الحساب"],
      stepsEn: ["Configure subscribed notification categories", "Enable or disable email notification digests", "Save preferences to customize user alert experience"]
    },

    "Website Settings": {
      icon: "🌐",
      summaryAr: "الضبط العام لموقع المنشأة؛ الشعار، اسم الموقع، الروابط العلوية، الفوتر، وسياسات العرض ومحركات البحث.",
      summaryEn: "Global website parameters: corporate logo, title, navigation navbar, footer menus, and SEO defaults.",
      stepsAr: ["رفع الشعار وتحديد اسم الموقع وأيقونة المتصفح", "تهيئة روابط القوائم العلوية والسفلية", "حفظ الإعدادات لتحديث واجهة الموقع الإلكتروني"],
      stepsEn: ["Upload logo and configure site title and favicon", "Set up header navigation menus and footer content", "Save to update live public portal"]
    },
    "Website Theme": {
      icon: "🎨",
      summaryAr: "تخصيص الهوية البصرية والألوان والخطوط وقواعد CSS لموقع الويب وبوابة العملاء الإلكترونية.",
      summaryEn: "Visual theme customization: brand color palettes, fonts, and custom CSS styling for web pages.",
      stepsAr: ["إنشاء سمة مظهر جديدة أو تعديل السمة الحالية", "تحديد الألوان الأساسية ونمط الخطوط المعتمد", "تطبيق السمة كسمة افتراضية للموقع بالكامل"],
      stepsEn: ["Create new theme profile or customize active theme", "Define brand color tokens and typography font families", "Set theme as primary default across website"]
    },
    "Website Script": {
      icon: "📜",
      summaryAr: "إدراج أكواد جافاسكربت مخصصة وأكواد التتبع والتحليل (مثل Google Tag Manager) في ترويسة الموقع.",
      summaryEn: "Custom client-side JavaScript injection for analytics tracking and third-party web integrations.",
      stepsAr: ["إدخال كود التتبع أو النص البرمجي المطلوب", "التحقق من صحة الأكواد وخلوها من الأخطاء", "حفظ وتفعيل النص البرمجي في ترويسة الصفحات"],
      stepsEn: ["Paste analytics or custom script snippet", "Verify code syntax and external dependencies", "Save to inject script across all public web pages"]
    },
    "About Us Settings": {
      icon: "🏢",
      summaryAr: "تهيئة محتوى صفحة «من نحن»؛ نبذة المنشأة، الرؤية والرسالة، أعضاء الفريق، والشهادات والاعتمادات.",
      summaryEn: "Public About Us page manager: corporate bio, vision, mission statement, and leadership team.",
      stepsAr: ["كتابة النص التعريفي ورؤية ورسالة المنشأة", "إضافة بيانات وصور أعضاء فريق القيادة", "حفظ الإعدادات لمزامنة التعديلات على صفحة من نحن"],
      stepsEn: ["Enter company description, mission, and vision statements", "Add key management team members and photos", "Save to publish updates to /about page"]
    },
    "Contact Us Settings": {
      icon: "📞",
      summaryAr: "تهيئة صفحة «اتصل بنا»؛ العناوين، أرقام التواصل، الخريطة التفاعلية، ونموذج إرسال رسائل الزوار.",
      summaryEn: "Contact Us page settings: physical office coordinates, phone/email contacts, and lead capture form.",
      stepsAr: ["إدخال بيانات التواصل الموحدة وموقع المقر على الخريطة", "تفعيل نموذج المراسلة لتلقي طلبات واستفسارات الزوار", "حفظ الإعدادات لتحديث صفحة اتصل بنا بالموقع"],
      stepsEn: ["Configure central phone numbers, address, and map embed", "Enable web contact form to convert inquiries to leads", "Save to publish live contact information"]
    },

    "System Settings": {
      icon: "⚙️",
      summaryAr: "الإعدادات التقنية المركزية للنظام؛ لغة النظام الافتراضية، المنطقة الزمنية، سياسات كلمات المرور، ونسق التاريخ.",
      summaryEn: "System-wide foundational settings: default language, timezone, password policies, date/time formats, and session timeouts.",
      stepsAr: ["اختيار اللغة الافتراضية (العربية) والمنطقة الزمنية", "تحديد صيغة التاريخ والوقت المفضلة للمنشأة", "ضبط سياسات أمان كلمات المرور ومدة انتهاء الجلسات وحفظ الإعدادات"],
      stepsEn: ["Set system default language and timezone", "Select standard date and number formatting conventions", "Configure password complexity rules, session timeouts, and save"]
    },
    "Domain Settings": {
      icon: "🏢",
      summaryAr: "إدارة وتفعيل مجالات وقطاعات العمل (تجارة، تصنيع، خدمات، مقاولات، رعاية صحية) لإظهار الموديولات والوظائف المرتبطة بها.",
      summaryEn: "Industry domain enablement (Manufacturing, Retail, Healthcare, Services) to activate relevant features and DocTypes.",
      stepsAr: ["استعراض قطاعات الأعمال المتاحة في النظام", "تفعيل المجالات التي تنشط فيها المنشأة وتعطيل غير المستخدمة", "حفظ الإعدادات لتحديث القوائم والشاشات بما يناسب نشاطك"],
      stepsEn: ["Review supported enterprise industry domains", "Enable business domains active in your enterprise (e.g. Manufacturing, Retail)", "Save to dynamically show or hide specialized modules"]
    },
    "Global Defaults": {
      icon: "🌐",
      summaryAr: "القيم الافتراضية العامة على مستوى النظام؛ الشركة الافتراضية، السنة المالية النشطة، العملة، وبلد المنشأة.",
      summaryEn: "Enterprise global defaults: default operating company, active fiscal year, country, and base accounting currency.",
      stepsAr: ["اختيار الشركة الافتراضية للمستخدمين الجدد", "تحديد السنة المالية الحالية والبلد (المملكة العربية السعودية)", "تحديد العملة الأساسية للنظام (SAR) وحفظ الإعدادات"],
      stepsEn: ["Designate default enterprise operating company", "Set current active fiscal year and country", "Specify standard system base currency and save"]
    },

    "Print Format Builder": {
      icon: "📐",
      summaryAr: "أداة السحب والإفلات المرئية لتصميم قوالب طباعة الفواتير والسندات بدون كتابة كود برمجى.",
      summaryEn: "Visual drag-and-drop designer to structure clean print templates for invoices, orders, and receipts.",
      stepsAr: ["اختيار نوع المستند المطلوب تصميم قالبه", "سحب وإفلات الحقول وجداول البنود في الترويسة والوسط", "معاينة القالب وحفظه وتعيينه كقالب طباعة افتراضي"],
      stepsEn: ["Select destination DocType to format", "Drag and drop fields, tables, labels, and company branding", "Preview rendering and set as primary print format"]
    },
    "Print Settings": {
      icon: "⚙️",
      summaryAr: "شاشة الضبط العام للطباعة؛ مقاس الورق الافتراضي (A4/حراري)، الهوامش، الخطوط، وتكرار ترويسة الشركة.",
      summaryEn: "Global printing preferences: default paper format, margins, fonts, and letterhead inclusion policies.",
      stepsAr: ["تحديد مقاس الورق الافتراضي ونوع الخط", "ضبط هوامش الصفحة العلوية والسفلية", "تحديد سياسة إظهار ترويسة الشركة وتذييل الصفحة وحفظ الإعدادات"],
      stepsEn: ["Choose default paper dimension (A4, Letter, Thermal)", "Set top, bottom, and side document margins", "Configure letterhead repeating rules and save"]
    },
    "Print Format": {
      icon: "📑",
      summaryAr: "سجل وإدارة كافة قوالب الطباعة المعتمدة في النظام، مع إمكانية تحرير الأكواد المتقدمة عبر Jinja وHTML/CSS.",
      summaryEn: "Central repository of all custom and standard print templates with Jinja and HTML/CSS customization support.",
      stepsAr: ["فتح قالب الطباعة وتحديد المستند التابع له", "تعديل التنسيقات البرمجية أو استخدام المحرر المرئي", "تعيين القالب كافتراضي لطباعة فواتير وسندات المنشأة"],
      stepsEn: ["Select existing print format or create new entry", "Edit custom HTML/Jinja layout for precision requirements", "Set format as default for organization transactions"]
    },
    "Print Style": {
      icon: "🎨",
      summaryAr: "ملفات أنماط وتنسيقات CSS الموحدة التي تفرض هوية بصرية وألوان وخطوط موحدة على كافة مخرجات الطباعة.",
      summaryEn: "Global CSS print stylesheets dictating typography, borders, and color schemes across all system printouts.",
      stepsAr: ["إنشاء نمط طباعة جديد وإضافة أكواد الـ CSS", "تحديد الخطوط وألوان العناوين وتنسيقات الجداول", "تطبيق النمط على قوالب الطباعة المختارة"],
      stepsEn: ["Create print style entry and write custom CSS", "Define corporate fonts, table borders, and header colors", "Link stylesheet to target print formats"]
    },

    "Workflow": {
      icon: "⚡",
      summaryAr: "بناء مسارات العمل وسلاسل الموافقات والاعتمادات للمستندات (مثل الفواتير وطلبات الصرف) قبل ترحيلها النهائي.",
      summaryEn: "Approval workflow engine: define sequential authorization hierarchies and submit policies per document.",
      stepsAr: ["اختيار المستند المراد إنشاء دورة اعتماد له (مثل طلب شراء)", "تحديد حالات المستند بالتسلسل (مسودة، مراجعة، اعتماد، رفض)", "تحديد الموظفين والأدوار المخولة بالاعتماد في كل مرحلة وتفعيل المسار"],
      stepsEn: ["Select target document for multi-level approval", "Map sequential workflow states (Draft, Pending Approval, Approved, Rejected)", "Assign authorized role permissions per transition and activate"]
    },
    "Workflow State": {
      icon: "🔄",
      summaryAr: "تعريف وتوحيد مسميات وألوان حالات دورات العمل (معلق، قيد المراجعة، معتمد، مرفوض) لتمييزها بصرياً.",
      summaryEn: "Configure status labels, badges, and state tags (Pending, Under Review, Approved, Rejected) for workflows.",
      stepsAr: ["إدخال مسمى الحالة بالعربية والإنجليزية", "اختيار لون شارة الحالة (أخضر للاعتماد، أحمر للرفض)", "استخدام الحالة في بناء مسارات العمل (Workflows)"],
      stepsEn: ["Enter state name in Arabic and English", "Assign distinct badge color for visual desk clarity", "Reference state in workflow transitions"]
    },
    "Workflow Action": {
      icon: "✅",
      summaryAr: "سجل متابعة وإدارة قرارات الاعتماد المعلقة؛ يتيح للمدراء استعراض المعاملات بانتظار موافقتهم واتخاذ القرار بنقرة واحدة.",
      summaryEn: "Executive approval inbox: view all pending workflow actions, approve, reject, or request revisions in one click.",
      stepsAr: ["استعراض قائمة المعاملات الموجهة إليك للموافقة", "معاينة تفاصيل وبيانات المستند المطلوب اعتماده", "الضغط على زر «اعتماد» أو «رفض» مع تدوين السبب إن لزم"],
      stepsEn: ["Review queue of pending authorization requests", "Inspect linked transaction details and attached proofs", "Execute Approve or Reject action with mandatory comments"]
    }
  };

  /* ─────────────────────────────────────────
     ٧. الدوال المساعدة
  ───────────────────────────────────────── */

  function translate(key) {
    if (!isArabic) return key;
    return translations[key] || key;
  }

  function escapeHtml(value) {
    return String(value ?? "")
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
     ٨. نافذة التفاصيل المنبثقة (Info Modal القياسية)
  ───────────────────────────────────────── */

  function showInfoModal(itemName) {
    const desc = itemDescriptions[itemName];
    const title = isArabic ? (translate(itemName) || itemName) : itemName;
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
            <span class="erp-quick-label">${isArabic ? "فتح شاشة الإعدادات" : "Open Settings"}</span>
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
     ٩. إنشاء بطاقات الإحصائيات
  ───────────────────────────────────────── */

  function renderStats() {
    if (!statsSection) return;

    statsSection.innerHTML = `
      <div class="erp-stats-grid">
        ${statsCards.map(c => `
          <div class="erp-stat-card" data-stat-id="${c.id}">
            <div class="erp-stat-icon">${c.short}</div>
            <div class="erp-stat-info">
              <span class="erp-stat-label">${escapeHtml(isArabic ? c.labelAr : c.labelEn)}</span>
              <span class="erp-stat-value" data-stat-value>—</span>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    statsCards.forEach(c => {
      c.fetch().then(val => {
        const el = statsSection.querySelector(`[data-stat-id="${c.id}"] [data-stat-value]`);
        if (el) {
          el.textContent = formatNumber(val);
        }
      });
    });
  }

  /* ─────────────────────────────────────────
     ١٠. إنشاء أزرار الاختصارات السريعة
  ───────────────────────────────────────── */

  function renderQuickActions() {
    if (!quickActions) return;

    const title = isArabic ? "اختصارات سريعة" : "Quick Actions";

    quickActions.innerHTML = `
      <h2 class="erp-section-title">${escapeHtml(title)}</h2>
      <div class="erp-quick-grid">
        ${quickActionButtons.map(btn => {
          const label = isArabic ? btn.labelAr : btn.labelEn;
          return `
            <button type="button" class="erp-quick-btn" data-btn-action="${escapeHtml(btn.doctype)}" ${btn.isSingle ? 'data-is-single="1"' : ''}>
              <span class="erp-quick-icon" aria-hidden="true">+</span>
              <span class="erp-quick-label">${escapeHtml(label)}</span>
            </button>`;
        }).join("")}
      </div>
    `;

    quickActions.addEventListener("click", event => {
      const btn = event.target.closest("[data-btn-action]");
      if (!btn || !window.frappe) return;
      const doctype = btn.dataset.btnAction;
      if (btn.dataset.isSingle === "1") {
        frappe.set_route("Form", doctype);
        return;
      }
      frappe.new_doc(doctype);
    });
  }

  /* ─────────────────────────────────────────
     ١١. إنشاء بطاقات الوحدات والمربعات
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
     ١٢. إنشاء الفوتر
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
     ١٣. التوجيه وفتح الشاشات داخل النظام
  ───────────────────────────────────────── */

  const customRoutes = {
    "Print Format Builder": ["print-format-builder"]
  };

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
     ١٤. معالجة الأحداث والضغط
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
     ١٥. بدء التشغيل
  ───────────────────────────────────────── */

  renderStats();
  renderQuickActions();
  renderSections();
  renderFooter();
})();
