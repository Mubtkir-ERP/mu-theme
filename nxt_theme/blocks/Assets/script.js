(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم الأصول الثابتة — ERPNext Assets
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
     ١. إحصائيات الأصول الثابتة
  ───────────────────────────────────────── */

  const statsCards = [
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
              filters: { docstatus: 1 }
            },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "book-value",
      short: "VAL",
      labelEn: "Total Asset Value",
      labelAr: "القيمة الإجمالية",
      isCurrency: true,
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_list",
            args: {
              doctype: "Asset",
              filters: { docstatus: 1 },
              fields: ["sum(gross_purchase_amount) as total"],
              limit_page_length: 0
            },
            callback: data => {
              const value = data?.message?.[0]?.total || 0;
              resolve(Number(value).toFixed(2));
            },
            error: () => resolve("0.00")
          });
        })
    },
    {
      id: "due-depreciation",
      short: "DEP",
      labelEn: "Pending Depreciation",
      labelAr: "إهلاكات مستحقة",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "Asset",
              filters: {
                docstatus: 1,
                status: ["in", ["Submitted", "Partially Depreciated"]]
              }
            },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "disposed-assets",
      short: "DSP",
      labelEn: "Disposed Assets",
      labelAr: "أصول مستبعدة",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "Asset",
              filters: {
                docstatus: 1,
                status: ["in", ["Scrapped", "Sold"]]
              }
            },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    }
  ];

  /* ─────────────────────────────────────────
     ٢. أزرار الاختصارات السريعة (تبقى كما هي)
  ───────────────────────────────────────── */

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

  /* ─────────────────────────────────────────
     ٣. إعدادات الفوتر
  ───────────────────────────────────────── */

  const footerInfo = {
    phone: "0115110455",
    email: "sales@mubtkir.com",
    website: "www.mubtkir.com",
    labels: {
      phoneEn: "Phone", phoneAr: "الهاتف الموحد",
      emailEn: "Email", emailAr: "البريد الإلكتروني",
      websiteEn: "Website", websiteAr: "الموقع"
    }
  };

  /* ─────────────────────────────────────────
     ٤. بطاقات الأصول — مطابقة للصورة الأصلية
  ───────────────────────────────────────── */

  const sections = [
    [
      "Reports & Masters",
      [
        [
          "Assets",
          "🏢",
          [
            "Asset",
            "Location",
            "Asset Category",
            "Asset Movement",
            "Department"
          ]
        ],
        [
          "Maintenance",
          "🛠️",
          [
            "Asset Maintenance Team",
            "Asset Maintenance",
            "Asset Maintenance Log",
            "Asset Value Adjustment",
            "Asset Repair",
            "Asset Capitalization"
          ]
        ],
        [
          "Reports",
          "📊",
          [
            "Asset Depreciation Ledger",
            "Asset Depreciations and Balances",
            "Asset Maintenance",
            "Asset Activity"
          ]
        ]
      ]
    ]
  ];

  /* ─────────────────────────────────────────
     ٥. الترجمات العربية
  ───────────────────────────────────────── */

  const arabicFallback = {
    "Reports & Masters": "التقارير والبيانات الرئيسية",

    // البطاقة ١: الأصول
    "Assets": "الأصول",
    "Asset": "الأصول",
    "Location": "الموقع",
    "Asset Location": "الموقع",
    "Asset Category": "فئة الأصول",
    "Asset Movement": "حركة الأصول",
    "Department": "قسم",

    // البطاقة ٢: الصيانة
    "Maintenance": "الصيانة",
    "Asset Maintenance Team": "فريق صيانة الأصول",
    "Asset Maintenance": "صيانة الأصول",
    "Asset Maintenance Log": "سجل صيانة الأصول",
    "Asset Value Adjustment": "تعديل قيمة الأصول",
    "Asset Repair": "إصلاح الأصول",
    "Asset Capitalization": "رسملة الأصول",

    // البطاقة ٣: التقارير
    "Reports": "التقارير",
    "Asset Depreciation Ledger": "دفتر أستاذ إهلاك الأصول",
    "Asset Depreciations and Balances": "إهلاكات وأرصدة الأصول",
    "Asset Activity": "نشاط الأصول",

    // الاختصارات
    "Purchase Invoice": "فاتورة مشتريات"
  };

  /* ─────────────────────────────────────────
     ٦. أنواع المسارات
  ───────────────────────────────────────── */

  const reportNames = new Set([
    "Asset Depreciation Ledger",
    "Asset Depreciations and Balances",
    "Asset Activity"
  ]);

  const treeDocs = new Set([
    "Location",
    "Asset Location",
    "Department"
  ]);

  const singleDocs = new Set([]);

  /* ─────────────────────────────────────────
     ٧. تفاصيل الشاشات (ما عدا التقارير)
  ───────────────────────────────────────── */

  const itemDescriptions = {
    "Asset": {
      icon: "🏢",
      summaryAr: "تعريف وإدارة الأصول الثابتة وحساب الإهلاك وتتبع القيمة الدفترية ومواقع الأصول والمسؤولين عنها.",
      summaryEn: "Define and manage fixed assets, calculate depreciation, and track book value, asset locations, and custodians.",
      stepsAr: [
        "اضغط «أصل جديد»",
        "أدخل اسم الأصل وفئة الأصل",
        "حدد تاريخ الشراء وقيمة الشراء الإجمالية",
        "اختر موقع الأصل والقسم والمسؤول",
        "اضبط إعدادات الإهلاك (طريقة الإهلاك وعدد الأقساط)",
        "اضغط «حفظ» ثم «تسجيل» لتنشيط الأصل"
      ],
      stepsEn: [
        "Click «New Asset»",
        "Enter asset name and select asset category",
        "Set purchase date and gross purchase amount",
        "Select asset location, department, and custodian",
        "Configure depreciation settings (method and number of depreciations)",
        "Click «Save» then «Submit» to activate asset"
      ]
    },

    "Location": {
      icon: "📍",
      summaryAr: "إدارة الهيكل الشجري للمواقع الجغرافية والمباني والفروع والمستودعات التي تتواجد بها الأصول.",
      summaryEn: "Manage tree structure of geographical locations, buildings, branches, and warehouses where assets reside.",
      stepsAr: [
        "اضغط «موقع جديد»",
        "أدخل اسم الموقع (مثل: المبنى الرئيسي - الطابق الأول)",
        "اختر الموقع الأب إذا كان موقعاً فرعياً",
        "حدد ما إذا كان الموقع مجموعة تضم مواقع أخرى",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Location»",
        "Enter location name (e.g. Main Building - 1st Floor)",
        "Select parent location if it is a sub-location",
        "Check if it is a group location containing sub-locations",
        "Click «Save»"
      ]
    },

    "Asset Category": {
      icon: "🏷️",
      summaryAr: "تصنيف الأصول الثابتة (مثل: أجهزة، مركبات، مباني) وتحديد حسابات الإهلاك والأصول وحسابات المصروفات التلقائية لكل فئة.",
      summaryEn: "Classify fixed assets (e.g., equipment, vehicles, buildings) and define automatic depreciation, asset, and expense accounts per category.",
      stepsAr: [
        "اضغط «فئة أصل جديدة»",
        "أدخل اسم الفئة",
        "حدد الحسابات المالية (حساب الأصول الثابتة، حساب مخصص الإهلاك، حساب مصروف الإهلاك)",
        "اضبط طريقة الإهلاك الافتراضية والمدة الزمنية",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Asset Category»",
        "Enter category name",
        "Set finance accounts (Fixed Asset Account, Accumulated Depreciation Account, Depreciation Expense Account)",
        "Configure default depreciation method and lifespan",
        "Click «Save»"
      ]
    },

    "Asset Movement": {
      icon: "🔄",
      summaryAr: "تسجيل نقل الأصل من موقع إلى موقع آخر أو تسليمه لموظف أو استلامه ونقله بين الأقسام.",
      summaryEn: "Record asset transfer from one location to another, issue to an employee, or transfer between departments.",
      stepsAr: [
        "اضغط «حركة أصل جديدة»",
        "اختر غرض الحركة (نقل، تسليم، إرجاع)",
        "اختر الأصل المراد نقله",
        "حدد الموقع السابق والموقع الجديد أو الموظف المستلم",
        "أدخل تاريخ الحركة وملاحظات النقل",
        "اضغط «حفظ» ثم «تسجيل»"
      ],
      stepsEn: [
        "Click «New Asset Movement»",
        "Select movement purpose (Transfer, Issue, Receipt)",
        "Select the asset to move",
        "Specify source and target locations or receiving employee",
        "Enter movement date and remarks",
        "Click «Save» then «Submit»"
      ]
    },

    "Department": {
      icon: "👥",
      summaryAr: "إدارة الهيكل الإداري والأقسام في المنشأة لربط الأصول والمصروفات ومراكز المسؤولية بكل قسم.",
      summaryEn: "Manage organizational structure and departments to link assets, expenses, and responsibility centers to each department.",
      stepsAr: [
        "اضغط «قسم جديد»",
        "أدخل اسم القسم (مثل: المالية، تقنية المعلومات، الصيانة)",
        "اختر القسم الأب في الهيكل التنظيمي",
        "اربط مركز التكلفة الافتراضي إن وجد",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Department»",
        "Enter department name (e.g. Finance, IT, Maintenance)",
        "Select parent department in the organizational hierarchy",
        "Link default cost center if applicable",
        "Click «Save»"
      ]
    },

    "Asset Maintenance Team": {
      icon: "👷",
      summaryAr: "تعريف وإدارة فرق الصيانة والفنيين المسؤولين عن صيانة الأصول وتوزيع المهام وجداول المتابعة.",
      summaryEn: "Define and manage maintenance teams and technicians responsible for asset maintenance and task distribution.",
      stepsAr: [
        "اضغط «فريق صيانة أصول جديد»",
        "أدخل اسم فريق الصيانة ومدير الفريق",
        "أضف أعضاء الفريق والفنيين وتخصصاتهم",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Asset Maintenance Team»",
        "Enter team name and team manager",
        "Add team members, technicians, and specialties",
        "Click «Save»"
      ]
    },

    "Asset Maintenance": {
      icon: "🛠️",
      summaryAr: "جدولة خطط الصيانة الدورية والوقائية للأصول وتحديد فترات التكرار وفريق العمل المسؤول.",
      summaryEn: "Schedule periodic and preventive asset maintenance plans, setting frequency and assigned maintenance teams.",
      stepsAr: [
        "اضغط «صيانة أصل جديدة»",
        "اختر الأصل المراد جدولته للصيانة",
        "اختر فريق الصيانة المسؤول",
        "أضف مهام الصيانة المطلوبة وفترات تكرارها (يومية، شهرية، سنوية)",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Asset Maintenance»",
        "Select asset to schedule for maintenance",
        "Select assigned maintenance team",
        "Add required maintenance tasks and periodicity (daily, monthly, yearly)",
        "Click «Save»"
      ]
    },

    "Asset Maintenance Log": {
      icon: "📝",
      summaryAr: "تسجيل تفاصيل تنفيذ عمليات الصيانة الفعلية وتوثيق حالة الإنجاز وقطع الغيار والتكاليف المستهلكة.",
      summaryEn: "Log actual maintenance execution details, documentation, completion status, spare parts used, and incurred costs.",
      stepsAr: [
        "اضغط «سجل صيانة أصل جديد»",
        "اختر خطة صيانة الأصل والمهمة المنجزة",
        "حدد تاريخ البدء وتاريخ الانتهاء الفعلي",
        "سجل حالة الصيانة (مكتملة، معلقة، قيد التنفيذ)",
        "أدخل تكلفة الصيانة وملاحظات الفني",
        "اضغط «حفظ» ثم «تسجيل»"
      ],
      stepsEn: [
        "Click «New Asset Maintenance Log»",
        "Select asset maintenance plan and completed task",
        "Specify actual start and completion dates",
        "Record maintenance status (Completed, Pending, In Progress)",
        "Enter maintenance cost and technician remarks",
        "Click «Save» then «Submit»"
      ]
    },

    "Asset Value Adjustment": {
      icon: "⚖️",
      summaryAr: "إعادة تقييم القيمة الدفترية للأصل بالزيادة أو النقصان وتوليد قيود تسوية محاسبية تلقائية.",
      summaryEn: "Revalue asset book value upwards or downwards, generating automatic accounting adjustment entries.",
      stepsAr: [
        "اضغط «تعديل قيمة أصل جديد»",
        "اختر الأصل المعني بالتعديل",
        "حدد تاريخ التعديل",
        "أدخل القيمة الدفترية الجديدة للأصل",
        "حدد حساب تسوية الأرباح والخسائر الناتجة عن التقييم",
        "اضغط «حفظ» ثم «تسجيل»"
      ],
      stepsEn: [
        "Click «New Asset Value Adjustment»",
        "Select the asset to adjust",
        "Specify adjustment date",
        "Enter the new asset book value",
        "Select the gain/loss adjustment account",
        "Click «Save» then «Submit»"
      ]
    },

    "Asset Repair": {
      icon: "🔧",
      summaryAr: "إدارة أوامر إصلاح الأعطال الطارئة للأصول وتتبع فترات التوقف وتكاليف الإصلاح وقطع الغيار.",
      summaryEn: "Manage emergency breakdown repair orders for assets, tracking downtime, repair costs, and consumed parts.",
      stepsAr: [
        "اضغط «إصلح أصل جديد»",
        "اختر الأصل المتضرر وحدد سبب العطل وتاريخه",
        "حدد ما إذا كان الإصلاح داخلياً أو عبر مزود خدمة خارجي",
        "أضف قطع الغيار وتكاليف العمل",
        "سجل تاريخ اكتمال الإصلاح وعودة الأصل للعمل",
        "اضغط «حفظ» ثم «تسجيل»"
      ],
      stepsEn: [
        "Click «New Asset Repair»",
        "Select damaged asset, failure reason, and date",
        "Specify if repair is in-house or via external service provider",
        "Add spare parts and labor costs",
        "Record repair completion date and return to service",
        "Click «Save» then «Submit»"
      ]
    },

    "Asset Capitalization": {
      icon: "🏗️",
      summaryAr: "رسملة مشاريع الأصول قيد الإنشاء أو تجميع تكاليف المواد والمصروفات لتحويلها إلى أصل رأسمالي مكتمل.",
      summaryEn: "Capitalize Capital Work-In-Progress (CWIP) projects or aggregate materials and expenses into a completed fixed asset.",
      stepsAr: [
        "اضغط «رسملة أصل جديدة»",
        "اختر الأصل المستهدف أو أنشئ أصلاً جديداً",
        "أضف المواد المستهلكة من المخزون أو فواتير الخدمات المرتبطة بالمشروع",
        "راجع إجمالي التكاليف المجمعة للرسملة",
        "اضغط «حفظ» ثم «تسجيل» لإنشاء الأصل الرأسمالي رسمياً"
      ],
      stepsEn: [
        "Click «New Asset Capitalization»",
        "Select target asset or create a new asset",
        "Add consumed stock items or service invoices linked to the project",
        "Review total capitalized cost",
        "Click «Save» then «Submit» to formally capitalize the asset"
      ]
    }
  };

  /* ─────────────────────────────────────────
     ٨. دوال مساعدة
  ───────────────────────────────────────── */

  function translate(name) {
    if (!isArabic) return name;
    if (arabicFallback[name]) return arabicFallback[name];
    if (typeof window.__ === "function") return window.__(name);
    return name;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatNumber(num) {
    const n = parseFloat(num) || 0;
    if (n % 1 !== 0) {
      return n.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    return n.toLocaleString("en-US");
  }

  /* ─────────────────────────────────────────
     ٩. نافذة التفاصيل المنبثقة
  ───────────────────────────────────────── */

  function showInfoModal(itemName) {
    const data = itemDescriptions[itemName];
    if (!data) return;

    const modalId = "erp-asset-info-modal";
    let modal = document.getElementById(modalId);
    if (modal) modal.remove();

    const title = translate(itemName);
    const summary = isArabic ? data.summaryAr : data.summaryEn;
    const steps = isArabic ? data.stepsAr : data.stepsEn;
    const hasSteps = Array.isArray(steps) && steps.length > 0;
    const stepsTitle = isArabic ? "خطوات العمل:" : "Step-by-step Guide:";
    const closeText = isArabic ? "إغلاق" : "Close";

    modal = document.createElement("div");
    modal.id = modalId;
    modal.className = "erp-modal-overlay";
    modal.setAttribute("dir", isArabic ? "rtl" : "ltr");

    modal.innerHTML = `
      <div class="erp-modal-dialog" role="dialog" aria-modal="true">
        <div class="erp-modal-header">
          <div class="erp-modal-title-wrap">
            <span class="erp-modal-icon">${data.icon || "📄"}</span>
            <h3 class="erp-modal-title">${escapeHtml(title)}</h3>
          </div>
          <button type="button" class="erp-modal-close" data-modal-close aria-label="${closeText}">×</button>
        </div>
        <div class="erp-modal-body">
          <p class="erp-modal-summary">${escapeHtml(summary)}</p>
          ${hasSteps ? `
            <div class="erp-modal-steps-section">
              <h4 class="erp-modal-steps-heading">${stepsTitle}</h4>
              <ol class="erp-modal-steps-list">
                ${steps.map(step => `<li>${escapeHtml(step)}</li>`).join("")}
              </ol>
            </div>
          ` : ""}
        </div>
        <div class="erp-modal-footer">
          <button type="button" class="erp-modal-btn" data-modal-close>${closeText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => modal.remove();
    modal.querySelectorAll("[data-modal-close]").forEach(el => {
      el.addEventListener("click", closeModal);
    });
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  /* ─────────────────────────────────────────
     ١٠. إنشاء بطاقات الإحصائيات
  ───────────────────────────────────────── */

  function renderStats() {
    if (!statsSection) return;

    statsSection.innerHTML = `
      <div class="erp-stats-grid">
        ${statsCards.map(c => `
          <div class="erp-stat-card" data-stat-id="${escapeHtml(c.id)}">
            <div class="erp-stat-badge">${escapeHtml(c.short)}</div>
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
          el.textContent = c.isCurrency ? `${formatNumber(val)} SAR` : formatNumber(val);
        }
      });
    });
  }

  /* ─────────────────────────────────────────
     ١١. إنشاء أزرار الاختصارات السريعة
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
            <button type="button" class="erp-quick-btn" data-new-doc="${escapeHtml(btn.doctype)}">
              <span class="erp-quick-icon" aria-hidden="true">+</span>
              <span class="erp-quick-label">${escapeHtml(label)}</span>
            </button>`;
        }).join("")}
      </div>
    `;

    quickActions.addEventListener("click", event => {
      const btn = event.target.closest("[data-new-doc]");
      if (!btn) return;
      const doctype = btn.dataset.newDoc;
      if (window.frappe && typeof frappe.new_doc === "function") {
        frappe.new_doc(doctype);
      }
    });
  }

  /* ─────────────────────────────────────────
     ١٢. إنشاء بطاقات الوحدات والمربعات
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
              const detailsLabel = isArabic ? "تفاصيل" : "Details";
              const infoBtn = desc
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
     ١٣. إنشاء الفوتر
  ───────────────────────────────────────── */

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
     ١٤. التوجيه وفتح الشاشات داخل النظام
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
     ١٥. معالجة الأحداث والضغط
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
     ١٦. التهيئة الأولية
  ───────────────────────────────────────── */

  renderStats();
  renderQuickActions();
  renderSections();
  renderFooter();
})();
