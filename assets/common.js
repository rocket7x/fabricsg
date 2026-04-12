var mouse_is_inside = false;
let currentVideo;

if (typeof window.Shopify == "undefined") {
    window.Shopify = {};
}

const scrollbarWidth = window.innerWidth - document.body.clientWidth;
if (scrollbarWidth > 0) {
  document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
}

function debounce(fn, wait = 300) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    };
}

Shopify.bind = function (fn, scope) {
    return function () {
        return fn.apply(scope, arguments);
    };
};

Shopify.setSelectorByValue = function (selector, value) {
    for (var i = 0, count = selector.options.length; i < count; i++) {
        var option = selector.options[i];
        if (value == option.value || value == option.innerHTML) {
            selector.selectedIndex = i;
            return i;
        }
    }
};

Shopify.addListener = function (target, eventName, callback) {
    target.addEventListener ?
        target.addEventListener(eventName, callback, false) :
        target.attachEvent("on" + eventName, callback);
};

Shopify.postLink = function (path, options) {
    options = options || {};
    var method = options["method"] || "post";
    var parameters = options["parameters"] || {};

    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for (var key in parameters) {
        var fields = document.createElement("input");
        fields.setAttribute("type", "hidden");
        fields.setAttribute("name", key);
        fields.setAttribute("value", parameters[key]);
        form.appendChild(fields);
    }
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function (
    country_domid,
    province_domid,
    options
) {
    var countryElement = document.querySelectorAll("#" + country_domid);
    var provinceElement = document.querySelectorAll("#" + province_domid);
    var provinceContainerEl = document.querySelectorAll(
        "#" + options["hideElement"] || "#" + province_domid
    );
    if (countryElement.length > 0) {
        this.countryEl = countryElement[0];
        this.provinceEl = provinceElement[0];
        this.provinceContainer = provinceContainerEl[0];
        if (countryElement[1]) {
            this.countryEl = countryElement[1];
        }
        if (provinceElement[1]) {
            this.provinceEl = provinceElement[1];
        }
        if (provinceContainerEl[1]) {
            this.provinceContainer = provinceContainerEl[1];
        }
        Shopify.addListener(
            this.countryEl,
            "change",
            Shopify.bind(this.countryHandler, this)
        );
        this.initCountry();
        this.initProvince();
    }
};

Shopify.CountryProvinceSelector.prototype = {
    initCountry: function () {
        var value = this.countryEl.getAttribute("data-default");
        Shopify.setSelectorByValue(this.countryEl, value);
        this.countryHandler();
    },

    initProvince: function () {
        var value = this.provinceEl.getAttribute("data-default");
        if (value && this.provinceEl.options.length > 0) {
            Shopify.setSelectorByValue(this.provinceEl, value);
        }
    },

    countryHandler: function (e) {
        var opt = this.countryEl.options[this.countryEl.selectedIndex];
        var raw = opt.getAttribute("data-provinces");
        var provinces = JSON.parse(raw);
        this.clearOptions(this.provinceEl);
        if (provinces && provinces.length == 0) {
            this.provinceContainer.style.display = "none";
        } else {
            for (var i = 0; i < provinces.length; i++) {
                var opt = document.createElement("option");
                opt.value = provinces[i][0];
                opt.innerHTML = provinces[i][1];
                this.provinceEl.appendChild(opt);
            }
            this.provinceContainer.style.display = "";
        }
    },

    clearOptions: function (selector) {
        while (selector.firstChild) {
            selector.removeChild(selector.firstChild);
        }
    },

    setOptions: function (selector, values) {
        for (var i = 0, count = values.length; i < values.length; i++) {
            var opt = document.createElement("option");
            opt.value = values[i];
            opt.innerHTML = values[i];
            selector.appendChild(opt);
        }
    },
};

if (typeof Shopify === "undefined") {
    Shopify = {};
}
if (!Shopify.formatMoney) {
    Shopify.formatMoney = function (cents, format) {
        var value = "",
            placeholderRegex = /\{\{\s*(\w+)\s*\}\}/,
            formatString = format || this.money_format;
        if (typeof cents == "string") {
            cents = cents.replace(".", "");
        }
        function defaultOption(opt, def) {
            return typeof opt == "undefined" ? def : opt;
        }
        function formatWithDelimiters(number, precision, thousands, decimal) {
            precision = defaultOption(precision, 2);
            thousands = defaultOption(thousands, ",");
            decimal = defaultOption(decimal, ".");
            if (isNaN(number) || number == null) {
                return 0;
            }
            number = (number / 100.0).toFixed(precision);
            var parts = number.split("."),
                dollars = parts[0].replace(
                    /(\d)(?=(\d\d\d)+(?!\d))/g,
                    "$1" + thousands
                ),
                cents = parts[1] ? decimal + parts[1] : "";
            return dollars + cents;
        }
        switch (formatString.match(placeholderRegex)[1]) {
            case "amount":
                value = formatWithDelimiters(cents, 2);
                break;
            case "amount_no_decimals":
                value = formatWithDelimiters(cents, 0);
                break;
            case "amount_with_comma_separator":
                value = formatWithDelimiters(cents, 2, ".", ",");
                break;
            case "amount_no_decimals_with_comma_separator":
                value = formatWithDelimiters(cents, 0, ".", ",");
                break;
            case "amount_no_decimals_with_space_separator":
                value = formatWithDelimiters(cents, 0, " ", " ");
                break;
        }
        return formatString.replace(placeholderRegex, value);
    };
}

var DOMAnimations = {
    slideUp: function (element, duration = 500) {
        return new Promise(function (resolve, reject) {
            if(element){
                element.style.height = element.offsetHeight + "px";           
                element.style.transitionProperty = `height, margin, padding`;
                element.style.transitionDuration = duration + "ms";
                element.offsetHeight;
                element.style.overflow = "hidden";
                element.style.height = 0;
                element.style.paddingTop = 0;
                element.style.paddingBottom = 0;
                element.style.marginTop = 0;
                element.style.marginBottom = 0;
                window.setTimeout(function () {
                    element.style.display = "none";
                    element.style.removeProperty("height");
                    element.style.removeProperty("padding-top");
                    element.style.removeProperty("padding-bottom");
                    element.style.removeProperty("margin-top");
                    element.style.removeProperty("margin-bottom");
                    element.style.removeProperty("overflow");
                    element.style.removeProperty("transition-duration");
                    element.style.removeProperty("transition-property");
                    resolve(false);
                }, duration);
            }
        });
    },

    slideDown: function (element, duration = 500) {
        return new Promise(function (resolve, reject) {
            if(element){
                element.style.removeProperty("display");
                let display = window.getComputedStyle(element).display;
                if (display === "none") display = "block";
                element.style.display = display;
                let height = element.offsetHeight;
                element.style.overflow = "hidden";
                element.style.height = 0;
                element.style.paddingTop = 0;
                element.style.paddingBottom = 0;
                element.style.marginTop = 0;
                element.style.marginBottom = 0;
                element.offsetHeight;
                element.style.transitionProperty = `height, margin, padding`;
                element.style.transitionDuration = duration + "ms";
                element.style.height = height + "px";
                element.style.removeProperty("padding-top");
                element.style.removeProperty("padding-bottom");
                element.style.removeProperty("margin-top");
                element.style.removeProperty("margin-bottom");
                window.setTimeout(function () {
                    element.style.removeProperty("height");
                    element.style.removeProperty("overflow");
                    element.style.removeProperty("transition-duration");
                    element.style.removeProperty("transition-property");
                }, duration);
            }
        });
    },

    slideToggle: function (element, duration = 500) {
        if (window.getComputedStyle(element).display === "none") {
            return this.slideDown(element, duration);
        } else {
            return this.slideUp(element, duration);
        }
    },

    classToggle: function (element, className) {
        if (element.classList.contains(className)) {
            element.classList.remove(className);
        } else {
            element.classList.add(className);
        }
    },
};

if (!Element.prototype.fadeIn) {
    Element.prototype.fadeIn = function () {
        let ms = !isNaN(arguments[0]) ? arguments[0] : 400,
            func =
                typeof arguments[0] === "function" ?
                    arguments[0] :
                    typeof arguments[1] === "function" ?
                        arguments[1] :
                        null;
        this.style.opacity = 0;
        this.style.filter = "alpha(opacity=0)";
        this.style.display = "inline-block";
        this.style.visibility = "visible";
        let $this = this,
            opacity = 0,
            timer = setInterval(function () {
                opacity += 50 / ms;
                if (opacity >= 1) {
                    clearInterval(timer);
                    opacity = 1;
                    if (func) func("done!");
                }
                $this.style.opacity = opacity;
                $this.style.filter = "alpha(opacity=" + opacity * 100 + ")";
            }, 50);
    };
}

if (!Element.prototype.fadeOut) {
    Element.prototype.fadeOut = function () {
        let ms = !isNaN(arguments[0]) ? arguments[0] : 400,
            func =
                typeof arguments[0] === "function" ?
                    arguments[0] :
                    typeof arguments[1] === "function" ?
                        arguments[1] :
                        null;
        let $this = this,
            opacity = 1,
            timer = setInterval(function () {
                opacity -= 50 / ms;
                if (opacity <= 0) {
                    clearInterval(timer);
                    opacity = 0;
                    $this.style.display = "none";
                    $this.style.visibility = "hidden";
                    if (func) func("done!");
                }
                $this.style.opacity = opacity;
                $this.style.filter = "alpha(opacity=" + opacity * 100 + ")";
            }, 50);
    };
}

/** All Menu Hide **/

function hideallMenus(menus, current) {
    Array.from(menus).forEach(function (menu) {
        var menuList = menu.nextElementSibling;
        var menuParent = menu.parentNode;
        if (menu == current) {
            return;
        } else {
            menuParent.classList.remove("active");
            DOMAnimations.slideUp(menuList);
        }
    });
}

function pad2(number) {
    return (number < 10 ? "0" : "") + number;
}

function screenVisibility(elem) {
    if (elem.length == 0) {
        return;
    }
    var $window = $(window);
    var viewport_top = $window.scrollTop();
    var viewport_height = $window.height();
    var viewport_bottom = viewport_top + viewport_height;
    var $elem = elem;
    var top = $elem.offset().top;
    var height = $elem.height();
    var bottom = top + height;
    return (
        (top >= viewport_top && top < viewport_bottom) ||
        (bottom > viewport_top && bottom <= viewport_bottom) ||
        (height > viewport_height &&
            top <= viewport_top &&
            bottom >= viewport_bottom)
    );
}

function isOnScreen(elem, form) {
    // if the element doesn't exist, abort
    if (elem.length == 0) {
        return;
    }
    var $window = $(window);
    var viewport_top = $window.scrollTop();
    var viewport_height = $window.height();
    var viewport_bottom = viewport_top + viewport_height;
    var $elem = $(elem);
    var top = $elem.offset().top;
    if (!form) {
        if ($(window).width() > 768) {
            top = top + 400;
        }
    }
    var height = $elem.height();
    var bottom = top + height;
    return (
        (top >= viewport_top && top < viewport_bottom) ||
        (bottom > viewport_top && bottom <= viewport_bottom) ||
        (height > viewport_height &&
            top <= viewport_top &&
            bottom >= viewport_bottom)
    );
}

jQuery.fn.scrollTo = function (elem) {
    $(this).scrollTop(
        $(this).scrollTop() - $(this).offset().top + $(elem).offset().top
    );
    return this;
};

function truncate(str, no_words) {
    var length = str.split(" ").length;
    var _value = str.split(" ").splice(0, no_words).join(" ");
    if (length > no_words) {
        _value = _value + "..";
    }
    return _value;
}

function toggleDropdown(id) {
    var x = document.getElementById(id);
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function roundToTwo(num) {
    return +(Math.round(num + "e+2") + "e-2");
}

function listElementsForFocus(wrapper) {
    let elementsList = Array.from(
        wrapper[0].querySelectorAll(
            "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
        )
    );
    return elementsList;
}
const focusElementsList = {};

function focusElementsRotation(wrapper) {
    stopFocusElementsRotation();
    let elements = listElementsForFocus(wrapper);
    let first = elements[0];
    let last = elements[elements.length - 1];
    focusElementsList.focusin = (e) => {
        if (e.target !== wrapper[0] && e.target !== last && e.target !== first)
            return;
        document.addEventListener("keydown", focusElementsList.keydown);
    };

    focusElementsList.focusout = function () {
        document.removeEventListener("keydown", focusElementsList.keydown);
    };

    focusElementsList.keydown = function (e) {
        if (e.code.toUpperCase() !== "TAB") return;
        if (e.target === last && !e.shiftKey) {
            e.preventDefault();
            first.focus();
        }
        if ((e.target === wrapper[0] || e.target === first) && e.shiftKey) {
            e.preventDefault();
            last.focus();
        }
    };
    document.addEventListener("focusout", focusElementsList.focusout);
    document.addEventListener("focusin", focusElementsList.focusin);
}

function stopFocusElementsRotation() {
    document.removeEventListener("focusin", focusElementsList.focusin);
    document.removeEventListener("focusout", focusElementsList.focusout);
    document.removeEventListener("keydown", focusElementsList.keydown);
}
productVariants = function (section = document) {
    var productContainers = section.getElementsByClassName(
        "yv_product_content_section"
    );
    Array.from(productContainers).forEach(function (productContainer, index) {
        let selectIds = productContainer.querySelectorAll('[name="id"]');
        Array.from(selectIds).forEach(function (selectId) {
            selectId.removeAttribute("disabled");
        });
        var productOptions =
            productContainer.getElementsByClassName("productOption");
        if (productOptions) {
            var options = [];
            eventType = "click";
            let triggeredEvent = false;
            if (variantStyle == "dropdown") {
                eventType = "change";
            }
            Array.from(productOptions).forEach(function (productOption, index) {
                productOption.addEventListener(eventType, () => {
                    var _productParent = productOption.closest(".yv_product_content_section");
                    setTimeout(function () {
                        let optionValue = productOption.value;
                        let optionName = productOption.getAttribute("name");
                        let productPageSection = _productParent.closest(".shopify-section");
                        if (productPageSection) {
                            let getStickyOption = productPageSection
                                .closest(".shopify-section")
                                .querySelector('select[name="sticky-' + optionName + '"]');
                            if (getStickyOption) {
                                getStickyOption.value = optionValue;
                            }
                        }
                        if (
                            productOption
                                .closest(".product-option-selector")
                                .querySelector("[data-option-value]")
                        ) {
                            productOption
                                .closest(".product-option-selector")
                                .querySelector("[data-option-value]").textContent = optionValue;
                        }
                        const fieldsets = Array.from(
                            _productParent.querySelectorAll(".product-loop-variants")
                        );
                        if (variantStyle == "dropdown") {
                            options = fieldsets.map((fieldset) => {
                                return Array.from(fieldset.querySelectorAll("select")).find(
                                    (select) => select
                                ).value;
                            });
                        } else {
                            options = fieldsets.map((fieldset) => {
                                return Array.from(fieldset.querySelectorAll("input")).find(
                                    (radio) => radio.checked
                                )?.value;
                            });
                        }
                        let productOptionsWithValues = "";
                        if (
                            _productParent.querySelector(
                                '[type="application/json"][data-name="main-product-options"]'
                            )
                        ) {
                            productOptionsWithValues = JSON.parse(
                                _productParent.querySelector(
                                    '[type="application/json"][data-name="main-product-options"]'
                                ).textContent
                            );
                        }
                        var getVariant = variantChange(options, "options", _productParent);
                        if (variantStyle == "swatch") {
                            var selectedElement = productOption;
                        } else {
                            var selectedElement = productOption.selectedOptions[0];
                        }
                        if (selectedElement && selectedElement.hasAttribute('data-product-url')) {
                            let requestURL = selectedElement.dataset.productUrl;
                            let optionValues = Array.from(
                                productOption.closest(".yv_product_content_section").querySelectorAll("select.productOption")
                            ).map((element) => element.selectedOptions[0].dataset.valueProductId);
                            if (variantStyle == "swatch") {
                                optionValues = Array.from(
                                    productOption.closest(".yv_product_content_section").querySelectorAll("input.productOption:checked")
                                ).map(({ dataset }) => dataset.valueProductId);
                            }
                            requestURL += `?option_values=${optionValues}`;
                            Array.from(productOption.closest(".product-loop-variants").querySelectorAll("[data-product-url]")).map(({ dataset }) => dataset.valueProductId);
                            const uniqueValues = Array.from(productOption.closest(".product-loop-variants").querySelectorAll("[data-product-url]")).reduce((acc, current) => {
                                if (!acc.includes(current.dataset.productUrl)) {
                                    acc.push(current.dataset.productUrl);
                                }
                                return acc;
                            }, []);
                            if (uniqueValues.length == 1 || _productParent.classList.contains("yv-quickview_product_wrapper")) {
                                requestURL += `&view=quick-view`;
                            }
                            fetch(requestURL)
                                .then((response) => response.text())
                                .then((text) => {
                                    var updatedProductHTML = new DOMParser().parseFromString(
                                        text,
                                        "text/html"
                                    );
                                    if (uniqueValues.length == 1 || _productParent.classList.contains("yv-quickview_product_wrapper")) {
                                        if (updatedProductHTML.querySelector(".yv-quickview_product_wrapper")) {
                                            _productParent.innerHTML =
                                                updatedProductHTML.querySelector(".yv-quickview_product_wrapper").innerHTML;
                                            productVariants(_productParent.closest('[data-drawer-body]'));
                                            $(window).trigger('resize');
                                            productOnLoadEvents();
                                            quantityChange();
                                            onReadyEvent();
                                        }
                                    } else {
                                        if (
                                            document.querySelector("main#MainContent") &&
                                            updatedProductHTML.querySelector("main#MainContent")
                                        ) {
                                            document.querySelector("main#MainContent").innerHTML =
                                                updatedProductHTML.querySelector("main#MainContent").innerHTML;
                                            docOnLoad();
                                            productOnLoadEvents();
                                            onReadyEvent();
                                        }
                                    }
                                    if (_productParent.classList.contains("main-product-section")) {
                                        var _updateUrl = selectedElement.dataset.productUrl;
                                        window.history.replaceState({}, null, _updateUrl);
                                    }
                                    onloadEvents();
                                    if (Shopify.PaymentButton) {
                                        Shopify.PaymentButton.init();
                                    }
                                })
                                .catch((e) => { });
                        }
                        else {
                            if (getVariant) {
                                var _productSection = _productParent.closest(".shopify-section");
                                priceUpdate(_productSection, priceContainer, getVariant, true);
                                let sectionId = `&section_id=${_productParent.dataset.section}`;
                                let productURL = _productParent.dataset.url;
                                if (_productParent.classList.contains("yv-quickview_product_wrapper")) {
                                    sectionId = `&view=quick-view`;
                                }
                                let requestURL = `${productURL}?variant=${getVariant.id}${sectionId}&timestamp=${Date.now()}`;
                                fetch(requestURL)
                                    .then((response) => response.text())
                                    .then((text) => {
                                        var updatedProductHTML = new DOMParser().parseFromString(
                                            text,
                                            "text/html"
                                        );
                                        if (_productParent.querySelector('[data-price-main]') && updatedProductHTML.querySelector('[data-price-main]')) {
                                            _productParent.querySelector('[data-price-main]').innerHTML = updatedProductHTML.querySelector('[data-price-main]').innerHTML
                                        }
                                        if (_productParent.querySelector('[data-price-sticky]') && updatedProductHTML.querySelector('[data-price-sticky]')) {
                                            _productParent.querySelector('[data-price-sticky]').innerHTML = updatedProductHTML.querySelector('[data-price-sticky]').innerHTML
                                        }
                                        if (_productParent.querySelector('[data-product-quantity-wrapper]') && updatedProductHTML.querySelector('[data-product-quantity-wrapper]')) {
                                            _productParent.querySelector('[data-product-quantity-wrapper]').innerHTML = updatedProductHTML.querySelector('[data-product-quantity-wrapper]').innerHTML;
                                            quantityChange();
                                        }
                                    })
                                    .catch((e) => { });
                            }
                            updateBackInStock(getVariant, productContainer);
                            let prodAvailability = document.querySelector(
                                "[data-product-availability]"
                            );
                            let prodSku = document.querySelector("[data-product-sku]");
                            if (prodAvailability) {
                                if (getVariant.available) {
                                    prodAvailability.innerHTML = "In stock";
                                } else {
                                    prodAvailability.innerHTML = "Out of stock";
                                }
                            }
                            if (prodSku) {
                                if (getVariant.sku != "") {
                                    prodSku.innerHTML = getVariant.sku;
                                } else {
                                    prodSku.innerHTML = "--";
                                }
                            }
                            let variantData = "";
                            if (
                                _productParent.querySelector(
                                    '[type="application/json"][data-name="variant-json"]'
                                )
                            ) {
                                variantData = JSON.parse(
                                    _productParent.querySelector(
                                        '[type="application/json"][data-name="variant-json"]'
                                    ).textContent
                                );
                            }
                            if (!productContainer.querySelector('[data-combined-listing-product]')) {
                                if (productOptionsWithValues != "" && variantData != "") {
                                    updateOptionsAvailability(
                                        variantData,
                                        productOptionsWithValues,
                                        getVariant,
                                        fieldsets,
                                        variantStyle
                                    );
                                }
                            }
                            var buttonWrapper = _productParent.querySelector("[data-button-wrapper]");
                            var paymentButtonWrapper = _productParent.querySelector(".Sd_addProduct");
                            var termsConditionCheckbox = "";
                            var paymentButton = paymentButtonWrapper.querySelector("span");
                            if (_productParent) {
                                termsConditionCheckbox = _productParent.querySelector(
                                    "[data-terms-conditions-wrapper]"
                                );
                            }
                            let stickyPaymentButton = "";
                            let stickyPaymentButtonWrapper = "";
                            if (productPageSection) {
                                stickyPaymentButtonWrapper = productPageSection.querySelector(
                                    ".Sd_addProductSticky"
                                );
                                if (stickyPaymentButtonWrapper) {
                                    stickyPaymentButton =
                                        stickyPaymentButtonWrapper.querySelector("span");
                                }
                            }
                            var advancePayment = paymentButtonWrapper.querySelector(
                                ".shopify-payment-button"
                            );
                            var priceContainer = _productParent.querySelector(
                                "[data-price-wrapper]"
                            );
                            let variantSku = "";
                            if (getVariant && getVariant.sku) {
                                variantSku = getVariant.sku;
                            }
                            let errorWrappers =
                                productPageSection.querySelectorAll(".productErrors");
                            if (errorWrappers) {
                                Array.from(errorWrappers).forEach(function (errorWrapper) {
                                    errorWrapper.innerHTML = "";
                                    errorWrapper.style.display = "none";
                                });
                            }
                            let variantSkuContainer = _productParent.querySelector(
                                "[data-variant-sku ]"
                            );
                            if (variantSkuContainer) {
                                variantSkuContainer.innerHTML = variantSku;
                            }
                            sellingPlans(getVariant, _productParent);
                            if (getVariant != undefined) {
                                if (getVariant.featured_media != null) {
                                    /* update media based on selected variant start */
                                    var image = getVariant.featured_media.id;
                                    var varints = getVariant.options;
                                    let imageAlt = getVariant.featured_media.alt;
                                    if (imageAlt != null) {
                                        imageAlt = imageAlt.toLowerCase();
                                    }
                                    let thumbSelector = $(".gallery__slide-img").closest(
                                        ".data-thumb-slider"
                                    );
                                    var mainSliderSelector = $(".yv-product-image-item").closest(
                                        ".yv-product-big-slider"
                                    );
                                    var mainSliderImages = mainSliderSelector.find(
                                        '.yv-product-image-item[variant-color="' + imageAlt + '"]'
                                    );
                                    var allSliderImages = mainSliderSelector.find(
                                        ".yv-product-image-item"
                                    );
                                    var videoSlides = $(
                                        '.yv-product-video-item[variant-color="' + imageAlt + '"]'
                                    );
                                    var allVideoSlides = $("yv-product-video-item");
                                    var ModelSlides = $(
                                        '.yv-product-model-item[variant-color="' + imageAlt + '"]'
                                    );
                                    var allModelSlides = $(".yv-product-model-item");

                                    if (mainSliderImages.length > 0) {
                                        if (mainSliderSelector.hasClass("flickity-enabled")) {
                                            productSlider.destroy();
                                        }
                                        allSliderImages.hide();
                                        allSliderImages
                                            .find("a.yv-product-zoom")
                                            .attr("data-fancybox", "none");
                                        allModelSlides.hide();
                                        mainSliderImages.fadeIn("slow");
                                        mainSliderImages
                                            .find("a.yv-product-zoom")
                                            .attr(
                                                "data-fancybox",
                                                "gallery" + _productSection.getAttribute("id")
                                            );
                                        videoSlides.show();
                                        ModelSlides.show();
                                        initProductSlider();
                                    }
                                    var mainThumbSliderImages = $(
                                        '.gallery__slide-img[variant-color="' + imageAlt + '"]'
                                    );
                                    var allThumSliderImages = $(".gallery__slide-img");
                                    if (mainThumbSliderImages.length > 0) {
                                        if (thumbSelector.hasClass("flickity-enabled")) {
                                            productThumbSlider.destroy();
                                        }
                                        allThumSliderImages.hide();
                                        mainThumbSliderImages.fadeIn("slow");
                                        initProductThumbSlider();
                                    }
                                    var selected_attribute = $(
                                        '.gallery-thumbs-item[variant-color="' + imageAlt + '"]'
                                    );
                                    var thumbimage = $(".gallery-thumbs-item");
                                    if (selected_attribute.length > 0) {
                                        thumbimage.hide();
                                        selected_attribute.fadeIn("slow");
                                    }
                                    var mainSelectedImages = $(
                                        '.gallery-main-item[variant-color="' + imageAlt + '"]'
                                    );
                                    var allMainImages = $(".gallery-main-item");
                                    if (mainSelectedImages.length > 0) {
                                        allMainImages.hide();
                                        allMainImages
                                            .find("a.yv-product-zoom")
                                            .attr("data-fancybox", "none");
                                        mainSelectedImages.fadeIn("slow");
                                        mainSelectedImages
                                            .find("a.yv-product-zoom")
                                            .attr(
                                                "data-fancybox",
                                                "gallery" + _productSection.getAttribute("id")
                                            );
                                    }
                                }
                                /* update media based on selected variant stop*/
                                /* update media based on selected variant in quick add start*/
                                if (
                                    getVariant.featured_image != null &&
                                    productPageSection.classList.contains("quick-add-popup")
                                ) {
                                    let variantImage = getVariant.featured_image;
                                    let currentVariantImage =
                                        productPageSection.querySelector(`.product-img.active`);
                                    let selectedVariantImage = productPageSection.querySelector(
                                        `.product-img-${variantImage}`
                                    );
                                    if (selectedVariantImage && currentVariantImage) {
                                        currentVariantImage.classList.add("hidden");
                                        selectedVariantImage.classList.remove("hidden");
                                        currentVariantImage.classList.remove("active");
                                        selectedVariantImage.classList.add("active");
                                    }
                                }
                                /* update media based on selected variant in quick add stop*/
                                if (_productParent.querySelector("shopify-payment-terms")) {
                                    _productParent.querySelector("shopify-payment-terms").style.display = "block";
                                }
                                if (
                                    getVariant.id != _productParent.querySelector('[name="id"]').value
                                ) {
                                    //variant image change
                                    if (getVariant.featured_media != null) {
                                        let sectionId = productPageSection.getAttribute("id");
                                        var image = getVariant.featured_media.id;
                                        var imageSource = jQuery("#" + sectionId).find('[data-image="media-' + image + '"]');
                                        if (imageSource) {
                                            var imageIndex = imageSource.index();
                                            var slider = imageSource.closest("[data-flickity-slider]");
                                            if (slider.length == 0) {
                                                slider = imageSource.closest(
                                                    "[data-flickity-product-slider]"
                                                );
                                            }
                                            if (
                                                productSlider != undefined ||
                                                (Flickity.data(slider[0]) &&
                                                    sectionId == "product-quick-view")
                                            ) {
                                                if (
                                                    Flickity.data(slider[0]) &&
                                                    sectionId == "product-quick-view"
                                                ) {
                                                    Flickity.data(slider[0]).select(imageIndex);
                                                } else {
                                                    productSlider.select(imageIndex);
                                                }
                                            } else {
                                                if (slider && slider.hasClass("flickity-enabled")) {
                                                    slider.flickity("select", imageIndex);
                                                    if ($(window).width() < 768) {
                                                        let sliderImage = jQuery("body")
                                                            .find("#" + sectionId)
                                                            .find("#media-main-" + image);
                                                        if (sliderImage.length > 0) {
                                                            jQuery("html,body").animate({
                                                                scrollTop: imageSource.offset().top - top,
                                                            });
                                                            let sliderImageParent = sliderImage.parent();
                                                            sliderImageParent.scrollLeft(
                                                                sliderImageParent.scrollLeft() +
                                                                sliderImage.position().left
                                                            );
                                                        }
                                                    }
                                                } else if (slider.hasClass("gallery-item")) {
                                                    let top = 10;
                                                    top = jQuery(".shopify-section-main-header").height() + top;
                                                    jQuery("html,body").animate({
                                                        scrollTop: imageSource.offset().top - top,
                                                    });
                                                    if ($(window).width() < 768) {
                                                        let sliderImage = (sliderImage = jQuery(
                                                            "#" + sectionId
                                                        ).find("#media-main" + image));
                                                        if (sliderImage) {
                                                            let sliderImageParent = sliderImage.parent();
                                                            sliderImageParent.scrollLeft(
                                                                sliderImageParent.scrollLeft() +
                                                                sliderImage.position().left
                                                            );
                                                        }
                                                    }
                                                } else {
                                                    imageSource.click();
                                                    if ($(window).width() < 768) {
                                                        let sliderImage = jQuery("#" + sectionId).find(
                                                            "#media-" + image
                                                        );
                                                        if (sliderImage.length == 0) {
                                                            sliderImage = jQuery("#" + sectionId).find(
                                                                "#media-main-" + image
                                                            );
                                                        }
                                                        if (sliderImage.length > 0) {
                                                            let sliderImageParent = sliderImage.parent();
                                                            sliderImageParent.scrollLeft(
                                                                sliderImageParent.scrollLeft() +
                                                                sliderImage.position().left
                                                            );
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        if (getVariant.featured_media.media_type == "image" && productPageSection) {
                                            let featuredImage = productPageSection.querySelector(
                                                '[data-id="featuredImage-' + getVariant.featured_media.id + '"]'
                                            );
                                            if (featuredImage) {
                                                let featuredProductImages = productPageSection.querySelectorAll(
                                                    ".featured-prod-image"
                                                );
                                                Array.from(featuredProductImages).forEach(function (image) {
                                                    image.classList.remove("active");
                                                });
                                                featuredImage.classList.add("active");
                                                let imageIndex = Array.from(featuredProductImages).indexOf(featuredImage);           
                                                let slider = productPageSection.querySelector('[data-flickity-featured-product-slider]');
                                                if (slider && typeof Flickity !== 'undefined') {
                                                    let flickityInstance = Flickity.data(slider);
                                                    if (flickityInstance) {
                                                        flickityInstance.select(imageIndex);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    _productParent.querySelector('[name="id"]').value =
                                        getVariant.id;
                                    _productParent
                                        .querySelector('[name="id"]')
                                        .dispatchEvent(new Event("change", { bubbles: true }));
                                }
                                let inventoryBar = _productParent.querySelector(
                                    "[product__inventory]"
                                );
                                if (inventoryBar) {
                                    inventoryBar.classList.remove("hidden");
                                    updateInventroyStatusBar(
                                        getVariant.inventory_quantity,
                                        getVariant.inventory_policy
                                    );
                                }
                                var baseUrl = window.location.pathname;
                                if (_productParent.classList.contains("main-product-section")) {
                                    var _updateUrl = baseUrl + "?variant=" + getVariant.id;
                                    history.replaceState({}, null, _updateUrl);
                                }
                                pickUpAvialabiliy(true);
                                if (getVariant.available == true) {
                                    if (termsConditionCheckbox) {
                                        termsConditionCheckbox.style.display = "block";
                                    }
                                    if (!termsConditionCheckbox && buttonWrapper) {
                                        buttonWrapper.classList.remove("disabled");
                                    }
                                    if (!termsConditionCheckbox && paymentButtonWrapper) {
                                        paymentButtonWrapper.removeAttribute("disabled");
                                    }
                                    if (!termsConditionCheckbox && stickyPaymentButtonWrapper) {
                                        stickyPaymentButtonWrapper.removeAttribute("disabled");
                                    }
                                    if (paymentButton) {
                                        if (
                                            preorderStatus &&
                                            getVariant.inventory_policy == "continue" &&
                                            getVariant.inventory_quantity <= 0
                                        ) {
                                            paymentButton.innerHTML = preorderText;
                                        } else {
                                            paymentButton.innerHTML = addToCartText;
                                        }
                                    }
                                    if (stickyPaymentButton) {
                                        if (
                                            preorderStatus &&
                                            getVariant.inventory_policy == "continue" &&
                                            getVariant.inventory_quantity <= 0
                                        ) {
                                            stickyPaymentButton.innerHTML = preorderText;
                                        } else {
                                            stickyPaymentButton.innerHTML = addToCartText;
                                        }
                                    }
                                } else {
                                    if (termsConditionCheckbox) {
                                        termsConditionCheckbox.style.display = "none";
                                        if (
                                            termsConditionCheckbox.querySelector(
                                                '[name="terms_conditions"]'
                                            )
                                        ) {
                                            termsConditionCheckbox.querySelector(
                                                '[name="terms_conditions"]'
                                            ).checked = false;
                                        }
                                    }
                                    if (buttonWrapper) {
                                        buttonWrapper.classList.add("disabled");
                                    }
                                    if (stickyPaymentButtonWrapper) {
                                        stickyPaymentButtonWrapper.setAttribute("disabled", true);
                                    }
                                    if (paymentButtonWrapper) {
                                        paymentButtonWrapper.setAttribute("disabled", true);
                                    }
                                    if (stickyPaymentButton) {
                                        stickyPaymentButton.innerHTML = soldOutText;
                                    }
                                    if (paymentButton) {
                                        paymentButton.innerHTML = soldOutText;
                                    }
                                }
                            }
                            else {
                                if (termsConditionCheckbox) {
                                    termsConditionCheckbox.style.display = "none";
                                    if (
                                        termsConditionCheckbox.querySelector(
                                            '[name="terms_conditions"]'
                                        )
                                    ) {
                                        termsConditionCheckbox.querySelector(
                                            '[name="terms_conditions"]'
                                        ).checked = false;
                                    }
                                }
                                let inventoryBar = _productParent.querySelector(
                                    "[product__inventory]"
                                );
                                if (inventoryBar) {
                                    inventoryBar.classList.add("hidden");
                                }
                                if (_productParent.querySelector("shopify-payment-terms")) {
                                    _productParent.querySelector(
                                        "shopify-payment-terms"
                                    ).style.display = "none";
                                }
                                pickUpAvialabiliy(false);
                                if (buttonWrapper) {
                                    buttonWrapper.classList.add("disabled");
                                }
                                if (paymentButtonWrapper) {
                                    paymentButtonWrapper.setAttribute("disabled", true);
                                }
                                if (paymentButton) {
                                    paymentButton.innerHTML = unavailableText;
                                }
                                if (stickyPaymentButtonWrapper) {
                                    stickyPaymentButtonWrapper.setAttribute("disabled", true);
                                }
                                if (stickyPaymentButton) {
                                    stickyPaymentButton.innerHTML = unavailableText;
                                }
                            }
                        }
                    }, 200);
                });
                if (!productContainer.querySelector('[data-combined-listing-product]')) {
                    if (!triggeredEvent) {
                        if (variantStyle == "swatch" && productOption.checked) {
                            productOption.click();
                            triggeredEvent = true;
                        } else if (variantStyle == "dropdown") {
                            let clickEvent = new Event("change");
                            productOption.dispatchEvent(clickEvent);
                            triggeredEvent = true;
                        }
                    }
                }
            });
        }
    });
};

function acceptTermsConditions(event) {
    const element = event.target;
    const parent = element.closest(".yv_product_content_section");
    if (!parent) return;
    const buttonWrapper = parent.querySelector("[data-button-wrapper]");
    const addProductBtn = parent.querySelector(".Sd_addProduct");
    if (!addProductBtn) return;
    const section = parent.closest(".shopify-section");
    const addProductStickyBtn = section?.querySelector(".Sd_addProductSticky");
    const isEnabled = element.checked;
    buttonWrapper?.classList.toggle("disabled", !isEnabled);
    addProductBtn.toggleAttribute("disabled", !isEnabled);
    addProductStickyBtn?.toggleAttribute("disabled", !isEnabled);
}

function variantChange(options, type, selector) {
    var variantData = JSON.parse(
        selector.querySelector(
            '[type="application/json"][data-name="variant-json"]'
        ).textContent
    );
    let currentVariant = variantData.find((variant) => {
        if (type === "options") {
            return !variant.options
                .map((option, index) => {
                    return options[index] === option;
                })
                .includes(false);
        }
        if (type === "id") {
            return variant.id == options;
        }
    });
    if (!currentVariant && !selector.querySelector('[data-combined-listing-product]')) {
        return getFirstAvailableVariant(options, variantStyle, selector, variantData);
    } else {
        return currentVariant;
    }
}

function updateInventroyStatusBar(variantQty, variantPolicy) {
    let productInventoryBar = document.querySelector("[ product__inventory]");
    if(!productInventoryBar) return;
    let checkStatusBar = productInventoryBar.querySelector("[product-inventroy-status-bar]");
    if (productInventoryBar && checkStatusBar) {
        let quantity = productInventoryBar.querySelector(
            "[product-inventroy-status-bar]"
        ).dataset.quantity;
        if (variantQty && variantPolicy) {
            quantity = variantQty;
            if (
                quantity > 0 &&
                quantity <= minInventroyQuantity &&
                variantPolicy == "deny"
            ) {
                productInventoryBar.classList.remove("hidden");
                productInventoryBar.classList.remove("full-inventory");
                productInventoryBar.classList.add("low-inventory");
                let quantityHtml = `<strong> ${variantQty} </strong>`;
                let newStatus = inventroyLowStatus.replace(
                    "||inventory||",
                    quantityHtml
                );
                productInventoryBar.querySelector("[inventory-status]").innerHTML =
                    newStatus;
                productInventoryBar
                    .querySelector("[product-inventroy-status-bar]")
                    .classList.remove("hide-bar");
                letBarWidth = (parseInt(variantQty) * 100) / 40;
                productInventoryBar
                    .querySelector("[product-inventroy-status-bar]")
                    .setAttribute(
                        "style",
                        "--inventroy-status-bar-width:" + letBarWidth + "%"
                    );
            } else if (quantity <= 0) {
                productInventoryBar.classList.add("hidden");
            } else {
                productInventoryBar.classList.remove("hidden");
                productInventoryBar.classList.remove("low-inventory");
                productInventoryBar.classList.add("full-inventory");
                productInventoryBar.querySelector("[inventory-status]").innerHTML =
                    inventroyAvailableStatus;
                productInventoryBar
                    .querySelector("[product-inventroy-status-bar]")
                    .classList.add("hide-bar");
                productInventoryBar
                    .querySelector("[product-inventroy-status-bar]")
                    .setAttribute("style", "--inventroy-status-bar-width:100%");
            }
            productInventoryBar
                .querySelector("[product-inventroy-status-bar]")
                .setAttribute("data-quantity", variantQty);
        } else if (quantity && quantity >= 0 && quantity <= minInventroyQuantity) {
            letBarWidth = (parseInt(quantity) * 100) / 40;
            productInventoryBar
                .querySelector("[product-inventroy-status-bar]")
                .setAttribute(
                    "style",
                    "--inventroy-status-bar-width:" + letBarWidth + "%"
                );
        }
    }
}

function priceUpdate(productSection, priceContainer, getVariant, showSaved) {
    var showSavedAmount = "";
    var savedAmountStyle = "";
    var priceHtml = "";
    if (getVariant != undefined) {
        if (priceContainer) {
            showSavedAmount = priceContainer.getAttribute("data-saved");
            savedAmountStyle = priceContainer.getAttribute("data-saved-style");
        }
        var compareAtPrice = parseInt(getVariant.compare_at_price);
        var price = parseInt(getVariant.price);
        var percentage =
            roundToTwo(((compareAtPrice - price) / compareAtPrice) * 100) +
            "% " +
            saleOffText;
        var savedAmount =
            Shopify.formatMoney(compareAtPrice - price, moneyFormat) +
            " " +
            saleOffText;
        priceHtml = `<span class="yv-visually-hidden">${regularPriceText}</span><span class="yv-product-price h2">${Shopify.formatMoney(
            price,
            moneyFormat
        )}</span>`;
        var savedAmountHtml =
            '<span class="yv-visually-hidden">' + savedPriceText + "</span>";
        if (showSaved) {
            if (showSavedAmount == "true") {
                if (savedAmountStyle == "percentage") {
                    savedAmountHtml += `<span class="yv-product-percent-off">${percentage}</span>`;
                } else {
                    savedAmountHtml += `<span class="yv-product-percent-off">${savedAmount}</span>`;
                }
            }
        } else {
            if (getVariant.allocation_type == "") {
                if (savedAmountStyle == "percentage") {
                    savedAmountHtml += `<span class="yv-product-percent-off">${percentage}</span>`;
                } else {
                    savedAmountHtml += `<span class="yv-product-percent-off">${savedAmount}</span>`;
                }
            } else if (getVariant.allocation_type == "percentage") {
                savedAmountHtml += `<span class="yv-product-percent-off">${getVariant.allocation_value}% ${saleOffText}</span>`;
            } else {
                savedAmountHtml += `<span class="yv-product-percent-off">${Shopify.formatMoney(
                    getVariant.allocation_value,
                    moneyFormat
                )} ${saleOffText}</span>`;
            }
        }
        if (compareAtPrice > price) {
            priceHtml = `<span class="yv-visually-hidden">${comparePriceText}</span><span class="yv-product-price h2">${Shopify.formatMoney(
                price,
                moneyFormat
            )}</span>
      <div class="yv-compare-price-box"><span class="yv-visually-hidden">${regularPriceText}</span><span class="yv-product-compare-price"> ${Shopify.formatMoney(
                compareAtPrice,
                moneyFormat
            )}</span>
      ${savedAmountHtml}</div>`;
        }
        if (getVariant.unit_price_measurement) {
            priceHtml +=
                '<span class="yv-visually-hidden">' +
                unitPriceText +
                '</span><p class="yv-product-unit-price">' +
                Shopify.formatMoney(getVariant.unit_price, moneyFormat) +
                " / ";
            priceHtml +=
                getVariant.reference_value == 1 ? "" : getVariant.reference_value;
            priceHtml += getVariant.reference_unit + "</p>";
        }
        if (getVariant.available != true) {
            priceHtml += `<span class="yv-visually-hidden">${soldOutText}</span>`;
        }
    }
    if (priceContainer) {
        if (productSection.classList.contains("quick-add-popup")) {
            priceHtml = priceHtml.replace("h2", "");
        }
        priceContainer.innerHTML = priceHtml;
    }
    if (productSection) {
        let stickyPriceContainer = productSection.querySelector(
            "[data-sticky-price-wrapper]"
        );
        if (stickyPriceContainer) {
            priceHtml = priceHtml.replace("h2", "h4");
            stickyPriceContainer.innerHTML = priceHtml;
        }
    }
}

function sellingPlans(variant, form) {
    let sellingPlanVariable = form.querySelector('[name="selling_plan"]');
    let sellingHtmlContainer = form.querySelector(
        "[data-selling-plan-container]"
    );
    if (sellingHtmlContainer) {
        sellingHtmlContainer.innerHTML = "";
        if (variant && variant.selling_plans) {
            let sellingPlans = variant.selling_plans;
            let variantPlans = [],
                variantGroups = [];
            if (Object.keys(sellingPlans).length > 0) {
                for (plan in sellingPlans) {
                    var planId = parseInt(plan.replace("plan_", ""));
                    var groupId = sellingPlans[plan]["group_id"];
                    variantPlans.push(planId);
                    if (!variantGroups.includes(groupId)) {
                        variantGroups.push(groupId);
                    }
                }
                var sellingPlanHtml = `<div class="selling_group active">
<div class="sellingPlanHeading" for="oneTimePurchase">
<input type="radio" id="oneTimePurchase" name="sellingPlanHeading" checked>
<label for="oneTimePurchase">${oneTimePurchaseText}</label>
</div>
</div>`;
                variantGroups.forEach(function (group, index) {
                    var group = eval("selling_Plan_Group_" + group);
                    var groupPlans = group.selling_plans;
                    sellingPlanHtml += `<div class="selling_group">
<div class="sellingPlanHeading" for="sellingGroup${index}">
<input type="radio" id="sellingGroup${index}" name="sellingPlanHeading" value="">
<label for="sellingGroup${index}">${group.name}</label>
</div>
<div  class="selling_plan">
<select class="selling_plan_attribute">`;
                    for (plan in groupPlans) {
                        var plan = groupPlans[plan];
                        sellingPlanHtml += `<option value="${plan.id}">${plan.name}</option>`;
                    }
                    sellingPlanHtml += `</select></div></div>`;
                });
                sellingPlanHtml += `</div>`;
                sellingPlanVariable.value = "";
                sellingHtmlContainer.innerHTML = sellingPlanHtml;
                sellingPlanChange();
            }
        }
    }
}

function pickUpAvialabiliy(status) {
    setTimeout(function () {
        var pickUp = document.querySelector(".product__pickup-availabilities");
        var previewContainer = document.getElementById(
            "pickup-availability-preview-container"
        );
        if (pickUp) {
            previewContainer.innerHTML = "";
            pickUp.classList.add("hidden");
            previewContainer.classList.add("hidden");
            if (status) {
                var rootUrl = pickUp.dataset.rootUrl;
                var variantId = pickUp.closest("form").querySelector("[name=id]").value;
                if (!rootUrl.endsWith("/")) {
                    rootUrl = rootUrl + "/";
                }
                var variantSectionUrl = `${rootUrl}variants/${variantId}/?section_id=pickup-availability`;
                fetch(variantSectionUrl)
                    .then((response) => response.text())
                    .then((text) => {
                        var sectionInnerHTML = new DOMParser()
                            .parseFromString(text, "text/html")
                            .querySelector(".shopify-section");
                        var container = sectionInnerHTML.querySelector(
                            "#pickUpAvailabilityPreview"
                        );
                        if (container) {
                            previewContainer.innerHTML = sectionInnerHTML.innerHTML;
                            previewContainer.classList.remove("hidden");
                            pickUp.classList.remove("hidden");
                            showPickupDrawer();
                        }
                    })
                    .catch((e) => { });
            }
        }
    }, 500);
}

function sellingPlanChange() {
    var groupSelectors = document.querySelectorAll('[name="sellingPlanHeading"]');
    Array.from(groupSelectors).forEach(function (group) {
        group.addEventListener("click", () => {
            var value = "";
            var productForm = group.closest("form");
            var sellingPlanVariable = productForm.querySelector(
                '[name="selling_plan"]'
            );
            var selectors = productForm.querySelectorAll(".selling_group");
            var _thisParent = group.closest(".selling_group");
            if (_thisParent.classList.contains("active")) {
                return;
            } else {
                Array.from(selectors).forEach(function (selector) {
                    if (selector != _thisParent) {
                        selector.classList.remove("active");
                        if (selector.querySelector(".selling_plan")) {
                            DOMAnimations.slideUp(selector.querySelector(".selling_plan"));
                        }
                    }
                });
                var variantId = productForm
                    .querySelector('[name="id"]')
                    .getAttribute("value");
                var variantSelected = variantChange(variantId, "id", productForm);
                var _productParent = productForm.closest(".yv_product_content_section");
                var _productSection = productForm.closest(".shopify-section");
                var priceContainer = _productParent.querySelector(
                    "[data-price-wrapper]"
                );
                if (_thisParent.querySelector(".selling_plan_attribute")) {
                    value = _thisParent.querySelector(".selling_plan_attribute").value;
                    priceUpdate(
                        _productSection,
                        priceContainer,
                        variantSelected["selling_plans"]["plan_" + value],
                        false
                    );
                } else {
                    priceUpdate(_productSection, priceContainer, variantSelected, true);
                }
                sellingPlanVariable.value = value;
                _thisParent.classList.add("active");
                if (_thisParent.querySelector(".selling_plan")) {
                    DOMAnimations.slideDown(_thisParent.querySelector(".selling_plan"));
                }
            }
        });
    });
    var planSelectors = document.querySelectorAll(
        "select.selling_plan_attribute"
    );
    Array.from(planSelectors).forEach(function (plan) {
        plan.addEventListener("change", () => {
            var value = "";
            var productForm = plan.closest("form");
            var sellingPlanVariable = productForm.querySelector(
                '[name="selling_plan"]'
            );
            sellingPlanVariable.value = plan.value;
            var variantId = productForm
                .querySelector('[name="id"]')
                .getAttribute("value");
            var variantSelected = variantChange(variantId, "id", productForm);
            var _productParent = productForm.closest(".yv_product_content_section");
            var priceContainer = _productParent.querySelector("[data-price-wrapper]");
            var _productSection = productForm.closest(".shopify-section");
            priceUpdate(
                _productSection,
                priceContainer,
                variantSelected["selling_plans"]["plan_" + plan.value],
                false
            );
        });
    });
}

showMultipleOptions = function () {
    return false;
    var showOptions = document.getElementsByClassName("showOptions");
    if (showOptions) {
        Array.from(showOptions).forEach(function (option) {
            option.addEventListener("click", () => {
                hideOptions();
                var product = option.getAttribute("data-product");
                var wrapper = option.closest(".card--product ");
                wrapper.querySelector("#" + product).style.display = "block";
            });
        });
    }

    var closeOptions = document.getElementsByClassName("close-product-wrap");
    if (closeOptions) {
        Array.from(closeOptions).forEach(function (option) {
            option.addEventListener("click", () => {
                var product = option.getAttribute("data-product");
                var wrapper = option.closest(".card--product ");
                wrapper.querySelector("#" + product).style.display = "none";
            });
        });
    }

    function hideOptions() {
        var options = document.getElementsByClassName("product-wrap");
        Array.from(options).forEach(function (option) {
            option.style.display = "none";
        });
    }
};

function showPickupDrawer() {
    const showContainerButton = document.getElementById(
        "ShowPickupAvailabilityDrawer"
    );
    const previewContainer = document.getElementById(
        "pickup-availability-preview-container"
    );
    if (showContainerButton) {
        showContainerButton.addEventListener("click", (e) => {
            e.preventDefault();
            const drawer = document.querySelector("[data-side-drawer]");
            drawer.setAttribute("class", "yv_side_drawer_wrapper");
            var drawerHtml = previewContainer.querySelector(
                "#pickUpAvailabilityMain"
            ).innerHTML;
            drawer.classList.add("pickup-availability-drawer");
            drawer.querySelector("[data-drawer-title]").innerHTML =
                pickUpAvialabiliyHeading;
            drawer.querySelector("[data-drawer-body]").innerHTML = drawerHtml;
            focusElement = showContainerButton;
            drawer.focus();
            document.querySelector("body").classList.add("side_Drawer_open");
        });
    }
}

flickitySlider = function (selector, slideIndex) {
    if (selector.attr("data-manual") == "true") {
        return false;
    }
    var optionContainer = selector.attr("data-flickity-slider");
    if (optionContainer) {
        var options = JSON.parse(optionContainer);
        if (selector.hasClass("flickity-enabled")) {
            selector.flickity("resize");
        } else {
            if (slideIndex) {
                selector
                    .not(".flickity-enabled")
                    .flickity(options)
                    .flickity("select", slideIndex);
            } else {
                selector.not(".flickity-enabled").flickity(options).flickity("resize");
            }
        }
           
                let currentFlickity = selector.data("flickity");
                if (currentFlickity.element.classList.contains("banner-fullwidth-slides") && currentFlickity.element.classList.contains("autoplay_slides")) {
                    // Restart autoplay on user interaction
                    currentFlickity.on("pointerUp", function (event, pointer) {
                        currentFlickity.player.play();
                    });

                    selector.find(".flickity-page-dots").on("click", function () {
                        setTimeout(() => {
                            currentFlickity.player.play();
                        }, 100); // Slight delay ensures autoplay resumes after Flickity handles the click
                    });
                }
            

        selector.on("change.flickity", function (event, index) {
            selector[0].querySelectorAll(".yv-youtube-video").forEach((video) => {
                video.contentWindow.postMessage(
                    '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
                    "*"
                );
            });
            selector[0].querySelectorAll(".yv-vimeo-video").forEach((video) => {
                video.contentWindow.postMessage('{"method":"pause"}', "*");
            });
            selector[0]
                .querySelectorAll("video:not(.videoBackgroundFile)")
                .forEach((video) => video.pause());
        });
        selector.find(".flickity-slider-thumb-item").on("focus", function () {
            let slideIndex = parseInt($(this).attr("data-index"));
            let productMainSlider = selector
                .closest(".shopify-section")
                .find("[data-flickity-product-slider]");
            let mainSlider = selector
                .closest(".shopify-section")
                .find(".data-main-slider");
            if (productMainSlider.length > 0) {
                productSlider.select(slideIndex);
            } else {
                mainSlider.flickity("select", slideIndex);
            }
        });
    }
};

sliders = function () {
    var sliders = jQuery("body").find("[data-flickity-slider]");
    if (sliders.length > 0) {
        sliders.each(function (index) {
            if (jQuery(this).is("[data-mobile-only]")) {
                if ($(window).width() < 768) {
                    if (!jQuery(this).hasClass("flickity-enabled")) {
                        flickitySlider(jQuery(this));
                    }
                } else {
                    if (jQuery(this).hasClass("flickity-enabled")) {
                        jQuery(this).flickity("destroy");
                    }
                }
            } else if (jQuery(this).is("[data-desktop-only]")) {
                if ($(window).width() >= 768) {
                    if (!jQuery(this).hasClass("flickity-enabled")) {
                        flickitySlider(jQuery(this));
                    }
                } else {
                    if (jQuery(this).hasClass("flickity-enabled")) {
                        jQuery(this).flickity("destroy");
                    }
                }
            } else {
                if (!jQuery(this).hasClass("flickity-enabled")) {
                    flickitySlider(jQuery(this));
                } else {
                    jQuery(this).flickity("resize");
                }
            }
        });
    }
};

function youtTubeScriptLoad() {
    if (
        document.querySelector(`script[src="https://www.youtube.com/iframe_api"]`)
    )
        return;
    var tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
}

function onYouTubeIframeAPIReady() {
    document.dispatchEvent(new CustomEvent("on:youtube-api:loaded"));
}

function initYouTubeIframe(section = document) {
    let youTubeVideos = section.querySelectorAll(".yvYoutubeAutoPlayvVideo");
    Array.from(youTubeVideos).forEach(function (video) {
        let divId = video.getAttribute("id");
        let vidId = video.dataset.id;
        if (!window["YT"]) {
            document.addEventListener("on:youtube-api:loaded", function () {
                youTubeVideoReady(divId, vidId);
            });
            youtTubeScriptLoad();
        } else {
            youTubeVideoReady(divId, vidId);
        }
    });
}

function youTubeVideoReady(divId, vidId) {
    YT.ready(() => {
        let player = new YT.Player(divId, {
            videoId: vidId,
            playerVars: {
                showinfo: 0,
                controls: 0,
                fs: 0,
                rel: 0,
                height: "100%",
                width: "100%",
                iv_load_policy: 3,
                html5: 1,
                loop: 1,
                autoplay: 1,
                playsinline: 1,
                modestbranding: 1,
                disablekb: 1,
                wmode: "opaque",
            },
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange,
            },
        });
    });
}

function onPlayerReady(event) {
    event.target.mute();
    event.target.playVideo();
}
let done = false;

function onPlayerStateChange(event) {
    if (event.data == 0) {
        event.target.playVideo();
    }
}

function tabAccordionContent() {
    var tabHead = document.getElementsByClassName("yv-tab-product-item");
    if (tabHead.length > 0) {
      tabHead[0].classList.add("active");
      var tabContent = document.getElementsByClassName("yv-product-detail-tab");
      tabContent[0].style.display = "block";
  
      Array.from(tabHead).forEach(function (btn) {
        btn.addEventListener("click", (event) => {
          event.preventDefault();
          Array.from(tabHead).forEach(function (item) {
            item.classList.remove("active");
          });
          Array.from(tabContent).forEach(function (item) {
            item.style.display = "none";
          });
          btn.classList.add("active");
          var _value = btn.getAttribute("content");
          document.getElementById(_value).style.display = "block";
        });
      });
    }
    var accordionHead = document.getElementsByClassName("yv-accordion-header");
    if (accordionHead.length > 0) {
      var accordionContent = document.getElementsByClassName(
        "yv-accordion-content"
      );
  
      Array.from(accordionHead).forEach(function (btn) {
        const btnParent = btn.closest("[data-faq-accordions]");
        const Tabsbehavior = btnParent.dataset.tabsOpenMethod;
        if (Tabsbehavior === "click") {
        btn.addEventListener("click", (event) => {
          event.preventDefault();
          let _section = btn.closest(".shopify-section");
          if (btn.classList.contains("active")) {
            btn.parentNode.removeAttribute("open");
            clearAccordion();
          } else {
            btn.classList.add("active");
            btn.parentNode.setAttribute("open", "");
            var _value = btn.getAttribute("content");
            clearAccordion(btn, document.getElementById(_value));
            DOMAnimations.slideDown(document.getElementById(_value));
            var _media = btn.getAttribute("media");
            if (
              _section &&
              document.getElementById(_media) &&
              !document.getElementById(_media).classList.contains("active")
            ) {
              if (_section.querySelector(".tabbed-collage-image.active")) {
                _section
                  .querySelector(".tabbed-collage-image.active")
                  .fadeOut(100);
                _section
                  .querySelector(".tabbed-collage-image.active")
                  .classList.remove("active");
                setTimeout(function () {
                  document.getElementById(_media).fadeIn(100);
                  document.getElementById(_media).classList.add("active");
                }, 100);
              }
            }
          }
        });
        } 
        else{
                let accordionContainer = btn.closest(".yv-product-accordion");
                btn.addEventListener("mouseenter", () => {
                    if (!btn.classList.contains("active")) {
                        let _section = btn.closest(".shopify-section");
    
                        btn.classList.add("active");
                        btn.parentNode.setAttribute("open", "");
    
                        var _value = btn.getAttribute("content");
                        if(_value){
                        clearAccordion(btn, document.getElementById(_value));
                        DOMAnimations.slideDown(document.getElementById(_value));
                        }
                        var _media = btn.getAttribute("media");
                        if (_section && _media) {
                            const mediaElement = document.getElementById(_media);
                            if (mediaElement) {
                                const activeMedia = _section.querySelectorAll(".tabbed-collage-image.active");
                                if (activeMedia) {
                                    activeMedia.forEach((el) => {
                                        el.classList.remove("active");
                                        el.style.display = "none";
                                    });
                                }
                                mediaElement.classList.add("active");
                                mediaElement.style.display = "block";
                            }
                        }
                    }
                });
    
                // **Ensure the menu closes when mouse leaves the entire accordion**
                accordionContainer.addEventListener("mouseleave", () => {
                    document.querySelectorAll(".yv-accordion-header").forEach((el) => {
                        el.classList.remove("active");
                        el.parentNode.removeAttribute("open");
    
                        var _value = el.getAttribute("content");
                        DOMAnimations.slideUp(document.getElementById(_value), 100);
                    });
                });
        }
      });
    }
  }

function clearAccordion(currentHead, currentContent) {
    var accordionHeads = document.getElementsByClassName("yv-accordion-header");
    var accordionContents = document.getElementsByClassName(
        "yv-accordion-content"
    );
    Array.from(accordionHeads).forEach(function (item) {
        if (item == currentHead) {
            return;
        } else {
            item.classList.remove("active");
        }
    });
    Array.from(accordionContents).forEach(function (item) {
        if (item == currentContent) {
            return;
        } else {
            DOMAnimations.slideUp(item);
        }
    });
}

/* Neha slide show */
document.querySelectorAll('[data-banner-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const banner = document.querySelector('[data-notification-bar]');
      if (banner) {
        banner.remove(); // Removes the element from the DOM
      }
    });
  });
 

var mapSelectors = "[data-map-container]";
var apiloaded = null;

function initMaps() {
    jQuery(mapSelectors).each(function (index, selector) {
        createMap(selector);
    });
}

function checkMapApi(selector) {
    if (selector || jQuery(mapSelectors).length > 0) {
        if (apiloaded === "loaded") {
            if (selector) {
                createMap(selector);
            } else {
                initMaps();
            }
        } else {
            if (apiloaded !== "loading") {
                apiloaded = "loading";
                if (
                    typeof window.google === "undefined" ||
                    typeof window.google.maps === "undefined"
                ) {
                    var script = document.createElement("script");
                    script.onload = function () {
                        apiloaded = "loaded";
                        if (selector) {
                            createMap(selector);
                        } else {
                            initMaps();
                        }
                    };
                    script.src =
                        "https://maps.googleapis.com/maps/api/js?key=" + googleMapApiKey + "&libraries=marker";
                    document.head.appendChild(script);
                }
            }
        }
    }
}

function createMap(selector) {
    var geocoder = new google.maps.Geocoder();
    var address = jQuery(selector).data("location");
    var mapStyle = jQuery(selector).data("map-style");
    var redIconUrl = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    geocoder.geocode({ address: address }, function (results, status) {
        if (results != null) {
            var options = {
                zoom: 17,
                backgroundColor: "none",
                center: results[0].geometry.location,
                mapId: mapStyle,
            };
            var map = (this.map = new google.maps.Map(selector, options));
            var center = (this.center = map.getCenter());
            var marker = new google.maps.marker.AdvancedMarkerElement({
                map: map,
                position: map.getCenter(),
            });

            window.addEventListener("resize", function () {
                setTimeout(function () {
                    google.maps.event.trigger(map, "resize");
                    map.setCenter(center);
                }, 250);
            });
        }
    });
}

var dealSection = function (selector) {
    const second = 1000,
        minute = second * 60,
        hour = minute * 60,
        day = hour * 24;
    var clearCountDown;
    countdown = function (selector) {
        var parent = document.querySelector(selector);
        if (parent) {
            clearInterval(clearCountDown);
            var dateSelector = parent.querySelector(".dealDate");
            if (dateSelector) {
                const myArr = dateSelector.value.split("/");
                let _day = myArr[0];
                let _month = myArr[1];
                let _year = myArr[2];
                let _date = _month + "/" + _day + "/" + _year + " 00:00:00";
                let countDown = new Date(_date).getTime();
                var daySelector = parent.querySelector("#dDays");
                var hourSelector = parent.querySelector("#dHours");
                var minSelector = parent.querySelector("#dMinutes");
                var secSelector = parent.querySelector("#dSeconds");
                if (daySelector && hourSelector && minSelector && secSelector) {
                    clearCountDown = setInterval(function () {
                        let now = new Date().getTime(),
                            distance = countDown - now;
                        var leftDays = Math.floor(distance / day);
                        if (distance > 0) {
                            (daySelector.innerText = pad2(leftDays)),
                                (hourSelector.innerText = pad2(
                                    Math.floor((distance % day) / hour)
                                )),
                                (minSelector.innerText = pad2(
                                    Math.floor((distance % hour) / minute)
                                )),
                                (secSelector.innerText = pad2(
                                    Math.floor((distance % minute) / second)
                                ));
                        } else {
                            let hideStatus = parent.getAttribute("data-hide-section");
                            if (hideStatus == "true") {
                                parent.style.display = "none";
                            }
                            (daySelector.innerText = "00"),
                                (hourSelector.innerText = "00"),
                                (minSelector.innerText = "00"),
                                (secSelector.innerText = "00");
                            clearInterval(clearCountDown);
                        }
                    }, 0);
                }
            }
        }
    };
    countdown("#" + selector);
};

function clearActive(currentHead, currentContent) {
    var tabs = document.getElementsByClassName("faqSection-header");
    var tabsContent = document.getElementsByClassName("faqSection-content");
    Array.from(tabs).forEach(function (item) {
        var iconPlus = item.querySelector(".iconPlus");
        var iconMinus = item.querySelector(".iconMinus");
        if (item == currentHead) {
            return;
        } else {
            iconMinus.style.display = "none";
            iconPlus.style.display = "inline";
            item.classList.remove("active");
        }
    });
    Array.from(tabsContent).forEach(function (item) {
        if (item == currentContent) {
            return;
        } else {
            DOMAnimations.slideUp(item);
        }
    });
}

function quantityChange() {
    jQuery(".quantity:not(.cart-item-quantity)").each(function () {
        const spinner = jQuery(this);
        const input = spinner.find('input[type="number"]');
        const btnUp = spinner.find(".quantity-up");
        const btnDown = spinner.find(".quantity-down");
        const min = parseFloat(input.attr("min"));
        const max = parseFloat(input.attr("max"));
        const step = parseFloat(input.attr("step"));
        const updateValue = (operation) => {
            let currentValue = parseFloat(input.val());
      if (operation === "up") {
            if (!isNaN(max)) {
                newValue = Math.min(currentValue + step, max); 
            } else {
                newValue = currentValue + step; 
            }
        } else {
            if (!isNaN(min)) {
                newValue = Math.max(currentValue - step, min); 
            } else {
                newValue = currentValue - step; 
            }
        }
            input.val(newValue).trigger("change");
        };
        btnUp.click((e) => {
            e.preventDefault();
            updateValue("up");
        });
        btnDown.click((e) => {
            e.preventDefault();
            updateValue("down");
        });
    });
}

function sliderFilter() {
    $("body").on("click", ".filter-products", function (e) {
        e.preventDefault();
        if (!$(this).hasClass("active")) {
            $(this).siblings().removeClass("active");
            $(this).addClass("active");
            $(this)
                .closest(".shopify-section")
                .find(".yv-tab-btn-pane")
                .attr("data-tab-active", $(this).attr("data-tab-button"));
            let selectedCollection = $(this).data("filter");
            let selector = $(this)
                .closest(".shopify-section")
                .find(".yv-tabbed-collection-filter-items");
            if (selector.hasClass("flickity-enabled")) {
                selector.flickity("destroy");
            }
            selector.find(".filter-slide").removeClass("active").hide();
            selector.find(".filter-slide .aos-init").removeClass("aos-animate");
            selector
                .find(".filter-slide." + selectedCollection)
                .addClass("active")
                .show();
            flickitySlider(selector);
            // }
            selector
                .find(".filter-slide." + selectedCollection + " .aos-init")
                .addClass("aos-animate");
            setTimeout(function () { }, 200);
        }
    });
}


function removeClasses() {
    $("body")
        .removeClass("similar_Drawer_open")
        .removeClass("side_Drawer_open")
        .removeClass("catalog-open")
        .removeClass("yv_side_Drawer_open")
        .removeClass("active_askme")
        .removeClass("scrollHidden")
        .removeClass("quickview-open")
        .removeClass("nav-open")
        .removeClass("addsearch")
        .removeClass("minicart-open")
        .removeClass("customer-open")
        .removeClass("NewsletterActive")
        .removeClass("show__similar__products")
        .removeClass("offer-open")
        .removeClass("mega-menu-open")
        .removeClass("open-filter-sort")
        .removeClass("sizeChartOpen");
    $(".yv-upsell-drawer").removeClass("active");
    let sizeChartModel = document.getElementById("sizeChartModel");
    if (sizeChartModel) {
        sizeChartModel.fadeOut(100);
    }
    $(".yv-coupan-sidebar").removeClass("open");
    $(".wrapper-overlay").hide();
    if (!$("input.form-control.search-input").hasClass("yv-search-bar")) {
        $("input.form-control.search-input").val("");
    }
    $(".yv-search-result-container").empty();
    setTimeout(function () {
        $(".yv-newsletter-popup").fadeOut("slow");
    }, 200);
    if ($(window).width() > 767) {
        $(".askmeMain").hide().removeClass("slideAskme");
    } else {
        $(".askmeMain.slideAskme").removeClass("slideAskme");
        setTimeout(function () {
            $(".askmeMain").hide();
        }, 250);
    }
    $(".dropdown-menu-list").removeClass("open");
    $(".toggle-level,.list-menu__item.toggle").removeClass("open-menu-drop");
    $(".side-menu").find(".inner").removeClass("is-open");
    $(".side-menu").find(".inner").slideUp("slow");
    if ($(window).width() < 768) {
        $("#sort__list").removeClass("active");
    } else {
        $("#sort__list").slideUp();
    }
    $("body").removeClass("side_Drawer_open");
    stopFocusElementsRotation();
    if (focusElement) {
        if (focusElement.nodeType || focusElement == window) {
            focusElement.focus();
        } else {
            focusElement.trigger("focus");
        }
        focusElement = "";
    }
}

function closeVideoMedia(quickView) {
    document.querySelectorAll(".yv-youtube-video").forEach((video) => {
        if (!isOnScreen(video) || quickView) {
            video.contentWindow.postMessage(
                '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
                "*"
            );
        }
    });
    document.querySelectorAll(".yv-vimeo-video").forEach((video) => {
        if (!isOnScreen(video) || quickView) {
            video.contentWindow.postMessage('{"method":"pause"}', "*");
        }
    });
    document.querySelectorAll("video").forEach((video) => {
        if (!video.classList.contains("videoBackgroundFile")) {
            if (!isOnScreen(video) || quickView) {
                video.pause();
            }
        }
    });
}

function navigationMenu() {
    var dropDownMenus = document.getElementsByClassName("yv-dropdown-detail");
    var header = document.querySelector("header");
    if (header) {
        let navigation_event = header.getAttribute("data-naviation-open-method");
        if (navigation_event == "hover") {
            Array.from(dropDownMenus).forEach(function (menu) {
                menu.parentElement.querySelector(".yv-dropdown-menus");
                menu.addEventListener("mouseover", () => {
                    menu.classList.add("open");
                    menu.setAttribute("open", "");
                    document.querySelector("body").classList.add("mega-menu-open");
                }),
                    menu.addEventListener("mouseleave", () => {
                        menu.classList.remove("open");
                        menu.removeAttribute("open");
                        document.querySelector("body").classList.remove("mega-menu-open");
                    });
            });
        } else {
            if (dropDownMenus.length > 0) {
                Array.from(dropDownMenus).forEach(function (menu) {
                    menu.addEventListener("click", (event) => {
                        let superParent = menu.closest("li");
                        if (menu.open) {
                            hideAllMenu(menu);
                            document.querySelector("body").classList.remove("mega-menu-open");
                        } else {
                            hideAllMenu(menu);
                            menu.classList.add("open");
                            document.querySelector("body").classList.remove("mega-menu-open");
                            document.querySelector("body").classList.add("mega-menu-open");
                        }
                    });
                });
            }
        }

    }
    var hoverChildmenus = document.querySelectorAll("[data-has-children]");
    Array.from(hoverChildmenus).forEach(function (submenu) {
        var menuInner = submenu.querySelector('.menu-type-dropdown-inner');
        const rect = menuInner.getBoundingClientRect();
        submenu.addEventListener("mouseover", function () {
            if (menuInner) {
                const windowWidth = window.innerWidth;
                var rightposition = rect.right + parseInt(150);
                // Check if there's enough space on the right
                if (rightposition > windowWidth) {
                    // Adjust position to the left
                    menuInner.style.left = 'auto';
                    menuInner.style.right = '100%'; // Position to the left of the parent
                } else {
                    // Reset to default position
                    menuInner.style.left = '100%';
                    menuInner.style.right = 'auto';
                }
            }
        });
    });
}

function hideAllMenu(selectMenu) {
    var dropDownMenus = document.getElementsByClassName("yv-dropdown-detail");
    if (dropDownMenus.length > 0) {
        Array.from(dropDownMenus).forEach(function (menu) {
            if (selectMenu != menu) {
                menu.removeAttribute("open");
            }
            menu.classList.remove("open");
        });
    }
}

function hideAllMenu(selectMenu) {
    var dropDownMenus = document.getElementsByClassName("yv-dropdown-detail");
    if (dropDownMenus.length > 0) {
        Array.from(dropDownMenus).forEach(function (menu) {
            if (selectMenu != menu) {
                menu.removeAttribute("open");
            }
            menu.classList.remove("open");
        });
    }
}

function closeDrawers() {
    $(
        ".yv-filter-sidebar,.yv-discount-panel,.yv-newsletter-popup-outer,.customer-links,.acc-sign-in,[data-account-dropdown],.customer-support,.yv-login-popup-inner,.yv-newsletter-popup-content,.yv-browse-category,.yv-addon-button-wrapper-card,.sizeChart-label,.sizeChart-main,.offer-open,.yv-product-slider-item,.navbar-toggler,.similar_options,.openCartDrawer,.yv-coupan-sidebar,.dropdown-menu-list,.ask_this_product,.yv_similar_drawer_wrapper,#toolbox-sort,#sort__list,.yv_side_drawer_wrapper,.askmecontainer,.search-bar-container,.search-form,.yv-newsletter-popup-body,.side-menu,#filterSideBar"
    ).hover(
        function () {
            mouse_is_inside = true;
        },
        function () {
            mouse_is_inside = false;
        }
    );

    var menu_is_inside = false;
    $(".dropdown-menu-item").hover(
        function () {
            menu_is_inside = true;
        },
        function () {
            menu_is_inside = false;
        }
    );

    $("body").on("click", function (event) {
        if (!mouse_is_inside) {
            setTimeout(() => {
                if (
                    window.location.href.indexOf("#mobileMenu") > -1 ||
                    window.location.href.indexOf("#header") > -1
                ) {
                    let url = window.location.href.replace("#mobileMenu", "");
                    url = url.replace("#header", "");
                    history.replaceState({}, null, url);
                }
            }, 100);
            $(".yv-discount-sidebar-element").hide();
        }
        if (
            $(this).hasClass("offer-open") &&
            !$(".yv-coupan-sidebar-element").hasClass("open")
        ) {
            return false;
        }
        if (!menu_is_inside) {
            $(".yv-dropdown-detail").removeAttr("open");
            $(".yv-dropdown-detail").removeClass("open");
            stopFocusElementsRotation();
        }
    });

    $("body").on("mouseup", function (event) {
        if (event.target.hasAttribute('data-address-country-select') || event.target.parentNode.hasAttribute('data-address-country-select')) {
            return false;
        }
        if (
            $(this).hasClass("offer-open") &&
            !$(".yv-coupan-sidebar-element").hasClass("open")
        ) {
            return false;
        } else {
            $("body").removeClass("offer-open");
            $(".yv-coupan-sidebar-element").removeClass("open");
        }
        if (!mouse_is_inside) {
            if (document.querySelector("[data-account-dropdown]")) {
                DOMAnimations.slideUp(
                    document.querySelector("[data-account-dropdown]")
                );
            }
            let storeDetailsContent = document.querySelectorAll(
                "[data-store-location-dropdown]"
            );
            Array.from(storeDetailsContent).forEach(function (content) {
                DOMAnimations.slideUp(content);
            });
            if (document.querySelector("[data-account-popup]")) {
                $("body").removeClass("account-popup-open");
            }
            $("#view-catalog").hide();

            removeClasses();
            closeVideoMedia("quickView");
        }

        var isHovered = $(".yv-addon-button-wrapper-card").filter(function () {
            return $(this).is(":hover");
        });
        if (!menu_is_inside && !isHovered) {
            $(".yv-addon-button-wrapper").hide();
            $("body").removeClass("query-form-open");
        }
    });

    $("body").on("keydown", function (event) {
        if (event.keyCode == 27) {
            closeVideoMedia("quickView");
            if (document.querySelector(".hamburger.opened")) {
                document.querySelector(".hamburger.opened").click();
            }
            $(".yv-upsell-drawer").removeClass("active");
            $("body").removeClass("offer-open");
            $(".yv-coupan-sidebar-element").removeClass("open");
            $(".super_active").removeClass("super_active");
            $(".yv-dropdown-detail").removeAttr("open");
            $(".yv-dropdown-detail").removeClass("open");
            $("#sizeChartModel").fadeOut(100);
            $("#password-popup").fadeOut();
            $("body").removeClass("sizeChartOpen").removeClass("PasswordFormActive");
            removeClasses();
        }
    });
}

const ease = {
    exponentialIn: (t) => {
        return t == 0.0 ? t : Math.pow(2.0, 10.0 * (t - 1.0));
    },
    exponentialOut: (t) => {
        return t == 1.0 ? t : 1.0 - Math.pow(2.0, -10.0 * t);
    },
    exponentialInOut: (t) => {
        return t == 0.0 || t == 1.0 ?
            t :
            t < 0.5 ?
                +0.5 * Math.pow(2.0, 20.0 * t - 10.0) :
                -0.5 * Math.pow(2.0, 10.0 - t * 20.0) + 1.0;
    },
    sineOut: (t) => {
        const HALF_PI = 1.5707963267948966;
        return Math.sin(t * HALF_PI);
    },
    circularInOut: (t) => {
        return t < 0.5 ?
            0.5 * (1.0 - Math.sqrt(1.0 - 4.0 * t * t)) :
            0.5 * (Math.sqrt((3.0 - 2.0 * t) * (2.0 * t - 1.0)) + 1.0);
    },
    cubicIn: (t) => {
        return t * t * t;
    },
    cubicOut: (t) => {
        const f = t - 1.0;
        return f * f * f + 1.0;
    },
    cubicInOut: (t) => {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    },
    quadraticOut: (t) => {
        return -t * (t - 2.0);
    },
    quarticOut: (t) => {
        return Math.pow(t - 1.0, 3.0) * (1.0 - t) + 1.0;
    },
};
//  wave animation code start
class ShapeOverlays {
    constructor(elm) {
        this.elm = elm;
        this.path = elm.querySelectorAll("path");
        this.numPoints = 2;
        this.duration = 600;
        this.delayPointsArray = [];
        this.delayPointsMax = 0;
        this.delayPerPath = 200;
        this.timeStart = Date.now();
        this.isOpened = false;
        this.isAnimating = false;
    }
    toggle() {
        this.isAnimating = true;
        for (var i = 0; i < this.numPoints; i++) {
            this.delayPointsArray[i] = 0;
        }
        if (this.isOpened === false) {
            this.open();
        } else {
            this.close();
        }
    }
    open() {
        this.isOpened = true;
        this.elm.classList.add("is-opened");
        this.timeStart = Date.now();
        this.renderLoop();
    }
    close() {
        this.isOpened = false;
        this.elm.classList.remove("is-opened");
        this.timeStart = Date.now();
        this.renderLoop();
    }

    updatePath(time) {
        const points = [];

        for (var i = 0; i < this.numPoints; i++) {
            const thisEase = this.isOpened ?
                i == 1 ?
                    ease.cubicOut :
                    ease.cubicInOut :
                i == 1 ?
                    ease.cubicInOut :
                    ease.cubicOut;
            points[i] =
                thisEase(
                    Math.min(
                        Math.max(time - this.delayPointsArray[i], 0) / this.duration,
                        1
                    )
                ) * 100;
        }

        let str = "";
        str += this.isOpened ? `M 0 0 V ${points[0]} ` : `M 0 ${points[0]} `;
        for (var i = 0; i < this.numPoints - 1; i++) {
            const p = ((i + 1) / (this.numPoints - 1)) * 100;
            const cp = p - ((1 / (this.numPoints - 1)) * 100) / 2;
            str += `C ${cp} ${points[i]} ${cp} ${points[i + 1]} ${p} ${points[i + 1]
                } `;
        }
        str += this.isOpened ? `V 0 H 0` : `V 100 H 0`;
        return str;
    }

    render() {
        if (this.isOpened) {
            for (var i = 0; i < this.path.length; i++) {
                this.path[i].setAttribute(
                    "d",
                    this.updatePath(Date.now() - (this.timeStart + this.delayPerPath * i))
                );
            }
        } else {
            for (var i = 0; i < this.path.length; i++) {
                this.path[i].setAttribute(
                    "d",
                    this.updatePath(
                        Date.now() -
                        (this.timeStart + this.delayPerPath * (this.path.length - i - 1))
                    )
                );
            }
        }
    }
    renderLoop() {
        this.render();
        if (
            Date.now() - this.timeStart <
            this.duration +
            this.delayPerPath * (this.path.length - 1) +
            this.delayPointsMax
        ) {
            requestAnimationFrame(() => {
                this.renderLoop();
            });
        } else {
            this.isAnimating = false;
        }
    }
}

function hamburgerInit() {
    const elmHamburger = document.querySelector(".hamburger");
    const parentBody = document.querySelector("body");
    const gNavItems = document.querySelectorAll(".hamburger-menu-item");
    const dropdownNavItems = document.querySelectorAll(
        ".dropdown-hamburger-menu-item"
    );
    const elmOverlay = document.querySelector(".shape-overlays");
    if (!elmOverlay) {
        return false;
    }

    if (!elmHamburger) {
        return false;
    }
    const overlay = new ShapeOverlays(elmOverlay);
    elmHamburger.addEventListener("click", (e) => {
        e.preventDefault();
        if (overlay.isAnimating) {
            return false;
        }
        overlay.toggle();
        if (overlay.isOpened === true) {
            elmHamburger.classList.add("opened");
            parentBody.classList.add("hamburder-opened");
            for (var i = 0; i < gNavItems.length; i++) {
                let navItem = gNavItems[i];
                setTimeout(function () {
                    navItem.classList.add("opened");
                }, 50);
            }
            focusElement = elmHamburger;
        } else {
            let superActives = document.querySelectorAll(".super_active");
            for (var i = 0; i < superActives.length; i++) {
                superActives[i].classList.remove("super_active");
            }
            elmHamburger.classList.remove("opened");
            parentBody.classList.remove("hamburder-opened");
            for (var i = 0; i < gNavItems.length; i++) {
                gNavItems[i].classList.remove("opened");
            }
            for (var i = 0; i < dropdownNavItems.length; i++) {
                dropdownNavItems[i].classList.remove("active");
            }
        }
    });

    $("body").on("click", ".dropdown-hamburger-menu-item-title", function (e) {
        e.preventDefault();
        $(this).closest(".dropdown-hamburger-menu-item").addClass("active");
        $(this).parent().parent().parent().addClass("super_active");
    });

    $("body").on("click", ".back-to-menu", function (e) {
        e.preventDefault();
        $(this).closest(".dropdown-hamburger-menu-item").removeClass("active");
        $(this).closest(".super_active").removeClass("super_active");
    });
}

function productRecommendations() {
    const productRecommendationsSections = document.querySelectorAll(
        "[product-recommendations]"
    );
    Array.from(productRecommendationsSections).forEach(function (
        productRecommendationsSection
    ) {
        productRecommendationsInit(productRecommendationsSection);
    });
}

function productRecommendationsInit(productRecommendationsSection) {
    const url = productRecommendationsSection.dataset.url;
    fetch(url)
        .then((response) => response.text())
        .then((text) => {
            const html = document.createElement("div");
            html.innerHTML = text;
            const recommendations = html.querySelector("[product-recommendations]");
            if (recommendations && recommendations.innerHTML.trim().length) {
                productRecommendationsSection.innerHTML = recommendations.innerHTML;
                gridPickUpAvailability(productRecommendationsSection);
                let slider = productRecommendationsSection.querySelector(
                    "[data-flickity-slider]"
                );
                if (slider) {
                    let sliderId = slider.getAttribute("id");
                    if (!slider.classList.contains("flickity-enabled")) {
                        if (slider.classList.contains("data-desktop-only")) {
                            if (window.innerWidth > 767) {
                                flickitySlider($("#" + sliderId));
                            }
                        } else {
                            flickitySlider($("#" + sliderId));
                        }
                    }
                }
                showMultipleOptions();
            }
        })
        .catch((e) => {
            console.error(e);
        });
}

function productHoverSlider() {
    var hoverSlider = setInterval(function () {
        if ($(".yv-product-hover-slider").length > 0) {
            clearInterval(hoverSlider);
            $(".yv-product-hover-slider").hover(
                function () {
                    var _this = $(this);
                    if (
                        _this.find(".sd-main-Slider").attr("data-flickity-hover-slider") ==
                        undefined
                    ) {
                        return false;
                    }
                    _this.addClass("slider-active");
                    var sliderOptions = JSON.parse(
                        _this.find(".sd-main-Slider").attr("data-flickity-hover-slider")
                    );
                    var $hoverSlider = _this
                        .find(".sd-main-Slider")
                        .flickity(sliderOptions);
                },
                function () {
                    if ($(this).find(".sd-main-Slider").hasClass("flickity-enabled")) {
                        $(this).removeClass("slider-active");
                        $(this).find(".sd-main-Slider").flickity("destroy");
                    }
                }
            );
            $(".yv-product-hover-slider")
                .find(".slider-button-prev")
                .on("click", function (e) {
                    e.preventDefault();
                    let gridHoverSlider = $(this)
                        .parent(".yv-product-hover-slider")
                        .find(".sd-main-Slider");
                    if (gridHoverSlider.hasClass("flickity-enabled")) {
                        gridHoverSlider.flickity("previous");
                    }
                });
            // next
            $(".yv-product-hover-slider")
                .find(".slider-button-next")
                .on("click", function (e) {
                    e.preventDefault();
                    let gridHoverSlider = $(this)
                        .parent(".yv-product-hover-slider")
                        .find(".sd-main-Slider");
                    if (gridHoverSlider.hasClass("flickity-enabled")) {
                        gridHoverSlider.flickity("next");
                    }
                });
        }
    }, 500);
    setTimeout(function () {
        clearInterval(hoverSlider);
    }, 6000);
}

function initBeforeAfter() {
    let cursors = document.querySelectorAll(".before-after-cursor-point");
    Array.from(cursors).forEach(function (cursor) {
        beforeAfterImage(cursor);
    });
}

function beforeAfterImage(cursor) {
    const _parentSection = cursor.closest(".shopify-section");
    let pointerDown = false;
    let _offsetX = (_currentX = 0);
    let minOffset = -cursor.offsetLeft - 0;
    let maxOffset = cursor.offsetParent?.clientWidth + minOffset || 0;
    _parentSection.addEventListener("pointerdown", function (event) {
        if (
            event.target === cursor ||
            event.target.closest(".before-after-cursor-point") === cursor
        ) {
            _initialX = event.clientX - _offsetX;
            pointerDown = true;
        }
    });
    _parentSection.addEventListener("pointermove", function () {
        if (!pointerDown) {
            return;
        }
        _currentX = Math.min(
            Math.max(event.clientX - _initialX, minOffset),
            maxOffset
        );
        _offsetX = _currentX;
        _currentX = _currentX.toFixed(1);
        _parentSection.style.setProperty("--imageClipPosition", `${_currentX}px`);
    });
    _parentSection.addEventListener("pointerup", function (event) {
        pointerDown = false;
    });
    window.addEventListener("resize", function () {
        if (!cursor.offsetParent) {
            return false;
        }
        minOffset = -cursor.offsetLeft - 0;
        maxOffset = cursor.offsetParent?.clientWidth + minOffset || 0;
        _currentX = Math.min(Math.max(minOffset, _currentX), maxOffset);
        _parentSection.style.setProperty("--imageClipPosition", `${_currentX}px`);
    });
}

function hideBanner() {
    document.querySelector(".cookies-banner") && (document.querySelector(".cookies-banner").style.display = "none");
}

function showBanner() {
    document.querySelector(".cookies-banner") && (document.querySelector(".cookies-banner").style.display = "block");
}

function handleAccept(e) {
    window.Shopify.customerPrivacy.setTrackingConsent(!0, hideBanner),
        document.addEventListener("trackingConsentAccepted", function () {
        });
}

function handleDecline() {
    window.Shopify.customerPrivacy.setTrackingConsent(!1, hideBanner);
}

function initCookieBanner() {
    const userCanBeTracked = window.Shopify.customerPrivacy.userCanBeTracked(),
        userTrackingConsent = window.Shopify.customerPrivacy.getTrackingConsent();
    if (userCanBeTracked && userTrackingConsent === "no_interaction") {
        showBanner();
    }
}

function cookiesBanner() {
    window.Shopify.loadFeatures(
        [{ name: "consent-tracking-api", version: "0.1" }],
        function (e) {
            if (e) throw e;
            initCookieBanner();
        }
    );
}

function docOnLoad() {
    pickUpAvialabiliy(true);
    productVariants();
    sellingPlanChange();
    sliders();
    checkMapApi();
    quantityChange();
    tabAccordionContent();
    updateBlogbtnHeight();
}
$(document).ready(function () {
    docOnLoad();
    var slideIndex = 0;
    var block = "";
    let stickyItems = $(".sticky-item");
    setTimeout(function () {
        if ($("body").hasClass("sticky-header")) {
            let headerHeight = $(".shopify-section-main-header").height();
        } else {
            stickyItems.css("top", "0px");
        }
    }, 500);

    jQuery(document).on(
        "shopify:section:select shopify:section:deselect shopify:section:load shopify:section:unload shopify:block:select shopify:block:deselect",
        function (event) {
            var parent = event.target;
            var mainSliderSelector = $(".yv-product-big-slider");
            if (mainSliderSelector.hasClass("flickity-enabled")) {
                productSlider.resize();
            }
            if (Shopify.PaymentButton) {
                Shopify.PaymentButton.init();
            }
            if (jQuery(parent).hasClass("offer-sidebar-section")) {
                jQuery(parent).show();
            } else {
                $(".offer-sidebar-section").hide();
                jQuery("body").removeClass("offer-open");
                jQuery(".yv-coupan-sidebar-element").removeClass("open");
            }
            $(".offer-sidebar-section").hide();
            var slider = jQuery(parent).find("[data-flickity-slider]");
            if (event.type == "shopify:block:select") {
                jQuery(parent).find(".yv-accordion-header").trigger("click");
                if (jQuery(parent).hasClass("yv-timeline-nav")) {
                    jQuery(parent).find("[data-timeline-nav]").trigger("click");
                }
                if (jQuery(parent).hasClass("collections-list-slider-item")) {
                    collectionHoverAction(
                        jQuery(parent).find("[data-hover-collection-item]")[0]
                    );
                }
                if (jQuery(parent).hasClass("color-collections-color-item")) {
                    jQuery(parent).trigger("click");
                }
                if (
                    jQuery(parent)
                        .closest(".shopify-section")
                        .hasClass("offer-sidebar-section")
                ) {
                    $(".offer-sidebar-section").show();
                    jQuery("body").addClass("offer-open");
                    jQuery("body").find(".yv-coupan-sidebar-element").addClass("open");
                    jQuery("body")
                        .find(".yv-coupan-sidebar-element")
                        .find("[data-flickity-slider]")
                        .flickity("resize");
                } else {
                    $(".offer-sidebar-section").hide();
                    jQuery("body").removeClass("offer-open");
                    jQuery(".yv-coupan-sidebar-element").removeClass("open");
                    jQuery("body")
                        .find(".yv-coupan-sidebar-element")
                        .find("[data-flickity-slider]")
                        .flickity("resize");
                }
                var sectionId = event.detail.sectionId;
                block = jQuery(event.target);
                slideIndex = block.index();
                if (
                    block.closest("[data-flickity-slider]").hasClass("flickity-enabled")
                ) {
                    block
                        .closest("[data-flickity-slider]")
                        .flickity("select", slideIndex);
                }
            } else {
                $(".offer-sidebar-section").hide();
                jQuery("body").removeClass("offer-open");
                jQuery(".yv-coupan-sidebar-element").removeClass("open");
                jQuery("body")
                    .find(".yv-coupan-sidebar-element")
                    .find("[data-flickity-slider]")
                    .flickity("resize");
            }
            if (event.type == "shopify:section:load") {
                productVariants(parent);
                UpdateSplitBannerdescHeight();
                updateBannerGridHeight();
                tabAccordionContent();
                collectionHoverNavInit(parent);
                timelineNavInit(parent);
                localizationElements(parent);
                cookiesBanner();
                viewcategoryInit();
                initBeforeAfter();
                productHoverSlider();
                initYouTubeIframe(parent);
                updateInventroyStatusBar();
                productRecommendations();
                hamburgerInit();
                navigationMenu();
                closeDrawers();
                recentlyViewedProducts();
                productGiftOptions();
                lookbookScrollContent();
                initStoreLocator();
                productQueryForm();
                newsletterSidebar();
                pdpCountdown();
                coloredCollection(parent);
                sideDrawerContentStoryInit(parent);
                if (parent.querySelector("[data-icon]")) {
                    _iconsAnimations(parent);
                }
                if (parent.querySelector(".yv-parallax")) {
                    new universalParallax().init({
                        speed: 10,
                    });
                }
                if (parent.classList.contains("shopify-section-main-header")) {
                    $("html, body").animate({ scrollTop: 0 }, "slow");
                    initSearchPrompts(parent);
                }
                if (
                    jQuery(parent)
                        .closest(".shopify-section")
                        .hasClass("offer-sidebar-section")
                ) {
                    $(".offer-sidebar-section").show();
                }
                if (block != "") {
                    slideIndex = undefined;
                }
                if (event.target.querySelector("[data-map-container]")) {
                    checkMapApi(event.target.querySelector("[data-map-container]"));
                }
                let _sliders = jQuery(event.target).find("[data-flickity-slider]");
                _sliders.each(function () {
                    let _slider = $(this);
                    if (_slider.is("[data-mobile-only]")) {
                        if ($(window).width() < 768) {
                            if (!_slider.hasClass("flickity-enabled")) {
                                flickitySlider(_slider, slideIndex);
                            }
                        } else {
                            if (_slider.hasClass("flickity-enabled")) {
                                _slider.flickity("destroy");
                            }
                        }
                    } else if (_slider.is("[data-desktop-only]")) {
                        if ($(window).width() >= 768) {
                            if (!_slider.hasClass("flickity-enabled")) {
                                flickitySlider(_slider);
                            }
                        } else {
                            if (_slider.hasClass("flickity-enabled")) {
                                _slider.flickity("destroy");
                            }
                        }
                    } else {
                        if (!_slider.hasClass("flickity-enabled")) {
                            flickitySlider($(this), slideIndex);
                        }
                    }
                });
                if (jQuery(event.target).find("[data-slider]").length > 0) {
                    jQuery("html, body").animate({ scrollTop: jQuery(event.target).offset().top, });
                }
              
                quantityChange();
                if (jQuery(event.target).find(".dealDate").length > 0) {
                    dealSection(jQuery(event.target).attr("id"));
                }
            }
            if (event.type == "shopify:section:unload") {
                if (event.target.querySelector("[data-map-container]")) {
                    checkMapApi(event.target.querySelector("[data-map-container]"));
                }
            }
            if (event.type == "shopify:section:select") {
                if (jQuery(parent).hasClass("offer-sidebar-section")) {
                    jQuery(parent).show();
                } else if ($(".offer-sidebar-section").find(".yv-offer-sidebar-outer").length == 0) {
                    $(".offer-sidebar-section").hide();
                }
            }
            if (event.type == "shopify:section:select" || event.type == "shopify:section:load") {
                if (jQuery(parent).hasClass("side-drawer-content")) {
                    if (parent.querySelector(".side-drawer-story")) {
                        jQuery("[data-content-drawer-main]").addClass("show");
                        document.querySelector("body").classList.add("story-drawer-open");
                        setTimeout(function () { document.querySelector("body").classList.add("story-drawer-overlay"); }, 400);
                    } else {
                        jQuery("[data-content-drawer-main]").removeClass("show");
                        document.querySelector("body").classList.remove("story-drawer-overlay");
                        setTimeout(function () {
                            document.querySelector("body").classList.remove("story-drawer-open");
                        }, 700);
                    }
                }
            }
            if (event.type == "shopify:section:deselect") {
                if (jQuery(parent).hasClass("side-drawer-content")) {
                    jQuery("[data-content-drawer-main]").removeClass("show");
                    document.querySelector("body").classList.remove("story-drawer-overlay");
                    setTimeout(function () {
                        document
                            .querySelector("body")
                            .classList.remove("story-drawer-open");
                    }, 700);
                }
            }
            var offset = $(parent).offset();
            if (animationStatus) {
                if (AOS) {
                    AOS.refreshHard();
                }
            }
        }
    );

    $("#currencyMobile").change(function () {
        $(this).closest("form").submit();
    });
    var deals = document.getElementsByClassName("deal-banner-section");
    if (deals) {
        Array.from(deals).forEach(function (deal) {
            dealSection(deal.getAttribute("id"));
        });
    }

    $(window).resize(function (event) {
        if ($(window).width() < 992) {
            if ($("body").hasClass("catalog-open")) {
                $("body").removeClass("catalog-open");
                $("#view-catalog").hide();
            }
        }
        sliders();
        sliderFilter();
    });

    $(document).on("click", function (event) {
        var $trigger = $(".currency-dropdown");
        if ($trigger !== event.target && !$trigger.has(event.target).length) {
            $(".currency-menu").slideUp("fast");
        }
    });

    $("body").on("click", ".navbar-toggler,.yv-mobile-category", function (event) {
        event.preventDefault();
        $(".navbar-collapse-sidebar").addClass("show");
        $("body").addClass("nav-open");
    }
    );

    $("body").on("click", ".close-btn", function (event) {
        $("body").removeClass("nav-open"),
            $(".toggle-level,.list-menu__item.toggle").removeClass("open-menu-drop"),
            $(".inner").removeClass("is-open"),
            $(".header-store-content-mobile .store-location-dropdown").slideUp(
                "slow"
            ),
            $(".inner").slideUp("slow");
        setTimeout(() => {
            if (
                window.location.href.indexOf("#mobileMenu") > -1 ||
                window.location.href.indexOf("#header") > -1
            ) {
                let url = window.location.href.replace("#mobileMenu", "");
                url = url.replace("#header", "");
                history.replaceState({}, null, url);
            }
        }, 100);
    });

    $(document).on("click", ".close-cart-drawer", function () {
        $("body").removeClass("minicart-open"), $(".wrapper-overlay").hide();
    });

    $("body").on("click", ".similar_options", function (e) {
        e.preventDefault();
        var _this = $(this);
        $(".wrapper-overlay").css({ display: "block" });
        var getUrl = $(this).attr("data-url");
        const drawer = document.querySelector("[data-similar-product-drawer]");
        drawer.classList.add("searching");
        document.querySelector("body").classList.add("similar_Drawer_open");
        drawer.querySelector("[data-similar-drawer-body]").innerHTML = preLoadLoadGif;
        fetch(getUrl)
            .then((response) => response.text())
            .then((text) => {
                const html = document.createElement("div");
                html.innerHTML = text;
                const recommendations = html.querySelector("#similarItemContainer");
                if (recommendations && recommendations.innerHTML.trim().length) {
                    focusElement = _this;
                    drawer.querySelector("[data-similar-drawer-body]").innerHTML =
                        recommendations.innerHTML;
                    drawer.classList.remove("searching");
                    focusElementsRotation($("[data-similar-product-drawer]"));
                    $(document).find(".yv_similar_drawer_wrapper").trigger("focus");
                    gridPickUpAvailability(drawer);
                    // if (animationStatus) {
                    //     if (AOS) {
                    //         AOS.refreshHard();
                    //     }
                    // }
                }
            });
    });

    $("body").on("click", ".currency-dropdown .dropdown-toggle", function () {
        $(this).closest(".currency-dropdown").find(".currency-menu").slideToggle("fast");
    });

    $("body").on("click", "#CountryList .dropdown-item", function (event) {
        event.preventDefault();
        var value = $(this).attr("data-value");
        var text = $(this).text();
        $(this).closest("form").find(".dropdown-toggle").text(text);
        $(this).closest("form").find('[name="country_code"]').val(value);
        $(this).closest("form").submit();
        $(this)
            .closest(".currency-dropdown")
            .find(".currency-menu")
            .slideUp("fast");
    });

    $("body").on("click", ".dropdown-selected", function () {
        $("body").find(".productOptionSelectList").slideUp("fast");
        $(this).siblings(".productOptionSelectList").css({ display: "block" });
    });

    $("body").on(
        "click",
        ".toggle.list-menu__item,button.toggle-level",
        function (event) {
            event.preventDefault();
            var $this = $(this);
            if ($this.hasClass("open-menu-drop")) {
                $(this).next().removeClass("is-open");
                $(this).removeClass("open-menu-drop");
                $this.next().slideUp("slow");
            } else {
                $(".header-store-content-mobile .store-location-dropdown").slideUp(
                    "slow"
                );
                if ($(this).hasClass("toggle-level")) {
                    $(".toggle-level").removeClass("open-menu-drop");
                    $(".toggle-level").next().removeClass("is-open");
                    $(".toggle-level").next().slideUp("slow");
                } else {
                    $(".toggle.list-menu__item,.toggle-level").removeClass(
                        "open-menu-drop"
                    );
                    $(".toggle.list-menu__item,.toggle-level")
                        .next()
                        .removeClass("is-open");
                    $(".toggle.list-menu__item,.toggle-level").next().slideUp("slow");
                }
                $this.closest("li").find(".inner").removeClass("is-open");
                $this.closest("li").find(".inner").slideUp("slow");
                $(this).addClass("open-menu-drop");
                $this.next().slideDown("slow");
                $this.next().addClass("is-open");
            }
        }
    );

    $(document).on("click", function (event) {
        var $trigger = $(".productOptionSelect");
        if ($trigger !== event.target && !$trigger.has(event.target).length) {
            $(".productOptionSelectList").slideUp("fast");
        }
    });

    $("body").on("click", ".dropdown-menu li", function () {
        var getValue = $(this).text();
        $(this).find("input").prop("checked", true);
        $(this)
            .closest(".productOptionSelect")
            .find(".dropdown-selected")
            .text(getValue);
        $(this).closest(".productOptionSelectList").slideUp("fast");
    });

    $(document).on(
        "click",
        ".yv_side_drawer_close,.yv_similar_drawer_close",
        function () {
            $(".yv-upsell-drawer").removeClass("active");
            $("body")
                .removeClass("side_Drawer_open")
                .removeClass("similar_Drawer_open")
                .removeClass("yv_side_Drawer_open");
            closeVideoMedia("quickView");
            $("[data-similar-drawer-body]").html("");
            stopFocusElementsRotation();
            if (focusElement) {
                if (focusElement.nodeType || focusElement == window) {
                    focusElement.focus();
                } else {
                    focusElement.trigger("focus");
                }
                focusElement = "";
            }
        }
    );

    $(document).on("click", ".quickView", function (evt) {
        evt.preventDefault();
        let _this = $(this);
        const drawer = document.querySelector("[data-side-drawer]");
        drawer.setAttribute("class", "yv_side_drawer_wrapper");
        drawer.setAttribute("id", "yv_quickView_product");
        drawer.classList.add("yv_quickView_product");
        drawer.querySelector("[data-drawer-body]").innerHTML = preLoadLoadGif;
        drawer.querySelector("[data-drawer-title]").innerHTML = quickViewHeading;
        drawer.querySelector("[data-drawer-body]").classList.add("searching");
        document.querySelector("body").classList.add("side_Drawer_open");
        var _url = $(this).data("href");
        if (_url.indexOf("?") > -1) {
            _url = _url.split("?");
            _url = _url[0];
        }
        $(".Quick_loader").fadeIn("slow");
        setTimeout(function () {
            $.get(_url + "?view=quick-view", function (data) {
                $("[data-drawer-body]").html(data);
                // $(window).trigger('resize');
                drawer
                    .querySelector("[data-drawer-body]")
                    .classList.remove("searching");
                if (Shopify.PaymentButton) {
                    Shopify.PaymentButton.init();
                }
                productVariants(drawer);
                quantityChange();
                focusElementsRotation($("[data-side-drawer]"));
                focusElement = _this;
                $(document).find(".yv_side_drawer_wrapper").trigger("focus");
            });
        }, 1000);
    });

    $(document).on("click", ".quickViewClose", function (evt) {
        evt.preventDefault();
        $("body").removeClass("quickview-open");
        stopFocusElementsRotation();
        if (focusElement) {
            if (focusElement.nodeType) {
                focusElement.focus();
            } else {
                focusElement.trigger("focus");
            }
            focusElement = "";
        }
    });

    $(".flickity-slider > div").on("focus,keydown", function () {
        let index = $(this).index();
        $(this).closest(".flickity-enabled").flickity("select", index);
    });

    $(".yv-product-slider").on("scroll", function () {
        document.querySelectorAll(".yv-youtube-video").forEach((video) => {
            let left = video.getBoundingClientRect().left;
            if (!(left > -50 && left < window.innerWidth - 100)) {
                video.contentWindow.postMessage(
                    '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
                    "*"
                );
            }
        });
        document.querySelectorAll(".yv-vimeo-video").forEach((video) => {
            let left = video.getBoundingClientRect().left;
            if (!(left > -50 && left < window.innerWidth - 100)) {
                video.contentWindow.postMessage('{"method":"pause"}', "*");
            }
        });
        document.querySelectorAll("video").forEach((video) => {
            let left = video.getBoundingClientRect().left;
            if (!video.hasAttribute("autoplay")) {
                if (!(left > -50 && left < window.innerWidth - 100)) {
                    video.pause();
                }
            }
        });
    });
    $(document).on("click", ".video-play-btn", function (e) {
        e.preventDefault();
        $(this).closest(".video-overlay-text").hide();
        let $section = $(this).closest(".shopify-section");
        let $video = $section.find("video").first(); // Select the first video in the section
        if ($video.closest(".deferred-media").attr("data-id") === "video-banner-autodisable") {    
            // Ensure the video element exists
            if ($video.length > 0 && $video[0].readyState >= 4) {    
                $video[0].muted = false; // Unmute the video
                $video[0].play(); // Play the video
                
                $(this).hide(); // Hide play button
            } else {
                console.log("Video is not ready yet");
            }
        }
        $(this)
            .closest(".shopify-section")
            .find(".yv-feature-videobox")
            .addClass("video-loaded");
        $(this).closest(".shopify-section").find(".video-banner-file").show();
    });
   
});
jQuery(window).resize(function () {
    setTimeout(function () {
        var sliders = jQuery("body").find("[data-flickity-slider]");
        if (sliders.length > 0) {
            sliders.each(function (index) {
                var _this = jQuery(this);
                if (_this.hasClass("flickity-enabled")) {
                    _this.flickity("resize");
                }
            });
        }
    }, 1000);
});

function viewcategoryInit() {
    $(".yv-browse-category-link").click(function (e) {
        $("#view-catalog").show();
        if ($("body").hasClass("catalog-open")) {
            $("body").removeClass("catalog-open");
            $("#view-catalog").hide();
        } else {
            $("body").addClass("catalog-open");
            $("#view-catalog").show();
        }
    });
}

$(document).on("click", ".menu-tab", function () {
    if ($(this).hasClass("active")) return false;
    $(".menu-tab").removeClass("active");
    $("#mobileMenu").find(".tabcontent").addClass("hidden");
    $(this).addClass("active");
    $($(this).attr("data-tab")).removeClass("hidden");
});

function getFirstAvailableVariant(options, type, selector, allVariants) {
    let availableVariant = null,
        slicedCount = 0;
    do {
        options.pop();
        slicedCount += 1;
        availableVariant = allVariants.find((variant) => {
            return variant["options"]
                .slice(0, variant["options"].length - slicedCount)
                .every((value, index) => value === options[index]);
        });
    } while (!availableVariant && options.length > 0);
    if (availableVariant) {
        let fieldsets = Array.from(
            selector.querySelectorAll(".product-loop-variants")
        );
        fieldsets.forEach((fieldset, index) => {
            if (variantStyle == "dropdown") {
                let option = fieldset.querySelector("select");
                if (option && option.value != availableVariant["options"][index]) {
                    option.value = availableVariant["options"][index];
                }
            } else {
                let option = fieldset.querySelector(
                    'input[value="' + CSS.escape(availableVariant["options"][index]) + '"]'
                );
                if (option && option.checked == false) {
                    option.click();
                }
            }
        });
    }
    return availableVariant;
}
/* get variant based on selected options end */
const classAddToSelector = (
    selector,
    valueIndex,
    available,
    combinationExists
) => {
    if (variantStyle == "swatch") {
        const optionValue = Array.from(selector.querySelectorAll(".productOption"))[
            valueIndex
        ];
        optionValue.parentElement.classList.toggle("hidden", !combinationExists);
        optionValue.classList.toggle("not-available", !available);
    } else {
        const optionValue = Array.from(
            selector.querySelectorAll(".productOption option")
        )[valueIndex];
        optionValue.classList.toggle("hidden", !combinationExists);
        optionValue.toggleAttribute("disabled", !available);
    }
};

function updateOptionsAvailability(
    product,
    productOptions,
    selectedVariant,
    optionSelectors,
    variantStyle
) {
    if (!selectedVariant) {
        return;
    }
    if (optionSelectors && optionSelectors[0]) {
        productOptions[0]["values"].forEach((value, valueIndex) => {
            const combinationExists = product.some(
                (variant) => variant["option1"] === value && variant
            ),
                availableVariantExists = product.some(
                    (variant) => variant["option1"] === value && variant["available"]
                );
            classAddToSelector(
                optionSelectors[0],
                valueIndex,
                availableVariantExists,
                combinationExists
            );
            if (optionSelectors[1] && productOptions[1]) {
                productOptions[1]["values"].forEach((value2, valueIndex2) => {
                    const combinationExists2 = product.some(
                        (variant) =>
                            variant["option2"] === value2 &&
                            variant["option1"] === selectedVariant["option1"] &&
                            variant
                    ),
                        availableVariantExists2 = product.some(
                            (variant) =>
                                variant["option2"] === value2 &&
                                variant["option1"] === selectedVariant["option1"] &&
                                variant["available"]
                        );
                    classAddToSelector(
                        optionSelectors[1],
                        valueIndex2,
                        availableVariantExists2,
                        combinationExists2
                    );
                    if (optionSelectors[2] && productOptions[2]) {
                        productOptions[2]["values"].forEach((value3, valueIndex3) => {
                            const combinationExists3 = product.some(
                                (variant) =>
                                    variant["option3"] === value3 &&
                                    variant["option1"] === selectedVariant["option1"] &&
                                    variant["option2"] === selectedVariant["option2"] &&
                                    variant
                            ),
                                availableVariantExists3 = product.some(
                                    (variant) =>
                                        variant["option3"] === value3 &&
                                        variant["option1"] === selectedVariant["option1"] &&
                                        variant["option2"] === selectedVariant["option2"] &&
                                        variant["available"]
                                );
                            classAddToSelector(
                                optionSelectors[2],
                                valueIndex3,
                                availableVariantExists3,
                                combinationExists3
                            );
                        });
                    }
                });
            }
        });
    }
}

function productGiftOptions() {
    let giftCardWrappers = document.querySelectorAll("[data-gift-card-box]");
    Array.from(giftCardWrappers).forEach(function (giftCard) {
        let jsCheck = giftCard.querySelector("[data-js-gift-card-selector]");
        if (jsCheck) {
            jsCheck.disabled = false;
            jsCheck.addEventListener("click", function () {
                let giftCardContent = giftCard.querySelector(
                    "[data-gift-card-content]"
                );
                if (jsCheck.checked) {
                    DOMAnimations.slideDown(giftCardContent, 500);
                } else {
                    DOMAnimations.slideUp(giftCardContent, 500);
                }
            });
        }
        let noJsCheck = giftCard.querySelector("[data-no-js-gift-card-selector]");
        if (noJsCheck) {
            noJsCheck.disabled = true;
        }
    });
}

function recentlyViewedProducts() {
    let rvpWrappers = document.querySelectorAll("[data-recent-viewed-products]");
    Array.from(rvpWrappers).forEach(function (rvp) {
        let currentProduct = parseInt(rvp.dataset.product);
        let cookieName = "yv-recently-viewed";
        let rvProducts = JSON.parse(
            window.localStorage.getItem(cookieName) || "[]"
        );
        if (!isNaN(currentProduct)) {
            if (!rvProducts.includes(currentProduct)) {
                rvProducts.unshift(currentProduct);
            }
            window.localStorage.setItem(
                cookieName,
                JSON.stringify(rvProducts.slice(0, 14))
            );

            if (rvProducts.includes(parseInt(currentProduct))) {
                rvProducts.splice(rvProducts.indexOf(parseInt(currentProduct)), 1);
            }
        }
        let currentItems = rvProducts
            .map((item) => "id:" + item)
            .slice(0, 6)
            .join(" OR ");
        fetch(rvp.dataset.section + currentItems)
            .then((response) => response.text())
            .then((text) => {
                const html = document.createElement("div");
                html.innerHTML = text;
                const recommendations = html.querySelector(
                    "[data-recent-viewed-products]"
                );
                if (recommendations && recommendations.innerHTML.trim().length) {
                    rvp.innerHTML = recommendations.innerHTML;
                    rvp.closest(".shopify-section").classList.remove("hidden");
                    gridPickUpAvailability(rvp);
                }
            })
            .catch((e) => {
                console.error(e);
            });
    });
}

function isOnScreenVisible(elm) {
    const rect = elm.getBoundingClientRect();
    const viewHeight = Math.max(
        document.documentElement.clientHeight,
        window.innerHeight
    );
    return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

function getOffsetTop(elm) {
    if (!elm.getClientRects().length) {
        return 0;
    }
    const rect = elm.getBoundingClientRect();
    const win = elm.ownerDocument.defaultView;
    return rect.top + win.pageYOffset;
}

function lookbookscrollItem(currentSlideMedia, scrollValue) {
    currentSlideMedia.style.height = `${scrollValue}px`;
}

function lookbookScrollContent() {
    if (window.innerWidth <= 767) return;
    const sliderItems = document.querySelectorAll("[data-lookbook-container]");
    const screenHeight = Math.min(window.innerHeight, window.screen.availHeight);
    let currentScroll = window.scrollY;
    const adjustSlideHeights = (slideritem, slides, slidesMediaItems) => {
        const sliderTop = slideritem.getBoundingClientRect().top + window.scrollY;
        let current = 0;
        slides.forEach((slide, index) => {
            const slideTop = slide.getBoundingClientRect().top + window.scrollY;
            const isVisible = window.scrollY >= slideTop - screenHeight;
            if (index === 0) {
                slidesMediaItems[index].style.height = "100%";
            } else {
                const scrollProgress = Math.min(
                    screenHeight,
                    window.scrollY - slideTop + screenHeight
                );
                slidesMediaItems[index].style.height = isVisible ? `${scrollProgress}px` : "0";
            }
            if (isVisible) {
                current = index;
            }
        });
        // Logic for `lookbook-to-normal` class based on original code
        const scrollTop = window.scrollY >= 0 ? window.scrollY : 0;
        // Add class if scrolled to top and not already added
        if (scrollTop < sliderTop && !slideritem.classList.contains("lookbook-to-normal")) {
            slideritem.classList.add("lookbook-to-normal");
        }
        const isLastSlideFullyVisible = scrollTop + screenHeight >= sliderTop + slideritem.offsetHeight;
        // Add/remove class based on scroll position within slider
        if (current === 0 && isLastSlideFullyVisible && !slideritem.classList.contains("lookbook-to-normal")) {
            slideritem.classList.add("lookbook-to-normal");
        } else if (current > 0) {
            const scrollValue = scrollTop - sliderTop - screenHeight * (current - 1);
            if (isLastSlideFullyVisible && !slideritem.classList.contains("lookbook-to-normal")) {
                slideritem.classList.add("lookbook-to-normal");
            } else if (!isLastSlideFullyVisible && slideritem.classList.contains("lookbook-to-normal")) {
                slideritem.classList.remove("lookbook-to-normal");
            }
            if (!slideritem.classList.contains("lookbook-to-normal")) {
                lookbookscrollItem(slidesMediaItems[current], scrollValue);
            }
        }
    };

    // Main scroll function
    const onScroll = () => {
        sliderItems.forEach(slideritem => {
            const slides = slideritem.querySelectorAll(".lookbook-items");
            const slidesMediaItems = slideritem.querySelectorAll(".left-box > div");
            adjustSlideHeights(slideritem, slides, slidesMediaItems);
        });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();  // Run on load to set initial heights
}

window.addEventListener("resize", function () {
    if (window.innerWidth > 767) {
        lookbookScrollContent();
    }
});

$(document).click(function (event) {
    var container = $(".yv-header-searchbar-box");
    if (!container.is(event.target) && !container.has(event.target).length) {
        $(".yv-header-searchbar-content").hide();
    }
});

function gridPickUpAvailability(section = document) {
    let gridElements = section.querySelectorAll(
        ".grid-pickup-availability-preview-container"
    );
    Array.from(gridElements).forEach(function (grid) {
        var preferredStore = localStorage.getItem("preferredStore");
        var pickupElements = grid.querySelectorAll(".grid__avail-pickup");
        Array.from(pickupElements).forEach(function (element) {
            element.classList.add("hidden");
        });
        if (preferredStore == null && grid.querySelector("[data-select-store]")) {
            grid.querySelector("[data-select-store]").classList.remove("hidden");
        } else {
            let currentPickupStore = grid.querySelector(
                '.grid__avail-pickup[data-store="' + preferredStore + '"]'
            );
            if (currentPickupStore) {
                currentPickupStore.classList.remove("hidden");
            } else if (grid.querySelector("[data-store-unavailable]")) {
                grid.querySelector("[data-store-unavailable]").querySelector("[data-location-name]").textContent = preferredStore;
                grid.querySelector("[data-store-unavailable]").classList.remove("hidden");
            }
        }
    });
}

function initStoreLocator() {
    const preferredStoreKey = "preferredStore";
    const storeLocatorItems = document.querySelectorAll(".yv-store-locator-details-item");
    const modalWrapper = document.querySelector(".yv-store-locator-wrapper");
    const updatePreferredStore = (storeName) => {
        localStorage.setItem(preferredStoreKey, storeName);
        gridPickUpAvailability();
    };
    const getPreferredStore = () => localStorage.getItem(preferredStoreKey);
    const closeModal = () => {
        modalWrapper.style.display = "none";
        modalWrapper.classList.remove("store-locator-visible");
        document.querySelector("body").classList.remove("store-locator-open");
    };
    const button = document.querySelector(".yv-store-locator-btn");
    const closebutton = document.querySelector(".yv-store-locator-close");
    if (button) {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            modalWrapper.style.display = "flex";
            modalWrapper.classList.add("store-locator-visible");
            document.querySelector("body").classList.add("store-locator-open");
            initStoreMap();
        });
    }
    if (closebutton) {
        closebutton.addEventListener("click", (event) => {
            event.preventDefault();
            closeModal();
        });
    }
    const preferredStore = getPreferredStore();
    if (preferredStore) {
        const preferredStoreItem = document.querySelector(
            `.yv-store-locator-details-item[data-label="${preferredStore}"]`
        );
        if (preferredStoreItem) {
            preferredStoreItem.classList.add("active");
        }
    }
    const changePreferredStoreButton = document.querySelector(".store-location-save");
    if (changePreferredStoreButton) {
        changePreferredStoreButton.addEventListener("click", () => {
            const activeItem = document.querySelector(".yv-store-locator-details-item.active");
            if (activeItem) {
                const storeName = activeItem.getAttribute("data-label");
                updatePreferredStore(storeName);
                closeModal();
            }
        });
    }
    if (storeLocatorItems.length > 0) {
        const script = document.createElement("script");
        script.src =
            "https://maps.googleapis.com/maps/api/js?key=" +
            googleMapApiKey +
            "&callback=initStoreMap";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
    }
}

async function getGeoDetails(geocoder, address) {
    let getAddress = new Promise(function (resolve, reject) {
        geocoder.geocode({ address: address }, function (results, status) {
            if (status === "OK") {
                resolve([
                    results[0].geometry.location.lat(),
                    results[0].geometry.location.lng(),
                ]);
            } else {
                reject(new Error("Couldnt't find the location " + address));
            }
        });
    });
    return await getAddress;
}

function initStoreMap() {
    setTimeout(() => {
        let geocoder = new google.maps.Geocoder();
        const storeLocatorItems = document.querySelectorAll(
            ".yv-store-locator-details-item"
        );
        if (storeLocatorItems.length == 0) {
            return false;
        }
        const preferredStoreKey = "preferredStore";
        const map = new google.maps.Map(
            document.querySelector(".yv-store-locator-map"), {
            center: { lat: 0, lng: 0 },
            zoom: 8,
            mapTypeControl: false,
            streetViewControl: false,
            scrollwheel: false,
        }
        );
        const markers = [];
        const createMarker = (position) => {
            return new google.maps.marker.AdvancedMarkerElement({
                position: position,
                map: map,
                icon: document.querySelector(".yv-store-locator-map").getAttribute("data-marker"),
            });
        };
        const updateMap = (latitude, longitude) => {
            map.setCenter({ lat: latitude, lng: longitude });
            map.setZoom(15);
            markers.forEach((marker) => marker.setMap(null));
            const position = { lat: latitude, lng: longitude };
            const marker = createMarker(position);
            markers.push(marker);
        };
        let activeItem = document.querySelector(
            ".yv-store-locator-details-item.active"
        );
        if (!activeItem) {
            activeItem = document.querySelector(".yv-store-locator-details-item");
        }
        let address = activeItem.getAttribute("data-address");
        let geoDetail = getGeoDetails(geocoder, address);
        geoDetail.then(function (address) {
            if (geoDetail != null) {
                updateMap(address[0], address[1]);
            }
        });
        storeLocatorItems.forEach((item) => {
            item.addEventListener("click", () => {
                const storeName = item.getAttribute("data-label");
                let address = item.getAttribute("data-address");
                storeLocatorItems.forEach((sibling) => {
                    if (sibling !== item) {
                        sibling.classList.remove("active");
                    }
                });
                item.classList.add("active");
                let geoDetail = getGeoDetails(geocoder, address);
                geoDetail.then(function (address) {
                    if (geoDetail != null) {
                        updateMap(address[0], address[1]);
                    }
                });
            });
        });
    }, 100);
}

function productQueryForm() {
    const button = document.querySelector(".yv-ask-question-btn");
    const addonmodalWrapper = document.querySelector(".yv-addon-button-wrapper");
    const addonclosebutton = document.querySelector(".yv-addon-button-close");
    if (button) {
        button.addEventListener("click", (event) => {
            addonmodalWrapper.style.display = "flex";
            document.querySelector("body").classList.add("query-form-open");
        });
    }
    if (addonmodalWrapper) {
        function addoncloseModal() {
            addonmodalWrapper.style.display = "none";
            document.querySelector("body").classList.remove("query-form-open");
        }
    }
    if (addonclosebutton) {
        addonclosebutton.addEventListener("click", (event) => {
            event.preventDefault();
            addoncloseModal();
        });
    }
}

function timelineNavInit(section = document) {
    let navsElements = section.querySelectorAll("[data-timeline-nav]");
    Array.from(navsElements).forEach(function (nav) {
        nav.addEventListener("click", () => {
            if (nav.classList.contains("active")) {
                return false;
            }
            let _section = nav.closest(".shopify-section");
            let activeNav = _section.querySelector(".yv-timeline-nav.active");
            if (activeNav) {
                activeNav.classList.remove("active");
                nav.closest(".yv-timeline-nav").classList.add("active");
            }
            let focusContentSlider = Flickity.data(
                "#" + nav.getAttribute("data-focus-content")
            );
            let focusIndex = nav.getAttribute("data-index");
            if (focusContentSlider && focusIndex) {
                focusContentSlider.select(focusIndex);
            }
        });
    });
}

function collectionHoverNavInit(section = document) {
    let navsElements = section.querySelectorAll("[data-hover-collection-item]");
    Array.from(navsElements).forEach(function (nav) {
        nav.addEventListener("mouseover", () => {
            collectionHoverAction(nav);
        });
    });
}

function collectionHoverAction(nav) {
    if (nav.classList.contains("active")) {
        return false;
    }
    let _section = nav.closest(".shopify-section");
    let activeImage = _section.querySelector(
        ".featured-collections-banner-img.active"
    );
    let activeNav = _section.querySelector("[data-hover-collection-item].active");
    if (activeNav) {
        activeNav.classList.remove("active");
        nav.classList.add("active");
    }
    let currentItemID = nav.getAttribute("data-media");
    let currentMedia = _section.querySelector("#" + currentItemID);
    let _name = nav.textContent;
    let _href = nav.getAttribute("data-href");
    let nameSelector = _section.querySelector("[data-collection-banner-title]");
    if (currentMedia) {
        activeImage.classList.remove("active");
        currentMedia.classList.add("active");
    }
    if (nameSelector) {
        nameSelector.textContent = _name;
        if (_href != null) {
            nameSelector.removeAttribute("role");
            nameSelector.removeAttribute("aria-disabled");
            nameSelector.setAttribute("href", _href);
        } else {
            nameSelector.removeAttribute("href");
            nameSelector.setAttribute("aria-disabled", true);
            nameSelector.setAttribute("role", "link");
        }
    }
    if (_section.querySelector("[data-collection-banner-description]")) {
        if (nav.nextElementSibling) {
            _section.querySelector(
                "[data-collection-banner-description]"
            ).textContent = nav.nextElementSibling.textContent;
            _section
                .querySelector("[data-collection-banner-description]")
                .classList.remove("hidden");
        } else {
            _section
                .querySelector("[data-collection-banner-description]")
                .classList.add("hidden");
        }
    }
}

function newsletterSidebar() {
    const button = document.querySelector(".yv-discount-panel");
    const newslettermodalWrapper = document.querySelector(
        ".yv-discount-sidebar-element"
    );
    const newsletterclosebutton = document.querySelector(
        ".yv-newsletter-popup-button-close"
    );
    if (button) {
        button.addEventListener("click", (event) => {
            newslettermodalWrapper.style.display = "flex";
            document.querySelector("body").classList.add("newsletter-popup-open");
        });
    }
    if (newslettermodalWrapper) {
        function newslettercloseModal() {
            newslettermodalWrapper.style.display = "none";
            document.querySelector("body").classList.remove("newsletter-popup-open");
        }
    }
    if (newsletterclosebutton) {
        newsletterclosebutton.addEventListener("click", (event) => {
            event.preventDefault();
            newslettercloseModal();
        });
    }
}

// Set the sale end date as a JavaScript variable
function pdpCountdown() {
    Array.from(document.querySelectorAll("[data-product-countdown]")).forEach(
        function (countdownElement) {
            var EndDate = countdownElement.getAttribute("data-product-countdown");
            if (EndDate != null) {
                var saleEndDate = new Date(EndDate);
                // Function to update the countdown timer
                let pdpCountdownInterval = setInterval(function () {
                    var now = new Date();
                    var timeRemaining = saleEndDate - now;
                    var days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
                    var hours = Math.floor(
                        (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                    );
                    var minutes = Math.floor(
                        (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
                    );
                    var seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
                    countdownElement.querySelector("#dDays1").innerHTML = days;
                    countdownElement.querySelector("#dHours1").innerHTML = hours;
                    countdownElement.querySelector("#dMinutes1").innerHTML = minutes;
                    countdownElement.querySelector("#dSeconds1").innerHTML = seconds;
                    if (timeRemaining <= 0) {
                        countdownElement.style.display = "none";
                        clearInterval(pdpCountdownInterval);
                    }
                }, 1000);
            }
        }
    );
}

function updateBackInStock(variant, container) {
    if (container) {
        let backInStockWrapper = container.querySelector("[data-back-in-stock]");
        if (backInStockWrapper) {
            let backInStockVariant = container.querySelector("[data-variant-title]");
            let backInStockVariantUrl = container.querySelector("[data-variant-url]");
            if (variant != undefined) {
                let baseUrl = window.location.pathname;
                if (baseUrl.indexOf("/products/") > -1) {
                    let _updateUrl =
                        baseUrl + "?variant=" + variant.id + "&contact_posted=true";
                    backInStockVariantUrl.value = _updateUrl;
                }
                backInStockVariant.value = variant.name;
                if (variant.available) {
                    if (!Shopify.designMode) {
                        backInStockWrapper.classList.add("hidden");
                    }
                } else {
                    backInStockWrapper.classList.remove("hidden");
                }
            } else {
                if (!Shopify.designMode) {
                    backInStockWrapper.classList.add("hidden");
                }
            }
        }
    }
}

function toggleForm(event) {
    event.preventDefault();
    let element = event.target;
    let elementParent = element.closest(".account-wrapper");
    let closeElement = elementParent.querySelector("#" + element.dataset.close);
    let openElement = elementParent.querySelector("#" + element.dataset.open);
    if (openElement && closeElement) {
        closeElement.style.display = "none";
        openElement.style.display = "block";
    }
}

function toggleAccountPopup(event, accountType) {
    event.preventDefault();
    let element = event.target;
    if (accountType == "dropdown") {
        let toggleElement = document.querySelector("[data-account-dropdown]");
        if (toggleElement) {
            DOMAnimations.slideToggle(toggleElement, 250);
        }
    } else {
        let toggleElement = document.querySelector("[data-account-popup]");
        if (toggleElement) {
            document.querySelector("body").classList.add("account-popup-open");
        }
    }
}

function toggleStoreDetails(event) {
    event.preventDefault();
    let element = event.target;
    let parent = element.closest("[data-store-wrapper]");
    let toggleElement = parent.querySelector("[data-store-location-dropdown]");
    if (parent.classList.contains("customer-support-mobile")) {
        $(".toggle-level,.list-menu__item.toggle").removeClass("open-menu-drop"),
            $(".inner").removeClass("is-open"),
            $(".inner").slideUp("slow");
    }
    if (toggleElement) {
        DOMAnimations.slideToggle(toggleElement, 250);
    }
}

function initSearchPrompts(section = document) {
    let inputElements = section.querySelectorAll(
        "[data-search-drawer-query-input]"
    );
    let typingSpeed = 100;
    let deletingSpeed = 60;
    let delayAfterDeleting = 500;
    let delayBeforeFirstDelete = 2000;
    let delayAfterWordTyped = 2400;
    Array.from(inputElements).forEach(function (input) {
        if (input.classList.contains("enable-searchpromt")) {
            let placeholders = [];
            if (input.placeholder) {
                placeholders.push(input.placeholder);
            }
            if (input.dataset.placeholderTwo) {
                placeholders.push(input.dataset.placeholderTwo);
            }
            if (input.dataset.placeholderThree) {
                placeholders.push(input.dataset.placeholderThree);
            }
            async function typeInNextPlaceholder(placeholder) {
                await new Promise((resolve) => {
                    let currentPlaceholder = input.getAttribute("placeholder");
                    let nextPlaceholder =
                        currentPlaceholder.length >= 3 &&
                            placeholder.startsWith(currentPlaceholder) ?
                            placeholder.replace(currentPlaceholder, "") :
                            placeholder;
                    const typingIntervalId = setInterval(() => {
                        currentPlaceholder = input.getAttribute("placeholder");
                        input.setAttribute(
                            "placeholder",
                            currentPlaceholder + nextPlaceholder.charAt(0)
                        );
                        if (nextPlaceholder.length === 1) {
                            resolve();
                            clearInterval(typingIntervalId);
                        } else {
                            nextPlaceholder = nextPlaceholder.substring(1);
                        }
                    }, typingSpeed);
                });
            }

            async function deleteCurrentPlaceholder(nextPlaceholder) {
                await new Promise((resolve) => {
                    let prevPlaceholder = input.getAttribute("placeholder");
                    const deletionIntervalId = setInterval(() => {
                        const newPlaceholder = prevPlaceholder.substring(
                            0,
                            prevPlaceholder.length - 1
                        );
                        input.setAttribute("placeholder", newPlaceholder);
                        prevPlaceholder = newPlaceholder;
                        if (
                            prevPlaceholder.length === 0 ||
                            (prevPlaceholder.length >= 3 && nextPlaceholder.startsWith(prevPlaceholder))
                        ) {
                            resolve();
                            clearInterval(deletionIntervalId);
                        }
                    }, deletingSpeed);
                });
            }

            let startIndex = 0;
            function showNextPlaceholder() {
                startIndex = (startIndex + 1) % placeholders.length;
                const nextPlaceholder = placeholders[startIndex];
                deleteCurrentPlaceholder(nextPlaceholder).then(() => {
                    setTimeout(() => {
                        typeInNextPlaceholder(nextPlaceholder).then(() => {
                            setTimeout(showNextPlaceholder, delayAfterWordTyped);
                        });
                    }, delayAfterDeleting);
                });
            }
            setTimeout(showNextPlaceholder, delayBeforeFirstDelete);
        }
    });
}

class Variants extends HTMLElement {
    constructor() {
      super();
      this.addEventListener('change', this._onVariantChange);
      this.card = this.closest('[data-product-main-grid]');
    }

    _onVariantChange(event) {
        this._updateOptions();
        this._updateMasterVariantId();  
        this._updateMedia();
        if(this.currentVariant){
            const cartForm = this.previousElementSibling?.tagName === 'FORM' ? this.previousElementSibling : null;
            if(cartForm){
                const idInput = cartForm.querySelector('[name="id"]'); 
                if (idInput) {
                    idInput.value = this.currentVariant.id;
                }
                if(cartDrawerEnable) {
                    cartForm.querySelector(".Sd_addProduct").click();
                }else{
                  cartForm.submit();
                }
            }
            console.log('Closest Form:', cartForm);
        }

    }

    _updateOptions() {
        // console.log('current variant 77', this.currentVariant);
        this.options = Array.from(this.querySelectorAll('ul'), (element) => {
            return Array.from(element.querySelectorAll('input')).find((radio) => radio.checked)?.value;
        });
          
        const colorOptions = Array.from(this.card.querySelectorAll('.color-variants-wrapper'), (element) => {
            return Array.from(element.querySelectorAll('input')).find((radio) => radio.checked)?.value;
        });
        
        this.options = [...this.options, ...colorOptions];
    }

    _updateMasterVariantId() {
        this.currentVariant = this._getVariantData().find((variant) => {
            return !variant.options
            .map((option, index) => {
                return this.options[index] === option;
            })
            .includes(false);
        });
    }

    _getVariantData() {
       this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
       return this.variantData;
    }

    _updateMedia(){
        if (!this.currentVariant) return;
        const productCard = this.closest('[data-product-card]');
        if (productCard && productCard.querySelector('[data-product-grid-main-image]') && this.currentVariant.featured_image != null) {
            let imageContent = `${this.currentVariant.featured_media.preview_image.src}&width=100 100w,
            ${this.currentVariant.featured_media.preview_image.src}&width=200 200w,
            ${this.currentVariant.featured_media.preview_image.src}&width=300 300w,
            ${this.currentVariant.featured_media.preview_image.src}&width=400 400w`;
            productCard.querySelector('[data-product-grid-main-image]').querySelector('img').srcset = imageContent;
        }
    }
}
customElements.define('variants-set', Variants);

function switchSwatchMedia(event) {
    let element = event.target;
    if (element.classList.contains("active")) return false;
    let mediaParent = element.closest("[data-color-wrapper]");
    let gridParent = element.closest("[data-product-main-grid]");
    let productMediaWrapper = gridParent.querySelector("[data-product-grid-main-image]");
    if (element.closest(".color-variants-wrapper").querySelector(".productOption.active")) {
        element.closest(".color-variants-wrapper").querySelector(".productOption.active").classList.remove("active");
    }
    element.classList.add("active");
    if (mediaParent.querySelector("script") && productMediaWrapper) {
        let colorMedia = new DOMParser()
            .parseFromString(
                JSON.parse(mediaParent.querySelector("script").textContent),
                "text/html"
            )
            .querySelector(".media-content");
        productMediaWrapper.innerHTML = colorMedia.innerHTML;
    }
}

function localizationElements(section = document) {
    let localizationDropdowns = section.querySelectorAll(".detail-box");
    Array.from(localizationDropdowns).forEach(function (dropdown) {
        let footer = dropdown.closest("footer");
        dropdown.addEventListener("click", () => {
            if (dropdown.classList.contains("active")) {
                DOMAnimations.slideUp(dropdown.querySelector(".detail-expand"), 300);
                dropdown.classList.remove("active");
                setTimeout(() => {
                    if (footer) {
                        footer.style.removeProperty("z-index");
                    }
                }, 100); 
            } else {
                DOMAnimations.slideDown(dropdown.querySelector(".detail-expand"), 300);
                dropdown.classList.add("active");
                setTimeout(() => {
                    if (footer) {
                        footer.style.zIndex = 2;
                    }
                }, 100);
            }
        });
        dropdown.onkeydown = function (e) {
            if (e.keyCode == 13 || e.keyCode == 32) {
                dropdown.click();
            }
        };
        section.addEventListener("click", (event) => {
            if (!dropdown.parentNode.contains(event.target)) {
                DOMAnimations.slideUp(dropdown.querySelector(".detail-expand"), 300);
                if (dropdown.classList.contains("active")) {
                    dropdown.classList.remove("active");
                    if (footer) {
                        footer.style.removeProperty("z-index");
                    }
                }
            }
        });
    });
}

function sideDrawerContentStoryInit(section = document) {
    let contentDrawerHeads = section.querySelectorAll(
        "[data-content-drawer-head]"
    );
    Array.from(contentDrawerHeads).forEach(function (contentDrawerHead) {
        contentDrawerHead.addEventListener("click", function (event) {
            event.preventDefault();
            let mainParent = contentDrawerHead.closest("[data-content-drawer-main]");
            if (mainParent.classList.contains("show")) {
                document.querySelector("body").classList.remove("story-drawer-overlay");
                mainParent.classList.remove("show");
                setTimeout(function () {
                    document.querySelector("body").classList.remove("story-drawer-open");
                }, 700);
            } else {
                setTimeout(function () {
                    mainParent.classList.add("show");
                }, 200);
                document.querySelector("body").classList.add("story-drawer-open");
                setTimeout(function () {
                    document.querySelector("body").classList.add("story-drawer-overlay");
                }, 400);
            }
        });
    });
    let contentDrawerCloseBtn = section.querySelectorAll(
        "[side-drawer-story-close]"
    );
    Array.from(contentDrawerCloseBtn).forEach(function (closeBtn) {
        closeBtn.addEventListener("click", function (event) {
            event.preventDefault();
            let mainParent = closeBtn.closest("[data-content-drawer-main]");
            mainParent.classList.remove("show");
            document.querySelector("body").classList.remove("story-drawer-overlay");
            setTimeout(function () {
                document.querySelector("body").classList.remove("story-drawer-open");
            }, 700);
        });
    });
}

function updateBlogbtnHeight() {
    Array.from(document.querySelectorAll(".yv-blog-card")).forEach((card) => {
        if(!card) return;
        const descElement = card.querySelector(".yv-blog-card-text");
        const buttonHeight = card.querySelector(".button.secondary-button");
        
        if (descElement && buttonHeight) {
            descElement.style.setProperty("--button-height", `${buttonHeight.getBoundingClientRect().height}px`);
        }
    });
    }

function updateBannerGridHeight() {
        const descElement = document.querySelector(".banner-collection-product-list");
        if(!descElement) return;
        
        if (descElement) {
            const section = descElement.closest('.shopify-section');
            section.style.setProperty("--banner-grid-height", `${descElement.getBoundingClientRect().height}px`);
        }
}

function UpdateSplitBannerdescHeight() {
    Array.from(document.querySelectorAll(".split-banner-content")).forEach((card) => {
        if (card) {
            const descHeight = card.querySelector(".split-banner-desc");
            if(descHeight){
            card.style.setProperty("--desc-height", `${descHeight.getBoundingClientRect().height}px`);
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
        document.querySelector("body").classList.remove("page-loading");
        if (document.querySelector("body").classList.contains("nav-open")) {
            document.querySelector("body").classList.remove("nav-open");
        }
    }, 500);
    var footerMenus = document.getElementsByClassName("footer-menu-accordion-head");
    Array.from(footerMenus).forEach(function (menu) {
        var menuList = menu.nextElementSibling;
        var menuParent = menu.parentNode;
        menu.addEventListener("click", function (event) {
            if (window.innerWidth < 768) {
                event.preventDefault();
                if (!menuParent.classList.contains("active")) {
                    hideallMenus(footerMenus, menu);
                    DOMAnimations.classToggle(menuParent, "active");
                    DOMAnimations.slideToggle(menuList);
                } else {
                    DOMAnimations.classToggle(menuParent, "active");
                    DOMAnimations.slideToggle(menuList);
                }
            }
        });
        window.addEventListener("resize", function () {
            setTimeout(function () {
                if (window.innerWidth < 768) {
                    if (!menuParent.classList.contains("active")) {
                        hideallMenus(footerMenus, menu);
                    }
                } else {
                    DOMAnimations.slideDown(menuList);
                }
            }, 200);
        });
    });
    
    Array.from(document.querySelectorAll(".split-banner-content")).forEach((content) => {
        if(!content) return;
        const descHeight = content.querySelector(".split-banner-desc");
        if(descHeight){
        const resizeObserver = new ResizeObserver(() => {
            UpdateSplitBannerdescHeight();
          });
          resizeObserver.observe(descHeight);
        }
    });

    Array.from(document.querySelectorAll(".yv-blog-card")).forEach((card) => {
        if(!card) return;
        button = card.querySelector(".button.secondary-button");
        if(button){
        const resizeObserver = new ResizeObserver(() => {
            updateBlogbtnHeight();
          });
          resizeObserver.observe(button);
        }
    });
        
    const descElement = document.querySelector(".banner-collection-product-list");
    if(descElement){
        const resizeObserver = new ResizeObserver(() => {
            updateBannerGridHeight();
          });
          resizeObserver.observe(descElement);
        }
        
      
    cookiesBanner();
    hamburgerInit();
    navigationMenu();
    initSearchPrompts();
    onloadEvents();
});

function onloadEvents() {
    initYouTubeIframe();
    viewcategoryInit();
    initBeforeAfter();
    productHoverSlider();
    updateInventroyStatusBar();
    productRecommendations();
    sliderFilter();
    closeDrawers();
    recentlyViewedProducts();
    productGiftOptions();
    lookbookScrollContent();
    if (gridPickupAvailabilityStatus) {
        gridPickUpAvailability();
    }
    initStoreLocator();
    productQueryForm();
    timelineNavInit();
    collectionHoverNavInit();
    newsletterSidebar();
    pdpCountdown();
    localizationElements();
    coloredCollection();
    startTimer();
    sideDrawerContentStoryInit();
}

if (document.querySelector(".fixed-overlay")) {
    const stickersOverlay = document.querySelector(".fixed-overlay");
    stickersOverlay.addEventListener("click", function (e) {
        resetTimer();
    });
    stickersOverlay.addEventListener("keydown", function (e) {
        resetTimer();
    });
}

document.addEventListener("scroll", (event) => {
    if (document.querySelector(".fixed-overlay")) {
        resetTimer();
    }
    closeVideoMedia();
    footerDropdownCheck();
    sideBarVisibility();
});

function sideBarVisibility() {
    let windowCenter = window.innerHeight;
    if (document.querySelector("[data-content-drawer-main]")) {
        if (window.scrollY > windowCenter) {
            document.querySelector("[data-content-drawer-main]").classList.add("expand");
        } else {
            document.querySelector("[data-content-drawer-main]").classList.remove("expand");
        }
    }
}

function footerDropdownCheck() {
    let windowCenter = window.innerHeight / 2;
    if (document.querySelector(".footer-dropdown")) {
        let elementScrollTop = document
            .querySelector(".footer-dropdown")
            .getBoundingClientRect().top;
        if (isOnScreen(document.querySelector(".footer-dropdown"))) {
            if (elementScrollTop < windowCenter) {
                document.querySelector(".footer-dropdown").classList.add("bottom");
            } else {
                document.querySelector(".footer-dropdown").classList.remove("bottom");
            }
        }
    }
}

var timer = null;
var svgTimer = null;
var svgCount = 200;
var svgs = [];
function generateRandomInteger(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
}

function startTimer() {
    timer = setTimeout(() => {
        if (document.querySelector(".fixed-overlay")) {
            appendSVG();
        }
    }, stickersTimer);
}

function randomColorCode(numArr) {
    return numArr[Math.floor(Math.random() * numArr.length)];
}

function randomScale() {
    let scaleArr = ["1.0", "1.1", "1.2", "1.3", "1.4"];
    return scaleArr[Math.floor(Math.random() * scaleArr.length)];
}

function appendSVG() {
    if (svgs.length < svgCount) {
        randomSticker = stickers[Math.floor(Math.random() * stickers.length)];
        let parsedNode = new DOMParser().parseFromString(
            randomSticker,
            "text/html"
        );
        let parsedSticker = parsedNode.querySelector("svg");
        let stickerParent = document.createElement("div");
        let x = generateRandomInteger(0, 90);
        let y = generateRandomInteger(0, 90);
        let deg = generateRandomInteger(0, 360);
        let scale = randomScale();
        let randomColor;
        let randomBackground;
        do {
            randomColor = randomColorCode(randomTextColors);
            randomBackground = randomColorCode(randomBgColors);
        } while (randomColor === randomBackground);
        stickerParent.classList.add(
            `sticker`,
            `color-${randomColor}`,
            `background-${randomBackground}`
        );
        stickerParent.style.cssText = `top:${x}vh; left:${y}vw; rotate:${deg}deg; scale:${scale}`;
        stickerParent.appendChild(parsedSticker);
        document.querySelector(".fixed-overlay").appendChild(stickerParent);
        svgTimer = setTimeout(appendSVG, 1000); // 1 second delay
        svgs.push(stickerParent);
    }
}

function resetTimer() {
    if (document.querySelector(".fixed-overlay")) {
        document.querySelector(".fixed-overlay").innerHTML = "";
    }
    clearTimeout(timer);
    clearTimeout(svgTimer);
    startTimer();
}

function reelPlay(event) {
    event.preventDefault();
    let _target = event.target;
    if (_target.closest(".product-video-link")) {
        _target = _target.closest(".product-video-link");
    }
    let videoUrl = _target.getAttribute("data-src");
    let reelAspectRatio = _target.dataset.aspectRatio;
    let video = document.createElement("video");
    video.src = videoUrl;
    video.autoplay = true;
    video.playsInline = true;
    video.controls = true;
    video.loop = true;
    if (
        _target
            .closest("[products-reels-list]")
            .querySelector(".product-video-item.active")
    ) {
        _target
            .closest("[products-reels-list]")
            .querySelector(".product-video-item.active")
            .classList.remove("active");
        _target.parentElement.classList.add("active");
    } else {
        _target.parentElement.classList.add("active");
    }
    let reelPopup = document.querySelector("[data-reels-popup]");
    if (reelPopup) {
        if (reelPopup.querySelector(".image-wrapper")) {
            reelPopup.querySelector(".image-wrapper").style.paddingBottom =
                reelAspectRatio + "%";
            reelPopup.querySelector(".image-wrapper").innerHTML = "";
            reelPopup.querySelector(".image-wrapper").appendChild(video);
        }
        reelPopup.classList.add("video-popup-open");
        reelPopup.style.display = "flex";
    }
}

function reelClose(event) {
    event.preventDefault();
    let _target = event.target;
    let reelPopup = _target.closest("[data-reels-popup]");
    reelPopup.classList.remove("video-popup-open");
    reelPopup.style.display = "none";
    if (reelPopup.querySelector(".image-wrapper")) {
        reelPopup.querySelector(".image-wrapper").innerHTML = "";
    }
    if (document.querySelector(".product-video-item.active")) {
        document
            .querySelector(".product-video-item.active")
            .classList.remove("active");
    }
}

function coloredCollection(section = document) {
    let colorItems = section.querySelectorAll("[data-list-item]");
    Array.from(colorItems).forEach(function (colorItem) {
        colorItem.addEventListener("click", function (e) {
            e.preventDefault();
            if (colorItem.classList.contains("active")) return false;
            let targetIndex = colorItem.getAttribute("data-list-item");
            let closestWrapper = colorItem.closest("[data-coll-wrapper]");
            let activeElements = closestWrapper.querySelectorAll(".active");
            Array.from(activeElements).forEach(function (activeElement) {
                if (activeElement.classList.contains("color-collections-img-item")) {
                    activeElement.classList.add("previous");
                    setTimeout(() => {
                        activeElement.classList.add("hidden");
                        activeElement.classList.remove("active");
                        setTimeout(() => {
                            activeElement.classList.remove("previous");
                            activeElement.classList.remove("hidden");
                        }, 500);
                    }, 800);
                } else {
                    if (!activeElement.classList.contains("color-collections-color-item")) {
                        activeElement.classList.add("hidden");
                    }
                    activeElement.classList.remove("active");
                }
            });
            colorItem.classList.add("active");
            closestWrapper
                .querySelector(`.img-item-${targetIndex}`)
                .classList.add("active");
            closestWrapper
                .querySelector(`[data-grid-id="${targetIndex}"]`)
                .classList.add("active");
            closestWrapper
                .querySelector(`[data-grid-id="${targetIndex}"]`)
                .classList.remove("hidden");
        });
    });
}

class DeferredMedia extends HTMLElement {
    constructor() {
        super();
        if (this.classList.contains("autoplay-status-false")) {
            const loadBtn = this.closest(".shopify-section").querySelector(".video-play-btn");
            loadBtn.addEventListener("click", this.loadContent.bind(this));
        } else {
            this.addObserver();
        }
        const img = this.querySelector('video img'); // Select the image inside deferred-media
        if (img) {
            img.alt = "Video preview image"; // Set alt text dynamically
        }
        if (this.hasAttribute("data-id") && this.getAttribute("data-id") === "media-grid-autodisable") {
            const video = this.querySelector('video');
            const playButton = this.querySelector('.video-play-btn');
            this.addEventListener('click', function (event) {
                event.stopPropagation();   
                if (video.readyState >= 3) {            
                    video.muted = false; // Unmute the video
                    video.play();
                    if (playButton) {
                      playButton.style.display = 'none'; // Hide button
                    }
                } else {
                  console.log('Video is not ready yet');
                }
              });
        }

    }

    addObserver() {
        if ("IntersectionObserver" in window === false) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        this.loadContent();
                        observer.unobserve(this);
                    }
                });
            }, { rootMargin: "0px 0px 1000px 0px" }
        );
        observer.observe(this);
    }

    loadContent() {
        if (!this.querySelector("template")) return false;
        if (this.parentElement.classList.contains("yv-parallax")) {
            this.style.position = "absolute";
            this.parentElement.style.position = "fixed";
        }
        if (this.parentElement.classList.contains("yv-feature-videobox")) {
            this.parentElement.style.position = "absolute";
        }
        const template = this.querySelector("template");
        if (template) {
            const content = template.content.cloneNode(true);
            this.appendChild(content);
        }
        if (this.dataset.type == "youtube") {
            initYouTubeIframe(this.closest(".shopify-section"));
        }
        if (
            this.querySelector("video") &&
            this.querySelector("video").hasAttribute("autoplay")
        ) {
            this.querySelector("video").play();
        }
        const slider_selector = this.closest(".shopify-section");
        if (slider_selector != null) {
            Array.from(
                this.closest(".shopify-section").querySelectorAll(
                    "[data-flickity-slider]"
                )
            ).forEach(function (sliderSelector) {
                let slider = Flickity.data(sliderSelector);
                if (slider) slider.resize();
            });
        }
    }
}

customElements.define("deferred-media", DeferredMedia);
class QuickAddClose extends HTMLElement {
    constructor() {
        super();
        this.parent = this.closest(".quick-add-popup");
        this.body = this.parent.querySelector("[quick-add-body]");
        this.addEventListener("click", this.hideContent.bind(this));
    }
    hideContent() {
        if (this.body) {
            document.body.classList.remove("quick-add-popup-open");
            this.parent.classList.remove("show");
            this.body.innerHTML = "";
        }
    }
}
customElements.define("quick-add-close", QuickAddClose);

class QuickAddToggle extends HTMLElement {
    constructor() {
        super();
        this.popup = document.querySelector(".quick-add-popup");
        this.popBody = document.querySelector("[quick-add-body]");
        this.addEventListener("click", this.showContent.bind(this));
    }

    showContent() {
        if (this.popup && this.popBody) {
            const content = this.querySelector("template").content.cloneNode(true);
            this.popBody.appendChild(content);
            document.body.classList.add("quick-add-popup-open");
            this.popup.classList.add("show");
            if (Shopify.PaymentButton) {
                Shopify.PaymentButton.init();
            }
            productVariants(this.popup);
            quantityChange();
        }
    }
}
customElements.define("quick-add-toggle", QuickAddToggle);

class TestimonialVideoTrigger extends HTMLElement {
    constructor() {
        super();
        this.parent = this.closest("[data-testimonial-wrapper]");
        this.popVideoWrapper;
        this.video;
        this.addEventListener("click", this.showContent.bind(this));
    }

    showContent() {
        this.url = this.dataset.url;
        new Fancybox(
            // Array containing gallery items
            [
                // Gallery item
                {
                    src: this.url,
                },
            ],
            // Gallery options
            {
                hideScrollbar: true,
                mainClass: "testimonial-video-popup-box",
                closebutton: false,
                Toolbar: {
                    display: {
                        right: ["close"],
                    },
                },
            }
        );
    }
}

customElements.define("testimonial-video-trigger", TestimonialVideoTrigger);

class CounterText extends HTMLElement {
    constructor() {
        super();
        this.addObserver();
    }

    addObserver() {
        if ("IntersectionObserver" in window === false) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        this.loadContent();
                        observer.unobserve(this);
                    }
                });
            }, { rootMargin: "0px 0px -300px 0px" }
        );
        observer.observe(this);
    }

    loadContent() {
        let $el = $(this);
        $({ Counter: 0 }).animate({ Counter: $el.data("counter") }, {
            duration: 2000,
            easing: "swing",
            step: function () {
                $el.text(Math.ceil(this.Counter));
            },
            complete: function () {
                $el.text($el.data("counter"));
            },
        });
    }
}
customElements.define("counter-text", CounterText);

class ScrollObserver {
    constructor() {
        this.handleScroll = this.handleScroll.bind(this);
        window.addEventListener("scroll", this.handleScroll);
    }

    handleScroll() {
        document.querySelectorAll("section").forEach((section) => {
            if (isOnScreen(section)) {
                if (section.classList.contains("section-in-view")) return false;
                section.classList.add("section-in-view");
                if (section.querySelector("[data-icon]")) {
                    _iconsAnimations(section);
                }
            } else {
                section.classList.remove("section-in-view");
            }
        });
    }
}
new ScrollObserver();

function _iconsAnimations(section) {
    let iconName = section.querySelector("[data-icon]").getAttribute("data-icon");
    if (iconName == "arrow") {
        section.querySelectorAll(".arrow-path")[0].classList.add("animated-path", "delay-2");
        setTimeout(() => {
            section.querySelectorAll(".arrow-path")[1].classList.add("animated-path", "delay-12");
        }, 1500);
    }
    if (iconName == "line-arrow") {
        section.querySelectorAll(".line-arrow-path")[0].classList.add("animated-path", "delay-2");
        setTimeout(() => {
            section.querySelectorAll(".line-arrow-path")[1].classList.add("animated-path", "delay-6");
        }, 1000);
    }
    if (iconName == "heart") {
        section.querySelectorAll(".heart-path")[0].classList.add("animated-path", "delay-2");
        setTimeout(() => {
            section.querySelectorAll(".heart-path")[1].classList.add("animated-path", "delay-6");
            section.querySelectorAll(".heart-path")[2].classList.add("animated-path", "delay-6");
        }, 1500);
    }
    if (iconName == "star") {
        section.querySelectorAll(".star-path")[0].classList.add("animated-path", "delay-2");
    }
    if (iconName == "snail") {
        section.querySelectorAll(".snail-path")[0].classList.add("animated-path", "delay-2");
        setTimeout(() => {
            section.querySelectorAll(".snail-path")[1].classList.add("animated-path", "delay-2");
        }, 1400);
    }
    if (iconName == "sparkle") {
        section.querySelectorAll(".sparkle-path")[0].classList.add("animated-path", "delay-2");
        setTimeout(() => {
            section.querySelectorAll(".sparkle-path").forEach((sparkleitem, index) => {
                if (index != 0) {
                    sparkleitem.classList.add("animated-path", "delay-6");
                }
            });
        }, 1100);
    }
}

class showMoreContent extends HTMLElement {
    constructor() {
        super();
        if (this.previousElementSibling && this.previousElementSibling.classList.contains('yv-collection-description')) {
            if (this.previousElementSibling.scrollHeight > this.previousElementSibling.clientHeight) {
                this.classList.remove('hidden');
                this.addEventListener("click", this.toggleContent.bind(this));
            } else {
                this.previousElementSibling.classList.remove('short-description')
            }
        }
    }
    toggleContent() {
        if (this.classList.contains('more')) {
            this.classList.remove('more');
            this.textContent = showLessText;
            this.previousElementSibling.style.height = this.previousElementSibling.scrollHeight + "px";
            this.previousElementSibling.style.setProperty('--before-background', 'none')
        } else {
            this.classList.add('more');
            this.textContent = showMoreText;
            this.previousElementSibling.style.removeProperty('height');
            this.previousElementSibling.style.removeProperty('--before-background');
        }
    }
}
customElements.define("show-content", showMoreContent);

class SpotButton extends HTMLElement {
    constructor() {
        super();
        this.section = this.closest('.shopify-section');
        this.blockId = this.dataset.blockId;
        this.addEventListener("click", this.showContent.bind(this));
    }

    showContent() {
        if (this.classList.contains('active')) return;
        if (this.section.querySelector('spot-button.active')) {
            this.section.querySelector('spot-button.active').classList.remove('active');
        }
        if (this.section.querySelector('.yv-spotlight-item-video-item.active')) {
            this.section.querySelector('.yv-spotlight-item-video-item.active').classList.add('hidden');
            this.section.querySelector('.yv-spotlight-item-video-item.active').classList.remove('active');
        }
        if (this.section.querySelector('.yv-spotlight-item-hotspot-content.active')) {
            this.section.querySelector('.yv-spotlight-item-hotspot-content.active').classList.add('hidden');
            this.section.querySelector('.yv-spotlight-item-hotspot-content.active').classList.remove('active');
        }
        if (this.section.querySelector(`#video-${this.blockId}`)) {
            this.section.querySelector(`#video-${this.blockId}`).classList.remove(`hidden`);
            this.section.querySelector(`#video-${this.blockId}`).classList.add(`active`);
        }
        if (this.section.querySelector(`#content-${this.blockId}`)) {
            this.section.querySelector(`#content-${this.blockId}`).classList.remove(`hidden`);
            this.section.querySelector(`#content-${this.blockId}`).classList.add(`active`);
        }
    }
}
customElements.define("spot-button", SpotButton);

