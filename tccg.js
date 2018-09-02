"use strict"

var tccg = {};
(function () {
	tccg.util = {}; // 一些class写在这里面
	tccg.gui = {}; // gui相关操作
	tccg.runtime = {}; // 运行时候的数据储存
	tccg.runtime.stor = null;
	tccg.info = {}; // 一些数据

	// 储存
	tccg.util.storage = function () {
		let storage = this;
		this.items = [];

		// ops items
		this.addItem = function (item) {
			if (true != item.isItem)
				return;
			if (!storage.hasItem(item.key))
				storage.items.push(item);
		};
		this.removeItem = function (key) {
			for (let i = 0; i < storage.items.length; i++) {
				if (storage.items[i].key == key)
					storage.items.splice(i,1);
			}
		};
		this.removeItemById = function (id) {
			for (let i = 0; i < storage.items.length; i++) {
				if (storage.items[i].id == id)
					delete storage.items[i];
			}
		};
		this.hasItem = function (key) {
			for (let i = 0; i < storage.items.length; i++) {
				if (storage.items[i].key == key)
					return true;
			}
			return false;
		};
		this.hasItemById = function (id) {
			for (let i = 0; i < storage.items.length; i++) {
				if (storage.items[i].id == id)
					return true;
			}
			return false;
		};
		this.getItem = function (key) {
			for (let i = 0; i < storage.items.length; i++) {
				if (storage.items[i].key == key)
					return storage.items[i];
			}
			return null;
		};
		this.getItemById = function (id) {
			for (let i = 0; i < storage.items.length; i++) {
				if (storage.items[i].id == id)
					return storage.items[i];
			}
			return null;
		}

		// to html table
		this.toHtmlTable = function ()
		{
			let minCol = 99999;
			let maxCol = -99999;
			let minRow = 99999;
			let maxRow = -99999;
			for (let i = 0; i < storage.items.length; i++)
			{
				let itemThisTime = storage.items[i];
				if (itemThisTime.col > maxCol)
					maxCol = itemThisTime.col;
				if (itemThisTime.col < minCol)
					minCol = itemThisTime.col;
				if (itemThisTime.row > maxRow)
					maxRow = itemThisTime.row;
				if (itemThisTime.row < minRow)
					minRow = itemThisTime.row;
			}
			let betCol = maxCol - minCol; if (betCol <= 0) betCol = 1;
			let betRow = maxRow - minRow; if (betRow <= 0) betRow = 1;

			let table = "<table class='table' style='font-size:16px;width:" + betRow*150 + "px;height:" + betCol*150 +"px'>";
			table += "<thead>"+minCol+","+maxCol+","+minRow+","+maxRow+"</thead>";
			table += "<tbody>";
			// row 行 col 列
			for (let c = minCol; c <= maxCol; c++)
			{
				table += "<tr class='tableTR'>";
				for (let r = minRow; r <= maxRow; r++)
				{
					let itemThisTime = null;
					for (let i2 = 0; i2 < storage.items.length; i2++) {
						let itemTemp = storage.items[i2];
						if (itemTemp.col == c && itemTemp.row == r) {
							itemThisTime = itemTemp;
						}
					}
					
					//table += "" + itemThisTime.key;
					if (itemThisTime != null)
					{
						table += "<td class='tableTD' id='td_" + itemThisTime.col + "_" + itemThisTime.row + "' onclick='tccg.gui.tdClick(" + itemThisTime.col + ", " + itemThisTime.row + ")'>";
						table += itemThisTime.key;
					}
					else
					{
						table += "<td class='tableTD'>";
					}
					table += "</td>";
				}
				table += "</tr>";
			}
			table += "</tbody>";
			return table+"</table>";
		}
		this.toJavaCode = function ()
		{
			let ret = 'String cata="cata_id";\n';

			ret += 'final AspectList noneed=new AspectList();\n';

			for (let i = 0; i < tccg.runtime.stor.items.length; i++)
			{
				let itemThisTime = tccg.runtime.stor.items[i];
				ret += '(new ResearchItem("' + itemThisTime.key + '", cata, noneed, ' + itemThisTime.col + ', ' + itemThisTime.row + ', 0,\n\tnew ItemStack(Items.diamond)))\n';
				ret += '\t.registerResearchItem();\n';
			}
			//(new ResearchItem("DES_irisia", cata, noneed, col(0), row(0), 0,
			//	new ItemStack(Items.diamond)))
			//	.setAutoUnlock()
			//	.setPages(nopage)
			//	.registerResearchItem();

			return ret;
		}

		this.toInnerCode = function ()
		{
			return JSON.stringify(this.items);
		}
		this.fromInnerCode = function (innerCode)
		{
			this.items = [];
			this.items = JSON.parse(innerCode);
		}
		return this;
	};

	// class es
	tccg.util.nodeItemNull = function () {
		this.id = Date.now();
		this.key = "";
		this.parents = [];
		this.col = 0;
		this.row = 0;

		this.isItem = true;
		return this;
	};
	tccg.util.nodeItem = function (keyIn, colIn, rowIn)
	{
		this.id = Date.now();
		this.key = keyIn;
		this.parents = [];
		this.col = colIn;
		this.row = rowIn;

		this.isItem = true;
		return this;
	}

	// 面板
	tccg.util.views = [];
	tccg.util._init = function () {
		tccg.util.addView("main");
		tccg.util.addView("addItem");
		tccg.util.addView("editItem");
		tccg.util.addView("removeItem");
		tccg.util.addView("gen");
	}
	tccg.util.initViews = function (viewIds) {
		if (0 >= viewIds.length)
			return; 

		for (let i = 0; i < viewIds.length; i++) {
				tccg.util.views.push(viewIds[i]);
		}
	};
	tccg.util.showView = function (viewType) {

		let id_to_show = "view_" + viewType;
		let id_this_time;
		for (let i = 0; i < tccg.util.views.length; i++) {
			id_this_time = "view_"+tccg.util.views[i];

			if (id_to_show == id_this_time) {
				document.getElementById(id_this_time).style.display = "block";
			}
			else {
				document.getElementById(id_this_time).style.display = "none";
			}
		}
	};
	tccg.util.addView = function (viewType) {
		let panel = document.getElementById("views");
		panel.innerHTML += "<div id='view_" + viewType + "'>" + viewType + "</div>";
		tccg.util.views.push("view_" + viewType);
	};
	tccg.util.removeView = function (viewType) {
		document.getElementById("views").removeChild(
			document.getElementById("view_" + viewType)
		);
		let node_to_remove = "view_" + viewType;
		for (let i = 0; i < tccg.util.views.length; i++) {
			if (node_to_remove == tccg.util.views[i]) {
				delete tccg.util.views[i];
			}
		}
	};
	
	// guis
	tccg.gui.lastX = -9999;
	tccg.gui.lastY = -9999;
	tccg.gui.tdClick = function (x, y)
	{
		console.log("clicked : " + x + "," + y);
		try { document.getElementById("td_" + tccg.gui.lastX + "_" + tccg.gui.lastY).style["background-color"] = ""; } catch (e) {}
		tccg.gui.lastX = x;
		tccg.gui.lastY = y;
		document.getElementById("td_" + x + "_" + y).style["background-color"] = "gold";
	}
	tccg.gui.reShow = function () // 重新绘制表格
	{
		document.getElementById("view_main").innerHTML = tccg.runtime.stor.toHtmlTable();
	}
	tccg.gui.addItem = function ()
	{
		let name = document.getElementById("gui_addItemName").value;
		let x = document.getElementById("gui_addItemX").value;
		let y = document.getElementById("gui_addItemY").value;
		let nodeToAdd = new tccg.util.nodeItem(name, x, y);
		for (let i = 0; i < tccg.runtime.stor.items.length; i++)
		{
			let itemThisTime = tccg.runtime.stor.items[i];
			if (itemThisTime.col == x && itemThisTime.row == y)
			{
				alert("指定位置已经存在一个条目");
				return;
			}
			else if (itemThisTime.key == name)
			{
				alert("已经存在一个相同名称的条目");
				return;
			}
		}
		tccg.runtime.stor.addItem(nodeToAdd);
		tccg.gui.reShow();
		alert("添加成功");
		return;
	}
	tccg.gui.removeItem = function ()
	{
		console.log("lastX lastY : "+tccg.gui.lastX+","+tccg.gui.lastY);
		for (let i = 0; i < tccg.runtime.stor.items.length; i++)
		{
			let itemThisTime = tccg.runtime.stor.items[i];
			console.log("itemThisTime " + itemThisTime.col + "," + itemThisTime.row);
			console.log("本次 : " + (itemThisTime.col == tccg.gui.lastX));
			console.log("本次 : " + itemThisTime.row == tccg.gui.lastY);
			console.log("本次 : "+((itemThisTime.col == tccg.gui.lastX) && (itemThisTime.row == tccg.lastY)));
			if ((itemThisTime.col == tccg.gui.lastX) && (itemThisTime.row == tccg.gui.lastY))
			{	
				let name = itemThisTime.key;
				tccg.runtime.stor.removeItem(name);
				tccg.gui.lastY = tccg.gui.lastX = -9999;
				tccg.gui.reShow();
				alert("删除成功");
			}
		}
	}
	tccg.gui.editItem = function ()
	{
		//console.log("lastX:" + tccg.gui.lastX + " lastY:" + tccg.gui.lastY);
		for (let i = 0; i < tccg.runtime.stor.items.length; i++) {
			let itemThisTime = tccg.runtime.stor.items[i];
			//console.log("col: "+(itemThisTime.col == tccg.gui.lastX) +" , row: "+ (itemThisTime.row == tccg.lastY));
			if (itemThisTime.col == tccg.gui.lastX && itemThisTime.row == tccg.gui.lastY) {

				let nameNew= document.getElementById("gui_editItemName").value;
				let colNew= document.getElementById("gui_editItemX").value;
				let rowNew = document.getElementById("gui_editItemY").value;
				if (colNew == null || colNew == "")
					colNew = NaN;
				if (rowNew == null || rowNew == "")
					rowNew = NaN;

				for (let j = 0; j < tccg.runtime.stor.items.length; j++)
				{
					if (j == i) continue;
					let itemThisTime2 = tccg.runtime.stor.items[j];
					if (itemThisTime2.col == colNew && itemThisTime2.row == rowNew)
					{
						alert("指定的位置已经存在一个条目");
						return;
					}
					else if (itemThisTime2.key == nameNew)
					{
						alert("已经存在一个同名条目");
						return;
					}
				}

				if (0 < nameNew.length)
					itemThisTime.key = nameNew;
				if (colNew > -9999 && colNew < 9999)
					itemThisTime.col = colNew;
				if (rowNew > -9999 && rowNew < 9999)
					itemThisTime.row = rowNew;

				tccg.gui.reShow();
				alert("修改成功");
			}
		}
	}
	tccg.gui.gen = function ()
	{
		document.getElementById('view_gen').innerText = tccg.runtime.stor.toJavaCode();
		document.getElementById('view_gen').innerHTML = '<h3>导出为Java代码</h3><code>' + document.getElementById('view_gen').innerHTML + '</code>';
	}
	tccg.gui.genInner = function ()
	{
		document.getElementById('view_gen').innerText = tccg.runtime.stor.toInnerCode();
		document.getElementById('view_gen').innerHTML = '<h3>导出为中间码</h3>' + document.getElementById('view_gen').innerHTML;
	}
	tccg.gui.fromInner = function ()
	{
		let innerCode = document.getElementById('in_import_inner').value;
		tccg.runtime.stor.fromInnerCode(innerCode);
		tccg.gui.reShow();
	}
	tccg.gui.clearAll = function ()
	{
		tccg.runtime.stor.items = [];
		tccg.gui.reShow();
	}
	
	// demo
	tccg.demo = {};
	tccg.demo.genTable = function () {
		tccg.runtime.stor = new tccg.util.storage();
		tccg.runtime.stor.addItem(new tccg.util.nodeItem("item1", 1, 1));
		tccg.runtime.stor.addItem(new tccg.util.nodeItem("item2", 1, 2));
		tccg.runtime.stor.addItem(new tccg.util.nodeItem("item3", -1, -1));
		tccg.runtime.stor.addItem(new tccg.util.nodeItem("item4", 2, 2));
		tccg.runtime.stor.addItem(new tccg.util.nodeItem("item5", -1, 3));

		document.getElementById("view_main").innerHTML = tccg.runtime.stor.toHtmlTable();
	}
	
	// info
	tccg.info.shortname = "TCCG";
	tccg.info.fullname = "Thaumcraft Code Generator";
	tccg.info.version = "0.4.0";
	tccg.info.author = "Firok";
	tccg.info.link = "github.com/S2Lab";

	tccg.info.reShow = function ()
	{
		document.getElementById('header_logo').innerText = tccg.info.shortname;
		document.getElementById('info_fullname').innerText = tccg.info.fullname;
		document.getElementById('info_version').innerText = tccg.info.version;
		document.getElementById('info_author').innerText = '————'+tccg.info.author;
	}
})();
