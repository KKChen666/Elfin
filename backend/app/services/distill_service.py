"""
蒸馏服务 - 从聊天记录中提取 Skill
借鉴 OpenHuman 的记忆树概念和 NuWa-Skill 的技能结构
"""
from sqlalchemy.orm import Session
from app.models.relative import Relative
from app.models.skill import Skill
from app.services.chat_analysis import parse_chat_file, identify_speakers, analyze_chat_style


def distill_from_relative(db: Session, user_id: int, relative_id: int) -> Skill:
    """
    从亲友的聊天记录中蒸馏出 Skill
    """
    relative = (
        db.query(Relative)
        .filter(Relative.id == relative_id, Relative.user_id == user_id)
        .first()
    )
    if not relative:
        raise ValueError("亲友不存在")
    if not relative.chat_style:
        raise ValueError("该亲友尚未导入聊天记录")

    chat_style = relative.chat_style

    # 提取人格特征
    personality = {
        "type": chat_style.get("personality", "均衡型"),
        "traits": chat_style.get("expressionDNA", []),
        "sentiment": chat_style.get("sentiment", "neutral"),
    }

    # 提取沟通风格
    communication_style = {
        "language_style": chat_style.get("languageStyle", "mixed"),
        "punctuation": chat_style.get("punctuationStyle", {}),
        "tone_words": chat_style.get("toneWords", []),
        "avg_message_length": chat_style.get("avgMessageLength", 0),
        "response_pattern": chat_style.get("responseLengthPattern", "medium"),
    }

    # 提取知识领域（从高频词推断）
    knowledge_domains = chat_style.get("topicPreferences", [])

    # 提取表达模式
    expression_patterns = {
        "greeting": chat_style.get("greetingPatterns", []),
        "farewell": chat_style.get("farewellPatterns", []),
        "question": chat_style.get("questionPatterns", []),
        "agreement": chat_style.get("agreementPatterns", []),
        "laughter": chat_style.get("laughterPatterns", []),
        "real_replies": chat_style.get("realReplyPatterns", {}),
        "sentence_templates": chat_style.get("sentenceTemplates", []),
    }

    # 构建记忆树（关键记忆点）
    memory_tree = _build_memory_tree(chat_style)

    # 生成系统提示词
    system_prompt = _generate_system_prompt(
        relative.name, personality, communication_style,
        knowledge_domains, expression_patterns, memory_tree
    )

    # 创建 Skill
    skill = Skill(
        user_id=user_id,
        name=f"{relative.name}的沟通风格",
        description=f"从与{relative.name}的聊天记录中蒸馏出的沟通技能",
        source_type="chat_import",
        source_relative_id=relative_id,
        personality=personality,
        communication_style=communication_style,
        knowledge_domains=knowledge_domains,
        expression_patterns=expression_patterns,
        memory_tree=memory_tree,
        system_prompt=system_prompt,
    )
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


def _build_memory_tree(chat_style: dict) -> list:
    """
    构建记忆树 - 借鉴 OpenHuman 的概念
    提取关键的对话模式和记忆点
    """
    memories = []

    # 从真实回复模式中提取记忆
    real_replies = chat_style.get("realReplyPatterns", {})
    for category, replies in real_replies.items():
        if replies:
            memories.append({
                "type": "response_pattern",
                "category": category,
                "examples": replies[:3],
                "frequency": "high" if len(replies) > 3 else "medium",
            })

    # 从句式模板中提取记忆
    templates = chat_style.get("sentenceTemplates", [])
    if templates:
        memories.append({
            "type": "sentence_template",
            "templates": templates[:5],
            "description": "常用句式结构",
        })

    # 从表达DNA中提取记忆
    expression_dna = chat_style.get("expressionDNA", [])
    if expression_dna:
        memories.append({
            "type": "expression_habit",
            "habits": expression_dna,
            "description": "独特表达习惯",
        })

    return memories


def _generate_system_prompt(
    name: str,
    personality: dict,
    communication_style: dict,
    knowledge_domains: list,
    expression_patterns: dict,
    memory_tree: list,
) -> str:
    """生成 Agent 的系统提示词"""
    prompt_parts = [
        f"你是{name}的数字分身，必须完全模仿{name}的说话方式。以下是{name}的沟通特征：",
        "",
        "## 人格特征",
        f"- 性格类型：{personality['type']}",
        f"- 情感倾向：{personality['sentiment']}",
    ]

    if personality.get("traits"):
        prompt_parts.append(f"- 表达特点：{'、'.join(personality['traits'][:5])}")

    prompt_parts.extend([
        "",
        "## 沟通风格",
        f"- 语言风格：{communication_style['language_style']}",
        f"- 平均回复长度：{'简短（1-5字）' if communication_style['avg_message_length'] < 10 else '适中（5-20字）' if communication_style['avg_message_length'] < 20 else '较长（20字以上）'}",
    ])

    if communication_style.get("tone_words"):
        prompt_parts.append(f"- 常用语气词：{'、'.join(communication_style['tone_words'][:5])}")

    # 标点风格
    punctuation = communication_style.get("punctuation", {})
    punc_habits = []
    if punctuation.get("useTilde"):
        punc_habits.append("喜欢用波浪号~")
    if punctuation.get("useExclamation"):
        punc_habits.append("常用感叹号！")
    if punctuation.get("useEllipsis"):
        punc_habits.append("常用省略号...")
    if punc_habits:
        prompt_parts.append(f"- 标点习惯：{'、'.join(punc_habits)}")

    if knowledge_domains:
        prompt_parts.extend([
            "",
            "## 常聊话题",
            f"- {'、'.join(knowledge_domains[:5])}",
        ])

    # 问候/告别习惯
    greeting_patterns = expression_patterns.get("greeting", [])
    farewell_patterns = expression_patterns.get("farewell", [])
    if greeting_patterns:
        prompt_parts.extend([
            "",
            "## 问候方式",
            f"- 常用：{'、'.join(greeting_patterns[:3])}",
        ])
    if farewell_patterns:
        prompt_parts.extend([
            "",
            "## 告别方式",
            f"- 常用：{'、'.join(farewell_patterns[:3])}",
        ])

    # 真实回复示例
    real_replies = expression_patterns.get("real_replies", {})
    if real_replies:
        prompt_parts.extend([
            "",
            "## 回复风格参考（模仿这些回复的语气和长度）",
        ])
        for category, replies in real_replies.items():
            if replies:
                prompt_parts.append(f"- {category}类：{'、'.join(replies[:3])}")

    # 句式模板
    sentence_templates = expression_patterns.get("sentence_templates", [])
    if sentence_templates:
        prompt_parts.extend([
            "",
            "## 常用句式",
            f"- {'、'.join(sentence_templates[:3])}",
        ])

    prompt_parts.extend([
        "",
        "## 回复要求",
        f"1. 你就是{name}，用第一人称回复",
        f"2. 保持{name}的说话风格、语气和回复长度",
        "3. 使用相似的表情符号和语气词",
        "4. 保持自然、真实的对话感",
        "5. 不要暴露自己是AI，像真人一样聊天",
    ])

    return "\n".join(prompt_parts)


def merge_skills(db: Session, user_id: int, skill_ids: list[int], new_name: str) -> Skill:
    """合并多个 Skill 为一个"""
    skills = (
        db.query(Skill)
        .filter(Skill.id.in_(skill_ids), Skill.user_id == user_id)
        .all()
    )
    if len(skills) < 2:
        raise ValueError("至少需要2个技能才能合并")

    # 合并人格特征
    merged_personality = {
        "type": skills[0].personality.get("type", "均衡型") if skills[0].personality else "均衡型",
        "traits": [],
        "sentiment": "mixed",
    }
    for skill in skills:
        if skill.personality and skill.personality.get("traits"):
            merged_personality["traits"].extend(skill.personality["traits"])
    merged_personality["traits"] = list(set(merged_personality["traits"]))[:10]

    # 合并沟通风格（取第一个作为基础）
    merged_communication = skills[0].communication_style or {}

    # 合并知识领域
    merged_domains = []
    for skill in skills:
        if skill.knowledge_domains:
            merged_domains.extend(skill.knowledge_domains)
    merged_domains = list(set(merged_domains))[:10]

    # 合并表达模式
    merged_patterns = {}
    for skill in skills:
        if skill.expression_patterns:
            for key, value in skill.expression_patterns.items():
                if key not in merged_patterns:
                    merged_patterns[key] = []
                if isinstance(value, list):
                    merged_patterns[key].extend(value)
                else:
                    merged_patterns[key].append(value)

    # 合并记忆树
    merged_memories = []
    for skill in skills:
        if skill.memory_tree:
            merged_memories.extend(skill.memory_tree)

    # 生成合并后的系统提示词
    names = [s.name for s in skills]
    system_prompt = _generate_system_prompt(
        new_name,
        merged_personality,
        merged_communication,
        merged_domains,
        merged_patterns,
        merged_memories,
    )

    # 创建合并后的 Skill
    merged_skill = Skill(
        user_id=user_id,
        name=new_name,
        description=f"合并自：{', '.join(names)}",
        source_type="merge",
        personality=merged_personality,
        communication_style=merged_communication,
        knowledge_domains=merged_domains,
        expression_patterns=merged_patterns,
        memory_tree=merged_memories,
        system_prompt=system_prompt,
    )
    db.add(merged_skill)
    db.commit()
    db.refresh(merged_skill)
    return merged_skill
