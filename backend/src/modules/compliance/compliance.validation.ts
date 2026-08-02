import { z } from 'zod';
import {
  ComplianceCategory,
  ComplianceStatus,
  PriorityLevel,
  RenewalFrequency,
} from '../../common/constants/enums.js';

export const createComplianceRecordSchema = z.object({
  body: z.object({
    documentName: z
      .string({ message: 'Document name is required' })
      .min(2, 'Document name must be at least 2 characters')
      .max(200, 'Document name cannot exceed 200 characters'),
    licenseNumber: z
      .string({ message: 'License or Certificate number is required' })
      .min(1, 'License or Certificate number is required')
      .max(100, 'License number cannot exceed 100 characters'),
    category: z.nativeEnum(ComplianceCategory, { message: 'Valid compliance category is required' }),
    companyId: z.string({ message: 'Company ID is required' }).optional(),
    departmentId: z.string({ message: 'Department ID is required' }),
    responsiblePersonId: z.string().optional(),
    issuingAuthority: z
      .string({ message: 'Issuing authority is required' })
      .min(2, 'Issuing authority must be at least 2 characters')
      .max(150),
    issueDate: z.string({ message: 'Issue date is required' }).or(z.date()),
    expiryDate: z.string({ message: 'Expiry date is required' }).or(z.date()),
    renewalFrequency: z
      .nativeEnum(RenewalFrequency, { message: 'Valid renewal frequency is required' })
      .optional()
      .default(RenewalFrequency.ANNUAL),
    priority: z
      .nativeEnum(PriorityLevel, { message: 'Valid priority level is required' })
      .optional()
      .default(PriorityLevel.MEDIUM),
    status: z.nativeEnum(ComplianceStatus).optional(),
    notes: z.string().optional().default(''),
    autoRenewalEnabled: z.boolean().optional().default(false),
  }),
});

export const updateComplianceRecordSchema = z.object({
  params: z.object({
    id: z.string({ message: 'Compliance record ID parameter is required' }),
  }),
  body: z.object({
    documentName: z.string().min(2).max(200).optional(),
    licenseNumber: z.string().min(1).max(100).optional(),
    category: z.nativeEnum(ComplianceCategory).optional(),
    companyId: z.string().optional(),
    departmentId: z.string().optional(),
    responsiblePersonId: z.string().nullable().optional(),
    issuingAuthority: z.string().min(2).max(150).optional(),
    issueDate: z.string().or(z.date()).optional(),
    expiryDate: z.string().or(z.date()).optional(),
    renewalFrequency: z.nativeEnum(RenewalFrequency).optional(),
    priority: z.nativeEnum(PriorityLevel).optional(),
    status: z.nativeEnum(ComplianceStatus).optional(),
    notes: z.string().optional(),
    autoRenewalEnabled: z.boolean().optional(),
  }),
});

export const complianceIdParamSchema = z.object({
  params: z.object({
    id: z.string({ message: 'Compliance record ID parameter is required' }),
  }),
});

export const listComplianceRecordsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    search: z.string().optional(),
    companyId: z.string().optional(),
    departmentId: z.string().optional(),
    responsiblePersonId: z.string().optional(),
    category: z.nativeEnum(ComplianceCategory).optional(),
    priority: z.nativeEnum(PriorityLevel).optional(),
    status: z.nativeEnum(ComplianceStatus).optional(),
    sortBy: z.enum(['expiryDate', 'issueDate', 'documentName', 'createdAt']).optional().default('expiryDate'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
});

export type CreateComplianceRecordInput = z.infer<typeof createComplianceRecordSchema>['body'];
export type UpdateComplianceRecordInput = z.infer<typeof updateComplianceRecordSchema>['body'];
