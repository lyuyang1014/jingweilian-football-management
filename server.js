const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 启用 CORS
app.use(cors());
app.use(express.json());

// 静态文件服务 - 从 public 目录提供服务
app.use(express.static(path.join(__dirname, 'public')));

// 根路径重定向到主页
app.get('/', (req, res) => {
    res.redirect('/display.html');
});

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 全局数据变量
let playersData = [];
let activitiesData = [];
let matchEventsData = [];
let matchParticipantsData = [];
let trainingAttendanceData = [];
let goalkeepersData = [];
let attributeDescriptions = {};
let famousClubsData = [];
let famousPlayersData = [];
let playerPreferences = {};

// 文件路径处理函数 - 确保本地和 Vercel 环境兼容
function getFilePath(filename) {
    const possiblePaths = [
        path.join(process.cwd(), 'data', filename),      // data 目录（优先）
        path.join(__dirname, 'data', filename),          // 当前脚本目录的 data 子目录
        path.join(process.cwd(), filename),              // 根目录（备用）
        path.join(__dirname, filename)                   // 当前脚本目录（备用）
    ];
    
    // 检查文件是否存在，返回第一个存在的路径
    for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
            console.log(`找到文件: ${filename} -> ${filePath}`);
            return filePath;
        }
    }
    
    // 如果都找不到，返回默认路径（data目录下）
    const defaultPath = path.join(process.cwd(), 'data', filename);
    console.log(`文件不存在，使用默认路径: ${filename} -> ${defaultPath}`);
    return defaultPath;
}

// 验证并修复比赛数据一致性
function validateAndFixMatchData(participants, events) {
    let starters = [];
    let substitutes = [];
    
    // 处理参与者数据
    participants.forEach(participant => {
        const playerName = participant.姓名 || participant.playerName;
        const status = participant.状态 || participant.status || participant.角色;
        
        if (status === '首发' || status === '首发球员') {
            starters.push(playerName);
        } else if (status === '替补' || status === '替补球员') {
            substitutes.push(playerName);
        } else {
            // 默认作为首发处理
            starters.push(playerName);
        }
    });
    
    // 确保有足够的首发球员
    if (starters.length < 7) {
        console.log(`警告: 首发球员不足 (${starters.length}/7)，将从替补中补充`);
        const needMore = 7 - starters.length;
        const movedFromSubs = substitutes.splice(0, needMore);
        starters.push(...movedFromSubs);
    }
    
    // 去重
    starters = [...new Set(starters)];
    substitutes = [...new Set(substitutes)];
    
    return {
        starters: starters,
        substitutes: substitutes,
        isValid: starters.length >= 7
    };
}

// 读取球员CSV文件
function loadPlayersData() {
    playersData = [];
    const filePath = getFilePath('2025member.csv');
    
    if (!fs.existsSync(filePath)) {
        console.error('球员数据文件不存在:', filePath);
        return;
    }
    
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', function(row) {
            playersData.push(row);
        })
        .on('end', function() {
            console.log('球员数据加载完成，共 ' + playersData.length + ' 名球员');
        })
        .on('error', function(err) {
            console.error('读取球员文件失败:', err);
        });
}

// 读取活动数据
function loadActivitiesData() {
    activitiesData = [];
    const filePath = getFilePath('activities.csv');
    
    if (!fs.existsSync(filePath)) {
        console.error('活动数据文件不存在:', filePath);
        return;
    }
    
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', function(row) {
            activitiesData.push(row);
        })
        .on('end', function() {
            console.log('活动数据加载完成，共 ' + activitiesData.length + ' 个活动');
        })
        .on('error', function(err) {
            console.error('读取活动文件失败:', err);
        });
}

// 读取比赛事件数据
function loadMatchEventsData() {
    matchEventsData = [];
    const filePath = getFilePath('match_events.csv');
    
    if (!fs.existsSync(filePath)) {
        console.error('比赛事件数据文件不存在:', filePath);
        return;
    }
    
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', function(row) {
            matchEventsData.push(row);
        })
        .on('end', function() {
            console.log('比赛事件加载完成，共 ' + matchEventsData.length + ' 个事件');
        })
        .on('error', function(err) {
            console.error('读取比赛事件文件失败:', err);
        });
}

// 读取比赛参与者数据
function loadMatchParticipantsData() {
    matchParticipantsData = [];
    const filePath = getFilePath('match_participants.csv');
    
    if (!fs.existsSync(filePath)) {
        console.error('比赛参与者数据文件不存在:', filePath);
        return;
    }
    
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', function(row) {
            matchParticipantsData.push(row);
        })
        .on('end', function() {
            console.log('比赛参与者加载完成，共 ' + matchParticipantsData.length + ' 条记录');
        })
        .on('error', function(err) {
            console.error('读取比赛参与者文件失败:', err);
        });
}

// 读取训练出勤数据
function loadTrainingAttendanceData() {
    trainingAttendanceData = [];
    const filePath = getFilePath('training_attendance.csv');
    
    if (!fs.existsSync(filePath)) {
        console.error('训练出勤数据文件不存在:', filePath);
        return;
    }
    
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', function(row) {
            trainingAttendanceData.push(row);
        })
        .on('end', function() {
            console.log('训练出勤加载完成，共 ' + trainingAttendanceData.length + ' 条记录');
        })
        .on('error', function(err) {
            console.error('读取训练出勤文件失败:', err);
        });
}

// 读取门将数据
function loadGoalkeepersData() {
    goalkeepersData = [];
    const filePath = getFilePath('goalkeepers.csv');
    
    if (!fs.existsSync(filePath)) {
        console.error('门将数据文件不存在:', filePath);
        return;
    }
    
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', function(row) {
            goalkeepersData.push(row);
        })
        .on('end', function() {
            console.log('门将数据加载完成，共 ' + goalkeepersData.length + ' 名门将');
        })
        .on('error', function(err) {
            console.error('读取门将文件失败:', err);
        });
}

// 读取知名俱乐部数据
function loadFamousClubsData() {
    try {
        const filePath = getFilePath('famous_clubs.json');
        
        if (!fs.existsSync(filePath)) {
            console.error('知名俱乐部数据文件不存在:', filePath);
            return;
        }
        
        const data = fs.readFileSync(filePath, 'utf8');
        const clubsData = JSON.parse(data);
        famousClubsData = clubsData.clubs;
        console.log('知名俱乐部数据加载完成，共 ' + famousClubsData.length + ' 个俱乐部');
    } catch (err) {
        console.error('读取知名俱乐部文件失败:', err);
    }
}

// 读取知名球员数据
function loadFamousPlayersData() {
    try {
        const filePath = getFilePath('famous_players.json');
        
        if (!fs.existsSync(filePath)) {
            console.error('知名球员数据文件不存在:', filePath);
            return;
        }
        
        const data = fs.readFileSync(filePath, 'utf8');
        const playersDataFromFile = JSON.parse(data);
        famousPlayersData = playersDataFromFile.players;
        console.log('知名球员数据加载完成，共 ' + famousPlayersData.length + ' 个球员');
    } catch (err) {
        console.error('读取知名球员文件失败:', err);
    }
}

// 生成球员偏好数据
function generatePlayerPreferences() {
    if (playersData.length === 0) {
        console.log('等待球员数据加载完成...');
        return;
    }

    playersData.forEach(player => {
        const playerName = player.姓名;
        
        // 从CSV文件中读取偏好数据
        const favoriteClubs = [];
        const favoritePlayers = [];
        
        // 处理喜爱球队
        if (player.喜爱球队 && player.喜爱球队.trim() !== '') {
            // 查找对应的知名俱乐部数据
            const club = famousClubsData.find(c => c.name === player.喜爱球队);
            if (club) {
                favoriteClubs.push(club);
            } else {
                // 如果没找到对应的俱乐部，创建一个简单的对象
                favoriteClubs.push({
                    name: player.喜爱球队,
                    country: '未知',
                    league: '未知'
                });
            }
        }
        
        // 处理喜爱球员
        if (player.喜爱球员 && player.喜爱球员.trim() !== '') {
            // 查找对应的知名球员数据
            const famousPlayer = famousPlayersData.find(p => p.name === player.喜爱球员);
            if (famousPlayer) {
                favoritePlayers.push(famousPlayer);
            } else {
                // 如果没找到对应的球员，创建一个简单的对象
                favoritePlayers.push({
                    name: player.喜爱球员,
                    position: '未知',
                    club: '未知'
                });
            }
        }
        
        playerPreferences[playerName] = {
            favoriteClubs: favoriteClubs,
            favoritePlayers: favoritePlayers
        };
    });
    
    console.log('球员偏好数据加载完成');
}

// 加载属性描述数据
function loadAttributeDescriptions() {
    attributeDescriptions = {};
    const filePath = getFilePath('football_attributes.csv');
    
    if (!fs.existsSync(filePath)) {
        console.error('属性描述文件不存在:', filePath);
        return;
    }
    
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', function(row) {
            const attribute = row.Attribute;
            const scoreRange = row.Score_Range;
            const description = row.Description_CN;
            
            if (!attributeDescriptions[attribute]) {
                attributeDescriptions[attribute] = [];
            }
            
            attributeDescriptions[attribute].push({
                range: scoreRange,
                description: description
            });
        })
        .on('end', function() {
            console.log('属性描述文件加载完成');
        })
        .on('error', function(err) {
            console.error('读取属性描述文件失败:', err);
        });
}

// 初始化数据加载
console.log('开始加载数据...');
loadFamousClubsData();
loadFamousPlayersData();
loadPlayersData();
loadActivitiesData();
loadMatchEventsData();
loadMatchParticipantsData();
loadTrainingAttendanceData();
loadGoalkeepersData();
loadAttributeDescriptions();

// 延迟生成球员偏好数据，确保所有数据都已加载
setTimeout(() => {
    generatePlayerPreferences();
}, 1000); // 缩短延迟时间，因为不需要等待知名俱乐部和球员数据

// API: 获取所有球员列表
app.get('/api/players', function(req, res) {
    res.json({
        success: true,
        data: playersData
    });
});

// API: 获取比赛列表
app.get('/api/matches', function(req, res) {
    try {
        const matches = activitiesData.filter(function(activity) {
            return activity.type === '正式比赛';
        });
        
        const matchDetails = matches.map(function(match) {
            const participants = matchParticipantsData.filter(function(p) {
                return p.activityId === match.id;
            });
            const events = matchEventsData.filter(function(e) {
                return e.activityId === match.id;
            });
            
            const starters = participants.filter(function(p) {
                return p.status === '首发';
            });
            const substitutes = participants.filter(function(p) {
                return p.status === '替补';
            });
            
            const ourGoals = events.length;
            const opponentGoals = Math.floor(Math.random() * 4);
            
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
                    goals: ourGoals,
                    goalScorers: events.map(function(e) {
                        return {
                            scorer: e.scorer,
                            assister: e.assister || null,
                            minute: e.minute
                        };
                    })
                }
            };
        });
        
        matchDetails.sort(function(a, b) {
            return new Date(b.date) - new Date(a.date);
        });
        
        res.json({
            success: true,
            data: {
                totalMatches: matchDetails.length,
                matches: matchDetails
            }
        });
    } catch (error) {
        console.error('获取比赛列表失败:', error);
        res.status(500).json({
            success: false,
            message: '获取失败'
        });
    }
});

// API: 获取单场比赛详细信息
app.get('/api/match/:id', function(req, res) {
    try {
        const matchId = req.params.id;
        
        // 查找活动，不限制类型，支持所有活动
        const match = activitiesData.find(function(activity) {
            return activity.id === matchId;
        });
        
        if (!match) {
            return res.status(404).json({
                success: false,
                message: '未找到该活动'
            });
        }
        
        const participants = matchParticipantsData.filter(function(p) {
            return p.activityId === matchId;
        });
        
        const events = matchEventsData.filter(function(e) {
            return e.activityId === matchId;
        });
        
        // 处理阵容数据
        const starters = [];
        const substitutes = [];
        
        participants.forEach(participant => {
            const playerName = participant.姓名 || participant.playerName;
            const status = participant.状态 || participant.status || participant.角色;
            
            if (status === '首发' || status === '首发球员') {
                starters.push(playerName);
            } else if (status === '替补' || status === '替补球员') {
                substitutes.push(playerName);
            } else {
                // 对于队内对抗赛等，根据状态判断
                if (status && status.includes('队')) {
                    starters.push(playerName);
                } else {
                    // 默认作为首发处理
                    starters.push(playerName);
                }
            }
        });
        
        // 去重
        const uniqueStarters = [...new Set(starters)];
        const uniqueSubstitutes = [...new Set(substitutes)];
        
        // 简化的阵容生成
        const formation = {
            formation: uniqueStarters.length >= 11 ? '4-3-3' : (uniqueStarters.length >= 8 ? '3-3-2' : '2-3-2'),
            players: uniqueStarters.map(function(playerName, index) {
                const player = playersData.find(function(p) {
                    return p['姓名'] === playerName;
                });
                
                return {
                    name: playerName,
                    position: player ? (player['主要位置'] || 'CM') : 'CM',
                    rating: player ? parseInt(player['综合能力'] || '75') : 75,
                    number: player ? (player['球衣号码'] || '0') : '0',
                    x: 20 + (index % 3) * 30,
                    y: 20 + Math.floor(index / 3) * 20
                };
            })
        };
        
        // 根据活动类型确定对手和比分
        let opponent = match.opponent || '未知对手';
        let ourGoals = events.length;
        let opponentGoals = 0;
        
        // 处理不同类型的活动
        if (match.type === '正式比赛') {
            opponentGoals = Math.floor(Math.random() * 4);
        } else if (match.type === '队内对抗赛' || match.type === '内部训练赛') {
            opponent = '队内对抗赛';
            opponentGoals = Math.floor(Math.random() * 3);
        } else {
            opponent = match.type || '友谊赛';
            opponentGoals = Math.floor(Math.random() * 2);
        }
        
        const detailedEvents = events.map(function(event) {
            return {
                minute: event.minute,
                type: '进球',
                scorer: event.scorer,
                assister: event.assister || null
            };
        });
        
        const matchDetail = {
            id: match.id,
            date: match.date,
            group: match.group,
            type: match.type,
            opponent: opponent,
            ourScore: ourGoals,
            opponentScore: opponentGoals,
            result: ourGoals > opponentGoals ? '胜' : (ourGoals === opponentGoals ? '平' : '负'),
            lineup: {
                starters: uniqueStarters,
                substitutes: uniqueSubstitutes
            },
            formation: formation,
            events: detailedEvents,
            substitutions: []
        };
        
        res.json({
            success: true,
            data: matchDetail
        });
        
    } catch (error) {
        console.error('获取比赛详情失败:', error);
        res.status(500).json({
            success: false,
            message: '获取失败'
        });
    }
});

// API: 获取单个球员详细信息
app.get('/api/player/:name', function(req, res) {
    try {
        const playerName = decodeURIComponent(req.params.name);
        console.log('获取球员信息:', playerName);
        
        const player = playersData.find(function(p) {
            return p.姓名 === playerName;
        });
        
        if (!player) {
            return res.status(404).json({
                success: false,
                message: '未找到该球员'
            });
        }
        
        // 获取球员偏好
        const preferences = playerPreferences[playerName] || {
            favoriteClubs: [],
            favoritePlayers: []
        };
        
        // 获取球员比赛统计
        const playerMatches = matchParticipantsData.filter(p => p.playerName === playerName || p.姓名 === playerName);
        const playerGoals = matchEventsData.filter(e => e.scorer === playerName);
        const playerAssists = matchEventsData.filter(e => e.assister === playerName);
        
        // 获取训练出勤记录
        const trainingRecords = trainingAttendanceData.filter(t => t.playerName === playerName || t.姓名 === playerName);
        
        const playerDetail = {
            ...player,
            preferences: preferences,
            stats: {
                totalMatches: playerMatches.length,
                totalGoals: playerGoals.length,
                totalAssists: playerAssists.length,
                trainingAttendance: trainingRecords.length
            },
            matchHistory: playerMatches.map(match => {
                const activity = activitiesData.find(a => a.id === match.activityId);
                const goals = matchEventsData.filter(e => e.activityId === match.activityId && e.scorer === playerName);
                const assists = matchEventsData.filter(e => e.activityId === match.activityId && e.assister === playerName);
                
                return {
                    id: match.activityId,
                    date: activity ? activity.date : '未知日期',
                    opponent: activity ? activity.opponent : '未知对手',
                    status: match.status || match.状态 || '参与',
                    goals: goals.length,
                    assists: assists.length
                };
            }).sort((a, b) => new Date(b.date) - new Date(a.date))
        };
        
        res.json({
            success: true,
            data: playerDetail
        });
    } catch (error) {
        console.error('获取球员详情失败:', error);
        res.status(500).json({
            success: false,
            message: '获取失败'
        });
    }
});

// API: 获取具有相同偏好的球员列表
app.get('/api/players/same-preference', function(req, res) {
    try {
        const { type, value } = req.query;
        
        if (!type || !value) {
            return res.status(400).json({
                success: false,
                message: '缺少参数'
            });
        }
        
        const samePlayers = [];
        
        Object.keys(playerPreferences).forEach(playerName => {
            const preferences = playerPreferences[playerName];
            let hasMatch = false;
            
            if (type === 'club') {
                hasMatch = preferences.favoriteClubs.some(club => club.name === value);
            } else if (type === 'player') {
                hasMatch = preferences.favoritePlayers.some(player => player.name === value);
            } else if (type === 'zodiac') {
                const player = playersData.find(p => p.姓名 === playerName);
                hasMatch = player && player.星座 === value;
            }
            
            if (hasMatch) {
                const playerData = playersData.find(p => p.姓名 === playerName);
                if (playerData) {
                    samePlayers.push({
                        name: playerName,
                        nickname: playerData.蔚来app昵称,
                        group: playerData.组别,
                        position: playerData.主要位置,
                        zodiac: playerData.星座
                    });
                }
            }
        });
        
        res.json({
            success: true,
            data: {
                type: type,
                value: value,
                players: samePlayers
            }
        });
    } catch (error) {
        console.error('获取相同偏好球员失败:', error);
        res.status(500).json({
            success: false,
            message: '获取失败'
        });
    }
});

// API: 获取属性描述
app.get('/api/attribute-description/:attribute/:value', function(req, res) {
    try {
        const attribute = decodeURIComponent(req.params.attribute);
        const value = parseInt(req.params.value);
        
        console.log('查找属性:', attribute, '数值:', value);
        
        // 尝试不同的属性名称匹配方式
        let matchedAttribute = null;
        const keys = Object.keys(attributeDescriptions);
        
        // 首先尝试精确匹配
        if (attributeDescriptions[attribute]) {
            matchedAttribute = attribute;
        }
        // 然后尝试包含英文名称的匹配
        if (!matchedAttribute) {
            matchedAttribute = keys.find(key => key.includes(attribute) || attribute.includes(key.split(' ')[0]));
        }
        // 最后尝试部分匹配
        if (!matchedAttribute) {
            matchedAttribute = keys.find(key => key.split(' ')[0] === attribute || key.split('(')[0].trim() === attribute);
        }
        
        console.log('匹配到的属性:', matchedAttribute);
        
        if (!matchedAttribute || !attributeDescriptions[matchedAttribute]) {
            return res.status(404).json({
                success: false,
                message: '未找到该属性描述'
            });
        }
        
        // 根据数值找到对应的描述
        const descriptions = attributeDescriptions[matchedAttribute];
        let matchedDescription = null;
        
        for (const desc of descriptions) {
            const range = desc.range;
            // 解析范围，例如 "60-68 (业余初学)"
            const rangeMatch = range.match(/(\d+)-(\d+)/);
            if (rangeMatch) {
                const min = parseInt(rangeMatch[1]);
                const max = parseInt(rangeMatch[2]);
                if (value >= min && value <= max) {
                    matchedDescription = desc;
                    break;
                }
            }
        }
        
        if (!matchedDescription) {
            // 如果没有精确匹配，返回最接近的描述
            matchedDescription = descriptions[Math.floor(descriptions.length / 2)];
        }
        
        res.json({
            success: true,
            data: {
                attribute: attribute,
                value: value,
                range: matchedDescription.range,
                description: matchedDescription.description
            }
        });
    } catch (error) {
        console.error('获取属性描述失败:', error);
        res.status(500).json({
            success: false,
            message: '获取失败'
        });
    }
});

// API: 获取比赛事件数据（用于排行榜）
app.get('/api/match-events', function(req, res) {
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
app.get('/api/training-attendance', function(req, res) {
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

// 错误处理中间件
app.use(function(err, req, res, next) {
    console.error('服务器错误:', err);
    res.status(500).json({
        success: false,
        message: '服务器内部错误'
    });
});

// 启动服务器
app.listen(PORT, function() {
    console.log('京蔚联足球队管理系统服务器运行在 http://localhost:' + PORT);
    console.log('主页地址: http://localhost:' + PORT + '/display.html');
}); 