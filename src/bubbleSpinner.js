/*
 * bubbleSpinner.js
 * @version 1.0.0
 * @author Ghiya Mikadze <g.mikadze@lakka.io>
 * @license Licensed under the MIT license
 */
+(function ($) {
    'use strict';


    // CLASS DEFINITION
    // ================

    var bubbleSpinner = function (wrapper, options) {
        this.isAnimating = false;
        this.$wrapper = $(wrapper);
        this.applyOptions(options);
        this.bindEvents();
    };

    bubbleSpinner.prototype.applyOptions = function (options) {
        this.options = $.extend(
            {},
            bubbleSpinner.DEFAULTS,
            typeof options === "object" && options,
            {
                defaultStyle: 'scaleAndAlpha',
                backdrop: options.backdrop === false ?
                    false :
                    $.extend(
                        {},
                        bubbleSpinner.DEFAULTS.backdrop,
                        typeof options.backdrop === "object" && options.backdrop
                    ),
                bubbles: $.extend(
                    {},
                    bubbleSpinner.DEFAULTS.bubbles,
                    {
                        grid: [
                            {
                                left: 0,
                                top: 0
                            },
                            {
                                right: 0,
                                top: 0
                            },
                            {
                                right: 0,
                                bottom: 0
                            },
                            {
                                left: 0,
                                bottom: 0
                            }
                        ]
                    },
                    typeof options.bubbles === "object" && options.bubbles
                )
            }
        );
    };

    bubbleSpinner.ANIMATION_TYPE_RANDOM = 'random';

    bubbleSpinner.ANIMATION_TYPE_STEPPER = 'stepper';

    bubbleSpinner.ANIMATION_STYLE_ALPHA = 'alpha';

    bubbleSpinner.ANIMATION_STYLE_SCALE_AND_ALPHA = 'scaleAndAlpha';

    bubbleSpinner.DEFAULTS = {
        type: 'random',
        style: 'scaleAndAlpha',
        userResponsive: false,
        syncDurations: false,
        duration: 200,
        loop: true,
        zIndex: 999,
        backdrop: {
            background: 'rgba(31,31,31,.85)'
        },
        grid: {
            width: 90,
            height: 90
        },
        bubbles: {
            colors: ['rgb(229, 56, 56)', 'rgb(242, 242, 242)', 'rgb(229, 56, 56)', 'rgb(242, 242, 242)'],
            size: 36
        }
    };

    bubbleSpinner.VERSION = '1.0.0';

    bubbleSpinner.BUBBLE = {
        options: {},
        index: 0,
        getInstance: function () {
            var FontAwesomeClass = this.options.fa;
            var instance = $('<div></div>')
                .css(
                    $.extend(
                        {
                            display: this.options.grid ? 'block' : 'inline-block',
                            'margin': this.options.grid ? 0 : '0 7px',
                            opacity: 0,
                            position: 'absolute'
                        },
                        FontAwesomeClass ?
                            {
                                'font-size': this.options.size,
                                color: this.options.colors[this.index]
                            } :
                            {
                                width: this.options.size,
                                height: this.options.size,
                                'border-radius': '50%',
                                background: this.options.colors[this.index]
                            },
                        this.options.grid ?
                            this.options.grid[this.index] :
                            {
                                position: 'relative',
                                top: 0
                            }
                    )
                )
                .attr('data-bubble', this.index);
            return FontAwesomeClass ?
                instance
                    .append($('<i></i>')
                        .attr(
                            'class',
                            typeof FontAwesomeClass === "object" ? FontAwesomeClass[this.index] : FontAwesomeClass
                        )
                    ) :
                instance;
        },
        create: function () {
            return this.getInstance();
        }
    };

    bubbleSpinner.prototype.bindEvents = function () {
        $(this).on(
            "bbls.show",
            function (event) {
                event.currentTarget.showSpinner()
            }
        );
        $(this).on(
            "bbls.hide",
            function (event) {
                event.currentTarget.hideSpinner()
            }
        );
        $(this).on(
            "bbls.destroy",
            function (event) {
                event.currentTarget.destroyAll()
            }
        );
        $(this).on(
            "bbls.update",
            function (event) {
                event.currentTarget.updateAll();
            }
        );
        $(window).on(
            "resize",
            $.proxy(
                function () {
                    this.updateAll();
                },
                this
            )
        );
    };

    bubbleSpinner.prototype.render = function () {
        var backDropOptions = typeof this.options.backdrop === "object" && this.options.backdrop;
        var backDrop = $('<div></div>')
            .css(
                $.extend(
                    {
                        position: 'fixed',
                        display: 'block'
                    },
                    backDropOptions,
                    {
                        opacity: 0,
                        'z-index': this.options.zIndex
                    },
                    this.backDropDynamicOptions()
                )
            )
            .attr('data-bubble', 'backdrop');
        var gridWrapper = $('<div></div>')
            .css(
                $.extend(
                    {
                        position: 'absolute',
                        display: 'block',
                        width: 0,
                        height: 0
                    },
                    this.options.grid,
                    this.gridWrapperDynamicOptions(),
                    {
                        opacity: 0,
                        background: 'transparent'
                    }
                )
            )
            .attr('data-bubble', 'grid');
        // add backdrop if defined
        this.$wrapper
            .prepend(
                backDropOptions ?
                    backDrop
                        .append(
                            gridWrapper
                        ) :
                    gridWrapper
            );
        // add user responsive
        if (this.options.userResponsive) {
            var $instance = this.getBackDrop() ? this.getBackDrop() : this.getGridWrapper();
            $instance.on(
                "click",
                $.proxy(
                    function () {
                        this.hideSpinner()
                    },
                    this
                )
            )
        }
        // render bubbles
        this.renderBubbles(this.options.bubbles);
    };

    bubbleSpinner.prototype.backDropDynamicOptions = function () {
        return {
            width: this.$wrapper.outerWidth(),
            height: this.$wrapper.outerHeight()
        }
    };

    bubbleSpinner.prototype.gridWrapperDynamicOptions = function () {
        var top = this.options.grid.top !== 'undefined' ? this.options.grid.top : this.$wrapper.outerHeight() / 2;
        return {
            left: this.$wrapper.outerWidth() / 2 - this.options.grid.width / 2,
            top: top - this.options.grid.height / 2
        }
    };

    bubbleSpinner.prototype.getBackDrop = function () {
        return this.$wrapper.find('[data-bubble=backdrop]');
    };

    bubbleSpinner.prototype.getGridWrapper = function () {
        return this.$wrapper.find('[data-bubble=grid]');
    };

    bubbleSpinner.prototype.renderBubbles = function (options) {
        this.getGridWrapper().html("");
        for (var index = 0; index < 4; index++) {
            this.getGridWrapper()
                .append(
                    $.extend(
                        {},
                        bubbleSpinner.BUBBLE,
                        {
                            context: this,
                            index: index,
                            options: options
                        }
                    )
                        .create()
                );
        }
    };

    bubbleSpinner.prototype.commitAnimation = function ($bubble, index, durations) {
        var context = this;
        var style = typeof context.options.style === "object" ?
            context.options.style.length > index ?
                context.options.style[index] :
                context.options.defaultStyle :
            context.options.style;
        if (!this.isAnimating) {
            return;
        }
        $.extend(
            {},
            $bubble,
            {
                flow: function () {
                    if (!context.isAnimating) {
                        return;
                    }
                    this
                        .css(
                            $.extend(
                                style === bubbleSpinner.ANIMATION_STYLE_SCALE_AND_ALPHA ?
                                    {
                                        transform: 'scale(0, 0)',
                                        '-webkit-transform': 'scale(0, 0)'
                                    }
                                    :
                                    {},
                                {
                                    opacity: 0
                                }
                            )
                        );
                    $(this)
                        .animate(
                            {
                                opacity: 1
                            },
                            {
                                step: function (now) {
                                    if (style === bubbleSpinner.ANIMATION_STYLE_SCALE_AND_ALPHA) {
                                        $(this)
                                            .css('transform', 'scale(' + now + ', ' + now + ')');
                                        $(this)
                                            .css('-webkit-transform', 'scale(' + now + ', ' + now + ')');
                                    }
                                },
                                duration: durations[0],
                                easing: "swing",
                                done: this.pop()
                            }
                        )
                },
                pop: function () {
                    //console.log('pop bubble');
                    if (!context.isAnimating) {
                        return;
                    }
                    $(this)
                        .animate(
                            {
                                opacity: 0
                            },
                            {
                                duration: durations[1],
                                easing: "swing",
                                step: function (now) {
                                    if (style === bubbleSpinner.ANIMATION_STYLE_SCALE_AND_ALPHA && context.options.loop) {
                                        $(this)
                                            .css('transform', 'scale(' + now + ', ' + now + ')');
                                        $(this)
                                            .css('-webkit-transform', 'scale(' + now + ', ' + now + ')');
                                    }
                                },
                                done: function () {
                                    context.commitAnimation(
                                        $(this),
                                        index,
                                        context.animationDurations()
                                    );
                                }
                            }
                        )
                }
            }
        )
            .flow()
    };

    bubbleSpinner.prototype.animationDurations = function () {
        var randomDuration = Math.round(Math.random() * (600 - 200) + 200);
        return [
            randomDuration,
            this.options.syncDurations ?
                randomDuration : Math.round(Math.random() * (600 - 200) + 200)
        ];
    };

    bubbleSpinner.prototype.showSpinner = function () {
        var context = this;
        context.render();
        context.isAnimating = true;
        var $bubbles = context
            .getGridWrapper()
            .find('[data-bubble]');
        if ($bubbles && $bubbles.length) {

            $bubbles
                .each(
                    function (index) {
                        context.commitAnimation(
                            $(this),
                            index,
                            context.animationDurations()
                        );
                    }
                );

            context
                .getBackDrop()
                .css('display', 'block');
            context
                .getBackDrop()
                .animate(
                    {
                        opacity: 1
                    },
                    {
                        duration: context.options.duration,
                        easing: "swing",
                        start: function () {
                            context
                                .getGridWrapper()
                                .css(
                                    {
                                        display: 'block',
                                        opacity: 0,
                                        transform: 'scale(1, 1)',
                                        '-webkit-transform': 'scale(1, 1)'
                                    }
                                );
                            context
                                .getGridWrapper()
                                .animate(
                                    {
                                        opacity: 1
                                    },
                                    {
                                        duration: context.options.duration,
                                        easing: "swing"
                                    }
                                )
                        }
                    }
                );
        }
    };

    bubbleSpinner.prototype.hideSpinner = function () {
        var context = this;
        context.isAnimating = false;
        context.getBackDrop()
            .animate(
                {
                    opacity: 0
                },
                {
                    duration: context.options.duration,
                    easing: "swing",
                    start: function () {
                        context
                            .getGridWrapper()
                            .animate(
                                {
                                    opacity: 0,
                                    transform: 'scale(1, 1)',
                                    '-webkit-transform': 'scale(1, 1)'
                                },
                                {
                                    step: function (now) {
                                        $(this)
                                            .css('transform', 'scale(' + now + ', ' + now + ')');
                                        $(this)
                                            .css('-webkit-transform', 'scale(' + now + ', ' + now + ')');
                                    },
                                    duration: context.options.duration,
                                    easing: "swing",
                                    done: function () {
                                        $(this).remove();
                                    }
                                }
                            )
                    },
                    done: function () {
                        $(this).remove();
                    }
                }
            )
    };

    bubbleSpinner.prototype.destroyAll = function () {
        var $instance = this.getBackDrop() ? this.getBackDrop() : this.getGridWrapper();
        $instance.remove();
    };

    bubbleSpinner.prototype.updateAll = function () {
        if (this.getBackDrop()) {
            this.getBackDrop()
                .css(
                    this.backDropDynamicOptions()
                );
        }
        this.getGridWrapper()
            .css(
                this.gridWrapperDynamicOptions()
            )
    };

    bubbleSpinner.prototype.toggle = function (action) {
        $(this).trigger(
            $.Event('bbls.' + action)
        );
    };


    // PLUGIN
    // ======

    function Plugin(option) {
        var $this = $(this);
        var plugin = $this.data('wb.bubbleSpinner');
        var options = typeof option === "object" && option;

        if (!plugin) {
            $this.data('wb.bubbleSpinner', (plugin = new bubbleSpinner(this, options)))
        }
        if (option && /show|hide|update|destroy/.test(option)) {
            plugin.toggle(option);
        } else {
            plugin.applyOptions(options);
        }
    }

    $.fn.bubbleSpinner = Plugin;
    $.fn.bubbleSpinner.Constructor = bubbleSpinner;

})(jQuery);