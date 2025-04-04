import { ref } from 'vue';
import { supabase } from '@/lib/supabase';
import { useImageUploader } from '@/composables/useImageUploader';
import { useScanResultStore } from '@/stores/scanResultStore';
import { Response as useDeepSeek } from '@/lib/deepSeek';
import type { ScanResult } from '@/types/api';

type PestAdviceKey = 'Green Leaf Hopper' | 'Brown Planthopper' | 'Rice Black Bug' | 'Rice Bug' | 'White Yellow Stemborer';

const PEST_ADVICE: Record<PestAdviceKey, string> = {
  'Green Leaf Hopper': "This pest requires immediate attention as it can spread viral diseases...",
  'Brown Planthopper': "Monitor the base of tillers for signs of infestation...",
  'Rice Black Bug': "Check for signs of damage near the base of the plant...",
  'Rice Bug': "Inspect grains for feeding damage and discoloration...",
  'White Yellow Stemborer': "Look for deadhearts and whiteheads in the crop..."
};

export function usePestScan() {
  const uploadError = ref<string | null>(null);
  const isLoading = ref<boolean>(false);
  const scanResultStore = useScanResultStore();

  const getUserId = async (authUserId: string): Promise<number | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('user_id', authUserId)
      .single();
    
    if (error || !data) return null;
    return data.id;
  };

  const getAlertLevel = (confidence: number): string => {
    if (confidence < 0.30) return "No pests detected";
    const levels = ['High', 'Medium', 'Low'];
    const randomIndex = Math.floor(Math.random() * levels.length);
    return levels[randomIndex];
  };

  const uploadPestScan = async (file: File): Promise<string | void> => {
    isLoading.value = true;
    uploadError.value = null;
    scanResultStore.setScanResult([]);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        uploadError.value = 'User is not authenticated';
        isLoading.value = false;
        return;
      }

      const authUserId = authData.user.id;
      const userId = await getUserId(authUserId);
      if (!userId) {
        uploadError.value = 'User profile not found';
        isLoading.value = false;
        return;
      }

      const fileName = `${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('store')
        .upload(fileName, file);

      if (uploadErr) {
        uploadError.value = uploadErr.message;
        isLoading.value = false;
        return;
      }

      const imageUrl = `https://touhyblbobrrtoebgkzb.supabase.co/storage/v1/object/public/store/${fileName}`;

      const { data: fileData, error: fileError } = await supabase.storage
        .from('store')
        .download(fileName);

      if (fileError || !fileData) {
        uploadError.value = fileError?.message || 'File download failed';
        isLoading.value = false;
        return;
      }

      const retrievedFile = new File([fileData], fileName, { type: file.type });

      const scanResult = await useImageUploader(retrievedFile) as ScanResult;
      
      if (!scanResult) {
        uploadError.value = 'Scan failed';
        isLoading.value = false;
        return;
      }

      // Convert base64 to blob and upload processed image
      let processedBlob: Blob;
      try {
        const base64Data = scanResult.output_image.value.replace(/^data:image\/\w+;base64,/, '');
        const blobData = atob(base64Data);
        const arrayBuffer = new Uint8Array(blobData.length);
        for (let i = 0; i < blobData.length; i++) {
          arrayBuffer[i] = blobData.charCodeAt(i);
        }
        processedBlob = new Blob([arrayBuffer], { type: 'image/jpeg' });
      } catch (error) {
        uploadError.value = 'Failed to process image data';
        isLoading.value = false;
        return;
      }
      
      const processedFileName = `processed_${Date.now()}_${file.name}`;
      const { error: processedUploadErr } = await supabase.storage
        .from('store')
        .upload(processedFileName, processedBlob);

      if (processedUploadErr) {
        uploadError.value = processedUploadErr.message;
        isLoading.value = false;
        return;
      }

      // Create a local URL for the decoded image
      const processedImageUrl = URL.createObjectURL(processedBlob);
      // You can use this URL directly in img tags or store it
      // The Supabase URL will still be used for storage
      const storedImageUrl = `https://touhyblbobrrtoebgkzb.supabase.co/storage/v1/object/public/store/${processedFileName}`;

      let recommendedAction = '';
      let detailedAnalysis = '';

      if (scanResult.prediction.class !== 'No pests detected' && scanResult.prediction.confidence >= 0.30) {
   /*      const deepSeek = useDeepSeek();
        recommendedAction = await deepSeek.getRecommendedAction(scanResult.prediction.class); */
        detailedAnalysis = PEST_ADVICE[scanResult.prediction.class as PestAdviceKey] || 'Please consult with an agricultural expert for detailed advice.';
      }

      // Insert scan data with processed image URL
      const { data: scanData, error: insertError } = await supabase
        .from('pest_scans')
        .insert([{ 
          image_path: storedImageUrl,
          name: scanResult.prediction.class,
          confidence: scanResult.prediction.confidence,
          alert_lvl: getAlertLevel(scanResult.prediction.confidence),
          comment: detailedAnalysis,
          recommended_action: recommendedAction,
        }])
        .select()
        .single();

      if (insertError || !scanData) {
        uploadError.value = insertError?.message || 'Failed to create scan record';
        isLoading.value = false;
        return;
      }

      await supabase.from('scan_history').insert([{ scan_id: scanData.id, user_id: userId }]);

      isLoading.value = false;
      return imageUrl;
    } catch (error) {
      uploadError.value = (error as Error).message;
      isLoading.value = false;
    }
  };

  return {
    uploadPestScan,
    uploadError,
    isLoading,
  };
}
