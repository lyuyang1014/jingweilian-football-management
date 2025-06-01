const fs = require('fs');
const csv = require('csv-parser');

// 存储原始球员数据
let originalPlayers = [];

// 读取原始球员数据
function loadOriginalPlayers() {
    return new Promise((resolve) => {
        fs.createReadStream('2025member.csv')
            .pipe(csv())
            .on('data', (row) => {
                originalPlayers.push(row);
            })
            .on('end', () => {
                console.log('原始球员数据加载完成，共 ' + originalPlayers.length + ' 名球员');
                resolve();
            });
    });
}

// 根据特点描述重新设计球员属性
function enhancePlayer(player) {
    const enhanced = { ...player };
    const description = player.球员特点描述;
    
    // 基础属性范围
    const level = player.水平;
    let baseRange = [65, 75]; // 默认中等水平
    
    if (level === '职业') baseRange = [90, 99];
    else if (level === '极高') baseRange = [85, 95];
    else if (level === '高') baseRange = [75, 88];
    else if (level === '中') baseRange = [65, 80];
    else if (level === '低') baseRange = [60, 75];
    
    // 根据特点描述调整属性
    
    // 射门相关
    if (description.includes('射手') || description.includes('射门') || description.includes('进球')) {
        enhanced.射门 = Math.min(99, baseRange[1] + 5);
        enhanced.远射 = description.includes('远射') ? Math.min(95, baseRange[1]) : Math.max(baseRange[0] - 10, 50);
    } else if (description.includes('后卫') || description.includes('门将')) {
        enhanced.射门 = Math.max(baseRange[0] - 15, 40);
        enhanced.远射 = Math.max(baseRange[0] - 10, 45);
    }
    
    // 盘带相关
    if (description.includes('盘带')) {
        enhanced.盘带 = Math.min(99, baseRange[1] + 3);
        enhanced.停球 = Math.min(95, baseRange[1]);
    } else if (description.includes('抢断') || description.includes('防守')) {
        enhanced.盘带 = Math.max(baseRange[0] - 5, 55);
    }
    
    // 防守相关
    if (description.includes('抢断') || description.includes('防守') || description.includes('后卫')) {
        enhanced.抢断 = Math.min(99, baseRange[1] + 5);
        enhanced.勇敢决心 = Math.min(95, baseRange[1] + 3);
    } else if (description.includes('前锋') || description.includes('进攻')) {
        enhanced.抢断 = Math.max(baseRange[0] - 10, 60);
    }
    
    // 传球相关
    if (description.includes('传球') || description.includes('配合') || description.includes('组织')) {
        enhanced.传球 = Math.min(99, baseRange[1] + 3);
        enhanced.大局观 = Math.min(95, baseRange[1]);
        enhanced.团队合作 = Math.min(95, baseRange[1]);
    }
    
    // 速度相关
    if (description.includes('速度快') || description.includes('爆发力')) {
        enhanced.速度 = Math.min(99, baseRange[1] + 5);
        enhanced.敏捷平衡 = Math.min(95, baseRange[1]);
    } else if (description.includes('年龄') && parseInt(player.年龄) > 40) {
        enhanced.速度 = Math.max(baseRange[0] - 10, 65);
    }
    
    // 体能相关
    if (description.includes('体力') || description.includes('不知疲倦')) {
        enhanced.耐力 = Math.min(99, baseRange[1] + 5);
        enhanced.体能恢复 = Math.min(95, baseRange[1]);
    } else if (description.includes('体力较差') || description.includes('体力一般')) {
        enhanced.耐力 = Math.max(baseRange[0] - 10, 65);
        enhanced.体能恢复 = Math.max(baseRange[0] - 5, 70);
    }
    
    // 头球相关
    if (description.includes('头球') || description.includes('弹跳')) {
        enhanced.头球 = Math.min(99, baseRange[1] + 3);
        enhanced.弹跳 = Math.min(95, baseRange[1]);
    }
    
    // 身体对抗
    if (description.includes('身体') && (description.includes('好') || description.includes('强'))) {
        enhanced.强壮 = Math.min(99, baseRange[1] + 3);
    } else if (description.includes('身体对抗略差') || description.includes('力量不足')) {
        enhanced.强壮 = Math.max(baseRange[0] - 10, 60);
    }
    
    // 精神属性
    if (description.includes('队长') || description.includes('领导') || description.includes('精神属性强')) {
        enhanced.领导力 = Math.min(99, baseRange[1] + 5);
        enhanced.勇敢决心 = Math.min(95, baseRange[1] + 3);
        enhanced.积极性 = Math.min(95, baseRange[1] + 3);
    }
    
    // 意识相关
    if (description.includes('意识') || description.includes('预判') || description.includes('位置感')) {
        enhanced.比赛阅读 = Math.min(99, baseRange[1] + 3);
        enhanced.大局观 = Math.min(95, baseRange[1]);
    }
    
    // 定位球
    if (description.includes('定位球') || description.includes('角球')) {
        enhanced.定位球 = Math.min(95, baseRange[1]);
    }
    
    // 传中
    if (description.includes('传中') || description.includes('下底')) {
        enhanced.传中 = Math.min(95, baseRange[1]);
    }
    
    // 门将属性
    if (player.主要位置 === 'GK') {
        enhanced.反应 = Math.min(95, baseRange[1]);
        enhanced.手型控制 = Math.min(92, baseRange[1] - 3);
        enhanced.一对一 = Math.min(90, baseRange[1] - 5);
        enhanced.出击 = Math.min(88, baseRange[1] - 7);
        enhanced.大脚手抛球 = Math.min(90, baseRange[1] - 5);
        enhanced.高空球控制 = Math.min(92, baseRange[1] - 3);
        enhanced.指挥交流 = Math.min(90, baseRange[1] - 5);
    }
    
    // 逆足能力
    if (description.includes('逆足几乎无差别')) {
        enhanced.逆足能力 = Math.min(85, baseRange[1] - 10);
    } else if (description.includes('逆足较好') || description.includes('逆足均衡')) {
        enhanced.逆足能力 = Math.min(70, baseRange[1] - 15);
    } else {
        enhanced.逆足能力 = Math.max(35, baseRange[0] - 25);
    }
    
    // 确保所有数值在合理范围内
    Object.keys(enhanced).forEach(key => {
        if (!isNaN(enhanced[key]) && enhanced[key] !== '') {
            enhanced[key] = Math.max(35, Math.min(99, parseInt(enhanced[key])));
        }
    });
    
    return enhanced;
}

// 主函数
async function createEnhancedPlayers() {
    console.log('开始创建增强球员数据...');
    
    await loadOriginalPlayers();
    
    console.log('根据特点描述增强球员属性...');
    const enhancedPlayers = originalPlayers.map(player => enhancePlayer(player));
    
    // 创建CSV内容
    const headers = Object.keys(enhancedPlayers[0]);
    const csvContent = headers.join(',') + '\n' + 
        enhancedPlayers.map(player => 
            headers.map(header => player[header]).join(',')
        ).join('\n');
    
    // 写入文件
    fs.writeFileSync('enhanced_players_final.csv', csvContent);
    
    console.log('增强球员数据创建完成！');
    console.log(`处理了 ${enhancedPlayers.length} 名球员`);
    
    // 显示几个示例
    console.log('\n示例球员增强结果:');
    enhancedPlayers.slice(0, 3).forEach(player => {
        console.log(`${player.姓名}: 射门${player.射门} 盘带${player.盘带} 抢断${player.抢断} 传球${player.传球} 速度${player.速度}`);
    });
}

createEnhancedPlayers().catch(console.error); 