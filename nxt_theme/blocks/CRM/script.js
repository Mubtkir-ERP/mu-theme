(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم إدارة علاقات العملاء — ERPNext CRM
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
     ١. إحصائيات إدارة علاقات العملاء
  ───────────────────────────────────────── */

  const statsCards = [
    {
      id: "open-leads",
      short: "LEAD",
      labelEn: "Open Leads",
      labelAr: "العملاء المحتملون المفتوحون",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "Lead",
              filters: { status: "Lead" }
            },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "open-opps",
      short: "OPP",
      labelEn: "Open Opportunities",
      labelAr: "الفرص البيعية المفتوحة",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "Opportunity",
              filters: { status: "Open" }
            },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "total-customers",
      short: "CUST",
      labelEn: "Total Customers",
      labelAr: "إجمالي العملاء",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: { doctype: "Customer" },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "active-campaigns",
      short: "CAMP",
      labelEn: "Active Campaigns",
      labelAr: "الحملات النشطة",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: { doctype: "Campaign" },
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
    { doctype: "Lead", labelEn: "Lead", labelAr: "عميل محتمل" },
    { doctype: "Opportunity", labelEn: "Opportunity", labelAr: "فرصة بيعية" },
    { doctype: "Customer", labelEn: "Customer", labelAr: "عميل" },
    { doctype: "Sales Analytics", labelEn: "Sales Analytics", labelAr: "تحليلات المبيعات", isReport: true },
    { doctype: "CRM Dashboard", labelEn: "Dashboard", labelAr: "لوحة التحكم", isRoute: "dashboard-view/CRM" }
  ];

  /* ─────────────────────────────────────────
     ٣. هيكل الأقسام والبطاقات (مطابق تماماً للصورة)
  ───────────────────────────────────────── */

  const sections = [
    [
      "Reports & Masters",
      [
        [
          "Sales Pipeline",
          "💼",
          [
            "Lead",
            "Opportunity",
            "Customer",
            "Contract",
            "Appointment",
            "Newsletter",
            "Communication"
          ]
        ],
        [
          "Masters",
          "📂",
          [
            "Territory",
            "Customer Group",
            "Contact",
            "Prospect",
            "Sales Person",
            "Sales Stage",
            "Lead Source"
          ]
        ],
        [
          "Reports",
          "📊",
          [
            "Lead Details",
            "Sales Pipeline Analytics",
            "Opportunity Summary by Sales Stage",
            "Sales Funnel",
            "Prospects Engaged But Not Converted",
            "First Response Time for Opportunity",
            "Inactive Customers",
            "Campaign Efficiency",
            "Lead Owner Efficiency"
          ]
        ],
        [
          "Campaign",
          "📢",
          [
            "Campaign",
            "Email Campaign",
            "SMS Center",
            "SMS Log",
            "Email Group"
          ]
        ],
        [
          "Settings",
          "⚙️",
          [
            "CRM Settings",
            "SMS Settings"
          ]
        ],
        [
          "Maintenance",
          "🛠️",
          [
            "Maintenance Schedule",
            "Maintenance Visit",
            "Warranty Claim"
          ]
        ]
      ]
    ]
  ];

  /* ─────────────────────────────────────────
     ٤. أنواع المستندات الفردية والشجرية والتقارير
  ───────────────────────────────────────── */

  const singleDocs = new Set([
    "CRM Settings",
    "SMS Settings"
  ]);

  const treeDocs = new Set([
    "Territory",
    "Customer Group",
    "Sales Person"
  ]);

  const reportNames = new Set([
    "Lead Details",
    "Sales Pipeline Analytics",
    "Opportunity Summary by Sales Stage",
    "Sales Funnel",
    "Prospects Engaged But Not Converted",
    "First Response Time for Opportunity",
    "Inactive Customers",
    "Campaign Efficiency",
    "Lead Owner Efficiency",
    "Sales Analytics"
  ]);

  /* ─────────────────────────────────────────
     ٥. القاموس اللغوي (عربي / إنجليزي)
  ───────────────────────────────────────── */

  const translations = {
    "Reports & Masters": "التقارير والبيانات الرئيسية",
    "Sales Pipeline": "مسار المبيعات",
    "Masters": "البيانات الرئيسية",
    "Reports": "التقارير",
    "Campaign": "الحملات التسويقية",
    "Settings": "الإعدادات",
    "Maintenance": "الصيانة والضمان",

    "Lead": "العملاء المحتملون",
    "Opportunity": "الفرص البيعية",
    "Customer": "العملاء",
    "Contract": "العقود",
    "Appointment": "المواعيد",
    "Newsletter": "النشرات البريدية",
    "Communication": "سجل المراسلات والتواصل",

    "Territory": "المناطق الجغرافية",
    "Customer Group": "مجموعات العملاء",
    "Contact": "جهات الاتصال",
    "Prospect": "العملاء المرتقبون",
    "Sales Person": "مندوبو المبيعات",
    "Sales Stage": "مراحل البيع",
    "Lead Source": "مصادر العملاء المحتملين",

    "Lead Details": "تفاصيل العملاء المحتملين",
    "Sales Pipeline Analytics": "تحليلات مسار المبيعات",
    "Opportunity Summary by Sales Stage": "ملخص الفرص حسب مرحلة البيع",
    "Sales Funnel": "قمع المبيعات",
    "Prospects Engaged But Not Converted": "العملاء المرتقبون المتفاعلون دون تحويل",
    "First Response Time for Opportunity": "وقت الاستجابة الأول للفرص",
    "Inactive Customers": "العملاء غير النشطين",
    "Campaign Efficiency": "كفاءة الحملات",
    "Lead Owner Efficiency": "كفاءة مسؤولي العملاء المحتملين",
    "Sales Analytics": "تحليلات المبيعات",

    "Email Campaign": "حملات البريد الإلكتروني",
    "SMS Center": "مركز الرسائل النصية",
    "SMS Log": "سجل الرسائل النصية",
    "Email Group": "مجموعات البريد الإلكتروني",

    "CRM Settings": "إعدادات إدارة علاقات العملاء",
    "SMS Settings": "إعدادات الرسائل النصية",

    "Maintenance Schedule": "جدول الصيانة",
    "Maintenance Visit": "زيارات الصيانة",
    "Warranty Claim": "مطالبات الضمان"
  };

  /* ─────────────────────────────────────────
     ٦. شروحات وتفاصيل الشاشات والإعدادات
  ───────────────────────────────────────── */

  const itemDescriptions = {
    "Lead": {
      icon: "🎯",
      summaryAr: "تسجيل بيانات العملاء المحتملين ومتابعة قنوات الاستقطاب وتحويلهم إلى فرص بيعية أو عملاء دائمين.",
      summaryEn: "Record potential clients, track acquisition channels, and convert them to opportunities or customers.",
      stepsAr: ["تسجيل العميل المحتمل ومصدره", "تحديد الموظف المسؤول ومتابعة التواصل", "تقييم الاهتمام وتحويل السجل إلى فرصة أو عميل"],
      stepsEn: ["Create lead with contact details and source", "Assign sales representative", "Qualify interest and convert to opportunity or customer"]
    },
    "Opportunity": {
      icon: "💼",
      summaryAr: "إدارة ومتابعة الفرص التجارية والصفقات المحتملة مع تحديد قيمتها المتوقعة ومرحلة البيع.",
      summaryEn: "Track sales deals and business opportunities, including expected revenue and sales stages.",
      stepsAr: ["إنشاء الفرصة وتحديد العميل والمنتجات المهتم بها", "تحديد القيمة التقديرية وتاريخ الإغلاق المتوقع", "متابعة العروض البيعية حتى إتمام التعاقد"],
      stepsEn: ["Create opportunity linked to lead or customer", "Specify estimated value and closing date", "Issue quotations and follow up through stages"]
    },
    "Customer": {
      icon: "👥",
      summaryAr: "إدارة ملفات العملاء المعتمدين، حدود الائتمان، جهات الاتصال، والسجل المالي والبيعي الشامل.",
      summaryEn: "Manage verified customer master profiles, credit limits, contacts, and transaction history.",
      stepsAr: ["إدخال الاسم والبيانات الضريبية للعميل", "ربطه بمجموعة العملاء والمنطقة الجغرافية", "تحديد العملة وشروط الدفع وحد الائتمان"],
      stepsEn: ["Enter customer name and tax registration", "Assign customer group and territory", "Set default currency, payment terms, and credit limits"]
    },
    "Contract": {
      icon: "📜",
      summaryAr: "إبرام وإدارة العقود والاتفاقيات القانونية والتجارية مع العملاء وتتبع فترات سريانها وتجديدها.",
      summaryEn: "Manage legal and commercial contracts with clients, tracking terms, validity, and renewal schedules.",
      stepsAr: ["تحديد الطرف المتعاقد ونوع العقد", "إدخال بنود وشروط وتاريخ بداية ونهاية العقد", "اعتماد العقد ومتابعة مواعيد التجديد"],
      stepsEn: ["Select contracted party and contract type", "Enter terms, clauses, start and end dates", "Submit contract and track renewal milestones"]
    },
    "Appointment": {
      icon: "📅",
      summaryAr: "جدولة وتنظيم المواعيد والاجتماعات البيعية والميدانية مع العملاء والعملاء المحتملين.",
      summaryEn: "Schedule and manage sales meetings and client appointments with automatic reminders.",
      stepsAr: ["تحديد العميل أو العميل المحتمل", "اختيار التاريخ والوقت والموظف المسؤول", "حفظ الموعد وتحديث حالة الحضور والنتائج"],
      stepsEn: ["Select customer or lead", "Choose appointment date, time, and assigned agent", "Save appointment and log outcome notes"]
    },
    "Newsletter": {
      icon: "📧",
      summaryAr: "تصميم وإرسال النشرات الإخبارية والعروض الترويجية لقوائم المشتركين ومجموعات البريد.",
      summaryEn: "Design and broadcast promotional newsletters and company updates to subscriber groups.",
      stepsAr: ["كتابة محتوى النشرة البريدية وموضوعها", "اختيار قائمة البريد المستهدفة", "جدولة الإرسال ومراجعة إحصائيات التفاعل"],
      stepsEn: ["Compose newsletter content and subject", "Select targeted email subscriber groups", "Schedule or send newsletter and inspect open rates"]
    },
    "Communication": {
      icon: "💬",
      summaryAr: "سجل مركزي موحد لكافة المراسلات الواردة والصادرة عبر البريد الإلكتروني والمكالمات والملاحظات.",
      summaryEn: "Central log of all inbound and outbound emails, call notes, and customer interactions.",
      stepsAr: ["استعراض سجل المراسلات المرتبطة بالعميل", "تدوين ملاحظات المكالمات أو الاجتماعات", "ربط المراسلة بالمستند التجاري المعني"],
      stepsEn: ["Review communication timeline", "Log phone call notes or meeting summaries", "Link interactions directly to sales transactions"]
    },

    "Territory": {
      icon: "🗺️",
      summaryAr: "شجرة التقسيم الجغرافي للأسواق والمناطق وتعيين مديري ومندوبي المبيعات المسؤولين.",
      summaryEn: "Geographic territory tree structure for regional sales allocation and target management.",
      stepsAr: ["إضافة المنطقة داخل الشجرة الجغرافية", "تعيين مشرف ومندوبي المنطقة", "استعراض تقارير المبيعات حسب المنطقة"],
      stepsEn: ["Add new node in territory tree hierarchy", "Assign regional sales representatives", "Track territorial revenue distribution"]
    },
    "Customer Group": {
      icon: "🏷️",
      summaryAr: "تصنيف العملاء إلى مجموعات وفئات (جملة، تجزئة، شركات) لتخصيص قوائم الأسعار وشروط السداد.",
      summaryEn: "Categorize customers into segments (wholesale, retail, corporate) for pricing policies.",
      stepsAr: ["إنشاء مجموعة العملاء ضمن الشجرة", "ربط سياسات الخصم والأسعار الافتراضية", "تطبيق المجموعة على بطاقات العملاء"],
      stepsEn: ["Create customer group node in tree", "Define default price list and discount policies", "Assign customer group to customer profiles"]
    },
    "Contact": {
      icon: "👤",
      summaryAr: "دفتر عناوين مركزي لبيانات الأفراد والمسؤولين لدى العملاء والموردين ووسائل التواصل المباشرة.",
      summaryEn: "Central address book of individual stakeholders, direct phone numbers, and emails.",
      stepsAr: ["تسجيل اسم الشخص وصفته الوظيفية", "إدخال أرقام الهاتف والبريد الإلكتروني", "ربطه بالعميل أو الشركة التابع لها"],
      stepsEn: ["Enter contact person name and job title", "Add direct phone numbers and emails", "Link contact record to corresponding customer or organization"]
    },
    "Prospect": {
      icon: "🏢",
      summaryAr: "إدارة بيانات الشركات والمؤسسات المرتقبة قبل اعتماد فتح ملف عميل رسمي.",
      summaryEn: "Track prospective business entities and corporate accounts prior to formal customer onboarding.",
      stepsAr: ["تسجيل اسم المنشأة المرتقبة وبيانات التواصل", "إضافة جهات الاتصال التابعة للمنشأة", "تحويل المنشأة إلى عميل رسمي عند إتمام الصفقة"],
      stepsEn: ["Record prospective company details", "Add individual contact persons", "Convert prospect to official customer upon deal closure"]
    },
    "Sales Person": {
      icon: "👔",
      summaryAr: "شجرة مندوبي وفرق المبيعات، وتوزيع الحصص والعمولات ومتابعة أهداف البيع الدورية.",
      summaryEn: "Hierarchical sales team tree to manage sales targets, commission structures, and quotas.",
      stepsAr: ["إضافة مندوب المبيعات في الهيكل الإداري", "تحديد المستهدفات البيعية (Targets)", "متابعة الأداء واحتساب عمولات المبيعات"],
      stepsEn: ["Add sales representative in tree hierarchy", "Set periodic sales targets", "Track target achievement and commissions"]
    },
    "Sales Stage": {
      icon: "📊",
      summaryAr: "تعريف وضبط مراحل دورة البيع (تواصل أولي، تقديم عرض، تفاوض، فوز، خسارة) لقياس كفاءة الإغلاق.",
      summaryEn: "Define sequential sales stages (qualification, proposal, negotiation, won, lost).",
      stepsAr: ["تسمية مرحلة البيع وتحديد ترتيبها", "تحديد نسبة احتمالية النجاح المقدرة", "ربط المرحلة بالفرص البيعية"],
      stepsEn: ["Name sales stage and set funnel order", "Assign win probability percentage", "Track opportunity distribution across stages"]
    },
    "Lead Source": {
      icon: "🌐",
      summaryAr: "تعريف وتتبع قنوات جذب العملاء (إعلانات، معارض، إحالات، موقع إلكتروني) لتحليل كفاءة التسويق.",
      summaryEn: "Define lead acquisition channels (social media, exhibitions, referrals, website).",
      stepsAr: ["إدخال مسمى مصدر العميل المحتمل", "تحديد الحملة التسويقية المرتبطة إن وجدت", "تحليل معدل تحويل العملاء لكل مصدر"],
      stepsEn: ["Add lead source name", "Optionally link to marketing campaigns", "Analyze customer acquisition ROI per channel"]
    },

    "Campaign": {
      icon: "📢",
      summaryAr: "تخطيط وإطلاق الحملات التسويقية ومتابعة الميزانيات ونسبة العائد على الاستثمار التسويقي.",
      summaryEn: "Plan and coordinate marketing campaigns, budget allocations, and sales revenue ROI.",
      stepsAr: ["تحديد اسم وتاريخ بداية ونهاية الحملة", "تخصيص الميزانية التقديرية", "ربط الفرص والمبيعات المحققة بالحملة"],
      stepsEn: ["Set campaign name, start and end dates", "Allocate marketing budget", "Track leads and closed sales attributed to campaign"]
    },
    "Email Campaign": {
      icon: "📨",
      summaryAr: "أتمتة إرسال رسائل بريدية متسلسلة للعملاء المحتملين لزيادة التفاعل وإتمام الصفقات.",
      summaryEn: "Automated drip email marketing sequences to nurture leads and drive conversions.",
      stepsAr: ["تحديد الحملة التسويقية وقالب البريد", "ضبط الفواصل الزمنية بين الرسائل التتابعية", "تفعيل الحملة وتتبع الاستجابات"],
      stepsEn: ["Select parent campaign and email schedule templates", "Configure time intervals between follow-up messages", "Launch drip campaign and monitor engagement"]
    },
    "SMS Center": {
      icon: "📱",
      summaryAr: "مركز إرسال الرسائل النصية القصيرة الجماعية والفردية للإعلانات والتنبيهات المباشرة.",
      summaryEn: "Dispatch direct and bulk SMS marketing text messages to customer groups and leads.",
      stepsAr: ["اختيار قائمة المستلمين المستهدفة", "كتابة نص الرسالة ومراجعة عدد الحروف", "إرسال الرسالة فورا أو جدولة وقت الإرسال"],
      stepsEn: ["Select recipient contact group or leads", "Compose message text within character limits", "Send SMS immediately or queue for scheduled delivery"]
    },
    "SMS Log": {
      icon: "📑",
      summaryAr: "سجل تدقيق وتتبع الرسائل النصية المرسلة وحالات التسليم والتكاليف المحتسبة.",
      summaryEn: "Audit log of dispatched SMS messages, delivery reports, and gateway responses.",
      stepsAr: ["مراجعة حالة تسليم كل رسالة", "التحقق من رقم الهاتف ووقت الإرسال", "معالجة أخطاء الإرسال إن وجدت"],
      stepsEn: ["Review delivery status per message", "Verify phone numbers and dispatch timestamps", "Inspect gateway failure codes"]
    },
    "Email Group": {
      icon: "👥",
      summaryAr: "إنشاء وإدارة القوائم البريدية المستهدفة وتصنيف المشتركين حسب الاهتمام والموقع.",
      summaryEn: "Manage targeted email distribution lists and categorized subscriber databases.",
      stepsAr: ["إنشاء المجموعة البريدية", "استيراد أو إضافة المشتركين", "ربط المجموعة بالنشرات والحملات البريدية"],
      stepsEn: ["Create new email group profile", "Import or add subscriber email addresses", "Link group to newsletters and email campaigns"]
    },

    "CRM Settings": {
      icon: "⚙️",
      summaryAr: "شاشة الإعدادات العامة لإدارة علاقات العملاء؛ تتيح ضبط سياسات التعيين التلقائي للمسؤولين، والتنبيهات، وقواعد تحويل الفرص.",
      summaryEn: "Central CRM system configuration: auto-assignment rules, notification triggers, and opportunity workflows.",
      stepsAr: ["تحديد قواعد التعيين التلقائي للعملاء المحتملين", "ضبط فترات المتابعة والتنبيهات الاستباقية", "حفظ الإعدادات لتطبيقها فوراً على النظام"],
      stepsEn: ["Configure lead auto-assignment parameters", "Set up follow-up intervals and alert triggers", "Save settings to apply policy across workspace"]
    },
    "SMS Settings": {
      icon: "📶",
      summaryAr: "شاشة إعدادات بوابة الرسائل النصية (SMS Gateway)؛ تشمل ربط مزود الخدمة، مفاتيح الـ API، واسم المرسل المعتمد.",
      summaryEn: "SMS gateway integration settings: provider endpoint parameters, API credentials, and approved sender ID.",
      stepsAr: ["إدخال رابط البوابة وبيانات الاعتماد (API Key)", "تحديد اسم المرسل (Sender ID) المعتمد رسمياً", "إجراء اختبار إرسال للتأكد من نجاح الاتصال"],
      stepsEn: ["Enter gateway URL and API access credentials", "Specify approved organizational Sender ID", "Execute test dispatch to verify gateway connectivity"]
    },

    "Maintenance Schedule": {
      icon: "🗓️",
      summaryAr: "جدولة مواعيد الصيانة الدورية والوقائية للمنتجات والأصول المباعة للعملاء.",
      summaryEn: "Schedule routine and preventive maintenance visits for sold products and customer equipment.",
      stepsAr: ["اختيار العميل والمنتج المعني بالصيانة", "تحديد فترات التكرار (أسبوعي/شهري/سنوي)", "توليد زيارات الصيانة وتعيين الفنيين"],
      stepsEn: ["Select customer and serviced product", "Set recurrence frequency (monthly/quarterly)", "Generate maintenance visits and dispatch technicians"]
    },
    "Maintenance Visit": {
      icon: "🧰",
      summaryAr: "توثيق زيارات الفنيين ومسؤولي الصيانة الميدانية للمواقع وتسجيل الأعمال وقطع الغيار المستهلكة.",
      summaryEn: "Document on-site maintenance visits, engineer actions, inspection results, and spare parts used.",
      stepsAr: ["إنشاء الزيارة بناءً على الجدول أو البلاغ", "تسجيل ملاحظات الفحص والعمل المنجز", "اعتماد توقيع العميل وإغلاق الزيارة"],
      stepsEn: ["Create visit record linked to schedule or ticket", "Log inspection checklist and technician notes", "Obtain customer sign-off and complete visit"]
    },
    "Warranty Claim": {
      icon: "🛡️",
      summaryAr: "استقبال ومعالجة مطالبات واستحقاقات الضمان للمنتجات المباعة والتحقق من صلاحية فترة الضمان.",
      summaryEn: "Process warranty claims for sold products, checking serial numbers and warranty validity.",
      stepsAr: ["تسجيل المطالبة وتحديد المنتج والرقم التسلسلي", "التحقق من سريان فترة الضمان وشروط الاستحقاق", "اتخاذ القرار بالإصلاح أو الاستبدال أو الرفض"],
      stepsEn: ["Record claim linked to customer and product serial", "Verify warranty expiration and policy terms", "Approve repair, replacement, or document rejection"]
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
            <button type="button" class="erp-quick-btn" data-btn-action="${escapeHtml(btn.doctype)}" ${btn.isReport ? 'data-is-report="1"' : ''} ${btn.isRoute ? `data-is-route="${escapeHtml(btn.isRoute)}"` : ''}>
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
      if (btn.dataset.isReport === "1") {
        frappe.set_route("query-report", doctype);
        return;
      }
      if (btn.dataset.isRoute) {
        frappe.set_route(btn.dataset.isRoute.split("/"));
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

  function openRoute(name) {
    if (!window.frappe || typeof frappe.set_route !== "function") return;
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
