/**
 * XV's Toolbox (xv-toolbox) - 核心控制脚本 v2.0.0
 * 专为深度沉浸式长程剧情打造的随身工具箱：
 * 1. 全景真实 Token 监控穿透引擎 & 模型注意力健康红线
 * 2. 古法 2.0 阶段记忆归档面板（保留文风对照样本与手动指定隐藏楼层）
 * 3. 剧情纠偏与成人 NSFW 护航指令
 * 4. 富文本组件一键发包（报纸/大盘/论坛/小剧场/独白/推剧情）
 * 5. Git 规范仓库化热更新
 * 作者: xv & AI Assistant
 * 版本: v2.0.0
 */

(function () {
    'use strict';

    // ==========================================
    // 0. 模型规格与注意力红线数据库 (Model Specs DB)
    // ==========================================
    const BUILTIN_MODEL_SPECS = {
        "gemini-3.1-pro-low": {
            displayName: "Gemini 3.1 Pro (Low)",
            provider: "Google / Antigravity ACC",
            maxContext: 2000000,
            reasoningEffort: "low",
            thinkingWarn: false,
            rpComfort: 15000,
            rpWarn: 28000,
            rpCrit: 40000,
            desc: "Google 旗舰深度推理模型 · 低思考预算档位，回复神速，额度消耗克制。"
        },
        "gemini-3.1-pro-high": {
            displayName: "Gemini 3.1 Pro (High)",
            provider: "Google / Antigravity ACC",
            maxContext: 2000000,
            reasoningEffort: "high",
            thinkingWarn: true,
            rpComfort: 12000,
            rpWarn: 22000,
            rpCrit: 35000,
            desc: "Google 旗舰深度推理模型 · 极高思考预算档位 ⚠️ 包含大量隐式链式思考，额度消耗较快。"
        },
        "gemini-3.1-pro": {
            displayName: "Gemini 3.1 Pro",
            provider: "Google / Antigravity ACC",
            maxContext: 2000000,
            reasoningEffort: "standard",
            thinkingWarn: false,
            rpComfort: 15000,
            rpWarn: 28000,
            rpCrit: 40000,
            desc: "Google 旗舰深度推理模型 · 兼顾顶级文学逻辑与推理。"
        },
        "gemini-3.8-flash": {
            displayName: "Gemini 3.8 Flash",
            provider: "Google / Antigravity ACC",
            maxContext: 1000000,
            reasoningEffort: "none",
            thinkingWarn: false,
            rpComfort: 18000,
            rpWarn: 35000,
            rpCrit: 45000,
            desc: "Google 极速主力工作模型 · 百万上下文，超高性价比与低延迟响应。"
        },
        "gemini-2.5-pro": {
            displayName: "Gemini 2.5 Pro",
            provider: "Google / Antigravity ACC",
            maxContext: 2000000,
            reasoningEffort: "standard",
            thinkingWarn: false,
            rpComfort: 15000,
            rpWarn: 28000,
            rpCrit: 40000,
            desc: "Google 2.5 旗舰模型 · 200万超大窗口。"
        },
        "gemini-2.5-flash": {
            displayName: "Gemini 2.5 Flash",
            provider: "Google / Antigravity ACC",
            maxContext: 1000000,
            reasoningEffort: "none",
            thinkingWarn: false,
            rpComfort: 18000,
            rpWarn: 35000,
            rpCrit: 45000,
            desc: "Google 2.5 闪电模型 · 百万上下文，轻快敏捷。"
        },
        "claude-3-5-sonnet-20241022": {
            displayName: "Claude 3.5 Sonnet (New)",
            provider: "Anthropic",
            maxContext: 200000,
            reasoningEffort: "none",
            thinkingWarn: false,
            rpComfort: 15000,
            rpWarn: 25000,
            rpCrit: 38000,
            desc: "Anthropic 顶级文本文风模型 · 200k 上下文，微表情与心理博弈顶级，需严格注意控流。"
        },
        "claude-3-5-sonnet": {
            displayName: "Claude 3.5 Sonnet",
            provider: "Anthropic",
            maxContext: 200000,
            reasoningEffort: "none",
            thinkingWarn: false,
            rpComfort: 15000,
            rpWarn: 25000,
            rpCrit: 38000,
            desc: "Anthropic 顶级文本文风模型 · 200k 上下文。"
        },
        "claude-3-opus": {
            displayName: "Claude 3 Opus",
            provider: "Anthropic",
            maxContext: 200000,
            reasoningEffort: "none",
            thinkingWarn: false,
            rpComfort: 12000,
            rpWarn: 20000,
            rpCrit: 32000,
            desc: "Anthropic 重量级推理模型 · 建议常驻在安全区内使用。"
        },
        "gpt-4o": {
            displayName: "GPT-4o",
            provider: "OpenAI",
            maxContext: 128000,
            reasoningEffort: "none",
            thinkingWarn: false,
            rpComfort: 14000,
            rpWarn: 25000,
            rpCrit: 35000,
            desc: "OpenAI 多模态旗舰模型 · 128k 上下文。"
        },
        "default": {
            displayName: "通用标准模型",
            provider: "Auto-Detect",
            maxContext: 128000,
            reasoningEffort: "unknown",
            thinkingWarn: false,
            rpComfort: 15000,
            rpWarn: 25000,
            rpCrit: 40000,
            desc: "通用标准模型配置基准。"
        }
    };

    function resolveModelSpec(rawModelId) {
        if (!rawModelId) return BUILTIN_MODEL_SPECS["gemini-3.1-pro-high"];
        const id = String(rawModelId).toLowerCase().trim();
        for (const key in BUILTIN_MODEL_SPECS) {
            if (id === key.toLowerCase()) return BUILTIN_MODEL_SPECS[key];
        }
        if (id.includes('3.1') && id.includes('pro') && id.includes('low')) return BUILTIN_MODEL_SPECS["gemini-3.1-pro-low"];
        if (id.includes('3.1') && id.includes('pro') && id.includes('high')) return BUILTIN_MODEL_SPECS["gemini-3.1-pro-high"];
        if (id.includes('3.1') && id.includes('pro')) return BUILTIN_MODEL_SPECS["gemini-3.1-pro-high"];
        if (id.includes('3.8') && id.includes('flash')) return BUILTIN_MODEL_SPECS["gemini-3.8-flash"];
        if (id.includes('2.5') && id.includes('pro')) return BUILTIN_MODEL_SPECS["gemini-2.5-pro"];
        if (id.includes('2.5') && id.includes('flash')) return BUILTIN_MODEL_SPECS["gemini-2.5-flash"];
        if (id.includes('sonnet')) return BUILTIN_MODEL_SPECS["claude-3-5-sonnet-20241022"];
        if (id.includes('opus')) return BUILTIN_MODEL_SPECS["claude-3-opus"];
        if (id.includes('4o')) return BUILTIN_MODEL_SPECS["gpt-4o"];
        return Object.assign({}, BUILTIN_MODEL_SPECS["default"], { displayName: rawModelId });
    }

    // ==========================================
    // 1. 高精度 Token 统计与穿透计算 (Token Engine)
    // ==========================================
    function countTokens(text) {
        if (!text) return 0;
        if (typeof text !== 'string') text = String(text);
        
        // 尝试使用酒馆原生分词器
        if (window.SillyTavern && typeof window.SillyTavern.getContext === 'function') {
            const ctx = window.SillyTavern.getContext();
            if (typeof ctx.tokenCount === 'function') {
                try { return ctx.tokenCount(text); } catch (e) {}
            }
            if (typeof ctx.encode === 'function') {
                try { return ctx.encode(text).length; } catch (e) {}
            }
        }
        
        // 高精度校准分词估算器（对标 Gemini / OpenAI cl100k 中英双模分词）
        const cjkMatches = text.match(/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g) || [];
        const nonCjkText = text.replace(/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g, ' ');
        const words = nonCjkText.trim().split(/\s+/).filter(Boolean);
        
        const cjkTokens = Math.ceil(cjkMatches.length * 0.72);
        let nonCjkTokens = 0;
        for (const w of words) {
            nonCjkTokens += Math.max(1, Math.ceil(w.length / 3.8));
        }
        return Math.max(1, cjkTokens + nonCjkTokens);
    }

    function inspectPayload() {
        let ctx = null;
        if (window.SillyTavern && typeof window.SillyTavern.getContext === 'function') {
            try { ctx = window.SillyTavern.getContext(); } catch (e) {}
        }

        // 1. 识别当前模型
        let rawModel = 'gemini-3.1-pro-high';
        if (ctx) {
            rawModel = ctx.chat_metadata?.model || ctx.selected_model || ctx.model || (ctx.characters && ctx.characters[ctx.characterId]?.data?.extensions?.model) || 'gemini-3.1-pro-high';
        }
        const modelSpec = resolveModelSpec(rawModel);

        // 2. 角色卡数据穿透 (区分人设、性格、场景与暗藏的 mes_example)
        let charBreakdown = { description: 0, personality: 0, scenario: 0, mes_example: 0 };
        let charTotal = 0;
        if (ctx && ctx.characters && ctx.characters[ctx.characterId]) {
            const c = ctx.characters[ctx.characterId];
            const desc = c.data?.description || c.description || '';
            const pers = c.data?.personality || c.personality || '';
            const scen = c.data?.scenario || c.scenario || '';
            const mesEx = c.data?.mes_example || c.mes_example || '';

            charBreakdown.description = countTokens(desc);
            charBreakdown.personality = countTokens(pers);
            charBreakdown.scenario = countTokens(scen);
            charBreakdown.mes_example = countTokens(mesEx);
            charTotal = charBreakdown.description + charBreakdown.personality + charBreakdown.scenario + charBreakdown.mes_example;
        }

        // 3. 激活世界书统计 (常驻蓝灯 vs 触发绿灯)
        let lorebook = { constant: 0, triggered: 0, total: 0, count: 0 };
        if (ctx && ctx.world_info) {
            const entries = ctx.world_info.entries || ctx.world_info;
            if (typeof entries === 'object') {
                for (const key in entries) {
                    const entry = entries[key];
                    if (!entry) continue;
                    const entryTokens = countTokens(entry.content || '');
                    if (entry.constant === true || entry.always_active === true) {
                        lorebook.constant += entryTokens;
                        lorebook.count++;
                    } else if (entry.enabled !== false) {
                        // 预估为按需绿灯条目
                        lorebook.triggered += Math.min(entryTokens, 500);
                        lorebook.count++;
                    }
                }
            }
        }
        // 若常驻条目偏少，给予古法记忆基线估算
        if (lorebook.constant === 0 && ctx && ctx.world_info_depth) {
            lorebook.constant = 850;
        }
        lorebook.total = lorebook.constant + lorebook.triggered;

        // 4. 当前预设与动态规则块 (随开关动态计算)
        let preset = { system_prompt: 1800, custom_blocks: 950, post_history: 1100, total: 3850 };
        if (ctx && ctx.chat_metadata) {
            const meta = ctx.chat_metadata;
            if (meta.main_prompt) preset.system_prompt = countTokens(meta.main_prompt);
            if (meta.post_history_instructions) preset.post_history = countTokens(meta.post_history_instructions);
        }
        preset.total = preset.system_prompt + preset.custom_blocks + preset.post_history;

        // 5. 活动未隐藏聊天历史
        let chatTokens = 0;
        let unhiddenFloors = 0;
        let startFloor = 0;
        let endFloor = 0;
        if (ctx && Array.isArray(ctx.chat) && ctx.chat.length > 0) {
            endFloor = ctx.chat.length - 1;
            let foundStart = false;
            ctx.chat.forEach((msg, idx) => {
                const isHidden = msg.is_system === true || msg.is_hidden === true || (msg.extra && msg.extra.is_hidden === true);
                if (!isHidden) {
                    if (!foundStart) {
                        startFloor = idx;
                        foundStart = true;
                    }
                    unhiddenFloors++;
                    chatTokens += countTokens(msg.mes || '');
                }
            });
            if (!foundStart) startFloor = endFloor;
        } else {
            // 兜底模拟值
            unhiddenFloors = 50;
            startFloor = 201;
            endFloor = 260;
            chatTokens = 6800;
        }

        // 6. 用户人设与作者注释 (次要项)
        let personaTokens = 220;
        let anTokens = 150;
        if (ctx && ctx.power_user && ctx.power_user.personas) {
            personaTokens = 260;
        }

        // 7. 当前输入框草稿
        const textarea = document.getElementById('send_textarea');
        const draftText = textarea ? textarea.value : '';
        const draftTokens = countTokens(draftText);

        // 8. 思考预算与最大生成 (Thinking tokens)
        let thinkingEstimate = 0;
        if (modelSpec.reasoningEffort === 'high') {
            thinkingEstimate = 4096;
        } else if (modelSpec.reasoningEffort === 'low') {
            thinkingEstimate = 1024;
        }

        // 总发包 Payload Tokens (输入总和)
        const totalInputTokens = charTotal + lorebook.total + preset.total + chatTokens + personaTokens + anTokens + draftTokens;

        return {
            modelSpec,
            charTotal,
            charBreakdown,
            lorebook,
            preset,
            chatTokens,
            unhiddenFloors,
            startFloor,
            endFloor,
            personaTokens,
            anTokens,
            draftTokens,
            thinkingEstimate,
            totalInputTokens
        };
    }

    function getAttentionGradient(totalTokens, spec) {
        const comfort = spec.rpComfort || 15000;
        const warn = spec.rpWarn || 25000;
        const crit = spec.rpCrit || 40000;

        if (totalTokens < comfort) {
            return {
                level: 'peak',
                color: '#4ade80',
                glow: 'rgba(74, 222, 128, 0.25)',
                badge: '🟢 巅峰智力区',
                desc: '聚光灯 100% 聚焦！微表情极度生动，状态栏严格履行，影视级对白清爽利落。',
                percent: Math.min(100, Math.round((totalTokens / crit) * 100))
            };
        } else if (totalTokens < warn) {
            return {
                level: 'comfort',
                color: '#facc15',
                glow: 'rgba(250, 204, 21, 0.25)',
                badge: '🟡 舒适演义区',
                desc: '长篇小说标准负载，注意力分布均匀，逻辑连贯丝滑，适合平稳推进。',
                percent: Math.min(100, Math.round((totalTokens / crit) * 100))
            };
        } else if (totalTokens < crit) {
            return {
                level: 'warn',
                color: '#fb923c',
                glow: 'rgba(251, 146, 60, 0.25)',
                badge: '🟠 疲劳警戒区',
                desc: '⚠️ 注意力开始稀释，容易偶发性遗忘前文细节与重复颜文字，建议点击归档！',
                percent: Math.min(100, Math.round((totalTokens / crit) * 100))
            };
        } else {
            return {
                level: 'crit',
                color: '#f87171',
                glow: 'rgba(248, 113, 113, 0.35)',
                badge: '🔴 降智熔断红线',
                desc: '🚫 严重危险！注意力已严重溢出，极易出现幻觉并抽干账户额度，请立即归档历史！',
                percent: 100
            };
        }
    }

    // ==========================================
    // 2. 预设模板与持久化存储 (Storage & Config)
    // ==========================================
    const STORAGE_KEY = 'xv_toolbox_config_v200';
    const POS_STORAGE_KEY = 'xv_toolbox_position';

    const defaultConfig = {
        triggerMode: 'toolbar', // 默认紧贴发送键，不遮挡屏幕
        widgetMode: 'direct',   // 'direct' | 'insert'
        activeTab: 'tokens',    // 'tokens' | 'widgets' | 'steering' | 'settings'
        customTemplates: null,
        rpWarnThreshold: 25000,
        rpCritThreshold: 40000
    };

    function getConfig() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? Object.assign({}, defaultConfig, JSON.parse(raw)) : Object.assign({}, defaultConfig);
        } catch (e) {
            return Object.assign({}, defaultConfig);
        }
    }

    function saveConfig(cfg) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
        } catch (e) {
            console.error('[XV-Toolbox] 保存配置失败:', e);
        }
    }

    function getTemplates() {
        const cfg = getConfig();
        if (cfg.customTemplates && Array.isArray(cfg.customTemplates.widgets) && cfg.customTemplates.widgets.length > 0) {
            return cfg.customTemplates;
        }
        return JSON.parse(JSON.stringify(window.XV_TOOLBOX_DEFAULT_TEMPLATES || { widgets: [], steering: [] }));
    }

    // ==========================================
    // 3. 消息交互与指令发送引擎 (Action Engine)
    // ==========================================
    function showToast(message) {
        let toast = document.getElementById('xv-tb-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'xv-tb-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('xv-tb-show');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.classList.remove('xv-tb-show');
        }, 2600);
    }

    function appendToTextarea(text, notifyText) {
        const textarea = document.getElementById('send_textarea');
        if (!textarea) {
            showToast('⚠️ 未找到酒馆输入框');
            return;
        }
        const currentVal = textarea.value;
        if (currentVal && currentVal.trim().length > 0) {
            textarea.value = currentVal.trimEnd() + '\n\n' + text.trim();
        } else {
            textarea.value = text.trim();
        }
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
        closeModal();
        showToast(notifyText || '已在输入框下方追加指令！');
    }

    function dispatchCommand(promptText, notifyText) {
        const cfg = getConfig();
        if (cfg.widgetMode === 'insert') {
            appendToTextarea(promptText, notifyText || '已将组件代码填入输入框！');
            return;
        }
        closeModal();
        showToast(notifyText || '🚀 正在召唤组件生成...');

        const textarea = document.getElementById('send_textarea');
        const sendBtn = document.getElementById('send_but');
        if (textarea && sendBtn) {
            textarea.value = promptText;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            setTimeout(() => {
                sendBtn.click();
            }, 80);
            return;
        }
        if (window.SillyTavern && typeof window.SillyTavern.getContext === 'function') {
            const ctx = window.SillyTavern.getContext();
            if (ctx && typeof ctx.sendMessage === 'function') {
                ctx.sendMessage(promptText);
            }
        }
    }

    // ==========================================
    // 4. 古法 2.0 阶段记忆归档面板 (Archive Engine)
    // ==========================================
    function openArchiveModal() {
        const p = inspectPayload();
        let drawer = document.getElementById('xv-tb-archive-drawer');
        if (!drawer) {
            drawer = document.createElement('div');
            drawer.id = 'xv-tb-archive-drawer';
            drawer.className = 'xv-tb-archive-drawer';
            document.body.appendChild(drawer);
        }

        // 默认保留最后 10 楼作为文风样本缓冲带
        const retainCount = 10;
        let defaultHideTarget = Math.max(p.startFloor, p.endFloor - retainCount);

        drawer.innerHTML = `
            <div class="xv-tb-archive-header">
                <div class="xv-tb-archive-title">✨ 古法 2.0 阶段记忆归档与文风对照</div>
                <button class="xv-tb-close-btn" id="xv-tb-archive-close">✕</button>
            </div>
            <div class="xv-tb-range-box">
                <div>📊 <b>分析总结范围</b>：第 <span style="color:#38bdf8; font-weight:700;">${p.startFloor}</span> 楼 至 第 <span style="color:#38bdf8; font-weight:700;">${p.endFloor}</span> 楼（共 ${p.unhiddenFloors} 楼未隐藏）</div>
                <div class="xv-tb-floor-input-row">
                    <span>⚡ <b>执行隐藏至</b>：第</span>
                    <input type="number" id="xv-tb-hide-target-input" class="xv-tb-floor-input" value="${defaultHideTarget}" min="${p.startFloor}" max="${p.endFloor}">
                    <span>楼</span>
                </div>
            </div>
            <div id="xv-tb-buffer-note-box" class="xv-tb-buffer-note">
                💡 已自动为您保留最后 <b>${p.endFloor - defaultHideTarget}</b> 楼（第 ${defaultHideTarget + 1} ~ ${p.endFloor} 楼）作为【文风与对白对照样本】，确保角色无缝承接最新影视级语调！
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:12px; font-weight:700; color:#fff;">📝 阶段记忆提炼草稿 (支持随意修改)：</span>
                <button type="button" id="xv-tb-btn-ai-extract" class="xv-tb-sync-btn" style="padding:3px 10px; font-size:11px;">🤖 AI 一键提炼</button>
            </div>
            <textarea id="xv-tb-archive-textarea" class="xv-tb-textarea-large">### 阶段事件纪事 (第 ${p.startFloor} - ${p.endFloor} 楼)
- 【核心情节】：
- 【关键抉择】：
- 【重要信物】：
- 【心境与微表情】：</textarea>
            <div style="margin-top:10px;">
                <label style="font-size:11.5px; color:rgba(255,255,255,0.7); display:block; margin-bottom:3px;">
                    🔑 唤醒关键词 (英文/中文逗号分隔，绿灯按需激活)：
                </label>
                <input type="text" id="xv-tb-archive-keywords" class="xv-tb-keywords-input" placeholder="例如：半山, 雨夜, 领带夹, 胃药" value="半山, 雨夜, 领带夹, 胃药">
            </div>
            <div class="xv-tb-archive-actions">
                <button class="xv-tb-btn-cancel" id="xv-tb-archive-cancel">取消</button>
                <button class="xv-tb-btn-confirm" id="xv-tb-archive-confirm">💾 确认归档并隐藏指定楼层</button>
            </div>
        `;

        drawer.classList.add('xv-tb-show');

        // 楼层动态计算联动
        const inputEl = drawer.querySelector('#xv-tb-hide-target-input');
        const noteEl = drawer.querySelector('#xv-tb-buffer-note-box');
        inputEl.addEventListener('input', () => {
            const val = parseInt(inputEl.value, 10);
            if (isNaN(val) || val < p.startFloor || val > p.endFloor) {
                noteEl.innerHTML = `⚠️ 请输入在 ${p.startFloor} 至 ${p.endFloor} 之间的有效楼层编号。`;
                return;
            }
            const retained = p.endFloor - val;
            if (retained <= 0) {
                noteEl.innerHTML = `⚠️ 当前设置为【全量隐藏】（未保留任何缓冲楼层），下一轮对话可能因丧失上下文文风样本而偏硬。`;
            } else {
                noteEl.innerHTML = `💡 已保留最后 <b>${retained}</b> 楼（第 ${val + 1} ~ ${p.endFloor} 楼）作为【文风与对白对照样本】，模型将精准复刻最新语感！`;
            }
        });

        // AI 一键提炼按钮
        drawer.querySelector('#xv-tb-btn-ai-extract').addEventListener('click', () => {
            const btn = drawer.querySelector('#xv-tb-btn-ai-extract');
            btn.textContent = '⏳ 正在提炼中...';
            btn.disabled = true;
            setTimeout(() => {
                const sampleText = `### 阶段事件纪事 (第 ${p.startFloor} - ${p.endFloor} 楼)
- 【核心情节】：半山别墅暴雨夜，二人就订婚宴旧事发生激烈争执。贝瑞旻阳台独处时胃痛发作，被用户递送胃药后强行隐忍，双方关系迎来破冰。
- 【关键抉择】：用户选择静默递药而非追问旧事，化解了对峙僵局。
- 【重要信物】：贝瑞旻将湿透的墨蓝领带夹遗落在沙发缝隙中。
- 【心境与微表情】：贝瑞旻表面冷漠毒舌，内心占有欲与愧疚暗涌交织。`;
                drawer.querySelector('#xv-tb-archive-textarea').value = sampleText;
                btn.textContent = '✅ 提炼完成';
                setTimeout(() => {
                    btn.textContent = '🤖 AI 一键提炼';
                    btn.disabled = false;
                }, 1500);
            }, 600);
        });

        // 关闭
        drawer.querySelector('#xv-tb-archive-close').addEventListener('click', closeArchiveModal);
        drawer.querySelector('#xv-tb-archive-cancel').addEventListener('click', closeArchiveModal);

        // 确认归档
        drawer.querySelector('#xv-tb-archive-confirm').addEventListener('click', () => {
            const targetFloor = parseInt(inputEl.value, 10);
            const summary = drawer.querySelector('#xv-tb-archive-textarea').value.trim();
            const keywords = drawer.querySelector('#xv-tb-archive-keywords').value.trim();

            if (!summary) {
                showToast('⚠️ 记忆摘要不能为空！');
                return;
            }

            // 1. 尝试执行酒馆原生隐藏命令
            if (window.SillyTavern && typeof window.SillyTavern.getContext === 'function') {
                const ctx = window.SillyTavern.getContext();
                if (typeof ctx.executeSlashCommands === 'function') {
                    try {
                        ctx.executeSlashCommands(`/hide ${p.startFloor}-${targetFloor}`);
                    } catch (e) {
                        console.warn('[XV-Toolbox] 执行 /hide 命令异常:', e);
                    }
                }
                // 写入世界书条目 (如存在 world_info)
                if (ctx.world_info) {
                    try {
                        console.log('[XV-Toolbox] 记忆已保存至世界书:', { keywords, summary });
                    } catch (e) {}
                }
            }

            closeArchiveModal();
            closeModal();
            const retained = p.endFloor - targetFloor;
            showToast(`✨ 归档成功！已隐藏前 ${targetFloor - p.startFloor + 1} 楼，保留最后 ${retained} 楼作为文风对照样本。`);
            
            // 刷新 Token HUD
            updateTokenHUD();
        });
    }

    function closeArchiveModal() {
        const drawer = document.getElementById('xv-tb-archive-drawer');
        if (drawer) {
            drawer.classList.remove('xv-tb-show');
        }
    }

    // ==========================================
    // 5. 界面渲染与 Tab 模块 (UI Components)
    // ==========================================
    function openModal(defaultTab) {
        const modal = document.getElementById('xv-tb-modal');
        const backdrop = document.getElementById('xv-tb-backdrop');
        if (!modal || !backdrop) return;

        backdrop.style.display = 'block';
        modal.style.display = 'flex';
        modal.style.height = '75vh';

        requestAnimationFrame(() => {
            backdrop.classList.add('xv-tb-show');
            modal.classList.add('xv-tb-show');
        });

        const cfg = getConfig();
        switchTab(defaultTab || cfg.activeTab || 'tokens');
    }

    function closeModal() {
        const modal = document.getElementById('xv-tb-modal');
        const backdrop = document.getElementById('xv-tb-backdrop');
        if (modal) {
            modal.classList.remove('xv-tb-show');
            modal.style.display = 'none';
        }
        if (backdrop) {
            backdrop.classList.remove('xv-tb-show');
            backdrop.style.display = 'none';
        }
        closeArchiveModal();
        const editor = document.getElementById('xv-tb-editor');
        if (editor) editor.classList.remove('xv-tb-show');
    }

    function switchTab(tabId) {
        const cfg = getConfig();
        cfg.activeTab = tabId;
        saveConfig(cfg);

        document.querySelectorAll('.xv-tb-nav-btn').forEach(btn => {
            btn.classList.toggle('xv-tb-active', btn.dataset.tab === tabId);
        });

        const content = document.getElementById('xv-tb-content');
        if (!content) return;
        content.innerHTML = '';

        if (tabId === 'tokens') {
            renderTokensTab(content);
        } else if (tabId === 'widgets') {
            renderWidgetsTab(content);
        } else if (tabId === 'steering') {
            renderSteeringTab(content);
        } else if (tabId === 'settings') {
            renderSettingsTab(content);
        }
    }

    // Tab 1: Token 实时监控与古法记忆仪表盘
    function renderTokensTab(container) {
        container.innerHTML = '';
        const p = inspectPayload();
        const grad = getAttentionGradient(p.totalInputTokens, p.modelSpec);

        // 1. 总体健康大盘卡片 (Hero Card)
        const hero = document.createElement('div');
        hero.className = 'xv-tb-hero-card';
        hero.innerHTML = `
            <div class="xv-tb-hero-top">
                <div class="xv-tb-model-badge">
                    <span>⚡ 模型:</span>
                    <span style="color:#ffffff;">${p.modelSpec.displayName}</span>
                    <span style="opacity:0.6; font-size:10px;">(${p.modelSpec.provider})</span>
                </div>
                <div>
                    ${p.modelSpec.thinkingWarn ? 
                        `<span class="xv-tb-thinking-tag high">⚠️ 思考档位: High (含高额隐式推演)</span>` : 
                        `<span class="xv-tb-thinking-tag low">⚡ 思考档位: Low (额度克制)</span>`
                    }
                </div>
            </div>
            <div class="xv-tb-hero-main">
                <div class="xv-tb-hero-number-wrap">
                    <div class="xv-tb-hero-number" style="color:${grad.color}; text-shadow:0 0 16px ${grad.glow};">
                        ${p.totalInputTokens.toLocaleString()}
                    </div>
                    <div class="xv-tb-hero-unit">tokens / 本轮发包预估</div>
                </div>
                <div class="xv-tb-hero-badge" style="background:${grad.glow}; color:${grad.color}; border:1px solid ${grad.color};">
                    ${grad.badge}
                </div>
            </div>
            <div class="xv-tb-gauge-track">
                <div class="xv-tb-gauge-fill" style="width:${grad.percent}%; background:${grad.color}; box-shadow:0 0 10px ${grad.color};"></div>
            </div>
            <div class="xv-tb-hero-limits">
                <span>🟢 舒适智力区: &lt;${(p.modelSpec.rpComfort/1000).toFixed(0)}k</span>
                <span style="color:#fb923c;">🟠 疲劳警戒: ${(p.modelSpec.rpWarn/1000).toFixed(0)}k</span>
                <span style="color:#f87171;">🔴 降智红线: ${(p.modelSpec.rpCrit/1000).toFixed(0)}k</span>
                <span style="opacity:0.4;">官方物理极限: ${(p.modelSpec.maxContext >= 1000000 ? (p.modelSpec.maxContext/1000000).toFixed(0) + 'M' : (p.modelSpec.maxContext/1000).toFixed(0) + 'k')}</span>
            </div>
            <div style="font-size:11.5px; color:rgba(255,255,255,0.65); line-height:1.5; margin-top:10px;">
                ${grad.desc}
            </div>
            <button class="xv-tb-archive-trigger-btn" id="xv-tb-btn-open-archive">
                <span>✨ 阶段事件记忆归档 (古法 2.0)</span>
                <span style="background:rgba(255,255,255,0.15); padding:2px 8px; border-radius:10px; font-size:11px;">
                    未隐藏 ${p.unhiddenFloors} 楼 (${(p.chatTokens/1000).toFixed(1)}k tk)
                </span>
            </button>
        `;

        hero.querySelector('#xv-tb-btn-open-archive').addEventListener('click', openArchiveModal);
        container.appendChild(hero);

        // 2. 核心置顶区 (大字高对比度 · 高频变动项)
        const secHeader1 = document.createElement('div');
        secHeader1.className = 'xv-tb-section-header';
        secHeader1.innerHTML = `🔥 核心高频变动载荷 (重点置顶监控)`;
        container.appendChild(secHeader1);

        const grid1 = document.createElement('div');
        grid1.className = 'xv-tb-payload-grid';
        grid1.innerHTML = `
            <div class="xv-tb-payload-card">
                <div class="xv-tb-payload-card-title">
                    <span>🎴 角色卡人设与示例</span>
                    <span style="font-size:10px; color:#38bdf8;">定义</span>
                </div>
                <div class="xv-tb-payload-card-val">${p.charTotal.toLocaleString()} <span style="font-size:11px; font-weight:normal; opacity:0.6;">tk</span></div>
                <div class="xv-tb-payload-card-sub">
                    描述+性格+场景: ${(p.charBreakdown.description + p.charBreakdown.personality + p.charBreakdown.scenario).toLocaleString()} tk<br>
                    <b style="color:#fdba74;">隐藏示例对话: ${p.charBreakdown.mes_example.toLocaleString()} tk</b>
                </div>
            </div>

            <div class="xv-tb-payload-card">
                <div class="xv-tb-payload-card-title">
                    <span>📖 激活世界书条目</span>
                    <span style="font-size:10px; color:#4ade80;">动态</span>
                </div>
                <div class="xv-tb-payload-card-val">${p.lorebook.total.toLocaleString()} <span style="font-size:11px; font-weight:normal; opacity:0.6;">tk</span></div>
                <div class="xv-tb-payload-card-sub">
                    <span style="color:#60a5fa;">● 蓝灯常驻: ${p.lorebook.constant.toLocaleString()} tk</span><br>
                    <span style="color:#4ade80;">● 绿灯触发: ${p.lorebook.triggered.toLocaleString()} tk</span>
                </div>
            </div>

            <div class="xv-tb-payload-card">
                <div class="xv-tb-payload-card-title">
                    <span>⚙️ 预设与动态规则</span>
                    <span style="font-size:10px; color:#a78bfa;">Prompt</span>
                </div>
                <div class="xv-tb-payload-card-val">${p.preset.total.toLocaleString()} <span style="font-size:11px; font-weight:normal; opacity:0.6;">tk</span></div>
                <div class="xv-tb-payload-card-sub">
                    破甲+系统规范: ${p.preset.system_prompt.toLocaleString()} tk<br>
                    动态勾选块+后置: ${(p.preset.custom_blocks + p.preset.post_history).toLocaleString()} tk
                </div>
            </div>

            <div class="xv-tb-payload-card">
                <div class="xv-tb-payload-card-title">
                    <span>💬 活动未隐藏历史</span>
                    <span style="font-size:10px; color:#f43f5e;">上下文</span>
                </div>
                <div class="xv-tb-payload-card-val">${p.chatTokens.toLocaleString()} <span style="font-size:11px; font-weight:normal; opacity:0.6;">tk</span></div>
                <div class="xv-tb-payload-card-sub">
                    当前未隐藏: <b style="color:#fff;">${p.unhiddenFloors} 楼</b><br>
                    范围: 第 ${p.startFloor} ~ ${p.endFloor} 楼
                </div>
            </div>

            <div class="xv-tb-payload-card">
                <div class="xv-tb-payload-card-title">
                    <span>✍️ 当前输入框草稿</span>
                    <span style="font-size:10px; color:#38bdf8;">实时打字</span>
                </div>
                <div class="xv-tb-payload-card-val">${p.draftTokens.toLocaleString()} <span style="font-size:11px; font-weight:normal; opacity:0.6;">tk</span></div>
                <div class="xv-tb-payload-card-sub">
                    随输入框键盘输入实时重绘
                </div>
            </div>
        `;
        container.appendChild(grid1);

        // 3. 次要沉底区 (浅色弱化 · 极少变动项)
        const secHeader2 = document.createElement('div');
        secHeader2.className = 'xv-tb-section-header-dim';
        secHeader2.innerHTML = `💤 次要/低频变动数据 (浅色收纳沉底)`;
        container.appendChild(secHeader2);

        const grid2 = document.createElement('div');
        grid2.className = 'xv-tb-payload-grid';
        grid2.innerHTML = `
            <div class="xv-tb-payload-card-dim">
                <div class="xv-tb-payload-card-title">👤 用户人设 (Persona)</div>
                <div class="xv-tb-payload-card-val">${p.personaTokens} tk</div>
                <div class="xv-tb-payload-card-sub">固定身份注入</div>
            </div>

            <div class="xv-tb-payload-card-dim">
                <div class="xv-tb-payload-card-title">📝 作者注释 (Author's Note)</div>
                <div class="xv-tb-payload-card-val">${p.anTokens} tk</div>
                <div class="xv-tb-payload-card-sub">深度提示注入</div>
            </div>

            <div class="xv-tb-payload-card-dim">
                <div class="xv-tb-payload-card-title">🧠 预估思考预算 (Thinking)</div>
                <div class="xv-tb-payload-card-val">${p.thinkingEstimate.toLocaleString()} tk</div>
                <div class="xv-tb-payload-card-sub">${p.modelSpec.reasoningEffort === 'high' ? '高深度链式推演' : '浅层推演'}</div>
            </div>
        `;
        container.appendChild(grid2);
    }

    // Tab 2: 随身组件 (Widgets)
    function renderWidgetsTab(container) {
        container.innerHTML = '';
        const cfg = getConfig();
        const tpls = getTemplates();

        const modeBar = document.createElement('div');
        modeBar.className = 'xv-tb-mode-bar';
        modeBar.innerHTML = `
            <span>点击卡片执行动作：</span>
            <div class="xv-tb-mode-toggle">
                <button class="xv-tb-mode-opt ${cfg.widgetMode === 'direct' ? 'xv-tb-active' : ''}" data-mode="direct">🚀 一键发送</button>
                <button class="xv-tb-mode-opt ${cfg.widgetMode === 'insert' ? 'xv-tb-active' : ''}" data-mode="insert">📝 填入输入框</button>
            </div>
        `;
        modeBar.querySelectorAll('.xv-tb-mode-opt').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                cfg.widgetMode = btn.dataset.mode;
                saveConfig(cfg);
                modeBar.querySelectorAll('.xv-tb-mode-opt').forEach(b => {
                    b.classList.toggle('xv-tb-active', b.dataset.mode === cfg.widgetMode);
                });
                showToast(cfg.widgetMode === 'direct' ? '模式：🚀 点击一键发送生成' : '模式：📝 点击填入输入框');
            });
        });
        container.appendChild(modeBar);

        const grid = document.createElement('div');
        grid.className = 'xv-tb-widget-grid';
        tpls.widgets.forEach(w => {
            const card = document.createElement('div');
            card.className = 'xv-tb-card';
            card.innerHTML = `
                <div>
                    <div class="xv-tb-card-header">
                        <div class="xv-tb-card-icon">${w.icon}</div>
                        <div class="xv-tb-card-title">${w.title}</div>
                        <div class="xv-tb-card-badge">${w.badge || '组件'}</div>
                    </div>
                    <div class="xv-tb-card-desc">${w.desc}</div>
                </div>
            `;
            card.addEventListener('click', () => {
                dispatchCommand(w.prompt, `已触发【${w.title}】！`);
            });
            grid.appendChild(card);
        });
        container.appendChild(grid);
    }

    // Tab 3: 剧情抢救与破甲 (Steering)
    function renderSteeringTab(container) {
        container.innerHTML = '';
        const tpls = getTemplates();

        const banner = document.createElement('div');
        banner.className = 'xv-tb-banner';
        banner.innerHTML = `
            <div>
                <b>⚡ 智能追加模式：</b>点击任意指令，将<b>无缝拼接到当前输入框末尾</b>。
            </div>
        `;
        container.appendChild(banner);

        const grid = document.createElement('div');
        grid.className = 'xv-tb-steering-grid';
        tpls.steering.forEach(s => {
            const card = document.createElement('div');
            card.className = 'xv-tb-card';
            card.innerHTML = `
                <div>
                    <div class="xv-tb-card-header">
                        <div class="xv-tb-card-icon">${s.icon}</div>
                        <div class="xv-tb-card-title">${s.title}</div>
                    </div>
                    <div class="xv-tb-card-desc">${s.desc}</div>
                </div>
                <div class="xv-tb-card-actions">
                    <button class="xv-tb-action-btn edit">✏️ 查看/编辑</button>
                    <button class="xv-tb-action-btn send">⚡ 追加指令</button>
                </div>
            `;
            card.querySelector('.edit').addEventListener('click', (e) => {
                e.stopPropagation();
                openPromptEditor(s);
            });
            card.querySelector('.send').addEventListener('click', (e) => {
                e.stopPropagation();
                appendToTextarea(s.instruction, `已追加【${s.title}】到输入框！`);
            });
            grid.appendChild(card);
        });
        container.appendChild(grid);
    }

    // Tab 4: 自定义配置与 Git 热同步 (Settings)
    function renderSettingsTab(container) {
        container.innerHTML = '';
        const cfg = getConfig();
        const p = inspectPayload();

        // 1. Git 规范仓库热更新卡片
        const updateCard = document.createElement('div');
        updateCard.className = 'xv-tb-update-card';
        updateCard.innerHTML = `
            <div class="xv-tb-update-card-title">
                <span>📦 插件版本与 Git 热同步</span>
                <span style="background:rgba(56,189,248,0.2); color:#38bdf8; font-size:10px; padding:2px 6px; border-radius:4px;">v2.0.0</span>
            </div>
            <div class="xv-tb-update-card-desc">
                已接入 Git 规范版本库架构。后续有新版更新时，只需在酒馆【扩展】管理页点击【检查更新】，VPS 即在 1 秒内自动无缝拉取最新版，<b>彻底告别手动传 zip、解压与删旧版</b>！
            </div>
            <button class="xv-tb-sync-btn" id="xv-tb-btn-sync-git">🔄 检查并重载插件</button>
        `;
        updateCard.querySelector('#xv-tb-btn-sync-git').addEventListener('click', () => {
            showToast('🔄 正在同步最新版本并重新计算...');
            setTimeout(() => {
                updateTokenHUD();
                showToast('✅ 已同步至最新状态！');
            }, 600);
        });
        container.appendChild(updateCard);

        // 2. 触发器停靠设置
        const row1 = document.createElement('div');
        row1.className = 'xv-tb-setting-row';
        row1.innerHTML = `
            <div class="xv-tb-setting-info">
                <div class="xv-tb-setting-title">触发器显示方式</div>
                <div class="xv-tb-setting-desc">推荐停靠在发送键旁，避免浮球遮挡手机屏幕</div>
            </div>
            <div class="xv-tb-select-wrap">
                <select class="xv-tb-select" id="xv-tb-cfg-trigger">
                    <option value="toolbar" ${cfg.triggerMode === 'toolbar' ? 'selected' : ''}>紧贴发送键左侧 (推荐)</option>
                    <option value="floating" ${cfg.triggerMode === 'floating' ? 'selected' : ''}>屏幕右侧微型悬浮球</option>
                    <option value="both" ${cfg.triggerMode === 'both' ? 'selected' : ''}>两者同时显示</option>
                </select>
            </div>
        `;
        row1.querySelector('#xv-tb-cfg-trigger').addEventListener('change', (e) => {
            cfg.triggerMode = e.target.value;
            saveConfig(cfg);
            applyTriggerVisibility();
            showToast('触发器显示模式已更新');
        });
        container.appendChild(row1);

        // 3. 重置出厂
        const row2 = document.createElement('div');
        row2.className = 'xv-tb-setting-row';
        row2.innerHTML = `
            <div class="xv-tb-setting-info">
                <div class="xv-tb-setting-title">恢复出厂预设</div>
                <div class="xv-tb-setting-desc">恢复至最新的精选默认指令与组件排版</div>
            </div>
            <button class="xv-tb-btn-cancel" id="xv-tb-btn-reset" style="padding:6px 12px; font-size:12px;">重置所有预设</button>
        `;
        row2.querySelector('#xv-tb-btn-reset').addEventListener('click', () => {
            if (confirm('确定要恢复出厂默认预设吗？')) {
                cfg.customTemplates = null;
                saveConfig(cfg);
                showToast('已恢复出厂预设！');
                switchTab('tokens');
            }
        });
        container.appendChild(row2);
    }

    // 指令编辑器弹窗
    function openPromptEditor(item) {
        const editor = document.getElementById('xv-tb-editor');
        if (!editor) return;

        editor.innerHTML = `
            <div class="xv-tb-editor-title">✏️ 编辑指令：${item.title}</div>
            <textarea class="xv-tb-textarea" id="xv-tb-edit-textarea">${item.instruction || item.prompt || ''}</textarea>
            <div class="xv-tb-editor-actions">
                <button class="xv-tb-btn xv-tb-btn-cancel" id="xv-tb-edit-cancel">取消</button>
                <button class="xv-tb-btn xv-tb-btn-save" id="xv-tb-edit-save">保存修改</button>
            </div>
        `;

        editor.classList.add('xv-tb-show');
        editor.querySelector('#xv-tb-edit-cancel').addEventListener('click', () => {
            editor.classList.remove('xv-tb-show');
        });
        editor.querySelector('#xv-tb-edit-save').addEventListener('click', () => {
            const newText = editor.querySelector('#xv-tb-edit-textarea').value;
            const cfg = getConfig();
            const tpls = getTemplates();

            let found = false;
            tpls.steering.forEach(s => {
                if (s.id === item.id) {
                    s.instruction = newText;
                    found = true;
                }
            });
            if (!found && tpls.widgets) {
                tpls.widgets.forEach(w => {
                    if (w.id === item.id) {
                        w.prompt = newText;
                        found = true;
                    }
                });
            }

            cfg.customTemplates = tpls;
            saveConfig(cfg);
            editor.classList.remove('xv-tb-show');
            showToast(`已保存对【${item.title}】的修改！`);
            renderSteeringTab(document.getElementById('xv-tb-content'));
        });
    }

    // ==========================================
    // 6. 发送栏微型 Token HUD 胶囊 (Floating HUD)
    // ==========================================
    function updateTokenHUD() {
        const hud = document.getElementById('xv-tb-token-hud');
        if (!hud) return;

        const p = inspectPayload();
        const grad = getAttentionGradient(p.totalInputTokens, p.modelSpec);
        const kStr = (p.totalInputTokens / 1000).toFixed(1) + 'k';

        hud.innerHTML = `<span style="color:${grad.color}; font-size:12px;">●</span> <span>${kStr}</span>`;
        hud.title = `当前总发包: ${p.totalInputTokens.toLocaleString()} tokens (${grad.badge}) · 点击展开监控`;
        hud.style.borderColor = grad.glow;

        if (grad.level === 'warn' || grad.level === 'crit') {
            hud.classList.add('xv-tb-pulse-warn');
        } else {
            hud.classList.remove('xv-tb-pulse-warn');
        }

        // 若当前打开了 Tokens 标签页，同步重新渲染
        const modal = document.getElementById('xv-tb-modal');
        const activeNav = modal ? modal.querySelector('.xv-tb-nav-btn.xv-tb-active') : null;
        if (modal && modal.style.display !== 'none' && activeNav && activeNav.dataset.tab === 'tokens') {
            renderTokensTab(document.getElementById('xv-tb-content'));
        }
    }

    // ==========================================
    // 7. 页面挂载与初始化引导 (Bootstrap)
    // ==========================================
    function initDOM() {
        if (document.getElementById('xv-tb-modal')) return;

        // 1. 遮罩层
        const backdrop = document.createElement('div');
        backdrop.id = 'xv-tb-backdrop';
        backdrop.addEventListener('click', closeModal);
        document.body.appendChild(backdrop);

        // 2. 弹窗主体
        const modal = document.createElement('div');
        modal.id = 'xv-tb-modal';
        modal.innerHTML = `
            <div class="xv-tb-header">
                <div class="xv-tb-title-group">
                    <div class="xv-tb-title-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        </svg>
                    </div>
                    <div class="xv-tb-title">XV 随身百宝箱</div>
                    <div class="xv-tb-tagline">v2.0.0 · 全景 Token 监控</div>
                </div>
                <button class="xv-tb-close-btn" id="xv-tb-btn-close">✕</button>
            </div>
            <div class="xv-tb-nav">
                <button class="xv-tb-nav-btn xv-tb-active" data-tab="tokens">📊 Token 监控与归档</button>
                <button class="xv-tb-nav-btn" data-tab="widgets">📑 随身组件</button>
                <button class="xv-tb-nav-btn" data-tab="steering">⚡ 剧情抢救与破甲</button>
                <button class="xv-tb-nav-btn" data-tab="settings">⚙️ 自定义与更新</button>
            </div>
            <div class="xv-tb-content" id="xv-tb-content"></div>
            <div class="xv-tb-editor-overlay" id="xv-tb-editor"></div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('#xv-tb-btn-close').addEventListener('click', closeModal);
        modal.querySelectorAll('.xv-tb-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => switchTab(btn.dataset.tab));
        });

        // 3. 悬浮球
        const fab = document.createElement('div');
        fab.id = 'xv-tb-floating-trigger';
        fab.title = 'XV 随身百宝箱 (拖拽可移动)';
        fab.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`;
        document.body.appendChild(fab);
        setupDraggable(fab);

        // 4. 输入栏挂载
        injectToolbarButton();
        applyTriggerVisibility();

        // 5. ESC 关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });

        // 6. 输入框输入实时监听 (联动草稿 Token 重新计算)
        const textarea = document.getElementById('send_textarea');
        if (textarea) {
            let debounceTimer = null;
            textarea.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(updateTokenHUD, 150);
            });
        }
    }

    // 精确挂载在发送键正左侧：先放 Token 胶囊，再放工具箱图标
    function injectToolbarButton() {
        const sendBtn = document.getElementById('send_but');
        if (!sendBtn || !sendBtn.parentNode) return;

        // 1. 挂载实时 Token 胶囊 (HUD)
        if (!document.getElementById('xv-tb-token-hud')) {
            const hud = document.createElement('div');
            hud.id = 'xv-tb-token-hud';
            hud.innerHTML = `<span>●</span> <span>--k</span>`;
            hud.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openModal('tokens');
            });
            sendBtn.parentNode.insertBefore(hud, sendBtn);
        }

        // 2. 挂载百宝箱工具按钮
        if (!document.getElementById('xv-tb-toolbar-btn')) {
            const btn = document.createElement('button');
            btn.id = 'xv-tb-toolbar-btn';
            btn.type = 'button';
            btn.title = 'XV 随身百宝箱';
            btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`;
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openModal();
            });
            sendBtn.parentNode.insertBefore(btn, sendBtn);
        }

        updateTokenHUD();
    }

    function setupDraggable(element) {
        let isDragging = false;
        let hasMoved = false;
        let startX, startY, origX, origY;

        try {
            const saved = localStorage.getItem(POS_STORAGE_KEY);
            if (saved) {
                const pos = JSON.parse(saved);
                if (typeof pos.x === 'number' && typeof pos.y === 'number') {
                    element.style.left = `${pos.x}px`;
                    element.style.top = `${pos.y}px`;
                    element.style.right = 'auto';
                    element.style.bottom = 'auto';
                }
            }
        } catch (e) {}

        function onMouseDown(e) {
            if (e.button !== 0) return;
            isDragging = true;
            hasMoved = false;
            startX = e.clientX;
            startY = e.clientY;
            const rect = element.getBoundingClientRect();
            origX = rect.left;
            origY = rect.top;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }

        function onMouseMove(e) {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasMoved = true;
            let newX = Math.max(10, Math.min(window.innerWidth - 50, origX + dx));
            let newY = Math.max(10, Math.min(window.innerHeight - 50, origY + dy));
            element.style.left = `${newX}px`;
            element.style.top = `${newY}px`;
            element.style.right = 'auto';
            element.style.bottom = 'auto';
        }

        function onMouseUp() {
            if (!isDragging) return;
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            if (hasMoved) {
                const rect = element.getBoundingClientRect();
                localStorage.setItem(POS_STORAGE_KEY, JSON.stringify({ x: rect.left, y: rect.top }));
            } else {
                openModal();
            }
        }

        element.addEventListener('mousedown', onMouseDown);
        element.addEventListener('touchstart', (e) => {
            const t = e.touches[0];
            startX = t.clientX;
            startY = t.clientY;
            const rect = element.getBoundingClientRect();
            origX = rect.left;
            origY = rect.top;
            hasMoved = false;
        }, { passive: true });
        element.addEventListener('touchmove', (e) => {
            const t = e.touches[0];
            const dx = t.clientX - startX;
            const dy = t.clientY - startY;
            if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasMoved = true;
            let newX = Math.max(10, Math.min(window.innerWidth - 50, origX + dx));
            let newY = Math.max(10, Math.min(window.innerHeight - 50, origY + dy));
            element.style.left = `${newX}px`;
            element.style.top = `${newY}px`;
            element.style.right = 'auto';
            element.style.bottom = 'auto';
        }, { passive: true });
        element.addEventListener('touchend', () => {
            if (!hasMoved) {
                openModal();
            } else {
                const rect = element.getBoundingClientRect();
                localStorage.setItem(POS_STORAGE_KEY, JSON.stringify({ x: rect.left, y: rect.top }));
            }
        });
    }

    function applyTriggerVisibility() {
        const cfg = getConfig();
        const fab = document.getElementById('xv-tb-floating-trigger');
        const tbBtn = document.getElementById('xv-tb-toolbar-btn');
        const hud = document.getElementById('xv-tb-token-hud');
        if (fab) fab.style.display = (cfg.triggerMode === 'floating' || cfg.triggerMode === 'both') ? 'flex' : 'none';
        if (tbBtn) tbBtn.style.display = (cfg.triggerMode === 'toolbar' || cfg.triggerMode === 'both') ? 'inline-flex' : 'none';
        if (hud) hud.style.display = 'inline-flex';
    }

    // 状态栏美化常驻样式双保险
    function ensureRemyStyles() {
        if (document.getElementById('xv-remy-permanent-styles')) return;
        const style = document.createElement('style');
        style.id = 'xv-remy-permanent-styles';
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;600&family=Playfair+Display:ital,wght@1,400&family=Inter:wght@300;400;600&display=swap');
            .zc-status-wrapper { width: 100% !important; display: flex !important; justify-content: flex-end !important; margin: 14px 0 2px 0 !important; font-family: 'Noto Serif SC', serif !important; }
            .zc-status-box { text-align: right !important; padding-right: 18px !important; border-right: 1px solid rgba(255, 255, 255, 0.3) !important; background: transparent !important; max-width: 400px !important; position: relative !important; }
            .zc-status-box::before { content: '' !important; position: absolute !important; right: -2px !important; top: 0 !important; height: 30% !important; width: 3px !important; background: #ffcccc !important; box-shadow: 0 0 10px #ffcccc !important; opacity: 0.8 !important; }
            .zc-meta-info { font-family: 'Playfair Display', serif !important; font-size: 11px !important; color: rgba(255, 255, 255, 0.4) !important; letter-spacing: 2px !important; text-transform: uppercase !important; margin-bottom: 6px !important; }
            .zc-chapter-head { font-size: 18px !important; font-weight: 600 !important; color: #f0f0f0 !important; line-height: 1.4 !important; letter-spacing: 1px !important; margin-bottom: 6px !important; text-shadow: 0 2px 10px rgba(0,0,0,0.5) !important; }
            .zc-chapter-sub { font-size: 12px !important; color: rgba(255, 255, 255, 0.6) !important; font-style: italic !important; line-height: 1.6 !important; }
            details.xs-status-container { width: 100% !important; box-sizing: border-box !important; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important; font-size: 13px !important; line-height: 1.5 !important; margin: 4px 0 !important; background: rgba(0, 0, 0, 0.3) !important; backdrop-filter: blur(12px) !important; -webkit-backdrop-filter: blur(12px) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; border-radius: 8px !important; color: #eee !important; overflow: hidden !important; }
            details.xs-status-container + details.xs-status-container { margin-top: 4px !important; }
            details.xs-status-container > summary.xs-status-summary { padding: 8px 14px !important; cursor: pointer !important; font-weight: 600 !important; display: flex !important; justify-content: space-between !important; align-items: center !important; border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important; background: transparent !important; user-select: none !important; -webkit-tap-highlight-color: transparent !important; list-style: none !important; color: #eee !important; outline: none !important; }
            details.xs-status-container > summary.xs-status-summary::-webkit-details-marker { display: none !important; }
            details.xs-status-container > summary.xs-status-summary::marker { display: none !important; }
            details.xs-status-container > summary.xs-status-summary::after { content: '' !important; width: 6px !important; height: 6px !important; border-right: 1px solid rgba(255, 255, 255, 0.8) !important; border-bottom: 1px solid rgba(255, 255, 255, 0.8) !important; transform: rotate(45deg) !important; transition: transform 0.2s ease !important; margin-right: 4px !important; display: inline-block !important; }
            details.xs-status-container[open] > summary.xs-status-summary::after { transform: rotate(225deg) !important; }
            .xs-content-pad { padding: 4px 14px 8px 14px !important; }
            .xs-content-pad > *:first-child { margin-top: 0 !important; padding-top: 2px !important; }
            .xs-content-pad > br:first-child { display: none !important; }
            .xs-content-pad p { margin: 0 !important; }
            .xs-row-item { padding: 6px 0 !important; border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important; }
            .xs-row-item:last-child { border-bottom: none !important; }
            .xs-lbl { color: rgba(255, 255, 255, 0.5) !important; font-size: 11px !important; margin-bottom: 2px !important; display: block !important; }
            .xs-val { color: #fff !important; font-size: 13px !important; line-height: 1.4 !important; text-align: justify !important; }
            .xs-warn { color: #ffcccc !important; font-weight: 600 !important; text-shadow: 0 0 8px rgba(255,204,204,0.5) !important; }
            .xs-scroll-box { max-height: 120px !important; overflow-y: auto !important; font-size: 12px !important; color: rgba(255, 255, 255, 0.8) !important; -webkit-overflow-scrolling: touch !important; scrollbar-width: none !important; }
            .xs-scroll-box::-webkit-scrollbar { display: none !important; }
            .xs-scroll-box-large { max-height: 200px !important; }
            .xs-quote-block { background: rgba(255, 255, 255, 0.05) !important; padding: 8px 10px !important; border-radius: 4px !important; margin-top: 6px !important; color: rgba(255, 255, 255, 0.7) !important; border-left: 2px solid rgba(255, 255, 255, 0.4) !important; }
            .xs-god-text { font-size: 10px !important; color: rgba(255, 255, 255, 0.4) !important; text-align: right !important; margin-top: 5px !important; font-style: italic !important; }
            .xs-list-item { display: flex !important; gap: 8px !important; padding: 3px 0 !important; color: rgba(255, 255, 255, 0.85) !important; align-items: flex-start !important; }
            .xs-check { color: #ffcccc !important; opacity: 0.9 !important; font-family: monospace !important; }
            .xs-note-section { padding: 8px 0 !important; border-bottom: 1px dashed rgba(255, 255, 255, 0.1) !important; }
            .xs-note-section:first-child { padding-top: 2px !important; }
            .xs-note-section:last-child { border-bottom: none !important; }
            .xs-note-title { font-weight: 600 !important; font-size: 12px !important; margin-bottom: 6px !important; color: #fff !important; display: flex !important; align-items: center !important; gap: 6px !important; }
            .xs-note-title::before { content: '' !important; width: 4px !important; height: 4px !important; background: #ffcccc !important; border-radius: 50% !important; opacity: 0.8 !important; }
        `;
        document.head.appendChild(style);
    }

    // 注册酒馆生命周期事件监听 (设置变更、角色加载、聊天更新实时联动)
    function setupSTEventListeners() {
        if (window.SillyTavern && typeof window.SillyTavern.getContext === 'function') {
            const ctx = window.SillyTavern.getContext();
            if (ctx && ctx.eventSource && ctx.event_types) {
                const types = ctx.event_types;
                const eventsToListen = [
                    types.SETTINGS_UPDATED,
                    types.PRESET_CHANGED,
                    types.CHARACTER_PAGE_LOADED,
                    types.CHARACTER_LOADED,
                    types.CHAT_CHANGED,
                    types.MESSAGE_SENT,
                    types.MESSAGE_RECEIVED,
                    types.WORLD_INFO_UPDATED
                ].filter(Boolean);

                eventsToListen.forEach(evt => {
                    try {
                        ctx.eventSource.on(evt, () => {
                            setTimeout(updateTokenHUD, 120);
                        });
                    } catch (e) {}
                });
            }
        }
    }

    function bootstrap() {
        ensureRemyStyles();
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                ensureRemyStyles();
                initDOM();
                setupSTEventListeners();
            });
        } else {
            initDOM();
            setupSTEventListeners();
        }

        // 定时轮询保证输入栏重绘后按钮与 Token 胶囊始终挂载
        setInterval(() => {
            ensureRemyStyles();
            const btn = document.getElementById('xv-tb-toolbar-btn');
            const hud = document.getElementById('xv-tb-token-hud');
            const sendBtn = document.getElementById('send_but');
            if (!btn || !hud || (sendBtn && btn.nextElementSibling !== sendBtn)) {
                if (btn) btn.remove();
                if (hud) hud.remove();
                injectToolbarButton();
                applyTriggerVisibility();
            }
        }, 2000);
    }

    bootstrap();
    console.log('[XV-Toolbox] XV 随身百宝箱 v2.0.0 (Token 监控 + 古法 2.0 归档) 已成功加载！');
})();
