(() => {
  /* ═══════════════════════════════════════════════════
     لوحة تحكم إعدادات ERPNext
     صفحة مركزية لجميع إعدادات النظام والوحدات
  ═══════════════════════════════════════════════════ */

  // ── عناصر الصفحة الرئيسية ──
  const root = root_element.querySelector("[data-erp-dashboard]");
  const content = root_element.querySelector("[data-dashboard-content]");
  const statsSection = root_element.querySelector("[data-stats-section]");
  const quickActions = root_element.querySelector("[data-quick-actions]");
  const footerEl = root_element.querySelector("[data-dashboard-footer]");
  if (!root || !content) return;

  // ── كشف اللغة ──
  const langValue = window.frappe?.boot?.lang || window.frappe?.boot?.user?.language || document.documentElement.lang || "en";
  const isArabic = String(langValue).toLowerCase().startsWith("ar");

  /* ═══════════════════════════════════════════════════
     ① البطاقات الإحصائية (6 بطاقات)
     تعرض عدد العناصر المُعدّة في كل فئة
  ═══════════════════════════════════════════════════ */
  const statsCards = [
    { id:"email-accounts", icon:"📧", labelEn:"Email Accounts", labelAr:"حسابات البريد", color:"#2563eb",
      fetch:()=>new Promise(r=>{frappe.call({method:"frappe.client.get_count",args:{doctype:"Email Account",filters:{enable_incoming:1}},async:true,callback:d=>r(d?.message||0),error:()=>r(0)});})},
    { id:"notifications", icon:"🔔", labelEn:"Active Notifications", labelAr:"إشعارات نشطة", color:"#7c3aed",
      fetch:()=>new Promise(r=>{frappe.call({method:"frappe.client.get_count",args:{doctype:"Notification",filters:{enabled:1}},async:true,callback:d=>r(d?.message||0),error:()=>r(0)});})},
    { id:"email-templates", icon:"📝", labelEn:"Email Templates", labelAr:"قوالب البريد", color:"#0891b2",
      fetch:()=>new Promise(r=>{frappe.call({method:"frappe.client.get_count",args:{doctype:"Email Template"},async:true,callback:d=>r(d?.message||0),error:()=>r(0)});})},
    { id:"print-formats", icon:"🖨️", labelEn:"Print Formats", labelAr:"تنسيقات الطباعة", color:"#16a34a",
      fetch:()=>new Promise(r=>{frappe.call({method:"frappe.client.get_count",args:{doctype:"Print Format",filters:{disabled:0}},async:true,callback:d=>r(d?.message||0),error:()=>r(0)});})},
    { id:"workflows", icon:"⚡", labelEn:"Active Workflows", labelAr:"سير عمل نشط", color:"#ea580c",
      fetch:()=>new Promise(r=>{frappe.call({method:"frappe.client.get_count",args:{doctype:"Workflow",filters:{is_active:1}},async:true,callback:d=>r(d?.message||0),error:()=>r(0)});})},
    { id:"newsletters", icon:"📰", labelEn:"Newsletters", labelAr:"النشرات البريدية", color:"#be185d",
      fetch:()=>new Promise(r=>{frappe.call({method:"frappe.client.get_count",args:{doctype:"Newsletter"},async:true,callback:d=>r(d?.message||0),error:()=>r(0)});})}
  ];

  /* ═══════════════════════════════════════════════════
     ② الاختصارات السريعة (7 اختصارات)
     أهم صفحات الإعدادات المستخدمة باستمرار
  ═══════════════════════════════════════════════════ */
  const quickActionButtons = [
    { doctype:"System Settings", icon:"⚙️", labelEn:"System Settings", labelAr:"إعدادات النظام", color:"#475569", isSingle:true },
    { doctype:"Accounts Settings", icon:"🏛️", labelEn:"Accounts Settings", labelAr:"إعدادات الحسابات", color:"#2563eb", isSingle:true },
    { doctype:"Stock Settings", icon:"📦", labelEn:"Stock Settings", labelAr:"إعدادات المخزون", color:"#16a34a", isSingle:true },
    { doctype:"Selling Settings", icon:"🛒", labelEn:"Selling Settings", labelAr:"إعدادات المبيعات", color:"#7c3aed", isSingle:true },
    { doctype:"Buying Settings", icon:"🏪", labelEn:"Buying Settings", labelAr:"إعدادات المشتريات", color:"#ea580c", isSingle:true },
    { doctype:"Global Defaults", icon:"🌐", labelEn:"Global Defaults", labelAr:"الإعدادات الافتراضية", color:"#0891b2", isSingle:true },
    { doctype:"Print Settings", icon:"🖨️", labelEn:"Print Settings", labelAr:"إعدادات الطباعة", color:"#be185d", isSingle:true }
  ];

  /* ═══════════════════════════════════════════════════
     ③ تذييل الصفحة
  ═══════════════════════════════════════════════════ */
  const footerInfo = { phone: (window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.phone) || "0115110455", email: (window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.email) || "sales@mubtkir.com", website: (window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.website) || "www.mubtkir.com", labels:{ phoneEn:"Phone", phoneAr:"الهاتف الموحد", emailEn:"Email", emailAr:"البريد الإلكتروني", websiteEn:"Website", websiteAr:"الموقع" }};

  /* ═══════════════════════════════════════════════════
     ④ الأقسام والبطاقات
     نفس التقسيم الموجود في الصفحة الحالية
  ═══════════════════════════════════════════════════ */
  const sections = [["Settings",[
    ["Module Settings","🏗️",["Accounts Settings","Stock Settings","Selling Settings","Buying Settings","Manufacturing Settings","CRM Settings","Projects Settings","Support Settings"]],
    ["Email / Notifications","📧",["Email Account","Email Domain","Notification","Email Template","Auto Email Report","Newsletter","Notification Settings"]],
    ["Website","🌐",["Website Settings","Website Theme","Website Script","About Us Settings","Contact Us Settings"]],
    ["Core","⚙️",["System Settings","Domain Settings","Global Defaults"]],
    ["Printing","🖨️",["Print Format Builder","Print Settings","Print Format","Print Style"]],
    ["Workflow","⚡",["Workflow","Workflow State","Workflow Action"]]
  ]]];

  /* ═══════════════════════════════════════════════════
     ⑤ الترجمة العربية
  ═══════════════════════════════════════════════════ */
  const arabicFallback = {
    "Settings":"الإعدادات",
    "Module Settings":"إعدادات الوحدات","Email / Notifications":"البريد والإشعارات","Website":"الموقع الإلكتروني","Core":"الإعدادات الأساسية","Printing":"الطباعة","Workflow":"سير العمل",
    "Accounts Settings":"إعدادات الحسابات","Stock Settings":"إعدادات المخزون","Selling Settings":"إعدادات المبيعات","Buying Settings":"إعدادات المشتريات","Manufacturing Settings":"إعدادات التصنيع","CRM Settings":"إعدادات إدارة العملاء","Projects Settings":"إعدادات المشاريع","Support Settings":"إعدادات الدعم الفني",
    "Email Account":"حساب البريد","Email Domain":"نطاق البريد","Notification":"الإشعار","Email Template":"قالب البريد","Auto Email Report":"تقرير بريد تلقائي","Newsletter":"النشرة البريدية","Notification Settings":"إعدادات الإشعارات",
    "Website Settings":"إعدادات الموقع","Website Theme":"ثيم الموقع","Website Script":"سكريبت الموقع","About Us Settings":"إعدادات صفحة من نحن","Contact Us Settings":"إعدادات صفحة اتصل بنا",
    "System Settings":"إعدادات النظام","Domain Settings":"إعدادات النطاقات","Global Defaults":"الإعدادات الافتراضية العامة",
    "Print Format Builder":"منشئ تنسيق الطباعة","Print Settings":"إعدادات الطباعة","Print Format":"تنسيق الطباعة","Print Style":"نمط الطباعة",
    "Workflow":"سير العمل","Workflow State":"حالة سير العمل","Workflow Action":"إجراء سير العمل"
  };

  /* ═══════════════════════════════════════════════════
     ⑥ المستندات الفردية والصفحات الخاصة
  ═══════════════════════════════════════════════════ */
  const singleDocs = new Set([
    "Accounts Settings","Stock Settings","Selling Settings","Buying Settings","Manufacturing Settings","CRM Settings","Projects Settings","Support Settings",
    "Notification Settings",
    "Website Settings","About Us Settings","Contact Us Settings",
    "System Settings","Domain Settings","Global Defaults",
    "Print Settings"
  ]);
  // Print Format Builder هو صفحة خاصة وليس مستند
  const specialPages = {"Print Format Builder":"/app/print-format-builder"};
  const reportNames = new Set([]);

  /* ═══════════════════════════════════════════════════
     ⑦ التوضيحات
     جميع العناصر لها توضيح بدون خطوات
     ما عدا Workflow التي لها خطوات
  ═══════════════════════════════════════════════════ */
  const itemDescriptions = {

    /* ── إعدادات الوحدات ── */
    "Accounts Settings":{ icon:"🏛️",
      summaryAr:"التحكم في سلوك وحدة المحاسبة: القيود التلقائية، تقريب العملة، السنة المالية الافتراضية، وإعدادات الضرائب والفوترة.",
      summaryEn:"Control accounting module behavior: auto entries, currency rounding, default fiscal year, and tax/billing settings."},

    "Stock Settings":{ icon:"📦",
      summaryAr:"التحكم في سلوك المخزون: التقييم الافتراضي (FIFO/المتوسط)، السماح بالمخزون السالب، التتبع بالدُفعة والرقم التسلسلي.",
      summaryEn:"Control stock behavior: default valuation (FIFO/Average), allow negative stock, batch and serial tracking settings."},

    "Selling Settings":{ icon:"🛒",
      summaryAr:"التحكم في عمليات البيع: تسمية العملاء، تحقق الأسعار، مجموعة العملاء الافتراضية، وإعدادات حملات المبيعات.",
      summaryEn:"Control selling processes: customer naming, price validation, default customer group, and sales campaign settings."},

    "Buying Settings":{ icon:"🏪",
      summaryAr:"التحكم في عمليات الشراء: تسمية الموردين، فحص الجودة الإلزامي، مجموعة الموردين الافتراضية، وحدود الشراء.",
      summaryEn:"Control buying processes: supplier naming, mandatory quality inspection, default supplier group, and purchase limits."},

    "Manufacturing Settings":{ icon:"🏭",
      summaryAr:"التحكم في التصنيع: السماح بتجاوز الكميات، الاستهلاك التلقائي للمواد، وتخطيط الطاقة الإنتاجية.",
      summaryEn:"Control manufacturing: allow over-production, auto material consumption, and capacity planning settings."},

    "CRM Settings":{ icon:"🎯",
      summaryAr:"التحكم في إدارة العلاقات مع العملاء: إنشاء الفرص تلقائياً، تعيين حملات التسويق، ومتابعة العملاء المحتملين.",
      summaryEn:"Control CRM: auto opportunity creation, marketing campaign assignment, and lead follow-up settings."},

    "Projects Settings":{ icon:"📐",
      summaryAr:"التحكم في وحدة المشاريع: تتبع الوقت، ربط الجداول الزمنية بالفوترة، وإعدادات تحديث تقدم المشروع.",
      summaryEn:"Control projects module: time tracking, timesheet billing linkage, and project progress update settings."},

    "Support Settings":{ icon:"🎧",
      summaryAr:"التحكم في الدعم الفني: اتفاقيات مستوى الخدمة (SLA)، الإغلاق التلقائي للتذاكر، وأولويات الدعم.",
      summaryEn:"Control support: SLA agreements, auto-close tickets, and support priority settings."},

    /* ── البريد والإشعارات ── */
    "Email Account":{ icon:"📧",
      summaryAr:"ربط حسابات البريد الإلكتروني (SMTP/IMAP) لإرسال واستقبال البريد من داخل النظام.",
      summaryEn:"Connect email accounts (SMTP/IMAP) to send and receive emails from within the system."},

    "Email Domain":{ icon:"🌐",
      summaryAr:"تعريف نطاقات البريد مع إعدادات الخادم الافتراضية لتسهيل إنشاء حسابات البريد على نفس النطاق.",
      summaryEn:"Define email domains with default server settings to simplify creating email accounts on the same domain."},

    "Notification":{ icon:"🔔",
      summaryAr:"إنشاء إشعارات تلقائية تُرسل عند أحداث معينة في النظام عبر البريد أو النظام أو Slack.",
      summaryEn:"Create automatic notifications triggered by system events via email, system alerts, or Slack."},

    "Email Template":{ icon:"📝",
      summaryAr:"إنشاء قوالب بريد إلكتروني جاهزة مع متغيرات Jinja لإعادة استخدامها في الإشعارات والمراسلات.",
      summaryEn:"Create reusable email templates with Jinja variables for notifications and correspondence."},

    "Auto Email Report":{ icon:"📊",
      summaryAr:"جدولة إرسال تقارير تلقائياً بالبريد الإلكتروني في أوقات محددة (يومي، أسبوعي، شهري).",
      summaryEn:"Schedule automatic report delivery via email at set intervals (Daily, Weekly, Monthly)."},

    "Newsletter":{ icon:"📰",
      summaryAr:"إنشاء وإرسال نشرات بريدية لمجموعة من المشتركين مع تصميم HTML وتتبع الفتح والنقر.",
      summaryEn:"Create and send email newsletters to subscriber groups with HTML design and open/click tracking."},

    "Notification Settings":{ icon:"⚙️",
      summaryAr:"التحكم في تفضيلات المستخدم للإشعارات: تفعيل/تعطيل أنواع الإشعارات وطريقة الاستلام.",
      summaryEn:"Control user notification preferences: enable/disable notification types and delivery method."},

    /* ── الموقع الإلكتروني ── */
    "Website Settings":{ icon:"🌐",
      summaryAr:"إعدادات الموقع العامة: الشعار، العنوان، الرأس والتذييل، المفضلة (favicon)، وروابط التواصل الاجتماعي.",
      summaryEn:"General website settings: logo, title, header/footer, favicon, and social media links."},

    "Website Theme":{ icon:"🎨",
      summaryAr:"إنشاء وتخصيص ثيمات الموقع: الألوان، الخطوط، التخطيط، و CSS المخصص.",
      summaryEn:"Create and customize website themes: colors, fonts, layout, and custom CSS."},

    "Website Script":{ icon:"📜",
      summaryAr:"إضافة أكواد JavaScript مخصصة تعمل على جميع صفحات الموقع (مثل: Google Analytics، Chatbot).",
      summaryEn:"Add custom JavaScript code that runs on all website pages (e.g., Google Analytics, Chatbot)."},

    "About Us Settings":{ icon:"ℹ️",
      summaryAr:"إعداد محتوى صفحة «من نحن» في الموقع: مقدمة الشركة، أعضاء الفريق، والرؤية والرسالة.",
      summaryEn:"Configure the «About Us» page content: company introduction, team members, vision and mission."},

    "Contact Us Settings":{ icon:"📞",
      summaryAr:"إعداد صفحة «اتصل بنا»: العنوان، النص التمهيدي، والبريد الإلكتروني المستقبِل لرسائل التواصل.",
      summaryEn:"Configure «Contact Us» page: heading, introduction text, and email to receive contact messages."},

    /* ── الإعدادات الأساسية ── */
    "System Settings":{ icon:"⚙️",
      summaryAr:"إعدادات النظام العامة: اللغة، المنطقة الزمنية، تنسيق التاريخ والأرقام، الجلسة، وقيود الأمان.",
      summaryEn:"General system settings: language, timezone, date/number format, session, and security restrictions."},

    "Domain Settings":{ icon:"🏢",
      summaryAr:"تفعيل نطاقات العمل (مثل: تصنيع، تعليم، رعاية صحية) لعرض الوحدات والحقول المناسبة فقط.",
      summaryEn:"Enable business domains (e.g., Manufacturing, Education, Healthcare) to show only relevant modules and fields."},

    "Global Defaults":{ icon:"🌍",
      summaryAr:"القيم الافتراضية العامة للنظام: الشركة الافتراضية، العملة، البلد، والإعدادات المشتركة لجميع الوحدات.",
      summaryEn:"System-wide defaults: default company, currency, country, and shared settings across all modules."},

    /* ── الطباعة ── */
    "Print Format Builder":{ icon:"🔨",
      summaryAr:"أداة بصرية (سحب وإفلات) لتصميم تنسيقات طباعة مخصصة بدون كتابة أكواد.",
      summaryEn:"Visual drag-and-drop tool to design custom print formats without writing code."},

    "Print Settings":{ icon:"🖨️",
      summaryAr:"الإعدادات العامة للطباعة: ترويسة الصفحة، التنسيق الافتراضي، حجم الورق، واتجاه الطباعة.",
      summaryEn:"General print settings: letterhead, default format, paper size, and print orientation."},

    "Print Format":{ icon:"📄",
      summaryAr:"إنشاء تنسيقات طباعة مخصصة باستخدام HTML/Jinja لتخصيص شكل الفواتير والمستندات المطبوعة.",
      summaryEn:"Create custom print formats using HTML/Jinja to customize the look of printed invoices and documents."},

    "Print Style":{ icon:"🎨",
      summaryAr:"تعريف أنماط CSS مختلفة للطباعة (حديث، كلاسيكي، مونوكروم) لتغيير المظهر العام.",
      summaryEn:"Define different CSS print styles (Modern, Classic, Monochrome) to change the overall print appearance."},

    /* ── سير العمل (مع خطوات) ── */
    "Workflow":{ icon:"⚡",
      summaryAr:"إنشاء مسارات اعتماد آلية للمستندات: تحديد الحالات والانتقالات والصلاحيات لكل مرحلة (مثل: مسودة ← بانتظار الاعتماد ← معتمد).",
      summaryEn:"Create automated approval workflows for documents: define states, transitions, and permissions per stage (e.g., Draft → Pending Approval → Approved).",
      stepsAr:["اضغط «سير عمل جديد»","أدخل اسم سير العمل","اختر نوع المستند المطبق عليه (مثل: Leave Application)","حدد حقل الحالة (workflow_state)","أضف الحالات (States): مثل مسودة، بانتظار الاعتماد، معتمد، مرفوض","لكل حالة حدد: حالة المستند (Draft/Submitted/Cancelled)","لكل حالة حدد: الدور المسموح له بالتعديل وتحديث الحقول","أضف الانتقالات (Transitions): من حالة ← إلى حالة","لكل انتقال حدد: الإجراء (مثل: اعتماد)، الدور المسموح، والشرط","فعّل «نشط» لتطبيق سير العمل","اضغط «حفظ»"],
      stepsEn:["Click «New Workflow»","Enter workflow name","Select applicable document type (e.g., Leave Application)","Set state field (workflow_state)","Add States: e.g., Draft, Pending Approval, Approved, Rejected","Per state set: document status (Draft/Submitted/Cancelled)","Per state set: allowed role and update fields","Add Transitions: from state → to state","Per transition set: action (e.g., Approve), allowed role, and condition","Enable «Is Active» to apply workflow","Click «Save»"]},

    "Workflow State":{ icon:"🔵",
      summaryAr:"تعريف الحالات المستخدمة في سير العمل مع لون ونمط مميز لكل حالة (مثل: أخضر للمعتمد، أحمر للمرفوض).",
      summaryEn:"Define states used in workflows with distinct color and style per state (e.g., green for Approved, red for Rejected).",
      stepsAr:["اضغط «حالة سير عمل جديدة»","أدخل اسم الحالة (مثل: بانتظار الاعتماد)","اختر نمط العرض (Primary، Success، Danger، Warning، Info)","اختر أيقونة للحالة","اضغط «حفظ»","استخدمها في تعريف حالات سير العمل"],
      stepsEn:["Click «New Workflow State»","Enter state name (e.g., Pending Approval)","Select display style (Primary, Success, Danger, Warning, Info)","Select icon for state","Click «Save»","Use it in Workflow state definitions"]},

    "Workflow Action":{ icon:"▶️",
      summaryAr:"عرض وإدارة إجراءات سير العمل المعلقة: الموافقة أو الرفض أو المراجعة للمستندات المنتظرة.",
      summaryEn:"View and manage pending workflow actions: approve, reject, or review awaiting documents.",
      stepsAr:["اذهب إلى «إجراء سير العمل»","ستظهر قائمة بالمستندات المنتظرة لإجراء منك","فلتر حسب: نوع المستند، الحالة، التاريخ","اضغط على أي إجراء لفتح المستند","راجع المستند واتخذ الإجراء (اعتماد/رفض)","سينتقل المستند للحالة التالية تلقائياً"],
      stepsEn:["Go to «Workflow Action»","List of documents awaiting your action will display","Filter by: document type, status, date","Click any action to open the document","Review document and take action (Approve/Reject)","Document will automatically move to next state"]}
  };

  /* ═══════════════════════════════════════════════════
     دوال مساعدة
  ═══════════════════════════════════════════════════ */
  function translate(n){if(!isArabic)return n;return arabicFallback[n]||(typeof window.__==="function"?window.__(n):n);}
  function escapeHtml(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}
  function formatNumber(n){return(parseFloat(n)||0).toLocaleString("en-US");}

  /* ═══════════════════════════════════════════════════
     نافذة التوضيح المنبثقة
     تعرض الوصف فقط + زر خطوات للعناصر التي لها خطوات
  ═══════════════════════════════════════════════════ */
  
  /* =========================================================
     DETAILS BUTTON HELPER
  ========================================================= */
  function hasDetailsButton(cardTitle, itemName) {
    if (typeof reportNames !== "undefined" && reportNames && reportNames.has(itemName)) return false;
    if (typeof singleDocs !== "undefined" && singleDocs && singleDocs.has(itemName)) return false;
    if (/report|تقارير|تقرير|analytics/i.test(cardTitle) || /report|تقرير/i.test(itemName)) return false;
    if (/setting|config|إعداد|اعداد|تكوين|تهيئة|setup/i.test(cardTitle) || /setting|إعداد|اعداد|تهيئة/i.test(itemName)) return false;
    return true;
  }


  function showInfoModal(data) {
    const title =
      isArabic
        ? (data.labelAr || translate(data.labelEn || data.name || "") || data.labelEn || data.name || "")
        : (data.labelEn || data.name || data.labelAr || "");

    const summary =
      isArabic
        ? (data.summaryAr || ("إدارة ومتابعة " + title + " وتنفيذ العمليات المرتبطة بها في النظام."))
        : (data.summaryEn || ("Manage and track " + title + " and perform related operations."));

    const rawSteps =
      isArabic
        ? data.stepsAr
        : data.stepsEn;

    const steps = (Array.isArray(rawSteps) && rawSteps.length > 0)
      ? rawSteps
      : (
        isArabic
          ? [
              "فتح شاشة " + title,
              "إدخال وتعبئة البيانات الأساسية المطلوبة",
              "مراجعة وتدقيق الحقول والتحقق من صحتها",
              "حفظ السجل واعتماد المستند"
            ]
          : [
              "Open " + (data.labelEn || title),
              "Fill in the required information and fields",
              "Review and verify mandatory values",
              "Save and submit the record"
            ]
      );

    const overlay = document.createElement("div");
    overlay.className = "erp-modal-overlay";
    overlay.setAttribute("dir", isArabic ? "rtl" : "ltr");

    overlay.innerHTML = `
      <div class="erp-modal-box">
        <button
          type="button"
          class="erp-modal-close"
          data-modal-close
        >
          ✕
        </button>

        <div class="erp-modal-header">
          <span class="erp-modal-icon">
            ${data.icon || "📄"}
          </span>
          <h3 class="erp-modal-title">
            ${escapeHtml(title)}
          </h3>
        </div>

        <p class="erp-modal-summary">
          ${escapeHtml(summary)}
        </p>

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

    requestAnimationFrame(() => {
      overlay.classList.add("is-visible");
    });

    function closeModal() {
      overlay.classList.remove("is-visible");
      overlay.addEventListener(
        "transitionend",
        () => overlay.remove(),
        { once: true }
      );
      setTimeout(() => overlay.remove(), 250);
    }

    overlay
      .querySelector("[data-modal-close]")
      ?.addEventListener("click", closeModal);

    overlay.addEventListener("click", event => {
      if (event.target === overlay) {
        closeModal();
      }
    });

    const launchBtn = overlay.querySelector("[data-modal-launch]");
    if (launchBtn) {
      launchBtn.addEventListener("click", () => {
        closeModal();
        openRoute(data.name || data.labelEn || data.doctype || title);
      });
    }
  }

  /* ═══════════════════════════════════════════════════
     عرض البطاقات الإحصائية
  ═══════════════════════════════════════════════════ */
  function renderStats(){
    if(!statsSection)return;
    statsSection.innerHTML=`<div class="erp-stats-grid">${statsCards.map(c=>
      `<div class="erp-stat-card" style="--stat-color:${c.color}">
        <div class="erp-stat-icon">${c.icon}</div>
        <div class="erp-stat-info">
          <span class="erp-stat-value" data-stat-id="${c.id}">...</span>
          <span class="erp-stat-label">${escapeHtml(isArabic?c.labelAr:c.labelEn)}</span>
        </div>
      </div>`).join("")}</div>`;
    if(window.frappe)statsCards.forEach(c=>c.fetch().then(v=>{
      const el=statsSection.querySelector(`[data-stat-id="${c.id}"]`);
      if(el)el.textContent=formatNumber(v);
    }));
  }

  /* ═══════════════════════════════════════════════════
     عرض الاختصارات السريعة
     جميعها مستندات فردية تفتح بنموذج مباشر
  ═══════════════════════════════════════════════════ */
  function renderQuickActions(){
    if(!quickActions)return;
    quickActions.innerHTML=`<h2 class="erp-section-title">${escapeHtml(isArabic?"اختصارات سريعة":"Quick Actions")}</h2>
    <div class="erp-quick-grid">${quickActionButtons.map(b=>
      `<button type="button" class="erp-quick-btn" data-new-doc="${escapeHtml(b.doctype)}" ${b.isSingle?'data-is-single="1"':""} style="--btn-color:${b.color}">
        <span class="erp-quick-icon">${b.icon}</span>
        <span class="erp-quick-label">${escapeHtml(isArabic?b.labelAr:b.labelEn)}</span>
      </button>`).join("")}</div>`;

    // الاختصارات كلها مستندات فردية → تفتح كنموذج
    quickActions.addEventListener("click",e=>{
      const b=e.target.closest("[data-new-doc]");
      if(!b||!window.frappe)return;
      if(b.dataset.isSingle==="1"){frappe.set_route("Form",b.dataset.newDoc);return;}
      if(typeof frappe.new_doc==="function")frappe.new_doc(b.dataset.newDoc);
    });
  }

  /* ═══════════════════════════════════════════════════
     عرض أقسام البطاقات
  ═══════════════════════════════════════════════════ */
  function renderSections(){
    root.setAttribute("dir",isArabic?"rtl":"ltr");
    root.classList.toggle("erp-dashboard-rtl",isArabic);

    content.innerHTML=sections.map((s,si)=>{
      const ch=s[1].map((c,ci)=>{
        const lh=c[2].map(i=>{
          const ib="";
          return`<div class="erp-link-row">
            <button type="button" class="erp-link" data-route-name="${escapeHtml(i)}">
              <span class="erp-link-text">${escapeHtml(translate(i))}</span>
              <span class="erp-link-arrow">${isArabic?"←":"→"}</span>
            </button>${ib}</div>`;
        }).join("");

        return`<article class="erp-card is-open tone-${(si+ci)%5}" data-erp-card>
          <button type="button" class="erp-card-heading" data-card-toggle aria-expanded="true">
            <span class="erp-icon">${c[1]}</span>
            <span class="erp-card-title">${escapeHtml(translate(c[0]))}</span>
            <span class="erp-card-chevron">⌄</span>
          </button>
          <div class="erp-card-links">${lh}</div>
        </article>`;
      }).join("");

      return`<section class="erp-module-section">
        <h2 class="erp-section-title">${escapeHtml(translate(s[0]))}</h2>
        <div class="erp-dashboard-grid">${ch}</div>
      </section>`;
    }).join("");
  }

  /* ═══════════════════════════════════════════════════
     عرض التذييل
  ═══════════════════════════════════════════════════ */
  function renderFooter(){
    if(!footerEl)return;
    const l=footerInfo.labels;
    const p=isArabic?l.phoneAr:l.phoneEn;
    const e=isArabic?l.emailAr:l.emailEn;
    const w=isArabic?l.websiteAr:l.websiteEn;
    footerEl.innerHTML=`<div class="erp-footer-inner">
      <div class="erp-footer-item"><span class="erp-footer-icon">📞</span><span class="erp-footer-label">${escapeHtml(p)}:</span><a href="tel:${footerInfo.phone}" class="erp-footer-link" dir="ltr">${escapeHtml(footerInfo.phone)}</a></div>
      <span class="erp-footer-sep">|</span>
      <div class="erp-footer-item"><span class="erp-footer-icon">✉️</span><span class="erp-footer-label">${escapeHtml(e)}:</span><a href="mailto:${footerInfo.email}" class="erp-footer-link">${escapeHtml(footerInfo.email)}</a></div>
      <span class="erp-footer-sep">|</span>
      <div class="erp-footer-item"><span class="erp-footer-icon">🌐</span><span class="erp-footer-label">${escapeHtml(w)}:</span><a href="https://${footerInfo.website}" class="erp-footer-link" target="_blank" rel="noopener">${escapeHtml(footerInfo.website)}</a></div>
    </div>`;
  }

  /* ═══════════════════════════════════════════════════
     التوجيه (Routing)
     يحدد كيف يُفتح كل عنصر حسب نوعه:
     - الصفحات الخاصة (مثل Print Format Builder) → رابط مباشر
     - المستندات الفردية (Settings) → Form
     - الباقي → List
  ═══════════════════════════════════════════════════ */
  function openRoute(n){
    if(!window.frappe||typeof frappe.set_route!=="function")return;
    // صفحات خاصة
    if(specialPages[n]){frappe.set_route(specialPages[n]);return;}
    // تقارير
    if(reportNames.has(n)){frappe.set_route("query-report",n);return;}
    // مستندات فردية (إعدادات)
    if(singleDocs.has(n)){frappe.set_route("Form",n);return;}
    // قوائم عادية
    frappe.set_route("List",n);
  }

  /* ═══════════════════════════════════════════════════
     تفويض الأحداث
     ① زر التفاصيل → نافذة التوضيح
     ② رابط العنصر → توجيه للصفحة
     ③ عنوان البطاقة → طي/فتح
  ═══════════════════════════════════════════════════ */
  let lastToggleTime=0;
  content.addEventListener("click",event=>{
    // ① نافذة التوضيح
    const ib =
        event.target.closest("[data-info-item]");

      if (ib) {
        event.preventDefault();
        event.stopPropagation();

        const itemName =
          ib.dataset.infoItem;

        const data =
          itemDescriptions[itemName] || {};

        showInfoModal({
          ...data,
          name: itemName,
          icon: data.icon || "📄",
          labelAr: translate(itemName) || itemName,
          labelEn: itemName,
          summaryAr: data.summaryAr,
          summaryEn: data.summaryEn,
          stepsAr: data.stepsAr,
          stepsEn: data.stepsEn
        });

        return;
      }

    // ② التوجيه
    const rb=event.target.closest("[data-route-name]");
    if(rb){event.preventDefault();event.stopPropagation();openRoute(rb.dataset.routeName);return;}

    // ③ طي/فتح البطاقة
    const cb=event.target.closest("[data-card-toggle]");
    if(!cb)return;
    const now=Date.now();
    if(now-lastToggleTime<400)return;
    lastToggleTime=now;
    const sc=cb.closest("[data-erp-card]");
    if(!sc)return;
    const so=!sc.classList.contains("is-open");
    content.querySelectorAll("[data-erp-card]").forEach(c=>{
      if(c!==sc){c.classList.remove("is-open");c.querySelector("[data-card-toggle]")?.setAttribute("aria-expanded","false");}
    });
    if(so){sc.classList.add("is-open");cb.setAttribute("aria-expanded","true");}
    else{sc.classList.remove("is-open");cb.setAttribute("aria-expanded","false");}
  });

  /* ═══════════════════════════════════════════════════
     تشغيل اللوحة
  ═══════════════════════════════════════════════════ */
  renderStats();
  renderQuickActions();
  renderSections();
  renderFooter();
})();
