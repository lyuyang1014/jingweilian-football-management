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

// 文件路径检查函数
function getFilePath(filename) {
    const currentDir = process.cwd();
    const filePath = path.join(currentDir, filename);
    
    if (fs.existsSync(filePath)) {
        return filePath;
    }
    
    // 尝试相对路径
    if (fs.existsSync(filename)) {
        return filename;
    }
    
    console.log(`文件未找到: ${filename}, 当前目录: ${currentDir}`);
    console.log('目录文件列表:', fs.readdirSync(currentDir).filter(f => f.includes('.')). slice(0, 10));
    
    throw new Error(`文件不存在: ${filename}`);
}

// 简化的数据验证函数
function validateMatchData(participants, events) {
    const starters = [];
    const substitutes = [];
    
    // 处理参与者数据
    if (participants && Array.isArray(participants)) {
        participants.forEach(function(participant) {
            const playerName = participant['姓名'] || participant.playerName || participant.name;
            const status = participant['状态'] || participant.status || participant['角色'] || '首发';
            
            if (playerName) {
                if (status === '首发' || status === '首发球员') {
                    starters.push(playerName);
                } else if (status === '替补' || status === '替补球员') {
                    substitutes.push(playerName);
                } else {
                    starters.push(playerName);
                }
            }
        });
    }
    
    // 确保有足够的首发球员
    while (starters.length < 7 && substitutes.length > 0) {
        starters.push(substitutes.shift());
    }
    
    return {
        starters: starters,
        substitutes: substitutes,
        isValid: starters.length >= 7
    };
}

// 读取球员数据
function loadPlayersData() {
    playersData = [];
    try {
        const filePath = getFilePath('2025member.csv');
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
    } catch (error) {
        console.error('球员数据加载失败:', error);
    }
}

// 读取活动数据
function loadActivitiesData() {
    activitiesData = [];
    try {
        const filePath = getFilePath('activities.csv');
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
    } catch (error) {
        console.error('活动数据加载失败:', error);
    }
}

// 读取比赛事件数据
function loadMatchEventsData() {
    matchEventsData = [];
    try {
        const filePath = getFilePath('match_events.csv');
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
    } catch (error) {
        console.error('比赛事件加载失败:', error);
    }
}

// 读取比赛参与者数据
function loadMatchParticipantsData() {
    matchParticipantsData = [];
    try {
        const filePath = getFilePath('match_participants.csv');
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
    } catch (error) {
        console.error('比赛参与者加载失败:', error);
    }
}

// 读取训练出勤数据
function loadTrainingAttendanceData() {
    trainingAttendanceData = [];
    try {
        const filePath = getFilePath('training_attendance.csv');
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
    } catch (error) {
        console.error('训练出勤加载失败:', error);
    }
}

// 读取门将数据
function loadGoalkeepersData() {
    goalkeepersData = [];
    try {
        const filePath = getFilePath('goalkeepers.csv');
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
    } catch (error) {
        console.error('门将数据加载失败:', error);
    }
}

// 读取知名俱乐部数据
function loadFamousClubsData() {
    try {
        const filePath = getFilePath('famous_clubs.json');
        const data = fs.readFileSync(filePath, 'utf8');
        const clubsData = JSON.parse(data);
        famousClubsData = clubsData.clubs || [];
        console.log('知名俱乐部数据加载完成，共 ' + famousClubsData.length + ' 个俱乐部');
    } catch (err) {
        console.error('读取知名俱乐部文件失败:', err);
        famousClubsData = [];
    }
}

// 读取知名球员数据
function loadFamousPlayersData() {
    try {
        const filePath = getFilePath('famous_players.json');
        const data = fs.readFileSync(filePath, 'utf8');
        const playersDataFromFile = JSON.parse(data);
        famousPlayersData = playersDataFromFile.players || [];
        console.log('知名球员数据加载完成，共 ' + famousPlayersData.length + ' 个球员');
    } catch (err) {
        console.error('读取知名球员文件失败:', err);
        famousPlayersData = [];
    }
}

// 初始化数据加载
console.log('开始加载数据...');
loadPlayersData();
loadActivitiesData();
loadMatchEventsData();
loadMatchParticipantsData();
loadTrainingAttendanceData();
loadGoalkeepersData();
loadFamousClubsData();
loadFamousPlayersData();

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
        
        const match = activitiesData.find(function(activity) {
            return activity.id === matchId && activity.type === '正式比赛';
        });
        
        if (!match) {
            return res.status(404).json({
                success: false,
                message: '未找到该比赛'
            });
        }
        
        const participants = matchParticipantsData.filter(function(p) {
            return p.activityId === matchId;
        });
        
        const events = matchEventsData.filter(function(e) {
            return e.activityId === matchId;
        });
        
        // 使用简化的验证函数
        const validationResult = validateMatchData(participants, events);
        const starters = validationResult.starters;
        const substitutes = validationResult.substitutes;
        
        // 简化的阵容生成
        const formation = {
            formation: starters.length >= 11 ? '4-3-3' : (starters.length >= 8 ? '3-3-2' : '2-3-2'),
            players: starters.map(function(playerName, index) {
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
        
        const ourGoals = events.length;
        const opponentGoals = Math.floor(Math.random() * 4);
        
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
            opponent: match.opponent || '未知对手',
            ourScore: ourGoals,
            opponentScore: opponentGoals,
            result: ourGoals > opponentGoals ? '胜' : (ourGoals === opponentGoals ? '平' : '负'),
            lineup: {
                starters: starters,
                substitutes: substitutes
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

// API: 获取球员信息
app.get('/api/player/:name', function(req, res) {
    try {
        const playerName = decodeURIComponent(req.params.name);
        
        const player = playersData.find(function(p) {
            return p['姓名'] === playerName;
        });
        
        if (!player) {
            return res.json({
                success: false,
                message: '未找到该球员'
            });
        }
        
        const playerMatches = matchParticipantsData.filter(function(record) {
            return record.playerName === playerName;
        });
        
        const playerGoals = matchEventsData.filter(function(event) {
            return event.scorer === playerName;
        });
        
        const playerAssists = matchEventsData.filter(function(event) {
            return event.assister === playerName;
        });
        
        const enhancedPlayer = {
            name: player['姓名'],
            position: player['主要位置'] || 'CM',
            rating: parseInt(player['综合能力'] || '75'),
            number: player['球衣号码'] || '0',
            totalMatches: playerMatches.length,
            totalGoals: playerGoals.length,
            totalAssists: playerAssists.length,
            group: player['组别'] || '未知'
        };
        
        res.json({
            success: true,
            data: enhancedPlayer
        });
        
    } catch (error) {
        console.error('获取球员信息失败:', error);
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
    console.log('简化服务器运行在 http://localhost:' + PORT);
    console.log('主页地址: http://localhost:' + PORT + '/display.html');
}); 