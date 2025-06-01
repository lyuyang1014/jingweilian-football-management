# 京维联足球俱乐部管理系统

## 🚀 项目简介

这是一个现代化的足球俱乐部管理系统，提供球员管理、比赛分析、阵容分析、数据统计等功能。

## ✨ 主要功能

- **球员管理**：球员档案、技能评估、表现统计
- **比赛分析**：历史赛事回顾、比赛详情、战术分析
- **阵容分析**：智能阵容推荐、位置优化、战术板
- **数据统计**：进球榜、助攻榜、出勤率统计
- **可视化展示**：现代化UI、响应式设计

## 🔧 技术栈

- **后端**：Node.js + Express
- **前端**：HTML5 + CSS3 + JavaScript
- **数据处理**：CSV数据文件
- **部署**：支持Vercel、Railway、Glitch等平台

## 📦 安装与运行

### 本地开发

```bash
# 克隆项目
git clone https://github.com/lyuyang1014/jingweilian-football-management.git

# 进入项目目录
cd jingweilian-football-management

# 安装依赖
npm install

# 启动服务器
npm start

# 访问应用
打开浏览器访问: http://localhost:3000
```

### 可用脚本

- `npm start` - 启动生产环境服务器（简化版）
- `npm run dev` - 启动开发环境服务器（简化版）
- `npm run original` - 启动完整功能版本服务器

## 🌟 版本说明

### 简化版 (server_simple.js) - 推荐用于部署
- **优化兼容性**：使用ES5语法，兼容更多Node.js版本
- **减少复杂性**：移除复杂的阵容生成逻辑，提升稳定性
- **增强错误处理**：完善的try-catch错误捕获
- **部署友好**：专为云平台部署优化

### 完整版 (server.js) - 本地开发使用
- **高级功能**：完整的阵容分析、球员偏好、战术推荐
- **详细分析**：深度比赛分析、位置智能分配
- **丰富数据**：球员身价、MVP评分、合作网络分析

## 🚀 部署方式

### 1. Vercel 部署
```bash
# 连接GitHub仓库，自动部署
```

### 2. Railway 部署
```bash
# 从GitHub导入项目
```

### 3. Glitch 部署
```bash
# 从GitHub导入或手动上传文件
```

## 📊 数据文件

项目使用以下CSV数据文件：
- `2025member.csv` - 球员基本信息
- `activities.csv` - 活动记录
- `match_events.csv` - 比赛事件
- `match_participants.csv` - 比赛参与者
- `training_attendance.csv` - 训练出勤
- `goalkeepers.csv` - 门将专项数据

## 🎯 API接口

- `GET /api/players` - 获取球员列表
- `GET /api/matches` - 获取比赛列表
- `GET /api/match/:id` - 获取比赛详情
- `GET /api/player/:name` - 获取球员信息
- `GET /api/match-events` - 获取比赛事件数据
- `GET /api/training-attendance` - 获取训练出勤数据

## 🐛 问题解决

### 部署失败？
1. 检查Node.js版本（建议14.0.0+）
2. 确认所有数据文件已上传
3. 使用简化版服务器：`npm start`

### 数据加载问题？
1. 确认CSV文件格式正确
2. 检查文件编码（推荐UTF-8）
3. 查看服务器日志

## 📝 更新日志

### v1.1.0 (2024-12-28)
- ✅ 新增简化版服务器，提升部署稳定性
- ✅ 优化数据验证逻辑
- ✅ 增强错误处理机制
- ✅ 改进ES5兼容性

### v1.0.0 (2024-12-27)
- 🎉 初始版本发布
- ⚽ 完整的足球管理系统功能

## 📧 联系方式

- **项目地址**：https://github.com/lyuyang1014/jingweilian-football-management
- **问题反馈**：GitHub Issues

---

⚽ **京维联足球俱乐部管理系统** - 让足球管理更智能！ 