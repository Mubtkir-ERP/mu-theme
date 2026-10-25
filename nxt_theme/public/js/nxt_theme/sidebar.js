// MUBTKIR — Universal Sidebar & Mobile Navigation Controller

let isSidebarToggling = false;

function openMobileSidebar(e) {
	if (e) {
		e.preventDefault();
		e.stopPropagation();
	}
	if (isSidebarToggling) return;
	isSidebarToggling = true;

	$(".side-menu").addClass("side-menu--mobile-menu-open");
	$(".nxt-sidebar-backdrop").addClass("active");

	setTimeout(function () {
		isSidebarToggling = false;
	}, 300);
}

function closeMobileSidebar(e) {
	if (e) {
		e.preventDefault();
		e.stopPropagation();
	}
	if (isSidebarToggling) return;
	isSidebarToggling = true;

	$(".side-menu").removeClass("side-menu--mobile-menu-open side-menu--on-hover");
	$(".nxt-sidebar-backdrop").removeClass("active");

	setTimeout(function () {
		isSidebarToggling = false;
	}, 300);
}

function closeSidebarAllScreens() {
	closeMobileSidebar();
	// On desktop, collapse sidebar
	$(".side-menu").addClass("side-menu--collapsed");
	$(".content, .nxt-main-wrapper").addClass("content--compact");
	try {
		localStorage.setItem("compactMenu", "true");
	} catch (e) {}
}

// 1. فتح القائمة الجانبية (حدث click فقط مع قفل زمني لمنع الازدواجية وإغلاقها فورياً)
$(document).on("click", ".open-mobile-menu", openMobileSidebar);

// 2. إغلاق القائمة عند النقر على الخلفية المعتمة المستقلة
$(document).on("click", ".nxt-sidebar-backdrop, .close-mobile-menu", closeMobileSidebar);

// 3. إغلاق القائمة عند النقر في وسط الصفحة (خارج القائمة) على الجوال والتابلت
$(document).on("click", function (e) {
	if (isSidebarToggling) return;
	if (window.innerWidth >= 1280) return;

	const $target = $(e.target);

	// إذا لم تكن القائمة مفتوحة، لا تفعل شيئاً
	if (!$(".side-menu").hasClass("side-menu--mobile-menu-open")) return;

	// إذا كان النقر على زر الفتح أو داخل السايدبار، لا نغلق
	if ($target.closest(".open-mobile-menu, .side-menu").length) return;

	// خلاف ذلك (نقر في وسط الشاشة أو في محتوى الصفحة): إغلاق القائمة
	closeMobileSidebar(e);
});

// 4. النقر على روابط القائمة الجانبية للانتقال
$(document).on("click", ".link_to_page", function (e) {
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

// 5. نقل أزرار الإجراءات المخصصة على شاشة التابلت إلى أول قائمة 3 نقاط
function syncTabletActionsToMenu() {
	if (window.innerWidth <= 768 || window.innerWidth > 1024) return;

	const $menu = $(".page-actions .menu-btn-group .dropdown-menu, .page-head .menu-btn-group .dropdown-menu").first();
	if (!$menu.length) return;

	const itemsToPrepend = [];

	$(".page-actions .inner-group-button, .page-actions .custom-btn-group, .page-actions .custom-actions button, .page-head .custom-actions button, .page-head .inner-group-button").each(function () {
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