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

// فتح القائمة الجانبية في كل السكنات والشاشات
$(document).on("click pointerdown", ".open-mobile-menu", function (e) {
	e.preventDefault();
	e.stopPropagation();
	$(".side-menu").addClass("side-menu--mobile-menu-open");
	$(".close-mobile-menu").addClass("close-mobile-menu--mobile-menu-open");
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

// إغلاق القائمة الجانبية في التابلت والجوال عند النقر في أي مكان في الشاشة خارج القائمة
$(document).on("click pointerdown", function (e) {
	const $target = $(e.target);

	// لا تفعل شيئاً إذا كان النقر على زر فتح القائمة
	if ($target.closest(".open-mobile-menu").length) {
		return;
	}

	// 1. إذا كانت القائمة مفتوحة كقائمة عائمة (الجوال والتابلت)
	if ($(".side-menu").hasClass("side-menu--mobile-menu-open")) {
		// النقر على الخلفية المعتمة أو في وسط الشاشة أو خارج روابط القائمة
		if ($target.hasClass("side-menu-backdrop") || !$target.closest(".scrollable-ref, .side-menu__link, .branding, .side-menu__content").length) {
			$(".side-menu").removeClass("side-menu--mobile-menu-open side-menu--on-hover");
			$(".close-mobile-menu").removeClass("close-mobile-menu--mobile-menu-open");
		}
	}

	// 2. على شاشات التابلت والجوال (< 1280px): النقر على محتوى الصفحة يقفل القائمة إن كانت غير ثابتة
	if (window.innerWidth < 1280) {
		if ($target.closest(".content, .top-bar, .page-container, #body, main, .main-section").length) {
			$(".side-menu").removeClass("side-menu--mobile-menu-open side-menu--on-hover");
			$(".side-menu").addClass("side-menu--collapsed");
			$(".content").addClass("content--compact");
		}
	}
});

// نقل أزرار الإجراءات المخصصة على شاشة التابلت إلى أول قائمة 3 نقاط مثل الجوال
function syncTabletActionsToMenu() {
	if (window.innerWidth > 1024) return;

	const $menu = $(".page-actions .menu-btn-group .dropdown-menu, .page-head .menu-btn-group .dropdown-menu").first();
	if (!$menu.length) return;

	const itemsToPrepend = [];

	$(".page-actions .inner-group-button, .page-actions .custom-btn-group, .page-actions .custom-actions button, .page-head .custom-actions button").each(function () {
		const $btn = $(this);
		if ($btn.hasClass("dropdown") || $btn.hasClass("btn-group")) {
			const groupTitle = $btn.find(".dropdown-toggle").text().trim();
			$btn.find(".dropdown-menu li, .dropdown-menu a").each(function () {
				const $item = $(this);
				const itemText = $item.text().trim();
				if (!itemText) return;
				const fullLabel = groupTitle ? (groupTitle + " > " + itemText) : itemText;

				if (!$menu.find(`[data-tablet-action="${fullLabel}"]`).length) {
					const $newLi = $(`<li><a class="dropdown-item grey-link cursor-pointer font-bold" data-tablet-action="${fullLabel}" style="font-weight: 600; color: var(--primary, #3867AE);"><span>${fullLabel}</span></a></li>`);
					$newLi.on("click", function (e) {
						e.preventDefault();
						$item.trigger("click");
					});
					itemsToPrepend.push($newLi);
				}
			});
		} else {
			const label = $btn.text().trim();
			if (!label || label === "..." || label === "Menu" || label === "القائمة" || label.length < 2) return;

			if (!$menu.find(`[data-tablet-action="${label}"]`).length) {
				const $newLi = $(`<li><a class="dropdown-item grey-link cursor-pointer font-bold" data-tablet-action="${label}" style="font-weight: 600; color: var(--primary, #3867AE);"><span>${label}</span></a></li>`);
				$newLi.on("click", function (e) {
					e.preventDefault();
					$btn.trigger("click");
				});
				itemsToPrepend.push($newLi);
			}
		}
	});

	if (itemsToPrepend.length) {
		if (!$menu.find(".tablet-injected-divider").length) {
			const $divider = $('<li class="divider dropdown-divider tablet-injected-divider" style="margin: 6px 0; border-top: 1px solid #e2e8f0;"></li>');
			$menu.prepend($divider);
		}
		for (let i = itemsToPrepend.length - 1; i >= 0; i--) {
			$menu.prepend(itemsToPrepend[i]);
		}
	}
}

$(document).on("click", ".menu-btn-group button, .page-actions .menu-btn-group", function () {
	syncTabletActionsToMenu();
});

$(document).on("page-change form-refresh", function () {
	setTimeout(syncTabletActionsToMenu, 300);
});

if (window.frappe && frappe.router) {
	frappe.router.on("change", function () {
		setTimeout(syncTabletActionsToMenu, 500);
	});
}