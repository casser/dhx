class dhtmlXWindows{
	constructor(params) {
		this._zOrder = [
			{name: "modal",   value: true},
			{name: "sticked", value: true},
			{name: "sticked", value: false}];
		this._vpPull = {};
		this._vpOf = {};
		// console.log("context menu for top icon?");
		// console.log("resize with attached iframe - cover or cross events?");
		// console.log("resize allow while progress is on?");
		// console.log("deny resize for maxed window, but allow for partially maxed");
		// console.log("add cancelBubble for mousedown/click for modal cover?");

		var that = this;

		var conf = {};
		if (typeof(params) != "undefined") {
			for (var a in params) conf[a] = params[a];
		}
		params = null;

		this.conf = {
			skin: window.dhx4.skin||(typeof(dhtmlx)!="undefined"?dhtmlx.skin:null)||window.dhx4.skinDetect("dhxwins")||"material",
			// viewport conf
			vp_pos_ofs: 20, // windows-veieport overlay (left, right, bottom) and 0 for top
			vp_custom: false,
			vp_of_auto: (conf.vp_overflow=="auto"), // overflow for body from layout init
			vp_of_id: window.dhx4.newId(),
			// window dinmension offset
			ofs_w: null,
			ofs_h: null,
			// button down/up state
			button_last: null,
			// hdr dblclick
			dblclick_tm: 300,
			dblclick_last: null,
			dblclick_id: null,
			dblclick_mode: "minmax", // "park", function(){}, "function_name"
			dblclick_active: false,
			dblclick_ev: false,
			// fr cover render
			fr_cover: false // iframe+select issue, ie6 only
		};

		var transData = window.dhx4.transDetect();
		this.conf.tr = {
			prop: transData.transProp, // false if not available
			ev: transData.transEv,
			height_open: "height 0.2s cubic-bezier(0.25,0.1,0.25,1)", // cell open/close by click
			height_close: "height 0.18s cubic-bezier(0.25,0.1,0.25,1)", // cell open/close by click
			op_open: "opacity 0.16s ease-in", // cell_cont on open
			op_close: "opacity 0.2s ease-out", // cell_cont on close
			op_v_open: "1", // opacity for opened cell
			op_v_close: "0.4" // opacity for closed cell
		};

		if (!conf.viewport) {
			this.attachViewportTo(document.body);
		} else {
			if (conf.viewport.object != null) {
				this.attachViewportTo(conf.viewport.object);
			} else if (conf.viewport.left != null && conf.viewport.top != null && conf.viewport.width != null && conf.viewport.height != null) {
				this.setViewport(conf.viewport.left, conf.viewport.top, conf.viewport.width, conf.viewport.height, conf.viewport.parent);
			} else {
				this.attachViewportTo(document.body);
			}
		}

		this.w = {};

		this.createWindow = function(id, x, y, width, height) {

			var r = {};
			if (arguments.length == 1 && typeof(id) == "object") {
				r = id;
			} else {
				r.id = id;
				r.left = x;
				r.top = y;
				r.width = width;
				r.height = height;
				if (typeof(r.id) == "undefined" || r.id == null) r.id = window.dhx4.newId();
				while (this.w[r.id] != null) r.id = window.dhx4.newId();
			}

			if (r.left == null) r.left = 0;
			if (r.top == null) r.top = 0;

			r.move = (r.move != null && window.dhx4.s2b(r.move) == false ? false : (r.deny_move != null && window.dhx4.s2b(r.deny_move) == true ? false : true));
			r.park = (r.park != null && window.dhx4.s2b(r.park) == false ? false : (r.deny_park != null && window.dhx4.s2b(r.deny_park) == true ? false : true));
			r.resize = (r.resize != null && window.dhx4.s2b(r.resize) == false ? false : (r.deny_resize != null && window.dhx4.s2b(r.deny_resize) == true ? false : true));
			r.keep_in_viewport = (r.keep_in_viewport != null && window.dhx4.s2b(r.keep_in_viewport));
			r.modal = (r.modal != null && window.dhx4.s2b(r.modal));
			r.center = (r.center != null && window.dhx4.s2b(r.center));
			r.text = (r.text != null ? r.text:(r.caption!=null?r.caption:"dhtmlxWindow"));
			r.header = (!(r.header != null && window.dhx4.s2b(r.header) == false));

			var t = document.createElement("DIV");
			t.className = "dhxwin_active";
			this.vp.appendChild(t);

			t._isWindow = true;
			t._idd = r.id;

			var h = document.createElement("DIV");
			h.className = "dhxwin_hdr";
			h.style.zIndex = 0;
			h.innerHTML = "<div class='dhxwin_icon'></div>"+
				"<div class='dhxwin_text'><div class='dhxwin_text_inside'>"+r.text+"</div></div>"+
				"<div class='dhxwin_btns'></div>";
			t.appendChild(h);

			h.onselectstart = function(e) {
				e = e||event;
				if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
				return false;
			}

			h.oncontextmenu = function(e) {
				e = e||event;
				e.cancelBubble = true;
				return false;
			}

			h._isWinHdr = true;
			h.firstChild._isWinIcon = true;

			var k = document.createElement("DIV");
			k.className = "dhxwin_brd";
			t.appendChild(k);

			var fr_cover = document.createElement("DIV");
			fr_cover.className = "dhxwin_fr_cover";
			fr_cover.innerHTML = "<iframe class='dhxwin_fr_cover_inner' frameborder='0' border='0'></iframe><div class='dhxwin_fr_cover_inner'></div>";
			t.appendChild(fr_cover);

			this.w[r.id] = {
				win: t,
				hdr: h,
				brd: k,
				fr_cover: fr_cover,
				b: {},
				conf: {
					z_id: window.dhx4.newId(),
					actv: false,
					modal: false,
					maxed: false,
					parked: false,
					sticked: false,
					visible: true,
					header: true,
					text: r.text,
					keep_in_vp: r.keep_in_viewport,
					allow_move: r.move,
					allow_park: r.park,
					allow_resize: r.resize,
					max_w: null,
					max_h: null,
					min_w: 80,
					min_h: 80
				}
			};

			// buttons, id=>visible
			var btns = {
				help: {title: "Help", visible: false},
				stick: {title: "Stick", visible: false},
				park: {title: "Park", visible: true},
				minmax: {title: "Min/Max", visible: true},
				close: {title: "Close", visible: true}
			};
			for (var a in btns) {
				var b = new dhtmlXWindowsButton(this, r.id, a, btns[a].title, false);
				if (btns[a].visible == false) b.hide();
				h.lastChild.appendChild(b.button);
				this.w[r.id].b[a] = b;
				b = null;
			}
			this._winAdjustTitle(r.id);

			this.w[r.id].win.style.zIndex = window.dhx4.zim.reserve(this.w[r.id].conf.z_id);

			var cell = new dhtmlXWindowsCell(r.id, this);
			this.w[r.id].win.insertBefore(cell.cell, fr_cover);
			this.w[r.id].cell = cell;

			this.w[r.id].win.addEventListener("mousedown", this._winOnMouseDown, false);
			this.w[r.id].win.addEventListener("mouseup", this._winOnMouseDown, false);
			if (this.conf.dblclick_ev){
				this.w[r.id].win.addEventListener("dblclick", this._winOnMouseDown, false);
			}


			// fr for IE6
			this._winInitFRM(r.id);

			this._winSetPosition(r.id, r.left, r.top);
			this._winSetSize(r.id, r.width, r.height);
			this._winMakeActive(r.id);

			if (r.center == true) this.w[r.id].cell.center();
			if (r.modal == true) this.w[r.id].cell.setModal(true);
			if (r.header == false) this.w[r.id].cell.hideHeader();

			var f = t = h = k = fr_cover = cell = null;

			return this.w[r.id].cell;
		}

		this._winOnMouseDown = function(e) {

			e = e||event;

			var t = e.target||e.srcElement;
			var data = {press_type: e.type};

			if (e.type == "MSPointerDown" || e.type == "pointerdown") {
				that.conf.ev_skip = true;
			} else if (that.conf.ev_skip == true) {
				that.conf.ev_skip = false;
				t = null;
				return;
			}


			while (t != null && t._isWindow != true) {
				if (typeof(t.className) != "undefined" && data.mode == null) {
					if (typeof(t._buttonName) != "undefined") {
						data.mode = "button";
						data.button_name = t._buttonName;
					} else if (t._isWinHdr == true) {
						data.mode = "hdr";
					} else if (t._isWinIcon == true) {
						data.mode = "icon";
					}
				}
				t = t.parentNode;
			}
			if (data.mode == null) data.mode = "win";

			data.id = (t != null && t._isWindow == true ? t._idd:null);

			t = null;

			if (data.id != null && that.w[data.id] != null) that.callEvent("_winMouseDown",[e,data]); // window can be attached to anther window and unexisting ID can be here
		}

		this._winOnParkTrans = function(e) {
			if (e.stopPropagation) e.stopPropagation();
			var w = that.w[this._idd];
			if (e.propertyName == "opacity") {
				that._winCellClearOpacity(this._idd);
			}
			if (e.propertyName == "height" && w.conf.tr_mode == "park") {
				if (w.conf.tr_mode == "park") {
					w.win.style[that.conf.tr.prop] = "";
					if (!w.conf.parked) {
						that._winAdjustCell(this._idd);
						that._callMainEvent("onParkDown", this._idd);
						if (w.conf.keep_in_vp) that._winAdjustPosition(this._idd, w.conf.x, w.conf.y);
					} else {
						w.hdr.style.zIndex = 3;
						that._callMainEvent("onParkUp", this._idd);
					}
				}

			}
			w = null;
		}

		this.unload = function() {

			this.conf.unloading = true;

			// dnd
			if (this._dndInitModule) this._dndUnloadModule();

			// windows
			for (var a in this.w) this._winClose(a);
			this.w = null;

			// context menu
			if (this.cm != null && typeof(this._unloadContextMenu) == "function") this._unloadContextMenu();

			// events
			window.dhx4._eventable(this, "clear");

			// viewport
			this.attachViewportTo(null);

			// conf
			for (var a in this.conf) {
				this.conf[a] = null;
				delete this.conf[a];
			}

			for (var a in this) this[a] = null;

			that = a = null;

		}

		window.dhx4._eventable(this);

		this.attachEvent("_winMouseDown", this._winMouseDownHandler);

		if (this._dndInitModule) this._dndInitModule();

		if (conf.wins != null) {
			for (var q=0; q<conf.wins.length; q++) {
				var r = conf.wins[q];
				this.createWindow(r);
			}
		}
		conf = null;


		return this;
	}
	forEachWindow(func) {
		for (var a in this.w) {
			func.apply(window, [this.w[a].cell]);
		}
	};
	window(id) {
		if (this.w[id] != null) return this.w[id].cell;
		return null;
	};
	isWindow(id) {
		return (this.w[id] != null);
	};
	findByText(text) {
		var p = [];
		for (var a in this.w) {
			if ((this.w[a].cell.getText()).indexOf(String(text)) >= 0) p.push(this.w[a]);
		}
		return p;
	};
	setSkin(skin) {
		if (skin == this.conf.skin) return;
		if (this.vp != null) {
			this.vp.className = String(this.vp.className).replace("dhxwins_vp_"+this.conf.skin," dhxwins_vp_"+skin);
		}
		for (var a in this.w) {
			this.w[a].cell._resetSizeState();
			this._winAdjustCell(a);
			this._winAdjustTitle(a);
		}
		this.conf.skin = skin;
	};
	getBottommostWindow() {
		return this._getTopBottomWin(false);
	};
	getTopmostWindow() {
		return this._getTopBottomWin(true);
	};
	_getTopBottomWin(mode) {
		var data = null;
		for (var a in this.w) {
			if (this.w[a].conf.visible) {
				var k = false;
				if (data != null) {
					k = data.z > this.w[a].win.style.zIndex;
					if (mode) k = !k;
				}
				if (data == null || k) data = {win: this.w[a].cell, z: this.w[a].win.style.zIndex};
			}
		}
		return (data?data.win:null);
	};
	_winMakeActive(id, force) {

		// if id is null activate last z-index window

		if (id != null && force !== true && this.w[id].conf.actv == true) return;

		var all = [];

		var inList = {};

		for (var q=0; q<this._zOrder.length; q++) {

			var propName = this._zOrder[q].name;
			var propValue = this._zOrder[q].value;

			var st = [];

			// windows matched to prop but not with specified id
			for (var a in this.w) {
				var w = this.w[a];
				if (inList[a] == null && w.conf[propName] === propValue && w.conf.visible == true) {
					if (id != a) {
						window.dhx4.zim.clear(w.conf.z_id);
						st.push([a, Number(w.win.style.zIndex)]);
						inList[a] = true;
					}
				}
				w = null;
			}
			st.sort(function(a,b){
				return (a[1]<b[1]?1:-1);
			});

			// check windows which is specified to be active
			if (id != null && this.w[id].conf[propName] === propValue && inList[id] == null) {
				// clear zim
				window.dhx4.zim.clear(this.w[id].conf.z_id);
				var k = [[id, Number(this.w[id].win.style.zIndex)]];
				st = k.concat(st);
				inList[id] = true;
			}

			all = all.concat(st);
		}

		// change windows' z-index
		for (var q=all.length-1; q>=0; q--) {

			var a = all[q][0];
			var w = this.w[a];

			w.win.style.zIndex = window.dhx4.zim.reserve(w.conf.z_id);

			// adjust modal cover z-index
			if (w.conf.modal && this.mcover != null) {
				for (var b in this.mcover) this.mcover[b].style.zIndex = w.win.style.zIndex;
			}

			// ajust fr_cover if any
			this._winAdjustFRMZIndex(a);

			// if id not specified, make last z-index active, can be triggered from _winHide
			if (id == null && q == 0) id = a;

			w.conf.actv = (id==a);
			w.win.className = (w.conf.actv?"dhxwin_active":"dhxwin_inactive");

			w = null;
		}

		if (id != null && this.conf.last_active != id) this._callMainEvent("onFocus", id);

		this.conf.last_active = id;

	};
	_vpPullAdd() {
		if (this.vp == null) return;
		var id = null;
		for (var a in this._vpPull) {
			if (this._vpPull[a].vp == this.vp) {
				this._vpPull[a].count++;
				id = a;
			}
		}
		if (id == null) {
			this._vpPull[window.dhx4.newId()] = {vp: this.vp, count: 1};
		}
		if (this.vp == document.body && this.conf.vp_of_auto == true) {
			// if window inited on behalf on layout, clear overflow from body to enable scroll)
			this._vpOfInit();
		}
		this._vpOfUpd();
	};
	_vpPullRemove() {
		if (this.vp == null) return 0;
		var count = 0;
		for (var a in this._vpPull) {
			if (this._vpPull[a].vp == this.vp) {
				count = --this._vpPull[a].count;
				if (count == 0) {
					this._vpPull[a].vp = null;
					this._vpPull[a].count = null;
					delete this._vpPull[a];
				}
			}
		}
		this._vpOfClear();
		return count;
	};
	_vpOfInit() {
		this._vpOf[this.conf.vp_of_id] = true;
	};
	_vpOfClear() {
		this._vpOf[this.conf.vp_of_id] = false;
		delete this._vpOf[this.conf.vp_of_id];
		this._vpOfUpd();
	};
	_vpOfUpd() {
		var auto = false;
		for (var a in this._vpOf) auto = auto||this._vpOf[a];
		if (auto == true) {
			if (document.body.className.match(/dhxwins_vp_auto/) == null) {
				document.body.className += " dhxwins_vp_auto";
			}
		} else {
			if (document.body.className.match(/dhxwins_vp_auto/) != null) {
				document.body.className = String(document.body.className).replace(/\s{0,}dhxwins_vp_auto/gi, "");
			}
		}
	};
	attachViewportTo(id) {

		// old one
		var vpCount = this._vpPullRemove();

		if (this.conf.vp_custom) {
			while (this.vp.childNodes.length > 0) this.vp.removeChild(this.vp.lastChild);
			this.vp.parentNode.removeChild(this.vp);
			this.vp = null;
		} else if (this.vp != null && vpCount == 0) {
			this.vp.className = String(this.vp.className).replace(new RegExp("\\s{1,}dhxwins_vp_"+this.conf.skin),""); // no more window instances attached to same object, clear css
		}

		// new if set
		if (id == null) {

			this.vp = null; // clear link

		} else {

			this.vp = (typeof(id)=="string"?document.getElementById(id):id);
			var skin = "dhxwins_vp_"+this.conf.skin;
			if (this.vp.className.indexOf(skin) < 0) this.vp.className += " "+skin;
			id = null;

			// windows
			for (var a in this.w) this.vp.appendChild(this.w[a].win);

			this.conf.vp_custom = false;

		}

		if (this.vp == document.body) {
			document.body.style.position = "static"; // abs-left/top broken for relative/absolute
		}

		this._vpPullAdd();

	};
	setViewport(x, y, width, height, parentObj) {

		var t = document.createElement("DIV");

		t.style.position = "absolute";
		t.style.left = x+"px";
		t.style.top = y+"px";
		t.style.width = width+"px";
		t.style.height = height+"px";

		if (typeof(parentObj) == "undefined" || parentObj == null) {
			parentObj = document.body;
		} else if (typeof(parentObj) == "string") {
			parentObj = document.getElementById(parentObj);
		}
		parentObj.appendChild(t);

		this.attachViewportTo(t);
		this.conf.vp_custom = true;

		parentObj = t = null;

	};
	_winSetPosition(id, x, y) {

		var w = this.w[id];

		if (w.conf.maxed) {
			// probably window have max_w/max_h set and dragable
			// adjust saved w/h
			w.conf.lastMX += (x-w.conf.x);
			w.conf.lastMY += (y-w.conf.y);
		}

		w.conf.x = x;
		w.conf.y = y;

		w.win.style.left = w.conf.x+"px";
		w.win.style.top = w.conf.y+"px";

		this._winAdjustFRMPosition(id);

		w = null;
	};
	_winAdjustPosition(id, x, y) { // check if window out of viewport

		var w = this.w[id];

		// if called from cell's adjustPosition, just make sure window position is okey
		if (typeof(x) == "undefined") x = w.conf.x;
		if (typeof(y) == "undefined") y = w.conf.y;

		var minX = (w.conf.keep_in_vp?0:-w.conf.w+this.conf.vp_pos_ofs);
		var maxX = (w.conf.keep_in_vp?this.vp.clientWidth-w.conf.w:this.vp.clientWidth-this.conf.vp_pos_ofs);

		if (x < minX) {
			x = minX;
		} else if (x > maxX) {
			x = maxX;
		}

		var maxY = (w.conf.keep_in_vp?this.vp.clientHeight-w.conf.h:this.vp.clientHeight-this.conf.vp_pos_ofs);

		if (y < 0) {
			y = 0;
		} else if (y > maxY) {
			y = maxY;
		}

		if (x != w.conf.x || y != w.conf.y) {
			this._winSetPosition(id, x, y);
		}

		w = null;
	};
	_winSetSize(id, width, height, skipAdjust, fixPos) {

		var w = this.w[id];

		var w2 = (width != null ? width : w.conf.w);
		var h2 = (height != null ? height : w.conf.h);

		if (this.conf.ofs_w == null) {
			w.win.style.width = w2+"px";
			w.win.style.height = h2+"px";
			this.conf.ofs_w = w.win.offsetWidth-w2;
			this.conf.ofs_h = w.win.offsetHeight-h2;
		}

		if (w.conf.min_w != null && w2 < w.conf.min_w) w2 = w.conf.min_w;
		if (w.conf.max_w != null && w2 > w.conf.max_w) w2 = w.conf.max_w;

		if (!w.conf.parked && w.conf.min_h != null && h2 < w.conf.min_h) h2 = w.conf.min_h;
		if (w.conf.max_h != null && h2 > w.conf.max_h) h2 = w.conf.max_h;

		if (w.conf.keep_in_vp) {
			if (w2 > this.vp.clientWidth) w2 = this.vp.clientWidth;
			if (h2 > this.vp.clientHeight) h2 = this.vp.clientHeight;
		}

		w.win.style.width = w2-this.conf.ofs_w+"px";
		w.win.style.height = h2-this.conf.ofs_h+"px";

		w.conf.w = w2;
		w.conf.h = h2;

		this._winAdjustFRMSize(id);

		if (fixPos) this._winAdjustPosition(id, w.conf.x, w.conf.y);

		// adjust content
		if (!w.conf.parked && skipAdjust != true) this._winAdjustCell(id);

		w = null;
	};
	_winMinmax(id, mode) {

		if (typeof(mode) != "undefined" && this.w[id].conf.maxed == mode) return; // already requested state
		if (this.w[id].conf.allow_resize == false) return;

		var w = this.w[id];

		if (w.conf.parked) this._winPark(id, false);

		if (w.conf.maxed) {

			this._winSetSize(id, w.conf.lastMW, w.conf.lastMH);
			this._winAdjustPosition(id, w.conf.lastMX, w.conf.lastMY);
			w.conf.maxed = false;

		} else {

			var x = 0;
			var y = 0;

			// adjust position, if any max w/h values - do not allow win to be moved outside vp
			if (w.conf.max_w != null) x = w.conf.x + Math.round(w.conf.w-w.conf.max_w)/2;
			if (w.conf.max_h != null) y = Math.max(w.conf.y + Math.round(w.conf.h-w.conf.max_h)/2, 0);

			// save old coords and dim
			w.conf.lastMX = w.conf.x;
			w.conf.lastMY = w.conf.y;
			w.conf.lastMW = w.conf.w;
			w.conf.lastMH = w.conf.h;

			this._winSetSize(id, this.vp.clientWidth, this.vp.clientHeight);
			this._winAdjustPosition(id, x, y);


			w.conf.maxed = true;

		}

		w.b.minmax.setCss(w.conf.maxed?"minmaxed":"minmax");

		if (w.conf.maxed) {
			this._callMainEvent("onMaximize", id);
		} else {
			this._callMainEvent("onMinimize", id);
		}


		w = null;
	};
	_winShow(id, makeActive) {

		if (this.w[id].conf.visible == true) return;

		this.w[id].win.style.display = "";
		this.w[id].conf.visible = true;

		// makeActive set to true or only this window is visible
		if (makeActive == true || this.conf.last_active == null) this._winMakeActive(id, true);

		this._callMainEvent("onShow", id);
	};
	_winHide(id, actvId) {

		if (this.w[id].conf.visible == false) return;

		this.w[id].win.style.display = "none";
		this.w[id].conf.visible = false;

		if (this.w[id].conf.actv) {
			this.w[id].conf.actv = false;
			this.w[id].win.className = "dhxwin_inactive";
			this._winMakeActive(null, true);
		}

		this._callMainEvent("onHide", id);
	};
	_winPark(id, ef) {

		if (this.w[id].conf.allow_park == false) return;
		if (this.w[id].conf.header == false) return;

		var w = this.w[id];

		if (ef == true && this.conf.tr.prop !== false) {
			w.win.style[this.conf.tr.prop] = this.conf.tr[w.conf.parked?"height_open":"height_close"];
			if (!w.conf.tr_ev) {
				w.win.addEventListener(this.conf.tr.ev, this._winOnParkTrans, false);
				w.conf.tr_ev = true;
			}
		}

		if (w.conf.parked) {
			// restore
			w.hdr.className = String(w.hdr.className).replace(/\s{1,}dhxwin_hdr_parked/gi,"");
			w.hdr.style.zIndex = 0;
			w.conf.parked = false;
			w.conf.tr_mode = "park";
			this._winCellSetOpacity(id, "open", ef);
			this._winSetSize(id, w.conf.w, w.conf.lastPH, (ef==true && this.conf.tr.prop!==false)); // adjust cont if trans not available
			if (!(ef == true && this.conf.tr.prop !== false)) {
				this._callMainEvent("onParkDown", id);
				if (w.conf.keep_in_vp) this._winAdjustPosition(id, w.conf.x, w.conf.y);
			}

		} else {
			// park
			w.conf.lastPH = w.conf.h;
			w.hdr.className += " dhxwin_hdr_parked";
			if (ef == false || this.conf.tr.prop == false) w.hdr.style.zIndex = 3; // no-trans
			w.conf.parked = true;
			w.conf.tr_mode = "park";
			this._winCellSetOpacity(id, "close", ef);
			this._winSetSize(id, w.conf.w, w.hdr.offsetHeight+this.conf.ofs_h, (ef==true && this.conf.tr.prop!==false)); // adjust cont if trans not available
			if (!(ef == true && this.conf.tr.prop !== false)) this._callMainEvent("onParkUp", id);
		}

		w = null;

	};
	_winCellSetOpacity(id, op, ef, mode) {
		var cell = this.w[id].cell;
		for (var a in cell.conf.idx) {
			if ({pr1:true,pr2:true}[a] != true) { // skip progress
				if (ef == true && this.conf.tr.prop != false) cell.cell.childNodes[cell.conf.idx[a]].style[this.conf.tr.prop] = this.conf.tr["op_"+op];
				cell.cell.childNodes[cell.conf.idx[a]].style.opacity = this.conf.tr["op_v_"+op];
			}
		}
		cell = null;
	};
	_winCellClearOpacity(id) {
		var cell = this.w[id].cell;
		for (var a in cell.conf.idx) {
			if ({pr1:true,pr2:true}[a] != true) { // skip progress
				if (this.conf.tr.prop != false) cell.cell.childNodes[cell.conf.idx[a]].style[this.conf.tr.prop] = "";
			}
		}
		cell = null;
	};
	_winStick(id, mode) {

		if (typeof(mode) != "undefined" && this.w[id].conf.sticked == mode) return; // already requested state

		this.w[id].conf.sticked = !this.w[id].conf.sticked;
		this.w[id].b.stick.setCss(this.w[id].conf.sticked?"sticked":"stick");

		this._winMakeActive(this.conf.last_active, true);
		if (this.w[id].conf.sticked) {
			this._callMainEvent("onStick", id);
		} else {
			this._callMainEvent("onUnStick", id);
		}
	};
	_winClose(id) {

		if (this._callMainEvent("onClose", id) !== true && this.conf.unloading != true) return;
		var w = this.w[id];

		if (w.conf.fs_mode) w.cell.setToFullScreen(false);
		if (w.conf.modal) this._winSetModal(id, false);

		// z-index clear
		window.dhx4.zim.clear(w.conf.z_id);

		// context menu
		if (this.cm != null && this.cm.icon[id] != null) {
			this._detachContextMenu("icon", id, null);
		}

		// header click/dblclick events
		w.win.removeEventListener("mousedown", this._winOnMouseDown, false);
		w.win.removeEventListener("mouseup", this._winOnMouseDown, false);
		if (this.conf.dblclick_ev){
			w.win.removeEventListener("dblclick", this._winOnMouseDown, false);
		}

		// buttons
		for (var a in w.b) this._winRemoveButton(id, a, true);
		w.b = null;

		// cell
		w.cell._unload();
		w.cell = null;

		// border
		w.brd.parentNode.removeChild(w.brd);
		w.brd = null;

		// covers
		if (w.fr_cover != null) {
			w.fr_cover.parentNode.removeChild(w.fr_cover);
			w.fr_cover = null;
		}
		if (w.fr_m_cover != null) {
			w.fr_m_cover.parentNode.removeChild(w.fr_m_cover);
			w.fr_m_cover = null;
		}

		// hdr
		w.hdr._isWinHdr = true;
		w.hdr.firstChild._isWinIcon = true;
		w.hdr.onselectstart = null;
		w.hdr.parentNode.removeChild(w.hdr);
		w.hdr = null;

		// conf
		for (var a in w.conf) {
			w.conf[a] = null;
			delete w.conf[a];
		}
		w.conf = null;

		// win
		w.win._idd = null;
		w.win._isWindow = null;
		w.win.parentNode.removeChild(w.win);
		w.win = null;

		w = null;
		this.w[id] = null;
		delete this.w[id];

		// activate topmost window
		if (!this.conf.unloading) this._winMakeActive(null, true);

	};
	_winSetModal(id, modal, removeCover) {

		if (this.w[id].conf.modal == modal) return; // already have specified modal state

		if (typeof(removeCover) == "undefined") removeCover = true;

		var w = this.w[id];

		if (modal == true && w.conf.modal == false) {

			// remove modality from prev window
			if (this.conf.last_modal != null) {
				this._winSetModal(this.conf.last_modal, false, false);
			}

			if (this.mcover == null) {

				// create a new one
				var d = document.createElement("DIV");
				d.className = "dhxwins_mcover";
				this.vp.insertBefore(d, w.fr_m_cover||w.win);
				this.mcover = {d:d};

				if (this.conf.fr_cover) {
					this.mcover.f = document.createElement("IFRAME");
					this.mcover.f.className = "dhxwins_mcover";
					this.mcover.f.border = 0;
					this.mcover.f.frameBorder = 0;
					this.vp.insertBefore(this.mcover.f,d);
				}

				d = null;

			} else if (this.mcover.d.nextSibling != (w.fr_m_cover||w.win)) {
				// move cover to place it before modal window
				this.vp.insertBefore(this.mcover.d, w.fr_m_cover||w.win);
				if (this.mcover.f != null) this.vp.insertBefore(this.mcover.f, this.mcover.d);
			}

			w.conf.modal = true;
			this.conf.last_modal = id;

			this._winMakeActive(id, true);

		} else if (modal == false && w.conf.modal == true) {

			// remove modality, clear cover

			w.conf.modal = false;
			this.conf.last_modal = null;

			if (removeCover && this.mcover != null) {
				for (var a in this.mcover) {

					this.vp.removeChild(this.mcover[a]);
					this.mcover[a] = null;
				}
				this.mcover = null;
			}

		}

		w = null;
	};
	_winMouseDownHandler(e, data) {

		var t = e.target||e.srcElement;

		if (e.button >= 2) return;

		if (data.mode == "button") {
			if (data.press_type == "mousedown") {
				this.conf.button_last = data.button_name;
			} else if ((data.press_type == "mouseup" && data.button_name == this.conf.button_last) || data.press_type == "MSPointerDown" || data.press_type == "pointerdown") {
				this.conf.button_last = null;
				if (this._winButtonClick(data.id, data.button_name, e) !== true) return;
			}
		}

		if ((data.press_type == "mousedown" || data.press_type == "dblclick") && data.mode == "hdr") {

			// dblclick
			this.conf.dblclick_active = false;
			if (this.conf.dblclick_ev == true) {
				// IE6, IE7, IE8 native dblclick event
				if (data.press_type == "dblclick") this.conf.dblclick_active = true;
			} else {

				if (this.conf.dblclick_last == null) {
					this.conf.dblclick_last = new Date().getTime();
					this.dblclick_id = data.id;
				} else {
					var t = new Date().getTime();
					if (this.conf.dblclick_last + this.conf.dblclick_tm > t && this.dblclick_id == data.id) {
						this.conf.dblclick_active = true;
						this.conf.dblclick_last = null;
						this.dblclick_id = null;
					} else {
						this.conf.dblclick_last = t;
						this.dblclick_id = data.id;
					}
				}
			}
			if (this.conf.dblclick_active) {
				this._winDoHeaderDblClick(data.id);
				return;
			}
		}

		// for all modes
		if (data.press_type == "mousedown") {
			this._winMakeActive(data.id);
		}

	};
	_winDoHeaderDblClick(id) {
		if (this.conf.dblclick_mode == "minmax") {
			this._winMinmax(id);
			return;
		}
		if (this.conf.dblclick_mode == "park") {
			this._winPark(id, true);
			return;
		}
		// use action if any
		if (typeof(this.conf.dblclick_mode) == "function") {
			this.conf.dblclick_mode.apply(window, [id]);
			return;
		}
		if (typeof(window[this.conf.dblclick_mode]) == "function") {
			window[this.conf.dblclick_mode].apply(window, [id]);
			return;
		}
	};
	_winAdjustCell(id) {

		var w = this.w[id];

		if (this.conf.skin == "material") {
			var x = 0;
			var y = (w.conf.header?w.hdr.offsetHeight:1);
			var width = w.win.clientWidth;
			var height = w.win.clientHeight-y;
		} else {
			var x = 1;
			var y = (w.conf.header?w.hdr.offsetHeight:1);
			var width = w.win.clientWidth-2;
			var height = w.win.clientHeight-y-1;
		}

		w.brd.style.left = x+"px";
		w.brd.style.top = y+"px";
		if (w.conf.brd == null) {
			w.brd.style.width = width+"px";
			w.brd.style.height = height+"px";
			w.conf.brd = {
				w: width-w.brd.offsetWidth,
				h: height-w.brd.offsetHeight
			};
		}
		w.brd.style.width = width+w.conf.brd.w+"px";
		w.brd.style.height = height+w.conf.brd.h+"px";

		var p = 5; // cell_cont position
		if (this.conf.skin == "material") p = 1;

		var x2 = 1+p;
		var y2 = (w.conf.header?y:y+p);
		var w2 = w.brd.clientWidth;
		var h2 = w.brd.clientHeight;

		w.cell._setSize(x2, y2, w2, h2);

		w.fr_cover.style.left = x2+"px";
		w.fr_cover.style.top = y2+"px";
		w.fr_cover.style.width = w2+"px";
		w.fr_cover.style.height = h2+"px";

		w = null;
	};
	_winAdjustTitle(id) {
		var icon = this.w[id].hdr.childNodes[0];
		var text = this.w[id].hdr.childNodes[1];
		var btns = this.w[id].hdr.childNodes[2];
		var x = (this.conf.skin=="material"?7:0);
		text.style.paddingLeft = icon.offsetWidth+12+x+"px";
		text.style.paddingRight = btns.offsetWidth+10+x+"px";
		text = btns = icon = null;
	};
	_callMainEvent(name, id) {
		var w = this.w[id];
		if (w.cell.checkEvent(name)) {
			var r = w.cell._callMainEvent(name, [w.cell]);
		} else {
			var r = this.callEvent(name, [w.cell]);
		}
		w = null;
		return r;
	};
	_winInitFRM(id) {
		if (this.conf.fr_cover != true) return;
		var w = this.w[id];
		var f = document.createElement("IFRAME");
		f.className = "dhxwin_main_fr_cover";
		f.border = 0;
		f.frameBorder = 0;
		f.style.zIndex = w.win.style.zIndex;
		w.win.parentNode.insertBefore(f, w.win);
		w.fr_m_cover = f;
		f = null;
	};
	_winAdjustFRMSize(id) {
		var w = this.w[id];
		if (w.fr_m_cover != null) {
			w.fr_m_cover.style.width = w.conf.w+"px";
			w.fr_m_cover.style.height = w.conf.h+"px";
		}
		w = null;
	};
	_winAdjustFRMPosition(id) {
		var w = this.w[id];
		if (w.fr_m_cover != null) {
			w.fr_m_cover.style.left = w.win.style.left;
			w.fr_m_cover.style.top = w.win.style.top;
		}
		w = null;
	};
	_winAdjustFRMZIndex(id) {
		var w = this.w[id];
		if (w.fr_m_cover != null) {
			w.fr_m_cover.style.zIndex = w.win.style.zIndex;
		}
		w = null;
	};
	_winButtonClick(id, button, ev) {

		if (!this.w[id].b[button].isEnabled()) return true;

		if (this.w[id].b[button]._doOnClick() !== true) return;

		if (button == "help") {
			this._callMainEvent("onHelp", id);
		}

		if (button == "park") {
			this._winPark(id, true);
		}

		if (button == "minmax") {
			this._winMinmax(id);
		}

		if (button == "stick") {
			this._winStick(id);
			return false;
		}

		if (button == "close") {
			this._winClose(id);
			return false;
		}
		return true; // allow default action
	};
	_winRemoveButton(wId, bId, winClosing) {
		this.w[wId].b[bId].unload(winClosing);
		this.w[wId].b[bId] = null;
		delete this.w[wId].b[bId];
	};
	_dndInitModule() {

		var that = this;

		this.conf.dnd_enabled = true;
		this.conf.dnd_tm = null;
		this.conf.dnd_time = 0; // 400 or 0

		this._dndOnMouseDown = function(e, id) {

			if (that.conf.dblclick_active) return;

			if (e.preventDefault) e.preventDefault(); else e.returnValue = false;

			if (that._callMainEvent("onBeforeMoveStart", id) !== true) return;


			that.conf.dnd = {
				id: id,
				x: that._dndPos(e,"X"),
				y: that._dndPos(e,"Y"),
				ready: true,
				css: false,
				css_touch: false,
				css_vp: false,
				tr: null,
				mode: "def", //"def" - move win, "tr" - for translate, "rect" - move rectange
				moved: false,
				prevent: false
			};

			if (that.w[id].conf.keep_in_vp) {
				that.conf.dnd.minX = 0;
				that.conf.dnd.maxX = that.vp.clientWidth-that.w[id].conf.w;
				that.conf.dnd.minY = 0;
				that.conf.dnd.maxY = that.vp.clientHeight-that.w[id].conf.h;
			} else {
				that.conf.dnd.minX = -that.w[id].conf.w+that.conf.vp_pos_ofs;
				that.conf.dnd.maxX = that.vp.clientWidth-that.conf.vp_pos_ofs;
				that.conf.dnd.minY = 0;
				that.conf.dnd.maxY = that.vp.clientHeight-that.conf.vp_pos_ofs;
			}

			var k = [
				"MozTransform",
				"WebkitTransform",
				"OTransform",
				"msTransform",
				"transform"
			];

			for (var q=0; q<k.length; q++) {
				if (document.documentElement.style[k[q]] != null && that.conf.dnd.tr == null) {
					that.conf.dnd.tr = k[q];
					that.conf.dnd.mode = "tr";
				}
			}

			// that.conf.dnd.mode = "def";
			// console.log("dnd ready, mode: "+that.conf.dnd.mode);

			if (that.conf.dnd.mode == "tr") {
				that.w[id].win.style[that.conf.dnd.tr] = "translate(0px,0px)";
				if (that.w[id].fr_m_cover != null) that.w[id].fr_m_cover.style[that.conf.dnd.tr] = that.w[id].win.style[that.conf.dnd.tr];
			}


			that._dndInitEvents();

		}

		this._dndOnMouseMove = function(e) {

			// dhtmlx.message({text: "a", expire: 100});
			e = e||event;

			var dnd = that.conf.dnd;

			var x = that._dndPos(e,"X")-dnd.x;
			var y = that._dndPos(e,"Y")-dnd.y;

			if (dnd.ready != true) return;

			var w = that.w[dnd.id];

			// dhtmlx.message({text:x+","+y,expire:100});

			if (e.preventDefault) e.preventDefault(); else e.returnValue = false;


			if (dnd.css != true) {
				if (dnd.css_touch == false) w.win.className += " dhxwin_dnd";
				w.fr_cover.className += " dhxwin_fr_cover_dnd";
				dnd.css = true;
			}
			if (dnd.css_vp != true) {
				that.vp.className += " dhxwins_vp_dnd";
				dnd.css_vp = true;
			}

			dnd.newX = w.conf.x+x;
			dnd.newY = w.conf.y+y;

			if (dnd.mode == "tr") {

				dnd.newX = Math.min(Math.max(dnd.newX, dnd.minX), dnd.maxX);
				x = dnd.newX-w.conf.x;

				dnd.newY = Math.min(Math.max(dnd.newY, dnd.minY), dnd.maxY);
				y = dnd.newY-w.conf.y;

				w.win.style[dnd.tr] = "translate("+x+"px,"+y+"px)";
				if (w.fr_m_cover != null) w.fr_m_cover.style[dnd.tr] = w.win.style[dnd.tr];

			} else {

				if (dnd.newX < dnd.minX || dnd.newX > dnd.maxX) {
					dnd.newX = Math.min(Math.max(dnd.newX, dnd.minX), dnd.maxX);
				} else {
					dnd.x = that._dndPos(e,"X");
				}

				if (dnd.newY < dnd.minY || dnd.newY > dnd.maxY) {
					dnd.newY = Math.min(Math.max(dnd.newY, dnd.minY), dnd.maxY);
				} else {
					dnd.y = that._dndPos(e,"Y");
				}

				that._winSetPosition(dnd.id, dnd.newX, dnd.newY);

			}

			dnd.moved = true;

			w = dnd = null;
		}

		this._dndOnMouseUp = function(e) {

			e = e||event;
			that._dndUnloadEvents();

			if (that.conf.dnd != null && that.conf.dnd.id != null) {

				var dnd = that.conf.dnd;
				var w = that.w[dnd.id];

				if (dnd.newX != null) {
					if (dnd.mode == "tr") {
						that._winSetPosition(dnd.id, dnd.newX, dnd.newY);
						w.win.style[dnd.tr] = "translate(0px,0px)";
						if (w.fr_m_cover != null) w.fr_m_cover.style[dnd.tr] = w.win.style[dnd.tr];
					}
				}
				if (dnd.css == true) {
					if (dnd.css_touch == false) w.win.className = String(w.win.className).replace(/\s{0,}dhxwin_dnd/gi,"");
					w.fr_cover.className = String(w.fr_cover.className).replace(/\s{0,}dhxwin_fr_cover_dnd/gi,"");
				}
				if (dnd.css_touch == true) {
					w.win.className = String(w.win.className).replace(/\s{0,}dhxwin_dnd_touch/gi,"");
				}
				if (dnd.css_vp == true) {
					that.vp.className = String(that.vp.className).replace(/\s{0,}dhxwins_vp_dnd/gi,"");
				}

				if (dnd.moved == true) {
					that._callMainEvent("onMoveFinish", dnd.id);
				} else {
					that._callMainEvent("onMoveCancel", dnd.id);
				}

				w = dnd = that.conf.dnd = null;

			}

		}

		this._dndOnSelectStart = function(e) {
			e = e||event;
			if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
			return false;
		}

		this._dndInitEvents = function() {
			if (typeof(window.addEventListener) == "function") {
				window.addEventListener("mousemove", this._dndOnMouseMove, false);
				window.addEventListener("mouseup", this._dndOnMouseUp, false);
				window.addEventListener("selectstart", this._dndOnSelectStart, false);
			} else {
				document.body.attachEvent("onmousemove", this._dndOnMouseMove);
				document.body.attachEvent("onmouseup", this._dndOnMouseUp);
				document.body.attachEvent("onselectstart", this._dndOnSelectStart);
			}
		}

		this._dndUnloadEvents = function() {
			if (typeof(window.addEventListener) == "function") {
				window.removeEventListener("mousemove", this._dndOnMouseMove, false);
				window.removeEventListener("mouseup", this._dndOnMouseUp, false);
				window.removeEventListener("selectstart", this._dndOnSelectStart, false);
			} else {
				document.body.detachEvent("onmousemove", this._dndOnMouseMove);
				document.body.detachEvent("onmouseup", this._dndOnMouseUp);
				document.body.detachEvent("onselectstart", this._dndOnSelectStart);
			}
		}

		this._dndUnloadModule = function() {

			this.detachEvent(this.conf.dnd_evid);
			this.conf.dnd_evid = null;

			this._dndOnMouseDown = null;
			this._dndOnMouseMove = null;
			this._dndOnMouseUp = null;
			this._dndOnSelectStart = null;
			this._dndInitEvents = null;
			this._dndUnloadEvents = null;
			this._dndInitModule = null;
			this._dndUnloadModule = null;

			that = null;
		}

		this._dndPos = function(ev, type) {
			var pos = ev[this.conf.dnd_ev_prefix+type];
			if ((pos == null || pos == 0) && ev.touches != null) pos = ev.touches[0][this.conf.dnd_ev_prefix+type];
			return pos;
		}

		this.conf.dnd_evid = this.attachEvent("_winMouseDown", function(e, data){

			if (this.w[data.id] == null || this.w[data.id].conf.allow_move != true) return;

			if (typeof(e.button) != "undefined" && e.button >= 2) return;



			this.conf.dnd_ev_prefix = "client";
			if (!(data.mode == "hdr" && e.type == "mousedown")) return;
			if (this.w[data.id].conf.maxed && this.w[data.id].conf.max_w == null && this.w[data.id].conf.max_h == null) return;

			if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
			this._dndOnMouseDown(e, data.id);
			return false;

		});

	};
	attachContextMenu(conf) {
		return this._renderContextMenu("icon", null, null, conf);
	};
	getContextMenu() {
		if (this.cm != null && this.cm.global != null) return this.cm.global;
		return null;
	};
	detachContextMenu() {
		this._detachContextMenu("icon", null, null);
	};
	_renderContextMenu(mode, wId, bId, conf) {

		var that = this;
		var firstInit = false;

		if (this.cm == null) {
			this.cm = {
				global:	null,	// global context menu for icon
				icon:	{},	// custom for icon, {winId:menuInst, winId2:menuInst2}
				button: {}	// custom foc button, {winId:{buttonId:menuInst, buttonId2:menuInst2}, winId2:{..}}
			};
			firstInit = true;
		}

		// check if already attached
		if (wId == null) {
			if (this.cm.global != null) return;
		} else if (mode == "icon") {
			if (this.cm.icon[wId] != null) return;
		} else if (mode == "button") {
			if (this.cm.button[wId] != null && this.cm.button[wId][bId] != null) return;
		}


		// init
		if (conf == null) conf = {};
		conf.parent = null;
		conf.context = true;

		var menu = new dhtmlXMenuObject(conf);
		menu.setAutoHideMode(false);

		menu.attachEvent("onShow", function() {
			this.conf.wins_menu_open = true;
		});

		menu.attachEvent("onHide", function() {
			this.conf.wins_menu_open = false;
			that.conf.opened_menu = null;
		});

		if (wId == null) {
			this.cm.global = menu;
		} else if (mode == "icon") {
			this.cm.icon[wId] = menu;
		} else if (mode == "button") {
			if (this.cm.button[wId] == null) this.cm.button[wId] = {};
			this.cm.button[wId][bId] = menu;
		}

		if (firstInit) {

			this._showContextMenu = function(e, data) {

				if (e.button >= 2) return;

				if (data.mode == "icon" && data.id != null && data.press_type == "mousedown") {

					var menu = this.cm.icon[data.id]||this.cm.global;
					if (menu == null) return;

					e.cancelBubble = true;

					var icon = this.w[data.id].hdr.firstChild;

					if (menu.conf.wins_menu_open && this.conf.opened_menu == data.id) {
						menu.hideContextMenu();
					} else {
						this._hideContextMenu();
						menu.showContextMenu(window.dhx4.absLeft(icon), window.dhx4.absTop(icon)+icon.offsetHeight);
						this.conf.opened_menu = data.id;
					}
					menu = icon = null;

				}

				if (data.mode == "button" && data.id != null && data.press_type == "mousedown") {

					if (this.cm.button[data.id] == null || this.cm.button[data.id][data.button_name] == null) return;

					e.cancelBubble = true;

					this.conf.button_last = null; // cancel button click

					var menu = this.cm.button[data.id][data.button_name];
					var button = this.w[data.id].b[data.button_name].button;

					if (menu.conf.wins_menu_open && this.conf.opened_menu == data.id) {
						menu.hideContextMenu();
					} else {
						this._hideContextMenu();
						menu.showContextMenu(window.dhx4.absLeft(button), window.dhx4.absTop(button)+button.offsetHeight);
						this.conf.opened_menu = data.id;
					}
					menu = button = null;

				}

			}

			this._hideContextMenu = function(e) {

				if (e != null) {
					e = e||event;
					if (e.type == "keydown" && e.keyCode != 27) return;

					var t = e.target||e.srcElement;
					var m = true;
					while (t != null && m == true) {
						if (t.className != null && t.className.search(/SubLevelArea_Polygon/) >= 0) {
							m = false;
						} else {
							t = t.parentNode;
						}
					}
				}

				if (m || e == null) {
					if (that.cm.global != null) that.cm.global.hideContextMenu();
					for (var a in that.cm.icon) {
						if (that.cm.icon[a] != null) that.cm.icon[a].hideContextMenu();
					}
					for (var a in that.cm.button) {
						for (var b in that.cm.button[a]) {
							if (that.cm.button[a][b] != null) that.cm.button[a][b].hideContextMenu();
						}
					}
				}

			}

			this._detachContextMenu = function(mode, wId, bId) {
				if (this.cm == null) return;
				if (wId == null) {
					if (this.cm.global != null) {
						this.cm.global.unload();
						this.cm.global = null;
					}
				} else if (mode == "icon") {
					if (this.cm.icon[wId] != null) {
						this.cm.icon[wId].unload();
						this.cm.icon[wId] = null;
					}
				} else if (mode == "button") {
					if (this.cm.button[wId] != null && this.cm.button[wId][bId] != null) {
						this.cm.button[wId][bId].unload();
						this.cm.button[wId][bId] = null;
					}
				}

			}

			this.attachEvent("_winMouseDown", this._showContextMenu);

			if (typeof(window.addEventListener) == "function") {
				window.addEventListener("mousedown", this._hideContextMenu, false);
				window.addEventListener("keydown", this._hideContextMenu, false);
			} else {
				document.body.attachEvent("onmousedown", this._hideContextMenu);
				document.body.attachEvent("onkeydown", this._hideContextMenu);
			}

			this._unloadContextMenu = function() {

				// remove only global menu if any, other will removed from win/button unload
				this._detachContextMenu("icon", null, null);
				this.cm = null;

				if (typeof(window.addEventListener) == "function") {
					window.removeEventListener("mousedown", this._hideContextMenu, false);
					window.removeEventListener("keydown", this._hideContextMenu, false);
				} else {
					document.body.detachEvent("onmousedown", this._hideContextMenu);
					document.body.detachEvent("onkeydown", this._hideContextMenu);
				}

				that = null;
			}

		}

		return menu;
	};
}


class dhtmlXWindowsCell extends XCellObject{
	constructor(id, wins) {
		super(id, "_wins")
		this.wins = wins;
		this.cell._winId = id;
		this.conf.skin = this.wins.conf.skin;

		this.attachEvent("_onCellUnload", function(){

			if (this._unloadResize) {
				this._unloadResize();
			}

			window.dhx4._eventable(this.cell, "clear");

			this.cell._winId = null;
			this.wins = null;

			this.setText = null;
			this.getText = null;
			this.allowMove = null;
			this.denyMove = null;
			this.isMovable = null;
			this.allowResize = null;
			this.denyResize = null;
			this.isResizable = null;
			this.maximize = null;
			this.minimize = null;
			this.isMaximized = null;
			this.setPosition = null;
			this.getPosition = null;
			this.adjustPosition = null;
			this.park = null;
			this.isParked = null;
			this.allowPark = null;
			this.denyPark = null;
			this.isParkable = null;
			this.show = null;
			this.hide = null;
			this.isHidden = null;
			this.stick = null;
			this.unstick = null;
			this.isSticked = null;
			this.setDimension = null;
			this.getDimension = null;
			this.setMinDimension = null;
			this.getMinDimension = null;
			this.setMaxDimension = null;
			this.getMaxDimension = null;
			this.keepInViewport = null;
			this.center = null;
			this.centerOnScreen = null;
			this.bringToTop = null;
			this.bringToBottom = null;
			this.isOnTop = null;
			this.isOnBottom = null;
			this.showHeader = null;
			this.hideHeader = null;
			this.setModal = null;
			this.isModal = null;
			this.close = null;

			this._adjustByCont = null;

			this.button = null;
			this.addUserButton = null;
			this.removeUserButton = null;

			that = null;
		});

		this.attachEvent("_onContentLoaded", function() {
			this.wins._callMainEvent("onContentLoaded", this._idd);
		});
		this.attachEvent("_onContentMouseDown", function(id,e) {
			this.wins.callEvent("_winMouseDown",[e,{id:id,mode:"win"}]);
		});

		this._callMainEvent = function(name, args) {
			return this.callEvent(name, args);
		}

		// open/close, check trans-effects

		this.conf.tr = {};
		for (var a in this.wins.conf.tr) this.conf.tr[a] = this.wins.conf.tr[a];

		if (this.conf.tr.prop != false) {
			/*
			 this.attachEvent("_onIdxUpdated", function(){
			 // if cell hidden - update opacity for menu/toolbar/status which attached to parked window
			 if (this.wins.w[this._idd].conf.parked) {
			 for (var a in this.conf.idx) {
			 if ({hdr:true,pr1:true,pr2:true}[a] != true) { // skip hdr and progress
			 this.wins._winCellSetOpacity(this._idd, "close", false);
			 }
			 }
			 }
			 });
			 */
		}


		if (this._initResize) this._initResize();

		// personal window events,
		// dhxWins.window(id).attachEvent()
		window.dhx4._eventable(this.cell);

		// adjustParentSize (for form)
		var that = this;
		this.cell.attachEvent("_setCellSize", function(w, h){
			var w0 = that.wins.w[this._winId].conf.w-that.conf.size.w;
			var h0 = that.wins.w[this._winId].conf.h-that.conf.size.h;
			that.setDimension(w+w0, h+h0);
		});

		return this;

	}
	setText(text) {
		this.wins.w[this._idd].conf.text = text;
		this.wins.w[this._idd].hdr.childNodes[1].firstChild.innerHTML = text;
	};
	getText() {
		return this.wins.w[this._idd].conf.text;
	};
	allowMove() {
		this.wins.w[this._idd].conf.allow_move = true;
	};
	denyMove() {
		this.wins.w[this._idd].conf.allow_move = false;
	};
	isMovable() {
		return (this.wins.w[this._idd].conf.allow_move == true);
	};
	allowResize() {
		this.wins.w[this._idd].conf.allow_resize = true;
		this.wins.w[this._idd].b.minmax.enable();
	};
	denyResize() {
		this.wins.w[this._idd].conf.allow_resize = false;
		this.wins.w[this._idd].b.minmax.disable();
	};
	isResizable() {
		return (this.wins.w[this._idd].conf.allow_resize == true);
	};
	maximize() {
		this.wins._winMinmax(this._idd, true);
	};
	minimize() {
		this.wins._winMinmax(this._idd, false);
	};
	isMaximized() {
		return (this.wins.w[this._idd].conf.maxed == true);
	};
	setPosition(x, y) {
		this.wins._winSetPosition(this._idd, x, y);
	};
	getPosition() {
		var w = this.wins.w[this._idd];
		var p = [w.conf.x,w.conf.y];
		w = null;
		return p;
	};
	adjustPosition() {
		this.wins._winAdjustPosition(this._idd);
	};
	park() {
		this.wins._winPark(this._idd, true); // with effect
	};
	isParked() {
		return (this.wins.w[this._idd].conf.parked == true);
	};
	allowPark() {
		this.wins.w[this._idd].conf.allow_park = true;
		this.wins.w[this._idd].b.park.enable();
	};
	denyPark() {
		this.wins.w[this._idd].conf.allow_park = false;
		this.wins.w[this._idd].b.park.disable();
	};
	isParkable() {
		return (this.wins.w[this._idd].conf.allow_park == true);
	};
	show(makeActive) {
		this.wins._winShow(this._idd, window.dhx4.s2b(makeActive));
	};
	hide() {
		this.wins._winHide(this._idd);
	};
	isHidden() {
		return (this.wins.w[this._idd].conf.visible != true);
	};
	stick() {
		this.wins._winStick(this._idd, true);
	};
	unstick() {
		this.wins._winStick(this._idd, false);
	};
	isSticked() {
		return (this.wins.w[this._idd].conf.sticked == true);
	};
	setDimension(width, height) {
		var w = this.wins.w[this._idd];
		if (w.conf.parked) this.wins._winPark(this._idd, false);
		if (w.conf.maxed) {
			if (width != null) w.conf.lastMW = width;
			if (height != null) w.conf.lastMH = height;
			this.wins._winMinmax(this._idd);
		} else {
			this.wins._winSetSize(this._idd, width, height, false, true);
		}
		w = null;
	};
	getDimension() {
		var w = this.wins.w[this._idd];
		var d = [w.conf.w, w.conf.h];
		w = null;
		return d;
	};
	setMinDimension(width, height) {
		var w = this.wins.w[this._idd];
		w.conf.min_w = width;
		w.conf.min_h = height;
		// parked and maxed will ajusted in _winSetSize
		this.wins._winSetSize(this._idd, w.conf.w, w.conf.h);
		w = null;
	};
	getMinDimension() {
		var w = this.wins.w[this._idd];
		var d = [w.conf.min_w, w.conf.min_h];
		w = null;
		return d;
	};
	setMaxDimension(width, height) {
		var w = this.wins.w[this._idd];
		w.conf.max_w = width;
		w.conf.max_h = height;
		// parked and maxed will ajusted in _winSetSize
		this.wins._winSetSize(this._idd, w.conf.w, w.conf.h);
		w = null;
	};
	getMaxDimension() {
		var w = this.wins.w[this._idd];
		var d = [w.conf.max_w, w.conf.max_h];
		w = null;
		return d;
	};
	keepInViewport(mode) {
		this.wins.w[this._idd].conf.keep_in_vp = window.dhx4.s2b(mode);
	};
	center() {

		var vp = this.wins.vp;
		var w = this.wins.w[this._idd];

		var x = Math.round((vp.clientWidth-w.conf.w)/2);
		var y = Math.round((vp.clientHeight-w.conf.h)/2);

		this.wins._winSetPosition(this._idd, x, y);
		vp = w = null;
	};
	centerOnScreen() {

		var w = this.wins.w[this._idd];
		var dim = window.dhx4.screenDim();

		// viewport correction
		var vx = window.dhx4.absLeft(this.wins.vp);
		var vy = window.dhx4.absTop(this.wins.vp);
		var k = this.wins.vp.parentNode;
		while (k != null) {
			if (k.scrollLeft) vx = vx-k.scrollLeft;
			if (k.scrollTop) vy = vy-k.scrollTop;
			k = k.parentNode;
		}

		var x = Math.round((dim.right-dim.left-w.conf.w)/2);
		var y = Math.round((dim.bottom-dim.top-w.conf.h)/2);

		this.wins._winAdjustPosition(this._idd, x-vx, y-vy);
		d = w = null;

	};
	bringToTop() {
		this.wins._winMakeActive(this._idd, true);
	};
	bringToBottom() {
		var actv = (this.wins.w[this._idd].conf.actv?null:this.wins.conf.last_active);
		window.dhx4.zim.clear(this.wins.w[this._idd].conf.z_id);
		this.wins.w[this._idd].win.style.zIndex = 0;
		this.wins._winMakeActive(actv, true);
	};
	isOnTop() {
		return (this.wins.w[this._idd].conf.actv == true);
	};
	isOnBottom() {
		var data = {id: null, z:+Infinity};
		for (var a in this.wins.w) {
			if (this.wins.w[a].conf.visible && this.wins.w[a].win.style.zIndex < data.z) {
				data.id = a;
				data.z = this.wins.w[a].win.style.zIndex;
			}
		}
		return (data.id==this._idd);
	};
	showHeader() {
		var w = this.wins.w[this._idd];
		if (w.conf.header == false) {
			w.hdr.className = String(w.hdr.className).replace(/\s{0,}dhxwin_hdr_hidden/gi,"");
			w.brd.className = String(w.brd.className).replace(/\s{0,}dhxwin_hdr_hidden/gi,"");
			this.conf.cells_cont = null; // reset saved borders
			w.conf.brd = null; // reset brd
			w.conf.header = true;
			this.wins._winAdjustCell(this._idd);
		}
		w = null;
	};
	hideHeader() {
		var w = this.wins.w[this._idd];
		if (w.conf.header == true) {
			if (w.conf.parked) this.wins._winPark(this._idd, false);
			w.hdr.className += " dhxwin_hdr_hidden";
			w.brd.className += " dhxwin_hdr_hidden";
			this.conf.cells_cont = null; // reset saved borders
			w.conf.brd = null; // reset brd
			w.conf.header = false;
			this.wins._winAdjustCell(this._idd);
		}
		w = null;
	};
	setModal(modal) {
		this.wins._winSetModal(this._idd, window.dhx4.s2b(modal));
	};
	isModal() {
		return (this.wins.w[this._idd].conf.modal==true);
	};
	_adjustByCont(w, h) {
		w += this.wins.w[this._idd].conf.w-this.conf.size.w;
		h += this.wins.w[this._idd].conf.h-this.conf.size.h;
		this.wins._winSetSize(this._idd, w, h);
	};
	close() {
		this.wins._winClose(this._idd);
	};
	setIconCss(css) {
		this.wins.w[this._idd].hdr.firstChild.className = "dhxwin_icon "+css;
		this.wins._winAdjustTitle(this._idd);
	};
	setToFullScreen(mode) {

		mode = window.dhx4.s2b(mode);

		var w = this.wins.w[this._idd];

		if (w.conf.fs_mode == mode) {
			w = null;
			return;
		}

		if (this.wins.fsn == null) {
			this.wins.fsn = document.createElement("DIV");
			this.wins.fsn.className = this.wins.vp.className+" dhxwins_vp_fs";
			document.body.appendChild(this.wins.fsn);
		}

		if (mode) {
			this.wins.fsn.appendChild(w.win);
			this.maximize();
			this.hideHeader();
		} else {
			this.wins.vp.appendChild(w.win);
			this.minimize();
			this.showHeader();

			if (this.wins.fsn.childNodes.length == 0) {
				this.wins.fsn.parentNode.removeChild(this.wins.fsn);
				this.wins.fsn = null;
			}
		}

		w.conf.fs_mode = mode;
		w = null;

	};
	button(id) {
		if (id == "minmax1" || id == "minmax2") { // deprecated
			// console.warn("windows: minmax1/minmax2 buttons are deprecated, from 4.0 there is single button minmax");
			id = "minmax";
		}
		return this.wins.w[this._idd].b[id];
	};
	addUserButton(id, pos, title) {
		var b = new dhtmlXWindowsButton(this.wins, this._idd, id, title, true);
		var n = null;
		var h = this.wins.w[this._idd].hdr.lastChild;
		if (isNaN(pos)) pos = 0; else if (pos < 0) pos = 0;
		if (h.childNodes[pos] != null) n = h.childNodes[pos];
		if (n != null) h.insertBefore(b.button, n); else h.appendChild(b.button);
		this.wins.w[this._idd].b[id] = b;
		b = n = h = null;
		this.wins._winAdjustTitle(this._idd);
	};
	removeUserButton(id) {
		if (this.wins.w[this._idd].b[id] == null || this.wins.w[this._idd].b[id].conf.custom != true) return;
		this.wins._winRemoveButton(this._idd, id);
	};
	attachContextMenu(conf) {
		return this.wins._renderContextMenu("icon", this._idd, null, conf);
	};
	getContextMenu() {
		if (this.wins.cm != null && this.wins.cm.icon[this._idd] != null) return this.wins.cm.icon[this._idd];
		return null;
	};
	detachContextMenu() {
		this.wins._detachContextMenu("icon", this._idd, null);
	};
	_initResize() {

		var that = this;
		var n = navigator.userAgent;

		this.conf.resize = {
			b_width: 6,
			c_type: false,
			btn_left:0
		};

		this._rOnCellMouseMove = function(e) {

			if (that.wins.conf.resize_actv == true || that.wins.w[that._idd].conf.allow_resize == false || that.conf.progress == true || that.wins.w[that._idd].conf.maxed == true || that.wins.w[that._idd].conf.fs_mode == true) {
				var k = that.wins.w[that._idd].brd;
				if (k.style.cursor != "default") k.style.cursor = "default";
				k = null;
				return;
			}


			e = e||event;

			var cont = that.wins.w[that._idd].brd;
			var r = that.conf.resize;

			var no_header = (that.wins.w[that._idd].conf.header==false);

			var x = e.clientX;
			var y = e.clientY;

			// body/html scrolls
			x += (document.documentElement.scrollLeft||document.body.scrollLeft||0);
			y += (document.documentElement.scrollTop||document.body.scrollTop||0);

			var x0 = window.dhx4.absLeft(cont);
			var y0 = window.dhx4.absTop(cont);

			var mode = "";
			if (x <= x0+r.b_width) { // left
				mode = "w";
			} else if (x >= x0+cont.offsetWidth-r.b_width) { // right
				mode = "e";
			}
			if (y >= y0+cont.offsetHeight-r.b_width) { // bottom
				mode = "s"+mode;
			} else if (no_header && y <= y0+r.b_width) { // top (only for no_header mode)
				mode = "n"+mode;
			}

			if (mode == "") mode = false;
			if (r.mode != mode) {
				r.mode = mode;
				if (mode == false) {
					cont.style.cursor = "default";
				} else {
					cont.style.cursor = mode+"-resize";
				}
			}

			cont = r = null;
		};

		this._rOnCellMouseDown = function(e) {

			e = e||event;
			if (typeof(e.button) != "undefined" && e.button != that.conf.resize.btn_left) return;

			if (that.conf.resize.mode == false) return;
			if (that.conf.progress == true) return; // if progress is on - deny
			if (that.wins.w[that._idd].conf.allow_resize == false) return;
			if (that.wins.w[that._idd].conf.fs_mode == true) return; // fullscreened window

			if (e.preventDefault) e.preventDefault(); else e.returnValue = false;

			if (that.wins._callMainEvent("onBeforeResizeStart", that._idd) !== true) return;

			var w = that.wins.w[that._idd];
			var r = that.conf.resize;

			that.wins.conf.resize_actv = true;

			r.min_w = w.conf.min_w;
			r.min_h = w.conf.min_h;
			r.max_w = w.conf.max_w||+Infinity;
			r.max_h = w.conf.max_h||+Infinity;

			// if layout attached - check custom min w/h
			if (w.cell.dataType == "layout" && w.cell.dataObj != null && typeof(w.cell.dataObj._getWindowMinDimension) == "function") {
				var t = w.cell.dataObj._getWindowMinDimension(w.cell);
				r.min_w = Math.max(t.w, r.min_w);
				r.min_h = Math.max(t.h, r.min_h);
			}

			r.vp_l = that.wins.conf.vp_pos_ofs;
			r.vp_r = that.wins.vp.clientWidth-that.wins.conf.vp_pos_ofs;
			r.vp_b = that.wins.vp.clientHeight-that.wins.conf.vp_pos_ofs;

			r.x = e.clientX;
			r.y = e.clientY;

			// start resize
			if (typeof(window.addEventListener) == "function") {
				window.addEventListener("mousemove", that._rOnWinMouseMove, false);
				window.addEventListener("mouseup", that._rOnWinMouseUp, false);
				window.addEventListener("selectstart", that._rOnSelectStart, false);
			} else {
				document.body.attachEvent("onmousemove", that._rOnWinMouseMove);
				document.body.attachEvent("onmouseup", that._rOnWinMouseUp);
				document.body.attachEvent("onselectstart", that._rOnSelectStart);
			}

			r.resized = false;

			r.vp_cursor = that.wins.vp.style.cursor;
			that.wins.vp.style.cursor = r.mode+"-resize";

			w = r = null;
		};

		this._rOnCellContextMenu = function(e) {
			e = e||event;
			if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
			return false;
		};

		this._rOnWinMouseMove = function(e) {

			// resize in progress
			e = e||event;

			var w = that.wins.w[that._idd];
			var r = that.conf.resize;

			if (!r.resized) {
				w.fr_cover.className += " dhxwin_fr_cover_resize";
				r.resized = true;
			}

			var x = e.clientX-r.x;
			var y = e.clientY-r.y;

			if (r.mode.indexOf("e") >= 0) { // right win side dragged

				r.rw = Math.min(Math.max(w.conf.w+x, r.min_w), r.max_w);
				r.rx = null;

				if (w.conf.x+r.rw < r.vp_l) { // check overflow to left
					r.rw = r.vp_l-w.conf.x;
				} else if (w.conf.x+r.rw > that.wins.vp.clientWidth) { // and right
					r.rw = that.wins.vp.clientWidth-w.conf.x;
				}

			} else if (r.mode.indexOf("w") >= 0) { // left win side dragged

				r.rw = Math.min(Math.max(w.conf.w-x,r.min_w),r.max_w);
				r.rx = w.conf.x+w.conf.w-r.rw;

				if (r.rx < 0) { // check overflow to left
					r.rw = r.rw+r.rx;
					r.rx = 0;
				} else if (r.rx > r.vp_r) { // and right
					r.rw = r.rw-r.vp_r;
					r.rx = r.vp_r;
				}

			}

			if (r.mode.indexOf("s") >= 0) { // bottom win side (can be together with left or right)

				r.rh = Math.min(Math.max(w.conf.h+y, r.min_h),r.max_h);
				r.ry = null;

				if (w.conf.y+r.rh > that.wins.vp.clientHeight) { // bottom overflow
					r.rh = that.wins.vp.clientHeight-w.conf.y;
				}

			} else if (r.mode.indexOf("n") >= 0) { // top win side (can be together with left or right) (only for no_header mode)

				r.rh = Math.min(Math.max(w.conf.h-y, r.min_h),r.max_h);
				r.ry = w.conf.y+w.conf.h-r.rh;

				if (r.ry < 0) { // top overflow
					r.rh = r.rh+r.ry;
					r.ry = 0;
				} else if (r.ry > r.vp_b) { // and bottom
					r.rh = r.rh-r.vp_b;
					r.ry = r.vp_b;
				}
			}

			that._rAdjustSizer();

			w = r = null;
		}
		this._rOnWinMouseUp = function() {

			// stop resize

			var r = that.conf.resize;
			var w = that.wins.w[that._idd];

			that.wins.conf.resize_actv = false;
			that.wins.vp.style.cursor = r.vp_cursor;

			w.fr_cover.className = String(w.fr_cover.className).replace(/\s{0,}dhxwin_fr_cover_resize/gi,"");

			if (r.resized) {
				that.wins._winSetSize(that._idd, r.rw, r.rh);
				if (r.rx == null) r.rx = w.conf.x;
				if (r.ry == null) r.ry = w.conf.y;
				if (r.rx != w.conf.x || r.ry != w.conf.y) that.wins._winSetPosition(that._idd, r.rx, r.ry);
			}

			if (r.obj != null) {
				r.obj.parentNode.removeChild(r.obj);
				r.obj = null;
			}
			if (r.objFR != null) {
				r.objFR.parentNode.removeChild(r.objFR);
				r.objFR = null;
			}

			if (typeof(window.addEventListener) == "function") {
				window.removeEventListener("mousemove", that._rOnWinMouseMove, false);
				window.removeEventListener("mouseup", that._rOnWinMouseUp, false);
				window.removeEventListener("selectstart", that._rOnSelectStart, false);
			} else {
				document.body.detachEvent("onmousemove", that._rOnWinMouseMove);
				document.body.detachEvent("onmouseup", that._rOnWinMouseUp);
				document.body.detachEvent("onselectstart", that._rOnSelectStart);
			}

			if (r.resized == true) {
				if (that.dataType == "layout" && that.dataObj != null) that.dataObj.callEvent("onResize",[]); // deprecated, 3.6 compat
				that.wins._callMainEvent("onResizeFinish", that._idd);
			} else {
				that.wins._callMainEvent("onResizeCancel", that._idd);
			}

			r.mode = "";

			w = r = null;
		}

		this._rOnSelectStart = function(e) {
			e = e||event;
			if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
			return false;
		}

		this._rInitSizer = function() {

			var r = that.conf.resize;
			var w = that.wins.w[that._idd];

			r.obj = document.createElement("DIV");
			r.obj.className = "dhxwin_resize";
			r.obj.style.zIndex = w.win.style.zIndex;
			r.obj.style.cursor = r.mode+"-resize";
			that.wins.vp.appendChild(r.obj);

			if (that.wins.conf.fr_cover == true) {
				r.objFR = document.createElement("IFRAME");
				r.objFR.className = "dhxwin_resize_fr_cover";
				r.objFR.style.zIndex = r.obj.style.zIndex;
				that.wins.vp.insertBefore(r.objFR, r.obj);
			}

			r.rx = w.conf.x;
			r.ry = w.conf.y;
			r.rw = w.conf.w;
			r.rh = w.conf.h;
			r = null;
		}

		this._rAdjustSizer = function() {
			var r = that.conf.resize;
			if (!r.obj) this._rInitSizer();
			// dim
			r.obj.style.width = r.rw+"px";
			r.obj.style.height = r.rh+"px";

			// pos, optional
			if (r.rx != null) r.obj.style.left = r.rx+"px";
			if (r.ry != null) r.obj.style.top = r.ry+"px";

			if (r.objFR != null) {
				r.objFR.style.width = r.obj.style.width;
				r.objFR.style.height = r.obj.style.height;
				if (r.rx != null) r.objFR.style.left = r.obj.style.left;
				if (r.ry != null) r.objFR.style.top = r.obj.style.top;
			}

			r = null;
		}

		if (typeof(window.addEventListener) == "function") {
			this.wins.w[this._idd].brd.addEventListener("mousemove", this._rOnCellMouseMove, false);
			this.wins.w[this._idd].brd.addEventListener("mousedown", this._rOnCellMouseDown, false);
			this.wins.w[this._idd].brd.addEventListener("contextmenu", this._rOnCellContextMenu, false);
		} else {
			this.wins.w[this._idd].brd.attachEvent("onmousemove", this._rOnCellMouseMove);
			this.wins.w[this._idd].brd.attachEvent("onmousedown", this._rOnCellMouseDown);
			this.wins.w[this._idd].brd.attachEvent("oncontextmenu", this._rOnCellContextMenu);
		}

		this._unloadResize = function() {

			if (typeof(window.addEventListener) == "function") {
				this.wins.w[this._idd].brd.removeEventListener("mousemove", this._rOnCellMouseMove, false);
				this.wins.w[this._idd].brd.removeEventListener("mousedown", this._rOnCellMouseDown, false);
				this.wins.w[this._idd].brd.removeEventListener("contextmenu", this._rOnCellContextMenu, false);
			} else {
				this.wins.w[this._idd].brd.detachEvent("onmousemove", this._rOnCellMouseMove);
				this.wins.w[this._idd].brd.detachEvent("onmousedown", this._rOnCellMouseDown);
				this.wins.w[this._idd].brd.detachEvent("oncontextmenu", this._rOnCellContextMenu);
			}

			this._initResize = null;
			this._rOnCellMouseMove = null;
			this._rOnCellMouseDown = null;
			this._rOnWinMouseMove = null;
			this._rOnWinMouseUp = null;
			this._rOnSelectStart = null;
			this._rInitSizer = null;
			this._rAdjustSizer = null;
			this._unloadResize = null;

			this.conf.resize = null;
			that = null;
		};

	};
}

window.dhtmlXWindowsButton = function(wins, winId, name, title, custom) {

	this.conf = {
		wins: wins,
		winId: winId,
		name: name,
		enabled: true,
		visible: true,
		custom:  true
	};

	this.button = document.createElement("DIV");
	this.button._buttonName = name;
	this.button.title = title;

	this.enable = function() {
		this.conf.enabled = true;
		this.setCss(this.conf.css);
	}
	this.disable = function() {
		this.conf.enabled = false;
		this.setCss(this.conf.css);
	}
	this.isEnabled = function() {
		return (this.conf.enabled==true);
	}
	//
	this.show = function() {
		this.button.style.display = "";
		this.conf.visible = true;
		this.conf.wins._winAdjustTitle(this.conf.winId);
	}
	this.hide = function() {
		this.button.style.display = "none";
		this.conf.visible = false;
		this.conf.wins._winAdjustTitle(this.conf.winId);
	}
	this.isHidden = function() {
		return (this.conf.visible==false);
	}
	//
	this.setCss = function(css) {
		this.conf.css = css;
		var dis = (this.conf.enabled?"":"_dis");
		this.button.className = "dhxwin_button"+dis+" dhxwin_button_"+this.conf.css+dis;
	}

	this._doOnClick = function(ev) {
		return this.callEvent("onClick", [this.conf.wins.w[this.conf.winId].cell, this]);
	}

	this.unload = function(winClosing) {
		//
		dhx4._eventable(this, "clear");
		this.button._buttonName = null;
		this.button.parentNode.removeChild(this.button);

		// context context menu if any
		if (this.conf.wins.cm != null && this.conf.wins.cm.button[this.conf.winId] != null && this.conf.wins.cm.button[this.conf.winId][this.conf.name] != null) {
			this.conf.wins._detachContextMenu("button", this.conf.winId, this.conf.name);
		}

		this.button = null;
		this.enable = null;
		this.disable = null;
		this.isEnabled = null;
		this.show = null;
		this.hide = null;
		this.isHidden = null;
		this.setCss = null;
		this.unload = null;
		//
		if (winClosing != true) this.conf.wins._winAdjustTitle(this.conf.winId);
		//
		this.conf.wins = null;
		this.conf.winId = null;
		this.conf = null;

	}

	this.setCss(name);
	dhx4._eventable(this);

	return this;
};
