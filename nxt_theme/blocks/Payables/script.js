(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم الواجبات الدائنة — ERPNext Payables
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
     ٣. أزرار الاختصارات السريعة
  ───────────────────────────────────────── */

  const quickActionButtons = [
    {
      doctype: "Purchase Invoice",
      icon: "🧾",
      labelEn: "Purchase Invoice",
      labelAr: "فاتورة مشتريات",
      color: "#2563eb"
    },
    {
      doctype: "Payment Entry",
      icon: "💳",
      labelEn: "Payment Entry",
      labelAr: "سند قبض او صرف",
      color: "#16a34a"
    },
    {
      doctype: "Journal Entry",
      icon: "📒",
      labelEn: "Journal Entry",
      labelAr: "قيد يومية",
      color: "#ea580c"
    },
    {
      doctype: "Accounts Payable",
      icon: "📊",
      labelEn: "Accounts Payable",
      labelAr: "الذمم الدائنة",
      color: "#7c3aed",
      isReport: true
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
     ٥. بطاقات الواجبات الدائنة
  ───────────────────────────────────────── */

  const sections = [
    [
      "Reports & Masters",
      [
        [
          "Invoicing",
          "🧾",
          ["Purchase Invoice", "Supplier"]
        ],

        [
          "Payments",
          "💳",
          ["Payment Entry", "Journal Entry", "Payment Reconciliation"]
        ],

        [
          "Reports",
          "📊",
          [
            "Accounts Payable",
            "Accounts Payable Summary",
            "Purchase Register",
            "Item-wise Purchase Register",
            "Purchase Order Analysis",
            "Received Items To Be Billed",
            "Supplier Ledger Summary"
          ]
        ]
      ]
    ]
  ];


  /* ─────────────────────────────────────────
     ٦. الترجمات العربية
  ───────────────────────────────────────── */

  const arabicFallback = {
    "Reports & Masters": "التقارير والبيانات الرئيسية",

    "Invoicing": "الفوترة",
    "Purchase Invoice": "فاتورة مشتريات",
    "Supplier": "مورد",

    "Payments": "المدفوعات",
    "Payment Entry": "سند قبض او صرف",
    "Journal Entry": "قيد يومية",
    "Payment Reconciliation": "تسوية المدفوعات",

    "Reports": "التقارير",
    "Accounts Payable": "الذمم الدائنة",
    "Accounts Payable Summary": "ملخص الذمم الدائنة",
    "Purchase Register": "سجل المشتريات",
    "Item-wise Purchase Register": "سجل المشتريات حسب منتج",
    "Purchase Order Analysis": "تحليل أوامر الشراء",
    "Received Items To Be Billed": "منتجات مستلمة بانتظار الفوترة",
    "Supplier Ledger Summary": "ملخص دفتر أستاذ المورد"
  };


  /* ─────────────────────────────────────────
     ٧. المستندات الخاصة
  ───────────────────────────────────────── */

  const singleDocs = new Set([]);

  const reportNames = new Set([
    "Accounts Payable",
    "Accounts Payable Summary",
    "Purchase Register",
    "Item-wise Purchase Register",
    "Purchase Order Analysis",
    "Received Items To Be Billed",
    "Supplier Ledger Summary"
  ]);


  /* ─────────────────────────────────────────
     ٨. أوصاف العناصر
     
     ● الفوترة والمدفوعات → توضيح + خطوات
     ● التقارير → توضيح فقط
  ───────────────────────────────────────── */

  const itemDescriptions = {

    /* ═══ الفوترة (توضيح + خطوات) ═══ */

    "Purchase Invoice": {
      icon: "🧾",
      summaryAr:
        "تسجيل فواتير المشتريات من الموردين وربطها بأوامر الشراء وإيصالات الاستلام، مع تتبع المبالغ المستحقة والمدفوعة.",
      summaryEn:
        "Record purchase invoices from suppliers, link to purchase orders and receipts, and track outstanding and paid amounts.",
      stepsAr: [
        "اضغط «فاتورة مشتريات جديدة» أو أنشئها من أمر شراء أو إيصال استلام",
        "اختر المورد من حقل المورد",
        "أضف المنتجات والكميات والأسعار في جدول المنتجات",
        "تأكد من تطبيق قالب الضرائب (ضريبة القيمة المضافة ١٥٪)",
        "أدخل رقم فاتورة المورد وتاريخها",
        "راجع المبلغ الإجمالي ثم اضغط «حفظ»",
        "بعد المراجعة اضغط «تسجيل» لتسجيل الفاتورة في الحسابات"
      ],
      stepsEn: [
        "Click «New Purchase Invoice» or create from Purchase Order or Receipt",
        "Select the supplier from the Supplier field",
        "Add items, quantities, and prices in the Items table",
        "Ensure the tax template is applied (15% VAT)",
        "Enter the supplier invoice number and date",
        "Review the total amount then click «Save»",
        "After review, click «Submit» to post to accounts"
      ]
    },

    "Supplier": {
      icon: "🏭",
      summaryAr:
        "إنشاء وإدارة بيانات الموردين بما في ذلك معلومات الاتصال والحسابات المالية وشروط الدفع والتصنيف.",
      summaryEn:
        "Create and manage supplier records including contact details, financial accounts, payment terms, and classification.",
      stepsAr: [
        "اضغط «مورد جديد»",
        "أدخل اسم المورد ونوعه (شركة أو فرد)",
        "اختر مجموعة المورد",
        "أضف بيانات الاتصال (الهاتف، البريد الإلكتروني)",
        "أضف العنوان في جدول العناوين",
        "حدد شروط الدفع والعملة الافتراضية",
        "أدخل الرقم الضريبي إن وجد",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Supplier»",
        "Enter supplier name and type (Company or Individual)",
        "Select supplier group",
        "Add contact details (phone, email)",
        "Add address in the address table",
        "Set payment terms and default currency",
        "Enter tax ID if applicable",
        "Click «Save»"
      ]
    },

    /* ═══ المدفوعات (توضيح + خطوات) ═══ */

    "Payment Entry": {
      icon: "💳",
      summaryAr:
        "تسجيل عمليات الدفع للموردين أو استلام المدفوعات من العملاء، مع ربط الدفعة بالفواتير المستحقة تلقائياً.",
      summaryEn:
        "Record payments to suppliers or receipts from customers, with automatic linking to outstanding invoices.",
      stepsAr: [
        "اضغط «سند قبض او صرف جديد» أو أنشئه من فاتورة مشتريات",
        "اختر نوع الدفع (دفع، استلام، تحويل داخلي)",
        "اختر الطرف (مورد أو عميل)",
        "أدخل المبلغ المدفوع",
        "اختر حساب البنك أو الصندوق",
        "راجع جدول الفواتير المرتبطة (يُملأ تلقائياً)",
        "أدخل رقم المرجع وتاريخه",
        "اضغط «حفظ» ثم «تسجيل»"
      ],
      stepsEn: [
        "Click «New Payment Entry» or create from a Purchase Invoice",
        "Select payment type (Pay, Receive, Internal Transfer)",
        "Select party (Supplier or Customer)",
        "Enter the paid amount",
        "Select bank or cash account",
        "Review linked invoices table (auto-populated)",
        "Enter reference number and date",
        "Click «Save» then «Submit»"
      ]
    },

    "Journal Entry": {
      icon: "📒",
      summaryAr:
        "إنشاء قيود يومية محاسبية يدوية لتسجيل التسويات والتعديلات والقيود الافتتاحية والإقفالية.",
      summaryEn:
        "Create manual journal entries for adjustments, corrections, opening entries, and closing entries.",
      stepsAr: [
        "اضغط «قيد يومية جديد»",
        "اختر نوع القيد (قيد يومية، قيد افتتاحي، إهلاك، إلخ)",
        "أضف صفوف القيد: الحساب، مدين، دائن",
        "تأكد أن مجموع المدين يساوي مجموع الدائن",
        "أضف المرجع (فاتورة، مورد، عميل) إن لزم",
        "أضف ملاحظات توضيحية",
        "اضغط «حفظ» ثم «تسجيل»"
      ],
      stepsEn: [
        "Click «New Journal Entry»",
        "Select entry type (Journal Entry, Opening Entry, Depreciation, etc.)",
        "Add entry rows: Account, Debit, Credit",
        "Ensure total debit equals total credit",
        "Add reference (Invoice, Supplier, Customer) if needed",
        "Add explanatory remarks",
        "Click «Save» then «Submit»"
      ]
    },

    "Payment Reconciliation": {
      icon: "🔄",
      summaryAr:
        "مطابقة المدفوعات غير المخصصة مع الفواتير المستحقة لتسوية أرصدة الموردين والعملاء تلقائياً.",
      summaryEn:
        "Match unallocated payments with outstanding invoices to automatically reconcile supplier and customer balances.",
      stepsAr: [
        "افتح «تسوية المدفوعات»",
        "اختر نوع الطرف (مورد أو عميل) ثم اختر الاسم",
        "اضغط «جلب المدفوعات غير المخصصة» و «جلب الفواتير المستحقة»",
        "طابق كل دفعة مع الفاتورة المناسبة",
        "اضغط «تسوية» لتطبيق المطابقة"
      ],
      stepsEn: [
        "Open «Payment Reconciliation»",
        "Select party type (Supplier or Customer) then select the name",
        "Click «Get Unreconciled Entries» and «Get Outstanding Invoices»",
        "Match each payment with the appropriate invoice",
        "Click «Reconcile» to apply the matching"
      ]
    }
  };


  /* ─────────────────────────────────────────
     ٩. دوال مساعدة
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


  /* ─────────────────────────────────────────
     ١٠. مربع التفاصيل (Modal)
  ───────────────────────────────────────── */

  function showInfoModal(data) {
    const title = isArabic ? data.labelAr : data.labelEn;
    const summary = isArabic ? data.summaryAr : data.summaryEn;
    const steps = isArabic ? data.stepsAr : data.stepsEn;
    const hasSteps = Array.isArray(steps) && steps.length > 0;

    const showStepsText = isArabic ? "📖 عرض الخطوات" : "📖 Show Steps";
    const hideStepsText = isArabic ? "📖 إخفاء الخطوات" : "📖 Hide Steps";

    let stepsHtml = "";
    if (hasSteps) {
      stepsHtml = `
        <div class="erp-modal-steps" data-modal-steps>
          <ol class="erp-modal-steps-list">
            ${steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}
          </ol>
        </div>`;
    }

    const overlay = document.createElement("div");
    overlay.className = "erp-modal-overlay";
    overlay.setAttribute("dir", isArabic ? "rtl" : "ltr");

    overlay.innerHTML = `
      <div class="erp-modal-box">
        <button type="button" class="erp-modal-close" data-modal-close aria-label="Close">✕</button>
        <div class="erp-modal-header">
          <span class="erp-modal-icon">${data.icon}</span>
          <h3 class="erp-modal-title">${escapeHtml(title)}</h3>
        </div>
        <p class="erp-modal-summary">${escapeHtml(summary)}</p>
        ${hasSteps ? `<button type="button" class="erp-modal-toggle-steps" data-toggle-steps>${showStepsText}</button>` : ""}
        ${stepsHtml}
      </div>`;

    root.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("is-visible"));

    function closeModal() {
      overlay.classList.remove("is-visible");
      overlay.addEventListener("transitionend", () => overlay.remove(), { once: true });
    }

    overlay.querySelector("[data-modal-close]").addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });

    const toggleBtn = overlay.querySelector("[data-toggle-steps]");
    const stepsContainer = overlay.querySelector("[data-modal-steps]");
    if (toggleBtn && stepsContainer) {
      toggleBtn.addEventListener("click", () => {
        const isShowing = stepsContainer.classList.contains("is-shown");
        stepsContainer.classList.toggle("is-shown");
        toggleBtn.textContent = isShowing ? showStepsText : hideStepsText;
      });
    }
  }


  /* ─────────────────────────────────────────
     ١١. إنشاء أزرار الاختصارات
  ───────────────────────────────────────── */

  function renderQuickActions() {
    if (!quickActions) return;

    const title = isArabic ? "اختصارات سريعة" : "Quick Actions";

    quickActions.innerHTML = `
      <h2 class="erp-section-title">${escapeHtml(title)}</h2>
      <div class="erp-quick-grid">
        ${quickActionButtons.map((btn) => {
          const label = isArabic ? btn.labelAr : btn.labelEn;
          return `
            <button type="button" class="erp-quick-btn"
              data-new-doc="${escapeHtml(btn.doctype)}"
              ${btn.isReport ? 'data-is-report="1"' : ''}
              style="--btn-color: ${btn.color}">
              <span class="erp-quick-icon" aria-hidden="true">${btn.icon}</span>
              <span class="erp-quick-label">${escapeHtml(label)}</span>
            </button>`;
        }).join("")}
      </div>`;

    quickActions.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-new-doc]");
      if (!btn) return;
      const doctype = btn.dataset.newDoc;

      if (!window.frappe) return;

      /* إذا كان تقرير يفتح كـ query-report */
      if (btn.dataset.isReport === "1") {
        frappe.set_route("query-report", doctype);
        return;
      }

      if (typeof frappe.new_doc === "function") {
        frappe.new_doc(doctype);
      }
    });
  }


  /* ─────────────────────────────────────────
     ١٢. إنشاء البطاقات
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
     ١٤. فتح الخيار داخل ERPNext
  ───────────────────────────────────────── */

  function openRoute(name) {
    if (!window.frappe || typeof frappe.set_route !== "function") return;
    if (reportNames.has(name)) { frappe.set_route("query-report", name); return; }
    if (singleDocs.has(name)) { frappe.set_route("Form", name); return; }
    frappe.set_route("List", name);
  }


  /* ─────────────────────────────────────────
     ١٥. أحداث الضغط
  ───────────────────────────────────────── */

  let lastToggleTime = 0;

  content.addEventListener("click", (event) => {
    const infoBtn = event.target.closest("[data-info-item]");
    if (infoBtn) {
      event.preventDefault();
      event.stopPropagation();
      const itemName = infoBtn.dataset.infoItem;
      const desc = itemDescriptions[itemName];
      if (desc) {
        showInfoModal({
          icon: desc.icon || "📄",
          labelAr: translate(itemName),
          labelEn: itemName,
          summaryAr: desc.summaryAr,
          summaryEn: desc.summaryEn,
          stepsAr: desc.stepsAr,
          stepsEn: desc.stepsEn
        });
      }
      return;
    }

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
     ١٦. تشغيل
  ───────────────────────────────────────── */

  renderQuickActions();
  renderSections();
  renderFooter();
})();
