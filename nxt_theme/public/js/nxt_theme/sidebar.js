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
	if (now - lastMenuClickTime < 300) {
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
	if (Date.now() - lastMenuClickTime < 350) {
		return;
	}

	const $target = $(e.target);

	// إذا كان النقر على زر القائمة لا نفعل شيئاً
	if ($target.closest(".open-mobile-menu").length) {
		return;
	}

	// إذا كان النقر داخل السايدبار لا نغلق
	if ($target.closest(".side-menu, #nxt_sidebar, #exort_nxt_sidebar, #viper_nxt_sidebar").length) {
		return;
	}

	if ($(".side-menu").hasClass("side-menu--mobile-menu-open")) {
		$(".side-menu").removeClass("side-menu--mobile-menu-open side-menu--on-hover");
		$(".close-mobile-menu").removeClass("close-mobile-menu--mobile-menu-open");
	}
});

// نقل كافة أزرار الإجراءات في شاشة التابلت داخل قائمة 3 نقاط في أول القائمة مثل الجوال
function syncTabletActionsToMenu() {
	if (window.innerWidth > 1280) return;

	const $menu = $(".page-actions .menu-btn-group .dropdown-menu, .page-head .menu-btn-group .dropdown-menu, .menu-btn-group .dropdown-menu").first();
	if (!$menu.length) return;

	// إزالة أي عناصر تم حقنها سابقاً لمنع التكرار
	$menu.find(".tablet-injected-action, .tablet-injected-divider").remove();

	const itemsToPrepend = [];

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

			const $li = $(`<li class="tablet-injected-action"><a class="dropdown-item grey-link cursor-pointer" style="font-weight: 600; color: var(--primary, #3867AE);"><span>${fullLabel}</span></a></li>`);
			$li.on("click", function (e) {
				e.preventDefault();
				$item[0].click();
			});
			itemsToPrepend.push($li);
		});
	});

	// 2. فحص الأزرار الفردية المخصصة
	$(".page-actions .custom-actions button, .page-head .custom-actions button, .page-actions .custom-btn-group button, .page-actions .standard-actions > button:not(.primary-action)").each(function () {
		const $btn = $(this);
		const label = $btn.text().trim();
		if (!label || label === "..." || label === "Menu" || label === "القائمة" || label.length < 2) return;

		const $li = $(`<li class="tablet-injected-action"><a class="dropdown-item grey-link cursor-pointer" style="font-weight: 600; color: var(--primary, #3867AE);"><span>${label}</span></a></li>`);
		$li.on("click", function (e) {
			e.preventDefault();
			$btn[0].click();
		});
		itemsToPrepend.push($li);
	});

	// وضع كافة الإجراءات في أول القائمة (في الأعلى مثل الجوال تماماً) متبوعة بفاصل
	if (itemsToPrepend.length) {
		const $divider = $('<li class="divider dropdown-divider tablet-injected-divider" style="margin: 6px 0; border-top: 1px solid #e2e8f0;"></li>');
		$menu.prepend($divider);
		for (let i = itemsToPrepend.length - 1; i >= 0; i--) {
			$menu.prepend(itemsToPrepend[i]);
		}
	}
}

// تنفيذ المزامنة فور فتح قائمة 3 نقاط مع تثبيت فتح القائمة للأسفل دائماً
$(document).on("show.bs.dropdown shown.bs.dropdown pointerdown mousedown click", ".menu-btn-group, .menu-btn-group button", function () {
	syncTabletActionsToMenu();
	const $dropdown = $(this).closest(".menu-btn-group").find(".dropdown-menu");
	$dropdown.css({
		"top": "100%",
		"bottom": "auto",
		"transform": "none"
	});
});

if (window.frappe && frappe.router) {
	frappe.router.on("change", function () {
		setTimeout(syncTabletActionsToMenu, 500);
		setTimeout(syncTabletActionsToMenu, 1200);
	});
}