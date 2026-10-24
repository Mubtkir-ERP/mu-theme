function closeSidebarAllScreens() {
	// 1. للشاشات الصغيرة والمتوسطة (الجوال والتابلت): إغلاق القائمة المنبثقة
	$(".side-menu").removeClass("side-menu--mobile-menu-open side-menu--on-hover");
	$(".close-mobile-menu").removeClass("close-mobile-menu--mobile-menu-open");

	// 2. للشاشات الكبيرة (Desktop): تصغير القائمة تلقائياً لإعطاء مساحة كاملة لمساحة العمل
	$(".side-menu").addClass("side-menu--collapsed");
	$(".content").addClass("content--compact");
	try {
		localStorage.setItem("compactMenu", "true");
	} catch (e) {}
}

let menuToggleTimestamp = 0;

// فتح وإغلاق القائمة الجانبية في كل السكنات والشاشات
$(document).on("click", ".open-mobile-menu", function (e) {
	e.preventDefault();
	e.stopPropagation();
	menuToggleTimestamp = Date.now();

	if ($(".side-menu").hasClass("side-menu--mobile-menu-open")) {
		$(".side-menu").removeClass("side-menu--mobile-menu-open side-menu--on-hover");
		$(".close-mobile-menu").removeClass("close-mobile-menu--mobile-menu-open");
	} else {
		$(".side-menu").addClass("side-menu--mobile-menu-open");
		$(".close-mobile-menu").addClass("close-mobile-menu--mobile-menu-open");
	}
});

$(document).on("click", ".link_to_page", function (e) {
	// إذا كان النقر على السهم، نتركه فقط لمعالج السهم لفتح/إغلاق المجموعة الفرعية
	if ($(e.target).closest(".side-menu__link__chevron").length) {
		return;
	}

	let title = $(this).data("title");
	let is_public = $(this).data("is_public");
	let is_link = $(this).data("is_link");

	if (is_link) {
		frappe.set_route("List", title);
		closeSidebarAllScreens();
		return;
	}

	let url = "/app/";
	url += is_public ? frappe.router.slug(title) : "private/" + frappe.router.slug(title);

	frappe.set_route(url);
	closeSidebarAllScreens();
});

// إغلاق القائمة الجانبية في التابلت والجوال عند النقر خارجها
$(document).on("click", function (e) {
	// منع الإغلاق التلقائي في نفس لحظة الفتح
	if (Date.now() - menuToggleTimestamp < 400) {
		return;
	}

	const $target = $(e.target);

	// إذا كان النقر على زر القائمة لا نفعل شيئاً
	if ($target.closest(".open-mobile-menu").length) {
		return;
	}

	// إذا كانت القائمة مفتوحة على التابلت أو الجوال والنقر خارج صندوق القائمة الفعلي
	if ($(".side-menu").hasClass("side-menu--mobile-menu-open")) {
		if ($target.hasClass("side-menu-backdrop") || !$target.closest(".side-menu__content").length) {
			$(".side-menu").removeClass("side-menu--mobile-menu-open side-menu--on-hover");
			$(".close-mobile-menu").removeClass("close-mobile-menu--mobile-menu-open");
		}
	}
});

// نقل أزرار الإجراءات في شاشة التابلت داخل قائمة 3 نقاط
function syncTabletActionsToMenu() {
	if (window.innerWidth > 1024) return;

	const $menu = $(".page-actions .menu-btn-group .dropdown-menu, .page-head .menu-btn-group .dropdown-menu");
	if (!$menu.length) return;

	// فحص مجموعات الأزرار المنسدلة مثل "الحصول على البنود من" أو "معاينة" أو "انشاء"
	$(".page-actions .inner-group-button, .page-head .inner-group-button, .page-actions .custom-actions .btn-group").each(function () {
		const $group = $(this);
		const groupTitle = $group.find(".dropdown-toggle").text().trim();
		$group.find(".dropdown-menu li, .dropdown-menu a").each(function () {
			const $item = $(this);
			const itemText = $item.text().trim();
			if (!itemText) return;
			const fullLabel = groupTitle ? (groupTitle + " > " + itemText) : itemText;

			if (!$menu.find(`[data-tablet-action="${fullLabel}"]`).length) {
				const $newLi = $(`<li data-tablet-action="${fullLabel}"><a class="dropdown-item grey-link cursor-pointer"><span>${fullLabel}</span></a></li>`);
				$newLi.on("click", function (e) {
					e.preventDefault();
					$item[0].click();
				});
				$menu.append($newLi);
			}
		});
	});

	// فحص الأزرار الفردية المخصصة مثل "Send WhatsApp" أو "Add Follow"
	$(".page-actions .custom-actions button, .page-head .custom-actions button, .page-actions .custom-btn-group button").each(function () {
		const $btn = $(this);
		const label = $btn.text().trim();
		if (!label || label === "..." || label === "Menu" || label.length < 2) return;

		if (!$menu.find(`[data-tablet-action="${label}"]`).length) {
			const $newLi = $(`<li data-tablet-action="${label}"><a class="dropdown-item grey-link cursor-pointer"><span>${label}</span></a></li>`);
			$newLi.on("click", function (e) {
				e.preventDefault();
				$btn[0].click();
			});
			$menu.append($newLi);
		}
	});
}

// تنفيذ المزامنة فور ضغط زر 3 نقاط
$(document).on("pointerdown mousedown click", ".menu-btn-group, .menu-btn-group button", function () {
	syncTabletActionsToMenu();
});

if (window.frappe && frappe.router) {
	frappe.router.on("change", function () {
		setTimeout(syncTabletActionsToMenu, 500);
		setTimeout(syncTabletActionsToMenu, 1200);
	});
}