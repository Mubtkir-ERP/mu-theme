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

let lastMenuClickTime = 0;

function toggleMobileSidebar(e) {
	if (e) {
		e.preventDefault();
		e.stopPropagation();
	}
	const now = Date.now();
	if (now - lastMenuClickTime < 350) {
		return;
	}
	lastMenuClickTime = now;

	const $sideMenu = $(".side-menu").first();
	const isOpen = $sideMenu.hasClass("side-menu--mobile-menu-open");

	if (isOpen) {
		$sideMenu.removeClass("side-menu--mobile-menu-open side-menu--on-hover");
		$(".close-mobile-menu").removeClass("close-mobile-menu--mobile-menu-open");
	} else {
		$sideMenu.addClass("side-menu--mobile-menu-open");
		$(".close-mobile-menu").addClass("close-mobile-menu--mobile-menu-open");
	}
}

// فتح وإغلاق القائمة الجانبية بنقرة واحدة بدون تكرار في كافة السكنات
$(document).on("click", ".open-mobile-menu", function (e) {
	toggleMobileSidebar(e);
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
	if (Date.now() - lastMenuClickTime < 400) {
		return;
	}

	const $target = $(e.target);

	// إذا كان النقر على زر القائمة لا نفعل شيئاً
	if ($target.closest(".open-mobile-menu").length) {
		return;
	}

	// إذا كان النقر داخل السايدبار لا نغلق
	if ($target.closest(".side-menu").length) {
		return;
	}

	if ($(".side-menu").hasClass("side-menu--mobile-menu-open")) {
		$(".side-menu").removeClass("side-menu--mobile-menu-open side-menu--on-hover");
		$(".close-mobile-menu").removeClass("close-mobile-menu--mobile-menu-open");
	}
});

// نقل كافة أزرار الإجراءات في شاشة التابلت داخل قائمة 3 نقاط
function syncTabletActionsToMenu() {
	if (window.innerWidth > 1280) return;

	const $menu = $(".page-actions .menu-btn-group .dropdown-menu, .page-head .menu-btn-group .dropdown-menu, .menu-btn-group .dropdown-menu");
	if (!$menu.length) return;

	// رفع طبقة العرض وتثبيت فتح القائمة للأسفل دائماً لمنع قصها أو اختفائها خلف الناف بار
	$(".content, .page-head, .page-actions").css("z-index", "1200");
	$menu.css({
		"top": "100%",
		"bottom": "auto",
		"transform": "none",
		"z-index": "9999"
	});

	// 1. فحص مجموعات الأزرار المنسدلة مثل "Actions" أو "Get Items From" أو "Create"
	$(".page-actions .actions-btn-group, .page-head .actions-btn-group, .page-actions .inner-group-button, .page-head .inner-group-button, .page-actions .custom-actions .btn-group").each(function () {
		const $group = $(this);
		const groupTitle = $group.find(".dropdown-toggle").text().trim();
		$group.find(".dropdown-menu li, .dropdown-menu a").each(function () {
			const $item = $(this);
			const itemText = $item.text().trim();
			if (!itemText) return;
			const fullLabel = groupTitle && groupTitle !== "Actions" && groupTitle !== "إجراءات"
				? (groupTitle + " > " + itemText)
				: itemText;

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

	// 2. فحص الأزرار الفردية المخصصة
	$(".page-actions .custom-actions button, .page-head .custom-actions button, .page-actions .custom-btn-group button, .page-actions .standard-actions > button:not(.primary-action)").each(function () {
		const $btn = $(this);
		const label = $btn.text().trim();
		if (!label || label === "..." || label === "Menu" || label === "القائمة" || label.length < 2) return;

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

// تنفيذ المزامنة فور فتح قائمة 3 نقاط وضبط طبقة العرض
$(document).on("show.bs.dropdown shown.bs.dropdown pointerdown mousedown click", ".menu-btn-group, .menu-btn-group button", function () {
	syncTabletActionsToMenu();
	$(".content, .page-head, .page-actions").css("z-index", "1200");
	const $dropdown = $(this).closest(".menu-btn-group").find(".dropdown-menu");
	$dropdown.css({
		"top": "100%",
		"bottom": "auto",
		"transform": "none",
		"z-index": "9999"
	});
});

$(document).on("hidden.bs.dropdown", ".menu-btn-group", function () {
	$(".content, .page-head, .page-actions").css("z-index", "");
});

if (window.frappe && frappe.router) {
	frappe.router.on("change", function () {
		setTimeout(syncTabletActionsToMenu, 500);
		setTimeout(syncTabletActionsToMenu, 1200);
	});
}