import List from '../models/List.js';
import Task from '../models/Task.js';
import { emitToBoard } from '../sockets/socket.js';

// Create list 
export const createList = async (req, res) => {
  try {
    const { boardId, title } = req.body;
    if (!boardId || !title) return res.status(400).json({ message: 'Missing fields' });

    const list = await List.create({ board: boardId, title, taskOrder: [] });
    emitToBoard(boardId, 'board:update', { type: 'list-created', data: list });
    res.status(201).json(list);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// Get lists by board 
export const getLists = async (req, res) => {
  try {
    const lists = await List.find({ board: req.params.boardId }).lean();
    res.json(lists);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// Update list 
export const updateList = async (req, res) => {
  try {
    const { id } = req.params;
    const list = await List.findByIdAndUpdate(id, req.body, { new: true });
    if (!list) return res.status(404).json({ message: 'List not found' });

    emitToBoard(list.board.toString(), 'board:update', { type: 'list-updated', data: list });
    res.json(list);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// Delete list and its tasks 
export const deleteList = async (req, res) => {
  try {
    const { id } = req.params;
    const list = await List.findById(id);
    if (!list) return res.status(404).json({ message: 'List not found' });

    await Task.deleteMany({ list: id });
    await List.findByIdAndDelete(id);

    emitToBoard(list.board.toString(), 'board:update', { type: 'list-deleted', data: { listId: id } });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};
