# simpleDatePicker
这是一个简单的日期选择器，你不需要做很多操作就能获得一个使用日期选择器的输入框
第一步，引入这里的js和css文件。js文件最好加在文件最后（如果你没有使用window.onload事件也可以随便放置）
第二步，给你需要加入日期选择器的input元素增加“lazy-datePicker”类名即完成所有操作。
demo地址：https://lazy1993.github.io/simpleDatePicker/ 

工具特点：
  1、无需其他配置，引入相关文件并且给目标添加指定类名即可
  2、可以同时给多个目标元素添加日期控件
  3、源码注释详细，方便自行进行修改和开发
  4、整个工具只引入一个全局变量addDatePicker函数，对开发的影响做到最小，实现真正的简单、省心
  5、如果一个全局变量都不想引入，可以在页面的最后使用立即执行函数（IIFE),即在页面body最后加上
            (function(){
                addDatePicker();
            }());
     实现零全局变量.
