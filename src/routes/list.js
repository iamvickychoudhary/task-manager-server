import express from 'express';
import auth from '../middlewares/auth.js';
import * as listCtrl from '../controllers/listController.js';

const router = express.Router();
router.use(auth);

router.post('/', listCtrl.createList);          
router.get('/:boardId', listCtrl.getLists);
router.put('/:id', listCtrl.updateList);
router.delete('/:id', listCtrl.deleteList);

export default router;
