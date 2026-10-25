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
			const $btn = $(`<button class="btn btn-primary btn-sm btn-export-all-blocks mr-2 ml-2" style="font-weight: 500;">${__("📥 Export All Blocks to File")}</button>`);
			$btn.on("click", async function () {
				frappe.dom.freeze(__("Fetching all 31 blocks..."));
				try {
					const listRes = await frappe.call({
						method: "frappe.client.get_list",
						args: { doctype: "Custom HTML Block", limit_page_length: 0 },
					});
					const docs = [];
					for (const item of (listRes.message || [])) {
						const docRes = await frappe.call({
							method: "frappe.client.get",
							args: { doctype: "Custom HTML Block", name: item.name },
						});
						if (docRes.message) {
							docs.push(docRes.message);
						}
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
					frappe.show_alert({ message: __("Successfully downloaded {0} blocks!", [docs.length]), indicator: "green" });
				} catch (err) {
					frappe.dom.unfreeze();
					frappe.msgprint(__("Error fetching blocks: ") + (err.message || ""));
				}
			});
			const $syncBtn = $(`<button class="btn btn-secondary btn-sm btn-sync-all-blocks mr-2 ml-2" style="font-weight: 500;">${__("🔄 Sync Changes to All Blocks")}</button>`);
			$syncBtn.on("click", async function () {
				frappe.confirm(__("Are you sure you want to apply changes to all blocks in the site?"), async function () {
					frappe.dom.freeze(__("Applying updates to all blocks..."));
					try {
						const resp = await fetch("/assets/nxt_theme/blocks/all_blocks.json?v=" + Date.now());
						const blocks = await resp.json();
						let count = 0;
						for (const b of blocks) {
							await frappe.call({
								method: "frappe.client.set_value",
								args: {
									doctype: "Custom HTML Block",
									name: b.name,
									fieldname: {
										html: b.html,
										script: b.script,
										style: b.style,
									},
								},
							});
							count++;
						}
						frappe.dom.unfreeze();
						frappe.show_alert({ message: __("Successfully updated {0} blocks in the site!", [count]), indicator: "green" });
						setTimeout(() => location.reload(), 1500);
					} catch (err) {
						frappe.dom.unfreeze();
						frappe.msgprint(__("Error applying blocks: ") + (err.message || ""));
					}
				});
			});
			$(".page-head .page-actions, .page-actions .standard-actions").first().prepend($syncBtn).prepend($btn);
		} else {
			$(".btn-export-all-blocks, .btn-sync-all-blocks").remove();
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

		// Global modal helper: Steps shown directly + Launch button in brand primary #3867AE
		$(document).on("click", ".erp-info-link, [data-info-item]", function () {
			setTimeout(function () {
				const $modal = $(".erp-modal-box");
				if (!$modal.length) return;
				$modal.find(".erp-modal-toggle-steps").hide();
				$modal.find(".erp-modal-steps").show().addClass("is-shown").css({
					display: "block",
					maxHeight: "none",
					opacity: "1",
					visibility: "visible",
					marginTop: "14px"
				});
				if (!$modal.find(".erp-modal-launch-btn, [data-modal-launch]").length) {
					const isAr = document.documentElement.lang === "ar" || $("html").attr("dir") === "rtl" || $("[data-erp-dashboard]").attr("dir") === "rtl";
					const title = $modal.find(".erp-modal-title").text().trim();
					const $launchBtn = $(`
						<button type="button" class="erp-modal-launch-btn" style="background: #3867AE; color: #ffffff; border: none; border-radius: 10px; padding: 12px 18px; font-weight: 700; width: 100%; margin-top: 16px; cursor: pointer; font-size: 14px; transition: background 0.2s ease;">
							${isAr ? "🚀 فتح الشاشة الآن" : "🚀 Open Record Now"}
						</button>
					`);
					$launchBtn.on("click", function () {
						$modal.closest(".erp-modal-overlay").remove();
						if (window.frappe && frappe.set_route) {
							frappe.set_route("List", title);
						}
					});
					$launchBtn.hover(
						function () { $(this).css("background", "#0F84B5"); },
						function () { $(this).css("background", "#3867AE"); }
					);
					$modal.append($launchBtn);
				}
			}, 60);
		});
	});
})();
