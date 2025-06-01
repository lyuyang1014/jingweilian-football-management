#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import csv
import random

def adjust_player_data():
    """根据位置特点调整球员属性，突出位置特色"""
    
    # 读取当前数据
    players = []
    with open('2025member.csv', 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        fieldnames = reader.fieldnames
        for row in reader:
            players.append(row)
    
    # 位置分类定义
    attacking_positions = ['ST', 'CAM', 'LW', 'RW']  # 进攻型位置
    defensive_positions = ['CB', 'LB', 'RB', 'CDM']  # 防守型位置  
    midfield_positions = ['CM', 'LM', 'RM']  # 中场型位置
    goalkeeper_positions = ['GK']  # 门将
    
    print("开始根据位置调整球员属性...")
    
    for player in players:
        name = player['姓名']
        main_position = player['主要位置']
        print(f"调整球员: {name} (位置: {main_position})")
        
        # 获取当前属性值
        attributes = {
            '射门': int(player['射门']) if player['射门'] else 0,
            '远射': int(player['远射']) if player['远射'] else 0,
            '头球': int(player['头球']) if player['头球'] else 0,
            '传球': int(player['传球']) if player['传球'] else 0,
            '盘带': int(player['盘带']) if player['盘带'] else 0,
            '停球': int(player['停球']) if player['停球'] else 0,
            '抢断': int(player['抢断']) if player['抢断'] else 0,
            '强壮': int(player['强壮']) if player['强壮'] else 0,
            '速度': int(player['速度']) if player['速度'] else 0,
            '耐力': int(player['耐力']) if player['耐力'] else 0,
            '体能恢复': int(player['体能恢复']) if player['体能恢复'] else 0
        }
        
        # 根据位置进行调整
        if main_position in attacking_positions:
            # 进攻型球员：增强进攻属性，适度降低防守
            print(f"  -> 进攻型球员调整")
            attributes['射门'] = min(99, attributes['射门'] + random.randint(3, 8))
            attributes['远射'] = min(99, attributes['远射'] + random.randint(2, 6))
            attributes['头球'] = min(99, attributes['头球'] + random.randint(1, 5))
            attributes['盘带'] = min(99, attributes['盘带'] + random.randint(2, 6))
            
            # 适度降低防守属性
            attributes['抢断'] = max(51, attributes['抢断'] - random.randint(2, 6))
            
        elif main_position in defensive_positions:
            # 防守型球员：增强防守属性，适度降低进攻
            print(f"  -> 防守型球员调整")
            attributes['抢断'] = min(99, attributes['抢断'] + random.randint(4, 8))
            attributes['强壮'] = min(99, attributes['强壮'] + random.randint(2, 6))
            attributes['头球'] = min(99, attributes['头球'] + random.randint(1, 4))  # 后卫头球也重要
            
            # 适度降低进攻属性
            attributes['射门'] = max(51, attributes['射门'] - random.randint(3, 7))
            attributes['远射'] = max(51, attributes['远射'] - random.randint(2, 6))
            attributes['盘带'] = max(51, attributes['盘带'] - random.randint(1, 4))
            
        elif main_position in midfield_positions:
            # 中场型球员：根据具体位置微调
            print(f"  -> 中场型球员调整")
            if main_position in ['LM', 'RM']:  # 边前卫更偏进攻
                attributes['传球'] = min(99, attributes['传球'] + random.randint(2, 5))
                attributes['盘带'] = min(99, attributes['盘带'] + random.randint(2, 5))
                attributes['速度'] = min(99, attributes['速度'] + random.randint(2, 5))
            else:  # CM保持平衡，但提升传球
                attributes['传球'] = min(99, attributes['传球'] + random.randint(2, 6))
                attributes['停球'] = min(99, attributes['停球'] + random.randint(1, 4))
                
        elif main_position in goalkeeper_positions:
            # 门将：不调整，保持原有属性
            print(f"  -> 门将不调整")
            pass
        
        # 特殊位置处理
        if main_position == 'CDM':  # 后腰特殊处理，更偏防守
            print(f"  -> 后腰特殊调整")
            attributes['抢断'] = min(99, attributes['抢断'] + random.randint(3, 7))
            attributes['强壮'] = min(99, attributes['强壮'] + random.randint(1, 5))
            attributes['传球'] = min(99, attributes['传球'] + random.randint(1, 4))
            
            # 降低进攻属性
            attributes['射门'] = max(51, attributes['射门'] - random.randint(2, 5))
            attributes['远射'] = max(51, attributes['远射'] - random.randint(1, 4))
        
        # 更新CSV数据
        for attr_name, new_value in attributes.items():
            if attr_name in player:
                player[attr_name] = str(new_value)
    
    # 写回CSV文件
    with open('2025member.csv', 'w', encoding='utf-8', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(players)
    
    print("✅ 位置特色调整完成！")
    
    # 统计调整情况
    position_counts = {}
    for player in players:
        pos = player['主要位置']
        position_counts[pos] = position_counts.get(pos, 0) + 1
    
    print("\n📊 各位置球员数量统计：")
    for pos, count in sorted(position_counts.items()):
        pos_type = "进攻型" if pos in attacking_positions else \
                  "防守型" if pos in defensive_positions else \
                  "中场型" if pos in midfield_positions else \
                  "门将" if pos in goalkeeper_positions else "其他"
        print(f"  {pos}: {count}人 ({pos_type})")

if __name__ == "__main__":
    adjust_player_data() 