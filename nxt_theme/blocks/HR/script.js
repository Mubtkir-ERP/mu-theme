(() => {

  /* =========================================================
     MUBTKIR ERP — HR WORKSPACE
     لوحة تحكم الموارد البشرية
  ========================================================= */

  const root =
    root_element.querySelector("[data-erp-dashboard]");

  const hrCycle =
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
    (
      window.frappe &&
      frappe.boot &&
      frappe.boot.lang
    )
      ? frappe.boot.lang
      : (
          document.documentElement.lang ||
          "en"
        );


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

          error: () =>
            resolve(0)

        });

      } catch (e) {

        console.error(
          "HR Count Error:",
          doctype,
          e
        );

        resolve(0);
      }

    });
  }


  /* =========================================================
     3. HR CYCLE
  ========================================================= */

  const hrCycleCards = [

    {
      step: 1,
      action: "new",
      doctype: "Employee",

      labelAr: "إنشاء موظف",
      labelEn: "Create Employee",

      descriptionAr:
        "إنشاء ملف الموظف وتسجيل بياناته الوظيفية.",

      descriptionEn:
        "Create the employee record and employment details."
    },

    {
      step: 2,
      action: "organization-selector",

      labelAr: "الهيكل الوظيفي",
      labelEn: "Organization Structure",

      descriptionAr:
        "تحديد القسم والمسمى الوظيفي والفرع.",

      descriptionEn:
        "Assign department, designation and branch."
    },

    {
      step: 3,
      action: "attendance-selector",

      labelAr: "الحضور والانصراف",
      labelEn: "Attendance",

      descriptionAr:
        "تسجيل ومتابعة حضور وانصراف الموظفين.",

      descriptionEn:
        "Record and monitor employee attendance and check-ins."
    },

    {
      step: 4,
      action: "route",
      doctype: "Leave Application",

      labelAr: "الإجازات",
      labelEn: "Leave",

      descriptionAr:
        "تسجيل واعتماد طلبات إجازات الموظفين.",

      descriptionEn:
        "Create and approve employee leave applications."
    },

    {
      step: 5,
      action: "payroll-selector",

      labelAr: "الرواتب",
      labelEn: "Payroll",

      descriptionAr:
        "إعداد الرواتب وإنشاء مسيرات ورواتب الموظفين.",

      descriptionEn:
        "Process payroll and employee salary slips."
    },

    {
      step: 6,
      action: "finance-selector",

      labelAr: "السلف والمصروفات",
      labelEn: "Advances & Expenses",

      descriptionAr:
        "إدارة سلف الموظفين ومطالبات المصروفات.",

      descriptionEn:
        "Manage employee advances and expense claims."
    },

    {
      step: 7,
      action: "route",
      doctype: "Employee Separation",

      labelAr: "إنهاء الخدمة",
      labelEn: "Employee Separation",

      descriptionAr:
        "تنفيذ إجراءات إنهاء خدمة الموظف.",

      descriptionEn:
        "Manage employee separation and exit process."
    }

  ];


  /* =========================================================
     4. OVERVIEW
  ========================================================= */

  const statsCards = [

    {
      id: "total-employees",

      short: "EMP",

      labelAr: "إجمالي الموظفين",
      labelEn: "Total Employees",

      fetch: () =>
        safeCount(
          "Employee",
          {
            status: "Active"
          }
        )
    },


    {
      id: "present-today",

      short: "IN",

      labelAr: "الحاضرون اليوم",
      labelEn: "Present Today",

      fetch: () =>
        safeCount(
          "Attendance",
          {
            attendance_date: getToday(),
            status: "Present",
            docstatus: 1
          }
        )
    },


    {
      id: "on-leave",

      short: "LV",

      labelAr: "الموظفون في إجازة",
      labelEn: "Employees on Leave",

      fetch: () =>
        safeCount(
          "Attendance",
          {
            attendance_date: getToday(),
            status: "On Leave",
            docstatus: 1
          }
        )
    },


    {
      id: "pending-leaves",

      short: "REQ",

      labelAr: "طلبات الإجازة المعلقة",
      labelEn: "Pending Leave Requests",

      fetch: () =>
        safeCount(
          "Leave Application",
          {
            status: "Open",
            docstatus: 0
          }
        )
    }

  ];


  /* =========================================================
     5. QUICK ACTIONS
  ========================================================= */

  const quickActionButtons = [

    {
      action: "new",
      doctype: "Employee",

      labelAr: "موظف جديد",
      labelEn: "New Employee"
    },

    {
      action: "new",
      doctype: "Attendance",

      labelAr: "حضور جديد",
      labelEn: "New Attendance"
    },

    {
      action: "new",
      doctype: "Leave Application",

      labelAr: "طلب إجازة جديد",
      labelEn: "New Leave Application"
    },

    {
      action: "new",
      doctype: "Employee Advance",

      labelAr: "سلفة موظف جديدة",
      labelEn: "New Employee Advance"
    }

  ];


  /* =========================================================
     6. DASHBOARD SECTIONS
  ========================================================= */

  const sections = [

    [
      "HR Masters",

      [

        [
          "Employees",
          "👤",
          [
            "Employee",
            "Employee Group"
          ]
        ],

        [
          "Organization",
          "🏢",
          [
            "Department",
            "Designation",
            "Branch",
            "Employment Type"
          ]
        ],

        [
          "Attendance",
          "🕒",
          [
            "Attendance",
            "Employee Checkin",
            "Shift Type",
            "Shift Assignment"
          ]
        ],

        [
          "Leave",
          "🌴",
          [
            "Leave Application",
            "Leave Type",
            "Leave Allocation",
            "Holiday List"
          ]
        ],

        [
          "Payroll",
          "💰",
          [
            "Payroll Entry",
            "Salary Slip",
            "Salary Structure",
            "Salary Component"
          ]
        ],

        [
          "Expenses & Advances",
          "💳",
          [
            "Employee Advance",
            "Expense Claim"
          ]
        ],

        [
          "Recruitment",
          "📋",
          [
            "Job Opening",
            "Job Applicant",
            "Job Offer"
          ]
        ],

        [
          "Performance",
          "📈",
          [
            "Appraisal",
            "Appraisal Cycle",
            "Employee Performance Feedback"
          ]
        ],

        [
          "Employee Lifecycle",
          "🔄",
          [
            "Employee Onboarding",
            "Employee Separation"
          ]
        ],

        [
          "Reports",
          "📊",
          [
            "Employee Leave Balance",
            "Monthly Attendance Sheet",
            "Salary Register"
          ]
        ]

      ]

    ]

  ];


  /* =========================================================
     7. ARABIC TRANSLATIONS
  ========================================================= */

  const arabicFallback = {

    "HR Masters":
      "البيانات الرئيسية والتقارير",

    "Employees":
      "الموظفون",

    "Organization":
      "الهيكل التنظيمي",

    "Attendance":
      "الحضور والانصراف",

    "Leave":
      "الإجازات",

    "Payroll":
      "الرواتب",

    "Expenses & Advances":
      "المصروفات والسلف",

    "Recruitment":
      "التوظيف",

    "Performance":
      "التقييم والأداء",

    "Employee Lifecycle":
      "دورة حياة الموظف",

    "Reports":
      "التقارير",


    "Employee":
      "الموظف",

    "Employee Group":
      "مجموعة الموظفين",

    "Department":
      "القسم",

    "Designation":
      "المسمى الوظيفي",

    "Branch":
      "الفرع",

    "Employment Type":
      "نوع التوظيف",

    "Attendance":
      "الحضور",

    "Employee Checkin":
      "تسجيل دخول الموظف",

    "Shift Type":
      "نوع الوردية",

    "Shift Assignment":
      "تعيين الوردية",

    "Leave Application":
      "طلب إجازة",

    "Leave Type":
      "نوع الإجازة",

    "Leave Allocation":
      "تخصيص الإجازة",

    "Holiday List":
      "قائمة العطل",

    "Payroll Entry":
      "مسير الرواتب",

    "Salary Slip":
      "قسيمة الراتب",

    "Salary Structure":
      "هيكل الراتب",

    "Salary Component":
      "مكون الراتب",

    "Employee Advance":
      "سلفة موظف",

    "Expense Claim":
      "مطالبة مصروفات",

    "Job Opening":
      "شاغر وظيفي",

    "Job Applicant":
      "متقدم للوظيفة",

    "Job Offer":
      "عرض وظيفي",

    "Appraisal":
      "تقييم الموظف",

    "Appraisal Cycle":
      "دورة التقييم",

    "Employee Performance Feedback":
      "ملاحظات أداء الموظف",

    "Employee Onboarding":
      "تهيئة الموظف",

    "Employee Separation":
      "إنهاء خدمة الموظف",

    "Employee Leave Balance":
      "رصيد إجازات الموظفين",

    "Monthly Attendance Sheet":
      "كشف الحضور الشهري",

    "Salary Register":
      "سجل الرواتب"

  };


  /* =========================================================
     8. ROUTE TYPES
  ========================================================= */

  const treeDocs =
    new Set([
      "Department"
    ]);


  const reportNames =
    new Set([
      "Employee Leave Balance",
      "Monthly Attendance Sheet",
      "Salary Register"
    ]);


  /* =========================================================
     9. TRANSLATE
  ========================================================= */

  function translate(name) {

    if (!isArabic)
      return name;

    return (
      arabicFallback[name] ||
      name
    );
  }


  /* =========================================================
     10. ROUTING
  ========================================================= */

  function openRoute(name) {

    try {

      if (reportNames.has(name)) {

        frappe.set_route(
          "query-report",
          name
        );

        return;
      }


      if (treeDocs.has(name)) {

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
        "HR Route Error:",
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
        "HR New Doc Error:",
        doctype,
        e
      );

    }
  }


  /* =========================================================
     11. GENERIC SELECTOR
  ========================================================= */

  function showSelector(titleAr, titleEn, items) {

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
          data-selector-close
        >
          ✕
        </button>

        <div class="erp-modal-header">

          <span class="erp-modal-icon">
            👤
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
            repeat(${items.length}, minmax(0,1fr)) !important;
          "
        >

          ${items
            .map(
              (item, index) => `

                <button
                  type="button"
                  class="erp-quick-btn"
                  data-selector-index="${index}"
                >

                  ${
                    escapeHtml(
                      isArabic
                        ? item.labelAr
                        : item.labelEn
                    )
                  }

                </button>

              `
            )
            .join("")}

        </div>

      </div>

    `;


    root.appendChild(overlay);


    requestAnimationFrame(() => {

      overlay.classList.add(
        "is-visible"
      );

    });


    overlay
      .querySelector("[data-selector-close]")
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


    overlay
      .querySelectorAll(
        "[data-selector-index]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const item =
              items[
                Number(
                  button.dataset.selectorIndex
                )
              ];


            overlay.remove();


            if (!item)
              return;


            if (item.action === "new") {

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
     12. RENDER HR CYCLE
  ========================================================= */

  function renderHRCycle() {

    if (!hrCycle)
      return;


    hrCycle.innerHTML = `

      <section class="erp-cycle-container">

        <h2
          class="
            erp-section-title
            erp-cycle-title
          "
        >
          ${
            isArabic
              ? "دورة الموارد البشرية"
              : "HR Management Flow"
          }
        </h2>


        <div
          class="erp-cycle-grid"
          style="
            grid-template-columns:
            repeat(
              ${hrCycleCards.length},
              minmax(0,1fr)
            );
          "
        >

          ${hrCycleCards
            .map(
              (card, index) => `

                <div class="erp-cycle-item">

                  <button
                    type="button"
                    class="
                      erp-cycle-card
                      cycle-tone-${(index % 4) + 1}
                    "
                    data-hr-cycle="${index}"
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
                    hrCycleCards.length - 1

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


    hrCycle.addEventListener(
      "click",
      event => {

        const element =
          event.target.closest(
            "[data-hr-cycle]"
          );


        if (!element)
          return;


        const card =
          hrCycleCards[
            Number(
              element.dataset.hrCycle
            )
          ];


        if (!card)
          return;


        if (card.action === "new") {

          newDoc(card.doctype);
          return;
        }


        if (
          card.action ===
          "organization-selector"
        ) {

          showSelector(

            "الهيكل الوظيفي",
            "Organization Structure",

            [
              {
                action: "route",
                doctype: "Department",
                labelAr: "الأقسام",
                labelEn: "Departments"
              },

              {
                action: "route",
                doctype: "Designation",
                labelAr: "المسميات الوظيفية",
                labelEn: "Designations"
              },

              {
                action: "route",
                doctype: "Branch",
                labelAr: "الفروع",
                labelEn: "Branches"
              }
            ]

          );

          return;
        }


        if (
          card.action ===
          "attendance-selector"
        ) {

          showSelector(

            "الحضور والانصراف",
            "Attendance",

            [
              {
                action: "route",
                doctype: "Attendance",
                labelAr: "الحضور",
                labelEn: "Attendance"
              },

              {
                action: "route",
                doctype: "Employee Checkin",
                labelAr: "دخول وانصراف الموظف",
                labelEn: "Employee Checkin"
              },

              {
                action: "route",
                doctype: "Shift Assignment",
                labelAr: "تعيين الورديات",
                labelEn: "Shift Assignment"
              }
            ]

          );

          return;
        }


        if (
          card.action ===
          "payroll-selector"
        ) {

          showSelector(

            "الرواتب",
            "Payroll",

            [
              {
                action: "route",
                doctype: "Payroll Entry",
                labelAr: "مسير الرواتب",
                labelEn: "Payroll Entry"
              },

              {
                action: "route",
                doctype: "Salary Slip",
                labelAr: "قسائم الرواتب",
                labelEn: "Salary Slips"
              },

              {
                action: "route",
                doctype: "Salary Structure",
                labelAr: "هياكل الرواتب",
                labelEn: "Salary Structures"
              }
            ]

          );

          return;
        }


        if (
          card.action ===
          "finance-selector"
        ) {

          showSelector(

            "السلف والمصروفات",
            "Advances & Expenses",

            [
              {
                action: "route",
                doctype: "Employee Advance",
                labelAr: "سلف الموظفين",
                labelEn: "Employee Advances"
              },

              {
                action: "route",
                doctype: "Expense Claim",
                labelAr: "مطالبات المصروفات",
                labelEn: "Expense Claims"
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
                      data-hr-stat="${card.id}"
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
              `[data-hr-stat="${card.id}"]`
            );


          if (element) {

            element.textContent =
              formatNumber(value);

          }

        })
        .catch(error => {

          console.error(
            "HR Stat Error:",
            card.id,
            error
          );

        });

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
                data-hr-quick="${index}"
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
            "[data-hr-quick]"
          );


        if (!element)
          return;


        const button =
          quickActionButtons[
            Number(
              element.dataset.hrQuick
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
     15. RENDER SECTIONS
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

                            <div class="erp-link-row">

                              <button
                                type="button"
                                class="erp-link"
                                data-hr-route="${escapeHtml(item)}"
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
                          tone-${(sectionIndex + cardIndex) % 5}
                        "
                        data-hr-card
                      >

                        <button
                          type="button"
                          class="erp-card-heading"
                          data-hr-toggle
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
            "[data-hr-route]"
          );


        if (routeButton) {

          event.preventDefault();

          openRoute(
            routeButton.dataset.hrRoute
          );

          return;
        }


        const toggle =
          event.target.closest(
            "[data-hr-toggle]"
          );


        if (!toggle)
          return;


        const selectedCard =
          toggle.closest(
            "[data-hr-card]"
          );


        if (!selectedCard)
          return;


        const shouldOpen =
          !selectedCard
            .classList
            .contains(
              "is-open"
            );


        content
          .querySelectorAll(
            "[data-hr-card]"
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
     16. FOOTER
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
     17. INIT
  ========================================================= */

  try {

    renderHRCycle();

  } catch (e) {

    console.error(
      "HR Cycle Error:",
      e
    );

  }


  try {

    renderStats();

  } catch (e) {

    console.error(
      "HR Stats Error:",
      e
    );

  }


  try {

    renderQuickActions();

  } catch (e) {

    console.error(
      "HR Quick Actions Error:",
      e
    );

  }


  try {

    renderSections();

  } catch (e) {

    console.error(
      "HR Sections Error:",
      e
    );

  }


  try {

    renderFooter();

  } catch (e) {

    console.error(
      "HR Footer Error:",
      e
    );

  }

})();