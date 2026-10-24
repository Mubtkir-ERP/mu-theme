// إصلاحات واجهة عامة لثيم MUBTKIR
// المشكلة: عند فتح بعض الدوك‌تايبس لا يمكن التمرير للأسفل إلا بعد تحديث الصفحة.
// السبب المرجّح: بقاء قفل تمرير (modal-open / overflow hidden / backdrop) من تفاعل سابق،
// أو عدم إعادة حساب ارتفاع حاوية التمرير عند تغيير المسار في تطبيق الصفحة الواحدة (SPA).

import { unlockBodyScrollIfNoModal } from "./modal_utils";

(function () {
	function unlock_scroll() {
		document.body.classList.remove("modal-open");
		$(".modal-backdrop").remove();
		$("body").css("overflow", "");
		$("html").css("overflow", "");

		// Release Tailwise's scroll lock (overflow-y-hidden class + inline
		// padding-right) if no modal is actually visible
		unlockBodyScrollIfNoModal();

		// إعادة حساب ارتفاع حاويات التمرير (tailwise / simplebar) بعد رسم الصفحة
		try {
			window.dispatchEvent(new Event("resize"));
		} catch (e) {
			// متصفحات قديمة: تجاهل
		}
	}

	function add_export_blocks_button() {
		const route = frappe.get_route ? frappe.get_route() : [];
		if (route[0] === "List" && route[1] === "Custom HTML Block") {
			if ($(".btn-export-all-blocks").length) return;
			const $btn = $(`<button class="btn btn-primary btn-sm btn-export-all-blocks mr-2 ml-2" style="font-weight: 500;">📥 تحميل جميع الكتل في ملف واحد</button>`);
			$btn.on("click", async function () {
				frappe.dom.freeze(__("جاري سحب كافة الكتل الـ 31 بدقة..."));
				try {
					const listRes = await frappe.call({
						method: "frappe.client.get_list",
						args: { doctype: "Custom HTML Block", limit_page_length: 0 },
					});
					const docs = [];
					for (const item of listRes.message) {
						const docRes = await frappe.call({
							method: "frappe.client.get",
							args: { doctype: "Custom HTML Block", name: item.name },
						});
						docs.push(docRes.message);
					}
					frappe.dom.unfreeze();
					const blob = new Blob([JSON.stringify(docs, null, 2)], { type: "application/json" });
					const url = URL.createObjectURL(blob);
					const a = document.createElement("a");
					a.href = url;
					a.download = "custom_html_blocks.json";
					document.body.appendChild(a);
					a.click();
					a.remove();
					URL.revokeObjectURL(url);
					frappe.show_alert({ message: `تم تنزيل ${docs.length} كتلة بنجاح!`, indicator: "green" });
				} catch (err) {
					frappe.dom.unfreeze();
					frappe.msgprint("حدث خطأ أثناء سحب الكتل: " + err.message);
				}
			});
			$(".page-head .page-actions, .page-actions .standard-actions").first().prepend($btn);
		}
	}

	$(document).ready(function () {
		if (window.frappe && frappe.router && frappe.router.on) {
			frappe.router.on("change", function () {
				setTimeout(unlock_scroll, 300);
				setTimeout(add_export_blocks_button, 500);
			});
		}
		$(document).on("page-change", function () {
			setTimeout(unlock_scroll, 300);
			setTimeout(add_export_blocks_button, 500);
		});
	});
})();
