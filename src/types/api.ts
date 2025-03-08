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
  video_metadata: {
    video_identifier: string;
    frame_number: number;
    frame_timestamp: string;
    fps: number;
    measured_fps: number | null;
    comes_from_video_file: boolean | null;
  };
}

interface ScanResult {
  prediction: {
    class: string;
    confidence: number;
  };
  output_image: OutputImage;
}

export type { PredictionResponse, OutputImage, ScanResult };
