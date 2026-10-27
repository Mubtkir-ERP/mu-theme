(() => {
  /* =========================================================
     MUBTKIR ERP — POSNEXT WORKSPACE
     لوحة تحكم نقاط البيع الموحدة
     Aligned strictly with Mubtkir Brand Identity & posnext.json
  ========================================================= */

  const root = root_element.querySelector("[data-erp-dashboard]");
  const cycleSection = root_element.querySelector("[data-purchase-cycle]");
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

  const isArabic = String(langValue).toLowerCase().startsWith("ar");

  root.setAttribute("dir", isArabic ? "rtl" : "ltr");
  root.classList.toggle("erp-dashboard-rtl", isArabic);

  /* =========================================================
     2. HELPERS
  ========================================================= */
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatNumber(value) {
    const num = parseFloat(value) || 0;
    return num.toLocaleString("en-US");
  }

  function formatCurrency(value) {
    const num = parseFloat(value) || 0;
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function today() {
    try {
      if (window.frappe?.datetime?.get_today) {
        return window.frappe.datetime.get_today();
      }
    } catch (e) {}
    return new Date().toISOString().slice(0, 10);
  }

  function safeCount(doctype, filters) {
    return new Promise(resolve => {
      try {
        if (!window.frappe?.call) {
          resolve(0);
          return;
        }
        frappe.call({
          method: "frappe.client.get_count",
          args: { doctype, filters: filters || {} },
          async: true,
          callback: r => resolve(r?.message || 0),
          error: () => resolve(0)
        });
      } catch (e) {
        resolve(0);
      }
    });
  }

  function openPOS() {
    window.location.href = "/pos/";
  }

  function openRoute(name) {
    if (!name) return;
    if (name === "Start POS" || name === "/pos/") {
      openPOS();
      return;
    }
    try {
      if (reportNames.has(name)) {
        frappe.set_route("query-report", name);
        return;
      }
      if (treeDocs.has(name)) {
        frappe.set_route("Tree", name);
        return;
      }
      if (singleDocs.has(name)) {
        frappe.set_route("Form", name);
        return;
      }
      frappe.set_route("List", name);
    } catch (e) {
      console.error("POSNext Route Error:", name, e);
    }
  }

  function newDoc(doctype) {
    try {
      if (window.frappe?.new_doc) {
        frappe.new_doc(doctype);
      }
    } catch (e) {
      console.error("POSNext New Doc Error:", doctype, e);
    }
  }

  /* =========================================================
     3. TRANSLATIONS DICTIONARY
  ========================================================= */
  const arabicFallback = {
    // Headers & Labels
    "Your Shortcuts": "اختصاراتك",
    "Start POS": "بدء نقطة البيع",
    "Item": "المنتجات والمنتجات",
    "Pos Settings": "إعدادات نقاط البيع",
    "Pos Profile": "ملف نقطة البيع",
    "Pos Opening Shift": "فتح وردية نقطة البيع",
    "Pos Closing Shift": "إغلاق وردية نقطة البيع",
    "Pos Offer": "عروض نقاط البيع",
    "Pos Coupon": "قسائم نقاط البيع",
    "Voucher Balance": "رصيد القسائم مسبقة الدفع",
    "Reports & Settings": "الإعدادات والتقارير",
    "Settings & Reports": "الإعدادات والتقارير",
    "Operations & POS": "العمليات ونقاط البيع",
    "Point of Sale": "نقاط البيع",

    // Card Titles
    "Reports": "التقارير",
    "Configuration": "الإعدادات والتكوين",
    "Shift Management": "إدارة الورديات",
    "Offers & Coupons": "العروض والقسائم الترويجية",
    "Items": "المنتجات والمنتجات",
    "Items & Products": "المنتجات والمنتجات",
    "Vouchers": "القسائم مسبقة الدفع",
    "Prepaid Vouchers": "القسائم مسبقة الدفع",

    // Links / Items
    "Sales vs Shifts Report": "تقرير المبيعات مقابل الورديات",
    "Cashier Performance Report": "تقرير أداء الكاشير",
    "Payments and Cash Control Report": "تقرير المدفوعات والرقابة النقدية",
    "Inventory Impact and Fast Movers Report": "تقرير أثر المخزون والمنتجات سريعة الحركة",
    "Offline Sync and System Health Report": "تقرير المزامنة وصحة النظام",
    "POS Settings": "إعدادات نقاط البيع",
    "POS Profile": "ملف نقطة البيع",
    "POS Opening Shift": "فتح وردية نقطة البيع",
    "POS Closing Shift": "إغلاق وردية نقطة البيع",
    "POS Offer": "عروض نقاط البيع",
    "POS Coupon": "قسائم نقاط البيع",
    "Prepaid Voucher Report": "تقرير القسائم مسبقة الدفع",
    "Prepaid Voucher Balance": "رصيد القسائم مسبقة الدفع",
    "Prepaid Voucher Transaction": "حركات القسائم مسبقة الدفع",
    "POS Invoice": "فاتورة نقطة البيع"
  };

  function translate(key) {
    if (!isArabic) return key;
    return arabicFallback[key] || key;
  }

  /* =========================================================
     4. ROUTE CLASSIFICATION
  ========================================================= */
  const reportNames = new Set([
    "Sales vs Shifts Report",
    "Cashier Performance Report",
    "Payments and Cash Control Report",
    "Inventory Impact and Fast Movers Report",
    "Offline Sync and System Health Report",
    "Prepaid Voucher Report"
  ]);

  const singleDocs = new Set([
    "POS Settings"
  ]);

  const treeDocs = new Set([
    "Item Group"
  ]);

  /* =========================================================
     5. DETAILS BUTTON RULE
     الشرط الإلزامي: زر تفاصيل لكل الشاشات بدون استثناء
     ولكن الإعدادات والتقارير ممنوع وضع زر تفاصيل لها
  ========================================================= */
  function hasDetailsButton(cardTitle, itemName) {
    if (reportNames.has(itemName)) return false;
    if (singleDocs.has(itemName)) return false;
    if (/report|تقارير|تقرير/i.test(cardTitle) || /report|تقرير/i.test(itemName)) return false;
    if (/setting|config|إعداد|اعداد|تكوين/i.test(cardTitle) || /setting|إعداد|اعداد/i.test(itemName)) return false;
    return true;
  }

  /* =========================================================
     6. POS CYCLE (دورة نقاط البيع)
  ========================================================= */
  const cycleCards = [
    {
      step: 1,
      action: "new",
      doctype: "POS Opening Shift",
      labelAr: "فتح الوردية",
      labelEn: "Open Shift",
      descAr: "فتح وردية جديدة وتسجيل العهدة النقدية الافتتاحية وتعيين الكاشير.",
      descEn: "Open a new shift, record opening cash float, and assign cashier."
    },
    {
      step: 2,
      action: "pos",
      labelAr: "بدء البيع",
      labelEn: "Start POS",
      descAr: "تشغيل واجهة كاشير POS Next الحديثة وإصدار فواتير المبيعات فورياً.",
      descEn: "Launch modern POS Next cashier screen and conduct transactions."
    },
    {
      step: 3,
      action: "route",
      doctype: "Prepaid Voucher Balance",
      labelAr: "القسائم مسبقة الدفع",
      labelEn: "Prepaid Vouchers",
      descAr: "إدارة واستبدال أرصدة القسائم مسبقة الدفع وربطها بالفروع.",
      descEn: "Track, manage, and redeem customer prepaid voucher balances."
    },
    {
      step: 4,
      action: "new",
      doctype: "POS Closing Shift",
      labelAr: "إغلاق الوردية",
      labelEn: "Close Shift",
      descAr: "جرد النقدية ومطابقة المبيعات والمدفوعات وإغلاق الوردية الحالية.",
      descEn: "Count cash, reconcile shift sales and payment modes, and close shift."
    },
    {
      step: 5,
      action: "report",
      report: "Sales vs Shifts Report",
      labelAr: "تقارير الورديات",
      labelEn: "Shift Reports",
      descAr: "مراجعة وتحليل تقرير المبيعات مقابل الورديات والرقابة النقدية.",
      descEn: "Review sales performance across shifts and cash controls."
    }
  ];

  /* =========================================================
     7. OVERVIEW / STATS (نظرة عامة — 4 بطاقات)
     سحب الأرقام من فواتير نقاط البيع ودفتر الأستاذ والرصيد الفعلي
  ========================================================= */
  let invoiceCache = null;
  function loadTodayPOSInvoices() {
    if (!invoiceCache) {
      invoiceCache = new Promise(resolve => {
        try {
          if (!window.frappe?.call) {
            resolve([]);
            return;
          }
          frappe.call({
            method: "frappe.client.get_list",
            args: {
              doctype: "POS Invoice",
              fields: ["name", "grand_total", "is_return"],
              filters: {
                docstatus: 1,
                posting_date: today()
              },
              limit_page_length: 1000
            },
            async: true,
            callback: r => resolve(r?.message || []),
            error: () => resolve([])
          });
        } catch (e) {
          resolve([]);
        }
      });
    }
    return invoiceCache;
  }

  const statsCards = [
    {
      id: "today-sales",
      short: "SAR",
      labelAr: "مبيعات اليوم",
      labelEn: "Today's Sales",
      currency: true,
      fetch: async () => {
        const rows = await loadTodayPOSInvoices();
        let total = 0;
        rows.forEach(r => {
          if (Number(r.is_return || 0) !== 1) {
            total += Number(r.grand_total || 0);
          }
        });
        return total;
      }
    },
    {
      id: "today-invoices",
      short: "INV",
      labelAr: "فواتير اليوم",
      labelEn: "Today's Invoices",
      fetch: async () => {
        const rows = await loadTodayPOSInvoices();
        let count = 0;
        rows.forEach(r => {
          if (Number(r.is_return || 0) !== 1) count++;
        });
        return count;
      }
    },
    {
      id: "open-shifts",
      short: "SHIFT",
      labelAr: "الورديات المفتوحة",
      labelEn: "Open Shifts",
      fetch: () => safeCount("POS Opening Shift", { docstatus: 1, status: "Open" })
    },
    {
      id: "active-vouchers",
      short: "VOUCHER",
      labelAr: "القسائم النشطة",
      labelEn: "Active Vouchers",
      fetch: () => safeCount("Prepaid Voucher Balance", { current_balance: [">", 0] })
    }
  ];

  /* =========================================================
     8. SHORTCUTS (اختصاراتك — Exact posnext.json order)
     الالتزام التام بألوان الهوية: Primary #3867AE | Hover #0F84B5
  ========================================================= */
  const shortcuts = [
    {
      name: "Start POS",
      labelAr: "بدء نقطة البيع",
      labelEn: "Start POS",
      type: "pos",
      highlight: true
    },
    {
      name: "Item",
      labelAr: "المنتجات والمنتجات",
      labelEn: "Items",
      type: "route",
      doctype: "Item"
    },
    {
      name: "Pos Settings",
      labelAr: "إعدادات نقاط البيع",
      labelEn: "POS Settings",
      type: "route",
      doctype: "POS Settings"
    },
    {
      name: "Pos Profile",
      labelAr: "ملف نقطة البيع",
      labelEn: "POS Profile",
      type: "route",
      doctype: "POS Profile"
    },
    {
      name: "Pos Opening Shift",
      labelAr: "فتح وردية نقطة البيع",
      labelEn: "POS Opening Shift",
      type: "route",
      doctype: "POS Opening Shift"
    },
    {
      name: "Pos Closing Shift",
      labelAr: "إغلاق وردية نقطة البيع",
      labelEn: "POS Closing Shift",
      type: "route",
      doctype: "POS Closing Shift"
    },
    {
      name: "Pos Offer",
      labelAr: "عروض نقاط البيع",
      labelEn: "POS Offer",
      type: "route",
      doctype: "POS Offer"
    },
    {
      name: "Pos Coupon",
      labelAr: "قسائم نقاط البيع",
      labelEn: "POS Coupon",
      type: "route",
      doctype: "POS Coupon"
    },
    {
      name: "Voucher Balance",
      labelAr: "رصيد القسائم مسبقة الدفع",
      labelEn: "Voucher Balance",
      type: "route",
      doctype: "Prepaid Voucher Balance"
    }
  ];

  /* =========================================================
     9. CARDS & LINKS (Exact posnext.json structure & order)
     أيقونات معبرة للمربعات دون عشوائية ودون تكرار
  ========================================================= */
  const sections = [
    [
      "Operations & POS",
      [
        [
          "Shift Management",
          "⏱️",
          [
            "POS Opening Shift",
            "POS Closing Shift"
          ]
        ],
        [
          "Prepaid Vouchers",
          "💳",
          [
            "Prepaid Voucher Balance",
            "Prepaid Voucher Transaction",
            "Prepaid Voucher Report"
          ]
        ],
        [
          "Items & Products",
          "📦",
          [
            "Item"
          ]
        ],
        [
          "Offers & Coupons",
          "🏷️",
          [
            "POS Offer",
            "POS Coupon"
          ]
        ]
      ]
    ],
    [
      "Settings & Reports",
      [
        [
          "Configuration",
          "⚙️",
          [
            "POS Profile",
            "POS Settings"
          ]
        ],
        [
          "Reports",
          "📊",
          [
            "Sales vs Shifts Report",
            "Cashier Performance Report",
            "Payments and Cash Control Report",
            "Inventory Impact and Fast Movers Report",
            "Offline Sync and System Health Report"
          ]
        ]
      ]
    ]
  ];

  /* =========================================================
     10. ITEM GUIDANCE & DESCRIPTIONS (Modal details)
  ========================================================= */
  const itemDescriptions = {
    "POS Opening Shift": {
      icon: "⏱️",
      summaryAr: "فتح وردية جديدة للكاشير، وتحديد ملف نقطة البيع والرصيد النقدي الافتتاحي في الصندوق.",
      summaryEn: "Open a new cashier shift, set the POS Profile, and record opening float cash balance.",
      stepsAr: [
        "اضغط «فتح وردية نقطة البيع» أو زر وردية جديدة",
        "اختر ملف نقطة البيع (POS Profile) والفرع",
        "حدد الكاشير المسؤول عن الوردية",
        "أدخل الرصيد الافتتاحي من النقد في الدرج",
        "اضغط حفظ ثم تسجيل لاعتماد فتح الوردية"
      ],
      stepsEn: [
        "Click «POS Opening Shift» or create a new shift",
        "Select POS Profile and branch",
        "Assign the cashier in charge",
        "Enter opening cash float in the drawer",
        "Save and submit to activate the shift"
      ]
    },
    "POS Closing Shift": {
      icon: "🔒",
      summaryAr: "إغلاق وردية الكاشير، وجرد النقدية، ومطابقة المبيعات الفعلية مع المبالغ المحصلة وتسوية الفروقات.",
      summaryEn: "Close the cashier shift, reconcile collected payments against recorded sales, and settle differences.",
      stepsAr: [
        "اضغط «إغلاق وردية نقطة البيع»",
        "اختر الوردية المفتوحة المراد إغلاقها",
        "يقوم النظام بجلب ملخص الفواتير وطرق الدفع تلقائياً",
        "أدخل المبالغ النقدية الفعلية بعد جرد الدرج",
        "راجع فروقات الصندوق ثم اضغط حفظ وتسجيل"
      ],
      stepsEn: [
        "Click «POS Closing Shift»",
        "Select the active open shift to reconcile",
        "System automatically aggregates sales and payment modes",
        "Count drawer cash and enter actual counted amounts",
        "Review reconciliation variances and submit"
      ]
    },
    "POS Offer": {
      icon: "🏷️",
      summaryAr: "تحديد العروض الترويجية والخصومات التلقائية المطبقة في نقاط البيع حسب الكميات أو المجموعات.",
      summaryEn: "Configure automated POS promotions, bundle deals, and tiered item discounts.",
      stepsAr: [
        "اضغط «عرض نقطة بيع جديد»",
        "أدخل اسم العرض وتاريخ البداية والنهاية",
        "حدد شروط التطبيق (اشترِ X واحصل على Y، أو خصم نسبة)",
        "حدد المنتجات أو مجموعات المنتجات المشمولة بالعرض",
        "احفظ وسجل العرض ليتم تطبيقه تلقائياً عند الفوترة"
      ],
      stepsEn: [
        "Click «New POS Offer»",
        "Enter offer name and validity period",
        "Define rules (Buy X Get Y, percentage discount)",
        "Select eligible items or item categories",
        "Save and submit to activate at checkout"
      ]
    },
    "POS Coupon": {
      icon: "🎟️",
      summaryAr: "إنشاء قسائم وأكواد الخصم الترويجية لنقاط البيع مع تحديد سقف الخصم وشروط الاستخدام.",
      summaryEn: "Create promotional coupon codes for POS with usage limits and discount rules.",
      stepsAr: [
        "اضغط «قسيمة نقطة بيع جديدة»",
        "أدخل كود القسيمة واسمها التجاري",
        "حدد نوع الخصم (نسبة مئوية أو مبلغ ثابت)",
        "حدد الحد الأقصى لمرات الاستخدام وتاريخ الصلاحية",
        "احفظ القسيمة لتكون جاهزة للإدخال عند الدفع"
      ],
      stepsEn: [
        "Click «New POS Coupon»",
        "Enter coupon code and title",
        "Set discount type (percentage or flat rate)",
        "Specify usage limits and validity dates",
        "Save to enable redemption at checkout"
      ]
    },
    "Item": {
      icon: "📦",
      summaryAr: "تعريف وتعديل بيانات المنتجات والمنتجات، والباركود، وأسعار البيع، والوحدات.",
      summaryEn: "Manage item masters, barcodes, selling prices, and units of measure.",
      stepsAr: [
        "اضغط «منتج جديد»",
        "أدخل كود المنتج واسمه التجاري",
        "حدد مجموعة المنتجات ووحدة القياس",
        "أدخل الباركود الخاص بالمنتج",
        "حدد سعر البيع والمخزون ثم اضغط حفظ"
      ],
      stepsEn: [
        "Click «New Item»",
        "Enter item code and item name",
        "Set item group and unit of measure",
        "Scan or enter item barcode",
        "Specify selling price and save"
      ]
    },
    "Prepaid Voucher Balance": {
      icon: "💳",
      summaryAr: "استعراض ومتابعة أرصدة القسائم مسبقة الدفع لكل عميل وتفاصيل تخصيصها للفروع.",
      summaryEn: "View and monitor customer prepaid voucher balances and branch allocations.",
      stepsAr: [
        "فتح شاشة أرصدة القسائم مسبقة الدفع",
        "البحث عن العميل أو رقم القسيمة",
        "استعراض الرصيد الكلي والرصيد المخصص للفرع",
        "متابعة الحركات والمبالغ المصروفة والمتبقية"
      ],
      stepsEn: [
        "Open Prepaid Voucher Balance list",
        "Search by customer or voucher reference",
        "View total balance and branch-allocated balances",
        "Review usage history, redeemed amounts, and remaining balance"
      ]
    },
    "Prepaid Voucher Transaction": {
      icon: "📝",
      summaryAr: "سجل حركات شحن واستبدال القسائم مسبقة الدفع وربطها بفواتير نقاط البيع والورديات.",
      summaryEn: "Ledger of all prepaid voucher issue and redemption transactions linked to POS invoices.",
      stepsAr: [
        "فتح سجل حركات القسائم",
        "استعراض المعاملات حسب التاريخ أو العميل",
        "مراجعة نوع الحركة (شحن / صرف)",
        "التحقق من الفاتورة والوردية المرتبطة بكل حركة"
      ],
      stepsEn: [
        "Open Prepaid Voucher Transactions",
        "Filter entries by date, customer, or type",
        "Inspect transaction type (Credit / Debit)",
        "Verify linked POS invoice and cashier shift"
      ]
    }
  };

  /* =========================================================
     11. FOOTER INFO
  ========================================================= */
  const footerInfo = {
    phone: (window.frappe?.boot?.theme_settings?.phone) || "0115110455",
    email: (window.frappe?.boot?.theme_settings?.email) || "sales@mubtkir.com",
    website: (window.frappe?.boot?.theme_settings?.website) || "www.mubtkir.com",
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
     12. MODAL DIALOG (تفاصيل الشاشات والعمليات)
     الخطوات تظهر مباشرة بدون الحاجة للضغط على زر إظهار الخطوات
     وزر فتح الشاشة موجود وواضح في الأسفل
  ========================================================= */
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

    const overlay = document.createElement("div");
    overlay.className = "erp-modal-overlay";
    overlay.setAttribute("dir", isArabic ? "rtl" : "ltr");

    overlay.innerHTML = `
      <div class="erp-modal-box">
        <button type="button" class="erp-modal-close" data-modal-close>✕</button>
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

    const closeBtn = overlay.querySelector("[data-modal-close]");
    if (closeBtn) closeBtn.addEventListener("click", () => overlay.remove());

    overlay.addEventListener("click", e => {
      if (e.target === overlay) overlay.remove();
    });

    const launchBtn = overlay.querySelector("[data-modal-launch]");
    if (launchBtn) {
      launchBtn.addEventListener("click", () => {
        overlay.remove();
        openRoute(itemName);
      });
    }
  }

  /* =========================================================
     13. RENDER CYCLE
  ========================================================= */
  function renderCycle() {
    if (!cycleSection) return;

    const cardsHtml = cycleCards.map((card, index) => {
      const title = isArabic ? card.labelAr : card.labelEn;
      const desc = isArabic ? card.descAr : card.descEn;

      return `
        <div class="erp-cycle-item">
          <button
            type="button"
            class="erp-cycle-card cycle-tone-${(index % 4) + 1}"
            data-pos-cycle="${index}"
          >
            <span class="erp-cycle-number">${card.step}</span>
            <span class="erp-cycle-card-title">${escapeHtml(title)}</span>
            <span class="erp-cycle-description">${escapeHtml(desc)}</span>
          </button>
          ${index < cycleCards.length - 1 ? `<span class="erp-cycle-arrow">${isArabic ? "←" : "→"}</span>` : ""}
        </div>
      `;
    }).join("");

    cycleSection.innerHTML = `
      <section class="erp-cycle-container">
        <h2 class="erp-section-title erp-cycle-title">
          ${isArabic ? "دورة نقاط البيع" : "Point of Sale Cycle"}
        </h2>
        <div class="erp-cycle-grid">
          ${cardsHtml}
        </div>
      </section>
    `;

    cycleSection.addEventListener("click", event => {
      const el = event.target.closest("[data-pos-cycle]");
      if (!el) return;
      const idx = Number(el.getAttribute("data-pos-cycle"));
      const card = cycleCards[idx];
      if (!card) return;

      if (card.action === "pos") {
        openPOS();
      } else if (card.action === "new") {
        newDoc(card.doctype);
      } else if (card.action === "report") {
        openRoute(card.report);
      } else {
        openRoute(card.doctype);
      }
    });
  }

  /* =========================================================
     14. RENDER STATS (أرقام إنجليزية ومحاذاة يمين في العربي)
  ========================================================= */
  function renderStats() {
    if (!statsSection) return;

    const cardsHtml = statsCards.map((card, index) => {
      return `
        <div class="erp-stat-card overview-tone-${index + 1}">
          <div class="erp-stat-icon">${escapeHtml(card.short)}</div>
          <div class="erp-stat-info">
            <span class="erp-stat-value" data-pos-stat="${card.id}">0</span>
            <span class="erp-stat-label">${escapeHtml(isArabic ? card.labelAr : card.labelEn)}</span>
          </div>
        </div>
      `;
    }).join("");

    statsSection.innerHTML = `
      <section class="erp-overview-container">
        <h2 class="erp-section-title">${isArabic ? "نظرة عامة" : "Overview"}</h2>
        <div class="erp-stats-grid">${cardsHtml}</div>
      </section>
    `;

    statsCards.forEach(card => {
      Promise.resolve()
        .then(() => card.fetch())
        .then(val => {
          const el = statsSection.querySelector(`[data-pos-stat="${card.id}"]`);
          if (!el) return;
          if (card.currency) {
            el.textContent = formatCurrency(val) + (isArabic ? " ر.س" : " SAR");
          } else {
            el.textContent = formatNumber(val);
          }
        })
        .catch(() => {});
    });
  }

  /* =========================================================
     15. RENDER SHORTCUTS (Exact posnext.json order)
  ========================================================= */
  function renderQuickActions() {
    if (!quickActions) return;

    quickActions.innerHTML = `
      <h2 class="erp-section-title">${escapeHtml(isArabic ? "اختصاراتك" : "Your Shortcuts")}</h2>
      <div class="erp-quick-grid">
        ${shortcuts.map((btn, index) => `
          <button
            type="button"
            class="erp-quick-btn"
            data-shortcut-index="${index}"
          >
            <span class="erp-quick-label">${escapeHtml(isArabic ? btn.labelAr : btn.labelEn)}</span>
          </button>
        `).join("")}
      </div>
    `;

    quickActions.addEventListener("click", event => {
      const btnEl = event.target.closest("[data-shortcut-index]");
      if (!btnEl) return;
      const idx = Number(btnEl.getAttribute("data-shortcut-index"));
      const shortcut = shortcuts[idx];
      if (!shortcut) return;

      if (shortcut.type === "pos") {
        openPOS();
      } else {
        openRoute(shortcut.doctype);
      }
    });
  }

  /* =========================================================
     16. RENDER SECTIONS & CARDS (Exact posnext.json structure)
     زر تفاصيل يظهر فقط للشاشات والعمليات ويُمنع في التقارير والإعدادات
  ========================================================= */
  function renderSections() {
    if (!content) return;

    content.innerHTML = sections.map((sec, secIndex) => {
      const secTitle = isArabic ? "التقارير والإعدادات" : "Reports & Settings";
      const cardsHtml = sec[1].map((card, cardIndex) => {
        const cardTitle = card[0];
        const cardIcon = card[1];
        const items = card[2];

        const linksHtml = items.map(item => {
          const detailText = isArabic ? "تفاصيل" : "Details";
          const showDetails = hasDetailsButton(cardTitle, item);
          const infoBtn = showDetails
            ? `<button type="button" class="erp-info-link" data-info-item="${escapeHtml(item)}">${detailText}</button>`
            : "";

          return `
            <div class="erp-link-row">
              <button
                type="button"
                class="erp-link"
                data-route-name="${escapeHtml(item)}"
              >
                <span class="erp-link-text">${escapeHtml(translate(item))}</span>
                <span class="erp-link-arrow">${isArabic ? "←" : "→"}</span>
              </button>
              ${infoBtn}
            </div>
          `;
        }).join("");

        return `
          <article
            class="erp-card is-open tone-${(secIndex + cardIndex) % 4}"
            data-erp-card
          >
            <button
              type="button"
              class="erp-card-heading"
              data-card-toggle
              aria-expanded="true"
            >
              <span class="erp-icon">${cardIcon}</span>
              <span class="erp-card-title">${escapeHtml(translate(cardTitle))}</span>
              <span class="erp-card-chevron">⌄</span>
            </button>
            <div class="erp-card-links">
              ${linksHtml}
            </div>
          </article>
        `;
      }).join("");

      return `
        <section class="erp-module-section">
          <h2 class="erp-section-title">${escapeHtml(secTitle)}</h2>
          <div class="erp-dashboard-grid">
            ${cardsHtml}
          </div>
        </section>
      `;
    }).join("");

    content.addEventListener("click", event => {
      // Info modal
      const infoBtn = event.target.closest("[data-info-item]");
      if (infoBtn) {
        event.preventDefault();
        event.stopPropagation();
        showInfoModal(infoBtn.dataset.infoItem);
        return;
      }

      // Route button
      const routeBtn = event.target.closest("[data-route-name]");
      if (routeBtn) {
        event.preventDefault();
        openRoute(routeBtn.dataset.routeName);
        return;
      }

      // Card accordion toggle
      const heading = event.target.closest("[data-card-toggle]");
      if (heading) {
        const cardEl = heading.closest("[data-erp-card]");
        if (!cardEl) return;
        const willOpen = !cardEl.classList.contains("is-open");
        cardEl.classList.toggle("is-open", willOpen);
        heading.setAttribute("aria-expanded", willOpen ? "true" : "false");
      }
    });
  }

  /* =========================================================
     17. RENDER FOOTER
  ========================================================= */
  function renderFooter() {
    if (!footerEl) return;
    const labels = footerInfo.labels;

    footerEl.innerHTML = `
      <div class="erp-footer-inner">
        <div class="erp-footer-item">
          <span class="erp-footer-icon">☎</span>
          <span class="erp-footer-label">${escapeHtml(isArabic ? labels.phoneAr : labels.phoneEn)}:</span>
          <a href="tel:${footerInfo.phone}" class="erp-footer-link" dir="ltr">${escapeHtml(footerInfo.phone)}</a>
        </div>
        <span class="erp-footer-sep">|</span>
        <div class="erp-footer-item">
          <span class="erp-footer-icon">✉</span>
          <span class="erp-footer-label">${escapeHtml(isArabic ? labels.emailAr : labels.emailEn)}:</span>
          <a href="mailto:${footerInfo.email}" class="erp-footer-link">${escapeHtml(footerInfo.email)}</a>
        </div>
        <span class="erp-footer-sep">|</span>
        <div class="erp-footer-item">
          <span class="erp-footer-icon">🌐</span>
          <span class="erp-footer-label">${escapeHtml(isArabic ? labels.websiteAr : labels.websiteEn)}:</span>
          <a href="https://${footerInfo.website}" class="erp-footer-link" target="_blank" rel="noopener">${escapeHtml(footerInfo.website)}</a>
        </div>
      </div>
    `;
  }

  /* =========================================================
     18. INIT
  ========================================================= */
  try { renderCycle(); } catch (e) { console.error("POS Cycle Error:", e); }
  try { renderStats(); } catch (e) { console.error("POS Stats Error:", e); }
  try { renderQuickActions(); } catch (e) { console.error("POS Shortcuts Error:", e); }
  try { renderSections(); } catch (e) { console.error("POS Sections Error:", e); }
  try { renderFooter(); } catch (e) { console.error("POS Footer Error:", e); }
})();