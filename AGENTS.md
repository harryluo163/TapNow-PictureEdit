# TapNow-PictureEdit 项目文档

## 项目概述

TapNow-PictureEdit 是一个基于 Vue 3 和 Vue Flow 的 AI 工作流编辑器，专门为 TapNow 网站提供图片多角度和打光功能的 Vue 公共组件。该项目提供了一个可视化的节点编辑界面，允许用户通过拖拽、连接节点来创建图片处理工作流。

### 主要技术栈

- **前端框架**: Vue 3 (Composition API + TypeScript)
- **节点编辑器**: Vue Flow (@vue-flow/core, @vue-flow/background, @vue-flow/minimap)
- **状态管理**: Pinia
- **构建工具**: Vite
- **开发语言**: TypeScript
- **图标库**: Lucide Vue Next

### 项目架构

项目采用组件化架构，主要包含以下模块：

- **节点系统**: 支持多种自定义节点类型（图片节点、预览节点、设置节点等）
- **交互系统**: 右键菜单、拖拽连接、缩放控制
- **导航系统**: 小地图导航、视图适配、画布缩放
- **状态管理**: 使用 Pinia 管理全局状态（工具栏、面板显示等）

## 构建和运行

### 环境要求

- Node.js >= 20
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式

启动开发服务器，默认运行在 http://localhost:3000

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 预览生产构建

```bash
npm run preview
```

### 部署到 GitHub Pages

项目已配置 GitHub Actions 自动部署到 GitHub Pages：

1. 将代码推送到 `main` 分支
2. GitHub Actions 会自动触发构建和部署
3. 部署完成后访问：https://harryluo163.github.io/TapNow-PictureEdit/

也可以在 GitHub 仓库的 Actions 页面手动触发部署。

## 项目结构

```
TapNow-PictureEdit/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages 部署配置
├── src/
│   ├── components/
│   │   ├── bars/               # 工具栏组件
│   │   ├── menus/              # 菜单组件（右键菜单、添加节点菜单）
│   │   ├── nodes/              # 自定义节点组件
│   │   │   ├── ImageNode.vue   # 图片输入节点
│   │   │   ├── ImageOnlyNode.vue # 纯图片节点
│   │   │   ├── PreviewNode.vue # 预览节点
│   │   │   └── SettingsNode.vue # 设置节点
│   │   ├── panels/             # 面板组件
│   │   └── triggers/           # 触发器组件
│   ├── stores/
│   │   └── nodeStore.ts        # Pinia 状态管理
│   ├── App.vue                 # 主应用组件
│   ├── main.ts                 # 应用入口
│   └── style.css               # 全局样式
├── index.html                  # HTML 模板
├── package.json                # 项目配置和依赖
├── tsconfig.json               # TypeScript 配置
├── vite.config.ts              # Vite 配置
└── README.md                   # 项目说明
```

## 核心功能

### 1. 节点编辑器

基于 Vue Flow 的可视化节点编辑器，支持：
- 拖拽节点
- 连接节点创建工作流
- 自定义节点类型和样式
- 节点点击和悬停事件

### 2. 交互功能

- **右键菜单**: 在画布空白处右键显示菜单
- **节点添加**: 通过右键菜单添加新的图片节点
- **拖拽连接**: 连接不同节点创建工作流

### 3. 导航和控制

- **小地图导航**: 
  - 点击左下角定位图标按钮显示/隐藏小地图
  - 支持点击拖动导航
  - 支持在小地图上进行缩放操作
  
- **缩放控制**:
  - 缩放滑动条（范围：10% - 400%）
  - 鼠标滚轮缩放
  - 捏合手势缩放
  
- **视图适配**:
  - 点击适配视图按钮自动适配所有节点到视图中心

### 4. 状态管理

使用 Pinia 管理全局状态：
- `showToolbar`: 工具栏显示状态
- `activePanel`: 当前激活的面板（多角度或打光面板）
- `showMiniMap`: 小地图显示状态

## 开发约定

### TypeScript 严格模式

项目启用了 TypeScript 严格模式，包括：
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`

### 组件开发规范

1. **使用 Composition API**: 所有组件使用 `<script setup>` 语法
2. **TypeScript 支持**: 所有组件和函数使用 TypeScript 类型定义
3. **响应式数据**: 使用 `ref` 和 `computed` 进行响应式状态管理
4. **事件处理**: 明确定义事件处理器类型和参数

### 样式规范

1. **全局样式**: 定义在 `style.css` 中
2. **组件样式**: 使用 CSS 作用域或类名前缀避免冲突
3. **主题**: 项目使用深色主题，主色调为深灰色 (#050505)
4. **Vue Flow 自定义**: 通过 CSS 类名自定义 Vue Flow 组件样式

### Git 提交规范

建议使用语义化提交信息：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具链相关

## 已知问题

- 小地图面板位置需要调整 `left: 0` 才能正确显示在屏幕内
- 右键菜单位置计算基于视口坐标，可能在某些情况下需要调整

## 待办事项

- [ ] 添加单元测试
- [ ] 完善错误处理
- [ ] 优化性能（大量节点时的渲染）
- [ ] 添加更多节点类型
- [ ] 支持保存和加载工作流
- [ ] 添加撤销/重做功能

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目使用 MIT 许可证。

## 联系方式

- GitHub: https://github.com/harryluo163/TapNow-PictureEdit
- Issues: https://github.com/harryluo163/TapNow-PictureEdit/issues