>新版文档链接：[Parser插件文档](https://jin-yufeng.github.io/Parser)  

## 功能简介 ##
- 支持解析 `style` 标签中的全局样式  
  支持解析和匹配 `style` 标签中的样式 
  ``` html
  <parser :html="html" />
  ```
  ``` javascript
  data() {
    return {
      html: '<style>.a{font-style:italic}#b{font-weight:bold}p{text-align:center}</style>'
  	    +'<p><span class="a">Hello </span><span id="b">World!</span></p>'
    }
  }
  ```

- 支持自定义默认的标签样式  
  支持给各个标签设置默认的效果  
  示例（给表格设置默认的边框）：
  ```html
  <parser :html="html" :tag-style="tagStyle" />
  ```
  ```javascript
  data(){
    return {
      tagStyle:{
        table: 'border-collapse:collapse;border-top:1px solid gray;border-left:1px solid gray;',
        th: 'border-right:1px solid gray;border-bottom:1px solid gray;',
        td: 'border-right:1px solid gray;border-bottom:1px solid gray;'
      }
    }
  }
  ```

- 支持多资源加载  
  支持在 `video` 和 `audio` 标签中设置多个 `source` 标签，本插件将按顺序进行加载，若前面的链接无法播放，将自动切换下一个链接进行加载和播放，直到最后一个链接；可用于解决平台差异，最大程度避免无法播放
  ```html
  <video controls>
    <source src="demo1.mov" />
    <source src="demo2.webm" />
  </video>
  ```
  支持在 `picture` 标签中使用 `source` 标签，通过设置 `media` 属性可以给不同大小屏幕的设备设置不同的图片链接；若设置 `webp` 图片将只有 `android` 端采用，可用于兼容
  ```html
  <picture>
    <source media="(min-width:400px)" src="high-quality.jpg">
    <source media="(min-width:250px)" src="middle-quality.jpg">
    <!--webp 图片将只有 android 端采用-->
    <source src="xxx.webp">
    <img src="low-quality.jpg" />
  </picture>
  ```
 
更多功能可见：[功能介绍](https://jin-yufeng.github.io/Parser/#/)

## 使用方法 ##
```html
<jyf-parser :html="html" ref="article"></jyf-parser>
```
```javascript
import parser from "@/components/jyf-parser/jyf-parser"; // HBuilderX 2.5.5 及以上可以不需要
export default{
  // HBuilderX 2.5.5 及以上可以不需要
  components: {
    "jyf-parser": parser
  },
  data() {
    return {
      html: ''
    }
  },
  onReady() {
    // 方式 1
    this.html = '<div>Hello World!</div>';
    // 方式 2，一般来说性能更好
    this.$refs.article.setContent('<div>Hello World!</div>');
  }
}
```

- 组件属性  

  | 属性 | 类型 | 默认值 | 必填 | 说明 |
  |:----:|:----:|:----:|:----:|----|
  | html | String/Array | | 是 | 要显示的富文本数据，格式同 rich-text |
  | autopause | Boolean | true | 否 | 是否允许播放视频时自动暂停其他视频 |
  | autosetTitle | Boolean | true | 否 | 是否自动将 title 标签的内容设置到页面标题上 |
  | compress | Number | 0 | 否 | 压缩等级，可以选择是否移除 id 和 class |
  | domain | String |  | 否 | 主域名，设置后将对于图片地址将自动拼接主域名或协议名 |
  | gesture-zoom | Boolean | false | 否 | 是否开启双击缩放 |
  | lazy-load | Boolean | false | 否 | 是否开启图片懒加载 |
  | selectable | Boolean | false | 否 | 是否允许长按复制内容 |
  | show-with-animation | Boolean | false | 否 | 是否使用渐显动画 |
  | tag-style | Object | | 否 | 设置标签的默认样式 |
  | use-anchor | Boolean | false | 否 | 是否使用页面内锚点 |
  | use-cache | Boolean | false | 否 | 是否使用缓存，设置后将会把解析结果进行缓存，下次打开不用重复解析 |

- 事件  

  | 名称 | 触发 | 说明 |
  |:----:|----|----|
  | @parse | 解析完成时触发 | 返回解析结果（一个 nodes 数组，仅传入的 html 类型为 String 时会触发），可以对该结果进行自定义修改，将在渲染时生效 |
  | @load | dom 加载完成时触发 | 所有节点被添加到节点树中时触发，无返回值，可以调用 api |
  | @ready | 渲染完成时触发 | 返回 boundingClientRect 的查询结果（包含宽高、位置等信息），所有图片（除懒加载）加载完成时才会触发，图片较大时可能 **延时较长** |
  | @error | 出错时触发 | 返回一个 object，其中 source 是错误来源，errMsg 为错误信息，errCode 是错误代码（仅ad），target 包含出错标签的具体信息，context 是视频的 context 对象 |
  | @imgtap | 图片被点击时触发 | 返回一个 object，其中 src 是图片链接，ignore 是一个函数，在回调函数中调用将不进行预览；可用于阻挡 onShow 的调用 |
  | @imglongtap | 图片被长按时触发 | 返回一个 object，其中 src 是图片链接；可用于显示自定义菜单 |
  | @linkpress | 链接被点击时触发 | 返回一个 object，其中 href 是链接地址，ignore 是一个函数，在回调中调用将不自动跳转/复制；开发者可以在该回调中进行进一步操作，如下载文档和打开等 | 

- 立即体验  
  ![富文本插件](https://6874-html-foe72-1259071903.tcb.qcloud.la/md/md5.jpg?sign=9e6729ea9ccb15da6f3d301cd31a4f08&t=1572768042)   

更多信息可见：  
[文档地址](https://jin-yufeng.github.io/Parser)  
[Github链接](https://github.com/jin-yufeng/Parser)  

## 注意事项 ##
1. 本插件需要使用 `HBuilderX 2.2.5` 及以上版本进行编译  
2. 本插件通过组件递归的方式显示节点树，因此必须使用自定义组件模式编译（或 `v3`）  
3. 由于 `ad` 标签的特殊性，若需要使用文中广告，请自行到 `trees.vue` 中打开对应的注释    
4. 本插件支持小程序、`H5`、`APP`（不支持 `nvue`）端使用   
5. 百度小程序基础库版本 `3.60`（客户端版本 `11.9`）以下的可能无法正常显示  
6. 使用了 `colspan` 和 `rowspan` 的表格由于无法通过 `css` 模拟，将直接使用 `rich-text` 显示，其中的图片链接无法点击  

平台差异：
1. `a` 标签的效果：内部页面路径统一直接跳转；外链 `H5` 端直接打开；小程序端设置了 `app-id` 的可以跳转其他小程序，其余自动复制链接；`App` 端自动复制链接（建议跳转到 `webview` 页面，可参考示例项目），其中文档链接支持自动下载和打开  
2. 仅微信小程序、`QQ` 小程序、`APP`、`H5` 支持 `lazy-load` 属性  
3. 仅 `H5`、微信、`QQ`、头条小程序支持 `gesture-zoom` 属性  
4. `ad` 标签的 `id` 属性在 `app` 中是 `adpid`，微信、头条、`QQ` 小程序中是 `unit-id`，百度小程序中是 `apid`    
5. 支付宝小程序不支持 `autopause` 属性  
6. 仅微信小程序支持 `ruby`、`bdi`、`bdo` 标签及  
7. `H5` 端支持所有浏览器支持的标签，`APP(v3)` 支持 `iframe` 和 `embed` 标签  