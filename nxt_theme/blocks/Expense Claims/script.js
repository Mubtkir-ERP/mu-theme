(() => {

  /* =========================================================
     MUBTKIR ERP — EXPENSE CLAIMS WORKSPACE
     لوحة تحكم مطالبات المصروفات
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
          "Expense Claim Count Error:",
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
        "Expense Claim New Doc Error:",
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
      "Unpaid Expense Claim",
      "Employee Advance Summary"
    ]);


  const treeDocs =
    new Set([
      "Cost Center"
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
        "Expense Claim Route Error:",
        name,
        e
      );

    }

  }


  /* =========================================================
     4. EXPENSE CLAIM CYCLE
  ========================================================= */

  const cycleCards = [

    {
      step: 1,

      action: "new",
      doctype: "Expense Claim",

      labelAr:
        "إنشاء المطالبة",

      labelEn:
        "Create Expense Claim",

      descriptionAr:
        "إنشاء مطالبة مصروف جديدة للموظف.",

      descriptionEn:
        "Create a new employee expense claim."
    },


    {
      step: 2,

      action: "route",
      doctype: "Expense Claim",

      labelAr:
        "إضافة المصروفات",

      labelEn:
        "Add Expenses",

      descriptionAr:
        "إضافة أنواع المصروفات والمبالغ والتواريخ.",

      descriptionEn:
        "Add expense types, amounts and dates."
    },


    {
      step: 3,

      action: "route",
      doctype: "Expense Claim",

      labelAr:
        "إرفاق المستندات",

      labelEn:
        "Attach Documents",

      descriptionAr:
        "إرفاق الفواتير والإيصالات والمستندات المؤيدة.",

      descriptionEn:
        "Attach invoices, receipts and supporting documents."
    },


    {
      step: 4,

      action: "route",
      doctype: "Expense Claim",

      labelAr:
        "المراجعة والاعتماد",

      labelEn:
        "Review & Approve",

      descriptionAr:
        "مراجعة المطالبة واعتمادها من المسؤول.",

      descriptionEn:
        "Review and approve the employee expense claim."
    },


    {
      step: 5,

      action: "payment-selector",

      labelAr:
        "الدفع والتسوية",

      labelEn:
        "Payment & Settlement",

      descriptionAr:
        "تسجيل دفع المطالبة أو تسويتها محاسبياً.",

      descriptionEn:
        "Pay or financially settle the approved claim."
    },


    {
      step: 6,

      action: "route",
      doctype: "Expense Claim",

      labelAr:
        "إغلاق المطالبة",

      labelEn:
        "Close Claim",

      descriptionAr:
        "متابعة المطالبة حتى اكتمال السداد والتسوية.",

      descriptionEn:
        "Track the claim until reimbursement is completed."
    }

  ];


  /* =========================================================
     5. OVERVIEW
  ========================================================= */

  const statsCards = [

    {
      id:
        "open-claims",

      short:
        "OPEN",

      labelAr:
        "المطالبات المفتوحة",

      labelEn:
        "Open Claims",

      fetch: () =>
        safeCount(
          "Expense Claim",
          {
            docstatus: 0
          }
        )
    },


    {
      id:
        "approved-claims",

      short:
        "APP",

      labelAr:
        "المطالبات المعتمدة",

      labelEn:
        "Approved Claims",

      fetch: () =>
        safeCount(
          "Expense Claim",
          {
            docstatus: 1
          }
        )
    },


    {
      id:
        "unpaid-claims",

      short:
        "DUE",

      labelAr:
        "المطالبات غير المدفوعة",

      labelEn:
        "Unpaid Claims",

      fetch: () =>
        safeCount(
          "Expense Claim",
          {
            docstatus: 1,

            status: [
              "!=",
              "Paid"
            ]
          }
        )
    },


    {
      id:
        "month-claims",

      short:
        "MTH",

      labelAr:
        "مطالبات هذا الشهر",

      labelEn:
        "Claims This Month",

      fetch: () =>
        safeCount(
          "Expense Claim",
          {
            creation: [
              ">=",
              getMonthStart()
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
        "Expense Claim",

      labelAr:
        "مطالبة مصروف جديدة",

      labelEn:
        "New Expense Claim"
    },


    {
      doctype:
        "Expense Claim Type",

      labelAr:
        "نوع مصروف جديد",

      labelEn:
        "New Expense Type"
    },


    {
      doctype:
        "Employee Advance",

      labelAr:
        "سلفة موظف جديدة",

      labelEn:
        "New Employee Advance"
    },


    {
      doctype:
        "Payment Entry",

      labelAr:
        "دفعة جديدة",

      labelEn:
        "New Payment Entry"
    }

  ];


  /* =========================================================
     7. LOWER CARDS
  ========================================================= */

  const cards = [

    {
      titleAr:
        "مطالبات المصروفات",

      titleEn:
        "Expense Claims",

      icon:
        "🧾",

      links: [
        "Expense Claim"
      ]
    },


    {
      titleAr:
        "أنواع المصروفات",

      titleEn:
        "Expense Types",

      icon:
        "🏷️",

      links: [
        "Expense Claim Type"
      ]
    },


    {
      titleAr:
        "سلف الموظفين",

      titleEn:
        "Employee Advances",

      icon:
        "💰",

      links: [
        "Employee Advance"
      ]
    },


    {
      titleAr:
        "القيود والمدفوعات",

      titleEn:
        "Payments & Accounting",

      icon:
        "💳",

      links: [
        "Payment Entry",
        "Journal Entry"
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
        "مراكز التكلفة",

      titleEn:
        "Cost Centers",

      icon:
        "🎯",

      links: [
        "Cost Center"
      ]
    },


    {
      titleAr:
        "المشاريع",

      titleEn:
        "Projects",

      icon:
        "🏗️",

      links: [
        "Project"
      ]
    },


    {
      titleAr:
        "السفر والمصروفات",

      titleEn:
        "Travel & Expenses",

      icon:
        "✈️",

      links: [
        "Travel Request"
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
        "Unpaid Expense Claim",
        "Employee Advance Summary"
      ]
    }

  ];


  /* =========================================================
     8. TRANSLATIONS
  ========================================================= */

  const translations = {

    "Expense Claim":
      "مطالبة المصروف",

    "Expense Claim Type":
      "نوع المصروف",

    "Employee Advance":
      "سلفة الموظف",

    "Payment Entry":
      "سند الدفع",

    "Journal Entry":
      "قيد اليومية",

    "Employee":
      "الموظف",

    "Cost Center":
      "مركز التكلفة",

    "Project":
      "المشروع",

    "Travel Request":
      "طلب سفر",

    "Unpaid Expense Claim":
      "مطالبات المصروفات غير المدفوعة",

    "Employee Advance Summary":
      "ملخص سلف الموظفين"

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
     9. PAYMENT SELECTOR
  ========================================================= */

  function showPaymentSelector() {

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
          data-expense-close
        >
          ✕
        </button>


        <div class="erp-modal-header">

          <span class="erp-modal-icon">
            💳
          </span>

          <h3 class="erp-modal-title">

            ${
              isArabic
                ? "الدفع والتسوية"
                : "Payment & Settlement"
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
            data-expense-payment="Payment Entry"
          >
            ${
              isArabic
                ? "سند دفع"
                : "Payment Entry"
            }
          </button>


          <button
            type="button"
            class="erp-quick-btn"
            data-expense-payment="Journal Entry"
          >
            ${
              isArabic
                ? "قيد يومية"
                : "Journal Entry"
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
        "[data-expense-close]"
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
        "[data-expense-payment]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const doctype =
              button.dataset.expensePayment;

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
              ? "دورة مطالبات المصروفات"
              : "Expense Claim Cycle"
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
                    data-expense-cycle="${index}"
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
            "[data-expense-cycle]"
          );


        if (!element)
          return;


        const card =
          cycleCards[
            Number(
              element.dataset.expenseCycle
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
          "payment-selector"
        ) {

          showPaymentSelector();

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
                      data-expense-stat="${card.id}"
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
                  `[data-expense-stat="${card.id}"]`
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
                "Expense Claim Stat Error:",
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
                data-expense-quick="${index}"
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
            "[data-expense-quick]"
          );


        if (!element)
          return;


        const button =
          quickButtons[
            Number(
              element.dataset.expenseQuick
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
                        data-expense-route="${escapeHtml(item)}"
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
                data-expense-card
              >

                <button
                  type="button"
                  class="erp-card-heading"
                  data-expense-toggle
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
            "[data-expense-route]"
          );


        if (routeButton) {

          event.preventDefault();

          openRoute(
            routeButton.dataset.expenseRoute
          );

          return;
        }


        const toggle =
          event.target.closest(
            "[data-expense-toggle]"
          );


        if (!toggle)
          return;


        const selectedCard =
          toggle.closest(
            "[data-expense-card]"
          );


        if (!selectedCard)
          return;


        const shouldOpen =
          !selectedCard.classList.contains(
            "is-open"
          );


        content
          .querySelectorAll(
            "[data-expense-card]"
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
      "Expense Claim Cycle Error:",
      e
    );
  }


  try {
    renderStats();
  } catch (e) {
    console.error(
      "Expense Claim Stats Error:",
      e
    );
  }


  try {
    renderQuickActions();
  } catch (e) {
    console.error(
      "Expense Claim Quick Actions Error:",
      e
    );
  }


  try {
    renderCards();
  } catch (e) {
    console.error(
      "Expense Claim Cards Error:",
      e
    );
  }


  try {
    renderFooter();
  } catch (e) {
    console.error(
      "Expense Claim Footer Error:",
      e
    );
  }

})();