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

    phone: "+966126810486",

    email: "sales@mubtkir.com",

    website: "www.mubtkir.com",



    labels: {

      phoneEn: "WhatsApp",

      phoneAr: "واتساب",



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





  /* ══════════════════════════════════════════

     ٧. أوصاف العناصر

  ══════════════════════════════════════════ */



  const itemDescriptions = {

    "Company": {
      icon: "🏢",
      summaryAr: "إعداد وتأكيد بيانات المنشأة الأساسية المطلوبة لربط منصة زاتكا (الفوترة الإلكترونية).",
      summaryEn: "Configure company details required for ZATCA e-invoicing integration.",
      stepsAr: [
        "الدخول إلى شاشة بيانات الشركة واختيار الشركة المستهدفة",
        "التحقق من صحة الاسم القانوني المسجل للمنشأة بالعربية والإنجليزية",
        "إدخال وتأكيد الرقم الضريبي المعتمد (15 رقماً يبدأ وينتهي بـ 3)",
        "إدخال رقم السجل التجاري (CRN) ونوع المنشأة ونشاطها التجاري",
        "حفظ التعديلات والتأكد من مطابقتها لشهادة تسجيل ضريبة القيمة المضافة"
      ],
      stepsEn: [
        "Open Company master and select the target company",
        "Verify registered legal company name in Arabic and English",
        "Enter and confirm the 15-digit VAT registration number",
        "Enter Commercial Registration Number (CRN) and business type",
        "Save changes and ensure match with VAT certificate"
      ]
    },

    "Address": {
      icon: "📍",
      summaryAr: "إدارة وتكوين العنوان الوطني للشركة وفروعها بالتنسيق القياسي الإلزامي لهيئة الزكاة والضريبة والجمارك.",
      summaryEn: "Manage company and branch National Addresses in ZATCA-required standard format.",
      stepsAr: [
        "فتح شاشة العناوين واختيار عنوان المركز الرئيسي أو الفرع",
        "تعبئة اسم الشارع ورقم المبنى المكون من 4 أرقام",
        "إدخال اسم الحي والرمز البريدي والرقم الإضافي (4 أرقام)",
        "تحديد المدينة واختيار الدولة (المملكة العربية السعودية - SA)",
        "ربط العنوان بالشركة وتعيينه كعنوان رئيسي ثم حفظ السجل"
      ],
      stepsEn: [
        "Open Address master and select main or branch address",
        "Enter Street name and 4-digit Building Number",
        "Enter District, Postal Code, and 4-digit Additional Number",
        "Set City and Country code (Saudi Arabia - SA)",
        "Link address to company as primary address and save"
      ]
    },

    "ZATCA Tax Category": {
      icon: "🏷️",
      summaryAr: "تعريف وتعيين فئات ضريبة القيمة المضافة المعتمدة من هيئة زاتكا وربطها بالفواتير والبنود.",
      summaryEn: "Define ZATCA-approved VAT categories and associate them with items and invoice lines.",
      stepsAr: [
        "فتح شاشة فئات ضريبة زاتكا (النسبة الأساسية، الصفرية، المعفاة، خارج النطاق)",
        "مراجعة وتأكيد نسبة الضريبة المحددة لكل فئة (15% للنسبة الأساسية)",
        "تحديد كود سبب الإعفاء أو الصفر الضريبي بدقة إن وُجد",
        "ربط فئة الضريبة بحساب الضريبة المقابل في شجرة الحسابات",
        "حفظ الإعدادات لتطبيق الضريبة تلقائياً عند إنشاء الفواتير"
      ],
      stepsEn: [
        "Open ZATCA Tax Category (Standard, Zero-rated, Exempt, Out of scope)",
        "Review and confirm tax rate for each category (15% for standard)",
        "Specify exact exemption reason code if zero-rated or exempt",
        "Link tax category to corresponding account in Chart of Accounts",
        "Save settings to apply automatically during invoicing"
      ]
    },

    "ZATCA Phase 1 Business Settings": {
      icon: "1️⃣",
      summaryAr: "إعداد متطلبات المرحلة الأولى (الإصدار والحفظ) للفواتير الإلكترونية وتوليد رمز الاستجابة السريع (QR Code).",
      summaryEn: "Configure Phase 1 (generation & storage) requirements and QR code settings.",
      stepsAr: [
        "فتح شاشة إعدادات المرحلة الأولى للفوترة الإلكترونية",
        "تفعيل خيار إنشاء وحفظ الفواتير الإلكترونية بصيغة مشفرة",
        "التحقق من إعدادات توليد رمز الـ QR Code وفق المواصفات الفنية لزاتكا",
        "تأكيد منع التعديل أو الحذف بعد اعتماد الفواتير",
        "حفظ الإعدادات وتجربة إصدار فاتورة للتأكد من ظهور الـ QR بدقة"
      ],
      stepsEn: [
        "Open ZATCA Phase 1 Settings",
        "Enable electronic invoice generation and encrypted archiving",
        "Verify QR code generation settings per ZATCA technical guidelines",
        "Confirm restrictions against editing or deleting submitted invoices",
        "Save settings and test an invoice to verify compliant QR code"
      ]
    },

    "ZATCA Phase 2 Business Settings": {
      icon: "2️⃣",
      summaryAr: "إعدادات المرحلة الثانية للربط والتكامل المباشر مع منصة فاتورة (FATOORA).",
      summaryEn: "Configure Phase 2 integration settings for real-time clearance and reporting with FATOORA.",
      stepsAr: [
        "فتح شاشة إعدادات المرحلة الثانية واختيار الشركة المستهدفة",
        "تحديد بيئة العمل (بيئة تجريبية Sandbox أو بيئة الإنتاج الفعلي Production)",
        "إدخال رمز المصادقة السري لمرة واحدة (OTP) الصادر من بوابة فاتورة",
        "تفعيل خيارات الربط للفوترة الضريبية القياسية والفوترة المبسطة",
        "حفظ الإعدادات واختبار الاتصال للتحقق من نجاح الربط مع خوادم الهيئة"
      ],
      stepsEn: [
        "Open ZATCA Phase 2 Business Settings and select target company",
        "Choose environment mode (Sandbox testing or Production live)",
        "Enter One-Time Password (OTP) generated from FATOORA portal",
        "Enable integration options for Standard and Simplified tax invoices",
        "Save and run connectivity test to verify active link with ZATCA servers"
      ]
    },

    "ZATCA EGS": {
      icon: "🔌",
      summaryAr: "إعداد وحدة الحل التقني (EGS) وتوليد المفاتيح التشفيرية وشهادة الامتثال الرقمية (CSID).",
      summaryEn: "Configure Electronic Generation Solution (EGS) unit and issue cryptographic security certificates.",
      stepsAr: [
        "الضغط على «جهاز ربط جديد (New ZATCA EGS)»",
        "إدخال المعرف الفريد للجهاز (UUID) والرقم التسلسلي وموقع الوحدة",
        "توليد المفتاح الخاص (Private Key) وملف طلب الشهادة (CSR)",
        "طلب شهادة الامتثال والإنتاج (CSID) عبر رمز الـ OTP",
        "حفظ وتنشيط الجهاز ليصبح معتمداً ومسجلاً لإرسال الفواتير تشفيرياً"
      ],
      stepsEn: [
        "Click «New ZATCA EGS» unit",
        "Enter device UUID, serial number, and unit branch location",
        "Generate cryptographic Private Key and CSR request file",
        "Request Compliance and Production CSID certificate using portal OTP",
        "Save and activate unit for cryptographic invoice signing and submission"
      ]
    },

    "ZATCA Invoice Counting Settings": {
      icon: "🔢",
      summaryAr: "إدارة وضبط العداد التسلسلي المستمر غير القابل للتكرار (ICV) وتجزئة التشفير التراكمي (PIH).",
      summaryEn: "Manage sequential tamper-proof invoice counter (ICV) and previous invoice cryptographic hash (PIH).",
      stepsAr: [
        "فتح شاشة إعدادات عداد الفواتير واختيار الشركة وجهاز الربط EGS",
        "التحقق من رقم البداية للعداد التسلسلي المتزايد (Invoice Counter Value)",
        "التأكد من حفظ قيمة التشفير التراكمي للفاتورة السابقة (Previous Invoice Hash)",
        "تأكيد عدم إمكانية تصفير أو تخطي أرقام العداد لضمان الامتثال التام",
        "حفظ الإعدادات وتثبيتها"
      ],
      stepsEn: [
        "Open Invoice Counting Settings and select company and EGS unit",
        "Verify starting sequence for Invoice Counter Value (ICV)",
        "Ensure chaining integrity with Previous Invoice Hash (PIH)",
        "Confirm counter cannot be reset or skipped to ensure compliance",
        "Save and commit settings"
      ]
    },

    "Customer": {
      icon: "👤",
      summaryAr: "إعداد وتحديث بيانات العميل الإلزامية للفوترة الضريبية مثل العنوان الوطني والرقم الضريبي.",
      summaryEn: "Manage customer master data required for tax invoices (VAT number and National Address).",
      stepsAr: [
        "فتح ملف العميل والتأكد من الاسم التجاري أو الشخصي الصحيح",
        "تحديد تصنيف العميل (منشأة تجارية B2B أو فرد نهائي B2C)",
        "إدخال الرقم الضريبي للعميل المكون من 15 رقماً للفواتير الضريبية",
        "ربط وتعبئة العنوان الوطني التفصيلي للعميل (المبنى، الشارع، الحي، الرمز البريدي)",
        "حفظ السجل ليتم إدراجه تلقائياً في الفواتير الصادرة له"
      ],
      stepsEn: [
        "Open Customer profile and verify correct legal/individual name",
        "Select customer classification (Business B2B or Individual Consumer B2C)",
        "Enter customer's 15-digit VAT registration number for B2B tax invoices",
        "Link detailed National Address (Building, Street, District, Postal Code)",
        "Save record to auto-populate on issued invoices"
      ]
    },

    "Sales Invoice": {
      icon: "🧾",
      summaryAr: "إصدار واعتماد فاتورة المبيعات وتوقيعها تشفيرياً وإرسالها لمنصة زاتكا بشكل لحظي.",
      summaryEn: "Issue, submit, cryptographically sign, and transmit sales invoices to ZATCA platform.",
      stepsAr: [
        "الضغط على «فاتورة مبيعات جديدة» واختيار العميل وتاريخ الفاتورة",
        "إضافة المنتجات والكميات والأسعار والتحقق من احتساب ضريبة 15%",
        "تحديد نوع الفاتورة (ضريبية قياسية B2B أو ضريبية مبسطة B2C)",
        "الضغط على «حفظ» ثم «تسجيل (Submit)» لتوليد التوقيع الرقمي والـ QR والهاش",
        "إرسال الفاتورة لمنصة زاتكا ومراجعة حالة الاعتماد والتخليص المباشر"
      ],
      stepsEn: [
        "Click «New Sales Invoice» and select customer and posting date",
        "Add items, quantities, rates and verify 15% VAT calculation",
        "Select invoice subtype (Standard B2B or Simplified B2C)",
        "Click «Save» then «Submit» to generate digital signature, QR, and hash",
        "Transmit invoice to ZATCA and verify live clearance / reporting status"
      ]
    },

    "Sales Invoice Additional Fields": {
      icon: "📝",
      summaryAr: "تحديد الحقول الإضافية المخصصة لمتطلبات هيئة زاتكا كأسباب التعديل وطرق الدفع الخاصة.",
      summaryEn: "Manage additional sales invoice fields required by ZATCA compliance rules.",
      stepsAr: [
        "فتح شاشة الحقول الإضافية لفاتورة المبيعات",
        "تحديد نوع المعاملة الخاصة (تصدير، توريد ذاتي، طرف ثالث، إلخ)",
        "في حال إشعار دائن أو مدين: إدخال سبب التعديل ورقم الفاتورة المرجعية",
        "تحديد كود وسيلة الدفع المعتمدة وفق مواصفات هيئة الزكاة والضريبة",
        "حفظ البيانات وربطها بالفاتورة المصدرة"
      ],
      stepsEn: [
        "Open Sales Invoice Additional Fields",
        "Specify special transaction type (Export, Self-billing, Third-party)",
        "For Credit/Debit notes: enter amendment reason and reference invoice",
        "Select payment means code according to ZATCA standards",
        "Save details and associate with the invoice"
      ]
    },

    "ZATCA Integration Log": {
      icon: "📋",
      summaryAr: "سجل تفصيلي لمتابعة عمليات الإرسال والاستجابة وأكواد الأخطاء والتحذيرات الصادرة من زاتكا.",
      summaryEn: "Detailed log to track submission status, API response payloads, and clearance warnings.",
      stepsAr: [
        "فتح شاشة سجل ربط زاتكا (ZATCA Integration Log)",
        "فلترة السجلات حسب الحالة (مقبولة REPORTED، تم التخليص CLEARED، مرفوضة REJECTED)",
        "الضغط على السجل للاطلاع على كود استجابة الهيئة وملف الـ XML المعتمد",
        "في حال وجود تحذيرات أو أخطاء: قراءة تفاصيل رسالة الخطأ لمعالجتها",
        "إعادة إرسال الفاتورة بعد تصحيح البيانات إن تطلب الأمر"
      ],
      stepsEn: [
        "Open ZATCA Integration Log",
        "Filter logs by status (CLEARED, REPORTED, REJECTED, WARNINGS)",
        "Click any log entry to view ZATCA response code and signed XML payload",
        "If warnings or errors exist: inspect error message details to resolve",
        "Re-submit invoice after correcting data if required"
      ]
    },

    "e-invoicing-sync": {
      icon: "🔄",
      summaryAr: "إدارة ومزامنة الفواتير غير المرسلة أو المعلقة دفعة واحدة مع منصة زاتكا.",
      summaryEn: "Batch synchronization tool for queued and pending invoices with ZATCA.",
      stepsAr: [
        "فتح شاشة مزامنة الفوترة الإلكترونية",
        "الاطلاع على عدد الفواتير المعلقة بانتظار الإرسال أو التدقيق",
        "الضغط على «بدء المزامنة (Start Sync)» لمعالجة الفواتير دفعة واحدة",
        "مراجعة النتائج والتأكد من إرسال كافة الفواتير بنجاح",
        "التحقق من عمل المهمة المجدولة (Background Job) بشكل منتظم"
      ],
      stepsEn: [
        "Open Electronic Invoicing Sync dashboard",
        "Check count of pending or queued invoices awaiting transmission",
        "Click «Start Sync» to batch process and transmit invoices",
        "Review results and confirm all invoices transmitted successfully",
        "Verify background scheduled task runs periodically without errors"
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

    const rawSteps = isArabic ? data.stepsAr : data.stepsEn;
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
              "Open " + title,
              "Fill in the required information and fields",
              "Review and verify mandatory values",
              "Save and submit the record"
            ]);

    const existing = root.querySelector(".erp-modal-overlay") || document.querySelector(".erp-modal-overlay");
    if (existing) existing.remove();

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
          aria-label="${isArabic ? "إغلاق" : "Close"}"
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

    const launchBtn = overlay.querySelector("[data-modal-launch]");
    if (launchBtn) {
      launchBtn.addEventListener("click", () => {
        closeModal();
        if (data.itemName) openRoute(data.itemName);
      });
    }

    function closeModal() {



      overlay.classList.remove(

        "is-visible"

      );



      overlay.addEventListener(

        "transitionend",

        () => overlay.remove(),

        { once: true }

      );



    }





    overlay

      .querySelector("[data-modal-close]")

      .addEventListener(

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





                      const isReport = reportNames.has(itemName) || /report|تقرير|تقارير/i.test(cardName) || /report|تقرير/i.test(itemName);
                      const infoBtn = (!isReport && desc)
                        ? `
                          <button
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

                      erp-card

                      tone-${(sectionIndex + cardIndex) % 5}

                    "

                    data-erp-card

                  >



                    <button

                      type="button"

                      class="erp-card-heading"

                      data-card-toggle

                      aria-expanded="false"

                    >



                      <span class="erp-icon">

                        ${icon}

                      </span>



                      <span class="erp-card-title">

                        ${escapeHtml(translate(cardName))}

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
    if (!footerEl) return;

    const footerData = {
      phone: window.frappe?.boot?.theme_settings?.phone || "+966126810486",
      email: window.frappe?.boot?.theme_settings?.email || "sales@mubtkir.com",
      website: window.frappe?.boot?.theme_settings?.website || "www.mubtkir.com"
    };

    const phoneLabel = isArabic ? "الهاتف الموحد" : "Phone";
    const emailLabel = isArabic ? "البريد الإلكتروني" : "Email";
    const websiteLabel = isArabic ? "الموقع" : "Website";
    const waNumber = String(footerData.phone || "+966126810486").replace(/\D/g, "");

    footerEl.innerHTML = `
      <div class="erp-footer-inner">
        <div class="erp-footer-item">
          <span class="erp-footer-icon">📞</span>
          <span class="erp-footer-label">${escapeHtml(phoneLabel)}:</span>
          <a href="https://wa.me/${waNumber}" class="erp-footer-link" target="_blank" rel="noopener" dir="ltr">${escapeHtml(footerData.phone)}</a>
        </div>
        <span class="erp-footer-sep">|</span>
        <div class="erp-footer-item">
          <span class="erp-footer-icon">✉️</span>
          <span class="erp-footer-label">${escapeHtml(emailLabel)}:</span>
          <a href="mailto:${footerData.email}" class="erp-footer-link">${escapeHtml(footerData.email)}</a>
        </div>
        <span class="erp-footer-sep">|</span>
        <div class="erp-footer-item">
          <span class="erp-footer-icon">🌐</span>
          <span class="erp-footer-label">${escapeHtml(websiteLabel)}:</span>
          <a href="https://${footerData.website}" class="erp-footer-link" target="_blank" rel="noopener">${escapeHtml(footerData.website)}</a>
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
            itemName: itemName,
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





      const shouldOpen =

        !selectedCard.classList.contains(

          "is-open"

        );





      content

        .querySelectorAll(

          "[data-erp-card]"

        )

        .forEach(card => {



          if (card !== selectedCard) {



            card.classList.remove(

              "is-open"

            );



            card

              .querySelector(

                "[data-card-toggle]"

              )

              ?.setAttribute(

                "aria-expanded",

                "false"

              );



          }



        });





      if (shouldOpen) {



        selectedCard.classList.add(

          "is-open"

        );



        cardButton.setAttribute(

          "aria-expanded",

          "true"

        );



      } else {



        selectedCard.classList.remove(

          "is-open"

        );



        cardButton.setAttribute(

          "aria-expanded",

          "false"

        );



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