(() => {
  /* =========================================================
     MUBTKIR ERP — BANK RECONCILIATION WORKSPACE
     لوحة تحكم مطابقة البنك ومدى
     Aligned strictly with Mubtkir Brand Identity & bank_reconciliation.json
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
      console.error("Bank Reconciliation Route Error:", name, e);
    }
  }

  function newDoc(doctype) {
    try {
      if (window.frappe?.new_doc) {
        frappe.new_doc(doctype);
      }
    } catch (e) {
      console.error("Bank Reconciliation New Doc Error:", doctype, e);
    }
  }

  /* =========================================================
     3. TRANSLATIONS DICTIONARY
  ========================================================= */
  const arabicFallback = {
    // Headers & Labels
    "Bank Reconciliation": "مطابقة بنك مدى",
    "Operations & Reports": "العمليات والتسويات البنكية",
    "Operations & Settlements": "العمليات والتسويات البنكية",
    "Settings & Reports": "الإعدادات والتقارير",
    "Settlements & Terminals": "التسويات وأجهزة مدى",
    "Bank Reconciliation & Reports": "مطابقة بنك مدى",
    "Settings": "الإعدادات والتكوين",
    "Reports": "التقارير",

    // Links / Items
    "Mada Settlement Entry": "قيد تسوية مدى",
    "Mada Terminal": "أجهزة مدى (نقاط البيع)",
    "Mada Bank Reconciliation": "مطابقة بنك مدى",
    "Mada Reconciliation Status": "تقرير حالة مطابقة مدى",
    "Mada Reconciliation Settings": "إعدادات مطابقة مدى"
  };

  function translate(key) {
    if (!isArabic) return key;
    return arabicFallback[key] || key;
  }

  /* =========================================================
     4. ROUTE CLASSIFICATION
  ========================================================= */
  const reportNames = new Set([
    "Mada Reconciliation Status"
  ]);

  const singleDocs = new Set([
    "Mada Reconciliation Settings"
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
     6. BANK RECONCILIATION CYCLE (دورة المطابقة البنكية)
  ========================================================= */
  const cycleCards = [
    {
      step: 1,
      action: "new",
      doctype: "Mada Terminal",
      labelAr: "تعريف الأجهزة",
      labelEn: "Terminals Setup",
      descAr: "تعريف أجهزة نقاط البيع وربط المعرفات بالحسابات البنكية.",
      descEn: "Register POS terminals and link terminal IDs to bank accounts."
    },
    {
      step: 2,
      action: "new",
      doctype: "Mada Bank Reconciliation",
      labelAr: "استيراد الكشف",
      labelEn: "Import Statement",
      descAr: "استيراد كشف حساب البنك وسحب حركات مدى لمطابقتها.",
      descEn: "Import bank statements and fetch Mada transactions to reconcile."
    },
    {
      step: 3,
      action: "new",
      doctype: "Mada Settlement Entry",
      labelAr: "قيد التسوية",
      labelEn: "Settlement Entry",
      descAr: "إنشاء قيد تسوية مبالغ مدى وعمولات العمليات والضريبة وصافي الإيداع.",
      descEn: "Create settlement entries for Mada payouts, fees, VAT, and deposits."
    },
    {
      step: 4,
      action: "report",
      report: "Mada Reconciliation Status",
      labelAr: "تقرير المطابقة",
      labelEn: "Reconciliation Status",
      descAr: "مراجعة تقرير حالة المطابقة والتحقق من عدم وجود أي فروقات معلقة.",
      descEn: "Review reconciliation status report and ensure zero variances."
    }
  ];

  /* =========================================================
     7. OVERVIEW / STATS (نظرة عامة — 4 بطاقات)
     سحب الأرقام من سجلات التسوية ودفتر الأستاذ
  ========================================================= */
  const statsCards = [
    {
      id: "settlements-total",
      short: "SAR",
      labelAr: "إجمالي التسويات",
      labelEn: "Total Settlements",
      currency: true,
      fetch: async () => {
        return new Promise(resolve => {
          try {
            if (!window.frappe?.call) { resolve(0); return; }
            frappe.call({
              method: "frappe.client.get_list",
              args: {
                doctype: "Mada Settlement Entry",
                fields: ["sum(net_amount) as total"],
                filters: { docstatus: 1 }
              },
              callback: r => {
                const total = r?.message?.[0]?.total || 0;
                resolve(Number(total));
              },
              error: () => resolve(0)
            });
          } catch (e) { resolve(0); }
        });
      }
    },
    {
      id: "settlements-count",
      short: "SETTLE",
      labelAr: "عدد التسويات",
      labelEn: "Settlements Count",
      fetch: () => safeCount("Mada Settlement Entry", { docstatus: 1 })
    },
    {
      id: "reconciliations-count",
      short: "RECON",
      labelAr: "المطابقات البنكية",
      labelEn: "Reconciliations",
      fetch: () => safeCount("Mada Bank Reconciliation", { docstatus: 1 })
    },
    {
      id: "terminals-count",
      short: "TERM",
      labelAr: "أجهزة مدى النشطة",
      labelEn: "Active Terminals",
      fetch: () => safeCount("Mada Terminal", { enabled: 1 })
    }
  ];

  /* =========================================================
     8. SHORTCUTS (اختصاراتك — Exact bank_reconciliation.json)
     الالتزام التام بألوان الهوية: Primary #3867AE | Hover #0F84B5
  ========================================================= */
  const shortcuts = [
    {
      name: "Mada Settlement Entry",
      labelAr: "قيد تسوية مدى",
      labelEn: "Mada Settlement Entry",
      type: "route",
      doctype: "Mada Settlement Entry",
      highlight: true
    },
    {
      name: "Mada Bank Reconciliation",
      labelAr: "مطابقة بنك مدى",
      labelEn: "Mada Bank Reconciliation",
      type: "route",
      doctype: "Mada Bank Reconciliation"
    },
    {
      name: "Mada Terminal",
      labelAr: "أجهزة مدى (نقاط البيع)",
      labelEn: "Mada Terminal",
      type: "route",
      doctype: "Mada Terminal"
    },
    {
      name: "Mada Reconciliation Status",
      labelAr: "تقرير حالة مطابقة مدى",
      labelEn: "Mada Reconciliation Status",
      type: "report",
      doctype: "Mada Reconciliation Status"
    }
  ];

  /* =========================================================
     9. CARDS & LINKS (Exact bank_reconciliation.json)
     أيقونات معبرة للمربعات دون عشوائية ودون تكرار
  ========================================================= */
  const sections = [
    [
      "Operations & Settlements",
      [
        [
          "Settlements & Terminals",
          "💳",
          [
            "Mada Settlement Entry",
            "Mada Terminal"
          ]
        ],
        [
          "Bank Reconciliation",
          "🏦",
          [
            "Mada Bank Reconciliation"
          ]
        ]
      ]
    ],
    [
      "Settings & Reports",
      [
        [
          "Settings",
          "⚙️",
          [
            "Mada Reconciliation Settings"
          ]
        ],
        [
          "Reports",
          "📊",
          [
            "Mada Reconciliation Status"
          ]
        ]
      ]
    ]
  ];

  /* =========================================================
     10. ITEM GUIDANCE & DESCRIPTIONS (Modal details)
  ========================================================= */
  const itemDescriptions = {
    "Mada Settlement Entry": {
      icon: "💳",
      summaryAr: "إنشاء وتسجيل قيود التسوية البنكية لعمليات مدى ونقاط البيع، وحساب عمولات العمليات وضريبة القيمة المضافة وإيداع الصافي.",
      summaryEn: "Create and record bank settlement entries for Mada and POS payouts, calculating merchant fees, VAT, and net bank deposits.",
      stepsAr: [
        "اضغط «قيد تسوية مدى جديد»",
        "حدد الشركة والحساب البنكي المودع به وتاريخ التسوية",
        "اختر المعرف أو جهاز نقطة البيع المرتبط بالحركة",
        "أدخل إجمالي عمليات المبيعات ونسبة الرسوم المصرفية والضريبة",
        "تحقق من مطابقة المبلغ الصافي ثم اضغط حفظ وتسجيل القيد المحاسبي"
      ],
      stepsEn: [
        "Click «New Mada Settlement Entry»",
        "Select Company, Bank Account, and Settlement Date",
        "Choose Terminal ID or POS register",
        "Enter gross transactions total, merchant fee, and VAT amounts",
        "Verify net deposit amount, then Save and Submit the entry"
      ]
    },
    "Mada Terminal": {
      icon: "📱",
      summaryAr: "تعريف وإدارة أجهزة نقاط البيع (Terminals) وأرقام المعرفات (TID) ومواقع الفروع وربطها بالحسابات البنكية المعتمدة.",
      summaryEn: "Register and manage POS Terminals, Terminal IDs (TID), branch assignments, and linked bank accounts.",
      stepsAr: [
        "اضغط «جهاز مدى جديد»",
        "أدخل رقم معرف الجهاز (Terminal ID) واسم الجهاز",
        "حدد الفرع أو الموقع الفعلي للجهاز والشركة",
        "اربط الجهاز بالحساب البنكي الافتراضي للتسويات",
        "تأكد من تفعيل حالة الجهاز ثم اضغط حفظ"
      ],
      stepsEn: [
        "Click «New Mada Terminal»",
        "Enter Terminal ID (TID) and terminal name",
        "Assign branch, location, and company",
        "Link default settlement Bank Account",
        "Ensure terminal is Active and Save"
      ]
    },
    "Mada Bank Reconciliation": {
      icon: "🏦",
      summaryAr: "استيراد كشوف الحسابات البنكية الإلكترونية وإجراء المطابقة الآلية بين حركات البنك والعمليات المسجلة في النظام.",
      summaryEn: "Import electronic bank statements and perform automated matching between bank statement rows and system transactions.",
      stepsAr: [
        "اضغط «مطابقة بنك مدى جديدة»",
        "اختر الحساب البنكي وفترة المطابقة (من تاريخ / إلى تاريخ)",
        "ارفع ملف كشف الحساب البنكي بصيغة Excel أو CSV",
        "اضغط معالجة الحركات للمطابقة الآلية مع قيود المبيعات والتسوية",
        "راجع الفروقات أو الحركات غير المطابقة ثم اضغط اعتماد"
      ],
      stepsEn: [
        "Click «New Mada Bank Reconciliation»",
        "Select Bank Account and reconciliation period (From / To Date)",
        "Upload bank statement Excel/CSV file",
        "Process automatic transaction matching against recorded sales and settlements",
        "Audit differences or unmatched rows and submit reconciliation"
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
    const steps = desc
      ? (isArabic ? desc.stepsAr : desc.stepsEn)
      : (isArabic ? ["فتح شاشة " + title, "إدخال البيانات ومراجعتها", "حفظ السجل"] : ["Open " + itemName, "Enter details", "Save record"]);

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
            data-recon-cycle="${index}"
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
          ${isArabic ? "دورة مطابقة البنك ومدى" : "Bank Reconciliation Cycle"}
        </h2>
        <div class="erp-cycle-grid">
          ${cardsHtml}
        </div>
      </section>
    `;

    cycleSection.addEventListener("click", event => {
      const el = event.target.closest("[data-recon-cycle]");
      if (!el) return;
      const idx = Number(el.getAttribute("data-recon-cycle"));
      const card = cycleCards[idx];
      if (!card) return;

      if (card.action === "new") {
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
            <span class="erp-stat-value" data-recon-stat="${card.id}">0</span>
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
          const el = statsSection.querySelector(`[data-recon-stat="${card.id}"]`);
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
     15. RENDER SHORTCUTS (Exact bank_reconciliation.json order)
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
     16. RENDER SECTIONS & CARDS (Exact bank_reconciliation.json)
     زر تفاصيل يظهر فقط للشاشات والعمليات ويُمنع في التقارير والإعدادات
  ========================================================= */
  function renderSections() {
    if (!content) return;

    content.innerHTML = sections.map((sec, secIndex) => {
      const secTitle = isArabic ? "العمليات والتقارير" : "Operations & Reports";
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
  try { renderCycle(); } catch (e) { console.error("Bank Recon Cycle Error:", e); }
  try { renderStats(); } catch (e) { console.error("Bank Recon Stats Error:", e); }
  try { renderQuickActions(); } catch (e) { console.error("Bank Recon Shortcuts Error:", e); }
  try { renderSections(); } catch (e) { console.error("Bank Recon Sections Error:", e); }
  try { renderFooter(); } catch (e) { console.error("Bank Recon Footer Error:", e); }
})();
