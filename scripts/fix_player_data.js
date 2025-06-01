const fs = require('fs');
const csv = require('csv-parser');

// 存储球员数据
let playersData = [];

// 读取球员数据
function loadPlayersData() {
    return new Promise((resolve) => {
        fs.createReadStream('2025member.csv')
            .pipe(csv())
            .on('data', (row) => {
                playersData.push(row);
            })
            .on('end', () => {
                console.log('球员数据加载完成，共 ' + playersData.length + ' 名球员');
                resolve();
            });
    });
}

// 修复球员数据
function fixPlayerData() {
    console.log('开始修复球员数据...');
    
    const fixedPlayers = playersData.map((player, index) => {
        const fixed = { ...player };
        
        // 修复球衣号码 - 给每个球员分配正确的号码
        const jerseyNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 
                             '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
                             '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
                             '31', '32', '33', '34', '36', '37', '38', '39', '40', '41',
                             '42', '43', '44', '45', '46', '47', '48', '49', '50', '51',
                             '52', '53', '54', '55', '88', '99'];
        
        if (index < jerseyNumbers.length) {
            fixed.球衣号码 = jerseyNumbers[index];
        } else {
            fixed.球衣号码 = String(index + 60); // 备用号码
        }
        
        // 调整杨林的数值 - 降低99的属性
        if (player.姓名 === '杨林') {
            console.log('调整杨林的属性值...');
            fixed.射门 = '92'; // 从99降到92
            fixed.盘带 = '91'; // 从98降到91  
            fixed.速度 = '89'; // 从99降到89
            fixed.抢断 = '82'; // 从99降到82，前锋不应该抢断这么强
            fixed.强壮 = '85'; // 从98降到85
            fixed.比赛阅读 = '87'; // 从92降到87
            fixed.勇敢决心 = '87'; // 从95降到87
            fixed.综合能力 = '89'; // 从93降到89
        }
        
        // 调整其他球员过高的数值
        Object.keys(fixed).forEach(key => {
            if (!isNaN(fixed[key]) && fixed[key] !== '' && parseInt(fixed[key]) === 99) {
                // 将所有99的数值降到92-95之间
                if (key !== '球衣号码' && key !== '年龄') {
                    const newValue = Math.floor(Math.random() * 4) + 92; // 92-95之间
                    fixed[key] = String(newValue);
                    console.log(`${player.姓名} 的 ${key} 从99调整为${newValue}`);
                }
            }
        });
        
        // 添加身价计算
        const age = parseInt(player.年龄) || 30;
        const level = player.水平;
        const position = player.主要位置;
        const overall = parseInt(fixed.综合能力) || 75;
        
        // 身价计算逻辑（100万人民币以内）
        let baseValue = overall * 8000; // 基础身价：综合能力 * 8000
        
        // 位置调整
        if (['ST', 'CAM', 'LW', 'RW'].includes(position)) {
            baseValue *= 1.3; // 进攻球员更值钱
        } else if (['CB', 'LB', 'RB'].includes(position)) {
            baseValue *= 1.1; // 后卫稍微值钱
        } else if (position === 'GK') {
            baseValue *= 1.2; // 门将
        }
        
        // 年龄调整
        if (age < 25) {
            baseValue *= 1.4; // 年轻球员潜力价值
        } else if (age < 30) {
            baseValue *= 1.2; // 黄金年龄
        } else if (age < 35) {
            baseValue *= 0.9; // 开始贬值
        } else {
            baseValue *= 0.6; // 老将经验但身价下降
        }
        
        // 水平调整
        const levelMultiplier = {
            '职业': 1.5,
            '极高': 1.3,
            '高': 1.1,
            '中': 1.0,
            '低': 0.8
        };
        baseValue *= (levelMultiplier[level] || 1.0);
        
        // 限制在100万以内，并添加随机性
        const randomFactor = 0.8 + Math.random() * 0.4; // 0.8-1.2
        const finalValue = Math.min(Math.round(baseValue * randomFactor), 1000000);
        
        fixed.身价 = String(finalValue);
        
        // 添加喜爱的球队和球员
        const favoriteTeams = [
            '巴塞罗那', '皇家马德里', '拜仁慕尼黑', '利物浦', '曼城', '曼联', 
            '切尔西', '阿森纳', '巴黎圣日耳曼', '尤文图斯', '国际米兰', 'AC米兰',
            '多特蒙德', '阿贾克斯', '波尔图', '本菲卡', '马德里竞技', '塞维利亚',
            '那不勒斯', '罗马', '国米', '拉齐奥', '摩纳哥', '里昂'
        ];
        
        const favoritePlayers = [
            '梅西', 'C罗', '内马尔', '姆巴佩', '哈兰德', '贝林厄姆', 
            '维尼修斯', '佩德里', '加维', '德容', '莫德里奇', '本泽马',
            '凯恩', '孙兴慜', '萨拉赫', '马内', '德布劳内', '福登',
            '罗德里戈', '费兰托雷斯', '安苏法蒂', '劳塔罗', '卢卡库', '奥斯梅恩'
        ];
        
        fixed.喜爱球队 = favoriteTeams[Math.floor(Math.random() * favoriteTeams.length)];
        fixed.喜爱球员 = favoritePlayers[Math.floor(Math.random() * favoritePlayers.length)];
        
        return fixed;
    });
    
    return fixedPlayers;
}

// 主函数
async function main() {
    await loadPlayersData();
    const fixedPlayers = fixPlayerData();
    
    // 创建CSV内容
    const headers = Object.keys(fixedPlayers[0]);
    const csvContent = headers.join(',') + '\n' + 
        fixedPlayers.map(player => 
            headers.map(header => player[header]).join(',')
        ).join('\n');
    
    // 备份原文件
    fs.writeFileSync('2025member_backup.csv', fs.readFileSync('2025member.csv'));
    
    // 写入修复后的文件
    fs.writeFileSync('2025member.csv', csvContent);
    
    console.log('球员数据修复完成！');
    console.log('- 修复了球衣号码');
    console.log('- 调整了杨林的过高属性'); 
    console.log('- 降低了所有99的数值');
    console.log('- 添加了身价信息');
    console.log('- 添加了喜爱球队和球员');
    
    // 显示杨林的新数据
    const yanglin = fixedPlayers.find(p => p.姓名 === '杨林');
    if (yanglin) {
        console.log('\n杨林调整后的关键属性:');
        console.log(`射门: ${yanglin.射门}, 盘带: ${yanglin.盘带}, 速度: ${yanglin.速度}`);
        console.log(`抢断: ${yanglin.抢断}, 强壮: ${yanglin.强壮}, 综合能力: ${yanglin.综合能力}`);
        console.log(`身价: ${yanglin.身价}元, 喜爱球队: ${yanglin.喜爱球队}, 喜爱球员: ${yanglin.喜爱球员}`);
    }
}

main().catch(console.error); 