import supabaseClient from '../supabase-client';
import type { PropertyState } from '@/hooks/use-current-property';
export async function uploadFileWithAiSource({
  file,
  currentProperty,
  aiSource,
}: {
  file: File;
  aiSource: boolean;
  currentProperty: PropertyState;
}) {
  const timestamp = Date.now();
  const metadata = `${timestamp}_source_upload_ai_${aiSource}`;
  const filename = file.name.replace(/[^\w .-]/g, '');
  const filePath = `${currentProperty.currentProperty?.id}/${metadata}/${filename}`;

  const { error } = await supabaseClient.storage.from('files').upload(filePath, file, {
    cacheControl: 'none',
    upsert: true,
  });

  if (error) {
    throw error;
  }

  return filePath;
}
export async function getCurrentUserUploadLimit({
  userId,
  fileSize,
  nbAiExtractions,
}: {
  userId: string;
  fileSize: number;
  nbAiExtractions: number;
}) {
  const { data, error } = await supabaseClient.rpc('checkIfNewFileWillReachQuotas', {
    userid: userId,
    newfilesize: fileSize,
    nbaiextraction: nbAiExtractions,
  });

  if (error) {
    throw error;
  }

  return data;
}
