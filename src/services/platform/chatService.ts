import { supabase } from '../supabase/client';

export async function listMessages(threadId: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, thread_id, sender_id, body, created_at, read_at')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function sendMessage(threadId: string, senderId: string, body: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ thread_id: threadId, sender_id: senderId, body })
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  return data.id as string;
}
