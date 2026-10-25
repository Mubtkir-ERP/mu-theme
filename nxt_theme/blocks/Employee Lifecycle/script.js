(() => {

  /* =========================================================
     MUBTKIR ERP — EMPLOYEE LIFECYCLE WORKSPACE
     لوحة تحكم دورة حياة الموظف
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
          "Employee Lifecycle Count Error:",
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
        "Employee Lifecycle New Doc Error:",
        doctype,
        e
      );

    }

  }


  /* =========================================================
     3. ROUTING
  ========================================================= */

  const treeDocs =
    new Set([
      "Department"
    ]);


  function openRoute(name) {

    try {

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
        "Employee Lifecycle Route Error:",
        name,
        e
      );

    }

  }


  /* =========================================================
     4. EMPLOYEE LIFECYCLE CYCLE
  ========================================================= */

  const cycleCards = [

    {
      step: 1,

      action: "new",
      doctype: "Employee",

      labelAr:
        "إنشاء الموظف",

      labelEn:
        "Create Employee",

      descriptionAr:
        "إنشاء ملف الموظف وتسجيل بياناته الأساسية والوظيفية.",

      descriptionEn:
        "Create the employee record and employment information."
    },


    {
      step: 2,

      action: "new",
      doctype: "Employee Onboarding",

      labelAr:
        "التهيئة والتجهيز",

      labelEn:
        "Employee Onboarding",

      descriptionAr:
        "تنفيذ مهام تهيئة الموظف وتجهيزه للبدء في العمل.",

      descriptionEn:
        "Manage onboarding activities before the employee starts work."
    },


    {
      step: 3,

      action: "movement-selector",

      labelAr:
        "النقل والترقية",

      labelEn:
        "Transfer & Promotion",

      descriptionAr:
        "تنفيذ نقل الموظف أو ترقيته وتحديث بياناته الوظيفية.",

      descriptionEn:
        "Manage employee transfers and promotions."
    },


    {
      step: 4,

      action: "route",
      doctype: "Employee",

      labelAr:
        "تحديث البيانات",

      labelEn:
        "Update Employment",

      descriptionAr:
        "متابعة وتحديث بيانات الموظف أثناء فترة عمله.",

      descriptionEn:
        "Maintain and update the employee employment record."
    },


    {
      step: 5,

      action: "new",
      doctype: "Employee Separation",

      labelAr:
        "إجراءات المغادرة",

      labelEn:
        "Employee Separation",

      descriptionAr:
        "بدء إجراءات مغادرة الموظف وتحديد مهام إنهاء الخدمة.",

      descriptionEn:
        "Start employee separation and exit activities."
    },


    {
      step: 6,

      action: "route",
      doctype: "Employee Separation",

      labelAr:
        "متابعة إنهاء الخدمة",

      labelEn:
        "Separation Follow-up",

      descriptionAr:
        "متابعة تنفيذ جميع مهام ومتطلبات إنهاء الخدمة.",

      descriptionEn:
        "Track completion of separation activities."
    },


    {
      step: 7,

      action: "route",
      doctype: "Employee",

      labelAr:
        "إغلاق ملف الموظف",

      labelEn:
        "Close Employee Record",

      descriptionAr:
        "تحديث حالة الموظف بعد اكتمال إجراءات المغادرة.",

      descriptionEn:
        "Update employee status after completing the exit process."
    }

  ];


  /* =========================================================
     5. OVERVIEW
  ========================================================= */

  const statsCards = [

    {
      id:
        "active-employees",

      short:
        "EMP",

      labelAr:
        "الموظفون النشطون",

      labelEn:
        "Active Employees",

      fetch: () =>
        safeCount(
          "Employee",
          {
            status: "Active"
          }
        )
    },


    {
      id:
        "onboarding",

      short:
        "ONB",

      labelAr:
        "قيد التهيئة",

      labelEn:
        "Employee Onboarding",

      fetch: () =>
        safeCount(
          "Employee Onboarding",
          {
            docstatus: [
              "<",
              2
            ]
          }
        )
    },


    {
      id:
        "transfers",

      short:
        "TRF",

      labelAr:
        "عمليات النقل",

      labelEn:
        "Employee Transfers",

      fetch: () =>
        safeCount(
          "Employee Transfer",
          {
            docstatus: [
              "<",
              2
            ]
          }
        )
    },


    {
      id:
        "separations",

      short:
        "SEP",

      labelAr:
        "إجراءات إنهاء الخدمة",

      labelEn:
        "Employee Separations",

      fetch: () =>
        safeCount(
          "Employee Separation",
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
      doctype:
        "Employee",

      labelAr:
        "موظف جديد",

      labelEn:
        "New Employee"
    },


    {
      doctype:
        "Employee Onboarding",

      labelAr:
        "تهيئة موظف جديدة",

      labelEn:
        "New Employee Onboarding"
    },


    {
      doctype:
        "Employee Transfer",

      labelAr:
        "نقل موظف جديد",

      labelEn:
        "New Employee Transfer"
    },


    {
      doctype:
        "Employee Separation",

      labelAr:
        "إنهاء خدمة جديد",

      labelEn:
        "New Employee Separation"
    }

  ];


  /* =========================================================
     7. LOWER CARDS
  ========================================================= */

  const cards = [

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
        "تهيئة الموظفين",

      titleEn:
        "Employee Onboarding",

      icon:
        "🚀",

      links: [
        "Employee Onboarding",
        "Employee Onboarding Template"
      ]
    },


    {
      titleAr:
        "النقل",

      titleEn:
        "Employee Transfers",

      icon:
        "🔄",

      links: [
        "Employee Transfer"
      ]
    },


    {
      titleAr:
        "الترقيات",

      titleEn:
        "Promotions",

      icon:
        "📈",

      links: [
        "Employee Promotion"
      ]
    },


    {
      titleAr:
        "إنهاء الخدمة",

      titleEn:
        "Employee Separation",

      icon:
        "🚪",

      links: [
        "Employee Separation",
        "Employee Separation Template"
      ]
    },


    {
      titleAr:
        "الهيكل التنظيمي",

      titleEn:
        "Organization",

      icon:
        "🏢",

      links: [
        "Department",
        "Designation",
        "Branch",
        "Employment Type"
      ]
    },


    {
      titleAr:
        "المستندات الوظيفية",

      titleEn:
        "Employment Documents",

      icon:
        "📄",

      links: [
        "Appointment Letter",
        "Appointment Letter Template"
      ]
    },


    {
      titleAr:
        "الموظف والعقد",

      titleEn:
        "Employment",

      icon:
        "💼",

      links: [
        "Employee",
        "Employee Contract"
      ]
    }

  ];


  /* =========================================================
     8. TRANSLATIONS
  ========================================================= */

  const translations = {

    "Employee":
      "الموظف",

    "Employee Onboarding":
      "تهيئة الموظف",

    "Employee Onboarding Template":
      "قالب تهيئة الموظف",

    "Employee Transfer":
      "نقل الموظف",

    "Employee Promotion":
      "ترقية الموظف",

    "Employee Separation":
      "إنهاء خدمة الموظف",

    "Employee Separation Template":
      "قالب إنهاء الخدمة",

    "Department":
      "القسم",

    "Designation":
      "المسمى الوظيفي",

    "Branch":
      "الفرع",

    "Employment Type":
      "نوع التوظيف",

    "Appointment Letter":
      "خطاب التعيين",

    "Appointment Letter Template":
      "قالب خطاب التعيين",

    "Employee Contract":
      "عقد الموظف"

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
     9. MOVEMENT SELECTOR
  ========================================================= */

  function showMovementSelector() {

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
          data-lifecycle-close
        >
          ✕
        </button>


        <div class="erp-modal-header">

          <span class="erp-modal-icon">
            🔄
          </span>

          <h3 class="erp-modal-title">

            ${
              isArabic
                ? "النقل والترقية"
                : "Transfer & Promotion"
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
            data-lifecycle-action="Employee Transfer"
          >
            ${
              isArabic
                ? "نقل موظف"
                : "Employee Transfer"
            }
          </button>


          <button
            type="button"
            class="erp-quick-btn"
            data-lifecycle-action="Employee Promotion"
          >
            ${
              isArabic
                ? "ترقية موظف"
                : "Employee Promotion"
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
        "[data-lifecycle-close]"
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
        "[data-lifecycle-action]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const doctype =
              button.dataset.lifecycleAction;


            overlay.remove();


            newDoc(
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
              ? "دورة حياة الموظف"
              : "Employee Lifecycle"
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
                    data-lifecycle-cycle="${index}"
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
            "[data-lifecycle-cycle]"
          );


        if (!element)
          return;


        const card =
          cycleCards[
            Number(
              element.dataset.lifecycleCycle
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
          "movement-selector"
        ) {

          showMovementSelector();

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
                      data-lifecycle-stat="${card.id}"
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
                  `[data-lifecycle-stat="${card.id}"]`
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
                "Lifecycle Stat Error:",
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
                data-lifecycle-quick="${index}"
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
            "[data-lifecycle-quick]"
          );


        if (!element)
          return;


        const button =
          quickButtons[
            Number(
              element.dataset.lifecycleQuick
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
                        data-lifecycle-route="${escapeHtml(item)}"
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
                data-lifecycle-card
              >

                <button
                  type="button"
                  class="erp-card-heading"
                  data-lifecycle-toggle
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
        '<div class="erp-modal-steps is-shown" data-modal-steps>' +
          '<ol class="erp-modal-steps-list">' +
            steps.map(s => '<li>' + escapeHtml(s) + '</li>').join('') +
          '</ol>' +
        '</div>' +
        '<div style="margin-top: 18px;">' +
          '<button type="button" class="erp-quick-btn" data-modal-launch style="width: 100%; min-height: 42px;">' +
            '<span class="erp-quick-label">' + (isArabic ? 'فتح الشاشة' : 'Open Screen') + '</span>' +
          '</button>' +
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

    const launchBtn = overlay.querySelector('[data-modal-launch]');
    if (launchBtn) {
      launchBtn.addEventListener('click', () => {
        overlay.remove();
        openRoute(itemName);
      });
    }
  }


content.innerHTML = `

      <section class="erp-module-section">

        <h2 class="erp-section-title">

          ${
            isArabic
              ? "البيانات الرئيسية"
              : "Masters & Operations"
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
            "[data-lifecycle-route]"
          );


        if (routeButton) {

          event.preventDefault();

          openRoute(
            routeButton.dataset.lifecycleRoute
          );

          return;
        }


        const toggle =
          event.target.closest(
            "[data-lifecycle-toggle]"
          );


        if (!toggle)
          return;


        const selectedCard =
          toggle.closest(
            "[data-lifecycle-card]"
          );


        if (!selectedCard)
          return;


        const shouldOpen =
          !selectedCard.classList.contains(
            "is-open"
          );


        content
          .querySelectorAll(
            "[data-lifecycle-card]"
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
      "Lifecycle Cycle Error:",
      e
    );
  }


  try {
    renderStats();
  } catch (e) {
    console.error(
      "Lifecycle Stats Error:",
      e
    );
  }


  try {
    renderQuickActions();
  } catch (e) {
    console.error(
      "Lifecycle Quick Actions Error:",
      e
    );
  }


  try {
    renderCards();
  } catch (e) {
    console.error(
      "Lifecycle Cards Error:",
      e
    );
  }


  try {
    renderFooter();
  } catch (e) {
    console.error(
      "Lifecycle Footer Error:",
      e
    );
  }

})();