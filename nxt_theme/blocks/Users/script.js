(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم المستخدمين والصلاحيات — ERPNext Users
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
     ١. إحصائيات المستخدمين
  ───────────────────────────────────────── */

  const statsCards = [
    {
      id: "total-users",
      short: "USR",
      labelEn: "Total Users",
      labelAr: "إجمالي المستخدمين",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: { doctype: "User" },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "active-users",
      short: "ACT",
      labelEn: "Active Users",
      labelAr: "المستخدمين النشطين",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: { doctype: "User", filters: { enabled: 1, user_type: "System User" } },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "disabled-users",
      short: "DIS",
      labelEn: "Disabled Users",
      labelAr: "مستخدمين معطلين",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: { doctype: "User", filters: { enabled: 0 } },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "roles",
      short: "ROL",
      labelEn: "System Roles",
      labelAr: "الأدوار والصلاحيات",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: { doctype: "Role" },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    }
  ];

  /* ─────────────────────────────────────────
     ٢. أزرار الاختصارات السريعة (مطابقة للصورة الأصلية)
  ───────────────────────────────────────── */

  const quickActionButtons = [
    {
      doctype: "User",
      labelEn: "User",
      labelAr: "مستخدم"
    },
    {
      doctype: "Role",
      labelEn: "Role",
      labelAr: "دور"
    },
    {
      doctype: "Role Permissions Manager",
      isPage: true,
      route: "permission-manager",
      labelEn: "Permission Manager",
      labelAr: "مدير الصلاحيات"
    },
    {
      doctype: "User Profile",
      isUserProfile: true,
      labelEn: "User Profile",
      labelAr: "الملف الشخصي"
    },
    {
      doctype: "User Type",
      labelEn: "User Type",
      labelAr: "نوع المستخدم"
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
     ٤. بطاقات المستخدمين — مطابقة للصورة الأصلية
  ───────────────────────────────────────── */

  const sections = [
    [
      "Reports & Masters",
      [
        [
          "Users",
          "👥",
          [
            "User",
            "Role",
            "Role Profile",
            "Module Profile"
          ]
        ],
        [
          "Logs",
          "📜",
          [
            "Activity Log",
            "Access Log"
          ]
        ],
        [
          "Permissions",
          "🛡️",
          [
            "Role Permissions Manager",
            "User Permissions",
            "Role Permission for Page and Report",
            "Permitted Documents For User",
            "Document Share Report"
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

    // المربع ١: المستخدمين
    "Users": "المستخدمين",
    "User": "المستخدم",
    "Role": "الدور",
    "Role Profile": "ملف تعريف الأدوار",
    "Module Profile": "ملف تعريف الوحدات",

    // المربع ٢: السجلات
    "Logs": "السجلات",
    "Activity Log": "سجل الأنشطة والعمليات",
    "Access Log": "سجل الدخول والوصول",

    // المربع ٣: الصلاحيات
    "Permissions": "الصلاحيات والأذونات",
    "Role Permissions Manager": "مدير صلاحيات الأدوار",
    "User Permissions": "صلاحيات المستخدم على البيانات",
    "Role Permission for Page and Report": "صلاحيات الصفحات والتقارير للأدوار",
    "Permitted Documents For User": "المستندات المصرح بها للمستخدم",
    "Document Share Report": "تقرير مشاركة المستندات",

    // الاختصارات
    "Permission Manager": "مدير الصلاحيات",
    "User Profile": "الملف الشخصي",
    "User Type": "نوع المستخدم"
  };

  /* ─────────────────────────────────────────
     ٦. أنواع المسارات
  ───────────────────────────────────────── */

  const reportNames = new Set([
    "Permitted Documents For User",
    "Document Share Report"
  ]);

  const treeDocs = new Set([]);

  const singleDocs = new Set([]);

  /* ─────────────────────────────────────────
     ٧. تفاصيل الشاشات والإعدادات (ما عدا التقارير)
  ───────────────────────────────────────── */

  const itemDescriptions = {
    // ═══ المستخدمين ═══
    "User": {
      icon: "👤",
      summaryAr: "إنشاء وإدارة حسابات موظفي ومستخدمي النظام، وتعيين الأدوار والصلاحيات، وتعيين كلمات المرور والمصادقة الثنائية.",
      summaryEn: "Create and manage system user accounts, assign roles, reset passwords, and configure two-factor authentication.",
      stepsAr: [
        "اضغط «مستخدم جديد»",
        "أدخل البريد الإلكتروني والاسم الأول والأخير",
        "حدد نوع المستخدم (مستخدم نظام System User أو مستخدم موقع Website User)",
        "اختر الأدوار والصلاحيات المناسبة في جدول الأدوار",
        "اضغط «حفظ» لإرسال بريد التفعيل وتعيين كلمة المرور"
      ],
      stepsEn: [
        "Click «New User»",
        "Enter email address, first name, and last name",
        "Select User Type (System User or Website User)",
        "Assign applicable roles in the Roles table",
        "Click «Save» to trigger welcome invite and password setup"
      ]
    },

    "Role": {
      icon: "🔑",
      summaryAr: "تعريف المسميات الوظيفية والأدوار الأمنية بالنظام (مثل: مدير مبيعات، محاسب، أمين مستودع) لتجميع الصلاحيات.",
      summaryEn: "Define security roles and organizational job profiles (e.g. Sales Manager, Accountant, Stock Keeper).",
      stepsAr: [
        "اضغط «دور جديد»",
        "أدخل اسم الدور الوظيفي",
        "حدد ما إذا كان مخصصاً لمستخدمي المكتب Desk Access",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Role»",
        "Enter role name",
        "Check Desk Access if role requires backend UI access",
        "Click «Save»"
      ]
    },

    "Role Profile": {
      icon: "🗂️",
      summaryAr: "باقة أدوار وصلاحيات مجمعة لتطبيقها على مستخدمين متعددين بنقرة واحدة لتسهيل إدارة الفرق الكبيرة.",
      summaryEn: "Bundle multiple roles into reusable role profiles for fast one-click assignment to multiple users.",
      stepsAr: [
        "اضغط «ملف تعريف أدوار جديد»",
        "أدخل اسم الملف (مثل: باقة مسؤولي المشتريات)",
        "حدد مجموعة الأدوار التابعة لهذا الملف",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Role Profile»",
        "Enter profile title",
        "Select included roles checklist",
        "Click «Save»"
      ]
    },

    "Module Profile": {
      icon: "📦",
      summaryAr: "تحديد الوحدات والأقسام المسموح للمستخدم برؤيتها في القائمة الجانبية وشريط التنقل وإخفاء البقية.",
      summaryEn: "Control workspace module visibility on the sidebar and navigation desk per user group.",
      stepsAr: [
        "اضغط «ملف تعريف وحدات جديد»",
        "أدخل اسم الملف وحدد الوحدات المسموح بظهورها فقط",
        "اربط الملف بحسابات المستخدمين المعنيين",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New Module Profile»",
        "Enter title and check allowed modules",
        "Assign profile to target users",
        "Click «Save»"
      ]
    },

    // ═══ السجلات ═══
    "Activity Log": {
      icon: "📝",
      summaryAr: "سجل تدقيق كامل لكافة الأنشطة والعمليات التي تمت بالنظام مع بيان المستخدم ونوع الحركة والتاريخ والوقت.",
      summaryEn: "Comprehensive system audit log tracking user actions, document updates, timestamp, and IP addresses.",
      stepsAr: [
        "افتح «سجل الأنشطة والعمليات»",
        "استعرض الحركات مصنفة حسب المستخدم أو نوع المستند أو التاريخ",
        "اضغط على أي عملية لمراجعة التفاصيل والقيم السابقة والجديدة"
      ],
      stepsEn: [
        "Open «Activity Log»",
        "Filter actions by user, document type, or date range",
        "Click any log entry to view historical diff and changes"
      ]
    },

    "Access Log": {
      icon: "🚪",
      summaryAr: "سجل أمني متقدم يوثق عمليات تصدير البيانات وعرض التقارير الحساسة ومحاولات تنزيل الملفات.",
      summaryEn: "Security access log recording sensitive document exports, report generation, and data views.",
      stepsAr: [
        "افتح «سجل الدخول والوصول»",
        "راجع تفاصيل الوصول للملفات وتصدير البيانات الحساسة",
        "تأكد من مطابقة صلاحيات التنزيل والتصدير للسياسات الأمنية"
      ],
      stepsEn: [
        "Open «Access Log»",
        "Audit data exports, downloads, and report views",
        "Ensure compliance with organizational data security policies"
      ]
    },

    // ═══ الصلاحيات ═══
    "Role Permissions Manager": {
      icon: "🛡️",
      summaryAr: "الشاشة المركزية لضبط أذونات القراءة والكتابة والإنشاء والتعديل والإلغاء على مستوى كافة الشاشات والمستندات.",
      summaryEn: "Central permission matrix configuring Read, Write, Create, Submit, Cancel, and Delete access per DocType and Role.",
      stepsAr: [
        "افتح «مدير صلاحيات الأدوار»",
        "اختر المستند المراد ضبط صلاحياته (مثل: فاتورة مبيعات)",
        "حدد الدور الوظيفي واستعرض الصلاحيات الممنوحة",
        "فعل أو عطل أذونات: القراءة، الإنشاء، التعديل، التسجيل، والإلغاء",
        "اضبط أذونات الحقول السرية عبر مستويات الصلاحية Perm Levels"
      ],
      stepsEn: [
        "Open «Role Permissions Manager»",
        "Select target DocType and Role",
        "Toggle permissions: Read, Write, Create, Submit, Cancel, Delete",
        "Configure row-level or field-level Perm Levels as needed"
      ]
    },

    "User Permissions": {
      icon: "🔒",
      summaryAr: "تقييد وصول المستخدم إلى سجلات محددة فقط (مثل: فرع معين، شركة محددة، أو عملاء منطقة معينة) دون غيرها.",
      summaryEn: "Row-level data security restricting a user to specific records (e.g., Company, Branch, or Territory).",
      stepsAr: [
        "اضغط «صلاحية مستخدم جديدة»",
        "اختر المستخدم المراد تقييد صلاحياته",
        "حدد نوع المستند المسموح به والقيمة المحددة (مثل: الشركة = فرع الرياض)",
        "حدد ما إذا كان القيد يطبق على كافة الشاشات المرتبطة",
        "اضغط «حفظ»"
      ],
      stepsEn: [
        "Click «New User Permission»",
        "Select user to restrict",
        "Select allow DocType and specific allowed value (e.g. Branch = Riyadh)",
        "Specify if restriction cascades across linked DocTypes",
        "Click «Save»"
      ]
    },

    "Role Permission for Page and Report": {
      icon: "📑",
      summaryAr: "تحديد صلاحيات الوصول والاطلاع على الصفحات والتقارير المخصصة لكل دور وظيفي.",
      summaryEn: "Manage page and report access permissions assigned to specific security roles.",
      stepsAr: [
        "افتح «صلاحيات الصفحات والتقارير للأدوار»",
        "اختر الدور الوظيفي واستعرض قائمة التقارير والصفحات المسموح بها",
        "أضف أو احذف الصفحات والتقارير الممنوحة للدور",
        "اضغط «تحديث الصلاحيات»"
      ],
      stepsEn: [
        "Open «Role Permission for Page and Report»",
        "Select role to inspect permitted reports and pages",
        "Add or revoke page and custom report access",
        "Click «Update Permissions»"
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

    // إزالة أي نافذة سابقة مفتوحة
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
          el.textContent = formatNumber(val);
        }
      });
    });
  }

  /* ─────────────────────────────────────────
     ١١. إنشاء أزرار الاختصارات السريعة
  ───────────────────────────────────────── */

  function renderQuickActions() {
    if (!quickActions) return;

    const title = isArabic ? "اختصاراتك" : "Your Shortcuts";

    quickActions.innerHTML = `
      <h2 class="erp-section-title">${escapeHtml(title)}</h2>
      <div class="erp-quick-grid">
        ${quickActionButtons.map(btn => {
          const label = isArabic ? btn.labelAr : btn.labelEn;
          return `
            <button type="button" class="erp-quick-btn" data-shortcut-btn="${escapeHtml(btn.doctype)}" ${btn.isPage ? 'data-is-page="1"' : ""} ${btn.isUserProfile ? 'data-is-profile="1"' : ""}>
              <span class="erp-quick-icon" aria-hidden="true">+</span>
              <span class="erp-quick-label">${escapeHtml(label)}</span>
            </button>`;
        }).join("")}
      </div>
    `;

    quickActions.addEventListener("click", event => {
      const btn = event.target.closest("[data-shortcut-btn]");
      if (!btn) return;
      const doctype = btn.dataset.shortcutBtn;

      if (!window.frappe) return;

      if (btn.dataset.isPage === "1") {
        frappe.set_route("permission-manager");
        return;
      }

      if (btn.dataset.isProfile === "1") {
        const user = frappe.session?.user || "Administrator";
        frappe.set_route("Form", "User", user);
        return;
      }

      if (typeof frappe.set_route === "function") {
        frappe.set_route("List", doctype);
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
    if (name === "Role Permissions Manager") {
      frappe.set_route("permission-manager");
      return;
    }
    if (name === "Role Permission for Page and Report") {
      frappe.set_route("role-permission-for-page-and-report");
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
