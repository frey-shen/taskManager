// src/cli.js
import readline from 'readline';
import TaskManager from './TaskManager.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const manager = new TaskManager();

// 等待初始化
await new Promise(resolve => setTimeout(resolve, 100));

function question(prompt) {
    return new Promise(resolve => {
        rl.question(prompt, resolve);
    });
}

function showMenu() {
    console.log('\n========== 任务管理器 ==========');
    console.log('1. 添加任务');
    console.log('2. 查看所有任务');
    console.log('3. 更新任务状态');
    console.log('4. 删除任务');
    console.log('5. 搜索任务');
    console.log('6. 查看统计');
    console.log('0. 退出');
    console.log('================================');
}

async function handleChoice() {
    showMenu();
    const choice = await question('\n请选择操作: ');

    switch (choice) {
        case '1':
            const title = await question('任务标题: ');
            const desc = await question('任务描述: ');
            const priority = await question('优先级 (low/medium/high): ');

            await manager.addTask({ title, description: desc, priority });
            break;

        case '2':
            const tasks = manager.getTasks();
            if (tasks.length === 0) {
                console.log('暂无任务');
            } else {
                tasks.forEach(task => {
                    console.log(`[${task.id}] ${task.title} - ${task.status} - ${task.priority}`);
                });
            }
            break;

        case '3':
            const updateId = parseInt(await question('输入任务ID: '));
            const newStatus = await question('新状态 (pending/in-progress/completed): ');
            await manager.updateTask(updateId, { status: newStatus });
            break;

        case '4':
            const deleteId = parseInt(await question('输入要删除的任务ID: '));
            await manager.deleteTask(deleteId);
            break;

        case '5':
            const keyword = await question('搜索关键词: ');
            const results = manager.searchTasks(keyword);
            results.forEach(task => {
                console.log(`[${task.id}] ${task.title}`);
            });
            break;

        case '6':
            const stats = manager.getStatistics();
            console.log('\n📊 统计信息:');
            console.log(`总任务: ${stats.total}`);
            console.log(`待处理: ${stats.byStatus.pending}`);
            console.log(`进行中: ${stats.byStatus['in-progress']}`);
            console.log(`已完成: ${stats.byStatus.completed}`);
            console.log(`完成率: ${stats.completionRate}`);
            break;

        case '0':
            console.log('👋 再见！');
            rl.close();
            process.exit(0);

        default:
            console.log('无效选择');
    }

    // 继续显示菜单
    await handleChoice();
}

// 启动
console.log('🚀 任务管理器CLI启动');
handleChoice().catch(console.error);
