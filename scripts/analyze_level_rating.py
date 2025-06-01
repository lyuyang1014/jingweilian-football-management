#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import csv
import json

def analyze_level_rating():
    """分析水平等级与总评的对应关系"""
    
    # 读取当前数据
    players = []
    with open('2025member.csv', 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            players.append(row)
    
    # 按水平等级分组
    levels = {}
    for player in players:
        level = player['水平']
        rating = int(player['综合能力'])
        name = player['姓名']
        if level not in levels:
            levels[level] = []
        levels[level].append((name, rating))
    
    print("当前水平等级与总评分布情况：\n")
    
    # 统计各等级范围
    for level in ['职业', '极高', '高', '中', '低']:
        if level in levels:
            ratings = [r for _, r in levels[level]]
            print(f"{level}级别 ({len(levels[level])}人):")
            print(f"  范围: {min(ratings)}-{max(ratings)}")
            print(f"  平均: {sum(ratings)/len(ratings):.1f}")
            
            # 显示具体球员
            for name, rating in sorted(levels[level], key=lambda x: x[1], reverse=True)[:5]:
                print(f"  {name}: {rating}")
            if len(levels[level]) > 5:
                print(f"  ... 等{len(levels[level])}人")
            print()
    
    # 问题检测
    print("🚨 发现的问题：")
    
    # 检查杨林(极高)是否低于其他高级别球员
    yang_lin_rating = None
    for name, rating in levels.get('极高', []):
        if name == '杨林':
            yang_lin_rating = rating
            break
    
    if yang_lin_rating:
        high_players = levels.get('高', [])
        higher_than_yanglin = [(name, r) for name, r in high_players if r > yang_lin_rating]
        if higher_than_yanglin:
            print(f"  杨林(极高级, {yang_lin_rating}分)低于以下高级球员:")
            for name, r in higher_than_yanglin:
                print(f"    {name}: {r}")
    
    # 检查职业球员是否最高
    professional_ratings = [r for _, r in levels.get('职业', [])]
    other_max = 0
    for level in ['极高', '高', '中', '低']:
        if level in levels:
            level_max = max([r for _, r in levels[level]])
            if level_max > other_max:
                other_max = level_max
    
    if professional_ratings and min(professional_ratings) <= other_max:
        print(f"  职业球员最低分({min(professional_ratings)})不高于其他级别最高分({other_max})")

if __name__ == "__main__":
    analyze_level_rating() 