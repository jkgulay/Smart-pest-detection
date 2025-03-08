interface PredictionResponse {
  outputs: Array<{
    classification_predictions: Array<any>;
    detection_predictions: {
      predictions: Array<any>;
    };
    dynamic_crop: Array<any>;
    output_image: {
      type: string;
      value: string;
      video_metadata: any;
    };
    predictions: {
      predictions: Array<{
        class: string;
        confidence: number;
      }>;
    };
  }>;
  profiler_trace: Array<any>;
}

interface OutputImage {
  type: string;
  value: string;
}

interface ScanResult {
  prediction: {
    class: string;
    confidence: number;
  };
  output_image: OutputImage;
}

interface ProcessedImage {
  output_image: {
    type: string;
    value: string;
  };
  predictions: {
    image: any;
    predictions: Array<{
      class: string;
      confidence: number;
    }>;
  };
}

export type { PredictionResponse, OutputImage, ScanResult, ProcessedImage };
