import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['code', 'name', 'campus_id', 'owner_org_id', 'requester_id'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Start database transaction
    const result = await db.$transaction(async (tx) => {
      // 1. Create OrgUnit with status 'draft'
      const orgUnit = await tx.orgUnit.create({
        data: {
          code: body.code,
          name: body.name,
          type: body.type && body.type !== '' ? body.type : null,
          campus_id: BigInt(body.campus_id),
          parent_id: body.parent_id ? BigInt(body.parent_id) : null,
          description: body.description || null,
          status: 'draft',
          planned_establishment_date: body.planned_establishment_date ? new Date(body.planned_establishment_date) : null,
          effective_from: body.planned_establishment_date ? new Date(body.planned_establishment_date) : new Date(),
          effective_to: null,
        },
      });

      // 2. Create OrgStructureRequest
      const orgStructureRequest = await tx.orgStructureRequest.create({
        data: {
          request_type: 'created',
          status: 'SUBMITTED',
          requester_id: BigInt(body.requester_id),
          target_org_unit_id: orgUnit.id,
          owner_org_id: BigInt(body.owner_org_id),
          payload: body.request_details ? (() => {
            if (typeof body.request_details === 'string') {
              try {
                return JSON.parse(body.request_details);
              } catch {
                // If not valid JSON, treat as plain text
                return { description: body.request_details };
              }
            }
            return body.request_details;
          })() : {},
          attachments: body.attachments ? JSON.stringify(body.attachments) : '[]',
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      // 3. Create OrgUnitHistory
      const orgUnitHistory = await tx.orgUnitHistory.create({
        data: {
          org_unit_id: orgUnit.id,
          change_type: 'created',
          old_name: null,
          new_name: orgUnit.name,
          details: {
            code: orgUnit.code,
            type: orgUnit.type,
            status: orgUnit.status,
            campus_id: orgUnit.campus_id?.toString(),
            description: orgUnit.description,
            planned_establishment_date: orgUnit.planned_establishment_date,
          },
          changed_at: new Date(),
        },
      });

      // 4. Create OrgUnitRelation if parent_id is provided
      let orgUnitRelation = null;
      if (body.parent_id) {
        orgUnitRelation = await tx.orgUnitRelation.create({
          data: {
            parent_id: BigInt(body.parent_id),
            child_id: orgUnit.id,
            relation_type: 'direct',
            effective_from: body.planned_establishment_date ? new Date(body.planned_establishment_date) : new Date(),
            effective_to: null,
            note: 'Initial parent-child relationship',
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
      }

      // Serialize BigInt fields for response
      return {
        orgUnit: {
          ...orgUnit,
          id: orgUnit.id.toString(),
          parent_id: orgUnit.parent_id?.toString(),
          campus_id: orgUnit.campus_id?.toString(),
        },
        orgStructureRequest: {
          ...orgStructureRequest,
          id: orgStructureRequest.id.toString(),
          target_org_unit_id: orgStructureRequest.target_org_unit_id?.toString(),
          requester_id: orgStructureRequest.requester_id?.toString(),
          owner_org_id: orgStructureRequest.owner_org_id?.toString(),
        },
        orgUnitHistory: {
          ...orgUnitHistory,
          id: orgUnitHistory.id.toString(),
          org_unit_id: orgUnitHistory.org_unit_id.toString(),
        },
        orgUnitRelation: orgUnitRelation ? {
          ...orgUnitRelation,
          parent_id: orgUnitRelation.parent_id.toString(),
          child_id: orgUnitRelation.child_id.toString(),
        } : null,
      };
    });

    // 5. Create OrgUnitAttachments if attachments provided (outside transaction)
    let attachments = [];
    // TODO: Temporarily disabled attachments creation to debug
    /*
    if (body.attachments && Array.isArray(body.attachments)) {
      for (const attachment of body.attachments) {
        const orgAttachment = await db.OrgUnitAttachments.create({
          data: {
            org_unit_id: BigInt(result.orgUnit.id),
            attachment_type: 'document', // Default type
            file_name: attachment.file_name,
            file_path: attachment.file_path,
            file_size: attachment.file_size ? BigInt(attachment.file_size) : null,
            mime_type: attachment.mime_type,
            description: attachment.description || null,
            uploaded_by: BigInt(body.requester_id),
            uploaded_at: new Date(),
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
        attachments.push(orgAttachment);
      }
    }
    */

    // Add attachments to result
    result.attachments = attachments.map(att => ({
      ...att,
      id: att.id.toString(),
      org_unit_id: att.org_unit_id.toString(),
      file_size: att.file_size?.toString(),
      uploaded_by: att.uploaded_by?.toString(),
    }));

    return NextResponse.json({
      success: true,
      message: 'Unit initialized successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Initial units POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to initialize unit',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'draft';
    
    // Get initial units with related data
    const units = await db.OrgUnit.findMany({
      where: { status },
      include: {
        org_structure_request: true,
        org_unit_attachments: true,
        campus: true,
      },
      orderBy: { created_at: 'desc' },
    });

    // Serialize BigInt fields
    const serializedUnits = units.map(unit => ({
      ...unit,
      id: unit.id.toString(),
      parent_id: unit.parent_id?.toString(),
      campus_id: unit.campus_id?.toString(),
      org_structure_request: unit.org_structure_request?.map(req => ({
        ...req,
        id: req.id.toString(),
        target_org_unit_id: req.target_org_unit_id?.toString(),
        requester_id: req.requester_id?.toString(),
        owner_org_id: req.owner_org_id?.toString(),
      })) || [],
      org_unit_attachments: unit.org_unit_attachments?.map(att => ({
        ...att,
        id: att.id.toString(),
        org_unit_id: att.org_unit_id.toString(),
        file_size: att.file_size?.toString(),
        uploaded_by: att.uploaded_by?.toString(),
      })) || [],
      campus: unit.campus ? {
        ...unit.campus,
        id: unit.campus.id.toString(),
      } : null,
    }));

    return NextResponse.json({
      success: true,
      data: serializedUnits,
      total: serializedUnits.length,
    });

  } catch (error) {
    console.error('Initial units GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch initial units',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}