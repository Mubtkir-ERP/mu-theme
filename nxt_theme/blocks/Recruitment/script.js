(() => {

  /* =========================================================
     MUBTKIR ERP — RECRUITMENT WORKSPACE
  ========================================================= */

  const root =
    root_element.querySelector("[data-erp-dashboard]");

  const cycleSection =
    root_element.querySelector("[data-purchase-cycle]");

  const statsSection =
    root_element.querySelector("[data-stats-section]");

  const quickActions =
    root_element.querySelector("[data-quick-actions]");

  const content =
    root_element.querySelector("[data-dashboard-content]");

  const footerEl =
    root_element.querySelector("[data-dashboard-footer]");

  if (!root) return;


  /* =========================================================
     1. LANGUAGE
  ========================================================= */

  const langValue =
    window.frappe?.boot?.lang ||
    document.documentElement.lang ||
    "en";

  const isArabic =
    String(langValue).toLowerCase().startsWith("ar");

  root.setAttribute(
    "dir",
    isArabic ? "rtl" : "ltr"
  );


  /* =========================================================
     2. HELPERS
  ========================================================= */

  function escapeHtml(value) {

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  function formatNumber(value) {

    return (
      parseFloat(value) || 0
    ).toLocaleString("en-US");
  }


  function getToday() {

    try {

      if (
        frappe.datetime &&
        frappe.datetime.get_today
      ) {
        return frappe.datetime.get_today();
      }

    } catch (e) {}

    return new Date()
      .toISOString()
      .slice(0, 10);
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

          callback: r => {

            resolve(
              r && r.message
                ? r.message
                : 0
            );

          },

          error: () => resolve(0)

        });

      } catch (e) {

        console.error(
          "Recruitment Count Error:",
          doctype,
          e
        );

        resolve(0);

      }

    });

  }


  function newDoc(doctype) {

    try {

      frappe.new_doc(doctype);

    } catch (e) {

      console.error(
        "Recruitment New Doc Error:",
        doctype,
        e
      );

    }

  }


  /* =========================================================
     3. REPORTS
  ========================================================= */

  const reportNames = new Set([
    "Recruitment Analytics"
  ]);


  function openRoute(name) {

    try {

      if (reportNames.has(name)) {

        frappe.set_route(
          "query-report",
          name
        );

        return;
      }


      frappe.set_route(
        "List",
        name
      );

    } catch (e) {

      console.error(
        "Recruitment Route Error:",
        name,
        e
      );

    }

  }


  /* =========================================================
     4. RECRUITMENT CYCLE
  ========================================================= */

  const cycleCards = [

    {
      step: 1,

      action: "new",
      doctype: "Job Opening",

      labelAr: "إنشاء شاغر وظيفي",
      labelEn: "Job Opening",

      descriptionAr:
        "إنشاء الشاغر وتحديد المسمى الوظيفي وعدد الوظائف المطلوبة.",

      descriptionEn:
        "Create a vacancy and define the position and requirements."
    },


    {
      step: 2,

      action: "route",
      doctype: "Job Applicant",

      labelAr: "استقبال المتقدمين",
      labelEn: "Job Applicants",

      descriptionAr:
        "استقبال وتسجيل طلبات المتقدمين للوظائف.",

      descriptionEn:
        "Receive and manage applications for open positions."
    },


    {
      step: 3,

      action: "new",
      doctype: "Interview",

      labelAr: "المقابلة",
      labelEn: "Interview",

      descriptionAr:
        "تحديد موعد المقابلة وربطها بالمتقدم للوظيفة.",

      descriptionEn:
        "Schedule an interview for the selected applicant."
    },


    {
      step: 4,

      action: "route",
      doctype: "Interview Feedback",

      labelAr: "تقييم المتقدم",
      labelEn: "Interview Feedback",

      descriptionAr:
        "تسجيل تقييم ونتيجة المقابلة للمتقدم.",

      descriptionEn:
        "Record interview feedback and applicant evaluation."
    },


    {
      step: 5,

      action: "new",
      doctype: "Job Offer",

      labelAr: "العرض الوظيفي",
      labelEn: "Job Offer",

      descriptionAr:
        "إصدار العرض الوظيفي للمتقدم المقبول.",

      descriptionEn:
        "Create a job offer for the selected applicant."
    },


    {
      step: 6,

      action: "new",
      doctype: "Employee",

      labelAr: "تحويل إلى موظف",
      labelEn: "Create Employee",

      descriptionAr:
        "إنشاء ملف الموظف بعد قبول العرض الوظيفي.",

      descriptionEn:
        "Create the employee record after accepting the offer."
    }

  ];


  /* =========================================================
     5. OVERVIEW
  ========================================================= */

  const statsCards = [

    {
      id: "open-jobs",

      short: "JOB",

      labelAr: "الشواغر المفتوحة",
      labelEn: "Open Job Openings",

      fetch: () =>
        safeCount(
          "Job Opening",
          {
            status: "Open"
          }
        )
    },


    {
      id: "applicants",

      short: "APP",

      labelAr: "المتقدمون للوظائف",
      labelEn: "Job Applicants",

      fetch: () =>
        safeCount(
          "Job Applicant"
        )
    },


    {
      id: "interviews",

      short: "INT",

      labelAr: "المقابلات القادمة",
      labelEn: "Upcoming Interviews",

      fetch: () =>
        safeCount(
          "Interview",
          {
            scheduled_on: [
              ">=",
              getToday()
            ],
            docstatus: [
              "<",
              2
            ]
          }
        )
    },


    {
      id: "job-offers",

      short: "OFR",

      labelAr: "العروض الوظيفية",
      labelEn: "Job Offers",

      fetch: () =>
        safeCount(
          "Job Offer",
          {
            docstatus: [
              "<",
              2
            ]
          }
        )
    }

  ];


  /* =========================================================
     6. QUICK ACTIONS
  ========================================================= */

  const quickButtons = [

    {
      doctype: "Job Opening",

      labelAr: "شاغر وظيفي جديد",
      labelEn: "New Job Opening"
    },


    {
      doctype: "Job Applicant",

      labelAr: "متقدم جديد",
      labelEn: "New Applicant"
    },


    {
      doctype: "Interview",

      labelAr: "مقابلة جديدة",
      labelEn: "New Interview"
    },


    {
      doctype: "Job Offer",

      labelAr: "عرض وظيفي جديد",
      labelEn: "New Job Offer"
    }

  ];


  /* =========================================================
     7. LOWER CARDS
  ========================================================= */

  const cards = [

    {
      titleAr: "الشواغر الوظيفية",
      titleEn: "Job Openings",

      icon: "💼",

      links: [
        "Job Opening"
      ]
    },


    {
      titleAr: "المتقدمون",
      titleEn: "Applicants",

      icon: "👥",

      links: [
        "Job Applicant"
      ]
    },


    {
      titleAr: "المقابلات",
      titleEn: "Interviews",

      icon: "🗣️",

      links: [
        "Interview",
        "Interview Type",
        "Interview Round",
        "Interview Feedback"
      ]
    },


    {
      titleAr: "العروض الوظيفية",
      titleEn: "Job Offers",

      icon: "📄",

      links: [
        "Job Offer"
      ]
    },


    {
      titleAr: "الموظفون",
      titleEn: "Employees",

      icon: "👤",

      links: [
        "Employee"
      ]
    },


    {
      titleAr: "الهيكل الوظيفي",
      titleEn: "Organization",

      icon: "🏢",

      links: [
        "Department",
        "Designation",
        "Employment Type"
      ]
    },


    {
      titleAr: "إعدادات التوظيف",
      titleEn: "Recruitment Setup",

      icon: "⚙️",

      links: [
        "Staffing Plan",
        "Appointment Letter Template"
      ]
    },


    {
      titleAr: "التقارير",
      titleEn: "Reports",

      icon: "📊",

      links: [
        "Recruitment Analytics"
      ]
    }

  ];


  /* =========================================================
     8. TRANSLATIONS
  ========================================================= */

  const translations = {

    "Job Opening":
      "الشاغر الوظيفي",

    "Job Applicant":
      "المتقدم للوظيفة",

    "Interview":
      "المقابلة",

    "Interview Type":
      "نوع المقابلة",

    "Interview Round":
      "مرحلة المقابلة",

    "Interview Feedback":
      "تقييم المقابلة",

    "Job Offer":
      "العرض الوظيفي",

    "Employee":
      "الموظف",

    "Department":
      "القسم",

    "Designation":
      "المسمى الوظيفي",

    "Employment Type":
      "نوع التوظيف",

    "Staffing Plan":
      "خطة التوظيف",

    "Appointment Letter Template":
      "قالب خطاب التعيين",

    "Recruitment Analytics":
      "تحليل التوظيف"

  };


  function translate(name) {

    if (!isArabic)
      return name;

    return translations[name] || name;
  }


  /* =========================================================
     9. RENDER CYCLE
  ========================================================= */

  function renderCycle() {

    if (!cycleSection)
      return;


    cycleSection.innerHTML = `

      <section class="erp-cycle-container">

        <h2
          class="
            erp-section-title
            erp-cycle-title
          "
        >
          ${
            isArabic
              ? "دورة التوظيف"
              : "Recruitment Cycle"
          }
        </h2>


        <div
          class="erp-cycle-grid"
          style="
            grid-template-columns:
            repeat(
              ${cycleCards.length},
              minmax(0, 1fr)
            );
          "
        >

          ${cycleCards
            .map(
              (card, index) => `

                <div class="erp-cycle-item">

                  <button
                    type="button"
                    class="
                      erp-cycle-card
                      cycle-tone-${(index % 4) + 1}
                    "
                    data-recruit-cycle="${index}"
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
                    index < cycleCards.length - 1
                      ? `
                        <span class="erp-cycle-arrow">
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


    cycleSection.addEventListener(
      "click",
      event => {

        const element =
          event.target.closest(
            "[data-recruit-cycle]"
          );


        if (!element)
          return;


        const card =
          cycleCards[
            Number(
              element.dataset.recruitCycle
            )
          ];


        if (!card)
          return;


        if (card.action === "new") {

          newDoc(card.doctype);

          return;
        }


        openRoute(card.doctype);

      }
    );

  }


  /* =========================================================
     10. RENDER OVERVIEW
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
                      data-recruit-stat="${card.id}"
                    >
                      0
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

      Promise
        .resolve()
        .then(() => card.fetch())
        .then(value => {

          const element =
            statsSection.querySelector(
              `[data-recruit-stat="${card.id}"]`
            );


          if (element) {

            element.textContent =
              formatNumber(value);

          }

        })
        .catch(error => {

          console.error(
            "Recruitment Stat Error:",
            card.id,
            error
          );

        });

    });

  }


  /* =========================================================
     11. RENDER QUICK ACTIONS
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

        ${quickButtons
          .map(
            (button, index) => `

              <button
                type="button"
                class="erp-quick-btn"
                data-recruit-quick="${index}"
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
            "[data-recruit-quick]"
          );


        if (!element)
          return;


        const button =
          quickButtons[
            Number(
              element.dataset.recruitQuick
            )
          ];


        if (!button)
          return;


        newDoc(button.doctype);

      }
    );

  }


  /* =========================================================
     12. RENDER LOWER CARDS
  ========================================================= */

  function renderCards() {

    if (!content)
      return;


    const cardsHtml =
      cards
        .map(
          (card, index) => {

            const links =
              card.links
                .map(
                  item => `

                    <div class="erp-link-row">

                      <button
                        type="button"
                        class="erp-link"
                        data-recruit-route="${escapeHtml(item)}"
                      >

                        <span class="erp-link-text">
                          ${escapeHtml(translate(item))}
                        </span>


                        <span class="erp-link-arrow">
                          ${isArabic ? "←" : "→"}
                        </span>

                      </button>
                                ${
                                  (!/report|setting|تقارير|تقرير|إعداد|اعداد/i.test(card[0]) &&
                                   !/report|setting|تقارير|تقرير|إعداد|اعداد/i.test(section[0]) &&
                                   !/report|setting/i.test(item))
                                    ? `<button type="button" class="erp-info-link" data-info-item="${escapeHtml(item)}">${isArabic ? 'تفاصيل' : 'Details'}</button>`
                                    : ''
                                }

                    </div>

                  `
                )
                .join("");


            return `

              <article
                class="
                  erp-card is-open
                  tone-${index % 5}
                "
                data-recruit-card
              >

                <button
                  type="button"
                  class="erp-card-heading"
                  data-recruit-toggle
                  aria-expanded="false"
                >

                  <span class="erp-icon">
                    ${card.icon}
                  </span>


                  <span class="erp-card-title">

                    ${escapeHtml(
                      isArabic
                        ? card.titleAr
                        : card.titleEn
                    )}

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


    
  function showInfoModal(itemName) {
    const title = isArabic ? (translate(itemName) || itemName) : itemName;
    const summary = isArabic
      ? ('إدارة ومتابعة ' + title + ' وتنفيذ العمليات المرتبطة بها في النظام.')
      : ('Manage and track ' + itemName + ' and perform related operations.');
    const steps = isArabic
      ? [
          'فتح شاشة ' + title,
          'إدخال وتعبئة البيانات الأساسية المطلوبة',
          'مراجعة وتدقيق الحقول الإلزامية',
          'حفظ المستند والاعتماد النهائي'
        ]
      : [
          'Open ' + itemName,
          'Fill in the required information and fields',
          'Review and verify mandatory values',
          'Save and submit the record'
        ];

    const overlay = document.createElement('div');
    overlay.className = 'erp-modal-overlay';
    overlay.setAttribute('dir', isArabic ? 'rtl' : 'ltr');

    overlay.innerHTML =
      '<div class="erp-modal-box">' +
        '<button type="button" class="erp-modal-close" data-modal-close>✕</button>' +
        '<div class="erp-modal-header">' +
          '<span class="erp-modal-icon">📄</span>' +
          '<h3 class="erp-modal-title">' + escapeHtml(title) + '</h3>' +
        '</div>' +
        '<p class="erp-modal-summary">' + escapeHtml(summary) + '</p>' +
        '<button type="button" class="erp-modal-toggle-steps" data-modal-toggle-steps>' +
          (isArabic ? '📖 عرض الخطوات' : '📖 Show Steps') +
        '</button>' +
        '<div class="erp-modal-steps" data-modal-steps>' +
          '<ol class="erp-modal-steps-list">' +
            steps.map(s => '<li>' + escapeHtml(s) + '</li>').join('') +
          '</ol>' +
        '</div>' +
      '</div>';

    root.appendChild(overlay);
    setTimeout(() => overlay.classList.add('is-visible'), 10);

    const closeBtn = overlay.querySelector('[data-modal-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => overlay.remove());
    }
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.remove();
    });

    const toggleBtn = overlay.querySelector('[data-modal-toggle-steps]');
    const stepsBox = overlay.querySelector('[data-modal-steps]');
    if (toggleBtn && stepsBox) {
      toggleBtn.addEventListener('click', () => {
        stepsBox.classList.toggle('is-shown');
      });
    }
  }


content.innerHTML = `

      <section class="erp-module-section">

        <h2 class="erp-section-title">

          ${
            isArabic
              ? "البيانات الرئيسية والتقارير"
              : "Reports & Masters"
          }

        </h2>


        <div class="erp-dashboard-grid">
          ${cardsHtml}
        </div>

      </section>

    `;


    content.addEventListener(
      "click",
      event => {
        const infoButton = event.target.closest('[data-info-item]');
        if (infoButton) {
          event.preventDefault();
          event.stopPropagation();
          showInfoModal(infoButton.dataset.infoItem);
          return;
        }



        const routeButton =
          event.target.closest(
            "[data-recruit-route]"
          );


        if (routeButton) {

          event.preventDefault();

          openRoute(
            routeButton.dataset.recruitRoute
          );

          return;
        }


        const toggle =
          event.target.closest(
            "[data-recruit-toggle]"
          );


        if (!toggle)
          return;


        const selectedCard =
          toggle.closest(
            "[data-recruit-card]"
          );


        if (!selectedCard)
          return;


        const shouldOpen =
          !selectedCard.classList.contains(
            "is-open"
          );


        content
          .querySelectorAll(
            "[data-recruit-card]"
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

  }


  /* =========================================================
     13. FOOTER
  ========================================================= */

    function renderFooter() {
    if (!footerEl) return;
    const _cfg = (window.frappe && frappe.boot && frappe.boot.theme_settings) || {};
    const _ph = _cfg.phone || "0115110455";
    const _em = _cfg.email || "sales@mubtkir.com";
    const _web = _cfg.website || "www.mubtkir.com";

    footerEl.innerHTML = [
      '<div class="erp-footer-inner">',
      '  <div class="erp-footer-item">',
      '    <span class="erp-footer-icon">☎</span>',
      '    <span class="erp-footer-label">' + (isArabic ? "الهاتف الموحد:" : "Phone:") + '</span>',
      '    <a href="tel:' + _ph + '" class="erp-footer-link" dir="ltr">' + _ph + '</a>',
      '  </div>',
      '  <span class="erp-footer-sep">|</span>',
      '  <div class="erp-footer-item">',
      '    <span class="erp-footer-icon">✉</span>',
      '    <span class="erp-footer-label">' + (isArabic ? "البريد الإلكتروني:" : "Email:") + '</span>',
      '    <a href="mailto:' + _em + '" class="erp-footer-link">' + _em + '</a>',
      '  </div>',
      '  <span class="erp-footer-sep">|</span>',
      '  <div class="erp-footer-item">',
      '    <span class="erp-footer-icon">🌐</span>',
      '    <span class="erp-footer-label">' + (isArabic ? "الموقع:" : "Website:") + '</span>',
      '    <a href="https://' + _web + '" class="erp-footer-link" target="_blank" rel="noopener">' + _web + '</a>',
      '  </div>',
      '</div>'
    ].join("\n");
  }


  /* =========================================================
     14. INIT
  ========================================================= */

  try {

    renderCycle();

  } catch (e) {

    console.error(
      "Recruitment Cycle Error:",
      e
    );

  }


  try {

    renderStats();

  } catch (e) {

    console.error(
      "Recruitment Stats Error:",
      e
    );

  }


  try {

    renderQuickActions();

  } catch (e) {

    console.error(
      "Recruitment Quick Actions Error:",
      e
    );

  }


  try {

    renderCards();

  } catch (e) {

    console.error(
      "Recruitment Cards Error:",
      e
    );

  }


  try {

    renderFooter();

  } catch (e) {

    console.error(
      "Recruitment Footer Error:",
      e
    );

  }

})();