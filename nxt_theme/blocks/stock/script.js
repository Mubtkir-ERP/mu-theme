(() => {

  /* =========================================================
     MUBTKIR ERP — STOCK WORKSPACE
     لوحة تحكم قسم المخزون
  ========================================================= */

  const root = root_element.querySelector("[data-erp-dashboard]");
  const stockCycle = root_element.querySelector("[data-purchase-cycle]");
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
     2. STOCK CYCLE
  ========================================================= */

  const stockCycleCards = [

    {
      step: 1,
      doctype: "Material Request",

      labelEn: "Material Request",
      labelAr: "طلب مواد",

      descriptionEn:
        "Create a request for materials required by the business.",

      descriptionAr:
        "إنشاء طلب للمواد أو المنتجات المطلوبة."
    },

    {
      step: 2,
      doctype: "Stock Entry",
      stockEntryType: "Material Receipt",

      labelEn: "Material Receipt",
      labelAr: "استلام مواد",

      descriptionEn:
        "Receive materials directly into the warehouse.",

      descriptionAr:
        "إدخال المواد المستلمة إلى المستودع."
    },

    {
      step: 3,
      doctype: "Stock Entry",
      stockEntryType: "Material Transfer",

      labelEn: "Material Transfer",
      labelAr: "تحويل مخزون",

      descriptionEn:
        "Transfer materials between company warehouses.",

      descriptionAr:
        "تحويل المواد بين مستودعات الشركة."
    },

    {
      step: 4,
      doctype: "Stock Entry",
      stockEntryType: "Material Issue",

      labelEn: "Material Issue",
      labelAr: "صرف مواد",

      descriptionEn:
        "Issue materials from the warehouse.",

      descriptionAr:
        "صرف المواد وإخراجها من المستودع."
    },

    {
      step: 5,
      doctype: "Stock Reconciliation",

      labelEn: "Stock Reconciliation",
      labelAr: "تسوية مخزون",

      descriptionEn:
        "Adjust stock quantities and valuation when required.",

      descriptionAr:
        "مطابقة وتعديل كميات وقيم المخزون."
    }

  ];


  /* =========================================================
     3. HELPERS FOR STATS
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


  function runStockBalanceReport() {

    return new Promise(resolve => {

      const company = getDefaultCompany();

      const filters = {};

      if (company)
        filters.company = company;

      frappe.call({

        method: "frappe.desk.query_report.run",

        args: {
          report_name: "Stock Balance",
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


  /* Cache stock report so it runs once */
  let stockBalancePromise = null;

  function getStockBalance() {

    if (!stockBalancePromise)
      stockBalancePromise = runStockBalanceReport();

    return stockBalancePromise;

  }


  /* =========================================================
     4. OVERVIEW
  ========================================================= */

  const statsCards = [

    /* إجمالي المنتجات */
    {
      id: "total-items",

      short: "ITM",

      labelEn: "Total Items",
      labelAr: "إجمالي المنتجات",

      fetch: () =>
        new Promise(resolve => {

          frappe.call({

            method: "frappe.client.get_count",

            args: {

              doctype: "Item",

              filters: {
                disabled: 0,
                is_stock_item: 1
              }

            },

            callback: data =>
              resolve(data?.message || 0),

            error: () =>
              resolve(0)

          });

        })
    },


    /* قيمة المخزون */
    {
      id: "stock-value",

      short: "VAL",

      labelEn: "Stock Value",
      labelAr: "قيمة المخزون",

      isCurrency: true,

      fetch: async () => {

        const rows =
          await getStockBalance();

        let total = 0;

        rows.forEach(row => {

          total +=
            Number(
              row.bal_val ??
              row.stock_value ??
              0
            ) || 0;

        });

        return total;

      }
    },


    /* المنتجات منخفضة المخزون */
    {
      id: "low-stock",

      short: "LOW",

      labelEn: "Low Stock Items",
      labelAr: "المنتجات منخفضة المخزون",

      fetch: async () => {

        /*
          يعتمد على الكمية المتاحة.
          نعتبر الكمية <= 0 منخفضة بشكل مباشر.
          ويمكن لاحقاً ربطها بمستوى إعادة الطلب لكل مستودع.
        */

        const rows =
          await getStockBalance();

        const lowItems =
          new Set();

        rows.forEach(row => {

          const qty =
            Number(
              row.bal_qty ??
              row.actual_qty ??
              0
            );

          if (
            row.item_code &&
            qty <= 0
          ) {

            lowItems.add(
              row.item_code
            );

          }

        });

        return lowItems.size;

      }
    },


    /* طلبات المواد المعلقة */
    {
      id: "pending-material-requests",

      short: "MR",

      labelEn: "Pending Material Requests",
      labelAr: "طلبات المواد المعلقة",

      fetch: () =>
        new Promise(resolve => {

          frappe.call({

            method: "frappe.client.get_count",

            args: {

              doctype: "Material Request",

              filters: {

                docstatus: 1,

                status: [
                  "in",
                  [
                    "Pending",
                    "Partially Ordered"
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
      doctype: "Material Request",

      labelEn: "New Material Request",
      labelAr: "طلب مواد جديد"
    },

    {
      doctype: "Stock Entry",
      stockEntryType: "Material Receipt",

      labelEn: "New Material Receipt",
      labelAr: "استلام مخزون جديد"
    },

    {
      doctype: "Stock Entry",
      stockEntryType: "Material Transfer",

      labelEn: "New Material Transfer",
      labelAr: "تحويل مخزون جديد"
    },

    {
      doctype: "Stock Reconciliation",

      labelEn: "New Stock Reconciliation",
      labelAr: "تسوية مخزون جديدة"
    }

  ];


  /* =========================================================
     6. FOOTER
  ========================================================= */

  const footerInfo = {

    phone: "0115110455",

    email: "sales@mubtkir.com",

    website: "www.mubtkir.com",

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
     7. SECTIONS
  ========================================================= */

  const sections = [

    [
      "Reports & Masters",

      [

        [
          "Stock Transactions",
          "📦",
          [
            "Material Request",
            "Stock Entry",
            "Stock Reconciliation",
            "Delivery Note",
            "Purchase Receipt"
          ]
        ],

        [
          "Items",
          "🏷️",
          [
            "Item",
            "Item Group",
            "Item Variant Settings",
            "Brand",
            "UOM"
          ]
        ],

        [
          "Warehouses",
          "🏢",
          [
            "Warehouse"
          ]
        ],

        [
          "Serial & Batch",
          "🔢",
          [
            "Serial No",
            "Batch"
          ]
        ],

        [
          "Pricing",
          "💰",
          [
            "Item Price",
            "Price List",
            "Pricing Rule"
          ]
        ],

        [
          "Settings",
          "⚙️",
          [
            "Stock Settings"
          ]
        ],

        [
          "Key Reports",
          "📊",
          [
            "Stock Balance",
            "Stock Ledger",
            "Stock Projected Qty",
            "Stock Ageing"
          ]
        ],

        [
          "Other Reports",
          "📋",
          [
            "Warehouse wise Stock Balance",
            "Item-wise Price List Rate",
            "Batch-Wise Balance History",
            "Stock Ledger Variance"
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

    "Stock Transactions":
      "حركات المخزون",

    "Items":
      "المنتجات",

    "Warehouses":
      "المستودعات",

    "Serial & Batch":
      "الأرقام التسلسلية والدفعات",

    "Pricing":
      "التسعير",

    "Settings":
      "الإعدادات",

    "Key Reports":
      "التقارير الرئيسية",

    "Other Reports":
      "تقارير أخرى",


    "Material Request":
      "طلب مواد",

    "Stock Entry":
      "قيد مخزني",

    "Stock Reconciliation":
      "تسوية المخزون",

    "Delivery Note":
      "إشعار تسليم",

    "Purchase Receipt":
      "إيصال شراء",


    "Item":
      "المنتج",

    "Item Group":
      "مجموعة المنتجات",

    "Item Variant Settings":
      "إعدادات متغيرات المنتجات",

    "Brand":
      "العلامة التجارية",

    "UOM":
      "وحدة القياس",


    "Warehouse":
      "المستودع",


    "Serial No":
      "الرقم التسلسلي",

    "Batch":
      "الدفعة",


    "Item Price":
      "سعر المنتج",

    "Price List":
      "قائمة الأسعار",

    "Pricing Rule":
      "قاعدة التسعير",


    "Stock Settings":
      "إعدادات المخزون",


    "Stock Balance":
      "رصيد المخزون",

    "Stock Ledger":
      "دفتر أستاذ المخزون",

    "Stock Projected Qty":
      "الكميات المتوقعة للمخزون",

    "Stock Ageing":
      "أعمار المخزون",

    "Warehouse wise Stock Balance":
      "رصيد المخزون حسب المستودع",

    "Item-wise Price List Rate":
      "قائمة الأسعار حسب المنتج",

    "Batch-Wise Balance History":
      "رصيد المخزون حسب الدفعة",

    "Stock Ledger Variance":
      "فروقات دفتر المخزون"

  };


  /* =========================================================
     9. ROUTE TYPES
  ========================================================= */

  const singleDocs =
    new Set([
      "Stock Settings",
      "Item Variant Settings"
    ]);


  const treeDocs =
    new Set([
      "Item Group",
      "Warehouse"
    ]);


  const reportNames =
    new Set([

      "Stock Balance",
      "Stock Ledger",
      "Stock Projected Qty",
      "Stock Ageing",

      "Warehouse wise Stock Balance",
      "Item-wise Price List Rate",
      "Batch-Wise Balance History",
      "Stock Ledger Variance"

    ]);


  /* =========================================================
     10. ITEM DESCRIPTIONS
  ========================================================= */

  const itemDescriptions = {

    "Material Request": {

      icon: "📋",

      summaryAr:
        "طلب المواد المطلوبة للشراء أو التحويل أو الصرف أو التصنيع.",

      summaryEn:
        "Request materials for purchase, transfer, issue, or manufacturing.",

      stepsAr: [

        "اضغط «طلب مواد جديد»",
        "اختر نوع الطلب",
        "حدد الشركة",
        "أضف المنتجات والكميات",
        "حدد المستودع",
        "حدد التاريخ المطلوب",
        "اضغط «حفظ» ثم «تسجيل»"

      ],

      stepsEn: [

        "Click «New Material Request»",
        "Select request type",
        "Select company",
        "Add items and quantities",
        "Set warehouse",
        "Set required date",
        "Click «Save» then «Submit»"

      ]

    },


    "Stock Entry": {

      icon: "📦",

      summaryAr:
        "تسجيل عمليات استلام أو صرف أو تحويل المواد بين المستودعات.",

      summaryEn:
        "Record material receipts, issues, and transfers between warehouses.",

      stepsAr: [

        "اضغط «حركة مخزون جديدة»",
        "اختر نوع الحركة",
        "حدد المستودع المصدر أو المستهدف",
        "أضف المنتجات والكميات",
        "أدخل القيمة عند الاستلام إذا لزم",
        "راجع البيانات",
        "اضغط «حفظ» ثم «تسجيل»"

      ],

      stepsEn: [

        "Click «New Stock Entry»",
        "Select stock entry type",
        "Set source or target warehouse",
        "Add items and quantities",
        "Enter valuation when required",
        "Review details",
        "Click «Save» then «Submit»"

      ]

    },


    "Stock Reconciliation": {

      icon: "⚖️",

      summaryAr:
        "مطابقة الكمية الفعلية في المستودع مع الكمية المسجلة في النظام وتسجيل الفروقات.",

      summaryEn:
        "Reconcile physical stock with system quantities and record differences.",

      stepsAr: [

        "اضغط «تسوية مخزون جديدة»",
        "حدد الشركة",
        "حدد تاريخ ووقت التسوية",
        "أضف المنتجات والمستودعات",
        "أدخل الكمية الفعلية",
        "راجع سعر التقييم",
        "اضغط «حفظ» ثم «تسجيل»"

      ],

      stepsEn: [

        "Click «New Stock Reconciliation»",
        "Select company",
        "Set posting date and time",
        "Add items and warehouses",
        "Enter physical quantity",
        "Review valuation rate",
        "Click «Save» then «Submit»"

      ]

    },


    "Item": {

      icon: "🏷️",

      summaryAr:
        "تعريف المنتج وخصائص المخزون ووحدة القياس والتسعير والتتبع.",

      summaryEn:
        "Define item details, inventory settings, UOM, pricing, and tracking.",

      stepsAr: [

        "اضغط «صنف جديد»",
        "أدخل رمز واسم المنتج",
        "اختر مجموعة المنتجات",
        "حدد وحدة القياس",
        "فعّل الاحتفاظ بالمخزون",
        "حدد إعدادات المستودع",
        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Click «New Item»",
        "Enter item code and name",
        "Select item group",
        "Set stock UOM",
        "Enable Maintain Stock",
        "Set inventory defaults",
        "Click «Save»"

      ]

    },


    "Warehouse": {

      icon: "🏢",

      summaryAr:
        "تعريف مستودعات الشركة وتنظيمها بشكل هرمي.",

      summaryEn:
        "Define and organize company warehouses in a hierarchical structure.",

      stepsAr: [

        "افتح «المستودعات»",
        "اختر المستودع الأب",
        "أضف مستودعاً جديداً",
        "حدد الشركة",
        "أدخل اسم المستودع",
        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Open «Warehouse»",
        "Select parent warehouse",
        "Add a new warehouse",
        "Select company",
        "Enter warehouse name",
        "Click «Save»"

      ]

    },


    "Serial No": {

      icon: "🔢",

      summaryAr:
        "متابعة كل وحدة مخزنية بواسطة رقم تسلسلي فريد.",

      summaryEn:
        "Track individual stock units using unique serial numbers.",

      stepsAr: [

        "فعّل الرقم التسلسلي في بطاقة المنتج",
        "حدد سلسلة الأرقام عند الحاجة",
        "استخدم المنتج في حركة المخزون",
        "سيتم تسجيل الرقم التسلسلي مع الحركة"

      ],

      stepsEn: [

        "Enable serial number tracking in Item",
        "Set serial number series if required",
        "Use the item in a stock transaction",
        "Serial numbers will be recorded with the transaction"

      ]

    },


    "Batch": {

      icon: "📦",

      summaryAr:
        "إدارة المنتجات حسب الدفعات وتواريخ الإنتاج والانتهاء.",

      summaryEn:
        "Manage inventory by batches with manufacturing and expiry dates.",

      stepsAr: [

        "فعّل تتبع الدفعات في المنتج",
        "حدد إعدادات إنشاء الدفعة",
        "أدخل تاريخ الانتهاء عند الحاجة",
        "استخدم رقم الدفعة في حركات المخزون"

      ],

      stepsEn: [

        "Enable batch tracking in Item",
        "Configure batch creation",
        "Set expiry date if required",
        "Use batch number in stock transactions"

      ]

    }

  };


  /* =========================================================
     11. HELPERS
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
    ).toLocaleString(
       "en-US",
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
      .querySelector("[data-modal-close]")
      ?.addEventListener(
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

          stepsContainer.classList.toggle(
            "is-shown"
          );

          toggleButton.textContent =
            stepsContainer.classList.contains(
              "is-shown"
            )
              ? hideText
              : showText;

        }

      );

    }

  }


  /* =========================================================
     13. ROUTING
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
     14. RENDER STOCK CYCLE
  ========================================================= */

  function renderStockCycle() {

    if (!stockCycle)
      return;


    const sectionTitle =
      isArabic
        ? "دورة المخزون"
        : "Stock Cycle";


    stockCycle.innerHTML = `

      <section class="erp-cycle-container">

        <h2 class="erp-section-title erp-cycle-title">
          ${escapeHtml(sectionTitle)}
        </h2>


        <div
          class="erp-cycle-grid"
          style="
            grid-template-columns:
            repeat(
              ${stockCycleCards.length},
              minmax(0, 1fr)
            );
          "
        >

          ${stockCycleCards

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
                  stockCycleCards.length - 1

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


    stockCycle.addEventListener(

      "click",

      event => {

        const element =
          event.target.closest(
            "[data-cycle-index]"
          );

        if (!element)
          return;


        const card =
          stockCycleCards[
            Number(
              element.dataset.cycleIndex
            )
          ];

        if (!card)
          return;


        if (
          card.doctype === "Stock Entry" &&
          card.stockEntryType
        ) {

          frappe.new_doc(
            "Stock Entry",
            {
              stock_entry_type:
                card.stockEntryType
            }
          );

          return;

        }


        openRoute(
          card.doctype
        );

      }

    );

  }


  /* =========================================================
     15. RENDER STATS
  ========================================================= */

  function renderStats() {

    if (!statsSection)
      return;


    statsSection.innerHTML = `

      <section class="erp-overview-container">

        <h2 class="erp-section-title">

          ${escapeHtml(
            isArabic
              ? "نظرة عامة"
              : "Overview"
          )}

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
                isArabic ? "ر.س" : "SAR"
              }`

            : formatNumber(value);

      });

    });

  }


  /* =========================================================
     16. QUICK ACTIONS
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


        const defaults = {};

        if (button.stockEntryType) {

          defaults.stock_entry_type =
            button.stockEntryType;

        }


        frappe.new_doc(
          button.doctype,
          defaults
        );

      }

    );

  }


  /* =========================================================
     17. SECTIONS
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
                                        ${isArabic ? "تفاصيل" : "Details"}
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
     18. FOOTER
  ========================================================= */

  function renderFooter() {

    if (!footerEl)
      return;


    footerEl.innerHTML = `

      <div class="erp-footer-inner">

        <div class="erp-footer-item">

          <span class="erp-footer-icon">☎</span>

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


        <span class="erp-footer-sep">|</span>


        <div class="erp-footer-item">

          <span class="erp-footer-icon">✉</span>

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


        <span class="erp-footer-sep">|</span>


        <div class="erp-footer-item">

          <span class="erp-footer-icon">◎</span>

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
          >
            ${footerInfo.website}
          </a>

        </div>

      </div>

    `;

  }


  /* =========================================================
     19. EVENTS
  ========================================================= */

  content.addEventListener(

    "click",

    event => {


      const infoButton =
        event.target.closest(
          "[data-info-item]"
        );


      if (infoButton) {

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

          }

        });


      selectedCard.classList.toggle(
        "is-open",
        shouldOpen
      );

  });


  /* =========================================================
     20. INIT
  ========================================================= */

  renderStockCycle();

  renderStats();

  renderQuickActions();

  renderSections();

  renderFooter();

})();