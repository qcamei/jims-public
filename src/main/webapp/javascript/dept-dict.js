/**
 * Created by heren on 2015/9/14.
 */
$(function () {

    $("#dept").searchbox({
        searcher: function (value, name) {
            var children;
            var roots = $('#tt').treegrid('getRoots'); //得到tree顶级node
            for (var i = 0; i < roots.length; i++) { //循环顶级 node
                children = $('#tt').treegrid('getChildren', roots[i].target);//获取顶级node下所有子节点
                if (children) { //如果有子节点
                    for (var j = 0; j < children.length; j++) { //循环所有子节点
                        //console.log("num:"+j);
                        //console.log(children[j]);
                        if ($('#tt').treegrid('isLeaf', children[j].target)) { //判断子级是否为叶子节点,即不是父节点
                            if (children[j].deptName.indexOf(value) >= 0) { //判断节点text是否包含搜索文本
                                $('#tt').treegrid('select', children[j].target);//设置此节点为选择状态
                                break;
                            }
                        }
                    }
                } else {
                    if (roots[i].deptName.indexOf(value) >= 0) {
                        //alert("*" + roots[i].deptName);
                        $('#tt').treegrid('select', roots[i].target);//设置此节点为选择状态
                        break;
                    }
                }
            }
        }
    });
    //设置列
    $("#tt").treegrid({
        fit: true,
        idField: "id",
        treeField: "deptCode",
        //toolbar: '#tb',
        footer: '#tb',
        fitColumns: true,
        title: parent.config.hospitalName + "--科室维护",
        columns: [[{
            title: 'id',
            field: 'id',
            hidden: true
        }, {
            title: '科室编码',
            field: 'deptCode',
            width: "10%"
        }, {
            title: '科室名称',
            field: 'deptName',
            width: "10%"
        }, {
            title: '科室别名',
            field: 'deptAlis',
            width: "10%"
        }, {
            title: '科室临床属性',
            field: 'deptAttr',
            width: "10%"
        }, {
            title: '门诊住院',
            field: 'deptOutpInp',
            width: "5%",
            formatter: function(value,row,index){
                if (row.deptOutpInp == 1){
                    return "门诊";
                } else {
                    return "住院";
                }
            }
        }, {
            title: '输入码',
            field: 'inputCode',
            width: "10%"
        }, {
            title: '分科属性',
            field: 'deptDevideAttr',
            width: "10%"
        }, {
            title: '科室位置',
            field: 'deptLocation',
            width: "10%"
        }, {
            title: '科室类别',
            field: 'deptClass',
            width: "10%"
        }, {
            title: '科室类型',
            field: 'deptType',
            width: "10%"
        }, {
            title: '是否停止',
            field: 'deptStopFlag',
            width: "5%",
            formatter: function(value,row,index){
                if (row.deptStopFlag == 1){
                    return "否";
                } else {
                    return "是";
                }
            }
        }]]
    });

    /**
     * 加载科室信息表
     */
    var loadDept = function () {
        var depts = [];
        var treeDepts = [];
        var loadPromise = $.get("/api/dept-dict/list?hospitalId=" + parent.config.hospitalId, function (data) {
            //$("#tt").treegrid('loadData',data);
            $.each(data, function (index, item) {
                var obj = {};
                obj.deptCode = item.deptCode;
                obj.id = item.id;
                obj.deptName = item.deptName;
                obj.deptAlis = item.deptAlis;
                obj.deptAttr = item.deptAttr;
                obj.deptOutpInp = item.deptOutpInp;
                obj.inputCode = item.inputCode;
                obj.deptDevideAttr = item.deptDevideAttr;
                obj.deptLocation = item.deptLocation;
                obj.deptStopFlag = item.deptStopFlag;
                obj.hospitalId = item.hospitalDict.id;
                obj.parentId = item.parentId;
                obj.deptType = item.deptType;
                obj.deptClass = item.deptClass;
                obj.endDept = item.endDept;
                obj.children = [];

                depts.push(obj);
            });
        });

        loadPromise.done(function () {
            for (var i = 0; i < depts.length; i++) {
                for (var j = 0; j < depts.length; j++) {
                    if (depts[i].id == depts[j].parentId) {
                        depts[i].children.push(depts[j]);
                    }
                }
                if (depts[i].children.length > 0 && !depts[i].parentId) {
                    treeDepts.push(depts[i]);
                }

                if (!depts[i].parentId && depts[i].children <= 0) {
                    treeDepts.push(depts[i])
                }
            }

            $("#tt").treegrid('loadData', treeDepts);
        })
    }

    loadDept();

    $("#searchBtn").on("click", function () {
        var name = $("#name").textbox("getValue");
        var rows = $("#tt").treegrid('getData');
        console.log(rows);
        $.each(rows, function (index, item) {
            console.log(item.deptName);

            if (item.deptName == name) {
                $("#tt").treegrid('select', item.id);
            }
        });
    });

    /**
     * 添加科室
     */
    $("#addBtn").on('click', function () {
        clearInput();
        $("#dlg").dialog("open").dialog("setTitle", "添加科室");
    });

    /**
     * 添加子科室
     */
    $("#addChildBtn").on('click', function () {
        clearInput();
        var node = $("#tt").treegrid('getSelected');
        if (!node) {
            $.messager.alert("系统提示", "请先选择上级科室，然后在添加子科室");
            return;
        }
        $("#dlg").dialog("open").dialog("setTitle", "添加科室");
        $("#parentId").textbox('setValue', node.id);

    });

    /**
     * 修改科室信息
     *
     */
    $("#editBtn").on('click', function () {
        var node = $("#tt").treegrid("getSelected");
        if (!node) {
            $.messager.alert("系统提示", "请选择要修改的科室");
            return;
        }
        $("#id").val(node.id);
        $("#deptCode").textbox('setValue', node.deptCode);
        $("#deptName").textbox('setValue', node.deptName);
        $("#deptAlis").textbox('setValue', node.deptAlis);
        $("#deptAttr").textbox('setValue', node.deptAttr);
        $("#deptOutpInp").combobox('setValue', node.deptOutpInp);
        $("#deptDevideAttr").textbox('setValue', node.deptDevideAttr);
        $("#deptLocation").textbox('setValue', node.deptLocation);
        $("#deptStopFlag").combobox('setValue', node.deptStopFlag);
        $("#parentId").textbox('setValue', node.parentId);

        $("#dlg").dialog('open').dialog('setTitle', "科室修改");

    });

    /**
     * 保存信息
     */
    $("#saveBtn").on('click', function () {

        var deptDict = {};
        deptDict.hospitalDict = {};
        deptDict.id = $("#id").val();
        deptDict.deptCode = $("#deptCode").textbox('getValue');
        deptDict.deptName = $("#deptName").textbox('getValue');
        deptDict.deptAlis = $("#deptAlis").textbox('getValue');
        deptDict.deptAttr = $("#deptAttr").textbox('getValue');
        deptDict.deptOutpInp = $("#deptOutpInp").combobox('getValue');
        //deptDict.deptDevideAttr = $("#deptDevideAttr").textbox('getValue');
        deptDict.deptLocation = $("#deptLocation").textbox('getValue');
        deptDict.deptStopFlag = $("#deptStopFlag").combobox('getValue');
        deptDict.parentId = $("#parentId").textbox('getValue');
        deptDict.deptClass = $("#deptClass").combobox('getValue');
        deptDict.deptType = $("#deptType").combobox('getValue');
        deptDict.endDept = $("#endDept").combobox('getValue');


        deptDict.hospitalDict.id = parent.config.hospitalId;

        if ($("#fm").form('validate')) {
            $.postJSON("/api/dept-dict/add", deptDict, function (data) {
                $.messager.alert("系统提示", "保存成功");
                loadDept();
                clearInput();
                $("#dlg").dialog('close');
            }, function (data) {
                $.messager.alert("系统提示", "保存失败");
            })
        }

    });

    /**
     * 清除输入框信息
     */
    var clearInput = function () {
        $("#id").val();
        $("#deptCode").textbox('setValue', "");
        $("#deptName").textbox('setValue', "");
        $("#deptAlis").textbox('setValue', "");
        $("#deptAttr").textbox('setValue', "");
        $("#deptOutpInp").combobox('setValue', "");
        //$("#deptDevideAttr").textbox('setValue',"") ;
        $("#deptLocation").textbox('setValue', "");
        $("#deptStopFlag").combobox('setValue', "");
        $("#parentId").textbox('setValue', "");

    }
    /**
     * 删除
     */
    $("#delBtn").on('click', function () {
        var node = $("#tt").treegrid("getSelected");
        if (!node) {
            $.messager.alert("系统提示", "请选择要删除的科室");
            return;
        }

        if ($("#tt").treegrid("getChildren", node.id).length > 0) {
            $.messager.alert("系统提示", "请先删除子科室，在删除");
            return;
        }


        $.messager.confirm("系统提示", "确定要删除【" + node.deptName + "】吗？", function (r) {
            if (r) {
                $.delete("/api/dept-dict/del/" + node.id, function (data) {
                    $.messager.alert("系统提示", "删除成功");
                    loadDept();
                })
            }
        });

    });
});