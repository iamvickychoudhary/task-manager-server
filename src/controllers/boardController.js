import Board from '../models/Board.js';
import List from '../models/List.js';
import Task from '../models/Task.js';
import { emitToBoard } from '../sockets/socket.js';

// Create board 
export const createBoard = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });

    const board = await Board.create({
      title,
      description: description || '',
      owner: req.user.id,
      members: [req.user.id]
    });
    res.status(201).json(board);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's boards 
export const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ members: req.user.id }).lean();
    res.json(boards);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// Get single board with lists & tasks 
export const getBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const board = await Board.findById(id).lean();
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const lists = await List.find({ board: id }).lean();
    const tasks = await Task.find({ board: id }).lean();

    res.json({ board, lists, tasks });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// Update board 
export const updateBoard = async (req, res) => {
   try {
    const updated = await Board.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // ✅ return updated doc
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete board + lists + tasks 
export const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const board = await Board.findById(id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const lists = await List.find({ board: id }).lean();
    const listIds = lists.map(l => l._id);

    await Task.deleteMany({ list: { $in: listIds } });
    await List.deleteMany({ board: id });
    await Board.findByIdAndDelete(id);

    emitToBoard(id, 'board:update', { type: 'board-deleted', data: { boardId: id } });

    res.json({ ok: true });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};
