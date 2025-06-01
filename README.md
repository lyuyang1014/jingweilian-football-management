# 京蔚联足球队管理系统

## 项目简介

专业的足球队管理系统，包含球员信息管理、阵容分析、比赛历史回顾等功能。

## 🚀 部署状态

- **Vercel**: 已部署
- **状态**: 运行中
- **最后更新**: 2025-06-01

## 功能模块

### 🏆 阵容评分系统 (formation_analyzer.html)
- 支持多种比赛阵型（8人制/11人制）
- 智能位置适应性评估
- 专业球评风格分析
- 实时阵容统计

### 📊 数据分析面板
- 球员个人资料系统
- 比赛模拟器
- 训练出勤管理
- 历史数据分析

### 📋 比赛管理
- 历史赛事回顾
- 比赛数据统计
- 球员表现跟踪

## 部署说明

### 本地运行
```bash
npm install
npm start
```

### Vercel部署（推荐）

1. **准备代码**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **推送到GitHub**
   - 在GitHub创建新仓库
   - 推送代码到仓库

3. **Vercel部署**
   - 访问 [vercel.com](https://vercel.com)
   - 使用GitHub账号登录
   - 导入你的GitHub仓库
   - 点击Deploy

4. **访问网站**
   - 部署完成后获得 `.vercel.app` 域名
   - 可以绑定自定义域名

### 其他部署选项

- **Netlify**: 适合静态站点和serverless函数
- **Railway**: 简单的Node.js应用部署
- **Heroku**: 传统的云应用平台

## 技术栈

- **后端**: Node.js + Express
- **前端**: HTML5 + CSS3 + JavaScript
- **数据**: CSV文件存储
- **部署**: Vercel（推荐）

## 目录结构

```
├── server.js              # 主服务器文件
├── package.json           # 项目配置
├── vercel.json            # Vercel部署配置
├── display.html           # 主页
├── formation_analyzer.html # 阵容分析器
├── match_history.html     # 比赛历史
├── data/                  # 数据文件
├── images/               # 图片资源
└── docs/                 # 文档
```

## 数据文件

- `2025member.csv` - 球员基础信息
- `football_attributes.csv` - 球员能力属性
- `match_events.csv` - 比赛事件记录
- `position.md` - 位置要求说明

## 特色功能

- 🎯 智能阵容推荐
- 📈 专业数据分析
- 🏟️ 3D球场可视化
- 📱 响应式设计
- ⚡ 实时数据更新

## 访问地址

- 生产环境: 部署后的Vercel链接
- 本地开发: http://localhost:3000

---

© 2025 京蔚联足球队 - 让足球更专业 