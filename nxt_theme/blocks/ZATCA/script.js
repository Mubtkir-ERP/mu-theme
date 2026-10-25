(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم زاتكا — ERPNext ZATCA
   * ══════════════════════════════════════════
   */

  const root = root_element.querySelector("[data-erp-dashboard]");
  const zatcaCycle = root_element.querySelector("[data-purchase-cycle]");
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

  root.setAttribute("dir", isArabic ? "rtl" : "ltr");
  root.classList.toggle("erp-dashboard-rtl", isArabic);


  /* ══════════════════════════════════════════
     ١. خطوات تنفيذ زاتكا
  ══════════════════════════════════════════ */

  const zatcaCycleCards = [

  {
    step: 1,
    action: "list",
    doctype: "Company",

    labelEn: "Company Data",
    labelAr: "بيانات الشركة",

    descriptionEn:
      "Review and complete the company information required for electronic invoicing.",

    descriptionAr:
      "مراجعة واستكمال بيانات الشركة الأساسية المطلوبة للفوترة الإلكترونية."
  },

  {
    step: 2,
    action: "form",
    doctype: "ZATCA Phase 1 Business Settings",

    labelEn: "ZATCA Phase 1",
    labelAr: "زاتكا المرحلة الأولى",

    descriptionEn:
      "Configure Phase 1 electronic invoicing settings.",

    descriptionAr:
      "إعداد متطلبات المرحلة الأولى من الفوترة الإلكترونية."
  },

  {
    step: 3,
    action: "form",
    doctype: "ZATCA Phase 2 Business Settings",

    labelEn: "ZATCA Phase 2",
    labelAr: "زاتكا المرحلة الثانية",

    descriptionEn:
      "Configure Phase 2 integration settings and connection with ZATCA.",

    descriptionAr:
      "إعداد المرحلة الثانية والربط والتكامل مع منصة زاتكا."
  },

  {
    step: 4,
    action: "list",
    doctype: "ZATCA Integration Log",

    labelEn: "Errors & Status",
    labelAr: "الأخطاء وحالة الربط",

    descriptionEn:
      "Review rejected invoices, warnings, errors, and ZATCA integration responses.",

    descriptionAr:
      "مراجعة الفواتير المرفوضة والتحذيرات والأخطاء واستجابات زاتكا."
  }

];


  /* ══════════════════════════════════════════
     ٢. بطاقات الإحصائيات
  ══════════════════════════════════════════ */

  const statsCards = [
    {
      id: "accepted",
      icon: "✅",
      labelEn: "Accepted Invoices",
      labelAr: "الفواتير المقبولة",
      color: "#16a34a",
      suffix: null,

      fetch: () =>
        new Promise((resolve) => {
          frappe.call({
            method: "frappe.client.get_count",

            args: {
              doctype: "ZATCA Integration Log",
              filters: {
                status: "Accepted"
              }
            },

            async: true,

            callback: (r) =>
              resolve(r?.message || 0),

            error: () =>
              resolve(0)
          });
        })
    },

    {
      id: "rejected",
      icon: "❌",
      labelEn: "Rejected Invoices",
      labelAr: "الفواتير المرفوضة",
      color: "#dc2626",
      suffix: null,

      fetch: () =>
        new Promise((resolve) => {
          frappe.call({
            method: "frappe.client.get_count",

            args: {
              doctype: "ZATCA Integration Log",
              filters: {
                status: "Rejected"
              }
            },

            async: true,

            callback: (r) =>
              resolve(r?.message || 0),

            error: () =>
              resolve(0)
          });
        })
    },

    {
      id: "warnings",
      icon: "⚠️",
      labelEn: "Accepted with Warnings",
      labelAr: "مقبولة مع تحذيرات",
      color: "#ea580c",
      suffix: null,

      fetch: () =>
        new Promise((resolve) => {
          frappe.call({
            method: "frappe.client.get_count",

            args: {
              doctype: "ZATCA Integration Log",
              filters: {
                status: "Accepted with Warnings"
              }
            },

            async: true,

            callback: (r) =>
              resolve(r?.message || 0),

            error: () =>
              resolve(0)
          });
        })
    },

    {
      id: "resend",
      icon: "🔄",
      labelEn: "Resend Invoices",
      labelAr: "فواتير معاد إرسالها",
      color: "#2563eb",
      suffix: null,

      fetch: () =>
        new Promise((resolve) => {
          frappe.call({
            method: "frappe.client.get_count",

            args: {
              doctype: "ZATCA Integration Log",
              filters: {
                status: "Resend"
              }
            },

            async: true,

            callback: (r) =>
              resolve(r?.message || 0),

            error: () =>
              resolve(0)
          });
        })
    }
  ];


  /* ══════════════════════════════════════════
     ٣. إعدادات الفوتر
  ══════════════════════════════════════════ */

  const footerInfo = {
    phone: (window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.phone) || "0115110455",
    email: (window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.email) || "sales@mubtkir.com",
    website: (window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.website) || "www.mubtkir.com",

    labels: {
      phoneEn: "Phone",
      phoneAr: "الهاتف الموحد",

      emailEn: "Email",
      emailAr: "البريد الإلكتروني",

      websiteEn: "Website",
      websiteAr: "الموقع"
    }
  };


  /* ══════════════════════════════════════════
     ٤. بطاقات زاتكا
  ══════════════════════════════════════════ */

  const sections = [
    [
      "Configuration & Transactions",
      [
        [
          "Business Configuration",
          "🏢",
          [
            "Company",
            "Address",
            "ZATCA Tax Category",
            "ZATCA Phase 1 Business Settings",
            "ZATCA Phase 2 Business Settings",
            "ZATCA EGS",
            "ZATCA Invoice Counting Settings"
          ]
        ],

        [
          "Transactions",
          "🧾",
          [
            "Customer",
            "Sales Invoice",
            "Sales Invoice Additional Fields"
          ]
        ],

        [
          "ZATCA Reports",
          "📊",
          [
            "Zatca Integration Details",
            "Zatca Integration Summary"
          ]
        ],

        [
          "Logs",
          "📋",
          [
            "ZATCA Integration Log",
            "e-invoicing-sync"
          ]
        ]
      ]
    ]
  ];


  /* ══════════════════════════════════════════
     ٥. الترجمات العربية
  ══════════════════════════════════════════ */

  const arabicFallback = {

    "Configuration & Transactions":
      "الإعدادات والمعاملات",

    "Business Configuration":
      "إعدادات الأعمال",

    "Company":
      "الشركة",

    "Address":
      "العنوان",

    "ZATCA Tax Category":
      "فئة ضريبة زاتكا",

    "ZATCA Phase 1 Business Settings":
      "إعدادات المرحلة الأولى زاتكا",

    "ZATCA Phase 2 Business Settings":
      "إعدادات المرحلة الثانية زاتكا",

    "ZATCA EGS":
      "جهاز الربط زاتكا EGS",

    "ZATCA Invoice Counting Settings":
      "إعدادات عداد فواتير زاتكا",

    "Transactions":
      "المعاملات",

    "Customer":
      "العميل",

    "Sales Invoice":
      "فاتورة المبيعات",

    "Sales Invoice Additional Fields":
      "حقول فاتورة المبيعات الإضافية",

    "ZATCA Reports":
      "تقارير زاتكا",

    "Zatca Integration Details":
      "تفاصيل ربط زاتكا",

    "Zatca Integration Summary":
      "ملخص ربط زاتكا",

    "Logs":
      "السجلات",

    "ZATCA Integration Log":
      "سجل ربط زاتكا",

    "e-invoicing-sync":
      "مزامنة الفوترة الإلكترونية"
  };


  /* ══════════════════════════════════════════
     ٦. المستندات الخاصة
  ══════════════════════════════════════════ */

  const singleDocs = new Set([
    "ZATCA Phase 1 Business Settings",
    "ZATCA Phase 2 Business Settings",
    "ZATCA Invoice Counting Settings"
  ]);


  const reportNames = new Set([
    "Zatca Integration Details",
    "Zatca Integration Summary"
  ]);

  /* =========================================================
     DETAILS BUTTON HELPER
  ========================================================= */
  function hasDetailsButton(cardTitle, itemName) {
    if (typeof reportNames !== "undefined" && reportNames && reportNames.has(itemName)) return false;
    if (typeof singleDocs !== "undefined" && singleDocs && singleDocs.has(itemName)) return false;
    if (/report|تقارير|تقرير|analytics/i.test(cardTitle) || /report|تقرير/i.test(itemName)) return false;
    if (/setting|config|إعداد|اعداد|تكوين|تهيئة|setup/i.test(cardTitle) || /setting|إعداد|اعداد|تهيئة/i.test(itemName)) return false;
    return true;
  }



  /* ══════════════════════════════════════════
     ٧. أوصاف العناصر
  ══════════════════════════════════════════ */

  const itemDescriptions = {

    "Company": {
      icon: "🏢",
      summaryAr:
        "إعداد بيانات الشركة الأساسية المطلوبة لربط زاتكا: الرقم الضريبي (VAT)، رقم السجل التجاري (CRN)، ونوع المنشأة.",
      summaryEn:
        "Configure company details required for ZATCA integration: VAT number, Commercial Registration Number (CRN), and business type.",
      stepsAr: [
        "افتح شاشة «الشركة» وتأكد من اختيار شركتك",
        "تحقق من تطابق الاسم التجاري ورقم السجل التجاري (CRN)",
        "أدخل الرقم الضريبي (VAT) المكون من 15 رقماً",
        "حدد العنوان الوطني الرئيسي المعتمد لدى الهيئة",
        "احفظ التعديلات لاعتمادها في معاملات الفوترة"
      ],
      stepsEn: [
        "Open «Company» screen and select your company",
        "Verify commercial name and Commercial Registration Number (CRN)",
        "Enter 15-digit VAT Registration Number",
        "Set primary National Address registered with ZATCA",
        "Save changes to enable electronic invoicing"
      ]
    },

    "Address": {
      icon: "📍",
      summaryAr:
        "إدارة عناوين الشركة والفروع بالتنسيق المطلوب من هيئة الزكاة والضريبة والجمارك.",
      summaryEn:
        "Manage company and branch addresses in ZATCA-required format.",
      stepsAr: [
        "افتح شاشة «العنوان» واختر العنوان المراد ربطه",
        "أدخل اسم الشارع، رقم المبنى، والرمز البريدي (5 أرقام)",
        "أدخل الرقم الإضافي (4 أرقام) والحي والمدينة",
        "اربط العنوان بالشركة أو الفرع أو العميل",
        "اضغط حفظ لتحديث العنوان الوطني المعتمد"
      ],
      stepsEn: [
        "Open «Address» master and choose the address",
        "Enter Street name, Building Number, and 5-digit Postal Code",
        "Enter 4-digit Additional Number, District, and City",
        "Link address to Company, branch, or Customer",
        "Click Save to update validated National Address"
      ]
    },

    "ZATCA Tax Category": {
      icon: "🏷️",
      summaryAr:
        "تعريف فئات الضريبة المعتمدة من زاتكا وربطها بالفواتير.",
      summaryEn:
        "Define ZATCA-approved tax categories and link them to invoices.",
      stepsAr: [
        "افتح شاشة «فئات ضريبة زاتكا»",
        "حدد فئة الضريبة (النسبة الأساسية 15%، الإعفاء، الصفر، أو خارج النطاق)",
        "اربط كود الفئة برمز زاتكا المعتمد",
        "اضغط حفظ لتطبيق الفئة على الفواتير"
      ],
      stepsEn: [
        "Open «ZATCA Tax Category»",
        "Select tax category (Standard 15%, Exempt, Zero-rated, or Out of scope)",
        "Link tax category to ZATCA standard tax code",
        "Save to apply tax category across invoicing"
      ]
    },

    "ZATCA Phase 1 Business Settings": {
      icon: "1️⃣",
      summaryAr:
        "إعدادات المرحلة الأولى من الفوترة الإلكترونية.",
      summaryEn:
        "Phase 1 electronic invoicing settings.",
      stepsAr: [
        "افتح إعدادات المرحلة الأولى لزاتكا",
        "فعّل خيار الفوترة الإلكترونية للمرحلة الأولى",
        "حدد إعدادات رمز الاستجابة السريعة (QR Code) على الفواتير",
        "اضغط حفظ لتطبيق شروط المرحلة الأولى"
      ],
      stepsEn: [
        "Open «ZATCA Phase 1 Business Settings»",
        "Enable Phase 1 electronic invoicing",
        "Configure QR Code parameters on invoice print templates",
        "Save settings to activate Phase 1 compliance"
      ]
    },

    "ZATCA Phase 2 Business Settings": {
      icon: "2️⃣",
      summaryAr:
        "إعدادات المرحلة الثانية للربط والتكامل مع منصة فاتورة.",
      summaryEn:
        "Phase 2 integration settings for the FATOORA platform.",
      stepsAr: [
        "افتح إعدادات المرحلة الثانية لزاتكا (منصة فاتورة)",
        "حدد بيئة العمل (تجريبية Simulation أو فعلية Production)",
        "أدخل رمز الأمان (OTP) المستخرج من بوابة زاتكا",
        "قم بتوليد شهادة التشفير (CSID) والاعتماد",
        "اضغط حفظ لتفعيل التكامل والربط المباشر"
      ],
      stepsEn: [
        "Open «ZATCA Phase 2 Business Settings» (FATOORA)",
        "Select environment (Simulation or Production)",
        "Enter OTP generated from ZATCA FATOORA portal",
        "Generate Cryptographic Stamp Identifier (CSID)",
        "Save settings to activate direct clearance integration"
      ]
    },

    "ZATCA EGS": {
      icon: "🔌",
      summaryAr:
        "إعداد جهاز توليد الفواتير الإلكترونية مع شهادات التوقيع ومفاتيح التشفير.",
      summaryEn:
        "Configure the electronic invoice generation solution and certificates.",
      stepsAr: [
        "افتح شاشة أجهزة الربط «ZATCA EGS»",
        "أدخل معرف الجهاز التسلسلي والفرع ونوع نقطة البيع أو السيرفر",
        "قم بتهيئة الشهادة الرقمية ومفتاح التشفير الخاص",
        "اضغط حفظ لاعتماد الجهاز كوحدة إصدار فواتير مرخصة"
      ],
      stepsEn: [
        "Open «ZATCA EGS» device registers",
        "Enter device serial ID, branch, and POS/server solution type",
        "Initialize compliance digital certificate and private key",
        "Save to approve unit as a compliant invoice generator"
      ]
    },

    "ZATCA Invoice Counting Settings": {
      icon: "🔢",
      summaryAr:
        "إعداد تسلسل عداد الفواتير الإلكترونية.",
      summaryEn:
        "Configure electronic invoice sequential counter.",
      stepsAr: [
        "افتح «إعدادات عداد فواتير زاتكا»",
        "حدد نمط الترقيم التسلسلي غير القابل للتكرار أو التعديل",
        "تحقق من مطابقة العداد لمتطلبات التسلسل التراكمي",
        "احفظ الإعدادات لضبط عداد الفواتير تلقائياً"
      ],
      stepsEn: [
        "Open «ZATCA Invoice Counting Settings»",
        "Set tamper-proof sequential numbering pattern",
        "Ensure counter strictly aligns with sequential hash requirements",
        "Save settings to automate invoice counter sequence"
      ]
    },

    "Customer": {
      icon: "👤",
      summaryAr:
        "بيانات العميل المطلوبة للفوترة الإلكترونية مثل الرقم الضريبي والعنوان وبيانات الهوية.",
      summaryEn:
        "Customer information required for electronic invoicing.",
      stepsAr: [
        "افتح شاشة «العميل» من القائمة",
        "أدخل الاسم التجاري للعميل والاسم باللغة الإنجليزية",
        "أدخل الرقم الضريبي (15 رقماً) للمؤسسات والشركات الخاضعة للضريبة",
        "سجل عنوان العميل الوطني: اسم الشارع، المدينة، الرمز البريدي، ورقم المبنى",
        "حدد فئة العميل ونوع الفوترة، ثم اضغط «حفظ»"
      ],
      stepsEn: [
        "Open «Customer» list view",
        "Enter customer legal commercial name in Arabic and English",
        "Enter 15-digit VAT Registration Number for taxable B2B entities",
        "Provide National Address: Street, City, Postal Code, and Building Number",
        "Set customer group and billing currency, then click «Save»"
      ]
    },

    "Sales Invoice": {
      icon: "🧾",
      summaryAr:
        "فاتورة المبيعات الإلكترونية التي يتم إرسالها وربطها مع زاتكا.",
      summaryEn:
        "Electronic Sales Invoice submitted and integrated with ZATCA.",
      stepsAr: [
        "افتح شاشة «فاتورة المبيعات» واضغط فاتورة جديدة",
        "اختر العميل وتاريخ التترحيل وفرع البيع",
        "أضف الأصناف والكميات والأسعار وفئة ضريبة القيمة المضافة",
        "يقوم النظام باحتساب الضريبة وحقول زاتكا تلقائياً",
        "احفظ الفاتورة ثم اضغط تسجيل لإنشاء رمز الاستجابة السريعة (QR) وتوليد التشفير"
      ],
      stepsEn: [
        "Open «Sales Invoice» and click new invoice",
        "Select Customer, posting date, and branch",
        "Add items, quantities, rates, and VAT tax category",
        "System automatically calculates taxes and ZATCA compliance fields",
        "Save and Submit to generate QR code and cryptographic compliance hash"
      ]
    },

    "Sales Invoice Additional Fields": {
      icon: "📝",
      summaryAr:
        "الحقول الإضافية الخاصة بمتطلبات زاتكا على فاتورة المبيعات.",
      summaryEn:
        "Additional Sales Invoice fields required for ZATCA.",
      stepsAr: [
        "افتح شاشة «حقول فاتورة المبيعات الإضافية»",
        "راجع الحقول الإلزامية لزاتكا (نوع المعاملة، الدفع، التصدير)",
        "تأكد من تفعيل الحقول المطلوبة لبيئة العمل الخاصة بك",
        "اضغط حفظ لتطبيق الحقول على شاشة الفاتورة"
      ],
      stepsEn: [
        "Open «Sales Invoice Additional Fields»",
        "Review required ZATCA fields (Transaction type, payment mode, export flags)",
        "Ensure mandatory fields are active for your business scope",
        "Save to apply additional fields on the invoice form"
      ]
    },

    "Zatca Integration Details": {
      icon: "📊",
      summaryAr:
        "تقرير تفصيلي يعرض حالة ربط كل فاتورة مع زاتكا.",
      summaryEn:
        "Detailed report showing each invoice's ZATCA integration status.",
      stepsAr: [
        "افتح تقرير «تفاصيل ربط زاتكا»",
        "حدد الفترة الزمنية وحالة الربط والشركة",
        "استعرض تفاصيل الفواتير وحالة القبول أو الرفض",
        "قم بتصدير التقرير للمطابقة والمراجعة"
      ],
      stepsEn: [
        "Open «ZATCA Integration Details» report",
        "Set date range, integration status, and company",
        "Inspect invoice clearance statuses and responses",
        "Export report for audit and verification"
      ]
    },

    "Zatca Integration Summary": {
      icon: "📈",
      summaryAr:
        "ملخص إحصائي لعمليات الربط مع زاتكا.",
      summaryEn:
        "Statistical summary of ZATCA integration.",
      stepsAr: [
        "افتح تقرير «ملخص ربط زاتكا»",
        "راجع إجمالي الفواتير المقبولة والمرفوضة ونسب النجاح",
        "حلل أسباب التحذيرات والرفض إن وجدت",
        "استخدم التقرير لتقييم كفاءة عمليات الفوترة"
      ],
      stepsEn: [
        "Open «ZATCA Integration Summary» report",
        "Review total accepted, rejected, and warned invoices",
        "Analyze variance and warning reasons",
        "Use summary for operational compliance review"
      ]
    },

    "ZATCA Integration Log": {
      icon: "📋",
      summaryAr:
        "سجل تفصيلي لكل عملية إرسال وربط مع زاتكا.",
      summaryEn:
        "Detailed log of each ZATCA integration operation.",
      stepsAr: [
        "افتح «سجل ربط زاتكا» لمتابعة العمليات",
        "استعرض حالة إرسال كل فاتورة (مقبولة، مرفوضة، أو مع تحذيرات)",
        "اضغط على السجل لعرض استجابة منصة فاتورة ورمز الخطأ إن وجد",
        "اتخذ الإجراء التصحيحي للفواتير المرفوضة وأعد الإرسال"
      ],
      stepsEn: [
        "Open «ZATCA Integration Log»",
        "Review invoice dispatch status (CLEARED, REPORTED, REJECTED, WARNINGS)",
        "Inspect ZATCA response payload and error codes",
        "Perform corrective action on rejected invoices and re-submit"
      ]
    },

    "e-invoicing-sync": {
      icon: "🔄",
      summaryAr:
        "سجل عمليات مزامنة الفوترة الإلكترونية مع منصة زاتكا.",
      summaryEn:
        "Electronic invoicing synchronization log.",
      stepsAr: [
        "افتح شاشة «مزامنة الفوترة الإلكترونية»",
        "حدد الفترة الزمنية والفواتير المعلقة المراد مزامنتها",
        "اضغط على زر «بدء المزامنة» للربط المباشر مع المنصة",
        "تحقق من تحديث حالات الفواتير ونتائج المزامنة"
      ],
      stepsEn: [
        "Open «e-invoicing-sync» tool",
        "Specify date range and pending invoices to synchronize",
        "Click «Start Sync» for batch clearance/reporting with ZATCA",
        "Verify updated compliance statuses and sync results"
      ]
    }

  };


  /* ══════════════════════════════════════════
     ٨. دوال مساعدة
  ══════════════════════════════════════════ */

  function translate(name) {

    if (!isArabic)
      return name;

    if (arabicFallback[name])
      return arabicFallback[name];

    if (typeof window.__ === "function")
      return window.__(name);

    return name;
  }


  function escapeHtml(value) {

    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }


  function formatNumber(num) {

    const n =
      parseFloat(num) || 0;

    return n.toLocaleString("en-US");
  }


  /* ══════════════════════════════════════════
     ٩. عرض خطوات التنفيذ
  ══════════════════════════════════════════ */

  function renderZatcaCycle() {

    if (!zatcaCycle)
      return;


    const title =
      isArabic
        ? "خطوات تنفيذ الفوترة الإلكترونية"
        : "Electronic Invoicing Process";


    zatcaCycle.innerHTML = `

      <section class="erp-cycle-container">

        <h2
          class="erp-section-title erp-cycle-title"
        >
          ${escapeHtml(title)}
        </h2>


        <div
          class="erp-cycle-grid"
          style="
            grid-template-columns:
            repeat(
              ${zatcaCycleCards.length},
              minmax(0,1fr)
            );
          "
        >

          ${zatcaCycleCards.map(
            (card, index) => {

              const title =
                isArabic
                  ? card.labelAr
                  : card.labelEn;


              const description =
                isArabic
                  ? card.descriptionAr
                  : card.descriptionEn;


              const arrow =
                index <
                zatcaCycleCards.length - 1

                  ? `
                    <span
                      class="erp-cycle-arrow"
                      aria-hidden="true"
                    >
                      ${isArabic ? "←" : "→"}
                    </span>
                  `

                  : "";


              return `

                <div class="erp-cycle-item">

                  <button
                    type="button"
                    class="
                      erp-cycle-card
                      cycle-tone-${(index % 4) + 1}
                    "
                    data-cycle-index="${index}"
                  >

                    <span class="erp-cycle-number">
                      ${card.step}
                    </span>

                    <span class="erp-cycle-card-title">
                      ${escapeHtml(title)}
                    </span>

                    <span class="erp-cycle-description">
                      ${escapeHtml(description)}
                    </span>

                  </button>

                  ${arrow}

                </div>
              `;

            }
          ).join("")}

        </div>

      </section>
    `;


    zatcaCycle.addEventListener(
      "click",
      event => {

        const element =
          event.target.closest(
            "[data-cycle-index]"
          );

        if (!element)
          return;


        const card =
          zatcaCycleCards[
            Number(element.dataset.cycleIndex)
          ];

        if (!card)
          return;


        if (card.action === "new") {

          frappe.new_doc(
            card.doctype
          );

          return;
        }


        if (card.action === "form") {

          frappe.set_route(
            "Form",
            card.doctype
          );

          return;
        }


        if (card.action === "list") {

          frappe.set_route(
            "List",
            card.doctype
          );
        }

      }
    );

  }


  /* ══════════════════════════════════════════
     ١٠. إنشاء بطاقات الإحصائيات
  ══════════════════════════════════════════ */

  function renderStats() {

    if (!statsSection)
      return;


    statsSection.innerHTML = `

      <div class="erp-stats-grid">

        ${statsCards.map((card) => {

          const label =
            isArabic
              ? card.labelAr
              : card.labelEn;

          return `

            <div
              class="erp-stat-card"
              style="--stat-color:${card.color}"
            >

              <div class="erp-stat-icon">
                ${card.icon}
              </div>

              <div class="erp-stat-info">

                <span
                  class="erp-stat-value"
                  data-stat-id="${card.id}"
                >
                  ...
                </span>

                <span class="erp-stat-label">
                  ${escapeHtml(label)}
                </span>

              </div>

            </div>
          `;

        }).join("")}

      </div>
    `;


    if (window.frappe) {

      statsCards.forEach(card => {

        card.fetch().then(value => {

          const el =
            statsSection.querySelector(
              `[data-stat-id="${card.id}"]`
            );

          if (!el)
            return;

          el.textContent =
            formatNumber(value);

        });

      });

    }

  }


  /* ══════════════════════════════════════════
     ١١. مربع التفاصيل
  ══════════════════════════════════════════ */

  function showInfoModal(data) {

    const title =
      isArabic
        ? data.labelAr
        : data.labelEn;

    const summary =
      isArabic
        ? data.summaryAr
        : data.summaryEn;

    const rawSteps =
      isArabic
        ? data.stepsAr
        : data.stepsEn;

    const steps = (Array.isArray(rawSteps) && rawSteps.length > 0)
      ? rawSteps
      : (
        isArabic
          ? [
              "فتح شاشة " + title,
              "إدخال وتعبئة البيانات الأساسية المطلوبة",
              "مراجعة وتدقيق الحقول الإلزامية",
              "حفظ المستند والاعتماد النهائي"
            ]
          : [
              "Open " + (data.labelEn || title),
              "Fill in the required information and fields",
              "Review and verify mandatory values",
              "Save and submit the record"
            ]
      );

    const overlay =
      document.createElement("div");

    overlay.className =
      "erp-modal-overlay";

    overlay.setAttribute(
      "dir",
      isArabic ? "rtl" : "ltr"
    );

    overlay.innerHTML = `

      <div class="erp-modal-box">

        <button
          type="button"
          class="erp-modal-close"
          data-modal-close
        >
          ✕
        </button>

        <div class="erp-modal-header">

          <span class="erp-modal-icon">
            ${data.icon || "📄"}
          </span>

          <h3 class="erp-modal-title">
            ${escapeHtml(title)}
          </h3>

        </div>

        <p class="erp-modal-summary">
          ${escapeHtml(summary)}
        </p>

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

    requestAnimationFrame(() =>
      overlay.classList.add("is-visible")
    );

    function closeModal() {
      overlay.classList.remove("is-visible");
      overlay.addEventListener(
        "transitionend",
        () => overlay.remove(),
        { once: true }
      );
    }

    overlay
      .querySelector("[data-modal-close]")
      ?.addEventListener(
        "click",
        closeModal
      );

    overlay.addEventListener(
      "click",
      e => {
        if (e.target === overlay)
          closeModal();
      }
    );

    

  }


  /* ══════════════════════════════════════════
     ١٢. إنشاء البطاقات
  ══════════════════════════════════════════ */

  function renderSections() {

    content.innerHTML =
      sections.map(
        (section, sectionIndex) => {

          const sectionName =
            section[0];

          const sectionCards =
            section[1];


          const cardsHtml =
            sectionCards.map(
              (card, cardIndex) => {

                const cardName =
                  card[0];

                const icon =
                  card[1];

                const items =
                  card[2];


                const linksHtml =
                  items.map(
                    itemName => {

                      const desc =
                        itemDescriptions[itemName];

                      const detailsLabel =
                        isArabic
                          ? "تفاصيل"
                          : "Details";


                      const showDetails = hasDetailsButton(card[0], itemName);
                      const infoBtn = showDetails ? `<button
                              type="button"
                              class="erp-info-link"
                              data-info-item="${escapeHtml(itemName)}"
                            >
                              ${detailsLabel}
                            </button>
                          `
                          : "";


                      return `

                        <div class="erp-link-row">

                          <button
                            type="button"
                            class="erp-link"
                            data-route-name="${escapeHtml(itemName)}"
                          >

                            <span class="erp-link-text">
                              ${escapeHtml(translate(itemName))}
                            </span>

                            <span class="erp-link-arrow">
                              ${isArabic ? "←" : "→"}
                            </span>

                          </button>

                          ${infoBtn}

                        </div>
                      `;

                    }
                  ).join("");


                return `

                  <article
                    class="
                      erp-card is-open
                      tone-${(sectionIndex + cardIndex) % 5}
                    "
                    data-erp-card
                  >

                    <button
                      type="button"
                      class="erp-card-heading"
                      data-card-toggle
                      aria-expanded="true"
                    >

                      <span class="erp-icon">
                        ${icon}
                      </span>

                      <span class="erp-card-title">
                        ${escapeHtml(translate(cardName))}
                      </span>

                      <span class="erp-card-chevron">
                        ⌄
                      </span>

                    </button>


                    <div class="erp-card-links">
                      ${linksHtml}
                    </div>

                  </article>
                `;

              }
            ).join("");


          return `

            <section class="erp-module-section">

              <h2 class="erp-section-title">
                ${escapeHtml(translate(sectionName))}
              </h2>

              <div class="erp-dashboard-grid">
                ${cardsHtml}
              </div>

            </section>
          `;

        }
      ).join("");

  }


  /* ══════════════════════════════════════════
     ١٣. الفوتر
  ══════════════════════════════════════════ */

  function renderFooter() {

    if (!footerEl)
      return;


    const labels =
      footerInfo.labels;


    const phoneLabel =
      isArabic
        ? labels.phoneAr
        : labels.phoneEn;


    const emailLabel =
      isArabic
        ? labels.emailAr
        : labels.emailEn;


    const websiteLabel =
      isArabic
        ? labels.websiteAr
        : labels.websiteEn;


    footerEl.innerHTML = `

      <div class="erp-footer-inner">

        <div class="erp-footer-item">

          <span class="erp-footer-icon">
            📞
          </span>

          <span class="erp-footer-label">
            ${escapeHtml(phoneLabel)}:
          </span>

          <a
            href="tel:${footerInfo.phone}"
            class="erp-footer-link"
            dir="ltr"
          >
            ${escapeHtml(footerInfo.phone)}
          </a>

        </div>

        <span class="erp-footer-sep">
          |
        </span>

        <div class="erp-footer-item">

          <span class="erp-footer-icon">
            ✉️
          </span>

          <span class="erp-footer-label">
            ${escapeHtml(emailLabel)}:
          </span>

          <a
            href="mailto:${footerInfo.email}"
            class="erp-footer-link"
          >
            ${escapeHtml(footerInfo.email)}
          </a>

        </div>

        <span class="erp-footer-sep">
          |
        </span>

        <div class="erp-footer-item">

          <span class="erp-footer-icon">
            🌐
          </span>

          <span class="erp-footer-label">
            ${escapeHtml(websiteLabel)}:
          </span>

          <a
            href="https://${footerInfo.website}"
            class="erp-footer-link"
            target="_blank"
            rel="noopener"
          >
            ${escapeHtml(footerInfo.website)}
          </a>

        </div>

      </div>
    `;

  }


  /* ══════════════════════════════════════════
     ١٤. فتح الخيارات
  ══════════════════════════════════════════ */

  function openRoute(name) {

    if (
      !window.frappe ||
      typeof frappe.set_route !== "function"
    )
      return;


    if (reportNames.has(name)) {

      frappe.set_route(
        "query-report",
        name
      );

      return;
    }


    if (singleDocs.has(name)) {

      frappe.set_route(
        "Form",
        name
      );

      return;
    }


    frappe.set_route(
      "List",
      name
    );

  }


  /* ══════════════════════════════════════════
     ١٥. أحداث الضغط
  ══════════════════════════════════════════ */

  let lastToggleTime = 0;


  content.addEventListener(
    "click",
    event => {


      const infoBtn =
        event.target.closest(
          "[data-info-item]"
        );


      if (infoBtn) {

        event.preventDefault();
        event.stopPropagation();


        const itemName =
          infoBtn.dataset.infoItem;


        const desc =
          itemDescriptions[itemName];


        if (desc) {

          showInfoModal({
            name: itemName,
            icon: desc.icon || "📄",
            labelAr: translate(itemName),
            labelEn: itemName,
            summaryAr: desc.summaryAr,
            summaryEn: desc.summaryEn,
            stepsAr: desc.stepsAr,
            stepsEn: desc.stepsEn
          });
    


        }

        return;
      }


      const routeButton =
        event.target.closest(
          "[data-route-name]"
        );


      if (routeButton) {

        event.preventDefault();
        event.stopPropagation();


        openRoute(
          routeButton.dataset.routeName
        );

        return;
      }


      const cardButton =
        event.target.closest(
          "[data-card-toggle]"
        );


      if (!cardButton)
        return;


      const now =
        Date.now();


      if (
        now - lastToggleTime <
        400
      )
        return;


      lastToggleTime =
        now;


      const selectedCard =
        cardButton.closest(
          "[data-erp-card]"
        );


      if (!selectedCard)
        return;

      const isOpen =
        selectedCard.classList.contains("is-open");

      if (isOpen) {
        selectedCard.classList.remove("is-open");
        selectedCard.classList.add("is-collapsed");
        cardButton.setAttribute("aria-expanded", "false");
      } else {
        selectedCard.classList.add("is-open");
        selectedCard.classList.remove("is-collapsed");
        cardButton.setAttribute("aria-expanded", "true");
      }
    }
  );


  /* ══════════════════════════════════════════
     ١٦. تشغيل
  ══════════════════════════════════════════ */

  renderZatcaCycle();
  renderStats();
  renderSections();
  renderFooter();

})();