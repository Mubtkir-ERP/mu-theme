# Copyright (c) 2024, NexTash (SMC-PVT) Ltd and contributors
# For license information, please see license.txt

import json
import os
import frappe
from frappe import _
from frappe.model.document import Document
from nxt_theme.events.sidebar import DEFAULT_WORKSPACE_ICONS, ARABIC_WORKSPACE_ICONS, ICON_MAP


DEFAULT_PHONE = "+966126810486"
DEFAULT_EMAIL = "sales@mubtkir.com"
DEFAULT_WEBSITE = "www.mubtkir.com"


def check_admin_permission():
	if frappe.session.user == "Administrator" or "System Manager" in frappe.get_roles():
		return
	frappe.throw(_("Only Administrator or System Manager can perform this action"), frappe.PermissionError)


class ThemeSettings(Document):
	def validate(self):
		check_admin_permission()

		if not self.phone or self.phone == "0115110455":
			self.phone = DEFAULT_PHONE
		if not self.email:
			self.email = DEFAULT_EMAIL
		if not self.website:
			self.website = DEFAULT_WEBSITE


def boot_session(bootinfo):
	try:
		doc = frappe.get_cached_doc("Theme Settings")
		phone_val = doc.phone
		if not phone_val or phone_val == "0115110455":
			phone_val = DEFAULT_PHONE
		bootinfo.theme_settings = {
			"phone": phone_val,
			"email": doc.email or DEFAULT_EMAIL,
			"website": doc.website or DEFAULT_WEBSITE,
			"skin": doc.skin or "razor",
		}
	except Exception:
		bootinfo.theme_settings = {
			"phone": DEFAULT_PHONE,
			"email": DEFAULT_EMAIL,
			"website": DEFAULT_WEBSITE,
			"skin": "razor",
		}


def setup_theme_defaults():
	try:
		if not frappe.db.exists("DocType", "Theme Settings"):
			return
		curr_phone = frappe.db.get_single_value("Theme Settings", "phone")
		if not curr_phone or curr_phone in ("0115110455", ""):
			frappe.db.set_single_value("Theme Settings", "phone", DEFAULT_PHONE)
			try:
				frappe.db.sql("""
					UPDATE `tabSingles`
					SET value = %s
					WHERE doctype = 'Theme Settings' AND field = 'phone'
				""", (DEFAULT_PHONE,))
			except Exception:
				pass
		if not frappe.db.get_single_value("Theme Settings", "email"):
			frappe.db.set_single_value("Theme Settings", "email", DEFAULT_EMAIL)
		if not frappe.db.get_single_value("Theme Settings", "website"):
			frappe.db.set_single_value("Theme Settings", "website", DEFAULT_WEBSITE)
		frappe.db.commit()

		# التأكد من ملء جدول التوزيع الافتراضي وحفظه في قاعدة البيانات إذا كان فارغاً
		populate_default_workspace_mappings_if_empty()
	except Exception:
		frappe.log_error(title="Theme Settings defaults error", message=frappe.get_traceback())


def populate_default_workspace_mappings_if_empty():
	"""حفظ التوزيع الافتراضي للكتل في جدول Theme Settings إذا كان فارغاً لضمان بقائه محفوظاً دائماً"""
	try:
		if not frappe.db.exists("DocType", "Theme Settings") or not frappe.db.exists("DocType", "Theme Workspace Mapping"):
			return

		existing_count = frappe.db.count("Theme Workspace Mapping", {"parent": "Theme Settings"})
		if existing_count > 0:
			return

		doc = frappe.get_doc("Theme Settings")
		defaults = get_default_workspace_mappings_data()
		for row in defaults:
			doc.append("workspace_mappings", row)

		doc.flags.ignore_permissions = True
		doc.flags.ignore_validate = True
		doc.save()
		frappe.db.commit()
	except Exception:
		frappe.log_error(title="Populate default mappings error", message=frappe.get_traceback())


def after_migrate():
	try:
		setup_theme_defaults()
		restore_default_workspace_icons()
	except Exception:
		frappe.log_error(title="Theme after_migrate defaults error", message=frappe.get_traceback())


@frappe.whitelist()
def restore_default_workspace_icons():
	"""استعادة وتعيين الأيقونات الافتراضية لكافة مساحات العمل في النظام"""
	try:
		from nxt_theme.patches.update_default_phone_and_icons import execute as run_restore
		run_restore()
		frappe.clear_cache()
		return {"success": True}
	except Exception:
		frappe.log_error(title="Restore workspace icons error", message=frappe.get_traceback())
		return {"success": False}


@frappe.whitelist()
def sync_custom_html_blocks():
	"""إنشاء وتحديث كافة كتل Custom HTML Block في قاعدة البيانات من all_blocks.json"""
	blocks_json_path = os.path.join(
		frappe.get_app_path("nxt_theme"), "public", "blocks", "all_blocks.json"
	)
	if not os.path.exists(blocks_json_path):
		blocks_json_path = os.path.join(
			frappe.get_app_path("nxt_theme"), "blocks", "all_blocks.json"
		)

	if not os.path.exists(blocks_json_path):
		return []

	with open(blocks_json_path, "r", encoding="utf-8") as f:
		blocks_data = json.load(f)

	if not frappe.db.exists("DocType", "Custom HTML Block"):
		return []

	created_or_updated = []
	for item in blocks_data:
		block_name = item.get("custom_block_name") or item.get("name") or item.get("label")
		if not block_name:
			continue

		try:
			if not frappe.db.exists("Custom HTML Block", block_name):
				chb = frappe.get_doc({
					"doctype": "Custom HTML Block",
					"name": block_name,
					"html": item.get("html", ""),
					"style": item.get("style", ""),
					"script": item.get("script", ""),
				})
				chb.flags.ignore_permissions = True
				chb.flags.ignore_links = True
				chb.flags.ignore_validate = True
				chb.insert()
			else:
				frappe.db.set_value(
					"Custom HTML Block",
					block_name,
					{
						"html": item.get("html", ""),
						"style": item.get("style", ""),
						"script": item.get("script", ""),
					},
					update_modified=False,
				)
			created_or_updated.append(block_name)
		except Exception:
			pass

	frappe.db.commit()
	return created_or_updated


ARABIC_TO_ENGLISH_WS = {
	"الصفحة الرئيسية": "Home",
	"الرئيسية": "Home",
	"المبيعات": "Selling",
	"المخزون": "Stock",
	"المشتريات": "Buying",
	"الحسابات": "Accounting",
	"الأصول": "Assets",
	"المستخدمين": "Users",
	"المستخدمون": "Users",
	"التصنيع": "Manufacturing",
	"الجودة": "Quality",
	"المشاريع": "Projects",
	"إدارة علاقات العملاء": "CRM",
	"الدعم": "Support",
	"الدعم الفني": "Support",
	"الموارد البشرية": "HR",
	"الإجازات": "Leaves",
	"الرواتب": "Payroll",
	"مسير الرواتب": "Payroll",
	"صرف الرواتب": "Salary Payout",
	"مطالبات المصاريف": "Expense Claims",
	"التوظيف": "Recruitment",
	"الأداء": "Performance",
	"دورة حياة الموظف": "Employee Lifecycle",
	"الورديات والحضور": "Shift & Attendance",
	"الوردية والحضور": "Shift & Attendance",
	"الحضور والغياب": "Shift & Attendance",
	"الموقع": "Website",
	"الموقع الإلكتروني": "Website",
	"الأدوات": "Tools",
	"الإعدادات": "ERPNext Settings",
	"إعدادات ERPNext": "ERPNext Settings",
	"التكامل": "ERPNext Integrations",
	"التكاملات": "ERPNext Integrations",
	"التقارير المالية": "Financial Reports",
	"تقارير المحاسبة": "Financial Reports",
	"الذمم الدائنة": "Payables",
	"الذمم المدينة": "Receivables",
	"الضرائب والمزايا": "Tax & Benefits",
	"مطابقة البنك": "Bank Reconciliation",
	"التسوية البنكية": "Bank Reconciliation",
	"عمليات الغاز": "Gas Operations",
	"إدارة عمليات الغاز": "Gas Operations",
	"نظام تأجير الحاويات": "Container Rental System",
	"تأجير الحاويات": "Container Rental System",
	"حماية السيارات": "Car Care",
	"العناية بالسيارات": "Car Care",
	"حجوزات الحفلات": "Party Bookings",
	"نقاط البيع": "POSNext",
	"نقطة البيع": "POSNext",
	"واتساب": "Whatsapp",
	"الواتس": "Whatsapp",
	"الواتساب": "Whatsapp",
	"الذهب": "Gold Management",
	"إدارة الذهب": "Gold Management",
	"الرعاية الصحية": "Healthcare",
	"الصحة": "Healthcare",
	"سندات القبض والصرف": "Voucher Entries",
	"إدارة السندات": "Voucher Entries",
	"السندات": "Voucher Entries",
	"سندات": "Voucher Entries",
	"تطبيق السندات": "Voucher Entries",
	"Voucher Management": "Voucher Entries",
	"Voucher Entries": "Voucher Entries",
}


def get_actual_workspace_name(ws_identifier):
	"""البحث عن اسم مساحة العمل الفعلي في قاعدة البيانات سواء كان المدخل باللغة الإنجليزية أو العربية"""
	if not ws_identifier:
		return None
	ws_identifier = str(ws_identifier).strip()
	if frappe.db.exists("Workspace", ws_identifier):
		return ws_identifier

	by_title = frappe.db.get_value("Workspace", {"title": ws_identifier}, "name")
	if by_title:
		return by_title

	by_label = frappe.db.get_value("Workspace", {"label": ws_identifier}, "name")
	if by_label:
		return by_label

	# 1. إذا كان المدخل عربياً، نبحث عن الترجمة الإنجليزية
	mapped_en = ARABIC_TO_ENGLISH_WS.get(ws_identifier)
	if mapped_en:
		if frappe.db.exists("Workspace", mapped_en):
			return mapped_en
		by_t = frappe.db.get_value("Workspace", {"title": mapped_en}, "name")
		if by_t:
			return by_t
		by_l = frappe.db.get_value("Workspace", {"label": mapped_en}, "name")
		if by_l:
			return by_l

	# 2. إذا كان المدخل إنجليزياً، نبحث عن الترجمة العربية العكسية
	for ar_name, en_name in ARABIC_TO_ENGLISH_WS.items():
		if en_name.lower() == ws_identifier.lower():
			if frappe.db.exists("Workspace", ar_name):
				return ar_name
			by_t = frappe.db.get_value("Workspace", {"title": ar_name}, "name")
			if by_t:
				return by_t
			by_l = frappe.db.get_value("Workspace", {"label": ar_name}, "name")
			if by_l:
				return by_l

	# 3. محاولة تطابق بالكلمات المفتاحية لمساحات العمل الشهيرة (مثل عمليات الغاز والسندات)
	if ws_identifier.lower() in ("gas operations", "gas", "gas_operations", "عمليات الغاز", "إدارة عمليات الغاز"):
		for candidate in ("Gas Operations", "عمليات الغاز", "إدارة عمليات الغاز", "gas_operations"):
			if frappe.db.exists("Workspace", candidate):
				return candidate
			by_t = frappe.db.get_value("Workspace", {"title": candidate}, "name")
			if by_t:
				return by_t

	if ws_identifier.lower() in ("voucher entries", "voucher management", "vouchers", "سندات", "السندات", "سندات القبض والصرف", "إدارة السندات", "تطبيق السندات"):
		for candidate in ("Voucher Entries", "Voucher Management", "سندات القبض والصرف", "إدارة السندات", "السندات"):
			if frappe.db.exists("Workspace", candidate):
				return candidate
			by_t = frappe.db.get_value("Workspace", {"title": candidate}, "name")
			if by_t:
				return by_t
			by_l = frappe.db.get_value("Workspace", {"label": candidate}, "name")
			if by_l:
				return by_l

	alt = ws_identifier.replace("&", "and")
	if frappe.db.exists("Workspace", alt):
		return alt
	if frappe.db.exists("Workspace", ws_identifier.lower()):
		return ws_identifier.lower()

	return None


def get_default_workspace_mappings_data():
	"""إرجاع بيانات التوزيع الافتراضي للكتل على مساحات العمل وفق النشاط بأيقونات Lucide الحديثة"""
	sync_custom_html_blocks()

	default_pairs = [
		("Home", "Home"),
		("Selling", "selling"),
		("Stock", "stock"),
		("Buying", "Buying"),
		("Accounting", "Accounting"),
		("Assets", "Assets"),
		("Build", "Build"),
		("CRM", "CRM"),
		("HR", "HR"),
		("Leaves", "Leaves"),
		("Payroll", "Payroll"),
		("Salary Payout", "Salary Payout"),
		("Expense Claims", "Expense Claims"),
		("Performance", "Performance"),
		("Recruitment", "Recruitment"),
		("Employee Lifecycle", "Employee Lifecycle"),
		("Shift & Attendance", "Shift _ Attendance"),
		("Manufacturing", "Manufacturing"),
		("Projects", "Projects"),
		("Quality", "Quality"),
		("Support", "Support"),
		("Users", "Users"),
		("Website", "Website"),
		("Tools", "Tools"),
		("Settings", "ERPNext Settings"),
		("Integrations", "ERPNext Integrations"),
		("Accounting Reports", "Financial Reports"),
		("Payables", "Payables"),
		("Receivables", "Receivables"),
		("Tax & Benefits", "Tax & Benefits"),
		("Bank Reconciliation", "Bank Reconciliation"),
		("Gas Operations", "Gas Operations"),
		("Container Rental System", "Container Rental System"),
		("Party Bookings", "Party Bookings"),
		("Car Care", "Car Care"),
		("POSNext", "POSNext"),
		("Whatsapp", "Whatsapp"),
		("ZATCA", "ZATCA"),
		("Gold Management", "Gold Management"),
		("Healthcare", "Healthcare"),
		("Voucher Entries", "Voucher Management"),
	]

	# التحقق من نشاط العميل بالنسبة للرئيسية Home
	is_car_care_site = (
		"mu_car_care" in frappe.get_installed_apps()
		or frappe.db.exists("DocType", "Vehicle Reception")
	)
	if is_car_care_site:
		default_pairs[0] = ("Home", "Car Care")
	elif frappe.db.exists("DocType", "Container Rental"):
		default_pairs[0] = ("Home", "Container Rental System")
	elif frappe.db.exists("DocType", "Party Booking"):
		default_pairs[0] = ("Home", "Party Bookings")
	elif frappe.db.exists("DocType", "Gold Workmanship Invoice") or frappe.db.exists("DocType", "Gold Receipt"):
		default_pairs[0] = ("Home", "Gold Management")
	elif frappe.db.exists("DocType", "Patient Appointment") or frappe.db.exists("DocType", "Healthcare Practitioner"):
		default_pairs[0] = ("Home", "Healthcare")

	mappings = []
	for ws, block in default_pairs:
		target_ws = get_actual_workspace_name(ws)
		if not target_ws:
			continue

		mappings.append({
			"workspace": target_ws,
			"custom_block_name": block,
			"icon": DEFAULT_WORKSPACE_ICONS.get(ws, "layout-grid"),
			"enabled": 1,
		})

	return mappings


@frappe.whitelist()
def get_default_workspace_mappings():
	check_admin_permission()
	return get_default_workspace_mappings_data()


@frappe.whitelist()
def reload_default_workspace_mappings():
	"""إعادة ملء وحفظ التوزيع الافتراضي للكتل على مساحات العمل في قاعدة البيانات وتحديث النموذج"""
	check_admin_permission()

	sync_custom_html_blocks()
	doc = frappe.get_doc("Theme Settings")
	doc.set("workspace_mappings", [])
	default_mappings = get_default_workspace_mappings_data()
	for row in default_mappings:
		doc.append("workspace_mappings", row)

	doc.flags.ignore_permissions = True
	doc.flags.ignore_validate = True
	doc.save()
	frappe.db.commit()
	frappe.clear_cache()
	return len(default_mappings)


@frappe.whitelist()
def apply_all_blocks_to_workspaces(auto_run=False):
	if not auto_run:
		check_admin_permission()

	blocks_json_path = os.path.join(
		frappe.get_app_path("nxt_theme"), "public", "blocks", "all_blocks.json"
	)
	if not os.path.exists(blocks_json_path):
		blocks_json_path = os.path.join(
			frappe.get_app_path("nxt_theme"), "blocks", "all_blocks.json"
		)

	if not os.path.exists(blocks_json_path):
		return {"error": "all_blocks.json not found", "count": 0}

	with open(blocks_json_path, "r", encoding="utf-8") as f:
		blocks_data = json.load(f)

	# 1. إنشاء وتحديث كافة كتل Custom HTML Block في قاعدة البيانات
	created_or_updated_blocks = sync_custom_html_blocks()
	updated_workspaces = []
	skipped_workspaces = []

	# 2. Check if custom table mappings exist in Theme Settings
	table_mappings = []
	try:
		if frappe.db.exists("DocType", "Theme Workspace Mapping"):
			table_mappings = frappe.get_all(
				"Theme Workspace Mapping",
				filters={"parent": "Theme Settings", "enabled": 1},
				fields=["workspace", "custom_block_name", "icon"],
			)
	except Exception:
		table_mappings = []

	# إذا كان الجدول فارغاً، ملؤه تلقائياً وحفظه في قاعدة البيانات
	if not table_mappings:
		populate_default_workspace_mappings_if_empty()
		try:
			table_mappings = frappe.get_all(
				"Theme Workspace Mapping",
				filters={"parent": "Theme Settings", "enabled": 1},
				fields=["workspace", "custom_block_name", "icon"],
			)
		except Exception:
			table_mappings = []

	if table_mappings:
		# التأكد من إدراج كافة مساحات العمل الافتراضية الموجودة في النظام حتى لو كانت ناقصة من الجدول المحفوظ سابقاً (مثل Gas Operations)
		try:
			default_mappings = get_default_workspace_mappings_data()
			mapped_actual_workspaces = set()
			for r in table_mappings:
				act = get_actual_workspace_name(r.get("workspace"))
				if act:
					mapped_actual_workspaces.add(act)

			missing_rows = []
			for def_row in default_mappings:
				def_ws = def_row.get("workspace")
				if def_ws and def_ws not in mapped_actual_workspaces:
					table_mappings.append(def_row)
					missing_rows.append(def_row)
					mapped_actual_workspaces.add(def_ws)

			if missing_rows and frappe.db.exists("DocType", "Theme Settings"):
				theme_doc = frappe.get_doc("Theme Settings")
				for m_row in missing_rows:
					theme_doc.append("workspace_mappings", m_row)
				theme_doc.flags.ignore_permissions = True
				theme_doc.flags.ignore_validate = True
				theme_doc.save()
				frappe.db.commit()
		except Exception:
			pass

		# تطبيق التوزيع اليدوي المحدد في الجدول
		for row in table_mappings:
			ws_name = row.get("workspace")
			block_name = row.get("custom_block_name")
			ws_icon = row.get("icon")
			if not (ws_name and block_name):
				continue

			actual_ws = get_actual_workspace_name(ws_name)
			if not actual_ws:
				skipped_workspaces.append(f"{ws_name} (غير موجود)")
				continue

			try:
				# تحديث الأيقونة في مساحة العمل
				if ws_icon:
					clean_icon = ICON_MAP.get(ws_icon.strip(), ws_icon.strip())
					frappe.db.set_value("Workspace", actual_ws, "icon", clean_icon, update_modified=False)
				else:
					curr_icon = frappe.db.get_value("Workspace", actual_ws, "icon")
					if not curr_icon:
						default_icon = (
							DEFAULT_WORKSPACE_ICONS.get(actual_ws)
							or ARABIC_WORKSPACE_ICONS.get(ws_name)
							or "layout-grid"
						)
						frappe.db.set_value("Workspace", actual_ws, "icon", default_icon, update_modified=False)

				content_data = [
					{
						"type": "custom_block",
						"data": {
							"custom_block_name": block_name,
							"col": 12,
						},
					}
				]
				frappe.db.set_value(
					"Workspace", actual_ws, "content", json.dumps(content_data), update_modified=False
				)
				if frappe.db.exists("DocType", "Workspace Custom Block"):
					if not frappe.db.exists(
						"Workspace Custom Block",
						{"parent": actual_ws, "custom_block_name": block_name},
					):
						try:
							frappe.db.sql(
								"""
								INSERT INTO `tabWorkspace Custom Block`
								(name, parent, parenttype, parentfield, custom_block_name, idx, creation, modified, modified_by, owner)
								VALUES (%s, %s, 'Workspace', 'custom_blocks', %s, 1, NOW(), NOW(), 'Administrator', 'Administrator')
								""",
								(frappe.generate_hash(length=10), actual_ws, block_name),
							)
						except Exception:
							pass
				updated_workspaces.append(f"{actual_ws} ➔ {block_name}")
			except Exception as ws_err:
				frappe.log_error(
					title=f"Theme WS link error: {actual_ws}"[:140],
					message=frappe.get_traceback(),
				)
	else:
		# إذا كان الجدول فارغاً، استخدام الربط التلقائي الافتراضي
		for item in blocks_data:
			block_name = item.get("custom_block_name") or item.get("name") or item.get("label")
			if not block_name:
				continue

			target_ws = get_actual_workspace_name(block_name)
			if not target_ws:
				skipped_workspaces.append(block_name)
				continue

			content_data = [
				{
					"type": "custom_block",
					"data": {
						"custom_block_name": block_name,
						"col": 12,
					},
				}
			]
			try:
				frappe.db.set_value(
					"Workspace", target_ws, "content", json.dumps(content_data), update_modified=False
				)
				updated_workspaces.append(f"{target_ws} ➔ {block_name}")
			except Exception:
				pass

	frappe.db.commit()
	try:
		frappe.clear_cache()
	except Exception:
		pass

	return {
		"blocks_synced": len(created_or_updated_blocks),
		"updated": updated_workspaces,
		"skipped": skipped_workspaces,
		"count": len(updated_workspaces),
	}
