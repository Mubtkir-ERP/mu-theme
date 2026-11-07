
(() => {
  /* =========================================================
     MUBTKIR ERP — GENERAL HOME DASHBOARD
     جميع الألوان تأتي من CSS الرئيسي فقط
  ========================================================= */

  /* =========================================================
     1. العناصر الرئيسية
  ========================================================= */

  const root = root_element.querySelector("[data-erp-dashboard]");
  const content = root_element.querySelector("[data-dashboard-content]");
  const statsSection = root_element.querySelector("[data-stats-section]");
  const quickActions = root_element.querySelector("[data-quick-actions]");
  const footerEl = root_element.querySelector("[data-dashboard-footer]");

  if (!root || !content) {
    return;
  }

  /* =========================================================
     2. اللغة
  ========================================================= */

  const langValue =
    window.frappe?.boot?.lang ||
    window.frappe?.boot?.user?.language ||
    document.documentElement.lang ||
    "en";

  const isArabic = String(langValue)
    .toLowerCase()
    .startsWith("ar");

  root.setAttribute("dir", isArabic ? "rtl" : "ltr");
  root.classList.toggle("erp-dashboard-rtl", isArabic);

  /* =========================================================
     3. CSS
     جميع الألوان تأتي من متغيرات الهوية الرئيسية
  ========================================================= */

  const existingStyle = root.querySelector("#general-home-css");

  if (existingStyle) {
    existingStyle.remove();
  }

  const style = document.createElement("style");
  style.id = "general-home-css";

  style.textContent = `

    /* =========================================
       WELCOME
    ========================================= */

    .hm-welcome-banner {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding: 16px 24px;
      margin-bottom: 10px;
      border: none;
      border-radius: 18px;
      background: transparent;
      color: var(--brand-text);
      overflow: hidden;
    }

    .hm-welcome-banner::before,
    .hm-welcome-banner::after {
      display: none;
    }

    .hm-welcome-content {
      position: relative;
      z-index: 1;
      flex: 1;
    }

    .hm-welcome-title {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      margin: 0 0 6px;
      color: var(--brand-text) !important;
      font-size: 22px;
      font-weight: 800;
      line-height: 1.4;
    }

    .hm-welcome-wave {
      display: inline-block;
      font-size: 28px;
      animation: hm-wave 2s ease-in-out infinite;
    }

    .hm-welcome-sub {
      margin: 0;
      color: var(--brand-muted) !important;
      font-size: 14px;
      font-weight: 600;
      line-height: 1.5;
    }

    .hm-welcome-art {
      display: none;
    }

    @keyframes hm-wave {
      0%, 100% {
        transform: rotate(0);
      }

      15% {
        transform: rotate(14deg);
      }

      30% {
        transform: rotate(-8deg);
      }

      45% {
        transform: rotate(10deg);
      }

      60% {
        transform: rotate(0);
      }
    }

    /* =========================================
       SHORTCUT CARD
    ========================================= */

    .hm-shortcut {
      background: var(--fg-color, #ffffff);
      border: 1px solid var(--brand-border);
      border-inline-start: 4px solid var(--brand-primary);
      border-radius: 14px;
      padding: 14px 16px;
      box-shadow: 0 3px 12px rgba(36, 59, 99, 0.06);
      transition:
        transform 0.20s ease,
        border-color 0.20s ease,
        box-shadow 0.20s ease;
    }

    .hm-shortcut:hover {
      transform: translateY(-2px);
      border-color: var(--brand-primary);
      box-shadow: 0 8px 22px rgba(56, 103, 174, 0.12);
    }

    /* =========================================
       SHORTCUT HEADER
    ========================================= */

    .hm-sh-head {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
      cursor: pointer;
    }

    .hm-sh-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      flex-shrink: 0;
      border-radius: 10px;
      background: var(--brand-soft);
      font-size: 20px;
    }

    .hm-sh-name {
      flex: 1;
      color: var(--brand-text) !important;
      font-size: 14px;
      font-weight: 700;
    }

    /* =========================================
       COUNT
    ========================================= */

    .hm-sh-count {
      padding: 2px 10px;
      border-radius: 10px;
      background: var(--brand-primary) !important;
      color: #ffffff !important;
      font-size: 11px;
      font-weight: 700;
      direction: ltr;
    }

    .hm-sh-count.zero {
      background: var(--brand-soft) !important;
      color: var(--brand-text) !important;
    }

    /* =========================================
       DESCRIPTION
    ========================================= */

    .hm-sh-desc {
      margin: 0 0 10px;
      color: var(--brand-muted) !important;
      font-size: 12.5px;
      line-height: 1.65;
    }

    /* =========================================
       STEPS BUTTON
    ========================================= */

    .hm-sh-stepbtn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 5px 14px;
      border: 1px solid var(--brand-border);
      border-radius: 8px;
      background: var(--brand-soft);
      color: var(--brand-primary) !important;
      font-family: inherit;
      font-size: 11.5px;
      font-weight: 700;
      cursor: pointer;
      transition:
        color 0.16s ease,
        background 0.16s ease,
        border-color 0.16s ease;
    }

    .hm-sh-stepbtn:hover {
      border-color: var(--brand-secondary);
      background: var(--brand-soft-secondary);
      color: var(--brand-secondary) !important;
    }

    /* =========================================
       STEPS BOX
    ========================================= */

    .hm-sh-steps {
      margin-top: 10px;
      padding: 12px 14px;
      border: 1px solid var(--brand-border);
      border-radius: 10px;
      background: var(--brand-soft);
    }

    .hm-sh-steps ol {
      margin: 0;
      padding-inline-start: 20px;
    }

    .hm-sh-steps li {
      color: var(--brand-text) !important;
      font-size: 12.5px;
      line-height: 2;
    }

    /* =========================================
       SECTION TITLES
    ========================================= */

    .erp-module-section .erp-section-title {
      color: var(--brand-text) !important;
    }

    /* =========================================
       DARK MODE
    ========================================= */

    [data-theme="dark"] .hm-shortcut {
      background: var(--fg-color, #20242c);
    }

    [data-theme="dark"] .hm-sh-steps {
      background: rgba(56, 103, 174, 0.10);
    }

    /* =========================================
       MOBILE
    ========================================= */

    @media (max-width: 650px) {
      .hm-welcome-banner {
        flex-direction: column;
        gap: 12px;
        padding: 20px;
        text-align: center;
      }

      .hm-welcome-title {
        justify-content: center;
        font-size: 18px;
      }

      .hm-shortcut {
        padding: 12px;
      }

      .hm-sh-icon {
        width: 32px;
        height: 32px;
        font-size: 17px;
      }
    }
  `;

  root.prepend(style);

  /* =========================================================
     4. بانر الترحيب
  ========================================================= */

  const welcomeText = root.querySelector("[data-welcome-text]");
  const welcomeSub = root.querySelector("[data-welcome-sub]");

  if (welcomeText) {
    welcomeText.textContent = isArabic
      ? "مرحباً بك في مبتكر ERP"
      : "Welcome to Mubtkir ERP";
  }

  if (welcomeSub) {
    welcomeSub.textContent = isArabic
      ? "كل ما تحتاجه لإدارة أعمالك بذكاء وسهولة"
      : "Everything you need to manage your business smartly";
  }

  /* =========================================================
     5. رصيد الحساب
  ========================================================= */

  function fetchAccountBalance(accountType) {
    return new Promise((resolve) => {
      const company = frappe.defaults.get_default("company");

      frappe.call({
        method: "frappe.client.get_list",

        args: {
          doctype: "Account",

          filters: {
            account_type: accountType,
            is_group: 0,
            company: company
          },

          fields: ["name"],
          limit_page_length: 0
        },

        async: true,

        callback: (accountsResponse) => {
          const accounts = accountsResponse?.message || [];

          if (!accounts.length) {
            resolve(0);
            return;
          }

          frappe.call({
            method: "frappe.client.get_list",

            args: {
              doctype: "GL Entry",

              filters: {
                account: [
                  "in",
                  accounts.map((account) => account.name)
                ],
                is_cancelled: 0
              },

              fields: ["sum(debit - credit) as balance"],
              limit_page_length: 0,
              order_by: "name asc"
            },

            async: true,

            callback: (response) => {
              resolve(response?.message?.[0]?.balance || 0);
            },

            error: () => {
              resolve(0);
            }
          });
        },

        error: () => {
          resolve(0);
        }
      });
    });
  }

  /* =========================================================
     6. البطاقات المالية
     بدون أي Color داخل JavaScript
  ========================================================= */

  const statsCards = [
    {
      id: "sales",
      icon: "📈",
      labelEn: "Total Sales",
      labelAr: "إجمالي المبيعات",

      fetch: () =>
        new Promise((resolve) => {
          frappe.call({
            method: "frappe.client.get_list",

            args: {
              doctype: "Sales Invoice",
              filters: { docstatus: 1 },
              fields: ["sum(base_grand_total) as total"],
              limit_page_length: 0,
              order_by: "name asc"
            },

            async: true,

            callback: (response) => {
              resolve(response?.message?.[0]?.total || 0);
            },

            error: () => {
              resolve(0);
            }
          });
        })
    },

    {
      id: "purchases",
      icon: "📉",
      labelEn: "Total Purchases",
      labelAr: "إجمالي المشتريات",

      fetch: () =>
        new Promise((resolve) => {
          frappe.call({
            method: "frappe.client.get_list",

            args: {
              doctype: "Purchase Invoice",
              filters: { docstatus: 1 },
              fields: ["sum(base_grand_total) as total"],
              limit_page_length: 0,
              order_by: "name asc"
            },

            async: true,

            callback: (response) => {
              resolve(response?.message?.[0]?.total || 0);
            },

            error: () => {
              resolve(0);
            }
          });
        })
    },

    {
      id: "cash",
      icon: "💵",
      labelEn: "Cash Balance",
      labelAr: "رصيد الصندوق",
      fetch: () => fetchAccountBalance("Cash")
    },

    {
      id: "bank",
      icon: "🏦",
      labelEn: "Bank Balance",
      labelAr: "رصيد البنك",
      fetch: () => fetchAccountBalance("Bank")
    }
  ];

  /* =========================================================
     7. الاختصارات
  ========================================================= */

  const shortcutSections = [

    /* =============================
       المبيعات
    ============================= */

    {
      titleEn: "Selling",
      titleAr: "المبيعات",
      icon: "🛒",

      items: [
        {
          doctype: "Quotation",
          icon: "📋",
          labelAr: "عرض سعر",
          labelEn: "Quotation",

          cf: { docstatus: 0 },

          sfx: {
            ar: "مفتوح",
            en: "Open"
          },

          dAr: "إنشاء عروض أسعار للعملاء مع الأصناف والضرائب.",
          dEn: "Create quotations with items, prices, and taxes.",

          sAr: [
            "اضغط «عرض سعر جديد»",
            "اختر العميل وأضف المنتجات",
            "أضف الضرائب",
            "اضغط «حفظ» ثم «تسجيل»"
          ],

          sEn: [
            "Click «New Quotation»",
            "Select customer and add items",
            "Add taxes",
            "Click «Save» then «Submit»"
          ]
        },

        {
          doctype: "Sales Invoice",
          icon: "🧾",
          labelAr: "فاتورة مبيعات",
          labelEn: "Sales Invoice",

          cf: {
            docstatus: 1,
            status: "Paid"
          },

          sfx: {
            ar: "مدفوعة",
            en: "Paid"
          },

          dAr: "إصدار فواتير مبيعات مع الضرائب وربطها بالحسابات.",
          dEn: "Issue sales invoices with taxes and auto accounting.",

          sAr: [
            "اضغط «فاتورة جديدة»",
            "اختر العميل وأضف المنتجات",
            "أضف الضرائب",
            "اضغط «حفظ» ثم «تسجيل»"
          ],

          sEn: [
            "Click «New Invoice»",
            "Select customer and add items",
            "Add taxes",
            "Click «Save» then «Submit»"
          ]
        },

        {
          doctype: "Customer",
          icon: "👤",
          labelAr: "العميل",
          labelEn: "Customer",

          cf: {},
          sfx: null,

          dAr: "تعريف بيانات العملاء: الاسم، العملة، وشروط الدفع.",
          dEn: "Define customer data: name, currency, and payment terms.",

          sAr: [
            "اضغط «عميل جديد»",
            "أدخل الاسم والنوع",
            "حدد العملة والشروط",
            "اضغط «حفظ»"
          ],

          sEn: [
            "Click «New Customer»",
            "Enter name and type",
            "Set currency and terms",
            "Click «Save»"
          ]
        }
      ]
    },

    /* =============================
       المخزون
    ============================= */

    {
      titleEn: "Stock",
      titleAr: "المخزون",
      icon: "📦",

      items: [
        {
          doctype: "Item",
          icon: "📦",
          labelAr: "المنتج",
          labelEn: "Item",

          cf: { disabled: 0 },

          sfx: {
            ar: "متاح",
            en: "Available"
          },

          dAr: "تعريف المنتجات مع التسعير والمخزون.",
          dEn: "Define items with pricing and stock.",

          sAr: [
            "اضغط «منتج جديد»",
            "أدخل الرمز والاسم",
            "اختر المجموعة والوحدة",
            "اضغط «حفظ»"
          ],

          sEn: [
            "Click «New Item»",
            "Enter code and name",
            "Select group and UOM",
            "Click «Save»"
          ]
        },

        {
          doctype: "Item Group",
          icon: "📁",
          labelAr: "مجموعة المنتجات",
          labelEn: "Item Group",

          cf: {},
          sfx: null,
          isTree: true,

          dAr: "تصنيف المنتجات في مجموعات هرمية.",
          dEn: "Classify items in hierarchical groups.",

          sAr: [
            "اذهب إلى «مجموعة المنتجات»",
            "اضغط «إضافة ابن»",
            "أدخل الاسم",
            "اضغط «إنشاء»"
          ],

          sEn: [
            "Go to «Item Group»",
            "Click «Add Child»",
            "Enter name",
            "Click «Create»"
          ]
        },

        {
          doctype: "Stock Entry",
          icon: "🔄",
          labelAr: "قيد مخزون",
          labelEn: "Stock Entry",

          cf: {},
          sfx: null,

          dAr: "تسجيل حركات المخزون: استلام، إصدار، تحويل.",
          dEn: "Record stock movements: receive, issue, transfer.",

          sAr: [
            "اضغط «إدخال جديد»",
            "اختر النوع والمستودعات",
            "أضف المنتجات",
            "اضغط «حفظ» ثم «تسجيل»"
          ],

          sEn: [
            "Click «New Entry»",
            "Select type and warehouses",
            "Add items",
            "Click «Save» then «Submit»"
          ]
        }
      ]
    },

    /* =============================
       المشتريات
    ============================= */

    {
      titleEn: "Buying",
      titleAr: "المشتريات",
      icon: "🏪",

      items: [
        {
          doctype: "Purchase Order",
          icon: "📦",
          labelAr: "أمر شراء",
          labelEn: "Purchase Order",

          cf: { docstatus: 0 },
          sfx: null,

          dAr: "إصدار أوامر شراء للموردين.",
          dEn: "Issue purchase orders to suppliers.",

          sAr: [
            "اضغط «أمر شراء جديد»",
            "اختر المورد وأضف المنتجات",
            "اضغط «حفظ» ثم «تسجيل»"
          ],

          sEn: [
            "Click «New PO»",
            "Select supplier and add items",
            "Click «Save» then «Submit»"
          ]
        },

        {
          doctype: "Purchase Invoice",
          icon: "🧾",
          labelAr: "فاتورة مشتريات",
          labelEn: "Purchase Invoice",

          cf: {
            docstatus: 1,
            status: "Paid"
          },

          sfx: {
            ar: "مدفوعة",
            en: "Paid"
          },

          dAr: "تسجيل فواتير الموردين.",
          dEn: "Record supplier invoices.",

          sAr: [
            "اضغط «فاتورة جديدة»",
            "اختر المورد وأضف المنتجات",
            "اضغط «حفظ» ثم «تسجيل»"
          ],

          sEn: [
            "Click «New Invoice»",
            "Select supplier and add items",
            "Click «Save» then «Submit»"
          ]
        },

        {
          doctype: "Supplier",
          icon: "🏭",
          labelAr: "المورد",
          labelEn: "Supplier",

          cf: {},
          sfx: null,

          dAr: "تعريف بيانات الموردين.",
          dEn: "Define supplier data.",

          sAr: [
            "اضغط «مورد جديد»",
            "أدخل الاسم والنوع",
            "اضغط «حفظ»"
          ],

          sEn: [
            "Click «New Supplier»",
            "Enter name and type",
            "Click «Save»"
          ]
        },

        {
          doctype: "Landed Cost Voucher",
          icon: "📊",
          labelAr: "توزيع المصروفات",
          labelEn: "Landed Cost",

          cf: {},
          sfx: null,

          dAr: "توزيع المصروفات الإضافية مثل الشحن والجمارك على إيصالات الشراء.",
          dEn: "Distribute additional costs such as freight and customs across purchase receipts.",

          sAr: [
            "اضغط «توزيع مصروفات جديد»",
            "أضف إيصالات الشراء",
            "أضف بنود التكاليف",
            "اضغط «حفظ» ثم «تسجيل»"
          ],

          sEn: [
            "Click «New Landed Cost»",
            "Add purchase receipts",
            "Add cost items",
            "Click «Save» then «Submit»"
          ]
        }
      ]
    },

    /* =============================
       الحسابات
    ============================= */

    {
      titleEn: "Accounting",
      titleAr: "الحسابات",
      icon: "🏛️",

      items: [
        {
          doctype: "Journal Entry",
          icon: "📝",
          labelAr: "قيد يومية",
          labelEn: "Journal Entry",

          cf: {},
          sfx: null,

          dAr: "تسجيل القيود المحاسبية اليدوية.",
          dEn: "Record manual accounting entries.",

          sAr: [
            "اضغط «قيد جديد»",
            "أضف المدين والدائن",
            "اضغط «حفظ» ثم «تسجيل»"
          ],

          sEn: [
            "Click «New Entry»",
            "Add debit/credit rows",
            "Click «Save» then «Submit»"
          ]
        },

        {
          doctype: "Vouchers Entry",
          icon: "💰",
          labelAr: "سندات الصرف والقبض",
          labelEn: "Vouchers Entry",

          cf: {},
          sfx: null,

          dAr: "تسجيل المدفوعات الواردة والصادرة مع ربطها بالفواتير.",
          dEn: "Record incoming/outgoing payments with invoice linking.",

          sAr: [
            "اضغط «سند جديد»",
            "اختر النوع والطرف",
            "أدخل المبلغ واختر الفواتير",
            "اضغط «حفظ» ثم «تسجيل»"
          ],

          sEn: [
            "Click «New Payment»",
            "Select type and party",
            "Enter amount and select invoices",
            "Click «Save» then «Submit»"
          ]
        },

        {
          doctype: "Account",
          icon: "🏛️",
          labelAr: "دليل الحسابات",
          labelEn: "Chart of Accounts",

          cf: {},
          sfx: null,
          isTree: true,

          dAr: "الهيكل الشجري لجميع الحسابات المالية.",
          dEn: "Tree structure of all financial accounts.",

          sAr: [
            "اذهب إلى «دليل الحسابات»",
            "اضغط «إضافة ابن»",
            "أدخل الاسم والنوع",
            "اضغط «إنشاء»"
          ],

          sEn: [
            "Go to «Chart of Accounts»",
            "Click «Add Child»",
            "Enter name and type",
            "Click «Create»"
          ]
        }
      ]
    },

    /* =============================
       التقارير
    ============================= */

    {
      titleEn: "Reports",
      titleAr: "التقارير",
      icon: "📊",

      items: [
        {
          doctype: "General Ledger",
          icon: "📒",
          labelAr: "دفتر الأستاذ العام",
          labelEn: "General Ledger",
          isReport: true,
          dAr: "",
          dEn: "",
          sAr: [],
          sEn: []
        },

        {
          doctype: "New Tax Report",
          icon: "🧮",
          labelAr: "تقرير ضريبة القيمة المضافة",
          labelEn: "VAT Report",
          isReport: true,
          dAr: "",
          dEn: "",
          sAr: [],
          sEn: []
        },

        {
          doctype: "تقرير الإسترداد الضريبي",
          icon: "📋",
          labelAr: "تقرير الاسترداد الضريبي",
          labelEn: "Tax Refund Report",
          isReport: true,
          dAr: "",
          dEn: "",
          sAr: [],
          sEn: []
        },

        {
          doctype: "Detailed General Ledger",
          icon: "📒",
          labelAr: "دفتر الاستاذ مفصل",
          labelEn: "Detailed GL",
          isReport: true,
          dAr: "",
          dEn: "",
          sAr: [],
          sEn: []
        },

        {
          doctype: "Mu Trial Balance for Party",
          icon: "📥",
          labelAr: "ميزان مراجعة للعميل",
          labelEn: "Customer Balance",
          isReport: true,
          dAr: "",
          dEn: "",
          sAr: [],
          sEn: []
        },

        {
          doctype: "Mu Trial Balance for Party",
          icon: "📤",
          labelAr: "ميزان مراجعة للمورد",
          labelEn: "Supplier Balance",
          isReport: true,
          dAr: "",
          dEn: "",
          sAr: [],
          sEn: []
        },

        /* =========================================
           NEW REPORT 1
           ميزان المراجعة المجمع
        ========================================= */

        {
          doctype: "Mu Trial Balance",
          icon: "📊",
          labelAr: "ميزان المراجعة المجمع",
          labelEn: "Mu Trial Balance",
          isReport: true,
          dAr: "",
          dEn: "",
          sAr: [],
          sEn: []
        },

        /* =========================================
           NEW REPORT 2
           تفاصيل التدفق النقدي
        ========================================= */

        {
          doctype: "Detailed Cash Flow",
          icon: "💵",
          labelAr: "تفاصيل التدفق النقدي",
          labelEn: "Detailed Cash Flow",
          isReport: true,
          dAr: "",
          dEn: "",
          sAr: [],
          sEn: []
        },

        /* =========================================
           NEW REPORT 3
           تقرير التكاليف
        ========================================= */

        {
          doctype: "Project Cost Analysis",
          icon: "📋",
          labelAr: "تقرير التكاليف",
          labelEn: "Project Cost Analysis",
          isReport: true,
          dAr: "",
          dEn: "",
          sAr: [],
          sEn: []
        }
      ]
    }
  ];

  /* =========================================================
     8. الفوتر
  ========================================================= */

  const footerInfo = {
    phone: "0115110455",
    email: "sales@mubtkir.com",
    website: "www.mubtkir.com"
  };

  /* =========================================================
     9. دوال مساعدة
  ========================================================= */

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatMoney(value) {
    const number = parseFloat(value) || 0;

    return number.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + (isArabic ? " ر.س" : " SAR");
  }

  function formatNumber(value) {
    return (parseFloat(value) || 0).toLocaleString("en-US");
  }

  /* =========================================================
     10. عرض الإحصائيات
  ========================================================= */

  function renderStats() {
    if (!statsSection) {
      return;
    }

    statsSection.innerHTML = `
      <div class="erp-stats-grid">
        ${statsCards
          .map((card) => {
            const label = isArabic
              ? card.labelAr
              : card.labelEn;

            return `
              <div class="erp-stat-card">
                <div class="erp-stat-icon">
                  ${card.icon}
                </div>

                <div class="erp-stat-info">
                  <span
                    class="erp-stat-value"
                    data-stat-id="${escapeHtml(card.id)}"
                  >
                    ...
                  </span>

                  <span class="erp-stat-label">
                    ${escapeHtml(label)}
                  </span>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    `;

    if (!window.frappe) {
      return;
    }

    statsCards.forEach((card) => {
      card
        .fetch()
        .then((value) => {
          const element = statsSection.querySelector(
            `[data-stat-id="${card.id}"]`
          );

          if (element) {
            element.textContent = formatMoney(value);
          }
        })
        .catch(() => {
          const element = statsSection.querySelector(
            `[data-stat-id="${card.id}"]`
          );

          if (element) {
            element.textContent = formatMoney(0);
          }
        });
    });
  }

  /* =========================================================
     11. عرض الاختصارات
  ========================================================= */

  function renderQuickActions() {
    if (!quickActions) {
      return;
    }

    const showStepsText = isArabic
      ? "📖 الخطوات"
      : "📖 Steps";

    const hideStepsText = isArabic
      ? "📖 إخفاء"
      : "📖 Hide";

    let html = "";

    shortcutSections.forEach((section) => {
      const sectionTitle = isArabic
        ? section.titleAr
        : section.titleEn;

      html += `
        <div class="erp-module-section">
          <h2 class="erp-section-title">
            ${section.icon}
            ${escapeHtml(sectionTitle)}
          </h2>

          <div class="erp-dashboard-grid">
      `;

      section.items.forEach((item) => {
        const label = isArabic
          ? item.labelAr
          : item.labelEn;

        const description = isArabic
          ? item.dAr
          : item.dEn;

        const steps = isArabic
          ? item.sAr
          : item.sEn;

        const suffixText = item.sfx
          ? (isArabic ? item.sfx.ar : item.sfx.en)
          : "";

        const hasSteps =
          Array.isArray(steps) &&
          steps.length > 0;

        const stepsHtml = hasSteps
          ? `
              <ol>
                ${steps
                  .map((step) => `<li>${escapeHtml(step)}</li>`)
                  .join("")}
              </ol>
            `
          : "";

        html += `
          <div class="hm-shortcut">
            <div
              class="hm-sh-head"
              data-route="${escapeHtml(item.doctype)}"
              ${item.isReport ? 'data-rpt="1"' : ""}
              ${item.isTree ? 'data-tree="1"' : ""}
            >
              <span class="hm-sh-icon">
                ${item.icon}
              </span>

              <span class="hm-sh-name">
                ${escapeHtml(label)}
              </span>

              ${
                !item.isReport
                  ? `
                      <span
                        class="hm-sh-count zero"
                        data-cd="${escapeHtml(item.doctype)}"
                        data-cf='${JSON.stringify(item.cf || {})}'
                        data-cs="${escapeHtml(suffixText)}"
                      >
                        ...
                      </span>
                    `
                  : ""
              }
            </div>

            ${
              description
                ? `
                    <p class="hm-sh-desc">
                      ${escapeHtml(description)}
                    </p>
                  `
                : ""
            }

            ${
              hasSteps
                ? `
                    <button
                      type="button"
                      class="hm-sh-stepbtn"
                      data-stoggle
                    >
                      ${showStepsText}
                    </button>

                    <div
                      class="hm-sh-steps"
                      style="display:none"
                      data-scontent
                    >
                      ${stepsHtml}
                    </div>
                  `
                : ""
            }
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    quickActions.innerHTML = html;

    /* =============================
       جلب الأعداد
    ============================= */

    if (window.frappe) {
      quickActions
        .querySelectorAll("[data-cd]")
        .forEach((element) => {
          const doctype = element.dataset.cd;

          let filters = {};

          try {
            filters = JSON.parse(
              element.dataset.cf || "{}"
            );
          } catch (error) {
            filters = {};
          }

          const suffix = element.dataset.cs || "";

          frappe.call({
            method: "frappe.client.get_count",

            args: {
              doctype: doctype,
              filters: filters
            },

            async: true,

            callback: (response) => {
              const value = response?.message || 0;

              element.textContent = suffix
                ? `${formatNumber(value)} ${suffix}`
                : formatNumber(value);

              if (value > 0) {
                element.classList.remove("zero");
              } else {
                element.classList.add("zero");
              }
            },

            error: () => {
              element.textContent = "0";
              element.classList.add("zero");
            }
          });
        });
    }

    /* =============================
       الأحداث
    ============================= */

    quickActions.addEventListener("click", (event) => {

      /* خطوات */

      const toggle = event.target.closest("[data-stoggle]");

      if (toggle) {
        event.preventDefault();
        event.stopPropagation();

        const stepsBox = toggle.nextElementSibling;

        if (!stepsBox) {
          return;
        }

        const visible = stepsBox.style.display !== "none";

        stepsBox.style.display = visible
          ? "none"
          : "block";

        toggle.textContent = visible
          ? showStepsText
          : hideStepsText;

        return;
      }

      /* فتح المسار */

      const route = event.target.closest("[data-route]");

      if (!route || !window.frappe) {
        return;
      }

      event.preventDefault();

      const doctype = route.dataset.route;

      /* تقرير */

      if (route.dataset.rpt === "1") {
        frappe.set_route("query-report", doctype);
        return;
      }

      /* شجرة */

      if (route.dataset.tree === "1") {
        frappe.set_route("Tree", doctype);
        return;
      }

      /* قائمة */

      frappe.set_route("List", doctype);
    });
  }

  /* =========================================================
     12. الفوتر
  ========================================================= */

  function renderFooter() {
    if (!footerEl) {
      return;
    }

    const phoneLabel = isArabic
      ? "الهاتف الموحد"
      : "Phone";

    const emailLabel = isArabic
      ? "البريد الإلكتروني"
      : "Email";

    const websiteLabel = isArabic
      ? "الموقع"
      : "Website";

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

  /* =========================================================
     13. تشغيل الصفحة
  ========================================================= */

  renderStats();
  renderQuickActions();
  renderFooter();

})();
