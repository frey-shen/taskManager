// src/TaskManager.js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// 获取当前文件目录（ES模块中需要）
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 任务管理器类
 * 类似Android的Repository模式
 */
class TaskManager {
  constructor() {
    // 任务存储在内存中（类似ArrayList）
    this.tasks = [];
    // 下一个任务ID
    this.nextId = 1;
    // 数据文件路径
    this.dataPath = path.join(__dirname, "..", "data");
    this.filePath = path.join(this.dataPath, "tasks.json");

    // 初始化时加载数据
    this.initialize();
  }

  /**
   * 初始化 - 创建数据目录并加载现有任务
   */
  async initialize() {
    try {
      // 确保数据目录存在
      await fs.mkdir(this.dataPath, { recursive: true });

      // 尝试加载现有数据
      await this.loadFromFile();
      console.log(
        `✅ 任务管理器初始化成功，已加载 ${this.tasks.length} 个任务`
      );
    } catch (error) {
      console.log("⚠️ 首次运行，创建新的任务存储");
    }
  }

  /**
   * 添加新任务
   * @param {Object} taskData - 任务数据
   * @returns {Object} 创建的任务
   */
  async addTask(taskData) {
    // 参数验证（类似Java的参数校验）
    if (!taskData.title) {
      throw new Error("任务标题不能为空");
    }

    const task = {
      id: this.nextId++,
      title: taskData.title,
      description: taskData.description || "",
      status: "pending", // pending, in-progress, completed
      priority: taskData.priority || "medium", // low, medium, high
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: taskData.tags || [],
      dueDate: taskData.dueDate || null,
    };

    this.tasks.push(task);
    await this.saveToFile();

    console.log(`📝 新任务已创建: ${task.title} (ID: ${task.id})`);
    return task;
  }

  /**
   * 根据ID获取任务
   * @param {number} id - 任务ID
   * @returns {Object|null} 任务对象或null
   */
  getTaskById(id) {
    // 使用find方法（类似Java Stream的findFirst）
    return this.tasks.find((task) => task.id === id) || null;
  }

  /**
   * 获取所有任务
   * @param {Object} filters - 过滤条件
   * @returns {Array} 任务数组
   */
  getTasks(filters = {}) {
    let result = [...this.tasks]; // 创建副本，避免修改原数组

    // 按状态过滤
    if (filters.status) {
      result = result.filter((task) => task.status === filters.status);
    }

    // 按优先级过滤
    if (filters.priority) {
      result = result.filter((task) => task.priority === filters.priority);
    }

    // 按标签过滤
    if (filters.tag) {
      result = result.filter((task) => task.tags.includes(filters.tag));
    }

    // 排序
    if (filters.sortBy) {
      result.sort((a, b) => {
        switch (filters.sortBy) {
          case "createdAt":
            return new Date(b.createdAt) - new Date(a.createdAt);
          case "priority":
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          case "dueDate":
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
          default:
            return 0;
        }
      });
    }

    return result;
  }

  /**
   * 更新任务
   * @param {number} id - 任务ID
   * @param {Object} updates - 更新内容
   * @returns {Object|null} 更新后的任务
   */
  async updateTask(id, updates) {
    const taskIndex = this.tasks.findIndex((task) => task.id === id);

    if (taskIndex === -1) {
      throw new Error(`任务 ID ${id} 不存在`);
    }

    // 使用展开运算符合并更新（类似Kotlin的copy）
    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      ...updates,
      id: this.tasks[taskIndex].id, // ID不能被修改
      createdAt: this.tasks[taskIndex].createdAt, // 创建时间不能被修改
      updatedAt: new Date().toISOString(),
    };

    await this.saveToFile();
    console.log(`✏️ 任务已更新: ${this.tasks[taskIndex].title}`);
    return this.tasks[taskIndex];
  }

  /**
   * 删除任务
   * @param {number} id - 任务ID
   * @returns {boolean} 是否删除成功
   */
  async deleteTask(id) {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter((task) => task.id !== id);

    if (this.tasks.length < initialLength) {
      await this.saveToFile();
      console.log(`🗑️ 任务 ID ${id} 已删除`);
      return true;
    }

    return false;
  }

  /**
   * 获取任务统计
   * @returns {Object} 统计信息
   */
  getStatistics() {
    const stats = {
      total: this.tasks.length,
      byStatus: {
        pending: 0,
        "in-progress": 0,
        completed: 0,
      },
      byPriority: {
        high: 0,
        medium: 0,
        low: 0,
      },
      completionRate: 0,
      overdue: 0,
    };

    const now = new Date();

    // 使用reduce进行统计（类似Java Stream的collect）
    this.tasks.forEach((task) => {
      stats.byStatus[task.status]++;
      stats.byPriority[task.priority]++;

      // 检查过期任务
      if (
        task.dueDate &&
        new Date(task.dueDate) < now &&
        task.status !== "completed"
      ) {
        stats.overdue++;
      }
    });

    // 计算完成率
    if (stats.total > 0) {
      stats.completionRate =
        ((stats.byStatus.completed / stats.total) * 100).toFixed(2) + "%";
    }

    return stats;
  }

  /**
   * 批量操作 - 标记多个任务为完成
   * @param {Array<number>} ids - 任务ID数组
   */
  async markAsCompleted(ids) {
    const updates = [];

    for (const id of ids) {
      const task = this.getTaskById(id);
      if (task && task.status !== "completed") {
        task.status = "completed";
        task.updatedAt = new Date().toISOString();
        updates.push(task);
      }
    }

    if (updates.length > 0) {
      await this.saveToFile();
      console.log(`✅ ${updates.length} 个任务已标记为完成`);
    }

    return updates;
  }

  /**
   * 搜索任务
   * @param {string} keyword - 搜索关键词
   * @returns {Array} 匹配的任务
   */
  searchTasks(keyword) {
    const lowerKeyword = keyword.toLowerCase();

    return this.tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(lowerKeyword) ||
        task.description.toLowerCase().includes(lowerKeyword) ||
        task.tags.some((tag) => tag.toLowerCase().includes(lowerKeyword))
    );
  }

  /**
   * 保存到文件（持久化）
   */
  async saveToFile() {
    try {
      const data = {
        tasks: this.tasks,
        nextId: this.nextId,
        lastSaved: new Date().toISOString(),
      };

      await fs.writeFile(
        this.filePath,
        JSON.stringify(data, null, 2), // 格式化JSON，便于阅读
        "utf8"
      );

      console.log("💾 数据已保存到文件");
    } catch (error) {
      console.error("❌ 保存失败:", error.message);
      throw error;
    }
  }

  /**
   * 从文件加载
   */
  async loadFromFile() {
    try {
      const fileContent = await fs.readFile(this.filePath, "utf8");
      const data = JSON.parse(fileContent);

      this.tasks = data.tasks || [];
      this.nextId = data.nextId || 1;

      console.log(`📂 从文件加载了 ${this.tasks.length} 个任务`);
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log("📄 数据文件不存在，将创建新文件");
      } else {
        console.error("❌ 加载失败:", error.message);
        throw error;
      }
    }
  }

  /**
   * 清空所有任务
   */
  async clearAll() {
    const count = this.tasks.length;
    this.tasks = [];
    this.nextId = 1;
    await this.saveToFile();
    console.log(`🗑️ 已清空 ${count} 个任务`);
  }
}

export default TaskManager;
