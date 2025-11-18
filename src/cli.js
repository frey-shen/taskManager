import readline from 'readline';
import TaskManager from './TaskManager.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const manager = new TaskManager();

function showMenu() {
    console.log('\n========== 任务管理器菜单 ==========');
    console.log('1. 添加任务');
    console.log('2. 查看所有任务');
    console.log('3. 更新任务状态');
    console.log('4. 删除任务');
    console.log('5. 查看统计');
    console.log('0. 退出');
    console.log('=====================================');

    rl.question('\n请选择操作: ', handleChoice);
}

async function handleChoice(choice) {
    switch (choice) {
        case '1':
            await addTaskPrompt();
            break;
        case '2':
            showAllTasks();
            break;
        // ... 其他选项
        case '0':
            console.log('再见！');
            rl.close();
            return;
    }

    showMenu(); // 显示菜单继续
}

// 启动CLI
showMenu();