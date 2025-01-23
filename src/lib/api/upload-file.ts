import { useMutation } from '@tanstack/react-query';
import supabaseClient from '../supabase-client';

export function useUploadFileWithAiSource() {
  return useMutation({
    mutationFn: async ({ file, aiSource }: { file: File; aiSource: boolean }) => {
      const fileExtension = file.name.split('.').pop();
      const uniqueId = crypto.randomUUID();
      const timestamp = Date.now();

      const filePath = `${uniqueId}/${timestamp}_source_upload_ai_${aiSource}.${fileExtension}`;

      const { error } = await supabaseClient.storage.from('files').upload(filePath, file, {
        cacheControl: 'none',

        upsert: false,
      });

      if (error) {
        throw error;
      }

      return filePath;
    },
  });
}
