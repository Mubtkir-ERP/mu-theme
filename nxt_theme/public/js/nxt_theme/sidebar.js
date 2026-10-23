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

$(document).on("click", ".link_to_page", (e) => {
	let el = e.currentTarget;
	
	let title = $(el).data("title");
	let is_public = $(el).data("is_public");
	let is_link = $(el).data("is_link");
	
	let hasSubMenu = $(el).parent().find("ul").length > 0;

	if (is_link) {
		frappe.set_route("List", title);
		closeSidebarAllScreens();
		return;
	}

	// إذا كان عنصراً رئيسياً له قائمة فرعية، يفتح القائمة الفرعية فقط ولا يغلق
	if (hasSubMenu) {
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