(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم إدارة المخزون — ERPNext Stock
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
     ١. إحصائيات المخزون
  ───────────────────────────────────────── */

  const statsCards = [
    {
      id: "total-items",
      short: "ITM",
      labelEn: "Total Items",
      labelAr: "إجمالي الأصناف",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: { doctype: "Item", filters: { is_stock_item: 1, disabled: 0 } },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "stock-value",
      short: "VAL",
      labelEn: "Total Stock Value",
      labelAr: "قيمة المخزون",
      isCurrency: true,
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_list",
            args: {
              doctype: "Bin",
              fields: ["sum(stock_value) as total"],
              limit_page_length: 0
            },
            callback: data => {
              const value = data?.message?.[0]?.total || 0;
              resolve(Number(value).toFixed(2));
            },
            error: () => resolve("0.00")
          });
        })
    },
    {
      id: "low-stock",
      short: "LOW",
      labelEn: "Low Stock Items",
      labelAr: "أصناف قاربت النفاد",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_list",
            args: {
              doctype: "Bin",
              filters: [["projected_qty", "<", 0]],
              limit_page_length: 0
            },
            callback: data => resolve(data?.message?.length || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "pending-material-requests",
      short: "REQ",
      labelEn: "Pending Requests",
      labelAr: "طلبات مواد معلقة",
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
    }
  ];

  /* ─────────────────────────────────────────
     ٢. أزرار الاختصارات السريعة (محفوظة كما هي)
  ───────────────────────────────────────── */

  const quickActionButtons = [
    {
      doctype: "Material Request",
      labelEn: "New Material Request",
      labelAr: "طلب مواد جديد"
    },
    {
      doctype: "Stock Entry",
      purpose: "Material Receipt",
      labelEn: "New Material Receipt",
      labelAr: "إيصال استلام مخزني"
    },
    {
      doctype: "Stock Entry",
      purpose: "Material Transfer",
      labelEn: "New Material Transfer",
      labelAr: "مناقلة مخزنية"
    },
    {
      doctype: "Stock Reconciliation",
      labelEn: "New Stock Reconciliation",
      labelAr: "تسوية مخزنية جديدة"
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
     ٤. بطاقات المخزون — مطابقة للصورة الأصلية
  ───────────────────────────────────────── */

  const sections = [
    [
      "Masters & Reports",
      [
        // الصف الأول
        [
          "Items Catalogue",
          "📦",
          [
            "Item",
            "Item Group",
            "Product Bundle",
            "Shipping Rule",
            "Item Alternative",
            "Item Manufacturer"
          ]
        ],
        [
          "Stock Transactions",
          "🔄",
          [
            "Material Request",
            "Stock Entry",
            "Delivery Note",
            "Purchase Receipt",
            "Pick List",
            "Delivery Trip"
          ]
        ],
        [
          "Stock Reports",
          "📊",
          [
            "Stock Ledger",
            "Stock Balance",
            "Stock Projected Qty",
            "Stock Summary",
            "Stock Ageing",
            "Item Price Stock",
            "Warehouse Wise Stock Balance"
          ]
        ],

        // الصف الثاني
        [
          "Settings",
          "⚙️",
          [
            "Stock Settings",
            "Warehouse",
            "Unit of Measure (UOM)",
            "Item Variant Settings",
            "Brand",
            "Item Attribute",
            "UOM Conversion Factor"
          ]
        ],
        [
          "Serial No and Batch",
          "🔢",
          [
            "Serial No",
            "Batch",
            "Installation Note",
            "Serial No Service Contract Expiry",
            "Serial No Status",
            "Serial No Warranty Expiry"
          ]
        ],
        [
          "Tools",
          "🛠️",
          [
            "Stock Reconciliation",
            "Landed Cost Voucher",
            "Packing Slip",
            "Quality Inspection",
            "Quality Inspection Template",
            "Quick Stock Balance"
          ]
        ],

        // الصف الثالث
        [
          "Key Reports",
          "📈",
          [
            "Stock Analytics",
            "Delivery Note Trends",
            "Purchase Receipt Trends",
            "Sales Order Analysis",
            "Purchase Order Analysis",
            "Item Shortage Report",
            "Batch-Wise Balance History"
          ]
        ],
        [
          "Other Reports",
          "📑",
          [
            "Requested Items To Be Transferred",
            "Batch Item Expiry Status",
            "Item Prices",
            "Itemwise Recommended Reorder Level",
            "Item Variant Details",
            "Subcontracted Raw Materials To Be Transferred",
            "Subcontracted Item To Be Received"
          ]
        ]
      ]
    ]
  ];

  /* ─────────────────────────────────────────
     ٥. الترجمات العربية
  ───────────────────────────────────────── */

  const arabicFallback = {
    "Masters & Reports": "البيانات الرئيسية والتقارير",

    // المربع ١: كتالوج الأصناف
    "Items Catalogue": "كتالوج الأصناف",
    "Item": "الصنف",
    "Item Group": "مجموعة الأصناف",
    "Product Bundle": "حزمة المنتجات",
    "Shipping Rule": "قاعدة الشحن",
    "Item Alternative": "بديل الصنف",
    "Item Manufacturer": "الشركة المصنعة للصنف",

    // المربع ٢: العمليات المخزنية
    "Stock Transactions": "العمليات المخزنية",
    "Material Request": "طلب مواد",
    "Stock Entry": "حركة مخزنية",
    "Delivery Note": "أمر تسليم",
    "Purchase Receipt": "إيصال استلام بضاعة",
    "Pick List": "قائمة الانتقاء والتجهيز",
    "Delivery Trip": "رحلة التوصيل",

    // المربع ٣: تقارير المخزون
    "Stock Reports": "تقارير المخزون",
    "Stock Ledger": "دفتر أستاذ المخزون",
    "Stock Balance": "رصيد المخزون",
    "Stock Projected Qty": "الكمية المتوقعة للمخزون",
    "Stock Summary": "ملخص المخزون",
    "Stock Ageing": "أعمار المخزون ومدة الركود",
    "Item Price Stock": "أسعار وأرصدة الأصناف",
    "Warehouse Wise Stock Balance": "رصيد المخزون حسب المستودع",

    // المربع ٤: الإعدادات
    "Settings": "الإعدادات",
    "Stock Settings": "إعدادات المخزون",
    "Warehouse": "المستودع",
    "Unit of Measure (UOM)": "وحدة القياس",
    "Item Variant Settings": "إعدادات متغيرات الأصناف",
    "Brand": "العلامة التجارية",
    "Item Attribute": "سمات الأصناف",
    "UOM Conversion Factor": "معامل تحويل وحدات القياس",

    // المربع ٥: الأرقام التسلسلية والشحنات
    "Serial No and Batch": "الأرقام التسلسلية ورقم التشغيلة",
    "Serial No": "الرقم التسلسلي",
    "Batch": "رقم التشغيلة / الدفعة",
    "Installation Note": "مذكرة التركيب",
    "Serial No Service Contract Expiry": "انتهاء عقود خدمة الأرقام التسلسلية",
    "Serial No Status": "حالة الأرقام التسلسلية",
    "Serial No Warranty Expiry": "انتهاء ضمان الأرقام التسلسلية",

    // المربع ٦: الأدوات
    "Tools": "الأدوات",
    "Stock Reconciliation": "تسوية المخزون والجرد",
    "Landed Cost Voucher": "سند تكلفة الإنزال الإضافية",
    "Packing Slip": "كشف التعبئة والتغليف",
    "Quality Inspection": "فحص الجودة",
    "Quality Inspection Template": "قالب فحص الجودة",
    "Quick Stock Balance": "الاستعلام السريع عن رصيد الصنف",

    // المربع ٧: التقارير الرئيسية
    "Key Reports": "التقارير الرئيسية",
    "Stock Analytics": "تحليلات المخزون",
    "Delivery Note Trends": "اتجاهات أذون التسليم",
    "Purchase Receipt Trends": "اتجاهات إيصالات الاستلام",
    "Sales Order Analysis": "تحليل طلبات المبيعات",
    "Purchase Order Analysis": "تحليل أوامر الشراء",
    "Item Shortage Report": "تقرير نقص الأصناف",
    "Batch-Wise Balance History": "سجل أرصدة الدفعات والتشغيلات",

    // المربع ٨: تقارير أخرى
    "Other Reports": "تقارير أخرى",
    "Requested Items To Be Transferred": "أصناف مطلوبة للنقل",
    "Batch Item Expiry Status": "حالة صلاحية أصناف التشغيلات",
    "Item Prices": "أسعار الأصناف",
    "Itemwise Recommended Reorder Level": "مستويات إعادة الطلب المقترحة حسب الصنف",
    "Item Variant Details": "تفاصيل متغيرات الأصناف",
    "Subcontracted Raw Materials To Be Transferred": "مواد خام التعاقد من الباطن بانتظار التحويل",
    "Subcontracted Item To Be Received": "أصناف التعاقد من الباطن بانتظار الاستلام"
  };

  /* ─────────────────────────────────────────
     ٦. أنواع المسارات
  ───────────────────────────────────────── */

  const reportNames = new Set([
    "Stock Ledger",
    "Stock Balance",
    "Stock Projected Qty",
    "Stock Summary",
    "Stock Ageing",
    "Item Price Stock",
    "Warehouse Wise Stock Balance",
    "Serial No Service Contract Expiry",
    "Serial No Status",
    "Serial No Warranty Expiry",
    "Stock Analytics",
    "Delivery Note Trends",
    "Purchase Receipt Trends",
    "Sales Order Analysis",
    "Purchase Order Analysis",
    "Item Shortage Report",
    "Batch-Wise Balance History",
    "Requested Items To Be Transferred",
    "Batch Item Expiry Status",
    "Item Prices",
    "Itemwise Recommended Reorder Level",
    "Item Variant Details",
    "Subcontracted Raw Materials To Be Transferred",
    "Subcontracted Item To Be Received"
  ]);

  const treeDocs = new Set([
    "Item Group",
    "Warehouse"
  ]);

  const singleDocs = new Set([
    "Stock Settings",
    "Item Variant Settings"
  ]);

  /* ─────────────────────────────────────────
     ٧. تفاصيل الشاشات والإعدادات (ما عدا التقارير)
  ───────────────────────────────────────── */

  const itemDescriptions = {
    // ═══ كتالوج الأصناف ═══
    "Item": {
      icon: "📦",
      summaryAr: "تعريف وإدارة بطاقة الصنف بالمخزون، تحديد وحدات القياس، طرق التقييم، وتحديد ما إذا كان الصنف يخضع للأرقام التسلسلية أو الدفعات.",
      summaryEn: "Item master defining inventory parameters, valuation methods, barcode, serial numbers, and batch tracking.",
      stepsAr: [
        "اضغط «صنف جديد»",
        "أدخل رمز الصنف واسمه ومجموعته",
        "حدد وحدة القياس ومستودع الاستلام الافتراضي",
        "فعل تتبع الأرقام التسلسلية أو الدفعات إذا كان الصنف يتطلب ذلك",
        "أدخل مستويات إعادة الطلب التلقائي",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Item»",
        "Enter item code, name, and group",
        "Set default unit of measure and receiving warehouse",
        "Enable Serial No or Batch tracking if required",
        "Set auto-reorder replenishment levels",
        "Click «Save»"
      ]
    },

    "Item Group": {
      icon: "🗃️",
      summaryAr: "الهيكل الشجري لتصنيف مجموعات الأصناف المخزنية لترتيب المستودعات وربط حسابات تقييم المخزون.",
      summaryEn: "Hierarchical item groups for stock taxonomy and default valuation account assignments.",
      stepsAr: [
        "اضغط «مجموعة أصناف جديدة»",
        "أدخل اسم المجموعة وحدد المجموعة الأب في الشجرة",
        "حدد حساب تقييم المخزون الافتراضي للمجموعة",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Item Group»",
        "Enter group name and select parent node in tree",
        "Set default stock valuation ledger account",
        "Click «Save»"
      ]
    },

    "Product Bundle": {
      icon: "🎁",
      summaryAr: "تجميع باقات المنتجات المكونة من عدة أصناف مخزنية ويتم خصم مكوناتها تلقائياً عند التسليم.",
      summaryEn: "Kitting bundles composed of multiple stock components deducted automatically on delivery.",
      stepsAr: [
        "اضغط «حزمة منتجات جديدة»",
        "اختر صنف الحزمة الرئيسي",
        "أضف الأصناف المكونة والكميات",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Product Bundle»",
        "Select parent kit item",
        "Add component items and bill-of-quantities",
        "Click «Save»"
      ]
    },

    "Shipping Rule": {
      icon: "🚚",
      summaryAr: "قواعد واحتساب تكاليف الشحن والتوصيل للمستودعات أو العملاء بناءً على أوزان الطرود أو المناطق.",
      summaryEn: "Shipping rules and logistics charges matrix based on package weight or destination zone.",
      stepsAr: [
        "اضغط «قاعدة شحن جديدة»",
        "أدخل اسم الطريقة ومعادلة الاحتساب ومصروف الشحن",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Shipping Rule»",
        "Enter rule label, calculation formula, and shipping account",
        "Click «Save»"
      ]
    },

    "Item Alternative": {
      icon: "🔀",
      summaryAr: "تحديد الأصناف البديلة المعتمدة التي يمكن صرفها أو شراؤها في حال نفاد الصنف الأصلي من المستودع.",
      summaryEn: "Define authorized substitute items dispensable or purchasable when original is out of stock.",
      stepsAr: [
        "اضغط «بديل صنف جديد»",
        "اختر الصنف الأصلي والصنف البديل المعتمد",
        "حدد ما إذا كان البديل صالحاً في اتجاهين متبادلين",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Item Alternative»",
        "Select primary item and authorized substitute item",
        "Set two-way bidirectional substitution if allowed",
        "Click «Save»"
      ]
    },

    "Item Manufacturer": {
      icon: "🏭",
      summaryAr: "ربط الأصناف بالشركات المصنعة الأصلية وتوثيق أرقام قطع الغيار المصنعية (Part Numbers).",
      summaryEn: "Link items to original equipment manufacturers (OEM) and record manufacturer part numbers.",
      stepsAr: [
        "اضغط «شركة مصنعة لصنف جديدة»",
        "اختر الصنف والشركة المصنعة ورقم القطعة المصنعي",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Item Manufacturer»",
        "Select item, manufacturer name, and manufacturer part number",
        "Click «Save»"
      ]
    },

    // ═══ العمليات المخزنية ═══
    "Material Request": {
      icon: "📋",
      summaryAr: "طلب مواد داخلي لتغذية المستودعات، طلبات الشراء، أو التحويل المخزني بين الفروع.",
      summaryEn: "Internal requisition to replenish warehouse inventory, generate purchases, or branch transfers.",
      stepsAr: [
        "اضغط «طلب مواد جديد»",
        "حدد الغرض (تحويل مخزني أو شراء)",
        "أدخل الأصناف والمستودع المستهدف والكميات وتاريخ الاحتياج",
        "اضغط «حفظ» ثم «تسجيل»"
      ],
      stepsEn: [
        "Click «New Material Request»",
        "Select purpose (Material Transfer or Purchase)",
        "Add items, target warehouse, quantities, and required date",
        "Click «Save» then «Submit»"
      ]
    },

    "Stock Entry": {
      icon: "🔄",
      summaryAr: "تسجيل كافة الحركات المخزنية (استلام، مناقلة بين المستودعات، صرف استهلاك، إتلاف، وتصنيع) وترحيل قيود التكلفة.",
      summaryEn: "Record all inventory movements (Receipt, Transfer, Consumption, Scrap, Manufacture) and value entries.",
      stepsAr: [
        "اضغط «حركة مخزنية جديدة»",
        "اختر الغرض (مناقلة مواد، استلام مواد، صرف للمصنع)",
        "حدد المستودع المصدر والمستودع المستهدف",
        "أضف الأصناف والكميات وتأكد من أسعار التقييم",
        "اضغط «حفظ» ثم «تسجيل» لترحيل الحركة"
      ],
      stepsEn: [
        "Click «New Stock Entry»",
        "Select purpose (Material Transfer, Receipt, Issue, Manufacture)",
        "Set source and target warehouses",
        "Add items, quantities, and verify valuation rates",
        "Click «Save» then «Submit» to post entry"
      ]
    },

    "Delivery Note": {
      icon: "🚚",
      summaryAr: "إصدار أمر تسليم البضاعة للعميل وإخراج الكميات من المستودع وتخفيض أرصدة المخزون رسمياً.",
      summaryEn: "Issue goods delivery note to customer, decrementing stock balances and creating dispatch records.",
      stepsAr: [
        "اضغط «أمر تسليم جديد» أو أنشئه من طلب مبيعات معتمد",
        "اختر العميل ومستودع الصرف",
        "راجع الأصناف والكميات المسلمة والأرقام التسلسلية",
        "اضغط «حفظ» ثم «تسجيل» لخصم البضاعة من المخزن"
      ],
      stepsEn: [
        "Click «New Delivery Note» or create from Sales Order",
        "Select customer and dispatch warehouse",
        "Verify items, quantities dispatched, and serials/batches",
        "Click «Save» then «Submit» to deduct stock"
      ]
    },

    "Purchase Receipt": {
      icon: "📥",
      summaryAr: "إثبات استلام البضائع والمواد الواردة من الموردين في المستودع وزيادة رصيد المخزون وقيمته الدفترية.",
      summaryEn: "Acknowledge physical receipt of goods from suppliers into warehouse, increasing stock on-hand.",
      stepsAr: [
        "اضغط «إيصال استلام بضاعة جديد» أو أنشئه من أمر شراء",
        "اختر المورد ومستودع الاستلام الفعلي",
        "أدخل الكميات المستلمة وأرقام التشغيلات إن وجدت",
        "أجرِ فحص الجودة إن كان مشروطاً",
        "اضغط «حفظ» ثم «تسجيل» لتحديث المخزون"
      ],
      stepsEn: [
        "Click «New Purchase Receipt» or create from Purchase Order",
        "Select supplier and receiving warehouse",
        "Enter accepted quantities and batches/serials",
        "Perform quality inspection if required",
        "Click «Save» then «Submit» to update inventory"
      ]
    },

    "Pick List": {
      icon: "📋",
      summaryAr: "إنشاء قوائم التجهيز والانتقاء لعمال المستودع لجمع أصناف طلبات المبيعات من مواقع التخزين بدقة.",
      summaryEn: "Warehouse pick lists directing staff to retrieve order items from specific bins and racks.",
      stepsAr: [
        "اضغط «قائمة انتقاء جديدة»",
        "اختر طلبات المبيعات أو أوامر العمل المراد تجهيزها",
        "اضغط «جلب الأصناف والمواقع» لتحديد مسار الجمع بالمستودع",
        "اضغط «حفظ» ثم «تسجيل» لتوجيه الفريق"
      ],
      stepsEn: [
        "Click «New Pick List»",
        "Select Sales Orders or Work Orders to fulfill",
        "Click «Get Items and Locations» for warehouse bin guidance",
        "Click «Save» then «Submit»"
      ]
    },

    "Delivery Trip": {
      icon: "🗺️",
      summaryAr: "جدولة وتخطيط خط سير شاحنات وسيارات التوصيل وتوزيع أوامر التسليم على السائقين وتتبع الوصول.",
      summaryEn: "Plan delivery trips, assign drivers and vehicles, sequence stops, and track delivery completion.",
      stepsAr: [
        "اضغط «رحلة توصيل جديدة»",
        "اختر السائق والمركبة وتاريخ الرحلة",
        "أضف أذون التسليم المجدولة في مسار الرحلة",
        "حدث حالة التوصيل عند التسليم الفعلي",
        "اضغط «حفظ» ثم «تسجيل»"
      ],
      stepsEn: [
        "Click «New Delivery Trip»",
        "Select driver, vehicle, and dispatch date",
        "Add customer Delivery Notes to trip stops itinerary",
        "Update delivery status upon customer drop-off",
        "Click «Save» then «Submit»"
      ]
    },

    // ═══ الإعدادات ═══
    "Stock Settings": {
      icon: "⚙️",
      summaryAr: "شاشة الإعدادات العامة للمخزون لضبط طرق تقييم المخزون (الوارد أولاً يصرف أولاً FIFO أو المتوسط المرجح)، ومنع أو السماح بالأرصدة السالبة، وتحديد المستودعات الافتراضية وحسابات تسوية الفروقات.",
      summaryEn: "General stock configuration to define inventory valuation methods (FIFO or Moving Average), negative stock prevention, default warehouses, and stock adjustment ledger accounts.",
      stepsAr: [
        "تحديد طريقة التقييم الافتراضية للمخزون (FIFO أو Moving Average)",
        "تفعيل خيار منع الرصيد السالب لحظر صرف أي كميات غير متوفرة",
        "تحديد المستودعات الافتراضية للاستلام والتسليم والتصنيع",
        "تحديد حسابات أرباح وخسائر تسوية فروقات الجرد المخزني",
        "ضبط فترات تجميد الحركات المخزنية القديمة لحماية القيود"
      ],
      stepsEn: [
        "Set default valuation method (FIFO or Moving Average)",
        "Enforce negative stock prevention to disallow dispensing unavailable stock",
        "Assign default receiving, dispatch, and manufacturing warehouses",
        "Set stock adjustment difference gain and loss accounts",
        "Configure stock freeze dates to protect historical movements"
      ]
    },

    "Warehouse": {
      icon: "🏬",
      summaryAr: "إدارة الهيكل الشجري للمستودعات والمخازن الرئيسية والفرعية ومواقع التخزين والأرفف.",
      summaryEn: "Hierarchical warehouse tree managing main storage facilities, transit bins, and shelf racks.",
      stepsAr: [
        "اضغط «مستودع جديد»",
        "أدخل اسم المستودع والمستودع الأب في الشجرة",
        "حدد ما إذا كان المستودع مجموعة أو مستودع تخزين فعلي",
        "حدد حساب دفتر الأستاذ المقابل للمستودع",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Warehouse»",
        "Enter warehouse name and parent node in tree",
        "Set group flag if containing sub-locations",
        "Link corresponding balance sheet stock account",
        "Click «Save»"
      ]
    },

    "Unit of Measure (UOM)": {
      icon: "📏",
      summaryAr: "تعريف وحدات القياس الرسمية (حبة، كرتون، كيلو، متر، لتر) المستخدمة في البيع والشراء والمخزون.",
      summaryEn: "Define system Units of Measure (Unit, Box, Kg, Meter, Liter) for transactions.",
      stepsAr: [
        "اضغط «وحدة قياس جديدة»",
        "أدخل اسم الوحدة ورمزها",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Unit of Measure»",
        "Enter UOM name and symbol",
        "Click «Save»"
      ]
    },

    "Item Variant Settings": {
      icon: "⚙️",
      summaryAr: "إعداد قواعد وخصائص متغيرات الأصناف التلقائية لإنشاء الأصناف الفرعية بناءً على السمات (مثل القياس واللون والوزن) والتحكم في تسعيرها وتسميتها.",
      summaryEn: "Configure automatic item variant generation rules based on attributes (e.g. size, color, weight) and manage their naming and pricing.",
      stepsAr: [
        "تحديد طريقة تسمية المتغيرات (رمز الصنف أو السمة أو كود خاص)",
        "ضبط نسخ الصور والأسعار والموردين الافتراضيين من الصنف الأب",
        "تحديد السمات الإلزامية لتوليد المتغيرات تلقائياً"
      ],
      stepsEn: [
        "Select variant naming convention (Item Code, Attribute Value)",
        "Configure auto-copying of images, prices, and suppliers from parent item",
        "Define mandatory attributes for variant auto-generation"
      ]
    },

    "Brand": {
      icon: "🏷️",
      summaryAr: "تعريف العلامات والماركات التجارية للأصناف وربطها بالمنتجات ومتابعة مبيعات كل علامة.",
      summaryEn: "Manage product brands and trademarks to categorize items and analyze brand sales.",
      stepsAr: [
        "اضغط «علامة تجارية جديدة»",
        "أدخل اسم الماركة وشعارها ووصفها",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Brand»",
        "Enter brand name, logo, and description",
        "Click «Save»"
      ]
    },

    "Item Attribute": {
      icon: "🎨",
      summaryAr: "تعريف سمات وخصائص الأصناف (مثل: اللون، المقاس، الموديل، الحجم) وقيم كل سمة لإنشاء المتغيرات.",
      summaryEn: "Define item variant attributes (Color, Size, Dimensions) and allowable option values.",
      stepsAr: [
        "اضغط «سمة صنف جديدة»",
        "أدخل اسم السمة (مثل: المقاس أو اللون)",
        "أضف جدول القيم المتاحة (S, M, L, XL أو أحمر، أزرق)",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Item Attribute»",
        "Enter attribute name (e.g. Size, Color)",
        "Add option values table (S, M, L, XL or Red, Blue)",
        "Click «Save»"
      ]
    },

    "UOM Conversion Factor": {
      icon: "🔄",
      summaryAr: "معاملات التحويل بين وحدات القياس (مثل: الكرتون = 12 حبة، الطن = 1000 كيلو) لحساب المخزون بدقة.",
      summaryEn: "UOM conversion ratios (e.g., Box = 12 Units, Ton = 1000 Kg) for accurate inventory tracking.",
      stepsAr: [
        "اضغط «معامل تحويل وحدة قياس جديد»",
        "اختر الوحدة الأصلية ووحدة التحويل ومعامل الضرب",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New UOM Conversion Factor»",
        "Select from UOM, to UOM, and conversion value",
        "Click «Save»"
      ]
    },

    // ═══ الأرقام التسلسلية والشحنات ═══
    "Serial No": {
      icon: "🔢",
      summaryAr: "تتبع الأرقام التسلسلية الفريدة لكل قطعة أصلية (مثل الأجهزة والسيارات) ومتابعة مسارها وضمانها.",
      summaryEn: "Track individual serialized inventory units, movement audit logs, and warranty status.",
      stepsAr: [
        "اضغط «رقم تسلسلي جديد» أو يتم إنشاؤه آلياً عند الاستلام",
        "اختر الصنف وأدخل الرقم التسلسلي الفريد ومستودع التواجد",
        "حدد تاريخ الشراء وفترة الضمان",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Serial No» or generate via Purchase Receipt",
        "Select item, unique serial string, and warehouse location",
        "Set purchase date and warranty coverage period",
        "Click «Save»"
      ]
    },

    "Batch": {
      icon: "🏷️",
      summaryAr: "إدارة أرقام التشغيلات والدفعات الإنتاجية وتتبع تواريخ الإنتاج والانتهاء للمنتجات والمواد الغذائية والطبية.",
      summaryEn: "Manage production batch lots, manufacturing dates, and expiration shelf life.",
      stepsAr: [
        "اضغط «رقم تشغيلة جديد» أو يتم إنشاؤه عند استلام الشحنة",
        "اختر الصنف وأدخل رقم الدفعة",
        "حدد تاريخ التصنيع وتاريخ انتهاء الصلاحية",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Batch» or create upon receipt",
        "Select item and enter batch identification lot number",
        "Set manufacturing and expiry dates",
        "Click «Save»"
      ]
    },

    "Installation Note": {
      icon: "🔧",
      summaryAr: "توثيق عمليات تركيب وتشغيل الأصناف والأجهزة لدى العميل وتاريخ بدء سريان الضمان.",
      summaryEn: "Record equipment installation notes at customer site to trigger warranty period.",
      stepsAr: [
        "اضغط «مذكرة تركيب جديدة» أو أنشئها من أمر تسليم",
        "اختر العميل والأصناف والأرقام التسلسلية المركبة",
        "سجل تاريخ التركيب والفني المسؤول وملاحظات العميل",
        "اضغط «حفظ» ثم «تسجيل»"
      ],
      stepsEn: [
        "Click «New Installation Note» or create from Delivery Note",
        "Select customer, items, and installed serial numbers",
        "Set installation date, technician, and acceptance notes",
        "Click «Save» then «Submit»"
      ]
    },

    // ═══ الأدوات ═══
    "Stock Reconciliation": {
      icon: "⚖️",
      summaryAr: "تسوية الفروقات الجردية وتعديل الكميات الفعلية وأسعار تقييم المخزون بعد الجرد الدوري وتوليد قيود التسوية.",
      summaryEn: "Reconcile physical stock count against system balances, update quantities and valuation, and post adjustments.",
      stepsAr: [
        "اضغط «تسوية مخزنية جديدة»",
        "اختر الشركة والمستودع والغرض (تسوية كميات وتقييم)",
        "أدخل الكميات الفعلية الناتجة عن الجرد",
        "راجع فروقات القيمة المحاسبية الناتجة",
        "اضغط «حفظ» ثم «تسجيل» لتحديث الأرصدة فوراً"
      ],
      stepsEn: [
        "Click «New Stock Reconciliation»",
        "Select company, warehouse, and purpose (Stock and Valuation)",
        "Enter physical counted quantities",
        "Review resulting ledger difference amounts",
        "Click «Save» then «Submit» to update inventory immediately"
      ]
    },

    "Landed Cost Voucher": {
      icon: "🚢",
      summaryAr: "توزيع تكاليف الشحن والجمارك والتخليص والمصروفات الإضافية على تكلفة الأصناف المستلمة لتقييمها بدقة.",
      summaryEn: "Allocate landed costs (freight, customs, clearance) to received items to compute true landed valuation.",
      stepsAr: [
        "اضغط «سند تكلفة إنزال جديد»",
        "اختر إيصالات الاستلام المخزني المعنية",
        "أضف فواتير ومصروفات الشحن والجمارك الإضافية",
        "اختر طريقة التوزيع (حسب القيمة أو الكمية)",
        "اضغط «حفظ» ثم «تسجيل» لإعادة تقييم المخزون"
      ],
      stepsEn: [
        "Click «New Landed Cost Voucher»",
        "Select applicable Purchase Receipts",
        "Add additional customs, freight, and insurance charges",
        "Choose allocation method (by amount, quantity, or volume)",
        "Click «Save» then «Submit» to update valuation"
      ]
    },

    "Packing Slip": {
      icon: "📦",
      summaryAr: "إعداد كشوف الطرود والتغليف وتحديد محتويات كل صندوق ووزنه المرفق بأمر التسليم.",
      summaryEn: "Prepare packaging slips specifying box contents, item counts, and package weight for dispatch.",
      stepsAr: [
        "اضغط «كشف تعبئة وتغليف جديد»",
        "اختر أمر التسليم المعني",
        "حدد رقم الصندوق والأصناف والكميات داخل كل طرد",
        "أدخل الوزن الإجمالي وأبعاد الطرد",
        "اضغط «حفظ» ثم «تسجيل»"
      ],
      stepsEn: [
        "Click «New Packing Slip»",
        "Select corresponding Delivery Note",
        "Specify case number, items, and quantities per parcel",
        "Enter gross package weight and dimensions",
        "Click «Save» then «Submit»"
      ]
    },

    "Quality Inspection": {
      icon: "🔍",
      summaryAr: "إجراء فحوصات الجودة المخبرية أو الفنية للأصناف عند الاستلام أو الإنتاج أو التسليم وتسجيل النتيجة.",
      summaryEn: "Perform quality inspections on goods receipt, production, or delivery, recording test parameters.",
      stepsAr: [
        "اضغط «فحص جودة جديد»",
        "اختر الصنف ونوع المستند المرجعي (إيصال استلام، أمر عمل)",
        "أدخل القراءات الفعلية لمعايير الفحص المحددة",
        "حدد حالة الفحص (مقبول Accepted أو مرفوض Rejected)",
        "اضغط «حفظ» ثم «تسجيل»"
      ],
      stepsEn: [
        "Click «New Quality Inspection»",
        "Select item and reference document (Receipt, Work Order)",
        "Enter reading measurements against inspection parameters",
        "Set inspection status (Accepted or Rejected)",
        "Click «Save» then «Submit»"
      ]
    },

    "Quality Inspection Template": {
      icon: "📝",
      summaryAr: "تعريف معايير وقوالب الفحص القياسية للأصناف وتحديد الحدود الدنيا والقصوى المسموح بها للمواصفات.",
      summaryEn: "Define standard QA criteria templates, minimum and maximum tolerance specification thresholds.",
      stepsAr: [
        "اضغط «قالب فحص جودة جديد»",
        "أدخل اسم القالب وأضف معايير الفحص والمواصفات المقبولة",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Quality Inspection Template»",
        "Enter template title and add QA test parameters and tolerances",
        "Click «Save»"
      ]
    },

    "Quick Stock Balance": {
      icon: "⚡",
      summaryAr: "أداة الاستعلام السريع والفوري عن رصيد أي صنف وتكلفته في كافة المستودعات والفروع في شاشة واحدة.",
      summaryEn: "Quick stock balance inquiry tool across all branches and warehouses on a single screen.",
      stepsAr: [
        "افتح «الاستعلام السريع عن رصيد الصنف»",
        "اختر الصنف أو امسح الباركود",
        "استعرض فوراً الكميات المتوفرة والقيمة والتوزيع على المستودعات"
      ],
      stepsEn: [
        "Open «Quick Stock Balance»",
        "Select item or scan barcode",
        "Instantly view on-hand quantities, valuation, and warehouse breakdown"
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
          el.textContent = c.isCurrency ? `${formatNumber(val)} SAR` : formatNumber(val);
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
            <button type="button" class="erp-quick-btn" data-new-doc="${escapeHtml(btn.doctype)}" ${btn.purpose ? `data-purpose="${escapeHtml(btn.purpose)}"` : ""}>
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
      const purpose = btn.dataset.purpose;
      if (window.frappe && typeof frappe.new_doc === "function") {
        if (purpose) {
          frappe.new_doc(doctype, { purpose: purpose });
        } else {
          frappe.new_doc(doctype);
        }
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
    if (name === "Quick Stock Balance") {
      frappe.set_route("quick-stock-balance");
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
