(() => {

  /* =========================================================
     MUBTKIR ERP — SELLING WORKSPACE
     لوحة تحكم قسم المبيعات
  ========================================================= */

  const root = root_element.querySelector("[data-erp-dashboard]");
  const salesCycle = root_element.querySelector("[data-purchase-cycle]");
  const statsSection = root_element.querySelector("[data-stats-section]");
  const quickActions = root_element.querySelector("[data-quick-actions]");
  const content = root_element.querySelector("[data-dashboard-content]");
  const footerEl = root_element.querySelector("[data-dashboard-footer]");

  if (!root || !content) return;


  /* =========================================================
     1. LANGUAGE
  ========================================================= */

  const langValue =
    window.frappe?.boot?.lang ||
    window.frappe?.boot?.user?.language ||
    document.documentElement.lang ||
    "en";

  const isArabic =
    String(langValue).toLowerCase().startsWith("ar");

  root.setAttribute("dir", isArabic ? "rtl" : "ltr");
  root.classList.toggle("erp-dashboard-rtl", isArabic);


  /* =========================================================
     2. SALES CYCLE
     دورة المبيعات
  ========================================================= */

  const salesCycleCards = [

    {
      step: 1,
      doctype: "Quotation",

      labelEn: "Quotation",
      labelAr: "عرض سعر",

      descriptionEn:
        "Prepare and send a quotation to the customer.",

      descriptionAr:
        "إعداد وإرسال عرض السعر للعميل."
    },

    {
      step: 2,
      doctype: "Sales Order",

      labelEn: "Sales Order",
      labelAr: "طلب مبيعات",

      descriptionEn:
        "Confirm the customer order and delivery requirements.",

      descriptionAr:
        "تأكيد طلب العميل والكميات ومواعيد التسليم."
    },

    {
      step: 3,
      doctype: "Delivery Note",

      labelEn: "Delivery Note",
      labelAr: "إشعار تسليم",

      descriptionEn:
        "Deliver the items and record the issued quantities.",

      descriptionAr:
        "تسليم المنتجات وتسجيل الكميات المسلمة."
    },

    {
      step: 4,
      doctype: "Sales Invoice",

      labelEn: "Sales Invoice",
      labelAr: "فاتورة مبيعات",

      descriptionEn:
        "Issue the customer sales invoice.",

      descriptionAr:
        "إصدار فاتورة المبيعات للعميل."
    },

    {
      step: 5,
      doctype: "Payment Entry",

      labelEn: "Collection",
      labelAr: "التحصيل",

      descriptionEn:
        "Record customer payments and settle outstanding invoices.",

      descriptionAr:
        "تسجيل تحصيل العميل وتسوية الفواتير المستحقة."
    }

  ];


  /* =========================================================
     3. OVERVIEW
     نظرة عامة — 4 بطاقات
  ========================================================= */

  const statsCards = [

    /* عروض الأسعار المفتوحة */
    {
      id: "open-quotations",

      short: "QTN",

      labelEn: "Open Quotations",
      labelAr: "عروض الأسعار المفتوحة",

      fetch: () =>
        new Promise(resolve => {

          frappe.call({

            method: "frappe.client.get_count",

            args: {

              doctype: "Quotation",

              filters: {
                docstatus: 1,
                status: "Open"
              }

            },

            async: true,

            callback: data =>
              resolve(data?.message || 0),

            error: () =>
              resolve(0)

          });

        })
    },


    /* طلبات المبيعات المعلقة */
    {
      id: "pending-sales-orders",

      short: "SO",

      labelEn: "Pending Sales Orders",
      labelAr: "طلبات المبيعات المعلقة",

      fetch: () =>
        new Promise(resolve => {

          frappe.call({

            method: "frappe.client.get_count",

            args: {

              doctype: "Sales Order",

              filters: {

                docstatus: 1,

                status: [
                  "in",
                  [
                    "To Deliver and Bill",
                    "To Deliver",
                    "To Bill"
                  ]
                ]

              }

            },

            async: true,

            callback: data =>
              resolve(data?.message || 0),

            error: () =>
              resolve(0)

          });

        })
    },


    /* الفواتير غير المدفوعة */
    {
      id: "unpaid-invoices",

      short: "SI",

      labelEn: "Unpaid Invoices",
      labelAr: "الفواتير غير المدفوعة",

      fetch: () =>
        new Promise(resolve => {

          frappe.call({

            method: "frappe.client.get_count",

            args: {

              doctype: "Sales Invoice",

              filters: {
                docstatus: 1,
                outstanding_amount: [">", 0]
              }

            },

            async: true,

            callback: data =>
              resolve(data?.message || 0),

            error: () =>
              resolve(0)

          });

        })
    },


    /* العملاء */
    {
      id: "customers",

      short: "CUS",

      labelEn: "Customers",
      labelAr: "العملاء",

      fetch: () =>
        new Promise(resolve => {

          frappe.call({

            method: "frappe.client.get_count",

            args: {
              doctype: "Customer"
            },

            async: true,

            callback: data =>
              resolve(data?.message || 0),

            error: () =>
              resolve(0)

          });

        })
    }

  ];


  /* =========================================================
     4. QUICK ACTIONS
     الاختصارات السريعة
  ========================================================= */

  const quickActionButtons = [

    {
      doctype: "Quotation",
      labelEn: "New Quotation",
      labelAr: "عرض سعر جديد"
    },

    {
      doctype: "Sales Order",
      labelEn: "New Sales Order",
      labelAr: "طلب مبيعات جديد"
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


  /* =========================================================
     5. FOOTER
  ========================================================= */

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


  /* =========================================================
     6. DASHBOARD SECTIONS
  ========================================================= */

  const sections = [

    [
      "Reports & Masters",

      [

                [
          "Selling",
          "🛒",
          [
            "Customer",
            "Quotation",
            "Sales Order",
            "Delivery Note",
            "Sales Invoice",
            "Blanket Order",
            "Sales Partner",
            "Sales Person"
          ]
        ],,

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
          "Items & Pricing",
          "💰",
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
        ],,

        [
          "Settings",
          "⚙️",
          [
            "Selling Settings",
            "Sales Taxes and Charges Template",
            "Terms and Conditions Template"
          ]
        ],

        [
          "Sales Person",
          "👤",
          [
            "Sales Person",
            "Sales Partner"
          ]
        ],

        [
          "Key Reports",
          "📊",
          [
            "Sales Analytics",
            "Sales Order Analysis",
            "Sales Order Trends",
            "Sales Invoice Trends",
            "Quotation Trends"
          ]
        ],

        [
          "Other Reports",
          "📋",
          [
            "Customer Acquisition and Loyalty",
            "Inactive Customers",
            "Sales Partners Commission"
          ]
        ]

      ]

    ]

  ];


  /* =========================================================
     7. ARABIC TRANSLATIONS
  ========================================================= */

  const arabicFallback = {
    "Blanket Order":
      "طلب إطار شامل",

    "Shipping Rule":
      "قواعد الشحن",

    "Coupon Code":
      "رمز الخصم",

    "Customer":
      "العميل",


    "Reports & Masters":
      "البيانات الرئيسية والتقارير",

    "Selling":
      "المبيعات",

    "Customer":
      "العملاء",

    "Items & Pricing":
      "المنتجات والتسعير",

    "Settings":
      "الإعدادات",

    "Sales Person":
      "فريق المبيعات",

    "Key Reports":
      "التقارير الرئيسية",

    "Other Reports":
      "تقارير أخرى",


    "Quotation":
      "عرض سعر",

    "Sales Order":
      "طلب مبيعات",

    "Delivery Note":
      "إشعار تسليم",

    "Sales Invoice":
      "فاتورة مبيعات",


    "Customer Group":
      "مجموعة العملاء",

    "Contact":
      "جهة الاتصال",

    "Address":
      "العنوان",

    "Territory":
      "المنطقة",


    "Item":
      "المنتج",

    "Item Price":
      "سعر المنتج",

    "Price List":
      "قائمة الأسعار",

    "Product Bundle":
      "حزمة منتجات",

    "Item Group":
      "مجموعة المنتجات",

    "Promotional Scheme":
      "مخطط ترويجي",

    "Pricing Rule":
      "قاعدة تسعير",


    "Selling Settings":
      "إعدادات المبيعات",

    "Sales Taxes and Charges Template":
      "قالب ضرائب ورسوم المبيعات",

    "Terms and Conditions Template":
      "قالب الشروط والأحكام",


    "Sales Person":
      "مندوب المبيعات",

    "Sales Partner":
      "شريك المبيعات",


    "Sales Analytics":
      "تحليلات المبيعات",

    "Sales Order Analysis":
      "تحليل طلبات المبيعات",

    "Sales Order Trends":
      "اتجاهات طلبات المبيعات",

    "Sales Invoice Trends":
      "اتجاهات فواتير المبيعات",

    "Quotation Trends":
      "اتجاهات عروض الأسعار",

    "Customer Acquisition and Loyalty":
      "اكتساب وولاء العملاء",

    "Inactive Customers":
      "العملاء غير النشطين",

    "Sales Partners Commission":
      "عمولات شركاء المبيعات"

  };


  /* =========================================================
     8. ROUTE TYPES
  ========================================================= */

  const singleDocs =
    new Set([
      "Selling Settings"
    ]);


  const reportNames =
    new Set([

      "Sales Analytics",
      "Sales Order Analysis",
      "Sales Order Trends",
      "Sales Invoice Trends",
      "Quotation Trends",
      "Customer Acquisition and Loyalty",
      "Inactive Customers",
      "Sales Partners Commission"

    ]);


  const treeDocs =
    new Set([
      "Item Group",
      "Customer Group",
      "Territory",
      "Sales Person"
    ]);


  /* =========================================================
     9. ITEM DESCRIPTIONS
  ========================================================= */

  const itemDescriptions = {

    "Quotation": {

      icon: "📄",

      summaryAr:
        "إعداد عرض سعر للعميل يتضمن المنتجات والكميات والأسعار والضرائب وشروط البيع.",

      summaryEn:
        "Prepare a customer quotation containing items, quantities, prices, taxes, and sales terms.",

      stepsAr: [

        "اضغط «عرض سعر جديد»",

        "اختر العميل",

        "حدد تاريخ العرض وتاريخ الصلاحية",

        "أضف المنتجات والكميات",

        "راجع الأسعار والخصومات",

        "أضف الضرائب والرسوم",

        "حدد الشروط والأحكام",

        "اضغط «حفظ» ثم «تسجيل»",

        "يمكن إنشاء طلب مبيعات مباشرة من عرض السعر"

      ],

      stepsEn: [

        "Click «New Quotation»",

        "Select customer",

        "Set quotation and validity dates",

        "Add items and quantities",

        "Review prices and discounts",

        "Add taxes and charges",

        "Set terms and conditions",

        "Click «Save» then «Submit»",

        "Create a Sales Order directly from the quotation"

      ]

    },


    "Sales Order": {

      icon: "📋",

      summaryAr:
        "تأكيد طلب العميل وتحديد المنتجات والكميات والأسعار وتواريخ التسليم.",

      summaryEn:
        "Confirm the customer order with items, quantities, prices, and delivery dates.",

      stepsAr: [

        "اضغط «طلب مبيعات جديد»",

        "اختر العميل",

        "يمكن سحب البيانات من عرض سعر",

        "راجع المنتجات والكميات والأسعار",

        "حدد تاريخ التسليم",

        "حدد المستودع",

        "أضف الضرائب وشروط الدفع",

        "اضغط «حفظ» ثم «تسجيل»",

        "يمكن إنشاء إشعار تسليم أو فاتورة مبيعات"

      ],

      stepsEn: [

        "Click «New Sales Order»",

        "Select customer",

        "Fetch details from quotation if applicable",

        "Review items, quantities, and prices",

        "Set delivery date",

        "Set warehouse",

        "Add taxes and payment terms",

        "Click «Save» then «Submit»",

        "Create Delivery Note or Sales Invoice"

      ]

    },


    "Delivery Note": {

      icon: "🚚",

      summaryAr:
        "تسجيل تسليم المنتجات للعميل وخروج الكميات من المخزون.",

      summaryEn:
        "Record delivery of items to the customer and issue stock quantities.",

      stepsAr: [

        "اضغط «إشعار تسليم جديد»",

        "اختر العميل",

        "اسحب المنتجات من طلب المبيعات",

        "راجع الكميات المطلوب تسليمها",

        "حدد المستودع",

        "أدخل بيانات النقل عند الحاجة",

        "اضغط «حفظ» ثم «تسجيل»",

        "سيتم تحديث المخزون تلقائياً"

      ],

      stepsEn: [

        "Click «New Delivery Note»",

        "Select customer",

        "Fetch items from Sales Order",

        "Review quantities to deliver",

        "Set warehouse",

        "Enter transport details if required",

        "Click «Save» then «Submit»",

        "Stock will be updated automatically"

      ]

    },


    "Sales Invoice": {

      icon: "🧾",

      summaryAr:
        "إصدار فاتورة مبيعات للعميل وتسجيل المبلغ المستحق عليه.",

      summaryEn:
        "Issue a customer sales invoice and record the receivable amount.",

      stepsAr: [

        "اضغط «فاتورة مبيعات جديدة»",

        "اختر العميل",

        "اسحب البيانات من طلب المبيعات أو إشعار التسليم",

        "راجع المنتجات والكميات والأسعار",

        "أضف الضرائب",

        "حدد تاريخ الاستحقاق",

        "راجع شروط الدفع",

        "اضغط «حفظ» ثم «تسجيل»",

        "يمكن إنشاء سند قبض من الفاتورة"

      ],

      stepsEn: [

        "Click «New Sales Invoice»",

        "Select customer",

        "Fetch from Sales Order or Delivery Note",

        "Review items, quantities, and prices",

        "Add taxes",

        "Set due date",

        "Review payment terms",

        "Click «Save» then «Submit»",

        "Create Payment Entry from the invoice"

      ]

    },


    "Customer": {

      icon: "👤",

      summaryAr:
        "تعريف بيانات العميل وتصنيفه وعنوانه ومعلومات الاتصال والبيانات الضريبية.",

      summaryEn:
        "Define customer information, group, address, contacts, and tax details.",

      stepsAr: [

        "اضغط «عميل جديد»",

        "أدخل اسم العميل",

        "اختر مجموعة العملاء",

        "حدد المنطقة",

        "أدخل الرقم الضريبي",

        "أضف بيانات الاتصال",

        "أضف العنوان",

        "حدد العملة وقائمة الأسعار عند الحاجة",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Click «New Customer»",

        "Enter customer name",

        "Select customer group",

        "Set territory",

        "Enter tax ID",

        "Add contact information",

        "Add address",

        "Set currency and price list if required",

        "Click «Save»"

      ]

    },


    "Item": {

      icon: "📦",

      summaryAr:
        "تعريف المنتجات والخدمات المستخدمة في عمليات البيع.",

      summaryEn:
        "Define products and services used in sales transactions.",

      stepsAr: [

        "اضغط «صنف جديد»",

        "أدخل رمز واسم المنتج",

        "اختر مجموعة المنتجات",

        "حدد وحدة القياس",

        "حدد هل المنتج مخزني أم خدمة",

        "حدد حساب الإيراد",

        "أضف السعر عند الحاجة",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Click «New Item»",

        "Enter item code and name",

        "Select item group",

        "Set UOM",

        "Specify whether stock item or service",

        "Set income account",

        "Add price if required",

        "Click «Save»"

      ]

    },


    "Item Price": {

      icon: "💲",

      summaryAr:
        "تحديد أسعار بيع المنتجات داخل قوائم الأسعار المختلفة.",

      summaryEn:
        "Define selling prices for items in different price lists.",

      stepsAr: [

        "اضغط «سعرجديد»",

        "اختر المنتج",

        "اختر قائمة الأسعار",

        "أدخل سعر البيع",

        "حدد العملة",

        "حدد فترة سريان السعر عند الحاجة",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Click «New Item Price»",

        "Select item",

        "Select price list",

        "Enter selling rate",

        "Set currency",

        "Set validity period if needed",

        "Click «Save»"

      ]

    },


    "Price List": {

      icon: "📋",

      summaryAr:
        "إنشاء قوائم أسعار مثل التجزئة والجملة والعملاء الخاصين.",

      summaryEn:
        "Create price lists such as Retail, Wholesale, or special customer pricing.",

      stepsAr: [

        "اضغط «قائمة أسعار جديدة»",

        "أدخل اسم القائمة",

        "حدد أنها قائمة بيع",

        "حدد العملة",

        "فعّل القائمة",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Click «New Price List»",

        "Enter list name",

        "Set it as Selling",

        "Set currency",

        "Enable the list",

        "Click «Save»"

      ]

    },


    "Pricing Rule": {

      icon: "🏷️",

      summaryAr:
        "تطبيق خصومات أو أسعار خاصة تلقائياً حسب العميل أو المنتج أو الكمية.",

      summaryEn:
        "Automatically apply discounts or special pricing by customer, item, or quantity.",

      stepsAr: [

        "اضغط «قاعدة تسعير جديدة»",

        "حدد نوع التطبيق",

        "حدد المنتجات أو العملاء",

        "أدخل نسبة أو قيمة الخصم",

        "حدد الشروط",

        "حدد فترة السريان",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Click «New Pricing Rule»",

        "Select apply-on type",

        "Set items or customers",

        "Enter discount percentage or amount",

        "Set conditions",

        "Set validity dates",

        "Click «Save»"

      ]

    },
    "Blanket Order": {
      icon: "📑",
      summaryAr:
        "اتفاقية توريد دورية أو سنوية مع العميل بكميات وأسعار متفق عليها يتم إصدار طلبات مبيعات متعددة منها.",
      summaryEn:
        "A long-term sales agreement with a customer for quantities and rates fulfilled via partial orders.",
      stepsAr: [
        "اضغط «طلب إطار شامل جديد»",
        "اختر العميل",
        "حدد تاريخ البداية وتاريخ الانتهاء للاتفاقية",
        "أضف المنتجات والكميات الإجمالية المتفق عليها والأسعار",
        "اضغط «حفظ» ثم «تسجيل»",
        "يمكن إصدار طلبات مبيعات مباشرة بناءً على الاتفاقية"
      ],
      stepsEn: [
        "Click «New Blanket Order»",
        "Select customer",
        "Set agreement start and end dates",
        "Add items, agreed quantities, and rates",
        "Click «Save» then «Submit»",
        "Create individual Sales Orders against this blanket order"
      ]
    },

    "Sales Partner": {
      icon: "🤝",
      summaryAr:
        "تعريف شركاء ووكلاء وموزعي المبيعات الخارجيين وتحديد نسب عمولاتهم على المبيعات.",
      summaryEn:
        "Define third-party sales partners, distributors, and agents with their commission percentages.",
      stepsAr: [
        "اضغط «شريك مبيعات جديد»",
        "أدخل اسم الشريك أو الوكيل",
        "حدد نوع الشريك (وكيل، موزع، وسيط)",
        "أدخل نسبة العمولة الافتراضية",
        "أضف معلومات الاتصال والعنوان",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Sales Partner»",
        "Enter sales partner name",
        "Select partner type (Agent, Distributor, Reseller)",
        "Set default commission rate",
        "Add contact details and address",
        "Click «Save»"
      ]
    },

    "Sales Person": {
      icon: "👤",
      summaryAr:
        "إدارة بيانات مناديب المبيعات وتحديد أهداف المبيعات وعمولاتهم وربطهم بالعملاء والمعاملات.",
      summaryEn:
        "Manage sales reps, configure sales targets and commission structures, and link to customers.",
      stepsAr: [
        "اضغط «مندوب مبيعات جديد»",
        "أدخل اسم مندوب المبيعات",
        "حدد مندوب المبيعات الأب في الهيكل التنظيمي عند الحاجة",
        "اربط سجل مندوب المبيعات بالموظف في النظام",
        "أدخل أهداف المبيعات ونسبة العمولة",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Sales Person»",
        "Enter sales person name",
        "Select parent sales person in tree hierarchy if needed",
        "Link to Employee record",
        "Specify sales targets and commission rate",
        "Click «Save»"
      ]
    },

    "Customer Group": {
      icon: "👥",
      summaryAr:
        "تصنيف العملاء إلى مجموعات لتسهيل التسعير وإعداد التقارير وتحديد شروط الائتمان.",
      summaryEn:
        "Categorize customers into groups for reporting, price list assignment, and credit terms.",
      stepsAr: [
        "اضغط «مجموعة عملاء جديدة»",
        "أدخل اسم المجموعة",
        "حدد المجموعة الأب في الهيكل الشجري",
        "حدد قائمة الأسعار الافتراضية عند الحاجة",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Customer Group»",
        "Enter customer group name",
        "Select parent group in hierarchy",
        "Assign default price list if needed",
        "Click «Save»"
      ]
    },

    "Contact": {
      icon: "📞",
      summaryAr:
        "إدارة بيانات جهات الاتصال للأفراد والمسؤولين لدى العملاء والشركاء.",
      summaryEn:
        "Manage contact persons, mobile numbers, and emails for customers and suppliers.",
      stepsAr: [
        "اضغط «جهة اتصال جديدة»",
        "أدخل الاسم الأول واسم العائلة",
        "أدخل البريد الإلكتروني ورقم الهاتف",
        "حدد المسمى الوظيفي والقسم",
        "اربط جهة الاتصال بالعميل المحدد",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Contact»",
        "Enter first name and last name",
        "Enter email address and phone number",
        "Set job designation and department",
        "Link contact to Customer",
        "Click «Save»"
      ]
    },

    "Address": {
      icon: "📍",
      summaryAr:
        "تسجيل وتعديل عناوين الفوترة والشحن ومواقع التسليم الخاصة بالعملاء.",
      summaryEn:
        "Record and manage billing, shipping, and delivery addresses for customers.",
      stepsAr: [
        "اضغط «عنوان جديد»",
        "أدخل تفاصيل العنوان والشارع والمدينة",
        "حدد نوع العنوان (فوترة / شحن / مكتب)",
        "أدخل الرمز البريدي والدولة",
        "اربط العنوان بالعميل",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Address»",
        "Enter address lines, street, and city",
        "Select address type (Billing / Shipping / Office)",
        "Enter postal code and country",
        "Link address to customer",
        "Click «Save»"
      ]
    },

    "Territory": {
      icon: "🗺️",
      summaryAr:
        "تقسيم المناطق الجغرافية للبيع وتعيين مسؤولي المناطق وتتبع مبيعات كل منطقة.",
      summaryEn:
        "Manage sales territories, assign territory leads, and monitor regional sales performance.",
      stepsAr: [
        "اضغط «منطقة جديدة»",
        "أدخل اسم المنطقة أو المدينة",
        "حدد المنطقة الأب في الهيكل الشجري",
        "عين مدير أو مندوب المنطقة",
        "حدد هدف المبيعات للمنطقة",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Territory»",
        "Enter territory or city name",
        "Select parent territory in hierarchy",
        "Assign territory manager or sales person",
        "Define regional sales target",
        "Click «Save»"
      ]
    },

    "Product Bundle": {
      icon: "🎁",
      summaryAr:
        "تجميع مجموعة من المنتجات معاً كحزمة مبيعات تباع بسعر واحد مع خصم المخزون لكل منتج تلقائياً.",
      summaryEn:
        "Bundle multiple products together sold as a package with automated stock deduction per item.",
      stepsAr: [
        "اضغط «حزمة منتجات جديدة»",
        "اختر المنتج الرئيسي للحزمة (غير مخزني)",
        "أضف المنتجات الفرعية المكونة للحزمة",
        "حدد كمية كل منتج فرعي داخل الحزمة",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Product Bundle»",
        "Select the parent bundle item (non-stock)",
        "Add child items that make up the bundle",
        "Set quantity for each child component",
        "Click «Save»"
      ]
    },

    "Item Group": {
      icon: "📁",
      summaryAr:
        "تصنيف المنتجات والخدمات في مجموعات شجرية لتنظيم المخزون وقوائم الأسعار والتقارير.",
      summaryEn:
        "Classify items and services in a tree hierarchy for inventory, pricing, and analytics.",
      stepsAr: [
        "اضغط «مجموعة منتجات جديدة»",
        "أدخل اسم المجموعة",
        "حدد المجموعة الأب",
        "حدد هل هي مجموعة رئيسية أم فرعية",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Item Group»",
        "Enter group name",
        "Select parent group",
        "Specify if group node or leaf item group",
        "Click «Save»"
      ]
    },

    "Promotional Scheme": {
      icon: "🏷️",
      summaryAr:
        "إنشاء خطط وعروض ترويجية مثل خصومات الكمية أو منتجات مجانية عند شراء أصناف محددة.",
      summaryEn:
        "Create sales promotions like quantity discounts or buy-X-get-Y-free offers.",
      stepsAr: [
        "اضغط «مخطط ترويجي جديد»",
        "أدخل اسم العرض الترويجي",
        "حدد فترة السريان وتاريخ البداية والنهاية",
        "حدد المنتجات المشمولة بالعرض",
        "أدخل قواعد الخصم أو الأصناف المجانية",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Promotional Scheme»",
        "Enter promotion scheme name",
        "Set validity dates",
        "Select applicable items or groups",
        "Configure discount slabs or free item rules",
        "Click «Save»"
      ]
    },

    "Shipping Rule": {
      icon: "🚚",
      summaryAr:
        "تحديد رسوم وقواعد الشحن والتوصيل للعملاء بناءً على القيمة أو الوزن أو المنطقة.",
      summaryEn:
        "Define shipping charges and delivery rules based on order value, weight, or territory.",
      stepsAr: [
        "اضغط «قاعدة شحن جديدة»",
        "أدخل اسم قاعدة الشحن",
        "اختر نوع الشحن (مبيعات / مشتريات)",
        "حدد حساب إيراد أو مصروف الشحن",
        "حدد آلية الاحتساب (حسب القيمة أو الوزن)",
        "أدخل شرائح الرسوم",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Shipping Rule»",
        "Enter rule label",
        "Select shipping type (Selling / Buying)",
        "Link shipping account",
        "Select calculation basis (Value / Weight)",
        "Enter charge slabs",
        "Click «Save»"
      ]
    },

    "Coupon Code": {
      icon: "🎟️",
      summaryAr:
        "إنشاء أكواد وكوبونات الخصم للمبيعات وتحديد شروط الاستخدام والحد الأقصى للخصم.",
      summaryEn:
        "Create promotional coupon codes with usage limits, validity periods, and discount rules.",
      stepsAr: [
        "اضغط «رمز خصم جديد»",
        "أدخل اسم الرمز والكود الترويجي",
        "اربط الكود بقاعدة تسعير",
        "حدد تاريخ البداية والنهاية",
        "حدد الحد الأقصى للاستخدام",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Coupon Code»",
        "Enter coupon name and coupon code",
        "Link to a Pricing Rule",
        "Set valid from and to dates",
        "Set maximum usage limit",
        "Click «Save»"
      ]
    },

    "Selling Settings": {
      icon: "⚙️",
      summaryAr:
        "ضبط سياسات البيع والحد الائتماني للعملاء ونسب التسليم الزائد وإعدادات الفواتير.",
      summaryEn:
        "Configure selling workflow, credit limits, over-delivery tolerance, and invoice policies.",
      stepsAr: [
        "افتح «إعدادات المبيعات»",
        "حدد سياسة حد الائتمان للعملاء",
        "حدد نسبة السماح بالتسليم الزائد",
        "حدد شروط تسعير المنتجات الإلزامية",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Open «Selling Settings»",
        "Set customer credit limit action",
        "Configure over-delivery allowance percentage",
        "Set mandatory pricing rules",
        "Click «Save»"
      ]
    },

    "Sales Taxes and Charges Template": {
      icon: "🧮",
      summaryAr:
        "قوالب الضرائب والرسوم المطبقة تلقائياً على عروض وفواتير المبيعات (مثل ضريبة القيمة المضافة 15%).",
      summaryEn:
        "Sales tax and charge templates applied automatically to quotations and sales invoices (e.g. 15% VAT).",
      stepsAr: [
        "اضغط «قالب ضرائب ورسوم مبيعات جديد»",
        "أدخل عنوان القالب",
        "حدد نوع الحساب الضريبي",
        "أدخل نسبة الضريبة (15%)",
        "حدد الشركة",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Sales Taxes and Charges Template»",
        "Enter template title",
        "Select tax ledger account",
        "Enter tax rate (15%)",
        "Select company",
        "Click «Save»"
      ]
    },

    "Terms and Conditions Template": {
      icon: "📜",
      summaryAr:
        "قوالب الشروط والأحكام القياسية لعروض الأسعار وأوامر البيع والفواتير وسياسات الضمان والاسترجاع.",
      summaryEn:
        "Standard terms and conditions templates attached to sales quotes, orders, and invoices.",
      stepsAr: [
        "اضغط «قالب شروط وأحكام جديد»",
        "أدخل اسم القالب",
        "اكتب نصوص وشروط البيع والتسليم والضمان",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Terms and Conditions Template»",
        "Enter template title",
        "Write contract terms, warranty, and return policies",
        "Click «Save»"
      ]
    },


  };


  /* =========================================================
     10. HELPERS
  ========================================================= */

  function translate(name) {

    if (!isArabic)
      return name;

    return (
      arabicFallback[name] ||
      (
        typeof window.__ === "function"
          ? window.__(name)
          : name
      )
    );

  }


  function escapeHtml(value) {

    return String(value ?? "")

      .replaceAll("&", "&amp;")

      .replaceAll("<", "&lt;")

      .replaceAll(">", "&gt;")

      .replaceAll('"', "&quot;")

      .replaceAll("'", "&#039;");

  }


  function formatNumber(number) {

    return (
      parseFloat(number) || 0
    ).toLocaleString("en-US");

  }


  /* =========================================================
     11. MODAL
  ========================================================= */

  function showInfoModal(data) {

    const title =
      isArabic
        ? data.labelAr
        : data.labelEn;


    const summary =
      isArabic
        ? data.summaryAr
        : data.summaryEn;


    const steps =
      isArabic
        ? data.stepsAr
        : data.stepsEn;


    const hasSteps =
      Array.isArray(steps) &&
      steps.length > 0;


    const showText =
      isArabic
        ? "📖 عرض الخطوات"
        : "📖 Show Steps";


    const hideText =
      isArabic
        ? "📖 إخفاء الخطوات"
        : "📖 Hide Steps";


    const stepsHtml =
      hasSteps

        ? `
          <div
            class="erp-modal-steps is-shown"
            data-modal-steps
          >

            <ol class="erp-modal-steps-list">

              ${steps
                .map(
                  step =>
                    `<li>${escapeHtml(step)}</li>`
                )
                .join("")}

            </ol>

          </div>
        `

        : "";


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
            ${data.icon}
          </span>

          <h3 class="erp-modal-title">
            ${escapeHtml(title)}
          </h3>

        </div>


        <p class="erp-modal-summary">
          ${escapeHtml(summary)}
        </p>


        ${
          hasSteps

            ? `
              
            `

            : ""
        }


        ${stepsHtml}

      
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


    requestAnimationFrame(() => {

      overlay.classList.add(
        "is-visible"
      );

    });


    function closeModal() {

      overlay.classList.remove(
        "is-visible"
      );


      overlay.addEventListener(

        "transitionend",

        () => overlay.remove(),

        {
          once: true
        }

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

      event => {

        if (event.target === overlay)
          closeModal();

      }

    );


    const launchBtn = overlay.querySelector("[data-modal-launch]");
    if (launchBtn) {
      launchBtn.addEventListener("click", () => {
        closeModal();
        openRoute(data.name || data.labelEn || data.doctype || title);
      });
    }

  }


  /* =========================================================
     12. ROUTING
  ========================================================= */

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


    if (treeDocs.has(name)) {

      frappe.set_route(
        "Tree",
        name
      );

      return;

    }


    frappe.set_route(
      "List",
      name
    );

  }


  /* =========================================================
     13. RENDER SALES CYCLE
  ========================================================= */

  function renderSalesCycle() {

    if (!salesCycle)
      return;


    const sectionTitle =
      isArabic
        ? "دورة المبيعات"
        : "Sales Cycle";


    salesCycle.innerHTML = `

      <section class="erp-cycle-container">

        <h2 class="erp-section-title erp-cycle-title">
          ${escapeHtml(sectionTitle)}
        </h2>


        <div class="erp-cycle-grid">

          ${salesCycleCards

            .map(
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
                  salesCycleCards.length - 1

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
                      data-cycle-route="${escapeHtml(card.doctype)}"
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
            )

            .join("")}

        </div>

      </section>

    `;


    salesCycle.addEventListener(

      "click",

      event => {

        const card =
          event.target.closest(
            "[data-cycle-route]"
          );


        if (!card)
          return;


        event.preventDefault();


        openRoute(
          card.dataset.cycleRoute
        );

      }

    );

  }


  /* =========================================================
     14. RENDER OVERVIEW
  ========================================================= */

  function renderStats() {

    if (!statsSection)
      return;


    const title =
      isArabic
        ? "نظرة عامة"
        : "Overview";


    statsSection.innerHTML = `

      <section class="erp-overview-container">

        <h2 class="erp-section-title">
          ${escapeHtml(title)}
        </h2>


        <div class="erp-stats-grid">

          ${statsCards

            .map(
              (card, index) => `

                <div
                  class="
                    erp-stat-card
                    overview-tone-${index + 1}
                  "
                >

                  <div class="erp-stat-icon">
                    ${escapeHtml(card.short)}
                  </div>


                  <div class="erp-stat-info">

                    <span
                      class="erp-stat-value"
                      data-stat-id="${card.id}"
                    >
                      ...
                    </span>


                    <span class="erp-stat-label">

                      ${escapeHtml(
                        isArabic
                          ? card.labelAr
                          : card.labelEn
                      )}

                    </span>

                  </div>

                </div>

              `
            )

            .join("")}

        </div>

      </section>

    `;


    if (!window.frappe)
      return;


    statsCards.forEach(card => {

      card.fetch().then(value => {

        const element =
          statsSection.querySelector(
            `[data-stat-id="${card.id}"]`
          );


        if (element) {

          element.textContent =
            formatNumber(value);

        }

      });

    });

  }


  /* =========================================================
     15. QUICK ACTIONS
  ========================================================= */

  function renderQuickActions() {

    if (!quickActions)
      return;


    quickActions.innerHTML = `

      <h2 class="erp-section-title">

        ${escapeHtml(
          isArabic
            ? "اختصارات سريعة"
            : "Quick Actions"
        )}

      </h2>


      <div class="erp-quick-grid">

        ${quickActionButtons

          .map(
            button => `

              <button
                type="button"
                class="erp-quick-btn"
                data-new-doc="${escapeHtml(button.doctype)}"
              >

                <span class="erp-quick-label">

                  ${escapeHtml(
                    isArabic
                      ? button.labelAr
                      : button.labelEn
                  )}

                </span>

              </button>

            `
          )

          .join("")}

      </div>

    `;


    quickActions.addEventListener(

      "click",

      event => {

        const button =
          event.target.closest(
            "[data-new-doc]"
          );


        if (
          !button ||
          !window.frappe
        )
          return;


        if (
          typeof frappe.new_doc ===
          "function"
        ) {

          frappe.new_doc(
            button.dataset.newDoc
          );

        }

      }

    );

  }


  /* =========================================================
     16. RENDER SECTIONS
  ========================================================= */

  function renderSections() {

    content.innerHTML =
      sections

        .map(
          (section, sectionIndex) => {


            const cards =
              section[1]

                .map(
                  (card, cardIndex) => {


                    const links =
                      card[2]

                        .map(
                          item => {


                            const description =
                              itemDescriptions[item];


                            const detailText =
                              isArabic
                                ? "تفاصيل"
                                : "Details";


                            const infoButton =
                              description

                                ? `
                                  <button
                                    type="button"
                                    class="erp-info-link"
                                    data-info-item="${escapeHtml(item)}"
                                  >
                                    ${detailText}
                                  </button>
                                `

                                : "";


                            return `

                              <div class="erp-link-row">

                                <button
                                  type="button"
                                  class="erp-link"
                                  data-route-name="${escapeHtml(item)}"
                                >

                                  <span class="erp-link-text">
                                    ${escapeHtml(translate(item))}
                                  </span>


                                  <span class="erp-link-arrow">
                                    ${isArabic ? "←" : "→"}
                                  </span>

                                </button>


                                ${infoButton}

                              </div>

                            `;

                          }
                        )

                        .join("");


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
                            ${card[1]}
                          </span>


                          <span class="erp-card-title">
                            ${escapeHtml(translate(card[0]))}
                          </span>


                          <span class="erp-card-chevron">
                            ⌄
                          </span>

                        </button>


                        <div class="erp-card-links">
                          ${links}
                        </div>

                      </article>

                    `;

                  }
                )

                .join("");


            return `

              <section class="erp-module-section">

                <h2 class="erp-section-title">
                  ${escapeHtml(translate(section[0]))}
                </h2>


                <div class="erp-dashboard-grid">
                  ${cards}
                </div>

              </section>

            `;

          }
        )

        .join("");

  }


  /* =========================================================
     17. FOOTER
  ========================================================= */

  function renderFooter() {

    if (!footerEl)
      return;


    const labels =
      footerInfo.labels;


    footerEl.innerHTML = `

      <div class="erp-footer-inner">

        <div class="erp-footer-item">

          <span class="erp-footer-icon">
            ☎
          </span>

          <span class="erp-footer-label">
            ${escapeHtml(
              isArabic
                ? labels.phoneAr
                : labels.phoneEn
            )}:
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
            ✉
          </span>

          <span class="erp-footer-label">
            ${escapeHtml(
              isArabic
                ? labels.emailAr
                : labels.emailEn
            )}:
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
            ◎
          </span>

          <span class="erp-footer-label">
            ${escapeHtml(
              isArabic
                ? labels.websiteAr
                : labels.websiteEn
            )}:
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


  /* =========================================================
     18. EVENTS
  ========================================================= */

  let lastToggleTime = 0;


  content.addEventListener(

    "click",

    event => {


      const infoButton =
        event.target.closest(
          "[data-info-item]"
        );


      if (infoButton) {

        event.preventDefault();
        event.stopPropagation();


        const itemName =
          infoButton.dataset.infoItem;


        const data =
          itemDescriptions[itemName];


        if (data) {

          showInfoModal({

            icon:
              data.icon || "📄",

            labelAr:
              translate(itemName),

            labelEn:
              itemName,

            summaryAr:
              data.summaryAr,

            summaryEn:
              data.summaryEn,

            stepsAr:
              data.stepsAr,

            stepsEn:
              data.stepsEn

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


  /* =========================================================
     19. INIT
  ========================================================= */

  renderSalesCycle();

  renderStats();

  renderQuickActions();

  renderSections();

  renderFooter();

})();