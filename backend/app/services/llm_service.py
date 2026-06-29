"""LLM 服务 - 通过 hello-agents 统一接入各供应商模型"""
import random
import re
from app.config import settings


async def chat_completion(
    messages: list[dict],
    model: str = "gpt-3.5-turbo",
    temperature: float = 0.7,
    max_tokens: int = 1000,
    stream: bool = False,
    api_key: str | None = None,
    api_base: str | None = None,
    timeout: int | None = None,
) -> dict | str:
    """
    调用 hello-agents 统一 LLM 接口
    messages: [{"role": "system"/"user"/"assistant", "content": "..."}]
    """
    if not api_key:
        return _mock_response(messages)

    llm = _create_hello_agents_llm(api_key, api_base, model, temperature, max_tokens, timeout)
    if stream:
        return llm.astream_invoke(messages, temperature=temperature, max_tokens=max_tokens)

    response = await llm.ainvoke(messages, temperature=temperature, max_tokens=max_tokens)
    return response.content if hasattr(response, "content") else str(response)


async def chat_completion_stream(
    messages: list[dict],
    model: str = "gpt-3.5-turbo",
    temperature: float = 0.7,
    max_tokens: int = 1000,
    api_key: str | None = None,
    api_base: str | None = None,
    timeout: int | None = None,
):
    """流式调用 Chat API，yield 每个 chunk"""
    if not api_key:
        response = _mock_response(messages)
        # 按词组 yield，而非单字
        for i in range(0, len(response), 3):
            yield response[i:i+3]
        return

    llm = _create_hello_agents_llm(api_key, api_base, model, temperature, max_tokens, timeout)
    async for chunk in llm.astream_invoke(
        messages,
        temperature=temperature,
        max_tokens=max_tokens,
    ):
        if chunk:
            yield chunk


def _create_hello_agents_llm(
    api_key: str,
    api_base: str | None,
    model: str,
    temperature: float,
    max_tokens: int,
    timeout: int | None,
):
    """创建 hello-agents LLM 客户端，统一走其供应商适配层。"""
    try:
        from hello_agents import HelloAgentsLLM
    except ImportError as exc:
        raise RuntimeError("请先安装 hello-agents：pip install hello-agents") from exc

    return HelloAgentsLLM(
        model=model or settings.LLM_MODEL,
        api_key=api_key,
        base_url=api_base or settings.LLM_API_BASE,
        temperature=temperature,
        max_tokens=max_tokens,
        timeout=timeout or settings.LLM_TIMEOUT,
    )


def _extract_system_prompt_info(messages: list[dict]) -> dict:
    """从 system prompt 中提取人格信息"""
    system_msg = ""
    for msg in messages:
        if msg.get("role") == "system":
            system_msg = msg.get("content", "")
            break

    info = {
        "name": "",
        "personality_type": "",
        "language_style": "",
        "tone_words": [],
        "reply_examples": [],
        "expression_habits": [],
        "topics": [],
    }

    if not system_msg:
        return info

    # 提取名字
    name_match = re.search(r"你是(.+?)的数字分身", system_msg)
    if name_match:
        info["name"] = name_match.group(1)

    # 提取性格类型
    if "话多型" in system_msg:
        info["personality_type"] = "talkative"
    elif "惜字如金" in system_msg:
        info["personality_type"] = "terse"
    else:
        info["personality_type"] = "balanced"

    # 提取语言风格
    if "正式" in system_msg:
        info["language_style"] = "formal"
    elif "随意" in system_msg:
        info["language_style"] = "casual"
    else:
        info["language_style"] = "mixed"

    # 提取回复示例
    example_section = re.findall(r"[-•]\s*(.+?)(?:\n|$)", system_msg)
    info["reply_examples"] = [e for e in example_section if len(e) <= 20 and len(e) >= 2]

    # 提取表达习惯
    if "波浪号" in system_msg:
        info["expression_habits"].append("tilde")
    if "感叹号" in system_msg:
        info["expression_habits"].append("exclamation")
    if "省略号" in system_msg:
        info["expression_habits"].append("ellipsis")

    return info


def _mock_response(messages: list[dict]) -> str:
    """模拟 LLM 响应 - 基于 system prompt 中的人格信息生成回复"""
    info = _extract_system_prompt_info(messages)
    last_msg = messages[-1]["content"] if messages else ""

    # 检测消息类型
    greeting_words = ["你好", "嗨", "hi", "hello", "在吗", "早", "晚上好"]
    farewell_words = ["再见", "拜拜", "bye", "晚安", "走了"]
    question_words = ["吗", "呢", "？", "?", "什么", "怎么", "为什么"]

    is_greeting = any(w in last_msg for w in greeting_words)
    is_farewell = any(w in last_msg for w in farewell_words)
    is_question = any(w in last_msg for w in question_words)

    # 根据性格类型选择回复策略
    if info["personality_type"] == "terse":
        # 惜字如金型：简短回复
        if is_greeting:
            candidates = ["嗯", "在", "嗨", "来了"]
        elif is_farewell:
            candidates = ["拜", "嗯", "走了", "晚安"]
        elif is_question:
            candidates = ["嗯？", "啥", "怎么了", "说"]
        else:
            candidates = ["嗯", "好", "行", "知道了", "哦"]
        reply = random.choice(candidates)

    elif info["personality_type"] == "talkative":
        # 话多型：较长回复，带追问
        if is_greeting:
            candidates = ["来了来了！今天怎么样？", "嗨！好久不见，最近忙什么呢？", "在呢在呢！有什么新鲜事吗？"]
        elif is_farewell:
            candidates = ["好的好的，下次再聊！有什么事随时找我哈~", "拜拜！有空一起玩啊！", "走了啊，注意安全！有事call我！"]
        elif is_question:
            candidates = [f"这个问题挺有意思的，让我想想...你是怎么想的呢？", f"嗯，关于这个嘛，我觉得要看情况。你觉得呢？", f"这个我也不太确定，不过我觉得可以试试看！"]
        else:
            candidates = [f"嗯嗯，我明白了！然后呢？", f"好的好的，还有什么想说的吗？", f"了解了解！你觉得怎么样？"]
        reply = random.choice(candidates)

    else:
        # 均衡型
        if is_greeting:
            candidates = ["你好呀", "嗨~", "在呢", "来了"]
        elif is_farewell:
            candidates = ["拜拜", "下次见", "晚安", "再见~"]
        elif is_question:
            candidates = ["嗯，我想想", "这个问题不错", "我觉得还行吧", "可以试试看"]
        else:
            candidates = ["嗯嗯", "好的", "知道了", "了解", "是的"]
        reply = random.choice(candidates)

    # 应用表达习惯
    if "tilde" in info["expression_habits"] and random.random() < 0.4:
        if not reply.endswith("~"):
            reply = reply.rstrip("。！？") + "~"

    if "exclamation" in info["expression_habits"] and random.random() < 0.3:
        if not reply.endswith("！"):
            reply = reply.rstrip("。~？") + "！"

    if "ellipsis" in info["expression_habits"] and random.random() < 0.25:
        if not reply.endswith("..."):
            reply = reply.rstrip("。！~？") + "..."

    # 话多型追加追问
    if info["personality_type"] == "talkative" and random.random() < 0.4:
        follow_ups = ["你觉得呢？", "对吧？", "是吧？", "你怎么看？", "然后呢？"]
        reply += " " + random.choice(follow_ups)

    return reply
