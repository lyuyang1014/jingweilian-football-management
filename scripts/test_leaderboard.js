// 测试排行榜数据加载
const fetch = require('node-fetch');

async function testLeaderboardData() {
    try {
        console.log('测试排行榜数据加载...');
        
        // 测试球员API
        const playersRes = await fetch('http://localhost:3000/api/players');
        const playersData = await playersRes.json();
        console.log('球员数据:', playersData.success ? `成功，共${playersData.data.length}名球员` : '失败');
        
        // 测试比赛事件API
        const eventsRes = await fetch('http://localhost:3000/api/match-events');
        const eventsData = await eventsRes.json();
        console.log('比赛事件:', `共${eventsData.length}个事件`);
        
        // 测试训练出勤API
        const trainingRes = await fetch('http://localhost:3000/api/training-attendance');
        const trainingData = await trainingRes.json();
        console.log('训练出勤:', `共${trainingData.length}条记录`);
        
        // 计算射手榜
        const players = playersData.data || playersData;
        const goalStats = [];
        
        players.forEach(player => {
            const playerGoals = eventsData.filter(event => 
                event.eventType === '进球' && event.scorer === player.姓名
            );
            
            if (playerGoals.length > 0) {
                goalStats.push({
                    name: player.姓名,
                    goals: playerGoals.length,
                    position: player.主要位置
                });
            }
        });
        
        goalStats.sort((a, b) => b.goals - a.goals);
        
        console.log('\n射手榜前5名:');
        goalStats.slice(0, 5).forEach((player, index) => {
            console.log(`${index + 1}. ${player.name} - ${player.goals}球 (${player.position})`);
        });
        
        // 计算助攻榜
        const assistStats = [];
        
        players.forEach(player => {
            const playerAssists = eventsData.filter(event => 
                event.eventType === '进球' && event.assister === player.姓名
            );
            
            if (playerAssists.length > 0) {
                assistStats.push({
                    name: player.姓名,
                    assists: playerAssists.length,
                    position: player.主要位置
                });
            }
        });
        
        assistStats.sort((a, b) => b.assists - a.assists);
        
        console.log('\n助攻榜前5名:');
        assistStats.slice(0, 5).forEach((player, index) => {
            console.log(`${index + 1}. ${player.name} - ${player.assists}助攻 (${player.position})`);
        });
        
    } catch (error) {
        console.error('测试失败:', error);
    }
}

testLeaderboardData(); 