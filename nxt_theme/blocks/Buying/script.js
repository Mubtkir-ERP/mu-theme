(function () {

    /* =====================================================
       MUBTKIR ERP — BUYING / PURCHASES
    ===================================================== */

    var attempts = 0;
    var maxAttempts = 20;


    function startDashboard() {

        attempts++;

        var scope;

        if (
            typeof root_element !== "undefined" &&
            root_element
        ) {
            scope = root_element;
        } else {
            scope = document;
        }


        var root =
            scope.querySelector("[data-erp-dashboard]");

        var cycleSection =
            scope.querySelector("[data-purchase-cycle]");

        var statsSection =
            scope.querySelector("[data-stats-section]");

        var quickActions =
            scope.querySelector("[data-quick-actions]");

        var content =
            scope.querySelector("[data-dashboard-content]");

        var footerEl =
            scope.querySelector("[data-dashboard-footer]");


        if (
            !root ||
            !cycleSection ||
            !statsSection ||
            !quickActions ||
            !content
        ) {

            if (attempts < maxAttempts) {

                setTimeout(
                    startDashboard,
                    250
                );

            } else {

                console.error(
                    "Buying Dashboard HTML not found"
                );

            }

            return;
        }


        if (
            root.getAttribute(
                "data-buying-loaded"
            ) === "1"
        ) {
            return;
        }


        root.setAttribute(
            "data-buying-loaded",
            "1"
        );


        /* =================================================
           LANGUAGE
        ================================================= */

        var lang = "en";

        try {

            if (
                window.frappe &&
                frappe.boot &&
                frappe.boot.lang
            ) {

                lang = frappe.boot.lang;

            }

        } catch (e) {}


        var isArabic =
            String(lang)
                .toLowerCase()
                .indexOf("ar") === 0;


        root.setAttribute(
            "dir",
            isArabic ? "rtl" : "ltr"
        );


        /* =================================================
           HELPERS
        ================================================= */

        function text(ar, en) {

            return isArabic
                ? ar
                : en;

        }


        function escapeHtml(value) {

            return String(value || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");

        }


        function formatNumber(value) {

            var number =
                parseFloat(value) || 0;

            return number.toLocaleString(
                "en-US"
            );

        }


        function openList(doctype) {

            try {

                frappe.set_route(
                    "List",
                    doctype
                );

            } catch (e) {

                console.error(
                    "Buying Route Error:",
                    doctype,
                    e
                );

            }

        }


        function openTree(doctype) {

            try {

                frappe.set_route(
                    "Tree",
                    doctype
                );

            } catch (e) {

                console.error(
                    "Buying Tree Error:",
                    doctype,
                    e
                );

            }

        }


        function openReport(report) {

            try {

                frappe.set_route(
                    "query-report",
                    report
                );

            } catch (e) {

                console.error(
                    "Buying Report Error:",
                    report,
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
                    "Buying New Doc Error:",
                    doctype,
                    e
                );

            }

        }


        function getCount(
            doctype,
            filters,
            callback
        ) {

            try {

                frappe.call({

                    method:
                        "frappe.client.get_count",

                    args: {

                        doctype:
                            doctype,

                        filters:
                            filters || {}

                    },

                    callback:
                        function (r) {

                            var value = 0;

                            if (
                                r &&
                                r.message !== undefined
                            ) {
                                value = r.message;
                            }

                            callback(value);

                        },

                    error:
                        function () {
                            callback(0);
                        }

                });

            } catch (e) {

                callback(0);

            }

        }


        /* =================================================
           1. PURCHASE CYCLE
        ================================================= */

        var cycle = [

            {
                ar:
                    "طلب مواد",

                en:
                    "Material Request",

                descAr:
                    "إنشاء طلب بالمواد أو المنتجات المطلوب شراؤها.",

                descEn:
                    "Create a request for materials or items to purchase.",

                action:
                    "new",

                target:
                    "Material Request"
            },


            {
                ar:
                    "طلب عرض سعر",

                en:
                    "Request for Quotation",

                descAr:
                    "إرسال طلب عرض سعر للموردين للحصول على أفضل عرض.",

                descEn:
                    "Request quotations from suppliers.",

                action:
                    "new",

                target:
                    "Request for Quotation"
            },


            {
                ar:
                    "عرض سعر المورد",

                en:
                    "Supplier Quotation",

                descAr:
                    "تسجيل ومقارنة عروض الأسعار المستلمة من الموردين.",

                descEn:
                    "Record and compare supplier quotations.",

                action:
                    "new",

                target:
                    "Supplier Quotation"
            },


            {
                ar:
                    "أمر الشراء",

                en:
                    "Purchase Order",

                descAr:
                    "اعتماد المورد وإصدار أمر الشراء.",

                descEn:
                    "Select supplier and issue the purchase order.",

                action:
                    "new",

                target:
                    "Purchase Order"
            },


            {
                ar:
                    "استلام المشتريات",

                en:
                    "Purchase Receipt",

                descAr:
                    "تسجيل استلام المنتجات من المورد وإدخالها للمخزون.",

                descEn:
                    "Receive purchased items into stock.",

                action:
                    "new",

                target:
                    "Purchase Receipt"
            },


            {
                ar:
                    "فاتورة المشتريات",

                en:
                    "Purchase Invoice",

                descAr:
                    "تسجيل فاتورة المورد وربطها بالمشتريات.",

                descEn:
                    "Record the supplier purchase invoice.",

                action:
                    "new",

                target:
                    "Purchase Invoice"
            },


            {
                ar:
                    "الدفع للمورد",

                en:
                    "Supplier Payment",

                descAr:
                    "تسجيل سداد المستحقات المالية للمورد.",

                descEn:
                    "Record payment of supplier outstanding amounts.",

                action:
                    "new",

                target:
                    "Payment Entry"
            }

        ];


        var cycleHtml = "";


        for (
            var i = 0;
            i < cycle.length;
            i++
        ) {

            cycleHtml +=

                '<div class="erp-cycle-item">' +

                    '<button ' +
                    'type="button" ' +
                    'class="erp-cycle-card cycle-tone-' +
                    ((i % 4) + 1) +
                    '" data-buy-cycle="' +
                    i +
                    '">' +

                        '<span class="erp-cycle-number">' +
                            (i + 1) +
                        '</span>' +

                        '<span class="erp-cycle-card-title">' +

                            escapeHtml(
                                text(
                                    cycle[i].ar,
                                    cycle[i].en
                                )
                            ) +

                        '</span>' +

                        '<span class="erp-cycle-description">' +

                            escapeHtml(
                                text(
                                    cycle[i].descAr,
                                    cycle[i].descEn
                                )
                            ) +

                        '</span>' +

                    '</button>' +

                    (
                        i < cycle.length - 1

                        ? '<span class="erp-cycle-arrow">' +
                            (
                                isArabic
                                    ? "←"
                                    : "→"
                            ) +
                          '</span>'

                        : ""
                    ) +

                '</div>';

        }


        cycleSection.innerHTML =

            '<section class="erp-cycle-container">' +

                '<h2 class="erp-section-title erp-cycle-title">' +

                    text(
                        "دورة المشتريات",
                        "Purchase Cycle"
                    ) +

                '</h2>' +

                '<div class="erp-cycle-grid" ' +
                'style="grid-template-columns:repeat(' +
                cycle.length +
                ',minmax(0,1fr));">' +

                    cycleHtml +

                '</div>' +

            '</section>';


        cycleSection.addEventListener(
            "click",
            function (event) {

                var button =
                    event.target.closest(
                        "[data-buy-cycle]"
                    );


                if (!button) {
                    return;
                }


                var index =
                    parseInt(
                        button.getAttribute(
                            "data-buy-cycle"
                        ),
                        10
                    );


                var item =
                    cycle[index];


                if (!item) {
                    return;
                }


                newDoc(
                    item.target
                );

            }
        );


        /* =================================================
           2. OVERVIEW
        ================================================= */

        statsSection.innerHTML =

            '<section class="erp-overview-container">' +

                '<h2 class="erp-section-title">' +

                    text(
                        "نظرة عامة",
                        "Overview"
                    ) +

                '</h2>' +


                '<div class="erp-stats-grid">' +


                    '<div class="erp-stat-card overview-tone-1">' +

                        '<div class="erp-stat-icon">PO</div>' +

                        '<div class="erp-stat-info">' +

                            '<span class="erp-stat-value" data-buy-po>0</span>' +

                            '<span class="erp-stat-label">' +

                                text(
                                    "أوامر الشراء المفتوحة",
                                    "Open Purchase Orders"
                                ) +

                            '</span>' +

                        '</div>' +

                    '</div>' +


                    '<div class="erp-stat-card overview-tone-2">' +

                        '<div class="erp-stat-icon">INV</div>' +

                        '<div class="erp-stat-info">' +

                            '<span class="erp-stat-value" data-buy-unpaid>0</span>' +

                            '<span class="erp-stat-label">' +

                                text(
                                    "فواتير المشتريات غير المدفوعة",
                                    "Unpaid Purchase Invoices"
                                ) +

                            '</span>' +

                        '</div>' +

                    '</div>' +


                    '<div class="erp-stat-card overview-tone-3">' +

                        '<div class="erp-stat-icon">MR</div>' +

                        '<div class="erp-stat-info">' +

                            '<span class="erp-stat-value" data-buy-mr>0</span>' +

                            '<span class="erp-stat-label">' +

                                text(
                                    "طلبات المواد المعلقة",
                                    "Pending Material Requests"
                                ) +

                            '</span>' +

                        '</div>' +

                    '</div>' +


                    '<div class="erp-stat-card overview-tone-4">' +

                        '<div class="erp-stat-icon">SUP</div>' +

                        '<div class="erp-stat-info">' +

                            '<span class="erp-stat-value" data-buy-suppliers>0</span>' +

                            '<span class="erp-stat-label">' +

                                text(
                                    "الموردون",
                                    "Suppliers"
                                ) +

                            '</span>' +

                        '</div>' +

                    '</div>' +


                '</div>' +

            '</section>';


        getCount(
            "Purchase Order",
            {
                docstatus: 1,
                status: [
                    "not in",
                    [
                        "Completed",
                        "Closed",
                        "Cancelled"
                    ]
                ]
            },
            function (value) {

                var el =
                    statsSection.querySelector(
                        "[data-buy-po]"
                    );

                if (el) {
                    el.textContent =
                        formatNumber(value);
                }

            }
        );


        getCount(
            "Purchase Invoice",
            {
                docstatus: 1,
                outstanding_amount: [
                    ">",
                    0
                ]
            },
            function (value) {

                var el =
                    statsSection.querySelector(
                        "[data-buy-unpaid]"
                    );

                if (el) {
                    el.textContent =
                        formatNumber(value);
                }

            }
        );


        getCount(
            "Material Request",
            {
                docstatus: 1,
                status: [
                    "not in",
                    [
                        "Stopped",
                        "Cancelled"
                    ]
                ],
                per_ordered: [
                    "<",
                    100
                ]
            },
            function (value) {

                var el =
                    statsSection.querySelector(
                        "[data-buy-mr]"
                    );

                if (el) {
                    el.textContent =
                        formatNumber(value);
                }

            }
        );


        getCount(
            "Supplier",
            {
                disabled: 0
            },
            function (value) {

                var el =
                    statsSection.querySelector(
                        "[data-buy-suppliers]"
                    );

                if (el) {
                    el.textContent =
                        formatNumber(value);
                }

            }
        );


        /* =================================================
           3. QUICK ACTIONS
        ================================================= */

        quickActions.innerHTML =

            '<h2 class="erp-section-title">' +

                text(
                    "اختصارات سريعة",
                    "Quick Actions"
                ) +

            '</h2>' +


            '<div class="erp-quick-grid">' +

                '<button class="erp-quick-btn" data-buy-new-po>' +
                    '<span class="erp-quick-label">' +
                        text(
                            "أمر شراء جديد",
                            "New Purchase Order"
                        ) +
                    '</span>' +
                '</button>' +


                '<button class="erp-quick-btn" data-buy-new-invoice>' +
                    '<span class="erp-quick-label">' +
                        text(
                            "فاتورة مشتريات جديدة",
                            "New Purchase Invoice"
                        ) +
                    '</span>' +
                '</button>' +


                '<button class="erp-quick-btn" data-buy-new-supplier>' +
                    '<span class="erp-quick-label">' +
                        text(
                            "مورد جديد",
                            "New Supplier"
                        ) +
                    '</span>' +
                '</button>' +


                '<button class="erp-quick-btn" data-buy-new-item>' +
                    '<span class="erp-quick-label">' +
                        text(
                            "صنف جديد",
                            "New Item"
                        ) +
                    '</span>' +
                '</button>' +

            '</div>';


        quickActions
            .querySelector(
                "[data-buy-new-po]"
            )
            .addEventListener(
                "click",
                function () {
                    newDoc(
                        "Purchase Order"
                    );
                }
            );


        quickActions
            .querySelector(
                "[data-buy-new-invoice]"
            )
            .addEventListener(
                "click",
                function () {
                    newDoc(
                        "Purchase Invoice"
                    );
                }
            );


        quickActions
            .querySelector(
                "[data-buy-new-supplier]"
            )
            .addEventListener(
                "click",
                function () {
                    newDoc(
                        "Supplier"
                    );
                }
            );


        quickActions
            .querySelector(
                "[data-buy-new-item]"
            )
            .addEventListener(
                "click",
                function () {
                    newDoc(
                        "Item"
                    );
                }
            );


        /* =================================================
           4. DESCRIPTIONS
        ================================================= */

        var descriptions = {

            "Supplier": {

                titleAr:
                    "المورد",

                titleEn:
                    "Supplier",

                summaryAr:
                    "تعريف الموردين وبيانات التواصل والحسابات المرتبطة بهم.",

                summaryEn:
                    "Manage suppliers, contact information and linked accounting details.",

                stepsAr: [
                    "إنشاء مورد جديد",
                    "إدخال اسم المورد",
                    "تحديد مجموعة المورد",
                    "إضافة بيانات التواصل",
                    "إضافة الرقم الضريبي عند الحاجة",
                    "مراجعة الحسابات الافتراضية",
                    "حفظ المورد"
                ],

                stepsEn: [
                    "Create supplier",
                    "Enter supplier name",
                    "Select supplier group",
                    "Add contact information",
                    "Add tax information",
                    "Review default accounts",
                    "Save"
                ]

            },


            "Material Request": {

                titleAr:
                    "طلب المواد",

                titleEn:
                    "Material Request",

                summaryAr:
                    "تسجيل الاحتياج للمنتجات قبل بدء عملية الشراء.",

                summaryEn:
                    "Record item requirements before starting the purchasing process.",

                stepsAr: [
                    "إنشاء طلب مواد",
                    "اختيار نوع الطلب شراء",
                    "إضافة المنتجات",
                    "تحديد الكميات",
                    "تحديد تاريخ الحاجة",
                    "مراجعة الطلب",
                    "حفظ واعتماد الطلب"
                ],

                stepsEn: [
                    "Create Material Request",
                    "Select Purchase purpose",
                    "Add items",
                    "Enter quantities",
                    "Set required date",
                    "Review request",
                    "Save and submit"
                ]

            },


            "Request for Quotation": {

                titleAr:
                    "طلب عرض سعر",

                titleEn:
                    "Request for Quotation",

                summaryAr:
                    "إرسال طلب أسعار للموردين للمنتجات المطلوب شراؤها.",

                summaryEn:
                    "Request pricing from suppliers for required items.",

                stepsAr: [
                    "إنشاء طلب عرض سعر",
                    "إضافة الموردين",
                    "إضافة المنتجات",
                    "تحديد الكميات",
                    "تحديد موعد استلام العرض",
                    "حفظ الطلب",
                    "إرساله للموردين"
                ],

                stepsEn: [
                    "Create RFQ",
                    "Add suppliers",
                    "Add items",
                    "Enter quantities",
                    "Set quotation deadline",
                    "Save",
                    "Send to suppliers"
                ]

            },


            "Supplier Quotation": {

                titleAr:
                    "عرض سعر المورد",

                titleEn:
                    "Supplier Quotation",

                summaryAr:
                    "تسجيل عرض السعر المستلم من المورد ومقارنته بالعروض الأخرى.",

                summaryEn:
                    "Record supplier pricing and compare competing quotations.",

                stepsAr: [
                    "إنشاء عرض سعر مورد",
                    "اختيار المورد",
                    "إضافة المنتجات",
                    "إدخال الأسعار",
                    "مراجعة الضرائب والخصومات",
                    "مراجعة شروط التوريد",
                    "حفظ واعتماد العرض"
                ],

                stepsEn: [
                    "Create Supplier Quotation",
                    "Select supplier",
                    "Add items",
                    "Enter rates",
                    "Review taxes and discounts",
                    "Review terms",
                    "Save and submit"
                ]

            },


            "Purchase Order": {

                titleAr:
                    "أمر الشراء",

                titleEn:
                    "Purchase Order",

                summaryAr:
                    "إصدار أمر شراء رسمي للمورد بعد اعتماد الأسعار والكميات.",

                summaryEn:
                    "Issue a formal purchase order after approving prices and quantities.",

                stepsAr: [
                    "إنشاء أمر شراء",
                    "اختيار المورد",
                    "إضافة المنتجات",
                    "تحديد الكميات والأسعار",
                    "تحديد موعد التسليم",
                    "مراجعة الضرائب",
                    "حفظ واعتماد الأمر"
                ],

                stepsEn: [
                    "Create Purchase Order",
                    "Select supplier",
                    "Add items",
                    "Enter quantities and rates",
                    "Set delivery date",
                    "Review taxes",
                    "Save and submit"
                ]

            },


            "Purchase Receipt": {

                titleAr:
                    "استلام المشتريات",

                titleEn:
                    "Purchase Receipt",

                summaryAr:
                    "تسجيل وصول المنتجات من المورد وإضافتها إلى المخزون.",

                summaryEn:
                    "Record receipt of purchased items into inventory.",

                stepsAr: [
                    "إنشاء استلام مشتريات",
                    "اختيار المورد",
                    "جلب أمر الشراء",
                    "مراجعة المنتجات",
                    "تسجيل الكميات المستلمة",
                    "تحديد المستودع",
                    "حفظ واعتماد الاستلام"
                ],

                stepsEn: [
                    "Create Purchase Receipt",
                    "Select supplier",
                    "Fetch Purchase Order",
                    "Review items",
                    "Enter received quantities",
                    "Select warehouse",
                    "Save and submit"
                ]

            },


            "Purchase Invoice": {

                titleAr:
                    "فاتورة المشتريات",

                titleEn:
                    "Purchase Invoice",

                summaryAr:
                    "تسجيل فاتورة المورد والمبالغ المستحقة والضرائب.",

                summaryEn:
                    "Record supplier invoice, outstanding amount and taxes.",

                stepsAr: [
                    "إنشاء فاتورة مشتريات",
                    "اختيار المورد",
                    "جلب أمر الشراء أو الاستلام",
                    "مراجعة المنتجات والأسعار",
                    "مراجعة الضرائب",
                    "تحديد تاريخ الاستحقاق",
                    "حفظ واعتماد الفاتورة"
                ],

                stepsEn: [
                    "Create Purchase Invoice",
                    "Select supplier",
                    "Fetch Purchase Order or Receipt",
                    "Review items and rates",
                    "Review taxes",
                    "Set due date",
                    "Save and submit"
                ]

            }

        };


        /* =================================================
           DETAILS MODAL
        ================================================= */

        function showDetails(name) {

            var data =
                descriptions[name];


            if (!data) {
                return;
            }


            var steps =
                isArabic
                    ? data.stepsAr
                    : data.stepsEn;


            var list = "";


            for (
                var i = 0;
                i < steps.length;
                i++
            ) {

                list +=

                    "<li>" +
                    escapeHtml(
                        steps[i]
                    ) +
                    "</li>";

            }


            var overlay =
                document.createElement(
                    "div"
                );


            overlay.className =
                "erp-modal-overlay";


            overlay.setAttribute(
                "dir",
                isArabic ? "rtl" : "ltr"
            );


            overlay.innerHTML =

                '<div class="erp-modal-box">' +

                    '<button class="erp-modal-close" data-buy-modal-close>✕</button>' +

                    '<div class="erp-modal-header">' +

                        '<span class="erp-modal-icon">📄</span>' +

                        '<h3 class="erp-modal-title">' +

                            escapeHtml(
                                text(
                                    data.titleAr,
                                    data.titleEn
                                )
                            ) +

                        '</h3>' +

                    '</div>' +

                    '<p class="erp-modal-summary">' +

                        escapeHtml(
                            text(
                                data.summaryAr,
                                data.summaryEn
                            )
                        ) +

                    '</p>' +

                    '<button class="erp-modal-toggle-steps" data-buy-show-steps>' +

                        text(
                            "📖 عرض الخطوات",
                            "📖 Show Steps"
                        ) +

                    '</button>' +

                    '<div class="erp-modal-steps" data-buy-steps>' +

                        '<ol class="erp-modal-steps-list">' +
                            list +
                        '</ol>' +

                    '</div>' +

                '</div>';


            root.appendChild(
                overlay
            );


            setTimeout(
                function () {
                    overlay.classList.add(
                        "is-visible"
                    );
                },
                10
            );


            var close =
                overlay.querySelector(
                    "[data-buy-modal-close]"
                );


            if (close) {

                close.addEventListener(
                    "click",
                    function () {
                        overlay.remove();
                    }
                );

            }


            var toggle =
                overlay.querySelector(
                    "[data-buy-show-steps]"
                );


            var box =
                overlay.querySelector(
                    "[data-buy-steps]"
                );


            if (
                toggle &&
                box
            ) {

                toggle.addEventListener(
                    "click",
                    function () {

                        box.classList.toggle(
                            "is-shown"
                        );

                    }
                );

            }

        }


        /* =================================================
           5. LOWER CARDS
        ================================================= */

        var cards = [

            {
                titleAr:
                    "الموردون",

                titleEn:
                    "Suppliers",

                icon:
                    "👥",

                links: [
                    "Supplier",
                    "Supplier Group"
                ]
            },


            {
                titleAr:
                    "طلبات الشراء",

                titleEn:
                    "Purchase Requests",

                icon:
                    "📋",

                links: [
                    "Material Request",
                    "Request for Quotation",
                    "Supplier Quotation"
                ]
            },


            {
                titleAr:
                    "أوامر الشراء",

                titleEn:
                    "Purchase Orders",

                icon:
                    "🛒",

                links: [
                    "Purchase Order"
                ]
            },


            {
                titleAr:
                    "الاستلام",

                titleEn:
                    "Receiving",

                icon:
                    "📦",

                links: [
                    "Purchase Receipt"
                ]
            },


            {
                titleAr:
                    "فواتير المشتريات",

                titleEn:
                    "Purchase Invoices",

                icon:
                    "🧾",

                links: [
                    "Purchase Invoice"
                ]
            },


            {
                titleAr:
                    "المنتجات والأسعار",

                titleEn:
                    "Items & Pricing",

                icon:
                    "🏷️",

                links: [
                    "Item",
                    "Item Price",
                    "Price List"
                ]
            },


            {
                titleAr:
                    "الإعدادات",

                titleEn:
                    "Settings",

                icon:
                    "⚙",

                links: [
                    "Buying Settings"
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
                    "Purchase Order Analysis",
                    "Purchase Analytics",
                    "Purchase Invoice Trends"
                ]
            }

        ];


        var translations = {

            "Supplier":
                "المورد",

            "Supplier Group":
                "مجموعة الموردين",

            "Material Request":
                "طلب المواد",

            "Request for Quotation":
                "طلب عرض سعر",

            "Supplier Quotation":
                "عرض سعر المورد",

            "Purchase Order":
                "أمر الشراء",

            "Purchase Receipt":
                "استلام المشتريات",

            "Purchase Invoice":
                "فاتورة المشتريات",

            "Item":
                "المنتج",

            "Item Price":
                "سعر المنتج",

            "Price List":
                "قائمة الأسعار",

            "Buying Settings":
                "إعدادات المشتريات",

            "Purchase Order Analysis":
                "تحليل أوامر الشراء",

            "Purchase Analytics":
                "تحليلات المشتريات",

            "Purchase Invoice Trends":
                "اتجاهات فواتير المشتريات"

        };


        var reports = {

            "Purchase Order Analysis":
                true,

            "Purchase Analytics":
                true,

            "Purchase Invoice Trends":
                true

        };


        var trees = {

            "Supplier Group":
                true

        };


        function translate(name) {

            if (!isArabic) {
                return name;
            }

            return (
                translations[name] ||
                name
            );

        }


        function navigate(name) {

            if (
                reports[name]
            ) {

                openReport(
                    name
                );

                return;

            }


            if (
                trees[name]
            ) {

                openTree(
                    name
                );

                return;

            }


            openList(
                name
            );

        }


        var cardsHtml = "";


        for (
            var c = 0;
            c < cards.length;
            c++
        ) {

            var card =
                cards[c];


            var linksHtml = "";


            for (
                var j = 0;
                j < card.links.length;
                j++
            ) {

                var name =
                    card.links[j];


                var details = "";


                /*
                 * بدون شرح للتقارير والإعدادات
                 */

                if (
                    !reports[name] &&
                    name !== "Buying Settings" &&
                    descriptions[name]
                ) {

                    details =

                        '<button ' +
                        'type="button" ' +
                        'class="erp-info-link" ' +
                        'data-buy-info="' +
                        escapeHtml(name) +
                        '">' +

                            text(
                                "تفاصيل",
                                "Details"
                            ) +

                        '</button>';

                }


                linksHtml +=

                    '<div class="erp-link-row">' +

                        '<button ' +
                        'type="button" ' +
                        'class="erp-link" ' +
                        'data-buy-card="' +
                        c +
                        '" ' +
                        'data-buy-link="' +
                        j +
                        '">' +

                            '<span class="erp-link-text">' +

                                escapeHtml(
                                    translate(name)
                                ) +

                            '</span>' +

                            '<span class="erp-link-arrow">' +

                                (
                                    isArabic
                                        ? "←"
                                        : "→"
                                ) +

                            '</span>' +

                        '</button>' +

                        details +

                    '</div>';

            }


            cardsHtml +=

                '<article class="erp-card is-open tone-' +
                (c % 5) +
                '" data-buy-card-container>' +

                    '<button class="erp-card-heading" data-buy-card-toggle>' +

                        '<span class="erp-icon">' +
                            card.icon +
                        '</span>' +

                        '<span class="erp-card-title">' +

                            escapeHtml(
                                text(
                                    card.titleAr,
                                    card.titleEn
                                )
                            ) +

                        '</span>' +

                        '<span class="erp-card-chevron">⌄</span>' +

                    '</button>' +

                    '<div class="erp-card-links">' +
                        linksHtml +
                    '</div>' +

                '</article>';

        }


        content.innerHTML =

            '<section class="erp-module-section">' +

                '<h2 class="erp-section-title">' +

                    text(
                        "البيانات الرئيسية والتقارير",
                        "Masters & Reports"
                    ) +

                '</h2>' +

                '<div class="erp-dashboard-grid">' +
                    cardsHtml +
                '</div>' +

            '</section>';


        content.addEventListener(
            "click",
            function (event) {


                var info =
                    event.target.closest(
                        "[data-buy-info]"
                    );


                if (info) {

                    event.preventDefault();
                    event.stopPropagation();


                    showDetails(
                        info.getAttribute(
                            "data-buy-info"
                        )
                    );

                    return;
                }


                var link =
                    event.target.closest(
                        "[data-buy-link]"
                    );


                if (link) {

                    var cardIndex =
                        parseInt(
                            link.getAttribute(
                                "data-buy-card"
                            ),
                            10
                        );


                    var linkIndex =
                        parseInt(
                            link.getAttribute(
                                "data-buy-link"
                            ),
                            10
                        );


                    var name =
                        cards[
                            cardIndex
                        ].links[
                            linkIndex
                        ];


                    navigate(
                        name
                    );

                    return;
                }


                var toggle =
                    event.target.closest(
                        "[data-buy-card-toggle]"
                    );


                if (!toggle) {
                    return;
                }


                var selected =
                    toggle.closest(
                        "[data-buy-card-container]"
                    );


                if (!selected) {
                    return;
                }


                var shouldOpen =
                    !selected.classList.contains(
                        "is-open"
                    );


                var all =
                    content.querySelectorAll(
                        "[data-buy-card-container]"
                    );


                for (
                    var x = 0;
                    x < all.length;
                    x++
                ) {

                    if (
                        all[x] !== selected
                    ) {

                        all[x]
                            .classList
                            .remove(
                                "is-open"
                            );

                    }

                }


                selected.classList.toggle(
                    "is-open",
                    shouldOpen
                );

            }
        );


        /* =================================================
           6. FOOTER
        ================================================= */

        if (footerEl) {

            footerEl.innerHTML =

                '<div class="erp-footer-inner">' +

                    '<div class="erp-footer-item">' +

                        '<span class="erp-footer-icon">☎</span>' +

                        '<span class="erp-footer-label">' +

                            text(
                                "الهاتف الموحد:",
                                "Phone:"
                            ) +

                        '</span>' +

                        '<a href="tel:${(window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.phone) || \"0115110455\"}" ' +
                        'class="erp-footer-link" ' +
                        'dir="ltr">' +

                            ((window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.phone) || "0115110455") +

                        '</a>' +

                    '</div>' +


                    '<span class="erp-footer-sep">|</span>' +


                    '<div class="erp-footer-item">' +

                        '<span class="erp-footer-icon">✉</span>' +

                        '<span class="erp-footer-label">' +

                            text(
                                "البريد الإلكتروني:",
                                "Email:"
                            ) +

                        '</span>' +

                        '<a href="mailto:${(window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.email) || \"sales@mubtkir.com\"}" ' +
                        'class="erp-footer-link">' +

                            ((window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.email) || "sales@mubtkir.com") +

                        '</a>' +

                    '</div>' +


                    '<span class="erp-footer-sep">|</span>' +


                    '<div class="erp-footer-item">' +

                        '<span class="erp-footer-icon">◎</span>' +

                        '<span class="erp-footer-label">' +

                            text(
                                "الموقع:",
                                "Website:"
                            ) +

                        '</span>' +

                        '<a href="https://${(window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.website) || \"www.mubtkir.com\"}" ' +
                        'class="erp-footer-link" ' +
                        'target="_blank" ' +
                        'rel="noopener">' +

                            ((window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.website) || "www.mubtkir.com") +

                        '</a>' +

                    '</div>' +

                '</div>';

        }


        console.log(
            "Buying Dashboard Loaded Successfully"
        );

    }


    /* =====================================================
       START
    ===================================================== */

    setTimeout(
        startDashboard,
        100
    );

})();