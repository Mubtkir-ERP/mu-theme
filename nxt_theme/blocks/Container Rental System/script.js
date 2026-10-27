(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم نظام تأجير الحاويات — Container Rental System
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
     ١. أزرار الوصول السريع (Quick Access)
  ───────────────────────────────────────── */

  const quickActionButtons = [
    { labelEn: "Main Dashboard", labelAr: "لوحة التحكم الرئيسية", route: "containers-dashboard", color: "#64748b" },
    { labelEn: "Overdue Containers", labelAr: "الحاويات المتأخرة", route: "overdue-containers", color: "#ef4444" },
    { labelEn: "Container Order", labelAr: "أمر حاوية", doctype: "Container Order", hasCount: true, color: "#1e40af" },
    { labelEn: "Container Rental", labelAr: "تأجير الحاويات", doctype: "Container Rental", hasCount: true, color: "#10b981" },
    { labelEn: "Container Contract", labelAr: "عقود الحاويات", doctype: "Container Contract", hasCount: true, color: "#f97316" },
    { labelEn: "Container Unload", labelAr: "تفريغ الحاويات", doctype: "Container Unload", hasCount: true, color: "#64748b" }
  ];

  /* ─────────────────────────────────────────
     ٢. هيكل الأقسام والبطاقات (مطابق تماماً للصورة)
  ───────────────────────────────────────── */

  const sections = [
    [
      "Sections",
      [
        [
          "Operations",
          "🚛",
          [
            "Container Order",
            "Container Rental",
            "Container Delivery",
            "Container Unload",
            "Container Unload Request",
            "Container Withdrawal",
            "Rental Record"
          ]
        ],
        [
          "Contracts & Billing",
          "📝",
          [
            "Container Contract",
            "Contract Monthly Invoice",
            "Contract Report",
            "Monthly Invoices Report",
            "Driver Commission Entry"
          ]
        ],
        [
          "Masters",
          "🏢",
          [
            "Container",
            "Container Size",
            "Customer",
            "Employee",
            "Sales Person",
            "Truck",
            "Rental Branch",
            "Container Classification"
          ]
        ],
        [
          "Alerts & Reports",
          "📊",
          [
            "Overdue Containers Report",
            "General Containers Report",
            "Driver Commissions Report",
            "Maintenance Report",
            "Employee Alerts Report",
            "Truck Alerts Report",
            "Expenses Report"
          ]
        ],
        [
          "Settings",
          "⚙️",
          [
            "Container Rental Settings"
          ]
        ]
      ]
    ]
  ];

  /* ─────────────────────────────────────────
     ٣. أنواع المستندات الفردية والشجرية والتقارير
  ───────────────────────────────────────── */

  const singleDocs = new Set([
    "Container Rental Settings"
  ]);

  const treeDocs = new Set([]);

  // التقارير المستثناة من زر التفاصيل
  const reportNames = new Set([
    "Contract Report",
    "Monthly Invoices Report",
    "Overdue Containers Report",
    "General Containers Report",
    "Driver Commissions Report",
    "Maintenance Report",
    "Employee Alerts Report",
    "Truck Alerts Report",
    "Expenses Report"
  ]);

  const customRoutes = {
    "Main Dashboard": ["containers-dashboard"],
    "Overdue Containers": ["overdue-containers"]
  };

  /* ─────────────────────────────────────────
     ٤. الترجمات العربية
  ───────────────────────────────────────── */

  const arabicFallback = {
    "Sections": "الأقسام",
    "Quick Access": "الوصول السريع",

    "Operations": "العمليات",
    "Container Order": "أمر حاوية",
    "Container Rental": "تأجير الحاويات",
    "Container Delivery": "توصيل الحاوية",
    "Container Unload": "تفريغ الحاوية",
    "Container Unload Request": "طلب تفريغ الحاوية",
    "Container Withdrawal": "سحب الحاوية",
    "Rental Record": "سجل التأجير",

    "Contracts & Billing": "العقود والفوترة",
    "Container Contract": "عقد تأجير حاويات",
    "Contract Monthly Invoice": "فاتورة العقد الشهرية",
    "Contract Report": "تقرير العقود",
    "Monthly Invoices Report": "تقرير الفواتير الشهرية",
    "Driver Commission Entry": "قيد عمولة السائق",

    "Masters": "البيانات الرئيسية",
    "Container": "الحاوية",
    "Container Size": "مقاس الحاوية",
    "Customer": "العملاء",
    "Employee": "الموظفين",
    "Sales Person": "مناديب المبيعات",
    "Truck": "الشاحنات",
    "Rental Branch": "فرع التأجير",
    "Container Classification": "تصنيف الحاويات",

    "Alerts & Reports": "التنبيهات والتقارير",
    "Overdue Containers Report": "تقرير الحاويات المتأخرة",
    "General Containers Report": "تقرير الحاويات العام",
    "Driver Commissions Report": "تقرير عمولات السائقين",
    "Maintenance Report": "تقرير الصيانة",
    "Employee Alerts Report": "تقرير تنبيهات الموظفين",
    "Truck Alerts Report": "تقرير تنبيهات الشاحنات",
    "Expenses Report": "تقرير المصروفات",

    "Settings": "الإعدادات",
    "Container Rental Settings": "إعدادات تأجير الحاويات"
  };

  /* ─────────────────────────────────────────
     ٥. أوصاف المستندات والإعدادات (مع خطوات تفصيلية)
  ───────────────────────────────────────── */

  const itemDescriptions = {
    "Container Order": {
      icon: "📋",
      summaryAr: "إنشاء ومتابعة أوامر طلب الحاويات وتحديد مواقع التوصيل والتفريغ والعميل وتفاصيل الحاوية المطلوبة.",
      summaryEn: "Create and track container rental orders, delivery coordinates, customer info, and container specs.",
      stepsAr: ["إنشاء أمر حاوية جديد وتحديد العميل", "اختيار حجم ونوع الحاوية وتحديد موقع التوصيل", "حفظ وتأكيد الأمر لتحويله لمرحلة التوصيل"],
      stepsEn: ["Create new container order and select customer", "Specify container size, type, and delivery location", "Save and confirm order to initiate delivery"]
    },
    "Container Rental": {
      icon: "🚛",
      summaryAr: "إدارة عمليات تأجير الحاويات الجارية، ومتابعة مدة الإيجار وتواريخ البدء والانتهاء ومواقع الحاويات الميدانية.",
      summaryEn: "Manage active container rentals, tracking rental duration, start/end dates, and site locations.",
      stepsAr: ["فتح سجل التأجير وتحديد تفاصيل العقد أو الأمر", "تسجيل تاريخ التسليم الفعلي وموقع الحاوية لدى العميل", "متابعة فترة الإيجار والتجديد أو السحب عند الانتهاء"],
      stepsEn: ["Open rental record linked to order or contract", "Log actual delivery date and customer site location", "Track active rental duration until unload or withdrawal"]
    },
    "Container Delivery": {
      icon: "🚚",
      summaryAr: "تسجيل وتأكيد تسليم الحاويات إلى مواقع العملاء وتعيين السائق والشاحنة المخصصة للنقل.",
      summaryEn: "Record and confirm container delivery to customer sites, assigning designated truck and driver.",
      stepsAr: ["إنشاء إذن تسليم حاوية جديد وربطه بأمر التأجير", "تحديد رقم الحاوية والشاحنة واسم السائق المسؤول", "تأكيد إتمام التسليم وتوقيع العميل في الموقع"],
      stepsEn: ["Create container delivery record linked to order", "Assign container serial, truck, and driver", "Confirm delivery completion and customer receipt"]
    },
    "Container Unload": {
      icon: "🔄",
      summaryAr: "إدارة عمليات تفريغ الحاويات الممتلئة أو استبدالها وتوجيه الشاحنات لنقل المخلفات والتفريغ.",
      summaryEn: "Manage container unloading or replacement cycles and dispatch trucks for disposal.",
      stepsAr: ["فتح عملية تفريغ جديدة بناءً على طلب العميل", "تحديد الشاحنة والسائق وموقع التفريغ المعتمد", "تسجيل إتمام التفريغ وتحديث حالة الحاوية"],
      stepsEn: ["Create unload transaction based on request", "Assign truck, driver, and authorized disposal site", "Confirm unload execution and update container status"]
    },
    "Container Unload Request": {
      icon: "📩",
      summaryAr: "استقبال وتسجيل طلبات العملاء لتفريغ الحاويات أو تبديلها وجدولتها لفرق النقل الميدانية.",
      summaryEn: "Receive customer requests for container emptying or replacement and schedule dispatch.",
      stepsAr: ["تسجيل طلب تفريغ وارد من العميل", "التحقق من موقع الحاوية وحالة العقد والاشتراك", "جدولة الطلب وتحويله إلى أمر تفريغ للشاحنة"],
      stepsEn: ["Log incoming unload request from client", "Verify container location and active contract terms", "Schedule request and convert to dispatch order"]
    },
    "Container Withdrawal": {
      icon: "🔙",
      summaryAr: "تنظيم عمليات سحب واسترجاع الحاويات عند انتهاء مدة الإيجار أو العقد وإعادتها لمستودع المنشأة.",
      summaryEn: "Organize container retrieval and return upon rental expiration back to depot inventory.",
      stepsAr: ["إنشاء إذن سحب حاوية بعد انتهاء مدة التأجير", "تكليف السائق والشاحنة بالتوجه للموقع وسحب الحاوية", "فحص الحاوية عند استلامها وتأكيد إعادتها للفرع"],
      stepsEn: ["Create container withdrawal order at contract end", "Dispatch truck and driver to site for pickup", "Inspect returned container and confirm yard receipt"]
    },
    "Rental Record": {
      icon: "📑",
      summaryAr: "سجل العمليات التاريخية لحركة وتأجير الحاوية وتوثيق كافة رحلات التسليم والتفريغ والسحب.",
      summaryEn: "Historical movement ledger documenting all dispatch, unload, and return trips per container.",
      stepsAr: ["استعراض السجل لمتابعة تاريخ حركات الحاوية", "التحقق من الفترات التأجيرية السابقة والعملاء", "تتبع الصيانة الدورية وتكاليف التشغيل"],
      stepsEn: ["Review container movement and operation log", "Verify past rental terms and client history", "Track maintenance and operating expenses"]
    },

    "Container Contract": {
      icon: "📝",
      summaryAr: "إبرام عقود تأجير الحاويات طويلة الأجل، وتحديد الشروط المالية وعدد مرات التفريغ وقيمة الدفعات.",
      summaryEn: "Long-term container rental contracts specifying billing cycles, unload quotas, and rates.",
      stepsAr: ["إنشاء عقد جديد واختيار العميل وتحديد مدة العقد", "تحديد عدد الحاويات، مقاساتها، وقيمة الإيجار الشهري", "اعتماد العقد لبدء جدولة الفوترة والتفريغ الدوري"],
      stepsEn: ["Create new contract and select customer and tenure", "Specify container count, size, and monthly rental fee", "Submit contract to enable recurring billing and dispatch"]
    },
    "Contract Monthly Invoice": {
      icon: "🧾",
      summaryAr: "إصدار الفواتير الشهرية الدورية المستحقة على عقود الحاويات وترحيلها للحسابات العامة.",
      summaryEn: "Generate recurring monthly rental invoices against active contracts and post to GL.",
      stepsAr: ["توليد الفاتورة الشهرية للعقد النشط", "مراجعة احتساب رسوم الإيجار وعمليات التفريغ الإضافية", "ترحيل الفاتورة وإرسال المطالبة للعميل"],
      stepsEn: ["Generate monthly invoice for active contract", "Review rental charges and extra unload counts", "Submit invoice and dispatch statement to customer"]
    },
    "Driver Commission Entry": {
      icon: "💰",
      summaryAr: "احتساب وتوثيق استحقاقات وعمولات السائقين عن كل رحلة تسليم أو تفريغ حاوية نفذها.",
      summaryEn: "Calculate and record driver incentive commissions per completed delivery or unload trip.",
      stepsAr: ["تحديد السائق والفترة التشغيلية للعمولات", "مراجعة الرحلات المكتملة واحتساب العمولة المستحقة", "اعتماد القيد وترحيله لصرف المستحقات"],
      stepsEn: ["Select driver and operational calculation period", "Review verified completed trips and apply rates", "Approve entry and post for payroll settlement"]
    },

    "Container": {
      icon: "📦",
      summaryAr: "بطاقة الحاوية الرئيسية؛ الرقم التسلسلي، المقاس، النوع، الحالة التشغيلية، والفرع التابعة له.",
      summaryEn: "Master container registry: serial number, size, type, status, and assigned yard branch.",
      stepsAr: ["إدخال بيانات الحاوية الجديدة والرقم التسلسلي", "تحديد المقاس والتصنيف والفرع الميداني", "حفظ السجل لبدء استخدام الحاوية في التأجير"],
      stepsEn: ["Register new container unit and unique serial ID", "Assign size dimension, category, and yard branch", "Save to make container available for rental"]
    },
    "Container Size": {
      icon: "📐",
      summaryAr: "تعريف وتصنيف مقاسات الحاويات (مثل: 20 ياردة، 30 ياردة، 12 ياردة) وتحديد طاقتها الاستيعابية.",
      summaryEn: "Define container size dimensions (e.g., 20 yd, 30 yd) and cubic capacity.",
      stepsAr: ["إدخال مسمى المقاس والرمز وسعة الحجم بالياردة", "تحديد سعر الإيجار الافتراضي للمقاس", "حفظ المقاس لربطه بالحاويات وعقود التأجير"],
      stepsEn: ["Enter size label, code, and cubic yard capacity", "Configure standard baseline rental pricing", "Save to link with container units and orders"]
    },
    "Customer": {
      icon: "👥",
      summaryAr: "سجل بيانات العملاء والشركات؛ معلومات الاتصال، المواقع الميدانية، والحدود الائتمانية.",
      summaryEn: "Client database: contact records, project site addresses, and credit limits.",
      stepsAr: ["إدخال الاسم التجاري للعميل والرقم الضريبي", "إضافة أرقام التواصل ومواقع العمل الجغرافية", "حفظ ملف العميل لتمكينه من استئجار الحاويات"],
      stepsEn: ["Enter client commercial name and tax ID", "Add contact details and site coordinates", "Save client profile for order processing"]
    },
    "Employee": {
      icon: "👤",
      summaryAr: "سجل بيانات الموظفين؛ السائقين، الفنيين، مشرفي التشغيل، مع متابعة رخص القيادة والإقامات.",
      summaryEn: "Staff directory: drivers, field operators, tracking driver licenses and civil IDs.",
      stepsAr: ["إدخال بيانات الموظف والوظيفة وتاريخ التعيين", "تسجيل رقم رخصة القيادة وتاريخ انتهائها للسائقين", "حفظ الملف وتعيين الصلاحيات ومتابعة المهام"],
      stepsEn: ["Enter employee details, role, and hire date", "Record driving license and expiry date for drivers", "Save profile and assign operational permissions"]
    },
    "Sales Person": {
      icon: "💼",
      summaryAr: "إدارة مناديب ومسؤولي مبيعات التأجير ومتابعة أدائهم التسويقي وعقودهم المبرمة.",
      summaryEn: "Manage sales reps and account executives, tracking booked contracts and target quotas.",
      stepsAr: ["إضافة مسؤول المبيعات وتحديد نسب العمولة", "ربط المندوب بالعملاء وعقود الحاويات المبرمة", "متابعة التقارير الدورية للمبيعات المحققة"],
      stepsEn: ["Add sales representative and commission rate", "Link rep to assigned client accounts and contracts", "Track performance via sales volume reports"]
    },
    "Truck": {
      icon: "🚚",
      summaryAr: "سجل أسطول الشاحنات والمعدات؛ رقم اللوحة، نوع الشاحنة، حمولتها، وتواريخ الفحص والتأمين.",
      summaryEn: "Fleet asset directory: license plate, vehicle model, capacity, inspection, and insurance.",
      stepsAr: ["إدخال رقم اللوحة ونوع الشاحنة ورقم الهيكل", "تسجيل تواريخ انتهاء الاستمارة والفحص الدوري والتأمين", "حفظ الشاحنة لتعيينها في رحلات نقل الحاويات"],
      stepsEn: ["Enter plate number, chassis number, and model", "Log vehicle registration, inspection, and insurance dates", "Save vehicle to schedule in transport operations"]
    },
    "Rental Branch": {
      icon: "🏢",
      summaryAr: "تعريف الفروع ومستودعات تخزين الحاويات ومواقع تجميع الأسطول في مختلف المناطق.",
      summaryEn: "Define company yard branches, container storage depots, and fleet hubs.",
      stepsAr: ["إدخال اسم الفرع والموقع والمدينة ورقم التواصل", "تحديد السعة التخزينية للحاويات في مستودع الفرع", "حفظ الفرع لربطه بالشاحنات والحاويات التابعة له"],
      stepsEn: ["Enter branch title, district location, and contact info", "Set container yard capacity and storage limits", "Save branch to associate assigned fleet and assets"]
    },
    "Container Classification": {
      icon: "🏷️",
      summaryAr: "تصنيف الحاويات حسب الاستخدام (مخلفات بناء، نفايات تجارية، خردة، مخلفات صناعية).",
      summaryEn: "Classify containers by waste category (construction, municipal, scrap, industrial).",
      stepsAr: ["إدخال اسم التصنيف ونوع المخلفات المسموحة", "تحديد اشتراطات السلامة والبيئة للتصنيف", "حفظ التصنيف لتطبيقه على أوامر التأجير والعقود"],
      stepsEn: ["Enter classification name and waste category", "Set safety and regulatory disposal guidelines", "Save classification to apply on rental orders"]
    },

    "Container Rental Settings": {
      icon: "⚙️",
      summaryAr: "الإعدادات العامة لنظام تأجير الحاويات؛ سياسات التسعير، مدد الإيجار الافتراضية، التنبيهات التلقائية، وشروط العقود.",
      summaryEn: "Global container rental parameters: pricing rules, default lease duration, auto-alerts, and contract defaults.",
      stepsAr: ["تحديد مدة التأجير الافتراضية وسياسة رسوم التأخير", "ضبط إعدادات التنبيهات التلقائية للحاويات المتأخرة", "تحديد الحسابات المحاسبية الافتراضية للفوترة والعمولات وحفظ الإعدادات"],
      stepsEn: ["Set standard rental duration and overdue penalty rates", "Configure automatic alerts for overdue container returns", "Specify default GL accounts for invoicing and commissions and save"]
    }
  };

  /* ─────────────────────────────────────────
     ٦. دوال الترجمة والتهريب
  ───────────────────────────────────────── */

  function translate(key) {
    if (!isArabic) return key;
    return arabicFallback[key] || (typeof window.__ === "function" ? window.__(key) : key);
  }

  function escapeHtml(text) {
    if (!text) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatNumber(value) {
    const num = Number(value) || 0;
    return num.toLocaleString(isArabic ? "ar-SA" : "en-US");
  }

  /* ─────────────────────────────────────────
     ٧. نافذة التفاصيل المنبثقة (Info Modal القياسية)
  ───────────────────────────────────────── */

  function showInfoModal(itemName) {
    const desc = itemDescriptions[itemName];
    const title = isArabic ? (translate(itemName) || itemName) : itemName;
    const isSettingDoc = singleDocs.has(itemName) || itemName.toLowerCase().includes("settings");

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

    const existing = root.querySelector(".erp-modal-overlay") || document.querySelector(".erp-modal-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.className = "erp-modal-overlay";
    overlay.setAttribute("dir", isArabic ? "rtl" : "ltr");

    const launchLabel = isSettingDoc
      ? (isArabic ? "فتح شاشة الإعدادات" : "Open Settings")
      : (isArabic ? "فتح الشاشة" : "Open Screen");

    overlay.innerHTML = `
      <div class="erp-modal-box">
        <button type="button" class="erp-modal-close" data-modal-close aria-label="${isArabic ? "إغلاق" : "Close"}">✕</button>
        <div class="erp-modal-header">
          <span class="erp-modal-icon">${desc?.icon || "⚙️"}</span>
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
     ٨. إنشاء أزرار الوصول السريع
  ───────────────────────────────────────── */

  function renderQuickActions() {
    if (!quickActions) return;

    const title = isArabic ? "الوصول السريع" : "Quick Access";

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
              ${btn.hasCount ? `<span class="erp-stat-badge" data-badge-for="${escapeHtml(btn.doctype)}" style="margin-left: 8px; margin-right: 8px; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: rgba(30, 64, 175, 0.12); color: #1e40af;">...</span>` : ""}
            </button>`;
        }).join("")}
      </div>
    `;

    // جلب أعداد المستندات للأزرار
    quickActionButtons.forEach(btn => {
      if (btn.hasCount && btn.doctype && window.frappe) {
        frappe.call({
          method: "frappe.client.get_count",
          args: { doctype: btn.doctype },
          callback: r => {
            const el = quickActions.querySelector(`[data-badge-for="${btn.doctype}"]`);
            if (el) el.textContent = formatNumber(r.message || 0);
          },
          error: () => {
            const el = quickActions.querySelector(`[data-badge-for="${btn.doctype}"]`);
            if (el) el.textContent = "0";
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

      if (item.route) {
        frappe.set_route(item.route);
        return;
      }
      if (item.doctype) {
        openRoute(item.doctype);
      }
    });
  }

  /* ─────────────────────────────────────────
     ٩. إنشاء بطاقات الوحدات والمربعات
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
     ١٠. إنشاء الفوتر
  ───────────────────────────────────────── */

  const footerInfo = {
    phone: "920033198",
    email: "apps@mubtkir.com",
    website: "www.mubtkir.com",
    labels: {
      phoneAr: "الهاتف الموحد",
      phoneEn: "Support Phone",
      emailAr: "البريد الإلكتروني",
      emailEn: "Email Support",
      websiteAr: "الموقع الإلكتروني",
      websiteEn: "Official Website"
    }
  };

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
     ١١. التوجيه وفتح الشاشات داخل النظام
  ───────────────────────────────────────── */

  function openRoute(name) {
    if (!window.frappe || typeof frappe.set_route !== "function") return;
    if (customRoutes[name]) {
      frappe.set_route(customRoutes[name]);
      return;
    }
    if (reportNames.has(name)) {
      frappe.set_route("query-report", name);
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
     ١٢. معالجة الأحداث والضغط
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
     ١٣. بدء التشغيل
  ───────────────────────────────────────── */

  renderQuickActions();
  renderSections();
  renderFooter();
})();
