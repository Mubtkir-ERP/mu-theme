$(document).on("click", ".link_to_page", (e) => {
	let el = e.currentTarget;
	
	let title = $(el).data("title")
	let is_public = $(el).data("is_public")
	let is_link = $(el).data("is_link")

	if(is_link) {
		frappe.set_route("List", title)
		return;
	}

	let url = "/app/" 
	url += is_public ? frappe.router.slug(title): "private/" + frappe.router.slug(title)

	frappe.set_route(url)
})