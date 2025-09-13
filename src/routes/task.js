import express from 'express';
import auth from '../middlewares/auth.js';
import * as taskCtrl from '../controllers/taskController.js';

const router = express.Router();
router.use(auth);

router.put('/move', taskCtrl.moveTask);
router.post('/', taskCtrl.createTask);          
router.get('/:listId', taskCtrl.getTasks);
router.put('/:id', taskCtrl.updateTask);
router.delete('/:id', taskCtrl.deleteTask);

export default router;
