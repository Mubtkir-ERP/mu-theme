(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم مطالبات المصروفات — Expense Claims Workspace
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
     ١. أزرار الوصول السريع (Your Shortcuts)
  ───────────────────────────────────────── */

  const quickActionButtons = [
    { labelEn: "Expense Claim", labelAr: "مطالبات المصروفات", doctype: "Expense Claim", hasCount: true, countSuffixEn: "Pending", countSuffixAr: "معلق", color: "#f59e0b" },
    { labelEn: "Employee Advance", labelAr: "سلف الموظفين", doctype: "Employee Advance", hasCount: true, countSuffixEn: "Unclaimed", countSuffixAr: "غير مسترد", color: "#10b981" },
    { labelEn: "Dashboard", labelAr: "لوحة المصروفات", route: "expense-claims-dashboard", color: "#64748b" }
  ];

  /* ─────────────────────────────────────────
     ٢. هيكل الأقسام والبطاقات (مطابق تماماً للصورة)
  ───────────────────────────────────────── */

  const sections = [
    [
      "Masters & Reports",
      [
        [
          "Claims",
          "💰",
          [
            "Expense Claim",
            "Expense Claim Type"
          ]
        ],
        [
          "Advances",
          "💵",
          [
            "Employee Advance",
            "Payment Entry",
            "Journal Entry",
            "Additional Salary"
          ]
        ],
        [
          "Fleet Management",
          "🚗",
          [
            "Vehicle",
            "Driver",
            "Vehicle Service Item",
            "Vehicle Log",
            "Vehicle Expenses"
          ]
        ],
        [
          "Travel",
          "✈️",
          [
            "Travel Request",
            "Purpose of Travel"
          ]
        ],
        [
          "Reports",
          "📊",
          [
            "Employee Advance Summary",
            "Unpaid Expense Claim",
            "Vehicle Expenses"
          ]
        ],
        [
          "Accounting Reports",
          "📑",
          [
            "Accounts Receivable",
            "Accounts Payable",
            "General Ledger"
          ]
        ]
      ]
    ]
  ];

  /* ─────────────────────────────────────────
     ٣. أنواع المستندات الفردية والشجرية والتقارير
  ───────────────────────────────────────── */

  const singleDocs = new Set([]);

  const treeDocs = new Set([]);

  // التقارير المستثناة من زر التفاصيل
  const reportNames = new Set([
    "Employee Advance Summary",
    "Unpaid Expense Claim",
    "Vehicle Expenses",
    "Accounts Receivable",
    "Accounts Payable",
    "General Ledger"
  ]);

  const customRoutes = {
    "Dashboard": ["expense-claims-dashboard"]
  };

  /* ─────────────────────────────────────────
     ٤. الترجمات العربية
  ───────────────────────────────────────── */

  const arabicFallback = {
    "Your Shortcuts": "اختصاراتك السريعة",
    "Masters & Reports": "البيانات والتقارير",

    "Claims": "المطالبات والنفقات",
    "Expense Claim": "مطالبة مصروفات",
    "Expense Claim Type": "أنواع المصروفات والنفقات",

    "Advances": "السلف والعهد المالية",
    "Employee Advance": "سلفة موظف",
    "Payment Entry": "سند صرف / دفع",
    "Journal Entry": "قيد يومية",
    "Additional Salary": "راتب إضافي / استقطاع",

    "Fleet Management": "إدارة أسطول المركبات",
    "Vehicle": "المركبة",
    "Driver": "السائق",
    "Vehicle Service Item": "منتج خدمة المركبة",
    "Vehicle Log": "سجل رحلات ووقود المركبة",
    "Vehicle Expenses": "مصروفات المركبات",

    "Travel": "الانتدابات والسفر",
    "Travel Request": "طلب انتداب وسفر",
    "Purpose of Travel": "أغراض وأسباب السفر",

    "Reports": "التقارير",
    "Employee Advance Summary": "ملخص سلف الموظفين",
    "Unpaid Expense Claim": "مطالبات المصروفات غير المسددة",

    "Accounting Reports": "التقارير المحاسبية",
    "Accounts Receivable": "أعمار الديون والمدينون",
    "Accounts Payable": "مستحقات الموردين والدائنون",
    "General Ledger": "دفتر الأستاذ العام",

    "Dashboard": "لوحة المصروفات"
  };

  /* ─────────────────────────────────────────
     ٥. أوصاف المستندات والإعدادات (مع خطوات تفصيلية)
  ───────────────────────────────────────── */

  const itemDescriptions = {
    "Expense Claim": {
      icon: "💰",
      summaryAr: "تقديم ومراجعة مطالبات استرداد المصروفات النثرية ونفقات العمل التي دفعها الموظف.",
      summaryEn: "Submit and process employee business expense claims for reimbursement with receipts.",
      stepsAr: ["إنشاء مطالبة مصروفات جديدة وإرفاق فواتير الشراء والإيصالات", "تحديد بنود المصروفات والمبالغ المستحقة ومركز التكلفة", "اعتماد المطالبة وترحيل سند الصرف لتعويض الموظف"],
      stepsEn: ["Create expense claim and attach receipts and invoices", "Itemize expense categories, amounts, and cost center", "Submit claim for approval and payment reimbursement entry"]
    },
    "Expense Claim Type": {
      icon: "🏷️",
      summaryAr: "تعريف وتصنيف أنواع المصروفات (ضيافة، وقود، قرطاسية، اتصالات) وربط كل نوع بالحساب المحاسبي المعتمد.",
      summaryEn: "Configure expense categories (travel, meals, stationery) and link to default GL expense accounts.",
      stepsAr: ["إدخال مسمى نوع المصروف بالعربية والإنجليزية", "تحديد حساب المصروف الافتراضي في شجرة الحسابات", "حفظ النوع لتمكين الموظفين من اختياره في المطالبات"],
      stepsEn: ["Enter expense type name and code", "Map default expense account in Chart of Accounts", "Save type to make available in employee claim forms"]
    },

    "Employee Advance": {
      icon: "💵",
      summaryAr: "تسجيل وصرف السلف النقدية المؤقتة للموظفين وجدولة استقطاعها من الرواتب الشهرية.",
      summaryEn: "Disburse employee cash advances and schedule automated salary deductions.",
      stepsAr: ["إنشاء طلب سلفة للموظف وتحديد المبلغ والغرض", "تحديد الحساب المالي للصرف وطريقة الاسترداد من الراتب", "اعتماد السلفة وصرف المبلغ وجدولة أقساط السداد"],
      stepsEn: ["Create advance request, entering amount and business purpose", "Select disbursing cash/bank account and repayment mode", "Approve advance to generate payment and deduction schedule"]
    },
    "Payment Entry": {
      icon: "💳",
      summaryAr: "سند صرف وسداد مبالغ المطالبات والسلف النقدية للموظفين من الخزينة أو الحساب البنكي.",
      summaryEn: "Issue payment vouchers to settle employee claims and advance disbursements from bank/cash.",
      stepsAr: ["إنشاء سند صرف واختيار الموظف والحساب المصرفي الدافع", "مطابقة السند مع مطالبة المصروفات أو السلفة المعتمدة", "اعتماد وترحيل السند لتسوية المستحق محاسبياً"],
      stepsEn: ["Create Payment Entry selecting employee and paying bank account", "Allocate payment against approved expense claim or advance", "Submit voucher to update general ledger balances"]
    },
    "Journal Entry": {
      icon: "📑",
      summaryAr: "إجراء القيود المحاسبية اليدوية لتسوية العهد المالية ومصروفات الموظفين بين مراكز التكلفة والحسابات.",
      summaryEn: "Manual journal entries to adjust, reclassify, or reconcile employee advances and expenses.",
      stepsAr: ["تحديد تاريخ القيد وإدخال الحسابات المدينة والدائنة", "تحديد الموظف ومركز التكلفة وشرح القيد المحاسبي", "مراجعة توازن القيد واعتماده وترحيله لدفتر الأستاذ"],
      stepsEn: ["Set voucher date and specify debit and credit accounts", "Tag employee and cost center with clear narration", "Verify balance and submit entry to General Ledger"]
    },
    "Additional Salary": {
      icon: "➕",
      summaryAr: "إضافة بدلات ومكافآت إضافية أو خصومات واستقطاعات سلف مباشرة على مسير الراتب القادم.",
      summaryEn: "Inject recurring or one-time earning allowances or advance deductions into payroll.",
      stepsAr: ["اختيار الموظف وعنصر الراتب (بدل إضافي أو استقطاع سلفة)", "تحديد المبلغ وشهر المسير المستهدف", "اعتماد السجل لدمجه تلقائياً عند توليد مسيرات الرواتب"],
      stepsEn: ["Select employee and salary component (allowance or advance deduction)", "Set monetary amount and target payroll cycle month", "Submit record to reflect automatically on next salary slip"]
    },

    "Vehicle": {
      icon: "🚗",
      summaryAr: "سجل أسطول المركبات والسيارات؛ بيانات اللوحة، الموديل، السائق المسؤول، وتواريخ الفحص والتأمين.",
      summaryEn: "Fleet vehicle register: license plate, chassis, assigned driver, inspection, and insurance.",
      stepsAr: ["إدخال رقم لوحة المركبة والموديل وسنة الصنع", "تعيين السائق المسؤول وتحديد قراءة العداد الأولية", "حفظ المركبة لمتابعة مصاريف الوقود والصيانة دورياً"],
      stepsEn: ["Register license plate number, vehicle make, and model", "Assign responsible driver and initial odometer reading", "Save vehicle to track fuel expenses and service history"]
    },
    "Driver": {
      icon: "👤",
      summaryAr: "سجل السائقين والمناديب؛ بيانات الاتصال، رقم رخصة القيادة، الفئة، وتاريخ الانتهاء.",
      summaryEn: "Fleet drivers registry: driving license details, category, contact, and expiry dates.",
      stepsAr: ["تسجيل بيانات السائق وربطه بملف الموظف إن وجد", "تسجيل رقم رخصة القيادة وفئتها وتاريخ انتهائها", "حفظ السائق لتعيينه على المركبات ورحلات العمل"],
      stepsEn: ["Record driver profile and link to employee record if applicable", "Enter driving license number, category, and expiry date", "Save driver to assign across company vehicles and trips"]
    },
    "Vehicle Service Item": {
      icon: "🔧",
      summaryAr: "تعريف وتحديد المنتجات وقطع الغيار والزيوت المعتمدة لخدمة وصيانة أسطول المركبات.",
      summaryEn: "Master catalog of approved vehicle maintenance service items, parts, and consumables.",
      stepsAr: ["إدخال اسم منتج الخدمة (مثل: زيت محرك، فلاتر، إطارات)", "تحديد السعر الافتراضي وفترة التكرار بالكيلومتر", "حفظ منتج الخدمة لربطه بسجلات صيانة المركبات"],
      stepsEn: ["Enter vehicle service item name (e.g. Engine Oil, Tires, Filters)", "Set standard baseline unit price and service interval km", "Save service item to track regular fleet maintenance"]
    },
    "Vehicle Log": {
      icon: "⛽",
      summaryAr: "سجل استهلاك الوقود ومصروفات التشغيل وقراءات العداد الدورية لكل رحلة مركبة.",
      summaryEn: "Vehicle fuel log: record odometer readings, fuel liters, costs, and service logs.",
      stepsAr: ["إنشاء سجل حركة للمركبة وتسجيل قراءة العداد الحالية", "تسجيل لترات وتكلفة الوقود المدفوعة وإرفاق الفاتورة", "حفظ السجل لاحتساب معدل استهلاك الوقود لكل كيلومتر"],
      stepsEn: ["Create vehicle log entry and record current odometer value", "Log fuel volume liters, total cost, and receipt invoice", "Save log to calculate fuel consumption efficiency per km"]
    },

    "Travel Request": {
      icon: "✈️",
      summaryAr: "إدارة طلبات انتداب وسفر الموظفين؛ حجز التذاكر، بدلات السفر، ومصروفات الإقامة والتنقل.",
      summaryEn: "Corporate business travel requests: itineraries, allowances, accommodation, and per diems.",
      stepsAr: ["إنشاء طلب سفر وتحديد وجهة الانتداب وفترة السفر", "تحديد بدلات الانتداب المستحقة وتكاليف الإقامة والانتقال", "اعتماد الطلب وصرف البدلات وتوثيق تقرير المهمة عند العودة"],
      stepsEn: ["Create travel request with destination and travel dates", "Calculate travel per diem allowance and accommodation costs", "Submit for authorization and disburse travel advance"]
    },
    "Purpose of Travel": {
      icon: "🏷️",
      summaryAr: "تعريف وتصنيف أغراض الانتداب والسفر (مهمة عمل، حضور مؤتمر، تدريب، زيارة عميل).",
      summaryEn: "Define standardized travel justification reasons (conference, client visit, audit).",
      stepsAr: ["إدخال مسمى غرض السفر وتوصيفه الإداري", "تحديد سياسة البدلات المصاحبة لهذا الغرض", "حفظ الغرض لتمكين الموظفين من اختياره في طلبات السفر"],
      stepsEn: ["Enter travel purpose category title and policy context", "Define applicable allowance and per diem entitlement rules", "Save purpose to categorize employee travel applications"]
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

    const title = isArabic ? "اختصاراتك السريعة" : "Your Shortcuts";

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
              ${btn.hasCount ? `<span class="erp-stat-badge" data-badge-for="${escapeHtml(btn.doctype)}" style="margin-left: 8px; margin-right: 8px; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: rgba(245, 158, 11, 0.12); color: #d97706;">...</span>` : ""}
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
            if (el) {
              const val = formatNumber(r.message || 0);
              const suffix = btn.countSuffixEn ? (isArabic ? (" " + btn.countSuffixAr) : (" " + btn.countSuffixEn)) : "";
              el.textContent = val + suffix;
            }
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
