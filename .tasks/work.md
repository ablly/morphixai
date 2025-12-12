Morphix AI - Fal.ai (SAM 3D) 独家集成策略 (执行版)
1. 核心决策
全站采用 Fal.ai (SAM 3D) 引擎，移除所有 Tripo 相关依赖。

优势：极低成本 ($0.02)、统一技术栈、高利润率。
模式：仅保留 "物体 (Object)" 和 "人体 (Body)" 两种核心模式。
2. 💰 暴利定价体系 (Aggressive Profit Model)
2.1 核心逻辑
市场锚点：竞品成本约 $0.20+。
我们的策略：生成仅需 $0.09 (350% 利润)，但下载收费 (Upsell 策略)。
2.2 积分价值
$1 USD = 100 积分 (单积分价值 $0.01)

2.3 消耗规则 (生成 + 下载 + 增值)
动作	说明	消耗积分	备注
生成 (Generate)	物体或人体	9 积分 ($0.09)	所有用户统一价
下载 (Download)	导出 GLB 模型	5 积分 ($0.05)	仅 Starter/免费用户收费
隐私模式	不公开模型	+5 积分	增值服务
商用授权	生成 PDF 证书	100 积分	增值服务
极速通道	插队生成	+2 积分	增值服务
3. 💎 定价页面营销文案 (Pricing Page Copy)
目标：突出"量大管饱"和"特权差异"，吸引用户下单。

3.1 Starter ($9.90) - "The Hobbyist"
1,000 Credits
⚡ Generate ~110 Models (Huge Value!)
✅ Access to Object & Body Modes
❌ Standard Queue
❌ Public Models Only
⚠️ Pay-per-download (5 credits)
3.2 Creator ($29.90) - "The Pro" (🔥 Most Popular)
3,500 Credits
⚡ Generate ~380 Models
✅ Free Unlimited Downloads (Save huge!)
✅ Priority Queue (Skip the line)
✅ Private Mode Access (Keep it secret)
✅ Commercial License Available
3.3 Pro ($99.90) - "The Studio"
12,000 Credits
⚡ Generate ~1,330 Models (Best Value)
✅ Free Unlimited Downloads
✅ Ultra-Fast Priority Queue
✅ Private Mode Included
✅ 5 Free Commercial Licenses (Worth $5)
4. 📅 实施路线图
数据库更新：

generations 表增加 engine, is_downloaded, is_private, has_license 字段。
profiles 表记录 plan_tier。
后端开发：

安装 @fal-ai/serverless-client。
/api/generate/fal：统一扣费接口 (含增值选项)。
/api/generate/download：下载扣费逻辑。
/api/generate/license：生成授权书逻辑。
前端开发：

Pricing Page：根据上述文案重构，使用醒目的 Badge 显示 "Generate 380+ Models"。
Create Page：实现 Object/Body 切换，以及 Privacy/Priority 的勾选框。
验证：

测试不同等级用户的权限和扣费。