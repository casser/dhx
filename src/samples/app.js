


class App {
    constructor() {
        this.main = new XLayoutObject({
            parent: document.body,
            pattern: "2U",
            cells: [{
                id: "a",
                text: "Hierarchy",
                width: 250
            }, {
                id: "b",
                text: "Details"
            }]
        });
        this.wins = this.main.dhxWins = new dhtmlXWindows();
        this.menu = this.main.attachMenu({
            iconset: "awesome",
            xml: "./kitchen/layout/menu.xml"
        });
        this.toolbar = this.main.attachToolbar({
            iconset: "awesome",
            icons_size: 24,
            xml: "./kitchen/layout/toolbar.xml"
        });
        this.sidebar = this.main.cells("a").attachTreeView({
            root_id: "",
            iconset: "font_awesome",
            items: "./kitchen/layout/sidebar.xml"
        });
        this.sidebar.attachEvent("onSelect",(id)=>{
            switch (id) {
                case "file-tile-view":
                    this.showFileDataView('ftiles');
                    break;
                case "file-icon-view":
                    this.showFileDataView('ficons');
                    break;
                case "file-grid":
                    this.showFileDataGrid();
                    break;
                case "tab-bar-view":
                    this.showTabbarView();
                    break;
                case "accordion-view":
                    this.showAccordion();
                    break;
                case "carousel-view":
                    this.showCarousel();
                    break;
                case "charts-view":
                    this.showChartsView();
                    break;
                case "lists-view":
                    this.showListView();
                    break;
            }
        });
        this.toolbar.attachEvent("onClick",(id)=>{
            switch (id) {
                case "view_dlist":
                    this.showFileDataGrid();
                    break;
                case "view_icons":
                    this.showFileDataView('ftiles');
                    break;
                case "view_tiles":
                    this.showFileDataView('ficons');
                    break;
            }
        });
        //this.showOtherViews();
        this.showFileDataGrid();
    }
    showFileContent(id) {
        var w1 = this.wins.createWindow("popup",0,0,800, 600);
        w1.setText("Preview");
        //w1.denyResize();
        w1.button("park").hide();
        //w1.button("minmax").hide();
        w1.attachEvent("onClose", function (win) {
            win.setModal(false);
            win.hide();
        });
        w1.show();
        w1.setDimension(800, 600);
        w1.center();
        w1.setModal(true);
        w1.attachObject("win-content");

    }
    showFileDataGrid(dir) {
        var myGrid = this.main.cells("b").attachGrid();
        myGrid.setIconset("awesome");
        //myGrid.setIconsPath("/kitchen/imgs/");
        myGrid.setHeader("&nbsp;,Name,Size,Type,Modified");
        myGrid.setColTypes("icon,ro,ro,ro,ro");
        myGrid.setInitWidths("40,250,90,150,*");
        myGrid.setColAlign("center,left,right,left");
        myGrid.load("./kitchen/data/files.xml");
        myGrid.attachEvent("onRowDblClicked", (id)=> {
            this.showFileContent(id);
        });
        myGrid.init();
    }
    showFileDataView(type) {
        dhtmlx.DataDriver.xml.records = "/*/row";
        var myDataView = this.main.cells("b").attachDataView({
            type : type
        });
        myDataView.attachEvent("onItemDblclick", function (id) {
            this.showFileContent(id);
        });
        myDataView.clearAll();
        myDataView.load("./kitchen/data/files.xml");
    }
    showTabbarView(){
        var myTabbar = this.main.cells("b").attachTabbar({
            tabs: [
                { id: "a1", text: "Login Form", active: true },
                { id: "a2", text: "Tab 2" },
                { id: "a3", text: "Tab 3" },
                { id: "a4", text: "Tab 4" },
                { id: "a5", text: "Tab 5" }
            ]
        });
        let el =document.createElement('div');
        myTabbar.cells('a2').cell.appendChild(el);
        let mySlider = new dhtmlXSlider({
            parent: el,
            size: 150,
            value: 5,
            step: 1,
            min: 0,
            max: 10,
            tooltip: true
        });

        var myForm = myTabbar.cells('a1').attachForm([
            {type: "settings", position: "label-left", labelWidth: 200, inputWidth: 200},
            {type: "block", inputWidth: "auto", offsetTop: 12, list: [
                {type: "settings", position: "label-left", labelWidth: 120, inputWidth: 140},
                {type: "label", label: "Init from JSON", labelWidth: "auto"},
                {type: "input", name:'login', label: "Name", value: "John Smith"},
                {type: "password",name:'password', label: "Password", value: "123"},
                {type:"input", name:"inp3", label:"Format: $ 0.00",
                    numberFormat:["$ 0,000.00",",","."]},
                {type:"input", name:"inp4", label:"Format: 0,000 Rub",
                    numberFormat:["0,000 Rub","'"]},
                {type: "combo", label: "Session", options:[
                    {value: "1", text: "Administration"},
                    {value: "2", text: "Design", selected:true},
                    {value: "3", text: "Manage Articles"}
                ]},
                {type: "calendar", dateFormat: "%Y-%m-%d %H:%i", name: "start_date", label: "Start Date", value:"2011-06-20 14:38", enableTime: true, calendarPosition: "right"},
                {type: "calendar", name: "end_date", label: "End Date", dateFormat: "%Y-%m-%d", serverDateFormat: "%d.%m.%Y", value: "20.06.2011", calendarPosition: "right"},
                {type: "upload", name: "upload", label: "Upload"}

            ]},
            {type: "newcolumn"},
            {type: "block", inputWidth: "auto", offsetTop: 12, list: [
                {type: "settings", position: "label-left", labelWidth: 120, inputWidth: 140},
                {type: "label", label: "Init from JSON", labelWidth: "auto"},
                {type: "input", label: "Name", value: "John Smith"},
                {type: "password", label: "Password", value: "123"},
                {type:"input", name:"inp3", label:"Format: $ 0.00",
                    numberFormat:["$ 0,000.00",",","."]},
                {type:"input", name:"inp4", label:"Format: 0,000 Rub",
                    numberFormat:["0,000 Rub","'"]},
                {type: "combo", label: "Session", options:[
                    {value: "1", text: "Administration"},
                    {value: "2", text: "Design", selected:true},
                    {value: "3", text: "Manage Articles"}
                ]},
                {type: "calendar", dateFormat: "%Y-%m-%d %H:%i", name: "start_date", label: "Start Date", value:"2011-06-20 14:38", enableTime: true, calendarPosition: "right"},
                {type: "calendar", name: "end_date", label: "End Date", dateFormat: "%Y-%m-%d", serverDateFormat: "%d.%m.%Y", value: "20.06.2011", calendarPosition: "right"}
            ]},
            {type: "newcolumn"},
            {type: "block", inputWidth: "auto", offsetTop: 12, list: [
                {type: "settings", position: "label-left", labelWidth: 280, inputWidth: 280},
                {type:"input",name:"prj_name",label:"Project Name",value:"Project1",
                    tooltip:"Enter Name",required:true, info:true,
                    note:{text:"Enter project name.The fields are required."}},

                {type:"input",name:"prj_descr",label:"Project Description",
                    value:"Project is great!", rows:3,
                    note:{text:"Describe your project's basic purposes.The fields are optional."}},
                {type: "editor", name: "a1", label: "One", inputWidth: 400, inputHeight: 100, value: "Lorem ipsum"},

            ]}
        ]);
        let myPop = new dhtmlXPopup({
            form: myForm,
            id: ["prj_descr","prj_name"]
        });
        myPop.attachHTML("Please enter something<br>Second line<br>One more line here");

        myForm.attachEvent("onFocus", function(id,value){
            if (typeof(value) != "undefined") id=[id,value]; // for radiobutton
            myPop.show(id);
        });
        myForm.attachEvent("onBlur", function(id,value){
            myPop.hide();
        });
    }
    showAccordion(){
        let myAccordion = this.main.cells("b").attachAccordion({
            iconset: "awesome",
            items: [
                { id: "a1", text: "Main Page", icon: "fa-table" },
                { id: "a2", text: "Navigation", icon: "fa-table" },
                { id: "a3", text: "Feedback", icon: "fa-table" }
            ]
        })
    }
    showCarousel(){
        let myCarousel = this.main.cells("b").attachCarousel({
            item_width: 240,
            item_height: 280,
            offset_item: 30,
            offset_left: 30,
            offset_top: 15
        });
        for (var q=0; q<6; q++) {
            var id = myCarousel.addCell();
            myCarousel.cells(id).attachHTMLString(`
                <div style='position: relative; left: 0px; top: 0px; overflow: hidden; width: 100%; height: 100%;'>
                    Hello World ${id}
                </div>
            `);
        }
    }
    showChartsView(){
        let myChart = this.main.cells("b").attachChart({
            view: "pie",
            value: "#sales#",
            color: "#color#",
            pieInnerText: "#sales#",
            legend: {
                width: 75,
                align: "right",
                valign: "middle",
                template: "#month#"
            }
        });
        myChart.parse([
            {sales: "20", month: "Jan", color: "#ee3639"},
            {sales: "30", month: "Feb", color: "#ee9e36"},
            {sales: "50", month: "Mar", color: "#eeea36"},
            {sales: "40", month: "Apr", color: "#a9ee36"},
            {sales: "70", month: "May", color: "#36d3ee"},
            {sales: "80", month: "Jun", color: "#367fee"},
            {sales: "60", month: "Jul", color: "#9b36ee"}
        ], "json");
    }
    showListView(){
        let myRibbon = this.main.cells("b").attachRibbon({
            iconset: "awesome",
            items: [
                {type: "block", text: "Project", list: [
                    {id: "create", type: "button", text: "Create", img: "fa fa-file-o", imgdis: "fa fa-file-o", isbig: true},
                    {id: "open", type: "button", text: "Open Project", img: "fa fa-folder-open-o", imgdis: "fa fa-folder-open-o"},
                    {id: "print", type: "button", text: "Print", img: "fa fa-print", imgdis: "fa fa-print"},
                    {id: "save", type: "button", text: "Save As...", img: "fa fa-save", imgdis: "fa fa-save"}
                ]},
                {type: "block", text: "Edit", list: [
                    {id: "cut", type: "button", text: "Cut", img: "fa fa-scissors", imgdis: "fa fa-scissors", isbig: true},
                    {id: "copy", type: "button", text: "Copy", img: "fa fa-files-o", imgdis: "fa fa-files-o", isbig: true},
                    {id: "paste", type: "button", text: "Paste", img: "fa fa-clipboard", imgdis: "fa fa-clipboard", isbig: true}
                ]}
            ]
        });
        myRibbon.attachEvent('onClick',(id)=>{
            alert(id);
            console.info(this);
        });
        let myList = this.main.cells("b").attachList({
            type:{
                template:"<span class='dhx_strong'>#name#</span>#address# <br/><span class='dhx_light'>#city#</span>",
                padding:5,
                height:80
            }
        });
        myList.load("./kitchen/data/list.xml");
    }
    showSlider(){
        let mySlider =  this.main.cells("b").attachToolbar({
            iconset: "awesome",
            icons_size: 24,
            xml: "./kitchen/layout/toolbar.xml"
        });
    }
}

dhtmlXDataView.prototype.types.ftiles = {
    css         : "ftiles",
    template    : dhtmlx.Template.fromHTML(`
        <div class='ftiles_item'>
            <i class='fa fa-folder-o'></i>
            <div class='dhx_item_text'>{common.text()}</div>
            <div class='dhx_item_text dhx_item_text_gray'>{common.size()}</div>
        </div>
    `),
    template_loading: dhtmlx.Template.fromHTML(""),
    width: 220,
    height: 88,
    margin: 0,
    padding: 0,
    image: function(obj){
        return "./icons/tiles/"+obj.cell[0];
    },
    text: function(obj){
        return obj.cell[1];
    },
    size: function(obj){
        return obj.cell[2];
    }
};
dhtmlXDataView.prototype.types.ficons = {
    css: "ficons",
    template: dhtmlx.Template.fromHTML(`
        <div class='ficons_item'>
            <i class='fa fa-folder-o'></i>
            <div class='dhx_item_text'>{common.text()}</div>
        </div>
    `),
    template_loading: dhtmlx.Template.fromHTML(""),
    width: 132,
    height: 110,
    margin: 0,
    padding: 0,
    image: function(obj){
        return "./icons/icons/"+obj.cell[0];
    },
    text: function(obj){
        return obj.cell[1];
    }
};

var app = new App();