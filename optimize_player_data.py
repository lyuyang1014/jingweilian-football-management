#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import csv
import random

def optimize_player_data():
    # 读取当前数据
    players = []
    with open('2025member.csv', 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            players.append(row)
    
    # 补充第三个标签的候选列表
    additional_tags = [
        "🌟团队之星", "🔥斗志昂扬", "⚽足球智者", "🛡️防守专家", "🚀进攻利器",
        "🎯精准打击", "💪体能怪兽", "🧠战术执行", "⚡闪电突破", "🎨技术流",
        "🗿稳如磐石", "🌊攻守转换", "🎪表演大师", "👑领袖气质", "🔧万能工具",
        "🦅制空权", "💎场上珍宝", "🏃不知疲倦", "🎼节拍大师", "🌪️旋风突击",
        "🎯百步穿杨", "⚔️边路尖兵", "🗡️锐利突破", "🎖️比赛经验", "🔥激情四射",
        "🛡️钢铁意志", "⭐明日之星", "🎨创意无限", "💡灵光一闪", "🌟希望之光"
    ]
    
    # 统计当前综合能力分布
    overall_ratings = {}
    for player in players:
        rating = player['综合能力']
        if rating in overall_ratings:
            overall_ratings[rating] += 1
        else:
            overall_ratings[rating] = 1
    
    # 打印重复情况
    print("当前综合能力分布：")
    for rating, count in sorted(overall_ratings.items(), key=lambda x: int(x[0]) if x[0].isdigit() else 0, reverse=True):
        if count > 1:
            print(f"{rating}分: {count}人")
    
    # 微调综合能力和补充标签
    random.seed(42)  # 固定随机种子，确保结果可重现
    
    for player in players:
        # 补充缺失的第三个标签
        if not player['标签3'] or player['标签3'].strip() == '':
            available_tags = [tag for tag in additional_tags if tag not in [player['标签1'], player['标签2']]]
            if available_tags:
                player['标签3'] = random.choice(available_tags)
        
        # 微调综合能力评分
        current_rating = int(player['综合能力']) if player['综合能力'].isdigit() else 75
        
        # 根据球员水平和位置进行微调
        level = player['水平']
        position = player['主要位置']
        group = player['组别']
        
        # 基础调整幅度
        adjustment = 0
        
        # 根据水平进行基础调整
        if level == '职业':
            adjustment += random.randint(-1, 2)  # 职业球员保持高水平
        elif level == '极高':
            adjustment += random.randint(-2, 1)
        elif level == '高':
            adjustment += random.randint(-2, 2)
        elif level == '中':
            adjustment += random.randint(-3, 3)
        elif level == '低':
            adjustment += random.randint(-2, 4)  # 低水平球员可能被低估
        
        # 根据组别微调
        if group == '竞技组':
            adjustment += random.randint(-1, 1)
        else:
            adjustment += random.randint(-1, 2)
        
        # 根据位置特点微调
        if position in ['GK']:  # 门将
            adjustment += random.randint(-1, 1)
        elif position in ['ST', 'CF']:  # 前锋
            adjustment += random.randint(0, 2)
        elif position in ['CM', 'CAM', 'CDM']:  # 中场
            adjustment += random.randint(-1, 1)
        elif position in ['CB', 'LB', 'RB']:  # 后卫
            adjustment += random.randint(-1, 1)
        elif position in ['LW', 'RW', 'LM', 'RM']:  # 边路
            adjustment += random.randint(0, 1)
        
        # 应用调整
        new_rating = max(51, min(99, current_rating + adjustment))
        
        # 如果还是和原来一样，再随机微调一点
        if new_rating == current_rating and overall_ratings.get(str(current_rating), 0) > 2:
            new_rating = max(51, min(99, current_rating + random.randint(-2, 2)))
        
        player['综合能力'] = str(new_rating)
    
    # 写入更新的数据
    with open('2025member.csv', 'w', encoding='utf-8', newline='') as file:
        fieldnames = players[0].keys()
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(players)
    
    # 统计新的分布
    new_overall_ratings = {}
    for player in players:
        rating = player['综合能力']
        if rating in new_overall_ratings:
            new_overall_ratings[rating] += 1
        else:
            new_overall_ratings[rating] = 1
    
    print("\n优化后综合能力分布：")
    for rating, count in sorted(new_overall_ratings.items(), key=lambda x: int(x[0]) if x[0].isdigit() else 0, reverse=True):
        print(f"{rating}分: {count}人")
    
    print(f"\n✅ 优化完成！处理了 {len(players)} 名球员的数据")

if __name__ == "__main__":
    optimize_player_data() 