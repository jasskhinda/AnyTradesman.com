import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const BUCKET = 'business-credentials';
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic'];

// Uploads a credential document (license, insurance certificate, ...) to the
// private business-credentials bucket. Returns the storage path, which is
// stored on the credential row; admins read it later via a signed URL.
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const businessId = formData.get('businessId') as string | null;

    if (!file || !businessId) {
      return NextResponse.json({ error: 'Missing file or business.' }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Upload a PDF or an image (JPG, PNG, WebP, HEIC).' },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File is too large. Maximum size is 10 MB.' }, { status: 400 });
    }

    // The caller must own the business they are uploading for
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', businessId)
      .eq('owner_id', user.id)
      .maybeSingle();

    if (!business) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!adminUrl || !adminKey) {
      return NextResponse.json({ error: 'Service configuration error.' }, { status: 500 });
    }
    const admin = createAdminClient(adminUrl, adminKey);

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
    const path = `${businessId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error('[credentials/upload] Upload failed:', uploadError.message);
      return NextResponse.json(
        { error: 'Could not upload the document. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ path });
  } catch (error) {
    console.error('[credentials/upload] Unexpected error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
