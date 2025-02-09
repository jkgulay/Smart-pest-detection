import axios from "axios";
import { useScanResultStore } from "../stores/scanResultStore";

export const useImageUploader = async (imageFile: File) => {
  if (!(imageFile instanceof Blob)) {
    console.error("Provided parameter is not a File or Blob");
    return;
  }

  try {
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64Image = reader.result as string;

      const response = await axios({
        method: "POST",
        url: "https://detect.roboflow.com/common-rice-pests-philippines/11",
        params: {
          api_key: "EbsQu3NoU1RS9mT73hIR",
        },
        data: base64Image,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const predictions = response.data.predictions;
      console.log("Predictions:", predictions);

      const scanResultStore = useScanResultStore();
      if (predictions.length === 0) {
        scanResultStore.setScanResult([
          { class: "No pests detected", confidence: 0 },
        ]);
      } else {
        const formattedPredictions = predictions.map((prediction: any) => ({
          class: prediction.class,
          confidence: prediction.confidence,
        }));
        scanResultStore.setScanResult(formattedPredictions);
      }
    };

    reader.onerror = (error) => {
      console.error("File reading error:", error);
    };

    reader.readAsDataURL(imageFile);
  } catch (error) {
    console.error("API error:", (error as any).message);
  }
};
