(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم المحاسبة المالية — ERPNext Accounting
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
     ١. إحصائيات المحاسبة
  ───────────────────────────────────────── */

  const statsCards = [
    {
      id: "total-income",
      short: "INC",
      labelEn: "Total Income",
      labelAr: "إجمالي الإيرادات",
      isCurrency: true,
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_list",
            args: {
              doctype: "Sales Invoice",
              filters: { docstatus: 1 },
              fields: ["sum(grand_total) as total"],
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
      id: "total-expenses",
      short: "EXP",
      labelEn: "Total Expenses",
      labelAr: "إجمالي المصروفات",
      isCurrency: true,
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_list",
            args: {
              doctype: "Purchase Invoice",
              filters: { docstatus: 1 },
              fields: ["sum(grand_total) as total"],
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
      id: "receivables",
      short: "REC",
      labelEn: "Accounts Receivable",
      labelAr: "الذمم المدينة",
      isCurrency: true,
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_list",
            args: {
              doctype: "Sales Invoice",
              filters: { docstatus: 1, outstanding_amount: [">", 0] },
              fields: ["sum(outstanding_amount) as total"],
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
      id: "payables",
      short: "PAY",
      labelEn: "Accounts Payable",
      labelAr: "الذمم الدائنة",
      isCurrency: true,
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_list",
            args: {
              doctype: "Purchase Invoice",
              filters: { docstatus: 1, outstanding_amount: [">", 0] },
              fields: ["sum(outstanding_amount) as total"],
              limit_page_length: 0
            },
            callback: data => {
              const value = data?.message?.[0]?.total || 0;
              resolve(Number(value).toFixed(2));
            },
            error: () => resolve("0.00")
          });
        })
    }
  ];

  /* ─────────────────────────────────────────
     ٢. أزرار الاختصارات السريعة (تبقى كما هي)
  ───────────────────────────────────────── */

  const quickActionButtons = [
    {
      doctype: "Journal Entry",
      labelEn: "New Journal Entry",
      labelAr: "قيد يومية جديد"
    },
    {
      doctype: "Payment Entry",
      labelEn: "New Payment Entry",
      labelAr: "سند قبض / دفع جديد"
    },
    {
      doctype: "Sales Invoice",
      labelEn: "New Sales Invoice",
      labelAr: "فاتورة مبيعات جديدة"
    },
    {
      doctype: "Purchase Invoice",
      labelEn: "New Purchase Invoice",
      labelAr: "فاتورة مشتريات جديدة"
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
     ٤. بطاقات المحاسبة — مطابقة تماماً للصورة الأصلية (٩ مربعات)
  ───────────────────────────────────────── */

  const sections = [
    [
      "Reports & Masters",
      [
        // الصف الأول
        [
          "Accounting Masters",
          "🏛️",
          [
            "Company",
            "Chart of Accounts",
            "Accounts Settings",
            "Fiscal Year",
            "Accounting Dimension",
            "Finance Book",
            "Accounting Period",
            "Payment Term"
          ]
        ],
        [
          "Payments",
          "💳",
          [
            "Payment Entry",
            "Journal Entry",
            "Journal Entry Template",
            "Terms and Conditions",
            "Mode of Payment"
          ]
        ],
        [
          "Tax Masters",
          "🧾",
          [
            "Sales Taxes and Charges Template",
            "Purchase Taxes and Charges Template",
            "Item Tax Template",
            "Tax Category",
            "Tax Rule",
            "Tax Withholding Category"
          ]
        ],

        // الصف الثاني
        [
          "Cost Center and Budgeting",
          "📊",
          [
            "Chart of Cost Centers",
            "Budget",
            "Accounting Dimension",
            "Cost Center Allocation",
            "Budget Variance Report",
            "Monthly Distribution"
          ]
        ],
        [
          "Multi Currency",
          "💱",
          [
            "Currency",
            "Currency Exchange",
            "Exchange Rate Revaluation"
          ]
        ],
        [
          "Banking",
          "🏦",
          [
            "Bank",
            "Bank Account",
            "Bank Clearance",
            "Bank Reconciliation Tool",
            "Bank Reconciliation Statement",
            "Plaid Settings"
          ]
        ],

        // الصف الثالث
        [
          "Opening and Closing",
          "🔐",
          [
            "Opening Invoice Creation Tool",
            "Chart of Accounts Importer",
            "Period Closing Voucher"
          ]
        ],
        [
          "Subscription Management",
          "🔄",
          [
            "Subscription Plan",
            "Subscription",
            "Subscription Settings"
          ]
        ],
        [
          "Share Management",
          "📈",
          [
            "Shareholder",
            "Share Transfer",
            "Share Ledger",
            "Share Balance"
          ]
        ]
      ]
    ]
  ];

  /* ─────────────────────────────────────────
     ٥. الترجمات العربية المعتمدة
  ───────────────────────────────────────── */

  const arabicFallback = {
    "Reports & Masters": "التقارير والبيانات الرئيسية",

    // المربع ١: البيانات الرئيسية للمحاسبة
    "Accounting Masters": "البيانات الرئيسية للمحاسبة",
    "Company": "الشركة",
    "Chart of Accounts": "دليل الحسابات",
    "Accounts Settings": "إعدادات الحسابات",
    "Fiscal Year": "السنة المالية",
    "Accounting Dimension": "البُعد المحاسبي",
    "Finance Book": "الدفتر المالي",
    "Accounting Period": "الفترة المحاسبية",
    "Payment Term": "شرط الدفع",

    // المربع ٢: المدفوعات (عربي في الصورة الأصلية)
    "Payments": "المدفوعات",
    "Payment Entry": "سندات الصرف والقبض",
    "Journal Entry": "القيود اليومية",
    "Journal Entry Template": "قالب إدخال قيد اليومية",
    "Terms and Conditions": "الشروط والأحكام",
    "Mode of Payment": "طريقة الدفع",

    // المربع ٣: البيانات الرئيسية للضرائب
    "Tax Masters": "البيانات الرئيسية للضرائب",
    "Sales Taxes and Charges Template": "قالب ضرائب ورسوم المبيعات",
    "Purchase Taxes and Charges Template": "قالب ضرائب ورسوم المشتريات",
    "Item Tax Template": "قالب ضريبة الصنف",
    "Tax Category": "الفئة الضريبية",
    "Tax Rule": "القاعدة الضريبية",
    "Tax Withholding Category": "فئة ضريبة الاستقطاع",

    // المربع ٤: مراكز التكلفة والميزانيات
    "Cost Center and Budgeting": "مراكز التكلفة والميزانيات",
    "Chart of Cost Centers": "دليل مراكز التكلفة",
    "Budget": "الميزانية التقديرية",
    "Cost Center Allocation": "توزيع مركز التكلفة",
    "Budget Variance Report": "تقرير انحراف الميزانية",
    "Monthly Distribution": "التوزيع الشهري",

    // المربع ٥: العملات المتعددة
    "Multi Currency": "العملات المتعددة",
    "Currency": "العملة",
    "Currency Exchange": "سعر صرف العملة",
    "Exchange Rate Revaluation": "إعادة تقييم سعر الصرف",

    // المربع ٦: العمليات البنكية
    "Banking": "العمليات البنكية",
    "Bank": "البنك",
    "Bank Account": "الحساب البنكي",
    "Bank Clearance": "المقاصة البنكية",
    "Bank Reconciliation Tool": "أداة مطابقة البنك",
    "Bank Reconciliation Statement": "كشف تسوية البنك",
    "Plaid Settings": "إعدادات Plaid",

    // المربع ٧: الافتتاح والإقفال
    "Opening and Closing": "الافتتاح والإقفال",
    "Opening Invoice Creation Tool": "أداة إنشاء فواتير الأرصدة الافتتاحية",
    "Chart of Accounts Importer": "مستورد دليل الحسابات",
    "Period Closing Voucher": "سند إقفال الفترة",

    // المربع ٨: إدارة الاشتراكات
    "Subscription Management": "إدارة الاشتراكات",
    "Subscription Plan": "خطة الاشتراك",
    "Subscription": "الاشتراك",
    "Subscription Settings": "إعدادات الاشتراكات",

    // المربع ٩: إدارة الأسهم
    "Share Management": "إدارة الأسهم",
    "Shareholder": "المساهم",
    "Share Transfer": "تحويل الأسهم",
    "Share Ledger": "دفتر أستاذ الأسهم",
    "Share Balance": "رصيد الأسهم",

    // الاختصارات
    "Sales Invoice": "فاتورة مبيعات",
    "Purchase Invoice": "فاتورة مشتريات"
  };

  /* ─────────────────────────────────────────
     ٦. أنواع المسارات
  ───────────────────────────────────────── */

  const reportNames = new Set([
    "Budget Variance Report",
    "Bank Reconciliation Statement",
    "Share Ledger",
    "Share Balance"
  ]);

  const treeDocs = new Set([
    "Account",
    "Cost Center"
  ]);

  const singleDocs = new Set([
    "Accounts Settings",
    "Plaid Settings",
    "Subscription Settings"
  ]);

  /* ─────────────────────────────────────────
     ٧. تفاصيل الشاشات والإعدادات (ما عدا التقارير)
  ───────────────────────────────────────── */

  const itemDescriptions = {
    // ═══ المربع ١: البيانات الرئيسية للمحاسبة ═══
    "Company": {
      icon: "🏢",
      summaryAr: "إنشاء وإدارة بيانات الشركة القانونية والمالية، والعملة الرسمية، وبداية ونهاية السنة المالية، وبيانات الضرائب والسجل التجاري.",
      summaryEn: "Create and manage company legal and financial data, official currency, fiscal year dates, tax information, and commercial registration.",
      stepsAr: [
        "اضغط «شركة جديدة»",
        "أدخل اسم الشركة الرسمي واسم النطاق والعملة الأساسية",
        "حدد الدولة وتاريخ بداية السنة المالية",
        "أدخل الرقم الضريبي والسجل التجاري",
        "حدد حسابات الدخل والمصروفات وحسابات البنك الافتراضية",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Company»",
        "Enter company legal name, domain, and default currency",
        "Select country and fiscal year start date",
        "Enter Tax ID and Commercial Registration number",
        "Set default income, expense, and bank accounts",
        "Click «Save»"
      ]
    },

    "Chart of Accounts": {
      icon: "📚",
      summaryAr: "استعراض وإدارة دليل الحسابات الشجري (الأصول، الخصوم، حقوق الملكية، الإيرادات، المصروفات) وإضافة الحسابات وتصنيفها.",
      summaryEn: "View and manage the hierarchical Chart of Accounts (Assets, Liabilities, Equity, Income, Expenses) and organize accounts.",
      stepsAr: [
        "افتح «دليل الحسابات»",
        "اختر الشركة لاستعراض شجرة الحسابات الخاصة بها",
        "اضغط على أي حساب رئيسي لإضافة حساب فرعي تحته",
        "حدد اسم الحساب ورقمه ونوع الحساب والعملة",
        "اضغط «إضافة حساب»"
      ],
      stepsEn: [
        "Open «Chart of Accounts»",
        "Select company to view its hierarchical tree",
        "Click on any parent account to add a child account under it",
        "Set account name, number, account type, and currency",
        "Click «Add Account»"
      ]
    },

    "Accounts Settings": {
      icon: "⚙️",
      summaryAr: "شاشة الإعدادات العامة للمحاسبة لضبط سياسات النظام المالية، وتحديد الحسابات الافتراضية، وإدارة شروط وحدود الائتمان وسقوف الديون للعملاء، وضبط معالجة فروقات أسعار الصرف، والتحكم في إقفال وتجميد الحسابات السابقة.",
      summaryEn: "General accounting configuration to set financial policies, default accounts, credit limits and thresholds for customers, foreign exchange variance handling, and account freeze control.",
      stepsAr: [
        "تجميد الحسابات القديمة لتفادي التعديل على الفترات المالية المغلقة",
        "تحديد حسابات الأرباح والخسائر الافتراضية وحسابات الفروقات الدائرية",
        "ضبط سياسات تدقيق ومطابقة أوامر الشراء وإيصالات الاستلام مع الفواتير",
        "تحديد حدود الائتمان وفترات السماح للعملاء والتنبيه التلقائي عند تجاوزها",
        "تحديد الحسابات الافتراضية للعمولات والمصروفات البنكية"
      ],
      stepsEn: [
        "Freeze old accounting entries to prevent unauthorized past period modifications",
        "Set default gain/loss accounts and round-off variance accounts",
        "Configure invoice over-billing thresholds and 3-way matching rules",
        "Define customer credit limits, grace periods, and overdue warnings",
        "Set default bank charge and commission ledger accounts"
      ]
    },

    "Fiscal Year": {
      icon: "📅",
      summaryAr: "تعريف الفترات والسنوات المالية للمنشأة وتحديد تواريخ البدء والانتهاء وإغلاق السنوات المالية السابقة.",
      summaryEn: "Define fiscal years and accounting periods, specifying start/end dates and closing past financial years.",
      stepsAr: [
        "اضغط «سنة مالية جديدة»",
        "أدخل اسم السنة المالية (مثل: 2026)",
        "حدد تاريخ البداية وتاريخ النهاية",
        "اختر الشركات التابعة لهذه السنة المالية",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Fiscal Year»",
        "Enter fiscal year name (e.g. 2026)",
        "Set start date and end date",
        "Select applicable companies",
        "Click «Save»"
      ]
    },

    "Accounting Dimension": {
      icon: "📐",
      summaryAr: "إضافة أبعاد محاسبية إضافية وتخصيصها (مثل: الفروع، المشاريع، مندوبي المبيعات) لتمكين التحليل المالي التفصيلي للمعاملات.",
      summaryEn: "Add custom accounting dimensions (e.g., branches, projects, sales agents) for detailed financial analysis across transactions.",
      stepsAr: [
        "اضغط «بُعد محاسبي جديد»",
        "اختر نوع المستند المرجعي للبُعد (مثل: الفرع أو المشروع)",
        "حدد اسم البُعد المحاسبي",
        "حدد المستندات التي سيظهر فيها هذا البُعد تلقائياً",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Accounting Dimension»",
        "Select reference DocType for dimension (e.g. Branch or Project)",
        "Enter dimension name",
        "Select target doctypes where this dimension should be tracked",
        "Click «Save»"
      ]
    },

    "Finance Book": {
      icon: "📖",
      summaryAr: "إنشاء دفاتر مالية موازية لتطبيق معايير محاسبية متعددة (مثل: المعايير المحلية IFRS أو المعايير الضريبية) بشكل مستقل.",
      summaryEn: "Create parallel finance books to apply multiple accounting standards (such as IFRS or tax accounting) independently.",
      stepsAr: [
        "اضغط «دفتر مالي جديد»",
        "أدخل اسم الدفتر المالي والغرض منه",
        "اربط الدفتر بالقيود اليومية أو فئات الأصول الخاصة به",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Finance Book»",
        "Enter finance book name and purpose",
        "Link book to journal entries or asset categories as needed",
        "Click «Save»"
      ]
    },

    "Accounting Period": {
      icon: "🗓️",
      summaryAr: "تقسيم السنة المالية إلى فترات محاسبية دورية (أشهر أو أرباع سنوية) وإغلاقها تدريجياً لضبط القيود.",
      summaryEn: "Divide fiscal year into periodic accounting periods (monthly or quarterly) and freeze them progressively.",
      stepsAr: [
        "اضغط «فترة محاسبية جديدة»",
        "اختر السنة المالية والشركة",
        "حدد تاريخ بداية ونهاية الفترة",
        "حدد ما إذا كانت الفترة مغلقة لتجميد الترحيل إليها",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Accounting Period»",
        "Select fiscal year and company",
        "Set start date and end date",
        "Mark period closed when completed to prevent posting",
        "Click «Save»"
      ]
    },

    "Payment Term": {
      icon: "⏳",
      summaryAr: "تعريف شروط وأقساط السداد المستحقة على الفواتير (مثل: سداد فوري، سداد بعد ٣٠ يوماً، أو دفعات مجدولة).",
      summaryEn: "Define payment terms and installments for invoices (e.g., immediate, Net 30, or scheduled milestone payments).",
      stepsAr: [
        "اضغط «شرط دفع جديد»",
        "أدخل اسم الشرط (مثل: بعد 30 يوم)",
        "حدد عدد الأيام المستحقة أو اليوم من الشهر",
        "حدد نسبة الدفعة من إجمالي الفاتورة",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Payment Term»",
        "Enter term name (e.g. Net 30)",
        "Set credit days or specific day of month",
        "Set payment percentage of invoice amount",
        "Click «Save»"
      ]
    },

    // ═══ المربع ٢: المدفوعات ═══
    "Payment Entry": {
      icon: "💳",
      summaryAr: "تسجيل سندات القبض والصرف للموردين والعملاء والمصروفات والتحويلات البنكية وإقفال الفواتير المستحقة.",
      summaryEn: "Record payment and receipt vouchers for suppliers, customers, expenses, internal transfers, and invoice reconciliation.",
      stepsAr: [
        "اضغط «سند دفع/قبض جديد»",
        "حدد نوع السند (استلام، دفع، تحويل داخلي)",
        "اختر الطرف (عميل، مورد، موظف)",
        "أدخل المبلغ المدفوع وحدد حساب البنك/الصندوق",
        "طابق السند مع الفواتير المفتوحة",
        "اضغط «حفظ» ثم «تسجيل»"
      ],
      stepsEn: [
        "Click «New Payment Entry»",
        "Select entry type (Receive, Pay, Internal Transfer)",
        "Select party (Customer, Supplier, Employee)",
        "Enter amount and select bank/cash account",
        "Allocate payment against outstanding invoices",
        "Click «Save» then «Submit»"
      ]
    },

    "Journal Entry": {
      icon: "📒",
      summaryAr: "إنشاء قيود يومية يدوية لتسجيل التسويات والمصروفات والافتتاحيات والإهلاك والتحويلات المحاسبية.",
      summaryEn: "Create manual journal entries for adjustments, expenses, opening balances, depreciation, and account transfers.",
      stepsAr: [
        "اضغط «قيد يومية جديد»",
        "حدد نوع القيد (قيد يومية، تسوية بنكية، افتتاحي)",
        "أضف أسطر الحسابات مع مبالغ المدين والدائن متطابقة",
        "أدخل مركز التكلفة والبيان التوضيحي لكل سطر",
        "اضغط «حفظ» ثم «تسجيل»"
      ],
      stepsEn: [
        "Click «New Journal Entry»",
        "Select entry type (Journal Entry, Bank Entry, Opening Entry)",
        "Add account lines with balanced Debit and Credit amounts",
        "Set cost center and user remarks per row",
        "Click «Save» then «Submit»"
      ]
    },

    "Journal Entry Template": {
      icon: "📋",
      summaryAr: "إنشاء قوالب جاهزة للقيود المتكررة (مثل قيود الرواتب أو الإيجارات) لتسريع الإدخال وتفادي الأخطاء.",
      summaryEn: "Create reusable templates for recurring journal entries (e.g. payroll, rent) to speed up entry and prevent mistakes.",
      stepsAr: [
        "اضغط «قالب قيد يومية جديد»",
        "أدخل اسم القالب (مثل: قيد الإيجار الشهري)",
        "أضف الحسابات المدينة والدائنة الافتراضية والنسب",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Journal Entry Template»",
        "Enter template name (e.g. Monthly Rent Template)",
        "Add default debit and credit accounts and ratios",
        "Click «Save»"
      ]
    },

    "Terms and Conditions": {
      icon: "📜",
      summaryAr: "إعداد قوالب الشروط والأحكام القياسية لإرفاقها بالفواتير وعروض الأسعار وأوامر البيع والشراء.",
      summaryEn: "Set up standard terms and conditions templates to attach to invoices, quotations, and purchase/sales orders.",
      stepsAr: [
        "اضغط «شروط وأحكام جديدة»",
        "أدخل عنوان القالب",
        "اكتب نصوص الشروط وسياسات الدفع والاسترجاع",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Terms and Conditions»",
        "Enter template title",
        "Enter terms, payment, and refund policies text",
        "Click «Save»"
      ]
    },

    "Mode of Payment": {
      icon: "💵",
      summaryAr: "تعريف طرق الدفع المختلفة (نقدي، مدى، فيزا، تحويل بنكي) وربط كل طريقة بحساب البنك أو الصندوق الخاص بها.",
      summaryEn: "Define payment methods (Cash, Mada, Credit Card, Bank Transfer) and link each method to its designated ledger account.",
      stepsAr: [
        "اضغط «طريقة دفع جديدة»",
        "أدخل اسم الطريقة (مثل: مدى، تحويل بنكي، كاش)",
        "اختر نوع طريقة الدفع",
        "أضف الشركة وحساب الحسابات الافتراضي المقابل",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Mode of Payment»",
        "Enter payment mode name (e.g. Mada, Wire Transfer, Cash)",
        "Select payment mode type",
        "Add company and default account mapping",
        "Click «Save»"
      ]
    },

    // ═══ المربع ٣: البيانات الرئيسية للضرائب ═══
    "Sales Taxes and Charges Template": {
      icon: "🧾",
      summaryAr: "إعداد قوالب الضرائب والرسوم على المبيعات (مثل ضريبة القيمة المضافة 15%) وتحديد حساب الضريبة المستحقة.",
      summaryEn: "Configure sales tax templates (e.g., 15% VAT) and define the output tax payable ledger account.",
      stepsAr: [
        "اضغط «قالب ضرائب مبيعات جديد»",
        "أدخل عنوان القالب (مثل: ضريبة القيمة المضافة 15%)",
        "اختر حساب الضريبة المحاسبي",
        "حدد نسبة الضريبة (15%) وطريقة احتسابها على الإجمالي",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Sales Taxes and Charges Template»",
        "Enter template title (e.g. 15% VAT)",
        "Select tax accounting ledger",
        "Set tax rate (15%) and calculation formula on net total",
        "Click «Save»"
      ]
    },

    "Purchase Taxes and Charges Template": {
      icon: "📥",
      summaryAr: "إعداد قوالب الضرائب والرسوم على المشتريات لتسجيل ضريبة المدخلات القابلة للاسترداد تلقائياً في فواتير الشراء.",
      summaryEn: "Configure purchase tax templates to automatically record recoverable input VAT on purchase invoices.",
      stepsAr: [
        "اضغط «قالب ضرائب مشتريات جديد»",
        "أدخل عنوان القالب",
        "اختر حساب ضريبة القيمة المضافة المدخلات",
        "حدد نسبة الضريبة (15%)",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Purchase Taxes and Charges Template»",
        "Enter template title",
        "Select input VAT tax account",
        "Set tax rate (15%)",
        "Click «Save»"
      ]
    },

    "Item Tax Template": {
      icon: "🏷️",
      summaryAr: "تخصيص نسب ضرائب خاصة لأصناف محددة (مثل الأصناف المعفاة أو الخاضعة لنسبة صفرية).",
      summaryEn: "Define specific tax rates for certain items (such as exempt, zero-rated, or specialized products).",
      stepsAr: [
        "اضغط «قالب ضريبة صنف جديد»",
        "أدخل اسم القالب (مثل: معفى من الضريبة، نسبة صفرية)",
        "حدد نوع الضريبة ونسبتها المطبقة على الصنف",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Item Tax Template»",
        "Enter template title (e.g. Zero Rated, Tax Exempt)",
        "Specify tax type and applicable rate for item",
        "Click «Save»"
      ]
    },

    "Tax Category": {
      icon: "📑",
      summaryAr: "تصنيف العملاء والموردين ضريبياً (مثل: محلي، تصدير، معفى) لتطبيق قالب الضرائب الملائم آلياً.",
      summaryEn: "Classify customers and suppliers into tax categories (e.g., domestic, export, exempt) for auto-tax mapping.",
      stepsAr: [
        "اضغط «فئة ضريبية جديدة»",
        "أدخل اسم الفئة الضريبية",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Tax Category»",
        "Enter tax category title",
        "Click «Save»"
      ]
    },

    "Tax Rule": {
      icon: "⚖️",
      summaryAr: "إنشاء قواعد شرطية لتحديد قالب الضرائب الواجب تطبيقه تلقائياً بناءً على المنطقة أو العميل أو التاريخ.",
      summaryEn: "Create conditional rules to automatically apply tax templates based on region, customer, or transaction date.",
      stepsAr: [
        "اضغط «قاعدة ضريبية جديدة»",
        "حدد نوع القاعدة (مبيعات أو مشتريات)",
        "اختر قالب الضرائب المطلوب تطبيقه",
        "حدد الشروط (العميل، الدولة، الفئة، التواريخ)",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Tax Rule»",
        "Select rule type (Sales or Purchase)",
        "Choose tax template to apply",
        "Specify conditions (Customer, Country, Category, Dates)",
        "Click «Save»"
      ]
    },

    "Tax Withholding Category": {
      icon: "🛡️",
      summaryAr: "إدارة ضريبة الاستقطاع المخصومة عند الدفع لموردين أو جهات خارجية وتوريدها للجهات الحكومية.",
      summaryEn: "Manage withholding tax deducted from payments to suppliers or foreign entities for regulatory compliance.",
      stepsAr: [
        "اضغط «فئة ضريبة استقطاع جديدة»",
        "أدخل اسم الفئة ونسب الاستقطاع بحسب الشريحة",
        "حدد الحساب المحاسبي للضريبة المستقطعة",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Tax Withholding Category»",
        "Enter category name and withholding tax rates",
        "Select withholding tax payable ledger account",
        "Click «Save»"
      ]
    },

    // ═══ المربع ٤: مراكز التكلفة والميزانيات ═══
    "Chart of Cost Centers": {
      icon: "🏢",
      summaryAr: "إدارة الهيكل الشجري لمراكز التكلفة لتوزيع وتحليل الإيرادات والمصروفات حسب الأقسام والفروع والمشاريع.",
      summaryEn: "Manage hierarchical Cost Center tree to allocate and analyze income and expenses by department, branch, or project.",
      stepsAr: [
        "افتح «دليل مراكز التكلفة»",
        "اختر الشركة لاستعراض الشجرة",
        "اضغط على أي مركز رئيسي لإضافة مركز تكلفة فرعي تحته",
        "حدد اسم المركز وحدد ما إذا كان مركزاً فرعياً أو تجميعياً",
        "اضغط «إضافة مركز تكلفة»"
      ],
      stepsEn: [
        "Open «Chart of Cost Centers»",
        "Select company to view tree",
        "Click on any parent to add child cost center",
        "Enter cost center name and mark if group or leaf",
        "Click «Add Cost Center»"
      ]
    },

    "Budget": {
      icon: "💰",
      summaryAr: "إعداد ومراقبة الميزانيات التقديرية لمراكز التكلفة والمشاريع وتفعيل التنبيهات أو الحظر عند تجاوز الميزانية.",
      summaryEn: "Set and monitor budgets for cost centers and projects with automated warnings or blocking on overrun.",
      stepsAr: [
        "اضغط «ميزانية جديدة»",
        "حدد الميزانية على مركز تكلفة أو مشروع",
        "اختر السنة المالية والشركة",
        "أضف بنود المصروفات والمبالغ التقديرية المعتمدة لكل حساب",
        "اضبط إجراء التجاوز (تنبيه أو إيقاف المعاملة)",
        "اضغط «حفظ» ثم «تسجيل»"
      ],
      stepsEn: [
        "Click «New Budget»",
        "Select budget target (Cost Center or Project)",
        "Select fiscal year and company",
        "Add expense accounts and approved budget amounts",
        "Configure overrun action (Warning or Stop)",
        "Click «Save» then «Submit»"
      ]
    },

    "Cost Center Allocation": {
      icon: "🔄",
      summaryAr: "توزيع نسب التكاليف والمصروفات المشتركة بين مراكز تكلفة متعددة تلقائياً بناءً على نسب محددة مسبقاً.",
      summaryEn: "Automatically distribute shared costs and overheads across multiple cost centers based on defined percentages.",
      stepsAr: [
        "اضغط «توزيع مركز تكلفة جديد»",
        "اختر مركز التكلفة الرئيسي المراد توزيعه",
        "أضف مراكز التكلفة المستلمة ونسبة التوزيع لكل منها (بمجموع 100%)",
        "اضغط «حفظ» ثم «تسجيل»"
      ],
      stepsEn: [
        "Click «New Cost Center Allocation»",
        "Select main source cost center to distribute",
        "Add target cost centers and percentage share (total 100%)",
        "Click «Save» then «Submit»"
      ]
    },

    "Monthly Distribution": {
      icon: "📅",
      summaryAr: "توزيع نسب الميزانيات السنوية أو الأهداف على أشهر السنة (مثل مواسم الذروة والمواسم الهادئة).",
      summaryEn: "Distribute annual budgets or targets across months with custom seasonal weightings.",
      stepsAr: [
        "اضغط «توزيع شهري جديد»",
        "أدخل اسم التوزيع (مثل: توزيع موسمي)",
        "حدد نسبة كل شهر من إجمالي الـ 100%",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Monthly Distribution»",
        "Enter distribution name",
        "Set percentage weight for each month (total 100%)",
        "Click «Save»"
      ]
    },

    // ═══ المربع ٥: العملات المتعددة ═══
    "Currency": {
      icon: "💱",
      summaryAr: "إدارة العملات المدعومة في النظام وتحديد رموزها وعدد الخانات العشرية والتنسيق الرسمي.",
      summaryEn: "Manage system currencies, symbols, fraction units, and precision.",
      stepsAr: [
        "اضغط «عملة جديدة» أو اختر عملة موجودة",
        "أدخل اسم العملة ورمزها واسم الوحدة والكسور",
        "حدد الخانات العشرية",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Currency» or select existing",
        "Enter currency name, symbol, and fraction unit",
        "Set decimal precision",
        "Click «Save»"
      ]
    },

    "Currency Exchange": {
      icon: "💹",
      summaryAr: "تسجيل أسعار صرف العملات الأجنبية مقابل العملة الأساسية بتاريخ محدد لتقييم المعاملات آلياً.",
      summaryEn: "Record foreign currency exchange rates against base currency for a specific date to value transactions.",
      stepsAr: [
        "اضغط «سعر صرف عملة جديد»",
        "اختر العملة الأصلية والعملة المحول إليها",
        "حدد تاريخ سريان السعر ومعدل الصرف",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Currency Exchange»",
        "Select source and target currencies",
        "Set effective date and exchange rate",
        "Click «Save»"
      ]
    },

    "Exchange Rate Revaluation": {
      icon: "📊",
      summaryAr: "إعادة تقييم أرصدة الحسابات بالعملات الأجنبية في نهاية الفترة المالية وتسجيل أرباح أو خسائر فروقات الصرف غير المحققة.",
      summaryEn: "Revalue foreign currency account balances at period end and post unrealized exchange gain/loss journal entries.",
      stepsAr: [
        "اضغط «إعادة تقييم سعر الصرف جديد»",
        "اختر الشركة وتاريخ التقييم",
        "اضغط «جلب الحسابات» لاستيراد الحسابات الأجنبية وأسعارها الحالية",
        "حدد سعر الصرف الجديد لكل عملة",
        "اضغط «حفظ» ثم «تسجيل» لإنشاء قيد التسوية آلياً"
      ],
      stepsEn: [
        "Click «New Exchange Rate Revaluation»",
        "Select company and posting date",
        "Click «Get Accounts» to pull foreign currency ledgers",
        "Enter current revaluation exchange rates",
        "Click «Save» then «Submit» to generate adjustment journal entry"
      ]
    },

    // ═══ المربع ٦: العمليات البنكية ═══
    "Bank": {
      icon: "🏦",
      summaryAr: "تعريف البنوك والمصارف التي تتعامل معها المنشأة وبياناتها الرسمية وأرقام التحويل السريع.",
      summaryEn: "Define banks and financial institutions the company deals with, SWIFT codes, and details.",
      stepsAr: [
        "اضغط «بنك جديد»",
        "أدخل اسم البنك والرمز التعريفي SWIFT",
        "أضف موقع الفرع ورقم الهاتف",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Bank»",
        "Enter bank name and SWIFT code",
        "Add branch location and contact numbers",
        "Click «Save»"
      ]
    },

    "Bank Account": {
      icon: "🏧",
      summaryAr: "إنشاء وإدارة الحسابات البنكية للمنشأة وربطها برقم الآيبان IBAN وحساب الأستاذ العام المقابل في المحاسبة.",
      summaryEn: "Create and manage bank accounts, linking IBAN, account numbers, and the corresponding ledger account.",
      stepsAr: [
        "اضغط «حساب بنكي جديد»",
        "أدخل اسم الحساب والبنك التابع له",
        "أدخل رقم الحساب ورقم الآيبان IBAN",
        "اختر حساب دفتر الأستاذ المقابل للبنك",
        "حدد العملة ونوع الحساب",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Bank Account»",
        "Enter account name and bank",
        "Enter account number and IBAN",
        "Link to corresponding ledger account in Chart of Accounts",
        "Set currency and account type",
        "Click «Save»"
      ]
    },

    "Bank Clearance": {
      icon: "📑",
      summaryAr: "تحديث تواريخ المقاصة والصرف الفعلي للشيكات والحوالات البنكية لتطابق كشف حساب البنك.",
      summaryEn: "Update clearance dates for checks and bank transfers to align with actual bank statement clearing.",
      stepsAr: [
        "افتح «المقاصة البنكية»",
        "اختر الحساب البنكي وحدد نطاق التواريخ",
        "أدخل تاريخ المقاصة الفعلي لكل حركة بنكية",
        "اضغط «تحديث تاريخ المقاصة»"
      ],
      stepsEn: [
        "Open «Bank Clearance»",
        "Select bank account and date range",
        "Enter actual clearance date for each entry",
        "Click «Update Clearance Date»"
      ]
    },

    "Bank Reconciliation Tool": {
      icon: "🔄",
      summaryAr: "أداة مطابقة كشف الحساب البنكي المستورد مع المعاملات المسجلة في النظام لتحديد الفروقات وتسويتها آلياً.",
      summaryEn: "Tool to reconcile imported bank statements against system transactions, resolving variances automatically.",
      stepsAr: [
        "افتح «أداة مطابقة البنك»",
        "اختر الحساب البنكي واستعرض الحركات غير المطابقة",
        "طابق كل حركة كشف حساب مع السند المقابل في النظام",
        "إذا كانت الحركة غير مسجلة، أنشئ سند دفع أو قيد مباشرة من الأداة",
        "اضغط «تسوية» لتأكيد المطابقة"
      ],
      stepsEn: [
        "Open «Bank Reconciliation Tool»",
        "Select bank account to view unreconciled transactions",
        "Match statement rows with existing system payment vouchers",
        "Create missing entries directly if needed",
        "Click «Reconcile» to finalize"
      ]
    },

    "Plaid Settings": {
      icon: "🔌",
      summaryAr: "إعداد وتفعيل الربط المصرفي مع شبكة Plaid البنكية لجلب المعاملات البنكية وكشوف الحساب آلياً ومزامنتها مباشرة دون الحاجة لرفع ملفات يدوية.",
      summaryEn: "Configure and enable banking integration with Plaid to automatically sync bank transactions and statements without manual file uploads.",
      stepsAr: [
        "إدخال مفاتيح الربط (Client ID و Secret) المقدمة من خدمة Plaid",
        "تحديد بيئة العمل (تجريبية Sandbox أو حية Production)",
        "ربط الحسابات البنكية المعرفة بالنظام مع الحسابات المستوردة",
        "تفعيل المزامنة التلقائية لعمليات السحب والإيداع"
      ],
      stepsEn: [
        "Enter Plaid API credentials (Client ID and Secret)",
        "Select environment mode (Sandbox or Production)",
        "Map system bank accounts to imported Plaid accounts",
        "Enable automated synchronization of banking transactions"
      ]
    },

    // ═══ المربع ٧: الافتتاح والإقفال ═══
    "Opening Invoice Creation Tool": {
      icon: "📄",
      summaryAr: "أداة إنشاء فواتير الأرصدة الافتتاحية للمبيعات والمشتريات عند بدء تشغيل النظام لترحيل المستحقات السابقة.",
      summaryEn: "Tool to create opening sales and purchase invoices during system implementation to migrate past receivables and payables.",
      stepsAr: [
        "افتح «أداة إنشاء فواتير الأرصدة الافتتاحية»",
        "اختر نوع الفاتورة (مبيعات أو مشتريات) والشركة",
        "أضف العملاء أو الموردين مع المبالغ المستحقة السابقة وتواريخ الاستحقاق",
        "اضغط «إنشاء الفواتير» لتوليدها وترحيلها دفعة واحدة"
      ],
      stepsEn: [
        "Open «Opening Invoice Creation Tool»",
        "Select invoice type (Sales or Purchase) and company",
        "Add customers or suppliers with outstanding balances and due dates",
        "Click «Create Invoices» to generate and post opening invoices in bulk"
      ]
    },

    "Chart of Accounts Importer": {
      icon: "📥",
      summaryAr: "استيراد وتصدير دليل الحسابات المالي عبر ملفات Excel أو CSV لبناء الهيكل المحاسبي بسهولة.",
      summaryEn: "Import and export financial Chart of Accounts via Excel or CSV spreadsheets to construct ledger trees easily.",
      stepsAr: [
        "افتح «مستورد شجرة الحسابات»",
        "اختر الشركة ثم حمل النموذج الفارغ Excel",
        "املأ الحسابات وأنواعها وأرقامها في الملف",
        "ارفع الملف المعبأ واضغط «بدء الاستيراد»",
        "راجع شجرة الحسابات بعد اكتمال الاستيراد"
      ],
      stepsEn: [
        "Open «Chart of Accounts Importer»",
        "Select company and download sample Excel template",
        "Fill accounts, types, and numbers in the sheet",
        "Upload completed file and click «Start Import»",
        "Verify accounts tree after import completes"
      ]
    },

    "Period Closing Voucher": {
      icon: "🔒",
      summaryAr: "سند إقفال الفترة المالية لترحيل أرصدة حسابات الإيرادات والمصروفات إلى حساب الأرباح المبقاة وتصفيرها للسنة الجديدة.",
      summaryEn: "Period closing voucher to transfer revenue and expense balances to retained earnings and reset them for new year.",
      stepsAr: [
        "اضغط «سند إقفال فترة جديد»",
        "اختر الشركة وتاريخ نهاية الفترة المالية",
        "اختر حساب الأرباح المبقاة (Retained Earnings)",
        "أدخل ملاحظات الإقفال السنوي",
        "اضغط «حفظ» ثم «تسجيل» لإنشاء قيد الإقفال السنوي رسمياً"
      ],
      stepsEn: [
        "Click «New Period Closing Voucher»",
        "Select company and fiscal period closing date",
        "Select Retained Earnings equity account",
        "Add closing remarks",
        "Click «Save» then «Submit» to formally post closing entries"
      ]
    },

    // ═══ المربع ٨: إدارة الاشتراكات ═══
    "Subscription Plan": {
      icon: "📋",
      summaryAr: "تعريف خطط وباقات الاشتراكات الدورية (مثل: شهري، سنوي) والأسعار والأصناف المرتبطة بكل باقة.",
      summaryEn: "Define recurring subscription plans and tiers (e.g., monthly, annual) with pricing and linked items.",
      stepsAr: [
        "اضغط «خطة اشتراك جديدة»",
        "أدخل اسم الخطة وحدد فترة الفوترة (شهرية، سنوية)",
        "اختر الصنف المرتبط بالاشتراك وسعر الاشتراك",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Subscription Plan»",
        "Enter plan name and billing interval (Monthly, Annual)",
        "Select linked subscription item and plan price",
        "Click «Save»"
      ]
    },

    "Subscription": {
      icon: "🔁",
      summaryAr: "إنشاء وإدارة اشتراكات العملاء وتتبع حالة الاشتراك (نشط، ملغي، معلق) وتوليد الفواتير الدورية.",
      summaryEn: "Create and manage customer subscriptions, tracking status (Active, Cancelled, Trialling) and recurring invoicing.",
      stepsAr: [
        "اضغط «اشتراك جديد»",
        "اختر العميل وتاريخ بدء الاشتراك",
        "أضف خطط الاشتراك المطلوبة والكميات",
        "حدد تاريخ انتهاء الاشتراك أو اتركه مستمراً",
        "اضغط «حفظ» ثم «تسجيل» لتفعيل الاشتراك"
      ],
      stepsEn: [
        "Click «New Subscription»",
        "Select customer and start date",
        "Add desired subscription plans and quantities",
        "Specify end date or leave recurring indefinitely",
        "Click «Save» then «Submit» to activate"
      ]
    },

    "Subscription Settings": {
      icon: "⚙️",
      summaryAr: "ضبط قواعد الفوترة الدورية وتوليد فواتير الاشتراكات المتكررة تلقائياً، وإدارة فترات الإشعار وفترات السماح والإلغاء عند عدم السداد.",
      summaryEn: "Configure recurring billing rules, automated invoice generation for subscriptions, grace periods, and dunning cancellation policies.",
      stepsAr: [
        "تفعيل الجدولة التلقائية لتوليد فواتير الاشتراكات في مواعيدها",
        "تحديد عدد أيام فترة السماح قبل تعليق الاشتراك",
        "ضبط إعدادات إرسال إشعارات التجديد والدفع آلياً للعملاء",
        "تحديد السياسة المتبعة في حال فشل تحصيل الدفعة الدورية"
      ],
      stepsEn: [
        "Enable automated scheduler to generate recurring subscription invoices",
        "Define grace period days before suspending overdue subscriptions",
        "Configure automated renewal and payment reminder notifications to customers",
        "Set retry and cancellation policy for failed recurring payments"
      ]
    },

    // ═══ المربع ٩: إدارة الأسهم ═══
    "Shareholder": {
      icon: "👤",
      summaryAr: "تسجيل بيانات المساهمين والشركاء في الشركة وتتبع حصص الملكية وأرقام شهادات الأسهم.",
      summaryEn: "Register company shareholders, equity partners, ownership stakes, and share certificate numbers.",
      stepsAr: [
        "اضغط «مساهم جديد»",
        "أدخل اسم المساهم وبيانات الاتصال والهوية",
        "حدد عنوان المساهم",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Shareholder»",
        "Enter shareholder name, ID, and contact details",
        "Add shareholder address",
        "Click «Save»"
      ]
    },

    "Share Transfer": {
      icon: "🤝",
      summaryAr: "توثيق عمليات إصدار وتحويل وشراء أو استرداد الأسهم بين الشركة والمساهمين أو بين الشركاء.",
      summaryEn: "Document share issuance, transfers, buybacks, or redemption between company and shareholders.",
      stepsAr: [
        "اضغط «تحويل أسهم جديد»",
        "اختر نوع المعاملة (إصدار جديد، تحويل، استرداد)",
        "حدد المساهم المحول والمساهم المستلم",
        "أدخل عدد الأسهم والقيمة الاسمية وفئة الأسهم",
        "حدد حسابات الدفع الناتجة عن العملية",
        "اضغط «حفظ» ثم «تسجيل»"
      ],
      stepsEn: [
        "Click «New Share Transfer»",
        "Select transfer type (Issue, Transfer, Purchase)",
        "Select source shareholder and target shareholder",
        "Enter number of shares, face value, and share type",
        "Set payment and equity accounts",
        "Click «Save» then «Submit»"
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
    const data = itemDescriptions[itemName];
    if (!data) return;

    const modalId = "erp-accounting-info-modal";
    let modal = document.getElementById(modalId);
    if (modal) modal.remove();

    const title = translate(itemName);
    const summary = isArabic ? data.summaryAr : data.summaryEn;
    const steps = isArabic ? data.stepsAr : data.stepsEn;
    const hasSteps = Array.isArray(steps) && steps.length > 0;
    const stepsTitle = isArabic ? "خطوات العمل والإعداد:" : "Step-by-step Guide:";
    const closeText = isArabic ? "إغلاق" : "Close";

    modal = document.createElement("div");
    modal.id = modalId;
    modal.className = "erp-modal-overlay";
    modal.setAttribute("dir", isArabic ? "rtl" : "ltr");

    modal.innerHTML = `
      <div class="erp-modal-dialog" role="dialog" aria-modal="true">
        <div class="erp-modal-header">
          <div class="erp-modal-title-wrap">
            <span class="erp-modal-icon">${data.icon || "📄"}</span>
            <h3 class="erp-modal-title">${escapeHtml(title)}</h3>
          </div>
          <button type="button" class="erp-modal-close" data-modal-close aria-label="${closeText}">×</button>
        </div>
        <div class="erp-modal-body">
          <p class="erp-modal-summary">${escapeHtml(summary)}</p>
          ${hasSteps ? `
            <div class="erp-modal-steps-section">
              <h4 class="erp-modal-steps-heading">${stepsTitle}</h4>
              <ol class="erp-modal-steps-list">
                ${steps.map(step => `<li>${escapeHtml(step)}</li>`).join("")}
              </ol>
            </div>
          ` : ""}
        </div>
        <div class="erp-modal-footer">
          <button type="button" class="erp-modal-btn" data-modal-close>${closeText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => modal.remove();
    modal.querySelectorAll("[data-modal-close]").forEach(el => {
      el.addEventListener("click", closeModal);
    });
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
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

    if (name === "Chart of Accounts") {
      frappe.set_route("Tree", "Account");
      return;
    }

    if (name === "Chart of Cost Centers") {
      frappe.set_route("Tree", "Cost Center");
      return;
    }

    if (name === "Bank Reconciliation Tool") {
      frappe.set_route("bank-reconciliation-tool");
      return;
    }

    if (name === "Opening Invoice Creation Tool") {
      frappe.set_route("Form", "Opening Invoice Creation Tool");
      return;
    }

    if (name === "Chart of Accounts Importer") {
      frappe.set_route("Form", "Chart of Accounts Importer");
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
