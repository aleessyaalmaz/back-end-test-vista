import { Router, Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { CreateCompanyRequest, CreateServiceRequest, CompanyResponse, ServiceResponse } from './dto';

const router = Router();

const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.post('/companies',
  body('name').trim().notEmpty().withMessage('name is required'),
  body('registrationNumber').trim().notEmpty().withMessage('registrationNumber is required'),
  validate,
  async (req: Request<{}, {}, CreateCompanyRequest>, res: Response<CompanyResponse | { message: string }>, next: NextFunction) => {
    try {
      const company = await prisma.company.create({
        data: { name: req.body.name, registrationNumber: req.body.registrationNumber },
        include: { services: true },
      });
      res.status(201).json(company);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')
        return res.status(409).json({ message: 'Registration number already exists' });
      next(e);
    }
  });

router.get('/companies', async (_req, res: Response<CompanyResponse[]>, next) => {
  try {
    res.json(await prisma.company.findMany({ include: { services: true }, orderBy: { id: 'desc' } }));
  } catch (e) { next(e); }
});

router.post('/services',
  body('companyId').isInt({ gt: 0 }).withMessage('companyId must be an integer'),
  body('name').trim().notEmpty().withMessage('name is required'),
  body('description').trim().notEmpty().withMessage('description is required'),
  body('price').isFloat({ gt: 0 }).withMessage('price must be a positive number'),
  validate,
  async (req: Request<{}, {}, CreateServiceRequest>, res: Response<ServiceResponse | { message: string }>, next: NextFunction) => {
    try {
      const { companyId, name, description, price } = req.body;
      const company = await prisma.company.findUnique({ where: { id: Number(companyId) } });
      if (!company) return res.status(404).json({ message: 'Company not found' });
      const service = await prisma.service.create({
        data: { companyId: Number(companyId), name, description, price: Number(price) },
      });
      res.status(201).json(service);
    } catch (e) { next(e); }
  });

router.get('/services/:id',
  param('id').isInt({ gt: 0 }).withMessage('id must be an integer'),
  validate,
  async (req: Request<{ id: string }>, res: Response<ServiceResponse | { message: string }>, next: NextFunction) => {
    try {
      const service = await prisma.service.findUnique({ where: { id: Number(req.params.id) } });
      if (!service) return res.status(404).json({ message: 'Service not found' });
      res.json(service);
    } catch (e) { next(e); }
  });

export default router;