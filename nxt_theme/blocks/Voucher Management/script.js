(() => {
  /* =========================================================
     MUBTKIR ERP — VOUCHER MANAGEMENT WORKSPACE
     لوحة تحكم إدارة السندات المالية (سندات القبض والصرف)
     Aligned strictly with Mubtkir Brand Identity & mu_voucher_management
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
  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatNumber(num) {
    const val = Number(num);
    if (Number.isNaN(val)) return "0";
    return val.toLocaleString(isArabic ? "ar-SA" : "en-US");
  }

  function safeCount(doctype, filters) {
    return new Promise(resolve => {
      if (!window.frappe?.call) {
        resolve(0);
        return;
      }
      frappe.call({
        method: "frappe.client.get_count",
        args: { doctype, filters: filters || {} },
        callback: r => resolve(Number(r?.message) || 0),
        error: () => resolve(0)
      });
    });
  }

  function openRoute(doctype, view, filterObj) {
    if (!window.frappe?.set_route) return;
    if (view === "Report Builder") {
      frappe.set_route("List", doctype, "Report");
      return;
    }
    if (filterObj) {
      frappe.set_route("List", doctype, "List", filterObj);
      return;
    }
    frappe.set_route("List", doctype, view || "List");
  }

  function newDoc(doctype, defaultVals) {
    if (!window.frappe) return;
    if (defaultVals) {
      frappe.new_doc(doctype, defaultVals);
    } else {
      frappe.new_doc(doctype);
    }
  }

  /* =========================================================
     3. TRANSLATIONS DICTIONARY
  ========================================================= */
  const arabicFallback = {
    "Financial Operations & Vouchers": "العمليات والتشغيل المالي",
    "Vouchers & Entries": "سندات القبض والصرف",
    "Accounts & Liquidity": "الحسابات والسيولة النقدية",
    "Reports & Audit": "التقارير والمطابقات المالية",

    // Links / Items
    "Vouchers Entry": "سندات القبض والصرف",
    "Payment Entry": "سند الدفع / القبض القياسي",
    "Journal Entry": "قيد اليومية",
    "Mode of Payment": "طرق الدفع والتحصيل",
    "Account": "شجرة الحسابات",
    "Bank Account": "الحسابات البنكية",
    "General Ledger": "دفتر الأستاذ العام",
    "Cash Flow": "بيان التدفق النقدي",
    "Accounts Receivable": "أعمار الذمم المدينة",
    "Accounts Payable": "أعمار الذمم الدائنة"
  };

  function translate(key) {
    if (!isArabic) return key;
    return arabicFallback[key] || key;
  }

  /* =========================================================
     4. ROUTE CLASSIFICATION
  ========================================================= */
  const reportNames = new Set([
    "General Ledger",
    "Cash Flow",
    "Accounts Receivable",
    "Accounts Payable"
  ]);

  /* =========================================================
     5. DETAILS BUTTON RULE
  ========================================================= */
  function hasDetailsButton(cardTitle, item) {
    if (reportNames.has(item)) return false;
    if (cardTitle === "Reports & Audit") return false;
    return true;
  }

  /* =========================================================
     6. VOUCHER MANAGEMENT CYCLE (دورة إدارة السندات المالية)
  ========================================================= */
  const cycleCards = [
    {
      step: 1,
      action: "new",
      doctype: "Vouchers Entry",
      defaultVals: { payment_type: "Receive" },
      labelAr: "سند قبض",
      labelEn: "Receive Voucher",
      descAr: "تسجيل مقبوضات نقدية أو بنكية من العملاء أو الحسابات وتخصيصها.",
      descEn: "Record incoming payments from customers or accounts with allocation."
    },
    {
      step: 2,
      action: "new",
      doctype: "Vouchers Entry",
      defaultVals: { payment_type: "Pay" },
      labelAr: "سند صرف",
      labelEn: "Payment Voucher",
      descAr: "تسجيل مدفوعات نقدية أو بنكية للموردين والمصروفات التشغيلية.",
      descEn: "Record outgoing payments to suppliers and operational expenses."
    },
    {
      step: 3,
      action: "new",
      doctype: "Vouchers Entry",
      defaultVals: { payment_type: "Internal Transfer" },
      labelAr: "تحويل داخلي",
      labelEn: "Internal Transfer",
      descAr: "تحويل مالي فوري ومباشر بين الحسابات البنكية وصناديق النقدية.",
      descEn: "Transfer funds directly between bank accounts and cash boxes."
    },
    {
      step: 4,
      action: "route",
      doctype: "Vouchers Entry",
      labelAr: "مراجعة السجلات",
      labelEn: "Vouchers Audit",
      descAr: "مراجعة وترحيل ومطابقة كافة سندات القبض والصرف في النظام.",
      descEn: "Review, reconcile, and audit all payment and receipt vouchers."
    }
  ];

  /* =========================================================
     7. OVERVIEW / STATS (نظرة عامة — بتنسيق الرئيسية الموحد)
  ========================================================= */
  const statsCards = [
    {
      id: "receive-vouchers",
      icon: "📥",
      short: "REC",
      labelAr: "سندات القبض المعتمدة",
      labelEn: "Receive Vouchers",
      fetch: () => safeCount("Vouchers Entry", { payment_type: "Receive", docstatus: 1 })
    },
    {
      id: "pay-vouchers",
      icon: "📤",
      short: "PAY",
      labelAr: "سندات الصرف المعتمدة",
      labelEn: "Payment Vouchers",
      fetch: () => safeCount("Vouchers Entry", { payment_type: "Pay", docstatus: 1 })
    },
    {
      id: "transfer-vouchers",
      icon: "🔄",
      short: "TRF",
      labelAr: "التحويلات الداخلية",
      labelEn: "Internal Transfers",
      fetch: () => safeCount("Vouchers Entry", { payment_type: "Internal Transfer", docstatus: 1 })
    },
    {
      id: "draft-vouchers",
      icon: "⏳",
      short: "DFT",
      labelAr: "سندات معلقة / مسودة",
      labelEn: "Draft Vouchers",
      fetch: () => safeCount("Vouchers Entry", { docstatus: 0 })
    }
  ];

  /* =========================================================
     8. SHORTCUTS (اختصارات إدارة السندات)
  ========================================================= */
  const shortcuts = [
    {
      name: "New Receive Voucher",
      labelAr: "سند قبض جديد",
      labelEn: "New Receive Voucher",
      type: "new",
      doctype: "Vouchers Entry",
      defaultVals: { payment_type: "Receive" },
      highlight: true
    },
    {
      name: "New Pay Voucher",
      labelAr: "سند صرف جديد",
      labelEn: "New Pay Voucher",
      type: "new",
      doctype: "Vouchers Entry",
      defaultVals: { payment_type: "Pay" }
    },
    {
      name: "New Transfer Voucher",
      labelAr: "تحويل داخلي جديد",
      labelEn: "New Internal Transfer",
      type: "new",
      doctype: "Vouchers Entry",
      defaultVals: { payment_type: "Internal Transfer" }
    },
    {
      name: "List Vouchers Entry",
      labelAr: "سجل كافة السندات",
      labelEn: "All Vouchers List",
      type: "route",
      doctype: "Vouchers Entry"
    },
    {
      name: "Report Vouchers Entry",
      labelAr: "تقرير حركة السندات",
      labelEn: "Vouchers Report",
      type: "report",
      doctype: "Vouchers Entry"
    }
  ];

  /* =========================================================
     9. CARDS & LINKS
  ========================================================= */
  const sections = [
    [
      "Financial Operations & Vouchers",
      [
        [
          "Vouchers & Entries",
          "💵",
          [
            "Vouchers Entry",
            "Payment Entry",
            "Journal Entry"
          ]
        ],

        [
          "Accounts & Liquidity",
          "🏦",
          [
            "Mode of Payment",
            "Account",
            "Bank Account"
          ]
        ],

        [
          "Reports & Audit",
          "📊",
          [
            "General Ledger",
            "Cash Flow",
            "Accounts Receivable",
            "Accounts Payable"
          ]
        ]
      ]
    ]
  ];

  /* =========================================================
     10. ITEM GUIDANCE & DESCRIPTIONS (Modal details)
  ========================================================= */
  const itemDescriptions = {
    "Vouchers Entry": {
      icon: "💵",
      summaryAr: "الأداة المتقدمة لإدارة سندات القبض والصرف والتحويلات الداخلية مع دعم تخصيص الحسابات والفواتير المتعددة والضرائب.",
      summaryEn: "Advanced voucher management tool for receipts, disbursements, and inter-account transfers with multi-account allocations and tax handling.",
      stepsAr: [
        "اضغط على «سند قبض جديد» أو «سند صرف جديد» من الاختصارات السريعة",
        "حدد نوع السند (سند قبض Receive / سند صرف Pay / تحويل داخلي Internal Transfer)",
        "اختر الحساب المدفوع منه (Paid From) والحساب المدفوع إليه (Paid To) وطريقة الدفع",
        "أدخل المبلغ وحدد العميل أو المورد أو المشروع إن وجد",
        "في جدول المراجع، خصص المبالغ على الحسابات أو الفواتير المستحقة بدقة",
        "اضغط حفظ ثم تسجيل (Submit) لاعتماد السند وترحيل القيد المحاسبي وتحديث أرصدة الخزينة والبنك فوراً"
      ],
      stepsEn: [
        "Click «New Receive Voucher» or «New Pay Voucher» from shortcuts",
        "Select voucher type (Receive / Pay / Internal Transfer) and transaction date",
        "Choose Paid From and Paid To accounts along with Mode of Payment",
        "Enter amount and link Customer, Supplier, or Project if applicable",
        "Allocate amounts across child accounts or unpaid invoices in references table",
        "Click Save and Submit to post GL entries and update cash/bank balances"
      ]
    },
    "Payment Entry": {
      icon: "💳",
      summaryAr: "السند القياسي في نظام ERPNext لمعالجة سندات القبض والدفع المباشرة مع الفواتير وحسابات الذمم.",
      summaryEn: "Standard ERPNext payment entry document for processing customer receipts and supplier payments with invoice reconciliation.",
      stepsAr: [
        "اضغط لفتح نموذج سند الدفع الجديد",
        "حدد نوع الدفع: استلام (Receive) من عميل أو دفع (Pay) لمورد",
        "اختر الحساب المصرفي أو الصندوق وطريقة السداد",
        "حدد الفواتير المراد تسويتها وسدادها",
        "احفظ السند واضغط تسجيل لاعتماد حركة الحسابات"
      ],
      stepsEn: [
        "Open New Payment Entry",
        "Select Payment Type: Receive from customer or Pay to supplier",
        "Choose Bank/Cash account and Mode of Payment",
        "Select and allocate against outstanding invoices",
        "Save and Submit to complete payment posting"
      ]
    },
    "Journal Entry": {
      icon: "📝",
      summaryAr: "تسجيل القيود المحاسبية اليدوية للتسويات المالية، قيود الإقفال، وتصحيح الأخطاء بين الحسابات المختلفة.",
      summaryEn: "Manual journal entries for accounting adjustments, closing entries, depreciation, and inter-account reconciliations.",
      stepsAr: [
        "اضغط «قيد يومية جديد»",
        "حدد تاريخ القيد ونوع القيد (افتتاحي / تسوية / تحويل)",
        "أضف الحسابات المدينة في الطرف المدين (Debit) والحسابات الدائنة في الطرف الدائن (Credit)",
        "تأكد من توازن إجمالي المدين مع إجمالي الدائن",
        "احفظ المستند واضغط تسجيل لترحيل الأرصدة إلى دفتر الأستاذ"
      ],
      stepsEn: [
        "Click «New Journal Entry»",
        "Set posting date and entry type",
        "Add Debit and Credit rows for corresponding ledger accounts",
        "Ensure Total Debit equals Total Credit",
        "Save and Submit to post entries to the general ledger"
      ]
    },
    "Mode of Payment": {
      icon: "💳",
      summaryAr: "تعريف وتكوين وسائل وطرق الدفع والتحصيل (نقدي، مدى، تحويل بنكي، فيزا) وربط كل طريقة بحسابها المالي.",
      summaryEn: "Configure payment modes (Cash, Mada, Bank Wire, POS) and link each mode to its corresponding chart of accounts ledger.",
      stepsAr: [
        "افتح قائمة طرق الدفع",
        "اضغط إضافة طريقة دفع جديدة وحدد الاسم (مثال: مدى - البنك الأهلي)",
        "حدد نوع طريقة الدفع (Cash / Bank / General)",
        "في جدول الحسابات، اربط كل شركة بالحساب الافتراضي التابع لهذه الوسيلة",
        "احفظ الإعدادات لتظهر وسيلة الدفع تلقائياً في شاشات السندات والمبيعات"
      ],
      stepsEn: [
        "Open Mode of Payment list",
        "Click Add Mode of Payment and enter name (e.g., Mada POS)",
        "Select type (Cash / Bank / General)",
        "Map each company to its designated default bank/cash ledger",
        "Save settings to make it available in vouchers and POS"
      ]
    },
    "Bank Account": {
      icon: "🏦",
      summaryAr: "سجل وإدارة الحسابات البنكية للمنشأة وأرقام الآيبان (IBAN) واسم البنك وتفاصيل الفروع.",
      summaryEn: "Manage company bank accounts, IBAN numbers, bank names, branch details, and default accounting links.",
      stepsAr: [
        "افتح شاشة الحسابات البنكية",
        "اضغط «حساب بنكي جديد»",
        "أدخل اسم الحساب البنكي، والبنك التابع له، ورقم الآيبان (IBAN)",
        "اربط الحساب البنكي بحساب الأستاذ العام التابع له في شجرة الحسابات",
        "احفظ المستند لاعتماده في عمليات التحويل وسندات الصرف والقبض"
      ],
      stepsEn: [
        "Open Bank Accounts screen",
        "Click «New Bank Account»",
        "Enter account name, bank entity, and official IBAN",
        "Link bank account to its Chart of Accounts ledger",
        "Save document for use in bank transfers and reconciliations"
      ]
    }
  };

  /* =========================================================
     11. MODAL DIALOG ENGINE
  ========================================================= */
  function showInfoModal(itemName) {
    const info = itemDescriptions[itemName] || {
      icon: "ℹ️",
      summaryAr: `تفاصيل وإجراءات شاشة ${itemName} في النظام المحاسبي.`,
      summaryEn: `Detailed operational guidance for ${itemName}.`,
      stepsAr: [
        "افتح الشاشة من الرابط المباشر",
        "راجع البيانات والسجلات الحالية",
        "أدخل أو عدل البيانات المطلوبة ثم اضغط حفظ"
      ],
      stepsEn: [
        "Open screen via link",
        "Review existing records",
        "Enter required data and save"
      ]
    };

    const existing = root_element.querySelector(".erp-modal-overlay");
    if (existing) existing.remove();

    const title = translate(itemName);
    const summary = isArabic ? info.summaryAr : info.summaryEn;
    const steps = isArabic ? info.stepsAr : info.stepsEn;
    const stepsTitle = isArabic ? "خطوات العمل خطوة بخطوة:" : "Step-by-step guidance:";
    const closeBtnText = isArabic ? "إغلاق" : "Close";
    const launchBtnText = isArabic ? "الانتقال إلى الشاشة" : "Open Screen";

    const stepsHtml = steps && steps.length
      ? `
        <div class="erp-modal-steps-section">
          <div class="erp-modal-steps-title">${escapeHtml(stepsTitle)}</div>
          <ol class="erp-modal-steps-list">
            ${steps.map(s => `<li>${escapeHtml(s)}</li>`).join("")}
          </ol>
        </div>
      `
      : "";

    const overlay = document.createElement("div");
    overlay.className = "erp-modal-overlay";
    overlay.innerHTML = `
      <div class="erp-modal-box" role="dialog" aria-modal="true">
        <div class="erp-modal-header">
          <div class="erp-modal-title-wrap">
            <span class="erp-modal-icon">${info.icon || "ℹ️"}</span>
            <h3 class="erp-modal-title">${escapeHtml(title)}</h3>
          </div>
          <button type="button" class="erp-modal-close" data-modal-close aria-label="Close">✕</button>
        </div>
        <div class="erp-modal-body">
          <p class="erp-modal-summary">${escapeHtml(summary)}</p>
          ${stepsHtml}
        </div>
        <div class="erp-modal-footer">
          <button type="button" class="erp-modal-btn erp-modal-btn-secondary" data-modal-close>
            ${escapeHtml(closeBtnText)}
          </button>
          <button type="button" class="erp-modal-btn erp-modal-btn-primary" data-modal-launch="${escapeHtml(itemName)}">
            ${escapeHtml(launchBtnText)}
          </button>
        </div>
      </div>
    `;

    overlay.addEventListener("click", e => {
      if (e.target === overlay || e.target.closest("[data-modal-close]")) {
        overlay.remove();
      }
    });

    const launchBtn = overlay.querySelector("[data-modal-launch]");
    if (launchBtn) {
      launchBtn.addEventListener("click", () => {
        const target = launchBtn.getAttribute("data-modal-launch");
        overlay.remove();
        if (reportNames.has(target)) {
          openRoute(target, "Report");
        } else {
          openRoute(target, "List");
        }
      });
    }

    document.body.appendChild(overlay);
  }

  /* =========================================================
     12. RENDER CYCLE
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
            data-voucher-cycle="${index}"
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
          ${isArabic ? "دورة إدارة السندات المالية" : "Voucher Management Cycle"}
        </h2>
        <div class="erp-cycle-grid">
          ${cardsHtml}
        </div>
      </section>
    `;

    cycleSection.addEventListener("click", event => {
      const el = event.target.closest("[data-voucher-cycle]");
      if (!el) return;
      const idx = Number(el.getAttribute("data-voucher-cycle"));
      const card = cycleCards[idx];
      if (!card) return;

      if (card.action === "new") {
        newDoc(card.doctype, card.defaultVals);
      } else {
        openRoute(card.doctype);
      }
    });
  }

  /* =========================================================
     13. RENDER STATS (Home Reference Format)
  ========================================================= */
  function renderStats() {
    if (!statsSection) return;

    statsSection.innerHTML = `
      <h2 class="erp-section-title">${isArabic ? "الإحصائيات" : "Statistics"}</h2>
      <div class="erp-stats-grid">
        ${statsCards.map((c, index) => {
          const label = isArabic ? c.labelAr : c.labelEn;
          return `
            <div class="erp-stat-card overview-tone-${index + 1}">
              <div class="erp-stat-icon">${c.icon || "📊"}</div>
              <div class="erp-stat-info">
                <span class="erp-stat-value" data-stat-id="${escapeHtml(c.id)}">...</span>
                <span class="erp-stat-label">${escapeHtml(label)}</span>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;

    statsCards.forEach(c => {
      c.fetch().then(val => {
        const el = statsSection.querySelector(`[data-stat-id="${c.id}"]`);
        if (el) {
          el.textContent = formatNumber(val);
        }
      }).catch(() => {});
    });
  }

  /* =========================================================
     14. RENDER SHORTCUTS
  ========================================================= */
  function renderQuickActions() {
    if (!quickActions) return;

    quickActions.innerHTML = `
      <h2 class="erp-section-title">${escapeHtml(isArabic ? "اختصارات إدارة السندات" : "Voucher Shortcuts")}</h2>
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

      if (shortcut.type === "new") {
        newDoc(shortcut.doctype, shortcut.defaultVals);
      } else if (shortcut.type === "report") {
        openRoute(shortcut.doctype, "Report Builder");
      } else {
        openRoute(shortcut.doctype);
      }
    });
  }

  /* =========================================================
     15. RENDER SECTIONS & CARDS
  ========================================================= */
  function renderSections() {
    if (!content) return;

    content.innerHTML = sections.map((sec, secIndex) => {
      const secTitle = isArabic ? "العمليات والتشغيل المالي" : "Financial Operations & Vouchers";
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
              <div class="erp-card-title-wrap">
                <span class="erp-card-icon">${cardIcon}</span>
                <span class="erp-card-title">${escapeHtml(translate(cardTitle))}</span>
              </div>
              <span class="erp-card-chevron">▾</span>
            </button>
            <div class="erp-card-body">
              ${linksHtml}
            </div>
          </article>
        `;
      }).join("");

      return `
        <section class="erp-section">
          <h2 class="erp-section-title">${escapeHtml(secTitle)}</h2>
          <div class="erp-dashboard-grid">
            ${cardsHtml}
          </div>
        </section>
      `;
    }).join("");

    content.addEventListener("click", event => {
      const infoBtn = event.target.closest("[data-info-item]");
      if (infoBtn) {
        const itemName = infoBtn.getAttribute("data-info-item");
        showInfoModal(itemName);
        return;
      }

      const routeBtn = event.target.closest("[data-route-name]");
      if (routeBtn) {
        const routeName = routeBtn.getAttribute("data-route-name");
        if (reportNames.has(routeName)) {
          openRoute(routeName, "Report");
        } else {
          openRoute(routeName, "List");
        }
        return;
      }

      const toggleBtn = event.target.closest("[data-card-toggle]");
      if (toggleBtn) {
        const cardEl = toggleBtn.closest("[data-erp-card]");
        if (cardEl) {
          const isOpen = cardEl.classList.toggle("is-open");
          toggleBtn.setAttribute("aria-expanded", String(isOpen));
        }
      }
    });
  }

  /* =========================================================
     16. RENDER FOOTER
  ========================================================= */
  function renderFooter() {
    if (!footerEl) return;

    const footerData = {
      phone: window.frappe?.boot?.theme_settings?.phone || "+966126810486",
      email: window.frappe?.boot?.theme_settings?.email || "sales@mubtkir.com",
      website: window.frappe?.boot?.theme_settings?.website || "www.mubtkir.com"
    };

    const phoneLabel = isArabic ? "الهاتف الموحد" : "Phone";
    const emailLabel = isArabic ? "البريد الإلكتروني" : "Email";
    const websiteLabel = isArabic ? "الموقع" : "Website";
    const waNumber = String(footerData.phone || "+966126810486").replace(/\D/g, "");

    footerEl.innerHTML = `
      <div class="erp-footer-inner">
        <div class="erp-footer-item">
          <span class="erp-footer-icon">📞</span>
          <span class="erp-footer-label">${escapeHtml(phoneLabel)}:</span>
          <a href="https://wa.me/${waNumber}" class="erp-footer-link" target="_blank" rel="noopener" dir="ltr">${escapeHtml(footerData.phone)}</a>
        </div>
        <span class="erp-footer-sep">|</span>
        <div class="erp-footer-item">
          <span class="erp-footer-icon">✉️</span>
          <span class="erp-footer-label">${escapeHtml(emailLabel)}:</span>
          <a href="mailto:${footerData.email}" class="erp-footer-link">${escapeHtml(footerData.email)}</a>
        </div>
        <span class="erp-footer-sep">|</span>
        <div class="erp-footer-item">
          <span class="erp-footer-icon">🌐</span>
          <span class="erp-footer-label">${escapeHtml(websiteLabel)}:</span>
          <a href="https://${footerData.website}" class="erp-footer-link" target="_blank" rel="noopener">${escapeHtml(footerData.website)}</a>
        </div>
      </div>
    `;
  }

  /* =========================================================
     17. INIT
  ========================================================= */
  try { renderCycle(); } catch (e) { console.error("Voucher Cycle Error:", e); }
  try { renderStats(); } catch (e) { console.error("Voucher Stats Error:", e); }
  try { renderQuickActions(); } catch (e) { console.error("Voucher Shortcuts Error:", e); }
  try { renderSections(); } catch (e) { console.error("Voucher Sections Error:", e); }
  try { renderFooter(); } catch (e) { console.error("Voucher Footer Error:", e); }
})();

