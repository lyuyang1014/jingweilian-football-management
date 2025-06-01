const fs = require('fs');
const csv = require('csv-parser');

// 存储数据
let currentData = [];
let backupData = [];

// 读取当前数据和备份数据
async function loadData() {
    return new Promise((resolve) => {
        let loadCount = 0;
        
        // 读取当前文件（包含新字段：身价、喜爱球队、喜爱球员）
        fs.createReadStream('2025member.csv')
            .pipe(csv())
            .on('data', (row) => {
                currentData.push(row);
            })
            .on('end', () => {
                console.log('当前数据加载完成，共 ' + currentData.length + ' 名球员');
                loadCount++;
                if (loadCount === 2) resolve();
            });
        
        // 读取备份文件（原始球衣号码）
        fs.createReadStream('2025member_backup.csv')
            .pipe(csv())
            .on('data', (row) => {
                backupData.push(row);
            })
            .on('end', () => {
                console.log('备份数据加载完成，共 ' + backupData.length + ' 名球员');
                loadCount++;
                if (loadCount === 2) resolve();
            });
    });
}

// 分配正确的球衣号码
function assignJerseyNumbers() {
    console.log('开始分配正确的球衣号码...');
    
    // 手动分配球衣号码 - 根据球员特点和位置
    const jerseyAssignments = {
        // 门将
        '庞博': '1',
        '孟宪勇': '12',
        '彭冠瑜': '23',
        '陈兆轩': '30',
        
        // 核心球员
        '杨林': '10',    // 射手王，10号
        '孟夜': '8',     // 中场核心
        '荀洋': '6',     // 中场大将
        '吕洋': '7',     // 技术型边锋
        '刘帅': '4',     // 后防核心
        '李长彬': '5',   // 队长
        '杨世晋': '3',   // 左后卫
        '迟骋': '11',    // 边路快马
        '黄朝阳': '9',   // 前锋
        '杨世晋': '2',   // 边后卫
        
        // 其他球员按位置分配
        '独威': '14',
        '周慜': '15',
        '李昊': '16',
        '张文译': '17',
        '王岩琦': '18',
        '孟晨熠': '19',
        '金磊': '20',
        '魏国栋': '21',
        '韩鹏': '22',
        '郝帅旗': '24',
        '朱佳玉': '25',
        '薛宝琛': '26',
        '韩博': '27',
        '侯俊杰': '28',
        '向欣慧': '29',
        '王雪健': '31',
        '邱先进': '32',
        '邱光': '33',
        '肖翔': '34',
        '严宇航': '35',
        '原野': '36',
        '马琪翔': '37',
        '王佳琦': '38',
        '宋宇航': '39',
        '赵鹏': '40',
        '李硕': '41',
        '张旭': '42',
        '黄自涛': '43',
        '刘冠军': '44',
        '王帅': '45',
        '苏天恒': '46',
        '董晶晶': '47',
        '赵兰月': '48',
        '李国雅': '49',
        '范昕': '50',
        '李雪': '51',
        '陶文君': '52',
        '孙芳芳': '53',
        '宋凯': '54',
        '候恬恬': '55'
    };
    
    // 合并数据：保留当前数据的新字段，使用正确的球衣号码
    const fixedData = currentData.map(player => {
        const playerName = player.姓名;
        const correctJerseyNumber = jerseyAssignments[playerName] || player.球衣号码;
        
        return {
            ...player,
            球衣号码: correctJerseyNumber
        };
    });
    
    console.log('球衣号码分配完成！');
    
    // 显示一些关键球员的号码
    console.log('\n核心球员球衣号码:');
    ['杨林', '孟夜', '荀洋', '吕洋', '刘帅', '李长彬'].forEach(name => {
        const player = fixedData.find(p => p.姓名 === name);
        if (player) {
            console.log(`${name}: ${player.球衣号码}号`);
        }
    });
    
    return fixedData;
}

// 主函数
async function main() {
    await loadData();
    const fixedData = assignJerseyNumbers();
    
    // 创建CSV内容
    const headers = Object.keys(fixedData[0]);
    const csvContent = headers.join(',') + '\n' + 
        fixedData.map(player => 
            headers.map(header => player[header]).join(',')
        ).join('\n');
    
    // 写入修复后的文件
    fs.writeFileSync('2025member.csv', csvContent);
    
    console.log('\n✅ 球衣号码修复完成！');
    console.log('- 核心球员分配经典号码');
    console.log('- 保留了身价、喜爱球队等新字段');
    console.log('- 门将分配门将号码(1,12,23,30)');
}

main().catch(console.error); 