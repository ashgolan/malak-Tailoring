/**
 * validate.middleware.js
 */

import Joi from "joi";

const strOpt = () => Joi.string().trim().optional().allow("", null);
const strReq = () => Joi.string().trim().required();
const numOpt = () => Joi.number().optional().allow(null);
const numReq = () => Joi.number().required();
const dateStr = () => Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().allow("", null);
const bool = () => Joi.boolean().optional().default(false);

export const schemas = {

  login: Joi.object({
    email: Joi.string().email().required().messages({ "string.email": "אימייל לא תקין" }),
    password: Joi.string().min(10).required().messages({ "string.min": "סיסמה קצרה מדי" }),
  }),

  createUser: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(10).required(),
    role: Joi.string().valid("Admin", "User").required(),
    key: Joi.string().required(),
  }),

  updateUser: Joi.object({
    _id: Joi.string().required(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(10).optional(),
    role: Joi.string().valid("Admin", "User").optional(),
    key: Joi.string().required(),
  }),

  sale: Joi.object({
    date: dateStr(),
    clientName: strReq().max(120),
    name: strReq().max(200),
    remark: strOpt().max(300),
    quantity: Joi.number().min(0).default(1),
    number: numOpt().min(0).default(0),
    discount: numOpt().min(0).max(100).default(0),
    sale: numOpt().min(0).default(0),
    expenses: numOpt().min(0).default(0),
    totalAmount: numOpt().min(0).default(0),
    tax: bool(),
    colored: bool(),
  }),

  bouncedCheck: Joi.object({
    date: dateStr(),
    clientName: strReq().max(120),
    checkNumber: Joi.number().integer().optional().allow(null),
    bankNumber: Joi.number().integer().optional().allow(null),
    branchNumber: Joi.number().integer().optional().allow(null),
    accountNumber: Joi.number().integer().optional().allow(null),
    number: numOpt().min(0),
    paymentDate: dateStr(),
    taxNumber: strOpt().max(50),
    remark: strOpt().max(300),
    colored: bool(),
    totalAmount: numOpt().min(0),
  }),

  workerExpense: Joi.object({
    date: dateStr(),
    clientName: strReq().max(120),
    location: strOpt().max(200),
    equipment: strOpt().max(200),
    number: numOpt().min(0),
    totalAmount: numOpt().min(0),
    tax: bool(),
    colored: bool(),
  }),

  waybill: Joi.object({
    date: dateStr(),
    clientName: strReq().max(120),
    name: strReq().max(200),
    location: strOpt().max(200),
    remark: strOpt().max(300),
    quantity: Joi.number().integer().min(0).default(1),
    totalAmount: numOpt().min(0),
    colored: bool(),
  }),

  partialPayment: Joi.object({
    date: dateStr(),
    clientName: strReq().max(120),
    name: strOpt().max(300),
    number: numOpt().min(0),
    advanceAmount: numOpt().min(0),
    totalAmount: numOpt().min(0),
    colored: bool(),
    payments: Joi.array().items(
      Joi.object({
        amount: Joi.number().min(0).required(),
        date: dateStr(),
        note: strOpt().max(200),
      })
    ).optional().default([]),
  }),

  partialPaymentUpdate: Joi.object({
    date: dateStr(),
    clientName: strOpt().max(120),
    name: strOpt().max(300),
    number: numOpt().min(0),
    advanceAmount: numOpt().min(0),
    totalAmount: numOpt().min(0),
    colored: bool(),
    payments: Joi.array().items(
      Joi.object({
        amount: Joi.number().min(0).required(),
        date: dateStr(),
        note: strOpt().max(200),
      })
    ).optional().default([]),
  }),

  institutionTax: Joi.object({
    date: dateStr(),
    clientName: strReq().max(120),
    name: strOpt().max(200),
    taxNumber: strOpt().max(50),
    number: numOpt().min(0),
    paymentDate: dateStr(),
    totalAmount: numOpt().min(0),
    colored: bool(),
  }),

  // ✅ afterTax تغيّر من string إلى boolean
  saleToCompany: Joi.object({
    date: dateStr(),
    clientName: strReq().max(120),
    name: strOpt().max(200),
    kindOfWork: strOpt().max(100),
    containersNumbers: strOpt().max(100),
    sending: strOpt().max(100),
    number: numOpt().min(0),
    afterTax: Joi.boolean().optional().default(false),
    totalAmount: numOpt().min(0),
    colored: bool(),
  }),

  expense: Joi.object({
    date: dateStr(),
    name: strReq().max(200),
    number: numOpt().min(0),
    paymentDate: dateStr(),
    taxNumber: strOpt().max(50),
    tax: bool(),
    totalAmount: numOpt().min(0),
    colored: bool(),
  }),

  sleevesBid: Joi.object({
    date: dateStr(),
    clientName: strReq().max(120),
    quantity: Joi.number().min(0).default(1),
    number: numOpt().min(0),
    expenses: numOpt().min(0).default(0),
    totalAmount: numOpt().min(0),
    tax: bool(),
    colored: bool(),
  }),

  bid: Joi.object({
    clientName: strReq().max(120),
    date: strOpt(),
    time: strOpt(),
    target: strOpt().max(300),
    totalAmount: numOpt().min(0),
    freeBid: Joi.boolean().required(),
    isApproved: bool(),
    data: Joi.array().optional().default([]),
  }),

  inventory: Joi.object({
    name: strReq().max(150),
    number: numReq().min(0),
  }),

  contact: Joi.object({
    name: strReq().max(120),
    number: strOpt().max(30),
    phone: strOpt().max(30),
    mail: Joi.string().email().optional().allow("", null),
    bankProps: strOpt().max(200),
  }),

  company: Joi.object({
    name: strReq().max(120),
    isInstitution: bool(),
    taskDescription: strOpt().max(300),
  }),

  event: Joi.object({
    title: strReq().max(200),
    start: Joi.date().iso().required(),
    end: Joi.date().iso().required(),
  }),

  settings: Joi.object({
    masValue: strOpt(),
    maamValue: strOpt(),
    businessName: strOpt().max(100),
    backupEmail: Joi.string().email().optional().allow("", null),
    backupTime: strOpt(),
  }),
};

export const validate = (schema, target = "body") =>
  (req, res, next) => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      return res.status(422).json({
        error: "Validation Error",
        messages: error.details.map(d => d.message),
      });
    }

    req[target] = value;
    next();
  };