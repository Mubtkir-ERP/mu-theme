(() => {

  /* =========================================================
     MUBTKIR ERP — PROJECTS WORKSPACE
     لوحة تحكم المشاريع
  ========================================================= */

  const root =
    root_element.querySelector("[data-erp-dashboard]");

  const projectCycle =
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
          "Project Count Error:",
          doctype,
          e
        );

        resolve(0);

      }

    });

  }


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


      frappe.set_route(
        "List",
        name
      );

    } catch (e) {

      console.error(
        "Project Route Error:",
        name,
        e
      );

    }

  }


  function newDoc(doctype) {

    try {

      frappe.new_doc(
        doctype
      );

    } catch (e) {

      console.error(
        "Project New Doc Error:",
        doctype,
        e
      );

    }

  }


  /* =========================================================
     3. PROJECT CYCLE
  ========================================================= */

  const projectCycleCards = [

    {
      step: 1,

      action: "new",

      doctype: "Project",

      labelAr:
        "إنشاء المشروع",

      labelEn:
        "Create Project",

      descriptionAr:
        "إنشاء المشروع وتحديد العميل والمدة والتكلفة التقديرية.",

      descriptionEn:
        "Create the project and define customer, dates and estimated cost."
    },


    {
      step: 2,

      action: "route",

      doctype: "Task",

      labelAr:
        "إنشاء المهام",

      labelEn:
        "Create Tasks",

      descriptionAr:
        "تقسيم المشروع إلى مهام رئيسية وفرعية.",

      descriptionEn:
        "Break the project into parent and child tasks."
    },


    {
      step: 3,

      action: "team",

      labelAr:
        "تحديد الفريق",

      labelEn:
        "Assign Team",

      descriptionAr:
        "تحديد الموظفين والمسؤولين عن تنفيذ المشروع.",

      descriptionEn:
        "Assign employees and responsible users to the project."
    },


    {
      step: 4,

      action: "route",

      doctype: "Timesheet",

      labelAr:
        "تسجيل الوقت",

      labelEn:
        "Timesheet",

      descriptionAr:
        "تسجيل ساعات العمل الفعلية على المشروع والمهام.",

      descriptionEn:
        "Record actual working hours against projects and tasks."
    },


    {
      step: 5,

      action: "costs",

      labelAr:
        "تسجيل التكاليف",

      labelEn:
        "Project Costs",

      descriptionAr:
        "تسجيل المصروفات والسلف والتكاليف المرتبطة بالمشروع.",

      descriptionEn:
        "Record project-related expenses, advances and costs."
    },


    {
      step: 6,

      action: "route",

      doctype: "Project",

      labelAr:
        "متابعة التقدم",

      labelEn:
        "Project Progress",

      descriptionAr:
        "متابعة نسبة الإنجاز والمهام والحالة الحالية للمشروع.",

      descriptionEn:
        "Monitor progress, tasks and current project status."
    },


    {
      step: 7,

      action: "route",

      doctype: "Project",

      labelAr:
        "إغلاق المشروع",

      labelEn:
        "Close Project",

      descriptionAr:
        "مراجعة الأعمال المكتملة ثم إغلاق المشروع.",

      descriptionEn:
        "Review completed work and close the project."
    }

  ];


  /* =========================================================
     4. OVERVIEW
  ========================================================= */

  const statsCards = [

    {
      id:
        "open-projects",

      short:
        "PRJ",

      labelAr:
        "المشاريع المفتوحة",

      labelEn:
        "Open Projects",

      fetch: () =>
        safeCount(
          "Project",
          {
            status: "Open"
          }
        )
    },


    {
      id:
        "overdue-projects",

      short:
        "LATE",

      labelAr:
        "المشاريع المتأخرة",

      labelEn:
        "Overdue Projects",

      fetch: () =>
        safeCount(
          "Project",
          {
            status: [
              "!=",
              "Completed"
            ],

            expected_end_date: [
              "<",
              getToday()
            ]
          }
        )
    },


    {
      id:
        "open-tasks",

      short:
        "TSK",

      labelAr:
        "المهام المفتوحة",

      labelEn:
        "Open Tasks",

      fetch: () =>
        safeCount(
          "Task",
          {
            status: [
              "in",
              [
                "Open",
                "Working",
                "Pending Review"
              ]
            ]
          }
        )
    },


    {
      id:
        "overdue-tasks",

      short:
        "DUE",

      labelAr:
        "المهام المتأخرة",

      labelEn:
        "Overdue Tasks",

      fetch: () =>
        safeCount(
          "Task",
          {
            status: [
              "!=",
              "Completed"
            ],

            exp_end_date: [
              "<",
              getToday()
            ]
          }
        )
    }

  ];


  /* =========================================================
     5. QUICK ACTIONS
  ========================================================= */

  const quickActionButtons = [

    {
      doctype:
        "Project",

      labelAr:
        "مشروع جديد",

      labelEn:
        "New Project"
    },


    {
      doctype:
        "Task",

      labelAr:
        "مهمة جديدة",

      labelEn:
        "New Task"
    },


    {
      doctype:
        "Timesheet",

      labelAr:
        "سجل زمني جديد",

      labelEn:
        "New Timesheet"
    },


    {
      doctype:
        "Expense Claim",

      labelAr:
        "مصروف جديد",

      labelEn:
        "New Expense"
    }

  ];


  /* =========================================================
     6. DASHBOARD SECTIONS
  ========================================================= */

  const sections = [

    [
      "Reports & Masters",

      [

        [
          "Projects",
          "🏗️",
          [
            "Project",
            "Project Template",
            "Project Type"
          ]
        ],


        [
          "Tasks",
          "✅",
          [
            "Task"
          ]
        ],


        [
          "Team & Resources",
          "👥",
          [
            "Employee",
            "Activity Type",
            "Activity Cost"
          ]
        ],


        [
          "Timesheets",
          "⏱️",
          [
            "Timesheet"
          ]
        ],


        [
          "Costs & Expenses",
          "💰",
          [
            "Expense Claim",
            "Employee Advance",
            "Journal Entry"
          ]
        ],


        [
          "Project Purchasing",
          "📦",
          [
            "Material Request",
            "Purchase Order",
            "Purchase Invoice"
          ]
        ],


        [
          "Billing",
          "🧾",
          [
            "Sales Invoice"
          ]
        ],


        [
          "Settings",
          "⚙️",
          [
            "Project Template",
            "Project Type"
          ]
        ],


        [
          "Reports",
          "📊",
          [
            "Daily Timesheet Summary",
            "Timesheet Billing Summary"
          ]
        ]

      ]

    ]

  ];


  /* =========================================================
     7. TRANSLATIONS
  ========================================================= */

  const arabicFallback = {

    "Reports & Masters":
      "البيانات الرئيسية والتقارير",

    "Projects":
      "المشاريع",

    "Tasks":
      "المهام",

    "Team & Resources":
      "الفريق والموارد",

    "Timesheets":
      "السجلات الزمنية",

    "Costs & Expenses":
      "التكاليف والمصروفات",

    "Project Purchasing":
      "مشتريات المشروع",

    "Billing":
      "الفوترة",

    "Settings":
      "الإعدادات",

    "Reports":
      "التقارير",


    "Project":
      "المشروع",

    "Project Template":
      "قالب المشروع",

    "Project Type":
      "نوع المشروع",

    "Task":
      "المهمة",

    "Employee":
      "الموظف",

    "Activity Type":
      "نوع النشاط",

    "Activity Cost":
      "تكلفة النشاط",

    "Timesheet":
      "سجل الوقت",

    "Expense Claim":
      "مطالبة مصروفات",

    "Employee Advance":
      "سلفة موظف",

    "Journal Entry":
      "قيد يومية",

    "Material Request":
      "طلب مواد",

    "Purchase Order":
      "أمر شراء",

    "Purchase Invoice":
      "فاتورة مشتريات",

    "Sales Invoice":
      "فاتورة مبيعات",

    "Daily Timesheet Summary":
      "ملخص سجلات الوقت اليومية",

    "Timesheet Billing Summary":
      "ملخص فوترة سجلات الوقت"

  };


  const reportNames =
    new Set([
      "Daily Timesheet Summary",
      "Timesheet Billing Summary"
    ]);


  function translate(name) {

    if (!isArabic)
      return name;

    return (
      arabicFallback[name] ||
      name
    );

  }


  /* =========================================================
     8. SELECTOR MODAL
  ========================================================= */

  function showSelector(
    titleAr,
    titleEn,
    items
  ) {

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
          data-project-modal-close
        >
          ✕
        </button>


        <div class="erp-modal-header">

          <span class="erp-modal-icon">
            🏗️
          </span>

          <h3 class="erp-modal-title">

            ${
              isArabic
                ? titleAr
                : titleEn
            }

          </h3>

        </div>


        <div
          class="erp-quick-grid"
          style="
            margin-top:18px;
            grid-template-columns:
            repeat(
              ${items.length},
              minmax(0,1fr)
            ) !important;
          "
        >

          ${items
            .map(
              (item, index) => `

                <button
                  type="button"
                  class="erp-quick-btn"
                  data-project-selector="${index}"
                >

                  ${escapeHtml(
                    isArabic
                      ? item.labelAr
                      : item.labelEn
                  )}

                </button>

              `
            )
            .join("")}

        </div>

      </div>

    `;


    root.appendChild(
      overlay
    );


    requestAnimationFrame(
      () => {

        overlay.classList.add(
          "is-visible"
        );

      }
    );


    overlay
      .querySelector(
        "[data-project-modal-close]"
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
        "[data-project-selector]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const item =
              items[
                Number(
                  button.dataset.projectSelector
                )
              ];


            overlay.remove();


            if (!item)
              return;


            if (
              item.action === "new"
            ) {

              newDoc(
                item.doctype
              );

              return;

            }


            openRoute(
              item.doctype
            );

          }
        );

      });

  }


  /* =========================================================
     9. RENDER PROJECT CYCLE
  ========================================================= */

  function renderProjectCycle() {

    if (!projectCycle)
      return;


    projectCycle.innerHTML = `

      <section class="erp-cycle-container">

        <h2
          class="
            erp-section-title
            erp-cycle-title
          "
        >

          ${
            isArabic
              ? "دورة المشاريع"
              : "Project Lifecycle"
          }

        </h2>


        <div
          class="erp-cycle-grid"
          style="
            grid-template-columns:
            repeat(
              ${projectCycleCards.length},
              minmax(0,1fr)
            );
          "
        >

          ${projectCycleCards
            .map(
              (card, index) => `

                <div class="erp-cycle-item">

                  <button
                    type="button"
                    class="
                      erp-cycle-card
                      cycle-tone-${(index % 4) + 1}
                    "
                    data-project-cycle="${index}"
                  >

                    <span
                      class="erp-cycle-number"
                    >
                      ${card.step}
                    </span>


                    <span
                      class="erp-cycle-card-title"
                    >

                      ${escapeHtml(
                        isArabic
                          ? card.labelAr
                          : card.labelEn
                      )}

                    </span>


                    <span
                      class="erp-cycle-description"
                    >

                      ${escapeHtml(
                        isArabic
                          ? card.descriptionAr
                          : card.descriptionEn
                      )}

                    </span>

                  </button>


                  ${
                    index <
                    projectCycleCards.length - 1

                      ? `
                        <span
                          class="erp-cycle-arrow"
                        >
                          ${
                            isArabic
                              ? "←"
                              : "→"
                          }
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


    projectCycle.addEventListener(
      "click",
      event => {

        const element =
          event.target.closest(
            "[data-project-cycle]"
          );


        if (!element)
          return;


        const card =
          projectCycleCards[
            Number(
              element.dataset.projectCycle
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
          card.action === "team"
        ) {

          showSelector(

            "الفريق والموارد",
            "Team & Resources",

            [
              {
                doctype:
                  "Employee",

                labelAr:
                  "الموظفون",

                labelEn:
                  "Employees"
              },

              {
                doctype:
                  "Activity Type",

                labelAr:
                  "أنواع الأنشطة",

                labelEn:
                  "Activity Types"
              },

              {
                doctype:
                  "Activity Cost",

                labelAr:
                  "تكلفة الأنشطة",

                labelEn:
                  "Activity Costs"
              }
            ]

          );

          return;

        }


        if (
          card.action === "costs"
        ) {

          showSelector(

            "تكاليف المشروع",
            "Project Costs",

            [
              {
                doctype:
                  "Expense Claim",

                labelAr:
                  "المصروفات",

                labelEn:
                  "Expenses"
              },

              {
                doctype:
                  "Employee Advance",

                labelAr:
                  "سلف الموظفين",

                labelEn:
                  "Employee Advances"
              },

              {
                doctype:
                  "Journal Entry",

                labelAr:
                  "قيود اليومية",

                labelEn:
                  "Journal Entries"
              }
            ]

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
     10. RENDER STATS
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
                      data-project-stat="${card.id}"
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
                  `[data-project-stat="${card.id}"]`
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
                "Project Stat Error:",
                card.id,
                error
              );

            }
          );

      }
    );

  }


  /* =========================================================
     11. QUICK ACTIONS
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
                data-project-quick="${index}"
              >

                <span
                  class="erp-quick-label"
                >

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
            "[data-project-quick]"
          );


        if (!element)
          return;


        const button =
          quickActionButtons[
            Number(
              element.dataset.projectQuick
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
     12. RENDER LOWER SECTIONS
  ========================================================= */

  function renderSections() {

    if (!content)
      return;


    
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
                          item => `

                            <div
                              class="erp-link-row"
                            >

                              <button
                                type="button"
                                class="erp-link"
                                data-project-route="${escapeHtml(item)}"
                              >

                                <span
                                  class="erp-link-text"
                                >
                                  ${escapeHtml(translate(item))}
                                </span>


                                <span
                                  class="erp-link-arrow"
                                >
                                  ${
                                    isArabic
                                      ? "←"
                                      : "→"
                                  }
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
                          tone-${(sectionIndex + cardIndex) % 5}
                        "
                        data-project-card
                      >

                        <button
                          type="button"
                          class="erp-card-heading"
                          data-project-toggle
                          aria-expanded="false"
                        >

                          <span class="erp-icon">
                            ${card[1]}
                          </span>


                          <span
                            class="erp-card-title"
                          >
                            ${escapeHtml(translate(card[0]))}
                          </span>


                          <span
                            class="erp-card-chevron"
                          >
                            ⌄
                          </span>

                        </button>


                        <div
                          class="erp-card-links"
                        >
                          ${links}
                        </div>

                      </article>

                    `;

                  }
                )
                .join("");


            return `

              <section
                class="erp-module-section"
              >

                <h2
                  class="erp-section-title"
                >
                  ${escapeHtml(translate(section[0]))}
                </h2>


                <div
                  class="erp-dashboard-grid"
                >
                  ${cards}
                </div>

              </section>

            `;

          }
        )
        .join("");


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
            "[data-project-route]"
          );


        if (routeButton) {

          event.preventDefault();

          openRoute(
            routeButton.dataset.projectRoute
          );

          return;

        }


        const toggleButton =
          event.target.closest(
            "[data-project-toggle]"
          );


        if (!toggleButton)
          return;


        const selectedCard =
          toggleButton.closest(
            "[data-project-card]"
          );


        if (!selectedCard)
          return;


        const shouldOpen =
          !selectedCard.classList.contains(
            "is-open"
          );


        content
          .querySelectorAll(
            "[data-project-card]"
          )
          .forEach(
            card => {

              if (
                card !== selectedCard
              ) {

                card.classList.remove(
                  "is-open"
                );

              }

            }
          );


        selectedCard
          .classList
          .toggle(
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

    renderProjectCycle();

  } catch (e) {

    console.error(
      "Project Cycle Error:",
      e
    );

  }


  try {

    renderStats();

  } catch (e) {

    console.error(
      "Project Stats Error:",
      e
    );

  }


  try {

    renderQuickActions();

  } catch (e) {

    console.error(
      "Project Quick Actions Error:",
      e
    );

  }


  try {

    renderSections();

  } catch (e) {

    console.error(
      "Project Sections Error:",
      e
    );

  }


  try {

    renderFooter();

  } catch (e) {

    console.error(
      "Project Footer Error:",
      e
    );

  }

})();