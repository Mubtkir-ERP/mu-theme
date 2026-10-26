(() => {
  /* =========================================================
     MUBTKIR ERP — GAS OPERATIONS WORKSPACE
     لوحة تحكم إدارة عمليات الغاز
     Aligned strictly with Mubtkir Brand Identity & gas_operations.json
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

  function openRoute(name) {
    if (!name) return;
    try {
      if (reportNames.has(name)) {
        frappe.set_route("query-report", name);
        return;
      }
      if (singleDocs.has(name)) {
        frappe.set_route("Form", name);
        return;
      }
      frappe.set_route("List", name);
    } catch (e) {
      console.error("Gas Operations Route Error:", name, e);
    }
  }

  function newDoc(doctype) {
    try {
      if (window.frappe?.new_doc) {
        frappe.new_doc(doctype);
      }
    } catch (e) {
      console.error("Gas Operations New Doc Error:", doctype, e);
    }
  }

  /* =========================================================
     3. TRANSLATIONS DICTIONARY
  ========================================================= */
  const arabicFallback = {
    // Headers & Labels
    "Gas Operations": "إدارة عمليات الغاز",
    "Operations & Financials": "العمليات والتشغيل اليومي",
    "Operations & Daily Logistics": "العمليات والتشغيل اليومي",
    "Branch Delivery & Logistics": "تسليم الفروع واللوجستيات",
    "Daily Operations & Financials": "العمليات اليومية والمالية",
    "GASCO Ingestion & Invoices": "فواتير واستيراد كشف غازكو",

    // Links / Items
    "Gas Branch Delivery": "تسليم فروع الغاز",
    "Gas Daily Sheet": "الشيت اليومي للغاز",
    "Gasco Statement Importer": "أداة استيراد كشف غازكو",
    "Gas Monthly Billing Tool": "أداة الفوترة الشهرية للغاز",
    "Delivery Note": "إشعار التسليم",
    "Sales Invoice": "فاتورة المبيعات",
    "Journal Entry": "قيد اليومية",
    "Purchase Invoice": "فاتورة المشتريات",
    "Payment Entry": "سند صرف"
  };

  function translate(key) {
    if (!isArabic) return key;
    return arabicFallback[key] || key;
  }

  /* =========================================================
     4. ROUTE CLASSIFICATION
  ========================================================= */
  const reportNames = new Set([]);

  const singleDocs = new Set([
    "Gas Monthly Billing Tool"
  ]);

  /* =========================================================
     5. DETAILS BUTTON RULE
     الشرط الإلزامي: زر تفاصيل لكل الشاشات بدون استثناء
     ولكن الإعدادات والتقارير ممنوع وضع زر تفاصيل لها
  ========================================================= */
  function hasDetailsButton(cardTitle, itemName) {
    if (reportNames.has(itemName)) return false;
    if (/report|تقارير|تقرير/i.test(cardTitle) || /report|تقرير/i.test(itemName)) return false;
    if (/setting|config|إعداد|اعداد|تكوين/i.test(cardTitle) || /setting|إعداد|اعداد/i.test(itemName)) return false;
    return true;
  }

  /* =========================================================
     6. GAS OPERATIONS CYCLE (دورة عمليات الغاز)
  ========================================================= */
  const cycleCards = [
    {
      step: 1,
      action: "new",
      doctype: "Gasco Statement Importer",
      labelAr: "استيراد كشف غازكو",
      labelEn: "GASCO Import",
      descAr: "استيراد كشوفات غازكو ومطابقة كميات الغاز المشتراة.",
      descEn: "Import GASCO statements and reconcile purchased gas quantities."
    },
    {
      step: 2,
      action: "new",
      doctype: "Gas Branch Delivery",
      labelAr: "تسليم الفروع",
      labelEn: "Branch Delivery",
      descAr: "تسجيل كميات الغاز المسلمة وتحديث قراءات العدادات.",
      descEn: "Record gas delivered to branch tanks and meter readings."
    },
    {
      step: 3,
      action: "new",
      doctype: "Gas Daily Sheet",
      labelAr: "الشيت اليومي",
      labelEn: "Daily Sheet",
      descAr: "تسجيل المبيعات اليومية والمصروفات ومطابقة النقدية.",
      descEn: "Record daily sales, operational expenses, and branch cash."
    },
    {
      step: 4,
      action: "route",
      doctype: "Gas Monthly Billing Tool",
      labelAr: "الفوترة والترحيل",
      labelEn: "Billing Tool",
      descAr: "إصدار الفواتير الشهرية المجمعة وترحيل القيود التلقائية.",
      descEn: "Consolidated monthly billing and automated accounting entries."
    }
  ];

  /* =========================================================
     7. OVERVIEW / STATS (نظرة عامة — 4 بطاقات)
  ========================================================= */
  const statsCards = [
    {
      id: "gas-deliveries-today",
      short: "DEL",
      labelAr: "تسليمات اليوم",
      labelEn: "Today's Deliveries",
      fetch: () => safeCount("Gas Branch Delivery", { posting_date: today(), docstatus: 1 })
    },
    {
      id: "gas-sheets-today",
      short: "SHEET",
      labelAr: "الشيتات اليومية",
      labelEn: "Daily Sheets",
      fetch: () => safeCount("Gas Daily Sheet", { posting_date: today(), docstatus: 1 })
    },
    {
      id: "gas-sales-invoices",
      short: "INV",
      labelAr: "فواتير المبيعات",
      labelEn: "Sales Invoices",
      fetch: () => safeCount("Sales Invoice", { docstatus: 1, posting_date: today() })
    },
    {
      id: "gasco-imports",
      short: "GASCO",
      labelAr: "كشوفات غازكو",
      labelEn: "GASCO Statements",
      fetch: () => safeCount("Gasco Statement Importer")
    }
  ];

  /* =========================================================
     8. SHORTCUTS (اختصاراتك — Exact gas_operations.json)
     الالتزام التام بألوان الهوية: Primary #3867AE | Hover #0F84B5
  ========================================================= */
  const shortcuts = [
    {
      name: "Gas Branch Delivery",
      labelAr: "تسليم فروع الغاز",
      labelEn: "Gas Branch Delivery",
      type: "route",
      doctype: "Gas Branch Delivery",
      highlight: true
    },
    {
      name: "Gas Daily Sheet",
      labelAr: "الشيت اليومي للغاز",
      labelEn: "Gas Daily Sheet",
      type: "route",
      doctype: "Gas Daily Sheet"
    },
    {
      name: "Gasco Statement Importer",
      labelAr: "أداة استيراد كشف غازكو",
      labelEn: "Gasco Statement Importer",
      type: "route",
      doctype: "Gasco Statement Importer"
    },
    {
      name: "Gas Monthly Billing Tool",
      labelAr: "أداة الفوترة الشهرية للغاز",
      labelEn: "Gas Monthly Billing Tool",
      type: "route",
      doctype: "Gas Monthly Billing Tool"
    }
  ];

  /* =========================================================
     9. CARDS & LINKS (Exact gas_operations.json)
     أيقونات معبرة للمربعات دون عشوائية ودون تكرار
  ========================================================= */
  const sections = [
    [
      "Operations & Daily Logistics",
      [
        [
          "Daily Operations & Financials",
          "📋",
          [
            "Gas Daily Sheet",
            "Sales Invoice",
            "Journal Entry"
          ]
        ],
        [
          "Branch Delivery & Logistics",
          "🚚",
          [
            "Gas Branch Delivery",
            "Gas Monthly Billing Tool",
            "Delivery Note"
          ]
        ],
        [
          "GASCO Ingestion & Invoices",
          "⛽",
          [
            "Gasco Statement Importer",
            "Purchase Invoice",
            "Payment Entry"
          ]
        ]
      ]
    ]
  ];

  /* =========================================================
     10. ITEM GUIDANCE & DESCRIPTIONS (Modal details)
  ========================================================= */
  const itemDescriptions = {
    "Gas Branch Delivery": {
      icon: "🚚",
      summaryAr: "تسجيل شحنات الغاز المنقولة والمسلمة لخزانات الفروع ومطابقة الكميات وقراءات العدادات وتكلفة النقل.",
      summaryEn: "Record branch LPG delivery batches, meter readings, transferred liters, and transportation expenses.",
      stepsAr: [
        "اضغط «تسليم فرع جديد»",
        "حدد الفرع المستلم وتاريخ التسليم ورقم الشاحنة/السائق",
        "أدخل قراءة العداد السابقة وقراءة العداد الحالية",
        "يقوم النظام باحتساب كمية اللترات الصافية تلقائياً",
        "اضغط حفظ ثم تسجيل لاعتماد حركة الاستلام وتحديث المخزون"
      ],
      stepsEn: [
        "Click «New Gas Branch Delivery»",
        "Select target branch, delivery date, and driver/tanker",
        "Enter previous meter reading and current meter reading",
        "System automatically calculates net delivered liters",
        "Save and Submit to update branch inventory"
      ]
    },
    "Gas Daily Sheet": {
      icon: "📋",
      summaryAr: "سجل العمليات اليومي لفرع الغاز، يتضمن كميات البيع للعملاء، والمصروفات التشغيلية، ومطابقة النقدية والشبكة.",
      summaryEn: "Daily operations log per gas branch, tracking consumer sales, petty cash expenses, and cash/Mada reconciliations.",
      stepsAr: [
        "اضغط «شيت يومي جديد»",
        "حدد الفرع وتاريخ العمليات والموظف المسؤول",
        "أدخل مبيعات الغاز وقراءات المضخات والأسطوانات",
        "سجل أي مصروفات تشغيلية نقدية من الصندوق",
        "راجع إجمالي النقدية المحصلة ومبيعات الشبكة ثم اضغط حفظ وتسجيل"
      ],
      stepsEn: [
        "Click «New Gas Daily Sheet»",
        "Select branch, operation date, and supervisor in charge",
        "Enter gas sales volumes and pump meter numbers",
        "Record daily petty cash operational expenses",
        "Verify collected cash vs Mada totals, then Save and Submit"
      ]
    },
    "Gasco Statement Importer": {
      icon: "⛽",
      summaryAr: "أداة متقدمة لاستيراد كشوفات شركة غازكو، ومطابقة الفواتير والكميات الواردة بدقة مع قيود الشراء.",
      summaryEn: "Advanced importer tool for GASCO billing statements, reconciling purchased quantities with purchase entries.",
      stepsAr: [
        "فتح أداة استيراد كشف غازكو",
        "رفع ملف الكشف البنكي أو كشف غازكو بصيغة Excel/CSV",
        "تحديد حساب المورد (شركة غازكو) وفترة المطابقة",
        "مراجعة الكميات والفواتير المتطابقة تلقائياً",
        "الضغط على ترحيل القيود لإنشاء فواتير الشراء وسندات الصرف"
      ],
      stepsEn: [
        "Open Gasco Statement Importer",
        "Upload GASCO statement file in Excel or CSV format",
        "Select GASCO supplier account and billing period",
        "Review auto-matched quantities and invoice items",
        "Click Post to generate Purchase Invoices and Payments"
      ]
    },
    "Gas Monthly Billing Tool": {
      icon: "🧾",
      summaryAr: "أداة آلية لتوليد الفواتير الشهرية المجمعة لفروع الغاز والعملاء التجاريين وترحيل القيود المحاسبية دفعة واحدة.",
      summaryEn: "Automated monthly billing generator for gas branches and commercial customers with bulk invoice posting.",
      stepsAr: [
        "فتح أداة الفوترة الشهرية للغاز",
        "تحديد الشهر والسنة والشركة",
        "الضغط على استخراج بيانات الاستهلاك من التسليمات والشيتات",
        "مراجعة قائمة العملاء والكميات والمبالغ المستحقة",
        "الضغط على إصدار الفواتير لإنشاء فواتير المبيعات دفعة واحدة"
      ],
      stepsEn: [
        "Open Gas Monthly Billing Tool",
        "Select Month, Year, and Company",
        "Fetch consumption data aggregated from daily sheets and deliveries",
        "Review customers, billed liters, and total amounts",
        "Click Generate Invoices to create sales invoices in bulk"
      ]
    },
    "Delivery Note": {
      icon: "📦",
      summaryAr: "سند تسليم رسمي يوثق خروج أسطوانات الغاز أو الصهاريج من المستودع المركزي وتسليمها للعملاء.",
      summaryEn: "Official delivery note recording issued LPG cylinders or bulk tankers dispatched from warehouses.",
      stepsAr: [
        "اضغط «إشعار تسليم جديد»",
        "حدد العميل ومستودع الصرف وتاريخ التسليم",
        "أضف أصناف الغاز والأسطوانات والكميات المسلمة",
        "راجع بيانات السائق وسيارة النقل",
        "اضغط حفظ وتسجيل لخصم الكميات من المخزون"
      ],
      stepsEn: [
        "Click «New Delivery Note»",
        "Select Customer, Source Warehouse, and Delivery Date",
        "Add gas items, cylinder types, and issued quantities",
        "Enter driver and vehicle details",
        "Save and Submit to deduct inventory"
      ]
    },
    "Sales Invoice": {
      icon: "💰",
      summaryAr: "فاتورة مبيعات ضريبية لمبيعات الغاز والأسطوانات والخدمات المرتبطة مطابقة لمتطلبات هيئة الزكاة والضريبة.",
      summaryEn: "ZATCA compliant tax sales invoice for gas deliveries, refills, and associated logistics services.",
      stepsAr: [
        "اضغط «فاتورة مبيعات جديدة»",
        "اختر العميل وتاريخ الفاتورة وشروط الدفع",
        "أضف أصناف الغاز والكميات والأسعار المعتمدة",
        "تحقق من احتساب ضريبة القيمة المضافة (15%) بدقة",
        "احفظ وسجل الفاتورة لإصدار رمز الاستجابة السريعة (QR Code)"
      ],
      stepsEn: [
        "Click «New Sales Invoice»",
        "Select Customer, posting date, and payment terms",
        "Add gas items, quantities, and agreed prices",
        "Verify 15% VAT calculation accuracy",
        "Save and Submit to generate compliant ZATCA QR Code"
      ]
    },
    "Journal Entry": {
      icon: "📒",
      summaryAr: "تسجيل القيود المحاسبية اليومية لتسويات العجز، فروقات الخزانات، ومصروفات التشغيل الدورية.",
      summaryEn: "Record accounting journal entries for tank inventory variances, operational costs, and adjustments.",
      stepsAr: [
        "اضغط «قيد يومية جديد»",
        "حدد نوع القيد (تسوية / قيد يومية) وتاريخ الترحيل",
        "أضف الحسابات المدينة والدائنة مع مراكز التكلفة",
        "تأكد من توازن إجمالي المدين والدائن",
        "اضغط حفظ ثم تسجيل لترحيل الأثر المالي فورياً"
      ],
      stepsEn: [
        "Click «New Journal Entry»",
        "Set Entry Type, Posting Date, and Company",
        "Add Debit and Credit accounts with Cost Centers",
        "Verify total debit equals total credit",
        "Save and Submit to post financial effect"
      ]
    },
    "Purchase Invoice": {
      icon: "🛒",
      summaryAr: "فاتورة مشتريات الغاز من شركة غازكو أو الموردين المعتمدين وتحديث التزامات الموردين والمخزون.",
      summaryEn: "Purchase invoice for LPG bulk fuel from GASCO or approved vendors updating payable balances.",
      stepsAr: [
        "اضغط «فاتورة مشتريات جديدة»",
        "اختر المورد (شركة غازكو) وتاريخ الفاتورة",
        "أدخل رقم فاتورة المورد ورقم الشحنة",
        "أدخل كمية الغاز باللتر أو الطن والسعر الإفرادي والضريبة",
        "احفظ وسجل الفاتورة لإثبات المديونية والمخزون"
      ],
      stepsEn: [
        "Click «New Purchase Invoice»",
        "Select Supplier (GASCO) and invoice date",
        "Enter supplier invoice number and batch reference",
        "Specify gas quantity in Liters/Tons, rate, and VAT",
        "Save and Submit to record inventory and payable liability"
      ]
    },
    "Payment Entry": {
      icon: "💵",
      summaryAr: "سند صرف أو قبض لتوثيق سداد مستحقات شركة غازكو، أو تحصيل مبيعات الفروع، أو سداد السلف والمصروفات.",
      summaryEn: "Payment or receipt voucher recording settlements to GASCO, customer collections, or operational advances.",
      stepsAr: [
        "اضغط «سند دفع جديد»",
        "حدد نوع السند (صرف لمورد / قبض من عميل / تحويل داخلي)",
        "اختر الحساب البنكي أو صندوق النقدية",
        "حدد الفواتير المراد تسويتها وسدادها",
        "أدخل المبلغ وتفاصيل المعاملة ثم اضغط حفظ وتسجيل"
      ],
      stepsEn: [
        "Click «New Payment Entry»",
        "Select Payment Type (Pay / Receive / Internal Transfer)",
        "Select Bank Account or Cash Box",
        "Allocate against outstanding invoices",
        "Enter amount and reference, then Save and Submit"
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
            data-gas-cycle="${index}"
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
          ${isArabic ? "دورة إدارة عمليات الغاز" : "Gas Operations Cycle"}
        </h2>
        <div class="erp-cycle-grid">
          ${cardsHtml}
        </div>
      </section>
    `;

    cycleSection.addEventListener("click", event => {
      const el = event.target.closest("[data-gas-cycle]");
      if (!el) return;
      const idx = Number(el.getAttribute("data-gas-cycle"));
      const card = cycleCards[idx];
      if (!card) return;

      if (card.action === "new") {
        newDoc(card.doctype);
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
            <span class="erp-stat-value" data-gas-stat="${card.id}">0</span>
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
          const el = statsSection.querySelector(`[data-gas-stat="${card.id}"]`);
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
     15. RENDER SHORTCUTS (Exact gas_operations.json order)
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

      openRoute(shortcut.doctype);
    });
  }

  /* =========================================================
     16. RENDER SECTIONS & CARDS (Exact gas_operations.json)
     زر تفاصيل يظهر فقط للشاشات والعمليات ويُمنع في التقارير والإعدادات
  ========================================================= */
  function renderSections() {
    if (!content) return;

    content.innerHTML = sections.map((sec, secIndex) => {
      const secTitle = isArabic ? "العمليات والمالية" : "Operations & Financials";
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
  try { renderCycle(); } catch (e) { console.error("Gas Cycle Error:", e); }
  try { renderStats(); } catch (e) { console.error("Gas Stats Error:", e); }
  try { renderQuickActions(); } catch (e) { console.error("Gas Shortcuts Error:", e); }
  try { renderSections(); } catch (e) { console.error("Gas Sections Error:", e); }
  try { renderFooter(); } catch (e) { console.error("Gas Footer Error:", e); }
})();
