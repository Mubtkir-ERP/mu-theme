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
		if (!$target.closest(".side-menu__content, .scrollable-ref").length) {
			$(".side-menu").removeClass("side-menu--mobile-menu-open side-menu--on-hover");
			$(".close-mobile-menu").removeClass("close-mobile-menu--mobile-menu-open");
		}
	}

	// 2. على شاشات التابلت والجوال (< 1280px): النقر على محتوى الصفحة يقفل القائمة إن كانت غير ثابتة
	if (window.innerWidth < 1280) {
		if ($target.closest(".content, .top-bar, .page-container, #body").length) {
			$(".side-menu").removeClass("side-menu--mobile-menu-open side-menu--on-hover");
			$(".side-menu").addClass("side-menu--collapsed");
			$(".content").addClass("content--compact");
		}
	}
});