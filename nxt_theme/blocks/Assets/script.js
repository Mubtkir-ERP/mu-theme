(() => {

  /* =========================================================
     MUBTKIR ERP — ASSETS WORKSPACE
     لوحة تحكم قسم الأصول
  ========================================================= */

  const root = root_element.querySelector("[data-erp-dashboard]");
  const assetCycle = root_element.querySelector("[data-purchase-cycle]");
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
     2. ASSET CYCLE
     دورة الأصول
  ========================================================= */

  const assetCycleCards = [

    {
      step: 1,
      action: "route",
      doctype: "Asset",

      labelEn: "Asset",
      labelAr: "إنشاء الأصل",

      descriptionEn:
        "Create and register the fixed asset.",

      descriptionAr:
        "إنشاء وتسجيل بيانات الأصل الثابت."
    },

    {
      step: 2,
      action: "new",
      doctype: "Purchase Invoice",

      labelEn: "Asset Purchase",
      labelAr: "شراء الأصل",

      descriptionEn:
        "Record the purchase invoice for the asset.",

      descriptionAr:
        "تسجيل فاتورة شراء الأصل."
    },

    {
      step: 3,
      action: "new",
      doctype: "Purchase Receipt",

      labelEn: "Asset Receipt",
      labelAr: "استلام الأصل",

      descriptionEn:
        "Receive the purchased asset.",

      descriptionAr:
        "تسجيل استلام الأصل المشترى."
    },

    {
      step: 4,
      action: "new",
      doctype: "Asset Capitalization",

      labelEn: "Capitalization",
      labelAr: "رسملة الأصل",

      descriptionEn:
        "Capitalize costs into an asset.",

      descriptionAr:
        "تجميع ورسملة التكاليف على الأصل."
    },

    {
      step: 5,
      action: "route",
      doctype: "Asset Depreciation Schedule",

      labelEn: "Depreciation",
      labelAr: "الإهلاك",

      descriptionEn:
        "Review and manage asset depreciation schedules.",

      descriptionAr:
        "متابعة وإدارة جداول إهلاك الأصول."
    },

    {
      step: 6,
      action: "new",
      doctype: "Asset Movement",

      labelEn: "Asset Movement",
      labelAr: "نقل الأصل",

      descriptionEn:
        "Transfer the asset between locations or custodians.",

      descriptionAr:
        "نقل الأصل بين المواقع أو الموظفين المسؤولين."
    },

    {
      step: 7,
      action: "disposal-selector",

      labelEn: "Sell / Dispose",
      labelAr: "بيع / استبعاد",

      descriptionEn:
        "Sell or scrap an asset at the end of its lifecycle.",

      descriptionAr:
        "بيع الأصل أو استبعاده عند نهاية استخدامه."
    }

  ];


  /* =========================================================
     3. HELPERS
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
    ).toLocaleString(
      isArabic ? "ar-SA" : "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );

  }


  function runReport(reportName, filters = {}) {

    return new Promise(resolve => {

      frappe.call({

        method: "frappe.desk.query_report.run",

        args: {

          report_name: reportName,

          filters: filters,

          ignore_prepared_report: true

        },

        callback: response => {

          resolve(
            response?.message?.result || []
          );

        },

        error: () => resolve([])

      });

    });

  }


  /* =========================================================
     4. OVERVIEW
     نظرة عامة
  ========================================================= */

  const statsCards = [

    /* إجمالي الأصول */
    {
      id: "total-assets",

      short: "AST",

      labelEn: "Total Assets",
      labelAr: "إجمالي الأصول",

      fetch: () =>
        new Promise(resolve => {

          frappe.call({

            method: "frappe.client.get_count",

            args: {

              doctype: "Asset",

              filters: {
                docstatus: 1
              }

            },

            callback: data =>
              resolve(data?.message || 0),

            error: () =>
              resolve(0)

          });

        })
    },


    /* القيمة الدفترية */
    {
      id: "book-value",

      short: "VAL",

      labelEn: "Current Book Value",
      labelAr: "القيمة الدفترية الحالية",

      isCurrency: true,

      fetch: async () => {

        const company =
          getDefaultCompany();

        const filters = {};

        if (company)
          filters.company = company;

        const rows =
          await runReport(
            "Asset Depreciations and Balances",
            filters
          );

        let total = 0;

        rows.forEach(row => {

          if (!row)
            return;

          const value =
            Number(
              row.net_asset_value ??
              row.current_value ??
              row.value_after_depreciation ??
              row.book_value ??
              0
            );

          if (Number.isFinite(value))
            total += value;

        });

        return total;

      }
    },


    /* الإهلاك المستحق */
    {
      id: "due-depreciation",

      short: "DEP",

      labelEn: "Due Depreciation",
      labelAr: "الإهلاك المستحق",

      fetch: () =>
        new Promise(resolve => {

          frappe.call({

            method: "frappe.client.get_count",

            args: {

              doctype:
                "Asset Depreciation Schedule",

              filters: {

                docstatus: 1,

                status: [
                  "in",
                  [
                    "Active",
                    "Draft"
                  ]
                ]

              }

            },

            callback: data =>
              resolve(data?.message || 0),

            error: () =>
              resolve(0)

          });

        })
    },


    /* الأصول المباعة أو المستبعدة */
    {
      id: "disposed-assets",

      short: "DSP",

      labelEn: "Disposed Assets",
      labelAr: "الأصول المستبعدة",

      fetch: () =>
        new Promise(resolve => {

          frappe.call({

            method: "frappe.client.get_count",

            args: {

              doctype: "Asset",

              filters: {

                docstatus: 1,

                status: [
                  "in",
                  [
                    "Sold",
                    "Scrapped"
                  ]
                ]

              }

            },

            callback: data =>
              resolve(data?.message || 0),

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
      doctype: "Asset",

      labelEn: "New Asset",
      labelAr: "أصل جديد"
    },

    {
      doctype: "Purchase Invoice",

      labelEn: "Asset Purchase Invoice",
      labelAr: "فاتورة شراء أصل"
    },

    {
      doctype: "Asset Movement",

      labelEn: "New Asset Movement",
      labelAr: "حركة أصل جديدة"
    },

    {
      doctype: "Asset Value Adjustment",

      labelEn: "Asset Value Adjustment",
      labelAr: "تعديل قيمة أصل"
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

      phoneEn: "Phone",
      phoneAr: "الهاتف الموحد",

      emailEn: "Email",
      emailAr: "البريد الإلكتروني",

      websiteEn: "Website",
      websiteAr: "الموقع"

    }

  };


  /* =========================================================
     7. DASHBOARD SECTIONS
  ========================================================= */

  const sections = [

    [
      "Reports & Masters",

      [

        [
          "Assets",
          "🏢",
          [
            "Asset",
            "Asset Category",
            "Asset Location"
          ]
        ],

        [
          "Asset Transactions",
          "🔄",
          [
            "Asset Movement",
            "Asset Capitalization",
            "Asset Value Adjustment"
          ]
        ],

        [
          "Depreciation",
          "📉",
          [
            "Asset Depreciation Schedule",
            "Finance Book"
          ]
        ],

        [
          "Maintenance",
          "🛠️",
          [
            "Asset Maintenance",
            "Asset Maintenance Log",
            "Asset Repair",
            "Asset Maintenance Team"
          ]
        ],

        [
          "Purchasing",
          "🧾",
          [
            "Purchase Invoice",
            "Purchase Receipt",
            "Item"
          ]
        ],

        [
          "Key Reports",
          "📊",
          [
            "Asset Depreciation Ledger",
            "Asset Depreciations and Balances",
            "Fixed Asset Register"
          ]
        ],

        [
          "Other",
          "📋",
          [
            "Asset Shift Allocation"
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

    "Assets":
      "الأصول",

    "Asset Transactions":
      "حركات الأصول",

    "Depreciation":
      "الإهلاك",

    "Maintenance":
      "الصيانة",

    "Purchasing":
      "شراء الأصول",

    "Key Reports":
      "التقارير الرئيسية",

    "Other":
      "أخرى",


    "Asset":
      "الأصل",

    "Asset Category":
      "فئة الأصل",

    "Asset Location":
      "موقع الأصل",


    "Asset Movement":
      "حركة الأصل",

    "Asset Capitalization":
      "رسملة الأصل",

    "Asset Value Adjustment":
      "تعديل قيمة الأصل",


    "Asset Depreciation Schedule":
      "جدول إهلاك الأصل",

    "Finance Book":
      "الدفتر المالي",


    "Asset Maintenance":
      "صيانة الأصل",

    "Asset Maintenance Log":
      "سجل صيانة الأصل",

    "Asset Repair":
      "إصلاح الأصل",

    "Asset Maintenance Team":
      "فريق صيانة الأصول",


    "Purchase Invoice":
      "فاتورة مشتريات",

    "Purchase Receipt":
      "إيصال شراء",

    "Item":
      "المنتج",


    "Asset Depreciation Ledger":
      "دفتر إهلاك الأصول",

    "Asset Depreciations and Balances":
      "إهلاك وأرصدة الأصول",

    "Fixed Asset Register":
      "سجل الأصول الثابتة",

    "Asset Shift Allocation":
      "تخصيص ورديات الأصل"

  };


  /* =========================================================
     9. ROUTE TYPES
  ========================================================= */

  const reportNames =
    new Set([

      "Asset Depreciation Ledger",

      "Asset Depreciations and Balances",

      "Fixed Asset Register"

    ]);


  const treeDocs =
    new Set([

      "Asset Location"

    ]);


  const singleDocs =
    new Set([]);


  /* =========================================================
     10. ITEM DESCRIPTIONS
  ========================================================= */

  const itemDescriptions = {

    "Asset": {

      icon: "🏢",

      summaryAr:
        "تعريف الأصل الثابت وبيانات الشراء والقيمة والموقع والإهلاك.",

      summaryEn:
        "Define fixed asset details, purchase information, value, location, and depreciation.",

      stepsAr: [

        "اضغط «أصل جديد»",

        "اخترالأصل",

        "حدد الشركة",

        "حدد تاريخ الشراء",

        "أدخل قيمة الشراء",

        "حدد موقع الأصل",

        "حدد فئة الأصل",

        "راجع إعدادات الإهلاك",

        "اضغط «حفظ» ثم «تسجيل»"

      ],

      stepsEn: [

        "Click «New Asset»",

        "Select asset item",

        "Select company",

        "Set purchase date",

        "Enter purchase value",

        "Set asset location",

        "Select asset category",

        "Review depreciation settings",

        "Click «Save» then «Submit»"

      ]

    },


    "Asset Category": {

      icon: "📁",

      summaryAr:
        "تصنيف الأصول وتحديد الحسابات وإعدادات الإهلاك الافتراضية لكل فئة.",

      summaryEn:
        "Classify assets and define default accounts and depreciation settings.",

      stepsAr: [

        "اضغط «فئة أصل جديدة»",

        "أدخل اسم الفئة",

        "حدد حساب الأصل الثابت",

        "حدد حساب الإهلاك",

        "حدد حساب مصروف الإهلاك",

        "حدد طريقة الإهلاك",

        "حدد العمر الافتراضي",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Click «New Asset Category»",

        "Enter category name",

        "Set fixed asset account",

        "Set accumulated depreciation account",

        "Set depreciation expense account",

        "Select depreciation method",

        "Set useful life",

        "Click «Save»"

      ]

    },


    "Asset Movement": {

      icon: "🔄",

      summaryAr:
        "نقل الأصل من موقع أو موظف مسؤول إلى موقع أو موظف آخر.",

      summaryEn:
        "Transfer an asset between locations or custodians.",

      stepsAr: [

        "اضغط «حركة أصل جديدة»",

        "اختر نوع الحركة",

        "حدد الأصل",

        "حدد الموقع أو الموظف الحالي",

        "حدد الموقع أو الموظف الجديد",

        "حدد تاريخ الحركة",

        "اضغط «حفظ» ثم «تسجيل»"

      ],

      stepsEn: [

        "Click «New Asset Movement»",

        "Select movement purpose",

        "Select asset",

        "Set current location or custodian",

        "Set target location or custodian",

        "Set transaction date",

        "Click «Save» then «Submit»"

      ]

    },


    "Asset Capitalization": {

      icon: "💰",

      summaryAr:
        "تجميع تكاليف أو أصول متعددة ورسملتها ضمن أصل ثابت.",

      summaryEn:
        "Capitalize costs or existing assets into a fixed asset.",

      stepsAr: [

        "اضغط «رسملة أصل جديدة»",

        "حدد الشركة",

        "حدد تاريخ التسجيل",

        "حدد الأصل المستهدف",

        "أضف التكاليف أو الأصول المستهلكة",

        "راجع القيمة النهائية",

        "اضغط «حفظ» ثم «تسجيل»"

      ],

      stepsEn: [

        "Click «New Asset Capitalization»",

        "Select company",

        "Set posting date",

        "Select target asset",

        "Add costs or consumed assets",

        "Review final capitalized value",

        "Click «Save» then «Submit»"

      ]

    },


    "Asset Value Adjustment": {

      icon: "⚖️",

      summaryAr:
        "تعديل القيمة الدفترية للأصل عند إعادة التقييم أو تغير القيمة.",

      summaryEn:
        "Adjust the book value of an asset when its value changes.",

      stepsAr: [

        "اضغط «تعديل قيمة أصل جديد»",

        "اختر الأصل",

        "حدد تاريخ التعديل",

        "أدخل القيمة الجديدة",

        "راجع الفرق المحاسبي",

        "اضغط «حفظ» ثم «تسجيل»"

      ],

      stepsEn: [

        "Click «New Asset Value Adjustment»",

        "Select asset",

        "Set adjustment date",

        "Enter new value",

        "Review accounting difference",

        "Click «Save» then «Submit»"

      ]

    },


    "Asset Maintenance": {

      icon: "🛠️",

      summaryAr:
        "جدولة أعمال الصيانة والفحص والمعايرة الدورية للأصول.",

      summaryEn:
        "Schedule maintenance, inspection, and calibration activities for assets.",

      stepsAr: [

        "اضغط «صيانة أصل جديدة»",

        "اختر الأصل",

        "حدد فريق الصيانة",

        "أضف مهام الصيانة",

        "حدد دورية كل مهمة",

        "حدد تاريخ بداية الصيانة",

        "اضغط «حفظ» ثم «تسجيل»"

      ],

      stepsEn: [

        "Click «New Asset Maintenance»",

        "Select asset",

        "Select maintenance team",

        "Add maintenance tasks",

        "Set task frequency",

        "Set maintenance start date",

        "Click «Save» then «Submit»"

      ]

    },


    "Asset Repair": {

      icon: "🔧",

      summaryAr:
        "تسجيل عمليات إصلاح الأصل وتكاليف الإصلاح وحالته.",

      summaryEn:
        "Record asset repairs, repair costs, and repair status.",

      stepsAr: [

        "اضغط «إصلاح أصل جديد»",

        "اختر الأصل",

        "حدد تاريخ العطل",

        "أدخل وصف المشكلة",

        "أضف تكاليف الإصلاح",

        "حدد حالة الإصلاح",

        "اضغط «حفظ» ثم «تسجيل»"

      ],

      stepsEn: [

        "Click «New Asset Repair»",

        "Select asset",

        "Set failure date",

        "Enter failure description",

        "Add repair costs",

        "Set repair status",

        "Click «Save» then «Submit»"

      ]

    }

  };


  /* =========================================================
     11. TRANSLATE
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


    if (treeDocs.has(name)) {

      frappe.set_route(
        "Tree",
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


  /* =========================================================
     13. DISPOSAL SELECTOR
  ========================================================= */

  function showDisposalSelector() {

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
            🏢
          </span>

          <h3 class="erp-modal-title">
            ${
              isArabic
                ? "بيع أو استبعاد الأصل"
                : "Sell or Dispose Asset"
            }
          </h3>

        </div>

        <p class="erp-modal-summary">

          ${
            isArabic
              ? "اختر الإجراء المطلوب. البيع يتم من فاتورة المبيعات، أما الاستبعاد فيتم من بطاقة الأصل."
              : "Choose the required action. Selling is processed through Sales Invoice, while scrapping is performed from the Asset record."
          }

        </p>

        <div
          class="erp-quick-grid"
          style="
            margin-top:18px;
            grid-template-columns:
            repeat(2,minmax(0,1fr)) !important;
          "
        >

          <button
            type="button"
            class="erp-quick-btn"
            data-disposal-action="sell"
          >
            ${
              isArabic
                ? "بيع أصل"
                : "Sell Asset"
            }
          </button>

          <button
            type="button"
            class="erp-quick-btn"
            data-disposal-action="scrap"
          >
            ${
              isArabic
                ? "استبعاد أصل"
                : "Scrap Asset"
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
      .querySelector("[data-modal-close]")
      ?.addEventListener(
        "click",
        () => overlay.remove()
      );


    overlay.addEventListener(

      "click",

      event => {

        if (event.target === overlay)
          overlay.remove();

      }

    );


    overlay
      .querySelector(
        '[data-disposal-action="sell"]'
      )
      ?.addEventListener(

        "click",

        () => {

          overlay.remove();

          frappe.new_doc(
            "Sales Invoice"
          );

        }

      );


    overlay
      .querySelector(
        '[data-disposal-action="scrap"]'
      )
      ?.addEventListener(

        "click",

        () => {

          overlay.remove();

          frappe.set_route(
            "List",
            "Asset"
          );

        }

      );

  }


  /* =========================================================
     14. INFO MODAL
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


    overlay
      .querySelector("[data-modal-close]")
      ?.addEventListener(
        "click",
        () => overlay.remove()
      );


    overlay.addEventListener(

      "click",

      event => {

        if (event.target === overlay)
          overlay.remove();

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
            .toggle("is-shown");


          toggleButton.textContent =
            stepsContainer
              .classList
              .contains("is-shown")

              ? hideText
              : showText;

        }

      );

    }

  }


  /* =========================================================
     15. RENDER ASSET CYCLE
  ========================================================= */

  function renderAssetCycle() {

    if (!assetCycle)
      return;


    assetCycle.innerHTML = `

      <section class="erp-cycle-container">

        <h2
          class="
            erp-section-title
            erp-cycle-title
          "
        >
          ${
            isArabic
              ? "دورة الأصول"
              : "Asset Lifecycle"
          }
        </h2>


        <div
          class="erp-cycle-grid"
          style="
            grid-template-columns:
            repeat(
              ${assetCycleCards.length},
              minmax(0,1fr)
            );
          "
        >

          ${assetCycleCards

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
                  assetCycleCards.length - 1

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
            )

            .join("")}

        </div>

      </section>

    `;


    assetCycle.addEventListener(

      "click",

      event => {

        const element =
          event.target.closest(
            "[data-cycle-index]"
          );

        if (!element)
          return;


        const card =
          assetCycleCards[
            Number(
              element.dataset.cycleIndex
            )
          ];

        if (!card)
          return;


        if (
          card.action === "new"
        ) {

          frappe.new_doc(
            card.doctype
          );

          return;

        }


        if (
          card.action ===
          "disposal-selector"
        ) {

          showDisposalSelector();

          return;

        }


        openRoute(
          card.doctype
        );

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

      <section class="erp-overview-container">

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


    statsCards.forEach(card => {

      card.fetch().then(value => {

        const element =
          statsSection.querySelector(
            `[data-stat-id="${card.id}"]`
          );

        if (!element)
          return;


        element.textContent =
          card.isCurrency

            ? `${formatCurrency(value)} ${
                isArabic
                  ? "ر.س"
                  : "SAR"
              }`

            : formatNumber(value);

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

          }

        });


      selectedCard
        .classList
        .toggle(
          "is-open",
          shouldOpen
        );

    }

  );


  /* =========================================================
     21. INIT
  ========================================================= */

  renderAssetCycle();

  renderStats();

  renderQuickActions();

  renderSections();

  renderFooter();

})();