import frappe
from frappe.desk.desktop import get_desktop_page
from frappe.desk.desktop import get_workspace_sidebar_items
import json

DEFAULT_WORKSPACE_ICONS = {
	"Home": "home",
	"Accounting": "accounting",
	"Payables": "arrow-left",
	"Receivables": "arrow-right",
	"Financial Reports": "small-file",
	"Buying": "buying",
	"Selling": "selling",
	"Stock": "stock",
	"Assets": "assets",
	"Manufacturing": "manufacturing",
	"Quality": "quality",
	"Projects": "project",
	"CRM": "crm",
	"Support": "support",
	"HR": "hr",
	"Leaves": "leave",
	"Payroll": "payroll",
	"Recruitment": "users",
	"Performance": "chart",
	"Employee Lifecycle": "users",
	"Shift & Attendance": "calendar",
	"Shift _ Attendance": "calendar",
	"Website": "website",
	"Tools": "tool",
	"Users": "users",
	"ERPNext Settings": "setting-gear",
	"Settings": "setting-gear",
	"ERPNext Integrations": "integration",
	"Integrations": "integration",
	"Build": "tool",
	"ZATCA": "integration",
	"Whatsapp": "chat",
	"Gas Operations": "tool",
	"Container Rental System": "stock",
	"Car Care": "tool",
	"Party Bookings": "calendar",
	"Bank Reconciliation": "accounting",
	"POSNext": "point-of-sale",
	"Gold Management": "assets",
	"Healthcare": "heart",
}

FRAPPE_SVG_ICONS = {
	"home", "accounting", "buying", "selling", "stock", "assets", "users",
	"manufacturing", "quality", "project", "folder", "crm", "support",
	"website", "tool", "setting-gear", "settings", "integration", "small-file",
	"arrow-left", "arrow-right", "point-of-sale", "leave", "payroll",
	"chart", "calendar", "chat", "heart", "lock", "shield", "filter", "search",
	"mail", "phone", "printer", "download", "upload", "link", "help", "alert",
	"info", "close", "check"
}

def resolve_page_icon(page_dict):
	"""معالجة وتحديد أيقونة مساحة العمل لضمان عدم ظهورها فارغة ودعم أيقونات فرابي ولوسيد وفونت أوسم"""
	name = page_dict.get("name") or page_dict.get("title") or ""
	icon = (page_dict.get("icon") or "").strip()

	# 1. إذا كانت الأيقونة فارغة، نستخدم الأيقونة الافتراضية المناسبة لمساحة العمل
	if not icon:
		icon = DEFAULT_WORKSPACE_ICONS.get(name, "folder")

	# 2. تنظيف كلاسات الخطوط القديمة fal fa- في حال كانت مسجلة في الداتابيس
	if "bags-shopping" in icon:
		icon = "selling"
	elif "calculator" in icon:
		icon = "accounting"
	elif "shopping-cart" in icon or "cart" in icon:
		icon = "buying"
	elif "boxes" in icon:
		icon = "stock"

	# 3. تحديد نوع الأيقونة (Frappe SVG أم Lucide أم FontAwesome)
	if icon.startswith("fa ") or icon.startswith("fal ") or icon.startswith("fas ") or icon.startswith("far "):
		icon_type = "fa"
	elif icon in FRAPPE_SVG_ICONS:
		icon_type = "svg"
	else:
		# إذا لم تكن من أيقونات فرابي SVG، نعتبرها أيقونة Lucide مدعومة
		icon_type = "lucide"

	page_dict["icon"] = icon
	page_dict["icon_type"] = icon_type


@frappe.whitelist()
def get_desktop_pages():
	pages_data = get_workspace_sidebar_items()
	pages = pages_data.get("pages") or []
	original_pages = pages
	pages = [d for d in pages if not d.get("parent_page")]

	for row in pages:
		resolve_page_icon(row)
		row_json = json.dumps(row)
		desktop_page = get_desktop_page(row_json)
		row["cards"] = desktop_page.get("cards")
		child_workspaces = [d for d in original_pages if d.get("parent_page") == row.get("name")]
		for child in child_workspaces:
			resolve_page_icon(child)
		row["child_workspace"] = child_workspaces

	return pages
