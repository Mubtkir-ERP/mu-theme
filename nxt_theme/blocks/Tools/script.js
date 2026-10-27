(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم الأدوات والخدمات — ERPNext Tools
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
     ١. إحصائيات الأدوات والخدمات
  ───────────────────────────────────────── */

  const statsCards = [
    {
      id: "total-files",
      short: "FILE",
      labelEn: "Total Files",
      labelAr: "إجمالي الملفات",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: { doctype: "File" },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "open-todos",
      short: "TODO",
      labelEn: "Pending To-Dos",
      labelAr: "المهام والملاحظات المعلقة",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "ToDo",
              filters: { status: "Open" }
            },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "active-notifications",
      short: "NOTIF",
      labelEn: "Active Alerts",
      labelAr: "التنبيهات النشطة",
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
      id: "auto-repeats",
      short: "AUTO",
      labelEn: "Auto Repeats",
      labelAr: "التكرار التلقائي للمستندات",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "Auto Repeat",
              filters: { status: "Active" }
            },
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
    { doctype: "Data Import", labelEn: "Import Data", labelAr: "استيراد البيانات", isRoute: "data-import-tool" },
    { doctype: "ToDo", labelEn: "ToDo", labelAr: "مهمة شخصية" },
    { doctype: "File", labelEn: "File", labelAr: "ملف جديد" },
    { doctype: "Assignment Rule", labelEn: "Assignment Rule", labelAr: "قاعدة تعيين" }
  ];

  /* ─────────────────────────────────────────
     ٣. هيكل الأقسام والبطاقات (مطابق تماماً للصورة)
  ───────────────────────────────────────── */

  const sections = [
    [
      "Documents",
      [
        [
          "Data",
          "💾",
          [
            "Import Data",
            "Export Data",
            "Bulk Update",
            "Download Backups",
            "Deleted Documents"
          ]
        ],
        [
          "Tools",
          "🛠️",
          [
            "To Do",
            "Calendar",
            "Note",
            "Files"
          ]
        ],
        [
          "Alerts and Notifications",
          "🔔",
          [
            "Notification",
            "Auto Email Report",
            "Notification Settings"
          ]
        ],
        [
          "Email",
          "📧",
          [
            "Email Account",
            "Email Domain",
            "Email Template"
          ]
        ],
        [
          "Printing",
          "🖨️",
          [
            "Print Format Builder",
            "Print Format Builder (New)",
            "Print Settings",
            "Print Heading"
          ]
        ],
        [
          "Automation",
          "⚡",
          [
            "Assignment Rule",
            "Milestone",
            "Auto Repeat"
          ]
        ],
        [
          "Newsletter",
          "📰",
          [
            "Newsletter",
            "Email Group"
          ]
        ]
      ]
    ]
  ];

  /* ─────────────────────────────────────────
     ٤. أنواع المستندات الفردية والشجرية والتقارير
  ───────────────────────────────────────── */

  const singleDocs = new Set([
    "Notification Settings",
    "Print Settings"
  ]);

  const treeDocs = new Set([]);

  const reportNames = new Set([]);

  /* ─────────────────────────────────────────
     ٥. القاموس اللغوي (عربي / إنجليزي)
  ───────────────────────────────────────── */

  const translations = {
    "Documents": "الوثائق والأدوات",
    "Data": "إدارة البيانات والنسخ",
    "Tools": "الأدوات والمفكرة",
    "Alerts and Notifications": "التنبيهات والإشعارات",
    "Email": "البريد الإلكتروني",
    "Printing": "الطباعة وتصميم النماذج",
    "Automation": "الأتمتة وقواعد التعيين",
    "Newsletter": "النشرات البريدية",

    "Import Data": "استيراد البيانات",
    "Export Data": "تصدير البيانات",
    "Bulk Update": "التحديث الجماعي للبيانات",
    "Download Backups": "تنزيل النسخ الاحتياطية",
    "Deleted Documents": "المستندات المحذوفة (سلة المهملات)",

    "To Do": "قائمة المهام اليومية (ToDo)",
    "Calendar": "التقويم والمواعيد",
    "Note": "الملاحظات والمذكرات",
    "Files": "مدير الملفات والمرفقات",

    "Notification": "قواعد التنبيهات التلقائية",
    "Auto Email Report": "التقارير المجدولة بالبريد",
    "Notification Settings": "إعدادات الإشعارات والتنبيهات",

    "Email Account": "حسابات البريد الإلكتروني",
    "Email Domain": "نطاقات البريد الإلكتروني",
    "Email Template": "قوالب البريد الإلكتروني",

    "Print Format Builder": "منشئ قوالب الطباعة",
    "Print Format Builder (New)": "منشئ قوالب الطباعة (الحديث)",
    "Print Settings": "إعدادات الطباعة العامة",
    "Print Heading": "ترويسات قوالب الطباعة",

    "Assignment Rule": "قواعد التعيين التلقائي للموظفين",
    "Milestone": "المعالم والمحطات الرئيسية",
    "Auto Repeat": "التكرار والجدولة التلقائية للمستندات",

    "Newsletter": "النشرات الإخبارية",
    "Email Group": "مجموعات البريد الإلكتروني"
  };

  /* ─────────────────────────────────────────
     ٦. شروحات وتفاصيل الشاشات والإعدادات
  ───────────────────────────────────────── */

  const itemDescriptions = {
    "Import Data": {
      icon: "📥",
      summaryAr: "أداة الاستيراد المجمّع للبيانات من ملفات Excel أو CSV (عملاء، منتجات، فواتير، أرصدة افتتاحية).",
      summaryEn: "Bulk data import wizard from Excel or CSV files with column mapping and validation.",
      stepsAr: ["تنزيل قالب الاستيراد للمستند المستهدف", "تعبئة البيانات ورفع الملف إلى النظام", "بدء عملية الاستيراد والتحقق من نجاح كافة السجلات"],
      stepsEn: ["Download template for destination DocType", "Populate records and upload spreadsheet file", "Trigger import process and inspect validation logs"]
    },
    "Export Data": {
      icon: "📤",
      summaryAr: "تصدير البيانات والسجلات من أي شاشة في النظام إلى ملفات Excel أو CSV مع تحديد الحقول المطلوبة.",
      summaryEn: "Extract and export master records or transaction history into Excel/CSV spreadsheets.",
      stepsAr: ["اختيار نوع المستند (DocType) المراد تصديره", "تحديد شروط الفلترة وقائمة الحقول المطلوبة", "تصدير وتنزيل الملف على جهازك فوراً"],
      stepsEn: ["Select target DocType for export", "Apply criteria filters and pick required export fields", "Export and download spreadsheet file instantly"]
    },
    "Bulk Update": {
      icon: "⚡",
      summaryAr: "أداة التعديل السريع الجماعي؛ تتيح تعديل قيمة حقل معين لمئات السجلات دفعة واحدة بأمان.",
      summaryEn: "Mass-update tool modifying specific field values across hundreds of records in a single batch.",
      stepsAr: ["اختيار نوع المستند والحقل المطلوب تعديله", "كتابة القيمة القديمة والقيمة الجديدة", "تطبيق التحديث الجماعي ومراجعة السجلات المعدلة"],
      stepsEn: ["Select DocType and target field to update", "Specify condition criteria and new replacement value", "Execute bulk update and review audit report"]
    },
    "Download Backups": {
      icon: "💾",
      summaryAr: "تنزيل النسخ الاحتياطية الرسمية لقاعدة البيانات والملفات المرفقة لضمان أمان وحفظ البيانات خارجياً.",
      summaryEn: "Direct download portal for full database SQL dumps and private/public media backup archives.",
      stepsAr: ["استعراض قائمة النسخ الاحتياطية المتوفرة", "الضغط على رابط النسخة المطلوبة لبدء التنزيل", "حفظ النسخة في مكان آمن للرجوع إليها عند الحاجة"],
      stepsEn: ["Review scheduled database and files backup snapshots", "Click desired backup file link to download", "Store archive securely in offsite storage"]
    },
    "Deleted Documents": {
      icon: "🗑️",
      summaryAr: "سلة مهملات النظام؛ تتيح استعراض كافة السجلات والمستندات المحذوفة مع إمكانية استعادتها فوراً.",
      summaryEn: "System recycle bin: audit, review, and instantly restore mistakenly deleted records.",
      stepsAr: ["البحث عن المستند المحذوف وتاريخ حذفه", "معاينة بيانات السجل المحذوف والمستخدم المسؤول", "الضغط على زر استعادة (Restore) لإرجاع السجل فوراً"],
      stepsEn: ["Locate deleted document by DocType, name, or date", "Inspect record content and deletion user audit", "Click Restore to reinstate record into active database"]
    },

    "To Do": {
      icon: "✅",
      summaryAr: "إدارة المهام والتكليفات الشخصية وتذكيرات العمل مع تتبع حالات الإنجاز والأولويات.",
      summaryEn: "Personal task tracker and work assignments with priorities, due dates, and completion status.",
      stepsAr: ["إنشاء مهمة جديدة وتحديد الوصف وتاريخ الاستحقاق", "تحديد مستوى الأولوية وربطها بمستند إن لزم", "تحديث حالة المهمة إلى «مكتملة» عند الإنجاز"],
      stepsEn: ["Create new to-do task with description and due date", "Assign priority and optionally link to transaction", "Mark as Completed upon execution"]
    },
    "Calendar": {
      icon: "📅",
      summaryAr: "تقويم موحد يجمع فعاليات الشركة، الاجتماعات، مواعيد تسليم المشاريع، ومتابعة الأعمال.",
      summaryEn: "Company-wide calendar orchestrating events, client meetings, project milestones, and personal schedules.",
      stepsAr: ["الضغط على اليوم المستهدف في التقويم", "إدخال بيانات الفعالية أو الاجتماع والوقت والمشاركين", "حفظ الحدث ومزامنة التنبيهات التلقائية"],
      stepsEn: ["Click target calendar date slot", "Enter event title, schedule time, location, and attendees", "Save event to sync automated email notifications"]
    },
    "Note": {
      icon: "📝",
      summaryAr: "دفتر مذكرات وملاحظات رقمي لحفظ الأفكار، محاضر الاجتماعات السريعة، والمستندات الداخلية ومشاركتها.",
      summaryEn: "Rich-text internal notebook to save ideas, meeting notes, memos, and collaborate with team members.",
      stepsAr: ["كتابة عنوان المذكرة ومحتواها الغني", "تحديد خصوصية المذكرة (شخصية أو عامة للفريق)", "حفظ المذكرة للرجوع إليها في أي وقت"],
      stepsEn: ["Create memo title and formatted content", "Set access privacy (private to user or public to team)", "Save note for ongoing quick reference"]
    },
    "Files": {
      icon: "📁",
      summaryAr: "مدير الملفات والمستودع المركزي لكافة الصور والوثائق والمرفقات المخزنة داخل النظام.",
      summaryEn: "Central file manager: browse, organize, preview, and audit all uploaded documents and image assets.",
      stepsAr: ["استعراض المجلدات والملفات المرفقة والبحث فيها", "رفع مستندات أو صور جديدة وتحديد تصنيفها", "نسخ روابط الملفات لمشاركتها أو إدراجها بالتقارير"],
      stepsEn: ["Browse uploaded file directory and search by name", "Upload new documents or images with privacy settings", "Copy file link for sharing or embedding in templates"]
    },

    "Notification": {
      icon: "🔔",
      summaryAr: "أتمتة إرسال التنبيهات الفورية عبر البريد أو النظام أو SMS عند حدوث أحداث معينة (مثل اعتماد فاتورة أو تسجيل عميل).",
      summaryEn: "Automated event-driven notification triggers via email, system alerts, or SMS based on document events.",
      stepsAr: ["اختيار نوع المستند والحدث المحفز (حفظ، اعتماد، تعديل)", "تحديد الشروط والمستلمين المعنيين بالتنبيه", "صياغة نص وقالب رسالة التنبيه وحفظ القاعدة وتفعيلها"],
      stepsEn: ["Select triggering DocType and event (Submit, Save, Value Change)", "Define trigger condition rules and target recipients", "Compose alert template and activate notification"]
    },
    "Auto Email Report": {
      icon: "📊",
      summaryAr: "جدولة إرسال أي تقرير مالي أو تشغيلي في النظام آلياً إلى بريد الإدارة أو الموظفين دورياً (يومياً/أسبوعياً).",
      summaryEn: "Schedule recurring automated delivery of financial, inventory, or operational reports via email.",
      stepsAr: ["اختيار التقرير المطلوب وشروط الفلترة", "تحديد جدول التكرار (يومي، أسبوعي، شهري) وقائمة الإيميلات", "حفظ وتفعيل الجدولة لإرسال التقرير تلقائياً بصيغة PDF أو Excel"],
      stepsEn: ["Select report name and configure default filter arguments", "Define sending frequency and recipient email distribution list", "Save and activate scheduled report delivery in PDF/Excel"]
    },
    "Notification Settings": {
      icon: "🔕",
      summaryAr: "شاشة التحكم في إشعارات المستخدم؛ تتيح ضبط تفضيلات تلقي التنبيهات الصوتية، تنبيهات البريد، وقنوات التواصل.",
      summaryEn: "Personal and system notification preferences: configure email digest frequency, desktop sounds, and alert subscriptions.",
      stepsAr: ["تحديد أنواع الإشعارات المرغوب استقبالها", "تفعيل أو تعطيل التنبيهات عبر البريد الإلكتروني", "حفظ الإعدادات لتطبيق التفضيلات على الحساب"],
      stepsEn: ["Configure subscribed notification categories", "Enable or disable email notification digests", "Save preferences to customize user alert experience"]
    },

    "Email Account": {
      icon: "📬",
      summaryAr: "ربط وتهيئة صناديق وحسابات البريد الإلكتروني للمنشأة (SMTP / IMAP) لإرسال واستقبال المراسلات.",
      summaryEn: "Email inbox and outgoing gateway configuration (SMTP/IMAP) for transactional and user correspondence.",
      stepsAr: ["إدخال عنوان البريد الإلكتروني وكلمة المرور المشفرة", "ضبط خوادم ومنافذ الإرسال (SMTP) والاستقبال (IMAP)", "إجراء فحص الاتصال للتأكد من نجاح الربط وتفعيله"],
      stepsEn: ["Enter organizational email address and secure credentials", "Configure incoming (IMAP) and outgoing (SMTP) server ports", "Execute connection test to verify email sync"]
    },
    "Email Domain": {
      icon: "🌐",
      summaryAr: "تعريف وضبط نطاقات وخوادم البريد الإلكتروني المشتركة (مثل: Google Workspace أو Microsoft 365) لتسريع ربط الحسابات.",
      summaryEn: "Standard email domain profiles (Google Workspace, Office 365) to streamline multi-user email setup.",
      stepsAr: ["تسمية النطاق وإدخال اسم الخادم الافتراضي", "ضبط منافذ وتشفير خوادم الـ SMTP والـ IMAP", "حفظ النطاق ليرثه أي حساب بريدي جديد تلقائياً"],
      stepsEn: ["Name email domain (e.g. yourcompany.com)", "Configure default incoming and outgoing host servers", "Save domain to auto-configure future user inboxes"]
    },
    "Email Template": {
      icon: "✉️",
      summaryAr: "تصميم قوالب الرسائل البريدية الجاهزة (عروض الأسعار، إشعارات الدفع، الترحيب) مع دعم المتغيرات الحية.",
      summaryEn: "Reusable email letter templates with dynamic Jinja variables for quotations, invoices, and payment receipts.",
      stepsAr: ["تسمية القالب وتحديد موضوع الرسالة الافتراضي", "صياغة المحتوى وإدراج الحقول الديناميكية (مثل اسم العميل، المبلغ)", "حفظ القالب واستخدامه المباشر عند إرسال الإيميلات من أي شاشة"],
      stepsEn: ["Title email template and define standard subject line", "Draft body content with dynamic document placeholders (Jinja)", "Save template for 1-click email dispatch from transactions"]
    },

    "Print Format Builder": {
      icon: "📐",
      summaryAr: "أداة السحب والإفلات المرئية لتصميم وتنسيق قوالب طباعة الفواتير والسندات بدون الحاجة لكتابة كود.",
      summaryEn: "Visual drag-and-drop print designer to format professional invoices, vouchers, and reports with zero code.",
      stepsAr: ["اختيار نوع المستند المطلوب تصميم قالبه", "سحب وإفلات الحقول والأعمدة والشعار في المساحات المناسبة", "معاينة القالب وحفظه وتعيينه كقالب طباعة افتراضي"],
      stepsEn: ["Select target DocType to design layout for", "Drag and drop fields, columns, tables, and company logo", "Preview rendering and set as default print template"]
    },
    "Print Format Builder (New)": {
      icon: "✨",
      summaryAr: "الجيل الجديد المطور من مصمم قوالب الطباعة؛ يوفر أدوات تحكم دقيقة في المسافات، الخطوط، وتنسيقات الجداول.",
      summaryEn: "Next-generation print builder providing precision layout control, modern typography, and advanced styling.",
      stepsAr: ["فتح المصمم واختيار المستند", "تخصيص الهوامش وشبكة العرض وتنسيقات جدول البنود", "حفظ القالب واعتماده للطباعة والتصدير كـ PDF"],
      stepsEn: ["Launch modern print builder workspace", "Fine-tune margins, borders, fonts, and item line tables", "Save template for PDF generation and desktop printing"]
    },
    "Print Settings": {
      icon: "⚙️",
      summaryAr: "شاشة الإعدادات العامة للطباعة؛ تشمل مقاس الصفحة الافتراضي (A4/حراري)، الخطوط، الهوامش، وخيارات ترويسة الشركة.",
      summaryEn: "Global printing preferences: default paper format (A4/thermal/letter), margins, fonts, and letterhead policies.",
      stepsAr: ["تحديد مقاس الورق القياسي ونوع الخط للطباعة", "ضبط الهوامش العلوية والسفلية للصفحة", "تحديد خيارات تضمين أو إخفاء الترويسة والترقيم وحفظ الإعدادات"],
      stepsEn: ["Choose default paper size and printing font", "Configure top, bottom, and side page margins", "Set default letterhead inclusion rules and save"]
    },
    "Print Heading": {
      icon: "🏷️",
      summaryAr: "تعريف وتخصيص العناوين والترويسات الرسمية في قوالب الطباعة (مثل: فاتورة ضريبية، سند قبض، إشعار دائن).",
      summaryEn: "Manage standard document titles printed on headers (e.g. Tax Invoice, Payment Receipt, Credit Note).",
      stepsAr: ["إدخال نص عنوان الطباعة بالعربية والإنجليزية", "ربطه بنوع المستند المعني", "حفظ العنوان لاختياره تلقائياً عند طباعة المستند"],
      stepsEn: ["Enter print title in Arabic and English", "Link title to applicable transactional DocTypes", "Save heading to select during print previews"]
    },

    "Assignment Rule": {
      icon: "👥",
      summaryAr: "أتمتة توزيع وتكليف المستندات والتذاكر والعملاء المحتملين على الموظفين بنظام التناوب (Round Robin) أو عبء العمل.",
      summaryEn: "Automated round-robin or load-balanced document assignment rules allocating tasks to team members.",
      stepsAr: ["تحديد المستند المستهدف وقائمة الموظفين المكلفين", "تحديد قاعدة التوزيع (تناوبي أو حسب الأقل مهاماً)", "تفعيل القاعدة ليبدأ النظام بتوزيع المعاملات آلياً فور إنشائها"],
      stepsEn: ["Select target DocType and assigned user pool", "Choose distribution method (Round Robin or Load Balancing)", "Activate rule to auto-assign incoming records immediately"]
    },
    "Milestone": {
      icon: "🏁",
      summaryAr: "تحديد وتتبع المحطات والتواريخ المفصلية الهامة في مسار المعاملات والمشاريع والاتفاقيات الكبرى.",
      summaryEn: "Track milestone progression and phase completion timestamps on critical transactions and contracts.",
      stepsAr: ["تسمية المحطة وتحديد تاريخ استحقاقها", "ربطها بالمستند أو المشروع المعني", "توثيق إنجاز المحطة واعتماد الانتقال للمرحلة التالية"],
      stepsEn: ["Name key operational milestone and target completion date", "Link milestone to parent transaction or project", "Mark milestone as achieved to unlock next workflow phase"]
    },
    "Auto Repeat": {
      icon: "🔄",
      summaryAr: "أداة التكرار التلقائي للمستندات المتجددة (مثل فواتير الاشتراكات الدورية، الرواتب، قيود الإيجار) دون تدخل يدوي.",
      summaryEn: "Automate recurring transactions (subscription invoices, recurring journal vouchers) on fixed schedules.",
      stepsAr: ["اختيار المستند الأصلي المراد تكراره دورياً", "تحديد دورة التكرار (أسبوعي، شهري، سنوي) وتاريخ البداية والنهاية", "حفظ وتفعيل التكرار ليقوم النظام بإنشاء واعتماد المستند آلياً في موعده"],
      stepsEn: ["Select template source document for duplication", "Define recurrence frequency (weekly, monthly, yearly) and end date", "Save and activate auto-repeat to generate drafts automatically"]
    },

    "Newsletter": {
      icon: "📢",
      summaryAr: "إنشاء وإرسال النشرات البريدية الإخبارية والتسويقية لقوائم العملاء والمشتركين مع تتبع معدلات القراءة.",
      summaryEn: "Broadcast targeted marketing emails and news updates to customer subscriber groups with click tracking.",
      stepsAr: ["كتابة محتوى وموضوع النشرة البريدية", "اختيار قائمة البريد الإلكتروني المستهدفة", "إرسال النشرة فوراً أو جدولتها ومراجعة إحصائيات التسليم"],
      stepsEn: ["Compose newsletter subject and body content", "Select target subscriber email group", "Send or schedule dispatch and monitor open metrics"]
    },
    "Email Group": {
      icon: "👥",
      summaryAr: "إدارة وتصنيف القوائم والمجموعات البريدية للمشتركين لضمان دقة توجيه الرسائل والحملات التسويقية.",
      summaryEn: "Organize segmented subscriber mailing lists for newsletters and targeted announcements.",
      stepsAr: ["إنشاء المجموعة وتسميتها حسب الاهتمام أو الشريحة", "استيراد أو إضافة عناوين البريد للمشتركين", "استخدام المجموعة كهدف في النشرات البريدية"],
      stepsEn: ["Create email group name and interest segment", "Import or manually add subscriber email addresses", "Reference group in newsletters and marketing broadcasts"]
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
          <span class="erp-modal-icon">${desc?.icon || "📄"}</span>
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
            <span class="erp-quick-label">${isArabic ? "فتح الشاشة" : "Open Screen"}</span>
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
            <button type="button" class="erp-quick-btn" data-btn-action="${escapeHtml(btn.doctype)}" ${btn.isRoute ? `data-is-route="${escapeHtml(btn.isRoute)}"` : ''}>
              <span class="erp-quick-icon" aria-hidden="true">+</span>
              <span class="erp-quick-label">${escapeHtml(label)}</span>
            </button>`;
        }).join("")}
      </div>
    `;

    quickActions.addEventListener("click", event => {
      const btn = event.target.closest("[data-btn-action]");
      if (!btn || !window.frappe) return;
      if (btn.dataset.isRoute) {
        frappe.set_route(btn.dataset.isRoute.split("/"));
        return;
      }
      frappe.new_doc(btn.dataset.btnAction);
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
    "Import Data": ["data-import-tool"],
    "Export Data": ["data-export-tool"],
    "Bulk Update": ["bulk-update"],
    "Download Backups": ["backups"],
    "Deleted Documents": ["List", "Deleted Document"],
    "To Do": ["List", "ToDo"],
    "Calendar": ["List", "Event", "Calendar"],
    "Note": ["List", "Note"],
    "Files": ["List", "File"],
    "Print Format Builder": ["print-format-builder"],
    "Print Format Builder (New)": ["print-format-builder-beta"]
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
