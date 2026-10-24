(() => {

  /* =========================================================
     MUBTKIR ERP — PERFORMANCE WORKSPACE
     لوحة تحكم الأداء والتقييم
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
    String(langValue)
      .toLowerCase()
      .startsWith("ar");

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


  function safeCount(
    doctype,
    filters = {}
  ) {

    return new Promise(resolve => {

      try {

        frappe.call({

          method:
            "frappe.client.get_count",

          args: {
            doctype,
            filters
          },

          callback: r => {

            resolve(
              r?.message || 0
            );

          },

          error: () =>
            resolve(0)

        });

      } catch (e) {

        console.error(
          "Performance Count Error:",
          doctype,
          e
        );

        resolve(0);

      }

    });

  }


  function newDoc(doctype) {

    try {

      frappe.new_doc(
        doctype
      );

    } catch (e) {

      console.error(
        "Performance New Doc Error:",
        doctype,
        e
      );

    }

  }


  /* =========================================================
     3. ROUTING
  ========================================================= */

  const reportNames =
    new Set([
      "Appraisal Overview",
      "Employee Performance Feedback"
    ]);


  const treeDocs =
    new Set([
      "Department"
    ]);


  function openRoute(name) {

    try {

      if (
        reportNames.has(name)
      ) {

        frappe.set_route(
          "query-report",
          name
        );

        return;
      }


      if (
        treeDocs.has(name)
      ) {

        frappe.set_route(
          "Tree",
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
        "Performance Route Error:",
        name,
        e
      );

    }

  }


  /* =========================================================
     4. PERFORMANCE CYCLE
  ========================================================= */

  const cycleCards = [

    {
      step: 1,

      action: "new",
      doctype: "Appraisal Cycle",

      labelAr:
        "إنشاء دورة تقييم",

      labelEn:
        "Appraisal Cycle",

      descriptionAr:
        "إنشاء دورة تقييم وتحديد الفترة والموظفين المستهدفين.",

      descriptionEn:
        "Create an appraisal cycle and define the review period."
    },


    {
      step: 2,

      action: "goal-selector",

      labelAr:
        "تحديد معايير الأداء",

      labelEn:
        "Goals & KRA",

      descriptionAr:
        "تحديد الأهداف ومعايير ومؤشرات تقييم الأداء.",

      descriptionEn:
        "Define goals, KRAs and performance criteria."
    },


    {
      step: 3,

      action: "new",
      doctype: "Appraisal",

      labelAr:
        "تعيين التقييم",

      labelEn:
        "Assign Appraisal",

      descriptionAr:
        "إنشاء تقييم وربطه بالموظف ودورة التقييم.",

      descriptionEn:
        "Create an appraisal for the employee."
    },


    {
      step: 4,

      action: "route",
      doctype: "Appraisal",

      labelAr:
        "التقييم الذاتي",

      labelEn:
        "Self Appraisal",

      descriptionAr:
        "إدخال الموظف تقييمه الذاتي ونتائج أهدافه.",

      descriptionEn:
        "Record self appraisal and goal achievement."
    },


    {
      step: 5,

      action: "route",
      doctype: "Employee Performance Feedback",

      labelAr:
        "تقييم المدير والملاحظات",

      labelEn:
        "Manager Feedback",

      descriptionAr:
        "تسجيل ملاحظات المدير والتقييم المرتبط بأداء الموظف.",

      descriptionEn:
        "Record manager feedback and performance observations."
    },


    {
      step: 6,

      action: "route",
      doctype: "Appraisal",

      labelAr:
        "اعتماد التقييم",

      labelEn:
        "Final Review",

      descriptionAr:
        "مراجعة النتيجة النهائية واعتماد تقييم الموظف.",

      descriptionEn:
        "Review and finalize the employee appraisal."
    },


    {
      step: 7,

      action: "route",
      doctype: "Appraisal",

      labelAr:
        "متابعة النتائج",

      labelEn:
        "Performance Results",

      descriptionAr:
        "استعراض نتائج التقييم ومقارنتها بين الموظفين.",

      descriptionEn:
        "Review appraisal outcomes and employee performance results."
    }

  ];


  /* =========================================================
     5. OVERVIEW
  ========================================================= */

  const statsCards = [

    {
      id:
        "active-cycles",

      short:
        "CYC",

      labelAr:
        "دورات التقييم النشطة",

      labelEn:
        "Active Appraisal Cycles",

      fetch: () =>
        safeCount(
          "Appraisal Cycle",
          {
            status: [
              "!=",
              "Completed"
            ]
          }
        )
    },


    {
      id:
        "open-appraisals",

      short:
        "OPEN",

      labelAr:
        "التقييمات المفتوحة",

      labelEn:
        "Open Appraisals",

      fetch: () =>
        safeCount(
          "Appraisal",
          {
            docstatus: 0
          }
        )
    },


    {
      id:
        "completed-appraisals",

      short:
        "DONE",

      labelAr:
        "التقييمات المكتملة",

      labelEn:
        "Completed Appraisals",

      fetch: () =>
        safeCount(
          "Appraisal",
          {
            docstatus: 1
          }
        )
    },


    {
      id:
        "feedback-count",

      short:
        "FB",

      labelAr:
        "ملاحظات الأداء",

      labelEn:
        "Performance Feedback",

      fetch: () =>
        safeCount(
          "Employee Performance Feedback"
        )
    }

  ];


  /* =========================================================
     6. QUICK ACTIONS
  ========================================================= */

  const quickButtons = [

    {
      doctype:
        "Appraisal Cycle",

      labelAr:
        "دورة تقييم جديدة",

      labelEn:
        "New Appraisal Cycle"
    },


    {
      doctype:
        "Appraisal",

      labelAr:
        "تقييم موظف جديد",

      labelEn:
        "New Appraisal"
    },


    {
      doctype:
        "Goal",

      labelAr:
        "هدف جديد",

      labelEn:
        "New Goal"
    },


    {
      doctype:
        "Employee Performance Feedback",

      labelAr:
        "ملاحظة أداء جديدة",

      labelEn:
        "New Performance Feedback"
    }

  ];


  /* =========================================================
     7. LOWER CARDS
  ========================================================= */

  const cards = [

    {
      titleAr:
        "التقييمات",

      titleEn:
        "Appraisals",

      icon:
        "📋",

      links: [
        "Appraisal"
      ]
    },


    {
      titleAr:
        "دورات التقييم",

      titleEn:
        "Appraisal Cycles",

      icon:
        "🔄",

      links: [
        "Appraisal Cycle"
      ]
    },


    {
      titleAr:
        "الأهداف ومعايير الأداء",

      titleEn:
        "Goals & KRA",

      icon:
        "🎯",

      links: [
        "Goal",
        "KRA"
      ]
    },


    {
      titleAr:
        "ملاحظات الأداء",

      titleEn:
        "Performance Feedback",

      icon:
        "💬",

      links: [
        "Employee Performance Feedback"
      ]
    },


    {
      titleAr:
        "الموظفون",

      titleEn:
        "Employees",

      icon:
        "👤",

      links: [
        "Employee"
      ]
    },


    {
      titleAr:
        "الأقسام",

      titleEn:
        "Departments",

      icon:
        "🏢",

      links: [
        "Department"
      ]
    },


    {
      titleAr:
        "المسميات الوظيفية",

      titleEn:
        "Designations",

      icon:
        "🪪",

      links: [
        "Designation"
      ]
    },


    {
      titleAr:
        "قوالب التقييم",

      titleEn:
        "Appraisal Templates",

      icon:
        "📝",

      links: [
        "Appraisal Template"
      ]
    },


    {
      titleAr:
        "التقارير",

      titleEn:
        "Reports",

      icon:
        "📊",

      links: [
        "Appraisal Overview"
      ]
    }

  ];


  /* =========================================================
     8. TRANSLATIONS
  ========================================================= */

  const translations = {

    "Appraisal":
      "تقييم الموظف",

    "Appraisal Cycle":
      "دورة التقييم",

    "Goal":
      "الهدف",

    "KRA":
      "معيار الأداء الرئيسي",

    "Employee Performance Feedback":
      "ملاحظات أداء الموظف",

    "Employee":
      "الموظف",

    "Department":
      "القسم",

    "Designation":
      "المسمى الوظيفي",

    "Appraisal Template":
      "قالب التقييم",

    "Appraisal Overview":
      "ملخص التقييمات"

  };


  function translate(name) {

    if (!isArabic)
      return name;

    return (
      translations[name] ||
      name
    );

  }


  /* =========================================================
     9. GOAL SELECTOR
  ========================================================= */

  function showGoalSelector() {

    const overlay =
      document.createElement("div");

    overlay.className =
      "erp-modal-overlay";

    overlay.setAttribute(
      "dir",
      isArabic
        ? "rtl"
        : "ltr"
    );


    overlay.innerHTML = `

      <div class="erp-modal-box">

        <button
          type="button"
          class="erp-modal-close"
          data-performance-close
        >
          ✕
        </button>


        <div class="erp-modal-header">

          <span class="erp-modal-icon">
            🎯
          </span>

          <h3 class="erp-modal-title">

            ${
              isArabic
                ? "الأهداف ومعايير الأداء"
                : "Goals & Performance Criteria"
            }

          </h3>

        </div>


        <div
          class="erp-quick-grid"
          style="
            margin-top:18px;
            grid-template-columns:
            repeat(2,minmax(0,1fr)) !important;
          "
        >

          <button
            type="button"
            class="erp-quick-btn"
            data-performance-master="Goal"
          >
            ${
              isArabic
                ? "الأهداف"
                : "Goals"
            }
          </button>


          <button
            type="button"
            class="erp-quick-btn"
            data-performance-master="Appraisal Template"
          >
            ${
              isArabic
                ? "قوالب التقييم"
                : "Appraisal Templates"
            }
          </button>

        </div>

      </div>

    `;


    root.appendChild(
      overlay
    );


    requestAnimationFrame(() => {

      overlay.classList.add(
        "is-visible"
      );

    });


    overlay
      .querySelector(
        "[data-performance-close]"
      )
      ?.addEventListener(
        "click",
        () => overlay.remove()
      );


    overlay.addEventListener(
      "click",
      event => {

        if (
          event.target === overlay
        ) {

          overlay.remove();

        }

      }
    );


    overlay
      .querySelectorAll(
        "[data-performance-master]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const doctype =
              button.dataset.performanceMaster;

            overlay.remove();

            openRoute(
              doctype
            );

          }
        );

      });

  }


  /* =========================================================
     10. RENDER CYCLE
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
              ? "دورة الأداء والتقييم"
              : "Performance Management Cycle"
          }
        </h2>


        <div
          class="erp-cycle-grid"
          style="
            grid-template-columns:
            repeat(
              ${cycleCards.length},
              minmax(0,1fr)
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
                    data-performance-cycle="${index}"
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
                    cycleCards.length - 1

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
            "[data-performance-cycle]"
          );


        if (!element)
          return;


        const card =
          cycleCards[
            Number(
              element.dataset.performanceCycle
            )
          ];


        if (!card)
          return;


        if (
          card.action === "new"
        ) {

          newDoc(
            card.doctype
          );

          return;

        }


        if (
          card.action ===
          "goal-selector"
        ) {

          showGoalSelector();

          return;

        }


        openRoute(
          card.doctype
        );

      }
    );

  }


  /* =========================================================
     11. RENDER STATS
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
                      data-performance-stat="${card.id}"
                    >
                      0
                    </span>


                    <span
                      class="erp-stat-label"
                    >

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


    statsCards.forEach(
      card => {

        Promise
          .resolve()
          .then(
            () => card.fetch()
          )
          .then(
            value => {

              const element =
                statsSection.querySelector(
                  `[data-performance-stat="${card.id}"]`
                );


              if (element) {

                element.textContent =
                  formatNumber(value);

              }

            }
          )
          .catch(
            error => {

              console.error(
                "Performance Stat Error:",
                card.id,
                error
              );

            }
          );

      }
    );

  }


  /* =========================================================
     12. QUICK ACTIONS
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
                data-performance-quick="${index}"
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
            "[data-performance-quick]"
          );


        if (!element)
          return;


        const button =
          quickButtons[
            Number(
              element.dataset.performanceQuick
            )
          ];


        if (!button)
          return;


        newDoc(
          button.doctype
        );

      }
    );

  }


  /* =========================================================
     13. RENDER CARDS
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
                        data-performance-route="${escapeHtml(item)}"
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
                  erp-card
                  tone-${index % 5}
                "
                data-performance-card
              >

                <button
                  type="button"
                  class="erp-card-heading"
                  data-performance-toggle
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
            "[data-performance-route]"
          );


        if (routeButton) {

          event.preventDefault();

          openRoute(
            routeButton.dataset.performanceRoute
          );

          return;
        }


        const toggle =
          event.target.closest(
            "[data-performance-toggle]"
          );


        if (!toggle)
          return;


        const selectedCard =
          toggle.closest(
            "[data-performance-card]"
          );


        if (!selectedCard)
          return;


        const shouldOpen =
          !selectedCard.classList.contains(
            "is-open"
          );


        content
          .querySelectorAll(
            "[data-performance-card]"
          )
          .forEach(card => {

            if (
              card !== selectedCard
            ) {

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
     14. FOOTER
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
     15. INIT
  ========================================================= */

  try {
    renderCycle();
  } catch (e) {
    console.error(
      "Performance Cycle Error:",
      e
    );
  }


  try {
    renderStats();
  } catch (e) {
    console.error(
      "Performance Stats Error:",
      e
    );
  }


  try {
    renderQuickActions();
  } catch (e) {
    console.error(
      "Performance Quick Actions Error:",
      e
    );
  }


  try {
    renderCards();
  } catch (e) {
    console.error(
      "Performance Cards Error:",
      e
    );
  }


  try {
    renderFooter();
  } catch (e) {
    console.error(
      "Performance Footer Error:",
      e
    );
  }

})();