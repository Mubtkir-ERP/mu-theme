(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم إدارة المشتريات — ERPNext Buying
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
     ١. إحصائيات المشتريات
  ───────────────────────────────────────── */

  const statsCards = [
    {
      id: "open-material-requests",
      short: "MRQ",
      labelEn: "Open Material Requests",
      labelAr: "طلبات مواد مفتوحة",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "Material Request",
              filters: { docstatus: 1, status: ["in", ["Pending", "Partially Ordered"]] }
            },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "pending-purchase-orders",
      short: "POR",
      labelEn: "Pending Purchase Orders",
      labelAr: "أوامر شراء معلقة",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "Purchase Order",
              filters: {
                docstatus: 1,
                status: ["in", ["To Receive and Bill", "To Receive", "To Bill"]]
              }
            },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "unpaid-invoices",
      short: "PINV",
      labelEn: "Unpaid Invoices",
      labelAr: "فواتير بانتظار السداد",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "Purchase Invoice",
              filters: { docstatus: 1, outstanding_amount: [">", 0] }
            },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "suppliers",
      short: "SUP",
      labelEn: "Total Suppliers",
      labelAr: "إجمالي الموردين",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: { doctype: "Supplier" },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    }
  ];

  /* ─────────────────────────────────────────
     ٢. أزرار الاختصارات السريعة
  ───────────────────────────────────────── */

  const quickActionButtons = [
    {
      doctype: "Purchase Order",
      labelEn: "New Purchase Order",
      labelAr: "أمر شراء جديد"
    },
    {
      doctype: "Purchase Invoice",
      labelEn: "New Purchase Invoice",
      labelAr: "فاتورة مشتريات جديدة"
    },
    {
      doctype: "Supplier",
      labelEn: "New Supplier",
      labelAr: "مورد جديد"
    },
    {
      doctype: "Item",
      labelEn: "New Item",
      labelAr: "منتج جديد"
    }
  ];

  /* ─────────────────────────────────────────
     ٣. إعدادات الفوتر
  ───────────────────────────────────────── */

  const footerInfo = {
    phone: "0115110455",
    email: "sales@mubtkir.com",
    website: "www.mubtkir.com",
    labels: {
      phoneEn: "Phone", phoneAr: "الهاتف الموحد",
      emailEn: "Email", emailAr: "البريد الإلكتروني",
      websiteEn: "Website", websiteAr: "الموقع"
    }
  };

  /* ─────────────────────────────────────────
     ٤. بطاقات المشتريات — مطابقة للصورة الأصلية
  ───────────────────────────────────────── */

  const sections = [
    [
      "Reports & Masters",
      [
        // الصف الأول
        [
          "Buying",
          "🛒",
          [
            "Material Request",
            "Purchase Order",
            "Purchase Invoice",
            "Request for Quotation",
            "Supplier Quotation"
          ]
        ],
        [
          "Items & Pricing",
          "🏷️",
          [
            "Item",
            "Item Price",
            "Price List",
            "Product Bundle",
            "Item Group",
            "Promotional Scheme",
            "Pricing Rule"
          ]
        ],
        [
          "Settings",
          "⚙️",
          [
            "Buying Settings",
            "Purchase Taxes and Charges Template",
            "Terms and Conditions Template"
          ]
        ],

        // الصف الثاني
        [
          "Supplier",
          "🏭",
          [
            "Supplier",
            "Supplier Group",
            "Contact",
            "Address"
          ]
        ],
        [
          "Supplier Scorecard",
          "🎯",
          [
            "Supplier Scorecard",
            "Supplier Scorecard Variable",
            "Supplier Scorecard Criteria",
            "Supplier Scorecard Standing"
          ]
        ],
        [
          "Key Reports",
          "📊",
          [
            "Purchase Analytics",
            "Purchase Order Analysis",
            "Supplier-Wise Sales Analytics",
            "Items to Order and Receive",
            "Purchase Order Trends",
            "Procurement Tracker"
          ]
        ],

        // الصف الثالث
        [
          "Other Reports",
          "📑",
          [
            "Items To Be Requested",
            "Item-wise Purchase History",
            "Purchase Receipt Trends",
            "Purchase Invoice Trends",
            "Subcontracted Raw Materials To Be Transferred",
            "Subcontracted Item To Be Received",
            "Supplier Quotation Comparison",
            "Material Requests for which Supplier Quotations are not created",
            "Supplier Addresses And Contacts"
          ]
        ],
        [
          "Regional",
          "🌐",
          [
            "Import Supplier Invoice"
          ]
        ]
      ]
    ]
  ];

  /* ─────────────────────────────────────────
     ٥. الترجمات العربية
  ───────────────────────────────────────── */

  const arabicFallback = {
    "Reports & Masters": "التقارير والبيانات الرئيسية",

    // المربع ١: المشتريات
    "Buying": "المشتريات",
    "Material Request": "طلب مواد",
    "Purchase Order": "أمر شراء",
    "Purchase Invoice": "فاتورة مشتريات",
    "Request for Quotation": "طلب عرض سعر من مورد",
    "Supplier Quotation": "عرض سعر المورد",

    // المربع ٢: المنتجات والتسعير
    "Items & Pricing": "المنتجات والتسعير",
    "Item": "المنتج",
    "Item Price": "سعر المنتج",
    "Price List": "قائمة الأسعار",
    "Product Bundle": "حزمة المنتجات",
    "Item Group": "مجموعة المنتجات",
    "Promotional Scheme": "خطة العروض الترويجية",
    "Pricing Rule": "قاعدة التسعير",

    // المربع ٣: الإعدادات
    "Settings": "الإعدادات",
    "Buying Settings": "إعدادات المشتريات",
    "Purchase Taxes and Charges Template": "قالب ضرائب ورسوم المشتريات",
    "Terms and Conditions Template": "قالب الشروط والأحكام",

    // المربع ٤: الموردين
    "Supplier": "المورد",
    "Supplier Group": "مجموعة الموردين",
    "Contact": "جهة الاتصال",
    "Address": "العنوان",

    // المربع ٥: بطاقة تقييم المورد
    "Supplier Scorecard": "بطاقة تقييم المورد",
    "Supplier Scorecard Variable": "متغير تقييم المورد",
    "Supplier Scorecard Criteria": "معايير تقييم المورد",
    "Supplier Scorecard Standing": "تصنيف وتقييم المورد",

    // المربع ٦: التقارير الرئيسية
    "Key Reports": "التقارير الرئيسية",
    "Purchase Analytics": "تحليلات المشتريات",
    "Purchase Order Analysis": "تحليل أوامر الشراء",
    "Supplier-Wise Sales Analytics": "تحليلات المبيعات حسب المورد",
    "Items to Order and Receive": "منتجات للطلب والاستلام",
    "Purchase Order Trends": "اتجاهات أوامر الشراء",
    "Procurement Tracker": "متتبع المشتريات والتوريد",

    // المربع ٧: تقارير أخرى
    "Other Reports": "تقارير أخرى",
    "Items To Be Requested": "منتجات بانتظار الطلب",
    "Item-wise Purchase History": "سجل المشتريات حسب المنتج",
    "Purchase Receipt Trends": "اتجاهات إيصالات الاستلام",
    "Purchase Invoice Trends": "اتجاهات فواتير المشتريات",
    "Subcontracted Raw Materials To Be Transferred": "مواد خام التعاقد من الباطن بانتظار النقل",
    "Subcontracted Item To Be Received": "منتجات التعاقد من الباطن بانتظار الاستلام",
    "Supplier Quotation Comparison": "مقارنة عروض أسعار الموردين",
    "Material Requests for which Supplier Quotations are not created": "طلبات مواد بدون عروض أسعار موردين",
    "Supplier Addresses And Contacts": "عناوين وجهات اتصال الموردين",

    // المربع ٨: إقليمي
    "Regional": "إقليمي",
    "Import Supplier Invoice": "استيراد فاتورة المورد"
  };

  /* ─────────────────────────────────────────
     ٦. أنواع المسارات
  ───────────────────────────────────────── */

  const reportNames = new Set([
    "Purchase Analytics",
    "Purchase Order Analysis",
    "Supplier-Wise Sales Analytics",
    "Items to Order and Receive",
    "Purchase Order Trends",
    "Procurement Tracker",
    "Items To Be Requested",
    "Item-wise Purchase History",
    "Purchase Receipt Trends",
    "Purchase Invoice Trends",
    "Subcontracted Raw Materials To Be Transferred",
    "Subcontracted Item To Be Received",
    "Supplier Quotation Comparison",
    "Material Requests for which Supplier Quotations are not created",
    "Supplier Addresses And Contacts"
  ]);

  const treeDocs = new Set([
    "Supplier Group",
    "Item Group"
  ]);

  const singleDocs = new Set([
    "Buying Settings",
    "Import Supplier Invoice"
  ]);

  /* ─────────────────────────────────────────
     ٧. تفاصيل الشاشات والإعدادات (ما عدا التقارير)
  ───────────────────────────────────────── */

  const itemDescriptions = {
    // ═══ المشتريات ═══
    "Material Request": {
      icon: "📋",
      summaryAr: "إنشاء طلب احتياج مواد داخلي من الأقسام أو المشاريع للشراء أو التحويل أو التصنيع أو الاستهلاك.",
      summaryEn: "Create internal material requisition from departments or projects for purchase, transfer, or manufacturing.",
      stepsAr: [
        "اضغط «طلب مواد جديد»",
        "حدد غرض الطلب (شراء، تحويل مخزني، تصنيع، استخدام عميل)",
        "أدخل المنتجات والكميات المطلوبة وتاريخ الاحتياج",
        "حدد المستودع المستهدف",
        "اضغط «حفظ» ثم «تسجيل» للاعتماد"
      ],
      stepsEn: [
        "Click «New Material Request»",
        "Select purpose (Purchase, Transfer, Manufacture, Customer Issue)",
        "Add required items, quantities, and required by date",
        "Set target warehouse",
        "Click «Save» then «Submit»"
      ]
    },

    "Purchase Order": {
      icon: "📦",
      summaryAr: "إصدار أمر شراء رسمي للمورد بالكميات والأسعار المتفق عليها وتتبع مواعيد التسليم والفواتير.",
      summaryEn: "Issue official purchase orders to suppliers with agreed quantities, rates, delivery dates, and terms.",
      stepsAr: [
        "اضغط «أمر شراء جديد» أو أنشئه من طلب مواد أو عرض سعر مورد",
        "اختر المورد وتاريخ التسليم المتوقع",
        "راجع المنتجات والكميات والأسعار ومستودع الاستلام",
        "تأكد من قالب الضرائب والشروط",
        "اضغط «حفظ» ثم «تسجيل» لإرساله للمورد"
      ],
      stepsEn: [
        "Click «New Purchase Order» or generate from Material Request / Supplier Quotation",
        "Select supplier and expected delivery date",
        "Verify items, quantities, rates, and receiving warehouse",
        "Ensure tax templates and payment terms are applied",
        "Click «Save» then «Submit»"
      ]
    },

    "Purchase Invoice": {
      icon: "🧾",
      summaryAr: "تسجيل فواتير المشتريات الواردة من الموردين وتوليد قيود الذمم الدائنة وضريبة المدخلات ومطابقتها مع الاستلام.",
      summaryEn: "Record vendor purchase invoices, post accounts payable and input VAT, and match with receipts.",
      stepsAr: [
        "اضغط «فاتورة مشتريات جديدة» أو أنشئها من أمر شراء أو سند استلام",
        "اختر المورد ورقم وتاريخ فاتورة المورد",
        "راجع المنتجات والكميات والأسعار المفوترة",
        "تأكد من حساب ضريبة القيمة المضافة 15%",
        "اضغط «حفظ» ثم «تسجيل» لترحيل الفاتورة في الحسابات"
      ],
      stepsEn: [
        "Click «New Purchase Invoice» or create from Purchase Order / Receipt",
        "Select supplier, supplier invoice number, and date",
        "Verify billed items, quantities, and rates",
        "Ensure 15% input VAT ledger is calculated",
        "Click «Save» then «Submit» to post to ledgers"
      ]
    },

    "Request for Quotation": {
      icon: "✉️",
      summaryAr: "إرسال طلبات عروض أسعار لموردين متعددين لمقارنة الأسعار وشروط التوريد لاختيار العرض الأفضل.",
      summaryEn: "Send requests for quotation to multiple suppliers to compare rates and terms for optimal selection.",
      stepsAr: [
        "اضغط «طلب عرض سعر جديد» أو أنشئه من طلب مواد",
        "أضف قائمة الموردين المراد استدراج عروضهم",
        "أضف المنتجات والكميات المطلوبة وتاريخ التقديم النهائي",
        "اضغط «حفظ» ثم «تسجيل» لإرساله عبر البريد الإلكتروني للموردين"
      ],
      stepsEn: [
        "Click «New Request for Quotation» or create from Material Request",
        "Add candidate suppliers list",
        "Add requested items, quantities, and submission deadline",
        "Click «Save» then «Submit» to email suppliers"
      ]
    },

    "Supplier Quotation": {
      icon: "💬",
      summaryAr: "تسجيل الأسعار والعروض المستلمة من الموردين وتثبيت الشروط وتاريخ صلاحية العرض.",
      summaryEn: "Record incoming supplier quotation responses, pricing, payment terms, and validity.",
      stepsAr: [
        "اضغط «عرض سعر مورد جديد» أو أنشئه من طلب عرض سعر",
        "اختر المورد وتاريخ صلاحية العرض",
        "أدخل الأسعار المقدمة والخصومات ومواعيد التسليم",
        "اضغط «حفظ» ثم «تسجيل» للمقارنة والاعتماد"
      ],
      stepsEn: [
        "Click «New Supplier Quotation» or create from Request for Quotation",
        "Select supplier and quotation validity period",
        "Enter quoted rates, discounts, and lead times",
        "Click «Save» then «Submit»"
      ]
    },

    // ═══ المنتجات والتسعير ═══
    "Item": {
      icon: "📦",
      summaryAr: "بطاقة المنتج لتعريف المنتجات والمواد الخام وتحديد وحدات الشراء ومستويات إعادة الطلب ومستودعات التخزين.",
      summaryEn: "Item master defining raw materials, purchase units of measure, reorder levels, and storage locations.",
      stepsAr: [
        "اضغط «منتج جديد»",
        "أدخل رمز المنتج واسمه ومجموعته",
        "حدد وحدة قياس الشراء والباركود ومستودع الاستلام الافتراضي",
        "أدخل سعر الشراء التقديري وقالب الضريبة",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Item»",
        "Enter item code, name, and group",
        "Set purchase unit of measure, barcode, and default warehouse",
        "Set default purchase price and tax template",
        "Click «Save»"
      ]
    },

    "Item Price": {
      icon: "💲",
      summaryAr: "تحديد أسعار الشراء للمنتجات بحسب قوائم أسعار الموردين والعملات المعتمدة.",
      summaryEn: "Maintain purchase price lists and vendor rates per item in supported currencies.",
      stepsAr: [
        "اضغط «سعر منتج جديد»",
        "اختر المنتج وقائمة أسعار الشراء",
        "أدخل السعر وتاريخ الصلاحية",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Item Price»",
        "Select item and Buying Price List",
        "Enter rate and effective dates",
        "Click «Save»"
      ]
    },

    "Price List": {
      icon: "📋",
      summaryAr: "إنشاء وإدارة قوائم أسعار الشراء للموردين والعملات والبلدان المرتبطة بها.",
      summaryEn: "Manage buying price lists for supplier procurement and currency mappings.",
      stepsAr: [
        "اضغط «قائمة أسعار جديدة»",
        "حدد نوع القائمة (شراء Buying)",
        "أدخل اسم القائمة والعملة المعتمدة",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Price List»",
        "Check Buying option",
        "Enter price list title and currency",
        "Click «Save»"
      ]
    },

    "Product Bundle": {
      icon: "🎁",
      summaryAr: "باقات وتجميعات المنتجات المشتراة كحزمة واحدة ويتم تفكيكها إلى مكونات في المخزن.",
      summaryEn: "Procurement product bundles bought as a package and unpacked into individual components.",
      stepsAr: [
        "اضغط «حزمة منتجات جديدة»",
        "اختر منتج الحزمة الرئيسي",
        "أضف المنتجات المكونة والكميات الخاصة بكل مكون",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Product Bundle»",
        "Select parent bundle item",
        "Add component items and bundle quantities",
        "Click «Save»"
      ]
    },

    "Item Group": {
      icon: "🗃️",
      summaryAr: "شجرة تصنيف مجموعات المنتجات لترتيب المواد الخام ومستلزمات التشغيل ومتابعة مشترياتها.",
      summaryEn: "Hierarchical item groups for categorizing raw materials and operating supplies.",
      stepsAr: [
        "اضغط «مجموعة منتجات جديدة»",
        "أدخل اسم المجموعة وحدد المجموعة الأب",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Item Group»",
        "Enter group name and parent group",
        "Click «Save»"
      ]
    },

    "Promotional Scheme": {
      icon: "🎉",
      summaryAr: "خطط العروض والخصومات الممنوحة من الموردين بناءً على كميات الشراء الإجمالية.",
      summaryEn: "Vendor promotional schemes and tiered discount agreements on procurement volume.",
      stepsAr: [
        "اضغط «خطة عروض ترويجية جديدة»",
        "أدخل اسم العرض وتاريخ السريان",
        "حدد شروط الحصول على الخصم أو المنتجات المجانية",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Promotional Scheme»",
        "Enter scheme title and validity dates",
        "Configure qualification thresholds and benefits",
        "Click «Save»"
      ]
    },

    "Pricing Rule": {
      icon: "⚖️",
      summaryAr: "قواعد الخصومات وأسعار الشراء التلقائية من الموردين بحسب شرائح الكميات.",
      summaryEn: "Automated purchasing pricing rules and volume-based discounts from vendors.",
      stepsAr: [
        "اضغط «قاعدة تسعير جديدة»",
        "حدد نوع القاعدة على الشراء (Buying)",
        "حدد الشروط (الكمية، المورد، المنتج)",
        "أدخل نسبة الخصم أو السعر التعاقدي",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Pricing Rule»",
        "Set rule type to Buying",
        "Configure criteria (quantity, supplier, item)",
        "Enter discount percentage or special rate",
        "Click «Save»"
      ]
    },

    // ═══ الإعدادات ═══
    "Buying Settings": {
      icon: "⚙️",
      summaryAr: "شاشة الإعدادات العامة للمشتريات لضبط سياسات التوريد، وسقوف الصلاحيات واعتماد أوامر الشراء، وإلزامية إيصالات الاستلام قبل الفوترة، وضبط نسب السماح بتجاوز الكميات والأسعار.",
      summaryEn: "General procurement configuration to set purchasing policies, authorization thresholds, mandatory receipt before billing, and quantity/price variance allowances.",
      stepsAr: [
        "تحديد ما إذا كانت فاتورة الشراء تتطلب أمراً أو إيصال استلام مسبق",
        "ضبط نسبة السماح بالزيادة في كميات الاستلام أو الفوترة مقارنة بأمر الشراء",
        "تحديد حسابات المشتريات ومصروفات الشحن الافتراضية",
        "تفعيل تجميد الأسعار والتحقق من عدم تجاوز أسعار الموردين المعيارية",
        "ضبط سياسات التنبيه التلقائي للمشتريات المتأخرة عن مواعيد التوريد"
      ],
      stepsEn: [
        "Configure mandatory purchase order / receipt matching before billing",
        "Set tolerance percentages for over-receipt and over-billing",
        "Set default purchase, freight, and tax expense accounts",
        "Enable purchase rate lock and standard vendor price variance checks",
        "Configure automated alerts for delayed vendor shipments"
      ]
    },

    "Purchase Taxes and Charges Template": {
      icon: "🧾",
      summaryAr: "قوالب الضرائب والرسوم على المشتريات (ضريبة القيمة المضافة المدخلات 15%) وتحديد حساب الضريبة المستردة.",
      summaryEn: "Purchase tax templates (15% input VAT) and recoverable tax ledger mappings.",
      stepsAr: [
        "اضغط «قالب ضرائب مشتريات جديد»",
        "أدخل اسم القالب واختر حساب ضريبة المدخلات",
        "حدد نسبة الضريبة (15%)",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Purchase Taxes and Charges Template»",
        "Enter template name and select Input VAT ledger",
        "Set tax percentage (15%)",
        "Click «Save»"
      ]
    },

    "Terms and Conditions Template": {
      icon: "📜",
      summaryAr: "قوالب الشروط والأحكام الخاصة بأوامر الشراء (شروط الدفع، سياسات الفحص، وفترات التوريد).",
      summaryEn: "Standard procurement terms templates covering payment, inspection, and delivery.",
      stepsAr: [
        "اضغط «قالب شروط وأحكام جديد»",
        "أدخل عنوان القالب وبنود التوريد والفحص وشروط الدفع",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Terms and Conditions Template»",
        "Enter title and terms clauses",
        "Click «Save»"
      ]
    },

    // ═══ الموردين ═══
    "Supplier": {
      icon: "🏭",
      summaryAr: "إنشاء وإدارة بيانات الموردين، الحسابات المالية، أرقام السجلات والضرائب، شروط الدفع، وتقييم الأداء.",
      summaryEn: "Create and manage supplier profiles, tax details, ledger accounts, payment terms, and ratings.",
      stepsAr: [
        "اضغط «مورد جديد»",
        "أدخل اسم المورد ونوعه (شركة أو فرد)",
        "اختر مجموعة المورد وأدخل الرقم الضريبي والسجل التجاري",
        "أضف العنوان وجهات الاتصال",
        "حدد شروط الدفع والعملة وحساب الذمم الدائنة",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Supplier»",
        "Enter supplier name and type (Company or Individual)",
        "Select supplier group, Tax ID, and CR number",
        "Add address and contact details",
        "Set payment terms, currency, and payable account",
        "Click «Save»"
      ]
    },

    "Supplier Group": {
      icon: "🗂️",
      summaryAr: "تصنيف الموردين إلى فئات (محلي، خارجي، خدمات، مقاولات) لضبط شروط الدفع وإدارة الموردين.",
      summaryEn: "Categorize suppliers into hierarchical groups (Local, Foreign, Services, Subcontractors).",
      stepsAr: [
        "اضغط «مجموعة موردين جديدة»",
        "أدخل اسم المجموعة وحدد المجموعة الأب",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Supplier Group»",
        "Enter group name and parent group",
        "Click «Save»"
      ]
    },

    "Contact": {
      icon: "📞",
      summaryAr: "دليل مسؤولي المبيعات والمتابعة لدى الموردين وأرقام التواصل المباشرة والبريد الإلكتروني.",
      summaryEn: "Directory of vendor contact representatives, phone numbers, and emails.",
      stepsAr: [
        "اضغط «جهة اتصال جديدة»",
        "أدخل الاسم والمنصب الوظيفي لدى المورد",
        "أدخل رقم الجوال والبريد",
        "اربط جهة الاتصال بالمورد المعني",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Contact»",
        "Enter person name and title at supplier",
        "Enter phone and email",
        "Link contact to supplier",
        "Click «Save»"
      ]
    },

    "Address": {
      icon: "📍",
      summaryAr: "عناوين ومستودعات ومواقع الموردين لاستلام البضائع وإدارة الشحن والمراسلات الرسمية.",
      summaryEn: "Supplier addresses, warehouses, and locations for dispatch and correspondence.",
      stepsAr: [
        "اضغط «عنوان جديد»",
        "أدخل بيانات الشارع والحي والمدينة والرمز البريدي",
        "اربط العنوان بالمورد المعني",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Address»",
        "Enter street, city, and postal code details",
        "Link address to supplier",
        "Click «Save»"
      ]
    },

    // ═══ بطاقة تقييم المورد ═══
    "Supplier Scorecard": {
      icon: "🎯",
      summaryAr: "بطاقة تقييم أداء المورد الدورية من حيث جودة المنتجات، الالتزام بمواعيد التوريد، ومطابقة الأسعار.",
      summaryEn: "Periodic supplier performance scorecard measuring quality, on-time delivery, and price accuracy.",
      stepsAr: [
        "اضغط «بطاقة تقييم مورد جديدة»",
        "اختر المورد وفترة التقييم (شهرية، ربع سنوية)",
        "حدد المعايير والمتغيرات المستخدمة في احتساب الدرجة",
        "اضغط «حفظ» لحساب النتيجة وتحديد تصنيف المورد"
      ],
      stepsEn: [
        "Click «New Supplier Scorecard»",
        "Select supplier and evaluation period",
        "Assign scoring criteria and calculation variables",
        "Click «Save» to compute score and standing"
      ]
    },

    "Supplier Scorecard Variable": {
      icon: "📐",
      summaryAr: "تعريف المتغيرات والمعادلات الإحصائية المستخدمة في قياس أداء الموردين (مثل نسبة المردودات أو التأخير).",
      summaryEn: "Define quantitative metrics and formulas for vendor evaluation (rejection rate, delay days).",
      stepsAr: [
        "اضغط «متغير تقييم مورد جديد»",
        "أدخل اسم المتغير والمسار البرمجي أو المعادلة الحسابية",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Supplier Scorecard Variable»",
        "Enter variable name and measurement formula",
        "Click «Save»"
      ]
    },

    "Supplier Scorecard Criteria": {
      icon: "⚖️",
      summaryAr: "تحديد معايير التقييم والأوزان النسبية لكل معيار (الجودة 40%، سرعة التوريد 30%، السعر 30%).",
      summaryEn: "Define evaluation criteria and weighting percentages (Quality, Delivery, Pricing).",
      stepsAr: [
        "اضغط «معيار تقييم مورد جديد»",
        "أدخل اسم المعيار والوزن النسبي والصيغة الرياضية",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Supplier Scorecard Criteria»",
        "Enter criteria title, weight, and formula",
        "Click «Save»"
      ]
    },

    "Supplier Scorecard Standing": {
      icon: "🏆",
      summaryAr: "تحديد مراتب ومستويات تصنيف الموردين (ممتاز A، جيد B، تحت المراقبة C، محظور D).",
      summaryEn: "Define supplier classification tiers and status ratings (e.g., Preferred, Approved, Probation).",
      stepsAr: [
        "اضغط «تصنيف مورد جديد»",
        "أدخل اسم التصنيف والحد الأدنى للدرجات المطلوبة",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Supplier Scorecard Standing»",
        "Enter standing level and minimum qualifying score",
        "Click «Save»"
      ]
    },

    // ═══ إقليمي ═══
    "Import Supplier Invoice": {
      icon: "📥",
      summaryAr: "أداة استيراد فواتير الموردين من ملفات إلكترونية (XML / JSON / Excel) ومطابقتها آلياً مع أوامر الشراء.",
      summaryEn: "Tool to import vendor e-invoices from XML, JSON, or Excel files and auto-match with Purchase Orders.",
      stepsAr: [
        "افتح «استيراد فاتورة المورد»",
        "ارفع ملف الفاتورة الإلكترونية المستلمة من المورد",
        "راجع البيانات المستخلصة وتطابق المنتجات والمبالغ",
        "اضغط «إنشاء فاتورة الشراء» لتسجيلها بالنظام"
      ],
      stepsEn: [
        "Open «Import Supplier Invoice»",
        "Upload supplier invoice electronic file",
        "Review parsed fields, items, and tax amounts",
        "Click «Create Purchase Invoice» to post"
      ]
    }
  };

  /* ─────────────────────────────────────────
     ٨. دوال مساعدة
  ───────────────────────────────────────── */

  function translate(name) {
    if (!isArabic) return name;
    if (arabicFallback[name]) return arabicFallback[name];
    if (typeof window.__ === "function") return window.__(name);
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
    const n = parseFloat(num) || 0;
    if (n % 1 !== 0) {
      return n.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    return n.toLocaleString("en-US");
  }

  /* ─────────────────────────────────────────
     ٩. نافذة التفاصيل المنبثقة
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

    // إزالة أي نافذة سابقة مفتوحة
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
     ١٠. إنشاء بطاقات الإحصائيات
  ───────────────────────────────────────── */

  function renderStats() {
    if (!statsSection) return;

    statsSection.innerHTML = `
      <div class="erp-stats-grid">
        ${statsCards.map(c => `
          <div class="erp-stat-card" data-stat-id="${escapeHtml(c.id)}">
            <div class="erp-stat-badge">${escapeHtml(c.short)}</div>
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
     ١١. إنشاء أزرار الاختصارات السريعة
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
            <button type="button" class="erp-quick-btn" data-new-doc="${escapeHtml(btn.doctype)}">
              <span class="erp-quick-icon" aria-hidden="true">+</span>
              <span class="erp-quick-label">${escapeHtml(label)}</span>
            </button>`;
        }).join("")}
      </div>
    `;

    quickActions.addEventListener("click", event => {
      const btn = event.target.closest("[data-new-doc]");
      if (!btn) return;
      const doctype = btn.dataset.newDoc;
      if (window.frappe && typeof frappe.new_doc === "function") {
        frappe.new_doc(doctype);
      }
    });
  }

  /* ─────────────────────────────────────────
     ١٢. إنشاء بطاقات الوحدات والمربعات
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
              const detailsLabel = isArabic ? "تفاصيل" : "Details";
              const infoBtn = desc
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
     ١٣. إنشاء الفوتر
  ───────────────────────────────────────── */

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
     ١٤. التوجيه وفتح الشاشات داخل النظام
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
     ١٥. معالجة الأحداث والضغط
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
     ١٦. التهيئة الأولية
  ───────────────────────────────────────── */

  renderStats();
  renderQuickActions();
  renderSections();
  renderFooter();
})();
