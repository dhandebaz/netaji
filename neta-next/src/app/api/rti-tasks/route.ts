import { NextRequest, NextResponse } from 'next/server';
import { getRTITasks, createRTITask } from '@/lib/rti';

export async function GET(request: NextRequest) {
  const tenant = request.headers.get('x-tenant') || null;
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const status = searchParams.get('status');
  const priority = searchParams.get('priority');

  const data = await getRTITasks({
    tenant,
    status,
    priority,
  });

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const tenant = request.headers.get('x-tenant') || null;
  const body = await request.json();

  const created = await createRTITask({ tenant, body });
  return NextResponse.json(created);
}

