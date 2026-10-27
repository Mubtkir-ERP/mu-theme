(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم إدارة المبيعات — ERPNext Selling
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
     ١. إحصائيات المبيعات
  ───────────────────────────────────────── */

  const statsCards = [
    {
      id: "open-quotations",
      short: "QUO",
      labelEn: "Open Quotations",
      labelAr: "عروض أسعار معلقة",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "Quotation",
              filters: { docstatus: 1, status: "Open" }
            },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "pending-sales-orders",
      short: "ORD",
      labelEn: "Pending Orders",
      labelAr: "أوامر بيع قيد التنفيذ",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "Sales Order",
              filters: {
                docstatus: 1,
                status: ["in", ["To Deliver and Bill", "To Deliver", "To Bill"]]
              }
            },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "unpaid-invoices",
      short: "INV",
      labelEn: "Unpaid Invoices",
      labelAr: "فواتير بانتظار التحصيل",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "Sales Invoice",
              filters: { docstatus: 1, outstanding_amount: [">", 0] }
            },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "customers",
      short: "CUS",
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
    }
  ];

  /* ─────────────────────────────────────────
     ٢. أزرار الاختصارات السريعة (محفوظة كما هي)
  ───────────────────────────────────────── */

  const quickActionButtons = [
    {
      doctype: "Quotation",
      labelEn: "New Quotation",
      labelAr: "عرض سعر جديد"
    },
    {
      doctype: "Sales Order",
      labelEn: "New Sales Order",
      labelAr: "أمر بيع جديد"
    },
    {
      doctype: "Sales Invoice",
      labelEn: "New Sales Invoice",
      labelAr: "فاتورة مبيعات جديدة"
    },
    {
      doctype: "Customer",
      labelEn: "New Customer",
      labelAr: "عميل جديد"
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
     ٤. بطاقات المبيعات (استبدال نقاط البيع بالعملاء)
  ───────────────────────────────────────── */

  const sections = [
    [
      "Reports & Masters",
      [
        // الصف الأول
        [
          "Selling",
          "💼",
          [
            "Customer",
            "Quotation",
            "Sales Order",
            "Sales Invoice",
            "Blanket Order",
            "Sales Partner",
            "Sales Person"
          ]
        ],
        // تم استبدال مربع نقاط البيع بمربع العملاء
        [
          "Customer",
          "👥",
          [
            "Customer",
            "Customer Group",
            "Contact",
            "Address",
            "Territory"
          ]
        ],
        [
          "Items and Pricing",
          "🏷️",
          [
            "Item",
            "Item Price",
            "Price List",
            "Item Group",
            "Product Bundle",
            "Promotional Scheme",
            "Pricing Rule",
            "Shipping Rule",
            "Coupon Code"
          ]
        ],

        // الصف الثاني
        [
          "Settings",
          "⚙️",
          [
            "Selling Settings",
            "Terms and Conditions Template",
            "Sales Taxes and Charges Template",
            "Lead Source",
            "Campaign"
          ]
        ],
        [
          "Key Reports",
          "📊",
          [
            "Sales Analytics",
            "Sales Order Analysis",
            "Sales Funnel",
            "Sales Order Trends",
            "Quotation Trends",
            "Customer Acquisition and Loyalty",
            "Inactive Customers",
            "Sales Person-wise Transaction Summary",
            "Item-wise Sales History"
          ]
        ],
        [
          "Other Reports",
          "📑",
          [
            "Customer Addresses And Contacts",
            "Available Stock for Packing Items",
            "Pending SO Items For Purchase Request",
            "Delivery Note Trends",
            "Sales Invoice Trends",
            "Customer Credit Balance",
            "Customers Without Any Sales Transactions",
            "Sales Partners Commission",
            "Territory Target Variance Based On Item Group",
            "Sales Person Target Variance Based On Item Group",
            "Sales Partner Target Variance Based On Item Group"
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

    // المربع ١: المبيعات
    "Selling": "المبيعات",
    "Customer": "العميل",
    "Quotation": "عرض سعر",
    "Sales Order": "طلب مبيعات",
    "Sales Invoice": "فاتورة مبيعات",
    "Blanket Order": "أمر توريد شامل",
    "Sales Partner": "شريك مبيعات",
    "Sales Person": "مندوب مبيعات",

    // المربع ٢: العملاء (بديل نقاط البيع)
    "Customer Group": "مجموعة العملاء",
    "Contact": "جهة الاتصال",
    "Address": "العنوان",
    "Territory": "المنطقة الجغرافية",

    // المربع ٣: المنتجات والتسعير
    "Items and Pricing": "المنتجات والتسعير",
    "Item": "المنتج",
    "Item Price": "سعر المنتج",
    "Price List": "قائمة الأسعار",
    "Item Group": "مجموعة المنتجات",
    "Product Bundle": "حزمة المنتجات",
    "Promotional Scheme": "خطة العروض الترويجية",
    "Pricing Rule": "قاعدة التسعير",
    "Shipping Rule": "قاعدة الشحن",
    "Coupon Code": "كود الخصم",

    // المربع ٤: الإعدادات
    "Settings": "الإعدادات",
    "Selling Settings": "إعدادات المبيعات",
    "Terms and Conditions Template": "قالب الشروط والأحكام",
    "Sales Taxes and Charges Template": "قالب ضرائب ورسوم المبيعات",
    "Lead Source": "مصدر العميل المحتمل",
    "Campaign": "الحملة التسويقية",

    // المربع ٥: التقارير الرئيسية
    "Key Reports": "التقارير الرئيسية",
    "Sales Analytics": "تحليلات المبيعات",
    "Sales Order Analysis": "تحليل طلبات المبيعات",
    "Sales Funnel": "قمع المبيعات",
    "Sales Order Trends": "اتجاهات طلبات المبيعات",
    "Quotation Trends": "اتجاهات عروض الأسعار",
    "Customer Acquisition and Loyalty": "اكتساب وولاء العملاء",
    "Inactive Customers": "العملاء غير النشطين",
    "Sales Person-wise Transaction Summary": "ملخص معاملات مندوبي المبيعات",
    "Item-wise Sales History": "سجل المبيعات حسب المنتج",

    // المربع ٦: تقارير أخرى
    "Other Reports": "تقارير أخرى",
    "Customer Addresses And Contacts": "عناوين وجهات اتصال العملاء",
    "Available Stock for Packing Items": "المخزون المتاح لمنتجات التعبئة",
    "Pending SO Items For Purchase Request": "منتجات طلبات البيع المعلقة لطلب الشراء",
    "Delivery Note Trends": "اتجاهات أذون التسليم",
    "Sales Invoice Trends": "اتجاهات فواتير المبيعات",
    "Customer Credit Balance": "رصيد العميل الدائن",
    "Customers Without Any Sales Transactions": "عملاء بدون حركات بيع",
    "Sales Partners Commission": "عمولة شركاء المبيعات",
    "Territory Target Variance Based On Item Group": "انحراف أهداف المناطق حسب مجموعة المنتجات",
    "Sales Person Target Variance Based On Item Group": "انحراف أهداف المندوبين حسب مجموعة المنتجات",
    "Sales Partner Target Variance Based On Item Group": "انحراف أهداف الشركاء حسب مجموعة المنتجات"
  };

  /* ─────────────────────────────────────────
     ٦. أنواع المسارات
  ───────────────────────────────────────── */

  const reportNames = new Set([
    "Sales Analytics",
    "Sales Order Analysis",
    "Sales Funnel",
    "Sales Order Trends",
    "Quotation Trends",
    "Customer Acquisition and Loyalty",
    "Inactive Customers",
    "Sales Person-wise Transaction Summary",
    "Item-wise Sales History",
    "Customer Addresses And Contacts",
    "Available Stock for Packing Items",
    "Pending SO Items For Purchase Request",
    "Delivery Note Trends",
    "Sales Invoice Trends",
    "Customer Credit Balance",
    "Customers Without Any Sales Transactions",
    "Sales Partners Commission",
    "Territory Target Variance Based On Item Group",
    "Sales Person Target Variance Based On Item Group",
    "Sales Partner Target Variance Based On Item Group"
  ]);

  const treeDocs = new Set([
    "Customer Group",
    "Territory",
    "Item Group",
    "Sales Person"
  ]);

  const singleDocs = new Set([
    "Selling Settings"
  ]);

  /* ─────────────────────────────────────────
     ٧. تفاصيل الشاشات والإعدادات (ما عدا التقارير)
  ───────────────────────────────────────── */

  const itemDescriptions = {
    // ═══ المبيعات ═══
    "Customer": {
      icon: "👥",
      summaryAr: "إنشاء وإدارة بيانات العملاء، الحسابات المالية، حدود الائتمان، فترات السداد، وسجل الفواتير والمقبوضات.",
      summaryEn: "Create and manage customer records, financial accounts, credit limits, payment terms, and transaction history.",
      stepsAr: [
        "اضغط «عميل جديد»",
        "أدخل اسم العميل ونوع العميل (شركة أو فرد)",
        "اختر مجموعة العميل والمنطقة الجغرافية",
        "أدخل الرقم الضريبي والعنوان وبيانات الاتصال",
        "حدد شروط الدفع والعملة وحد الائتمان",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Customer»",
        "Enter customer name and type (Company or Individual)",
        "Select customer group and territory",
        "Enter Tax ID, address, and contact details",
        "Set payment terms, currency, and credit limit",
        "Click «Save»"
      ]
    },

    "Quotation": {
      icon: "💬",
      summaryAr: "إصدار عروض أسعار رسمية للعملاء متضمنة تفاصيل المنتجات، الأسعار، الضرائب، والشروط، مع إمكانية تحويلها لأمر بيع مباشرة.",
      summaryEn: "Issue official sales quotations to customers with items, pricing, taxes, and terms, convertible to Sales Orders.",
      stepsAr: [
        "اضغط «عرض سعر جديد»",
        "اختر العميل أو العميل المحتمل وتاريخ صلاحية العرض",
        "أضف المنتجات والكميات والأسعار المتفق عليها",
        "تأكد من تطبيق قالب الضرائب والخصومات إن وجدت",
        "أرفق الشروط والأحكام وملاحظات التسليم",
        "اضغط «حفظ» ثم «تسجيل» لإرساله للعميل"
      ],
      stepsEn: [
        "Click «New Quotation»",
        "Select customer or lead and validity date",
        "Add items, quantities, and agreed prices",
        "Ensure tax and discount templates are applied",
        "Attach terms, conditions, and delivery notes",
        "Click «Save» then «Submit» to send to customer"
      ]
    },

    "Sales Order": {
      icon: "📋",
      summaryAr: "تأكيد طلب الشراء من العميل، حجز الكميات من المخزون، وتتبع مراحل التجهيز والتسليم والفوترة.",
      summaryEn: "Confirm customer purchase commitment, reserve inventory, and track fulfillment, delivery, and billing stages.",
      stepsAr: [
        "اضغط «طلب مبيعات جديد» أو أنشئه مباشرة من عرض سعر معتمد",
        "اختر العميل وحدد تاريخ التسليم المطلوب",
        "راجع المنتجات والكميات والأسعار ومستودع الصرف",
        "حدد شروط الدفع والشحن",
        "اضغط «حفظ» ثم «تسجيل» لتأكيد الطلب وبدء التنفيذ"
      ],
      stepsEn: [
        "Click «New Sales Order» or create from approved Quotation",
        "Select customer and set required delivery date",
        "Verify items, quantities, prices, and source warehouse",
        "Set payment and shipping terms",
        "Click «Save» then «Submit» to confirm order"
      ]
    },

    "Sales Invoice": {
      icon: "🧾",
      summaryAr: "إصدار فواتير المبيعات الضريبية الرسمية وترحيل قيود الإيرادات والذمم المدينة وربطها بنظام الفاتورة الإلكترونية.",
      summaryEn: "Generate official tax sales invoices, post revenue and receivable ledgers, and integrate with e-invoicing.",
      stepsAr: [
        "اضغط «فاتورة مبيعات جديدة» أو أنشئها من طلب مبيعات أو أمر تسليم",
        "اختر العميل وتاريخ الفاتورة والاستحقاق",
        "راجع جدول المنتجات والكميات والأسعار",
        "تأكد من قالب ضريبة القيمة المضافة 15%",
        "اضغط «حفظ» ثم «تسجيل» لإصدار الفاتورة وتوليد رمز QR"
      ],
      stepsEn: [
        "Click «New Sales Invoice» or generate from Sales Order / Delivery Note",
        "Select customer, posting date, and due date",
        "Review items, quantities, and prices",
        "Ensure 15% VAT template is applied",
        "Click «Save» then «Submit» to post and generate QR code"
      ]
    },

    "Blanket Order": {
      icon: "📑",
      summaryAr: "اتفاقية توريد سنوية أو دورية مع العميل بكميات وأسعار محددة يتم إصدار طلبات مبيعات فرعية بناءً عليها.",
      summaryEn: "Long-term blanket order agreement with a customer for quantities and prices over a period.",
      stepsAr: [
        "اضغط «أمر توريد شامل جديد»",
        "اختر العميل وحدد فترة سريان الاتفاقية (تاريخ البدء والانتهاء)",
        "أضف المنتجات المشمولة بالاتفاقية وإجمالي الكميات والأسعار",
        "اضغط «حفظ» ثم «تسجيل»"
      ],
      stepsEn: [
        "Click «New Blanket Order»",
        "Select customer and agreement duration (start and end dates)",
        "Add agreed items, total quantities, and contracted rates",
        "Click «Save» then «Submit»"
      ]
    },

    "Sales Partner": {
      icon: "🤝",
      summaryAr: "إدارة بيانات وكلاء وموزعي وشركاء المبيعات واحتساب نسب العمولات المستحقة على المبيعات.",
      summaryEn: "Manage sales partners, distributors, and agents with commission rates and earnings tracking.",
      stepsAr: [
        "اضغط «شريك مبيعات جديد»",
        "أدخل اسم الشريك ونوع الشراكة",
        "حدد نسبة العمولة الافتراضية المستحقة للشريك",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Sales Partner»",
        "Enter partner name and partnership type",
        "Set default commission percentage",
        "Click «Save»"
      ]
    },

    "Sales Person": {
      icon: "👔",
      summaryAr: "بناء الهيكل الشجري لمندوبي ومشرفي المبيعات وتحديد المستهدفات البيعية (Targets) وتتبع العمولات.",
      summaryEn: "Build sales hierarchy for sales representatives, assign targets, and track performance commissions.",
      stepsAr: [
        "اضغط «مندوب مبيعات جديد»",
        "أدخل اسم المندوب والمشرف المباشر في الهيكل الشجري",
        "اربطه بملف الموظف التابع له إن وجد",
        "حدد الأهداف البيعية السنوية أو الشهرية",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Sales Person»",
        "Enter name and parent supervisor in sales hierarchy",
        "Link to employee profile if applicable",
        "Assign periodic sales targets",
        "Click «Save»"
      ]
    },

    // ═══ العملاء ═══
    "Customer Group": {
      icon: "🗂️",
      summaryAr: "تصنيف العملاء إلى مجموعات هرمية (مثل: جملة، تجزئة، شركات، جهات حكومية) لضبط سياسات التسعير والائتمان.",
      summaryEn: "Classify customers into hierarchical groups (e.g., Wholesale, Retail, Corporate) for pricing policies.",
      stepsAr: [
        "اضغط «مجموعة عملاء جديدة»",
        "أدخل اسم المجموعة وحدد المجموعة الأب",
        "حدد قائمة الأسعار الافتراضية وشروط الدفع للمجموعة",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Customer Group»",
        "Enter group name and select parent group",
        "Set default price list and payment terms",
        "Click «Save»"
      ]
    },

    "Contact": {
      icon: "📞",
      summaryAr: "سجل بيانات مسؤولي التواصل وأرقام الهواتف والبريد الإلكتروني للعملاء والموردين والشركاء.",
      summaryEn: "Directory of contact persons, phone numbers, and email addresses for business partners.",
      stepsAr: [
        "اضغط «جهة اتصال جديدة»",
        "أدخل الاسم والمنصب الوظيفي",
        "أدخل رقم الجوال والبريد الإلكتروني",
        "اربط جهة الاتصال بالعميل أو المورد المعني",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Contact»",
        "Enter person name and job title",
        "Enter phone number and email address",
        "Link contact to relevant customer or supplier",
        "Click «Save»"
      ]
    },

    "Address": {
      icon: "📍",
      summaryAr: "إدارة عناوين الشحن والفوترة للعملاء وتوثيق العنوان الوطني والرمز البريدي والمدينة.",
      summaryEn: "Manage shipping and billing addresses for customers with national address details.",
      stepsAr: [
        "اضغط «عنوان جديد»",
        "اختر نوع العنوان (شحن، فوترة، مكتب)",
        "أدخل تفاصيل الشارع والحي والمدينة والرمز البريدي",
        "اربط العنوان بالعميل المعني واجعله افتراضياً إذا لزم",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Address»",
        "Select address type (Shipping, Billing, Office)",
        "Enter street, district, city, and postal code",
        "Link address to customer and mark as default if needed",
        "Click «Save»"
      ]
    },

    "Territory": {
      icon: "🗺️",
      summaryAr: "الهيكل الشجري للمناطق الجغرافية ومناطق التوزيع لضبط مبيعات الفروع والمناطق والمستهدفات.",
      summaryEn: "Hierarchical territory tree for geographical sales assignment, target tracking, and distribution.",
      stepsAr: [
        "اضغط «منطقة جديدة»",
        "أدخل اسم المنطقة (مثل: المنطقة الوسطى - الرياض)",
        "حدد المنطقة الأب في الهيكل الجغرافي",
        "حدد قائمة الأسعار الافتراضية للمنطقة",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Territory»",
        "Enter territory name (e.g. Central Region - Riyadh)",
        "Select parent territory in tree hierarchy",
        "Set default price list for territory",
        "Click «Save»"
      ]
    },

    // ═══ المنتجات والتسعير ═══
    "Item": {
      icon: "📦",
      summaryAr: "تعريف وإدارة بطاقة المنتج (منتجات، خدمات، مواد استهلاكية) وبيانات التسعير والباركود والمخزون.",
      summaryEn: "Create and manage item masters (products, services, consumables), barcodes, pricing, and stock rules.",
      stepsAr: [
        "اضغط «منتج جديد»",
        "أدخل رمز المنتج واسمه ومجموعته",
        "حدد وحدة القياس الافتراضية والباركود",
        "حدد ما إذا كان المنتج مخزوناً أو خدمة أو خاضعاً للإهلاك",
        "أدخل سعر البيع الافتراضي وقالب الضريبة",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Item»",
        "Enter item code, name, and item group",
        "Set default Unit of Measure (UOM) and barcode",
        "Set item type (Maintain Stock, Service, Fixed Asset)",
        "Enter default selling price and tax template",
        "Click «Save»"
      ]
    },

    "Item Price": {
      icon: "💲",
      summaryAr: "تحديد وتحديث أسعار البيع والشراء للمنتجات وربطها بقوائم الأسعار المختلفة والعملات المعتمدة.",
      summaryEn: "Define selling and buying rates for items linked to specific price lists and currencies.",
      stepsAr: [
        "اضغط «سعر منتج جديد»",
        "اختر المنتج وقائمة الأسعار المطلوبة",
        "أدخل السعر وسريان التاريخ إن لزم",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Item Price»",
        "Select item and target price list",
        "Enter rate and effective validity dates",
        "Click «Save»"
      ]
    },

    "Price List": {
      icon: "📋",
      summaryAr: "إنشاء قوائم أسعار متعددة (مثل: أسعار الجملة، التجزئة، كبار العملاء) بعملات محلية ودولية.",
      summaryEn: "Create multiple price lists (e.g., Wholesale, Retail, VIP) in local and foreign currencies.",
      stepsAr: [
        "اضغط «قائمة أسعار جديدة»",
        "أدخل اسم القائمة وحدد نوعها (بيع أو شراء)",
        "حدد العملة المعتمدة للقائمة والدول المطبقة عليها",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Price List»",
        "Enter list name and type (Selling or Buying)",
        "Set authorized currency and applicable countries",
        "Click «Save»"
      ]
    },

    "Item Group": {
      icon: "🗃️",
      summaryAr: "بناء الهيكل الشجري لمجموعات وتصنيفات المنتجات لتنظيم كتالوج المنتجات وتحديد الحسابات الافتراضية.",
      summaryEn: "Build hierarchical item classification tree to organize catalogs and set default accounts.",
      stepsAr: [
        "اضغط «مجموعة منتجات جديدة»",
        "أدخل اسم المجموعة وحدد المجموعة الأب",
        "حدد ما إذا كانت المجموعة تضم منتجاتاً فرعية",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Item Group»",
        "Enter group name and select parent group",
        "Specify if group contains child groups or items",
        "Click «Save»"
      ]
    },

    "Product Bundle": {
      icon: "🎁",
      summaryAr: "تجميع باقات وعروض منتجات (مجموعات مجمعة) تُباع معاً ويتم خصم مكوناتها من المخزون تلقائياً.",
      summaryEn: "Bundle products sold together as packages with automated component deduction from stock.",
      stepsAr: [
        "اضغط «حزمة منتجات جديدة»",
        "اختر المنتج الرئيسي (منتج الحزمة)",
        "أضف المنتجات المكونة والكميات الخاصة بكل مكون",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Product Bundle»",
        "Select parent bundle item",
        "Add child items and their respective bundled quantities",
        "Click «Save»"
      ]
    },

    "Promotional Scheme": {
      icon: "🎉",
      summaryAr: "إعداد العروض والحملات الترويجية (مثل: اشترِ قطعة واحصل على أخرى مجاناً أو خصم إضافي) لفترة محددة.",
      summaryEn: "Configure promotional schemes (Buy 1 Get 1, percentage discount tiers) with validity dates.",
      stepsAr: [
        "اضغط «خطة عروض ترويجية جديدة»",
        "أدخل اسم العرض وتاريخ البدء والانتهاء",
        "حدد شروط تطبيق العرض والمنتجات المستفيدة",
        "حدد نوع المكافأة (منتج مجاني أو نسبة خصم)",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Promotional Scheme»",
        "Enter scheme name, start and end dates",
        "Set qualification criteria and eligible items",
        "Specify benefit (free item or discount rate)",
        "Click «Save»"
      ]
    },

    "Pricing Rule": {
      icon: "⚖️",
      summaryAr: "قواعد تسعير وخصومات تلقائية بناءً على الكميات أو شرائح العملاء أو فترات زمنية محددة.",
      summaryEn: "Automated pricing and discount rules based on quantity thresholds, customer tier, or dates.",
      stepsAr: [
        "اضغط «قاعدة تسعير جديدة»",
        "حدد ما إذا كانت القاعدة مطبقة على سعر البيع أو الخصم",
        "حدد الشروط (الكمية الدنيا، العميل، المنتج)",
        "أدخل نسبة الخصم أو السعر الخاص",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Pricing Rule»",
        "Choose apply on price or discount percentage",
        "Set conditions (min quantity, customer, item)",
        "Enter special rate or discount percent",
        "Click «Save»"
      ]
    },

    "Shipping Rule": {
      icon: "🚚",
      summaryAr: "إعداد قواعد ورسوم الشحن والتوصيل بناءً على الوزن أو قيمة الطلب أو المنطقة الجغرافية.",
      summaryEn: "Configure shipping charges and logistics calculation based on weight, order value, or territory.",
      stepsAr: [
        "اضغط «قاعدة شحن جديدة»",
        "أدخل اسم طريقة الشحن والحساب المحاسبي لمصروف الشحن",
        "حدد معادلة احتساب الرسوم بحسب القيمة أو الوزن",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Shipping Rule»",
        "Enter rule label and freight ledger account",
        "Configure calculation matrix based on value or weight",
        "Click «Save»"
      ]
    },

    "Coupon Code": {
      icon: "🎟️",
      summaryAr: "إصدار وتتبع كوبونات وأكواد الخصم الترويجية وتحديد عدد مرات الاستخدام والحدود المالية.",
      summaryEn: "Generate and track promotional coupon codes with usage limits, minimum spend, and discounts.",
      stepsAr: [
        "اضغط «كود خصم جديد»",
        "أدخل رمز الكوبون واربطه بقاعدة التسعير أو العرض الترويجي",
        "حدد الحد الأقصى لعدد مرات الاستخدام وتاريخ الانتهاء",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Coupon Code»",
        "Enter coupon code and link to Pricing Rule",
        "Set max usage count and expiration date",
        "Click «Save»"
      ]
    },

    // ═══ الإعدادات ═══
    "Selling Settings": {
      icon: "⚙️",
      summaryAr: "شاشة الإعدادات العامة للمبيعات لضبط سياسات البيع وعروض الأسعار، وتحديد هوامش الربح وإلزامية أوامر البيع قبل الفواتير، وسياسات حجز المخزون ومطابقة المبيعات وسقوف الخصومات المسموحة.",
      summaryEn: "General selling configuration to establish pricing rules, profit margins, sales order validation before billing, stock reservation, and discount ceiling policies.",
      stepsAr: [
        "تحديد ما إذا كان إصدار الفاتورة يتطلب بالضرورة وجود أمر بيع أو أمر تسليم مسبق",
        "ضبط سياسات التحقق من تجاوز حد الائتمان للعملاء وإيقاف المعاملات المخالفة",
        "تحديد حسابات الأرباح والخصومات الدائرية الافتراضية",
        "ضبط نسبة الخصم القصوى المسموح بها لموظفي المبيعات",
        "تفعيل الحجز التلقائي للكميات في المستودعات عند اعتماد أمر البيع"
      ],
      stepsEn: [
        "Set validation rules requiring Sales Orders or Delivery Notes before invoicing",
        "Configure customer credit limit enforcement and block overdue transactions",
        "Set default sales revenue, discount, and round-off ledgers",
        "Establish maximum allowed discount thresholds for sales staff",
        "Enable automated inventory reservation upon Sales Order submission"
      ]
    },

    "Terms and Conditions Template": {
      icon: "📜",
      summaryAr: "إنشاء قوالب الشروط والأحكام المعتمدة لإرفاقها بعروض الأسعار وأوامر المبيعات وفواتير العملاء.",
      summaryEn: "Standard templates for legal, delivery, and payment terms on quotations and sales documents.",
      stepsAr: [
        "اضغط «قالب شروط وأحكام جديد»",
        "أدخل عنوان القالب ومحتوى البنود والشروط وسياسات الاسترجاع",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Terms and Conditions Template»",
        "Enter title and terms text regarding payment and warranty",
        "Click «Save»"
      ]
    },

    "Sales Taxes and Charges Template": {
      icon: "🧾",
      summaryAr: "قوالب الضرائب والرسوم على المبيعات (ضريبة القيمة المضافة 15%) وتحديد الحسابات الضريبية.",
      summaryEn: "Sales tax templates (15% VAT) with automated calculation rules and liability accounts.",
      stepsAr: [
        "اضغط «قالب ضرائب مبيعات جديد»",
        "أدخل اسم القالب واختر حساب الضريبة المستحقة",
        "حدد نسبة الضريبة (15%) وطريقة حسابها على الصافي",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Sales Taxes and Charges Template»",
        "Enter template title and select VAT output account",
        "Set tax rate (15%) and calculation formula",
        "Click «Save»"
      ]
    },

    "Lead Source": {
      icon: "🎯",
      summaryAr: "تعريف قنوات ومصادر استقطاب العملاء المحتملين (مثل: الموقع، إعلانات، معارض، إحالة) لقياس جدوى التسويق.",
      summaryEn: "Define lead acquisition channels (website, ads, referrals, events) to track marketing ROI.",
      stepsAr: [
        "اضغط «مصدر عميل جديد»",
        "أدخل اسم المصدر (مثل: حملة جوجل، معرض، إحالة)",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Lead Source»",
        "Enter lead source title",
        "Click «Save»"
      ]
    },

    "Campaign": {
      icon: "📢",
      summaryAr: "إدارة وتتبع الحملات التسويقية وربطها بالعملاء المتوقعين وعروض الأسعار لحساب العائد على الاستثمار.",
      summaryEn: "Manage marketing campaigns and link leads and sales to measure conversion performance.",
      stepsAr: [
        "اضغط «حملة تسويقية جديدة»",
        "أدخل اسم الحملة وتاريخ البدء والانتهاء والميزانية المقدرة",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Campaign»",
        "Enter campaign title, duration, and marketing budget",
        "Click «Save»"
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
