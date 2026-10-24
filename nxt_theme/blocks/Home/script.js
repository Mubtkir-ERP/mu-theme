
(() => {

  /* ═══════════════════════════════════════════════════
     MUBTKIR ERP — HOME DASHBOARD
     جميع الألوان تأتي من CSS الرئيسي فقط
  ═══════════════════════════════════════════════════ */

  /* =========================================================
     1. العناصر الرئيسية
  ========================================================= */

  const root = root_element.querySelector(
    "[data-erp-dashboard]"
  );

  const content = root_element.querySelector(
    "[data-dashboard-content]"
  );

  const statsSection = root_element.querySelector(
    "[data-stats-section]"
  );

  const quickActions = root_element.querySelector(
    "[data-quick-actions]"
  );

  const footerEl = root_element.querySelector(
    "[data-dashboard-footer]"
  );

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

  root.setAttribute(
    "dir",
    isArabic ? "rtl" : "ltr"
  );

  root.classList.toggle(
    "erp-dashboard-rtl",
    isArabic
  );

  /* =========================================================
     3. CSS خاص بالصفحة الرئيسية
     بدون أي أكواد ألوان ثابتة
     كل الألوان من CSS الرئيسي:
       --brand-primary
       --brand-secondary
       --brand-accent
       --brand-purple
       --brand-text
       --brand-muted
       --brand-border
       --brand-soft
  ========================================================= */

  const existingStyle = root.querySelector(
    "#home-extra-css"
  );

  if (existingStyle) {
    existingStyle.remove();
  }

  const style = document.createElement("style");

  style.id = "home-extra-css";

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
      animation:
        hm-wave 2s ease-in-out infinite;
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

      0%,
      100% {
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
       FOOTER BRAND
    ========================================= */

    .hm-footer-brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 10px;
    }

    .hm-footer-logo {
      width: 32px;
      height: auto;
      opacity: 0.7;
    }

    .hm-footer-name {
      color: var(--brand-muted) !important;
      font-size: 13px;
      font-weight: 700;
    }

    /* =========================================
       HOME SHORTCUT
    ========================================= */

    .hm-shortcut {
      background:
        var(--fg-color, #ffffff);

      border:
        1px solid var(--brand-border);

      border-inline-start:
        4px solid var(--brand-primary);

      border-radius: 14px;
      padding: 14px 16px;

      box-shadow:
        0 3px 12px rgba(36, 59, 99, 0.06);

      transition:
        transform 0.20s ease,
        border-color 0.20s ease,
        box-shadow 0.20s ease;
    }

    .hm-shortcut:hover {
      transform:
        translateY(-2px);

      border-color:
        var(--brand-primary);

      box-shadow:
        0 8px 22px rgba(56, 103, 174, 0.12);
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
      background:
        var(--brand-soft);
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
      background:
        var(--brand-primary) !important;
      color: #ffffff !important;
      font-size: 11px;
      font-weight: 700;
      direction: ltr;
    }

    .hm-sh-count.zero {
      background:
        var(--brand-soft) !important;
      color:
        var(--brand-text) !important;
    }

    /* =========================================
       DESCRIPTION
    ========================================= */

    .hm-sh-desc {
      margin: 0 0 10px;
      color:
        var(--brand-muted) !important;
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
      border:
        1px solid var(--brand-border);
      border-radius: 8px;
      background:
        var(--brand-soft);
      color:
        var(--brand-primary) !important;
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
      border-color:
        var(--brand-secondary);
      background:
        var(--brand-soft-secondary);
      color:
        var(--brand-secondary) !important;
    }

    /* =========================================
       STEPS
    ========================================= */

    .hm-sh-steps {
      margin-top: 10px;
      padding: 12px 14px;
      border:
        1px solid var(--brand-border);
      border-radius: 10px;
      background:
        var(--brand-soft);
    }

    .hm-sh-steps ol {
      margin: 0;
      padding-inline-start: 20px;
    }

    .hm-sh-steps li {
      color:
        var(--brand-text) !important;
      font-size: 12.5px;
      line-height: 2;
    }

    /* =========================================
       FEATURE CARD
    ========================================= */

    .hm-feat {
      padding: 16px 18px;
      border:
        1px solid var(--brand-border);
      border-radius: 14px;
      background:
        var(--fg-color, #ffffff);
      box-shadow:
        0 3px 12px rgba(36, 59, 99, 0.06);
      cursor: pointer;
      transition:
        transform 0.20s ease,
        border-color 0.20s ease,
        box-shadow 0.20s ease;
    }

    .hm-feat:hover {
      transform:
        translateY(-2px);
      border-color:
        var(--brand-primary);
      box-shadow:
        0 8px 22px rgba(56, 103, 174, 0.12);
    }

    .hm-feat.is-open {
      border-color:
        var(--brand-primary);
      box-shadow:
        0 8px 28px rgba(56, 103, 174, 0.13);
    }

    .hm-feat-head {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .hm-feat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      height: 50px;
      flex-shrink: 0;
      border-radius: 14px;
      background:
        var(--brand-soft);
      font-size: 28px;
    }

    .hm-feat-info {
      flex: 1;
    }

    .hm-feat-title {
      margin: 0;
      color:
        var(--brand-text) !important;
      font-size: 15px;
      font-weight: 800;
    }

    .hm-feat-short {
      margin: 4px 0 0;
      color:
        var(--brand-muted) !important;
      font-size: 12.5px;
    }

    .hm-feat-chev {
      color:
        var(--brand-primary) !important;
      font-size: 20px;
      transition:
        transform 0.25s ease;
    }

    .hm-feat.is-open
    .hm-feat-chev {
      transform:
        rotate(180deg);
    }

    .hm-feat-detail {
      margin-top: 14px;
      padding-top: 14px;
      border-top:
        1px solid var(--brand-border);
      color:
        var(--brand-text) !important;
      font-size: 13.5px;
      line-height: 1.8;
    }

    .hm-why-title {
      margin: 30px 0 16px;
      color:
        var(--brand-text) !important;
      font-size: 19px;
      font-weight: 800;
      text-align: center;
    }

    /* =========================================
       SECTION TITLES ON HOME
    ========================================= */

    .erp-module-section
    .erp-section-title {
      color:
        var(--brand-text) !important;
    }

    /* =========================================
       DARK MODE
    ========================================= */

    [data-theme="dark"]
    .hm-shortcut,

    [data-theme="dark"]
    .hm-feat {
      background:
        var(--fg-color, #20242c);
    }

    [data-theme="dark"]
    .hm-sh-steps {
      background:
        rgba(56, 103, 174, 0.10);
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

      .hm-feat-icon {
        width: 42px;
        height: 42px;
        font-size: 23px;
      }

    }

  `;

  root.prepend(style);

  /* =========================================================
     4. جلب رصيد الحساب
  ========================================================= */

  function fetchAccountBalance(accountType) {

    return new Promise((resolve) => {

      const company =
        frappe.defaults.get_default("company");

      frappe.call({

        method:
          "frappe.client.get_list",

        args: {

          doctype:
            "Account",

          filters: {
            account_type: accountType,
            is_group: 0,
            company: company
          },

          fields: [
            "name"
          ],

          limit_page_length: 0
        },

        async: true,

        callback: (accountsResponse) => {

          const accounts =
            accountsResponse?.message || [];

          if (!accounts.length) {
            resolve(0);
            return;
          }

          frappe.call({

            method:
              "frappe.client.get_list",

            args: {

              doctype:
                "GL Entry",

              filters: {

                account: [
                  "in",
                  accounts.map(
                    (account) =>
                      account.name
                  )
                ],

                is_cancelled: 0
              },

              fields: [
                "sum(debit - credit) as balance"
              ],

              limit_page_length: 0,

              order_by:
                "name asc"
            },

            async: true,

            callback: (response) => {

              resolve(
                response?.message?.[0]?.balance ||
                0
              );

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
     5. البطاقات الإحصائية
     لا يوجد Color هنا.
     CSS هو المسؤول عن الألوان.
  ========================================================= */

  const statsCards = [

    {
      id:
        "total-sales",

      icon:
        "📈",

      labelEn:
        "Total Sales",

      labelAr:
        "إجمالي المبيعات",

      fetch: () =>
        new Promise((resolve) => {

          frappe.call({

            method:
              "frappe.client.get_list",

            args: {

              doctype:
                "Sales Invoice",

              filters: {
                docstatus: 1
              },

              fields: [
                "sum(base_grand_total) as total"
              ],

              limit_page_length: 0,

              order_by:
                "name asc"
            },

            async: true,

            callback: (response) => {

              resolve(
                response?.message?.[0]?.total ||
                0
              );

            },

            error: () => {
              resolve(0);
            }

          });

        })
    },

    {
      id:
        "total-purchases",

      icon:
        "📉",

      labelEn:
        "Total Purchases",

      labelAr:
        "إجمالي المشتريات",

      fetch: () =>
        new Promise((resolve) => {

          frappe.call({

            method:
              "frappe.client.get_list",

            args: {

              doctype:
                "Purchase Invoice",

              filters: {
                docstatus: 1
              },

              fields: [
                "sum(base_grand_total) as total"
              ],

              limit_page_length: 0,

              order_by:
                "name asc"
            },

            async: true,

            callback: (response) => {

              resolve(
                response?.message?.[0]?.total ||
                0
              );

            },

            error: () => {
              resolve(0);
            }

          });

        })
    },

    {
      id:
        "cash-balance",

      icon:
        "💵",

      labelEn:
        "Cash Balance",

      labelAr:
        "رصيد الصندوق",

      fetch: () =>
        fetchAccountBalance(
          "Cash"
        )
    },

    {
      id:
        "bank-balance",

      icon:
        "🏦",

      labelEn:
        "Bank Balance",

      labelAr:
        "رصيد البنك",

      fetch: () =>
        fetchAccountBalance(
          "Bank"
        )
    }

  ];

  /* =========================================================
     6. أقسام الاختصارات
     لا توجد ألوان داخل JavaScript
  ========================================================= */

  const shortcutSections = [

    /* =============================
       المبيعات
    ============================= */

    {
      titleEn:
        "Selling",

      titleAr:
        "المبيعات",

      icon:
        "🛒",

      items: [

        {
          doctype:
            "Quotation",

          icon:
            "📋",

          labelAr:
            "عرض سعر",

          labelEn:
            "Quotation",

          cf: {
            docstatus: 0
          },

          sfx: {
            ar: "مفتوح",
            en: "Open"
          },

          dAr:
            "إنشاء عروض أسعار احترافية للعملاء مع المنتجات والأسعار.",

          dEn:
            "Create professional quotations with items and prices.",

          sAr: [
            "اضغط «عرض سعر جديد»",
            "اختر العميل",
            "أضف المنتجات مع الكمية والسعر",
            "أضف الضرائب",
            "حدد تاريخ نهاية العرض",
            "اضغط «حفظ» ثم «تسجيل»",
            "أرسل للعميل بالبريد أو اطبعه"
          ],

          sEn: [
            "Click «New Quotation»",
            "Select customer",
            "Add items with qty and rate",
            "Add taxes",
            "Set valid till date",
            "Click «Save» then «Submit»",
            "Email or print for customer"
          ]
        },

        {
          doctype:
            "Sales Invoice",

          icon:
            "🧾",

          labelAr:
            "فاتورة مبيعات",

          labelEn:
            "Sales Invoice",

          cf: {
            docstatus: 1,
            status: "Paid"
          },

          sfx: {
            ar: "مدفوعة",
            en: "Paid"
          },

          dAr:
            "إصدار فواتير مبيعات مع الضرائب وربطها بالحسابات تلقائياً.",

          dEn:
            "Issue sales invoices with taxes and auto accounting entries.",

          sAr: [
            "اضغط «فاتورة مبيعات جديدة»",
            "اختر العميل",
            "أضف المنتجات والضرائب",
            "اضغط «حفظ» ثم «تسجيل»",
            "يُنشأ القيد المحاسبي تلقائياً"
          ],

          sEn: [
            "Click «New Sales Invoice»",
            "Select customer",
            "Add items and taxes",
            "Click «Save» then «Submit»",
            "Accounting entry auto-created"
          ]
        },

        {
          doctype:
            "Customer",

          icon:
            "👤",

          labelAr:
            "العميل",

          labelEn:
            "Customer",

          cf: {},

          sfx:
            null,

          dAr:
            "تعريف بيانات العملاء: الاسم، المجموعة، العملة، وشروط الدفع.",

          dEn:
            "Define customer data: name, group, currency, and payment terms.",

          sAr: [
            "اضغط «عميل جديد»",
            "أدخل الاسم واختر النوع والمجموعة",
            "حدد العملة وشروط الدفع",
            "أضف بيانات الاتصال",
            "اضغط «حفظ»"
          ],

          sEn: [
            "Click «New Customer»",
            "Enter name, select type and group",
            "Set currency and payment terms",
            "Add contact info",
            "Click «Save»"
          ]
        }

      ]
    },

    /* =============================
       المخزون
    ============================= */

    {
      titleEn:
        "Stock",

      titleAr:
        "المخزون",

      icon:
        "📦",

      items: [

        {
          doctype:
            "Item",

          icon:
            "📦",

          labelAr:
            "منتج",

          labelEn:
            "Item",

          cf: {
            disabled: 0
          },

          sfx: {
            ar: "متاح",
            en: "Available"
          },

          dAr:
            "تعريف المنتجات (منتجات، خدمات، مواد خام) مع التسعير.",

          dEn:
            "Define items (products, services, raw materials) with pricing.",

          sAr: [
            "اضغط «منتج جديد»",
            "أدخل الرمز والاسم",
            "اختر المجموعة والوحدة والنوع",
            "فعّل «الاحتفاظ بالمخزون»",
            "أضف الأسعار",
            "اضغط «حفظ»"
          ],

          sEn: [
            "Click «New Item»",
            "Enter code and name",
            "Select group, UOM, and type",
            "Enable «Maintain Stock»",
            "Add prices",
            "Click «Save»"
          ]
        },

        {
          doctype:
            "Item Group",

          icon:
            "📁",

          labelAr:
            "تصنيف المنتجات",

          labelEn:
            "Item Group",

          cf: {},

          sfx:
            null,

          isTree:
            true,

          dAr:
            "تصنيف المنتجات في مجموعات هرمية لتنظيم المنتجات.",

          dEn:
            "Classify items in hierarchical groups for product organization.",

          sAr: [
            "اذهب إلى «تصنيف المنتجات»",
            "اضغط على الأب ← «إضافة ابن»",
            "أدخل الاسم",
            "اضغط «إنشاء»"
          ],

          sEn: [
            "Go to «Item Group»",
            "Click parent → «Add Child»",
            "Enter name",
            "Click «Create»"
          ]
        },

        {
          doctype:
            "Stock Entry",

          icon:
            "🔄",

          labelAr:
            "إدخال مخزون",

          labelEn:
            "Stock Entry",

          cf: {
            docstatus: 0
          },

          sfx:
            null,

          dAr:
            "تسجيل حركات المخزون: استلام، إصدار، تحويل، إنتاج.",

          dEn:
            "Record stock movements: receive, issue, transfer, manufacture.",

          sAr: [
            "اضغط «إدخال مخزون جديد»",
            "اختر نوع العملية",
            "حدد المستودعات",
            "أضف المنتجات والكمية",
            "اضغط «حفظ» ثم «تسجيل»"
          ],

          sEn: [
            "Click «New Stock Entry»",
            "Select purpose",
            "Set warehouses",
            "Add items and qty",
            "Click «Save» then «Submit»"
          ]
        }

      ]
    },

    /* =============================
       المشتريات
    ============================= */

    {
      titleEn:
        "Buying",

      titleAr:
        "المشتريات",

      icon:
        "🏪",

      items: [

        {
          doctype:
            "Purchase Order",

          icon:
            "📦",

          labelAr:
            "أمر شراء",

          labelEn:
            "Purchase Order",

          cf: {
            docstatus: 1,
            status: [
              "in",
              [
                "To Receive and Bill",
                "To Receive"
              ]
            ]
          },

          sfx:
            null,

          dAr:
            "إصدار أوامر شراء رسمية للموردين مع المنتجات والأسعار.",

          dEn:
            "Issue formal purchase orders with items, prices, and delivery dates.",

          sAr: [
            "اضغط «أمر شراء جديد»",
            "اختر المورد",
            "أضف المنتجات",
            "حدد المستودع والتاريخ والضرائب",
            "اضغط «حفظ» ثم «تسجيل»"
          ],

          sEn: [
            "Click «New Purchase Order»",
            "Select supplier",
            "Add items",
            "Set warehouse, date, and taxes",
            "Click «Save» then «Submit»"
          ]
        },

        {
          doctype:
            "Purchase Invoice",

          icon:
            "🧾",

          labelAr:
            "فاتورة مشتريات",

          labelEn:
            "Purchase Invoice",

          cf: {
            docstatus: 1,
            status: "Paid"
          },

          sfx: {
            ar: "مدفوعة",
            en: "Paid"
          },

          dAr:
            "تسجيل فواتير الموردين مع ربطها بالحسابات تلقائياً.",

          dEn:
            "Record supplier invoices with automatic accounting entries.",

          sAr: [
            "اضغط «فاتورة مشتريات جديدة»",
            "اختر المورد وأضف المنتجات",
            "أدخل الأسعار والضرائب",
            "اضغط «حفظ» ثم «تسجيل»"
          ],

          sEn: [
            "Click «New Purchase Invoice»",
            "Select supplier and add items",
            "Enter rates and taxes",
            "Click «Save» then «Submit»"
          ]
        },

        {
          doctype:
            "Supplier",

          icon:
            "🏭",

          labelAr:
            "المورد",

          labelEn:
            "Supplier",

          cf: {},

          sfx:
            null,

          dAr:
            "تعريف بيانات الموردين: الاسم، المجموعة، العملة، وشروط الدفع.",

          dEn:
            "Define supplier data: name, group, currency, and payment terms.",

          sAr: [
            "اضغط «مورد جديد»",
            "أدخل الاسم واختر المجموعة والنوع",
            "حدد العملة والشروط",
            "أضف الاتصال",
            "اضغط «حفظ»"
          ],

          sEn: [
            "Click «New Supplier»",
            "Enter name, select group and type",
            "Set currency and terms",
            "Add contact",
            "Click «Save»"
          ]
        }

      ]
    },

    /* =============================
       المحاسبة
    ============================= */

    {
      titleEn:
        "Accounting",

      titleAr:
        "المحاسبة",

      icon:
        "🏛️",

      items: [

        {
          doctype:
            "Journal Entry",

          icon:
            "📝",

          labelAr:
            "قيد يومية",

          labelEn:
            "Journal Entry",

          cf: {
            docstatus: 0
          },

          sfx:
            null,

          dAr:
            "تسجيل القيود المحاسبية اليدوية (مدين ودائن) للتسويات والتعديلات.",

          dEn:
            "Record manual accounting entries (debit & credit) for adjustments.",

          sAr: [
            "اضغط «قيد يومية جديد»",
            "اختر النوع وأضف صفوف المدين والدائن",
            "تأكد المدين = الدائن",
            "أضف الملاحظات",
            "اضغط «حفظ» ثم «تسجيل»"
          ],

          sEn: [
            "Click «New Journal Entry»",
            "Select type, add debit/credit rows",
            "Ensure debit = credit",
            "Add remarks",
            "Click «Save» then «Submit»"
          ]
        },

        {
          doctype:
            "Payment Entry",

          icon:
            "💰",

          labelAr:
            "سندات القبض والصرف",

          labelEn:
            "Payment Entry",

          cf: {
            docstatus: 0
          },

          sfx:
            null,

          dAr:
            "تسجيل المدفوعات الواردة والصادرة مع ربطها بالفواتير تلقائياً.",

          dEn:
            "Record incoming/outgoing payments with auto invoice linking.",

          sAr: [
            "اضغط «سند قبض او صرف جديد»",
            "اختر النوع والطرف",
            "أدخل المبلغ واختر الفواتير",
            "اضغط «حفظ» ثم «تسجيل»"
          ],

          sEn: [
            "Click «New Payment Entry»",
            "Select type and party",
            "Enter amount and select invoices",
            "Click «Save» then «Submit»"
          ]
        },

        {
          doctype:
            "Account",

          icon:
            "🏛️",

          labelAr:
            "دليل الحسابات",

          labelEn:
            "Chart of Accounts",

          cf: {},

          sfx:
            null,

          isTree:
            true,

          dAr:
            "الهيكل الشجري لجميع الحسابات المالية.",

          dEn:
            "Tree structure of all financial accounts",

          sAr: [
            "اذهب إلى «دليل الحسابات»",
            "اضغط على الأب ← «إضافة ابن»",
            "أدخل الاسم والنوع",
            "اضغط «إنشاء»"
          ],

          sEn: [
            "Go to «Chart of Accounts»",
            "Click parent → «Add Child»",
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
      titleEn:
        "Reports",

      titleAr:
        "التقارير",

      icon:
        "📊",

      items: [

        {
          doctype:
            "Sales Analytics",

          icon:
            "📑",

          labelAr:
            "تقرير تحليل المبيعات",

          labelEn:
            "Sales Analytics Report",

          isReport:
            true,

          cf: {},

          sfx:
            null,

          dAr:
            "تقرير تحليلي يعرض بيانات المبيعات مع مقارنة شهرية.",

          dEn:
            "Analytical report showing sales data with monthly comparison.",

          sAr: [
            "اذهب إلى التقرير",
            "حدد الشركة والفترة",
            "اضغط «تشغيل»",
            "صدّر إلى Excel أو PDF"
          ],

          sEn: [
            "Go to report",
            "Set company and period",
            "Click «Run»",
            "Export to Excel or PDF"
          ]
        },

        {
          doctype:
            "All Tax Report",

          icon:
            "🧮",

          labelAr:
            "تقرير الضرائب",

          labelEn:
            "Tax Report",

          isReport:
            true,

          cf: {},

          sfx:
            null,

          dAr:
            "ملخص الضرائب: ضريبة المبيعات والمشتريات والصافي المستحق.",

          dEn:
            "Tax summary: sales tax, purchase tax, and net payable.",

          sAr: [
            "اذهب إلى التقرير",
            "حدد الشركة والفترة",
            "اضغط «تشغيل»"
          ],

          sEn: [
            "Go to report",
            "Set company and period",
            "Click «Run»"
          ]
        },

        {
          doctype:
            "General Ledger",

          icon:
            "📒",

          labelAr:
            "دفتر الأستاذ العام",

          labelEn:
            "General Ledger",

          isReport:
            true,

          cf: {},

          sfx:
            null,

          dAr:
            "جميع القيود المحاسبية مع الأرصدة لكل حساب وتاريخ.",

          dEn:
            "All accounting entries with balances per account and date.",

          sAr: [
            "اذهب إلى التقرير",
            "حدد الشركة والفترة",
            "فلتر حسب الحساب",
            "اضغط «تشغيل»"
          ],

          sEn: [
            "Go to report",
            "Set company and period",
            "Filter by account",
            "Click «Run»"
          ]
        }

      ]
    }

  ];

  /* =========================================================
     7. الفوتر
  ========================================================= */

  const footerInfo = {

    phone: (window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.phone) || "0115110455",

    email: (window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.email) || "sales@mubtkir.com",

    website: (window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.website) || "www.mubtkir.com"

  };


  /* =========================================================
     8. دوال مساعدة
  ========================================================= */

  function escapeHtml(value) {

    return String(value ?? "")
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );

  }


  function formatMoney(value) {

    const number =
      parseFloat(value) || 0;


    return number.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    ) +
      (
        isArabic
          ? " ر.س"
          : " SAR"
      );

  }


  function formatNumber(value) {

    return (
      parseFloat(value) || 0
    ).toLocaleString(
      "en-US"
    );

  }


  /* =========================================================
     9. عرض الإحصائيات
     لا يوجد Inline Color
  ========================================================= */

  function renderStats() {

    if (!statsSection) {
      return;
    }


    statsSection.innerHTML = `

      <div class="erp-stats-grid">

        ${statsCards
          .map((card) => {

            const label =
              isArabic
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

          const element =
            statsSection.querySelector(
              `[data-stat-id="${card.id}"]`
            );


          if (!element) {
            return;
          }


          element.textContent =
            formatMoney(value);

        })
        .catch(() => {

          const element =
            statsSection.querySelector(
              `[data-stat-id="${card.id}"]`
            );


          if (element) {
            element.textContent =
              formatMoney(0);
          }

        });

    });

  }


  /* =========================================================
     10. عرض الاختصارات
     لا يوجد Inline Color
  ========================================================= */

  function renderQuickActions() {

    if (!quickActions) {
      return;
    }


    const showStepsText =
      isArabic
        ? "📖 الخطوات"
        : "📖 Steps";


    const hideStepsText =
      isArabic
        ? "📖 إخفاء"
        : "📖 Hide";


    let html = "";


    shortcutSections.forEach((section) => {

      const sectionTitle =
        isArabic
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

        const label =
          isArabic
            ? item.labelAr
            : item.labelEn;


        const description =
          isArabic
            ? item.dAr
            : item.dEn;


        const steps =
          isArabic
            ? item.sAr
            : item.sEn;


        const suffixText =
          item.sfx
            ? (
                isArabic
                  ? item.sfx.ar
                  : item.sfx.en
              )
            : "";


        const stepsHtml = `

          <ol>

            ${steps
              .map(
                (step) =>
                  `<li>${escapeHtml(step)}</li>`
              )
              .join("")}

          </ol>

        `;


        html += `

          <div class="hm-shortcut">

            <div
              class="hm-sh-head"
              data-route="${escapeHtml(item.doctype)}"
              ${
                item.isReport
                  ? 'data-rpt="1"'
                  : ""
              }
              ${
                item.isTree
                  ? 'data-tree="1"'
                  : ""
              }
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


            <p class="hm-sh-desc">
              ${escapeHtml(description)}
            </p>


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

          </div>

        `;

      });


      html += `

          </div>

        </div>

      `;

    });


    quickActions.innerHTML =
      html;


    /* =============================
       جلب الأعداد
    ============================= */

    if (window.frappe) {

      quickActions
        .querySelectorAll(
          "[data-cd]"
        )
        .forEach((element) => {

          const doctype =
            element.dataset.cd;


          let filters = {};


          try {

            filters =
              JSON.parse(
                element.dataset.cf ||
                "{}"
              );

          } catch (error) {

            filters = {};

          }


          const suffix =
            element.dataset.cs ||
            "";


          frappe.call({

            method:
              "frappe.client.get_count",

            args: {

              doctype:
                doctype,

              filters:
                filters

            },

            async:
              true,


            callback: (response) => {

              const value =
                response?.message ||
                0;


              element.textContent =
                suffix
                  ? `${formatNumber(value)} ${suffix}`
                  : formatNumber(value);


              if (value > 0) {

                element.classList.remove(
                  "zero"
                );

              } else {

                element.classList.add(
                  "zero"
                );

              }

            },


            error: () => {

              element.textContent =
                "0";

              element.classList.add(
                "zero"
              );

            }

          });

        });

    }


    /* =============================
       الأحداث
    ============================= */

    quickActions.addEventListener(
      "click",
      (event) => {

        /* خطوات */

        const toggle =
          event.target.closest(
            "[data-stoggle]"
          );


        if (toggle) {

          event.preventDefault();
          event.stopPropagation();


          const stepsBox =
            toggle.nextElementSibling;


          if (!stepsBox) {
            return;
          }


          const visible =
            stepsBox.style.display !==
            "none";


          stepsBox.style.display =
            visible
              ? "none"
              : "block";


          toggle.textContent =
            visible
              ? showStepsText
              : hideStepsText;


          return;
        }


        /* فتح مستند */

        const route =
          event.target.closest(
            "[data-route]"
          );


        if (
          !route ||
          !window.frappe
        ) {
          return;
        }


        event.preventDefault();


        const doctype =
          route.dataset.route;


        /* تقرير */

        if (
          route.dataset.rpt ===
          "1"
        ) {

          frappe.set_route(
            "query-report",
            doctype
          );

          return;
        }


        /* شجرة */

        if (
          route.dataset.tree ===
          "1"
        ) {

          frappe.set_route(
            "Tree",
            doctype
          );

          return;
        }


        /* قائمة */

        frappe.set_route(
          "List",
          doctype
        );

      }
    );

  }


  /* =========================================================
     11. الفوتر
  ========================================================= */

  function renderFooter() {

    if (!footerEl) {
      return;
    }


    const phoneLabel =
      isArabic
        ? "الهاتف الموحد"
        : "Phone";


    const emailLabel =
      isArabic
        ? "البريد الإلكتروني"
        : "Email";


    const websiteLabel =
      isArabic
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
     12. نص الترحيب
  ========================================================= */

  const welcomeText =
    root.querySelector(
      "[data-welcome-text]"
    );


  const welcomeSub =
    root.querySelector(
      "[data-welcome-sub]"
    );


  if (welcomeText) {

    welcomeText.textContent =
      isArabic
        ? "مرحباً بك في مبتكر ERP"
        : "Welcome to Mubtkir ERP";

  }


  if (welcomeSub) {

    welcomeSub.textContent =
      isArabic
        ? "كل ما تحتاجه لإدارة أعمالك بذكاء وسهولة"
        : "Everything you need to manage your business smartly and easily";

  }


  /* =========================================================
     13. تشغيل الصفحة
  ========================================================= */

  renderStats();

  renderQuickActions();

  renderFooter();

})();
