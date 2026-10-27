(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم التصنيع والإنتاج — ERPNext Manufacturing
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
     ١. إحصائيات التصنيع
  ───────────────────────────────────────── */

  const statsCards = [
    {
      id: "open-work-orders",
      short: "WO",
      labelEn: "Open Work Orders",
      labelAr: "أوامر العمل المفتوحة",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "Work Order",
              filters: { status: ["in", ["Draft", "Not Started", "In Process"]] }
            },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "active-production-plans",
      short: "PLAN",
      labelEn: "Production Plans",
      labelAr: "خطط الإنتاج النشطة",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "Production Plan",
              filters: { status: ["in", ["Draft", "In Process"]] }
            },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "open-job-cards",
      short: "JOB",
      labelEn: "Open Job Cards",
      labelAr: "بطاقات العمل الجارية",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "Job Card",
              filters: { status: ["in", ["Open", "Work In Progress"]] }
            },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "total-boms",
      short: "BOM",
      labelEn: "Active BOMs",
      labelAr: "أشجار المنتجات المعتمدة",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "BOM",
              filters: { is_active: 1, docstatus: 1 }
            },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    }
  ];

  /* ─────────────────────────────────────────
     ٢. أزرار الاختصارات السريعة (Your Shortcuts)
  ───────────────────────────────────────── */

  const quickActionButtons = [
    { doctype: "BOM", labelEn: "BOM Creator", labelAr: "منشئ شجرة المنتج", isRoute: "bom-creator" },
    { doctype: "BOM", labelEn: "BOM", labelAr: "شجرة المنتج (BOM)" },
    { doctype: "Production Plan", labelEn: "Production Plan", labelAr: "خطة الإنتاج" },
    { doctype: "Work Order", labelEn: "Work Order", labelAr: "أمر العمل" },
    { doctype: "Job Card", labelEn: "Job Card", labelAr: "بطاقة العمل" },
    { doctype: "Plant Floor", labelEn: "Plant Floor", labelAr: "صالة الإنتاج", isRoute: "plant-floor" },
    { doctype: "BOM Stock Report", labelEn: "BOM Stock Report", labelAr: "تقرير مخزون شجرة المنتج", isReport: true },
    { doctype: "Production Planning Report", labelEn: "Production Planning Report", labelAr: "تقرير تخطيط الإنتاج", isReport: true }
  ];

  /* ─────────────────────────────────────────
     ٣. هيكل الأقسام والبطاقات (مطابق تماماً للصورة)
  ───────────────────────────────────────── */

  const sections = [
    [
      "Reports & Masters",
      [
        [
          "Production",
          "🏭",
          [
            "Work Order",
            "Production Plan",
            "Stock Entry",
            "Job Card",
            "Downtime Entry"
          ]
        ],
        [
          "Bill of Materials",
          "📋",
          [
            "Item",
            "Bill of Materials",
            "Workstation Type",
            "Workstation",
            "Operation",
            "Routing"
          ]
        ],
        [
          "Reports",
          "📊",
          [
            "Production Planning Report",
            "Work Order Summary",
            "Quality Inspection Summary",
            "Downtime Analysis",
            "Job Card Summary",
            "BOM Search",
            "BOM Stock Report",
            "Production Analytics",
            "BOM Operations Time",
            "Work Order Consumed Materials"
          ]
        ],
        [
          "Tools",
          "🔧",
          [
            "BOM Update Tool",
            "BOM Comparison Tool"
          ]
        ],
        [
          "Settings",
          "⚙️",
          [
            "Manufacturing Settings"
          ]
        ]
      ]
    ]
  ];

  /* ─────────────────────────────────────────
     ٤. أنواع المستندات الفردية والشجرية والتقارير
  ───────────────────────────────────────── */

  const singleDocs = new Set([
    "Manufacturing Settings",
    "BOM Update Tool",
    "BOM Comparison Tool"
  ]);

  const treeDocs = new Set([]);

  const reportNames = new Set([
    "Production Planning Report",
    "Work Order Summary",
    "Quality Inspection Summary",
    "Downtime Analysis",
    "Job Card Summary",
    "BOM Search",
    "BOM Stock Report",
    "Production Analytics",
    "BOM Operations Time",
    "Work Order Consumed Materials"
  ]);

  /* ─────────────────────────────────────────
     ٥. القاموس اللغوي (عربي / إنجليزي مع اعتماد 'منتج/منتجات')
  ───────────────────────────────────────── */

  const translations = {
    "Reports & Masters": "التقارير والبيانات الرئيسية",
    "Production": "الإنتاج",
    "Bill of Materials": "شجرة المنتج وقوائم المواد",
    "Reports": "التقارير",
    "Tools": "الأدوات",
    "Settings": "الإعدادات",

    "Work Order": "أمر العمل",
    "Production Plan": "خطة الإنتاج",
    "Stock Entry": "قيد المخزون للإنتاج",
    "Job Card": "بطاقة العمل",
    "Downtime Entry": "تسجيل توقف العمل",

    "Item": "المنتجات",
    "Bill of Materials": "شجرة المنتج (BOM)",
    "Workstation Type": "أنواع محطات العمل",
    "Workstation": "محطات العمل",
    "Operation": "عمليات الإنتاج",
    "Routing": "مسار عمليات الإنتاج",

    "Production Planning Report": "تقرير تخطيط الإنتاج",
    "Work Order Summary": "ملخص أوامر العمل",
    "Quality Inspection Summary": "ملخص فحص الجودة",
    "Downtime Analysis": "تحليل أوقات التوقف",
    "Job Card Summary": "ملخص بطاقات العمل",
    "BOM Search": "بحث شجرة المنتج",
    "BOM Stock Report": "تقرير مخزون شجرة المنتج",
    "Production Analytics": "تحليلات الإنتاج",
    "BOM Operations Time": "أوقات عمليات شجرة المنتج",
    "Work Order Consumed Materials": "المواد والمنتجات المستهلكة في أمر العمل",

    "BOM Update Tool": "أداة تحديث شجرة المنتج",
    "BOM Comparison Tool": "أداة مقارنة شجرة المنتج",
    "Manufacturing Settings": "إعدادات التصنيع والإنتاج"
  };

  /* ─────────────────────────────────────────
     ٦. شروحات وتفاصيل الشاشات والإعدادات
  ───────────────────────────────────────── */

  const itemDescriptions = {
    "Work Order": {
      icon: "🏭",
      summaryAr: "أمر رسمي موجه لصالة الإنتاج لتصنيع كمية محددة من منتج معين وفق شجرة المنتج وتاريخ تسليم معتمد.",
      summaryEn: "Official shop-floor manufacturing order to produce a specific product quantity based on its BOM.",
      stepsAr: ["تحديد المنتج المراد تصنيعه والكمية وشجرة المنتج", "توليد قيود صرف المواد الخام وبطاقات العمل", "إتمام التصنيع وتحويل المنتج التام إلى مستودع البضاعة الجاهزة"],
      stepsEn: ["Select product to manufacture, target quantity, and BOM", "Generate raw material transfers and job cards", "Complete production and transfer finished goods to target warehouse"]
    },
    "Production Plan": {
      icon: "📅",
      summaryAr: "تخطيط وجدولة الإنتاج بناءً على طلبات المبيعات أو مستويات المخزون للمنتجات لتحديد الاحتياجات الخام.",
      summaryEn: "Consolidate sales orders and stock replenishment levels into scheduled production orders and material requests.",
      stepsAr: ["جلب طلبات المبيعات أو المنتجات المطلوب تعويض مخزونها", "حساب المواد الخام والمنتجات الوسيطة المطلوبة (MRP)", "توليد أوامر العمل وطلبات الشراء بضغطة زر واحدة"],
      stepsEn: ["Pull sales orders or projected stock shortages", "Calculate raw materials and sub-assemblies (MRP)", "Generate work orders and material purchase requests automatically"]
    },
    "Stock Entry": {
      icon: "📦",
      summaryAr: "صرف المواد الخام المستهلكة إلى خطوط الإنتاج وإثبات استلام المنتجات التامة الصنع والمتبقي من الخامات.",
      summaryEn: "Transfer raw materials to manufacturing workstations and record receipt of finished goods.",
      stepsAr: ["تحديد غرض الحركة (صرف لمصنع / استلام تصنيع)", "تحديد مستودع المصدر ومستودع البضاعة التامة", "حفظ واعتماد القيد لتحديث أرصدة وتكاليف المنتجات"],
      stepsEn: ["Select entry purpose (material transfer for manufacture / manufacture)", "Specify source raw material warehouse and target finished goods warehouse", "Submit entry to update product inventory balances and production valuation"]
    },
    "Job Card": {
      icon: "⏱️",
      summaryAr: "بطاقة عمل تفصيلية لكل عملية إنتاجية على محطة العمل لقياس الوقت الفعلي وساعات تشغيل الفنيين.",
      summaryEn: "Operation-level shop floor card tracking real-time labor hours, workstation usage, and completed parts.",
      stepsAr: ["فتح بطاقة العمل وتحديد محطة العمل والمشغل", "بدء مؤقت التشغيل (Timer) وتسجيل وقت البدء", "تسجيل الكمية المنجزة وإيقاف المؤقت لاعتماد ساعات العمل"],
      stepsEn: ["Open job card assigned to workstation and operator", "Start time log timer upon operation initiation", "Record completed units and stop timer to record labor hours"]
    },
    "Downtime Entry": {
      icon: "⚠️",
      summaryAr: "تسجيل فترات وأسباب توقف الآلات ومحطات العمل (أعطال، صيانة طارئة، نقص مواد) لقياس كفاءة التشغيل (OEE).",
      summaryEn: "Log machine breakdowns, emergency maintenance, and operational stoppages to compute availability and OEE.",
      stepsAr: ["اختيار محطة العمل وتحديد وقت بدء ونهاية التوقف", "تحديد سبب التوقف (عطل كهربائي، نقص خامات، صيانة)", "حفظ السجل لتحليل تقارير أوقات التوقف والفاقد"],
      stepsEn: ["Select affected workstation and downtime interval", "Specify downtime reason category", "Save record to feed machine utilization and OEE reports"]
    },

    "Item": {
      icon: "📦",
      summaryAr: "إدارة بطاقات المنتجات تامة الصنع، المواد الأولية، والمنتجات الوسيطة؛ مع ضبط سياسات التكلفة والمخزون.",
      summaryEn: "Master records of finished goods, raw materials, and sub-assemblies including costing and inventory settings.",
      stepsAr: ["إدخال رمز واسم المنتج ووحدة القياس ومجموعة المنتجات", "تحديد خصائص المنتج (مخزني، مصنّع، خاضع للضريبة)", "تعيين مستودع المنتج الافتراضي وقائمة أسعار البيع والشراء"],
      stepsEn: ["Enter product code, name, unit of measure, and product group", "Set product properties (stock, maintain stock, manufacturing)", "Define default warehouse and purchasing/selling valuation"]
    },
    "Bill of Materials": {
      icon: "📋",
      summaryAr: "شجرة المنتج (BOM) التي تحدد المكونات والمواد الخام والعمليات التشغيلية وتكلفتها التقديرية لإنتاج وحدة واحدة.",
      summaryEn: "Engineering bill of materials outlining raw materials, sub-assemblies, workstation operations, and standard costs.",
      stepsAr: ["تحديد المنتج التام الصنع المراد إعداد شجرته", "إدراج قائمة المواد الخام والكميات اللازمة لإنتاج وحدة", "إضافة عمليات التصنيع ومحطات العمل وحفظ الشجرة واعتمادها"],
      stepsEn: ["Select finished product to configure", "Add raw material components and consumption quantities per unit", "Define manufacturing operations, workstation runtimes, and submit BOM"]
    },
    "Workstation Type": {
      icon: "🏭",
      summaryAr: "تصنيف مجموعات محطات العمل المتشابهة (مثل: خطوط التجميع، ماكينات CNC، أفران الطلاء) لتوزيع الأحمال.",
      summaryEn: "Categorize similar manufacturing machines and operator benches for capacity planning and load balancing.",
      stepsAr: ["إدخال مسمى نوع محطة العمل", "تحديد محطات العمل التابعة لهذا التصنيف", "استخدام التصنيف في تخطيط الطاقة الاستيعابية"],
      stepsEn: ["Enter workstation category name", "Assign individual physical machines/stations", "Utilize category for high-level shop floor capacity allocation"]
    },
    "Workstation": {
      icon: "⚙️",
      summaryAr: "تعريف الآلات وخطوط الإنتاج ومحطات التشغيل مع تحديد تكلفة الساعة وتكلفة الكهرباء وساعات العمل اليومية.",
      summaryEn: "Define specific machines, benches, and assembly lines with hourly labor, electricity, and overhead rates.",
      stepsAr: ["إدخال اسم محطة العمل ورمزها", "تحديد معدل تكلفة الساعة المباشرة والتشغيلية", "ربط المحطة بعمليات التصنيع في شجرة المنتج"],
      stepsEn: ["Enter workstation title and code", "Specify hourly operating cost, electricity, and rent rates", "Link workstation to relevant routing operations"]
    },
    "Operation": {
      icon: "🔄",
      summaryAr: "تعريف وتوحيد مسميات العمليات الصناعية (قطع، لحام، دهان، تجميع) لاستخدامها في مسارات الإنتاج.",
      summaryEn: "Define standard shop-floor manufacturing operations (cutting, welding, painting, assembly) for routing.",
      stepsAr: ["تسمية العملية الإنتاجية وإضافة وصف مختصر لها", "تحديد محطة العمل الافتراضية المناسبة لتنفيذها", "استخدام العملية عند بناء شجرة المنتج"],
      stepsEn: ["Name manufacturing operation and add standard operating procedure", "Assign default workstation", "Incorporate operation into product BOMs"]
    },
    "Routing": {
      icon: "🔀",
      summaryAr: "مسار التتابع التشغيلي الذي يحدد تسلسل العمليات ومحطات العمل وزمن كل مرحلة لتصنيع المنتج.",
      summaryEn: "Sequenced routing template defining sequential operations, workstations, and run-times for products.",
      stepsAr: ["إنشاء مسار تشغيلي جديد", "ترتيب العمليات الصناعية بالتتابع من البداية حتى الفحص النهائي", "ربط المسار بشجرة المنتج لاعتماده تلقائياً في أوامر العمل"],
      stepsEn: ["Create new routing template", "Sequence production operations from initial setup to final inspection", "Attach routing to product BOM to automate work order scheduling"]
    },

    "BOM Update Tool": {
      icon: "🔄",
      summaryAr: "أداة مركزية لاستبدال مادة خام أو مكون قديم بمنتج بديل في كافة أشجار المنتجات المعتمدة دفعة واحدة وتحديث تكاليفها.",
      summaryEn: "Bulk replace an obsolete raw material with a new product across all active BOMs and recalculate product costs.",
      stepsAr: ["اختيار المنتج الخام القديم المراد استبداله", "اختيار المنتج البديل الجديد", "الضغط على زر التحديث لتعديل كافة أشجار المنتجات المتأثرة فوراً"],
      stepsEn: ["Select current obsolete raw material", "Select replacement product", "Click Replace to propagate update across all active BOMs automatically"]
    },
    "BOM Comparison Tool": {
      icon: "⚖️",
      summaryAr: "أداة مقارنة متقدمة بين نسختين من شجرة المنتج أو بين منتجين مختلفين لتحديد الفروقات في الخامات والتكاليف.",
      summaryEn: "Side-by-side comparison tool comparing two BOM revisions or product structures to identify material differences.",
      stepsAr: ["اختيار شجرة المنتج الأولى (BOM 1)", "اختيار شجرة المنتج الثانية (BOM 2)", "مراجعة جدول الفروقات في المواد والكميات وتكلفة الإنتاج"],
      stepsEn: ["Select primary BOM version", "Select comparison BOM version", "Review differential table of raw materials, quantities, and cost variations"]
    },

    "Manufacturing Settings": {
      icon: "⚙️",
      summaryAr: "شاشة الضبط المركزي لمنظومة التصنيع؛ تشمل سياسات السحب التلقائي للخامات (Backflushing)، نسب الهدر المسموحة، واعتماد أوامر العمل.",
      summaryEn: "Core manufacturing configuration: raw material backflush policies, allowable scrap percentages, and production defaults.",
      stepsAr: ["تحديد سياسة صرف المواد الخام (يدوي عند البدء أو تلقائي Backflush)", "ضبط نسب التفاوت والهدر المسموح بها للمنتجات", "تفعيل خيارات التحقق من توفر الخامات قبل بدء أمر العمل"],
      stepsEn: ["Configure material consumption policy (manual or automatic backflush)", "Set allowable scrap thresholds and operational tolerances", "Enable raw material availability validation before work order release"]
    }
  };

  /* ─────────────────────────────────────────
     ٧. الدوال المساعدة
  ───────────────────────────────────────── */

  function translate(key) {
    if (!isArabic) return key;
    return translations[key] || key;
  }

  function escapeHtml(value) {
    return String(value ?? "")
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
     ٨. نافذة التفاصيل المنبثقة (Info Modal القياسية)
  ───────────────────────────────────────── */

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

    const existing = root.querySelector(".erp-modal-overlay") || document.querySelector(".erp-modal-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.className = "erp-modal-overlay";
    overlay.setAttribute("dir", isArabic ? "rtl" : "ltr");

    overlay.innerHTML = `
      <div class="erp-modal-box">
        <button type="button" class="erp-modal-close" data-modal-close aria-label="${isArabic ? "إغلاق" : "Close"}">✕</button>
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
     ٩. إنشاء بطاقات الإحصائيات
  ───────────────────────────────────────── */

  function renderStats() {
    if (!statsSection) return;

    statsSection.innerHTML = `
      <div class="erp-stats-grid">
        ${statsCards.map(c => `
          <div class="erp-stat-card" data-stat-id="${c.id}">
            <div class="erp-stat-icon">${c.short}</div>
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
          el.textContent = formatNumber(val);
        }
      });
    });
  }

  /* ─────────────────────────────────────────
     ١٠. إنشاء أزرار الاختصارات السريعة
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
            <button type="button" class="erp-quick-btn" data-btn-action="${escapeHtml(btn.doctype)}" ${btn.isReport ? 'data-is-report="1"' : ''} ${btn.isRoute ? `data-is-route="${escapeHtml(btn.isRoute)}"` : ''}>
              <span class="erp-quick-icon" aria-hidden="true">+</span>
              <span class="erp-quick-label">${escapeHtml(label)}</span>
            </button>`;
        }).join("")}
      </div>
    `;

    quickActions.addEventListener("click", event => {
      const btn = event.target.closest("[data-btn-action]");
      if (!btn || !window.frappe) return;
      const doctype = btn.dataset.btnAction;
      if (btn.dataset.isReport === "1") {
        frappe.set_route("query-report", doctype);
        return;
      }
      if (btn.dataset.isRoute) {
        frappe.set_route(btn.dataset.isRoute.split("/"));
        return;
      }
      frappe.new_doc(doctype);
    });
  }

  /* ─────────────────────────────────────────
     ١١. إنشاء بطاقات الوحدات والمربعات
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
     ١٢. إنشاء الفوتر
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
     ١٣. التوجيه وفتح الشاشات داخل النظام
  ───────────────────────────────────────── */

  function openRoute(name) {
    if (!window.frappe || typeof frappe.set_route !== "function") return;
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
     ١٤. معالجة الأحداث والضغط
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
     ١٥. بدء التشغيل
  ───────────────────────────────────────── */

  renderStats();
  renderQuickActions();
  renderSections();
  renderFooter();
})();
