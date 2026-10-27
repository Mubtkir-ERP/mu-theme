(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم إدارة الموقع الإلكتروني — ERPNext Website
   * ══════════════════════════════════════════
   */

  const root = root_element.querySelector("[data-erp-dashboard]");
  const content = root_element.querySelector("[data-dashboard-content]");
  const statsSection = root_element.querySelector("[data-stats-section]");
  const quickActions = root_element.querySelector("[data-quick-actions]");
  const footerEl = root_element.querySelector("[data-dashboard-footer]");

  if (!root || !content) return;

  const langValue =
    window.frappe?.boot?.lang ||
    window.frappe?.boot?.user?.language ||
    document.documentElement.lang || "en";

  const isArabic = String(langValue).toLowerCase().startsWith("ar");

  /* ─────────────────────────────────────────
     ١. إحصائيات الموقع
  ───────────────────────────────────────── */

  const statsCards = [
    {
      id: "published-pages",
      short: "PAGE",
      labelEn: "Web Pages",
      labelAr: "صفحات الويب المنشورة",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "Web Page",
              filters: { published: 1 }
            },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "blog-posts",
      short: "BLOG",
      labelEn: "Blog Posts",
      labelAr: "المقالات المنشورة",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "Blog Post",
              filters: { published: 1 }
            },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "web-forms",
      short: "FORM",
      labelEn: "Web Forms",
      labelAr: "نماذج الويب النشطة",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: { doctype: "Web Form" },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "help-articles",
      short: "KB",
      labelEn: "Knowledge Base",
      labelAr: "مقالات قاعدة المعرفة",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: { doctype: "Help Article" },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    }
  ];

  /* ─────────────────────────────────────────
     ٢. أزرار الاختصارات السريعة (Your Shortcuts)
  ───────────────────────────────────────── */

  const quickActionButtons = [
    { doctype: "Blog Post", labelEn: "Blog Post", labelAr: "مقال جديد" },
    { doctype: "Blogger", labelEn: "Blogger", labelAr: "كاتب مدونة" },
    { doctype: "Web Page", labelEn: "Web Page", labelAr: "صفحة ويب" },
    { doctype: "Web Form", labelEn: "Web Form", labelAr: "نموذج ويب" },
    { doctype: "Website Settings", labelEn: "Website Settings", labelAr: "إعدادات الموقع", isSingle: true }
  ];

  /* ─────────────────────────────────────────
     ٣. هيكل الأقسام والبطاقات (مطابق تماماً للصورة)
  ───────────────────────────────────────── */

  const sections = [
    [
      "Reports & Masters",
      [
        [
          "Setup",
          "⚙️",
          [
            "Website Settings",
            "Website Theme",
            "Website Script",
            "About Us Settings",
            "Contact Us Settings"
          ]
        ],
        [
          "Blog",
          "📝",
          [
            "Blog Post",
            "Blogger",
            "Blog Category"
          ]
        ],
        [
          "Web Site",
          "🌐",
          [
            "Web Page",
            "Web Form",
            "Website Sidebar",
            "Website Slideshow",
            "Website Route Meta"
          ]
        ],
        [
          "Portal",
          "🚪",
          [
            "Portal Settings"
          ]
        ],
        [
          "Knowledge Base",
          "📚",
          [
            "Help Category",
            "Help Article"
          ]
        ]
      ]
    ]
  ];

  /* ─────────────────────────────────────────
     ٤. أنواع المستندات الفردية والشجرية والتقارير
  ───────────────────────────────────────── */

  const singleDocs = new Set([
    "Website Settings",
    "Website Script",
    "About Us Settings",
    "Contact Us Settings",
    "Portal Settings"
  ]);

  const treeDocs = new Set([
    "Help Category"
  ]);

  const reportNames = new Set([]);

  /* ─────────────────────────────────────────
     ٥. القاموس اللغوي (عربي / إنجليزي)
  ───────────────────────────────────────── */

  const translations = {
    "Reports & Masters": "التقارير والبيانات الرئيسية",
    "Setup": "الإعداد والتهيئة",
    "Blog": "المدونة",
    "Web Site": "موقع الويب",
    "Portal": "بوابة العملاء",
    "Knowledge Base": "قاعدة المعرفة",

    "Website Settings": "إعدادات الموقع",
    "Website Theme": "سمات وقوالب الموقع",
    "Website Script": "نصوص جافاسكربت الموقع",
    "About Us Settings": "إعدادات صفحة من نحن",
    "Contact Us Settings": "إعدادات صفحة اتصل بنا",

    "Blog Post": "المقالات",
    "Blogger": "الكتّاب والمدونون",
    "Blog Category": "تصنيفات المدونة",

    "Web Page": "صفحات الويب",
    "Web Form": "نماذج الويب",
    "Website Sidebar": "القوائم الجانبية للموقع",
    "Website Slideshow": "معارض الصور المتحركة",
    "Website Route Meta": "بيانات الميتا وعناوين الروابط",

    "Portal Settings": "إعدادات بوابة الخدمة الذاتية",

    "Help Category": "تصنيفات الدعم والمساعدة",
    "Help Article": "مقالات الدعم المعرفي"
  };

  /* ─────────────────────────────────────────
     ٦. شروحات وتفاصيل الشاشات والإعدادات
  ───────────────────────────────────────── */

  const itemDescriptions = {
    "Website Settings": {
      icon: "⚙️",
      summaryAr: "شاشة الضبط الشامل للموقع؛ تشمل شعار المنشأة (Logo)، اسم الموقع، الروابط العلوية (Navbar)، الفوتر، وسياسات العرض.",
      summaryEn: "Master website configuration: brand logo, site title, top navigation bar menus, footer links, and SEO defaults.",
      stepsAr: ["رفع الشعار وتحديد اسم الموقع وأيقونة التفضيل (Favicon)", "تهيئة روابط القائمة الرئيسية وشريط التذييل", "حفظ الإعدادات لتحديث واجهة الموقع فوراً"],
      stepsEn: ["Upload brand logo and configure title / favicon", "Define top navigation menus and footer content", "Save settings to refresh live website frontend"]
    },
    "Website Theme": {
      icon: "🎨",
      summaryAr: "تخصيص الهوية البصرية وتنسيقات الموقع؛ تتيح ضبط الألوان، الخطوط، وتنسيقات CSS المخصصة لواجهات العرض.",
      summaryEn: "Visual styling and theme configuration: color schemes, typography, CSS overrides, and UI component styling.",
      stepsAr: ["اختيار أو إنشاء سمة مظهر جديدة للموقع", "ضبط لوحة الألوان الأساسية ونوع الخط المعتمد", "تطبيق السمة وتعيينها كسمة افتراضية للموقع"],
      stepsEn: ["Create or edit website theme template", "Configure primary branding colors and typography font", "Apply theme as default across public web pages"]
    },
    "Website Script": {
      icon: "📜",
      summaryAr: "إضافة أكواد جافاسكربت (JavaScript) مخصصة لتشغيل أدوات التتبع (مثل Google Analytics) أو وظائف تفاعلية بالموقع.",
      summaryEn: "Inject custom JavaScript and analytics tracking snippets (Google Tag Manager, Meta Pixel) into the site header.",
      stepsAr: ["إدخال كود التتبع أو النص البرمجي المطلوب", "التحقق من صحة الكود البرمجي وخلوه من الأخطاء", "حفظ وتفعيل الكود ليعمل على كافة صفحات الموقع"],
      stepsEn: ["Paste script or analytics tracking code", "Validate syntax and external library dependencies", "Save and deploy script to public pages"]
    },
    "About Us Settings": {
      icon: "🏢",
      summaryAr: "تهيئة صفحة «من نحن» الرسمية؛ تشمل نبذة عن المنشأة، الرؤية والرسالة، أعضاء الفريق، والإنجازات.",
      summaryEn: "Manage public About Us page content: corporate vision, mission statement, executive team, and milestones.",
      stepsAr: ["كتابة النص التعريفي ورؤية ورسالة المنشأة", "إضافة صور وبيانات أعضاء فريق العمل", "حفظ الإعدادات لمزامنة التعديلات على صفحة من نحن بالموقع"],
      stepsEn: ["Compose company bio, vision, and mission statement", "Add team member profiles and photographs", "Save settings to reflect changes on public /about page"]
    },
    "Contact Us Settings": {
      icon: "📞",
      summaryAr: "ضبط صفحة «اتصل بنا»؛ تشمل خريطة الموقع الجغرافي، أرقام التواصل، البريد الإلكتروني، وتوجيه رسائل الزوار.",
      summaryEn: "Manage Contact Us page: physical office addresses, Google maps embed, email, and visitor lead generation.",
      stepsAr: ["إدخال بيانات التواصل والعنوان الفعلي ورابط الخريطة", "تفعيل نموذج المراسلة الفوري لإنشاء عملاء محتملين آلياً", "حفظ الإعدادات لتحديث صفحة اتصل بنا بالموقع"],
      stepsEn: ["Enter contact numbers, physical address, and map coordinates", "Enable web contact form to capture leads automatically", "Save settings to publish updated contact info"]
    },

    "Blog Post": {
      icon: "📝",
      summaryAr: "كتابة ونشر المقالات والأخبار الترويجية والتثقيفية بالمدونة مع دعم تحسين محركات البحث (SEO) والوسائط.",
      summaryEn: "Author and publish SEO-optimized blog posts, articles, company press releases, and rich media content.",
      stepsAr: ["كتابة عنوان المقال والمحتوى والمؤلف والتصنيف", "رفع الصورة المميزة وتحديد كلمات وتوصيف الـ SEO", "نشر المقال وتتبّع التفاعل والزيارات"],
      stepsEn: ["Draft article title, rich content, blogger, and category", "Attach featured hero image and configure SEO meta tags", "Publish article to live company blog"]
    },
    "Blogger": {
      icon: "✍️",
      summaryAr: "إدارة وتوثيق ملفات الكتّاب والمدونين؛ تشمل الاسم، الصورة الشخصية، النبذة التعريفية، وروابط التواصل.",
      summaryEn: "Manage contributing author profiles: bio, avatar photograph, job title, and social media handles.",
      stepsAr: ["تسجيل اسم الكاتب وتحديد حسابه في النظام", "إضافة نبذة مختصرة وروابط حسابات التواصل", "ربط الكاتب بمقالات المدونة الصادرة عنه"],
      stepsEn: ["Create author profile and link to user account", "Upload bio description and social handles", "Associate author with published blog posts"]
    },
    "Blog Category": {
      icon: "🏷️",
      summaryAr: "تصنيف مقالات المدونة إلى أقسام وموضوعات متخصصة (تقنية، أعمال، أخبار، نصائح) لتسهيل التصفح.",
      summaryEn: "Organize blog content into structured topic categories for seamless reader navigation and search.",
      stepsAr: ["تسمية تصنيف المقالات وتحديد الرابط المختصر (Slug)", "إضافة وصف موجز للقسم لتحسين محركات البحث", "ربط التصنيف بالمقالات التابعة له"],
      stepsEn: ["Define category title and URL route slug", "Add category meta description for search engines", "Assign category to relevant published articles"]
    },

    "Web Page": {
      icon: "📄",
      summaryAr: "إنشاء صفحات ويب كاملة ومستقلة على الموقع مع إمكانية تصميم المحتوى عبر الكتل الجاهزة أو كود HTML/CSS.",
      summaryEn: "Build full standalone custom landing pages using modular page blocks, Markdown, or raw HTML/CSS.",
      stepsAr: ["تحديد عنوان الصفحة ومسار الرابط (Route)", "تصميم المحتوى وإضافة النصوص والصور والأزرار", "نشر الصفحة وضبط إعدادات الخصوصية والـ SEO"],
      stepsEn: ["Specify page title and published URL route", "Design layout using sections, text blocks, or HTML", "Publish page and configure indexing meta tags"]
    },
    "Web Form": {
      icon: "📋",
      summaryAr: "تصميم نماذج ويب تفاعلية لجمع البيانات والاستفسارات والطلبات من الجمهور وربطها تلقائياً بسجلات النظام.",
      summaryEn: "Interactive web forms capturing visitor submissions (job applications, inquiries) into system DocTypes.",
      stepsAr: ["اختيار نوع المستند المطلوب إنشاؤه (مثل Lead أو Issue)", "اختيار الحقول وتحديد إلزاميتها وتسمياتها للزوار", "نشر النموذج ومشاركة الرابط على الموقع أو وسائل التواصل"],
      stepsEn: ["Select target destination DocType (e.g. Lead, Issue)", "Configure exposed form fields, labels, and validations", "Publish web form route and embed on site"]
    },
    "Website Sidebar": {
      icon: "📑",
      summaryAr: "بناء وإدارة القوائم الجانبية المخصصة للصفحات والمدونة لتسهيل التنقل والوصول السريع للأقسام.",
      summaryEn: "Construct customizable website sidebar navigation menus for documentation portals and blogs.",
      stepsAr: ["إنشاء القائمة الجانبية وتسميتها", "إدراج روابط الصفحات والأقسام وعناوينها", "ربط القائمة الجانبية بصفحات الويب المستهدفة"],
      stepsEn: ["Create new sidebar navigation set", "Add link items, labels, and target URLs", "Attach sidebar to designated web pages or blog"]
    },
    "Website Slideshow": {
      icon: "🖼️",
      summaryAr: "إنشاء وإدارة معارض الصور والبنرات الإعلانية المتحركة (Sliders) في الصفحة الرئيسية وصفحات المنتجات.",
      summaryEn: "Create interactive visual image carousels and hero slideshows for landing pages and catalogs.",
      stepsAr: ["تسمية معرض الصور وإضافة الشرائح والصور الترويجية", "ربط كل شريحة برابط توجيهي ونص وصفي", "إدراج شريط التمرير في الصفحة الرئيسية أو الصفحات المستهدفة"],
      stepsEn: ["Name slideshow and upload high-resolution slide banners", "Add call-to-action links and heading text per slide", "Embed slideshow into landing pages or product showcases"]
    },
    "Website Route Meta": {
      icon: "🔍",
      summaryAr: "ضبط وتحسين محركات البحث (SEO) المتقدم؛ تحديد العناوين، الكلمات المفتاحية، وصور المشاركة (Open Graph) للروابط.",
      summaryEn: "Advanced URL route SEO metadata: customize page title tags, keywords, descriptions, and Open Graph social cards.",
      stepsAr: ["إدخال رابط الصفحة المستهدفة على الموقع", "تخصيص عنوان الميتا ووصف الـ SEO وصورة المشاركة", "حفظ السجل لتحسين ظهور الصفحة في نتائج بحث Google ومواقع التواصل"],
      stepsEn: ["Specify target website route URL", "Set custom meta title, description, and social share image", "Save to enhance Google search indexing and social snippet preview"]
    },

    "Portal Settings": {
      icon: "🚪",
      summaryAr: "إعدادات بوابة الخدمة الذاتية للعملاء؛ تتيح للعميل استعراض فواتيره، طلباته، عروض الأسعار، وتذاكر الدعم مباشرة.",
      summaryEn: "Customer portal self-service settings: configure client menu access for invoices, orders, quotations, and tickets.",
      stepsAr: ["تحديد القوائم المتاحة للعملاء في البوابة الإلكترونية", "ضبط صلاحيات رفع المستندات واستعراض الحسابات", "حفظ الإعدادات لتفعيل خيارات البوابة للعملاء المسجلين"],
      stepsEn: ["Enable portal menu shortcuts (Invoices, Orders, Projects)", "Set customer document viewing and upload permissions", "Save configuration to grant instant client self-service"]
    },

    "Help Category": {
      icon: "📁",
      summaryAr: "شجرة تصنيف مقالات وأقسام الدعم المعرفي لتنظيم الأسئلة الشائعة وأدلة الاستخدام بحسب الموضوع.",
      summaryEn: "Hierarchical categories organizing knowledge base documentation and customer self-help articles.",
      stepsAr: ["إنشاء تصنيف جديد ضمن شجرة قاعدة المعرفة", "إضافة اسم ووصف القسم وأيقونته التوضيحية", "ربط مقالات المساعدة التابعة بهذا التصنيف"],
      stepsEn: ["Create help category within knowledge base hierarchy", "Provide category title, description, and icon", "Organize user guide articles under category"]
    },
    "Help Article": {
      icon: "📖",
      summaryAr: "كتابة ونشر مقالات الدعم والمساعدة وحلول المشكلات الشائعة لتمكين العملاء من حل استفساراتهم ذاتياً.",
      summaryEn: "Publish comprehensive knowledge base tutorials, FAQs, and troubleshooting articles for customer support.",
      stepsAr: ["كتابة عنوان المقال الإرشادي واختيار التصنيف", "صياغة الشرح التفصيلي وإرفاق الصور أو مقاطع الفيديو التوضيحية", "نشر المقال لإتاحته للعملاء في مركز المساعدة الإلكتروني"],
      stepsEn: ["Enter article title and assign parent help category", "Write step-by-step resolution guide and embed illustrations", "Publish article to customer-facing Help Center"]
    }
  };

  /* ─────────────────────────────────────────
     ٧. الدوال المساعدة
  ───────────────────────────────────────── */

  function translate(key) {
    if (!isArabic) return key;
    return translations[key] || key;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatNumber(value) {
    const num = Number(value) || 0;
    return num.toLocaleString(isArabic ? "ar-SA" : "en-US");
  }

  /* ─────────────────────────────────────────
     ٨. نافذة التفاصيل المنبثقة (Info Modal القياسية)
  ───────────────────────────────────────── */

  function showInfoModal(itemName) {
    const desc = itemDescriptions[itemName];
    const title = isArabic ? (translate(itemName) || itemName) : itemName;
    const summary = desc
      ? (isArabic ? desc.summaryAr : desc.summaryEn)
      : (isArabic ? ("إدارة ومتابعة " + title + " وتنفيذ العمليات المرتبطة بها.") : ("Manage and track " + itemName + "."));
    const rawSteps = desc ? (isArabic ? desc.stepsAr : desc.stepsEn) : null;
    const steps = (Array.isArray(rawSteps) && rawSteps.length > 0)
      ? rawSteps
      : (isArabic
          ? [
              "فتح شاشة " + title,
              "إدخال وتعبئة البيانات الأساسية المطلوبة",
              "مراجعة وتدقيق الحقول والتحقق من صحتها",
              "حفظ السجل واعتماد المستند"
            ]
          : [
              "Open " + itemName,
              "Fill in the required information and fields",
              "Review and verify mandatory values",
              "Save and submit the record"
            ]);

    const existing = root.querySelector(".erp-modal-overlay") || document.querySelector(".erp-modal-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.className = "erp-modal-overlay";
    overlay.setAttribute("dir", isArabic ? "rtl" : "ltr");

    overlay.innerHTML = `
      <div class="erp-modal-box">
        <button type="button" class="erp-modal-close" data-modal-close aria-label="${isArabic ? "إغلاق" : "Close"}">✕</button>
        <div class="erp-modal-header">
          <span class="erp-modal-icon">${desc?.icon || "📄"}</span>
          <h3 class="erp-modal-title">${escapeHtml(title)}</h3>
        </div>
        <p class="erp-modal-summary">${escapeHtml(summary)}</p>

        <div class="erp-modal-steps is-shown" data-modal-steps>
          <ol class="erp-modal-steps-list">
            ${steps.map(s => `<li>${escapeHtml(s)}</li>`).join("")}
          </ol>
        </div>

        <div style="margin-top: 18px;">
          <button
            type="button"
            class="erp-quick-btn"
            data-modal-launch
            style="width: 100%; min-height: 42px;"
          >
            <span class="erp-quick-label">${isArabic ? "فتح الشاشة" : "Open Screen"}</span>
          </button>
        </div>
      </div>
    `;

    root.appendChild(overlay);
    setTimeout(() => overlay.classList.add("is-visible"), 10);

    const closeModal = () => {
      overlay.classList.remove("is-visible");
      setTimeout(() => overlay.remove(), 280);
    };

    const closeBtn = overlay.querySelector("[data-modal-close]");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    overlay.addEventListener("click", e => {
      if (e.target === overlay) closeModal();
    });

    const launchBtn = overlay.querySelector("[data-modal-launch]");
    if (launchBtn) {
      launchBtn.addEventListener("click", () => {
        closeModal();
        openRoute(itemName);
      });
    }
  }

  /* ─────────────────────────────────────────
     ٩. إنشاء بطاقات الإحصائيات
  ───────────────────────────────────────── */

  function renderStats() {
    if (!statsSection) return;

    statsSection.innerHTML = `
      <div class="erp-stats-grid">
        ${statsCards.map(c => `
          <div class="erp-stat-card" data-stat-id="${c.id}">
            <div class="erp-stat-icon">${c.short}</div>
            <div class="erp-stat-info">
              <span class="erp-stat-label">${escapeHtml(isArabic ? c.labelAr : c.labelEn)}</span>
              <span class="erp-stat-value" data-stat-value>—</span>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    statsCards.forEach(c => {
      c.fetch().then(val => {
        const el = statsSection.querySelector(`[data-stat-id="${c.id}"] [data-stat-value]`);
        if (el) {
          el.textContent = formatNumber(val);
        }
      });
    });
  }

  /* ─────────────────────────────────────────
     ١٠. إنشاء أزرار الاختصارات السريعة
  ───────────────────────────────────────── */

  function renderQuickActions() {
    if (!quickActions) return;

    const title = isArabic ? "اختصارات سريعة" : "Quick Actions";

    quickActions.innerHTML = `
      <h2 class="erp-section-title">${escapeHtml(title)}</h2>
      <div class="erp-quick-grid">
        ${quickActionButtons.map(btn => {
          const label = isArabic ? btn.labelAr : btn.labelEn;
          return `
            <button type="button" class="erp-quick-btn" data-btn-action="${escapeHtml(btn.doctype)}" ${btn.isSingle ? 'data-is-single="1"' : ''}>
              <span class="erp-quick-icon" aria-hidden="true">+</span>
              <span class="erp-quick-label">${escapeHtml(label)}</span>
            </button>`;
        }).join("")}
      </div>
    `;

    quickActions.addEventListener("click", event => {
      const btn = event.target.closest("[data-btn-action]");
      if (!btn || !window.frappe) return;
      const doctype = btn.dataset.btnAction;
      if (btn.dataset.isSingle === "1") {
        frappe.set_route("Form", doctype);
        return;
      }
      frappe.new_doc(doctype);
    });
  }

  /* ─────────────────────────────────────────
     ١١. إنشاء بطاقات الوحدات والمربعات
  ───────────────────────────────────────── */

  function renderSections() {
    root.setAttribute("dir", isArabic ? "rtl" : "ltr");
    root.classList.toggle("erp-dashboard-rtl", isArabic);

    content.innerHTML = sections
      .map((section, sectionIndex) => {
        const sectionName = section[0];
        const sectionCards = section[1];

        const cardsHtml = sectionCards
          .map((card, cardIndex) => {
            const cardName = card[0];
            const icon = card[1];
            const items = card[2];

            const linksHtml = items.map(itemName => {
              const desc = itemDescriptions[itemName];
              const isReport = reportNames.has(itemName);
              const detailsLabel = isArabic ? "تفاصيل" : "Details";
              const infoBtn = (!isReport && desc)
                ? `<button type="button" class="erp-info-link" data-info-item="${escapeHtml(itemName)}">${detailsLabel}</button>`
                : "";

              return `
                <div class="erp-link-row">
                  <button type="button" class="erp-link" data-route-name="${escapeHtml(itemName)}">
                    <span class="erp-link-text">${escapeHtml(translate(itemName))}</span>
                    <span class="erp-link-arrow" aria-hidden="true">${isArabic ? "←" : "→"}</span>
                  </button>
                  ${infoBtn}
                </div>`;
            }).join("");

            return `
              <article class="erp-card tone-${(sectionIndex + cardIndex) % 5}" data-erp-card>
                <button type="button" class="erp-card-heading" data-card-toggle aria-expanded="false">
                  <span class="erp-icon" aria-hidden="true">${icon}</span>
                  <span class="erp-card-title">${escapeHtml(translate(cardName))}</span>
                  <span class="erp-card-chevron" aria-hidden="true">⌄</span>
                </button>
                <div class="erp-card-links">${linksHtml}</div>
              </article>`;
          }).join("");

        return `
          <section class="erp-module-section">
            <h2 class="erp-section-title">${escapeHtml(translate(sectionName))}</h2>
            <div class="erp-dashboard-grid">${cardsHtml}</div>
          </section>`;
      }).join("");
  }

  /* ─────────────────────────────────────────
     ١٢. إنشاء الفوتر
  ───────────────────────────────────────── */

  const footerInfo = {
    phone: "920033198",
    email: "apps@mubtkir.com",
    website: "www.mubtkir.com",
    labels: {
      phoneAr: "الهاتف الموحد",
      phoneEn: "Support Phone",
      emailAr: "البريد الإلكتروني",
      emailEn: "Email Support",
      websiteAr: "الموقع الإلكتروني",
      websiteEn: "Official Website"
    }
  };

  function renderFooter() {
    if (!footerEl) return;
    const labels = footerInfo.labels;
    const phoneLabel = isArabic ? labels.phoneAr : labels.phoneEn;
    const emailLabel = isArabic ? labels.emailAr : labels.emailEn;
    const websiteLabel = isArabic ? labels.websiteAr : labels.websiteEn;

    footerEl.innerHTML = `
      <div class="erp-footer-inner">
        <div class="erp-footer-item">
          <span class="erp-footer-icon">📞</span>
          <span class="erp-footer-label">${escapeHtml(phoneLabel)}:</span>
          <a href="tel:${footerInfo.phone}" class="erp-footer-link" dir="ltr">${escapeHtml(footerInfo.phone)}</a>
        </div>
        <span class="erp-footer-sep">|</span>
        <div class="erp-footer-item">
          <span class="erp-footer-icon">✉️</span>
          <span class="erp-footer-label">${escapeHtml(emailLabel)}:</span>
          <a href="mailto:${footerInfo.email}" class="erp-footer-link">${escapeHtml(footerInfo.email)}</a>
        </div>
        <span class="erp-footer-sep">|</span>
        <div class="erp-footer-item">
          <span class="erp-footer-icon">🌐</span>
          <span class="erp-footer-label">${escapeHtml(websiteLabel)}:</span>
          <a href="https://${footerInfo.website}" class="erp-footer-link" target="_blank" rel="noopener">${escapeHtml(footerInfo.website)}</a>
        </div>
      </div>`;
  }

  /* ─────────────────────────────────────────
     ١٣. التوجيه وفتح الشاشات داخل النظام
  ───────────────────────────────────────── */

  function openRoute(name) {
    if (!window.frappe || typeof frappe.set_route !== "function") return;
    if (reportNames.has(name)) {
      frappe.set_route("query-report", name);
      return;
    }
    if (singleDocs.has(name)) {
      frappe.set_route("Form", name);
      return;
    }
    if (treeDocs.has(name)) {
      frappe.set_route("Tree", name);
      return;
    }
    frappe.set_route("List", name);
  }

  /* ─────────────────────────────────────────
     ١٤. معالجة الأحداث والضغط
  ───────────────────────────────────────── */

  let lastToggleTime = 0;

  content.addEventListener("click", event => {
    const infoBtn = event.target.closest("[data-info-item]");
    if (infoBtn) {
      event.preventDefault();
      event.stopPropagation();
      showInfoModal(infoBtn.dataset.infoItem);
      return;
    }

    const link = event.target.closest("[data-route-name]");
    if (link) {
      event.preventDefault();
      openRoute(link.dataset.routeName);
      return;
    }

    const toggle = event.target.closest("[data-card-toggle]");
    if (toggle) {
      const now = Date.now();
      if (now - lastToggleTime < 300) return;
      lastToggleTime = now;

      const card = toggle.closest("[data-erp-card]");
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      if (card) {
        card.classList.toggle("is-collapsed", expanded);
      }
    }
  });

  /* ─────────────────────────────────────────
     ١٥. بدء التشغيل
  ───────────────────────────────────────── */

  renderStats();
  renderQuickActions();
  renderSections();
  renderFooter();
})();
