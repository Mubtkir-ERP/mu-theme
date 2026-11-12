import frappe
from frappe.desk.desktop import get_desktop_page
from frappe.desk.desktop import get_workspace_sidebar_items
import json

DEFAULT_WORKSPACE_ICONS = {
	"Home": "layout-grid",
	"Selling": "shopping-bag",
	"Stock": "package",
	"Buying": "shopping-cart",
	"Accounting": "wallet",
	"Payables": "arrow-left",
	"Receivables": "arrow-right",
	"Financial Reports": "file-text",
	"Accounting Reports": "file-text",
	"Assets": "building",
	"Manufacturing": "cog",
	"Quality": "shield-check",
	"Projects": "folder",
	"CRM": "pie-chart",
	"Support": "headphones",
	"HR": "user-check",
	"Leaves": "calendar-off",
	"Payroll": "banknote",
	"Salary Payout": "banknote",
	"Expense Claims": "receipt",
	"Recruitment": "users",
	"Performance": "pie-chart",
	"Employee Lifecycle": "users",
	"Shift & Attendance": "calendar-days",
	"Shift _ Attendance": "calendar-days",
	"Website": "globe",
	"Tools": "wrench",
	"Users": "users",
	"ERPNext Settings": "settings",
	"Settings": "settings",
	"ERPNext Integrations": "plug",
	"Integrations": "plug",
	"Build": "wrench",
	"ZATCA": "receipt",
	"Whatsapp": "message-circle",
	"Gas Operations": "flame",
	"Container Rental System": "truck",
	"Car Care": "car",
	"Party Bookings": "calendar-days",
	"Bank Reconciliation": "landmark",
	"Tax & Benefits": "calculator",
	"POSNext": "receipt",
	"Gold Management": "gem",
	"Healthcare": "heart-pulse",
	"Voucher Entries": "banknote",
	"Voucher Management": "banknote",
}

ARABIC_WORKSPACE_ICONS = {
	"الصفحة الرئيسية": "layout-grid",
	"الرئيسية": "layout-grid",
	"المبيعات": "shopping-bag",
	"المخزون": "package",
	"المشتريات": "shopping-cart",
	"الحسابات": "wallet",
	"الأصول": "building",
	"المستخدمين": "users",
	"المستخدمون": "users",
	"التصنيع": "cog",
	"الجودة": "shield-check",
	"المشاريع": "folder",
	"إدارة علاقات العملاء": "pie-chart",
	"الدعم": "headphones",
	"الدعم الفني": "headphones",
	"الموارد البشرية": "user-check",
	"الإجازات": "calendar-off",
	"الرواتب": "banknote",
	"مسير الرواتب": "banknote",
	"صرف الرواتب": "banknote",
	"مطالبات المصاريف": "receipt",
	"التوظيف": "users",
	"الأداء": "pie-chart",
	"دورة حياة الموظف": "users",
	"الورديات والحضور": "calendar-days",
	"الوردية والحضور": "calendar-days",
	"الحضور والغياب": "calendar-days",
	"الموقع": "globe",
	"الموقع الإلكتروني": "globe",
	"الأدوات": "wrench",
	"الإعدادات": "settings",
	"إعدادات ERPNext": "settings",
	"التكامل": "plug",
	"التكاملات": "plug",
	"التقارير المالية": "file-text",
	"تقارير المحاسبة": "file-text",
	"الذمم الدائنة": "arrow-left",
	"الذمم المدينة": "arrow-right",
	"الضرائب والمزايا": "calculator",
	"مطابقة البنك": "landmark",
	"التسوية البنكية": "landmark",
	"عمليات الغاز": "flame",
	"إدارة عمليات الغاز": "flame",
	"نظام تأجير الحاويات": "truck",
	"تأجير الحاويات": "truck",
	"حماية السيارات": "car",
	"العناية بالسيارات": "car",
	"حجوزات الحفلات": "calendar-days",
	"نقاط البيع": "receipt",
	"نقطة البيع": "receipt",
	"واتساب": "message-circle",
	"الواتس": "message-circle",
	"الواتساب": "message-circle",
	"الذهب": "gem",
	"إدارة الذهب": "gem",
	"الرعاية الصحية": "heart-pulse",
	"الصحة": "heart-pulse",
	"سندات القبض والصرف": "banknote",
	"إدارة السندات": "banknote",
	"السندات": "banknote",
	"سندات": "banknote",
	"تطبيق السندات": "banknote",
}

ICON_MAP = {
	"fal fa-donate": "banknote",
	"fa-donate": "banknote",
	"home": "layout-grid",
	"selling": "shopping-bag",
	"bags-shopping": "shopping-bag",
	"stock": "package",
	"boxes": "package",
	"buying": "shopping-cart",
	"cart": "shopping-cart",
	"shopping-cart": "shopping-cart",
	"accounting": "wallet",
	"calculator": "wallet",
	"assets": "building",
	"users": "users",
	"manufacturing": "cog",
	"quality": "shield-check",
	"project": "folder",
	"crm": "pie-chart",
	"support": "headphones",
	"hr": "user-check",
	"leave": "calendar-off",
	"payroll": "banknote",
	"website": "globe",
	"tool": "wrench",
	"setting-gear": "settings",
	"settings": "settings",
	"integration": "plug",
	"small-file": "file-text",
	"file": "file-text",
	"point-of-sale": "receipt",
	"chat": "message-circle",
	"heart": "heart-pulse",
	"calendar": "calendar-days",
}

def resolve_page_icon(page_dict, overrides=None):
	"""معالجة وتحديد أيقونة مساحة العمل لضمان ظهورها بشكل موحد وعالي الدقة عبر Lucide"""
	name = page_dict.get("name") or ""
	title = page_dict.get("title") or ""
	label = page_dict.get("label") or ""

	# البحث عن تخصيص من جدول Theme Workspace Mapping بالاسم أو العنوان أو التسمية
	override = {}
	if overrides:
		override = (
			overrides.get(name)
			or overrides.get(title)
			or overrides.get(label)
			or {}
		)

	# أخذ الأيقونة من إعدادات الثيم إذا تم تخصيصها، وإلا من مساحة العمل
	if override.get("icon"):
		icon = override.get("icon").strip()
	else:
		icon = (page_dict.get("icon") or "").strip()

	# فحص ما إذا كانت الأيقونة قديمة أو Font Awesome أو فارغة أو غير متوافقة
	is_legacy = (
		not icon
		or icon.startswith("fa")
		or " " in icon
		or icon in (
			"home", "selling", "stock", "buying", "accounting", "small-file", "file",
			"folder", "assets", "users", "tools", "settings"
		)
	)

	if is_legacy:
		# استخراج الأيقونة الرسمية من قواميس Lucide بالاسم أو العنوان
		icon = (
			DEFAULT_WORKSPACE_ICONS.get(name)
			or ARABIC_WORKSPACE_ICONS.get(title)
			or ARABIC_WORKSPACE_ICONS.get(name)
			or DEFAULT_WORKSPACE_ICONS.get(title)
			or ARABIC_WORKSPACE_ICONS.get(label)
			or DEFAULT_WORKSPACE_ICONS.get(label)
		)
		if not icon and page_dict.get("icon"):
			raw = page_dict.get("icon").strip().split()[-1].replace("fa-", "")
			icon = ICON_MAP.get(page_dict.get("icon").strip()) or ICON_MAP.get(raw)

		if not icon:
			icon = "layout-grid"
	else:
		# تحويل أي أسماء شائعة باقية
		if "bags-shopping" in icon:
			icon = "shopping-bag"
		elif "calculator" in icon:
			icon = "wallet"
		elif "shopping-cart" in icon or "cart" in icon:
			icon = "shopping-cart"
		elif "boxes" in icon:
			icon = "package"
		elif icon in ICON_MAP:
			icon = ICON_MAP[icon]

	page_dict["icon"] = icon
	page_dict["icon_type"] = "lucide"


@frappe.whitelist()
def get_desktop_pages():
	pages_data = get_workspace_sidebar_items()
	pages = pages_data.get("pages") or []
	original_pages = pages
	pages = [d for d in pages if not d.get("parent_page")]

	# جلب التخصيصات من جدول Theme Workspace Mapping إن وُجدت
	mapping_overrides = {}
	try:
		if frappe.db.exists("DocType", "Theme Workspace Mapping"):
			mappings = frappe.get_all(
				"Theme Workspace Mapping",
				filters={"parent": "Theme Settings", "enabled": 1},
				fields=["workspace", "icon"],
			)
			for m in mappings:
				ws = m.get("workspace")
				if not ws:
					continue
				mapping_overrides[ws] = m
				# تسجيل الاسم الإنجليزي والعنوان العربي لضمان مطابقة الـ override في كل الحالات
				from nxt_theme.nxt_theme.doctype.theme_settings.theme_settings import get_actual_workspace_name
				english_ws = get_actual_workspace_name(ws)
				if english_ws:
					mapping_overrides[english_ws] = m
					try:
						ws_info = frappe.db.get_value("Workspace", english_ws, ["title", "label"], as_dict=True)
						if ws_info:
							if ws_info.get("title"):
								mapping_overrides[ws_info["title"]] = m
							if ws_info.get("label"):
								mapping_overrides[ws_info["label"]] = m
					except Exception:
						pass
	except Exception:
		mapping_overrides = {}

	for row in pages:
		resolve_page_icon(row, mapping_overrides)
		row_json = json.dumps(row)
		desktop_page = get_desktop_page(row_json)
		row["cards"] = desktop_page.get("cards")
		child_workspaces = [d for d in original_pages if d.get("parent_page") == row.get("name")]
		for child in child_workspaces:
			resolve_page_icon(child, mapping_overrides)
		row["child_workspace"] = child_workspaces

	return pages
