(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة الضرائب والمزايا — Tax & Benefits Workspace
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
    {
      labelEn: "Employee Tax Exemption Declaration",
      labelAr: "إقرار الإعفاء الضريبي للموظف",
      doctype: "Employee Tax Exemption Declaration",
      color: "#0284c7"
    },
    {
      labelEn: "Additional Salary",
      labelAr: "المستحقات الإضافية",
      doctype: "Additional Salary",
      countFilter: { docstatus: 0 },
      color: "#6366f1"
    },
    {
      labelEn: "Income Tax Computation",
      labelAr: "احتساب ضريبة الدخل",
      report: "Income Tax Computation",
      isReport: true,
      color: "#1e40af"
    }
  ];

  /* ─────────────────────────────────────────
     ٢. هيكل الأقسام والبطاقات (مطابق تماماً للصورة)
  ───────────────────────────────────────── */

  const sections = [
    [
      "Masters & Reports",
      [
        [
          "Tax Setup",
          "⚙️",
          [
            "Income Tax Slab",
            "Employee Tax Exemption Category",
            "Employee Tax Exemption Sub Category"
          ]
        ],
        [
          "Exemption",
          "🛡️",
          [
            "Employee Tax Exemption Declaration",
            "Employee Tax Exemption Proof Submission ..."
          ]
        ],
        [
          "Benefits",
          "🎁",
          [
            "Employee Benefit Application",
            "Employee Benefit Claim"
          ]
        ],
        [
          "Reports",
          "📊",
          [
            "Income Tax Computation",
            "Income Tax Deductions"
          ]
        ]
      ]
    ]
  ];

  /* ─────────────────────────────────────────
     ٣. التقارير والمستندات المفردة
  ───────────────────────────────────────── */

  const reportNames = new Set([
    "Income Tax Computation",
    "Income Tax Deductions"
  ]);

  const singleDocs = new Set([]);

  const treeDocs = new Set([]);

  const customRoutes = {
    "Employee Tax Exemption Proof Submission ...": "List/Employee Tax Exemption Proof Submission"
  };

  /* ─────────────────────────────────────────
     ٤. قاموس الترجمة العربية
  ───────────────────────────────────────── */

  const arabicFallback = {
    "Tax & Benefits": "الضرائب والمزايا",
    "Masters & Reports": "البيانات الأساسية والتقارير",
    "Tax Setup": "إعدادات الضرائب",
    "Exemption": "الإعفاءات الضريبية",
    "Benefits": "مزايا الموظفين",
    "Reports": "التقارير",

    "Income Tax Slab": "شرائح ضريبة الدخل",
    "Employee Tax Exemption Category": "فئات الإعفاء الضريبي للموظفين",
    "Employee Tax Exemption Sub Category": "الفئات الفرعية للإعفاء الضريبي",

    "Employee Tax Exemption Declaration": "إقرار الإعفاء الضريبي للموظف",
    "Employee Tax Exemption Proof Submission": "تقديم إثباتات الإعفاء الضريبي",
    "Employee Tax Exemption Proof Submission ...": "تقديم إثباتات الإعفاء الضريبي",

    "Employee Benefit Application": "طلب مزايا الموظف",
    "Employee Benefit Claim": "مطالبة صرف مزايا الموظف",

    "Income Tax Computation": "احتساب ضريبة الدخل",
    "Income Tax Deductions": "استقطاعات ضريبة الدخل"
  };

  /* ─────────────────────────────────────────
     ٥. شروحات وتفاصيل الشاشات التشغيلية والإعدادات
  ───────────────────────────────────────── */

  const itemDescriptions = {
    "Income Tax Slab": {
      icon: "⚖️",
      summaryAr: "تعريف شرائح ضريبة الدخل والنسب المعفاة والنسب المطبقة بحسب الأنظمة والقوانين الضريبية السائدة.",
      summaryEn: "Configure income tax slabs, exemptions, and standard deduction brackets according to local regulations.",
      stepsAr: [
        "تحديد سنة التقييم والأنظمة الضريبية المعمول بها",
        "إدخال نطاقات الدخل (من - إلى) ونسبة الضريبة لكل شريحة",
        "تحديد الإعفاءات القياسية والخصومات النظامية",
        "حفظ واعتماد جدول الشرائح الضريبية"
      ],
      stepsEn: [
        "Specify assessment year and applicable tax regime",
        "Define taxable income ranges (From - To) and applicable rates",
        "Set standard deductions and applicable exemptions",
        "Save and submit tax slab configuration"
      ]
    },
    "Employee Tax Exemption Category": {
      icon: "📁",
      summaryAr: "تصنيف الفئات الرئيسية للإعفاءات الضريبية المعترف بها نظاماً (مثل التأمين الصحي، الاستثمارات، التبرعات).",
      summaryEn: "Categorize main income tax exemption categories recognized by regulations (health, insurance, investments).",
      stepsAr: [
        "إدخال مسمى فئة الإعفاء الضريبي",
        "تحديد الحد الأقصى لمبلغ الإعفاء السنوي المسموح به",
        "تحديد شروط الاستحقاق والمستندات المطلوبة",
        "حفظ الفئة لتفعيلها ضمن إقرارات الموظفين"
      ],
      stepsEn: [
        "Enter tax exemption category name",
        "Set maximum allowable exemption limit per fiscal year",
        "Define eligibility conditions and required documents",
        "Save category to activate for employee declarations"
      ]
    },
    "Employee Tax Exemption Sub Category": {
      icon: "📑",
      summaryAr: "تحديد الفئات الفرعية التفصيلية التابعة لكل فئة إعفاء ضريبي رئيسية لتنظيم بنود الإعفاءات الدقيقة.",
      summaryEn: "Define detailed sub-categories under primary tax exemptions to track specific deductible investments.",
      stepsAr: [
        "اختيار فئة الإعفاء الضريبي الرئيسية التابعة لها",
        "إدخال مسمى البند الفرعي والحد الأقصى للإعفاء",
        "تحديد نوع المستند المطلوب للإثبات الرسمي",
        "حفظ البند لتمكين الموظف من اختياره في إقراره"
      ],
      stepsEn: [
        "Select parent tax exemption category",
        "Enter sub-category name and allowable ceiling limit",
        "Specify proof document requirements",
        "Save sub-category for use in declarations"
      ]
    },
    "Employee Tax Exemption Declaration": {
      icon: "📝",
      summaryAr: "تسجيل إقرارات الموظفين السنوية بشأن النفقات والاستثمارات المعفاة ضريبياً لتعديل الاستقطاع الشهري.",
      summaryEn: "Record employee annual declarations of exempt expenses and investments to adjust monthly withholding.",
      stepsAr: [
        "اختيار الموظف وفترة الرواتب والسنة الضريبية",
        "إدراج بنود الإعفاءات والمبالغ المصرح بها لكل فئة",
        "التحقق من عدم تجاوز المبالغ للحدود القصوى المسموحة",
        "حفظ واعتماد الإقرار ليتم احتساب الإعفاء في قسائم الرواتب"
      ],
      stepsEn: [
        "Select employee, payroll period, and fiscal tax year",
        "Add exemption categories and declared investment amounts",
        "Verify declared totals do not exceed maximum caps",
        "Save and submit declaration to adjust monthly payroll tax"
      ]
    },
    "Employee Tax Exemption Proof Submission": {
      icon: "📎",
      summaryAr: "تقديم ومراجعة المستندات والإيصالات الرسمية الداعمة لإقرارات الإعفاء الضريبي للموظفين.",
      summaryEn: "Submit and verify official receipts and proof documents supporting employee tax exemption claims.",
      stepsAr: [
        "اختيار الموظف وإقرار الإعفاء الضريبي المعتمد",
        "إرفاق الفواتير والإيصالات ومستندات الإثبات لكل فئة",
        "مراجعة المبالغ الفعلية المثبتة ومطابقتها مع المصرح به",
        "اعتماد الإثباتات لتسوية فروقات الضرائب في الرواتب"
      ],
      stepsEn: [
        "Select employee and referenced tax declaration",
        "Upload receipts and official proof documents per category",
        "Verify verified actual amounts against declared totals",
        "Submit approval to reconcile tax differences in payroll"
      ]
    },
    "Employee Tax Exemption Proof Submission ...": {
      icon: "📎",
      summaryAr: "تقديم ومراجعة المستندات والإيصالات الرسمية الداعمة لإقرارات الإعفاء الضريبي للموظفين.",
      summaryEn: "Submit and verify official receipts and proof documents supporting employee tax exemption claims.",
      stepsAr: [
        "اختيار الموظف وإقرار الإعفاء الضريبي المعتمد",
        "إرفاق الفواتير والإيصالات ومستندات الإثبات لكل فئة",
        "مراجعة المبالغ الفعلية المثبتة ومطابقتها مع المصرح به",
        "اعتماد الإثباتات لتسوية فروقات الضرائب في الرواتب"
      ],
      stepsEn: [
        "Select employee and referenced tax declaration",
        "Upload receipts and official proof documents per category",
        "Verify verified actual amounts against declared totals",
        "Submit approval to reconcile tax differences in payroll"
      ]
    },
    "Employee Benefit Application": {
      icon: "📋",
      summaryAr: "تقديم طلبات الموظفين للحصول على المزايا والبدلات المرنة (كبدل الهاتف، السفر، التعليم) بحسب سياسة الشركة.",
      summaryEn: "Submit employee applications for flexible benefit packages (travel, phone, education) per policy.",
      stepsAr: [
        "اختيار الموظف وتاريخ سريان تطبيق المزايا",
        "تحديد بنود المزايا المرنة والمبالغ المخصصة لكل بند",
        "التحقق من عدم تجاوز إجمالي المزايا للميزانية المعتمدة",
        "حفظ واعتماد الطلب لربطه بهيكل وقسائم الرواتب"
      ],
      stepsEn: [
        "Select employee and effective date for benefits",
        "Specify benefit components and allocated monthly/annual limits",
        "Verify total benefits comply with approved employee grade cap",
        "Save and submit application to link to salary processing"
      ]
    },
    "Employee Benefit Claim": {
      icon: "💰",
      summaryAr: "تقديم مطالبات استرداد المبالغ المصروفة على المزايا المعتمدة وإرفاق فواتير المصاريف لصرفها مع الراتب.",
      summaryEn: "Submit employee reimbursement claims for utilized benefits with receipts to disburse via payroll.",
      stepsAr: [
        "اختيار الموظف وتاريخ المطالبة وبند الميزة المستحقة",
        "إدخال المبلغ المطالب به وإرفاق الفواتير وسندات السداد",
        "التحقق من رصيد المزايا المتبقي للموظف في تلك الفترة",
        "اعتماد المطالبة لصرفها وإدراجها بقسيمة الراتب التالية"
      ],
      stepsEn: [
        "Select employee, claim date, and approved benefit component",
        "Enter claimed amount and attach supporting invoices/receipts",
        "Verify remaining benefit balance for the employee",
        "Approve claim to disburse within the next salary slip"
      ]
    }
  };

  /* ─────────────────────────────────────────
     ٦. أدوات مساعدة
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

  /* ─────────────────────────────────────────
     ٧. نافذة التفاصيل المنبثقة القياسية المعتمدة
  ───────────────────────────────────────── */

  function showInfoModal(itemName) {
    const desc = itemDescriptions[itemName];
    const isSettingDoc = singleDocs.has(itemName);
    const title = translate(itemName);
    const summary = desc
      ? (isArabic ? desc.summaryAr : desc.summaryEn)
      : (isArabic ? "تفاصيل الشاشة وإجراءات العمل المعتمدة." : "Screen details and workflows.");

    const steps = desc
      ? (isArabic ? desc.stepsAr : desc.stepsEn)
      : (isArabic
          ? [
              "فتح الشاشة من القائمة",
              "إدخال البيانات والمعلومات المطلوبة",
              "حفظ واعتماد السجل في النظام"
            ]
          : [
              "Open screen from list",
              "Enter required information",
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
              <span class="erp-quick-badge" data-shortcut-badge="${idx}" style="display: none;"></span>
            </button>`;
        }).join("")}
      </div>
    `;

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
      if (item.report) {
        frappe.set_route("query-report", item.report);
        return;
      }
      if (item.doctype) {
        openRoute(item.doctype);
      }
    });

    fetchShortcutCounts();
  }

  function fetchShortcutCounts() {
    if (!window.frappe || typeof frappe.call !== "function") return;

    quickActionButtons.forEach((btn, idx) => {
      if (!btn.doctype || !btn.countFilter) return;

      frappe.call({
        method: "frappe.client.get_count",
        args: {
          doctype: btn.doctype,
          filters: btn.countFilter
        },
        callback: r => {
          const count = typeof r.message === "number" ? r.message : 0;
          const badge = quickActions.querySelector(`[data-shortcut-badge="${idx}"]`);
          if (badge) {
            badge.textContent = String(count);
            badge.style.display = "inline-block";
          }
        }
      });
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
      event.preventDefault();
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
