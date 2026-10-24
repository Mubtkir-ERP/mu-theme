(() => {

  /* =========================================================
     MUBTKIR ERP — SUPPORT WORKSPACE
     لوحة تحكم قسم الدعم
  ========================================================= */

  const root = root_element.querySelector("[data-erp-dashboard]");
  const supportCycle = root_element.querySelector("[data-purchase-cycle]");
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

  const isArabic =
    String(langValue).toLowerCase().startsWith("ar");

  root.setAttribute("dir", isArabic ? "rtl" : "ltr");
  root.classList.toggle("erp-dashboard-rtl", isArabic);


  /* =========================================================
     2. HELPERS
  ========================================================= */

  function escapeHtml(value) {

    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }


  function formatNumber(number) {

    return (
      parseFloat(number) || 0
    ).toLocaleString("en-US");
  }


  function safeCount(doctype, filters = {}) {

    return new Promise(resolve => {

      try {

        frappe.call({

          method: "frappe.client.get_count",

          args: {
            doctype,
            filters
          },

          callback: data =>
            resolve(data?.message || 0),

          error: () =>
            resolve(0)

        });

      }

      catch (e) {

        resolve(0);

      }

    });

  }


  /* =========================================================
     3. SUPPORT CYCLE
  ========================================================= */

  const supportCycleCards = [

    {
      step: 1,
      action: "new",
      doctype: "Issue",

      labelEn: "Open Ticket",
      labelAr: "فتح تذكرة",

      descriptionEn:
        "Create a new support ticket.",

      descriptionAr:
        "إنشاء تذكرة دعم جديدة."
    },

    {
      step: 2,
      action: "route",
      doctype: "Issue Type",

      labelEn: "Classify Ticket",
      labelAr: "تصنيف التذكرة",

      descriptionEn:
        "Classify tickets by issue type.",

      descriptionAr:
        "تصنيف التذكرة حسب نوع المشكلة."
    },

    {
      step: 3,
      action: "route",
      doctype: "Issue",

      labelEn: "Assign",
      labelAr: "تعيين المسؤول",

      descriptionEn:
        "Assign the ticket to the responsible support user.",

      descriptionAr:
        "تعيين التذكرة لموظف الدعم المسؤول."
    },

    {
      step: 4,
      action: "route",
      doctype: "Issue",

      labelEn: "Process",
      labelAr: "معالجة التذكرة",

      descriptionEn:
        "Track the ticket and customer communication.",

      descriptionAr:
        "متابعة التذكرة والتواصل مع العميل."
    },

    {
      step: 5,
      action: "route",
      doctype: "Issue",

      labelEn: "Resolve",
      labelAr: "حل التذكرة",

      descriptionEn:
        "Mark the issue as resolved.",

      descriptionAr:
        "تسجيل التذكرة كمحلولة بعد إنهاء المشكلة."
    },

    {
      step: 6,
      action: "route",
      doctype: "Issue",

      labelEn: "Close",
      labelAr: "إغلاق التذكرة",

      descriptionEn:
        "Close the completed support ticket.",

      descriptionAr:
        "إغلاق التذكرة بعد اكتمال المعالجة."
    }

  ];


  /* =========================================================
     4. OVERVIEW
  ========================================================= */

  const statsCards = [

    {
      id: "open-issues",

      short: "OPEN",

      labelEn: "Open Tickets",
      labelAr: "التذاكر المفتوحة",

      fetch: () =>
        safeCount(
          "Issue",
          {
            status: "Open"
          }
        )
    },


    {
      id: "replied-issues",

      short: "WORK",

      labelEn: "In Progress",
      labelAr: "قيد المعالجة",

      fetch: () =>
        safeCount(
          "Issue",
          {
            status: "Replied"
          }
        )
    },


    {
      id: "resolved-issues",

      short: "DONE",

      labelEn: "Resolved Tickets",
      labelAr: "التذاكر المحلولة",

      fetch: () =>
        safeCount(
          "Issue",
          {
            status: "Resolved"
          }
        )
    },


    {
      id: "total-issues",

      short: "ALL",

      labelEn: "Total Tickets",
      labelAr: "إجمالي التذاكر",

      fetch: () =>
        safeCount(
          "Issue"
        )
    }

  ];


  /* =========================================================
     5. QUICK ACTIONS
  ========================================================= */

  const quickActionButtons = [

    {
      action: "new",
      doctype: "Issue",

      labelEn: "New Ticket",
      labelAr: "تذكرة جديدة"
    },

    {
      action: "route",
      doctype: "Issue",

      labelEn: "Support Tickets",
      labelAr: "تذاكر الدعم"
    },

    {
      action: "route",
      doctype: "Issue Type",

      labelEn: "Issue Types",
      labelAr: "أنواع التذاكر"
    },

    {
      action: "route",
      doctype: "Service Level Agreement",

      labelEn: "Service Level",
      labelAr: "اتفاقيات مستوى الخدمة"
    }

  ];


  /* =========================================================
     6. FOOTER
  ========================================================= */

  const footerInfo = {

    phone: "0115110455",

    email: "sales@mubtkir.com",

    website: "www.mubtkir.com",

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
     7. DASHBOARD SECTIONS
  ========================================================= */

  const sections = [

    [
      "Reports & Masters",

      [

        [
          "Support Tickets",
          "🎫",
          [
            "Issue"
          ]
        ],

        [
          "Issue Classification",
          "🏷️",
          [
            "Issue Type"
          ]
        ],

        [
          "Service Level",
          "⏱️",
          [
            "Service Level Agreement"
          ]
        ],

        [
          "Communication",
          "💬",
          [
            "Communication"
          ]
        ],

        [
          "Warranty",
          "🛡️",
          [
            "Warranty Claim"
          ]
        ],

        [
          "Settings",
          "⚙️",
          [
            "Support Settings"
          ]
        ]

      ]

    ]

  ];


  /* =========================================================
     8. ARABIC TRANSLATIONS
  ========================================================= */

  const arabicFallback = {

    "Reports & Masters":
      "البيانات الرئيسية والإعدادات",

    "Support Tickets":
      "تذاكر الدعم",

    "Issue Classification":
      "تصنيف التذاكر",

    "Service Level":
      "اتفاقيات مستوى الخدمة",

    "Communication":
      "التواصل",

    "Warranty":
      "الضمان",

    "Settings":
      "الإعدادات",


    "Issue":
      "تذكرة الدعم",

    "Issue Type":
      "نوع التذكرة",

    "Service Level Agreement":
      "اتفاقية مستوى الخدمة",

    "Communication":
      "التواصل",

    "Warranty Claim":
      "مطالبة ضمان",

    "Support Settings":
      "إعدادات الدعم"

  };


  /* =========================================================
     9. ROUTING
  ========================================================= */

  const singleDocs =
    new Set([
      "Support Settings"
    ]);


  function translate(name) {

    if (!isArabic)
      return name;

    return (
      arabicFallback[name] ||
      (
        typeof window.__ === "function"
          ? window.__(name)
          : name
      )
    );
  }


  function openRoute(name) {

    if (
      !window.frappe ||
      typeof frappe.set_route !== "function"
    )
      return;


    if (singleDocs.has(name)) {

      frappe.set_route(
        "Form",
        name
      );

      return;

    }


    frappe.set_route(
      "List",
      name
    );
  }


  /* =========================================================
     10. ITEM DESCRIPTIONS
  ========================================================= */

  const itemDescriptions = {

    "Issue": {

      icon: "🎫",

      summaryAr:
        "إنشاء ومتابعة تذاكر الدعم من وقت استلام المشكلة وحتى حلها وإغلاقها.",

      summaryEn:
        "Create and track support tickets from initial request to resolution and closure.",

      stepsAr: [

        "اضغط «تذكرة جديدة»",

        "أدخل عنوان المشكلة",

        "حدد العميل عند الحاجة",

        "حدد نوع التذكرة",

        "اكتب وصف المشكلة",

        "عيّن موظف الدعم",

        "تابع التواصل مع العميل",

        "حدّث حالة التذكرة",

        "أغلق التذكرة بعد حل المشكلة"

      ],

      stepsEn: [

        "Click «New Issue»",

        "Enter issue subject",

        "Select customer if required",

        "Select Issue Type",

        "Describe the issue",

        "Assign support user",

        "Track customer communication",

        "Update issue status",

        "Close after resolution"

      ]

    },


    "Issue Type": {

      icon: "🏷️",

      summaryAr:
        "تصنيف التذاكر حسب نوع المشكلة لتسهيل تنظيم ومتابعة أعمال الدعم.",

      summaryEn:
        "Classify tickets by problem type for easier support management.",

      stepsAr: [

        "اضغط «نوع تذكرة جديد»",

        "أدخل اسم النوع",

        "احفظ النوع",

        "استخدمه عند إنشاء تذاكر الدعم"

      ],

      stepsEn: [

        "Click «New Issue Type»",

        "Enter type name",

        "Save the type",

        "Use it when creating Issues"

      ]

    },


    "Service Level Agreement": {

      icon: "⏱️",

      summaryAr:
        "تحديد أوقات الاستجابة والحل المطلوبة لتذاكر الدعم حسب شروط الخدمة.",

      summaryEn:
        "Define response and resolution targets for support tickets.",

      stepsAr: [

        "اضغط «اتفاقية مستوى خدمة جديدة»",

        "أدخل اسم الاتفاقية",

        "حدد العملاء أو الشروط",

        "حدد أوقات العمل",

        "حدد زمن الاستجابة",

        "حدد زمن الحل",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Click «New Service Level Agreement»",

        "Enter agreement name",

        "Set customers or conditions",

        "Set working hours",

        "Set response time",

        "Set resolution time",

        "Click «Save»"

      ]

    },


    "Communication": {

      icon: "💬",

      summaryAr:
        "استعراض المراسلات ورسائل البريد والردود المرتبطة بتذاكر الدعم.",

      summaryEn:
        "Review messages, emails and replies linked to support tickets.",

      stepsAr: [

        "افتح سجل التواصل",

        "راجع الرسائل الواردة والصادرة",

        "راجع المستند المرتبط",

        "تابع تاريخ التواصل والمحتوى"

      ],

      stepsEn: [

        "Open Communication",

        "Review incoming and outgoing messages",

        "Review linked document",

        "Track communication history"

      ]

    },


    "Warranty Claim": {

      icon: "🛡️",

      summaryAr:
        "تسجيل ومتابعة مطالبات الضمان المتعلقة بالمنتجات المباعة للعملاء.",

      summaryEn:
        "Track warranty claims for items sold to customers.",

      stepsAr: [

        "اضغط «مطالبة ضمان جديدة»",

        "حدد العميل",

        "حدد المنتج أو الرقم التسلسلي",

        "اكتب وصف المشكلة",

        "حدد الإجراء المطلوب",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Click «New Warranty Claim»",

        "Select customer",

        "Select item or serial number",

        "Describe the problem",

        "Define required action",

        "Click «Save»"

      ]

    },


    "Support Settings": {

      icon: "⚙️",

      summaryAr:
        "إعدادات عامة للتحكم في طريقة عمل تذاكر الدعم.",

      summaryEn:
        "Configure general support and Issue behavior.",

      stepsAr: [

        "افتح «إعدادات الدعم»",

        "راجع خيارات تذاكر الدعم",

        "راجع إعدادات الخدمة",

        "احفظ التغييرات"

      ],

      stepsEn: [

        "Open Support Settings",

        "Review Issue options",

        "Review service settings",

        "Save changes"

      ]

    }

  };


  /* =========================================================
     11. INFO MODAL
  ========================================================= */

  function showInfoModal(data) {

    const title =
      isArabic
        ? data.labelAr
        : data.labelEn;

    const summary =
      isArabic
        ? data.summaryAr
        : data.summaryEn;

    const steps =
      isArabic
        ? data.stepsAr
        : data.stepsEn;

    const hasSteps =
      Array.isArray(steps) &&
      steps.length > 0;


    const overlay =
      document.createElement("div");

    overlay.className =
      "erp-modal-overlay";

    overlay.setAttribute(
      "dir",
      isArabic ? "rtl" : "ltr"
    );


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


        ${
          hasSteps
            ? `

              <button
                type="button"
                class="erp-modal-toggle-steps"
                data-toggle-steps
              >
                ${
                  isArabic
                    ? "📖 عرض الخطوات"
                    : "📖 Show Steps"
                }
              </button>


              <div
                class="erp-modal-steps"
                data-modal-steps
              >

                <ol class="erp-modal-steps-list">

                  ${steps
                    .map(
                      step =>
                        `<li>${escapeHtml(step)}</li>`
                    )
                    .join("")}

                </ol>

              </div>

            `
            : ""
        }

      </div>

    `;


    root.appendChild(overlay);


    requestAnimationFrame(() => {

      overlay.classList.add(
        "is-visible"
      );

    });


    overlay
      .querySelector("[data-modal-close]")
      ?.addEventListener(
        "click",
        () => overlay.remove()
      );


    overlay.addEventListener(

      "click",

      event => {

        if (event.target === overlay)
          overlay.remove();

      }

    );


    const toggleButton =
      overlay.querySelector(
        "[data-toggle-steps]"
      );

    const stepsContainer =
      overlay.querySelector(
        "[data-modal-steps]"
      );


    if (
      toggleButton &&
      stepsContainer
    ) {

      toggleButton.addEventListener(

        "click",

        () => {

          stepsContainer.classList.toggle(
            "is-shown"
          );


          toggleButton.textContent =
            stepsContainer.classList.contains(
              "is-shown"
            )
              ? (
                  isArabic
                    ? "📖 إخفاء الخطوات"
                    : "📖 Hide Steps"
                )
              : (
                  isArabic
                    ? "📖 عرض الخطوات"
                    : "📖 Show Steps"
                );

        }

      );

    }

  }


  /* =========================================================
     12. RENDER SUPPORT CYCLE
  ========================================================= */

  function renderSupportCycle() {

    if (!supportCycle)
      return;


    supportCycle.innerHTML = `

      <section class="erp-cycle-container">

        <h2
          class="
            erp-section-title
            erp-cycle-title
          "
        >
          ${
            isArabic
              ? "دورة الدعم"
              : "Support Cycle"
          }
        </h2>


        <div
          class="erp-cycle-grid"
          style="
            grid-template-columns:
            repeat(
              ${supportCycleCards.length},
              minmax(0,1fr)
            );
          "
        >

          ${supportCycleCards

            .map(
              (card, index) => `

                <div class="erp-cycle-item">

                  <button
                    type="button"
                    class="
                      erp-cycle-card
                      cycle-tone-${(index % 4) + 1}
                    "
                    data-cycle-index="${index}"
                  >

                    <span class="erp-cycle-number">
                      ${card.step}
                    </span>


                    <span class="erp-cycle-card-title">

                      ${escapeHtml(
                        isArabic
                          ? card.labelAr
                          : card.labelEn
                      )}

                    </span>


                    <span class="erp-cycle-description">

                      ${escapeHtml(
                        isArabic
                          ? card.descriptionAr
                          : card.descriptionEn
                      )}

                    </span>

                  </button>


                  ${
                    index <
                    supportCycleCards.length - 1

                      ? `
                        <span
                          class="erp-cycle-arrow"
                          aria-hidden="true"
                        >
                          ${isArabic ? "←" : "→"}
                        </span>
                      `

                      : ""
                  }

                </div>

              `
            )

            .join("")}

        </div>

      </section>

    `;


    supportCycle.addEventListener(

      "click",

      event => {

        const element =
          event.target.closest(
            "[data-cycle-index]"
          );


        if (!element)
          return;


        const card =
          supportCycleCards[
            Number(
              element.dataset.cycleIndex
            )
          ];


        if (!card)
          return;


        if (card.action === "new") {

          frappe.new_doc(
            card.doctype
          );

          return;

        }


        openRoute(
          card.doctype
        );

      }

    );

  }


  /* =========================================================
     13. RENDER STATS
  ========================================================= */

  function renderStats() {

    if (!statsSection)
      return;


    statsSection.innerHTML = `

      <section class="erp-overview-container">

        <h2 class="erp-section-title">

          ${
            isArabic
              ? "نظرة عامة"
              : "Overview"
          }

        </h2>


        <div class="erp-stats-grid">

          ${statsCards

            .map(
              (card, index) => `

                <div
                  class="
                    erp-stat-card
                    overview-tone-${index + 1}
                  "
                >

                  <div class="erp-stat-icon">
                    ${escapeHtml(card.short)}
                  </div>


                  <div class="erp-stat-info">

                    <span
                      class="erp-stat-value"
                      data-stat-id="${card.id}"
                    >
                      ...
                    </span>


                    <span class="erp-stat-label">

                      ${escapeHtml(
                        isArabic
                          ? card.labelAr
                          : card.labelEn
                      )}

                    </span>

                  </div>

                </div>

              `
            )

            .join("")}

        </div>

      </section>

    `;


    statsCards.forEach(card => {

      try {

        card
          .fetch()
          .then(value => {

            const element =
              statsSection.querySelector(
                `[data-stat-id="${card.id}"]`
              );


            if (element) {

              element.textContent =
                formatNumber(value);

            }

          })
          .catch(() => {

            const element =
              statsSection.querySelector(
                `[data-stat-id="${card.id}"]`
              );

            if (element)
              element.textContent = "0";

          });

      }

      catch (e) {

        const element =
          statsSection.querySelector(
            `[data-stat-id="${card.id}"]`
          );

        if (element)
          element.textContent = "0";

      }

    });

  }


  /* =========================================================
     14. QUICK ACTIONS
  ========================================================= */

  function renderQuickActions() {

    if (!quickActions)
      return;


    quickActions.innerHTML = `

      <h2 class="erp-section-title">

        ${
          isArabic
            ? "اختصارات سريعة"
            : "Quick Actions"
        }

      </h2>


      <div class="erp-quick-grid">

        ${quickActionButtons

          .map(
            (button, index) => `

              <button
                type="button"
                class="erp-quick-btn"
                data-quick-index="${index}"
              >

                <span class="erp-quick-label">

                  ${escapeHtml(
                    isArabic
                      ? button.labelAr
                      : button.labelEn
                  )}

                </span>

              </button>

            `
          )

          .join("")}

      </div>

    `;


    quickActions.addEventListener(

      "click",

      event => {

        const element =
          event.target.closest(
            "[data-quick-index]"
          );


        if (!element)
          return;


        const button =
          quickActionButtons[
            Number(
              element.dataset.quickIndex
            )
          ];


        if (!button)
          return;


        if (button.action === "new") {

          frappe.new_doc(
            button.doctype
          );

          return;

        }


        openRoute(
          button.doctype
        );

      }

    );

  }


  /* =========================================================
     15. RENDER SECTIONS
  ========================================================= */

  function renderSections() {

    content.innerHTML =
      sections

        .map(
          (section, sectionIndex) => {


            const cards =
              section[1]

                .map(
                  (card, cardIndex) => {


                    const links =
                      card[2]

                        .map(
                          item => {


                            const description =
                              itemDescriptions[item];


                            return `

                              <div class="erp-link-row">

                                <button
                                  type="button"
                                  class="erp-link"
                                  data-route-name="${escapeHtml(item)}"
                                >

                                  <span class="erp-link-text">
                                    ${escapeHtml(translate(item))}
                                  </span>


                                  <span class="erp-link-arrow">
                                    ${isArabic ? "←" : "→"}
                                  </span>

                                </button>


                                ${
                                  description

                                    ? `
                                      <button
                                        type="button"
                                        class="erp-info-link"
                                        data-info-item="${escapeHtml(item)}"
                                      >
                                        ${
                                          isArabic
                                            ? "تفاصيل"
                                            : "Details"
                                        }
                                      </button>
                                    `

                                    : ""
                                }

                              </div>

                            `;

                          }
                        )

                        .join("");


                    return `

                      <article
                        class="
                          erp-card
                          tone-${(sectionIndex + cardIndex) % 5}
                        "
                        data-erp-card
                      >

                        <button
                          type="button"
                          class="erp-card-heading"
                          data-card-toggle
                          aria-expanded="false"
                        >

                          <span class="erp-icon">
                            ${card[1]}
                          </span>


                          <span class="erp-card-title">
                            ${escapeHtml(translate(card[0]))}
                          </span>


                          <span class="erp-card-chevron">
                            ⌄
                          </span>

                        </button>


                        <div class="erp-card-links">
                          ${links}
                        </div>

                      </article>

                    `;

                  }
                )

                .join("");


            return `

              <section class="erp-module-section">

                <h2 class="erp-section-title">
                  ${escapeHtml(translate(section[0]))}
                </h2>


                <div class="erp-dashboard-grid">
                  ${cards}
                </div>

              </section>

            `;

          }
        )

        .join("");

  }


  /* =========================================================
     16. FOOTER
  ========================================================= */

  function renderFooter() {

    if (!footerEl)
      return;


    footerEl.innerHTML = `

      <div class="erp-footer-inner">

        <div class="erp-footer-item">

          <span class="erp-footer-icon">
            ☎
          </span>

          <span class="erp-footer-label">

            ${
              isArabic
                ? footerInfo.labels.phoneAr
                : footerInfo.labels.phoneEn
            }:

          </span>

          <a
            href="tel:${footerInfo.phone}"
            class="erp-footer-link"
            dir="ltr"
          >
            ${footerInfo.phone}
          </a>

        </div>


        <span class="erp-footer-sep">
          |
        </span>


        <div class="erp-footer-item">

          <span class="erp-footer-icon">
            ✉
          </span>

          <span class="erp-footer-label">

            ${
              isArabic
                ? footerInfo.labels.emailAr
                : footerInfo.labels.emailEn
            }:

          </span>

          <a
            href="mailto:${footerInfo.email}"
            class="erp-footer-link"
          >
            ${footerInfo.email}
          </a>

        </div>


        <span class="erp-footer-sep">
          |
        </span>


        <div class="erp-footer-item">

          <span class="erp-footer-icon">
            ◎
          </span>

          <span class="erp-footer-label">

            ${
              isArabic
                ? footerInfo.labels.websiteAr
                : footerInfo.labels.websiteEn
            }:

          </span>

          <a
            href="https://${footerInfo.website}"
            class="erp-footer-link"
            target="_blank"
            rel="noopener"
          >
            ${footerInfo.website}
          </a>

        </div>

      </div>

    `;

  }


  /* =========================================================
     17. EVENTS
  ========================================================= */

  let lastToggleTime = 0;


  content.addEventListener(

    "click",

    event => {


      const infoButton =
        event.target.closest(
          "[data-info-item]"
        );


      if (infoButton) {

        event.preventDefault();
        event.stopPropagation();


        const itemName =
          infoButton.dataset.infoItem;

        const data =
          itemDescriptions[itemName];


        if (data) {

          showInfoModal({

            ...data,

            labelAr:
              translate(itemName),

            labelEn:
              itemName

          });

        }


        return;

      }


      const routeButton =
        event.target.closest(
          "[data-route-name]"
        );


      if (routeButton) {

        event.preventDefault();
        event.stopPropagation();


        openRoute(
          routeButton.dataset.routeName
        );


        return;

      }


      const cardButton =
        event.target.closest(
          "[data-card-toggle]"
        );


      if (!cardButton)
        return;


      const now =
        Date.now();


      if (
        now - lastToggleTime <
        400
      )
        return;


      lastToggleTime =
        now;


      const selectedCard =
        cardButton.closest(
          "[data-erp-card]"
        );


      if (!selectedCard)
        return;


      const shouldOpen =
        !selectedCard.classList.contains(
          "is-open"
        );


      content
        .querySelectorAll(
          "[data-erp-card]"
        )
        .forEach(card => {

          if (card !== selectedCard) {

            card.classList.remove(
              "is-open"
            );

          }

        });


      selectedCard.classList.toggle(
        "is-open",
        shouldOpen
      );

    }

  );


  /* =========================================================
     18. INIT
  ========================================================= */

  try {
    renderSupportCycle();
  } catch (e) {
    console.error("Support Cycle Error:", e);
  }

  try {
    renderStats();
  } catch (e) {
    console.error("Support Stats Error:", e);
  }

  try {
    renderQuickActions();
  } catch (e) {
    console.error("Support Quick Actions Error:", e);
  }

  try {
    renderSections();
  } catch (e) {
    console.error("Support Sections Error:", e);
  }

  try {
    renderFooter();
  } catch (e) {
    console.error("Support Footer Error:", e);
  }

})();