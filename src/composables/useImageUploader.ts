import axios from 'axios';
import { useScanResultStore } from '../stores/scanResultStore';
import type { PredictionResponse, ScanResult } from '../types/api';

const ROBOFLOW_API_KEY = 'Zub42A5wGM8poDgcI18Q';

export const useImageUploader = async (imageFile: File): Promise<ScanResult | null> => {
  if (!(imageFile instanceof Blob)) {
    console.error("Provided parameter is not a File or Blob");
    return null;
  }

  try {
    return new Promise<ScanResult | null>((resolve) => {
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64Image = reader.result as string;

        const response = await axios<PredictionResponse>({
          method: 'POST',
          url: 'https://detect.roboflow.com/infer/workflows/test-cmoub/detect-and-classify',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            api_key: ROBOFLOW_API_KEY,
            inputs: {
              "image": {"type": "base64", "value": base64Image}
            }
          }
        });

        const output = response.data.outputs[0];
        const predictions = output.predictions.predictions;
        const scanResultStore = useScanResultStore();
        
        if (predictions.length === 0) {
          const result = { 
            prediction: { class: "No pests detected", confidence: 0 },
            output_image: output.output_image
          };
          scanResultStore.setScanResult([result.prediction]);
          scanResultStore.setSelectedImage(result.output_image);
          resolve(result);
        } else {
          const firstPrediction = predictions[0];
          let result = {
            prediction: firstPrediction.confidence < 0.70 
              ? { class: "No pests detected.", confidence: firstPrediction.confidence }
              : { class: firstPrediction.class, confidence: firstPrediction.confidence },
            output_image: output.output_image
          };
          scanResultStore.setScanResult([result.prediction]);
          scanResultStore.setSelectedImage(result.output_image);
          resolve(result);
        }
      };

      reader.onerror = (error) => {
        console.error("File reading error:", error);
        resolve(null);
      };

      reader.readAsDataURL(imageFile);
    });
  } catch (error) {
    console.error("API error:", (error as any).message);
    return null;
  }
};
