// src/index.js
import TaskManager from "./TaskManager.js";

/**
 * 主函数 - 演示TaskManager的使用
 * 类似Android的MainActivity
 */
async function main() {
    console.log("========================================");
    console.log("       欢迎使用任务管理器 v1.0         ");
    console.log("========================================\n");

    // 创建任务管理器实例
    const manager = new TaskManager();

    // 等待初始化完成
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
        // 1. 添加一些测试任务
        console.log("\n📌 添加新任务...");

        const task1 = await manager.addTask({
            title: "学习JavaScript基础",
            description: "完成变量、函数、异步编程的学习",
            priority: "high",
            tags: ["学习", "JavaScript"],
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 一周后
        });

        const task2 = await manager.addTask({
            title: "练习Node.js文件操作",
            description: "实现文件读写功能",
            priority: "medium",
            tags: ["练习", "Node.js"],
        });

        const task3 = await manager.addTask({
            title: "完成任务管理器项目",
            description: "实现所有基础功能",
            priority: "high",
            tags: ["项目", "JavaScript"],
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 三天后
        });

        // 2. 查询任务
        console.log("\n🔍 查询所有任务...");
        const allTasks = manager.getTasks();
        console.log(`共有 ${allTasks.length} 个任务`);

        // 3. 按优先级过滤
        console.log("\n🔍 查询高优先级任务...");
        const highPriorityTasks = manager.getTasks({ priority: "high" });
        highPriorityTasks.forEach((task) => {
            console.log(`  - ${task.title} (截止: ${task.dueDate || "无"})`);
        });

        // 4. 更新任务状态
        console.log("\n✏️ 更新任务状态...");
        await manager.updateTask(task1.id, {
            status: "in-progress",
            description: "正在学习ES6新特性...",
        });

        // 5. 搜索任务
        console.log('\n🔍 搜索包含"JavaScript"的任务...');
        const searchResults = manager.searchTasks("JavaScript");
        searchResults.forEach((task) => {
            console.log(`  - ${task.title} [${task.status}]`);
        });

        // 6. 获取统计信息
        console.log("\n📊 任务统计信息:");
        const stats = manager.getStatistics();
        console.log("  总任务数:", stats.total);
        console.log("  待处理:", stats.byStatus.pending);
        console.log("  进行中:", stats.byStatus["in-progress"]);
        console.log("  已完成:", stats.byStatus.completed);
        console.log("  完成率:", stats.completionRate);

        // 7. 批量标记完成
        console.log("\n✅ 批量标记任务完成...");
        await manager.markAsCompleted([task2.id]);

        // 8. 显示最终状态
        console.log("\n📋 最终任务列表:");
        manager.getTasks({ sortBy: "priority" }).forEach((task) => {
            const statusIcon = {
                pending: "⏳",
                "in-progress": "🔄",
                completed: "✅",
            }[task.status];

            console.log(
                `${statusIcon} [${task.priority.toUpperCase()}] ${task.title}`
            );
            if (task.tags.length > 0) {
                console.log(`   标签: ${task.tags.join(", ")}`);
            }
        });
    } catch (error) {
        console.error("\n❌ 发生错误:", error.message);
    }

    // 交互式命令行界面（可选）
    console.log("\n========================================");
    console.log("         任务管理器演示完成！           ");
    console.log("========================================");
}

// 运行主函数
main().catch(console.error);
