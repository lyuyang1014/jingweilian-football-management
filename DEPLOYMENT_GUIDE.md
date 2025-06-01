# 京蔚联足球队管理系统 - 部署指南

## 为什么不能部署到Squarespace？

你的项目是一个**动态Node.js应用**，包含服务器端逻辑和API，而Squarespace只支持静态网站。

## 推荐部署方案：Vercel

Vercel是最适合你项目的平台，原因：
- ✅ **免费**：慷慨的免费额度
- ✅ **简单**：一键部署
- ✅ **快速**：全球CDN加速
- ✅ **可靠**：99.9%可用性
- ✅ **域名**：可绑定自定义域名

## 步骤1：准备GitHub仓库

### 1.1 初始化Git仓库
```bash
git init
git add .
git commit -m "Initial commit"
```

### 1.2 创建GitHub仓库
1. 访问 [github.com](https://github.com)
2. 点击右上角 "+" → "New repository"
3. 仓库名：`jingweilian-football-management`
4. 设为Public（免费部署需要）
5. 点击 "Create repository"

### 1.3 推送代码
```bash
git remote add origin https://github.com/你的用户名/jingweilian-football-management.git
git branch -M main
git push -u origin main
```

## 步骤2：部署到Vercel

### 2.1 注册Vercel账号
1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Sign up"
3. 选择 "Continue with GitHub"（推荐）

### 2.2 导入项目
1. 登录后点击 "New Project"
2. 选择你的GitHub仓库
3. 点击 "Import"

### 2.3 配置项目
- **Project Name**: `jingweilian-football`
- **Framework Preset**: Other
- **Root Directory**: `.` (保持默认)
- **Build Command**: 留空
- **Output Directory**: 留空
- **Install Command**: `npm install`

### 2.4 部署
1. 点击 "Deploy"
2. 等待2-3分钟部署完成
3. 获得类似 `https://jingweilian-football-xxx.vercel.app` 的地址

## 步骤3：绑定自定义域名（可选）

### 3.1 在Vercel中添加域名
1. 进入项目设置页面
2. 点击 "Domains" 标签
3. 输入你的域名（如：`football.yourdomain.com`）
4. 点击 "Add"

### 3.2 配置DNS
根据Vercel提供的信息，在你的域名管理面板添加：
```
Type: CNAME
Name: football (或你想要的子域名)
Value: cname.vercel-dns.com
```

## 步骤4：在Squarespace中添加链接

虽然不能直接部署，但你可以在Squarespace网站中：

### 4.1 创建导航链接
1. 在Squarespace编辑器中
2. 添加导航菜单项
3. 链接到你的Vercel地址
4. 设置为在新窗口打开

### 4.2 嵌入功能页面
使用iframe嵌入特定功能：
```html
<iframe src="https://your-app.vercel.app/formation_analyzer.html" 
        width="100%" 
        height="800px" 
        frameborder="0">
</iframe>
```

## 其他部署选项

### Netlify
1. 访问 [netlify.com](https://netlify.com)
2. 拖拽项目文件夹到部署区域
3. 自动部署完成

### Railway
1. 访问 [railway.app](https://railway.app)
2. 连接GitHub仓库
3. 自动检测Node.js项目并部署

### Heroku
1. 访问 [heroku.com](https://heroku.com)
2. 创建新应用
3. 连接GitHub仓库
4. 启用自动部署

## 故障排除

### 常见问题

**Q: 部署后页面显示错误**
A: 检查server.js中的端口配置：
```javascript
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`服务器运行在端口 ${port}`);
});
```

**Q: 静态文件无法访问**
A: 确保server.js中有静态文件服务：
```javascript
app.use(express.static('.'));
```

**Q: API调用失败**
A: 检查API路径是否正确，确保相对路径使用正确。

### 部署检查清单

- ✅ 项目已推送到GitHub
- ✅ package.json配置正确
- ✅ vercel.json配置文件存在
- ✅ 所有依赖已安装
- ✅ 端口配置支持环境变量
- ✅ 静态文件路径正确

## 成本估算

### Vercel（推荐）
- 免费额度：每月100GB带宽，无限部署
- Pro版：$20/月（如需更多资源）

### Netlify
- 免费额度：每月100GB带宽，300分钟构建时间
- Pro版：$19/月

### Railway
- 免费额度：500小时/月运行时间
- Pro版：$5/月起

## 联系支持

如果在部署过程中遇到问题：

1. **Vercel文档**：[vercel.com/docs](https://vercel.com/docs)
2. **GitHub Issues**：在项目仓库中创建issue
3. **社区支持**：Vercel Discord社区

---

## 快速部署命令

```bash
# 1. 克隆并准备项目
git clone 你的仓库地址
cd jingweilian-football-management
npm install

# 2. 安装Vercel CLI（可选）
npm i -g vercel

# 3. 一键部署
vercel

# 4. 设置生产环境
vercel --prod
```

部署完成后，你将获得一个专业的在线足球队管理系统！🎉 