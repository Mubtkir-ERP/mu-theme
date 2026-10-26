(() => {

  /* =========================================================
     MUBTKIR ERP — SHIFT & ATTENDANCE WORKSPACE
     لوحة تحكم الورديات والحضور
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
          "Attendance Count Error:",
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
        "Attendance New Doc Error:",
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
      "Monthly Attendance Sheet",
      "Employee Hours Utilization Based On Timesheet"
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


      frappe.set_route(
        "List",
        name
      );

    } catch (e) {

      console.error(
        "Attendance Route Error:",
        name,
        e
      );

    }

  }


  /* =========================================================
     4. SHIFT & ATTENDANCE CYCLE
  ========================================================= */

  const cycleCards = [

    {
      step: 1,

      action: "route",
      doctype: "Shift Type",

      labelAr:
        "تعريف الوردية",

      labelEn:
        "Shift Type",

      descriptionAr:
        "تعريف أوقات بداية ونهاية الوردية وإعدادات الحضور.",

      descriptionEn:
        "Define shift start, end time and attendance rules."
    },


    {
      step: 2,

      action: "new",
      doctype: "Shift Assignment",

      labelAr:
        "تعيين الوردية",

      labelEn:
        "Shift Assignment",

      descriptionAr:
        "تعيين الوردية للموظف خلال فترة محددة.",

      descriptionEn:
        "Assign a shift to an employee for a defined period."
    },


    {
      step: 3,

      action: "route",
      doctype: "Employee Checkin",

      labelAr:
        "تسجيل الدخول والخروج",

      labelEn:
        "Employee Checkin",

      descriptionAr:
        "استقبال وتسجيل حركات دخول وخروج الموظفين.",

      descriptionEn:
        "Record employee check-in and check-out logs."
    },


    {
      step: 4,

      action: "route",
      doctype: "Attendance",

      labelAr:
        "احتساب الحضور",

      labelEn:
        "Attendance",

      descriptionAr:
        "تسجيل حالة الحضور أو الغياب أو الإجازة.",

      descriptionEn:
        "Record Present, Absent, On Leave or Half Day."
    },


    {
      step: 5,

      action: "route",
      doctype: "Attendance Request",

      labelAr:
        "تصحيح الحضور",

      labelEn:
        "Attendance Request",

      descriptionAr:
        "طلب تعديل أو تصحيح أيام الحضور غير المسجلة.",

      descriptionEn:
        "Request attendance regularization or correction."
    },


    {
      step: 6,

      action: "report",
      report: "Monthly Attendance Sheet",

      labelAr:
        "مراجعة الحضور",

      labelEn:
        "Attendance Review",

      descriptionAr:
        "مراجعة الحضور والغياب والتأخير خلال الشهر.",

      descriptionEn:
        "Review monthly attendance and absence records."
    }

  ];


  /* =========================================================
     5. OVERVIEW
  ========================================================= */

  const statsCards = [

    {
      id:
        "present-today",

      short:
        "IN",

      labelAr:
        "الحاضرون اليوم",

      labelEn:
        "Present Today",

      fetch: () =>
        safeCount(
          "Attendance",
          {
            attendance_date:
              getToday(),

            status:
              "Present",

            docstatus:
              1
          }
        )
    },


    {
      id:
        "absent-today",

      short:
        "ABS",

      labelAr:
        "الغائبون اليوم",

      labelEn:
        "Absent Today",

      fetch: () =>
        safeCount(
          "Attendance",
          {
            attendance_date:
              getToday(),

            status:
              "Absent",

            docstatus:
              1
          }
        )
    },


    {
      id:
        "leave-today",

      short:
        "LV",

      labelAr:
        "في إجازة اليوم",

      labelEn:
        "On Leave Today",

      fetch: () =>
        safeCount(
          "Attendance",
          {
            attendance_date:
              getToday(),

            status:
              "On Leave",

            docstatus:
              1
          }
        )
    },


    {
      id:
        "checkins-today",

      short:
        "LOG",

      labelAr:
        "حركات الدخول والخروج",

      labelEn:
        "Today's Checkins",

      fetch: () =>
        safeCount(
          "Employee Checkin",
          {
            creation: [
              ">=",
              getToday()
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
      doctype:
        "Shift Type",

      labelAr:
        "وردية جديدة",

      labelEn:
        "New Shift Type"
    },


    {
      doctype:
        "Shift Assignment",

      labelAr:
        "تعيين وردية جديد",

      labelEn:
        "New Shift Assignment"
    },


    {
      doctype:
        "Employee Checkin",

      labelAr:
        "تسجيل دخول جديد",

      labelEn:
        "New Employee Checkin"
    },


    {
      doctype:
        "Attendance Request",

      labelAr:
        "طلب تصحيح حضور",

      labelEn:
        "New Attendance Request"
    }

  ];


  /* =========================================================
     7. LOWER CARDS
  ========================================================= */

  const cards = [

    {
      titleAr:
        "الورديات",

      titleEn:
        "Shifts",

      icon:
        "🕒",

      links: [
        "Shift Type",
        "Shift Assignment",
        "Shift Request"
      ]
    },


    {
      titleAr:
        "جداول الورديات",

      titleEn:
        "Shift Schedules",

      icon:
        "📅",

      links: [
        "Shift Schedule",
        "Shift Schedule Assignment"
      ]
    },


    {
      titleAr:
        "الدخول والخروج",

      titleEn:
        "Employee Checkins",

      icon:
        "🚪",

      links: [
        "Employee Checkin"
      ]
    },


    {
      titleAr:
        "الحضور",

      titleEn:
        "Attendance",

      icon:
        "✅",

      links: [
        "Attendance",
        "Attendance Request"
      ]
    },


    {
      titleAr:
        "أدوات الحضور",

      titleEn:
        "Attendance Tools",

      icon:
        "🛠️",

      links: [
        "Employee Attendance Tool",
        "Shift Assignment Tool"
      ]
    },


    {
      titleAr:
        "الموظفون",

      titleEn:
        "Employees",

      icon:
        "👥",

      links: [
        "Employee",
        "Department"
      ]
    },


    {
      titleAr:
        "العطل والإجازات",

      titleEn:
        "Holidays & Leave",

      icon:
        "🌴",

      links: [
        "Holiday List",
        "Leave Application"
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
        "Monthly Attendance Sheet"
      ]
    }

  ];


  /* =========================================================
     8. TRANSLATIONS
  ========================================================= */

  const translations = {

    "Shift Type":
      "نوع الوردية",

    "Shift Assignment":
      "تعيين الوردية",

    "Shift Request":
      "طلب وردية",

    "Shift Schedule":
      "جدول الورديات",

    "Shift Schedule Assignment":
      "تعيين جدول الورديات",

    "Employee Checkin":
      "تسجيل دخول الموظف",

    "Attendance":
      "الحضور",

    "Attendance Request":
      "طلب تصحيح الحضور",

    "Employee Attendance Tool":
      "أداة حضور الموظفين",

    "Shift Assignment Tool":
      "أداة تعيين الورديات",

    "Employee":
      "الموظف",

    "Department":
      "القسم",

    "Holiday List":
      "قائمة العطل",

    "Leave Application":
      "طلب الإجازة",

    "Monthly Attendance Sheet":
      "كشف الحضور الشهري"

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
              ? "دورة الورديات والحضور"
              : "Shift & Attendance Cycle"
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
                    data-attendance-cycle="${index}"
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
            "[data-attendance-cycle]"
          );


        if (!element)
          return;


        const card =
          cycleCards[
            Number(
              element.dataset.attendanceCycle
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
          card.action === "report"
        ) {

          frappe.set_route(
            "query-report",
            card.report
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
                      data-attendance-stat="${card.id}"
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
                  `[data-attendance-stat="${card.id}"]`
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
                "Attendance Stat Error:",
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

        ${quickButtons
          .map(
            (button, index) => `

              <button
                type="button"
                class="erp-quick-btn"
                data-attendance-quick="${index}"
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
            "[data-attendance-quick]"
          );


        if (!element)
          return;


        const button =
          quickButtons[
            Number(
              element.dataset.attendanceQuick
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
     12. RENDER CARDS
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
                        data-attendance-route="${escapeHtml(item)}"
                      >

                        <span class="erp-link-text">
                          ${escapeHtml(translate(item))}
                        </span>


                        <span class="erp-link-arrow">
                          ${isArabic ? "←" : "→"}
                        </span>

                      </button>

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
                data-attendance-card
              >

                <button
                  type="button"
                  class="erp-card-heading"
                  data-attendance-toggle
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

        const routeButton =
          event.target.closest(
            "[data-attendance-route]"
          );


        if (routeButton) {

          event.preventDefault();

          openRoute(
            routeButton.dataset.attendanceRoute
          );

          return;
        }


        const toggle =
          event.target.closest(
            "[data-attendance-toggle]"
          );


        if (!toggle)
          return;


        const selectedCard =
          toggle.closest(
            "[data-attendance-card]"
          );


        if (!selectedCard)
          return;


        const shouldOpen =
          !selectedCard.classList.contains(
            "is-open"
          );


        content
          .querySelectorAll(
            "[data-attendance-card]"
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
     13. FOOTER
  ========================================================= */

  function renderFooter() {

    if (!footerEl)
      return;


    footerEl.innerHTML = `

      <div class="erp-footer-inner">

        <div class="erp-footer-item">

          <span class="erp-footer-icon">☎</span>

          <span class="erp-footer-label">
            ${
              isArabic
                ? "الهاتف الموحد:"
                : "Phone:"
            }
          </span>

          <a
            href="tel:0115110455"
            class="erp-footer-link"
            dir="ltr"
          >
            0115110455
          </a>

        </div>


        <span class="erp-footer-sep">|</span>


        <div class="erp-footer-item">

          <span class="erp-footer-icon">✉</span>

          <span class="erp-footer-label">
            ${
              isArabic
                ? "البريد الإلكتروني:"
                : "Email:"
            }
          </span>

          <a
            href="mailto:sales@mubtkir.com"
            class="erp-footer-link"
          >
            sales@mubtkir.com
          </a>

        </div>


        <span class="erp-footer-sep">|</span>


        <div class="erp-footer-item">

          <span class="erp-footer-icon">◎</span>

          <span class="erp-footer-label">
            ${
              isArabic
                ? "الموقع:"
                : "Website:"
            }
          </span>

          <a
            href="https://www.mubtkir.com"
            class="erp-footer-link"
            target="_blank"
            rel="noopener"
          >
            www.mubtkir.com
          </a>

        </div>

      </div>

    `;

  }


  /* =========================================================
     14. INIT
  ========================================================= */

  try {
    renderCycle();
  } catch (e) {
    console.error(
      "Attendance Cycle Error:",
      e
    );
  }


  try {
    renderStats();
  } catch (e) {
    console.error(
      "Attendance Stats Error:",
      e
    );
  }


  try {
    renderQuickActions();
  } catch (e) {
    console.error(
      "Attendance Quick Actions Error:",
      e
    );
  }


  try {
    renderCards();
  } catch (e) {
    console.error(
      "Attendance Cards Error:",
      e
    );
  }


  try {
    renderFooter();
  } catch (e) {
    console.error(
      "Attendance Footer Error:",
      e
    );
  }

})();