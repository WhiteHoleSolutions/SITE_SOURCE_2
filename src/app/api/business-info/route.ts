import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/business-info - Get business information
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the first (and should be only) business info record
    let businessInfo = await prisma.businessInfo.findFirst();

    // If no business info exists, create default one
    if (!businessInfo) {
      businessInfo = await prisma.businessInfo.create({
        data: {
          businessName: 'White Hole Solutions',
          country: 'Australia',
          taxRate: 10.0,
          paymentTerms: 'Net 30',
        },
      });
    }

    return NextResponse.json({ businessInfo });
  } catch (error) {
    console.error('Error fetching business info:', error);
    return NextResponse.json({ error: 'Failed to fetch business info' }, { status: 500 });
  }
}

// PUT /api/business-info - Update business information
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Get existing business info or create new
    let businessInfo = await prisma.businessInfo.findFirst();

    if (businessInfo) {
      // Update existing
      businessInfo = await prisma.businessInfo.update({
        where: { id: businessInfo.id },
        data: {
          businessName: data.businessName,
          abn: data.abn,
          acn: data.acn,
          address: data.address,
          suburb: data.suburb,
          state: data.state,
          postcode: data.postcode,
          country: data.country,
          email: data.email,
          phone: data.phone,
          website: data.website,
          taxRate: data.taxRate ? parseFloat(data.taxRate) : 10.0,
          paymentTerms: data.paymentTerms,
        },
      });
    } else {
      // Create new
      businessInfo = await prisma.businessInfo.create({
        data: {
          businessName: data.businessName,
          abn: data.abn,
          acn: data.acn,
          address: data.address,
          suburb: data.suburb,
          state: data.state,
          postcode: data.postcode,
          country: data.country || 'Australia',
          email: data.email,
          phone: data.phone,
          website: data.website,
          taxRate: data.taxRate ? parseFloat(data.taxRate) : 10.0,
          paymentTerms: data.paymentTerms || 'Net 30',
        },
      });
    }

    return NextResponse.json({ businessInfo });
  } catch (error) {
    console.error('Error updating business info:', error);
    return NextResponse.json({ error: 'Failed to update business info' }, { status: 500 });
  }
}
