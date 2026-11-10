import frappe

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

def execute():
	"""استعادة الأيقونات الافتراضية لكافة مساحات العمل التي تم مسح أيقوناتها سابقاً"""
	if not frappe.db.exists("DocType", "Workspace"):
		return

	for ws_name, default_icon in DEFAULT_WORKSPACE_ICONS.items():
		target_ws = ws_name
		if not frappe.db.exists("Workspace", target_ws):
			alt = ws_name.replace("&", "and")
			if frappe.db.exists("Workspace", alt):
				target_ws = alt
			elif frappe.db.exists("Workspace", ws_name.lower()):
				target_ws = ws_name.lower()
			else:
				continue

		current_icon = frappe.db.get_value("Workspace", target_ws, "icon")
		# إذا كانت الأيقونة فارغة أو تحتوي على كلاس قديم fal fa- أو كانت small-file المعتمة
		if not current_icon or current_icon.startswith("fal fa-") or current_icon.startswith("fa fa-") or current_icon in ("small-file", "file"):
			frappe.db.set_value("Workspace", target_ws, "icon", default_icon, update_modified=False)

	frappe.db.commit()

