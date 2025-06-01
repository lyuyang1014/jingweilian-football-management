// 测试阵型生成功能
const fs = require('fs');
const csv = require('csv-parser');

// 模拟球员数据
const testPlayers = [
    {name: '刘学', primaryPos: 'GK', isGoalkeeper: true, rating: 86},
    {name: '庞博', primaryPos: 'GK', isGoalkeeper: true, rating: 79},
    {name: '李长彬', primaryPos: 'CB', isGoalkeeper: false, rating: 80},
    {name: '独威', primaryPos: 'CB', isGoalkeeper: false, rating: 75},
    {name: '杨世晋', primaryPos: 'LB', isGoalkeeper: false, rating: 89},
    {name: '王俊祥', primaryPos: 'RB', isGoalkeeper: false, rating: 76},
    {name: '陆超', primaryPos: 'CDM', isGoalkeeper: false, rating: 85},
    {name: '张驰', primaryPos: 'CM', isGoalkeeper: false, rating: 89},
    {name: '陈旭', primaryPos: 'CM', isGoalkeeper: false, rating: 96},
    {name: '吕洋', primaryPos: 'LW', isGoalkeeper: false, rating: 88},
    {name: '李昊', primaryPos: 'RW', isGoalkeeper: false, rating: 86},
    {name: '杨林', primaryPos: 'ST', isGoalkeeper: false, rating: 93},
    {name: '周慜', primaryPos: 'RW', isGoalkeeper: false, rating: 88},
    {name: '张词', primaryPos: 'ST', isGoalkeeper: false, rating: 80},
    {name: '王岩琦', primaryPos: 'RW', isGoalkeeper: false, rating: 88}
];

// 阵型生成函数（从server.js复制）
function generateFormation(starterDetails) {
    const numPlayers = starterDetails.length;
    
    // 根据人数确定阵型
    function getFormationByPlayerCount(count) {
        switch(count) {
            case 7:
                return {
                    name: '2-2-1',
                    positions: [
                        {pos: 'GK', x: 50, y: 92, priority: ['GK']},
                        {pos: 'LB', x: 30, y: 75, priority: ['LB', 'CB', 'LM']},
                        {pos: 'RB', x: 70, y: 75, priority: ['RB', 'CB', 'RM']},
                        {pos: 'LM', x: 30, y: 50, priority: ['LM', 'CM', 'LW']},
                        {pos: 'RM', x: 70, y: 50, priority: ['RM', 'CM', 'RW']},
                        {pos: 'CM', x: 50, y: 40, priority: ['CM', 'CAM', 'CDM']},
                        {pos: 'ST', x: 50, y: 15, priority: ['ST', 'CAM']}
                    ]
                };
            case 8:
                return {
                    name: '2-3-1',
                    positions: [
                        {pos: 'GK', x: 50, y: 92, priority: ['GK']},
                        {pos: 'LB', x: 25, y: 75, priority: ['LB', 'CB', 'LM']},
                        {pos: 'RB', x: 75, y: 75, priority: ['RB', 'CB', 'RM']},
                        {pos: 'LM', x: 20, y: 50, priority: ['LM', 'CM', 'LW']},
                        {pos: 'CM', x: 50, y: 50, priority: ['CM', 'CDM', 'CAM']},
                        {pos: 'RM', x: 80, y: 50, priority: ['RM', 'CM', 'RW']},
                        {pos: 'CAM', x: 50, y: 30, priority: ['CAM', 'CM', 'ST']},
                        {pos: 'ST', x: 50, y: 15, priority: ['ST', 'CAM']}
                    ]
                };
            case 9:
                return {
                    name: '3-3-1',
                    positions: [
                        {pos: 'GK', x: 50, y: 92, priority: ['GK']},
                        {pos: 'LB', x: 20, y: 75, priority: ['LB', 'CB', 'LM']},
                        {pos: 'CB', x: 50, y: 75, priority: ['CB', 'CDM']},
                        {pos: 'RB', x: 80, y: 75, priority: ['RB', 'CB', 'RM']},
                        {pos: 'LM', x: 25, y: 50, priority: ['LM', 'CM', 'LW']},
                        {pos: 'CM', x: 50, y: 50, priority: ['CM', 'CDM', 'CAM']},
                        {pos: 'RM', x: 75, y: 50, priority: ['RM', 'CM', 'RW']},
                        {pos: 'CAM', x: 50, y: 30, priority: ['CAM', 'CM', 'ST']},
                        {pos: 'ST', x: 50, y: 15, priority: ['ST', 'CAM']}
                    ]
                };
            default:
                return {
                    name: '4-3-2-1',
                    positions: [
                        {pos: 'GK', x: 50, y: 92, priority: ['GK']},
                        {pos: 'LB', x: 15, y: 75, priority: ['LB', 'LM', 'LW']},
                        {pos: 'CB', x: 35, y: 75, priority: ['CB', 'CDM']},
                        {pos: 'CB', x: 65, y: 75, priority: ['CB', 'CDM']},
                        {pos: 'RB', x: 85, y: 75, priority: ['RB', 'RM', 'RW']},
                        {pos: 'LM', x: 25, y: 50, priority: ['LM', 'CM', 'LW']},
                        {pos: 'CM', x: 50, y: 50, priority: ['CM', 'CDM', 'CAM']},
                        {pos: 'RM', x: 75, y: 50, priority: ['RM', 'CM', 'RW']},
                        {pos: 'LF', x: 40, y: 25, priority: ['LW', 'ST', 'CAM']},
                        {pos: 'RF', x: 60, y: 25, priority: ['RW', 'ST', 'CAM']},
                        {pos: 'ST', x: 50, y: 8, priority: ['ST', 'CAM']}
                    ]
                };
        }
    }
    
    const formation = getFormationByPlayerCount(numPlayers);
    const assignedPlayers = [];
    const availablePlayers = [...starterDetails];
    
    // 首先确保有门将
    const goalkeepers = availablePlayers.filter(p => p.isGoalkeeper);
    let goalkeeper = null;
    
    if (goalkeepers.length > 0) {
        goalkeeper = goalkeepers.reduce((best, current) => 
            current.rating > best.rating ? current : best
        );
    } else {
        const defensivePlayers = availablePlayers.filter(p => 
            ['CB', 'CDM', 'LB', 'RB'].includes(p.primaryPos)
        );
        if (defensivePlayers.length > 0) {
            goalkeeper = defensivePlayers[Math.floor(Math.random() * defensivePlayers.length)];
            goalkeeper.isGoalkeeper = true;
            goalkeeper.formationPos = 'GK';
        } else {
            goalkeeper = availablePlayers[0];
            goalkeeper.isGoalkeeper = true;
            goalkeeper.formationPos = 'GK';
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
            
            if (position.priority.includes(player.primaryPos)) {
                score += 100;
            }
            
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
            
            score += player.rating / 10;
            
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
    
    return {
        formation: formation.name,
        players: assignedPlayers
    };
}

// 测试不同人数的阵型
console.log('=== 阵型生成测试 ===\n');

for (let playerCount = 7; playerCount <= 11; playerCount++) {
    const selectedPlayers = testPlayers.slice(0, playerCount);
    const result = generateFormation(selectedPlayers);
    
    console.log(`${playerCount}人制阵型: ${result.formation}`);
    console.log('首发阵容:');
    result.players.forEach((player, index) => {
        const gkMark = player.isGoalkeeper ? ' (门将)' : '';
        console.log(`  ${index + 1}. ${player.name} - ${player.formationPos}${gkMark} (${player.primaryPos})`);
    });
    console.log('');
}

console.log('测试完成！'); 