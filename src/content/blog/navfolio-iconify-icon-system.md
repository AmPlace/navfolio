---
title: "Navfolio 图标系统配置说明：Iconify、Lucide 与 Simple Icons"
description: "说明 Navfolio 图标系统的改造方案、命名规则、查询方法、后台配置流程及故障排查。"
date: "2026-07-15"
draft: false
sticky: false
showHeroImage: false
tags:
  - Astro
  - Iconify
  - Navfolio
  - 前端
categories:
  - 建站记录
series:
  - Navfolio 部署与定制
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

本文记录 Navfolio 图标系统的改造方案与使用规范，供后续新增平台、维护配置和排查构建错误时查阅。

## 一、改造背景

原项目使用 Lucide 线框图标，并在 Icon.astro 中维护名称与组件的映射关系。该方案适用于邮件、日历、设置等功能图标，但不包含完整的品牌标志。微信、QQ、微博等平台只能使用聊天气泡、电视等通用图形代替。

直接引入 Simple Icons 可以解决品牌图标问题，但如果继续手工导入和映射，每新增一个平台仍需修改组件代码。

本次改造的目标如下：

- Lucide 负责功能图标；
- Simple Icons 负责品牌图标；
- 配置采用统一的“图标库:图标名”格式；
- 新增已安装图标库中的图标时，不再修改组件代码；
- 保留旧短名称兼容；
- 图标在构建阶段生成，不依赖运行时 CDN。

## 二、技术方案

项目使用 Astro Icon 读取本地安装的 Iconify 图标集合：

~~~bash
bun add astro-icon @iconify-json/lucide @iconify-json/simple-icons
~~~

astro.config.mjs 中注册 Astro Icon：

~~~js
import icon from 'astro-icon';

export default defineConfig({
  integrations: [
    ...astroPluginConfig.integrations,
    icon(),
    mdx(),
    sitemap(),
  ],
});
~~~

图标处理流程如下：

~~~text
site.toml 或 Sveltia CMS
  → Icon.astro 解析名称
  → astro-icon 读取本地图标集合
  → Astro 构建为内联 SVG
~~~

线上页面不会请求 Iconify 接口或图标 CDN，因此不受第三方服务和内容安全策略影响。

## 三、名称解析与兼容规则

Icon.astro 按以下规则解析名称：

1. 名称包含冒号时，按 Iconify 完整名称直接使用；
2. 名称不包含冒号时，先查询旧名称兼容表；
3. 兼容表中不存在时，默认按 Lucide 图标处理。

核心逻辑如下：

~~~astro
const resolvedName = name.includes(':')
  ? name
  : (legacyAliases[name] ?? `lucide:${name}`);
~~~

旧配置中的 wechat、github、mail 等短名称仍可使用，但新增配置应使用完整名称，例如：

~~~text
simple-icons:wechat
simple-icons:github
lucide:mail
lucide:calendar
~~~

完整名称可以明确图标来源，并避免不同图标库之间的同名冲突。

## 四、图标库使用规范

| 类型 | 图标库 | 示例 |
| --- | --- | --- |
| 网站功能、界面动作、普通事物 | Lucide | 邮件、搜索、日历、文件夹、设置 |
| 公司、产品、网站、社交平台 | Simple Icons | GitHub、微信、QQ、微博、哔哩哔哩 |

配置示例：

~~~toml
# 功能图标
icon = "lucide:compass"
icon = "lucide:mail"
icon = "lucide:camera"
icon = "lucide:gamepad-2"

# 品牌图标
icon = "simple-icons:github"
icon = "simple-icons:wechat"
icon = "simple-icons:telegram"
icon = "simple-icons:spotify"
~~~

两类图标均继承主题颜色和尺寸。Simple Icons 多为实心品牌轮廓，Lucide 为描边图标，两者结构不同；组件仅统一视觉尺寸和留白，不修改品牌造型。

## 五、当前品牌图标配置

| 平台 | 配置值 |
| --- | --- |
| GitHub | simple-icons:github |
| 微信 | simple-icons:wechat |
| QQ | simple-icons:qq |
| 微博 | simple-icons:sinaweibo |
| 小红书 | simple-icons:xiaohongshu |
| 知乎 | simple-icons:zhihu |
| 哔哩哔哩 | simple-icons:bilibili |
| X | simple-icons:x |

图标名称不一定与平台常用名称完全一致。例如微博的名称为 simple-icons:sinaweibo，不能写成 simple-icons:weibo。

## 六、查询与新增图标

图标查询入口为 [Iconify Icon Sets](https://icon-sets.iconify.design/)。

操作步骤：

1. 使用英文名称搜索平台或功能；
2. 确认图标所属集合；
3. 复制“前缀:图标名”格式的名称；
4. 填入 site.toml 或 Sveltia CMS 的“图标”字段；
5. 保存并等待 Vercel 完成构建。

常用集合：

- [Lucide](https://icon-sets.iconify.design/lucide/)
- [Simple Icons](https://icon-sets.iconify.design/simple-icons/)

Sveltia CMS 中的图标字段为普通字符串，无须增加下拉选项或修改后台代码。填写完整名称后，CMS 会将配置提交到 GitHub，并触发 Vercel 部署。

## 七、增加其他图标库

当前项目仅安装 Lucide 和 Simple Icons。使用其他 Iconify 集合前，必须安装对应的本地数据包。

例如使用 Material Design Icons：

~~~bash
bun add @iconify-json/mdi
~~~

安装并提交依赖文件后，可使用：

~~~toml
icon = "mdi:home"
~~~

仅填写 mdi:home 而不安装 @iconify-json/mdi，会导致构建阶段无法找到图标。新增依赖时必须同时提交 package.json 和 bun.lock，以满足 Vercel 的 frozen lockfile 检查。

## 八、故障排查

### 构建提示无法找到图标

检查图标名称是否拼写正确，以及对应的 @iconify-json 图标集合是否已安装。

### 配置正确但页面不显示

检查该链接的 tooltip。当前首页链接组件会隐藏 tooltip 为空的项目。

### 部署后仍显示旧图标

确认 Vercel 使用的提交已包含图标改造，并强制刷新浏览器缓存。

### 本地安装成功但 Vercel 安装失败

检查 package.json 与 bun.lock 是否同时提交。项目执行 bun install --frozen-lockfile，两者不一致会直接终止部署。

## 九、维护结论

后续维护遵循以下规则：

1. 功能图标使用 lucide:图标名；
2. 品牌图标使用 simple-icons:图标名；
3. 名称从 Iconify 图标集合页面复制，不使用猜测名称；
4. 新增其他集合时安装并提交对应的 @iconify-json 包；
5. 提交前执行生产构建，确认图标存在且内容配置有效。

本次改造将图标扩展方式由“修改组件并增加映射”调整为“查询图标并填写配置”。实现代码见 [本次 Git 提交](https://github.com/AmPlace/navfolio/commit/3a6ae7b)，相关组件说明见 [Iconify Astro 文档](https://iconify.design/docs/usage/svg/astro/)。
