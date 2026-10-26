(() => {

  /* =========================================================
     MUBTKIR ERP — LEAVES WORKSPACE
     لوحة تحكم الإجازات
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


  function getMonthStart() {

    const d = new Date();

    const year =
      d.getFullYear();

    const month =
      String(
        d.getMonth() + 1
      ).padStart(2, "0");

    return `${year}-${month}-01`;
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
          "Leaves Count Error:",
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
        "Leaves New Doc Error:",
        doctype,
        e
      );

    }

  }


  /* =========================================================
     3. REPORTS
  ========================================================= */

  const reportNames =
    new Set([
      "Employee Leave Balance",
      "Leave Ledger",
      "Leave Application"
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
        "Leaves Route Error:",
        name,
        e
      );

    }

  }


  /* =========================================================
     4. LEAVE CYCLE
  ========================================================= */

  const cycleCards = [

    {
      step: 1,

      action: "route",
      doctype: "Leave Type",

      labelAr:
        "تعريف أنواع الإجازات",

      labelEn:
        "Leave Types",

      descriptionAr:
        "تعريف أنواع الإجازات وقواعد كل نوع.",

      descriptionEn:
        "Define leave types and their rules."
    },


    {
      step: 2,

      action: "new",
      doctype: "Leave Allocation",

      labelAr:
        "تخصيص الرصيد",

      labelEn:
        "Leave Allocation",

      descriptionAr:
        "تخصيص رصيد الإجازة للموظف.",

      descriptionEn:
        "Allocate leave balance to employees."
    },


    {
      step: 3,

      action: "new",
      doctype: "Leave Application",

      labelAr:
        "طلب إجازة",

      labelEn:
        "Leave Application",

      descriptionAr:
        "إنشاء طلب إجازة وتحديد الفترة المطلوبة.",

      descriptionEn:
        "Create a leave request and define the leave period."
    },


    {
      step: 4,

      action: "route",
      doctype: "Leave Application",

      labelAr:
        "المراجعة والاعتماد",

      labelEn:
        "Approval",

      descriptionAr:
        "مراجعة واعتماد أو رفض طلبات الإجازة.",

      descriptionEn:
        "Review and approve or reject leave requests."
    },


    {
      step: 5,

      action: "route",
      doctype: "Attendance",

      labelAr:
        "تسجيل الإجازة",

      labelEn:
        "Attendance",

      descriptionAr:
        "متابعة ظهور الموظف بحالة إجازة في الحضور.",

      descriptionEn:
        "Track the employee as On Leave in attendance."
    },


    {
      step: 6,

      action: "report",
      report: "Employee Leave Balance",

      labelAr:
        "متابعة الرصيد",

      labelEn:
        "Leave Balance",

      descriptionAr:
        "متابعة الرصيد المتاح والمستخدم للموظفين.",

      descriptionEn:
        "Review available and consumed leave balances."
    }

  ];


  /* =========================================================
     5. OVERVIEW
  ========================================================= */

  const statsCards = [

    {
      id:
        "employees-on-leave",

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
        "open-leave-requests",

      short:
        "REQ",

      labelAr:
        "طلبات الإجازة المفتوحة",

      labelEn:
        "Open Leave Requests",

      fetch: () =>
        safeCount(
          "Leave Application",
          {
            docstatus: 0
          }
        )
    },


    {
      id:
        "approved-this-month",

      short:
        "OK",

      labelAr:
        "المعتمدة هذا الشهر",

      labelEn:
        "Approved This Month",

      fetch: () =>
        safeCount(
          "Leave Application",
          {
            docstatus: 1,

            posting_date: [
              ">=",
              getMonthStart()
            ]
          }
        )
    },


    {
      id:
        "leave-types",

      short:
        "TYPE",

      labelAr:
        "أنواع الإجازات",

      labelEn:
        "Leave Types",

      fetch: () =>
        safeCount(
          "Leave Type"
        )
    }

  ];


  /* =========================================================
     6. QUICK ACTIONS
  ========================================================= */

  const quickButtons = [

    {
      doctype:
        "Leave Application",

      labelAr:
        "طلب إجازة جديد",

      labelEn:
        "New Leave Application"
    },


    {
      doctype:
        "Leave Allocation",

      labelAr:
        "تخصيص إجازة جديد",

      labelEn:
        "New Leave Allocation"
    },


    {
      doctype:
        "Leave Type",

      labelAr:
        "نوع إجازة جديد",

      labelEn:
        "New Leave Type"
    },


    {
      doctype:
        "Holiday List",

      labelAr:
        "قائمة عطل جديدة",

      labelEn:
        "New Holiday List"
    }

  ];


  /* =========================================================
     7. LOWER CARDS
  ========================================================= */

  const cards = [

    {
      titleAr:
        "طلبات الإجازة",

      titleEn:
        "Leave Applications",

      icon:
        "🌴",

      links: [
        "Leave Application"
      ]
    },


    {
      titleAr:
        "أنواع الإجازات",

      titleEn:
        "Leave Types",

      icon:
        "🏷️",

      links: [
        "Leave Type"
      ]
    },


    {
      titleAr:
        "تخصيص الأرصدة",

      titleEn:
        "Leave Allocations",

      icon:
        "📊",

      links: [
        "Leave Allocation"
      ]
    },


    {
      titleAr:
        "العطل الرسمية",

      titleEn:
        "Holiday Lists",

      icon:
        "📅",

      links: [
        "Holiday List"
      ]
    },


    {
      titleAr:
        "الحضور والإجازات",

      titleEn:
        "Attendance & Leave",

      icon:
        "🕒",

      links: [
        "Attendance",
        "Employee"
      ]
    },


    {
      titleAr:
        "سياسة الإجازات",

      titleEn:
        "Leave Policy",

      icon:
        "📘",

      links: [
        "Leave Policy",
        "Leave Policy Assignment"
      ]
    },


    {
      titleAr:
        "فترة الإجازات",

      titleEn:
        "Leave Period",

      icon:
        "🗓️",

      links: [
        "Leave Period"
      ]
    },


    {
      titleAr:
        "التقارير",

      titleEn:
        "Reports",

      icon:
        "📈",

      links: [
        "Employee Leave Balance",
        "Leave Ledger"
      ]
    }

  ];


  /* =========================================================
     8. TRANSLATIONS
  ========================================================= */

  const translations = {

    "Leave Application":
      "طلب الإجازة",

    "Leave Type":
      "نوع الإجازة",

    "Leave Allocation":
      "تخصيص الإجازة",

    "Holiday List":
      "قائمة العطل",

    "Attendance":
      "الحضور",

    "Employee":
      "الموظف",

    "Leave Policy":
      "سياسة الإجازات",

    "Leave Policy Assignment":
      "تعيين سياسة الإجازات",

    "Leave Period":
      "فترة الإجازات",

    "Employee Leave Balance":
      "رصيد إجازات الموظفين",

    "Leave Ledger":
      "سجل الإجازات"

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
              ? "دورة الإجازات"
              : "Leave Management Cycle"
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
                    data-leave-cycle="${index}"
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
                    cycleCards.length - 1

                      ? `
                        <span
                          class="erp-cycle-arrow"
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


    cycleSection.addEventListener(
      "click",
      event => {

        const element =
          event.target.closest(
            "[data-leave-cycle]"
          );


        if (!element)
          return;


        const card =
          cycleCards[
            Number(
              element.dataset.leaveCycle
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
                      data-leave-stat="${card.id}"
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
                  `[data-leave-stat="${card.id}"]`
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
                "Leaves Stat Error:",
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
                data-leave-quick="${index}"
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
            "[data-leave-quick]"
          );


        if (!element)
          return;


        const button =
          quickButtons[
            Number(
              element.dataset.leaveQuick
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

                    <div
                      class="erp-link-row"
                    >

                      <button
                        type="button"
                        class="erp-link"
                        data-leave-route="${escapeHtml(item)}"
                      >

                        <span
                          class="erp-link-text"
                        >
                          ${escapeHtml(translate(item))}
                        </span>


                        <span
                          class="erp-link-arrow"
                        >
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
                data-leave-card
              >

                <button
                  type="button"
                  class="erp-card-heading"
                  data-leave-toggle
                  aria-expanded="false"
                >

                  <span class="erp-icon">
                    ${card.icon}
                  </span>


                  <span
                    class="erp-card-title"
                  >
                    ${escapeHtml(
                      isArabic
                        ? card.titleAr
                        : card.titleEn
                    )}
                  </span>


                  <span
                    class="erp-card-chevron"
                  >
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
            "[data-leave-route]"
          );


        if (routeButton) {

          event.preventDefault();

          openRoute(
            routeButton.dataset.leaveRoute
          );

          return;

        }


        const toggle =
          event.target.closest(
            "[data-leave-toggle]"
          );


        if (!toggle)
          return;


        const selectedCard =
          toggle.closest(
            "[data-leave-card]"
          );


        if (!selectedCard)
          return;


        const shouldOpen =
          !selectedCard.classList.contains(
            "is-open"
          );


        content
          .querySelectorAll(
            "[data-leave-card]"
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
      "Leaves Cycle Error:",
      e
    );

  }


  try {

    renderStats();

  } catch (e) {

    console.error(
      "Leaves Stats Error:",
      e
    );

  }


  try {

    renderQuickActions();

  } catch (e) {

    console.error(
      "Leaves Quick Actions Error:",
      e
    );

  }


  try {

    renderCards();

  } catch (e) {

    console.error(
      "Leaves Cards Error:",
      e
    );

  }


  try {

    renderFooter();

  } catch (e) {

    console.error(
      "Leaves Footer Error:",
      e
    );

  }

})();