import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Wait for the user state
    const user = await new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, 
        (user) => {
          unsubscribe();
          resolve(user);
        },
        (error) => {
          unsubscribe();
          reject(error);
        }
      );
    });
    
    if (user) {
      return NextResponse.json({ isLoggedIn: true });
    } else {
      return NextResponse.json({ isLoggedIn: false });
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ isLoggedIn: false, error: 'Failed to check auth status' }, { status: 500 });
  }
}
