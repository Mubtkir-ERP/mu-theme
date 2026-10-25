(() => {
  /* ═══════════════════════════════════════════════════
     لوحة تحكم الأدوات - Tools Dashboard
     أدوات النظام: البيانات، البريد، الطباعة، الأتمتة
  ═══════════════════════════════════════════════════ */

  const root = root_element.querySelector("[data-erp-dashboard]");
  const content = root_element.querySelector("[data-dashboard-content]");
  const statsSection = root_element.querySelector("[data-stats-section]");
  const quickActions = root_element.querySelector("[data-quick-actions]");
  const footerEl = root_element.querySelector("[data-dashboard-footer]");
  if (!root || !content) return;

  const langValue = window.frappe?.boot?.lang || window.frappe?.boot?.user?.language || document.documentElement.lang || "en";
  const isArabic = String(langValue).toLowerCase().startsWith("ar");

  /* ═══════════════════════════════════════════════════
     ① البطاقات الإحصائية (6 بطاقات)
  ═══════════════════════════════════════════════════ */
  const statsCards = [
    { id:"imports", icon:"📥", labelEn:"Data Imports", labelAr:"عمليات الاستيراد", color:"#2563eb",
      fetch:()=>new Promise(r=>{frappe.call({method:"frappe.client.get_count",args:{doctype:"Data Import"},async:true,callback:d=>r(d?.message||0),error:()=>r(0)});})},
    { id:"open-todo", icon:"✅", labelEn:"Open To Do", labelAr:"مهام مفتوحة", color:"#16a34a",
      fetch:()=>new Promise(r=>{frappe.call({method:"frappe.client.get_count",args:{doctype:"ToDo",filters:{status:"Open"}},async:true,callback:d=>r(d?.message||0),error:()=>r(0)});})},
    { id:"files", icon:"📁", labelEn:"Files", labelAr:"الملفات", color:"#7c3aed",
      fetch:()=>new Promise(r=>{frappe.call({method:"frappe.client.get_count",args:{doctype:"File",filters:{is_folder:0}},async:true,callback:d=>r(d?.message||0),error:()=>r(0)});})},
    { id:"notifications", icon:"🔔", labelEn:"Active Notifications", labelAr:"إشعارات نشطة", color:"#ea580c",
      fetch:()=>new Promise(r=>{frappe.call({method:"frappe.client.get_count",args:{doctype:"Notification",filters:{enabled:1}},async:true,callback:d=>r(d?.message||0),error:()=>r(0)});})},
    { id:"auto-repeat", icon:"🔄", labelEn:"Active Auto Repeat", labelAr:"تكرار تلقائي نشط", color:"#0891b2",
      fetch:()=>new Promise(r=>{frappe.call({method:"frappe.client.get_count",args:{doctype:"Auto Repeat",filters:{disabled:0}},async:true,callback:d=>r(d?.message||0),error:()=>r(0)});})},
    { id:"newsletters", icon:"📰", labelEn:"Newsletters", labelAr:"النشرات البريدية", color:"#be185d",
      fetch:()=>new Promise(r=>{frappe.call({method:"frappe.client.get_count",args:{doctype:"Newsletter"},async:true,callback:d=>r(d?.message||0),error:()=>r(0)});})}
  ];

  /* ═══════════════════════════════════════════════════
     ② الاختصارات السريعة (4 اختصارات)
  ═══════════════════════════════════════════════════ */
  const quickActionButtons = [
    { doctype:"Data Import", icon:"📥", labelEn:"Import Data", labelAr:"استيراد بيانات", color:"#2563eb" },
    { doctype:"ToDo", icon:"✅", labelEn:"To Do", labelAr:"المهام", color:"#16a34a" },
    { doctype:"File", icon:"📁", labelEn:"Files", labelAr:"الملفات", color:"#7c3aed" },
    { doctype:"Assignment Rule", icon:"⚡", labelEn:"Assignment Rule", labelAr:"قاعدة تعيين", color:"#ea580c" }
  ];

  /* ═══════════════════════════════════════════════════
     ③ التذييل
  ═══════════════════════════════════════════════════ */
  const footerInfo = { phone: (window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.phone) || "0115110455", email: (window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.email) || "sales@mubtkir.com", website: (window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.website) || "www.mubtkir.com", labels:{ phoneEn:"Phone", phoneAr:"الهاتف الموحد", emailEn:"Email", emailAr:"البريد الإلكتروني", websiteEn:"Website", websiteAr:"الموقع" }};

  /* ═══════════════════════════════════════════════════
     ④ الأقسام والبطاقات
  ═══════════════════════════════════════════════════ */
  const sections = [["Documents",[
    ["Data","💾",["Import Data","Export Data","Bulk Update","Download Backups","Deleted Documents"]],
    ["Tools","🛠️",["To Do","Calendar","Note","Files"]],
    ["Alerts and Notifications","🔔",["Notification","Auto Email Report","Notification Settings"]],
    ["Email","📧",["Email Account","Email Domain","Email Template"]],
    ["Printing","🖨️",["Print Format Builder","Print Format Builder (New)","Print Settings","Print Heading"]],
    ["Automation","⚡",["Assignment Rule","Milestone","Auto Repeat"]],
    ["Newsletter","📰",["Newsletter","Email Group"]]
  ]]];

  /* ═══════════════════════════════════════════════════
     ⑤ الترجمة العربية
  ═══════════════════════════════════════════════════ */
  const arabicFallback = {
    "Documents":"المستندات",
    "Data":"البيانات","Tools":"الأدوات","Alerts and Notifications":"التنبيهات والإشعارات","Email":"البريد الإلكتروني","Printing":"الطباعة","Automation":"الأتمتة","Newsletter":"النشرة البريدية",
    "Import Data":"استيراد البيانات","Export Data":"تصدير البيانات","Bulk Update":"تحديث جماعي","Download Backups":"تحميل النسخ الاحتياطية","Deleted Documents":"المستندات المحذوفة",
    "To Do":"المهام","Calendar":"التقويم","Note":"الملاحظات","Files":"الملفات",
    "Notification":"الإشعار","Auto Email Report":"تقرير بريد تلقائي","Notification Settings":"إعدادات الإشعارات",
    "Email Account":"حساب البريد","Email Domain":"نطاق البريد","Email Template":"قالب البريد",
    "Print Format Builder":"منشئ تنسيق الطباعة","Print Format Builder (New)":"منشئ تنسيق الطباعة (جديد)","Print Settings":"إعدادات الطباعة","Print Heading":"عنوان الطباعة",
    "Assignment Rule":"قاعدة التعيين","Milestone":"المعلم الرئيسي","Auto Repeat":"التكرار التلقائي",
    "Email Group":"مجموعة البريد"
  };

  /* ═══════════════════════════════════════════════════
     ⑥ المستندات الفردية والصفحات الخاصة
  ═══════════════════════════════════════════════════ */
  const singleDocs = new Set(["Notification Settings","Print Settings"]);
  const specialPages = {
    "Import Data":"/app/data-import",
    "Export Data":"/app/data-export",
    "Bulk Update":"/app/bulk-update",
    "Download Backups":"/app/backups",
    "Calendar":"/app/calendar",
    "Print Format Builder":"/app/print-format-builder",
    "Print Format Builder (New)":"/app/print-format-builder-beta"
  };
  const reportNames = new Set([]);

  /* ═══════════════════════════════════════════════════
     ⑦ التوضيحات مع الخطوات لجميع العناصر
  ═══════════════════════════════════════════════════ */
  const itemDescriptions = {

    /* ── البيانات ── */
    "Import Data":{ icon:"📥",
      summaryAr:"استيراد بيانات من ملفات CSV أو Excel إلى أي DocType في النظام دفعة واحدة مع خيار التحديث أو الإدراج.",
      summaryEn:"Import data from CSV or Excel files into any DocType in bulk with insert or update options.",
      stepsAr:["اذهب إلى «استيراد البيانات»","اختر نوع المستند المراد الاستيراد إليه (مثل: Customer)","اضغط «تحميل القالب» لتحميل ملف Excel فارغ بالأعمدة الصحيحة","عبّئ البيانات في الملف المحمّل","ارفع الملف المعبأ","اختر نوع الاستيراد: إدراج جديد أو تحديث موجود","اضغط «بدء الاستيراد»","تابع تقدم الاستيراد وراجع الأخطاء إن وجدت"],
      stepsEn:["Go to «Import Data»","Select target DocType (e.g., Customer)","Click «Download Template» to get blank Excel with correct columns","Fill data in downloaded template","Upload the filled file","Select import type: Insert New or Update Existing","Click «Start Import»","Track progress and review errors if any"]},

    "Export Data":{ icon:"📤",
      summaryAr:"تصدير بيانات أي DocType إلى ملف CSV أو Excel مع إمكانية اختيار الحقول والفلاتر.",
      summaryEn:"Export data from any DocType to CSV or Excel with field and filter selection.",
      stepsAr:["اذهب إلى «تصدير البيانات»","اختر نوع المستند المراد تصديره","حدد الحقول المطلوبة بتحديد أو إلغاء تحديد الأعمدة","أضف فلاتر لتصدير بيانات محددة فقط","اختر تنسيق الملف (CSV أو Excel)","اضغط «تصدير»","سيُحمّل الملف تلقائياً"],
      stepsEn:["Go to «Export Data»","Select DocType to export","Select required fields by checking/unchecking columns","Add filters to export specific data only","Select file format (CSV or Excel)","Click «Export»","File will download automatically"]},

    "Bulk Update":{ icon:"🔄",
      summaryAr:"تحديث حقل معين في عدة سجلات دفعة واحدة بدون فتح كل سجل على حدة.",
      summaryEn:"Update a specific field across multiple records at once without opening each one individually.",
      stepsAr:["اذهب إلى «تحديث جماعي»","اختر نوع المستند (مثل: Customer)","اختر الحقل المراد تحديثه","أدخل القيمة الجديدة","أضف شرط الفلترة لتحديد السجلات المستهدفة","اضغط «تحديث»","ستُحدّث جميع السجلات المطابقة دفعة واحدة"],
      stepsEn:["Go to «Bulk Update»","Select DocType (e.g., Customer)","Select field to update","Enter new value","Add filter condition to target specific records","Click «Update»","All matching records will be updated at once"]},

    "Download Backups":{ icon:"💿",
      summaryAr:"تحميل نسخ احتياطية من قاعدة البيانات والملفات المرفقة لحفظها خارج النظام.",
      summaryEn:"Download database and file backups to save them externally.",
      stepsAr:["اذهب إلى «تحميل النسخ الاحتياطية»","ستظهر قائمة بالنسخ الاحتياطية المتاحة مع التاريخ","اضغط على رابط التحميل لقاعدة البيانات","اضغط على رابط تحميل الملفات (العامة والخاصة)","احفظ الملفات في مكان آمن خارج الخادم","يمكنك إعداد نسخ احتياطية تلقائية من إعدادات النظام"],
      stepsEn:["Go to «Download Backups»","List of available backups with dates will show","Click download link for database","Click download link for files (public and private)","Save files in a secure location outside the server","Can set up automatic backups from System Settings"]},

    "Deleted Documents":{ icon:"🗑️",
      summaryAr:"عرض واستعادة المستندات المحذوفة قبل حذفها نهائياً من النظام.",
      summaryEn:"View and restore deleted documents before they are permanently removed from the system.",
      stepsAr:["اذهب إلى «المستندات المحذوفة»","ستظهر قائمة بجميع المستندات المحذوفة","فلتر حسب نوع المستند أو التاريخ أو المستخدم","اضغط على أي سجل لعرض تفاصيله","اضغط «استعادة» لإرجاع المستند","أو اضغط «حذف نهائي» لإزالته بشكل دائم"],
      stepsEn:["Go to «Deleted Documents»","List of all deleted documents will show","Filter by DocType, date, or user","Click any record to view details","Click «Restore» to bring back the document","Or click «Delete Permanently» to remove it forever"]},

    /* ── الأدوات ── */
    "To Do":{ icon:"✅",
      summaryAr:"قائمة المهام الشخصية: إنشاء وتتبع المهام مع الأولوية والتاريخ والحالة وربطها بأي مستند.",
      summaryEn:"Personal task list: create and track tasks with priority, date, status, and link to any document.",
      stepsAr:["اضغط «مهمة جديدة»","أدخل وصف المهمة","حدد الأولوية (عالية، متوسطة، منخفضة)","حدد تاريخ الاستحقاق","عيّن المسؤول عن المهمة","اربطها بمستند إن أردت (مثل: فاتورة، أمر شراء)","اضغط «حفظ»","حدّث الحالة (مفتوحة، مكتملة، ملغاة) عند الإنجاز"],
      stepsEn:["Click «New ToDo»","Enter task description","Set priority (High, Medium, Low)","Set due date","Assign responsible person","Link to a document if needed (e.g., Invoice, PO)","Click «Save»","Update status (Open, Closed, Cancelled) on completion"]},

    "Calendar":{ icon:"📅",
      summaryAr:"عرض تقويمي للأحداث والمهام والمواعيد مع إمكانية إنشاء أحداث جديدة بالسحب والنقر.",
      summaryEn:"Calendar view of events, tasks, and appointments with drag-and-click event creation.",
      stepsAr:["اذهب إلى «التقويم»","سيظهر عرض شهري/أسبوعي/يومي للأحداث","لإنشاء حدث: اضغط على التاريخ والوقت المطلوب","أدخل عنوان الحدث والوصف","حدد البداية والنهاية","أضف المشاركين إن أردت","فعّل «يوم كامل» إذا كان الحدث طوال اليوم","اضغط «حفظ»"],
      stepsEn:["Go to «Calendar»","Monthly/Weekly/Daily event view will display","To create event: click on desired date and time","Enter event title and description","Set start and end time","Add participants if needed","Enable «All Day» for full-day events","Click «Save»"]},

    "Note":{ icon:"📝",
      summaryAr:"ملاحظات نصية شخصية أو مشتركة لتسجيل الأفكار والتعليمات والمرجعيات السريعة.",
      summaryEn:"Personal or shared text notes for recording ideas, instructions, and quick references.",
      stepsAr:["اضغط «ملاحظة جديدة»","أدخل عنوان الملاحظة","اكتب المحتوى في المحرر النصي","يمكنك استخدام Markdown للتنسيق","فعّل «عامة» لمشاركتها مع الجميع أو اتركها خاصة","اضغط «حفظ»"],
      stepsEn:["Click «New Note»","Enter note title","Write content in text editor","Markdown formatting is supported","Enable «Public» to share with everyone or keep private","Click «Save»"]},

    "Files":{ icon:"📁",
      summaryAr:"مدير الملفات: عرض وتنظيم جميع الملفات المرفوعة في النظام مع المجلدات والبحث.",
      summaryEn:"File manager: view and organize all uploaded files in the system with folders and search.",
      stepsAr:["اذهب إلى «الملفات»","ستظهر قائمة بجميع الملفات والمجلدات","لرفع ملف: اضغط «ملف جديد» أو اسحب الملف وأفلته","لإنشاء مجلد: اضغط «مجلد جديد»","استخدم البحث للعثور على ملف محدد","اضغط على أي ملف لمعاينته أو تحميله","يمكنك نقل الملفات بين المجلدات بالسحب"],
      stepsEn:["Go to «Files»","List of all files and folders will show","To upload: click «New File» or drag and drop","To create folder: click «New Folder»","Use search to find specific files","Click any file to preview or download","Can move files between folders by dragging"]},

    /* ── التنبيهات والإشعارات ── */
    "Notification":{ icon:"🔔",
      summaryAr:"إنشاء إشعارات تلقائية تُرسل عند أحداث معينة (إنشاء، تعديل، تسجيل) عبر البريد أو النظام أو Slack.",
      summaryEn:"Create auto notifications triggered by events (create, update, submit) via email, system, or Slack.",
      stepsAr:["اضغط «إشعار جديد»","أدخل اسم الإشعار","اختر القناة (بريد، نظام، Slack)","اختر نوع المستند المُشغّل (مثل: Sales Invoice)","حدد الحدث (إنشاء، تسجيل، تعديل، إلغاء، أو شرط مخصص)","أضف شروطاً إضافية إن أردت","حدد المستلمين (دور، مالك المستند، حقل بريد)","اكتب الموضوع والرسالة مع متغيرات Jinja","فعّل الإشعار واضغط «حفظ»"],
      stepsEn:["Click «New Notification»","Enter notification name","Select channel (Email, System, Slack)","Select trigger DocType (e.g., Sales Invoice)","Set event (Create, Submit, Update, Cancel, or Custom Condition)","Add additional conditions if needed","Set recipients (Role, Document Owner, Email Field)","Write subject and message with Jinja variables","Enable notification and click «Save»"]},

    "Auto Email Report":{ icon:"📊",
      summaryAr:"جدولة إرسال تقارير النظام تلقائياً بالبريد الإلكتروني في أوقات محددة (يومي، أسبوعي، شهري).",
      summaryEn:"Schedule automatic system report delivery via email at set intervals (Daily, Weekly, Monthly).",
      stepsAr:["اضغط «تقرير بريد تلقائي جديد»","اختر التقرير المراد إرساله","حدد التكرار (يومي، أسبوعي، شهري)","حدد اليوم والوقت للإرسال","أضف عناوين البريد المستلمة","اختر تنسيق التقرير (HTML أو Excel)","أضف فلاتر للتقرير إن أردت","فعّل التقرير واضغط «حفظ»"],
      stepsEn:["Click «New Auto Email Report»","Select report to send","Set frequency (Daily, Weekly, Monthly)","Set day and time for sending","Add recipient email addresses","Select report format (HTML or Excel)","Add report filters if needed","Enable and click «Save»"]},

    "Notification Settings":{ icon:"⚙️",
      summaryAr:"تفضيلات المستخدم للإشعارات: اختيار أنواع الإشعارات المطلوبة وطريقة الاستلام (بريد أو نظام).",
      summaryEn:"User notification preferences: choose which notification types to receive and delivery method (email or system).",
      stepsAr:["اذهب إلى «إعدادات الإشعارات»","ستظهر قائمة بأنواع الإشعارات المتاحة","فعّل أو عطّل كل نوع حسب رغبتك","اختر طريقة الاستلام: بريد أو إشعار نظام أو كلاهما","حدد إذا كنت تريد إشعارات فورية أو ملخص يومي","اضغط «حفظ»"],
      stepsEn:["Go to «Notification Settings»","List of available notification types will show","Enable or disable each type as preferred","Select delivery method: email, system notification, or both","Set if you want instant notifications or daily digest","Click «Save»"]},

    /* ── البريد الإلكتروني ── */
    "Email Account":{ icon:"📧",
      summaryAr:"ربط حسابات البريد الإلكتروني (SMTP/IMAP) لإرسال واستقبال البريد من داخل النظام تلقائياً.",
      summaryEn:"Connect email accounts (SMTP/IMAP) to send and receive emails from within the system automatically.",
      stepsAr:["اضغط «حساب بريد جديد»","أدخل عنوان البريد الإلكتروني","اختر نطاق البريد أو أدخل الإعدادات يدوياً","أدخل كلمة المرور أو رمز التطبيق","فعّل «إرسال» لاستخدامه في الإرسال (SMTP)","أدخل إعدادات SMTP: الخادم، المنفذ، TLS","فعّل «استقبال» لسحب البريد الوارد (IMAP)","أدخل إعدادات IMAP: الخادم، المنفذ","اضغط «حفظ» ثم «اختبار الاتصال»"],
      stepsEn:["Click «New Email Account»","Enter email address","Select email domain or enter settings manually","Enter password or app password","Enable «Outgoing» to use for sending (SMTP)","Enter SMTP settings: server, port, TLS","Enable «Incoming» to pull incoming mail (IMAP)","Enter IMAP settings: server, port","Click «Save» then «Test Connection»"]},

    "Email Domain":{ icon:"🌐",
      summaryAr:"تعريف نطاقات البريد مع إعدادات الخادم الافتراضية لتسهيل إنشاء حسابات على نفس النطاق.",
      summaryEn:"Define email domains with default server settings to simplify creating accounts on the same domain.",
      stepsAr:["اضغط «نطاق بريد جديد»","أدخل اسم النطاق (مثل: mubtkir.com)","أدخل إعدادات SMTP الافتراضية (الخادم، المنفذ، TLS)","أدخل إعدادات IMAP الافتراضية","اضغط «حفظ»","عند إنشاء حساب بريد جديد على هذا النطاق ستُعبأ الإعدادات تلقائياً"],
      stepsEn:["Click «New Email Domain»","Enter domain name (e.g., mubtkir.com)","Enter default SMTP settings (server, port, TLS)","Enter default IMAP settings","Click «Save»","When creating new email account on this domain, settings auto-fill"]},

    "Email Template":{ icon:"📝",
      summaryAr:"قوالب بريد إلكتروني جاهزة مع متغيرات Jinja لإعادة استخدامها في الإشعارات والمراسلات.",
      summaryEn:"Ready-made email templates with Jinja variables for reuse in notifications and correspondence.",
      stepsAr:["اضغط «قالب بريد جديد»","أدخل اسم القالب","اختر نوع المستند المرتبط (اختياري)","اكتب الموضوع مع متغيرات إن أردت (مثل: {{ doc.name }})","اكتب محتوى الرسالة بتنسيق HTML","استخدم متغيرات Jinja لإدراج بيانات ديناميكية","اضغط «حفظ»","استخدمه في الإشعارات أو عند إرسال بريد من أي مستند"],
      stepsEn:["Click «New Email Template»","Enter template name","Select linked DocType (optional)","Write subject with variables if needed (e.g., {{ doc.name }})","Write message content in HTML format","Use Jinja variables for dynamic data insertion","Click «Save»","Use it in Notifications or when sending email from any document"]},

    /* ── الطباعة ── */
    "Print Format Builder":{ icon:"🔨",
      summaryAr:"أداة بصرية (سحب وإفلات) لتصميم تنسيقات طباعة مخصصة بدون كتابة أكواد HTML.",
      summaryEn:"Visual drag-and-drop tool to design custom print formats without writing HTML code.",
      stepsAr:["اذهب إلى «منشئ تنسيق الطباعة»","اختر نوع المستند (مثل: Sales Invoice)","أو افتح تنسيق طباعة موجود للتعديل","اسحب الحقول من الشريط الجانبي وأفلتها في التصميم","رتّب الحقول والأقسام كما تريد","أضف جداول وصور وعناوين","عاين التنسيق بالضغط على «معاينة»","اضغط «حفظ»"],
      stepsEn:["Go to «Print Format Builder»","Select DocType (e.g., Sales Invoice)","Or open existing print format to edit","Drag fields from sidebar and drop into design","Arrange fields and sections as needed","Add tables, images, and headings","Preview by clicking «Preview»","Click «Save»"]},

    "Print Format Builder (New)":{ icon:"🆕",
      summaryAr:"النسخة الجديدة (Beta) من منشئ تنسيق الطباعة بواجهة محسّنة وميزات إضافية.",
      summaryEn:"New (Beta) version of the Print Format Builder with improved interface and additional features.",
      stepsAr:["اذهب إلى «منشئ تنسيق الطباعة (جديد)»","اختر نوع المستند أو افتح تنسيقاً موجوداً","استخدم الواجهة المحسّنة لتصميم التنسيق","أضف الحقول والجداول بالسحب والإفلات","خصّص الألوان والخطوط والتخطيط","عاين النتيجة مباشرة","اضغط «حفظ»"],
      stepsEn:["Go to «Print Format Builder (New)»","Select DocType or open existing format","Use improved interface to design layout","Add fields and tables with drag and drop","Customize colors, fonts, and layout","Preview result in real-time","Click «Save»"]},

    "Print Settings":{ icon:"🖨️",
      summaryAr:"الإعدادات العامة للطباعة: الترويسة الافتراضية، حجم الورق، واتجاه الطباعة لجميع المستندات.",
      summaryEn:"General print settings: default letterhead, paper size, and print orientation for all documents.",
      stepsAr:["اذهب إلى «إعدادات الطباعة»","اختر تنسيق الطباعة الافتراضي","حدد حجم الورق (A4، Letter، إلخ)","اختر الترويسة الافتراضية","فعّل/عطّل طباعة الخلفية","حدد هامش الطباعة","اضغط «حفظ»"],
      stepsEn:["Go to «Print Settings»","Select default print format","Set paper size (A4, Letter, etc.)","Select default letterhead","Enable/disable print background","Set print margins","Click «Save»"]},

    "Print Heading":{ icon:"📑",
      summaryAr:"إنشاء عناوين طباعة مخصصة (مثل: عرض سعر، فاتورة أولية) لاستبدال العنوان الافتراضي للمستند.",
      summaryEn:"Create custom print headings (e.g., Proforma Invoice, Credit Note) to replace document default title.",
      stepsAr:["اضغط «عنوان طباعة جديد»","أدخل العنوان المخصص (مثل: فاتورة أولية)","أضف وصفاً أو ترجمة إن أردت","اضغط «حفظ»","عند طباعة أي مستند: اختر عنوان الطباعة من حقل «عنوان الطباعة»","سيظهر العنوان المخصص بدلاً من الاسم الافتراضي"],
      stepsEn:["Click «New Print Heading»","Enter custom heading (e.g., Proforma Invoice)","Add description or translation if needed","Click «Save»","When printing any document: select from «Print Heading» field","Custom heading will display instead of default name"]},

    /* ── الأتمتة ── */
    "Assignment Rule":{ icon:"⚡",
      summaryAr:"قواعد تعيين تلقائي للمستندات: توزيع المهام على المستخدمين بناءً على شروط (مثل: round-robin أو حسب الحمل).",
      summaryEn:"Auto-assignment rules for documents: distribute tasks to users based on conditions (e.g., round-robin or load-based).",
      stepsAr:["اضغط «قاعدة تعيين جديدة»","أدخل اسم القاعدة","اختر نوع المستند (مثل: Issue, Lead)","اختر طريقة التعيين (Round Robin، Load Balancing، حسب الحقل)","أضف المستخدمين المراد التوزيع عليهم","أضف شروط التشغيل (مثل: الأولوية = عالية)","حدد الوصف التلقائي للمهمة المُعيّنة","فعّل القاعدة واضغط «حفظ»"],
      stepsEn:["Click «New Assignment Rule»","Enter rule name","Select DocType (e.g., Issue, Lead)","Select assignment method (Round Robin, Load Balancing, Field-based)","Add users to distribute to","Add trigger conditions (e.g., Priority = High)","Set auto description for assigned task","Enable rule and click «Save»"]},

    "Milestone":{ icon:"🏁",
      summaryAr:"تعريف معالم رئيسية تُتتبّع تلقائياً عند تغيّر حقل معين في المستند (مثل: تغيّر الحالة).",
      summaryEn:"Define milestones auto-tracked when a specific field changes in a document (e.g., status change).",
      stepsAr:["اضغط «معلم رئيسي جديد»","اختر نوع المستند (مثل: Project, Task)","حدد حقل التتبع (مثل: status)","أدخل القيمة المطلوبة (مثل: Completed)","اضغط «حفظ»","سيُسجّل تلقائياً عند وصول المستند لهذه القيمة"],
      stepsEn:["Click «New Milestone»","Select DocType (e.g., Project, Task)","Set tracking field (e.g., status)","Enter target value (e.g., Completed)","Click «Save»","Will auto-record when document reaches this value"]},

    "Auto Repeat":{ icon:"🔄",
      summaryAr:"جدولة إنشاء مستندات تلقائياً بشكل دوري (مثل: فاتورة شهرية، أمر شراء أسبوعي) من مستند مرجعي.",
      summaryEn:"Schedule automatic document creation periodically (e.g., monthly invoice, weekly PO) from a reference document.",
      stepsAr:["اضغط «تكرار تلقائي جديد»","اختر نوع المستند المرجعي (مثل: Sales Invoice)","اختر المستند المرجعي المحدد","حدد التكرار (يومي، أسبوعي، شهري، سنوي)","حدد تاريخ البداية وتاريخ النهاية","حدد إذا كان يُعتمد تلقائياً بعد الإنشاء","فعّل الإشعار للتنبيه عند كل إنشاء","اضغط «حفظ»"],
      stepsEn:["Click «New Auto Repeat»","Select reference DocType (e.g., Sales Invoice)","Select specific reference document","Set frequency (Daily, Weekly, Monthly, Yearly)","Set start date and end date","Set if auto-submitted after creation","Enable notification for alerts on each creation","Click «Save»"]},

    /* ── النشرة البريدية ── */
    "Newsletter":{ icon:"📰",
      summaryAr:"إنشاء وإرسال نشرات بريدية لمجموعة من المشتركين مع تصميم HTML وتتبع الفتح والنقر.",
      summaryEn:"Create and send email newsletters to subscriber groups with HTML design and open/click tracking.",
      stepsAr:["اضغط «نشرة بريدية جديدة»","أدخل الموضوع","اختر مجموعة البريد (قائمة المشتركين)","اكتب محتوى النشرة في المحرر","يمكنك استخدام HTML للتصميم المتقدم","عاين النشرة بالضغط على «معاينة»","اضغط «حفظ» ثم «إرسال»","تابع إحصائيات الفتح والنقر بعد الإرسال"],
      stepsEn:["Click «New Newsletter»","Enter subject","Select email group (subscriber list)","Write newsletter content in editor","Can use HTML for advanced design","Preview by clicking «Preview»","Click «Save» then «Send»","Track open and click statistics after sending"]},

    "Email Group":{ icon:"👥",
      summaryAr:"إنشاء مجموعات بريدية (قوائم مشتركين) لاستخدامها في إرسال النشرات البريدية الجماعية.",
      summaryEn:"Create email groups (subscriber lists) for use in sending bulk newsletters.",
      stepsAr:["اضغط «مجموعة بريد جديدة»","أدخل اسم المجموعة (مثل: عملاء VIP)","اضغط «حفظ»","لإضافة أعضاء: اضغط «إضافة مشتركين»","أدخل عناوين البريد يدوياً أو استوردها من ملف","يمكنك إضافة مشتركين من قائمة العملاء/الموردين","استخدم المجموعة عند إنشاء نشرة بريدية"],
      stepsEn:["Click «New Email Group»","Enter group name (e.g., VIP Customers)","Click «Save»","To add members: click «Add Subscribers»","Enter emails manually or import from file","Can add subscribers from Customer/Supplier list","Use the group when creating a Newsletter"]}
  };

  /* ═══════════════════════════════════════════════════
     دوال مساعدة
  ═══════════════════════════════════════════════════ */
  function translate(n){if(!isArabic)return n;return arabicFallback[n]||(typeof window.__==="function"?window.__(n):n);}
  function escapeHtml(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}
  function formatNumber(n){return(parseFloat(n)||0).toLocaleString("en-US");}

  /* ═══════════════════════════════════════════════════
     نافذة التوضيح المنبثقة
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
  ═══════════════════════════════════════════════════ */
  function renderQuickActions(){
    if(!quickActions)return;
    quickActions.innerHTML=`<h2 class="erp-section-title">${escapeHtml(isArabic?"اختصارات سريعة":"Quick Actions")}</h2>
    <div class="erp-quick-grid">${quickActionButtons.map(b=>
      `<button type="button" class="erp-quick-btn" data-new-doc="${escapeHtml(b.doctype)}" style="--btn-color:${b.color}">
        <span class="erp-quick-icon">${b.icon}</span>
        <span class="erp-quick-label">${escapeHtml(isArabic?b.labelAr:b.labelEn)}</span>
      </button>`).join("")}</div>`;
    quickActions.addEventListener("click",e=>{
      const b=e.target.closest("[data-new-doc]");
      if(!b||!window.frappe)return;
      if(specialPages[b.dataset.newDoc]){frappe.set_route(specialPages[b.dataset.newDoc]);return;}
      frappe.set_route("List",b.dataset.newDoc);
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
          const showDetails = hasDetailsButton(c[0], i);
          const dl=isArabic?"تفاصيل":"Details";
          const ib = showDetails ?`<button type="button" class="erp-info-link" data-info-item="${escapeHtml(i)}">${dl}</button>`:"";
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
    const l=footerInfo.labels,p=isArabic?l.phoneAr:l.phoneEn,e=isArabic?l.emailAr:l.emailEn,w=isArabic?l.websiteAr:l.websiteEn;
    footerEl.innerHTML=`<div class="erp-footer-inner">
      <div class="erp-footer-item"><span class="erp-footer-icon">📞</span><span class="erp-footer-label">${escapeHtml(p)}:</span><a href="tel:${footerInfo.phone}" class="erp-footer-link" dir="ltr">${escapeHtml(footerInfo.phone)}</a></div>
      <span class="erp-footer-sep">|</span>
      <div class="erp-footer-item"><span class="erp-footer-icon">✉️</span><span class="erp-footer-label">${escapeHtml(e)}:</span><a href="mailto:${footerInfo.email}" class="erp-footer-link">${escapeHtml(footerInfo.email)}</a></div>
      <span class="erp-footer-sep">|</span>
      <div class="erp-footer-item"><span class="erp-footer-icon">🌐</span><span class="erp-footer-label">${escapeHtml(w)}:</span><a href="https://${footerInfo.website}" class="erp-footer-link" target="_blank" rel="noopener">${escapeHtml(footerInfo.website)}</a></div>
    </div>`;
  }

  /* ═══════════════════════════════════════════════════
     التوجيه
  ═══════════════════════════════════════════════════ */
  function openRoute(n){
    if(!window.frappe||typeof frappe.set_route!=="function")return;
    if(specialPages[n]){frappe.set_route(specialPages[n]);return;}
    if(singleDocs.has(n)){frappe.set_route("Form",n);return;}
    frappe.set_route("List",n);
  }

  /* ═══════════════════════════════════════════════════
     تفويض الأحداث
  ═══════════════════════════════════════════════════ */
  let lastToggleTime=0;
  content.addEventListener("click",event=>{
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
    const rb=event.target.closest("[data-route-name]");
    if(rb){event.preventDefault();event.stopPropagation();openRoute(rb.dataset.routeName);return;}
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
  renderStats();renderQuickActions();renderSections();renderFooter();
})();
