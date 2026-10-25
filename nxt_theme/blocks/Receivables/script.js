(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم المستحقات — ERPNext Receivables
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
     ٣. أزرار الاختصارات السريعة (٦ أزرار)
  ───────────────────────────────────────── */

  const quickActionButtons = [
    {
      doctype: "Sales Invoice",
      icon: "🧾",
      labelEn: "Sales Invoice",
      labelAr: "فاتورة مبيعات",
      color: "#2563eb"
    },
    {
      doctype: "POS Invoice",
      icon: "🛒",
      labelEn: "POS Invoice",
      labelAr: "فاتورة نقطة البيع",
      color: "#16a34a"
    },
    {
      doctype: "Payment Entry",
      icon: "💳",
      labelEn: "Payment Entry",
      labelAr: "سند قبض او صرف",
      color: "#ea580c"
    },
    {
      doctype: "Journal Entry",
      icon: "📒",
      labelEn: "Journal Entry",
      labelAr: "قيد يومية",
      color: "#7c3aed"
    },
    {
      doctype: "Accounts Receivable",
      icon: "📊",
      labelEn: "Accounts Receivable",
      labelAr: "الذمم المدينة",
      color: "#dc2626",
      isReport: true
    },
    {
      doctype: "Cost Center",
      icon: "🏢",
      labelEn: "Cost Center",
      labelAr: "مركز التكلفة",
      color: "#0891b2"
    }
  ];


  /* ─────────────────────────────────────────
     ٤. إعدادات الفوتر
  ───────────────────────────────────────── */

  const footerInfo = {
    phone: (window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.phone) || "0115110455",
    email: (window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.email) || "sales@mubtkir.com",
    website: (window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.website) || "www.mubtkir.com",
    labels: {
      phoneEn: "Phone", phoneAr: "الهاتف الموحد",
      emailEn: "Email", emailAr: "البريد الإلكتروني",
      websiteEn: "Website", websiteAr: "الموقع"
    }
  };


  /* ─────────────────────────────────────────
     ٥. بطاقات المستحقات
  ───────────────────────────────────────── */

  const sections = [
    [
      "Reports & Masters",
      [
        [
          "Invoicing",
          "🧾",
          ["Sales Invoice", "Customer"]
        ],

        [
          "Payments",
          "💳",
          ["Payment Entry", "Payment Request", "Payment Reconciliation", "Payment Gateway Account"]
        ],

        [
          "Dunning",
          "⚠️",
          ["Dunning", "Dunning Type"]
        ],

        [
          "Reports",
          "📊",
          [
            "Accounts Receivable",
            "Accounts Receivable Summary",
            "Sales Register",
            "Item-wise Sales Register",
            "Sales Order Analysis",
            "Delivered Items To Be Billed"
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
    "Sales Invoice": "فاتورة مبيعات",
    "Customer": "عميل",

    "Payments": "المدفوعات",
    "Payment Entry": "سند قبض او صرف",
    "Payment Request": "طلب دفع",
    "Payment Reconciliation": "تسوية المدفوعات",
    "Payment Gateway Account": "حساب بوابة الدفع",

    "Dunning": "المطالبات",
    "Dunning Type": "نوع المطالبة",

    "Reports": "التقارير",
    "Accounts Receivable": "الذمم المدينة",
    "Accounts Receivable Summary": "ملخص الذمم المدينة",
    "Sales Register": "سجل المبيعات",
    "Item-wise Sales Register": "سجل المبيعات حسب منتج",
    "Sales Order Analysis": "تحليل طلبات المبيعات",
    "Delivered Items To Be Billed": "منتجات مسلّمة بانتظار الفوترة",

    "POS Invoice": "فاتورة نقطة البيع",
    "Journal Entry": "قيد يومية",
    "Cost Center": "مركز التكلفة"
  };


  /* ─────────────────────────────────────────
     ٧. المستندات الخاصة
  ───────────────────────────────────────── */

  const singleDocs = new Set([]);

  const reportNames = new Set([
    "Accounts Receivable",
    "Accounts Receivable Summary",
    "Sales Register",
    "Item-wise Sales Register",
    "Sales Order Analysis",
    "Delivered Items To Be Billed"
  ]);


  /* ─────────────────────────────────────────
     ٨. أوصاف العناصر

     ● الفوترة → توضيح + خطوات
     ● المدفوعات → توضيح + خطوات
     ● المطالبات → توضيح + خطوات
     ● التقارير → توضيح فقط
  ───────────────────────────────────────── */

  const itemDescriptions = {

    /* ═══ الفوترة (توضيح + خطوات) ═══ */

    "Sales Invoice": {
      icon: "🧾",
      summaryAr:
        "إصدار فواتير مبيعات للعملاء وتسجيل الإيرادات وتتبع المبالغ المستحقة والمدفوعة، مع إمكانية الإرسال بالبريد أو الطباعة.",
      summaryEn:
        "Issue sales invoices to customers, record revenue, track outstanding and paid amounts, with email and print options.",
      stepsAr: [
        "اضغط «فاتورة مبيعات جديدة» أو أنشئها من طلب مبيعات",
        "اختر العميل من حقل العميل",
        "أضف المنتجات والكميات والأسعار",
        "تأكد من تطبيق قالب الضرائب (ضريبة القيمة المضافة ١٥٪)",
        "راجع المبلغ الإجمالي ثم اضغط «حفظ»",
        "بعد المراجعة اضغط «تسجيل» لتثبيت الفاتورة"
      ],
      stepsEn: [
        "Click «New Sales Invoice» or create from a Sales Order",
        "Select the customer from the Customer field",
        "Add items, quantities, and prices",
        "Ensure the tax template is applied (15% VAT)",
        "Review the total amount then click «Save»",
        "After review, click «Submit» to finalize the invoice"
      ]
    },

    "Customer": {
      icon: "👤",
      summaryAr:
        "إنشاء وإدارة بيانات العملاء بما في ذلك معلومات الاتصال والعناوين وشروط الدفع وحدود الائتمان.",
      summaryEn:
        "Create and manage customer records including contact details, addresses, payment terms, and credit limits.",
      stepsAr: [
        "اضغط «عميل جديد»",
        "اختر نوع العميل (شركة أو فرد)",
        "أدخل اسم العميل ومجموعة العميل",
        "أضف بيانات الاتصال والعنوان",
        "حدد شروط الدفع وحد الائتمان",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Customer»",
        "Select customer type (Company or Individual)",
        "Enter customer name and customer group",
        "Add contact details and address",
        "Set payment terms and credit limit",
        "Click «Save»"
      ]
    },

    /* ═══ المدفوعات (توضيح + خطوات) ═══ */

    "Payment Entry": {
      icon: "💳",
      summaryAr:
        "تسجيل استلام المدفوعات من العملاء أو الدفع للموردين، مع ربط الدفعة بالفواتير المستحقة تلقائياً.",
      summaryEn:
        "Record payments received from customers or paid to suppliers, with automatic linking to outstanding invoices.",
      stepsAr: [
        "اضغط «سند قبض او صرف جديد» أو أنشئه من فاتورة مبيعات",
        "اختر نوع الدفع (استلام من عميل أو دفع لمورد)",
        "اختر العميل أو المورد",
        "أدخل المبلغ المستلم أو المدفوع",
        "اختر حساب البنك أو الصندوق",
        "راجع جدول الفواتير المرتبطة",
        "أدخل رقم المرجع وتاريخه",
        "اضغط «حفظ» ثم «تسجيل»"
      ],
      stepsEn: [
        "Click «New Payment Entry» or create from a Sales Invoice",
        "Select payment type (Receive from Customer or Pay to Supplier)",
        "Select customer or supplier",
        "Enter the received or paid amount",
        "Select bank or cash account",
        "Review linked invoices table",
        "Enter reference number and date",
        "Click «Save» then «Submit»"
      ]
    },

    "Payment Request": {
      icon: "📨",
      summaryAr:
        "إنشاء طلبات دفع وإرسالها للعملاء عبر البريد الإلكتروني مع رابط دفع إلكتروني (بوابة دفع).",
      summaryEn:
        "Create payment requests and send them to customers via email with an online payment link (payment gateway).",
      stepsAr: [
        "اضغط «طلب دفع جديد» أو أنشئه من فاتورة مبيعات",
        "اختر نوع الطلب (وارد أو صادر)",
        "حدد الطرف (العميل) والمبلغ",
        "اختر بوابة الدفع الإلكتروني",
        "اضغط «حفظ» ثم «إرسال»",
        "سيتلقى العميل إيميل برابط الدفع"
      ],
      stepsEn: [
        "Click «New Payment Request» or create from a Sales Invoice",
        "Select request type (Inward or Outward)",
        "Set party (Customer) and amount",
        "Select payment gateway",
        "Click «Save» then «Send»",
        "Customer will receive an email with payment link"
      ]
    },

    "Payment Reconciliation": {
      icon: "🔄",
      summaryAr:
        "مطابقة المدفوعات غير المخصصة مع الفواتير المستحقة لتسوية أرصدة العملاء والموردين تلقائياً.",
      summaryEn:
        "Match unallocated payments with outstanding invoices to automatically reconcile customer and supplier balances.",
      stepsAr: [
        "افتح «تسوية المدفوعات»",
        "اختر نوع الطرف (عميل أو مورد) ثم اختر الاسم",
        "اضغط «جلب المدفوعات غير المخصصة» و «جلب الفواتير المستحقة»",
        "طابق كل دفعة مع الفاتورة المناسبة",
        "اضغط «تسوية» لتطبيق المطابقة"
      ],
      stepsEn: [
        "Open «Payment Reconciliation»",
        "Select party type (Customer or Supplier) then select the name",
        "Click «Get Unreconciled Entries» and «Get Outstanding Invoices»",
        "Match each payment with the appropriate invoice",
        "Click «Reconcile» to apply the matching"
      ]
    },

    "Payment Gateway Account": {
      icon: "🌐",
      summaryAr:
        "إعداد حسابات بوابات الدفع الإلكتروني (مثل PayPal، Stripe) وربطها بالحسابات المحاسبية.",
      summaryEn:
        "Configure payment gateway accounts (e.g., PayPal, Stripe) and link them to accounting accounts.",
      stepsAr: [
        "اضغط «حساب بوابة دفع جديد»",
        "اختر بوابة الدفع (PayPal، Stripe، إلخ)",
        "حدد حساب الدفع المحاسبي",
        "حدد العملة الافتراضية",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Payment Gateway Account»",
        "Select payment gateway (PayPal, Stripe, etc.)",
        "Set the payment accounting account",
        "Set default currency",
        "Click «Save»"
      ]
    },

    /* ═══ المطالبات (توضيح + خطوات) ═══ */

    "Dunning": {
      icon: "⚠️",
      summaryAr:
        "إنشاء خطابات مطالبة رسمية للعملاء المتأخرين عن السداد، مع إمكانية إضافة رسوم تأخير وفوائد.",
      summaryEn:
        "Create formal dunning letters for overdue customers, with options to add late fees and interest charges.",
      stepsAr: [
        "اضغط «مطالبة جديدة» أو أنشئها من فاتورة مبيعات متأخرة",
        "اختر العميل",
        "اختر نوع المطالبة (تحدد مستوى الشدة والرسوم)",
        "راجع الفواتير المتأخرة في الجدول (تُجلب تلقائياً)",
        "أضف رسوم التأخير أو الفوائد إن وجدت",
        "اضغط «حفظ» ثم «تسجيل»",
        "أرسل خطاب المطالبة بالبريد الإلكتروني أو اطبعه"
      ],
      stepsEn: [
        "Click «New Dunning» or create from an overdue Sales Invoice",
        "Select the customer",
        "Select dunning type (determines severity level and fees)",
        "Review overdue invoices in the table (auto-populated)",
        "Add late fees or interest charges if applicable",
        "Click «Save» then «Submit»",
        "Send the dunning letter via email or print it"
      ]
    },

    "Dunning Type": {
      icon: "📋",
      summaryAr:
        "تعريف أنواع المطالبات (تذكير ودي، مطالبة رسمية، إنذار نهائي) مع تحديد نسبة الفوائد والرسوم لكل نوع.",
      summaryEn:
        "Define dunning types (friendly reminder, formal demand, final warning) with interest rates and fees for each type.",
      stepsAr: [
        "اضغط «نوع مطالبة جديد»",
        "أدخل اسم النوع (مثل: تذكير أول، مطالبة رسمية)",
        "حدد نسبة الفائدة على التأخير (إن وجدت)",
        "حدد مبلغ رسوم التأخير الثابت (إن وجد)",
        "أضف نص خطاب المطالبة",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Dunning Type»",
        "Enter the type name (e.g., First Reminder, Formal Demand)",
        "Set the late payment interest rate (if applicable)",
        "Set fixed late fee amount (if applicable)",
        "Add dunning letter text",
        "Click «Save»"
      ]
    },

    /* ═══ التقارير (توضيح فقط — بدون خطوات) ═══ */

    "Accounts Receivable": {
      icon: "📊",
      summaryAr:
        "تقرير يعرض جميع المبالغ المستحقة من العملاء مع تفاصيل الفواتير وأعمار الديون وتواريخ الاستحقاق.",
      summaryEn:
        "Report showing all amounts owed by customers with invoice details, aging, and due dates."
    },

    "Accounts Receivable Summary": {
      icon: "📋",
      summaryAr:
        "ملخص إجمالي الذمم المدينة لكل عميل مع تصنيف حسب فترات التقادم (٣٠، ٦٠، ٩٠ يوم).",
      summaryEn:
        "Summary of total receivables per customer with aging classification (30, 60, 90 days)."
    },

    "Sales Register": {
      icon: "📑",
      summaryAr:
        "سجل تفصيلي لجميع فواتير المبيعات المعتمدة مع بيانات العميل والمبالغ والضرائب.",
      summaryEn:
        "Detailed register of all submitted sales invoices with customer info, amounts, and taxes."
    },

    "Item-wise Sales Register": {
      icon: "📦",
      summaryAr:
        "سجل المبيعات مصنّف حسب المنتج — يعرض الكميات والمبالغ لكللكل عميل.",
      summaryEn:
        "Sales register classified by item — shows quantities and amounts per item for each customer."
    },

    "Sales Order Analysis": {
      icon: "📈",
      summaryAr:
        "تحليل طلبات المبيعات من حيث الحالة (معلقة، مسلّمة، مفوترة) والمبالغ والكميات.",
      summaryEn:
        "Analyze sales orders by status (pending, delivered, billed), amounts, and quantities."
    },

    "Delivered Items To Be Billed": {
      icon: "📥",
      summaryAr:
        "تقرير بالمنتجات التي تم تسليمها للعملاء ولكن لم تُصدر لها فواتير مبيعات بعد.",
      summaryEn:
        "Report of items delivered to customers but not yet billed with sales invoices."
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

  
  /* =========================================================
     DETAILS BUTTON HELPER
  ========================================================= */
  function hasDetailsButton(cardTitle, itemName) {
    if (typeof reportNames !== "undefined" && reportNames && reportNames.has(itemName)) return false;
    if (typeof singleDocs !== "undefined" && singleDocs && singleDocs.has(itemName)) return false;
    if (/report|تقارير|تقرير|analytics/i.test(cardTitle) || /report|تقرير/i.test(itemName)) return false;
    if (/setting|config|إعداد|اعداد|تكوين|تهيئة|setup/i.test(cardTitle) || /setting|إعداد|اعداد|تهيئة/i.test(itemName)) return false;
    return true;
  }


  function showInfoModal(data) {
    const title =
      isArabic
        ? (data.labelAr || translate(data.labelEn || data.name || "") || data.labelEn || data.name || "")
        : (data.labelEn || data.name || data.labelAr || "");

    const summary =
      isArabic
        ? (data.summaryAr || ("إدارة ومتابعة " + title + " وتنفيذ العمليات المرتبطة بها في النظام."))
        : (data.summaryEn || ("Manage and track " + title + " and perform related operations."));

    const rawSteps =
      isArabic
        ? data.stepsAr
        : data.stepsEn;

    const steps = (Array.isArray(rawSteps) && rawSteps.length > 0)
      ? rawSteps
      : (
        isArabic
          ? [
              "فتح شاشة " + title,
              "إدخال وتعبئة البيانات الأساسية المطلوبة",
              "مراجعة وتدقيق الحقول والتحقق من صحتها",
              "حفظ السجل واعتماد المستند"
            ]
          : [
              "Open " + (data.labelEn || title),
              "Fill in the required information and fields",
              "Review and verify mandatory values",
              "Save and submit the record"
            ]
      );

    const overlay = document.createElement("div");
    overlay.className = "erp-modal-overlay";
    overlay.setAttribute("dir", isArabic ? "rtl" : "ltr");

    overlay.innerHTML = `
      <div class="erp-modal-box">
        <button
          type="button"
          class="erp-modal-close"
          data-modal-close
        >
          ✕
        </button>

        <div class="erp-modal-header">
          <span class="erp-modal-icon">
            ${data.icon || "📄"}
          </span>
          <h3 class="erp-modal-title">
            ${escapeHtml(title)}
          </h3>
        </div>

        <p class="erp-modal-summary">
          ${escapeHtml(summary)}
        </p>

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

    requestAnimationFrame(() => {
      overlay.classList.add("is-visible");
    });

    function closeModal() {
      overlay.classList.remove("is-visible");
      overlay.addEventListener(
        "transitionend",
        () => overlay.remove(),
        { once: true }
      );
      setTimeout(() => overlay.remove(), 250);
    }

    overlay
      .querySelector("[data-modal-close]")
      ?.addEventListener("click", closeModal);

    overlay.addEventListener("click", event => {
      if (event.target === overlay) {
        closeModal();
      }
    });

    const launchBtn = overlay.querySelector("[data-modal-launch]");
    if (launchBtn) {
      launchBtn.addEventListener("click", () => {
        closeModal();
        openRoute(data.name || data.labelEn || data.doctype || title);
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
              const showDetails = hasDetailsButton(card[0] || (typeof cardTitle !== "undefined" ? cardTitle : ""), itemName);
              const detailsLabel = isArabic ? "تفاصيل" : "Details";
              const infoBtn = showDetails ? `<button type="button" class="erp-info-link" data-info-item="${escapeHtml(itemName)}">${detailsLabel}</button>`
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
              <article class="erp-card is-open tone-${(sectionIndex + cardIndex) % 5}" data-erp-card>
                <button type="button" class="erp-card-heading" data-card-toggle aria-expanded="true">
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
     ١٤. فتح الخيار
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
    const infoBtn =
        event.target.closest("[data-info-item]");

      if (infoBtn) {
        event.preventDefault();
        event.stopPropagation();

        const itemName =
          infoBtn.dataset.infoItem;

        const data =
          itemDescriptions[itemName] || {};

        showInfoModal({
          ...data,
          name: itemName,
          icon: data.icon || "📄",
          labelAr: translate(itemName) || itemName,
          labelEn: itemName,
          summaryAr: data.summaryAr,
          summaryEn: data.summaryEn,
          stepsAr: data.stepsAr,
          stepsEn: data.stepsEn
        });

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

      const isOpen =
        selectedCard.classList.contains("is-open");

      if (isOpen) {
        selectedCard.classList.remove("is-open");
        selectedCard.classList.add("is-collapsed");
        cardButton.setAttribute("aria-expanded", "false");
      } else {
        selectedCard.classList.add("is-open");
        selectedCard.classList.remove("is-collapsed");
        cardButton.setAttribute("aria-expanded", "true");
      }
    });


  /* ─────────────────────────────────────────
     ١٦. تشغيل
  ───────────────────────────────────────── */

  renderQuickActions();
  renderSections();
  renderFooter();
})();
