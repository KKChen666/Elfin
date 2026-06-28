"""
聊天记录 NLP 分析服务
从 ChatImport.tsx 迁移到 Python
"""
import re
from collections import Counter
from datetime import datetime


# 中文标点
PUNCTUATION_RE = re.compile(r"[，。！？、；：“”‘’（）【】…—\-~.,!?;:'\"()\[\]]")
# 表情符号
EMOJI_RE = re.compile(
    r"[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF"
    r"\U0001F1E0-\U0001F1FF\U00002702-\U000027B0\U000024C2-\U0001F251]+",
    flags=re.UNICODE,
)
# 聊天记录格式：YYYY-MM-DD HH:MM:SS 发送者: 消息
CHAT_LINE_RE = re.compile(
    r"(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+(.+?)[:：]\s*(.+)"
)

# 语气词
TONE_WORDS = [
    "呢", "吧", "啊", "呀", "哦", "噢", "嗯", "嘛", "哈哈", "嘻嘻",
    "嘿嘿", "哎", "唉", "哇", "呗", "呵", "额", "呃", "哼", "切",
]

# 问候词
GREETING_KEYWORDS = ["你好", "hi", "hello", "嗨", "早", "早上好", "晚上好", "下午好", "在吗"]
# 告别词
FAREWELL_KEYWORDS = ["再见", "拜拜", "bye", "晚安", "下次见", "回见", "走了"]
# 提问词
QUESTION_KEYWORDS = ["吗", "呢", "？", "?", "什么", "怎么", "为什么", "哪", "谁", "几", "多少"]
# 认同词
AGREEMENT_KEYWORDS = ["好的", "行", "可以", "没问题", "对", "是的", "嗯嗯", "ok", "好吧"]
# 犹豫词
HESITATION_KEYWORDS = ["额", "呃", "emmm", "这个", "那个", "怎么说", "可能", "大概"]
# 笑词
LAUGHTER_KEYWORDS = ["哈哈", "哈哈哈", "233", "笑死", "lol", "😂", "🤣", "嘻嘻", "嘿嘿"]


def parse_chat_file(content: str) -> list[dict]:
    """解析聊天记录文件"""
    lines = content.strip().split("\n")
    messages = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        match = CHAT_LINE_RE.match(line)
        if match:
            timestamp_str, sender, message = match.groups()
            messages.append({
                "timestamp": timestamp_str.strip(),
                "sender": sender.strip(),
                "content": message.strip(),
            })
    return messages


def identify_speakers(messages: list[dict]) -> tuple[str, str]:
    """识别两个说话人"""
    sender_counts = Counter(m["sender"] for m in messages)
    speakers = sender_counts.most_common(2)
    if len(speakers) < 2:
        return (speakers[0][0], "我") if speakers else ("对方", "我")
    return speakers[0][0], speakers[1][0]


def extract_words(text: str) -> list[str]:
    """提取中文词语（简单分词）"""
    # 移除标点
    clean = PUNCTUATION_RE.sub(" ", text)
    # 提取中文词组（2-4字）
    words = re.findall(r"[一-鿿]{2,4}", clean)
    return words


def extract_emojis(text: str) -> list[str]:
    """提取表情符号"""
    return EMOJI_RE.findall(text)


def analyze_chat_style(messages: list[dict], target_sender: str) -> dict:
    """
    分析目标说话人的聊天风格
    返回 ChatStyle 对象
    """
    target_msgs = [m for m in messages if m["sender"] == target_sender]
    if not target_msgs:
        return {}

    contents = [m["content"] for m in target_msgs]
    all_text = " ".join(contents)

    # === 基础特征 ===
    # 高频词
    all_words = []
    for content in contents:
        all_words.extend(extract_words(content))
    word_counter = Counter(all_words)
    high_frequency_words = [w for w, _ in word_counter.most_common(20)]

    # 常用表情
    all_emojis = []
    for content in contents:
        all_emojis.extend(extract_emojis(content))
    emoji_counter = Counter(all_emojis)
    common_emojis = [e for e, _ in emoji_counter.most_common(10)]

    # 语气词
    tone_words_found = []
    for tw in TONE_WORDS:
        if tw in all_text:
            tone_words_found.append(tw)

    # 平均消息长度
    msg_lengths = [len(c) for c in contents]
    avg_message_length = sum(msg_lengths) / len(msg_lengths) if msg_lengths else 0

    # 性格分类
    if avg_message_length > 20:
        personality = "话多型"
    elif avg_message_length < 8:
        personality = "惜字如金型"
    else:
        personality = "均衡型"

    # 句式模式（提取常用短句模板）
    sentence_patterns = []
    for content in contents:
        if 4 <= len(content) <= 15:
            sentence_patterns.append(content)
    sentence_counter = Counter(sentence_patterns)
    sentence_patterns = [s for s, c in sentence_counter.most_common(10) if c >= 2]

    # 风格关键词
    style_keywords = []
    if any("~" in c for c in contents):
        style_keywords.append("喜欢用波浪号")
    if any("！" in c for c in contents):
        style_keywords.append("感叹号较多")
    if any("..." in c or "…" in c for c in contents):
        style_keywords.append("常用省略号")
    if len(common_emojis) > 3:
        style_keywords.append("表情丰富")
    if personality == "惜字如金型":
        style_keywords.append("回复简洁")
    elif personality == "话多型":
        style_keywords.append("话多")

    # === 高级特征 ===
    # 语言风格
    formal_indicators = ["您", "请问", "谢谢", "不好意思"]
    casual_indicators = ["哈哈", "嗯嗯", "哦", "嘛", "呗"]
    formal_count = sum(1 for fi in formal_indicators if fi in all_text)
    casual_count = sum(1 for ci in casual_indicators if ci in all_text)
    if formal_count > casual_count * 2:
        language_style = "formal"
    elif casual_count > formal_count * 2:
        language_style = "casual"
    else:
        language_style = "mixed"

    # 情感倾向
    positive_words = ["开心", "高兴", "太好了", "棒", "厉害", "赞", "nice", "好", "幸福"]
    negative_words = ["难过", "伤心", "生气", "烦", "累", "崩溃", "无语", "郁闷"]
    pos_count = sum(1 for pw in positive_words if pw in all_text)
    neg_count = sum(1 for nw in negative_words if nw in all_text)
    if pos_count > neg_count * 1.5:
        sentiment = "positive"
    elif neg_count > pos_count * 1.5:
        sentiment = "negative"
    else:
        sentiment = "neutral"

    # 活跃时段
    active_hours = []
    for m in target_msgs:
        try:
            hour = int(m["timestamp"].split(" ")[1].split(":")[0])
            active_hours.append(hour)
        except (IndexError, ValueError):
            pass
    hour_counter = Counter(active_hours)
    active_hours_sorted = [h for h, _ in hour_counter.most_common(5)]

    # 回复长度模式
    short_count = sum(1 for l in msg_lengths if l < 5)
    medium_count = sum(1 for l in msg_lengths if 5 <= l < 20)
    long_count = sum(1 for l in msg_lengths if l >= 20)
    total = len(msg_lengths)
    response_length_pattern = (
        "short" if short_count > total * 0.6
        else "long" if long_count > total * 0.4
        else "medium"
    )

    # 话题偏好（从高频词推断）
    topic_preferences = high_frequency_words[:5]

    # 各类模式提取
    def extract_patterns(keywords: list[str], limit: int = 5) -> list[str]:
        patterns = []
        for content in contents:
            for kw in keywords:
                if kw in content and content not in patterns:
                    patterns.append(content)
                    break
            if len(patterns) >= limit:
                break
        return patterns

    greeting_patterns = extract_patterns(GREETING_KEYWORDS)
    farewell_patterns = extract_patterns(FAREWELL_KEYWORDS)
    question_patterns = extract_patterns(QUESTION_KEYWORDS)
    agreement_patterns = extract_patterns(AGREEMENT_KEYWORDS)
    hesitation_patterns = extract_patterns(HESITATION_KEYWORDS)
    laughter_patterns = extract_patterns(LAUGHTER_KEYWORDS)

    # 标点风格
    punctuation_style = {
        "useTilde": any("~" in c for c in contents),
        "useExclamation": sum(1 for c in contents if "！" in c or "!" in c) > len(contents) * 0.2,
        "useEllipsis": any("..." in c or "…" in c for c in contents),
        "useQuestion": sum(1 for c in contents if "？" in c or "?" in c) > len(contents) * 0.15,
    }

    # === 深度特征 ===
    # 真实回复模式
    real_reply_patterns = {
        "greeting": [m["content"] for m in target_msgs if any(kw in m["content"] for kw in GREETING_KEYWORDS)][:5],
        "farewell": [m["content"] for m in target_msgs if any(kw in m["content"] for kw in FAREWELL_KEYWORDS)][:5],
        "question": [m["content"] for m in target_msgs if any(kw in m["content"] for kw in QUESTION_KEYWORDS)][:5],
        "agreement": [m["content"] for m in target_msgs if any(kw in m["content"] for kw in AGREEMENT_KEYWORDS)][:5],
        "laughter": [m["content"] for m in target_msgs if any(kw in m["content"] for kw in LAUGHTER_KEYWORDS)][:5],
        "comfort": [],
        "surprise": [],
        "positive": [m["content"] for m in target_msgs if any(kw in m["content"] for kw in positive_words)][:5],
        "negative": [m["content"] for m in target_msgs if any(kw in m["content"] for kw in negative_words)][:5],
        "general": [c for c in contents if len(c) < 10][:10],
    }

    # 句式模板（提取含{内容}的模式）
    sentence_templates = []
    for content in contents:
        if len(content) > 6:
            # 将具体内容替换为占位符
            template = content
            for word in high_frequency_words[:5]:
                if word in template:
                    template = template.replace(word, "{内容}", 1)
                    if template not in sentence_templates:
                        sentence_templates.append(template)
                    break

    # 沟通特征
    question_count = sum(1 for c in contents if any(kw in c for kw in QUESTION_KEYWORDS))
    emoji_msg_count = sum(1 for c in contents if EMOJI_RE.search(c))
    very_short_count = sum(1 for c in contents if len(c) <= 3)
    initiative_count = 0
    for i, m in enumerate(messages):
        if m["sender"] == target_sender:
            if i == 0 or messages[i - 1]["sender"] == target_sender:
                initiative_count += 1
    emoji_ratio = emoji_msg_count / len(contents) if contents else 0
    question_ratio = question_count / len(contents) if contents else 0
    communication_traits = {
        "questionFrequency": "high" if question_ratio > 0.3 else "low",
        "emojiFrequency": "high" if emoji_ratio > 0.4 else ("medium" if emoji_ratio > 0.2 else "low"),
        "avgReplyLength": round(avg_message_length, 1),
        "isInitiator": initiative_count > len(target_msgs) * 0.3,
        "usesVoiceMessages": very_short_count > len(contents) * 0.3,
    }

    # 表达 DNA
    expression_dna = []
    if punctuation_style["useTilde"]:
        expression_dna.append("喜欢用波浪号~")
    if punctuation_style["useExclamation"]:
        expression_dna.append("经常用感叹号表达情绪")
    if punctuation_style["useEllipsis"]:
        expression_dna.append("常用省略号表示思考或犹豫")
    if any("重复" in str(word_counter.most_common(5))):
        expression_dna.append("喜欢重复用字加强语气")
    if personality == "惜字如金型":
        expression_dna.append("多数回复很简短，惜字如金")
    if len(common_emojis) > 5:
        expression_dna.append("表情丰富")

    return {
        "highFrequencyWords": high_frequency_words,
        "commonEmojis": common_emojis,
        "sentencePatterns": sentence_patterns,
        "toneWords": tone_words_found,
        "avgMessageLength": round(avg_message_length, 1),
        "personality": personality,
        "styleKeywords": style_keywords,
        "languageStyle": language_style,
        "sentiment": sentiment,
        "topicPreferences": topic_preferences,
        "activeHours": active_hours_sorted,
        "responseLengthPattern": response_length_pattern,
        "greetingPatterns": greeting_patterns,
        "farewellPatterns": farewell_patterns,
        "questionPatterns": question_patterns,
        "agreementPatterns": agreement_patterns,
        "hesitationPatterns": hesitation_patterns,
        "laughterPatterns": laughter_patterns,
        "punctuationStyle": punctuation_style,
        "realReplyPatterns": real_reply_patterns,
        "sentenceTemplates": sentence_templates[:10],
        "communicationTraits": communication_traits,
        "expressionDNA": expression_dna,
    }
