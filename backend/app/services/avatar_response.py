"""
AI 分身回复生成引擎
从 chatUtils.ts 迁移到 Python
"""
import random
import re

# 消息分类关键词
CATEGORY_KEYWORDS = {
    "farewell": ["再见", "拜拜", "bye", "晚安", "下次见", "回见", "走了", "先这样", "挂了", "下线了"],
    "greeting": ["你好", "hi", "hello", "嗨", "早", "早上好", "晚上好", "下午好", "在吗", "在不在", "hey"],
    "question": ["吗", "呢", "？", "?", "什么", "怎么", "为什么", "哪", "谁", "几", "多少", "是不是", "能不能", "会不会"],
    "surprise": ["啊", "哇", "天", "我去", "不是吧", "真的吗", "假的吧", "卧槽", "我靠", "震惊"],
    "laughter": ["哈哈", "哈哈哈", "233", "笑死", "lol", "😂", "🤣", "嘻嘻", "嘿嘿", "噗"],
    "agreement": ["好的", "行", "可以", "没问题", "对", "是的", "嗯嗯", "ok", "好吧", "收到", "了解"],
    "comfort": ["别担心", "没事", "会好的", "加油", "辛苦了", "抱抱", "心疼", "别难过", "挺住"],
    "positive": ["开心", "高兴", "太好了", "棒", "厉害", "赞", "nice", "开心", "幸福", "感谢", "谢谢"],
    "negative": ["难过", "伤心", "生气", "烦", "累", "崩溃", "无语", "郁闷", "烦死了", "讨厌"],
}

# 基础回复模板
BASE_REPLIES = {
    "greeting": {
        "casual": ["嗨~", "来啦", "在呢", "来来来"],
        "formal": ["你好", "在的", "你好呀"],
    },
    "farewell": {
        "casual": ["拜拜~", "下次聊", "走了哈", "拜~"],
        "formal": ["再见", "下次见", "保重"],
    },
    "question": {
        "casual": ["嗯？", "怎么啦", "啥事", "说"],
        "formal": ["请问是？", "有什么事吗"],
    },
    "agreement": {
        "casual": ["嗯嗯", "好嘞", "行行行", "OK~"],
        "formal": ["好的", "没问题", "收到"],
    },
    "comfort": {
        "casual": ["抱抱~", "没事没事", "会好的"],
        "formal": ["别担心", "一切都会好起来的"],
    },
    "positive": {
        "casual": ["嘿嘿", "嘻嘻", "太棒了"],
        "formal": ["真好", "很高兴听到这个"],
    },
    "negative": {
        "casual": ["唉", "心疼", "抱抱"],
        "formal": ["别太难过了", "希望你能好起来"],
    },
    "laughter": {
        "casual": ["哈哈哈", "笑死", "233"],
        "formal": ["哈哈", "真有趣"],
    },
    "surprise": {
        "casual": ["不是吧", "真的假的", "哇"],
        "formal": ["真的吗", "这太令人惊讶了"],
    },
    "general": {
        "casual": ["嗯嗯", "是嘛", "这样啊", "哦哦"],
        "formal": ["明白了", "了解了", "是这样的"],
    },
}


def detect_category(message: str) -> str:
    """检测消息类别"""
    priority = [
        "farewell", "greeting", "question", "surprise",
        "laughter", "agreement", "comfort", "positive", "negative",
    ]
    for category in priority:
        for keyword in CATEGORY_KEYWORDS.get(category, []):
            if keyword in message:
                return category
    return "general"


def get_style_variant(chat_style: dict | None) -> str:
    """根据语言风格返回 casual/formal"""
    if not chat_style:
        return "casual"
    lang_style = chat_style.get("languageStyle", "casual")
    if lang_style == "formal":
        return "formal"
    return "casual"


def fill_template(template: str, user_message: str, chat_style: dict | None) -> str:
    """填充句式模板中的占位符"""
    words = re.findall(r"[一-鿿]+", user_message)
    hf_words = (chat_style or {}).get("highFrequencyWords", [])

    result = template
    placeholders = re.findall(r"\{内容\}", result)
    for _ in placeholders:
        if words:
            result = result.replace("{内容}", random.choice(words), 1)
        elif hf_words:
            result = result.replace("{内容}", random.choice(hf_words), 1)
        else:
            result = result.replace("{内容}", "这个", 1)
    return result


def embellish(reply: str, chat_style: dict | None) -> str:
    """用高频词、表情、语气词装饰回复"""
    if not chat_style:
        return reply

    # 添加高频词（30% 概率）
    hf_words = chat_style.get("highFrequencyWords", [])
    if hf_words and random.random() < 0.3:
        reply += random.choice(hf_words)

    # 添加表情（根据 emoji 频率）
    emojis = chat_style.get("commonEmojis", [])
    comm_traits = chat_style.get("communicationTraits", {})
    emoji_freq = comm_traits.get("emojiFrequency", "low")
    emoji_chance = {"high": 0.5, "medium": 0.25, "low": 0.1}.get(emoji_freq, 0.1)
    if emojis and random.random() < emoji_chance:
        reply += random.choice(emojis)

    # 添加语气词（20% 概率）
    tone_words = chat_style.get("toneWords", [])
    expression_dna = chat_style.get("expressionDNA", [])
    if tone_words and random.random() < 0.2:
        tone = random.choice(tone_words)
        # 如果 expressionDNA 包含"喜欢用波浪号"，加波浪号
        if any("波浪号" in dna for dna in expression_dna):
            tone = tone.rstrip("~") + "~"
        reply += tone

    return reply


def apply_punctuation(reply: str, chat_style: dict | None) -> str:
    """应用标点风格"""
    if not chat_style:
        return reply

    punc_style = chat_style.get("punctuationStyle", {})
    expression_dna = chat_style.get("expressionDNA", [])

    if punc_style.get("useTilde") or any("波浪号" in dna for dna in expression_dna):
        if random.random() < 0.4:
            reply = reply.rstrip("。！？~") + "~"

    if punc_style.get("useExclamation"):
        if random.random() < 0.3:
            reply = reply.rstrip("。！？~") + "！"

    if punc_style.get("useEllipsis"):
        if random.random() < 0.25:
            reply = reply.rstrip("。！？~") + "..."

    return reply


def apply_expression_dna(reply: str, chat_style: dict | None) -> str:
    """应用表达 DNA 特征"""
    if not chat_style:
        return reply

    expression_dna = chat_style.get("expressionDNA", [])

    # 词语重复强调（如"好好好"）
    if any("重复" in dna for dna in expression_dna):
        if random.random() < 0.2:
            chars = list(reply)
            if len(chars) > 2:
                idx = random.randint(0, len(chars) - 2)
                chars.insert(idx + 1, chars[idx])
                reply = "".join(chars)

    # 反问句
    if any("反问" in dna for dna in expression_dna):
        if random.random() < 0.15:
            reply += "？"

    return reply


def calibrate_by_traits(reply: str, chat_style: dict | None) -> str:
    """根据沟通特征校准回复"""
    if not chat_style:
        return reply

    personality = chat_style.get("personality", "均衡型")

    # 简洁型：截短回复
    if personality == "惜字如金型":
        if len(reply) > 10:
            reply = reply[:8] + "..."
    # 话痨型：添加追问
    elif personality == "话多型":
        follow_ups = ["你呢？", "你觉得呢？", "然后呢？", "怎么说？"]
        if random.random() < 0.3:
            reply += random.choice(follow_ups)

    return reply


def generate_avatar_response(
    user_message: str,
    chat_style: dict | None = None,
    recent_messages: list[dict] | None = None,
    memory_chunks: list[dict] | None = None,
) -> str:
    """
    生成 AI 分身回复（主入口）
    多层优先级策略：
    1. 优先使用真实回复模式（realReplyPatterns）
    2. 其次使用检测到的表达习惯
    3. 最后使用组合回复
    """
    category = detect_category(user_message)
    variant = get_style_variant(chat_style)

    # Tier 0: 相似历史片段。真实相似语境比抽象风格更可靠。
    if memory_chunks:
        for chunk in memory_chunks[:3]:
            reply = (chunk.get("reply") or "").strip()
            if not reply:
                continue
            if _is_usable_memory_reply(reply, user_message, chat_style):
                reply = apply_punctuation(reply, chat_style)
                return calibrate_by_traits(reply, chat_style)

    # Tier 1: 真实回复模式（70% 概率）
    if chat_style and random.random() < 0.7:
        real_patterns = chat_style.get("realReplyPatterns", {})
        candidates = real_patterns.get(category, [])
        if candidates:
            return random.choice(candidates)

    # Tier 2: 检测到的表达模式（50% 概率）
    if chat_style and random.random() < 0.5:
        pattern_map = {
            "greeting": "greetingPatterns",
            "farewell": "farewellPatterns",
            "question": "questionPatterns",
            "agreement": "agreementPatterns",
            "laughter": "laughterPatterns",
        }
        pattern_key = pattern_map.get(category)
        if pattern_key:
            patterns = chat_style.get(pattern_key, [])
            if patterns:
                return random.choice(patterns)

    # Tier 3: 简洁型用户的真实通用回复（60% 概率）
    if chat_style and chat_style.get("personality") == "惜字如金型":
        if random.random() < 0.6:
            real_patterns = chat_style.get("realReplyPatterns", {})
            generals = real_patterns.get("general", [])
            if generals:
                return random.choice(generals)

    # Tier 4: 组合回复
    # 策略 1: 填充句式模板（35% 概率）
    if chat_style and random.random() < 0.35:
        templates = chat_style.get("sentenceTemplates", [])
        if templates:
            template = random.choice(templates)
            reply = fill_template(template, user_message, chat_style)
            reply = embellish(reply, chat_style)
            reply = apply_punctuation(reply, chat_style)
            return calibrate_by_traits(reply, chat_style)

    # 策略 2: 装饰通用回复（40% 概率）
    if random.random() < 0.4:
        base = BASE_REPLIES.get(category, BASE_REPLIES["general"])
        reply = random.choice(base.get(variant, base["casual"]))
        reply = embellish(reply, chat_style)
        reply = apply_punctuation(reply, chat_style)
        reply = apply_expression_dna(reply, chat_style)
        return calibrate_by_traits(reply, chat_style)

    # 策略 3: 上下文感知回复（30% 概率）
    if recent_messages and random.random() < 0.3:
        context_replies = ["嗯嗯", "是的", "对对对", "没错", "确实"]
        reply = random.choice(context_replies)
        reply = embellish(reply, chat_style)
        return calibrate_by_traits(reply, chat_style)

    # 策略 4: 基础回复（兜底）
    base = BASE_REPLIES.get(category, BASE_REPLIES["general"])
    reply = random.choice(base.get(variant, base["casual"]))
    reply = apply_punctuation(reply, chat_style)
    return calibrate_by_traits(reply, chat_style)


def _is_usable_memory_reply(reply: str, user_message: str, chat_style: dict | None) -> bool:
    if len(reply) > 120:
        return False
    if user_message.strip() == reply:
        return False
    personality = (chat_style or {}).get("personality")
    if personality == "惜字如金型":
        return len(reply) <= 24
    if personality == "话多型":
        return len(reply) >= 2
    return 1 <= len(reply) <= 60
