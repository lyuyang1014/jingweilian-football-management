const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// 启用 CORS
app.use(cors());
app.use(express.json());

// 静态文件服务
app.use(express.static('.'));

// 根路径重定向到主页
app.get('/', (req, res) => {
    res.redirect('/display.html');
});

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 存储数据
let playersData = [];
let activitiesData = [];
let matchEventsData = [];
let matchParticipantsData = [];
let trainingAttendanceData = [];
let goalkeepersData = []; // 新增：门将数据
let attributeDescriptions = {}; // 新增：属性描述数据
let famousClubs = []; // 新增：知名俱乐部数据
let famousPlayers = []; // 新增：知名球员数据
let playerPreferences = {}; // 新增：球员偏好数据

// 读取球员CSV文件
function loadPlayersData() {
    playersData = [];
    fs.createReadStream('2025member.csv')
        .pipe(csv())
        .on('data', (row) => {
            playersData.push(row);
        })
        .on('end', () => {
            console.log('球员数据加载完成，共 ' + playersData.length + ' 名球员');
        })
        .on('error', (err) => {
            console.error('读取球员文件失败:', err);
        });
}

// 新增：读取门将数据
function loadGoalkeepersData() {
    goalkeepersData = [];
    fs.createReadStream('goalkeepers.csv')
        .pipe(csv())
        .on('data', (row) => {
            goalkeepersData.push(row);
        })
        .on('end', () => {
            console.log('门将数据加载完成，共 ' + goalkeepersData.length + ' 名门将');
        })
        .on('error', (err) => {
            console.error('读取门将文件失败:', err);
        });
}

// 读取活动数据
function loadActivitiesData() {
    activitiesData = [];
    fs.createReadStream('activities.csv')
        .pipe(csv())
        .on('data', (row) => {
            activitiesData.push(row);
        })
        .on('end', () => {
            console.log('活动数据加载完成，共 ' + activitiesData.length + ' 个活动');
        })
        .on('error', (err) => {
            console.error('读取活动文件失败:', err);
        });
}

// 读取比赛事件数据
function loadMatchEventsData() {
    matchEventsData = [];
    fs.createReadStream('match_events.csv')
        .pipe(csv())
        .on('data', (row) => {
            matchEventsData.push(row);
        })
        .on('end', () => {
            console.log('比赛事件加载完成，共 ' + matchEventsData.length + ' 个事件');
        })
        .on('error', (err) => {
            console.error('读取比赛事件文件失败:', err);
        });
}

// 读取比赛参与者数据
function loadMatchParticipantsData() {
    matchParticipantsData = [];
    fs.createReadStream('match_participants.csv')
        .pipe(csv())
        .on('data', (row) => {
            matchParticipantsData.push(row);
        })
        .on('end', () => {
            console.log('比赛参与者加载完成，共 ' + matchParticipantsData.length + ' 条记录');
        })
        .on('error', (err) => {
            console.error('读取比赛参与者文件失败:', err);
        });
}

// 读取训练出勤数据
function loadTrainingAttendanceData() {
    trainingAttendanceData = [];
    fs.createReadStream('training_attendance.csv')
        .pipe(csv())
        .on('data', (row) => {
            trainingAttendanceData.push(row);
        })
        .on('end', () => {
            console.log('训练出勤加载完成，共 ' + trainingAttendanceData.length + ' 条记录');
        })
        .on('error', (err) => {
            console.error('读取训练出勤文件失败:', err);
        });
}

// 新增：读取属性描述数据
function loadAttributeDescriptions() {
    attributeDescriptions = {};
    fs.createReadStream('football_attributes.csv')
        .pipe(csv())
        .on('data', (row) => {
            const { Category, Attribute, Score_Range, Description_CN } = row;
            
            // 简化属性名称，去掉英文括号部分，例如 "传球 (Passing)" -> "传球"
            const simplifiedAttributeName = Attribute.replace(/\s*\([^)]*\)/, '').trim();
            
            if (!attributeDescriptions[simplifiedAttributeName]) {
                attributeDescriptions[simplifiedAttributeName] = [];
            }
            
            // 解析分数范围，例如 "60-68 (业余初学)" -> [60, 68]
            const rangeMatch = Score_Range.match(/(\d+)-(\d+)/);
            if (rangeMatch) {
                const min = parseInt(rangeMatch[1]);
                const max = parseInt(rangeMatch[2]);
                
                attributeDescriptions[simplifiedAttributeName].push({
                    range: [min, max],
                    description: Description_CN
                });
            }
        })
        .on('end', () => {
            console.log('属性描述文件加载完成');
        })
        .on('error', (err) => {
            console.error('读取属性描述文件失败:', err);
        });
}

// 新增：读取知名俱乐部数据
function loadFamousClubsData() {
    try {
        const data = fs.readFileSync('famous_clubs.json', 'utf8');
        const clubsData = JSON.parse(data);
        famousClubs = clubsData.clubs;
        console.log('知名俱乐部数据加载完成，共 ' + famousClubs.length + ' 个俱乐部');
    } catch (err) {
        console.error('读取知名俱乐部文件失败:', err);
    }
}

// 新增：读取知名球员数据
function loadFamousPlayersData() {
    try {
        const data = fs.readFileSync('famous_players.json', 'utf8');
        const playersData = JSON.parse(data);
        famousPlayers = playersData.players;
        console.log('知名球员数据加载完成，共 ' + famousPlayers.length + ' 个球员');
    } catch (err) {
        console.error('读取知名球员文件失败:', err);
    }
}

// 新增：生成随机球员偏好
function generatePlayerPreferences() {
    playerPreferences = {};
    
    playersData.forEach(player => {
        const playerName = player.姓名;
        playerPreferences[playerName] = {
            favoriteClubs: [],
            favoritePlayers: []
        };
        
        // 随机选择1-2个喜爱的俱乐部
        const numClubs = Math.random() < 0.7 ? 1 : 2; // 70%概率选择1个，30%概率选择2个
        const selectedClubs = [];
        for (let i = 0; i < numClubs; i++) {
            let randomClub;
            do {
                randomClub = famousClubs[Math.floor(Math.random() * famousClubs.length)];
            } while (selectedClubs.includes(randomClub.id));
            selectedClubs.push(randomClub.id);
            playerPreferences[playerName].favoriteClubs.push(randomClub);
        }
        
        // 随机选择1-2个喜爱的球员
        const numPlayers = Math.random() < 0.6 ? 1 : 2; // 60%概率选择1个，40%概率选择2个
        const selectedPlayers = [];
        for (let i = 0; i < numPlayers; i++) {
            let randomPlayer;
            do {
                randomPlayer = famousPlayers[Math.floor(Math.random() * famousPlayers.length)];
            } while (selectedPlayers.includes(randomPlayer.id));
            selectedPlayers.push(randomPlayer.id);
            playerPreferences[playerName].favoritePlayers.push(randomPlayer);
        }
    });
    
    console.log('球员偏好数据生成完成');
}

// 初始化加载数据
loadPlayersData();
loadActivitiesData();
loadMatchEventsData();
loadMatchParticipantsData();
loadTrainingAttendanceData();
loadGoalkeepersData();
loadAttributeDescriptions(); // 新增：加载属性描述
loadFamousClubsData(); // 新增：加载知名俱乐部数据
loadFamousPlayersData(); // 新增：加载知名球员数据

// 延迟生成球员偏好，确保其他数据先加载完成
setTimeout(() => {
    generatePlayerPreferences(); // 新增：生成球员偏好数据
}, 1000);

// API: 获取所有球员列表
app.get('/api/players', (req, res) => {
    res.json({
        success: true,
        data: playersData
    });
});

// API: 根据球衣号码获取球员信息
app.get('/api/player/number/:number', (req, res) => {
    const number = req.params.number;
    const player = playersData.find(p => p.球衣号码 === number);
    
    if (player) {
        res.json({
            success: true,
            data: player
        });
    } else {
        res.status(404).json({
            success: false,
            message: '未找到该球衣号码的球员'
        });
    }
});

// API: 获取球员统计数据
app.get('/api/player-stats/:name', (req, res) => {
    const playerName = decodeURIComponent(req.params.name);
    
    console.log(`获取球员统计: ${playerName}`);

    // 比赛参与统计
    const playerMatches = matchParticipantsData.filter(record => record.playerName === playerName);
    
    // 比赛事件统计（进球和助攻）
    const playerGoals = matchEventsData.filter(event => event.scorer === playerName);
    const playerAssists = matchEventsData.filter(event => event.assister === playerName);
    
    const matchStats = {
        totalMatches: playerMatches.length,
        starterMatches: playerMatches.filter(m => m.status === '首发').length,
        substituteMatches: playerMatches.filter(m => m.status === '替补').length,
        totalGoals: playerGoals.length,
        totalAssists: playerAssists.length,
        competitiveMatches: playerMatches.filter(m => m.group === '竞技组').length,
        recreationalMatches: playerMatches.filter(m => m.group === '兴趣组').length
    };
    
    // 训练统计
    const playerTraining = trainingAttendanceData.filter(record => record.playerName === playerName);
    
    const trainingStats = {
        totalRegistrations: playerTraining.length,
        totalAttendance: playerTraining.filter(t => t.attended === 'true').length,
        attendanceRate: playerTraining.length > 0 ? 
            Math.round((playerTraining.filter(t => t.attended === 'true').length / playerTraining.length) * 100) : 0,
        teamTrainings: playerTraining.filter(t => t.type === '队内训练').length,
        skirmishMatches: playerTraining.filter(t => t.type === '队内对抗赛').length,
        attendedTeamTrainings: playerTraining.filter(t => t.type === '队内训练' && t.attended === 'true').length,
        attendedSkirmishMatches: playerTraining.filter(t => t.type === '队内对抗赛' && t.attended === 'true').length
    };
    
    res.json({
        success: true,
        data: {
            playerName: playerName,
            matchStats: matchStats,
            trainingStats: trainingStats
        }
    });
});

// API: 获取单个球员基本信息
app.get('/api/player/:name', (req, res) => {
    const playerName = decodeURIComponent(req.params.name);
    
    console.log(`获取球员信息: ${playerName}`);
    
    // 从球员数据中查找
    const player = playersData.find(p => p.姓名 === playerName);
    
    if (!player) {
        res.json({
            success: false,
            message: '未找到该球员'
        });
        return;
    }

    // 计算MVP次数和平均分
    const playerMatches = matchParticipantsData.filter(record => record.playerName === playerName);
    const playerGoals = matchEventsData.filter(event => event.scorer === playerName);
    const playerAssists = matchEventsData.filter(event => event.assister === playerName);
    
    // MVP次数计算 - 根据每场比赛的表现评分
    let mvpCount = 0;
    let totalRatings = 0;
    let ratedMatches = 0;
    
    // 按活动分组计算每场比赛的表现
    const matchPerformances = {};
    
    playerMatches.forEach(match => {
        const activityId = match.activityId;
        if (!matchPerformances[activityId]) {
            matchPerformances[activityId] = {
                activityId: activityId,
                status: match.status,
                rating: 0,
                goals: 0,
                assists: 0
            };
        }
        
        // 计算该场比赛的表现分数
        const matchGoals = playerGoals.filter(goal => goal.activityId === activityId).length;
        const matchAssists = playerAssists.filter(assist => assist.activityId === activityId).length;
        
        // 基础评分：首发7分，替补6分
        let baseRating = match.status === '首发' ? 7.0 : 6.0;
        
        // 进球加分：每球+1分
        baseRating += matchGoals * 1.0;
        
        // 助攻加分：每助攻+0.5分
        baseRating += matchAssists * 0.5;
        
        // 位置调整：根据球员主要位置给予不同期待
        const position = player.主要位置;
        if (['ST', 'LW', 'RW', 'CAM'].includes(position)) {
            // 进攻球员：进球权重更高
            baseRating += matchGoals * 0.5;
        } else if (['CDM', 'CM', 'LM', 'RM'].includes(position)) {
            // 中场球员：助攻权重更高
            baseRating += matchAssists * 0.5;
        }
        
        // 限制最高10分
        const finalRating = Math.min(baseRating, 10.0);
        
        matchPerformances[activityId].rating = finalRating;
        matchPerformances[activityId].goals = matchGoals;
        matchPerformances[activityId].assists = matchAssists;
        
        totalRatings += finalRating;
        ratedMatches++;
        
        // MVP判定：单场8.5分以上算MVP表现
        if (finalRating >= 8.5) {
            mvpCount++;
        }
    });
    
    const averageRating = ratedMatches > 0 ? (totalRatings / ratedMatches).toFixed(1) : '0.0';
    
    // 增强的球员数据
    const enhancedPlayer = {
        ...player,
        // 统计数据
        totalMatches: playerMatches.length,
        totalGoals: playerGoals.length,
        totalAssists: playerAssists.length,
        mvpCount: mvpCount,
        averageRating: parseFloat(averageRating),
        
        // 身价信息（如果没有则计算）
        marketValue: player.身价 || calculatePlayerMarketValue(player),
        
        // 喜爱的球队和球员（从偏好数据中获取）
        preferences: playerPreferences[playerName] || {
            favoriteClubs: [],
            favoritePlayers: []
        },
        
        // 最近表现
        recentPerformances: Object.values(matchPerformances)
            .sort((a, b) => b.activityId - a.activityId)
            .slice(0, 5) // 最近5场比赛
    };
    
    res.json({
        success: true,
        data: enhancedPlayer
    });
});

// 计算球员身价的函数
function calculatePlayerMarketValue(player) {
    const age = parseInt(player.年龄) || 30;
    const level = player.水平;
    const position = player.主要位置;
    const overall = parseInt(player.综合能力) || 75;
    
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
    
    return finalValue;
}

// API: 获取球员详细比赛事件（进球和助攻记录）
app.get('/api/player/:name/events', (req, res) => {
    const playerName = decodeURIComponent(req.params.name);
    
    // 获取该球员的所有进球
    const goals = matchEventsData.filter(event => event.scorer === playerName).map(event => {
        // 获取比赛详情
        const match = activitiesData.find(activity => activity.id === event.activityId);
        const participants = matchParticipantsData.filter(p => p.activityId === event.activityId);
        const playerParticipation = participants.find(p => p.playerName === playerName);
        
        return {
            ...event,
            role: '进球者',
            opponent: match ? match.opponent : '未知对手',
            group: match ? match.group : event.group,
            participationStatus: playerParticipation ? playerParticipation.status : '未知',
            matchDate: event.date,
            assistType: event.assister ? '有助攻' : '单独破门',
            goalDetails: {
                minute: parseInt(event.minute),
                scorer: event.scorer,
                assister: event.assister || null,
                hasAssist: !!event.assister
            }
        };
    });
    
    // 获取该球员的所有助攻
    const assists = matchEventsData.filter(event => event.assister === playerName).map(event => {
        // 获取比赛详情
        const match = activitiesData.find(activity => activity.id === event.activityId);
        const participants = matchParticipantsData.filter(p => p.activityId === event.activityId);
        const playerParticipation = participants.find(p => p.playerName === playerName);
        
        return {
            ...event,
            role: '助攻者',
            opponent: match ? match.opponent : '未知对手',
            group: match ? match.group : event.group,
            participationStatus: playerParticipation ? playerParticipation.status : '未知',
            matchDate: event.date,
            assistType: '传球助攻',
            assistDetails: {
                minute: parseInt(event.minute),
                scorer: event.scorer,
                assister: event.assister,
                assistFor: event.scorer
            }
        };
    });
    
    // 合并并按日期排序
    const allEvents = [...goals, ...assists].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 按比赛分组统计
    const matchSummary = {};
    allEvents.forEach(event => {
        const matchKey = `${event.date}_${event.opponent}`;
        if (!matchSummary[matchKey]) {
            matchSummary[matchKey] = {
                date: event.date,
                opponent: event.opponent,
                group: event.group,
                participationStatus: event.participationStatus,
                goals: 0,
                assists: 0,
                events: []
            };
        }
        
        if (event.role === '进球者') {
            matchSummary[matchKey].goals++;
        } else {
            matchSummary[matchKey].assists++;
        }
        
        matchSummary[matchKey].events.push(event);
    });
    
    res.json({
        success: true,
        data: {
            playerName: playerName,
            totalEvents: allEvents.length,
            goals: goals.length,
            assists: assists.length,
            events: allEvents,
            matchSummary: Object.values(matchSummary).sort((a, b) => new Date(b.date) - new Date(a.date))
        }
    });
});

// API: 获取球员合作网络（与谁有过进球助攻关系）
app.get('/api/player/:name/network', (req, res) => {
    const playerName = decodeURIComponent(req.params.name);
    
    // 该球员进球时的助攻者
    const assistsToPlayer = matchEventsData
        .filter(event => event.scorer === playerName && event.assister)
        .map(event => event.assister);
    
    // 该球员助攻时的进球者
    const assistsFromPlayer = matchEventsData
        .filter(event => event.assister === playerName)
        .map(event => event.scorer);
    
    // 统计合作次数
    const cooperationCounts = {};
    
    assistsToPlayer.forEach(assister => {
        cooperationCounts[assister] = cooperationCounts[assister] || { assistsToMe: 0, assistsFromMe: 0 };
        cooperationCounts[assister].assistsToMe++;
    });
    
    assistsFromPlayer.forEach(scorer => {
        cooperationCounts[scorer] = cooperationCounts[scorer] || { assistsToMe: 0, assistsFromMe: 0 };
        cooperationCounts[scorer].assistsFromMe++;
    });
    
    // 转换为数组格式
    const networkData = Object.entries(cooperationCounts).map(([partnerName, counts]) => ({
        partnerName,
        assistsToMe: counts.assistsToMe,
        assistsFromMe: counts.assistsFromMe,
        totalCooperations: counts.assistsToMe + counts.assistsFromMe
    })).sort((a, b) => b.totalCooperations - a.totalCooperations);
    
    res.json({
        success: true,
        data: {
            playerName: playerName,
            networkSize: networkData.length,
            cooperations: networkData
        }
    });
});

// API: 获取历史赛事回顾数据
app.get('/api/matches', (req, res) => {
    // 获取所有正式比赛
    const matches = activitiesData.filter(activity => activity.type === '正式比赛');
    
    // 为每场比赛补充详细信息
    const matchDetails = matches.map(match => {
        // 获取该场比赛的参与者
        const participants = matchParticipantsData.filter(p => p.activityId === match.id);
        const starters = participants.filter(p => p.status === '首发');
        const substitutes = participants.filter(p => p.status === '替补');
        
        // 获取该场比赛的事件
        const events = matchEventsData.filter(e => e.activityId === match.id);
        const goals = events.length;
        
        // 统计比分（假设对手进球数随机）
        const ourGoals = goals;
        const opponentGoals = Math.floor(Math.random() * 4); // 0-3个随机进球
        
        return {
            id: match.id,
            date: match.date,
            group: match.group,
            opponent: match.opponent || '未知对手',
            ourScore: ourGoals,
            opponentScore: opponentGoals,
            result: ourGoals > opponentGoals ? '胜' : (ourGoals === opponentGoals ? '平' : '负'),
            participants: {
                starters: starters.length,
                substitutes: substitutes.length,
                total: participants.length
            },
            events: {
                goals: goals,
                goalScorers: events.map(e => ({
                    scorer: e.scorer,
                    assister: e.assister || null,
                    minute: e.minute
                }))
            }
        };
    });
    
    // 按日期倒序排列
    matchDetails.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json({
        success: true,
        data: {
            totalMatches: matchDetails.length,
            matches: matchDetails
        }
    });
});

// API: 获取单场比赛详细信息
app.get('/api/match/:id', (req, res) => {
    const matchId = req.params.id;
    
    // 获取比赛基本信息
    const match = activitiesData.find(activity => activity.id === matchId && activity.type === '正式比赛');
    
    if (!match) {
        return res.status(404).json({
            success: false,
            message: '未找到该比赛'
        });
    }
    
    // 获取参与者详细信息
    const participants = matchParticipantsData.filter(p => p.activityId === matchId);
    
    // 获取比赛事件
    const events = matchEventsData.filter(e => e.activityId === matchId);
    
    // 验证并修复比赛数据一致性
    function validateAndFixMatchData(participants, events) {
        const starters = [];
        const substitutes = [];
        
        // 从参与者数据中提取首发和替补
        participants.forEach(participant => {
            if (participant.状态 === '首发' || participant.角色 === '首发') {
                starters.push(participant.姓名);
            } else if (participant.状态 === '替补' || participant.角色 === '替补') {
                substitutes.push(participant.姓名);
            } else {
                // 默认作为首发处理
                starters.push(participant.姓名);
            }
        });
        
        // 确保有足够的首发球员
        if (starters.length < 7) {
            console.log(`警告: 首发球员不足 (${starters.length}/7)，将从替补中补充`);
            const needMore = 7 - starters.length;
            const movedFromSubs = substitutes.splice(0, needMore);
            starters.push(...movedFromSubs);
        }
        
        return {
            starters: [...new Set(starters)], // 去重
            substitutes: [...new Set(substitutes)], // 去重
            isValid: starters.length >= 7
        };
    }
    
    // 验证并修复数据一致性
    const validationResult = validateAndFixMatchData(participants, events);
    const starters = validationResult.starters;
    const substitutes = validationResult.substitutes;
    
    // 获取球员详细信息并安排位置
    function getPlayerDetails(playerNames) {
        return playerNames.map(name => {
            const memberInfo = playersData.find(m => m.姓名 === name);
            const goalKeeperInfo = goalkeepersData.find(gk => gk.姓名 === name);
            
            // 如果是专业门将
            if (goalKeeperInfo) {
                return {
                    name: name,
                    position: 'GK',
                    primaryPos: 'GK',
                    secondaryPos: goalKeeperInfo.次要位置 || 'CB',
                    isGoalkeeper: true,
                    rating: parseInt(goalKeeperInfo.综合评分) || parseInt(memberInfo?.综合能力) || 80,
                    number: goalKeeperInfo.背号 || memberInfo?.球衣号码 || '0'
                };
            }
            // 如果在普通球员中标记为门将
            else if (memberInfo && memberInfo.主要位置 === 'GK') {
                return {
                    name: name,
                    position: 'GK',
                    primaryPos: 'GK',
                    secondaryPos: memberInfo.次要位置 || 'CB',
                    isGoalkeeper: true,
                    rating: parseInt(memberInfo.综合能力) || 75,
                    number: memberInfo.球衣号码 || '0'
                };
            } 
            // 普通球员
            else if (memberInfo) {
                return {
                    name: name,
                    position: memberInfo.主要位置 || 'CM',
                    primaryPos: memberInfo.主要位置 || 'CM',
                    secondaryPos: memberInfo.次要位置 || '',
                    isGoalkeeper: false,
                    rating: parseInt(memberInfo.综合能力) || 75,
                    number: memberInfo.球衣号码 || '0'
                };
            } 
            // 未知球员
            else {
                return {
                    name: name,
                    position: 'CM',
                    primaryPos: 'CM',
                    secondaryPos: '',
                    isGoalkeeper: false,
                    rating: 70,
                    number: '0'
                };
            }
        });
    }
    
    // 生成合理的阵容安排
    function generateFormation(starterDetails) {
        const numPlayers = starterDetails.length;
        
        // 根据人数确定阵型
        function getFormationByPlayerCount(count) {
            switch(count) {
                case 7:
                    return {
                        name: '1-2-2-1-1', // 1门将+2后卫+2中场+1中场+1前锋
                        positions: [
                            {pos: 'GK', x: 50, y: 92, priority: ['GK']},
                            // 后卫线 (2人)
                            {pos: 'LB', x: 30, y: 75, priority: ['LB', 'CB', 'LM']},
                            {pos: 'RB', x: 70, y: 75, priority: ['RB', 'CB', 'RM']},
                            // 中场线 (2人)
                            {pos: 'LM', x: 30, y: 50, priority: ['LM', 'CM', 'LW']},
                            {pos: 'RM', x: 70, y: 50, priority: ['RM', 'CM', 'RW']},
                            // 中场中路 (1人)
                            {pos: 'CM', x: 50, y: 40, priority: ['CM', 'CAM', 'CDM']},
                            // 前锋 (1人)
                            {pos: 'ST', x: 50, y: 15, priority: ['ST', 'CAM']}
                        ]
                    };
                case 8:
                    return {
                        name: '1-2-3-1-1', // 1门将+2后卫+3中场+1攻击中场+1前锋
                        positions: [
                            {pos: 'GK', x: 50, y: 92, priority: ['GK']},
                            // 后卫线 (2人)
                            {pos: 'LB', x: 25, y: 75, priority: ['LB', 'CB', 'LM']},
                            {pos: 'RB', x: 75, y: 75, priority: ['RB', 'CB', 'RM']},
                            // 中场线 (3人)
                            {pos: 'LM', x: 20, y: 50, priority: ['LM', 'CM', 'LW']},
                            {pos: 'CM', x: 50, y: 50, priority: ['CM', 'CDM', 'CAM']},
                            {pos: 'RM', x: 80, y: 50, priority: ['RM', 'CM', 'RW']},
                            // 攻击中场 (1人)
                            {pos: 'CAM', x: 50, y: 30, priority: ['CAM', 'CM', 'ST']},
                            // 前锋 (1人)
                            {pos: 'ST', x: 50, y: 15, priority: ['ST', 'CAM']}
                        ]
                    };
                case 9:
                    // 优先使用3-3-1阵型
                    return {
                        name: '1-3-3-1-1', // 1门将+3后卫+3中场+1攻击中场+1前锋
                        positions: [
                            {pos: 'GK', x: 50, y: 92, priority: ['GK']},
                            // 后卫线 (3人)
                            {pos: 'LB', x: 20, y: 75, priority: ['LB', 'CB', 'LM']},
                            {pos: 'CB', x: 50, y: 75, priority: ['CB', 'CDM']},
                            {pos: 'RB', x: 80, y: 75, priority: ['RB', 'CB', 'RM']},
                            // 中场线 (3人)
                            {pos: 'LM', x: 25, y: 50, priority: ['LM', 'CM', 'LW']},
                            {pos: 'CM', x: 50, y: 50, priority: ['CM', 'CDM', 'CAM']},
                            {pos: 'RM', x: 75, y: 50, priority: ['RM', 'CM', 'RW']},
                            // 攻击中场 (1人)
                            {pos: 'CAM', x: 50, y: 30, priority: ['CAM', 'CM', 'ST']},
                            // 前锋 (1人)
                            {pos: 'ST', x: 50, y: 15, priority: ['ST', 'CAM']}
                        ]
                    };
                case 10:
                    return {
                        name: '1-3-4-1-1', // 1门将+3后卫+4中场+1边锋+1前锋
                        positions: [
                            {pos: 'GK', x: 50, y: 92, priority: ['GK']},
                            // 后卫线 (3人)
                            {pos: 'LB', x: 20, y: 75, priority: ['LB', 'CB', 'LM']},
                            {pos: 'CB', x: 50, y: 75, priority: ['CB', 'CDM']},
                            {pos: 'RB', x: 80, y: 75, priority: ['RB', 'CB', 'RM']},
                            // 中场线 (4人)
                            {pos: 'LM', x: 20, y: 50, priority: ['LM', 'CM', 'LW']},
                            {pos: 'CDM', x: 40, y: 55, priority: ['CDM', 'CM', 'CB']},
                            {pos: 'CAM', x: 60, y: 45, priority: ['CAM', 'CM', 'ST']},
                            {pos: 'RM', x: 80, y: 50, priority: ['RM', 'CM', 'RW']},
                            // 边锋 (1人)
                            {pos: 'LW', x: 35, y: 25, priority: ['LW', 'ST', 'LM']},
                            // 前锋 (1人)
                            {pos: 'ST', x: 50, y: 15, priority: ['ST', 'CAM']}
                        ]
                    };
                default: // 11人制 4-3-2-1
                    return {
                        name: '1-4-3-2-1', // 1门将+4后卫+3中场+2前锋+1中锋
                        positions: [
                            {pos: 'GK', x: 50, y: 92, priority: ['GK']},
                            // 后卫线 (4人)
                            {pos: 'LB', x: 15, y: 75, priority: ['LB', 'LM', 'LW']},
                            {pos: 'CB', x: 35, y: 75, priority: ['CB', 'CDM']},
                            {pos: 'CB', x: 65, y: 75, priority: ['CB', 'CDM']},
                            {pos: 'RB', x: 85, y: 75, priority: ['RB', 'RM', 'RW']},
                            // 中场线 (3人)
                            {pos: 'LM', x: 25, y: 50, priority: ['LM', 'CM', 'LW']},
                            {pos: 'CM', x: 50, y: 50, priority: ['CM', 'CDM', 'CAM']},
                            {pos: 'RM', x: 75, y: 50, priority: ['RM', 'CM', 'RW']},
                            // 前锋线 (2人)
                            {pos: 'LF', x: 40, y: 25, priority: ['LW', 'ST', 'CAM']},
                            {pos: 'RF', x: 60, y: 25, priority: ['RW', 'ST', 'CAM']},
                            // 中锋 (1人)
                            {pos: 'ST', x: 50, y: 8, priority: ['ST', 'CAM']}
                        ]
                    };
            }
        }
        
        const formation = getFormationByPlayerCount(numPlayers);
        const assignedPlayers = [];
        const availablePlayers = [...starterDetails];
        
        // 首先确保有门将 - 强化门将优先级
        const goalkeepers = availablePlayers.filter(p => p.isGoalkeeper);
        let goalkeeper = null;
        
        if (goalkeepers.length > 0) {
            // 优先选择专业门将，按评分排序选择最佳
            goalkeeper = goalkeepers
                .sort((a, b) => b.rating - a.rating) // 按评分从高到低排序
                .find(gk => goalkeepersData.find(gkData => gkData.姓名 === gk.name)) || // 优先选择在门将文件中的
                goalkeepers.reduce((best, current) => current.rating > best.rating ? current : best);
            
            console.log(`选择门将: ${goalkeeper.name} (专业门将, 评分: ${goalkeeper.rating})`);
        } else {
            // 只有在完全没有门将参与比赛时，才让其他球员客串门将
            console.log('警告: 本场比赛没有专业门将参与，将安排其他球员客串门将');
            
            // 优先选择后卫或防守型中场客串
            const defensivePlayers = availablePlayers.filter(p => 
                ['CB', 'CDM', 'LB', 'RB'].includes(p.primaryPos)
            );
            if (defensivePlayers.length > 0) {
                // 选择评分最低的防守球员客串门将（保留强力防守球员在其原位置）
                goalkeeper = defensivePlayers.reduce((worst, current) => 
                    current.rating < worst.rating ? current : worst
                );
                goalkeeper.isGoalkeeper = true; // 临时指定为门将
                goalkeeper.formationPos = 'GK';
                console.log(`安排 ${goalkeeper.name} (${goalkeeper.primaryPos}) 客串门将`);
            } else {
                goalkeeper = availablePlayers[0]; // 最后选择任意球员
                goalkeeper.isGoalkeeper = true;
                goalkeeper.formationPos = 'GK';
                console.log(`安排 ${goalkeeper.name} 客串门将`);
            }
        }
        
        if (goalkeeper) {
            assignedPlayers.push({
                ...goalkeeper,
                formationPos: 'GK',
                x: formation.positions[0].x,
                y: formation.positions[0].y
            });
            availablePlayers.splice(availablePlayers.indexOf(goalkeeper), 1);
        }
        
        // 按位置优先级安排其他球员
        for (let i = 1; i < formation.positions.length && availablePlayers.length > 0; i++) {
            const position = formation.positions[i];
            let bestPlayer = null;
            let bestScore = -1;
            
            for (const player of availablePlayers) {
                let score = 0;
                
                // 主要位置匹配
                if (position.priority.includes(player.primaryPos)) {
                    score += 100;
                }
                // 次要位置匹配
                if (position.priority.includes(player.secondaryPos)) {
                    score += 50;
                }
                
                // 位置相关性加分
                const positionCompatibility = {
                    'CB': ['CDM', 'CB', 'LB', 'RB'],
                    'LB': ['LM', 'LW', 'LB', 'CB'],
                    'RB': ['RM', 'RW', 'RB', 'CB'],
                    'CDM': ['CM', 'CB', 'CDM'],
                    'CM': ['CAM', 'CDM', 'CM', 'LM', 'RM'],
                    'LM': ['LW', 'CM', 'LB', 'LM'],
                    'RM': ['RW', 'CM', 'RB', 'RM'],
                    'CAM': ['CM', 'ST', 'LW', 'RW', 'CAM'],
                    'LW': ['LM', 'ST', 'CAM', 'LW'],
                    'RW': ['RM', 'ST', 'CAM', 'RW'],
                    'ST': ['CAM', 'LW', 'RW', 'ST'],
                    'LF': ['LW', 'ST', 'CAM', 'LM'],
                    'RF': ['RW', 'ST', 'CAM', 'RM']
                };
                
                const compatible = positionCompatibility[position.pos] || [];
                if (compatible.includes(player.primaryPos)) score += 20;
                if (compatible.includes(player.secondaryPos)) score += 10;
                
                // 能力评分加分
                score += player.rating / 10;
                
                // 随机因素，避免每次都是相同的阵容
                score += Math.random() * 5;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestPlayer = player;
                }
            }
            
            if (bestPlayer) {
                assignedPlayers.push({
                    ...bestPlayer,
                    formationPos: position.pos,
                    x: position.x,
                    y: position.y
                });
                availablePlayers.splice(availablePlayers.indexOf(bestPlayer), 1);
            }
        }
        
        // 剩余球员随机分配到剩余位置
        for (let i = assignedPlayers.length; i < Math.min(numPlayers, starterDetails.length); i++) {
            if (availablePlayers.length > 0) {
                const player = availablePlayers.shift();
                const remainingPos = formation.positions[assignedPlayers.length];
                if (remainingPos) {
                    assignedPlayers.push({
                        ...player,
                        formationPos: remainingPos.pos,
                        x: remainingPos.x,
                        y: remainingPos.y
                    });
                }
            }
        }
        
        return {
            formation: formation.name,
            players: assignedPlayers
        };
    }
    
    // 生成进球详情（包含位置信息）
    function generateGoalDetails(events, formation) {
        const fieldAreas = {
            // 按场地区域定义
            'penalty_box': {name: '禁区内', zones: [{x: [25, 75], y: [0, 20]}]},
            'six_yard_box': {name: '小禁区', zones: [{x: [40, 60], y: [0, 8]}]},
            'left_wing': {name: '左边路', zones: [{x: [0, 25], y: [20, 80]}]},
            'right_wing': {name: '右边路', zones: [{x: [75, 100], y: [20, 80]}]},
            'center_field': {name: '中场', zones: [{x: [25, 75], y: [40, 60]}]},
            'defense_third': {name: '后场', zones: [{x: [0, 100], y: [70, 100]}]},
            'attack_third': {name: '前场', zones: [{x: [0, 100], y: [0, 30]}]},
            'midfield_third': {name: '中场', zones: [{x: [0, 100], y: [30, 70]}]}
        };
        
        function getPlayerPosition(playerName, formation) {
            const player = formation.players.find(p => p.name === playerName);
            if (!player) return {x: 50, y: 50, area: '中场'};
            return {x: player.x, y: player.y, area: getAreaName(player.x, player.y)};
        }
        
        function getAreaName(x, y) {
            // 优先检查特殊区域
            if (y <= 20) {
                if (x >= 40 && x <= 60 && y <= 8) return '小禁区';
                if (x >= 25 && x <= 75) return '禁区内';
                if (x < 25) return '左边路';
                if (x > 75) return '右边路';
                return '前场';
            }
            
            if (y >= 70) return '后场';
            
            if (x < 25) return '左边路';
            if (x > 75) return '右边路';
            return '中场';
        }
        
        return events.map(event => {
            const scorerPos = getPlayerPosition(event.scorer, formation);
            const assisterPos = event.assister ? getPlayerPosition(event.assister, formation) : null;
            
            // 生成更详细的进球描述
            let goalDescription = `${event.minute}分钟，`;
            
            if (assisterPos) {
                goalDescription += `${event.assister}在${assisterPos.area}送出传球，`;
            }
            
            goalDescription += `${event.scorer}在${scorerPos.area}完成射门破门！`;
            
            return {
                ...event,
                goalDetail: {
                    scorer: {
                        name: event.scorer,
                        position: scorerPos,
                        area: scorerPos.area
                    },
                    assister: assisterPos ? {
                        name: event.assister,
                        position: assisterPos,
                        area: assisterPos.area
                    } : null,
                    description: goalDescription,
                    goalType: scorerPos.area === '小禁区' ? '近距离破门' : 
                              scorerPos.area === '禁区内' ? '禁区内射门' : 
                              '远距离射门'
                }
            };
        });
    }
    
    // 获取首发球员详细信息并生成阵容
    const starterDetails = getPlayerDetails(starters.map(p => p.playerName));
    const substituteDetails = getPlayerDetails(substitutes.map(p => p.playerName)); // 新增：获取替补球员详情
    
    // 检查门将分配是否合理
    const starterGoalkeepers = starterDetails.filter(p => p.isGoalkeeper);
    const substituteGoalkeepers = substituteDetails.filter(p => p.isGoalkeeper);
    
    if (starterGoalkeepers.length === 0 && substituteGoalkeepers.length > 0) {
        console.log('⚠️ 不合理安排警告: 专业门将在替补席！');
        console.log(`替补门将: ${substituteGoalkeepers.map(gk => `${gk.name}(评分:${gk.rating})`).join(', ')}`);
        console.log('建议将门将提升为首发，避免其他球员客串门将');
        
        // 自动调整：将评分最高的门将从替补提升为首发
        const bestGoalkeeper = substituteGoalkeepers.reduce((best, current) => 
            current.rating > best.rating ? current : best
        );
        
        // 找一个评分最低的首发球员换到替补
        const worstStarter = starterDetails.reduce((worst, current) => 
            !current.isGoalkeeper && current.rating < worst.rating ? current : worst
        );
        
        console.log(`🔄 自动调整: ${bestGoalkeeper.name}(门将) ↔ ${worstStarter.name}(${worstStarter.primaryPos})`);
        
        // 执行调整
        const goalKeeperIndex = starterDetails.findIndex(p => p.name === worstStarter.name);
        if (goalKeeperIndex !== -1) {
            starterDetails[goalKeeperIndex] = bestGoalkeeper;
        }
    }
    
    const formationResult = generateFormation(starterDetails);
    
    // 模拟换人数据
    const substitutions = [];
    const substitutePlayers = substitutes.map(p => p.playerName);
    const starterPlayers = starters.map(p => p.playerName);
    
    const numSubs = Math.min(Math.floor(Math.random() * 3) + 1, substitutePlayers.length);
    const usedSubstitutes = [];
    const usedStarters = [];
    
    for (let i = 0; i < numSubs; i++) {
        const availableSubstitutes = substitutePlayers.filter(p => !usedSubstitutes.includes(p));
        const availableStarters = starterPlayers.filter(p => !usedStarters.includes(p) && 
            !formationResult.players.find(fp => fp.name === p && fp.isGoalkeeper)); // 门将不换下
        
        if (availableSubstitutes.length > 0 && availableStarters.length > 0) {
            const playerIn = availableSubstitutes[Math.floor(Math.random() * availableSubstitutes.length)];
            const playerOut = availableStarters[Math.floor(Math.random() * availableStarters.length)];
            const minute = Math.floor(Math.random() * 45) + 45;
            
            substitutions.push({
                minute: minute,
                playerIn: playerIn,
                playerOut: playerOut
            });
            
            usedSubstitutes.push(playerIn);
            usedStarters.push(playerOut);
        }
    }
    
    substitutions.sort((a, b) => a.minute - b.minute);
    
    // 统计比分
    const ourGoals = events.length;
    const opponentGoals = Math.floor(Math.random() * 4);
    
    // 生成详细的进球信息
    const detailedEvents = generateGoalDetails(events.map(e => ({
        minute: e.minute,
        type: '进球',
        scorer: e.scorer,
        assister: e.assister || null
    })).sort((a, b) => a.minute - b.minute), formationResult);
    
    const matchDetail = {
        id: match.id,
        date: match.date,
        group: match.group,
        opponent: match.opponent || '未知对手',
        ourScore: ourGoals,
        opponentScore: opponentGoals,
        result: ourGoals > opponentGoals ? '胜' : (ourGoals === opponentGoals ? '平' : '负'),
        lineup: {
            starters: starters.map(p => p.playerName),
            substitutes: substitutes.map(p => p.playerName)
        },
        formation: formationResult,
        events: detailedEvents,
        substitutions: substitutions
    };
    
    res.json({
        success: true,
        data: matchDetail
    });
});

// API: 获取比赛事件数据（用于排行榜）
app.get('/api/match-events', (req, res) => {
    try {
        res.json(matchEventsData);
    } catch (error) {
        console.error('获取比赛事件数据失败:', error);
        res.status(500).json({
            success: false,
            message: '获取失败'
        });
    }
});

// API: 获取训练出勤数据（用于排行榜）
app.get('/api/training-attendance', (req, res) => {
    try {
        res.json(trainingAttendanceData);
    } catch (error) {
        console.error('获取训练出勤数据失败:', error);
        res.status(500).json({
            success: false,
            message: '获取失败'
        });
    }
});

// API: 获取俱乐部的粉丝
app.get('/api/club-fans/:clubId', (req, res) => {
    const clubId = req.params.clubId;
    
    try {
        // 找到对应的俱乐部信息
        const club = famousClubs.find(c => c.id === clubId);
        if (!club) {
            return res.json({
                success: false,
                message: '未找到该俱乐部'
            });
        }
        
        // 找到所有喜欢这个俱乐部的球员
        const fans = [];
        Object.keys(playerPreferences).forEach(playerName => {
            const playerPrefs = playerPreferences[playerName];
            const likedClub = playerPrefs.favoriteClubs.find(c => c.id === clubId);
            if (likedClub) {
                const playerData = playersData.find(p => p.姓名 === playerName);
                if (playerData) {
                    fans.push({
                        name: playerData.姓名,
                        position: playerData.主要位置,
                        group: playerData.组别,
                        rating: playerData.综合评分 || playerData.综合能力 || '0'
                    });
                }
            }
        });
        
        res.json({
            success: true,
            data: {
                club: club,
                fans: fans
            }
        });
    } catch (error) {
        console.error('获取俱乐部粉丝失败:', error);
        res.status(500).json({
            success: false,
            message: '获取失败'
        });
    }
});

// API: 获取球员的粉丝
app.get('/api/player-fans/:playerId', (req, res) => {
    const playerId = req.params.playerId;
    
    try {
        // 找到对应的球员信息
        const player = famousPlayers.find(p => p.id === playerId);
        if (!player) {
            return res.json({
                success: false,
                message: '未找到该球员'
            });
        }
        
        // 找到所有喜欢这个球员的球员
        const fans = [];
        Object.keys(playerPreferences).forEach(playerName => {
            const playerPrefs = playerPreferences[playerName];
            const likedPlayer = playerPrefs.favoritePlayers.find(p => p.id === playerId);
            if (likedPlayer) {
                const playerData = playersData.find(p => p.姓名 === playerName);
                if (playerData) {
                    fans.push({
                        name: playerData.姓名,
                        position: playerData.主要位置,
                        group: playerData.组别,
                        rating: playerData.综合评分 || playerData.综合能力 || '0'
                    });
                }
            }
        });
        
        res.json({
            success: true,
            data: {
                player: player,
                fans: fans
            }
        });
    } catch (error) {
        console.error('获取球员粉丝失败:', error);
        res.status(500).json({
            success: false,
            message: '获取失败'
        });
    }
});

// API: 获取属性描述
app.post('/api/attribute-description', (req, res) => {
    try {
        const { attribute, score } = req.body;
        
        if (!attribute || score === undefined) {
            return res.json({
                success: false,
                message: '缺少必要参数'
            });
        }
        
        // 查找对应的属性描述
        const descriptions = attributeDescriptions[attribute];
        if (!descriptions || descriptions.length === 0) {
            return res.json({
                success: false,
                message: '未找到该属性的描述'
            });
        }
        
        // 根据分数找到对应的描述
        let matchedDescription = '暂无详细描述';
        for (const desc of descriptions) {
            const [min, max] = desc.range;
            if (score >= min && score <= max) {
                matchedDescription = desc.description;
                break;
            }
        }
        
        res.json({
            success: true,
            description: matchedDescription,
            attribute: attribute,
            score: score
        });
    } catch (error) {
        console.error('获取属性描述失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`主页地址: http://localhost:${PORT}/display.html`);
});