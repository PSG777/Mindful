export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

// Types for Hume AI API
interface HumeVoiceRequest {
  audio: string; // Base64 encoded audio
  model?: string;
  voice?: string;
  language?: string;
}

interface HumeVoiceResponse {
  success: boolean;
  message?: string;
  audioUrl?: string;
  transcription?: string;
  error?: string;
  debug?: any; // For debugging purposes
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API Route: Starting request processing');
    
    // Verify API key is present
    const apiKey = process.env.HUME_SECRET_KEY;
    console.log('🔑 API Key check:', apiKey ? 'Present' : 'Missing');
    
    if (!apiKey) {
      console.error('❌ API Key missing from environment');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Hume API key not configured',
          debug: { hasApiKey: false }
        },
        { status: 500 }
      );
    }

    // Parse the request body
    let body: HumeVoiceRequest;
    try {
      body = await request.json();
      console.log('📦 Request body parsed successfully');
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request body',
          debug: { parseError: parseError instanceof Error ? parseError.message : 'Unknown' }
        },
        { status: 400 }
      );
    }

    const { audio, model = 'nova-2', voice = 'alloy', language = 'en' } = body;

    if (!audio) {
      console.error('❌ No audio data provided');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Audio data is required',
          debug: { hasAudio: false, audioLength: 0 }
        },
        { status: 400 }
      );
    }

    console.log('✅ Audio data received, length:', audio.length);
    console.log('🎯 Processing with model:', model, 'voice:', voice, 'language:', language);

    // Call Hume AI API for voice processing
    const humeResponse = await processVoiceWithHume(audio, apiKey, model, voice, language);

    console.log('✅ Hume processing completed:', humeResponse.success);
    return NextResponse.json(humeResponse);

  } catch (error) {
    console.error('💥 Unexpected error in API route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        debug: { 
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined
        }
      },
      { status: 500 }
    );
  }
}

async function processVoiceWithHume(
  audioData: string,
  apiKey: string,
  model: string,
  voice: string,
  language: string
): Promise<HumeVoiceResponse> {
  try {
    console.log('🚀 Starting Hume API call...');
    
    // First, send audio to Hume for transcription and analysis
    const transcriptionResponse = await fetch('https://api.hume.ai/v0/batch/jobs', {
      method: 'POST',
      headers: {
        'X-Hume-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'evi', // Empathic Voice Interface
        urls: [], // We'll use data instead of URLs
        data: [audioData], // Base64 audio data
        transcription: {
          model: 'whisper-large-v3',
          language: language,
        },
        models: {
          language: {},
          prosody: {},
          sentiment: {},
        },
      }),
    });

    console.log('📡 Hume API response status:', transcriptionResponse.status);

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      console.error('❌ Hume API error response:', errorText);
      throw new Error(`Hume transcription failed: ${transcriptionResponse.status} - ${errorText}`);
    }

    const transcriptionResult = await transcriptionResponse.json();
    console.log('📝 Transcription job created:', transcriptionResult.job_id);
    
    // Get the job ID and poll for results
    const jobId = transcriptionResult.job_id;
    const results = await pollForResults(jobId, apiKey);

    // Extract transcription and sentiment
    const transcription = extractTranscription(results);
    const sentiment = extractSentiment(results);
    
    console.log('🎯 Extracted transcription:', transcription.substring(0, 50) + '...');

    // Generate AI response based on transcription and sentiment
    const aiResponse = await generateAIResponse(transcription, sentiment, apiKey, voice);

    return {
      success: true,
      transcription,
      audioUrl: aiResponse.audioUrl,
      message: aiResponse.message,
    };

  } catch (error) {
    console.error('💥 Error processing voice with Hume:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: { 
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

async function pollForResults(jobId: string, apiKey: string) {
  console.log('⏳ Polling for results, job ID:', jobId);
  const maxAttempts = 30; // 30 seconds max
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await fetch(`https://api.hume.ai/v0/batch/jobs/${jobId}/predictions`, {
      headers: {
        'X-Hume-Api-Key': apiKey,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('📊 Poll attempt', attempts + 1, 'status:', data.status);
      
      if (data.status === 'completed') {
        console.log('✅ Job completed successfully');
        return data.results;
      }
    } else {
      console.error('❌ Poll request failed:', response.status, response.statusText);
    }

    // Wait 1 second before next attempt
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }

  throw new Error('Timeout waiting for Hume API results');
}

function extractTranscription(results: any): string {
  try {
    console.log('🔍 Extracting transcription from results...');
    
    // Navigate through the results structure to find transcription
    if (results && results[0] && results[0].predictions) {
      const transcriptionPrediction = results[0].predictions.find(
        (pred: any) => pred.model === 'whisper-large-v3'
      );
      const transcription = transcriptionPrediction?.transcription || '';
      console.log('📝 Found transcription:', transcription.substring(0, 50) + '...');
      return transcription;
    }
    console.log('⚠️ No transcription found in results');
    return '';
  } catch (error) {
    console.error('❌ Error extracting transcription:', error);
    return '';
  }
}

function extractSentiment(results: any): any {
  try {
    if (results && results[0] && results[0].predictions) {
      const sentimentPrediction = results[0].predictions.find(
        (pred: any) => pred.model === 'sentiment'
      );
      return sentimentPrediction || {};
    }
    return {};
  } catch (error) {
    console.error('❌ Error extracting sentiment:', error);
    return {};
  }
}

async function generateAIResponse(
  transcription: string,
  sentiment: any,
  apiKey: string,
  voice: string
): Promise<{ audioUrl: string; message: string }> {
  try {
    console.log('🤖 Generating AI response...');
    
    // Generate a contextual response based on transcription and sentiment
    const responseText = generateContextualResponse(transcription, sentiment);

    // Use Hume's text-to-speech API to generate audio response
    const ttsResponse = await fetch('https://api.hume.ai/v0/evi/chat/completions', {
      method: 'POST',
      headers: {
        'X-Hume-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'evi',
        messages: [
          {
            role: 'user',
            content: transcription,
          },
        ],
        voice: voice,
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    console.log('🎵 TTS API response status:', ttsResponse.status);

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error('❌ TTS API error:', errorText);
      throw new Error(`TTS API failed: ${ttsResponse.status} - ${errorText}`);
    }

    const ttsResult = await ttsResponse.json();
    
    // Extract audio URL from response
    const audioUrl = ttsResult.choices?.[0]?.message?.content || '';

    console.log('✅ AI response generated successfully');
    return {
      audioUrl,
      message: responseText,
    };

  } catch (error) {
    console.error('❌ Error generating AI response:', error);
    return {
      audioUrl: '',
      message: 'I understand. How can I help you further?',
    };
  }
}

function generateContextualResponse(transcription: string, sentiment: any): string {
  // Simple contextual response generation
  const lowerTranscription = transcription.toLowerCase();
  
  if (lowerTranscription.includes('anxiety') || lowerTranscription.includes('worried')) {
    return "I hear that you're feeling anxious. Let's take a moment to breathe together. What specific thoughts are contributing to this feeling?";
  }
  
  if (lowerTranscription.includes('sad') || lowerTranscription.includes('depressed')) {
    return "I sense that you're going through a difficult time. It's okay to feel this way. Would you like to talk about what's been on your mind?";
  }
  
  if (lowerTranscription.includes('stress') || lowerTranscription.includes('overwhelmed')) {
    return "Stress can be really challenging. Let's break this down together. What's the most pressing concern right now?";
  }
  
  if (lowerTranscription.includes('help') || lowerTranscription.includes('support')) {
    return "I'm here to support you. What would be most helpful for you right now?";
  }
  
  // Default empathetic response
  return "Thank you for sharing that with me. I'm listening and here to support you. Would you like to explore this further?";
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Hume Voice API is running',
    status: 'healthy',
    hasApiKey: !!process.env.HUME_SECRET_KEY,
    hasPublicKey: !!process.env.NEXT_PUBLIC_HUME_API_KEY,
  });
} 