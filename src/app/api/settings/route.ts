// src/app/api/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get('uid');
  if (!uid) return NextResponse.json({ error: 'Missing UID' }, { status: 400 });

  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json(snap.data());
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const uid = data.uid;
  if (!uid) return NextResponse.json({ error: 'Missing UID' }, { status: 400 });

  const allowedFields = [
    'firstName',
    'lastName',
    'certificateNumber',
    'referralCode',
    'businessName',
    'industry',
    'website',
    'phone'
  ];

  type UserUpdateData = {
  firstName?: string;
  lastName?: string;
  certificateNumber?: string;
  referralCode?: string;
  businessName?: string;
  industry?: string;
  website?: string;
  phone?: string;
};

const updateData: UserUpdateData = {};

  for (const field of allowedFields) {
    if (field in data) updateData[field as keyof UserUpdateData] = data[field];
  }

  const ref = doc(db, 'users', uid);
  await setDoc(ref, updateData, { merge: true });
  return NextResponse.json({ success: true });
}
