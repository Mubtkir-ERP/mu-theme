# Copyright (c) 2024, NexTash (SMC-PVT) Ltd and contributors
# For license information, please see license.txt

import json
import os
import frappe
from frappe import _
from frappe.model.document import Document


DEFAULT_PHONE = "0115110455"
DEFAULT_EMAIL = "sales@mubtkir.com"
DEFAULT_WEBSITE = "www.mubtkir.com"


class ThemeSettings(Document):
	def validate(self):
		if frappe.session.user != "Administrator":
			frappe.throw(_("Only Administrator can modify Theme Settings"), frappe.PermissionError)

		if not self.phone:
			self.phone = DEFAULT_PHONE
		if not self.email:
			self.email = DEFAULT_EMAIL
		if not self.website:
			self.website = DEFAULT_WEBSITE


def boot_session(bootinfo):
	try:
		doc = frappe.get_cached_doc("Theme Settings")
		bootinfo.theme_settings = {
			"phone": doc.phone or DEFAULT_PHONE,
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
		if not frappe.db.get_single_value("Theme Settings", "phone"):
			frappe.db.set_single_value("Theme Settings", "phone", DEFAULT_PHONE)
		if not frappe.db.get_single_value("Theme Settings", "email"):
			frappe.db.set_single_value("Theme Settings", "email", DEFAULT_EMAIL)
		if not frappe.db.get_single_value("Theme Settings", "website"):
			frappe.db.set_single_value("Theme Settings", "website", DEFAULT_WEBSITE)
		frappe.db.commit()
	except Exception:
		frappe.log_error(title="Theme Settings defaults error", message=frappe.get_traceback())


def after_migrate():
	try:
		setup_theme_defaults()
	except Exception:
		frappe.log_error(title="Theme after_migrate defaults error", message=frappe.get_traceback())


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


@frappe.whitelist()
def get_default_workspace_mappings():
	"""إرجاع التوزيع الافتراضي للكتل على مساحات العمل لملء الجدول يدوياً"""
	if frappe.session.user != "Administrator":
		frappe.throw(_("Only Administrator can perform this action"), frappe.PermissionError)

	# التأكد أولاً من إنشاء ومزامنة كافة كتل Custom HTML Block في قاعدة البيانات
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
		target_ws = ws
		if not frappe.db.exists("Workspace", target_ws):
			alt = ws.replace("&", "and")
			if frappe.db.exists("Workspace", alt):
				target_ws = alt
			elif frappe.db.exists("Workspace", ws.lower()):
				target_ws = ws.lower()
			elif ws == "Settings" and frappe.db.exists("Workspace", "ERPNext Settings"):
				target_ws = "ERPNext Settings"
			elif ws == "Integrations" and frappe.db.exists("Workspace", "ERPNext Integrations"):
				target_ws = "ERPNext Integrations"
			elif ws == "Accounting Reports" and frappe.db.exists("Workspace", "Financial Reports"):
				target_ws = "Financial Reports"
			else:
				continue

		mappings.append({
			"workspace": target_ws,
			"custom_block_name": block,
			"enabled": 1,
		})

	return mappings


@frappe.whitelist()
def apply_all_blocks_to_workspaces(auto_run=False):
	if not auto_run and frappe.session.user != "Administrator":
		frappe.throw(_("Only Administrator can perform this action"), frappe.PermissionError)

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
				fields=["workspace", "custom_block_name"],
			)
	except Exception:
		table_mappings = []

	if table_mappings:
		# تطبيق التوزيع اليدوي المحدد في الجدول
		for row in table_mappings:
			ws_name = row.get("workspace")
			block_name = row.get("custom_block_name")
			if not (ws_name and block_name):
				continue
			if not frappe.db.exists("Workspace", ws_name):
				skipped_workspaces.append(f"{ws_name} (غير موجود)")
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
					"Workspace", ws_name, "content", json.dumps(content_data), update_modified=False
				)
				if frappe.db.exists("DocType", "Workspace Custom Block"):
					if not frappe.db.exists(
						"Workspace Custom Block",
						{"parent": ws_name, "custom_block_name": block_name},
					):
						frappe.db.sql(
							"""
							INSERT INTO `tabWorkspace Custom Block`
							(name, parent, parenttype, parentfield, custom_block_name, creation, modified, modified_by, owner)
							VALUES (%s, %s, 'Workspace', 'custom_blocks', %s, NOW(), NOW(), 'Administrator', 'Administrator')
							""",
							(frappe.generate_hash(length=10), ws_name, block_name),
						)
				updated_workspaces.append(f"{ws_name} ➔ {block_name}")
			except Exception:
				frappe.log_error(
					title=f"Theme WS link error: {ws_name}"[:140],
					message=frappe.get_traceback(),
				)
	else:
		# إذا كان الجدول فارغاً، استخدام الربط التلقائي الافتراضي
		for item in blocks_data:
			block_name = item.get("custom_block_name") or item.get("name") or item.get("label")
			if not block_name:
				continue

			candidates = [
				block_name,
				block_name.capitalize(),
				block_name.lower(),
				block_name.replace(" ", "-"),
				block_name.replace(" _ ", " & "),
				block_name.replace(" _ ", " and "),
			]
			if block_name.lower() == "selling":
				candidates.extend(["Selling", "Sales", "sales"])
			elif block_name.lower() == "stock":
				candidates.extend(["Stock", "Inventory"])
			elif block_name.lower() == "hr":
				candidates.extend(["HR", "Human Resources", "hr"])
			elif block_name == "Shift _ Attendance":
				candidates.extend(["Shift & Attendance", "Shift and Attendance", "Attendance"])
			elif block_name == "ERPNext Settings":
				candidates.extend(["Settings", "ERPNext Settings"])
			elif block_name == "ERPNext Integrations":
				candidates.extend(["Integrations", "ERPNext Integrations"])
			elif block_name == "Financial Reports":
				candidates.extend(["Accounting Reports", "Financial Reports"])
			elif block_name == "Bank Reconciliation":
				candidates.extend(["Bank Reconciliation", "Bank-Reconciliation", "Bank reconciliation", "مطابقة البنك"])
			elif block_name == "Gas Operations":
				candidates.extend(["Gas Operations", "Gas-Operations", "Gas operations", "إدارة عمليات الغاز", "عمليات الغاز"])
			elif block_name == "Container Rental System":
				candidates.extend(["Container Rental System", "container_rental_system", "Container Rental", "نظام تأجير الحاويات", "تأجير الحاويات"])
			elif block_name == "Tax & Benefits":
				candidates.extend(["Tax & Benefits", "Tax and Benefits", "tax-and-benefits", "الضرائب والمزايا"])
			elif block_name == "Salary Payout":
				candidates.extend(["Salary Payout", "salary-payout", "صرف الرواتب"])
			elif block_name == "Payroll":
				candidates.extend(["Payroll", "payroll", "الرواتب", "مسير الرواتب"])
			elif block_name == "Expense Claims":
				candidates.extend(["Expense Claims", "expense-claims", "مطالبات المصاريف"])
			elif block_name == "Leaves":
				candidates.extend(["Leaves", "leaves", "الإجازات"])
			elif block_name == "Party Bookings":
				candidates.extend(["Party Bookings", "party-bookings", "Party Booking", "party_bookings", "حجوزات الحفلات", "حجوزات الحفلات والمناسبات"])
			elif block_name == "Car Care":
				candidates.extend(["Car Care", "car-care", "car_care", "حماية السيارات", "العناية بالسيارات"])
				is_car_care_site = (
					"mu_car_care" in frappe.get_installed_apps()
					or frappe.db.exists("DocType", "Vehicle Reception")
				)
				if is_car_care_site:
					candidates.extend(["Home", "home", "الرئيسية"])
			elif block_name == "Home":
				is_car_care_site = (
					"mu_car_care" in frappe.get_installed_apps()
					or frappe.db.exists("DocType", "Vehicle Reception")
				)
				if is_car_care_site:
					continue

			target_workspaces = []
			for c in candidates:
				if frappe.db.exists("Workspace", c) and c not in target_workspaces:
					target_workspaces.append(c)
					if block_name != "Car Care":
						break

			if not target_workspaces:
				skipped_workspaces.append(block_name)
				continue

			for ws_name in target_workspaces:
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
						"Workspace", ws_name, "content", json.dumps(content_data), update_modified=False
					)
					if frappe.db.exists("DocType", "Workspace Custom Block"):
						if not frappe.db.exists(
							"Workspace Custom Block",
							{"parent": ws_name, "custom_block_name": block_name},
						):
							frappe.db.sql(
								"""
								INSERT INTO `tabWorkspace Custom Block`
								(name, parent, parenttype, parentfield, custom_block_name, creation, modified, modified_by, owner)
								VALUES (%s, %s, 'Workspace', 'custom_blocks', %s, NOW(), NOW(), 'Administrator', 'Administrator')
								""",
								(frappe.generate_hash(length=10), ws_name, block_name),
							)
					updated_workspaces.append(f"{ws_name} ➔ {block_name}")
				except Exception:
					frappe.log_error(
						title=f"Theme WS link error: {ws_name}"[:140],
						message=frappe.get_traceback(),
					)

	frappe.db.commit()
	frappe.clear_cache()

	return {
		"blocks_synced": len(created_or_updated_blocks),
		"updated": updated_workspaces,
		"skipped": skipped_workspaces,
		"count": len(updated_workspaces),
	}
