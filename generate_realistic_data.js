const fs = require('fs');
const csv = require('csv-parser');

// 存储数据
let playersData = [];
let activitiesData = [];

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

// 读取活动数据
function loadActivitiesData() {
    return new Promise((resolve) => {
        fs.createReadStream('activities.csv')
            .pipe(csv())
            .on('data', (row) => {
                activitiesData.push(row);
            })
            .on('end', () => {
                console.log('活动数据加载完成，共 ' + activitiesData.length + ' 个活动');
                resolve();
            });
    });
}

// 根据球员组别和水平选择参与者
function selectParticipants(activity) {
    const participants = [];
    
    if (activity.type === '队内训练') {
        // 队内训练不分组别，随机选择10-15人参加
        const numParticipants = Math.floor(Math.random() * 6) + 10; // 10-15人
        const shuffledPlayers = [...playersData].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < Math.min(numParticipants, shuffledPlayers.length); i++) {
            participants.push({
                activityId: activity.id,
                playerName: shuffledPlayers[i].姓名,
                status: '参与',
                group: shuffledPlayers[i].组别,
                date: activity.date
            });
        }
    } else if (activity.type === '队内对抗赛') {
        // 队内对抗赛：不分组别，打乱分队，12-18人参加
        const numParticipants = Math.floor(Math.random() * 7) + 12; // 12-18人
        const shuffledPlayers = [...playersData].sort(() => Math.random() - 0.5);
        
        // 选择参与者
        const selectedPlayers = shuffledPlayers.slice(0, Math.min(numParticipants, shuffledPlayers.length));
        
        // 平均分配到2-4队
        const numTeams = Math.floor(Math.random() * 3) + 2; // 2-4队
        const playersPerTeam = Math.floor(selectedPlayers.length / numTeams);
        
        selectedPlayers.forEach((player, index) => {
            const teamNumber = Math.floor(index / playersPerTeam) + 1;
            participants.push({
                activityId: activity.id,
                playerName: player.姓名,
                status: `队${teamNumber}`,
                group: player.组别,
                date: activity.date
            });
        });
    } else if (activity.type === '正式比赛') {
        // 正式比赛：按组别分别比赛，7-9人上场
        const targetGroup = activity.group;
        const groupPlayers = playersData.filter(p => p.组别 === targetGroup);
        
        // 报名人数略多于比赛人数
        const numRegistered = Math.floor(Math.random() * 4) + 8; // 8-11人报名
        const numStarters = Math.floor(Math.random() * 3) + 7; // 7-9人首发
        
        // 选择报名球员，优先选择水平高的
        const sortedPlayers = groupPlayers.sort((a, b) => {
            const levelOrder = { '职业': 4, '极高': 3, '高': 2, '中': 1, '低': 0 };
            return levelOrder[b.水平] - levelOrder[a.水平];
        });
        
        const registeredPlayers = sortedPlayers.slice(0, Math.min(numRegistered, sortedPlayers.length));
        
        // 安排首发和替补
        registeredPlayers.forEach((player, index) => {
            participants.push({
                activityId: activity.id,
                playerName: player.姓名,
                status: index < numStarters ? '首发' : '替补',
                group: player.组别,
                date: activity.date
            });
        });
    }
    
    return participants;
}

// 生成比赛事件（进球）
function generateMatchEvents(activity, participants) {
    const events = [];
    
    // 正式比赛和队内对抗赛都记录进球事件
    if (activity.type !== '正式比赛' && activity.type !== '队内对抗赛') {
        return events;
    }
    
    const activePlayers = activity.type === '正式比赛' ? 
                         participants.filter(p => p.status === '首发') :
                         participants; // 队内对抗赛所有参与者都可能进球
    
    if (activePlayers.length === 0) return events;
    
    // 根据比赛类型决定进球数
    let numGoals;
    if (activity.type === '正式比赛') {
        numGoals = Math.random() < 0.8 ? 
                   (Math.random() < 0.6 ? Math.floor(Math.random() * 3) + 1 : 0) : 
                   Math.floor(Math.random() * 2) + 3;
    } else {
        // 队内对抗赛进球更多
        numGoals = Math.floor(Math.random() * 4) + 2; // 2-5个进球
    }
    
    const allPlayers = activePlayers.map(p => {
        const playerData = playersData.find(pl => pl.姓名 === p.playerName);
        return {
            name: p.playerName,
            position: playerData?.主要位置 || 'CM',
            shooting: parseInt(playerData?.射门 || 75),
            passing: parseInt(playerData?.传球 || 75),
            level: playerData?.水平 || '中'
        };
    });
    
    for (let i = 0; i < numGoals; i++) {
        // 选择进球者 - 射门能力加权选择
        const weightedPlayers = allPlayers.map(p => {
            let weight = p.shooting;
            
            // 前锋和边锋额外加权
            if (['ST', 'LW', 'RW', 'CAM'].includes(p.position)) {
                weight *= 1.5;
            }
            
            // 水平高的球员额外加权
            const levelBonus = { '职业': 1.5, '极高': 1.3, '高': 1.1, '中': 1.0, '低': 0.8 };
            weight *= levelBonus[p.level] || 1.0;
            
            return { ...p, weight };
        });
        
        const totalWeight = weightedPlayers.reduce((sum, p) => sum + p.weight, 0);
        let random = Math.random() * totalWeight;
        
        let scorer = weightedPlayers[0].name; // 默认值
        for (const player of weightedPlayers) {
            random -= player.weight;
            if (random <= 0) {
                scorer = player.name;
                break;
            }
        }
        
        // 80%概率有助攻（现实中大部分进球都有助攻）
        let assister = '';
        if (Math.random() < 0.8) {
            const potentialAssisters = allPlayers.filter(p => p.name !== scorer);
            if (potentialAssisters.length > 0) {
                // 传球能力强的球员更容易助攻
                const weightedAssisters = potentialAssisters.map(p => {
                    let weight = p.passing;
                    
                    // 中场球员额外加权
                    if (['CM', 'CAM', 'CDM', 'LM', 'RM'].includes(p.position)) {
                        weight *= 1.3;
                    }
                    
                    // 水平高的球员额外加权
                    const levelBonus = { '职业': 1.4, '极高': 1.2, '高': 1.1, '中': 1.0, '低': 0.9 };
                    weight *= levelBonus[p.level] || 1.0;
                    
                    return { ...p, weight };
                });
                
                const totalWeight = weightedAssisters.reduce((sum, p) => sum + p.weight, 0);
                let random = Math.random() * totalWeight;
                
                for (const player of weightedAssisters) {
                    random -= player.weight;
                    if (random <= 0) {
                        assister = player.name;
                        break;
                    }
                }
            }
        }
        
        // 生成进球时间
        const minute = Math.floor(Math.random() * 90) + 1;
        
        events.push({
            id: `${activity.id}_${i + 1}`,
            activityId: activity.id,
            eventType: '进球',
            scorer: scorer,
            assister: assister,
            minute: minute.toString(),
            date: activity.date,
            group: activity.group || '混合'
        });
    }
    
    return events;
}

// 生成训练出勤数据
function generateTrainingAttendance() {
    const attendanceData = [];
    
    // 为每个训练活动和对抗赛生成出勤数据
    const trainingActivities = activitiesData.filter(a => 
        a.type === '队内训练' || a.type === '队内对抗赛'
    );
    
    trainingActivities.forEach(activity => {
        playersData.forEach(player => {
            // 根据球员的积极性决定出勤概率
            const enthusiasm = parseInt(player.积极性 || 75);
            const attendanceProb = enthusiasm / 100;
            
            // 职业球员出勤率更高
            const levelBonus = player.水平 === '职业' ? 0.2 : 
                             player.水平 === '极高' ? 0.1 : 
                             player.水平 === '高' ? 0.05 : 0;
            
            const finalProb = Math.min(attendanceProb + levelBonus, 0.95);
            const attended = Math.random() < finalProb;
            
            attendanceData.push({
                playerName: player.姓名,
                date: activity.date,
                type: activity.type,
                attended: attended.toString(),
                group: player.组别
            });
        });
    });
    
    return attendanceData;
}

// 主函数
async function generateAllData() {
    console.log('开始生成真实比赛数据...');
    
    await loadPlayersData();
    await loadActivitiesData();
    
    console.log('生成比赛参与者数据...');
    const allParticipants = [];
    const allEvents = [];
    
    activitiesData.forEach(activity => {
        const participants = selectParticipants(activity);
        allParticipants.push(...participants);
        
        const events = generateMatchEvents(activity, participants);
        allEvents.push(...events);
    });
    
    console.log('生成训练出勤数据...');
    const attendanceData = generateTrainingAttendance();
    
    // 写入文件
    console.log('写入数据文件...');
    
    // 写入参与者数据
    const participantsCSV = 'activityId,playerName,status,group,date\n' + 
        allParticipants.map(p => `${p.activityId},${p.playerName},${p.status},${p.group},${p.date}`).join('\n');
    fs.writeFileSync('match_participants.csv', participantsCSV);
    
    // 写入比赛事件数据
    const eventsCSV = 'id,activityId,eventType,scorer,assister,minute,date,group\n' + 
        allEvents.map(e => `${e.id},${e.activityId},${e.eventType},${e.scorer},${e.assister},${e.minute},${e.date},${e.group}`).join('\n');
    fs.writeFileSync('match_events.csv', eventsCSV);
    
    // 写入训练出勤数据
    const attendanceCSV = 'playerName,date,type,attended,group\n' + 
        attendanceData.map(a => `${a.playerName},${a.date},${a.type},${a.attended},${a.group}`).join('\n');
    fs.writeFileSync('training_attendance.csv', attendanceCSV);
    
    console.log('数据生成完成！');
    console.log(`生成了 ${allParticipants.length} 条参与记录`);
    console.log(`生成了 ${allEvents.length} 个进球事件`);
    console.log(`生成了 ${attendanceData.length} 条训练出勤记录`);
}

generateAllData().catch(console.error); 