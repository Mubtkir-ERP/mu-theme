$(document).on("click", "#navbar-search+ul li", (e) => {
    $("#quick-search").trigger("click")
})

$(".searchbar").on("click", (e) => {
    let interval  = setInterval(() => {
        if ($("#navbar-search:visible")) {
            $("#navbar-search").focus()
            clearInterval(interval)
        }
    }, 300);
})

$("#navbar-search").on("keydown", (e) => {
    if (e.key === "Enter" || e.keyCode === 13) {
        $("#quick-search").trigger("click");
    }
});

$(document).on("keydown", (e) => {
    if (e.key === "g" && e.metaKey) {
        $(".searchbar").trigger("click");
    }
});


  