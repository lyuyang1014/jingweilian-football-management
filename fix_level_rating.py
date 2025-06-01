#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import csv

def fix_level_rating():
    """修正水平等级与总评的匹配问题"""
    
    # 读取当前数据
    players = []
    with open('2025member.csv', 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        fieldnames = reader.fieldnames
        for row in reader:
            players.append(row)
    
    print("正在修正水平等级与总评匹配问题...")
    
    # 定义各水平等级的合理评分范围
    level_ranges = {
        '职业': (92, 99),    # 职业球员应该是最高的
        '极高': (89, 94),    # 极高水平应该很接近职业
        '高': (82, 89),      # 高水平
        '中': (75, 83),      # 中等水平  
        '低': (70, 78)       # 较低水平
    }
    
    # 修正不合理的评分
    adjustments = []
    
    for player in players:
        name = player['姓名']
        level = player['水平']
        current_rating = int(player['综合能力'])
        
        if level in level_ranges:
            min_rating, max_rating = level_ranges[level]
            
            if current_rating < min_rating:
                # 评分过低，提升到最低标准
                new_rating = min_rating
                if level == '极高':
                    # 杨林等极高球员特别处理
                    if name == '杨林':
                        new_rating = 93  # 给杨林一个很高的评分
                    elif name == '荀洋':
                        new_rating = 92
                    elif name == '孟宪勇':
                        new_rating = 94  # 保持原有的高评分
                elif level == '职业':
                    # 职业球员应该是顶尖的
                    if name == '陈旭':
                        new_rating = 96
                    elif name == '刘帅':
                        new_rating = 95
                    elif name == '孟夜':
                        new_rating = 97  # 孟夜作为职业球员应该最高
                
                player['综合能力'] = str(new_rating)
                adjustments.append(f"{name}: {level}级 {current_rating} → {new_rating}")
                
            elif current_rating > max_rating:
                # 评分过高，降低到合理范围
                new_rating = max_rating
                player['综合能力'] = str(new_rating)
                adjustments.append(f"{name}: {level}级 {current_rating} → {new_rating}")
    
    # 写回文件
    with open('2025member.csv', 'w', encoding='utf-8', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(players)
    
    print(f"修正完成！共调整了 {len(adjustments)} 名球员的评分：")
    for adj in adjustments:
        print(f"  {adj}")
    
    # 验证修正结果
    print("\n修正后的分布：")
    levels = {}
    for player in players:
        level = player['水平']
        rating = int(player['综合能力'])
        name = player['姓名']
        if level not in levels:
            levels[level] = []
        levels[level].append((name, rating))
    
    for level in ['职业', '极高', '高', '中', '低']:
        if level in levels:
            ratings = [r for _, r in levels[level]]
            print(f"{level}: {min(ratings)}-{max(ratings)} (平均{sum(ratings)/len(ratings):.1f})")

if __name__ == "__main__":
    fix_level_rating() 