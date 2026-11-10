import frappe
from frappe.desk.desktop import get_desktop_page
from frappe.desk.desktop import get_workspace_sidebar_items
import json

DEFAULT_WORKSPACE_ICONS = {
	"Home": "home",
	"Accounting": "accounting",
	"Payables": "arrow-left",
	"Receivables": "arrow-right",
	"Financial Reports": "file-text",
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
	"website", "tool", "setting-gear", "settings", "integration",
	"arrow-left", "arrow-right", "point-of-sale", "leave", "payroll",
	"chart", "calendar", "chat", "heart", "lock", "shield", "filter", "search",
	"mail", "phone", "printer", "download", "upload", "link", "help", "alert",
	"info", "close", "check"
}

def resolve_page_icon(page_dict, overrides=None):
	"""معالجة وتحديد أيقونة مساحة العمل ولونها لضمان وضوحها العالي ودعم الألوان المخصصة"""
	name = page_dict.get("name") or page_dict.get("title") or ""
	override = (overrides or {}).get(name, {})

	# أخذ الأيقونة من إعدادات الثيم إذا تم تخصيصها، وإلا من مساحة العمل
	if override.get("icon"):
		icon = override.get("icon").strip()
	else:
		icon = (page_dict.get("icon") or "").strip()

	# أخذ لون الأيقونة المخصص من إعدادات الثيم أو مساحة العمل
	icon_color = (
		override.get("icon_color")
		or page_dict.get("icon_color")
		or page_dict.get("indicator_color")
		or ""
	).strip()

	# إذا كانت الأيقونة فارغة، استخدام الافتراضي المعتمد
	if not icon:
		icon = DEFAULT_WORKSPACE_ICONS.get(name, "folder")

	# للتقارير المالية: استخدام أيقونة المستند المفصلة file-text ذات التباين العالي
	if name in ("Financial Reports", "Accounting Reports") and icon in ("small-file", "file", ""):
		icon = "file-text"

	# تنظيف أسماء الخطوط القديمة fal fa-
	if "bags-shopping" in icon:
		icon = "selling"
	elif "calculator" in icon:
		icon = "accounting"
	elif "shopping-cart" in icon or "cart" in icon:
		icon = "buying"
	elif "boxes" in icon:
		icon = "stock"

	# تحديد نوع الأيقونة
	if icon.startswith("fa ") or icon.startswith("fal ") or icon.startswith("fas ") or icon.startswith("far "):
		icon_type = "fa"
	elif icon in FRAPPE_SVG_ICONS:
		icon_type = "svg"
	else:
		icon_type = "lucide"

	page_dict["icon"] = icon
	page_dict["icon_type"] = icon_type
	page_dict["icon_color"] = icon_color


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
				fields=["workspace", "icon", "icon_color"],
			)
			for m in mappings:
				ws = m.get("workspace")
				if ws:
					mapping_overrides[ws] = m
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
