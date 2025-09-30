import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { withErrorHandling, createErrorResponse } from '@/lib/api/api-handler';
import { ProgramStatus } from '@/constants/programs';

export const GET = withErrorHandling(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return createErrorResponse('Unauthorized', 'Authentication required', 401);
  }

  const statusCounts = await db.program.groupBy({
    by: ['status'],
    _count: {
      id: true,
    },
  });

  const summary = {
    total: 0,
    draft: 0,
    submitted: 0,
    reviewing: 0,
    approved: 0,
    rejected: 0,
    published: 0,
    archived: 0,
  };

  statusCounts.forEach((item) => {
    const count = item._count.id;
    summary.total += count;

    switch (item.status) {
      case ProgramStatus.DRAFT:
        summary.draft += count;
        break;
      case ProgramStatus.SUBMITTED:
        summary.submitted += count;
        break;
      case ProgramStatus.REVIEWING:
        summary.reviewing += count;
        break;
      case ProgramStatus.APPROVED:
        summary.approved += count;
        break;
      case ProgramStatus.REJECTED:
        summary.rejected += count;
        break;
      case ProgramStatus.PUBLISHED:
        summary.published += count;
        break;
      case ProgramStatus.ARCHIVED:
        summary.archived += count;
        break;
      default:
        summary.draft += count;
        break;
    }
  });

  const recent = await db.program.findMany({
    orderBy: { created_at: 'desc' },
    take: 5,
    select: {
      id: true,
      code: true,
      name_vi: true,
      status: true,
      created_at: true,
      OrgUnit: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  return {
    summary,
    recent,
  };
}, 'fetch program stats');
