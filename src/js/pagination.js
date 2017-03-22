/**
 * Created by hy on 2016/11/18.
 */
;+function (factory) {
    if (typeof define === "function" && define.amd) {
        // AMD模式
        define(["jquery"], factory);
    } else {
        // 全局模式
        factory(jQuery);
    }
}(function ($) {
    'use strict';
    if (typeof $ === 'undefined') {
        throw new Error('This JavaScript requires jQuery');
    }

    function pagination(dom, options) {
        this.element = $(dom);
        this.pageNow = 1;//当前页
        this.settings = $.extend({
            pages: 100,//一共多少页
            groups: 5,//一次显示几页
            skin: '#009688',
            jump: false,
            first: '首页',
            last: '末页',
            firstAndLast: true,
            prev: '上一页',
            next: '下一页',
            switchPage: $.noop
        }, options);
        this.init();
    }

    pagination.prototype = {
        constructor: pagination,
        init: function () {
            var setting = this.settings;
            if (setting.groups > setting.pages) {
                throw new Error('分页数大于总页数不合法');
            }
            this.element.addClass('h-pagination-pages').on('selectstart', function () {
                return false;
            });
            this.render();
        },
        render: function () {
            var self = this, setting = self.settings;
            self.element.html('');
            self.prev = $('<a/>').html(setting.prev).addClass('h-pagination-pages-prev').appendTo(self.element);
            self.pagesBox = $('<span/>').addClass('h-pagination-pages-box').appendTo(self.element);
            self.next = $('<a/>').html(setting.next).addClass('h-pagination-pages-next').appendTo(self.element);
            self.prev.on('click', function (event) {
                event = event || window.event;
                event.preventDefault();
                self.prevOrNext(this, -1);
            });
            self.next.on('click', function (event) {
                event = event || window.event;
                event.preventDefault();
                self.prevOrNext(this, 1);
            });
            if (setting.pages <= setting.groups) {
                self.prev.addClass('h-pagination-hidden');
                self.next.addClass('h-pagination-hidden');
                for (var i = 0; i < setting.groups; i++) {
                    var eachPage = $('<a/>').html(i + 1).appendTo(self.pagesBox);
                    eachPage.on('click', function (event) {
                        event = event || window.event;
                        event.preventDefault();
                        self.pageNow = $(this).html();
                        //切换页面后自定义事件
                        $.isFunction(setting.switchPage) && setting.switchPage(self);
                        self.nowPage(this, 'h-pagination-now-pages');
                    });
                    if (i + 1 == self.pageNow) {
                        eachPage.addClass('h-pagination-now-pages').css('background', setting.skin);
                    }
                }
            } else {
                if (setting.firstAndLast) {
                    self.end = $('<a/>').html(setting.last).addClass('h-pagination-pages-end').insertBefore(self.next);
                    var ellipsis = $('<a/>').addClass('h-pagination-ellipsis').html('...');
                    self.end.on('click', function (event) {
                        event = event || window.event;
                        event.preventDefault();
                        self.jump(setting.pages);
                        //切换页面后自定义事件
                        $.isFunction(setting.switchPage) && setting.switchPage(self);
                        self.check();
                    });
                }
                if (self.pageNow <= setting.groups - 1) {
                    for (var j = 0; j < setting.groups; j++) {
                        var page = $('<a/>').html(j + 1);
                        page.on('click', function (event) {
                            event = event || window.event;
                            event.preventDefault();
                            self.pageNow = $(this).html();
                            //切换页面后自定义事件
                            $.isFunction(setting.switchPage) && setting.switchPage(self);
                            self.nowPage(this, 'h-pagination-now-pages');
                            self.check();
                            if (self.pageNow >= setting.groups - 1) {
                                self.reset();
                            }
                        });
                        self.pagesBox.append(page);
                        if (j + 1 == self.pageNow) {
                            page.addClass('h-pagination-now-pages').css('background', setting.skin);
                        }
                    }
                    self.check();
                    if (setting.firstAndLast) {
                        self.pagesBox.append(ellipsis);
                    }
                } else {
                    self.reset();
                }
            }
            if (setting.jump) {
                var jumpContainer = $('<span/>').addClass('h-pagination-jump-box').appendTo(self.element);
                var spanTo = $('<span/>').html('到第').addClass('h-pagination-jump-container').appendTo(jumpContainer);
                self.inputBox = $('<input/>').val(self.pageNow).addClass('h-pagination-skip').appendTo(spanTo);
                $('<span/>').html('页').appendTo(spanTo);
                var confirm = $('<button/>').html('确定').appendTo(spanTo);
                confirm.on('click', function () {
                    var page = self.inputBox.val().trim();
                    self.jump(page);
                    self.inputBox.val(page);
                });
            }
        },
        //点击上一页或下一页
        prevOrNext: function (elem, n) {
            var self = this, setting = self.settings;
            if (elem.className.indexOf('h-pagination-hidden') != -1) {
                return;
            }
            if (n == -1) {
                //上一页
                self.pageNow--;
                //切换页面后自定义事件
                $.isFunction(setting.switchPage) && setting.switchPage(self);
            } else {
                self.pageNow++;
                //切换页面后自定义事件
                $.isFunction(setting.switchPage) && setting.switchPage(self);
            }
            if (setting.jump) {
                self.inputBox.val(self.pageNow);
            }
            self.judge();
        },
        //设置当前页
        nowPage: function (elem, className) {
            var self = this, setting = self.settings;
            var pagesList = self.pagesBox.children('a');
            $.each(pagesList, function (_, page) {
                $(page).removeClass(className).css('background', '');
            });
            $(elem).addClass(className).css('background', setting.skin);
            if (setting.jump) {
                self.inputBox.val(self.pageNow);
            }
        },
        //检测是否隐藏上一页按钮
        check: function () {
            if (this.pageNow <= 1) {
                this.prev.addClass('h-pagination-hidden');
            } else {
                this.prev.removeClass('h-pagination-hidden');
            }
        },
        //判断是否加两个...
        judge: function () {
            if (this.pageNow - this.start > 2) {
                this.reset();
            } else {
                this.render();
            }
        },
        //跳到第几页
        jump: function (page) {
            if (page > this.settings.pages || page <= 0) {
                return;
            }
            this.pageNow = page;
            if (this.settings.jump) {
                this.inputBox.val(this.pageNow);
            }
            //切换页面后自定义事件
            $.isFunction(this.settings.switchPage) && this.settings.switchPage(this);
            this.judge();
        },
        //重构page样式
        reset: function () {
            var self = this, setting = self.settings;
            self.pagesBox.html('');
            if (setting.firstAndLast) {
                var first = $('<a/>').html(setting.first).appendTo(self.pagesBox);
                $('<a/>').html('...').addClass('h-pagination-ellipsis').appendTo(self.pagesBox);
                first.on('click', function (event) {
                    event = event || window.event;
                    event.preventDefault();
                    self.pageNow = 1;
                    //切换页面后自定义事件
                    $.isFunction(setting.switchPage) && setting.switchPage(self);
                    self.nowPage(this, 'h-pagination-now-pages');
                    self.render();
                });
            }
            var ellipsis2 = $('<a/>').html('...').addClass('h-pagination-ellipsis');
            /*调整*/
            self.start = self.pageNow - Math.ceil(setting.groups / 2 - 1);
            if (self.start >= setting.pages - setting.groups + 1) {
                self.start = setting.pages - setting.groups + 1;
                self.isEnd = true;
            } else {
                self.isEnd = false;
            }
            for (var i = 0; i < setting.groups; i++) {
                var page = $('<a/>').html(self.start + i);
                page.on('click', function (event) {
                    event = event || window.event;
                    event.preventDefault();
                    self.pageNow = $(this).html();
                    //切换页面后自定义事件
                    $.isFunction(setting.switchPage) && setting.switchPage(self);
                    self.nowPage(this, 'h-pagination-now-pages');
                    self.judge();
                });
                self.pagesBox.append(page);//页码放在pagesBox中
                if ((self.start + i) == this.pageNow) {
                    page.addClass('h-pagination-now-pages').css('background', setting.skin);
                }
            }
            if (!self.isEnd && setting.firstAndLast) {
                self.pagesBox.append(ellipsis2);
            } else {
                if (setting.firstAndLast) {
                    self.end.addClass('h-pagination-hidden');
                }
            }
            if (self.pageNow == setting.pages) {
                self.next.addClass('h-pagination-hidden');
            }
            if (self.pageNow != setting.pages) {
                self.next.removeClass('h-pagination-hidden');
            }
        }
    };

    $.fn.pagination = function (options) {
        var dom = $(this);
        return new pagination(dom, options);
    };

});