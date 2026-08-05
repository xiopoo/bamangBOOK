"""LLM 客户端：兼容 OpenAI Chat Completions 协议（DeepSeek / OpenAI / 通义 / 本地 Ollama）。"""
from __future__ import annotations

import json
import logging
import re
from typing import Any, Dict, List, Optional

import requests

from .config import Settings

log = logging.getLogger("radar.llm")


class LLMClient:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    @property
    def available(self) -> bool:
        return self.settings.llm_enabled

    def chat(self, system: str, user: str, temperature: float = 0.2,
             max_tokens: int = 4000) -> Optional[str]:
        if not self.available:
            return None
        url = self.settings.llm_base_url.rstrip("/") + "/chat/completions"
        payload = {
            "model": self.settings.llm_model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": False,
        }
        try:
            resp = requests.post(
                url,
                headers={
                    "Authorization": f"Bearer {self.settings.llm_api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=180,
            )
        except requests.RequestException as exc:
            log.warning("LLM 请求失败: %s", exc)
            return None

        if resp.status_code != 200:
            log.warning("LLM HTTP %s: %s", resp.status_code, resp.text[:300])
            return None
        try:
            data = resp.json()
            return data["choices"][0]["message"]["content"]
        except (ValueError, KeyError, IndexError) as exc:
            log.warning("LLM 响应解析失败: %s", exc)
            return None

    def chat_json(self, system: str, user: str, **kwargs) -> Optional[Any]:
        text = self.chat(system, user, **kwargs)
        if not text:
            return None
        return extract_json(text)


def extract_json(text: str) -> Optional[Any]:
    """从模型输出里稳健地抽出 JSON（容忍 markdown 代码块包裹）。"""
    if not text:
        return None
    text = text.strip()

    fenced = re.search(r"```(?:json)?\s*(.*?)```", text, re.S)
    if fenced:
        text = fenced.group(1).strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # 退化：截取第一个完整的 JSON 对象/数组
    for opener, closer in (("{", "}"), ("[", "]")):
        start = text.find(opener)
        end = text.rfind(closer)
        if start != -1 and end > start:
            try:
                return json.loads(text[start:end + 1])
            except json.JSONDecodeError:
                continue
    log.warning("无法解析 LLM JSON 输出: %s", text[:200])
    return None
