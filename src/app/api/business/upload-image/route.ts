import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_COVER_SIZE = 5 * 1024 * 1024; // 5MB

function getExtension(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg': return 'jpg';
    case 'image/png': return 'png';
    case 'image/webp': return 'webp';
    default: return 'jpg';
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const businessId = formData.get('businessId') as string | null;
    const type = formData.get('type') as string | null;

    if (!file || !businessId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: file, businessId, type' },
        { status: 400 }
      );
    }

    if (type !== 'logo' && type !== 'cover') {
      return NextResponse.json(
        { error: 'Type must be "logo" or "cover"' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File must be JPEG, PNG, or WebP' },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = type === 'logo' ? MAX_LOGO_SIZE : MAX_COVER_SIZE;
    if (file.size > maxSize) {
      const maxMB = maxSize / (1024 * 1024);
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxMB}MB.` },
        { status: 400 }
      );
    }

    // Verify authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user owns this business
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id, owner_id')
      .eq('id', businessId)
      .maybeSingle();

    if (bizError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    if (business.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Use admin client for storage operations (bypasses RLS for reliable uploads)
    const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!adminUrl || !adminKey) {
      console.error('Missing Supabase admin credentials for storage');
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      );
    }

    const admin = createAdminClient(adminUrl, adminKey);
    const ext = getExtension(file.type);
    const filePath = `${businessId}/${type}.${ext}`;

    // Delete old file(s) at this path (any extension)
    const { data: existingFiles } = await admin.storage
      .from('business-images')
      .list(businessId, { search: type });

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles
        .filter(f => f.name.startsWith(`${type}.`))
        .map(f => `${businessId}/${f.name}`);
      if (filesToDelete.length > 0) {
        await admin.storage.from('business-images').remove(filesToDelete);
      }
    }

    // Upload new file
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await admin.storage
      .from('business-images')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError.message);
      return NextResponse.json(
        { error: 'Failed to upload image. Please try again.' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = admin.storage
      .from('business-images')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Update business record
    const updateField = type === 'logo' ? 'logo_url' : 'cover_image_url';
    const { error: updateError } = await admin
      .from('businesses')
      .update({
        [updateField]: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', businessId);

    if (updateError) {
      console.error('DB update error:', updateError.message);
      return NextResponse.json(
        { error: 'Image uploaded but failed to save. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
