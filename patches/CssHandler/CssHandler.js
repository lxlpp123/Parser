/*
  CssHandler 补丁包
  github：https://github.com/jin-yufeng/Parser
  docs：https://jin-yufeng.github.io/Parser
  author：JinYufeng
*/
const cfg = require('./config.js');
// 匹配 class
function matchClass(match, selector) {
  if (!match || !match.length || !selector || !selector.length) return false;
  if (match.length == 1 && selector.length == 1) return match[0] == selector[0];
  if (match.length < selector.length) return false;
  for (var i = selector; i--;) {
    var matched = false;
    for (var j = match.length; j--;)
      if (match[j] == selector[i]) matched = true;
    if (!matched) return false;
  }
  return true;
}
// 匹配样式
function matchStyle(match_name, match_class, match_id, selector) {
  if (selector == '*') return 0;
  var selector_name = selector.match(/^[^.#\s]+/);
  var selector_class = selector.match(/\.[^.#\s]+/g);
  var selector_id = selector.match(/#[^.#\s]+/);
  if (selector_id) {
    if (match_id == selector_id) {
      if ((selector_class && !matchClass(match_class, selector_class)) || (selector_name && match_name != selector_name[0])) return -1;
      else return 2;
    } else return -1;
  } else if (selector_class) {
    if (matchClass(match_class, selector_class)) {
      if (selector_name && match_name != selector_name[0]) return -1;
      else return 1;
    } else return -1;
  } else if (selector_name && match_name == selector_name[0]) return 0;
  return -1;
}
class CssHandler {
  constructor(tagStyle = {}, screenWidth) {
    this.screenWidth = screenWidth;
    this.styles = [];
    var styles = Object.assign({}, cfg.userAgentStyles);
    for (var item in tagStyle)
      styles[item] = (styles[item] ? styles[item] + ';' : '') + tagStyle[item];
    for (var key in styles) {
      this.styles.push({
        key,
        content: styles[key]
      })
    }
  }
  getStyle = data => parseCss(data, this.styles, this.screenWidth);
  match(name, attrs, ele) {
    var match_class = [];
    if (attrs.class) {
      var match = attrs.class.split(/\s+/);
      for (let i = match.length; i--;)
        match_class.unshift('.' + match[i]);
    }
    var matchedName = '',
      matchedClass = '',
      matchedId = '',
      key, flag = false; // 子选择器标识
    ele.i = [];
    ele.index = [];
    ele.pseudo = [];
    for (let i = 0, item; item = this.styles[i]; i++) {
      if (item.key[0] == '>') {
        key = item.key.substring(1);
        flag = true;
      } else {
        key = item.key;
        flag = false;
      }
      var matchRes = matchStyle(name, match_class, attrs.id ? '#' + attrs.id : '', key);
      if (matchRes != -1) {
        if (!Object.hasOwnProperty.call(item, 'index') || item.index == item.list.length - 1) {
          var matchAttr = true;
          if (item.attr) {
            for (var j = 0; j < item.attr.length; j++) {
              if (!Object.hasOwnProperty.call(item.attr[j], 'value')) {
                if (!Object.hasOwnProperty.call(attrs, item.attr[j].name)) matchAttr = false;
              } else if (attrs[item.attr[j].name] != item.attr[j].value) matchAttr = false;
            }
          }
          if (matchAttr) {
            if (item.pseudo) ele.pseudo.push(item);
            else if (matchRes == 0) matchedName += ';' + item.content;
            else if (matchRes == 1) matchedClass += ';' + item.content;
            else matchedId += ';' + item.content;
          }
        } else {
          ele.i.push(i);
          ele.index.push(item.index);
          item.index++;
          item.key = item.list[item.index];
        }
      }
      if (flag) {
        ele.i.push(i);
        ele.index.push(item.index);
        item.index--;
        item.key = item.list[item.index];
      }
    }
    if (!ele.i.length) {
      ele.i = void 0;
      ele.index = void 0;
    }
    if (!ele.pseudo.length)
      ele.pseudo = void 0;
    return matchedName + ';' + matchedClass + ';' + matchedId + ';';
  }
  pop(ele) {
    // 多层class匹配标记
    if (ele.i) {
      for (let i = 0; i < ele.i.length; i++) {
        var j = ele.i[i];
        this.styles[j].key = this.styles[j].list[ele.index[i]];
        this.styles[j].index = ele.index[i];
      }
      ele.i = void 0;
      ele.index = void 0;
    }
    // 伪类
    if (ele.pseudo) {
      for (let i = 0; i < ele.pseudo.length; i++) {
        var content;
        var style = ele.pseudo[i].content.replace(/content:([^;\n]*)/, ($, $1) => {
          // 转换 attr
          content = $1.replace(/attr\((.+?)\)/, ($, $1) => ele.attrs[$1.trim()] || '').replace(/\s*['"](.*?)['"]\s*/g, '$1')
            // 转换 \xxx
            .replace(/\\(\w{4})/, ($, $1) => String.fromCharCode(parseInt($1, 16)));
          return '';
        })
        var child = {
          name: 'span',
          attrs: {
            style
          },
          children: [{
            type: 'text',
            text: content
          }]
        }
        if (ele.pseudo[i].pseudo == 'before')
          ele.children.unshift(child);
        else
          ele.children.push(child);
      }
    }
  }
}

function parseCss(data, keys, screenWidth) {
  var info, j, i = 0;

  function ignore() {
    var floor = 1;
    for (var k = j + 1; k < data.length; k++) {
      if (data[k] == '{') floor++;
      else if (data[k] == '}')
        if (--floor == 0) break;
    }
    i = k + 1;
  }
  data = data.replace(/\/\*[\s\S]*?\*\//g, '');
  while (i < data.length) {
    j = data.indexOf('{', i);
    if (j == -1) break;
    var name = data.substring(i, j);
    if (name[0] == '@') {
      // @media 查询
      if (name.substring(0, 6) == '@media') {
        info = name.match(/\((.+?):(.+?)\)/);
        if (info && info[2].includes('px')) {
          var value = parseInt(info[2]);
          if ((info[1] == 'min-width' && screenWidth > value) || (info[1] == 'max-width' && screenWidth < value)) {
            i = j + 1;
            continue;
          }
          ignore();
        }
      } else
        ignore();
      continue;
    }
    name = name.trim();
    if (name[0] == '}') name = name.substring(1);
    if (name[0] != '.' && name[0] != '#' && name[0] != '[' && name[0] != '*' && !(name >= 'a' && name <= 'z') && !(name >= 'A' && name <= 'Z')) {
      ignore();
      continue;
    }
    var list = name.split(',')
    i = j + 1;
    j = data.indexOf('}', i);
    if (j == -1) break;
    var content = data.substring(i, j);
    i = j + 1;
    for (var k = 0; k < list.length; k++) {
      var item = {
        key: list[k].trim(),
        content
      }
      // 伪类
      if (item.key.includes(':')) {
        info = item.key.split(':');
        item.key = info[0].trim();
        item.pseudo = info.pop();
        if (item.pseudo != 'before' && item.pseudo != 'after') continue;
      }
      // 属性选择器
      if (item.key.includes('[')) {
        item.attr = [];
        item.key = item.key.replace(/\[(.+?)\]/g, ($, $1) => {
          if ($1.includes('=')) {
            info = $1.split('=');
            var value = info[1].trim();
            if ((value[0] == '"' && value[value.length - 1] == '"') || (value[0] == "'" && value[value.length - 1] == "'")) value = value.substring(1, value.length - 1);
            item.attr.push({
              name: info[0].trim(),
              value
            })
          } else
            item.attr.push({
              name: $1.trim()
            })
          return '';
        }).trim()
        if (!item.key) item.key = '*';
      }
      // 后代选择器
      if (item.key.includes(' ') || item.key.includes('>')) {
        var tmp = item.key.replace(/\s*>\s*/g, ' >').split(/\s+/);
        item.list = tmp;
        item.key = tmp[0];
        item.index = 0;
      }
      keys.push(item)
    }
  }
}
module.exports = CssHandler;