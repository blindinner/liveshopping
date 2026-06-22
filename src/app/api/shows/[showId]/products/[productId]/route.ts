import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PATCH /api/shows/[showId]/products/[productId] - Update show product (e.g., set active)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ showId: string; productId: string }> }
) {
  try {
    const { showId, productId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();

    // If setting this product as active, first deactivate all others
    if (updates.is_active === true) {
      await supabase
        .from('show_products')
        .update({ is_active: false })
        .eq('show_id', showId)
        .neq('id', productId);
    }

    const { data: showProduct, error } = await supabase
      .from('show_products')
      .update(updates)
      .eq('id', productId)
      .eq('show_id', showId)
      .select('*, product:products(*)')
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ showProduct });
  } catch (error) {
    console.error('Update show product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/shows/[showId]/products/[productId] - Remove product from show
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ showId: string; productId: string }> }
) {
  try {
    const { showId, productId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('show_products')
      .delete()
      .eq('id', productId)
      .eq('show_id', showId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to remove product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete show product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
