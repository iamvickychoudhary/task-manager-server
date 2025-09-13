import express from 'express';
import auth from '../middlewares/auth.js';
import * as boardCtrl from '../controllers/boardController.js';

const router = express.Router();

router.use(auth);

router.post('/', boardCtrl.createBoard);
router.get('/', boardCtrl.getBoards);
router.get('/:id', boardCtrl.getBoard);
router.put('/:id', boardCtrl.updateBoard);
router.delete('/:id', boardCtrl.deleteBoard);

export default router;
