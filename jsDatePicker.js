/**
 * @version: 0.1
 * @author: lazy1993
 * @date: 2017-07-18
 * @copyright:  All rights reserved.
 * @website: http://lazy1993.github.io/simpleDatePicker
 */

// 支持IE8+
// 给input元素添加"lazy-datePicker"类名即可实现将普通的input元素转换成带日期选择器的时间输入框
// 在addDatePicker.dates中的第1161~1165行对目标函数的鼠标形状以及字体做了设置，同时在加载时清空了内容
function addDatePicker(event, classname){
    "use strict"
    var classname = classname || "lazy-datePicker",
        gClass, gTag, addHandler, showDataPicker, hideDatePicker,  // 一些辅助函数 
        targetArr,
        config,                 // 一点配置文件
        i;  

    // 通过类名查找DOM对象（单个类名）
    gClass = function gClass(classname, node) {
        var node = node || document,
            results=[],
            i;
        
        if (node.getElementsByClassName) {
            //如果浏览器支持getElementsByClassName方法，则使用浏览器提供的方法
            return node.getElementsByClassName(classname);
        } else {
                reg = new RegExp("\\b"+classname+"\\b"),
                elems = null;
                
            if (!document.getElementsByTagName) return false;
            elems=node.getElementsByTagName("*");
            
            for (i = 0; i < elems.length; i++) {
                if (reg.test(elems[i].className)) {
                    results[results.length] = elems[i];
                }
            }
            return results;
        }
    }

    // 通过id查找元素的简写方法
    gTag = function gTag(tagName, node) {
        var node = node || document;
        return node.getElementsByTagName(tagName);
    }

    // 封装添加事件句柄的函数
    addHandler = function addHandler(element, type, handler) {
        if (element.addEventListener) {
            element.addEventListener(type, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent('on' + type, handler);
        } else {
            element['on' + type] = handler;
        }
    }

    // 目标元素获得焦点的处理程序
    showDataPicker = function showDataPicker(event, targetEle, pickerName) {
        if (!document.getElementById || !document.createElement || !document.createTextNode || !document.createDocumentFragment) return false;
        
        var event = event || window.event,
            bindTag = event.srcElement || event.target, 
            createThePicker, bindDateEvent, initThePicker, locationThePicker, showThePicker, initTheMonths, initTheDays, // 一些辅助函数

        // 创建包含日期选择器主要结构的文档碎片
        createThePicker = function createThePicker() {
            var f = document.createDocumentFragment(),
                body = gTag("body")[0],// 获得body元素
                script = gTag("script",body)[0],
                monthArry = [1,2,3,4,5,6,7,8,9,10,11,12],//方便修改月份显示模式
                weekArry = ["一","二","三","四","五","六","日"],//方便修改星期显示模式
                separator = ":",//设置时分秒的分隔符
                datePicker,time,parentDiv,childDiv,ul,li,span,text,input,str,
                c, // 一个辅助函数
                i;

            // 需要用到大量的创建节点操作，简化一下操作
            c = function(nodeName) {
                return document.createElement(nodeName);
            }

            // 创建datePicker容器
            datePicker = c("div");
            datePicker.setAttribute("id","lazy-date-picker");
            datePicker.className = "lazy-hidden";
            // 将最终得到的时间选择器主结构挂在文档碎片上
            f.appendChild(datePicker);

            // 创建顶部引导三角形
            parentDiv = c("div");
            parentDiv.className = "lazy-marking-triangle";
            datePicker.appendChild(parentDiv);

            // 创建头部年月部分
            parentDiv = c("div");
            parentDiv.className = "lazy-year";
            datePicker.appendChild(parentDiv);
            childDiv = c("div");
            childDiv.className = "lazy-left-triangle";
            parentDiv.appendChild(childDiv);
            childDiv = c("div");
            childDiv.className = "lazy-right-triangle";
            parentDiv.appendChild(childDiv);
            span = c("span");
            span.className = "lazy-date-text";
            parentDiv.appendChild(span);

            // 创建月份模块
            parentDiv = c("div");
            parentDiv.className = "lazy-month lazy-hidden";
            datePicker.appendChild(parentDiv);
            ul = c("ul");
            parentDiv.appendChild(ul);
            // 固定为12个月，直接循环输出
            for (i = 0; i < 12; i += 1) {
                li = c("li");
                ul.appendChild(li);
                span = c("span");
                span.className = "lazy-date-text";
                li.appendChild(span);
                str = monthArry[i] +"月";
                text = document.createTextNode(str);
                span.appendChild(text);
            }

            // 创建每周的星期
            parentDiv = c("div");
            parentDiv.className = "lazy-weekeday";
            datePicker.appendChild(parentDiv);
            ul = c("ul");
            parentDiv.appendChild(ul);
            // 固定一周为7天，直接循环输出，每周周一开始
            for (i = 0; i < 7; i += 1) {
                li = c("li");
                ul.appendChild(li);
                span = c("span");
                span.className = "lazy-date-text";
                li.appendChild(span);
                str = weekArry[i];
                text = document.createTextNode(str);
                span.appendChild(text);
            }

            // 创建每月的天
            parentDiv = c("div");
            parentDiv.className = "lazy-day";
            datePicker.appendChild(parentDiv);
            ul = c("ul");
            parentDiv.appendChild(ul);
            // 固定展示 7*6=42天，具体日期在初始化的时候创建，其他直接循环输出
            for (i = 0; i < 42; i += 1) {
                li = c("li");
                ul.appendChild(li);
                span = c("span");
                span.className = "lazy-date-text";
                li.appendChild(span);
            }

            // 创建时间选择模块
            time = c("div");
            time.className = "lazy-time";
            datePicker.appendChild(time);
            // 小时部分
            parentDiv = c("div");
            parentDiv.className = "lazy-time-hours";
            time.appendChild(parentDiv);
            input = c("input");
            input.setAttribute("type","text");
            parentDiv.appendChild(input);
            childDiv = c("div");
            childDiv.className = "lazy-top-triangle";
            parentDiv.appendChild(childDiv);
            childDiv = c("div");
            childDiv.className = "lazy-bottom-triangle";
            parentDiv.appendChild(childDiv);
            // 分隔符
            span = c("span");
            span.className = "lazy-separator";
            time.appendChild(span);
            text = document.createTextNode(separator);
            span.appendChild(text);
            // 分钟部分
            parentDiv = c("div");
            parentDiv.className = "lazy-time-minutes";
            time.appendChild(parentDiv);
            input = c("input");
            input.setAttribute("type","text");
            parentDiv.appendChild(input);
            childDiv = c("div");
            childDiv.className = "lazy-top-triangle";
            parentDiv.appendChild(childDiv);
            childDiv = c("div");
            childDiv.className = "lazy-bottom-triangle";
            parentDiv.appendChild(childDiv);
            // 分隔符
            span = c("span");
            span.className = "lazy-separator";
            time.appendChild(span);
            text = document.createTextNode(separator);
            span.appendChild(text);
            // 秒钟部分
            parentDiv = c("div");
            parentDiv.className = "lazy-time-seconds";
            time.appendChild(parentDiv);
            input = c("input");
            input.setAttribute("type","text");
            parentDiv.appendChild(input);
            childDiv = c("div");
            childDiv.className = "lazy-top-triangle";
            parentDiv.appendChild(childDiv);
            childDiv = c("div");
            childDiv.className = "lazy-bottom-triangle";
            parentDiv.appendChild(childDiv);

            // 使用文档碎片将日期选择器一次性加载到body元素下
            if (script) {
                body.insertBefore(f,script);
            } else {
                body.appendChild(f);
            }
        }

        // 给日期选择器绑定相应事件处理程序，增加日期选择器的交互功能
        bindDateEvent = function bindDateEvent() {
            var datePicker = document.getElementById("lazy-date-picker"),
                year = gClass("lazy-year",datePicker)[0],
                month = gClass("lazy-month",datePicker)[0],
                weekeday = gClass("lazy-weekeday",datePicker)[0],
                day = gClass("lazy-day",datePicker)[0],
                time = gClass("lazy-time",datePicker)[0],
                inputArr = gTag("input", time); // 获得三个输入框的数组列表

            // 下方四个click事件也可以同时委托给datePicker元素，但是考虑代理层数过多，暂不考虑

            // 给顶部添加交互功能
            addHandler(year, "click", function(event) {
                var event = event || window.event,
                    eventTag = event.srcElement || event.target,
                    datePicker = document.getElementById("lazy-date-picker"),
                    month = gClass("lazy-month",datePicker)[0];

                if (month.className == "lazy-month") {// 月份列表被展示

                    // 进行事件代理
                    if (eventTag.className == "lazy-date-text") {
                        // 设置顶部文本指示当年当月
                        toggleTopText("currentMonth");
                        // 初始化日期视图
                        initTheDays();
                        // 然后显示日期列表视图
                        toggleMonthDisplay("hide");
                    } else if (eventTag.className == "lazy-left-triangle") {
                        // 更改存储的日期为去年对应日期
                        showDataPicker.info.setChosenDate("lastYear");
                        // 设置顶部文本指示去年
                        toggleTopText("lastYear");
                        // 初始化月份列表视图
                        initTheMonths();
                    } else if (eventTag.className == "lazy-right-triangle") {
                        // 更改存储的日期为明年对应日期
                        showDataPicker.info.setChosenDate("nextYear");
                        // 设置顶部文本指示明年
                        toggleTopText("nextYear");
                        // 初始化月份列表视图
                        initTheMonths();
                    }
                } else if (month.className == "lazy-month lazy-hidden") {// 月份列表被隐藏

                    // 进行事件代理
                    if (eventTag.className == "lazy-date-text") {
                        // 设置顶部文本指示当年
                        toggleTopText("currentYear");
                        // 初始化月份列表视图
                        initTheMonths();
                        // 然后显示月份列表视图
                        toggleMonthDisplay("show");
                    } else if (eventTag.className == "lazy-left-triangle") {
                        // 更改存储的日期为上个月的对应日期
                        showDataPicker.info.setChosenDate("lastMonth");
                        // 设置顶部文本指示上一个月
                        toggleTopText("lastMonth");
                        // 初始化日期视图
                        initTheDays();
                    } else if (eventTag.className == "lazy-right-triangle") {
                        // 更改存储的日期为下个月的对应日期
                        showDataPicker.info.setChosenDate("nextMonth");
                        // 设置顶部文本指示下一个月
                        toggleTopText("nextMonth");
                        // 初始化日期视图
                        initTheDays();
                    }
                    
                }
            });

            // 给月份列表添加交互功能
            addHandler(month, "click", function(event) {
                var event = event || window.event,
                    eventTag = event.srcElement || event.target,
                    n;

                // 进行事件代理
                if (eventTag.className == "lazy-date-text") {
                    // 更改存储的日期为该span对应的月份 
                    n = parseInt(eventTag.innerHTML,0) - 1;
                    showDataPicker.info.setChosenDate("month",n);

                    // 设置顶部文本指示选中日期的当年当月
                    toggleTopText("chosenMonth");

                    // 初始化日期视图
                    initTheDays();

                    // 然后显示日期列表视图
                    toggleMonthDisplay("hide");
                }
            });

            // 给日期添加交互功能
            addHandler(day, "click", function(event) {
                var event = event || window.event,
                    eventTag = event.srcElement || event.target,
                    n;

                // 进行事件代理
                // 也可以代理li，但是为了整个函数的一致性，均代理span
                if (eventTag.parentNode.className == "lazy-last-month") {
                    // 先将存储的日期月份减一
                    showDataPicker.info.setChosenDate("lastMonth");
                    // 再更改存储的日期为该span对应的日期 
                    n = parseInt(eventTag.innerHTML,0);
                    showDataPicker.info.setChosenDate("date",n);

                    // 设置顶部文本指示选中日期的当年当月
                    toggleTopText("chosenMonth");

                    // 初始化日期视图
                    initTheDays();
                } else if (eventTag.parentNode.className == "lazy-next-month") {
                    // 先将存储的日期月份减一
                    showDataPicker.info.setChosenDate("nextMonth");
                    // 再更改存储的日期为该span对应的日期 
                    n = parseInt(eventTag.innerHTML,0);
                    showDataPicker.info.setChosenDate("date",n);

                    // 设置顶部文本指示选中日期的当年当月
                    toggleTopText("chosenMonth");

                    // 初始化日期视图
                    initTheDays();
                } else if (eventTag.className == "lazy-date-text") {
                    // 更改存储的日期为该span对应的日期 
                    n = parseInt(eventTag.innerHTML,0);
                    showDataPicker.info.setChosenDate("date",n);

                    // 初始化日期视图
                    initTheDays();
                }
            });

            // 给时间输入框的单击事件添加交互功能
            addHandler(time, "click", function(event) {
                var event = event || window.event,
                    eventTag = event.srcElement || event.target,
                    hours = parseInt(inputArr[0].value,0), // 获得小时输入框的值
                    minutes = parseInt(inputArr[1].value,0), // 获得分钟输入框的值
                    seconds = parseInt(inputArr[2].value,0), // 获得秒钟输入框的值
                    // 点击输入框发生时间溢出时影响的天数，初始为0，即不影响
                    // 例如23点时再次点击增加1小时，则小时置零，天数需要加1
                    effectDates = 0,
                    chosenDate = showDataPicker.info.getChosenDate(), // 获得日期对象（存储的时间）
                    // 设置定时器的返回数，用于取消定时器
                    oDate, clock;

                // 连续触发点击事件时（取消前一个定时器）延迟更新（存储的时间）
                if (typeof showDataPicker.info.getClock() !== "undefined") {
                    clearTimeout(showDataPicker.info.getClock());
                }

                // 进行事件代理
                // 对时分秒进行加减的逻辑稍微有些不同
                if (eventTag.parentNode.className == "lazy-time-hours") {

                    // 二次代理
                    if  (eventTag.className == "lazy-top-triangle") {

                        // 点击上三角，当小于23点的时候直接做加1操作，当等于23时重置为0点，同时effectDates加1
                        if (hours < 23) {
                            hours += 1;
                            inputArr[0].value = (hours < 10) ? ("0" + hours) : hours;
                        } else if (hours === 23) {
                            effectDates += 1;
                            inputArr[0].value = "00";
                        }
                    } else if (eventTag.className == "lazy-bottom-triangle") {

                        // 点击下三角，当大于0点的时候直接做减1操作，当等于0时重置为23点，同时effectDates减1
                        if (hours > 0) {
                            hours -= 1;
                            inputArr[0].value = (hours < 10) ? ("0" + hours) : hours;
                        } else if (hours === 0) {
                            effectDates -= 1;
                            inputArr[0].value = 23;
                        }
                    }
                } else if (eventTag.parentNode.className == "lazy-time-minutes") {
                    
                    // 二次代理
                    if  (eventTag.className == "lazy-top-triangle") {

                        // 点击上三角，当小于59分钟的时候直接做操作，当等于59分钟的时候设置分钟为0分，并对小时进行加1操作
                        if (minutes < 59) {
                            minutes += 1;
                            inputArr[1].value = (minutes < 10) ? ("0" + minutes) : minutes;
                        } else if (minutes === 59) {

                            if (hours < 23) {
                                hours += 1;
                                inputArr[0].value = (hours < 10) ? ("0" + hours) : hours;
                            } else if (hours === 23) {
                                effectDates += 1;
                                inputArr[0].value = "00";
                            }

                            inputArr[1].value = "00";
                        }
                    } else if (eventTag.className == "lazy-bottom-triangle") {

                        // 点击下三角，当大于0分钟的时候直接做操作，当等于0分钟的时候设置分钟为59分，并对小时进行减1操作
                        if (minutes > 0) {
                            minutes -= 1;
                            inputArr[1].value = (minutes < 10) ? ("0" + minutes) : minutes;
                        } else if (minutes === 0) {

                            if (hours > 0) {
                                hours -= 1;
                                inputArr[0].value = (hours < 10) ? ("0" + hours) : hours;
                            } else if (hours === 0) {
                                effectDates -= 1;
                                inputArr[0].value = 23;
                            }

                            inputArr[1].value = "59";
                        }
                    }
                } else if (eventTag.parentNode.className == "lazy-time-seconds") {
                    
                    // 二次代理
                    if  (eventTag.className == "lazy-top-triangle") {

                        // 点击上三角，当小于59秒钟的时候直接做操作，当等于59秒钟的时候设置秒钟为0分，并对分钟进行加1操作
                        if (seconds < 59) {
                            seconds += 1;
                            inputArr[2].value = (seconds < 10) ? ("0" + seconds) : seconds;
                        } else if (seconds === 59) {

                            if (minutes < 59) {
                                minutes += 1;
                                inputArr[1].value = (minutes < 10) ? ("0" + minutes) : minutes;
                            } else if (minutes === 59) {

                                if (hours < 23) {
                                    hours += 1;
                                    inputArr[0].value = (hours < 10) ? ("0" + hours) : hours;
                                } else if (hours === 23) {
                                    effectDates += 1;
                                    inputArr[0].value = "00";
                                }

                                inputArr[1].value = "00";
                            }

                            inputArr[2].value = "00";
                        }
                    } else if (eventTag.className == "lazy-bottom-triangle") {

                        // 点击下三角，当大于200毫秒钟的时候直接做操作，当等于0秒钟的时候设置秒钟为59分，并对分钟进行减1操作
                        if (seconds > 0) {
                            seconds -= 1;
                            inputArr[2].value = (seconds < 10) ? ("0" + seconds) : seconds;
                        } else if (seconds === 0) {

                            if (minutes > 0) {
                                minutes -= 1;
                                inputArr[1].value = (minutes < 10) ? ("0" + minutes) : minutes;
                            } else if (minutes === 0) {

                                if (hours > 0) {
                                    hours -= 1;
                                    inputArr[0].value = (hours < 10) ? ("0" + hours) : hours;
                                } else if (hours === 0) {
                                    effectDates -= 1;
                                    inputArr[0].value = 23;
                                }

                                inputArr[1].value = "59";
                            }

                            inputArr[2].value = "59";
                        }
                    }
                }

                // 如果“日”被改变了，则调用initTheDays函数初始化一下日期视图(只是视觉效果，实际还是有定时器决定是否存储)
                if (effectDates) {
                    oDate = chosenDate.getDate();
                    chosenDate.setDate(oDate + effectDates);
                    initTheDays(chosenDate);
                }

                // 对点击事件处理完的200毫秒后更新（存储的时间）
                // 设置200毫秒后执行时为了避免用户连续点击造成频繁更改的情况
                // 对time对象的任意单击事件都会触发该定时器，但是我认为这点性能损耗影响不大
                // 通过匿名函数封装，给setTimeOutHandler传入参数
                clock = setTimeout(function(){
                    setTimeOutHandler(effectDates);
                },200);

                // 将该定时器存储为showDataPicker函数的属性
                showDataPicker.info.setClock(clock);
            });

            // 由于change事件冒泡的兼容性（IE6 IE7 IE8 IE9(Q)不支持冒泡），而监听键盘事件不能准确判断用户意图
            // 故最后选择分别监听change事件
            // 还有个备选方案——父元素同时代理change事件（针对IE 9+）和focusout事件（针对IE 9及以下）
            addHandler(inputArr[0], "change", function(event) {
                changeHandler(event);
            });

            addHandler(inputArr[1], "change", function(event) {
                changeHandler(event);
            });

            addHandler(inputArr[2], "change", function(event) {
                changeHandler(event);
            });

            function changeHandler(event) {
                var clock;


                // 设置checkOut返回一个数字，如果为1则日期加1天，-1则减一天，0则不修改日期

                // 连续触发change事件时（取消前一个定时器）延迟更新（存储的时间）
                if (typeof showDataPicker.info.getClock() !== "undefined") {
                    clearTimeout(showDataPicker.info.getClock());
                }

                // 先校验用户输入合法性
                checkOut(event);

                // checkOut();处理完的2秒后更新（存储的时间）
                // 设置200毫秒后执行时为了避免用户连续修改造成无意义更改的情况
                clock = setTimeout(setTimeOutHandler,200);

                // 将该定时器存储为showDataPicker函数的属性
                showDataPicker.info.setClock(clock);

                // 简单校验用户输入有效性函数
                function checkOut(event) {
                    var event = event || window.event,
                        eventTag = event.srcElement || event.target,
                        // 重新对输入框进行取值
                        hours = parseInt(inputArr[0].value,0),
                        minutes = parseInt(inputArr[1].value,0),
                        seconds = parseInt(inputArr[2].value,0);

                    if (eventTag === inputArr[0]) {

                        // 对用户输入的小时数进行简单的有效性校验并直接作出更正
                        if (isNaN(hours) || hours < 0) {
                            inputArr[0].value = "00";
                        } else if (hours > 23) {
                            inputArr[0].value = "23";
                        } else {
                            inputArr[0].value = (hours < 10) ? ("0" + hours) : hours;
                        }
                    } else if (eventTag === inputArr[1]) {

                        // 对用户输入的小时数进行简单的有效性校验并直接作出更正
                        if (isNaN(minutes) || minutes < 0) {
                            inputArr[1].value = "00";
                        } else if (minutes > 59) {
                            inputArr[1].value = "59";
                        } else {
                            inputArr[1].value = (minutes < 10) ? ("0" + minutes) : minutes;
                        }
                    } else if (eventTag === inputArr[2]) {

                        // 对用户输入的小时数进行简单的有效性校验并直接作出更正
                        if (isNaN(seconds) || seconds < 0) {
                            inputArr[2].value = "00";
                        } else if (seconds > 59) {
                            inputArr[2].value = "59";
                        } else {
                            inputArr[2].value = (seconds < 10) ? ("0" + seconds) : seconds;
                        }
                    }
                }

            }

            // 切换顶部年月显示文本
            function toggleTopText(state) {
                var datePicker = document.getElementById("lazy-date-picker"),
                    year = gClass("lazy-year",datePicker)[0],
                    span = gClass("lazy-date-text",year)[0],
                    chosenDate = showDataPicker.info.getChosenDate(),
                    str;

                switch(state) {
                    case "currentYear":
                    case "lastYear":
                    case "nextYear":
                        // 三种情况均执行下面语句
                        str = chosenDate.getFullYear() + "年";
                        span.innerHTML = str;
                        break;

                    case "currentMonth":
                    case "lastMonth":
                    case "nextMonth":
                    case "chosenMonth":
                        // 三种情况均执行下面语句
                        str = chosenDate.getFullYear() + "年" + (chosenDate.getMonth() + 1) + "月";
                        span.innerHTML = str;
                        break;

                    // 没有default
                }
            }

            // 切换展示月份列表还是日期列表
            function toggleMonthDisplay(state) {

                if (state == "show") {
                    weekeday.className = "lazy-weekeday lazy-hidden";               
                    day.className = "lazy-day lazy-hidden";               
                    month.className = "lazy-month";               
                } else if (state == "hide") {
                    month.className = "lazy-month lazy-hidden"; 
                    weekeday.className = "lazy-weekeday"; 
                    day.className = "lazy-day";               
                }
            }

            // 专门供定时器调用的处理函数
            // 该函数只做一个操作：更新存储的时间
            // 这个可选的参数为输入框发生溢出时对"日"的影响
            function setTimeOutHandler(effectDates) {
                // 重新对输入框进行取值
                var hours = parseInt(inputArr[0].value,0),
                    minutes = parseInt(inputArr[1].value,0),
                    seconds = parseInt(inputArr[2].value,0),
                    chosenDate = showDataPicker.info.getChosenDate(), // 获得日期对象（存储的时间）
                    oDate; // 原始存储的“日”
                    
                // 由于事件绑定有点混乱，此处取到的值仍然有可能是非法值，故在此处对于非法值修正为0
                hours = isNaN(hours) ? 0 : hours; 
                minutes = isNaN(minutes) ? 0 : minutes;
                seconds = isNaN(seconds) ? 0 : seconds;
                
                chosenDate.setHours(hours);
                chosenDate.setMinutes(minutes);
                chosenDate.setSeconds(seconds);

                // 如果“日”被改变了，则更改存储的“日”
                if (effectDates) {
                    oDate = chosenDate.getDate();
                    chosenDate.setDate(oDate + effectDates);
                }

                showDataPicker.info.setChosenDate(chosenDate);
            }
        }

        // 根据当前时间初始化日期选择器
        initThePicker = function initThePicker(pickerName, targetEle) {
            var datePicker = document.getElementById("lazy-date-picker"),
                theTime, // 初始化日期选择器的时间
                lazyYear, lazyMonth, lazyTime, spanArr, inputArr,
                str;

            // 如果传入了pickerName，则使用addDatePicker.dates中pickerName对应日期选择器中存储的chosenDate
            // 然后将showDataPicker.info中存储的chosenDate更新为addDatePicker.dates中pickerName对应日期选择器中存储的chosenDate
            if (typeof pickerName !== "undefinded") {
                theTime = addDatePicker.dates.getTheChosenDate(pickerName);
                showDataPicker.info.setTarget(targetEle);
                showDataPicker.info.setChosenDate(theTime);
            } 

            // 初始化顶部年月
            lazyYear = gClass("lazy-year")[0];
            spanArr = gTag("span",lazyYear);
            str = formatMonth(theTime);
            spanArr[0].innerHTML = str;

            // 初始化月份视图的当前月
            initTheMonths();

            // 星期是固定的不需要初始化
            // 初始化天数部分，首先输出实际的日期分布，然后给当天增加样式
            initTheDays();

            // 初始化时间部分
            lazyTime = gClass("lazy-time")[0];
            inputArr = gTag("input",lazyTime);
            inputArr[0].value = (theTime.getHours() < 10) ? ("0" + theTime.getHours()) : theTime.getHours();
            inputArr[1].value = (theTime.getMinutes() < 10) ? ("0" + theTime.getMinutes()) : theTime.getMinutes();
            inputArr[2].value = (theTime.getSeconds() < 10) ? ("0" + theTime.getSeconds()) : theTime.getSeconds();
            
            // 如果上次隐藏时日期选择器展示的是月份视图，则触发一次顶部年月的单击事件，展示日期视图
            lazyMonth = gClass("lazy-month")[0];
            if (lazyMonth.className == "lazy-month") {
                spanArr[0].click();         // 触发了一次真正的click事件，而不是简单的调用onclick的方法。
            }

            // 获得给定日期的年月并格式化成字符串的函数
            function formatMonth(date) {
                var str,year,month;

                year = date.getFullYear();
                month = date.getMonth() +1;
                str = year + "年" + month +"月";
                return str;
            }
        }
        
        // 根据调用函数的对象来确定日期选择器的位置
        locationThePicker = function locationThePicker(bindTag) {
            var rect = bindTag.getBoundingClientRect(),
                datePicker = document.getElementById("lazy-date-picker"),
                getScrollOffsets, // 一个辅助函数
                scroll, top, left, str;

            // 以一个对象的x和y属性的方式返回滚动条的偏移量
            getScrollOffsets = function(w) {
                // 使用指定的窗口，如果不带参数则使用当前的窗口
                var w = w || window,
                    d = w.document;

                // 除了IE 8及更早的版本外
                if (w.pageXOffset !== null) {
                    return {
                        x: w.pageXOffset,
                        y: w.pageYOffset
                    };
                }

                // 标准模式下的IE（或任何浏览器 ）
                if (document.compatMode === "CSS1Compat") {
                    return {
                        x: d.documentElement.scrollLeft,
                        y: d.documentElement.scrollTop
                    };
                }

                // 对怪异模式下的浏览器
                return {
                    x: d.body.scrollLeft,
                    y: d.body.scrollTop
                };
            }

            scroll = getScrollOffsets(); // 获取页面滚动条位置

            top = rect.bottom + scroll.y;
            left = rect.left + scroll.x;
            str = "top:" + top + "px;left:" + left + "px";
            datePicker.setAttribute("style",str);     
        }

        // 让生成的日期选择器可见
        showThePicker = function showThePicker() {
            var datePicker = document.getElementById("lazy-date-picker");
            datePicker.className = "";
        }

        // 根据日期控件存放的日期来刷新月份列表的显示情况
        // 允许传入一个可选的日期对象参数，如果传入参数，则用传入的日期初始化
        initTheMonths = function initTheMonths(date) {
            var datePicker = document.getElementById("lazy-date-picker"),
                lazyMonth = gClass("lazy-month")[0],
                liArr = gTag("li",lazyMonth),
                date = date || showDataPicker.info.getChosenDate(),
                today = new Date(),
                i;

            for (i = 0; i < liArr.length; i += 1) {
                // 重置所有月份列表节点类名为空
                liArr[i].className = "";
            }

            // 如果被存储的日期的年份和当天的年份是同一年（当月在当前视图内）
            if (date.getFullYear() === today.getFullYear()) {
                liArr[today.getMonth()].className = "lazy-current";
            }

            // 给选中日期对应的月份增加样式
            // 可以直接把当月的样式覆盖掉，因为两者样式重叠也只能显示被选中的样式
            liArr[date.getMonth()].className = "lazy-chosen";
        }

        // 根据日期控件存放的日期来刷新当前视图的日期显示情况,如果是当月还给当天增加样式
        // 允许传入一个可选的日期对象参数，如果传入参数，则用传入的日期初始化
        initTheDays = function initTheDays(date) {
            var today = new Date(),
                date = date || showDataPicker.info.getChosenDate(), 
                lastDays, nextDays, //视图中上个月与下个月的天数
                lazyDay, liArr,spanArr, //需要操作的DOM元素
                getDaysInMonth, getTheLastDayOfLastMonth, getTheWeekedayOfFirstDay, // 3个辅助函数
                firstWeekday, lastDay, currentDays, 
                len, i, j;

            // 获取当前日期所处月份的总天数的函数
            getDaysInMonth = function(date) {
                var year = date.getFullYear(),
                    month = date.getMonth(),
                    days,
                    is_leap_year = ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)),
                    day_list=[];
                day_list = [31,(is_leap_year ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];//枚举出所有可能的天数
                days = day_list[month];
                return days;
            }

            // 获取上个月的最后一天为几号的函数
            getTheLastDayOfLastMonth = function(date) {
                var date = new Date(date),//通过毫秒数创建一个日期，避免修改原对象
                    lastDay;
                date.setDate(0);
                return date.getDate();
            }

            // 获取当月第一天为周几的函数
            getTheWeekedayOfFirstDay = function(date) {
                var date = new Date(date),//通过毫秒数创建一个日期，避免修改原对象
                    weekeday = [6,0,1,2,3,4,5];//将js默认的每周从周日开始改为从周一开始。
                date.setDate(1);
                return weekeday[date.getDay()];
            }

            firstWeekday = getTheWeekedayOfFirstDay(date); // 获取当月第一天为周几
            lastDay = getTheLastDayOfLastMonth(date); // 获取上个月的最后一天为几号
            currentDays = getDaysInMonth(date); // 获取当前日期所处月份的总天数

            // 确保存储的日期和初始化的日期一致
            // showDataPicker.info.setChosenDate(date);
            lazyDay = gClass("lazy-day")[0];
            liArr = gTag("li",lazyDay);
            spanArr = gTag("span",lazyDay);

            // 如果该月第一天为周一，则第一行均为上个月的日期，
            if (firstWeekday === 0) {
                lastDays = 7;
            } else {
                lastDays = firstWeekday;
            }

            len = lastDays;
            j = lastDay - lastDays + 1;
            //给上个月的日期增加样式并输出日期
            for (i = 0; i < len; i += 1) {
                liArr[i].className = "lazy-last-month";
                spanArr[i].innerHTML = j++;
            }

            len += currentDays;
            j = 1;
            for (/*空语句*/;i < len; i += 1) {

                // 清除当月日期对应li的类名，防止多次初始化导致的bug
                liArr[i].className = "";
                spanArr[i].innerHTML = j++;
            }

            // 如果被存储的日期的月份和当天的月份是同一个月（当天在当前视图内）
            if (date.getMonth() === today.getMonth()) {
                liArr[today.getDate() + lastDays - 1].className = "lazy-current";
            }

            // 可以直接把当天的样式覆盖掉，因为两者样式重叠也只能显示被选中的样式
            liArr[date.getDate() + lastDays - 1].className = "lazy-chosen";

            len = 42;//总共7*6=42天
            j = 1;
            for (/*空语句*/; i < len; i += 1) {
                liArr[i].className = "lazy-next-month";
                spanArr[i].innerHTML = j++;
            }
        }

        // 如果没有创建过日期选择器，则创建日期控件以及给日期控件绑定事件处理函数
        if (!document.getElementById("lazy-date-picker")) {

            // 创建日期控件
            createThePicker();

            // 给日期控件绑定一些交互事件
            bindDateEvent();

        }

        // 初始化日期控件
        initThePicker(pickerName, targetEle);

        // 将日期控件添加到该输入框的下方
        locationThePicker(bindTag);
        
        // 当全部结构以及功能都准备完毕后将日期选择器展示出来，提高用户体验
        showThePicker();

        // 设置当前激活的日期选择器
        addDatePicker.dates.setCurrentPicker(pickerName);
    }

    // 目标元素失去焦点的处理程序
    hideDatePicker = function hideDatePicker(event, targetArr) {
        var event = event || window.event,          
            x = event.clientX,      // 获得鼠标事件的x坐标
            y = event.clientY,      // 获得鼠标事件的y坐标
            datePicker = document.getElementById("lazy-date-picker"),
            pickerMap = addDatePicker.dates.getPickerMap(),   // 获得目标元素和日期选择器之间的映射
            currentPicker = addDatePicker.dates.getCurrentPicker(),   // 当前激活状态的日期选择器
            currentInputArea, datePickerArea,    // 元素的位置区域
            isInArea, stopPro,          // 辅助函数
            chosenDate,      
            i;

        // 辅助函数，判断给定x、y坐标的点是否处在区域内
        isInArea = function isInArea(x, y, rect) {
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                return true;
            }
            return false;
        }

        // 阻止事件冒泡
        stopPro = function stopPro(event) {
            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
        }

        // 只有当前存在激活的日期选择器时才对单击事件进行判断
        if (currentPicker !== "") {

            // 取到激活该日期选择器的元素的位置区域
            for (i = 0; i < targetArr.length; i += 1) {
                if (pickerMap[i] === currentPicker) {
                    currentInputArea = targetArr[i].getBoundingClientRect();
                    break;
                }
            }

            datePickerArea = datePicker.getBoundingClientRect();
            
            // 用户点击了日期选择器和目标输入框之外的区域时，隐藏日期选择器
            if (!isInArea(x, y, currentInputArea) && !isInArea(x, y, datePickerArea)) {
                // 获得用户选择的时间
                chosenDate = showDataPicker.info.getChosenDate();

                // 隐藏日期选择器之前，将被选中时间的日期对象存入addDatePicker.dates
                addDatePicker.dates.setTheChosenDate(chosenDate, currentPicker);

                // 添加类名"lazy-hidden"，实现隐藏效果
                datePicker.className = "lazy-hidden";

                // 取消当前激活的日期选择器
                addDatePicker.dates.setCurrentPicker("");
                
            // 用户点击了目标元素
            // 因为前面的逻辑问题，对任意目标元素的单击都将触发日期选择器重新加载操作
            // 所以在重载之前将开始选择的日期进行保存
            } else if (isInArea(x, y, currentInputArea)) {
                // 获得用户选择的时间
                chosenDate = showDataPicker.info.getChosenDate();

                // 重载日期选择器之前，将被选中时间的日期对象存入addDatePicker.dates
                addDatePicker.dates.setTheChosenDate(chosenDate, currentPicker);
            }

            stopPro(event); //阻止冒泡
        }
    }

    targetArr = gClass(classname); // 获得目标元素数组

    // 给对应的目标绑定激活日期选择器功能
    for (i = 0; i < targetArr.length; i += 1) {
        config = addDatePicker.dates.getConfig();
        // 设置目标为只读，同时设置一些样式
        targetArr[i].setAttribute("readonly",config["readonly"]);
        targetArr[i].setAttribute("style",config["style"]);
        targetArr[i].setAttribute("value",config["value"]);

        (function(i){
            addHandler(targetArr[i], "focus", function(event) {

                // 设置input和对应日期选择器的映射
                addDatePicker.dates.setPickerMap(i,i);

                // 目标获得焦点时触发显示日期选择器
                // targetArr[i]标识input元素，addDatePicker.dates.getPickerMap()[i]标识日期选择器
                showDataPicker(event, targetArr[i], addDatePicker.dates.getPickerMap()[i]);
            });
        }(i));
    }

    // 在除目标以及日期选择器之外的区域发生mousedown事件则隐藏日期选择器
    // REVIEW：此处处理的不好，需要改进
    addHandler(document, "mousedown", function(event,classname) {
        hideDatePicker(event,targetArr);
    });

    // 给showDataPicker函数定义一个info属性来保存该函数相关的数据
    // 也可以使用外层函数中的变量进行保存
    showDataPicker.info = (function() {
        var information = {};
        return {

            // 设置click事件或者change事件的计时器(由于本函数中两个事件实际操作的是同一个对象，故共用一套定时器)
            setClock: function(clock) {
                information.clickClock = clock;
            },

            // 获得click事件或者change事件的计时器
            getClock: function() {
                return information.clickClock;
            },

            // 设置日期选择器被选中的时间
            // 可以传入一个日期对象或者字符串，如果是字符串则会匹配快捷指令，匹配成功同样可以进行设置
            // 第二个参数可选，配合“month”或者“date”快捷指令设置为的第n月或者第n天，对于“month”n从0开始，对于“date”n从1开始
            setChosenDate: function(date/*shortcut|date*/,n) {
                var m, oYear, oMonth, oDate,
                    outPut;         // 输出函数

                outPut = function outPut() {
                    var target, cDate, str,
                        format;     // 格式化函数

                    // 将日期格式化成需要的格式
                    // PREVIEW:此处未做处理
                    format = function format(date) {
                        var y, m, d, H, M, S, str;
                        
                        y = date.getFullYear();
                        m = date.getMonth() + 1;
                        d = date.getDate();
                        H = date.getHours();
                        M = date.getMinutes();
                        S = date.getSeconds();
                        
                        m = m < 10 ? "0" + m : m;
                        d = d < 10 ? "0" + d : d;
                        H = H < 10 ? "0" + H : H;
                        M = M < 10 ? "0" + M : M;
                        S = S < 10 ? "0" + S : S;
                        
                        str = y + "/" + m + "/" + d + " " + H + ":" + M + ":" + S ;
                        return str;
                    }

                    cDate = information.chosenDate;
                    str = format(cDate);

                    target = information.target;
                    target.value = str;
                }

                if (typeof date === "object") { // 将给定日期的值赋给chosenDate，而不是直接将chosenDate指向date
                    information.chosenDate = new Date(date);
                } else {

                    // 先获得原始的年、月、日
                    oYear = information.chosenDate.getFullYear();
                    oMonth = information.chosenDate.getMonth();
                    oDate = information.chosenDate.getDate();

                    switch(date) {
                        case "lastMonth": // 上个月 
                            information.chosenDate.setMonth(oMonth - 1);
                            break;

                        case "nextMonth": // 下个月
                            information.chosenDate.setMonth(oMonth + 1);
                            break;

                        case "lastYear": // 去年
                            information.chosenDate.setFullYear(oYear - 1);
                            break;

                        case "nextYear": // 明年
                            information.chosenDate.setFullYear(oYear + 1);
                            break;

                        case "month": // 本年的（n+1)月份

                            // 对n做简单的校验以及修改
                            // 转换为整数之后，假定除了NaN之外的均为预期数字，即使是大于11或者小于0的数
                            m = isNaN(parseInt(n, 0)) ? 0 : parseInt(n, 0);

                            information.chosenDate.setMonth(m);
                            break;

                        case "date": // 本月的n号

                            // 对n做简单的校验以及修改
                            // 转换为整数之后，假定除了NaN之外的均为预期数字，即使是大于31或者小于0的数
                            m = isNaN(parseInt(n, 0)) ? 1 : parseInt(n, 0);

                            information.chosenDate.setDate(m);
                            break;

                        // 没有default
                    }

                    // 通过快捷指令（修改年份或者月份）设置日期后的“日”发生了变化则说明日期出现溢出现象
                    // 例如：将2017.07.31修改为上个月，通过setMonth（5），实际得到2017.07.01。
                    // 这这情况肯定是不对的，我的处理是将日期强制修正为上个月的月尾，即通过setDate(0)实现。
                    if (information.chosenDate.getDate() !== oDate && date !== "date") {
                        information.chosenDate.setDate(0);
                    }
                }

                // 每次存储之后都进行输出
                outPut();
            },
            // 获得日期选择器被选中的时间
            getChosenDate: function() {
                // 返回一份information.chosenDate的拷贝，防止内部的chosenDate被直接修改
                return new Date(information.chosenDate);
            },

            // 记录输出的目标元素
            setTarget: function(target) {
                information.target = target;
            },

            // // 获得click事件或者change事件的计时器
            // getTarget: function() {
            //     return information.target;
            // },
        }
    }());
}

// 给addDatePicker函数定义一个dates属性来保存存储的日期对象
addDatePicker.dates = (function() {
    var chosenDates = [],   // 一个日期选择器的pickerName对应一个被选中时间的日期对象
        pickerMap = {},     // 键为input元素的编号（此处直接用根据类名获得的input元素类数组的下标），值为该日期选择器的pickerName
        currentPicker = "",      // 当前激活状态的日期选择器
        config = {
            "readonly": "readonly",
            "style": "font-size:.5em;cursor:pointer;",
            "value": ""
        };            // 一些简单的配置，目前只有input的一些样式
        
    return {
        // 如果有被选中日期对象，则返回该对象的复制对象，否则返回函数被调用时间的日期对象
        getTheChosenDate: function(name) {
            if (chosenDates[name]) {
                // 返回存储日期的复制对象（避免存储的对象被直接修改）
                return new Date(chosenDates[name]);
            } else {
                // 没有被存储日期则返回函数被调用时间
                return new Date();
            }
        },

        // 设置该目标对象对应的日期选择器是否曾经被初始化
        setTheChosenDate: function(chosenDate, name) {

            // 如果没有传入键，则使用chosenDates的长度作为键
            if (typeof name === "undefined") {
                name = chosenDates.length; 
            }

            chosenDates[name] = new Date(chosenDate);
        },

        // 获得对应input的日期选择器的pickerName
        getPickerMap: function() {
            return pickerMap;
        },

        // 设置input与日期选择器的映射关系
        setPickerMap: function(key, datePickerName) {
            pickerMap[key] = datePickerName;
        },

        // 获得当前激活的日期选择器的pickerName
        getCurrentPicker: function() {
            return currentPicker;
        },

        // 设置当前激活的日期选择器
        setCurrentPicker: function(datePickerName) {
            currentPicker = datePickerName;
        },
        
        // 获得配置文件
        getConfig: function() {
            return config;
        }
    };
}());

/*封装绑定页面加载函数,在需要绑定一个事件时只需运行一次这个函数*/
function addLoadEvent(func) {
    var oldonload=window.onload;
    if(typeof window.onload != "function") {
        window.onload = func;
    }else{
        window.onload = function() {
            oldonload();
            func();
        }
    }
}

// 页面加载完成即执行绑定
addLoadEvent(addDatePicker);
