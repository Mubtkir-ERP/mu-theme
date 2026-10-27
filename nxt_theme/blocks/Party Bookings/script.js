(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة حجوزات الحفلات — Party Bookings Workspace
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
      labelEn: "Party Booking",
      labelAr: "حجوزات الحفلات",
      doctype: "Party Booking",
      color: "#059669"
    },
    {
      labelEn: "Party Asset Return",
      labelAr: "إرجاع أصول الحفلات",
      doctype: "Party Asset Return",
      color: "#0284c7"
    },
    {
      labelEn: "Assets",
      labelAr: "الأصول والتجهيزات",
      doctype: "Asset",
      color: "#d97706"
    },
    {
      labelEn: "Asset Utilization Report",
      labelAr: "تقرير استغلال الأصول",
      report: "Asset Utilization Report",
      isReport: true,
      color: "#7c3aed"
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
          "Transactions",
          "📋",
          [
            "Party Booking",
            "Party Asset Return"
          ]
        ],
        [
          "Settings & Masters",
          "⚙️",
          [
            "Assets"
          ]
        ],
        [
          "Reports",
          "📊",
          [
            "Party Bookings Report",
            "Asset Utilization Report",
            "Security Deposit Report",
            "Installation & Delivery Report",
            "Damaged and Lost Assets Report"
          ]
        ]
      ]
    ]
  ];

  /* ─────────────────────────────────────────
     ٣. التقارير والمستندات الفردية والشجرية
  ───────────────────────────────────────── */

  const reportNames = new Set([
    "Party Bookings Report",
    "Asset Utilization Report",
    "Security Deposit Report",
    "Installation & Delivery Report",
    "Damaged and Lost Assets Report"
  ]);

  const singleDocs = new Set([]);

  const treeDocs = new Set([]);

  const customRoutes = {
    "Assets": "List/Asset"
  };

  /* ─────────────────────────────────────────
     ٤. قاموس الترجمة العربية
  ───────────────────────────────────────── */

  const arabicFallback = {
    "Party Bookings": "حجوزات الحفلات والمناسبات",
    "Party Booking System": "نظام حجوزات الحفلات",
    "Masters & Reports": "البيانات الأساسية والتقارير",

    "Transactions": "المعاملات التشغيلية",
    "Settings & Masters": "البيانات الأساسية والإعدادات",
    "Reports": "التقارير",

    "Party Booking": "حجز حفلة / فعالية",
    "Party Asset Return": "إرجاع أصول الحفلة",
    "Assets": "الأصول والتجهيزات",

    "Party Bookings Report": "تقرير حجوزات الحفلات",
    "Asset Utilization Report": "تقرير استغلال الأصول",
    "Security Deposit Report": "تقرير مبالغ التأمين والودائع",
    "Installation & Delivery Report": "تقرير التركيب والتسليم",
    "Damaged and Lost Assets Report": "تقرير الأصول التالفة والمفقودة"
  };

  /* ─────────────────────────────────────────
     ٥. شروحات وتفاصيل الشاشات التشغيلية
  ───────────────────────────────────────── */

  const itemDescriptions = {
    "Party Booking": {
      icon: "🎉",
      summaryAr: "إنشاء وإدارة حجوزات الحفلات والمناسبات وتحديد المواعيد، الموقع، العملاء، وباقات وتجهيزات الفعالية.",
      summaryEn: "Create and manage party and event bookings, schedules, venues, customer requests, and packages.",
      stepsAr: [
        "تسجيل بيانات العميل وتحديد نوع الحفلة أو المناسبة",
        "تحديد تاريخ ووقت وموقع إقامة الحفل وتفاصيل الحجز",
        "اختيار الأصول والتجهيزات المطلوبة وباقات الخدمة",
        "حفظ واعتماد الحجز وتأكيد مواعيد التسليم والتركيب"
      ],
      stepsEn: [
        "Enter customer details and select event/party type",
        "Set event date, duration, venue location, and booking terms",
        "Select required party assets, equipment, and packages",
        "Save and submit booking to confirm delivery schedule"
      ]
    },
    "Party Asset Return": {
      icon: "🔄",
      summaryAr: "تسجيل وفحص إرجاع أصول ومعدات الحفلات بعد انتهاء المناسبة، وتدقيق حالتها الفنية وسلامتها.",
      summaryEn: "Record and inspect returned party assets and equipment after event completion, verifying condition.",
      stepsAr: [
        "اختيار الحجز المرجعي المرتبط بالأصول المستأجرة",
        "تسجيل الأصول المستلمة وفحص سلامتها وحالتها الفنية",
        "توثيق أي أضرار أو تلفيات أو نواقص إن وجدت للمطالبة",
        "اعتماد الإرجاع لإغلاق الحجز وتسوية مبالغ التأمين"
      ],
      stepsEn: [
        "Select the referenced party booking document",
        "Verify returned assets and inspect condition and components",
        "Document any damages, shortages, or missing items",
        "Submit return to close booking and settle security deposits"
      ]
    },
    "Assets": {
      icon: "📦",
      summaryAr: "سجل أصول ولوازم وتجهيزات الحفلات (طاولات، مقاعد، إضاءات، خيام، أنظمة صوت) ومتابعة حالتها ومواقعها.",
      summaryEn: "Master catalog of party assets and event rental supplies, monitoring operational status and availability.",
      stepsAr: [
        "إدخال مسمى الأصل وفئته وموقعه وتكلفة الشراء أو الإيجار",
        "تحديد الرقم التعريفي التسلسلي وسعة التجهيزات",
        "متابعة حالة الأصل التشغيلية وجاهزيته للحجز",
        "حفظ الأصل لربطه مباشرة بالحجوزات وتقارير الاستخدام"
      ],
      stepsEn: [
        "Enter asset name, category, location, and rental rate",
        "Assign serial number/barcode and capacity attributes",
        "Track asset status, maintenance readiness, and availability",
        "Save asset to enable reservation in party booking orders"
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

    const title = isArabic ? "نظام حجوزات الحفلات" : "Party Booking System";

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
      if (!btn.doctype) return;

      frappe.call({
        method: "frappe.client.get_count",
        args: {
          doctype: btn.doctype
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
