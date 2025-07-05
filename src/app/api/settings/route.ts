// src/app/api/settings/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get('uid');
  if (!uid) {
    return NextResponse.json(
      { error: 'Missing uid parameter' },
      { status: 400 }
    );
  }

  const userSnap = await getDoc(doc(db, 'users', uid));
  if (!userSnap.exists()) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  const data = userSnap.data();
  // You may want to omit sensitive fields here
  return NextResponse.json(data);
}
