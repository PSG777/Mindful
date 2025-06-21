// Audio recording and processing utilities for Hume AI integration

export interface AudioRecorder {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string>;
  isRecording: boolean;
  mediaRecorder: MediaRecorder | null;
}

export class AudioRecorderClass implements AudioRecorder {
  public isRecording: boolean = false;
  public mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording(): Promise<void> {
    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.audioChunks = [];
      this.isRecording = true;

      // Collect audio data
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Start recording
      this.mediaRecorder.start(1000); // Collect data every second

    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Failed to start audio recording');
    }
  }

  async stopRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          // Stop all tracks
          if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
          }

          // Create audio blob
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          
          // Convert to base64
          const base64Audio = await this.blobToBase64(audioBlob);
          
          this.isRecording = false;
          this.mediaRecorder = null;
          this.stream = null;
          
          resolve(base64Audio);
        } catch (error) {
          reject(error);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

// Hume AI API communication
export interface HumeVoiceRequest {
  audio: string;
  model?: string;
  voice?: string;
  language?: string;
}

export interface HumeVoiceResponse {
  success: boolean;
  message?: string;
  audioUrl?: string;
  transcription?: string;
  error?: string;
}

export async function sendAudioToHume(request: HumeVoiceRequest): Promise<HumeVoiceResponse> {
  try {
    const response = await fetch('/api/hume-voice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending audio to Hume:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Audio playback utilities
export function playAudioFromUrl(audioUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(audioUrl);
    
    audio.onended = () => resolve();
    audio.onerror = (error) => reject(error);
    
    audio.play().catch(reject);
  });
}

export function playAudioFromBase64(base64Audio: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
    
    audio.onended = () => resolve();
    audio.onerror = (error) => reject(error);
    
    audio.play().catch(reject);
  });
}

// Audio format conversion utilities
export async function convertAudioFormat(audioBlob: Blob, targetFormat: string): Promise<Blob> {
  // This is a placeholder for audio format conversion
  // In a real implementation, you might use Web Audio API or a library like ffmpeg.js
  return audioBlob;
}

// Audio quality settings
export const AUDIO_SETTINGS = {
  sampleRate: 16000,
  channelCount: 1,
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
} as const;

// Voice options for Hume AI
export const HUME_VOICES = {
  alloy: 'alloy',
  echo: 'echo',
  fable: 'fable',
  onyx: 'onyx',
  nova: 'nova',
  shimmer: 'shimmer',
} as const;

export type HumeVoice = keyof typeof HUME_VOICES; 