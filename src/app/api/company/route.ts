import { NextResponse } from 'next/server';
import { companyService } from '@/infrastructure/di/container';

// GET /api/company - Get company information
export async function GET() {
  try {
    const company = await companyService.getCompany();

    if (!company) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: company.id,
        name: company.name,
        address: company.address,
        phone: company.phone,
        email: company.email,
        website: company.website,
        taxId: company.taxId,
        logo: company.logo,
        tipPercentage: company.tipPercentage,
        tipEnabled: company.tipEnabled,
        createdAt: company.createdAt.toISOString(),
        updatedAt: company.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch company',
      },
      { status: 500 }
    );
  }
}

// POST /api/company - Create company
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name: string;
      address?: string;
      phone?: string;
      email?: string;
      website?: string;
      taxId?: string;
      tipPercentage?: number;
      tipEnabled?: boolean;
    };

    const company = await companyService.createCompany({
      name: body.name,
      address: body.address,
      phone: body.phone,
      email: body.email,
      website: body.website,
      taxId: body.taxId,
      tipPercentage: body.tipPercentage ?? 10,
      tipEnabled: body.tipEnabled ?? true,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: company.id,
        name: company.name,
        address: company.address,
        phone: company.phone,
        email: company.email,
        website: company.website,
        taxId: company.taxId,
        logo: company.logo,
        tipPercentage: company.tipPercentage,
        tipEnabled: company.tipEnabled,
        createdAt: company.createdAt.toISOString(),
        updatedAt: company.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to create company',
      },
      { status: 500 }
    );
  }
}

// PUT /api/company - Update company
export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      name?: string;
      address?: string;
      phone?: string;
      email?: string;
      website?: string;
      taxId?: string;
      tipPercentage?: number;
      tipEnabled?: boolean;
    };

    if (!body.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Company ID is required',
        },
        { status: 400 }
      );
    }

    const company = await companyService.updateCompany(body.id, {
      name: body.name,
      address: body.address,
      phone: body.phone,
      email: body.email,
      website: body.website,
      taxId: body.taxId,
      tipPercentage: body.tipPercentage,
      tipEnabled: body.tipEnabled,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: company.id,
        name: company.name,
        address: company.address,
        phone: company.phone,
        email: company.email,
        website: company.website,
        taxId: company.taxId,
        logo: company.logo,
        tipPercentage: company.tipPercentage,
        tipEnabled: company.tipEnabled,
        createdAt: company.createdAt.toISOString(),
        updatedAt: company.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to update company',
      },
      { status: 500 }
    );
  }
}
