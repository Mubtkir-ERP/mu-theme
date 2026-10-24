function closeSidebarAllScreens() {
	// 1. للشاشات الصغيرة والمتوسطة (الجوال والتابلت): إغلاق القائمة المنبثقة
	$(".side-menu").removeClass("side-menu--mobile-menu-open");
	$(".close-mobile-menu").removeClass("close-mobile-menu--mobile-menu-open");

	// 2. للشاشات الكبيرة (Desktop): تصغير القائمة تلقائياً لإعطاء مساحة كاملة لمساحة العمل
	$(".side-menu").addClass("side-menu--collapsed");
	$(".content").addClass("content--compact");
	try {
		localStorage.setItem("compactMenu", "true");
	} catch (e) {}
}

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

// إغلاق قائمة الجوال عند النقر في أي مكان خارجها (Backdrop click)
$(document).on("click", (e) => {
	if ($(".side-menu").hasClass("side-menu--mobile-menu-open")) {
		if (!$(e.target).closest(".side-menu__content, .open-mobile-menu").length) {
			$(".side-menu").removeClass("side-menu--mobile-menu-open");
			$(".close-mobile-menu").removeClass("close-mobile-menu--mobile-menu-open");
		}
	}
});