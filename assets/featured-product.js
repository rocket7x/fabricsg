window.addEventListener('resize', function(event) {
    findVisibleItems();
    initProductSlider();
    initProductThumbSlider();
});

function initProductSlider(section = document) {
    let sliders = section.querySelectorAll('[data-flickity-featured-product-slider]');    
    sliders.forEach(sliderMain => {
        if (sliderMain) {
            let optionContainer = sliderMain.getAttribute('data-flickity-featured-product-slider');
            if (optionContainer) {
                var options = JSON.parse(optionContainer);
                if (sliderMain.hasAttribute("data-mobile-only")) {
                    if ($(window).width() < 768) {
                        if (!sliderMain.classList.contains('flickity-enabled')) {
                            let productSlider = new Flickity(sliderMain, options);
                            setTimeout(function() {
                                productSlider.resize();
                            }, 300);
                        }
                    } else {
                        if (sliderMain.classList.contains('flickity-enabled')) {
                            productSlider.destroy();
                        }
                    }
                } else if (sliderMain.hasAttribute("data-desktop-only")) {
                    if ($(window).width() >= 768) {
                        if (!sliderMain.classList.contains('flickity-enabled')) {
                            let productSlider = new Flickity(sliderMain, options);
                            setTimeout(function() {
                                productSlider.resize();
                            }, 300);
                        }
                    } else {
                        if (sliderMain.classList.contains('flickity-enabled')) {
                        }
                    }
                } else {
                    if (!sliderMain.classList.contains('flickity-enabled')) {
                        let productSlider = new Flickity(sliderMain, options);
                        setTimeout(function() {
                            productSlider.resize();
                        }, 300);
                    }
                }                
                // Attach the 'change' event listener for pausing videos
                if (productSlider) {
                    productSlider.on('change', function(index) {
                        let sliderMain = productSlider.$element[0];
                        sliderMain.querySelectorAll('.yv-youtube-video').forEach((video) => {
                            video.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                        });
                        sliderMain.querySelectorAll('.yv-vimeo-video').forEach((video) => {
                            video.contentWindow.postMessage('{"method":"pause"}', '*');
                        });
                        sliderMain.querySelectorAll('video').forEach((video) => video.pause());
                    });
                }
            }
        }
    });
}

function initProductThumbSlider(section = document) {
    let thumbSliders = section.querySelectorAll('[data-flickity-featured-product-thumb-slider]');    
    thumbSliders.forEach(sliderMain => {
        if (sliderMain) {
            let optionContainer = sliderMain.getAttribute('data-flickity-featured-product-thumb-slider');
            if (optionContainer) {
                var section = sliderMain.closest('section');
                if(section.querySelector('.yv-feature-product-image'))
                {
                    var getHeight = section.querySelector('[data-flickity-featured-product-slider]');
                    var getthumb = section.querySelector('[data-flickity-featured-product-thumb-slider]');
                    var getText = section.querySelector('.featured-product-img-text');
                    const element = getHeight.querySelector('.flickity-viewport');                    
                    const height = element.style.height || window.getComputedStyle(element).height;
                    const numericHeight = parseInt(height);
                    const newHeight = numericHeight + 20 + 'px';                    
                    getHeight.style.setProperty('--slide-height', newHeight);                    
                    if(getthumb){
                        getthumb.style.width = newHeight;
                    }
                }                      
                var options = JSON.parse(optionContainer);
                if (sliderMain.hasAttribute("data-mobile-only")) {
                    if ($(window).width() < 768) {
                        if (!sliderMain.classList.contains('flickity-enabled')) {
                            let productThumbSlider = new Flickity(sliderMain, options);
                            productThumbSlider.resize();
                        }
                    } else {
                        if (sliderMain.classList.contains('flickity-enabled')) {
                            productThumbSlider.destroy();
                        }
                    }
                } else if (sliderMain.hasAttribute("data-desktop-only")) {
                    if ($(window).width() >= 768) {
                        if (!sliderMain.classList.contains('flickity-enabled')) {
                            let productThumbSlider = new Flickity(sliderMain, options);
                            productThumbSlider.resize();
                        }
                    } else {
                        if (sliderMain.classList.contains('flickity-enabled')) {
                            productThumbSlider.destroy();
                        }
                    }
                } else {
                    if (!sliderMain.classList.contains('flickity-enabled')) {
                        let productThumbSlider = new Flickity(sliderMain, options);
                        productThumbSlider.resize();
                    }
                }
                // Attach the 'change' event listener for pausing videos
                if (productThumbSlider) {
                    productThumbSlider.on('change', function(index) {
                        let sliderMain = productThumbSlider.$element[0];
                        sliderMain.querySelectorAll('.yv-youtube-video').forEach((video) => {
                            video.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                        });
                        sliderMain.querySelectorAll('.yv-vimeo-video').forEach((video) => {
                            video.contentWindow.postMessage('{"method":"pause"}', '*');
                        });
                        sliderMain.querySelectorAll('video').forEach((video) => video.pause());
                    });
                }
            }
        }
    });
}

var productMediaModel = {
    loadShopifyXR() {
        Shopify.loadFeatures([{
                name: 'shopify-xr',
                version: '1.0',
                onLoad: this.setupShopifyXR.bind(this),
            },
            {
                name: 'model-viewer-ui',
                version: '1.0',
                onLoad: (function() {
                    document.querySelectorAll('.yv-product-model-item').forEach((model) => {
                        let model3D = model.querySelector('model-viewer')
                        model.modelViewerUI = new Shopify.ModelViewerUI(model3D);
                        model3D.addEventListener('shopify_model_viewer_ui_toggle_play', function(evt) {
                            model.querySelectorAll('.close-product-model').forEach(el => {
                                el.classList.remove('hidden');
                            });
                            if (productSlider) {
                                productSlider.options.draggable = false;
                                productSlider.updateDraggable();
                            }
                        }.bind(this));
                        model3D.addEventListener('shopify_model_viewer_ui_toggle_pause', function(evt) {
                            model.querySelectorAll('.close-product-model').forEach(el => {
                                el.classList.add('hidden');
                            });
                            if (productSlider) {
                                productSlider.options.draggable = true;
                                productSlider.updateDraggable();
                            }
                        }.bind(this));
                        model.querySelectorAll('.close-product-model').forEach(el => {
                            el.addEventListener('click', function() {
                                if (model3D) {
                                    model.modelViewerUI.pause();
                                }
                            }.bind(this))
                        });
                    });
                })
            }
        ]);
    },

    setupShopifyXR(errors) {
        if (!errors) {
            if (!window.ShopifyXR) {
                document.addEventListener('shopify_xr_initialized', () =>
                    this.setupShopifyXR()
                );
                return;
            }
            document.querySelectorAll('[id^="product3DModel-"]').forEach((model) => {
                window.ShopifyXR.addModels(JSON.parse(model.textContent));
            });
            window.ShopifyXR.setupXRElements();
        }
    },
};

function findVisibleItems() {
    let mainSliderParent = document.getElementById('yv-product-gallery-slider');
    if (mainSliderParent) {
        var elements = mainSliderParent.getElementsByClassName('gallery-main-item');
        var thumbs = mainSliderParent.getElementsByClassName('gallery-thumbs-item');
        window.addEventListener('scroll', function(event) {
            Array.from(elements).forEach(function(item) {
                if (isOnScreen(item)) {
                    thumbs = mainSliderParent.getElementsByClassName('gallery-thumbs-item');
                    var relatedThumb = mainSliderParent.querySelector('.gallery-thumbs-item[data-image="' + item.id + '"]');
                    if (relatedThumb) {
                        Array.from(thumbs).forEach(function(thumb) {
                            if (thumb != relatedThumb) {
                                thumb.classList.remove('active');
                            }
                        });
                        if (!relatedThumb.classList.contains('active')) {
                            relatedThumb.classList.add('active');
                        }
                    }
                }
            });
        });
    }

    let mainTabsContent = document.getElementById('yvProductFeatureListwrapper');
    if (mainTabsContent) {
        let contentTabs = document.getElementsByClassName('yv-product-feature');
        window.addEventListener('scroll', function(event) {
            Array.from(contentTabs).forEach(function(item) {
                if (isOnScreen(item)) {
                    let headTabs = document.getElementsByClassName('feature-link');
                    Array.from(headTabs).forEach(function(head) {
                        head.parentNode.classList.remove('active');
                    });
                    var relatedHead = document.querySelector('.feature-link[href="#' + item.id + '"]');
                    if (relatedHead) {
                        relatedHead.parentNode.classList.add('active');
                    }
                }
            });
        });
    }
}

function initStickyAddToCart() {
    let mainProductForm = document.querySelector('.main-product-form[action^="' + cartAdd + '"]');
    if (mainProductForm) {
        let stickyBar = document.getElementById('yvProductStickyBar');
        if (stickyBar) {
            window.addEventListener('scroll', function(event) {
                if (isOnScreen(mainProductForm, true) || window.scrollY < mainProductForm.offsetTop) {
                    stickyBar.classList.remove('show');
                } else {
                    stickyBar.classList.add('show');
                }
            });
        }
    }
}

function sizeChart() {
    var sizeChartInit = document.querySelectorAll('.sizeChart-label');
    if (sizeChartInit) {
        var sizeChartModel = document.getElementById('sizeChartModel');
        if (sizeChartModel) {
            var sizeChartClose = sizeChartModel.querySelector('#sizeChartClose');
            sizeChartInit.forEach(function(sizeChart) {
                sizeChart.addEventListener("click", (e) => {
                    e.preventDefault();
                    sizeChartModel.fadeIn(100);
                    document.querySelector('body').classList.add('sizeChartOpen');
                    focusElement = sizeChart;
                    sizeChartClose.focus();
                });
            });
            sizeChartClose.addEventListener("click", () => {
                document.querySelector('body').classList.remove('sizeChartOpen');
                sizeChartModel.fadeOut(100);
                focusElement.focus();
                focusElement = '';
            });
        }
    }
}
if (document.querySelector('[zoom-icon]')) {
    const getMousePos = (e) => {
        var pos = e.currentTarget.getBoundingClientRect();
        return {
            x: e.clientX - pos.left,
            y: e.clientY - pos.top,
        };
    };
    let zoomIcon = document.querySelector('[zoom-icon]').getAttribute('zoom-icon');
    if (zoomIcon) {
        function productZoomInit() {
            $('.yv-product-zoom').mouseenter(function(e) {
                $('.yv-product-zoom').removeClass('show');
                if ($(window).width() > 1021) {
                    $(this).addClass('show');
                }
            })
            $('.yv-product-zoom').mousemove(function(e) {
                if ($(window).width() > 1021) {
                    let t = getMousePos(e);
                    this.querySelector('.gallery-cursor').style.translate = `${t.x}px ${t.y}px`;
                }
            })
            $('.yv-product-zoom').mouseleave(function(e) {
                $('.yv-product-zoom').removeClass('show');
            })
        }
    }
}
document.addEventListener("shopify:section:load", findVisibleItems, false);
document.addEventListener("shopify:section:load", productZoomInit, false);
document.addEventListener("shopify:section:load", function(event) {
    initProductSlider(event.target)
    initProductThumbSlider(event.target);
});
document.addEventListener("shopify:section:load", sizeChart, false);
document.addEventListener("shopify:section:load", initStickyAddToCart, false);
window.addEventListener('DOMContentLoaded', () => {
    productOnLoadEvents();
});
function productOnLoadEvents() {
    let productModel = document.querySelectorAll('[id^="product3DModel-"]');
    if (productMediaModel && productModel.length > 0) {
        productMediaModel.loadShopifyXR();
    }

    findVisibleItems();
    // let zoomIcon = document.querySelector('[zoom-icon]').getAttribute('zoom-icon');
    // if(zoomIcon){
    //     productZoomInit();
    // }
    
    initProductSlider();
    initProductThumbSlider();
    sizeChart();
    initStickyAddToCart();
}

function onReadyEvent() {
   // console.log('sdsds')
    setTimeout(function() {
        var thumbnails = document.querySelector('.yv-product-gallery-thumbs-container');
        var lastKnownY = window.scrollY;
        var currentTop = 0;
        if (thumbnails) {
            var initialTopOffset = parseInt(window.getComputedStyle(thumbnails).top);
            window.addEventListener('scroll', function(event) {
                var bounds = thumbnails.getBoundingClientRect(),
                    maxTop = bounds.top + window.scrollY - thumbnails.offsetTop + initialTopOffset,
                    minTop = thumbnails.clientHeight - window.innerHeight;
                if (window.scrollY < lastKnownY) {
                    currentTop -= window.scrollY - lastKnownY;
                } else {
                    currentTop += lastKnownY - window.scrollY;
                }
                currentTop = Math.min(Math.max(currentTop, -minTop), maxTop, initialTopOffset);
                lastKnownY = window.scrollY;
                thumbnails.style.top = "".concat(currentTop, "px");
            });
        }
    }, 1000)

    jQuery('body').on('click', '.gallery-thumbs-item', function(e) {
        e.preventDefault();
        var destination = jQuery(this).attr('data-image');
        var top = 10;
        top = jQuery('.shopify-section-main-header').height() + 10;
        //  }
        if (jQuery('#' + destination + '.gallery-main-item').length > 0) {
            jQuery('html,body').animate({ scrollTop: (jQuery('#' + destination + '.gallery-main-item').offset().top) - top });
        }
    });

    jQuery('body').on('click', '.pdp-view-close', function(e) {
        e.preventDefault();
        jQuery('#yvProductStickyBar').remove();
    });

    jQuery('body').on('click', '.feature-link', function(e) {
        e.preventDefault();
        let destination = jQuery(this).attr('href');
        let top = 10;
        top = jQuery('.shopify-section-main-header').height() + 90;
        if (jQuery(destination).length > 0) {
            jQuery('html,body').animate({ scrollTop: (jQuery(destination).offset().top) - top });
        }
    });
    jQuery('body').on('change', '.sticky-bar-product-options', function() {
        let _section = jQuery(this).closest('.shopify-section');
        let option = jQuery(this).attr('data-name');
        let value = jQuery(this).val();
        let mainOption = _section.find('.productOption[name="' + option + '"]');
        if (mainOption.is(':radio')) {
            _section.find('.productOption[name="' + option + '"][value="' + CSS.escape(value) + '"]').attr('checked', true).trigger('click');
        } else {
            mainOption.val(value);
            let sectionId = document.querySelector('#' + _section.attr('id'))
            if (sectionId) {
                let optionSelector = document.querySelector('.productOption[name="' + option + '"]');
                if (optionSelector) {
                    optionSelector.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        }
    })
    // if (fancySelector) {
    //     Fancybox.bind(fancySelector, {
    //         touch: false,
    //         thumbs: {
    //             autoStart: true
    //         },
    //         on: {
    //             load: (fancybox, slide) => {
    //                 document.querySelectorAll('.yv-youtube-video').forEach((video) => {
    //                     video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
    //                 });
    //                 document.querySelectorAll('.yv-youtube-video').forEach((video) => {
    //                     video.contentWindow.postMessage('{"method":"pause"}', '*');
    //                 });
    //                 document.querySelectorAll('video').forEach((video) => video.pause());
    //                 var fancyBoxContainer = $('body').find('.fancybox__container');
    //             },
    //             done: (fancybox, slide) => {
    //                 var fancyBoxContainer = $('body').find('.fancybox__container');
    //             }
    //         },
    //         Toolbar: {
    //             display: [
    //                 "close",
    //             ],
    //         }
    //     });
    // }
}
$(document).ready(function() {
    onReadyEvent();
    function playVideo() {
        currentVideo = $('[data-reel-content] video')[0];
        if (currentVideo) {
            currentVideo.load();
            currentVideo.play();
        }
    }

    function pauseVideo() {
        if (currentVideo) {
            currentVideo.pause();
        }
    }
})