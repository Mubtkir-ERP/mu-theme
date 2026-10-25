(() => {

  /* =========================================================
     MUBTKIR ERP — ACCOUNTING WORKSPACE
     لوحة تحكم قسم المحاسبة
  ========================================================= */

  const root = root_element.querySelector("[data-erp-dashboard]");
  const accountingCycle = root_element.querySelector("[data-purchase-cycle]");
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
     2. ACCOUNTING CYCLE
     دورة المحاسبة
  ========================================================= */

  const accountingCycleCards = [

    {
      step: 1,

      action: "tree",
      doctype: "Account",

      labelEn: "Chart of Accounts",
      labelAr: "دليل الحسابات",

      descriptionEn:
        "Create and organize the company's accounting structure.",

      descriptionAr:
        "إنشاء وتنظيم الحسابات الرئيسية والفرعية للشركة."
    },


    {
      step: 2,

      action: "new",
      doctype: "Journal Entry",

      defaults: {
        voucher_type: "Opening Entry"
      },

      labelEn: "Opening Entries",
      labelAr: "القيود الافتتاحية",

      descriptionEn:
        "Enter opening balances when starting the accounting system.",

      descriptionAr:
        "إدخال الأرصدة الافتتاحية عند بدء العمل على النظام."
    },


    {
      step: 3,

      action: "invoice-selector",

      labelEn: "Invoices",
      labelAr: "الفواتير",

      descriptionEn:
        "Manage sales and purchase invoices.",

      descriptionAr:
        "إدارة فواتير المبيعات والمشتريات."
    },


    {
      step: 4,

      action: "new",
      doctype: "Payment Entry",

      labelEn: "Receipts & Payments",
      labelAr: "القبض والدفع",

      descriptionEn:
        "Record customer receipts and supplier payments.",

      descriptionAr:
        "تسجيل سندات القبض من العملاء والمدفوعات للموردين."
    },


    {
      step: 5,

      action: "new",
      doctype: "Journal Entry",

      labelEn: "Journal Entries",
      labelAr: "قيود اليومية",

      descriptionEn:
        "Record manual accounting adjustments and entries.",

      descriptionAr:
        "تسجيل القيود والتسويات المحاسبية اليدوية."
    },


    {
      step: 6,

      action: "route",
      route: ["bank-reconciliation"],

      fallbackDoctype: "Bank Transaction",

      labelEn: "Bank Reconciliation",
      labelAr: "التسوية البنكية",

      descriptionEn:
        "Match bank transactions with accounting entries.",

      descriptionAr:
        "مطابقة حركات البنك مع القيود المحاسبية."
    }

  ];


  /* =========================================================
     3. GENERAL HELPERS
  ========================================================= */

  function getDefaultCompany() {

    try {

      return (
        frappe.defaults?.get_default("company") ||
        frappe.boot?.defaults?.company ||
        ""
      );

    } catch (e) {

      return "";

    }

  }


  function getToday() {

    if (
      window.frappe?.datetime?.get_today
    ) {

      return frappe.datetime.get_today();

    }

    return new Date()
      .toISOString()
      .slice(0, 10);

  }


  function runReport(reportName, filters = {}) {

    return new Promise(resolve => {

      frappe.call({

        method:
          "frappe.desk.query_report.run",

        args: {

          report_name:
            reportName,

          filters:
            filters,

          ignore_prepared_report:
            true

        },

        callback: response => {

          resolve(
            response?.message?.result || []
          );

        },

        error: () => {

          resolve([]);

        }

      });

    });

  }


  function getReceivableTotal() {

    return new Promise(resolve => {

      const company =
        getDefaultCompany();

      const filters = {};

      if (company)
        filters.company = company;


      runReport(
        "Accounts Receivable",
        filters
      ).then(rows => {

        let total = 0;

        rows.forEach(row => {

          if (!row)
            return;

          const value =
            Number(
              row.outstanding_amount ??
              row.outstanding ??
              0
            );

          if (
            Number.isFinite(value) &&
            value > 0
          ) {

            total += value;

          }

        });

        resolve(total);

      });

    });

  }


  function getPayableTotal() {

    return new Promise(resolve => {

      const company =
        getDefaultCompany();

      const filters = {};

      if (company)
        filters.company = company;


      runReport(
        "Accounts Payable",
        filters
      ).then(rows => {

        let total = 0;

        rows.forEach(row => {

          if (!row)
            return;

          const value =
            Number(
              row.outstanding_amount ??
              row.outstanding ??
              0
            );

          if (
            Number.isFinite(value) &&
            value > 0
          ) {

            total += value;

          }

        });

        resolve(total);

      });

    });

  }


  /* =========================================================
     4. OVERVIEW
     نظرة عامة
  ========================================================= */

  const statsCards = [

    /* الذمم المدينة */
    {
      id: "accounts-receivable",

      short: "AR",

      labelEn:
        "Accounts Receivable",

      labelAr:
        "الذمم المدينة",

      isCurrency: true,

      fetch:
        getReceivableTotal
    },


    /* الذمم الدائنة */
    {
      id: "accounts-payable",

      short: "AP",

      labelEn:
        "Accounts Payable",

      labelAr:
        "الذمم الدائنة",

      isCurrency: true,

      fetch:
        getPayableTotal
    },


    /* الفواتير المتأخرة */
    {
      id: "overdue-invoices",

      short: "OD",

      labelEn:
        "Overdue Invoices",

      labelAr:
        "الفواتير المتأخرة",

      fetch: () =>
        new Promise(resolve => {

          const today =
            getToday();

          let salesCount = 0;
          let purchaseCount = 0;
          let finished = 0;


          function done() {

            finished++;

            if (finished === 2) {

              resolve(
                salesCount +
                purchaseCount
              );

            }

          }


          frappe.call({

            method:
              "frappe.client.get_count",

            args: {

              doctype:
                "Sales Invoice",

              filters: {

                docstatus: 1,

                outstanding_amount:
                  [">", 0],

                due_date:
                  ["<", today]

              }

            },

            callback: data => {

              salesCount =
                data?.message || 0;

              done();

            },

            error: done

          });


          frappe.call({

            method:
              "frappe.client.get_count",

            args: {

              doctype:
                "Purchase Invoice",

              filters: {

                docstatus: 1,

                outstanding_amount:
                  [">", 0],

                due_date:
                  ["<", today]

              }

            },

            callback: data => {

              purchaseCount =
                data?.message || 0;

              done();

            },

            error: done

          });

        })
    },


    /* القيود المسودة */
    {
      id: "draft-journal-entries",

      short: "JE",

      labelEn:
        "Draft Journal Entries",

      labelAr:
        "القيود المسودة",

      fetch: () =>
        new Promise(resolve => {

          frappe.call({

            method:
              "frappe.client.get_count",

            args: {

              doctype:
                "Journal Entry",

              filters: {
                docstatus: 0
              }

            },

            callback: data =>
              resolve(
                data?.message || 0
              ),

            error: () =>
              resolve(0)

          });

        })
    }

  ];


  /* =========================================================
     5. QUICK ACTIONS
  ========================================================= */

  const quickActionButtons = [

    {
      doctype:
        "Journal Entry",

      labelEn:
        "New Journal Entry",

      labelAr:
        "قيد يومية جديد"
    },


    {
      doctype:
        "Payment Entry",

      labelEn:
        "New Payment Entry",

      labelAr:
        "سند قبض / دفع جديد"
    },


    {
      doctype:
        "Sales Invoice",

      labelEn:
        "New Sales Invoice",

      labelAr:
        "فاتورة مبيعات جديدة"
    },


    {
      doctype:
        "Purchase Invoice",

      labelEn:
        "New Purchase Invoice",

      labelAr:
        "فاتورة مشتريات جديدة"
    }

  ];


  /* =========================================================
     6. FOOTER
  ========================================================= */

  const footerInfo = {

    phone: (window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.phone) || "0115110455",

    email: (window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.email) || "sales@mubtkir.com",

    website: (window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.website) || "www.mubtkir.com",

    labels: {

      phoneEn:
        "Phone",

      phoneAr:
        "الهاتف الموحد",

      emailEn:
        "Email",

      emailAr:
        "البريد الإلكتروني",

      websiteEn:
        "Website",

      websiteAr:
        "الموقع"

    }

  };


  /* =========================================================
     7. DASHBOARD SECTIONS
  ========================================================= */

  const sections = [

    [
      "Reports & Masters",

      [

        /* الحسابات */
        [
          "Accounts",
          "📚",
          [
            "Account",
            "Cost Center",
            "Accounting Dimension",
            "Finance Book"
          ]
        ],


        /* المعاملات */
        [
          "Accounting Transactions",
          "🧾",
          [
            "Journal Entry",
            "Payment Entry",
            "Sales Invoice",
            "Purchase Invoice"
          ]
        ],


        /* الذمم المدينة */
        [
          "Receivables",
          "💰",
          [
            "Customer",
            "Sales Invoice",
            "Payment Entry",
            "Accounts Receivable"
          ]
        ],


        /* الذمم الدائنة */
        [
          "Payables",
          "💳",
          [
            "Supplier",
            "Purchase Invoice",
            "Payment Entry",
            "Accounts Payable"
          ]
        ],


        /* البنوك */
        [
          "Banking",
          "🏦",
          [
            "Bank",
            "Bank Account",
            "Bank Transaction",
            "Bank Reconciliation Statement"
          ]
        ],


        /* الضرائب */
        [
          "Taxes",
          "🧮",
          [
            "Sales Taxes and Charges Template",
            "Purchase Taxes and Charges Template",
            "Tax Category",
            "Tax Rule"
          ]
        ],


        /* الإعدادات */
        [
          "Settings",
          "⚙️",
          [
            "Accounts Settings",
            "Company",
            "Fiscal Year",
            "Currency",
            "Payment Term",
            "Payment Terms Template"
          ]
        ],


        /* التقارير المالية */
        [
          "Financial Reports",
          "📊",
          [
            "General Ledger",
            "Trial Balance",
            "Profit and Loss Statement",
            "Balance Sheet",
            "Cash Flow"
          ]
        ],


        /* تقارير الذمم */
        [
          "Receivable & Payable Reports",
          "📋",
          [
            "Accounts Receivable",
            "Accounts Payable",
            "Customer Ledger Summary",
            "Supplier Ledger Summary"
          ]
        ]

      ]

    ]

  ];


  /* =========================================================
     8. ARABIC TRANSLATIONS
  ========================================================= */

  const arabicFallback = {

    "Reports & Masters":
      "البيانات الرئيسية والتقارير",


    "Accounts":
      "الحسابات",

    "Accounting Transactions":
      "المعاملات المحاسبية",

    "Receivables":
      "الذمم المدينة",

    "Payables":
      "الذمم الدائنة",

    "Banking":
      "البنوك",

    "Taxes":
      "الضرائب",

    "Settings":
      "الإعدادات",

    "Financial Reports":
      "التقارير المالية",

    "Receivable & Payable Reports":
      "تقارير الذمم",


    "Account":
      "دليل الحسابات",

    "Cost Center":
      "مركز التكلفة",

    "Accounting Dimension":
      "البُعد المحاسبي",

    "Finance Book":
      "الدفتر المالي",


    "Journal Entry":
      "قيد يومية",

    "Payment Entry":
      "سند قبض / دفع",

    "Sales Invoice":
      "فاتورة مبيعات",

    "Purchase Invoice":
      "فاتورة مشتريات",


    "Customer":
      "العميل",

    "Supplier":
      "المورد",


    "Accounts Receivable":
      "الذمم المدينة",

    "Accounts Payable":
      "الذمم الدائنة",


    "Bank":
      "البنك",

    "Bank Account":
      "الحساب البنكي",

    "Bank Transaction":
      "حركة بنكية",

    "Bank Reconciliation Statement":
      "كشف التسوية البنكية",


    "Sales Taxes and Charges Template":
      "قالب ضرائب ورسوم المبيعات",

    "Purchase Taxes and Charges Template":
      "قالب ضرائب ورسوم المشتريات",

    "Tax Category":
      "فئة الضريبة",

    "Tax Rule":
      "قاعدة الضريبة",


    "Accounts Settings":
      "إعدادات الحسابات",

    "Company":
      "الشركة",

    "Fiscal Year":
      "السنة المالية",

    "Currency":
      "العملة",

    "Payment Term":
      "شرط الدفع",

    "Payment Terms Template":
      "قالب شروط الدفع",


    "General Ledger":
      "دفتر الأستاذ العام",

    "Trial Balance":
      "ميزان المراجعة",

    "Profit and Loss Statement":
      "قائمة الدخل",

    "Balance Sheet":
      "الميزانية العمومية",

    "Cash Flow":
      "التدفقات النقدية",


    "Customer Ledger Summary":
      "ملخص حسابات العملاء",

    "Supplier Ledger Summary":
      "ملخص حسابات الموردين"

  };


  /* =========================================================
     9. ROUTE TYPES
  ========================================================= */

  const singleDocs =
    new Set([
      "Accounts Settings"
    ]);


  const treeDocs =
    new Set([
      "Account",
      "Cost Center"
    ]);


  const reportNames =
    new Set([

      "General Ledger",

      "Trial Balance",

      "Profit and Loss Statement",

      "Balance Sheet",

      "Cash Flow",

      "Accounts Receivable",

      "Accounts Payable",

      "Customer Ledger Summary",

      "Supplier Ledger Summary",

      "Bank Reconciliation Statement"

    ]);


  /* =========================================================
     10. ITEM DESCRIPTIONS
  ========================================================= */

  const itemDescriptions = {

    /* =========================
       دليل الحسابات
    ========================= */

    "Account": {

      icon:
        "📚",

      summaryAr:
        "إنشاء وتنظيم دليل الحسابات الرئيسي والفرعي للشركة.",

      summaryEn:
        "Create and organize the company's chart of accounts.",

      stepsAr: [

        "افتح «دليل الحسابات»",

        "اختر الشركة",

        "حدد الحساب الأب",

        "اضغط «إضافة حساب فرعي»",

        "أدخل رقم الحساب واسم الحساب",

        "حدد نوع الحساب",

        "حدد هل الحساب تجميعي أم حساب حركة",

        "اضغط «إنشاء»"

      ],

      stepsEn: [

        "Open «Chart of Accounts»",

        "Select company",

        "Select parent account",

        "Click «Add Child»",

        "Enter account number and name",

        "Select account type",

        "Specify group or ledger account",

        "Click «Create»"

      ]

    },


    /* =========================
       قيد اليومية
    ========================= */

    "Journal Entry": {

      icon:
        "📝",

      summaryAr:
        "تسجيل القيود المحاسبية اليدوية والتسويات والتحويلات والأرصدة الافتتاحية.",

      summaryEn:
        "Record manual accounting entries, adjustments, transfers, and opening balances.",

      stepsAr: [

        "اضغط «قيد يومية جديد»",

        "حدد نوع القيد",

        "حدد تاريخ القيد",

        "أضف الحساب المدين",

        "أدخل مبلغ المدين",

        "أضف الحساب الدائن",

        "أدخل مبلغ الدائن",

        "أضف المرجع والشرح",

        "اضغط «حفظ» ثم «تسجيل»"

      ],

      stepsEn: [

        "Click «New Journal Entry»",

        "Select voucher type",

        "Set posting date",

        "Add debit account",

        "Enter debit amount",

        "Add credit account",

        "Enter credit amount",

        "Add reference and remarks",

        "Click «Save» then «Submit»"

      ]

    },


    /* =========================
       سند القبض والدفع
    ========================= */

    "Payment Entry": {

      icon:
        "💵",

      summaryAr:
        "تسجيل المقبوضات من العملاء والمدفوعات للموردين والتحويلات بين الحسابات.",

      summaryEn:
        "Record customer receipts, supplier payments, and account transfers.",

      stepsAr: [

        "اضغط «سند قبض / دفع جديد»",

        "اختر نوع العملية",

        "حدد العميل أو المورد",

        "حدد الحساب البنكي أو الصندوق",

        "أدخل المبلغ",

        "اربط المستند بالفواتير إن وجدت",

        "راجع المبلغ المخصص",

        "اضغط «حفظ» ثم «تسجيل»"

      ],

      stepsEn: [

        "Click «New Payment Entry»",

        "Select payment type",

        "Select customer or supplier",

        "Set bank or cash account",

        "Enter amount",

        "Allocate against invoices if applicable",

        "Review allocated amount",

        "Click «Save» then «Submit»"

      ]

    },


    /* =========================
       فاتورة المبيعات
    ========================= */

    "Sales Invoice": {

      icon:
        "🧾",

      summaryAr:
        "إصدار فاتورة مبيعات وتسجيل المبلغ المستحق على العميل.",

      summaryEn:
        "Issue a sales invoice and record the customer receivable.",

      stepsAr: [

        "اضغط «فاتورة مبيعات جديدة»",

        "اختر العميل",

        "أضف المنتجات والخدمات",

        "راجع الأسعار والكميات",

        "أضف الضرائب",

        "حدد تاريخ الاستحقاق",

        "راجع شروط الدفع",

        "اضغط «حفظ» ثم «تسجيل»"

      ],

      stepsEn: [

        "Click «New Sales Invoice»",

        "Select customer",

        "Add items and services",

        "Review prices and quantities",

        "Add taxes",

        "Set due date",

        "Review payment terms",

        "Click «Save» then «Submit»"

      ]

    },


    /* =========================
       فاتورة المشتريات
    ========================= */

    "Purchase Invoice": {

      icon:
        "📄",

      summaryAr:
        "تسجيل فاتورة المورد والمبلغ المستحق عليه.",

      summaryEn:
        "Record supplier invoice and accounts payable.",

      stepsAr: [

        "اضغط «فاتورة مشتريات جديدة»",

        "اختر المورد",

        "أضف المنتجات أو المصروفات",

        "راجع الأسعار والكميات",

        "أضف الضرائب",

        "حدد تاريخ الاستحقاق",

        "حدد حسابات المصروف",

        "اضغط «حفظ» ثم «تسجيل»"

      ],

      stepsEn: [

        "Click «New Purchase Invoice»",

        "Select supplier",

        "Add items or expenses",

        "Review prices and quantities",

        "Add taxes",

        "Set due date",

        "Set expense accounts",

        "Click «Save» then «Submit»"

      ]

    },


    /* =========================
       مركز التكلفة
    ========================= */

    "Cost Center": {

      icon:
        "🎯",

      summaryAr:
        "توزيع الإيرادات والمصروفات على الإدارات أو الفروع أو المشاريع.",

      summaryEn:
        "Allocate income and expenses across departments, branches, or projects.",

      stepsAr: [

        "افتح «مراكز التكلفة»",

        "اختر مركز التكلفة الأب",

        "أضف مركز تكلفة جديد",

        "حدد الشركة",

        "أدخل اسم المركز",

        "اضغط «إنشاء»"

      ],

      stepsEn: [

        "Open «Cost Centers»",

        "Select parent cost center",

        "Add a new cost center",

        "Select company",

        "Enter cost center name",

        "Click «Create»"

      ]

    },


    /* =========================
       الحساب البنكي
    ========================= */

    "Bank Account": {

      icon:
        "🏦",

      summaryAr:
        "تعريف الحسابات البنكية وربطها بحسابات الأستاذ العام.",

      summaryEn:
        "Define bank accounts and link them to general ledger accounts.",

      stepsAr: [

        "اضغط «حساب بنكي جديد»",

        "اختر البنك",

        "أدخل رقم الحساب",

        "حدد الشركة",

        "اربط حساب الأستاذ",

        "أدخل رقم الآيبان عند الحاجة",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Click «New Bank Account»",

        "Select bank",

        "Enter account number",

        "Select company",

        "Link ledger account",

        "Enter IBAN if applicable",

        "Click «Save»"

      ]

    },


    /* =========================
       السنة المالية
    ========================= */

    "Fiscal Year": {

      icon:
        "📅",

      summaryAr:
        "تعريف السنة المالية وتحديد تاريخ البداية والنهاية.",

      summaryEn:
        "Define fiscal year start and end dates.",

      stepsAr: [

        "اضغط «سنة مالية جديدة»",

        "أدخل اسم السنة",

        "حدد تاريخ البداية",

        "حدد تاريخ النهاية",

        "حدد الشركات",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Click «New Fiscal Year»",

        "Enter fiscal year name",

        "Set start date",

        "Set end date",

        "Select companies",

        "Click «Save»"

      ]

    }

  };


  /* =========================================================
     11. TRANSLATION
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


  function formatCurrency(number) {
    return (
      parseFloat(number) || 0
    ).toLocaleString("en-US",

      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }

    );

  }


  /* =========================================================
     12. MODAL
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


        ${
          hasSteps
            ? `

              <button
                type="button"
                class="erp-modal-toggle-steps"
                data-toggle-steps
              >
                ${showText}
              </button>


              <div
                class="erp-modal-steps"
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
            : ""
        }

      </div>

    `;


    root.appendChild(overlay);


    requestAnimationFrame(() => {

      overlay.classList.add(
        "is-visible"
      );

    });


    function closeModal() {

      overlay.remove();

    }


    overlay
      .querySelector(
        "[data-modal-close]"
      )
      ?.addEventListener(
        "click",
        closeModal
      );


    overlay.addEventListener(

      "click",

      event => {

        if (
          event.target === overlay
        ) {

          closeModal();

        }

      }

    );


    const toggleButton =
      overlay.querySelector(
        "[data-toggle-steps]"
      );


    const stepsContainer =
      overlay.querySelector(
        "[data-modal-steps]"
      );


    if (
      toggleButton &&
      stepsContainer
    ) {

      toggleButton.addEventListener(

        "click",

        () => {

          stepsContainer
            .classList
            .toggle(
              "is-shown"
            );


          toggleButton.textContent =
            stepsContainer
              .classList
              .contains(
                "is-shown"
              )

              ? hideText
              : showText;

        }

      );

    }

  }


  /* =========================================================
     13. INVOICE SELECTOR
  ========================================================= */

  function showInvoiceSelector() {

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
            🧾
          </span>

          <h3 class="erp-modal-title">

            ${
              isArabic
                ? "اختر نوع الفاتورة"
                : "Select Invoice Type"
            }

          </h3>

        </div>


        <div
          class="erp-quick-grid"
          style="
            margin-top: 20px;
            grid-template-columns:
            repeat(2, minmax(0,1fr)) !important;
          "
        >

          <button
            type="button"
            class="erp-quick-btn"
            data-invoice-type="Sales Invoice"
          >

            ${
              isArabic
                ? "فاتورة مبيعات"
                : "Sales Invoice"
            }

          </button>


          <button
            type="button"
            class="erp-quick-btn"
            data-invoice-type="Purchase Invoice"
          >

            ${
              isArabic
                ? "فاتورة مشتريات"
                : "Purchase Invoice"
            }

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


    overlay
      .querySelector(
        "[data-modal-close]"
      )
      ?.addEventListener(

        "click",

        () => overlay.remove()

      );


    overlay.addEventListener(

      "click",

      event => {

        if (
          event.target === overlay
        ) {

          overlay.remove();

        }

      }

    );


    overlay
      .querySelectorAll(
        "[data-invoice-type]"
      )
      .forEach(button => {

        button.addEventListener(

          "click",

          () => {

            const doctype =
              button.dataset.invoiceType;

            overlay.remove();

            frappe.set_route(
              "List",
              doctype
            );

          }

        );

      });

  }


  /* =========================================================
     14. ROUTING
  ========================================================= */

  function openRoute(name) {

    if (
      !window.frappe ||
      typeof frappe.set_route !==
        "function"
    )
      return;


    if (
      reportNames.has(name)
    ) {

      frappe.set_route(
        "query-report",
        name
      );

      return;

    }


    if (
      singleDocs.has(name)
    ) {

      frappe.set_route(
        "Form",
        name
      );

      return;

    }


    if (
      treeDocs.has(name)
    ) {

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
     15. RENDER ACCOUNTING CYCLE
  ========================================================= */

  function renderAccountingCycle() {

    if (!accountingCycle)
      return;


    const title =
      isArabic
        ? "دورة المحاسبة"
        : "Accounting Cycle";


    accountingCycle.innerHTML = `

      <section class="erp-cycle-container">

        <h2
          class="
            erp-section-title
            erp-cycle-title
          "
        >
          ${escapeHtml(title)}
        </h2>


        <div
          class="erp-cycle-grid"
          style="
            grid-template-columns:
            repeat(
              ${accountingCycleCards.length},
              minmax(0, 1fr)
            );
          "
        >

          ${accountingCycleCards

            .map(
              (card, index) => {

                const cardTitle =
                  isArabic
                    ? card.labelAr
                    : card.labelEn;


                const description =
                  isArabic
                    ? card.descriptionAr
                    : card.descriptionEn;


                const arrow =
                  index <
                  accountingCycleCards.length - 1

                    ? `

                      <span
                        class="erp-cycle-arrow"
                        aria-hidden="true"
                      >
                        ${
                          isArabic
                            ? "←"
                            : "→"
                        }
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

                      <span
                        class="erp-cycle-number"
                      >
                        ${card.step}
                      </span>


                      <span
                        class="erp-cycle-card-title"
                      >
                        ${escapeHtml(cardTitle)}
                      </span>


                      <span
                        class="erp-cycle-description"
                      >
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


    accountingCycle.addEventListener(

      "click",

      event => {

        const element =
          event.target.closest(
            "[data-cycle-index]"
          );


        if (!element)
          return;


        const card =
          accountingCycleCards[
            Number(
              element.dataset.cycleIndex
            )
          ];


        if (!card)
          return;


        /* دليل الحسابات */

        if (
          card.action === "tree"
        ) {

          frappe.set_route(
            "Tree",
            card.doctype
          );

          return;

        }


        /* مستند جديد */

        if (
          card.action === "new"
        ) {

          frappe.new_doc(
            card.doctype,
            card.defaults || {}
          );

          return;

        }


        /* اختيار فاتورة */

        if (
          card.action ===
          "invoice-selector"
        ) {

          showInvoiceSelector();

          return;

        }


        /* Route مباشر */

        if (
          card.action === "route"
        ) {

          try {

            frappe.set_route(
              ...card.route
            );

          }

          catch (e) {

            if (
              card.fallbackDoctype
            ) {

              openRoute(
                card.fallbackDoctype
              );

            }

          }

        }

      }

    );

  }


  /* =========================================================
     16. RENDER STATS
  ========================================================= */

  function renderStats() {

    if (!statsSection)
      return;


    statsSection.innerHTML = `

      <section
        class="erp-overview-container"
      >

        <h2 class="erp-section-title">

          ${
            isArabic
              ? "نظرة عامة"
              : "Overview"
          }

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


                    <span
                      class="erp-stat-label"
                    >

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


    statsCards.forEach(card => {

      card
        .fetch()
        .then(value => {

          const element =
            statsSection.querySelector(
              `[data-stat-id="${card.id}"]`
            );


          if (!element)
            return;


          if (card.isCurrency) {

            element.textContent =
              `${formatCurrency(value)} ${
                isArabic
                  ? "ر.س"
                  : "SAR"
              }`;

          }

          else {

            element.textContent =
              formatNumber(value);

          }

        });

    });

  }


  /* =========================================================
     17. QUICK ACTIONS
  ========================================================= */

  function renderQuickActions() {

    if (!quickActions)
      return;


    quickActions.innerHTML = `

      <h2 class="erp-section-title">

        ${
          isArabic
            ? "اختصارات سريعة"
            : "Quick Actions"
        }

      </h2>


      <div class="erp-quick-grid">

        ${quickActionButtons

          .map(
            (button, index) => `

              <button
                type="button"
                class="erp-quick-btn"
                data-quick-index="${index}"
              >

                <span
                  class="erp-quick-label"
                >

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

        const element =
          event.target.closest(
            "[data-quick-index]"
          );


        if (!element)
          return;


        const button =
          quickActionButtons[
            Number(
              element.dataset.quickIndex
            )
          ];


        if (!button)
          return;


        frappe.new_doc(
          button.doctype
        );

      }

    );

  }


  /* =========================================================
     18. RENDER SECTIONS
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


                            return `

                              <div
                                class="erp-link-row"
                              >

                                <button
                                  type="button"
                                  class="erp-link"
                                  data-route-name="${escapeHtml(item)}"
                                >

                                  <span
                                    class="erp-link-text"
                                  >
                                    ${escapeHtml(translate(item))}
                                  </span>


                                  <span
                                    class="erp-link-arrow"
                                  >
                                    ${
                                      isArabic
                                        ? "←"
                                        : "→"
                                    }
                                  </span>

                                </button>


                                ${
                                  description

                                    ? `

                                      <button
                                        type="button"
                                        class="erp-info-link"
                                        data-info-item="${escapeHtml(item)}"
                                      >
                                        ${
                                          isArabic
                                            ? "تفاصيل"
                                            : "Details"
                                        }
                                      </button>

                                    `

                                    : ""
                                }

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


                          <span
                            class="erp-card-title"
                          >
                            ${escapeHtml(translate(card[0]))}
                          </span>


                          <span
                            class="erp-card-chevron"
                          >
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

              <section
                class="erp-module-section"
              >

                <h2
                  class="erp-section-title"
                >
                  ${escapeHtml(translate(section[0]))}
                </h2>


                <div
                  class="erp-dashboard-grid"
                >
                  ${cards}
                </div>

              </section>

            `;

          }
        )

        .join("");

  }


  /* =========================================================
     19. FOOTER
  ========================================================= */

  function renderFooter() {

    if (!footerEl)
      return;


    footerEl.innerHTML = `

      <div class="erp-footer-inner">

        <div class="erp-footer-item">

          <span class="erp-footer-icon">
            ☎
          </span>

          <span class="erp-footer-label">

            ${
              isArabic
                ? footerInfo.labels.phoneAr
                : footerInfo.labels.phoneEn
            }:

          </span>

          <a
            href="tel:${footerInfo.phone}"
            class="erp-footer-link"
            dir="ltr"
          >
            ${footerInfo.phone}
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

            ${
              isArabic
                ? footerInfo.labels.emailAr
                : footerInfo.labels.emailEn
            }:

          </span>

          <a
            href="mailto:${footerInfo.email}"
            class="erp-footer-link"
          >
            ${footerInfo.email}
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

            ${
              isArabic
                ? footerInfo.labels.websiteAr
                : footerInfo.labels.websiteEn
            }:

          </span>

          <a
            href="https://${footerInfo.website}"
            class="erp-footer-link"
            target="_blank"
            rel="noopener"
          >
            ${footerInfo.website}
          </a>

        </div>

      </div>

    `;

  }


  /* =========================================================
     20. EVENTS
  ========================================================= */

  let lastToggleTime = 0;


  content.addEventListener(

    "click",

    event => {


      /* التفاصيل */

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

            ...data,

            labelAr:
              translate(itemName),

            labelEn:
              itemName

          });

        }


        return;

      }


      /* فتح مستند أو تقرير */

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


      /* فتح البطاقة */

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
        !selectedCard
          .classList
          .contains(
            "is-open"
          );


      content
        .querySelectorAll(
          "[data-erp-card]"
        )
        .forEach(card => {

          if (
            card !== selectedCard
          ) {

            card
              .classList
              .remove(
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


      selectedCard
        .classList
        .toggle(
          "is-open",
          shouldOpen
        );


      cardButton
        .setAttribute(
          "aria-expanded",
          shouldOpen
            ? "true"
            : "false"
        );

    }

  );


  /* =========================================================
     21. INIT
  ========================================================= */

  renderAccountingCycle();

  renderStats();

  renderQuickActions();

  renderSections();

  renderFooter();

})();