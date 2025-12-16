# 周启航 - 全栈开发工程师

<table border="0" width="100%" style="margin-bottom: 20px;">
  <tr>
    <td width="70%" valign="top">
      <p style="line-height: 1.8; font-size: 15px;">
        <b>电话：</b>[请填写]<br>
        <b>邮箱：</b>[请填写]<br>
        <b>意向：</b>全栈开发工程师 / 前端开发工程师<br>
        <b>状态：</b>离职-随时到岗<br>
        <b>坐标：</b>[请填写城市]<br>
        <b>作品：</b><a href="https://www.morphix-ai.com/">Morphix AI</a> | <a href="https://veo-ai.site">VEO AI</a>
      </p>
    </td>
    <td width="30%" align="right" valign="top">
      <img src="zhou_qihang_photo.jpg" width="130" height="160" style="object-fit: cover; border-radius: 8px; border: 1px solid #eee; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" alt="个人照片">
    </td>
  </tr>
</table>

---

## 个人优势

*   **全栈交付专家**：具备独立从0到1构建商业化SaaS产品的能力，成功上线 **Morphix AI** 和 **VEO AI**，涵盖需求分析、架构设计、全栈开发、支付集成及部署运维全流程。
*   **技术栈深厚**：精通 **Next.js (App Router)**、**React 19**、**TypeScript** 生态；熟练掌握 **Supabase** (PostgreSQL) 后端服务；具备 **Flutter** 跨平台开发能力（获软件著作权）。
*   **商业化落地经验**：拥有真实的海外支付（Stripe）与国内支付（支付宝）对接经验，设计并实现了完整的积分消费与用户裂变增长系统。
*   **极致性能追求**：擅长性能优化，曾通过服务端渲染（SSR）与代码分割将首屏加载速度提升 **30%**；具备高并发场景下的数据库查询优化经验。
*   **持续学习者**：20岁即获得 **计算机四级信息安全工程师** 认证，LeetCode 刷题 **300+**，保持对前沿技术（如AI模型集成）的敏锐度。

---

## 技术栈

| 领域 | 技术栈 |
| :--- | :--- |
| **前端核心** | **TypeScript**, **React 19**, **Next.js 15**, Vue.js, HTML5, CSS3 |
| **UI & 动画** | **Tailwind CSS**, Framer Motion, Shadcn/ui, Element UI |
| **后端 & 云** | **Node.js**, **Supabase**, PostgreSQL, Vercel, Serverless Functions |
| **移动端** | **Flutter** (Dart), 跨平台适配 |
| **AI & 3D** | **Three.js**, React Three Fiber, OpenAI API, Fal.ai, Tripo3D |
| **工具 & 其他** | Git, Docker, Stripe, 支付宝 SDK, Linux (Kali) |

---

## 工作经历

### **京东 (JD.com)** | 前端开发工程师（实习）
*2024.12 - 2025.02*

*   **核心职责**：负责京东商城核心营销活动页面的前端开发与维护，基于 React/Vue 技术栈保障高流量下的用户体验。
*   **性能优化**：主导页面性能优化专项，通过实施 **代码分割 (Code Splitting)** 与 **图片懒加载** 策略，成功将首屏加载时间（FCP）降低约 **30%**，显著提升了用户留存率。
*   **质量保障**：负责跨浏览器兼容性测试与线上 Bug 修复，建立前端代码规范，参与 Code Review，确保代码质量符合大厂标准。
*   **协作沟通**：与产品、设计及后端团队紧密配合，高效完成需求评审与技术方案讨论。

---

## 项目经历

### **Morphix AI - AI驱动的2D转3D模型生成平台**
*独立开发者 | 2025.09 - 至今*
🔗 [https://www.morphix-ai.com/](https://www.morphix-ai.com/)

> **项目简介**：面向全球市场的 SaaS 平台，利用 AI 将 2D 图片转换为高保真 3D 模型。集成 Stripe 支付，支持多语言。

*   **全栈架构**：基于 **Next.js 15 App Router** 构建，利用 **Server Components** 极大优化了首屏渲染性能；使用 **next-intl** 实现无刷新中英文切换。
*   **后端与安全**：使用 **Supabase** 托管 PostgreSQL 数据库，配置 **RLS (Row Level Security)** 策略确保数据隔离与安全；实现基于 JWT 的用户认证体系。
*   **商业化闭环**：
    *   完整集成 **Stripe** 支付系统（Checkout & Webhook），实现了订阅制与单次购买的混合商业模式。
    *   设计了原子性的积分扣除逻辑，确保交易零差错；实现首次购买 85 折优惠逻辑，通过 metadata 追踪用户购买状态。
*   **AI 与 3D**：
    *   对接 **Fal.ai** 与 **Tripo3D** API，设计异步任务队列和状态轮询机制处理耗时生成任务。
    *   基于 **React Three Fiber** 开发 WebGL 3D 预览器，支持模型旋转、缩放、线框/点云模式切换及多格式（GLB/OBJ/FBX）导出。
*   **增长黑客**：
    *   设计并实现双向奖励的邀请裂变系统，支持唯一邀请码生成与上限控制。
    *   实现社交媒体分享奖励机制（Twitter/TikTok/Reddit 等），含每日奖励上限和去重逻辑。

### **VEO AI - 智能视频生成 SaaS 平台**
*全栈独立开发 | 2025.07 - 至今*
🔗 [https://veo-ai.site](https://veo-ai.site)

> **项目简介**：基于 AI 的文生视频/图生视频平台，集成支付宝支付，服务国内用户。

*   **技术架构**：采用 **Serverless** 架构，后端使用 Next.js API Routes；认证采用 **NextAuth.js** (JWT Session)；邮件服务集成 **Nodemailer** (SMTP)。
*   **支付集成**：对接 **支付宝开放平台**，通过 **RSA 签名验证**与异步通知机制，实现了安全可靠的充值回调流程与订单状态机管理。
*   **系统安全**：
    *   采用 **bcryptjs** 进行密码加密（10轮哈希），全站启用参数化查询防止 SQL 注入。
    *   实现文件类型和签名验证，并通过环境变量严格隔离敏感信息。
*   **性能优化**：
    *   利用 **数据库连接池 (pg Pool)** 复用连接，配合索引优化查询速度。
    *   实施代码分割 (Dynamic Import) 与 API 响应缓存策略，显著提升响应速度。
*   **用户体验**：实现了无刷新头像上传与实时更新功能；开发了视频悬停预览组件（毛玻璃效果+流畅动画），提升用户浏览体验。

### **ClaLite 猫爪补光灯 (已获软件著作权)**
*Flutter 全栈工程师 | 2025.02 - 至今*
🔗 [https://ablly.online](https://ablly.online)

> **项目简介**：一款跨平台智能补光应用，拥有独家动态光效算法。

*   **核心创新**：
    *   **智能动态补光**：研发猫爪造型动态光效，支持全屏覆盖式环境光补偿及基于环境亮度的自动调节算法。
    *   **专业肤色优化**：内置三大预设模式（少女感/磨皮感/冷白皮），支持全光谱 1600 万色自定义与实时肤质增强。
    *   **精准控制**：实现三轴调节系统（亮度/尺寸/速度）与微米级亮度无级调节。
*   **技术亮点**：
    *   **跨平台架构**：使用 **Flutter** 实现 iOS/Android 双端开发，UI/UX 一致性达到 **98%**。
    *   **高性能渲染**：优化图形渲染引擎，在低端设备（如骁龙4系）上依然保持 **60FPS** 的流畅度。
    *   **轻量化设计**：通过硬件级功耗优化，将安装包体积控制在 **15MB** 以内，内存占用小于 80MB。

---

## 教育背景

**成都文理学院** | 计算机应用技术 | 大专
*2023 - 2026*
*   **成绩**：专业课年级前十
*   **荣誉**：参与“互联网+”、“挑战杯”等国家级竞赛并获奖

---

## 资格证书

*   **计算机四级信息安全工程师** (国家级)
*   **计算机三级信息安全技术**
*   **大学英语四级 (CET-4)**
