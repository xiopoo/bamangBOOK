#!/usr/bin/env python3
"""
处理唐僧的碎碎念文章：
1. 移除正文中不适合阅读的标题内容（# 标题、作者信息、原文链接）
2. 移除文末的公众号推广内容（欢迎点赞关注、往期推荐文章、二维码等）
3. 更新内链为网站链接（hjcz.top）
"""

import os
import re
import json
import sys
from datetime import datetime

SOURCE_DIR = "/Users/lucas/Desktop/唐僧的碎碎念"
OUTPUT_DIR = "/Users/lucas/Documents/bamangB/bamangBOOK/content/bloggers/唐僧的碎碎念"
INDEX_FILE = "/Users/lucas/Documents/bamangB/bamangBOOK/content/bloggers/bloggers-index.json"
BLOG_NAME = "唐僧的碎碎念"
SITE_DOMAIN = "https://hjcz.top"

def parse_frontmatter(content):
    """解析 YAML frontmatter"""
    lines = content.split('\n')
    if not lines or lines[0].strip() != '---':
        return {}, content
    
    end_idx = -1
    for i in range(1, len(lines)):
        if lines[i].strip() == '---':
            end_idx = i
            break
    
    if end_idx == -1:
        return {}, content
    
    fm_lines = lines[1:end_idx]
    body = '\n'.join(lines[end_idx+1:])
    
    fm = {}
    current_key = None
    for line in fm_lines:
        match = re.match(r'^(\w+):\s*["\']?(.*?)["\']?\s*$', line)
        if match:
            current_key = match.group(1)
            fm[current_key] = match.group(2)
    
    return fm, body

def clean_body(body):
    """清理正文内容"""
    lines = body.split('\n')
    cleaned_lines = []
    skip_mode = False  # 跳过标题区域
    header_done = False  # 标题区域处理完毕
    
    # 找到正文实际开始的位置
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        if not header_done:
            # 跳过空行
            if stripped == '':
                i += 1
                continue
            
            # 跳过 # 标题行
            if re.match(r'^#\s+', stripped):
                i += 1
                continue
            
            # 跳过 > Author · Account · Date 行
            if re.match(r'^>\s+', stripped) and '·' in stripped and not stripped.startswith('> ['):
                i += 1
                continue
            
            # 跳过 > [原文链接](...) 行
            if stripped.startswith('> [原文链接]('):
                i += 1
                continue
            
            # 跳过第一组 --- 分隔符及其中的摘要文字
            if stripped == '---':
                # 检查后面是否还有 --- (成对的分隔符，通常包裹摘要)
                j = i + 1
                has_closing = False
                while j < len(lines):
                    if lines[j].strip() == '---':
                        has_closing = True
                        break
                    j += 1
                if has_closing:
                    i = j + 1  # 跳过整个摘要区域
                    continue
            
            header_done = True
        
        cleaned_lines.append(line)
        i += 1
    
    body = '\n'.join(cleaned_lines)
    
    # 移除文末推广内容
    # 匹配: 欢迎点赞、关注、转发、打赏~ 或 欢迎转载、点赞、关注、转发~
    patterns = [
        r'^欢迎点赞[、，].*[~～]$',
        r'^欢迎转载[、，].*[~～]$',
    ]
    
    lines = body.split('\n')
    result_lines = []
    for line in lines:
        stripped = line.strip()
        should_stop = False
        for pat in patterns:
            if re.match(pat, stripped):
                should_stop = True
                break
        if should_stop:
            break
        result_lines.append(line)
    
    body = '\n'.join(result_lines)
    
    # 移除文末空行
    body = body.rstrip()
    
    return body

def update_internal_links(body, article_map):
    """
    将微信公众号内链更新为网站链接
    article_map: {wechat_url: site_filename} 的映射
    """
    # 匹配微信公众号文章链接
    # https://mp.weixin.qq.com/s/xxx 或 http://mp.weixin.qq.com/s?__biz=xxx
    def replace_link(match):
        url = match.group(1)
        # 如果是短链接格式 /s/xxx
        if url in article_map:
            return f'[{match.group(2)}]({article_map[url]})'
        return match.group(0)
    
    # 替换 [text](wechat_url) 格式的链接
    body = re.sub(
        r'\[([^\]]+)\]\((https?://mp\.weixin\.qq\.com/[^\)]+)\)',
        replace_link,
        body
    )
    
    return body

def main():
    # 获取所有 .md 文件
    md_files = sorted([
        f for f in os.listdir(SOURCE_DIR) 
        if f.endswith('.md')
    ])
    
    print(f"找到 {len(md_files)} 篇文章")
    
    # 创建输出目录
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    articles_info = []  # 用于构建 index
    url_to_filename = {}  # 用于内链映射: {原微信url: site_filename}
    
    for md_file in md_files:
        filepath = os.path.join(SOURCE_DIR, md_file)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        fm, body = parse_frontmatter(content)
        
        title = fm.get('title', '')
        author = fm.get('author', '唐二僧')
        account = fm.get('account', BLOG_NAME)
        date_str = fm.get('date', '')
        original_url = fm.get('url', '')
        digest = fm.get('digest', '')
        
        if not title:
            print(f"  警告: {md_file} 缺少 title")
            continue
        
        # 清理正文
        cleaned_body = clean_body(body)
        
        # 构建新的 frontmatter
        new_content = f"""---
title: "{title}"
author: "{author}"
account: "{account}"
date: "{date_str}"
url: "{original_url}"
digest: "{digest}"
---

{cleaned_body}
"""
        
        # 写入处理后的文件
        output_path = os.path.join(OUTPUT_DIR, md_file)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        # 记录文章信息
        word_count = len(cleaned_body.replace('\n', '').replace(' ', ''))
        
        # 解析年份
        year = 2024
        try:
            if date_str:
                year = int(date_str[:4])
        except:
            pass
        
        # 从文件名提取日期部分验证
        date_match = re.match(r'^(\d{4})\d{4}_', md_file)
        if date_match:
            year = int(date_match.group(1))
        
        articles_info.append({
            'title': title,
            'date': date_str,
            'year': year,
            'fileName': md_file,
            'url': original_url,
            'author': author,
            'account': account,
            'tags': [],
            'wordCount': word_count
        })
        
        # 建立 URL 映射（供后续内链替换）
        if original_url:
            # 提取短链接部分
            url_match = re.search(r'/s/([^?]+)', original_url)
            if url_match:
                short_key = url_match.group(1)
                url_to_filename[original_url] = f"/bloggers/{BLOG_NAME}/{md_file.replace('.md', '')}"
        
        print(f"  处理: {md_file} -> {title}")
    
    # 第二轮：更新内链
    print("\n更新内链...")
    for md_file in md_files:
        output_path = os.path.join(OUTPUT_DIR, md_file)
        with open(output_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        updated = update_internal_links(content, url_to_filename)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(updated)
    
    # 更新 bloggers-index.json
    print("\n更新 bloggers-index.json...")
    with open(INDEX_FILE, 'r', encoding='utf-8') as f:
        index_data = json.load(f)
    
    # 查找是否已有该博主
    found = False
    for blogger in index_data:
        if blogger.get('name') == BLOG_NAME:
            blogger['articles'] = articles_info
            found = True
            break
    
    if not found:
        index_data.append({
            'name': BLOG_NAME,
            'articles': articles_info
        })
    
    with open(INDEX_FILE, 'w', encoding='utf-8') as f:
        json.dump(index_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n完成！共处理 {len(md_files)} 篇文章")
    print(f"输出目录: {OUTPUT_DIR}")
    print(f"索引文件: {INDEX_FILE}")

if __name__ == '__main__':
    main()
