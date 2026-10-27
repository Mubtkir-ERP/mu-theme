(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم إدارة الإجازات — Leaves Workspace
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
    { labelEn: "Leave Application", labelAr: "طلبات الإجازة", doctype: "Leave Application", hasCount: true, countSuffixEn: "Open", countSuffixAr: "مفتوح", color: "#10b981" },
    { labelEn: "Leave Allocation", labelAr: "تخصيص ورصيد الإجازات", doctype: "Leave Allocation", hasCount: true, color: "#1e40af" }
  ];

  /* ─────────────────────────────────────────
     ٢. هيكل الأقسام والبطاقات (مطابق تماماً للصورة)
  ───────────────────────────────────────── */

  const sections = [
    [
      "Masters & Reports",
      [
        [
          "Setup",
          "⚙️",
          [
            "Holiday List",
            "Leave Type",
            "Leave Period",
            "Leave Policy",
            "Leave Block List"
          ]
        ],
        [
          "Allocation",
          "📊",
          [
            "Leave Allocation",
            "Leave Policy Assignment",
            "Leave Control Panel",
            "Leave Encashment"
          ]
        ],
        [
          "Application",
          "🌴",
          [
            "Leave Application",
            "Compensatory Leave Request"
          ]
        ],
        [
          "Reports",
          "📑",
          [
            "Employee Leave Balance",
            "Employee Leave Balance Summary",
            "Employees working on a holiday"
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
    "Employee Leave Balance",
    "Employee Leave Balance Summary",
    "Employees working on a holiday",
    "Employees Working on a Holiday"
  ]);

  const customRoutes = {
    "Leave Control Panel": ["leave-control-panel"]
  };

  /* ─────────────────────────────────────────
     ٤. الترجمات العربية
  ───────────────────────────────────────── */

  const arabicFallback = {
    "Your Shortcuts": "اختصاراتك السريعة",
    "Masters & Reports": "البيانات والتقارير",

    "Setup": "الإعداد والتهيئة",
    "Holiday List": "قائمة العطلات الرسمية",
    "Leave Type": "أنواع الإجازات",
    "Leave Period": "الفترة السنوية للإجازات",
    "Leave Policy": "سياسات ولوائح الإجازات",
    "Leave Block List": "قائمة حظر الإجازات (مواسم الذروة)",

    "Allocation": "التخصيص والأرصدة",
    "Leave Allocation": "تخصيص رصيد الإجازات",
    "Leave Policy Assignment": "إسناد سياسة الإجازات للموظفين",
    "Leave Control Panel": "لوحة وأداة التحكم بالأرصدة",
    "Leave Encashment": "صرف وبدل الإجازات نقدياً",

    "Application": "الطلبات والتنفيذ",
    "Leave Application": "طلب إجازة",
    "Compensatory Leave Request": "طلب إجازة تعويضية",

    "Reports": "التقارير",
    "Employee Leave Balance": "رصيد إجازات الموظف",
    "Employee Leave Balance Summary": "ملخص أرصدة الإجازات",
    "Employees working on a holiday": "الموظفون العاملون في العطلات"
  };

  /* ─────────────────────────────────────────
     ٥. أوصاف المستندات والإعدادات (مع خطوات تفصيلية)
  ───────────────────────────────────────── */

  const itemDescriptions = {
    "Holiday List": {
      icon: "📅",
      summaryAr: "سجل الإجازات الأسبوعية والعطلات الرسمية والوطنية للمنشأة لحساب أيام العمل الفعلية بدقة.",
      summaryEn: "Annual holiday schedule specifying weekly offs and national public holidays.",
      stepsAr: ["إنشاء قائمة عطلات وتحديد السنة والشركة والفرع", "تحديد أيام العطلة الأسبوعية (مثل الجمعة والسبت)", "إضافة تواريخ الأعياد والمناسبات الرسمية وحفظ القائمة"],
      stepsEn: ["Create holiday list for designated fiscal year and company", "Generate weekly off days (e.g. Friday and Saturday)", "Add national public holidays and save list"]
    },
    "Leave Type": {
      icon: "🌴",
      summaryAr: "تعريف وتصنيف أنواع الإجازات (سنوية، مرضية، دراسية، بدون راتب) وضوابط الترحيل والتعويض.",
      summaryEn: "Configure leave categories (annual, sick, unpaid) and carry-forward encashment rules.",
      stepsAr: ["إدخال اسم نوع الإجازة وتحديد ما إذا كانت مدفوعة الراتب", "تحديد شروط ترحيل الرصيد للعام القادم والحد الأقصى", "حفظ النوع لربطه بسياسات الإجازات"],
      stepsEn: ["Enter leave type name and flag whether paid or unpaid", "Set carry-forward rules, max allowed days, and encashment terms", "Save type to associate with corporate leave policies"]
    },
    "Leave Period": {
      icon: "🗓️",
      summaryAr: "تحديد الدورة السنوية لاحتساب واستحقاق أرصدة الإجازات (تاريخ البداية وتاريخ الانتهاء).",
      summaryEn: "Define annual cycle interval boundaries for employee leave balance accrual.",
      stepsAr: ["إنشاء فترة إجازات جديدة واختيار الشركة", "تحديد تاريخ بداية الدورة وتاريخ نهايتها", "تفعيل الفترة لتكون أساس احتساب الأرصدة السنوية للموظفين"],
      stepsEn: ["Create new leave period and select company", "Specify cycle start date and ending date", "Activate period to govern annual balance accruals"]
    },
    "Leave Policy": {
      icon: "📜",
      summaryAr: "صياغة لائحة استحقاق الإجازات؛ تحديد أيام الاستحقاق لكل نوع إجازة حسب فئات الموظفين.",
      summaryEn: "Formulate leave entitlement policy matrix mapping days allotted per leave type.",
      stepsAr: ["إنشاء سياسة إجازات جديدة وتحديد مسمى اللائحة", "إضافة أنواع الإجازات المستحقة وتحديد عدد الأيام السنوية لكل نوع", "حفظ السياسة لإسنادها لعقود ودرجات الموظفين"],
      stepsEn: ["Create leave policy defining entitlement framework", "Add leave types and set allocated annual day quotas", "Save policy ready to assign to employment grades"]
    },
    "Leave Block List": {
      icon: "⛔",
      summaryAr: "حظر تقديم الإجازات في فترات ومواسم الذروة التشغيلية المحددة للشركة أو لأقسام معينة.",
      summaryEn: "Block employee leave applications during designated peak business seasons or critical audits.",
      stepsAr: ["إنشاء قائمة حظر وتحديد فترات التواريخ الممنوع فيها الإجازة", "تحديد الأقسام والفروع المستهدفة بالحظر والمستثناة", "تفعيل القائمة لمنع تقديم الطلبات في الفترات المحظورة"],
      stepsEn: ["Create leave block list and specify blackout date ranges", "Apply restrictions to departments with selective exemptions", "Enable list to prevent leave requests during critical peaks"]
    },

    "Leave Allocation": {
      icon: "📊",
      summaryAr: "تخصيص وإيداع رصيد أيام الإجازات السنوي الفعلي في حساب الموظف لبدء الاستفادة منه.",
      summaryEn: "Allot and credit earned leave days quota to individual employee balance.",
      stepsAr: ["إنشاء تخصيص رصيد واختيار الموظف ونوع الإجازة وفترة الاستحقاق", "تحديد عدد الأيام الممنوحة والأيام المرحلة من العام السابق", "اعتماد التخصيص لإتاحة الرصيد في حساب الموظف فوراً"],
      stepsEn: ["Create allocation, selecting employee, leave type, and period", "Specify new allocated days plus carry-forward balance", "Submit allocation to update employee available leave quota"]
    },
    "Leave Policy Assignment": {
      icon: "👥",
      summaryAr: "إسناد وتطبيق سياسة الإجازات العامة على الموظف وتوليد أرصدته تلقائياً وفق اللائحة.",
      summaryEn: "Assign approved leave policy to an employee and auto-generate corresponding balance allocations.",
      stepsAr: ["اختيار الموظف وسياسة الإجازات المعتمدة وتاريخ بدء السريان", "مراجعة احتساب الأيام المستحقة بالتناسب مع تاريخ التعيين", "اعتماد الإسناد لتوليد تخصيصات الإجازة للموظف دفعة واحدة"],
      stepsEn: ["Select employee, target leave policy, and effective assignment date", "Review pro-rated day entitlements based on hire date", "Submit assignment to auto-generate all leave allocations"]
    },
    "Leave Control Panel": {
      icon: "🛠️",
      summaryAr: "أداة المعالجة الجماعية السريعة لتخصيص وترحيل وإسناد الإجازات لكافة موظفي المنشأة بضغطة واحدة.",
      summaryEn: "Bulk processing dashboard to allocate, assign, or carry-forward leave quotas company-wide.",
      stepsAr: ["تحديد الشركة والقسم وسياسة الإجازات وفترة الاستحقاق", "تحديد الموظفين المستهدفين وإجراء المعالجة الجماعية للأرصدة", "مراجعة تقرير التخصيص واعتماد النتائج"],
      stepsEn: ["Select company, department, policy, and target leave period", "Filter eligible employees and trigger bulk allocation process", "Review generated ledger summary and confirm execution"]
    },
    "Leave Encashment": {
      icon: "💵",
      summaryAr: "احتساب وصرف المقابل النقدي لرصيد الإجازات غير المستخدمة للموظف وترحيلها لرواتبه.",
      summaryEn: "Calculate and process cash payouts for unutilized accumulated employee leave balances.",
      stepsAr: ["إنشاء طلب بدل إجازة نقدي وتحديد الموظف ونوع الإجازة", "تحديد عدد الأيام المراد صرفها نقداً واحتساب المبلغ تلقائياً بناءً على الراتب", "اعتماد الطلب لترحيله إلى مسير الرواتب أو إصدار سند صرف"],
      stepsEn: ["Create encashment request for employee and leave type", "Specify days to encash and auto-compute payout against daily rate", "Submit document to credit amount into payroll or payment entry"]
    },

    "Leave Application": {
      icon: "🌴",
      summaryAr: "تقديم ومتابعة طلبات الإجازات (سنوية، مرضية، اضطرارية) والتحقق التلقائي من رصيد الموظف.",
      summaryEn: "Submit and approve leave requests (annual, sick, emergency) with auto-balance validation.",
      stepsAr: ["إنشاء طلب إجازة واختيار نوع الإجازة وتاريخ البداية والنهاية", "التحقق من كفاية الرصيد المتبقي وإرفاق التقارير إن وجدت", "حفظ وتقديم الطلب لاعتماده من المدير المباشر"],
      stepsEn: ["Create leave request, selecting leave type and start/end dates", "Verify leave balance quota and attach documentation if needed", "Submit application for direct line manager approval"]
    },
    "Compensatory Leave Request": {
      icon: "🔄",
      summaryAr: "طلب تعويض إجازة للموظف نظير عمله في أيام العطلات الأسبوعية أو الإجازات الرسمية.",
      summaryEn: "Request compensatory off days earned by employees for working on official weekends or holidays.",
      stepsAr: ["تحديد الموظف وتاريخ يوم العمل في العطلة", "التحقق من سجل الحضور لإثبات العمل الفعلي في اليوم المحدد", "اعتماد الطلب لإضافة يوم تعويضي إلى رصيد إجازات الموظف"],
      stepsEn: ["Select employee and designated holiday work date", "Verify attendance record proving active work on holiday", "Submit request to credit compensatory day into leave balance"]
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
              ${btn.hasCount ? `<span class="erp-stat-badge" data-badge-for="${escapeHtml(btn.doctype)}" style="margin-left: 8px; margin-right: 8px; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: rgba(16, 185, 129, 0.12); color: #059669;">...</span>` : ""}
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
