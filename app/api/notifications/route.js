// File: app/api/notifications/route.js
// Next.js API Route untuk mengelola notifikasi

import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from 'next/server';

// GET: Fetch notifications for a user
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');

        if (!userId) {
            return NextResponse.json(
                { status: 'error', message: 'user_id is required' },
                { status: 400 }
            );
        }

        // Fetch notifications from database
        const { data, error } = await supabase
            .from('notification')
            .select('*')
            .eq('user_id', userId)
            .order('timestamp', { ascending: false });

        if (error) {
            console.error('Error fetching notifications:', error);
            return NextResponse.json(
                { status: 'error', message: 'Failed to fetch notifications', error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            status: 'success',
            message: 'Notifications fetched successfully',
            data: data || []
        });

    } catch (error) {
        console.error('Unexpected error in GET /api/notifications:', error);
        return NextResponse.json(
            { status: 'error', message: 'Internal server error', error: error?.message || String(error) },
            { status: 500 }
        );
    }
}

// POST: Create a new notification
export async function POST(request) {
    try {
        const body = await request.json();
        const { user_id, pesanan_id, tipe_notif, pesan } = body;

        // Validate required fields
        if (!user_id || !pesanan_id || !tipe_notif || !pesan) {
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Missing required fields: user_id, pesanan_id, tipe_notif, pesan'
                },
                { status: 400 }
            );
        }

        // Insert notification into database
        const { data, error } = await supabase
            .from('notification')
            .insert([
                {
                    user_id,
                    pesanan_id,
                    tipe_notif,
                    pesan,
                    sudah_dibaca: false
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating notification:', error);
            return NextResponse.json(
                { status: 'error', message: 'Failed to create notification', error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            status: 'success',
            message: 'Notification created successfully',
            data
        }, { status: 201 });

    } catch (error) {
        console.error('Unexpected error in POST /api/notifications:', error);
        return NextResponse.json(
            { status: 'error', message: 'Internal server error', error: error?.message || String(error) },
            { status: 500 }
        );
    }
}

// PATCH: Mark notification(s) as read
export async function PATCH(request) {
    try {
        const body = await request.json();
        const { notif_id, user_id, mark_all } = body;

        // Mark all notifications as read for a user
        if (mark_all && user_id) {
            const { data, error } = await supabase
                .from('notification')
                .update({ sudah_dibaca: true })
                .eq('user_id', user_id)
                .select();

            if (error) {
                console.error('Error marking all notifications as read:', error);
                return NextResponse.json(
                    { status: 'error', message: 'Failed to mark all as read', error: error.message },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                status: 'success',
                message: 'All notifications marked as read',
                data
            });
        }

        // Mark single notification as read
        if (notif_id) {
            const { data, error } = await supabase
                .from('notification')
                .update({ sudah_dibaca: true })
                .eq('notif_id', notif_id)
                .select()
                .single();

            if (error) {
                console.error('Error marking notification as read:', error);
                return NextResponse.json(
                    { status: 'error', message: 'Failed to mark notification as read', error: error.message },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                status: 'success',
                message: 'Notification marked as read',
                data
            });
        }

        return NextResponse.json(
            { status: 'error', message: 'Either notif_id or (user_id + mark_all) is required' },
            { status: 400 }
        );

    } catch (error) {
        console.error('Unexpected error in PATCH /api/notifications:', error);
        return NextResponse.json(
            { status: 'error', message: 'Internal server error', error: error?.message || String(error) },
            { status: 500 }
        );
    }
}