/**
 * @summary      AutoComplete
 * @description 输入框自动检索下拉选项
 * @version      0.0.1
 * @file         autoComplete.js
 * @author      cangowu
 * @contact     1138806090@qq.com
 * @copyright   Copyright 2016 cangoWu.
 *
 * 这是一个基于原生js的自动完成搜索的下拉输入框，
 * 可以通过移动鼠标上下键回车以及直接用鼠标点击
 * 选中搜索的选项，在一些关键的地方都有注释
 *
 * 实例参见:
 * CSDN博客：http://blog.csdn.net/wzgdjm/article/details/51122615
 * Github：https://github.com/cangowu/autoComplete
 *
 */
(function () {

    function AutoComplete() {
        if (!(this instanceof AutoComplete)) {
            return new AutoComplete();
        }
        this.sSearchValue = '';
        this.index = -1;
    }

    AutoComplete.prototype = {
        fnInit: function (option) {//初始化基本信息
            var oDefault = {
                id: '', //控件id
                data: [], //数据
                paraName: '',
                textFiled: '', //显示的文字的属性名
                valueFiled: '', //获取value的属性名
                style: {}, //显示的下拉div的样式设置
                url: '', //ajax请求的url
                select: function () {
                }, //选择选项时触发的事件
            };
            var _option = option;

            this.sId = _option.id || oDefault.id;
            this.aData = _option.data || oDefault.data;
            this.paraName = _option.paraName || oDefault.paraName;
            this.sTextFiled = _option.textFiled || oDefault.textFiled;
            this.sValueFiled = _option.valueFiled || oDefault.valueFiled;
            this.style = _option.style || oDefault.style;
            this.sUrl = _option.url || oDefault.url;
            this.fnSelect = _option.select || oDefault.select;
            this.sDivId = this.sId + new Date().getTime();//加载选项额divid

            //判断如果传入了url,没有传入data数据，就ajax获取数据，否则使用data取数据
            if (this.sUrl !== '' && this.aData.length === 0) {
                var that = this;
                this.util.fnGet(this.sUrl, function (data) {
                    console.log(eval(data));
                    that.aData = eval(data);
                }, 10);
            }

            //给aData排序
            var sTextField = this.sTextFiled;
            this.aData.sort(function (a, b) {
                return a[sTextField] > b[sTextField];
            });
            //获取控件
            this.domInput = document.getElementById(this.sId);
            //this.domDiv = document.getElementById(this.sDivId);
        },
        fnRender: function () {//渲染一些必须的节点
            var that = this;
            //生成一个对应的div，承载后面的一些选项的
            if (that.sDivId) {
                var domDiv = document.createElement('div');
                domDiv.id = that.sDivId;
                domDiv.style.background = '#fff';
                domDiv.style.width = that.domInput.offsetWidth - 2 + 'px';
                domDiv.style.position = 'absolute';
                domDiv.style.border = '1px solid #a9a9a9';
                domDiv.style.display = 'none';
                that.util.fnInsertAfter(domDiv, that.domInput);

                //加载之后才能将domDiv赋值为
                this.domDiv = document.getElementById(this.sDivId);
            }
            //给input添加keyup事件
            that.util.fnAddEvent(that.domInput, 'keyup', function (event) {
                that.fnSearch(event);
            });
        },
        fnSearch: function (event) {
            //判断如果不是回车键，上键下键的时候执行搜索
            if (event.keyCode != 13 && event.keyCode != 38 && event.keyCode != 40) {
                this.fnLoadSearchContent();
                this.fnShowDiv();
            } else {//搜索之后监测键盘事件
                var length = this.domDiv.children.length;
                if (event.keyCode == 40) {
                    ++this.index;
                    if (this.index >= length) {
                        this.index = 0;
                    } else if (this.index == length) {
                        this.domInput.value = this.sSearchValue;
                    }
                    this.domInput.value = this.domDiv.childNodes[this.index].text;
                    this.fnChangeClass();
                }
                else if (event.keyCode == 38) {
                    this.index--;
                    if (this.index <= -1) {
                        this.index = length - 1;
                    } else if (this.index == -1) {
                        this.obj.value = this.sSearchValue;
                    }
                    this.domInput.value = this.domDiv.childNodes[this.index].text;
                    this.fnChangeClass();
                }
                else if (event.keyCode == 13) {
                    this.fnLoadSearchContent();
                    this.fnShowDiv();
                    //this.domDiv.style.display = this.domDiv.style.display === 'none' ? 'block' : 'none';
                    this.index = -1;
                } else {
                    this.index = -1;
                }
            }
        },
        fnLoadSearchContent: function () {
            //删除所有的子节点
            while (this.domDiv.hasChildNodes()) {
                this.domDiv.removeChild(this.domDiv.firstChild);
            }
            //设置search的值
            this.sSearchValue = this.domInput.value;
            //如果值为空的时候选择退出
            var sTrimSearchValue = this.sSearchValue.replace(/(^\s*)|(\s*$)/g, '');
            if (sTrimSearchValue == "") {
                this.domDiv.style.display = 'none';
                return;
            }
            try {
                var reg = new RegExp("(" + sTrimSearchValue + ")", "i");
            }
            catch (e) {
                return;
            }
            //搜索并增加新节点
            var nDivIndex = 0;
            for (var i = 0; i < this.aData.length; i++) {
                if (reg.test(this.aData[i][this.sTextFiled])) {
                    var domDiv = document.createElement("div");
                    //div.className="auto_onmouseout";
                    domDiv.text = this.aData[i][this.sTextFiled];
                    domDiv.onclick = this.fnSetValue(this);
                    domDiv.onmouseover = this.fnAutoOnMouseOver(this, nDivIndex);
                    domDiv.innerHTML = this.aData[i][this.sTextFiled].replace(reg, "<strong>$1</strong>");//搜索到的字符粗体显示
                    this.domDiv.appendChild(domDiv);
                    nDivIndex++;
                }
            }
        },
        fnSetValue: function (that) {
            return function () {
                that.domInput.value = this.text;
                that.domDiv.style.display = 'none';
            }
        },
        fnAutoOnMouseOver: function (that, idx) {
            return function () {
                that.index = idx;
                that.fnChangeClass();
            }
        },
        fnChangeClass: function () {
            var that = this;
            var length = that.domDiv.children.length;
            for (var j = 0; j < length; j++) {
                if (j != that.index) {
                    that.domDiv.childNodes[j].style.backgroundColor = '';
                    that.domDiv.childNodes[j].style.color = '#000';
                } else {
                    that.domDiv.childNodes[j].style.backgroundColor = 'blue';
                    that.domDiv.childNodes[j].style.color = '#fff';
                }
            }
        },
        fnShowDiv: function () {
            if (this.domDiv.children.length !== 0) {
                this.domDiv.style.display = this.domDiv.style.display === 'none' ? 'block' : 'none';
            }
        },
        util: {//公共接口方法
            fnInsertAfter: function (ele, targetEle) {
                var parentnode = targetEle.parentNode || targetEle.parentElement;
                if (parentnode.lastChild == targetEle) {
                    parentnode.appendChild(ele);
                } else {
                    parentnode.insertBefore(ele, targetEle.nextSibling);
                }
            },
            fnAddEvent: function (ele, evt, fn) {
                if (document.addEventListener) {
                    ele.addEventListener(evt, fn, false);
                } else if (document.attachEvent) {
                    ele.attachEvent('on' + (evt == "input" ? "propertychange" : evt), fn);
                } else {
                    ele['on' + (evt == "input" ? "propertychange" : evt)] = fn;
                }
            },
            fnGet: function (url, fn, timeout) {
                var xhr = null;
                try {
                    if (window.XMLHttpRequest) {
                        xhr = new XMLHttpRequest();
                    } else if (Window.ActiveXObject) {

                        xhr = new ActiveXObject("Msxml2.Xmlhttp");
                    }
                } catch (e) {
                    //TODO handle the exception
                    xhr = new ActiveXObject('Microsoft.Xmlhttp');
                }
                xhr.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        fn.call(this, this.responseText);
                    } else {
                        setTimeout(function () {
                            xhr.abort();
                        }, timeout);
                    }
                };
                xhr.open('get', url, true);
                xhr.send();
            }
        }
    }

    window.AutoComplete = function (option) {
        var aOption = Array.prototype.slice.call(arguments);
        for(var i=0;i<aOption.length;i++){
            var autoComplete = new AutoComplete();
            autoComplete.fnInit(aOption[i]);
            autoComplete.fnRender();
        }
    }

})(window);