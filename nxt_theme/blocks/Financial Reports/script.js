(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم التقارير المالية — ERPNext
   * ══════════════════════════════════════════
   *
   *  يحتوي:
   *    ● ٤ بطاقات إحصائيات محاسبية
   *    ● بطاقات التقارير (بدون توضيح أو خطوات)
   *    ● الفوتر
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
     ٣. بطاقات الإحصائيات (٤ بطاقات محاسبية)
  ───────────────────────────────────────── */

  const statsCards = [
    {
      id: "total-revenue",
      icon: "💰",
      labelEn: "Total Revenue",
      labelAr: "إجمالي الإيرادات",
      color: "#16a34a",
      suffix: { en: "SAR", ar: "ر.س" },
      fetch: () =>
        new Promise((resolve) => {
          frappe.call({
            method: "frappe.client.get_list",
            args: {
              doctype: "Sales Invoice",
              filters: { docstatus: 1 },
              fields: ["sum(grand_total) as total"],
              limit_page_length: 0
            },
            async: true,
            callback: (r) => resolve(r?.message?.[0]?.total || 0)
          });
        })
    },
    {
      id: "total-expenses",
      icon: "📉",
      labelEn: "Total Expenses",
      labelAr: "إجمالي المصروفات",
      color: "#dc2626",
      suffix: { en: "SAR", ar: "ر.س" },
      fetch: () =>
        new Promise((resolve) => {
          frappe.call({
            method: "frappe.client.get_list",
            args: {
              doctype: "Purchase Invoice",
              filters: { docstatus: 1 },
              fields: ["sum(grand_total) as total"],
              limit_page_length: 0
            },
            async: true,
            callback: (r) => resolve(r?.message?.[0]?.total || 0)
          });
        })
    },
    {
      id: "receivables",
      icon: "📌",
      labelEn: "Receivables",
      labelAr: "الذمم المدينة",
      color: "#2563eb",
      suffix: { en: "SAR", ar: "ر.س" },
      fetch: () =>
        new Promise((resolve) => {
          frappe.call({
            method: "frappe.client.get_list",
            args: {
              doctype: "Sales Invoice",
              filters: { docstatus: 1, outstanding_amount: [">", 0] },
              fields: ["sum(outstanding_amount) as total"],
              limit_page_length: 0
            },
            async: true,
            callback: (r) => resolve(r?.message?.[0]?.total || 0)
          });
        })
    },
    {
      id: "payables",
      icon: "📋",
      labelEn: "Payables",
      labelAr: "الذمم الدائنة",
      color: "#ea580c",
      suffix: { en: "SAR", ar: "ر.س" },
      fetch: () =>
        new Promise((resolve) => {
          frappe.call({
            method: "frappe.client.get_list",
            args: {
              doctype: "Purchase Invoice",
              filters: { docstatus: 1, outstanding_amount: [">", 0] },
              fields: ["sum(outstanding_amount) as total"],
              limit_page_length: 0
            },
            async: true,
            callback: (r) => resolve(r?.message?.[0]?.total || 0)
          });
        })
    }
  ];


  /* ─────────────────────────────────────────
     ٤. إعدادات الفوتر
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
     ٥. بطاقات التقارير المالية
  ───────────────────────────────────────── */

  const sections = [
    [
      "Financial Reports",
      [
        [
          "Ledgers",
          "📒",
          ["General Ledger", "Customer Ledger Summary", "Supplier Ledger Summary"]
        ],

        [
          "Financial Statements",
          "📊",
          ["Trial Balance", "Profit and Loss Statement", "Balance Sheet", "Cash Flow", "Consolidated Financial Statement"]
        ],

        [
          "Profitability",
          "💹",
          ["Gross Profit", "Profitability Analysis", "Sales Invoice Trends", "Purchase Invoice Trends"]
        ],

        [
          "Other Reports",
          "📑",
          ["Trial Balance for Party", "Payment Period Based On Invoice Date", "Sales Partners Commission", "Customer Credit Balance", "Sales Payment Summary", "Address And Contacts"]
        ]
      ]
    ]
  ];


  /* ─────────────────────────────────────────
     ٦. الترجمات العربية
  ───────────────────────────────────────── */

  const arabicFallback = {
    "Financial Reports": "التقارير المالية",

    "Ledgers": "دفاتر الأستاذ",
    "General Ledger": "دفتر الأستاذ العام",
    "Customer Ledger Summary": "ملخص دفتر أستاذ العملاء",
    "Supplier Ledger Summary": "ملخص دفتر أستاذ الموردين",

    "Financial Statements": "القوائم المالية",
    "Trial Balance": "ميزان المراجعة",
    "Profit and Loss Statement": "قائمة الأرباح والخسائر",
    "Balance Sheet": "الميزانية العمومية",
    "Cash Flow": "التدفقات النقدية",
    "Consolidated Financial Statement": "القوائم المالية الموحدة",

    "Profitability": "الربحية",
    "Gross Profit": "إجمالي الربح",
    "Profitability Analysis": "تحليل الربحية",
    "Sales Invoice Trends": "اتجاهات فواتير المبيعات",
    "Purchase Invoice Trends": "اتجاهات فواتير المشتريات",

    "Other Reports": "تقارير أخرى",
    "Trial Balance for Party": "ميزان المراجعة حسب الطرف",
    "Payment Period Based On Invoice Date": "فترة السداد حسب تاريخ الفاتورة",
    "Sales Partners Commission": "عمولة شركاء المبيعات",
    "Customer Credit Balance": "رصيد العميل الدائن",
    "Sales Payment Summary": "ملخص مدفوعات المبيعات",
    "Address And Contacts": "العناوين وجهات الاتصال"
  };


  /* ─────────────────────────────────────────
     ٧. جميع العناصر تقارير
  ───────────────────────────────────────── */

  const singleDocs = new Set([]);

  const reportNames = new Set([
    "General Ledger",
    "Customer Ledger Summary",
    "Supplier Ledger Summary",
    "Trial Balance",
    "Profit and Loss Statement",
    "Balance Sheet",
    "Cash Flow",
    "Consolidated Financial Statement",
    "Gross Profit",
    "Profitability Analysis",
    "Sales Invoice Trends",
    "Purchase Invoice Trends",
    "Trial Balance for Party",
    "Payment Period Based On Invoice Date",
    "Sales Partners Commission",
    "Customer Credit Balance",
    "Sales Payment Summary",
    "Address And Contacts"
  ]);

  /* بدون أوصاف — لا توضيح ولا خطوات */
  const itemDescriptions = {};


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
     ٩. إنشاء بطاقات الإحصائيات
  ───────────────────────────────────────── */

  function renderStats() {
    if (!statsSection) return;

    statsSection.innerHTML = `
      <div class="erp-stats-grid">
        ${statsCards.map((card) => {
          const label = isArabic ? card.labelAr : card.labelEn;
          return `
            <div class="erp-stat-card" style="--stat-color: ${card.color}">
              <div class="erp-stat-icon">${card.icon}</div>
              <div class="erp-stat-info">
                <span class="erp-stat-value" data-stat-id="${card.id}">...</span>
                <span class="erp-stat-label">${escapeHtml(label)}</span>
              </div>
            </div>`;
        }).join("")}
      </div>`;

    if (window.frappe) {
      statsCards.forEach((card) => {
        card.fetch().then((value) => {
          const el = statsSection.querySelector(`[data-stat-id="${card.id}"]`);
          if (!el) return;
          let display = formatNumber(value);
          if (card.suffix) {
            display += ` ${isArabic ? card.suffix.ar : card.suffix.en}`;
          }
          el.textContent = display;
        });
      });
    }
  }


  /* ─────────────────────────────────────────
     ١٠. إنشاء بطاقات التقارير
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

            const linksHtml = items.map((itemName) => {
              return `
                <div class="erp-link-row">
                  <button type="button" class="erp-link" data-route-name="${escapeHtml(itemName)}">
                    <span class="erp-link-text">${escapeHtml(translate(itemName))}</span>
                    <span class="erp-link-arrow" aria-hidden="true">${isArabic ? "←" : "→"}</span>
                  </button>
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
     ١١. إنشاء الفوتر
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
     ١٢. فتح التقرير
  ───────────────────────────────────────── */

  function openRoute(name) {
    if (!window.frappe || typeof frappe.set_route !== "function") return;
    if (reportNames.has(name)) { frappe.set_route("query-report", name); return; }
    if (singleDocs.has(name)) { frappe.set_route("Form", name); return; }
    frappe.set_route("List", name);
  }


  /* ─────────────────────────────────────────
     ١٣. أحداث الضغط
  ───────────────────────────────────────── */

  let lastToggleTime = 0;

  content.addEventListener("click", (event) => {
    const routeButton = event.target.closest("[data-route-name]");
    if (routeButton) {
      event.preventDefault();
      event.stopPropagation();
      openRoute(routeButton.dataset.routeName);
      return;
    }

    const cardButton = event.target.closest("[data-card-toggle]");
    if (!cardButton) return;

    const now = Date.now();
    if (now - lastToggleTime < 400) return;
    lastToggleTime = now;

    const selectedCard = cardButton.closest("[data-erp-card]");
    if (!selectedCard) return;

    const shouldOpen = !selectedCard.classList.contains("is-open");

    content.querySelectorAll("[data-erp-card]").forEach((card) => {
      if (card !== selectedCard) {
        card.classList.remove("is-open");
        card.querySelector("[data-card-toggle]")?.setAttribute("aria-expanded", "false");
      }
    });

    if (shouldOpen) {
      selectedCard.classList.add("is-open");
      cardButton.setAttribute("aria-expanded", "true");
    } else {
      selectedCard.classList.remove("is-open");
      cardButton.setAttribute("aria-expanded", "false");
    }
  });


  /* ─────────────────────────────────────────
     ١٤. تشغيل
  ───────────────────────────────────────── */

  renderStats();
  renderSections();
  renderFooter();
})();
