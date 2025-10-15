
import express from 'express';
import asyncHandler from 'express-async-handler';
import authRouter from './authRouter.js';
import { User } from '../models/user.js'; // adjust if your user model path differs

const userRouter = express.Router();

/* ---------------------- Documentation Driven Development ---------------------- */
userRouter.docs = [
  {
    method: 'GET',
    path: '/api/user?page=1&limit=10&name=*',
    requiresAuth: true,
    description: 'Gets a list of users with optional pagination and name filter.',
    example: `curl -X GET localhost:3000/api/user?page=1&limit=10&name=Kai -H 'Authorization: Bearer <token>'`,
    response: {
      users: [
        {
          id: 1,
          name: '常用名字',
          email: 'a@jwt.com',
          roles: [{ role: 'admin' }],
        },
      ],
      more: false,
    },
  },
];

/* -------------------------------- List Users -------------------------------- */
userRouter.get(
  '/',
  authRouter.authenticateToken,
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const nameFilter = req.query.name || '*';

    const whereClause =
      nameFilter && nameFilter !== '*'
        ? { name: { $regex: new RegExp(nameFilter, 'i') } }
        : {};

    const skip = (page - 1) * limit;

    // Get paginated, filtered users
    const users = await User.find(whereClause)
      .skip(skip)
      .limit(limit)
      .select('-password') // never return passwords
      .lean();

    const totalCount = await User.countDocuments(whereClause);
    const more = page * limit < totalCount;

    res.json({ users, more });
  })
);

export default userRouter;
