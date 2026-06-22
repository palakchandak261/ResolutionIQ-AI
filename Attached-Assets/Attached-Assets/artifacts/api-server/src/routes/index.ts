import { Router, type IRouter } from "express";
import healthRouter from "./health";
import complaintsRouter from "./complaints";
import departmentsRouter from "./departments";
import analyticsRouter from "./analytics";
import riskRouter from "./risk";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use(complaintsRouter);
router.use(departmentsRouter);
router.use(analyticsRouter);
router.use(riskRouter);
router.use(usersRouter);

export default router;
