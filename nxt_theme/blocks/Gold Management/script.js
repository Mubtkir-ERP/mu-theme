(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة إدارة الذهب والمجوهرات — Gold Management Workspace
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
     ١. البطاقات الإحصائية (Statistics)
  ───────────────────────────────────────── */

  const statsCards = [
    {
      id: "gold-invoices",
      icon: "📜",
      labelEn: "Gold Invoices",
      labelAr: "فواتير الذهب",
      doctype: "Gold Workmanship Invoice",
      altDoctype: "Gold Invoice",
      filter: { docstatus: ["!=", 2] }
    },
    {
      id: "gold-receipts",
      icon: "📥",
      labelEn: "Gold Receipts",
      labelAr: "سندات استلام الذهب",
      doctype: "Gold Receipt",
      filter: { docstatus: ["!=", 2] }
    },
    {
      id: "gold-payments",
      icon: "💳",
      labelEn: "Payments",
      labelAr: "سندات القبض والصرف",
      doctype: "Payment Entry",
      filter: { docstatus: 1 }
    },
    {
      id: "gold-ledger",
      icon: "⚖️",
      labelEn: "Ledger Entries",
      labelAr: "قيود أستاذ الذهب",
      doctype: "Gold Customer Ledger",
      filter: {}
    }
  ];

  /* ─────────────────────────────────────────
     ٢. أزرار الوصول السريع (Daily Operations & Shortcuts)
  ───────────────────────────────────────── */

  const quickActionButtons = [
    {
      labelEn: "Gold Invoice",
      labelAr: "فاتورة الذهب",
      doctype: "Gold Workmanship Invoice",
      altDoctype: "Gold Invoice",
      hasCount: true,
      suffixEn: "Open",
      suffixAr: "مفتوح"
    },
    {
      labelEn: "Gold Receipt",
      labelAr: "سند استلام ذهب",
      doctype: "Gold Receipt",
      hasCount: true,
      suffixEn: "Receipts",
      suffixAr: "سند"
    },
    {
      labelEn: "Payment Voucher",
      labelAr: "سند قبض / دفع",
      doctype: "Payment Entry",
      hasCount: true,
      suffixEn: "Payments",
      suffixAr: "مدفوعات"
    },
    {
      labelEn: "Gold Ledger",
      labelAr: "أستاذ عملاء الذهب",
      doctype: "Gold Customer Ledger",
      hasCount: true,
      suffixEn: "Entries",
      suffixAr: "سجل"
    },
    {
      labelEn: "Gold Customer Statement",
      labelAr: "كشف حساب عميل الذهب",
      isReport: true,
      report: "Gold Customer Statement"
    },
    {
      labelEn: "Stock by Carat",
      labelAr: "المخزون حسب العيار",
      isReport: true,
      report: "Stock By Carat"
    }
  ];

  /* ─────────────────────────────────────────
     ٣. هيكل الأقسام (مطابق تماماً للصورة)
  ───────────────────────────────────────── */

  const sections = [
    [
      "Masters & Settings",
      [
        [
          "Gold Operations",
          "🪙",
          [
            "Gold Workmanship Invoice",
            "Gold Receipt",
            "Payment Entry",
            "Gold Customer Ledger"
          ]
        ],
        [
          "Gold References",
          "📑",
          [
            "Customer",
            "Item",
            "Warehouse",
            "Journal Entry",
            "Stock Entry"
          ]
        ]
      ]
    ],
    [
      "Reports",
      [
        [
          "Gold Reports",
          "📊",
          [
            "Gold Customer Statement",
            "Comprehensive Customer Statement",
            "Stock By Carat",
            "Gold At Customers",
            "Gold Reconciliation"
          ]
        ]
      ]
    ]
  ];

  /* ─────────────────────────────────────────
     ٤. تصنيف المسارات والتقارير
  ───────────────────────────────────────── */

  const reportNames = new Set([
    "Gold Customer Statement",
    "Comprehensive Customer Statement",
    "Comprehensive Statement",
    "Stock by Carat",
    "Stock By Carat",
    "Gold At Customers",
    "Gold Reconciliation"
  ]);

  const singleDocs = new Set([]);
  const treeDocs = new Set(["Warehouse"]);

  const customRoutes = {
    "Comprehensive Statement": "query-report/Comprehensive Customer Statement",
    "Comprehensive Customer Statement": "query-report/Comprehensive Customer Statement",
    "Stock by Carat": "query-report/Stock By Carat",
    "Stock By Carat": "query-report/Stock By Carat",
    "Gold Customer Statement": "query-report/Gold Customer Statement",
    "Gold At Customers": "query-report/Gold At Customers",
    "Gold Reconciliation": "query-report/Gold Reconciliation"
  };

  /* ─────────────────────────────────────────
     ٥. قاموس الترجمة العربية
  ───────────────────────────────────────── */

  const arabicFallback = {
    "Masters & Settings": "البيانات الأساسية والإعدادات",
    "Reports": "التقارير",
    "Statistics": "الإحصائيات",
    "Quick Actions": "الاختصارات السريعة",
    "Daily Operations": "العمليات اليومية",
    "Reports & Analysis": "التقارير والتحليلات",
    "Documents & Masters": "المستندات والبيانات الأساسية",

    "Gold Operations": "عمليات الذهب",
    "Gold Reports": "تقارير الذهب",
    "Gold References": "المراجع والبيانات الأساسية",

    "Gold Workmanship Invoice": "فاتورة مصنعية الذهب",
    "Gold Invoice": "فاتورة الذهب",
    "Gold Receipt": "سند استلام ذهب",
    "Payment Entry": "سند قبض وصرف",
    "Payment Voucher": "سند صرف / قبض",
    "Gold Customer Ledger": "دفتر أستاذ عملاء الذهب",
    "Gold Ledger": "أستاذ الذهب",

    "Gold Customer Statement": "كشف حساب عميل الذهب",
    "Comprehensive Statement": "كشف الحساب الشامل",
    "Comprehensive Customer Statement": "كشف الحساب الشامل للعملاء",
    "Stock by Carat": "المخزون حسب العيار",
    "Stock By Carat": "المخزون حسب العيار",
    "Gold At Customers": "الذهب لدى العملاء",
    "Gold Reconciliation": "مطابقة وتسوية الذهب",

    "Customer": "العملاء",
    "Item": "الأصناف والمصوغات",
    "Warehouse": "المستودعات والخزائن",
    "Journal Entry": "قيود اليومية",
    "Stock Entry": "حركات المخزون"
  };

  /* ─────────────────────────────────────────
     ٦. شروحات وتفاصيل الشاشات مع خطوات العمل
  ───────────────────────────────────────── */

  const itemDescriptions = {
    "Gold Workmanship Invoice": {
      icon: "📜",
      summaryAr: "إصدار وإدارة فواتير مبيعات الذهب والمصوغات مع احتساب وزن الذهب الصافي وتكلفة المصنعية وضريبة القيمة المضافة.",
      summaryEn: "Issue and manage gold sales invoices calculating net gold weight, workmanship fee, and VAT.",
      stepsAr: [
        "الضغط على «جديد» لفتح فاتورة مصنعية ذهب جديدة",
        "تحديد العميل وتاريخ الفاتورة والفرع أو الخزينة",
        "إدراج أصناف المصوغات مع تحديد العيار والوزن الإجمالي والصافي وقيمة المصنعية",
        "مراجعة إجمالي الذهب بالجرام والمبلغ النقدي المستحق والضريبة",
        "حفظ الفاتورة ثم الضغط على «تسجيل / اعتماد» لترحيل القيد المالي والمخزني"
      ],
      stepsEn: [
        "Click «New» to create a Gold Workmanship Invoice",
        "Select customer, posting date, and branch or warehouse",
        "Add jewelry items specifying carat, gross/net weight, and workmanship rate",
        "Review total gold weight in grams, monetary value, and VAT",
        "Save and Submit to post financial and stock ledger entries"
      ]
    },
    "Gold Receipt": {
      icon: "📥",
      summaryAr: "تسجيل سندات استلام الذهب الكسر أو المسلم من العملاء والموردين لإثبات حركة أوزان الذهب بالأعيرة.",
      summaryEn: "Record gold receipts for scrap or bullion received from customers or suppliers by carat.",
      stepsAr: [
        "فتح سند استلام ذهب جديد وتحديد الطرف (عميل أو مورد)",
        "تحديد المستودع أو الخزينة المستلمة للذهب",
        "إدخال تفاصيل الذهب المستلم (العيار، الوزن الإجمالي، ونسبة الشوائب إن وجدت)",
        "احتساب الوزن المعادل للذهب الخالص (عيار 24)",
        "حفظ واعتماد السند لتحديث رصيد الذهب لدى العميل وفي الخزينة"
      ],
      stepsEn: [
        "Open a new Gold Receipt and specify customer or supplier",
        "Select target warehouse or safe holding the gold",
        "Enter gold details including carat, gross weight, and purity test",
        "Calculate pure gold 24k weight equivalent",
        "Save and Submit to update customer ledger and safe inventory"
      ]
    },
    "Payment Entry": {
      icon: "💳",
      summaryAr: "إثبات المقبوضات والمدفوعات النقدية والبنكية المرتبطة بفواتير مصنعية الذهب وسندات القبض.",
      summaryEn: "Record cash and bank payments or collections against gold invoices and customer accounts.",
      stepsAr: [
        "تحديد نوع السند (قبض من عميل، دفع لمورد، أو تحويل مالي داخلي)",
        "اختيار الحساب المالي (صندوق نقدية أو حساب بنكي) وحساب الطرف الثاني",
        "إدخال المبلغ المسدد مع تحديد طريقة الدفع (نقدي، تحويل، مدى)",
        "تخصيص المبلغ على فواتير الذهب المفتوحة المرتبطة",
        "حفظ واعتماد السند لتسوية الذمم المالية"
      ],
      stepsEn: [
        "Select payment type (Receive from Customer, Pay to Supplier, or Transfer)",
        "Choose paid to/from cash box or bank account and party account",
        "Enter payment amount and payment mode (Cash, Bank, POS)",
        "Allocate paid amount against outstanding gold invoices",
        "Save and Submit to reconcile customer balances"
      ]
    },
    "Gold Customer Ledger": {
      icon: "⚖️",
      summaryAr: "استعراض دفتر أستاذ عملاء الذهب لمتابعة الأرصدة المزدوجة (رصيد ذهب بالجرام + رصيد مالي بالريال).",
      summaryEn: "Review gold customer ledger tracking dual balances: gold weight in grams and monetary value.",
      stepsAr: [
        "اختيار حساب العميل وتحديد الفترة الزمنية المطلوبة",
        "استعراض حركات تسليم واستلام الذهب وحركات الفواتير والمصنعيات",
        "تدقيق رصيد الذهب القائم بكل عيار (عيار 18، 21، 24)",
        "تدقيق الرصيد النقدي المدين والدائن وصافي المستحق",
        "تصدير الكشف أو طباعته للمطابقة الدورية مع العميل"
      ],
      stepsEn: [
        "Select customer account and desired date range",
        "Review debit/credit movements for gold weight and cash transactions",
        "Audit outstanding gold balance by carat (18k, 21k, 24k)",
        "Audit financial receivable/payable balances",
        "Export or print ledger statement for periodic reconciliation"
      ]
    },
    "Customer": {
      icon: "👤",
      summaryAr: "دليل عملاء الذهب والمجوهرات وتحديد البيانات الضريبية وحدود الائتمان للأوزان والمبالغ النقدية.",
      summaryEn: "Customer directory for gold clients setting tax details and credit limits in weight and currency.",
      stepsAr: [
        "الضغط على «عميل جديد» وإدخال الاسم التجاري أو الشخصي",
        "تحديد نوع العميل (تاجر جملة، تجزئة، ورشة تصنيع)",
        "إدخال الرقم الضريبي وبيانات العنوان والتواصل",
        "تحديد سقف الائتمان المسموح به بالجرام وبالريال",
        "حفظ السجل لربطه بجميع حركات فواتير وسندات الذهب"
      ],
      stepsEn: [
        "Click «New Customer» and input trade or personal name",
        "Select customer group (Wholesale, Retail, Workshop)",
        "Enter VAT registration number, address, and contact info",
        "Set allowed credit limit for gold weight and cash",
        "Save customer to enable gold sales and receipts"
      ]
    },
    "Item": {
      icon: "💍",
      summaryAr: "كتالوج المصوغات والأصناف الذهبية والمجوهرات مع تحديد العيارات والأوزان ونوع المصنعية.",
      summaryEn: "Catalog of jewelry, bullion, and gold items specifying carats, weights, and workmanship types.",
      stepsAr: [
        "إنشاء صنف جديد وتحديد اسم القطعة أو الطقم أو السبيكة",
        "اختيار مجموعة الصنف ووحدة القياس (جرام)",
        "تحديد عيار الذهب (18، 21، 22، 24) وتصنيف الصنف",
        "تعيين تكلفة المصنعية الافتراضية وسعر البيع للجرام",
        "حفظ الصنف لإتاحته في المخازن ونقاط البيع"
      ],
      stepsEn: [
        "Create new item and enter jewelry, bullion, or set name",
        "Choose item group and unit of measure (Gram)",
        "Select gold carat (18k, 21k, 22k, 24k) and item classification",
        "Set default workmanship rate and sales price per gram",
        "Save item to make it available in stock and sales"
      ]
    },
    "Warehouse": {
      icon: "🏛️",
      summaryAr: "إدارة الخزائن والمستودعات الآمنة لحفظ الذهب والمجوهرات ومتابعة جرد الأوزان داخل كل خزينة.",
      summaryEn: "Manage secure vaults, safes, and warehouses monitoring gold weight inventory per location.",
      stepsAr: [
        "إنشاء خزينة أو مستودع جديد (مثل: خزينة الفرع الرئيسي، مستودع الورشة)",
        "ربط الخزينة بالشركة والفرع المناسب",
        "تحديد الحساب المالي المرتبط بمخزون الخزينة في شجرة الحسابات",
        "حفظ الخزينة لبدء تحويل واستلام الذهب عليها"
      ],
      stepsEn: [
        "Create a new safe or warehouse (e.g. Main Safe, Workshop Vault)",
        "Link warehouse to corresponding company and branch",
        "Assign linked stock account in chart of accounts",
        "Save warehouse to begin gold transfers and storage"
      ]
    },
    "Journal Entry": {
      icon: "📖",
      summaryAr: "تسجيل القيود المحاسبية اليدوية للتسويات الرأسمالية وفروقات أسعار الذهب والضرائب والعمولات.",
      summaryEn: "Post manual journal entries for revaluation, gold price differences, fees, and tax settlements.",
      stepsAr: [
        "اختيار نوع القيد وتحديد تاريخ الاستحقاق",
        "إضافة الحسابات المدينة والدائنة مع المبالغ بالريال",
        "كتابة الشرح الوافي للعملية المحاسبية ومرفقاتها",
        "حفظ واعتماد القيد لترحيل الأثر المالي فوراً"
      ],
      stepsEn: [
        "Select entry type and posting date",
        "Add debit and credit accounts with exact amounts",
        "Add clear remarks and attach supporting documents",
        "Save and Submit to post GL entries immediately"
      ]
    },
    "Stock Entry": {
      icon: "📦",
      summaryAr: "تسجيل حركات مناقلة الذهب بين الخزائن والفروع أو إدخال رصيد أول المدة والتشغيل والكسر.",
      summaryEn: "Transfer gold stock between branches/safes, opening stock, manufacturing scrap, and adjustments.",
      stepsAr: [
        "تحديد الغرض من السند (تحويل بين خزائن، استلام تشغيل، تسوية مخزنية)",
        "تحديد الخزينة المصدر والخزينة الوجهة",
        "إدراج أصناف الذهب والأعيرة والوزن بالجرام بدقة",
        "مراجعة إجمالي الأوزان والتأكد من مطابقتها للجرد الميداني",
        "حفظ واعتماد السند لتحديث كميات الخزائن آلياً"
      ],
      stepsEn: [
        "Select entry purpose (Material Transfer, Manufacture, Reconciliation)",
        "Specify source safe and target safe",
        "Add gold items, carat specifications, and gram weights accurately",
        "Verify total weights against physical balance",
        "Save and Submit to update safe inventories"
      ]
    }
  };

  /* ─────────────────────────────────────────
     ٧. أدوات مساعدة
  ───────────────────────────────────────── */

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function translate(key) {
    if (!key) return "";
    if (isArabic && arabicFallback[key]) return arabicFallback[key];
    if (window.frappe?._) {
      const translated = window.frappe._(key);
      if (translated && translated !== key) return translated;
    }
    return key;
  }

  function formatNumber(value) {
    const num = parseFloat(value) || 0;
    return num.toLocaleString("en-US");
  }

  function openRoute(itemName) {
    if (!window.frappe) return;
    if (customRoutes[itemName]) {
      const target = customRoutes[itemName];
      if (target.startsWith("query-report/")) {
        frappe.set_route("query-report", target.replace("query-report/", ""));
      } else {
        frappe.set_route(...target.split("/"));
      }
      return;
    }
    if (reportNames.has(itemName)) {
      frappe.set_route("query-report", itemName);
      return;
    }
    if (treeDocs.has(itemName)) {
      frappe.set_route("Tree", itemName);
      return;
    }
    if (singleDocs.has(itemName)) {
      frappe.set_route("Form", itemName);
      return;
    }
    frappe.set_route("List", itemName);
  }

  /* ─────────────────────────────────────────
     ٨. نافذة الشرح والتفاصيل المنبثقة القياسية
  ───────────────────────────────────────── */

  function showInfoModal(itemName) {
    const desc = itemDescriptions[itemName];
    const title = translate(itemName);
    const summary = desc
      ? (isArabic ? desc.summaryAr : desc.summaryEn)
      : (isArabic ? "تفاصيل الشاشة وإجراءات العمل المعتمدة." : "Screen details and procedures.");

    const steps = desc
      ? (isArabic ? desc.stepsAr : desc.stepsEn)
      : (isArabic
          ? [
              "فتح الشاشة من قائمة العمليات",
              "إدخال البيانات والمواصفات المطلوبة",
              "حفظ واعتماد السجل لترحيل القيود"
            ]
          : [
              "Open screen from operations list",
              "Enter required specifications and details",
              "Save and submit record"
            ]);

    const existing = root.querySelector(".erp-modal-overlay") || document.querySelector(".erp-modal-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.className = "erp-modal-overlay";
    overlay.setAttribute("dir", isArabic ? "rtl" : "ltr");

    const launchLabel = isArabic ? "فتح الشاشة" : "Open Screen";

    overlay.innerHTML = `
      <div class="erp-modal-box">
        <button type="button" class="erp-modal-close" data-modal-close aria-label="${isArabic ? "إغلاق" : "Close"}">✕</button>
        <div class="erp-modal-header">
          <span class="erp-modal-icon">${desc?.icon || "🪙"}</span>
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
            <span class="erp-quick-label">${escapeHtml(launchLabel)}</span>
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
     ٩. إنشاء بطاقات الإحصائيات (القسم ١)
  ───────────────────────────────────────── */

  function renderStats() {
    if (!statsSection) return;

    const title = isArabic ? "الإحصائيات" : "Statistics";

    statsSection.innerHTML = `
      <h2 class="erp-section-title">${escapeHtml(title)}</h2>
      <div class="erp-stats-grid">
        ${statsCards.map(card => {
          const label = isArabic ? card.labelAr : card.labelEn;
          return `
            <div class="erp-stat-card">
              <div class="erp-stat-icon">${card.icon}</div>
              <div class="erp-stat-info">
                <span class="erp-stat-value" data-stat-id="${card.id}">...</span>
                <span class="erp-stat-label">${escapeHtml(label)}</span>
              </div>
            </div>`;
        }).join("")}
      </div>
    `;

    if (!window.frappe) return;

    statsCards.forEach(card => {
      const doctypeToCount = card.doctype;
      frappe.call({
        method: "frappe.client.get_count",
        args: {
          doctype: doctypeToCount,
          filters: card.filter || {}
        },
        callback: r => {
          const el = statsSection.querySelector(`[data-stat-id="${card.id}"]`);
          if (el) el.textContent = formatNumber(r.message || 0);
        },
        error: () => {
          if (card.altDoctype) {
            frappe.call({
              method: "frappe.client.get_count",
              args: { doctype: card.altDoctype, filters: card.filter || {} },
              callback: r2 => {
                const el = statsSection.querySelector(`[data-stat-id="${card.id}"]`);
                if (el) el.textContent = formatNumber(r2.message || 0);
              },
              error: () => {
                const el = statsSection.querySelector(`[data-stat-id="${card.id}"]`);
                if (el) el.textContent = "0";
              }
            });
          } else {
            const el = statsSection.querySelector(`[data-stat-id="${card.id}"]`);
            if (el) el.textContent = "0";
          }
        }
      });
    });
  }

  /* ─────────────────────────────────────────
     ١٠. إنشاء أزرار الوصول السريع (القسم ٢)
  ───────────────────────────────────────── */

  function renderQuickActions() {
    if (!quickActions) return;

    const title = isArabic ? "الاختصارات السريعة" : "Quick Actions";

    quickActions.innerHTML = `
      <h2 class="erp-section-title">${escapeHtml(title)}</h2>
      <div class="erp-quick-grid">
        ${quickActionButtons.map((btn, idx) => {
          const label = isArabic ? btn.labelAr : btn.labelEn;
          return `
            <button
              type="button"
              class="erp-quick-btn"
              data-shortcut-idx="${idx}"
              style="display: flex; align-items: center; justify-content: space-between; padding: 12px 18px;"
            >
              <span class="erp-quick-label" style="display: flex; align-items: center; gap: 8px;">
                <span>${escapeHtml(label)}</span>
                <span class="erp-link-arrow" aria-hidden="true" style="font-size: 11px; opacity: 0.7;">↗</span>
              </span>
              ${btn.hasCount ? `<span class="erp-stat-badge" data-badge-idx="${idx}" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: rgba(202, 138, 4, 0.15); color: #ca8a04;">...</span>` : ""}
            </button>`;
        }).join("")}
      </div>
    `;

    quickActionButtons.forEach((btn, idx) => {
      if (btn.hasCount && btn.doctype && window.frappe) {
        frappe.call({
          method: "frappe.client.get_count",
          args: { doctype: btn.doctype },
          callback: r => {
            const el = quickActions.querySelector(`[data-badge-idx="${idx}"]`);
            if (el) {
              const val = r.message || 0;
              const sfx = isArabic ? (btn.suffixAr || "") : (btn.suffixEn || "");
              el.textContent = sfx ? `${formatNumber(val)} ${sfx}` : formatNumber(val);
            }
          },
          error: () => {
            if (btn.altDoctype) {
              frappe.call({
                method: "frappe.client.get_count",
                args: { doctype: btn.altDoctype },
                callback: r2 => {
                  const el = quickActions.querySelector(`[data-badge-idx="${idx}"]`);
                  if (el) {
                    const val = r2.message || 0;
                    const sfx = isArabic ? (btn.suffixAr || "") : (btn.suffixEn || "");
                    el.textContent = sfx ? `${formatNumber(val)} ${sfx}` : formatNumber(val);
                  }
                },
                error: () => {
                  const el = quickActions.querySelector(`[data-badge-idx="${idx}"]`);
                  if (el) el.textContent = "0";
                }
              });
            } else {
              const el = quickActions.querySelector(`[data-badge-idx="${idx}"]`);
              if (el) el.textContent = "0";
            }
          }
        });
      }
    });

    quickActions.addEventListener("click", event => {
      const btnEl = event.target.closest("[data-shortcut-idx]");
      if (!btnEl || !window.frappe) return;
      const idx = Number(btnEl.dataset.shortcutIdx);
      const item = quickActionButtons[idx];
      if (!item) return;

      if (item.isReport && item.report) {
        frappe.set_route("query-report", item.report);
        return;
      }
      if (item.doctype) {
        openRoute(item.doctype);
      }
    });
  }

  /* ─────────────────────────────────────────
     ١١. إنشاء بطاقات الأقسام (الأقسام ٣ و ٤)
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
              const isReport = reportNames.has(itemName);
              const detailsLabel = isArabic ? "تفاصيل" : "Details";
              const infoBtn = (!isReport && desc)
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

    content.addEventListener("click", event => {
      const infoBtn = event.target.closest("[data-info-item]");
      if (infoBtn) {
        event.preventDefault();
        event.stopPropagation();
        showInfoModal(infoBtn.dataset.infoItem);
        return;
      }

      const linkBtn = event.target.closest("[data-route-name]");
      if (linkBtn) {
        event.preventDefault();
        openRoute(linkBtn.dataset.routeName);
      }
    });
  }

  /* ─────────────────────────────────────────
     ١٢. الفوتر
  ───────────────────────────────────────── */

  const footerInfo = {
    phone: "+966126810486",
    email: "sales@mubtkir.com",
    website: "www.mubtkir.com"
  };

  function renderFooter() {
    if (!footerEl) return;
    const phoneLabel = isArabic ? "الهاتف الموحد" : "Support Phone";
    const emailLabel = isArabic ? "البريد الإلكتروني" : "Email Support";
    const websiteLabel = isArabic ? "الموقع الإلكتروني" : "Official Website";

    footerEl.innerHTML = `
      <div class="erp-footer-inner">
        <div class="erp-footer-col">
          <span class="erp-footer-icon">📞</span>
          <span class="erp-footer-label">${escapeHtml(phoneLabel)}:</span>
          <a href="tel:${footerInfo.phone}" class="erp-footer-value" dir="ltr">${escapeHtml(footerInfo.phone)}</a>
        </div>
        <div class="erp-footer-col">
          <span class="erp-footer-icon">✉️</span>
          <span class="erp-footer-label">${escapeHtml(emailLabel)}:</span>
          <a href="mailto:${footerInfo.email}" class="erp-footer-value">${escapeHtml(footerInfo.email)}</a>
        </div>
        <div class="erp-footer-col">
          <span class="erp-footer-icon">🌐</span>
          <span class="erp-footer-label">${escapeHtml(websiteLabel)}:</span>
          <a href="https://${footerInfo.website}" target="_blank" rel="noopener noreferrer" class="erp-footer-value">${escapeHtml(footerInfo.website)}</a>
        </div>
      </div>
    `;
  }

  /* ─────────────────────────────────────────
     التشغيل المبدئي
  ───────────────────────────────────────── */
  renderStats();
  renderQuickActions();
  renderSections();
  renderFooter();

})();

