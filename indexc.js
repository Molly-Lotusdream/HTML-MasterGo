mg.showUI(__html__);

mg.ui.onmessage = (msg) => {
  let list = msg;
  let child = [];

  // 创建各个节点
  function erg(id) {
    child.push({
      pid: id,
    });
    // 记录子节点
    let childnode = [];
    let j = 0;
    // 寻找子节点
    for (var i = list.length - 1; i >= id; i--) {
      let item = list[i];
      if (item.pid == id) {
        let nodeinfo = item.nodeinfo;
        let cssinfo = item.cssinfo;
        // 根节点不为容器
        if (nodeinfo.lastElementChild == "null") {
          // 创建文本图层
          if (
            nodeinfo.nodeName == "SPAN" ||
            nodeinfo.nodeName == "DIV" ||
            nodeinfo.nodeName == "P" ||
            nodeinfo.nodeName == "A"
          ) {
            async function someActions() {
              const fonts = await mg.listAvailableFontsAsync();
              await mg.loadFontAsync(fonts[0].fontName);

              node0.characters = nodeinfo.text;
              const newFills = clone(node0.fills);

              // 文本rgba
              newFills[0].color.r = parseInt(cssinfo.r) / 255;
              newFills[0].color.g = parseInt(cssinfo.g) / 255;
              newFills[0].color.b = parseInt(cssinfo.b) / 255;
              newFills[0].color.a = parseFloat(cssinfo.a);

              // 文本fontsize
              if (parseInt(cssinfo.fontsize) < 12) {
                cssinfo.fontsize = 10;
              } else if (parseInt(cssinfo.fontsize) < 14) {
                cssinfo.fontsize = 12;
              } else if (parseInt(cssinfo.fontsize) < 18) {
                cssinfo.fontsize = 14;
              } else if (parseInt(cssinfo.fontsize) < 22) {
                cssinfo.fontsize = 18;
              } else if (parseInt(cssinfo.fontsize) < 32) {
                cssinfo.fontsize = 24;
              } else if (parseInt(cssinfo.fontsize) < 48) {
                cssinfo.fontsize = 36;
              } else if (parseInt(cssinfo.fontsize) < 68) {
                cssinfo.fontsize = 64;
              } else if (parseInt(cssinfo.fontsize) < 108) {
                cssinfo.fontsize = 72;
              } else if (parseInt(cssinfo.fontsize) < 200) {
                cssinfo.fontsize = 144;
              } else {
                cssinfo.fontsize = 288;
              }

              let end = node0.textStyles[0].end;
              node0.setRangeFontSize(0, end, parseInt(cssinfo.fontsize));
              // node0.setRangeFontName(0, end, {font.fontName.family, font.fontName.style});

              node0.fills = newFills;

              if(node0.name == "A"){
                node0.setRangeHyperlink(0, end, nodeinfo.href);
              }
            }
            let node0 = mg.createText();
            node0.name = nodeinfo.nodeName;
            someActions();
            item.nodeid = node0.id;
            childnode.push(node0);
          } else if (nodeinfo.nodeName == "BUTTON") {
          } else if (nodeinfo.nodeName == "INPUT") {
          } else if (nodeinfo.nodeName == "HR") {
            let node0 = mg.createLine();
            node0.name = nodeinfo.nodeName;
            item.nodeid = node0.id;
            childnode.push(node0);
          }
          //创建...
        } else {
          //创建容器
          let node = mg.createFrame(
            child.find((ele) => ele.pid == i).childnode
          );
          node.name = nodeinfo.nodeName;
          list[i].nodeid = node.id;
          childnode.push(node);
        }
        item.childno = ++j;
      }
    }
    //将子节点数组childnode添加到父节点的childnode属性中
    let result = child.find((ele) => ele.pid == id);
    let item = list.find((ele) => ele.id == result.pid);
    item.childnum = childnode.length;
    result.childnode = childnode;
  }

  for (var i = list.length - 1; i > 0; i--) {
    erg(i);
  }
  // 创建BODY容器
  let node = mg.createFrame(child.find((ele) => ele.pid == 1).childnode);
  node.name = "BODY";
  list[1].nodeid = node.id;

  // 创建对象函数
  function clone(val) {
    return JSON.parse(JSON.stringify(val));
  }

  // 遍历并绘制
  function traverse(node, lasttop,lastheight, lastleft, lastwidth) {
    let item = list.find((ele) => ele.nodeid == node.id);
    nodeinfo = item.nodeinfo;
    cssinfo = item.cssinfo;
    type = node.type;

    if (node.name != "BODY") {
      let basetop = parseInt(
        parseInt(list.find((ele) => ele.id == item.pid).cssinfo.height) /
          list.find((ele) => ele.id == item.pid).childnum
      );
      let baseleft = parseInt(
        parseInt(list.find((ele) => ele.id == item.pid).cssinfo.width) /
          list.find((ele) => ele.id == item.pid).childnum
      );
      // 处理auto

      if (node.name == "SPAN") {
        if (cssinfo.top == "auto") cssinfo.top = lasttop;
        if (cssinfo.height == "auto") cssinfo.height = parseInt(
          list.find((ele) => ele.id == item.pid).cssinfo.height
        );
        if (cssinfo.width == "auto") cssinfo.width = baseleft;
        if (cssinfo.left == "auto") cssinfo.left = lastleft + lastwidth;
      } else {
        if (cssinfo.top == "auto") cssinfo.top = lasttop + lastheight;
        if (cssinfo.height == "auto") cssinfo.height = basetop;
        if (cssinfo.width == "auto")
          cssinfo.width = parseInt(
            list.find((ele) => ele.id == item.pid).cssinfo.width
          );
        if (cssinfo.left == "auto") cssinfo.left = "0";
      }
    } else {
      if (cssinfo.top == "auto")
        cssinfo.top = -parseInt(parseInt(cssinfo.height) / 2);
      if (cssinfo.left == "auto")
        cssinfo.left = -parseInt(parseInt(cssinfo.width) / 2);
    }

    // 绘制节点WHXY
    if (type == "FRAME") {
      node.width = parseInt(cssinfo.width);
      node.height = parseInt(cssinfo.height);
      node.x = parseInt(cssinfo.left);
      node.y = parseInt(cssinfo.top);
    } else if (type == "TEXT") {
      node.width = parseInt(cssinfo.width);
      node.height = parseInt(cssinfo.height);
      node.x = parseInt(cssinfo.left);
      node.y = (parseInt(cssinfo.top) - parseInt(list.find((ele) => ele.id == item.pid).cssinfo.top));
    } else if (type == "LINE") {
      node.width = parseInt(
        list.find((ele) => ele.id == item.pid).cssinfo.width
      );
    }
    // ...
    if ("children" in node) {
      for (let i = node.children.length - 1; i >= 0; i--) {
        if (i == node.children.length - 1) {
          traverse(node.children[i], 0, 0, 0, 0);
        } else {
          traverse(
            node.children[i],
            parseInt(node.children[i + 1].y),
            parseInt(node.children[i + 1].height),
            parseInt(node.children[i + 1].x),
            parseInt(node.children[i + 1].width)
          );
        }
      }
    }
  }

  const page = mg.document.children[0];
  const frame = page.children[0];
  traverse(frame, 0, 0);
};
