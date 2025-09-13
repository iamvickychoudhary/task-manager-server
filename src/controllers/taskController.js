import Task from '../models/Task.js';
import List from '../models/List.js';
import { emitToBoard } from '../sockets/socket.js';

// Create task 
export const createTask = async (req, res) => {
  try {
    const { boardId, listId, title, description, status } = req.body;
    if (!boardId || !listId || !title) return res.status(400).json({ message: 'Missing fields' });

    const task = await Task.create({ title, description: description || '', status: status || 'todo', board: boardId, list: listId });
    await List.findByIdAndUpdate(listId, { $push: { taskOrder: task._id } });

    emitToBoard(boardId, 'board:update', { type: 'task-created', data: task });
    res.status(201).json(task);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// Get tasks by list 
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ list: req.params.listId }).lean();
    res.json(tasks);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// Update task 
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const task = await Task.findByIdAndUpdate(id, updates, { new: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    emitToBoard(task.board.toString(), 'board:update', { type: 'task-updated', data: task });
    res.json(task);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// Delete task 
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await Task.findByIdAndDelete(id);
    await List.findByIdAndUpdate(task.list, { $pull: { taskOrder: task._id } });

    emitToBoard(task.board.toString(), 'board:update', { type: 'task-deleted', data: { taskId: id } });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// Move task
export const moveTask = async (req, res) => {
  try {
    const { taskId, fromListId, toListId, toIndex } = req.body;

    if (!taskId || !fromListId || !toListId) {
      return res.status(400).json({ error: "Missing fields", body: req.body });
    }

    console.log("➡️ MoveTask body:", req.body);

    const sourceList = await List.findById(fromListId);
    if (!sourceList) return res.status(404).json({ error: "Source list not found" });

    const destList = fromListId === toListId ? sourceList : await List.findById(toListId);
    if (!destList) return res.status(404).json({ error: "Destination list not found" });

    if (fromListId === toListId) {
      const arr = [...sourceList.taskOrder];
      const oldIndex = arr.findIndex(id => id.toString() === taskId);
      if (oldIndex === -1) return res.status(404).json({ error: "Task not found in the list" });

      arr.splice(oldIndex, 1); 
      arr.splice(toIndex ?? arr.length, 0, taskId); 
      sourceList.taskOrder = arr;

      await sourceList.save(); 
    } else {
      sourceList.taskOrder = (sourceList.taskOrder || []).filter(
        (t) => t.toString() !== taskId
      );
      await sourceList.save();

      const arr = destList.taskOrder ? [...destList.taskOrder] : [];
      arr.splice(toIndex ?? arr.length, 0, taskId);
      destList.taskOrder = arr;
      await destList.save();
    }

    const task = await Task.findByIdAndUpdate(
      taskId,
      { list: toListId },
      { new: true }
    );

    if (!task) return res.status(404).json({ error: "Task not found" });

    res.json({ message: "Task moved successfully", task });
  } catch (err) {
    console.error("🔥 MoveTask Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};






