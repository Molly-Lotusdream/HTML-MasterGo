mg.showUI(__html__);

mg.ui.onmessage = (msg) => {
  let list = msg;
  let child = [];
  let svgNum = 0;

  // 创建对象函数
  function clone(val) {
    return JSON.parse(JSON.stringify(val));
  }

  // 绘制图层位置
  function createInfo(node, item) {
    let cssinfo = item.cssinfo;
    node.width = parseInt(cssinfo.width) + 0.1;
    node.height = parseInt(cssinfo.height) + 0.1;
    if (cssinfo.bka != "0" && node.type == 'TEXT') {
      node.x = 0;
      node.y = 0;
    } else {
      node.x =
        parseInt(cssinfo.left) -
        parseInt(list.find((ele) => ele.id == item.pid).cssinfo.left);
      node.y =
        parseInt(cssinfo.top) -
        parseInt(list.find((ele) => ele.id == item.pid).cssinfo.top);
    }
  }

  // 绘制容器背景色
  function createBackgroundColor(node, item) {
    let cssinfo = item.cssinfo;
    const newFills = clone(node.fills);
    newFills[0].color.r = parseInt(cssinfo.bkr) / 255;
    newFills[0].color.g = parseInt(cssinfo.bkg) / 255;
    newFills[0].color.b = parseInt(cssinfo.bkb) / 255;
    newFills[0].color.a = parseFloat(cssinfo.bka);
    node.fills = newFills;
  }

  // 绘制描边
  function createStroke(node, item) {
    let cssinfo = item.cssinfo;
    node.strokes = [
      {
        type: "SOLID",
        color: {
          r: parseInt(cssinfo.bdr) / 255,
          g: parseInt(cssinfo.bdg) / 255,
          b: parseInt(cssinfo.bdb) / 255,
          a: parseFloat(cssinfo.bda),
        },
      },
    ];
    node.strokeWeight = cssinfo.bdw;
  }
  // 绘制圆角
  function createRadius(node, item) {
    let cssinfo = item.cssinfo;
    basepx = cssinfo.width < cssinfo.height ? cssinfo.width : cssinfo.height;
    node.topLeftRadius = (cssinfo.borderTopLeftRadius / basepx).toFixed(2) * 90;
    node.topRightRadius =
      (cssinfo.borderTopRightRadius / basepx).toFixed(2) * 90;
    node.bottomLeftRadius =
      (cssinfo.borderBottomLeftRadius / basepx).toFixed(2) * 90;
    node.bottomRightRadius =
      (cssinfo.borderBottomRightRadius / basepx).toFixed(2) * 90;
  }

  // 绘制图片
  async function createImg(node, byteArray) {
    const imageHandle = await mg.createImage(byteArray);
    node.fills = [
      {
        type: "IMAGE",
        scaleMode: "FILL",
        imageRef: imageHandle.href,
      },
    ];
  }

  // 创建各个节点并绘制
  function traverse(id) {
    child.push({
      pid: id,
    });
    // 记录子节点
    let childnode = [];
    // 寻找子节点
    for (var i = list.length - 1; i >= id; i--) {
      let item = list[i];
      if (item.pid == id) {
        let nodeinfo = item.nodeinfo;
        let cssinfo = item.cssinfo;

        // 根节点不为容器
        if (nodeinfo.lastElementChild == "null" && nodeinfo.text != "") {
          // 创建文本图层
          if (nodeinfo.nodeName == "HR") {
            let node = mg.createLine();
            node.name = nodeinfo.nodeName;
            item.nodeid = node.id;
            createInfo(node, item);
            childnode.push(node);
          } else {
            // 对文本图层进行绘制
            async function someActions() {
              const fonts = await mg.listAvailableFontsAsync();
              await mg.loadFontAsync(fonts[0].fontName);
              node.characters = nodeinfo.text;
              const newFills = clone(node.fills);

              // 文本rgba
              newFills[0].color.r = parseInt(cssinfo.r) / 255;
              newFills[0].color.g = parseInt(cssinfo.g) / 255;
              newFills[0].color.b = parseInt(cssinfo.b) / 255;
              newFills[0].color.a = parseFloat(cssinfo.a);

              // 文本fontsize
              let end = node.textStyles[0].end;
              node.setRangeFontSize(0, end, parseInt(cssinfo.fontsize));
              // node.setRangeFontName(0, end, {font.fontName.family, font.fontName.style});

              node.fills = newFills;
              if (parseInt(cssinfo.fontweight) - 400 > 0) {
                node.strokes = [
                  {
                    type: "SOLID",
                    color: {
                      r: parseInt(cssinfo.r) / 255,
                      g: parseInt(cssinfo.g) / 255,
                      b: parseInt(cssinfo.b) / 255,
                      a: parseFloat(cssinfo.a),
                    },
                  },
                ];
                node.strokeAlign = "OUTSIDE";
                node.strokeWeight = (parseInt(cssinfo.fontweight) - 300) / 1000;
              }

              //超链接
              if (node.name == "A") {
                node.setRangeHyperlink(0, end, nodeinfo.href);
              }
              // 居中设置
              createInfo(node, item);
              if (cssinfo.textalign == "center") {
                node.textAlignHorizontal = "CENTER";
                node.textAlignVertical = "CENTER";
              }
            }
            let node = mg.createText();
            node.name = nodeinfo.nodeName;
            someActions();
            item.nodeid = node.id;
            if (cssinfo.bka != "0") {
              node.textAlignHorizontal = "CENTER";
              node.textAlignVertical = "CENTER";
              let nodeF = mg.createFrame([node]);
              nodeF.name = nodeinfo.nodeName;
              createInfo(nodeF, item);
              createBackgroundColor(nodeF, item);
              createRadius(nodeF, item);
              childnode.push(nodeF);
            } else {
              childnode.push(node);
            }
          }
          //创建...
        } else {
          //创建容器
          if (nodeinfo.nodeName == "SVG") {
            mg.createNodeFromSvgAsync(nodeinfo.outerHTML).then((node) => {
              node.name = nodeinfo.nodeName;
              item.nodeid = node.id;
              node.fills = [
                {
                  type: "SOLID",
                  color: {
                    r: parseInt(cssinfo.bkr) / 255,
                    g: parseInt(cssinfo.bkg) / 255,
                    b: parseInt(cssinfo.bkb) / 255,
                    a: parseFloat(cssinfo.bka),
                  },
                },
              ];

              let pNodeid = list.find((ele) => ele.id == item.pid).nodeid;
              if (pNodeid) {
                let pNode = mg.getNodeById(pNodeid);
                pNode.appendChild(node);
              } else {
                childnode.push(node);
              }
              createInfo(node, item);

              svgNum++;
              mg.commitUndo();
            });
          } else if (nodeinfo.nodeName == "IMG") {
            let arr = [];
            for (let i in nodeinfo.byteArray) {
              arr.push(nodeinfo.byteArray[i]);
            }
            let byteArray = Uint8Array.from(arr);
            let node = mg.createRectangle();
            createImg(node, byteArray);
            node.name = nodeinfo.nodeName;
            item.nodeid = node.id;
            createInfo(node, item);
            childnode.push(node);
          } else {
            let node = mg.createFrame(
              child.find((ele) => ele.pid == i).childnode
            );
            node.name = nodeinfo.nodeName;
            list[i].nodeid = node.id;
            createInfo(node, item);
            createBackgroundColor(node, item);
            if (cssinfo.bdw > 0) {
              createStroke(node, item);
            }
            createRadius(node, item);
            childnode.push(node);
          }
        }
      }
    }
    //将子节点数组childnode添加到父节点的childnode属性中
    let result = child.find((ele) => ele.pid == id);
    let item = list.find((ele) => ele.id == result.pid);
    item.childnum = childnode.length;
    result.childnode = childnode;
  }

  // 创建BODY容器
  function creatBody() {
    if (list[1].svgNum == svgNum) {
      let node = mg.createFrame(child.find((ele) => ele.pid == 1).childnode);
      node.name = "BODY";
      list[1].nodeid = node.id;
      createBackgroundColor(node, list[1]);
    } else {
      console.log(svgNum, list[1].svgNum);
      setTimeout(creatBody, 300);
    }
  }

  //创建图层
  for (var i = list.length - 1; i > 0; i--) {
    traverse(i);
  }

  // 等待svg全部创建
  setTimeout(creatBody, 300);
};
